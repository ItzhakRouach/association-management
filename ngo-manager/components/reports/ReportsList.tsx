'use client'

import { useState } from 'react'
import type { MonthlyReport } from '@prisma/client'

const MONTH_NAMES_HE = [
  '', 'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
]

interface ReportsListProps {
  reports: MonthlyReport[]
}

export function ReportsList({ reports }: ReportsListProps) {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  async function handleGenerate() {
    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const res = await fetch('/api/ai/monthly-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month, year }),
      })

      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'שגיאה לא ידועה')
      }

      const data = await res.json() as { narrative?: string }
      setPreview(data.narrative ?? '')
      setSuccessMessage(`הדוח ל-${MONTH_NAMES_HE[month]} ${year} נוצר ונשלח בהצלחה ✓`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה לא ידועה')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Generate form */}
      <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)] p-6 shadow-[var(--shadow-card)]">
        <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-4">
          שלח דוח חודשי
        </h2>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs text-[var(--color-text-secondary)] mb-1">חודש</label>
            <select
              value={month}
              onChange={e => setMonth(Number(e.target.value))}
              disabled={loading}
              className="bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-[var(--radius-md)] px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-accent)]"
            >
              {MONTH_NAMES_HE.slice(1).map((name, i) => (
                <option key={i + 1} value={i + 1}>{name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-[var(--color-text-secondary)] mb-1">שנה</label>
            <input
              type="number"
              value={year}
              onChange={e => setYear(Number(e.target.value))}
              disabled={loading}
              min={2020}
              max={2030}
              className="bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-[var(--radius-md)] px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-accent)] w-24"
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-5 py-2 text-sm font-medium rounded-[var(--radius-md)] transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'var(--color-accent)', color: '#ffffff', border: '2px solid var(--color-accent)' }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-[#0f1923] border-t-transparent rounded-full animate-spin inline-block" />
                מייצר דוח...
              </span>
            ) : (
              'שלח דוח חודשי'
            )}
          </button>
        </div>

        {loading && (
          <p className="text-xs text-[var(--color-text-muted)] mt-2">
            יצירת הדוח עשויה לקחת 10–15 שניות...
          </p>
        )}

        {successMessage && (
          <p className="mt-3 text-sm text-[var(--color-success)] bg-[var(--color-success)]/5 rounded-[var(--radius-md)] p-3">
            {successMessage}
          </p>
        )}

        {preview && (
          <div className="mt-4">
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>תוכן הדוח שנשלח:</p>
            <pre
              className="text-sm leading-relaxed whitespace-pre-wrap rounded-[var(--radius-md)] p-4 max-h-64 overflow-y-auto"
              style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-body)' }}
            >
              {preview}
            </pre>
          </div>
        )}

        {error && (
          <p className="mt-3 text-sm text-[var(--color-danger)] bg-[var(--color-danger)]/5 rounded-[var(--radius-md)] p-3">
            {error}
          </p>
        )}
      </div>

      {/* Past reports */}
      <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)] p-6 shadow-[var(--shadow-card)]">
        <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-4">
          דוחות קודמים
        </h2>
        {reports.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)] text-center py-4">
            אין דוחות עדיין
          </p>
        ) : (
          <ul className="space-y-2">
            {reports.map(report => (
              <li
                key={report.id}
                className="flex items-center justify-between p-4 rounded-[var(--radius-md)] bg-[var(--color-surface-2)] border border-[var(--color-border)]"
              >
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    {MONTH_NAMES_HE[report.month]} {report.year}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                    נוצר: {new Date(report.createdAt).toLocaleDateString('he-IL')}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    report.sentAt
                      ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]'
                      : 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]'
                  }`}
                >
                  {report.sentAt
                    ? `נשלח ${new Date(report.sentAt).toLocaleDateString('he-IL')} ✓`
                    : 'לא נשלח'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
