'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles } from 'lucide-react'

export function ImpactTriggerButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleCalculate() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/ai/impact-scores', { method: 'POST' })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'שגיאה בחישוב הציונים')
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה לא ידועה')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      {error && (
        <span className="text-xs" style={{ color: 'var(--color-danger)' }}>{error}</span>
      )}
      <button
        onClick={() => void handleCalculate()}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-[var(--radius-md)] transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: 'var(--color-accent)', color: '#ffffff' }}
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
        {loading ? 'מחשב...' : 'עדכן ציונים'}
      </button>
    </div>
  )
}
