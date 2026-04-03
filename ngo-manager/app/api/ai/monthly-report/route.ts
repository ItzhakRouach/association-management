import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { anthropic } from '@/lib/anthropic'
import { generateReportPDF } from '@/lib/pdf'
import { sendEmail } from '@/lib/resend'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body: unknown = await request.json()
    if (
      typeof body !== 'object' ||
      body === null ||
      !('month' in body) ||
      !('year' in body) ||
      typeof (body as Record<string, unknown>).month !== 'number' ||
      typeof (body as Record<string, unknown>).year !== 'number'
    ) {
      return NextResponse.json({ error: 'month and year are required numbers' }, { status: 400 })
    }

    const { month, year } = body as { month: number; year: number }

    if (month < 1 || month > 12) {
      return NextResponse.json({ error: 'month must be between 1 and 12' }, { status: 400 })
    }

    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 1)

    const operations = await prisma.operation.findMany({
      where: { date: { gte: startDate, lt: endDate } },
      include: { assignments: true },
    })

    const donations = await prisma.donation.findMany({
      where: { date: { gte: startDate, lt: endDate } },
    })

    const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0)
    const donorIds = new Set(donations.map(d => d.donorId))
    const donorCount = donorIds.size

    const prompt = `אתה כותב דוחות מקצועיים לעמותות בעברית.

דוח לחודש ${month}/${year}:
מבצעים: ${operations.length} התקיימו
${operations.map(op => `- ${op.title}: ${op.assignments.length} מתנדבים`).join('\n')}
תרומות: ${totalDonations}₪ מ-${donorCount} תורמים

כתוב דוח למועצה. מבנה: פתיחה → הישגים → נתונים → תודות → סיום
טון רשמי אך חם. 400-500 מילים.`

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    })

    const narrative = message.content[0].type === 'text' ? message.content[0].text : ''

    const uniqueVolunteers = new Set(
      operations.flatMap(op => op.assignments.map(a => a.volunteerId))
    )

    const settings = await prisma.settings.findUnique({ where: { id: 'singleton' } })
    const orgName = settings?.orgName ?? 'העמותה'

    const pdfBuffer = await generateReportPDF({
      month,
      year,
      orgName,
      narrative,
      operationCount: operations.length,
      volunteerCount: uniqueVolunteers.size,
      totalDonations,
      donorCount,
      operations: operations.map(op => ({
        title: op.title,
        volunteerCount: op.assignments.length,
      })),
    })

    const report = await prisma.monthlyReport.create({
      data: {
        month,
        year,
        content: {
          narrative,
          operationCount: operations.length,
          totalDonations,
          donorCount,
        },
      },
    })

    // Try to send email — non-blocking
    try {
      if (settings?.councilEmail) {
        const toEmail = process.env.ADMIN_EMAIL ?? settings.councilEmail
        await sendEmail({
          to: toEmail,
          subject: `[דמו] דוח חודשי — ${month}/${year}`,
          html: `<p>[דמו — בפועל ישלח אל: ${settings.councilEmail}]</p><p>שלום,</p><p>מצורף דוח החודשי לחודש ${month}/${year}.</p><p>${orgName}</p>`,
          attachment: {
            filename: `report-${year}-${month}.pdf`,
            content: pdfBuffer,
          },
        })
        await prisma.monthlyReport.update({
          where: { id: report.id },
          data: { sentAt: new Date() },
        })
      }
    } catch (emailErr) {
      console.warn('[monthly-report] email skipped:', emailErr)
    }

    return NextResponse.json({ reportId: report.id, narrative })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'שגיאה לא ידועה'
    console.error('[AI monthly-report]', error)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
