import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { anthropic } from '@/lib/anthropic'
import { calculateImpactScore, getTrend } from '@/lib/services/impact.service'
import type { ImpactScoreData, Trend } from '@/lib/types'

export async function POST(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const now = new Date()
    const month = now.getMonth() + 1
    const year = now.getFullYear()

    const startOfMonth = new Date(year, month - 1, 1)
    const endOfMonth = new Date(year, month, 1)
    const startOfPrevMonth = new Date(year, month - 2, 1)
    const endOfPrevMonth = new Date(year, month - 1, 1)

    const volunteers = await prisma.volunteer.findMany({
      where: { isActive: true },
      include: {
        assignments: {
          include: { operation: true },
        },
        impactScore: true,
      },
    })

    const results: ImpactScoreData[] = []
    const letters: { volunteerId: string; volunteerName: string; letter: string }[] = []

    for (const volunteer of volunteers) {
      const currentAssignments = volunteer.assignments.filter(
        a =>
          a.status === 'CONFIRMED' &&
          a.operation.date >= startOfMonth &&
          a.operation.date < endOfMonth
      )

      const prevAssignments = volunteer.assignments.filter(
        a =>
          a.status === 'CONFIRMED' &&
          a.operation.date >= startOfPrevMonth &&
          a.operation.date < endOfPrevMonth
      )

      const monthlyOps = currentAssignments.length
      const prevMonthOps = prevAssignments.length
      const operationTypes = currentAssignments.map(a => a.operation.type)

      // Simple consecutive months: count months with at least one confirmed assignment
      const monthsWithActivity = new Set(
        volunteer.assignments
          .filter(a => a.status === 'CONFIRMED')
          .map(a => `${a.operation.date.getFullYear()}-${a.operation.date.getMonth()}`)
      ).size

      const score = calculateImpactScore({
        monthlyOps,
        consecutiveMonths: monthsWithActivity,
        operationTypes,
        prevMonthOps,
      })

      const trend: Trend = getTrend(monthlyOps, prevMonthOps)

      await prisma.impactScore.upsert({
        where: { volunteerId: volunteer.id },
        update: { score, month, year, operationCount: monthlyOps, consistencyScore: monthsWithActivity, activityTypes: operationTypes, trend },
        create: { volunteerId: volunteer.id, score, month, year, operationCount: monthlyOps, consistencyScore: monthsWithActivity, activityTypes: operationTypes, trend },
      })

      results.push({
        volunteerId: volunteer.id,
        volunteerName: volunteer.name,
        score,
        trend,
        operationCount: monthlyOps,
      })
    }

    // Sort and get top 3
    const topThree = [...results].sort((a, b) => b.score - a.score).slice(0, 3)

    // Generate appreciation letters for top 3
    for (const topVolunteer of topThree) {
      const ops = volunteers
        .find(v => v.id === topVolunteer.volunteerId)
        ?.assignments.filter(
          a =>
            a.status === 'CONFIRMED' &&
            a.operation.date >= startOfMonth &&
            a.operation.date < endOfMonth
        )
        .map(a => a.operation.title) ?? []

      const prompt = `אתה כותב מכתבי הוקרה למתנדבים מצטיינים.

מתנדב: ${topVolunteer.volunteerName}
ציון: ${topVolunteer.score}/100 (מגמה: ${topVolunteer.trend})
מבצעים החודש: ${ops.join(', ')}

כתוב מכתב הוקרה אישי. לא גנרי — התייחס לפעילות הספציפית.
120-150 מילים. התחל ב"שלום ${topVolunteer.volunteerName},"`

      const message = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        messages: [{ role: 'user', content: prompt }],
      })

      const content = message.content[0].type === 'text' ? message.content[0].text : ''

      await prisma.appreciationLetter.create({
        data: {
          volunteerId: topVolunteer.volunteerId,
          content,
          status: 'PENDING',
          month,
          year,
        },
      })

      letters.push({
        volunteerId: topVolunteer.volunteerId,
        volunteerName: topVolunteer.volunteerName,
        letter: content,
      })

      // Add letter to result
      const resultEntry = results.find(r => r.volunteerId === topVolunteer.volunteerId)
      if (resultEntry) {
        resultEntry.appreciationLetter = content
      }
    }

    return NextResponse.json({ topVolunteers: topThree, letters })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'שגיאה לא ידועה'
    console.error('[AI impact-scores]', error)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
