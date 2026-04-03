'use client'

import { useState } from 'react'

interface OutreachDraftCardProps {
  donorId: string
  donorName: string
}

export function OutreachDraftCard({ donorId, donorName }: OutreachDraftCardProps) {
  const [loading, setLoading] = useState(false)
  const [draft, setDraft] = useState<string | null>(null)
  const [outreachId, setOutreachId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function handleGenerate() {
    setLoading(true)
    setError(null)
    setDraft(null)

    try {
      const res = await fetch('/api/ai/donor-outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donorId }),
      })

      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'שגיאה לא ידועה')
      }

      const data = await res.json() as { outreachId: string; draft: string }
      setDraft(data.draft)
      setOutreachId(data.outreachId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה לא ידועה')
    } finally {
      setLoading(false)
    }

    void outreachId // suppress unused warning — stored for future send action
  }

  async function handleCopy() {
    if (!draft) return
    await navigator.clipboard.writeText(draft)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)] p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
          טיוטת פנייה — {donorName}
        </h3>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[#0f1923] rounded-[var(--radius-md)] transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'מייצר...' : draft ? 'ייצר מחדש' : 'ייצר טיוטה'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
          <div className="w-4 h-4 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">מנסח פנייה...</span>
        </div>
      )}

      {error && (
        <p className="text-sm text-[var(--color-danger)] bg-[var(--color-danger)]/5 rounded-[var(--radius-md)] p-3">
          {error}
        </p>
      )}

      {draft && (
        <div className="animate-in fade-in duration-300 space-y-3">
          <div className="border border-[var(--color-accent)]/30 bg-gradient-to-l from-[var(--color-accent)]/5 to-transparent rounded-[var(--radius-md)] p-4">
            <p className="text-sm text-[var(--color-text-primary)] whitespace-pre-wrap leading-relaxed">
              {draft}
            </p>
          </div>
          <button
            onClick={handleCopy}
            className="text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors duration-150"
          >
            {copied ? '✓ הועתק' : 'העתק טיוטה'}
          </button>
        </div>
      )}
    </div>
  )
}
