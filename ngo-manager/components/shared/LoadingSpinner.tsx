interface LoadingSpinnerProps {
  text?: string
}

export function LoadingSpinner({ text }: LoadingSpinnerProps) {
  return (
    <div
      className="flex items-center gap-2"
      style={{ color: 'var(--color-text-secondary)' }}
    >
      <div
        className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin flex-shrink-0"
        style={{
          borderColor: 'var(--color-accent)',
          borderTopColor: 'transparent',
        }}
      />
      {text && <span className="text-sm">{text}</span>}
    </div>
  )
}
