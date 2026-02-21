'use client'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Edit, Trash2, X, Save, Clock, User, Calendar } from 'lucide-react'
import { Appointment, CalendarView } from '../types'
import { getDaysInMonth, formatDateForCalendar, isToday } from '../../lib/utils'

interface Props {
  appointments: Appointment[]
  currentUser: string
  onCreateAppointment: (apt: Appointment) => void
  onUpdateAppointment: (apt: Appointment) => void
  onDeleteAppointment: (id: number) => void
}

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

const TYPE_COLORS: Record<string, string> = {
  'Initial Consultation': 'var(--accent)',
  'Policy Review': 'var(--accent)',
  'Final Application': 'var(--text-secondary)',
  'Follow-up': 'var(--text-muted)',
  'Needs Analysis': '#f472b6',
}

export default function CalendarSystem({ appointments, currentUser, onCreateAppointment, onUpdateAppointment, onDeleteAppointment }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<CalendarView>('all')
  const [showModal, setShowModal] = useState(false)
  const [editingApt, setEditingApt] = useState<Appointment | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [form, setForm] = useState({
    date: '', time: '', client: '', type: 'Initial Consultation',
    duration: 60, notes: '', isShared: true
  })

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate)

  const filteredAppointments = appointments.filter(apt => {
    if (view === 'shared') return apt.isShared
    if (view === 'personal') return !apt.isShared && apt.createdBy === currentUser
    return true
  })

  const getAppointmentsForDate = (date: string) => filteredAppointments.filter(apt => apt.date === date)

  const upcomingApts = [...filteredAppointments]
    .filter(apt => apt.status !== 'completed' && apt.status !== 'cancelled')
    .sort((a, b) => new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime())
    .slice(0, 8)

  const handleDayClick = (date: string) => {
    setSelectedDate(date)
    setForm({ ...form, date })
    setEditingApt(null)
    setShowModal(true)
  }

  const handleEditClick = (apt: Appointment) => {
    setEditingApt(apt)
    setForm({ date: apt.date, time: apt.time, client: apt.client, type: apt.type, duration: apt.duration, notes: apt.notes || '', isShared: apt.isShared })
    setShowModal(true)
  }

  const handleSave = () => {
    if (editingApt) {
      onUpdateAppointment({ ...editingApt, ...form, title: form.type })
    } else {
      onCreateAppointment({ id: Date.now(), title: form.type, date: form.date, time: form.time, duration: form.duration, client: form.client, agent: currentUser, type: form.type, status: 'pending', notes: form.notes, isShared: form.isShared, createdBy: currentUser })
    }
    setShowModal(false)
    setForm({ date: '', time: '', client: '', type: 'Initial Consultation', duration: 60, notes: '', isShared: true })
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)',
    color: 'var(--text-primary)', borderRadius: 0, padding: '9px 12px', fontSize: 13
  }

  const statusConfig: Record<string, { color: string; bg: string }> = {
    confirmed: { color: 'var(--accent)', bg: 'rgba(34,201,122,0.12)' },
    pending:   { color: 'var(--accent)', bg: 'var(--accent-dim)' },
    completed: { color: 'var(--text-muted)', bg: 'var(--bg-overlay)' },
    cancelled: { color: 'var(--red)', bg: 'rgba(240,80,80,0.12)' },
  }

  return (
    <div className="flex gap-6" style={{ minHeight: 580 }}>

      {/* ── LEFT: Upcoming Events ── */}
      <div style={{ width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)', fontSize: 15 }}>Upcoming</h3>
          <button
            onClick={() => { setEditingApt(null); setForm({ ...form, date: '' }); setShowModal(true) }}
            style={{ background: 'var(--accent)', color: 'var(--accent-fg)', border: 'none', borderRadius: 0, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
          >
            <Plus size={13} /> New
          </button>
        </div>

        {/* Filter pills */}
        <div className="flex gap-1.5">
          {(['all', 'personal', 'shared'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              style={{
                padding: '4px 10px', borderRadius: 0, fontSize: 11, fontWeight: 600, border: '1px solid',
                background: view === v ? 'var(--accent)' : 'var(--bg-elevated)',
                color: view === v ? '#000' : 'var(--text-muted)',
                borderColor: view === v ? 'var(--accent)' : 'var(--border-strong)',
                cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.15s',
              }}>
              {v}
            </button>
          ))}
        </div>

        {/* Events list */}
        <div className="flex-1 space-y-2 overflow-y-auto" style={{ maxHeight: 500 }}>
          {upcomingApts.length === 0 ? (
            <div className="text-center py-12" style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              <Calendar size={28} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
              No upcoming appointments
            </div>
          ) : upcomingApts.map(apt => {
            const typeColor = TYPE_COLORS[apt.type] || 'var(--accent)'
            const sc = statusConfig[apt.status] || statusConfig.pending
            return (
              <div key={apt.id} className="rounded-none transition-all group"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', padding: '12px 14px', borderLeft: `3px solid ${typeColor}` }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 600 }} className="truncate">{apt.client}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 2 }}>{apt.type}</p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="flex items-center gap-1" style={{ fontSize: 11, color: typeColor }}>
                        <Clock size={10} /> {apt.date} {apt.time && `· ${apt.time}`}
                      </span>
                      <span style={{ ...sc, fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 0, border: `1px solid ${sc.color}28` }}>{apt.status}</span>
                    </div>
                  </div>
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button onClick={() => handleEditClick(apt)}
                      style={{ padding: 5, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                      <Edit size={13} />
                    </button>
                    <button onClick={() => onDeleteAppointment(apt.id)}
                      style={{ padding: 5, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', display: 'flex' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── RIGHT: Calendar Grid ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', borderRadius: 0, padding: 7, cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}>
              <ChevronLeft size={16} />
            </button>
            <h2 className="font-bold" style={{ color: 'var(--text-primary)', fontSize: 'clamp(14px,1.4vw,18px)', minWidth: 160, textAlign: 'center' }}>
              {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', borderRadius: 0, padding: 7, cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}>
              <ChevronRight size={16} />
            </button>
          </div>
          <button
            onClick={() => setCurrentDate(new Date())}
            style={{ padding: '6px 14px', background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', borderRadius: 0, fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500 }}>
            Today
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAY_NAMES.map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '4px 0' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 flex-1" style={{ border: '1px solid var(--border)', borderRadius: 0, overflow: 'hidden' }}>
          {/* Empty cells before month start */}
          {Array.from({ length: startingDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} style={{ minHeight: 80, background: 'var(--bg-base)', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }} />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
            const dateStr = formatDateForCalendar(currentDate.getFullYear(), currentDate.getMonth(), day)
            const isTodayDate = isToday(dateStr)
            const dayApts = getAppointmentsForDate(dateStr)

            return (
              <div key={day}
                className="cursor-pointer transition-all"
                style={{ minHeight: 80, borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: isTodayDate ? 'rgba(207,69,0,0.05)' : 'transparent', position: 'relative' }}
                onMouseEnter={e => (e.currentTarget.style.background = isTodayDate ? 'var(--accent-dim)' : 'var(--bg-elevated)')}
                onMouseLeave={e => (e.currentTarget.style.background = isTodayDate ? 'rgba(207,69,0,0.05)' : 'transparent')}
                onClick={() => handleDayClick(dateStr)}
              >
                <div style={{ padding: '6px 8px' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 24, height: 24, borderRadius: '50%', fontSize: 12, fontWeight: isTodayDate ? 700 : 400,
                    background: isTodayDate ? 'var(--accent)' : 'transparent',
                    color: isTodayDate ? '#000' : 'var(--text-secondary)',
                  }}>
                    {day}
                  </span>
                  {dayApts.slice(0, 2).map(apt => {
                    const tc = TYPE_COLORS[apt.type] || 'var(--accent)'
                    return (
                      <div key={apt.id}
                        onClick={e => { e.stopPropagation(); handleEditClick(apt) }}
                        style={{ marginTop: 2, fontSize: 10, padding: '2px 5px', borderRadius: 0, background: `${tc}18`, color: tc, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer', border: `1px solid ${tc}28` }}>
                        {apt.time ? `${apt.time} ` : ''}{apt.client.split(' ')[0]}
                      </div>
                    )
                  })}
                  {dayApts.length > 2 && (
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, paddingLeft: 2 }}>+{dayApts.length - 2} more</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop-enter" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowModal(false)}>
          <div className="modal-enter" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-strong)', borderRadius: 0, width: '100%', maxWidth: 480, boxShadow: '0 25px 80px rgba(0,0,0,0.6)', overflow: 'hidden' }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 17 }}>
                {editingApt ? 'Edit Appointment' : 'New Appointment'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 4 }}><X size={18} /></button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Date</label>
                  <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={inputStyle} required />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Time</label>
                  <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} style={inputStyle} required />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Client Name</label>
                <input type="text" value={form.client} onChange={e => setForm({ ...form, client: e.target.value })} style={inputStyle} placeholder="John Smith" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                    style={{ ...inputStyle, appearance: 'none' }}>
                    {['Initial Consultation','Policy Review','Final Application','Follow-up','Needs Analysis'].map(t => (
                      <option key={t} value={t} style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)' }}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Duration (min)</label>
                  <input type="number" value={form.duration} onChange={e => setForm({ ...form, duration: parseInt(e.target.value) })} style={inputStyle} min="15" step="15" />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Visibility</label>
                <div className="flex gap-3">
                  {[{ val: true, label: 'Shared (Team)' }, { val: false, label: 'Personal' }].map(opt => (
                    <label key={String(opt.val)} className="flex items-center gap-2 cursor-pointer" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      <input type="radio" checked={form.isShared === opt.val} onChange={() => setForm({ ...form, isShared: opt.val })}
                        style={{ accentColor: 'var(--accent)', width: 14, height: 14 }} />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Notes</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3}
                  style={{ ...inputStyle, resize: 'none' }} placeholder="Additional notes..." />
              </div>
            </div>

            <div className="flex gap-3 px-6 pb-5">
              <button onClick={() => setShowModal(false)}
                style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid var(--border-strong)', borderRadius: 0, color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleSave}
                style={{ flex: 1, padding: '10px', background: 'var(--accent)', border: 'none', borderRadius: 0, color: 'var(--accent-fg)', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Save size={14} /> {editingApt ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
