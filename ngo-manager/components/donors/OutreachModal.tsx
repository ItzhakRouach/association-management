'use client'

import { useEffect, useState } from 'react'
import { X, MessageCircle } from 'lucide-react'
import { whatsappUrl } from '@/lib/utils/whatsapp'

interface OutreachModalProps {
  donorId: string
  donorName: string
  donorPhone?: string | null
  donorWhatsapp?: string | null
  onClose: () => void
}

type Step = 'generating' | 'editing' | 'sending' | 'done' | 'error'

export function OutreachModal({ donorId, donorName, donorPhone, donorWhatsapp, onClose }: OutreachModalProps) {
  const [step, setStep] = useState<Step>('generating')
  const [draft, setDraft] = useState('')
  const [outreachId, setOutreachId] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    let cancelled = false

    async function generate() {
      try {
        const res = await fetch('/api/ai/donor-outreach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ donorId }),
        })
        if (!res.ok) {
          const data = await res.json() as { error?: string }
          throw new Error(data.error ?? 'שגיאה בייצור הטיוטה')
        }
        const data = await res.json() as { outreachId: string; draft: string }
        if (!cancelled) {
          setDraft(data.draft)
          setOutreachId(data.outreachId)
          setStep('editing')
        }
      } catch (err) {
        if (!cancelled) {
          setErrorMsg(err instanceof Error ? err.message : 'שגיאה לא ידועה')
          setStep('error')
        }
      }
    }

    void generate()
    return () => { cancelled = true }
  }, [donorId])

  async function handleSend() {
    setStep('sending')
    try {
      const res = await fetch('/api/donors/send-outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outreachId, content: draft }),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'שגיאה בשליחה')
      }
      setStep('done')
      setTimeout(onClose, 2000)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'שגיאה לא ידועה')
      setStep('error')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(13,27,42,0.7)' }}>
      <div
        className="relative w-full max-w-2xl rounded-[var(--radius-lg)] shadow-xl flex flex-col"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              פנייה אישית — {donorName}
            </h2>
            <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              {step === 'generating' ? 'קלוד מנסח עבורך פנייה אישית...' :
               step === 'editing' ? 'ערוך את הטיוטה ולחץ אשר ושלח' :
               step === 'sending' ? 'שולח...' :
               step === 'done' ? 'נשלח בהצלחה ✓' :
               'אירעה שגיאה'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-[var(--radius-sm)] transition-colors duration-150"
            style={{ color: 'var(--color-text-muted)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-surface-2)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-6">
          {step === 'generating' && (
            <div className="flex items-center gap-3" style={{ color: 'var(--color-text-secondary)' }}>
              <div className="w-5 h-5 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
              <span>מייצר פנייה אישית בעברית...</span>
            </div>
          )}

          {(step === 'editing' || step === 'sending') && (
            <textarea
              value={draft}
              onChange={e => setDraft(e.target.value)}
              disabled={step === 'sending'}
              rows={14}
              className="w-full resize-none rounded-[var(--radius-md)] p-4 text-sm leading-relaxed outline-none transition-colors duration-150"
              style={{
                background: 'var(--color-surface-2)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-body)',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--color-accent)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--color-border)' }}
            />
          )}

          {step === 'done' && (
            <div className="flex items-center gap-3 py-8 justify-center" style={{ color: 'var(--color-success)' }}>
              <span className="text-3xl">✓</span>
              <span className="text-lg font-medium">הפנייה נשלחה ל-{donorName}</span>
            </div>
          )}

          {step === 'error' && (
            <p className="text-sm p-4 rounded-[var(--radius-md)]" style={{ color: 'var(--color-danger)', background: 'rgba(220,38,38,0.06)' }}>
              {errorMsg}
            </p>
          )}
        </div>

        {/* Footer */}
        {(step === 'editing' || step === 'sending') && (
          <div className="flex items-center justify-end gap-3 p-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-[var(--radius-md)] transition-colors duration-150"
              style={{ color: 'var(--color-text-secondary)', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
            >
              ביטול
            </button>
            {(donorWhatsapp ?? donorPhone) && (
              <a
                href={draft.trim() ? whatsappUrl((donorWhatsapp ?? donorPhone)!, draft) : '#'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={!draft.trim() ? e => e.preventDefault() : undefined}
                className="flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-[var(--radius-md)] transition-colors duration-150"
                style={{
                  background: '#25D366',
                  color: '#ffffff',
                  opacity: !draft.trim() ? 0.5 : 1,
                  pointerEvents: !draft.trim() ? 'none' : 'auto',
                }}
              >
                <MessageCircle className="w-4 h-4" />
                שלח בווטסאפ
              </a>
            )}
            <button
              onClick={() => void handleSend()}
              disabled={step === 'sending' || !draft.trim()}
              className="px-5 py-2 text-sm font-medium rounded-[var(--radius-md)] transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              style={{ background: 'var(--color-accent)', color: '#ffffff' }}
            >
              {step === 'sending' && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              שלח באימייל
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
