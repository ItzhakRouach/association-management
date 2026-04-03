'use client'

import { useState } from 'react'

interface SettingsFormProps {
  initialValues: {
    orgName: string
    orgDescription: string
    councilEmail: string
  }
}

export function SettingsForm({ initialValues }: SettingsFormProps) {
  const [values, setValues] = useState(initialValues)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleChange(field: keyof typeof values) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues(prev => ({ ...prev, [field]: e.target.value }))
      setSaved(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'שגיאה בשמירת ההגדרות')
      }

      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה לא ידועה')
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    'w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-[var(--radius-md)] px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-accent)] transition-colors duration-150 placeholder:text-[var(--color-text-muted)]'

  const labelClass = 'block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5'

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-6">
      <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)] p-6 shadow-[var(--shadow-card)] space-y-5">
        <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-2">
          פרטי הארגון
        </h2>

        <div>
          <label className={labelClass} htmlFor="orgName">שם הארגון</label>
          <input
            id="orgName"
            type="text"
            value={values.orgName}
            onChange={handleChange('orgName')}
            placeholder="לדוגמה: עמותת יד לקשיש"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="orgDescription">תיאור הארגון</label>
          <textarea
            id="orgDescription"
            value={values.orgDescription}
            onChange={handleChange('orgDescription')}
            placeholder="תיאור קצר של מטרות הארגון"
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>

      <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)] p-6 shadow-[var(--shadow-card)] space-y-5">
        <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-2">
          {'דוחות ודוא"ל'}
        </h2>

        <div>
          <label className={labelClass} htmlFor="councilEmail">{'כתובת דוא"ל מועצה'}</label>
          <input
            id="councilEmail"
            type="email"
            value={values.councilEmail}
            onChange={handleChange('councilEmail')}
            placeholder="council@example.org"
            className={inputClass}
            dir="ltr"
          />
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            הדוח החודשי ישלח לכתובת זו אוטומטית
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2 text-sm font-medium rounded-[var(--radius-md)] transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: 'var(--color-accent)', color: '#ffffff', border: '2px solid var(--color-accent)' }}
        >
          {saving ? 'שומר...' : 'שמור הגדרות'}
        </button>

        {saved && (
          <span className="text-sm text-[var(--color-success)] animate-in fade-in duration-200">
            ✓ הגדרות נשמרו
          </span>
        )}

        {error && (
          <span className="text-sm text-[var(--color-danger)]">{error}</span>
        )}
      </div>
    </form>
  )
}
