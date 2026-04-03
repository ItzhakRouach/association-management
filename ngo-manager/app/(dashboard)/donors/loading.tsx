import { DashboardShell } from '@/components/layout/DashboardShell'
import { SkeletonTable } from '@/components/shared/Skeleton'

export default function DonorsLoading() {
  return (
    <DashboardShell title="תורמים" description="ניהול תורמי העמותה">
      <SkeletonTable rows={8} />
    </DashboardShell>
  )
}
