import { type LucideIcon } from 'lucide-react'
import Link from 'next/link'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: { label: string; href: string }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div
        className="w-12 h-12 rounded-[var(--radius-lg)] flex items-center justify-center mb-4"
        style={{ background: 'var(--color-surface-2)' }}
      >
        <Icon
          className="w-6 h-6"
          style={{ color: 'var(--color-text-muted)' }}
        />
      </div>
      <h3
        className="text-base font-semibold mb-1"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {title}
      </h3>
      {description && (
        <p
          className="text-sm max-w-xs"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {description}
        </p>
      )}
      {action && (
        <Link
          href={action.href}
          className="mt-4 px-4 py-2 text-sm font-medium rounded-[var(--radius-md)] transition-colors duration-150 inline-block"
          style={{
            background: 'var(--color-accent)',
            color: 'var(--color-bg)',
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLAnchorElement).style.background =
              'var(--color-accent-hover)'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLAnchorElement).style.background = 'var(--color-accent)'
          }}
        >
          {action.label}
        </Link>
      )}
    </div>
  )
}
