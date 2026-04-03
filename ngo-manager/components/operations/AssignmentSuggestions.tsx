'use client'

import { useState } from 'react'
import type { AIAssignmentResponse } from '@/lib/types'

interface AssignmentSuggestionsProps {
  operationId: string
}

export function AssignmentSuggestions({ operationId }: AssignmentSuggestionsProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AIAssignmentResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleGenerate() {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/ai/assign-volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationId }),
      })

      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'שגיאה לא ידועה')
      }

      const data = await res.json() as AIAssignmentResponse
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה לא ידועה')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)] p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
          הצעות שיבוץ חכמות
        </h3>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[#0f1923] rounded-[var(--radius-md)] transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'מנתח...' : 'הצע מתנדבים'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
          <div className="w-4 h-4 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">מנתח נתונים...</span>
        </div>
      )}

      {error && (
        <p className="text-sm text-[var(--color-danger)] bg-[var(--color-danger)]/5 rounded-[var(--radius-md)] p-3">
          {error}
        </p>
      )}

      {result && (
        <div className="animate-in fade-in duration-300 space-y-3">
          {result.summary && (
            <p className="text-sm text-[var(--color-text-secondary)] bg-[var(--color-surface-2)] rounded-[var(--radius-md)] p-3">
              {result.summary}
            </p>
          )}
          <ul className="space-y-2">
            {result.recommended.map(suggestion => (
              <li
                key={suggestion.volunteerId}
                className="border border-[var(--color-accent)]/30 bg-gradient-to-l from-[var(--color-accent)]/5 to-transparent rounded-[var(--radius-md)] p-4"
              >
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  {suggestion.volunteerName}
                </p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                  {suggestion.reason}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
