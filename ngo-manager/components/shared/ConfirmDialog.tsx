'use client'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'אישור',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Dark overlay */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.6)' }}
        onClick={onCancel}
      >
        {/* Dialog card */}
        <div
          className="w-full max-w-sm rounded-[var(--radius-lg)] p-6 space-y-4"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-card)',
          }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="dialog-title"
        >
          <div>
            <h2
              id="dialog-title"
              className="text-base font-semibold mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {title}
            </h2>
            <p
              className="text-sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {message}
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            {/* Confirm */}
            <button
              onClick={onConfirm}
              className="flex-1 py-2 rounded-[var(--radius-md)] text-sm font-medium transition-colors duration-150"
              style={{
                background: 'var(--color-danger)',
                color: '#fff',
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.opacity = '0.85'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.opacity = '1'
              }}
            >
              {confirmLabel}
            </button>

            {/* Cancel */}
            <button
              onClick={onCancel}
              className="flex-1 py-2 rounded-[var(--radius-md)] text-sm font-medium transition-colors duration-150"
              style={{
                background: 'var(--color-surface-2)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-secondary)',
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.color =
                  'var(--color-text-primary)'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.color =
                  'var(--color-text-secondary)'
              }}
            >
              ביטול
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
