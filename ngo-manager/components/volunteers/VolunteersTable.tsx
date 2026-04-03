'use client'

import { useState } from 'react'
import { Pencil, MessageCircle, UserPlus } from 'lucide-react'
import { VolunteerFormModal } from './VolunteerFormModal'
import { whatsappUrl } from '@/lib/utils/whatsapp'

interface Volunteer {
  id: string
  name: string
  email: string
  phone: string | null
  whatsapp: string | null
  skills: string[]
  isActive: boolean
  assignments: { id: string }[]
  impactScore: { score: number } | null
}

interface VolunteersTableProps {
  volunteers: Volunteer[]
}

export function VolunteersTable({ volunteers }: VolunteersTableProps) {
  const [modal, setModal] = useState<'add' | Volunteer | null>(null)

  function closeModal() {
    setModal(null)
  }

  return (
    <>
      {/* Add button row */}
      <div className="flex justify-start mb-4">
        <button
          onClick={() => setModal('add')}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-[var(--radius-md)] transition-colors duration-150"
          style={{ background: 'var(--color-accent)', color: '#ffffff' }}
        >
          <UserPlus className="w-4 h-4" />
          הוסף מתנדב
        </button>
      </div>

      <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden shadow-[var(--shadow-card)]">
        {/* Table header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-[var(--color-surface-2)] border-b border-[var(--color-border)]">
          <span className="col-span-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">שם</span>
          <span className="col-span-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider hidden md:block">כישורים</span>
          <span className="col-span-2 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">מבצעים</span>
          <span className="col-span-1 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">ציון</span>
          <span className="col-span-1 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">סטטוס</span>
          <span className="col-span-2 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider text-end">פעולות</span>
        </div>

        {/* Rows */}
        <ul>
          {volunteers.map(v => {
            const waNumber = v.whatsapp ?? v.phone
            const waLink = waNumber
              ? whatsappUrl(waNumber, `שלום ${v.name}, אנחנו מעמותת יד לקשיש. `)
              : null

            return (
              <li
                key={v.id}
                className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-2)] transition-colors duration-150 items-center"
              >
                <div className="col-span-3 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{v.name}</p>
                  <p className="text-xs text-[var(--color-text-muted)] truncate">{v.email}</p>
                </div>
                <div className="col-span-3 hidden md:flex flex-wrap gap-1 items-start">
                  {v.skills.slice(0, 3).map(skill => (
                    <span
                      key={skill}
                      className="text-xs px-1.5 py-0.5 rounded-full border"
                      style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                    >
                      {skill}
                    </span>
                  ))}
                  {v.skills.length > 3 && (
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>+{v.skills.length - 3}</span>
                  )}
                </div>
                <div className="col-span-2">
                  <span className="text-sm text-[var(--color-text-primary)]">{v.assignments.length}</span>
                </div>
                <div className="col-span-1">
                  <span className="text-sm font-bold" style={{ color: 'var(--color-accent)' }}>
                    {v.impactScore ? Math.round(v.impactScore.score) : '—'}
                  </span>
                </div>
                <div className="col-span-1">
                  <span className="text-xs font-medium" style={{ color: v.isActive ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                    {v.isActive ? 'פעיל' : 'לא פעיל'}
                  </span>
                </div>
                <div className="col-span-2 flex items-center justify-end gap-2">
                  {waLink && (
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="שלח ווטסאפ"
                      className="p-1.5 rounded-[var(--radius-sm)] transition-colors duration-150"
                      style={{ color: '#25D366' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(37,211,102,0.1)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '' }}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={() => setModal(v)}
                    title="ערוך"
                    className="p-1.5 rounded-[var(--radius-sm)] transition-colors duration-150"
                    style={{ color: 'var(--color-text-muted)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-surface-2)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-primary)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = ''; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-muted)' }}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>

        {/* Footer */}
        <div className="px-6 py-3 bg-[var(--color-surface-2)] border-t border-[var(--color-border)]">
          <p className="text-xs text-[var(--color-text-muted)]">
            {volunteers.length} מתנדבים · {volunteers.filter(v => v.isActive).length} פעילים
          </p>
        </div>
      </div>

      {/* Modals */}
      {modal === 'add' && <VolunteerFormModal onClose={closeModal} />}
      {modal && modal !== 'add' && (
        <VolunteerFormModal volunteer={modal} onClose={closeModal} />
      )}
    </>
  )
}
