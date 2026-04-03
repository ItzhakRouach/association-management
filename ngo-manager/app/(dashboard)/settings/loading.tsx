import { DashboardShell } from '@/components/layout/DashboardShell'
import { Skeleton } from '@/components/shared/Skeleton'

export default function SettingsLoading() {
  return (
    <DashboardShell title="הגדרות" description="הגדרות מערכת העמותה">
      <div className="max-w-lg space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
        <Skeleton className="h-10 w-32" />
      </div>
    </DashboardShell>
  )
}
