import { DashboardShell } from '@/components/layout/DashboardShell'
import { SkeletonTable } from '@/components/shared/Skeleton'

export default function ImpactLoading() {
  return (
    <DashboardShell title="ציוני השפעה" description="דירוג מתנדבים לפי השפעה ומסירות">
      <SkeletonTable rows={5} />
    </DashboardShell>
  )
}
