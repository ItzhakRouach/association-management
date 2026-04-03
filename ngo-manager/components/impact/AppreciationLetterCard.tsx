'use client'

import { useState } from 'react'
import type { ImpactScoreData } from '@/lib/types'

interface AppreciationLetterCardProps {
  volunteer: ImpactScoreData
}

export function AppreciationLetterCard({ volunteer }: AppreciationLetterCardProps) {
  const [content, setContent] = useState(volunteer.appreciationLetter ?? '')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!volunteer.appreciationLetter) return null

  async function handleSend() {
    setSending(true)
    setError(null)
    try {
      const res = await fetch('/api/volunteers/send-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ letterId: volunteer.appreciationLetterId, content }),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'שגיאה בשליחה')
      }
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה לא ידועה')
    } finally {
      setSending(false)
    }
  }

  return (
    <div
      className="rounded-[var(--radius-lg)] border p-6 shadow-[var(--shadow-card)]"
      style={{
        borderColor: 'rgba(30,58,95,0.3)',
        background: 'linear-gradient(to left, rgba(30,58,95,0.04), transparent)',
        backgroundColor: 'var(--color-surface)',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          מכתב הוקרה — {volunteer.volunteerName}
        </h3>
        <span
          className="text-xs px-2 py-1 rounded-full font-medium"
          style={{ background: 'rgba(30,58,95,0.12)', color: 'var(--color-accent)' }}
        >
          ציון {Math.round(volunteer.score)}/100
        </span>
      </div>

      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        disabled={sent}
        rows={8}
        className="w-full resize-none rounded-[var(--radius-md)] p-3 text-sm leading-relaxed outline-none transition-colors duration-150 mb-3"
        style={{
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-primary)',
          fontFamily: 'var(--font-body)',
        }}
        onFocus={e => { e.currentTarget.style.borderColor = 'var(--color-accent)' }}
        onBlur={e => { e.currentTarget.style.borderColor = 'var(--color-border)' }}
      />

      {error && (
        <p className="text-xs mb-3 p-2 rounded-[var(--radius-sm)]" style={{ color: 'var(--color-danger)', background: 'rgba(220,38,38,0.06)' }}>
          {error}
        </p>
      )}

      <div className="flex items-center justify-end">
        {sent ? (
          <span className="text-sm font-medium" style={{ color: 'var(--color-success)' }}>
            ✓ נשלח
          </span>
        ) : (
          <button
            onClick={() => void handleSend()}
            disabled={sending || !content.trim()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-[var(--radius-md)] transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'var(--color-accent)', color: '#ffffff' }}
          >
            {sending && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {sending ? 'שולח...' : 'שלח מכתב'}
          </button>
        )}
      </div>
    </div>
  )
}
