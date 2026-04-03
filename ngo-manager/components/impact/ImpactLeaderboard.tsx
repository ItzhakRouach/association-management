import type { ImpactScoreData, Trend } from '@/lib/types'

const trendLabel: Record<Trend, string> = {
  RISING: '↑ עולה',
  STABLE: '→ יציב',
  DECLINING: '↓ יורד',
}

const trendColor: Record<Trend, string> = {
  RISING: 'text-[var(--color-success)]',
  STABLE: 'text-[var(--color-text-secondary)]',
  DECLINING: 'text-[var(--color-danger)]',
}

interface ImpactLeaderboardProps {
  volunteers: ImpactScoreData[]
}

export function ImpactLeaderboard({ volunteers }: ImpactLeaderboardProps) {
  if (volunteers.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)] p-6 shadow-[var(--shadow-card)]">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
          לוח כבוד מתנדבים
        </h2>
        <p className="text-[var(--color-text-muted)] text-sm text-center py-4">
          אין נתוני ציונים עדיין
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)] p-6 shadow-[var(--shadow-card)]">
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-5">
        לוח כבוד מתנדבים
      </h2>
      <ol className="space-y-3">
        {volunteers.map((v, index) => (
          <li
            key={v.volunteerId}
            className="flex items-center gap-4 p-4 rounded-[var(--radius-md)] bg-[var(--color-surface-2)] border border-[var(--color-border)]"
          >
            <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-bg)] text-sm font-bold text-[var(--color-accent)]">
              {index + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                {v.volunteerName}
              </p>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                {v.operationCount} מבצעים
              </p>
            </div>
            <div className="flex-shrink-0 text-end">
              <p className="text-xl font-bold text-[var(--color-accent)]">
                {Math.round(v.score)}
              </p>
              <p className={`text-xs font-medium ${trendColor[v.trend]}`}>
                {trendLabel[v.trend]}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
