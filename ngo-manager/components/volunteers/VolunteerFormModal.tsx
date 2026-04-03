'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { HEBREW_SKILLS } from '@/lib/constants/skills'

interface VolunteerRow {
  id: string
  name: string
  email: string
  phone: string | null
  whatsapp: string | null
  skills: string[]
  isActive: boolean
}

interface VolunteerFormModalProps {
  volunteer?: VolunteerRow
  onClose: () => void
}

export function VolunteerFormModal({ volunteer, onClose }: VolunteerFormModalProps) {
  const isEdit = Boolean(volunteer)
  const router = useRouter()

  const [name, setName] = useState(volunteer?.name ?? '')
  const [email, setEmail] = useState(volunteer?.email ?? '')
  const [phone, setPhone] = useState(volunteer?.phone ?? '')
  const [whatsapp, setWhatsapp] = useState(volunteer?.whatsapp ?? '')
  const [skills, setSkills] = useState<string[]>(volunteer?.skills ?? [])
  const [isActive, setIsActive] = useState(volunteer?.isActive ?? true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleSkill(skill: string) {
    setSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    setLoading(true)
    setError(null)

    const body = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || null,
      whatsapp: whatsapp.trim() || null,
      skills,
      isActive,
    }

    try {
      const url = isEdit ? `/api/volunteers/${volunteer!.id}` : '/api/volunteers'
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'שגיאה בשמירה')
      }
      router.refresh()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה לא ידועה')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(13,27,42,0.6)' }}>
      <div
        className="relative w-full max-w-lg rounded-[var(--radius-lg)] shadow-xl flex flex-col"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', maxHeight: '92vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {isEdit ? 'עריכת מתנדב' : 'הוספת מתנדב'}
          </h2>
          <button onClick={onClose} className="p-1 rounded" style={{ color: 'var(--color-text-muted)' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={e => void handleSubmit(e)} className="flex-1 overflow-auto p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
              שם מלא <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full rounded-[var(--radius-md)] px-3 py-2 text-sm outline-none"
              style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
              אימייל <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full rounded-[var(--radius-md)] px-3 py-2 text-sm outline-none"
              style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
            />
          </div>

          {/* Phone + WhatsApp */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>טלפון</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="050-0000000"
                className="w-full rounded-[var(--radius-md)] px-3 py-2 text-sm outline-none"
                style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>ווטסאפ</label>
              <input
                type="tel"
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                placeholder="050-0000000"
                className="w-full rounded-[var(--radius-md)] px-3 py-2 text-sm outline-none"
                style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
              />
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>כישורים</label>
            <div className="flex flex-wrap gap-2">
              {HEBREW_SKILLS.map(skill => {
                const selected = skills.includes(skill)
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className="text-xs px-2.5 py-1 rounded-full border transition-colors duration-150"
                    style={selected ? {
                      background: 'var(--color-accent)',
                      borderColor: 'var(--color-accent)',
                      color: '#ffffff',
                    } : {
                      background: 'var(--color-surface-2)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    {skill}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Active toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={isActive}
              onClick={() => setIsActive(prev => !prev)}
              className="relative w-10 h-6 rounded-full transition-colors duration-200"
              style={{ background: isActive ? 'var(--color-success)' : 'var(--color-border)' }}
            >
              <span
                className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200"
                style={{ insetInlineStart: isActive ? 'calc(100% - 1.25rem)' : '0.25rem' }}
              />
            </button>
            <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
              {isActive ? 'מתנדב פעיל' : 'מתנדב לא פעיל'}
            </span>
          </div>

          {error && (
            <p className="text-sm p-3 rounded-[var(--radius-md)]" style={{ color: 'var(--color-danger)', background: 'rgba(220,38,38,0.06)' }}>
              {error}
            </p>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-[var(--radius-md)]"
            style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            ביטול
          </button>
          <button
            onClick={e => void handleSubmit(e as unknown as React.FormEvent)}
            disabled={loading || !name.trim() || !email.trim()}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-[var(--radius-md)] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'var(--color-accent)', color: '#ffffff' }}
          >
            {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {loading ? 'שומר...' : isEdit ? 'שמור שינויים' : 'הוסף מתנדב'}
          </button>
        </div>
      </div>
    </div>
  )
}
