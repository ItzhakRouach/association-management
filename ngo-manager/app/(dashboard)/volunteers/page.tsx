import { prisma } from '@/lib/prisma'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { VolunteersTable } from '@/components/volunteers/VolunteersTable'
import Link from 'next/link'

async function getVolunteers() {
  return prisma.volunteer.findMany({
    include: {
      assignments: { where: { status: 'CONFIRMED' } },
      impactScore: true,
    },
    orderBy: { name: 'asc' },
  })
}

export default async function VolunteersPage() {
  const volunteers = await getVolunteers()

  return (
    <DashboardShell title="מתנדבים" description="ניהול מתנדבי העמותה">
      <VolunteersTable volunteers={volunteers} />

      {volunteers.length > 0 && (
        <div className="flex justify-end mt-4">
          <Link
            href="/volunteers/impact"
            className="flex items-center gap-2 px-5 py-2.5 text-base font-semibold rounded-[var(--radius-md)] transition-colors duration-150"
            style={{ background: 'var(--color-accent)', color: '#ffffff' }}
          >
            🏆 לוח כבוד ציוני השפעה
          </Link>
        </div>
      )}
    </DashboardShell>
  )
}
