'use client'
import { useState } from 'react'
import { Target, Edit2, Check, X } from 'lucide-react'

interface Goal { label: string; current: number; target: number; icon: any; color: string }
interface Props { goals: Goal[] }

const COLOR: Record<string, string> = {
  blue: 'var(--accent)', purple: 'var(--accent)', green: 'var(--accent)', orange: 'var(--accent)', amber: 'var(--text-muted)', red: '#f87171',
}

export default function DailyGoals({ goals: initialGoals }: Props) {
  const [goals, setGoals] = useState(initialGoals)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editValues, setEditValues] = useState({ current: 0, target: 0 })

  const startEdit = (idx: number) => { setEditingIndex(idx); setEditValues({ current: goals[idx].current, target: goals[idx].target }) }
  const saveEdit = (idx: number) => {
    const updated = [...goals]; updated[idx] = { ...updated[idx], ...editValues }; setGoals(updated); setEditingIndex(null)
  }

  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: 0, padding: 20, display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
        <Target size={14} style={{ color: 'var(--accent)' }} />
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Today's Goals</h3>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-overlay)', padding: '2px 8px', borderRadius: 0, border: '1px solid var(--border-light)' }}>
          {goals.filter(g => g.current >= g.target).length}/{goals.length} done
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {goals.map((goal, idx) => {
          const pct = Math.min((goal.current / Math.max(goal.target, 1)) * 100, 100)
          const accent = COLOR[goal.color] ?? COLOR.blue
          const Icon = goal.icon
          const isEditing = editingIndex === idx
          const done = pct >= 100
          return (
            <div key={idx}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 0, background: `${accent}18`, border: `1px solid ${accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={12} style={{ color: accent }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{goal.label}</span>
                </div>
                {isEditing ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                    <input type="number" value={editValues.current} onChange={e => setEditValues({ ...editValues, current: +e.target.value || 0 })}
                      style={{ width: 44, padding: '3px 6px', fontSize: 12, background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', borderRadius: 0, color: 'var(--text-primary)' }} />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>/</span>
                    <input type="number" value={editValues.target} onChange={e => setEditValues({ ...editValues, target: +e.target.value || 0 })}
                      style={{ width: 44, padding: '3px 6px', fontSize: 12, background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', borderRadius: 0, color: 'var(--text-primary)' }} />
                    <button onClick={() => saveEdit(idx)} style={{ padding: 4, background: 'var(--accent)', borderRadius: 0, border: 'none', cursor: 'pointer', display: 'flex' }}><Check size={10} color="#000" /></button>
                    <button onClick={() => setEditingIndex(null)} style={{ padding: 4, background: 'var(--bg-overlay)', borderRadius: 0, border: 'none', cursor: 'pointer', display: 'flex' }}><X size={10} style={{ color: 'var(--text-secondary)' }} /></button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: done ? accent : 'var(--text-primary)' }}>
                      {goal.current}<span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 12 }}>/{goal.target}</span>
                    </span>
                    <button onClick={() => startEdit(idx)} style={{ padding: 2, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex' }}><Edit2 size={10} /></button>
                  </div>
                )}
              </div>
              <div style={{ height: 4, background: 'var(--bg-overlay)', borderRadius: 0, overflow: 'hidden', position: 'relative' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: accent, borderRadius: 0, transition: 'width 0.6s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>{Math.round(pct)}%</span>
                {done && <span style={{ fontSize: 10, color: accent, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2 }}><Check size={8} /> Complete</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
