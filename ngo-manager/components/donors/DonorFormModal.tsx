'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'

interface DonorRow {
  id: string
  name: string
  email: string
  phone: string | null
  whatsapp: string | null
  gender: 'MALE' | 'FEMALE'
}

interface DonorFormModalProps {
  donor?: DonorRow
  onClose: () => void
}

export function DonorFormModal({ donor, onClose }: DonorFormModalProps) {
  const isEdit = Boolean(donor)
  const router = useRouter()

  const [name, setName] = useState(donor?.name ?? '')
  const [email, setEmail] = useState(donor?.email ?? '')
  const [phone, setPhone] = useState(donor?.phone ?? '')
  const [whatsapp, setWhatsapp] = useState(donor?.whatsapp ?? '')
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>(donor?.gender ?? 'MALE')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      gender,
    }

    try {
      const url = isEdit ? `/api/donors/${donor!.id}` : '/api/donors'
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
        className="relative w-full max-w-md rounded-[var(--radius-lg)] shadow-xl"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {isEdit
              ? (donor?.gender === 'FEMALE' ? 'עריכת תורמת' : 'עריכת תורם')
              : (gender === 'FEMALE' ? 'הוספת תורמת' : 'הוספת תורם')}
          </h2>
          <button onClick={onClose} className="p-1 rounded" style={{ color: 'var(--color-text-muted)' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={e => void handleSubmit(e)} className="p-6 space-y-4">
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

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>מין</label>
            <div className="flex gap-4">
              {(['MALE', 'FEMALE'] as const).map(g => (
                <label key={g} className="flex items-center gap-2 cursor-pointer select-none text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    checked={gender === g}
                    onChange={() => setGender(g)}
                    className="accent-[var(--color-accent)]"
                  />
                  {g === 'MALE' ? 'זכר' : 'נקבה'}
                </label>
              ))}
            </div>
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
            {loading ? 'שומר...' : isEdit
              ? 'שמור שינויים'
              : (gender === 'FEMALE' ? 'הוסף תורמת' : 'הוסף תורם')}
          </button>
        </div>
      </div>
    </div>
  )
}
