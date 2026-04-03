import { prisma } from '@/lib/prisma'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { ImpactLeaderboard } from '@/components/impact/ImpactLeaderboard'
import { AppreciationLetterCard } from '@/components/impact/AppreciationLetterCard'
import { ImpactTriggerButton } from '@/components/impact/ImpactTriggerButton'
import type { ImpactScoreData } from '@/lib/types'
import type { Trend } from '@prisma/client'

async function getImpactData(): Promise<ImpactScoreData[]> {
  const scores = await prisma.impactScore.findMany({
    orderBy: { score: 'desc' },
    include: {
      volunteer: true,
    },
  })

  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  const volunteerIds = scores.map(s => s.volunteerId)

  const letters = await prisma.appreciationLetter.findMany({
    where: {
      volunteerId: { in: volunteerIds },
      month,
      year,
      status: 'PENDING',
    },
  })

  const letterByVolunteer = new Map(letters.map(l => [l.volunteerId, { id: l.id, content: l.content }]))

  return scores.map(s => ({
    volunteerId: s.volunteerId,
    volunteerName: s.volunteer.name,
    score: s.score,
    trend: s.trend as Trend,
    operationCount: s.operationCount,
    appreciationLetter: letterByVolunteer.get(s.volunteerId)?.content,
    appreciationLetterId: letterByVolunteer.get(s.volunteerId)?.id,
  }))
}

export default async function VolunteerImpactPage() {
  const volunteers = await getImpactData()
  const withLetters = volunteers.filter(v => v.appreciationLetter)

  return (
    <DashboardShell
      title="ציוני השפעה"
      description="דירוג מתנדבים לפי השפעה ומסירות"
    >
      <div className="flex justify-end mb-2">
        <ImpactTriggerButton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ImpactLeaderboard volunteers={volunteers} />
        <div className="space-y-4">
          {withLetters.length === 0 ? (
            <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)] p-6 shadow-[var(--shadow-card)]">
              <p className="text-sm text-[var(--color-text-muted)] text-center py-4">
                אין מכתבי הוקרה לחודש זה
              </p>
            </div>
          ) : (
            withLetters.map(v => (
              <AppreciationLetterCard key={v.volunteerId} volunteer={v} />
            ))
          )}
        </div>
      </div>
    </DashboardShell>
  )
}
