import { prisma } from '@/lib/prisma'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { AlertsPanel } from '@/components/dashboard/AlertsPanel'
import { findCoolingDonors } from '@/lib/services/donor.service'
import { getUnassignedOperations } from '@/lib/services/operation.service'
import type { AlertItem, DashboardStats } from '@/lib/types'
import Link from 'next/link'

async function getDashboardData(): Promise<{
  stats: DashboardStats
  alerts: AlertItem[]
  recentOps: { id: string; title: string; date: Date; status: string; volunteerCount: number }[]
  recentDonations: { id: string; amount: number; date: Date; donorName: string }[]
}> {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    activeVolunteers,
    monthlyOps,
    monthlyDonations,
    totalDonors,
    coolingDonors,
    unassignedOps,
    pendingReport,
    recentOps,
    recentDonations,
  ] = await Promise.all([
    prisma.volunteer.count({ where: { isActive: true } }),
    prisma.operation.count({ where: { date: { gte: startOfMonth } } }),
    prisma.donation.aggregate({
      where: { date: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    prisma.donor.count(),
    findCoolingDonors(),
    getUnassignedOperations(),
    prisma.monthlyReport.findFirst({
      where: {
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        sentAt: null,
      },
    }),
    prisma.operation.findMany({
      orderBy: { date: 'desc' },
      take: 5,
      include: { assignments: { where: { status: 'CONFIRMED' } } },
    }),
    prisma.donation.findMany({
      orderBy: { date: 'desc' },
      take: 5,
      include: { donor: { select: { name: true } } },
    }),
  ])

  const alerts: AlertItem[] = []

  coolingDonors.slice(0, 3).forEach(donor => {
    alerts.push({
      id: `cooling-${donor.id}`,
      type: 'cooling_donor',
      message: `${donor.name} לא ${donor.gender === 'FEMALE' ? 'תרמה' : 'תרם'} כבר ${donor.daysSinceLastDonation} ימים`,
      actionLabel: 'שלח פנייה',
      actionHref: `/donors`,
      severity: 'warning',
      donorId: donor.id,
      donorName: donor.name,
      donorPhone: donor.phone,
      donorWhatsapp: donor.whatsapp,
    })
  })

  unassignedOps.slice(0, 2).forEach(op => {
    alerts.push({
      id: `unassigned-${op.id}`,
      type: 'unassigned_operation',
      message: `מבצע "${op.title}" ממתין לשיבוץ מתנדבים`,
      actionLabel: 'שבץ עכשיו',
      actionHref: `/operations`,
      severity: 'urgent',
    })
  })

  if (pendingReport) {
    alerts.push({
      id: `report-${pendingReport.id}`,
      type: 'report_pending',
      message: 'דוח חודשי מוכן אך טרם נשלח למועצה',
      actionLabel: 'שלח דוח',
      actionHref: '/reports',
      severity: 'info',
    })
  }

  return {
    stats: {
      activeVolunteers,
      monthlyOperations: monthlyOps,
      monthlyDonations: monthlyDonations._sum.amount ?? 0,
      totalDonors,
    },
    alerts,
    recentOps: recentOps.map(op => ({
      id: op.id,
      title: op.title,
      date: op.date,
      status: op.status,
      volunteerCount: op.assignments.length,
    })),
    recentDonations: recentDonations.map(d => ({
      id: d.id,
      amount: d.amount,
      date: d.date,
      donorName: d.donor.name,
    })),
  }
}

const STATUS_LABEL: Record<string, string> = {
  PLANNED: 'מתוכנן',
  ACTIVE: 'פעיל',
  COMPLETED: 'הושלם',
  CANCELLED: 'בוטל',
}

const STATUS_COLOR: Record<string, string> = {
  PLANNED: 'text-[var(--color-text-secondary)]',
  ACTIVE: 'text-[var(--color-success)]',
  COMPLETED: 'text-[var(--color-accent)]',
  CANCELLED: 'text-[var(--color-danger)]',
}

export default async function DashboardPage() {
  const { stats, alerts, recentOps, recentDonations } = await getDashboardData()

  const kpiCards = [
    { label: 'מתנדבים פעילים', value: stats.activeVolunteers, href: '/volunteers' },
    { label: 'מבצעים החודש', value: stats.monthlyOperations, href: '/operations' },
    { label: 'תרומות החודש', value: `${stats.monthlyDonations.toLocaleString('he-IL')}₪`, href: '/donors' },
    { label: 'סה"כ תורמים', value: stats.totalDonors, href: '/donors' },
  ]

  return (
    <DashboardShell title="דשבורד" description="סקירה כללית של פעילות העמותה">
      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map(card => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)] p-6 shadow-[var(--shadow-card)] hover:border-[var(--color-accent)] transition-colors duration-200 block"
          >
            <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">
              {card.label}
            </p>
            <p className="text-4xl font-bold text-[var(--color-accent)]">{card.value}</p>
          </Link>
        ))}
      </div>

      {/* Alerts */}
      <AlertsPanel alerts={alerts} />

      {/* Recent activity row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Operations */}
        <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)] p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[var(--color-text-primary)]">מבצעים אחרונים</h2>
            <Link href="/operations" className="text-xs text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors duration-150">
              הכל ←
            </Link>
          </div>
          {recentOps.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)] text-center py-6">אין מבצעים עדיין</p>
          ) : (
            <ul className="space-y-3">
              {recentOps.map(op => (
                <li key={op.id} className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{op.title}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {new Date(op.date).toLocaleDateString('he-IL')} · {op.volunteerCount} מתנדבים
                    </p>
                  </div>
                  <span className={`text-xs font-medium flex-shrink-0 ms-3 ${STATUS_COLOR[op.status] ?? 'text-[var(--color-text-secondary)]'}`}>
                    {STATUS_LABEL[op.status] ?? op.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent Donations */}
        <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)] p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[var(--color-text-primary)]">תרומות אחרונות</h2>
            <Link href="/donors" className="text-xs text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors duration-150">
              הכל ←
            </Link>
          </div>
          {recentDonations.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)] text-center py-6">אין תרומות עדיין</p>
          ) : (
            <ul className="space-y-3">
              {recentDonations.map(d => (
                <li key={d.id} className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{d.donorName}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {new Date(d.date).toLocaleDateString('he-IL')}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-[var(--color-accent)] flex-shrink-0 ms-3">
                    {d.amount.toLocaleString('he-IL')}₪
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </DashboardShell>
  )
}
