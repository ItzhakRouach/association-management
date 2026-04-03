import { DashboardShell } from '@/components/layout/DashboardShell'
import { SkeletonTable } from '@/components/shared/Skeleton'

export default function ReportsLoading() {
  return (
    <DashboardShell title="דוחות" description="דוחות חודשיים למועצת העמותה">
      <SkeletonTable rows={4} />
    </DashboardShell>
  )
}
