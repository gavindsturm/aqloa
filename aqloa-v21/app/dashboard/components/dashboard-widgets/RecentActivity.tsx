'use client'
import { UserPlus, Calendar, DollarSign, Phone, Clock } from 'lucide-react'

const ACTIVITIES = [
  { id: 1, type: 'sale',        description: 'Policy sold to Thomas Lee',                 value: '+$8,400', timestamp: '2 hours ago',  color: 'var(--text-muted)', dim: 'var(--accent-dim)' },
  { id: 2, type: 'lead',        description: 'New lead: John Patterson (Facebook Ads)',    value: '$500K',   timestamp: '5 min ago',    color: 'var(--text-muted)', dim: 'var(--accent-dim)' },
  { id: 3, type: 'appointment', description: 'Appointment set with Maria Garcia',           value: '',        timestamp: '1 hour ago',   color: 'var(--text-muted)', dim: 'var(--accent-dim)' },
  { id: 4, type: 'call',        description: 'Call completed with Sarah Johnson',           value: '14 min',  timestamp: '3 hours ago',  color: 'var(--accent-light)', dim: 'var(--accent-dim)' },
  { id: 5, type: 'lead',        description: 'Lead qualified: David Chen',                 value: '$2M',     timestamp: '4 hours ago',  color: 'var(--text-muted)', dim: 'var(--accent-dim)' },
]

const ICONS: Record<string, any> = { lead: UserPlus, appointment: Calendar, sale: DollarSign, call: Phone }

export default function RecentActivity() {
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: 0, padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Clock size={14} style={{ color: 'var(--text-muted)' }} />
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Recent Activity</h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {ACTIVITIES.map(a => {
          const Icon = ICONS[a.type] || Clock
          return (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 6px', borderRadius: 0, transition: 'background 0.12s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ width: 30, height: 30, borderRadius: 0, background: a.dim, border: `1px solid ${a.color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={13} style={{ color: a.color }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.description}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{a.timestamp}</p>
              </div>
              {a.value && <span style={{ fontSize: 12, fontWeight: 700, color: a.type === 'sale' ? 'var(--text-muted)' : 'var(--text-muted)', flexShrink: 0 }}>{a.value}</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
