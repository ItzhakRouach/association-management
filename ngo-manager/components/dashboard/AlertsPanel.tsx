'use client'

import { useState } from 'react'
import Link from 'next/link'
import { OutreachModal } from '@/components/donors/OutreachModal'
import type { AlertItem } from '@/lib/types'

const severityStyles: Record<AlertItem['severity'], string> = {
  urgent: 'border-[var(--color-danger)] bg-[var(--color-danger)]/5',
  warning: 'border-[var(--color-warning)] bg-[var(--color-warning)]/5',
  info: 'border-[var(--color-accent)] bg-[var(--color-accent)]/5',
}

const severityDot: Record<AlertItem['severity'], string> = {
  urgent: 'bg-[var(--color-danger)]',
  warning: 'bg-[var(--color-warning)]',
  info: 'bg-[var(--color-accent)]',
}

interface AlertsPanelProps {
  alerts: AlertItem[]
}

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  const [openDonor, setOpenDonor] = useState<{ id: string; name: string; phone?: string | null; whatsapp?: string | null } | null>(null)

  if (alerts.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)] p-6 shadow-[var(--shadow-card)]">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
          התראות
        </h2>
        <p className="text-[var(--color-text-muted)] text-sm text-center py-4">
          אין התראות פעילות
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)] p-6 shadow-[var(--shadow-card)]">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
          התראות
          <span className="ms-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full bg-[var(--color-danger)] text-white">
            {alerts.length}
          </span>
        </h2>
        <ul className="space-y-3">
          {alerts.map(alert => (
            <li
              key={alert.id}
              className={`border-s-4 ${severityStyles[alert.severity]} rounded-e-[var(--radius-md)] p-4 flex items-center justify-between gap-4`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={`flex-shrink-0 w-2 h-2 rounded-full ${severityDot[alert.severity]}`} />
                <span className="text-sm text-[var(--color-text-primary)] truncate">
                  {alert.message}
                </span>
              </div>

              {alert.type === 'cooling_donor' && alert.donorId ? (
                <button
                  onClick={() => setOpenDonor({ id: alert.donorId!, name: alert.donorName ?? '', phone: alert.donorPhone, whatsapp: alert.donorWhatsapp })}
                  className="flex-shrink-0 text-xs font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors duration-150"
                >
                  {alert.actionLabel} ←
                </button>
              ) : (
                <Link
                  href={alert.actionHref}
                  className="flex-shrink-0 text-xs font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors duration-150"
                >
                  {alert.actionLabel} ←
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>

      {openDonor && (
        <OutreachModal
          donorId={openDonor.id}
          donorName={openDonor.name}
          donorPhone={openDonor.phone}
          donorWhatsapp={openDonor.whatsapp}
          onClose={() => setOpenDonor(null)}
        />
      )}
    </>
  )
}
