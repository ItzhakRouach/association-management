import { DashboardShell } from '@/components/layout/DashboardShell'
import { SkeletonTable } from '@/components/shared/Skeleton'

export default function OperationsLoading() {
  return (
    <DashboardShell title="מבצעים" description="ניהול מבצעי העמותה">
      <SkeletonTable rows={8} />
    </DashboardShell>
  )
}
