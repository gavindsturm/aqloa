'use client'
import { useState } from 'react'
import { CheckCircle, Clock, AlertCircle } from 'lucide-react'

interface Task { id: number; lead: string; type: string; status: 'due' | 'upcoming' | 'done'; time: string; value: string }

const TASKS: Task[] = [
  { id: 1, lead: 'John Patterson',   type: 'Follow-up call',        status: 'due',      time: 'Due now',       value: '$500K' },
  { id: 2, lead: 'Maria Garcia',     type: 'Send proposal',          status: 'due',      time: 'Due in 1h',     value: '$1M'   },
  { id: 3, lead: 'Thomas Lee',       type: 'Review application',     status: 'upcoming', time: 'Tomorrow 10AM', value: '$750K' },
  { id: 4, lead: 'Sarah Johnson',    type: 'Schedule appointment',   status: 'upcoming', time: 'Tomorrow 2PM',  value: '$250K' },
  { id: 5, lead: 'David Chen',       type: 'Initial contact',        status: 'done',     time: 'Completed',     value: '$2M'   },
]

const STATUS = {
  due:      { color: '#f87171', bg: 'rgba(239,68,68,0.10)',    border: 'rgba(239,68,68,0.25)',    icon: AlertCircle,   label: 'Overdue' },
  upcoming: { color: 'var(--accent-light)', bg: 'var(--accent-dim)',   border: 'var(--accent-glow)',   icon: Clock,         label: 'Upcoming' },
  done:     { color: 'var(--text-muted)', bg: 'var(--accent-dim)',   border: 'var(--accent-glow)',   icon: CheckCircle,   label: 'Done' },
}

export default function TeamFeed() {
  const [tasks, setTasks] = useState(TASKS)
  const markDone = (id: number) => setTasks(t => t.map(task => task.id === id ? { ...task, status: 'done' as const, time: 'Completed' } : task))

  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: 0, padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Your Pipeline</h3>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['due', 'upcoming', 'done'] as const).map(s => {
            const c = STATUS[s]; const count = tasks.filter(t => t.status === s).length
            return (
              <span key={s} style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 0, background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
                {count} {c.label}
              </span>
            )
          })}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {tasks.map(task => {
          const cfg = STATUS[task.status]; const StatusIcon = cfg.icon
          return (
            <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 0, transition: 'background 0.12s', cursor: 'default' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <StatusIcon size={14} style={{ color: cfg.color, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: task.status === 'done' ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: task.status === 'done' ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.lead}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>·</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.type}</span>
                </div>
                <span style={{ fontSize: 11, color: cfg.color, fontWeight: 500 }}>{task.time}</span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', flexShrink: 0 }}>{task.value}</span>
              {task.status !== 'done' && (
                <button onClick={() => markDone(task.id)} style={{ padding: '3px 8px', background: 'var(--bg-overlay)', border: '1px solid var(--border-light)', borderRadius: 0, fontSize: 11, color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500, flexShrink: 0 }}>Done</button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
