'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Sparkles, UserCheck, UserX, Clock, CheckCircle, Plus } from 'lucide-react'

const TYPE_LABEL: Record<string, string> = {
  MEAL_DELIVERY: 'חלוקת ארוחות',
  HOME_VISIT: 'ביקור בית',
  HOLIDAY_EVENT: 'אירוע חג',
  MEDICAL_ESCORT: 'ליווי רפואי',
  OTHER: 'אחר',
}

const STATUS_LABEL: Record<string, string> = {
  PLANNED: 'מתוכנן',
  ACTIVE: 'פעיל',
  COMPLETED: 'הושלם',
  CANCELLED: 'בוטל',
}

const STATUS_COLOR: Record<string, string> = {
  PLANNED: 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]',
  ACTIVE: 'bg-[var(--color-success)]/10 text-[var(--color-success)]',
  COMPLETED: 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]',
  CANCELLED: 'bg-[var(--color-danger)]/10 text-[var(--color-danger)]',
}

const ASSIGNMENT_STATUS_LABEL: Record<string, string> = {
  SUGGESTED: 'מוצע',
  CONFIRMED: 'מאושר',
  DECLINED: 'סירב',
}

interface Volunteer {
  id: string
  name: string
  email: string
  skills: string[]
}

interface Assignment {
  id: string
  status: string
  volunteer: Volunteer
}

interface Operation {
  id: string
  title: string
  description: string | null
  type: string
  date: Date | string
  status: string
  volunteerCount: number
  assignments: Assignment[]
}

interface AISuggestion {
  volunteerId: string
  volunteerName: string
  reason: string
}

interface OperationsTableProps {
  operations: Operation[]
}

const TYPE_OPTIONS = [
  { value: 'MEAL_DELIVERY', label: 'חלוקת ארוחות' },
  { value: 'HOME_VISIT', label: 'ביקור בית' },
  { value: 'HOLIDAY_EVENT', label: 'אירוע חג' },
  { value: 'MEDICAL_ESCORT', label: 'ליווי רפואי' },
  { value: 'OTHER', label: 'אחר' },
]

export function OperationsTable({ operations }: OperationsTableProps) {
  const router = useRouter()
  const [selected, setSelected] = useState<Operation | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loadingAssignments, setLoadingAssignments] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([])
  const [aiSummary, setAiSummary] = useState('')
  const [loadingAI, setLoadingAI] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  // Create operation
  const [showCreate, setShowCreate] = useState(false)
  const [createTitle, setCreateTitle] = useState('')
  const [createDescription, setCreateDescription] = useState('')
  const [createType, setCreateType] = useState('MEAL_DELIVERY')
  const [createDate, setCreateDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!createTitle.trim()) return
    setCreating(true)
    setCreateError(null)
    try {
      const res = await fetch('/api/operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: createTitle.trim(),
          description: createDescription.trim() || createTitle.trim(),
          type: createType,
          date: createDate,
        }),
      })
      const data = await res.json() as Operation & { error?: string }
      if (!res.ok) throw new Error(data.error ?? 'שגיאה ביצירת מבצע')
      setShowCreate(false)
      setCreateTitle('')
      setCreateDescription('')
      setCreateType('MEAL_DELIVERY')
      setCreateDate(new Date().toISOString().slice(0, 10))
      router.refresh()
      // Auto-open the new operation and trigger AI assignment
      void openOperation(data)
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'שגיאה לא ידועה')
    } finally {
      setCreating(false)
    }
  }

  async function openOperation(op: Operation) {
    setSelected(op)
    setAiSuggestions([])
    setAiSummary('')
    setAiError(null)
    setLoadingAssignments(true)

    const res = await fetch(`/api/operations/${op.id}/assignments`)
    const data = await res.json() as Assignment[]
    setAssignments(data)
    setLoadingAssignments(false)

    // Auto-suggest with AI for active/planned operations
    if (op.status !== 'COMPLETED' && op.status !== 'CANCELLED') {
      setLoadingAI(true)
      try {
        const aiRes = await fetch('/api/ai/assign-volunteers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationId: op.id }),
        })
        const result = await aiRes.json() as { recommended?: AISuggestion[]; summary?: string; error?: string }
        if (aiRes.ok) {
          setAiSuggestions(result.recommended ?? [])
          setAiSummary(result.summary ?? '')
        }
      } catch {
        // Silently ignore — user can still click the button manually
      } finally {
        setLoadingAI(false)
      }
    }
  }

  async function handleAIAssign() {
    if (!selected) return
    setLoadingAI(true)
    setAiError(null)
    setAiSuggestions([])
    try {
      const res = await fetch('/api/ai/assign-volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationId: selected.id }),
      })
      const data = await res.json() as { recommended?: AISuggestion[]; summary?: string; error?: string }
      if (!res.ok) throw new Error(data.error ?? 'שגיאה בשיבוץ אוטומטי')
      setAiSuggestions(data.recommended ?? [])
      setAiSummary(data.summary ?? '')
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'שגיאה לא ידועה')
    } finally {
      setLoadingAI(false)
    }
  }

  async function handleConfirm(volunteerId: string) {
    if (!selected) return
    setConfirmingId(volunteerId)
    try {
      const res = await fetch(`/api/operations/${selected.id}/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ volunteerId, status: 'CONFIRMED' }),
      })
      if (res.ok) {
        const newAssignment = await res.json() as Assignment
        setAssignments(prev => [...prev, newAssignment])
        setAiSuggestions(prev => prev.filter(s => s.volunteerId !== volunteerId))
        router.refresh()
      }
    } finally {
      setConfirmingId(null)
    }
  }

  async function handleStatusChange(assignmentId: string, status: string) {
    if (!selected) return
    const res = await fetch(`/api/operations/${selected.id}/assignments`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignmentId, status }),
    })
    if (res.ok) {
      const updated = await res.json() as Assignment
      setAssignments(prev => prev.map(a => a.id === assignmentId ? updated : a))
      router.refresh()
    }
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-start mb-4">
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-[var(--radius-md)] transition-colors duration-150"
          style={{ background: 'var(--color-accent)', color: '#ffffff' }}
        >
          <Plus className="w-4 h-4" />
          צור מבצע חדש
        </button>
      </div>

      <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden shadow-[var(--shadow-card)]">
        {/* Table header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-[var(--color-surface-2)] border-b border-[var(--color-border)]">
          <span className="col-span-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">כותרת</span>
          <span className="col-span-2 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider hidden md:block">סוג</span>
          <span className="col-span-2 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">תאריך</span>
          <span className="col-span-2 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">מתנדבים</span>
          <span className="col-span-2 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">סטטוס</span>
        </div>

        <ul>
          {operations.length === 0 && (
            <li className="px-6 py-10 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
              אין מבצעים עדיין — צור מבצע חדש כדי להתחיל
            </li>
          )}
          {operations.map(op => (
            <li
              key={op.id}
              onClick={() => void openOperation(op)}
              className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-2)] transition-colors duration-150 cursor-pointer"
            >
              <div className="col-span-4 min-w-0">
                <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{op.title}</p>
                <p className="text-xs text-[var(--color-text-muted)] truncate hidden sm:block">{op.description}</p>
              </div>
              <div className="col-span-2 hidden md:flex items-center">
                <span className="text-xs text-[var(--color-text-secondary)]">{TYPE_LABEL[op.type] ?? op.type}</span>
              </div>
              <div className="col-span-2 flex items-center">
                <span className="text-sm text-[var(--color-text-secondary)]">
                  {new Date(op.date).toLocaleDateString('he-IL')}
                </span>
              </div>
              <div className="col-span-2 flex items-center">
                <span className={`text-sm ${op.volunteerCount === 0 ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-primary)]'}`}>
                  {op.volunteerCount}{op.volunteerCount === 0 && ' ⚠'}
                </span>
              </div>
              <div className="col-span-2 flex items-center">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLOR[op.status] ?? ''}`}>
                  {STATUS_LABEL[op.status] ?? op.status}
                </span>
              </div>
            </li>
          ))}
        </ul>

        <div className="px-6 py-3 bg-[var(--color-surface-2)] border-t border-[var(--color-border)]">
          <p className="text-xs text-[var(--color-text-muted)]">
            {operations.length} מבצעים · {operations.filter(op => op.status === 'ACTIVE').length} פעילים · {operations.filter(op => op.volunteerCount === 0 && op.status !== 'COMPLETED' && op.status !== 'CANCELLED').length} ממתינים לשיבוץ
          </p>
        </div>
      </div>

      {/* Create Operation Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(13,27,42,0.6)' }}>
          <div
            className="relative w-full max-w-md rounded-[var(--radius-lg)] shadow-xl"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>צור מבצע חדש</h2>
              <button onClick={() => setShowCreate(false)} className="p-1.5 rounded" style={{ color: 'var(--color-text-muted)' }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={e => void handleCreate(e)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                  כותרת <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={createTitle}
                  onChange={e => setCreateTitle(e.target.value)}
                  required
                  placeholder="לדוגמה: חלוקת ארוחות — מרכז ירושלים"
                  className="w-full rounded-[var(--radius-md)] px-3 py-2 text-sm outline-none"
                  style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>תיאור</label>
                <textarea
                  value={createDescription}
                  onChange={e => setCreateDescription(e.target.value)}
                  rows={2}
                  placeholder="פרטים נוספים על המבצע..."
                  className="w-full rounded-[var(--radius-md)] px-3 py-2 text-sm outline-none resize-none"
                  style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>סוג מבצע</label>
                  <select
                    value={createType}
                    onChange={e => setCreateType(e.target.value)}
                    className="w-full rounded-[var(--radius-md)] px-3 py-2 text-sm outline-none"
                    style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                  >
                    {TYPE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>תאריך</label>
                  <input
                    type="date"
                    value={createDate}
                    onChange={e => setCreateDate(e.target.value)}
                    required
                    className="w-full rounded-[var(--radius-md)] px-3 py-2 text-sm outline-none"
                    style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                  />
                </div>
              </div>

              {createError && (
                <p className="text-sm p-3 rounded-[var(--radius-md)]" style={{ color: 'var(--color-danger)', background: 'rgba(220,38,38,0.06)' }}>
                  {createError}
                </p>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 text-sm font-medium rounded-[var(--radius-md)]"
                  style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  disabled={creating || !createTitle.trim()}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-[var(--radius-md)] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'var(--color-accent)', color: '#ffffff' }}
                >
                  {creating && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {creating ? 'יוצר ומשבץ...' : 'צור מבצע'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(13,27,42,0.6)' }}>
          <div
            className="relative w-full max-w-2xl rounded-[var(--radius-lg)] shadow-xl flex flex-col"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', maxHeight: '90vh' }}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <div>
                <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>{selected.title}</h2>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    {new Date(selected.date).toLocaleDateString('he-IL')}
                  </span>
                  <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    {TYPE_LABEL[selected.type] ?? selected.type}
                  </span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLOR[selected.status] ?? ''}`}>
                    {STATUS_LABEL[selected.status] ?? selected.status}
                  </span>
                </div>
                {selected.description && (
                  <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>{selected.description}</p>
                )}
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-1.5 rounded ms-4 flex-shrink-0"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-auto p-6 space-y-5">
              {/* AI Assign */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>שיבוץ מתנדבים</h3>
                  <button
                    onClick={() => void handleAIAssign()}
                    disabled={loadingAI}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-[var(--radius-md)] transition-colors duration-150 disabled:opacity-50"
                    style={{ background: 'var(--color-accent)', color: '#ffffff' }}
                  >
                    {loadingAI ? (
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    {loadingAI ? 'מחשב...' : 'שבץ אוטומטית עם AI'}
                  </button>
                </div>

                {aiError && (
                  <p className="text-xs p-3 rounded-[var(--radius-md)] mb-3" style={{ color: 'var(--color-danger)', background: 'rgba(220,38,38,0.06)' }}>
                    {aiError}
                  </p>
                )}

                {aiSummary && (
                  <p className="text-sm p-3 rounded-[var(--radius-md)] mb-3" style={{ color: 'var(--color-text-secondary)', background: 'var(--color-surface-2)', borderLeft: '3px solid var(--color-accent)' }}>
                    {aiSummary}
                  </p>
                )}

                {aiSuggestions.length > 0 && (
                  <div className="space-y-2 mb-3">
                    <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>המלצות AI — לחץ לאשר:</p>
                    {aiSuggestions.map(s => (
                      <div
                        key={s.volunteerId}
                        className="flex items-center justify-between gap-3 p-3 rounded-[var(--radius-md)]"
                        style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{s.volunteerName}</p>
                          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{s.reason}</p>
                        </div>
                        <button
                          onClick={() => void handleConfirm(s.volunteerId)}
                          disabled={confirmingId === s.volunteerId}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[var(--radius-md)] flex-shrink-0 disabled:opacity-50"
                          style={{ background: 'var(--color-success)', color: '#ffffff' }}
                        >
                          <UserCheck className="w-3 h-3" />
                          אשר שיבוץ
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Current assignments */}
              <div>
                <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                  מתנדבים משובצים {!loadingAssignments && `(${assignments.length})`}
                </h3>

                {loadingAssignments ? (
                  <div className="flex items-center gap-2 py-4" style={{ color: 'var(--color-text-muted)' }}>
                    <div className="w-4 h-4 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">טוען...</span>
                  </div>
                ) : assignments.length === 0 ? (
                  <p className="text-sm py-4 text-center" style={{ color: 'var(--color-text-muted)' }}>
                    אין מתנדבים משובצים עדיין
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {assignments.map(a => (
                      <li
                        key={a.id}
                        className="flex items-center justify-between gap-3 p-3 rounded-[var(--radius-md)]"
                        style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{a.volunteer.name}</p>
                          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{a.volunteer.email}</p>
                          {a.volunteer.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {a.volunteer.skills.slice(0, 3).map(skill => (
                                <span key={skill} className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {a.status === 'SUGGESTED' && (
                            <>
                              <button
                                onClick={() => void handleStatusChange(a.id, 'CONFIRMED')}
                                title="אשר"
                                className="p-1.5 rounded transition-colors duration-150"
                                style={{ color: 'var(--color-success)' }}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => void handleStatusChange(a.id, 'DECLINED')}
                                title="דחה"
                                className="p-1.5 rounded transition-colors duration-150"
                                style={{ color: 'var(--color-danger)' }}
                              >
                                <UserX className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            a.status === 'CONFIRMED' ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]' :
                            a.status === 'DECLINED' ? 'bg-[var(--color-danger)]/10 text-[var(--color-danger)]' :
                            'bg-[var(--color-warning)]/10 text-[var(--color-warning)]'
                          }`}>
                            {ASSIGNMENT_STATUS_LABEL[a.status] ?? a.status}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end p-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <button
                onClick={() => setSelected(null)}
                className="px-5 py-2 text-sm font-medium rounded-[var(--radius-md)]"
                style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
              >
                סגור
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
