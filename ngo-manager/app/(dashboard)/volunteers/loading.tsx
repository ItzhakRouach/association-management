import { DashboardShell } from '@/components/layout/DashboardShell'
import { SkeletonTable } from '@/components/shared/Skeleton'

export default function VolunteersLoading() {
  return (
    <DashboardShell title="מתנדבים" description="ניהול מתנדבי העמותה">
      <SkeletonTable rows={8} />
    </DashboardShell>
  )
}
