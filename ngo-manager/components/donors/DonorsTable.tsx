'use client'

import { useState } from 'react'
import { Pencil, MessageCircle, UserPlus, PlusCircle, Mail } from 'lucide-react'
import { DonorFormModal } from './DonorFormModal'
import { AddDonationModal } from './AddDonationModal'
import { OutreachModal } from './OutreachModal'
import { whatsappUrl } from '@/lib/utils/whatsapp'

interface DonorRow {
  id: string
  name: string
  email: string
  phone: string | null
  whatsapp: string | null
  gender: 'MALE' | 'FEMALE'
  totalDonated: number
  donationCount: number
  lastDonationDate: Date | null
  isCooling: boolean
}

interface DonorsTableProps {
  donors: DonorRow[]
}

type DonorModal = 'add' | DonorRow
type DonationModal = 'global' | { donorId: string; donorName: string; donorPhone: string | null; donorWhatsapp: string | null }

export function DonorsTable({ donors }: DonorsTableProps) {
  const [donorModal, setDonorModal] = useState<DonorModal | null>(null)
  const [donationModal, setDonationModal] = useState<DonationModal | null>(null)
  const [outreachModal, setOutreachModal] = useState<{ id: string; name: string; phone: string | null; whatsapp: string | null } | null>(null)

  return (
    <>
      {/* Action buttons row */}
      <div className="flex items-center justify-start gap-3 mb-4">
        <button
          onClick={() => setDonorModal('add')}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-[var(--radius-md)] transition-colors duration-150"
          style={{ background: 'var(--color-accent)', color: '#ffffff' }}
        >
          <UserPlus className="w-4 h-4" />
          הוסף תורם
        </button>
        <button
          onClick={() => setDonationModal('global')}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-[var(--radius-md)] transition-colors duration-150"
          style={{ background: 'var(--color-surface)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}
        >
          <PlusCircle className="w-4 h-4" />
          הוסף תרומה
        </button>
      </div>

      <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden shadow-[var(--shadow-card)]">
        {/* Table header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-[var(--color-surface-2)] border-b border-[var(--color-border)]">
          <span className="col-span-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">שם</span>
          <span className="col-span-2 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">{'סה"כ תרומות'}</span>
          <span className="col-span-1 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">תרומות</span>
          <span className="col-span-2 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider hidden md:block">תרומה אחרונה</span>
          <span className="col-span-1 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">סטטוס</span>
          <span className="col-span-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider text-end">פעולות</span>
        </div>

        {/* Rows */}
        <ul>
          {donors.map(donor => {
            const waNumber = donor.whatsapp ?? donor.phone
            const waLink = waNumber
              ? whatsappUrl(waNumber, `שלום ${donor.name}, `)
              : null

            return (
              <li
                key={donor.id}
                className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-2)] transition-colors duration-150 items-center"
              >
                <div className="col-span-3 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{donor.name}</p>
                  <p className="text-xs text-[var(--color-text-muted)] truncate">{donor.email}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-sm font-bold text-[var(--color-accent)]">
                    {donor.totalDonated.toLocaleString('he-IL')}₪
                  </span>
                </div>
                <div className="col-span-1">
                  <span className="text-sm text-[var(--color-text-primary)]">{donor.donationCount}</span>
                </div>
                <div className="col-span-2 hidden md:block">
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    {donor.lastDonationDate
                      ? new Date(donor.lastDonationDate).toLocaleDateString('he-IL')
                      : '—'}
                  </span>
                </div>
                <div className="col-span-1">
                  {donor.isCooling ? (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--color-warning)]/10 text-[var(--color-warning)]">
                      {donor.gender === 'FEMALE' ? 'מתקררת' : 'מתקרר'}
                    </span>
                  ) : donor.donationCount > 0 ? (
                    <span className="text-xs font-medium text-[var(--color-success)]">פעיל</span>
                  ) : (
                    <span className="text-xs font-medium text-[var(--color-text-muted)]">חדש</span>
                  )}
                </div>
                <div className="col-span-3 flex items-center justify-end gap-1">
                  {/* WhatsApp */}
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

                  {/* Outreach for cooling donors */}
                  {donor.isCooling && (
                    <button
                      onClick={() => setOutreachModal({ id: donor.id, name: donor.name, phone: donor.phone, whatsapp: donor.whatsapp })}
                      title="שלח פנייה"
                      className="p-1.5 rounded-[var(--radius-sm)] transition-colors duration-150"
                      style={{ color: 'var(--color-warning)' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(234,179,8,0.1)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '' }}
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                  )}

                  {/* Add donation */}
                  <button
                    onClick={() => setDonationModal({ donorId: donor.id, donorName: donor.name, donorPhone: donor.phone, donorWhatsapp: donor.whatsapp })}
                    title="הוסף תרומה"
                    className="p-1.5 rounded-[var(--radius-sm)] transition-colors duration-150"
                    style={{ color: 'var(--color-text-muted)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-surface-2)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-accent)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = ''; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-muted)' }}
                  >
                    <PlusCircle className="w-4 h-4" />
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => setDonorModal(donor)}
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
            {donors.length} תורמים · {donors.filter(d => d.isCooling).length} מתקררים/ות
          </p>
        </div>
      </div>

      {/* Modals */}
      {donorModal === 'add' && (
        <DonorFormModal onClose={() => setDonorModal(null)} />
      )}
      {donorModal && donorModal !== 'add' && (
        <DonorFormModal donor={donorModal} onClose={() => setDonorModal(null)} />
      )}

      {donationModal === 'global' && (
        <AddDonationModal onClose={() => setDonationModal(null)} />
      )}
      {donationModal && donationModal !== 'global' && (
        <AddDonationModal
          donorId={donationModal.donorId}
          donorName={donationModal.donorName}
          donorPhone={donationModal.donorPhone}
          donorWhatsapp={donationModal.donorWhatsapp}
          onClose={() => setDonationModal(null)}
        />
      )}

      {outreachModal && (
        <OutreachModal
          donorId={outreachModal.id}
          donorName={outreachModal.name}
          donorPhone={outreachModal.phone}
          donorWhatsapp={outreachModal.whatsapp}
          onClose={() => setOutreachModal(null)}
        />
      )}
    </>
  )
}
