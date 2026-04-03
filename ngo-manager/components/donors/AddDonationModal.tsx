'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, MessageCircle } from 'lucide-react'
import { whatsappUrl } from '@/lib/utils/whatsapp'

// ── Mode A: adding to a known donor ──────────────────────────────────────────
interface ModeAProps {
  donorId: string
  donorName: string
  donorPhone?: string | null
  donorWhatsapp?: string | null
  onClose: () => void
}

// ── Mode B: global add (donor may or may not exist) ───────────────────────────
interface ModeBProps {
  onClose: () => void
}

type AddDonationModalProps = ModeAProps | ModeBProps

function isModeA(props: AddDonationModalProps): props is ModeAProps {
  return 'donorId' in props
}

const todayISO = () => new Date().toISOString().split('T')[0]

export function AddDonationModal(props: AddDonationModalProps) {
  const router = useRouter()
  const modeA = isModeA(props)

  // Donor fields (Mode B only)
  const [donorName, setDonorName] = useState('')
  const [donorEmail, setDonorEmail] = useState('')
  const [donorPhone, setDonorPhone] = useState('')

  // Donation fields
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(todayISO())
  const [note, setNote] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Success state — holds donor info for WhatsApp prompt
  const [success, setSuccess] = useState<{
    name: string
    amount: number
    phone: string | null
  } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('הסכום חייב להיות מספר חיובי')
      return
    }
    setLoading(true)
    setError(null)

    try {
      let resolvedDonorId: string
      let resolvedName: string
      let resolvedPhone: string | null = null

      if (modeA) {
        resolvedDonorId = props.donorId
        resolvedName = props.donorName
        resolvedPhone = props.donorWhatsapp ?? props.donorPhone ?? null
      } else {
        if (!donorName.trim() || !donorEmail.trim()) {
          setError('שם ואימייל תורם נדרשים')
          setLoading(false)
          return
        }
        resolvedName = donorName.trim()
        resolvedPhone = donorPhone.trim() || null

        // Check if donor exists by email
        const existRes = await fetch('/api/donors')
        const donors = await existRes.json() as Array<{ id: string; email: string; phone: string | null; whatsapp: string | null }>
        const found = donors.find(d => d.email.toLowerCase() === donorEmail.trim().toLowerCase())

        if (found) {
          resolvedDonorId = found.id
          resolvedPhone = found.whatsapp ?? found.phone ?? resolvedPhone
        } else {
          const createRes = await fetch('/api/donors', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: resolvedName,
              email: donorEmail.trim(),
              phone: resolvedPhone,
            }),
          })
          if (!createRes.ok) {
            const data = await createRes.json() as { error?: string }
            throw new Error(data.error ?? 'שגיאה ביצירת תורם')
          }
          const newDonor = await createRes.json() as { id: string }
          resolvedDonorId = newDonor.id
        }
      }

      // Create donation
      const donRes = await fetch(`/api/donors/${resolvedDonorId}/donations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parsedAmount,
          date: date || undefined,
          note: note.trim() || null,
        }),
      })
      if (!donRes.ok) {
        const data = await donRes.json() as { error?: string }
        throw new Error(data.error ?? 'שגיאה בשמירת תרומה')
      }

      router.refresh()
      setSuccess({ name: resolvedName, amount: parsedAmount, phone: resolvedPhone })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה לא ידועה')
    } finally {
      setLoading(false)
    }
  }

  // ── Success screen ─────────────────────────────────────────────────────────
  if (success) {
    const waMessage = `שלום ${success.name}, תודה רבה על תרומתך הנדיבה בסך ₪${success.amount.toLocaleString('he-IL')} לעמותת יד לקשיש. תרומתך עוזרת לנו להמשיך לתמוך בקשישים. תודה!`
    const waLink = success.phone ? whatsappUrl(success.phone, waMessage) : null

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(13,27,42,0.6)' }}>
        <div
          className="relative w-full max-w-md rounded-[var(--radius-lg)] shadow-xl"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              התרומה נשמרה ✓
            </h2>
            <button onClick={props.onClose} className="p-1 rounded" style={{ color: 'var(--color-text-muted)' }}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div
              className="rounded-[var(--radius-md)] p-4 text-center"
              style={{ background: 'var(--color-success)' + '14' }}
            >
              <p className="text-sm font-medium" style={{ color: 'var(--color-success)' }}>
                תודה על התרומה נשלחה אוטומטית למייל של {success.name}
              </p>
            </div>

            {waLink ? (
              <div>
                <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                  רצוי לשלוח גם הודעת תודה בווטסאפ?
                </p>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium rounded-[var(--radius-md)] transition-colors duration-150"
                  style={{ background: '#25D366', color: '#ffffff' }}
                >
                  <MessageCircle className="w-4 h-4" />
                  שלח תודה בווטסאפ ל-{success.name}
                </a>
              </div>
            ) : (
              <p className="text-sm text-center" style={{ color: 'var(--color-text-muted)' }}>
                לא נמצא מספר ווטסאפ לתורם זה
              </p>
            )}
          </div>

          <div className="flex justify-end p-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <button
              onClick={props.onClose}
              className="px-5 py-2 text-sm font-medium rounded-[var(--radius-md)]"
              style={{ background: 'var(--color-accent)', color: '#ffffff' }}
            >
              סגור
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Form screen ────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(13,27,42,0.6)' }}>
      <div
        className="relative w-full max-w-md rounded-[var(--radius-lg)] shadow-xl"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              הוספת תרומה
            </h2>
            {modeA && (
              <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{props.donorName}</p>
            )}
          </div>
          <button onClick={props.onClose} className="p-1 rounded" style={{ color: 'var(--color-text-muted)' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={e => void handleSubmit(e)} className="p-6 space-y-4">
          {/* Mode B: donor fields */}
          {!modeA && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                  שם תורם <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={donorName}
                  onChange={e => setDonorName(e.target.value)}
                  required
                  className="w-full rounded-[var(--radius-md)] px-3 py-2 text-sm outline-none"
                  style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                    אימייל <span style={{ color: 'var(--color-danger)' }}>*</span>
                  </label>
                  <input
                    type="email"
                    value={donorEmail}
                    onChange={e => setDonorEmail(e.target.value)}
                    required
                    className="w-full rounded-[var(--radius-md)] px-3 py-2 text-sm outline-none"
                    style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>טלפון / ווטסאפ</label>
                  <input
                    type="tel"
                    value={donorPhone}
                    onChange={e => setDonorPhone(e.target.value)}
                    placeholder="050-0000000"
                    className="w-full rounded-[var(--radius-md)] px-3 py-2 text-sm outline-none"
                    style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                  />
                </div>
              </div>
              <hr style={{ borderColor: 'var(--color-border)' }} />
            </>
          )}

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
              סכום (₪) <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
              placeholder="500"
              className="w-full rounded-[var(--radius-md)] px-3 py-2 text-sm outline-none"
              style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>תאריך תרומה</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full rounded-[var(--radius-md)] px-3 py-2 text-sm outline-none"
              style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>הערה (אופציונלי)</label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="מידע נוסף..."
              className="w-full rounded-[var(--radius-md)] px-3 py-2 text-sm outline-none"
              style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
            />
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
            onClick={props.onClose}
            className="px-4 py-2 text-sm font-medium rounded-[var(--radius-md)]"
            style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            ביטול
          </button>
          <button
            onClick={e => void handleSubmit(e as unknown as React.FormEvent)}
            disabled={loading || !amount || parseFloat(amount) <= 0}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-[var(--radius-md)] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'var(--color-accent)', color: '#ffffff' }}
          >
            {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {loading ? 'שומר...' : 'שמור תרומה'}
          </button>
        </div>
      </div>
    </div>
  )
}
