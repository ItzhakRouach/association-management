interface DashboardShellProps {
  children: React.ReactNode
  title: string
  description?: string
}

export function DashboardShell({ children, title, description }: DashboardShellProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-2xl font-bold"
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--color-text-primary)',
          }}
        >
          {title}
        </h1>
        {description && (
          <p
            className="text-sm mt-1"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  )
}
