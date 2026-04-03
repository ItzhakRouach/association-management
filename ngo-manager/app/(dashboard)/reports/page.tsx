import { prisma } from '@/lib/prisma'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { ReportsList } from '@/components/reports/ReportsList'

async function getReports() {
  return prisma.monthlyReport.findMany({
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
    take: 24,
  })
}

export default async function ReportsPage() {
  const reports = await getReports()

  return (
    <DashboardShell
      title="דוחות"
      description="דוחות חודשיים למועצת העמותה"
    >
      <ReportsList reports={reports} />
    </DashboardShell>
  )
}
