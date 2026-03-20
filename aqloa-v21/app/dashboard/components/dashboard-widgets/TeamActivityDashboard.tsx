'use client'
import { Users, Phone, FileText, DollarSign, Clock, Wifi } from 'lucide-react'
import { TeamMember } from '../../types'
import RankBadge from '../RankBadge'

interface Props {
  members: TeamMember[]       // already filtered to downline only by caller
  currentUserEmail: string
  profilePic?: string
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function freshMetrics(m: TeamMember) {
  // If the member's daily metrics are from a previous day, treat as 0
  if (!m.dailyMetricsDate || m.dailyMetricsDate !== todayStr()) {
    return { dials: 0, apps: 0, revenue: 0, onlineMin: 0 }
  }
  return {
    dials: m.dailyDials ?? 0,
    apps: m.dailyApplications ?? 0,
    revenue: m.dailyRevenue ?? 0,
    onlineMin: m.onlineMinutesToday ?? 0,
  }
}

function onlineStatus(m: TeamMember): { label: string; color: string } {
  if (!m.lastOnline) return { label: 'Offline', color: 'var(--text-dim)' }
  const diff = Date.now() - new Date(m.lastOnline).getTime()
  if (diff < 5 * 60 * 1000) return { label: 'Online', color: 'var(--green)' }
  if (diff < 30 * 60 * 1000) return { label: 'Away', color: '#f59e0b' }
  return { label: 'Offline', color: 'var(--text-dim)' }
}

function fmtMin(min: number) {
  if (min < 60) return `${min}m`
  return `${Math.floor(min / 60)}h ${min % 60}m`
}

function fmtRevenue(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`
  return `$${n}`
}

const COL_STYLE = {
  fontSize: 11, color: 'var(--text-muted)', fontWeight: 600,
  textTransform: 'uppercase' as const, letterSpacing: '0.06em',
}

export default function TeamActivityDashboard({ members, currentUserEmail, profilePic }: Props) {
  if (members.length === 0) {
    return (
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: 32, textAlign: 'center' }}>
        <Users size={24} style={{ color: 'var(--text-dim)', margin: '0 auto 10px' }} />
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No downline agents yet.</p>
        <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>Invite agents to see their activity here.</p>
      </div>
    )
  }

  // Totals
  const totals = members.reduce((acc, m) => {
    const met = freshMetrics(m)
    return { dials: acc.dials + met.dials, apps: acc.apps + met.apps, revenue: acc.revenue + met.revenue }
  }, { dials: 0, apps: 0, revenue: 0 })

  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 0 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Users size={14} style={{ color: 'var(--accent)' }} />
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Team Activity — Today</h3>
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          {[
            { icon: Phone, label: 'Total Dials', value: totals.dials },
            { icon: FileText, label: 'Applications', value: totals.apps },
            { icon: DollarSign, label: 'Team Revenue', value: fmtRevenue(totals.revenue) },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
              <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent)', letterSpacing: '-0.02em' }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Table header */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 90px 80px 80px 80px 100px', gap: 0, padding: '8px 20px', borderBottom: '1px solid var(--border)' }}>
        <span style={COL_STYLE}>Agent</span>
        <span style={{ ...COL_STYLE, textAlign: 'center' }}>Status</span>
        <span style={{ ...COL_STYLE, textAlign: 'center' }}>Dials</span>
        <span style={{ ...COL_STYLE, textAlign: 'center' }}>Apps</span>
        <span style={{ ...COL_STYLE, textAlign: 'center' }}>Revenue</span>
        <span style={{ ...COL_STYLE, textAlign: 'center' }}>Time Online</span>
      </div>

      {/* Rows */}
      {members.map(m => {
        const met = freshMetrics(m)
        const status = onlineStatus(m)
        const isMe = m.email === currentUserEmail
        const initials = m.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()

        return (
          <div key={m.id} style={{ display: 'grid', gridTemplateColumns: '2fr 90px 80px 80px 80px 100px', gap: 0, padding: '12px 20px', borderBottom: '1px solid var(--border)', background: isMe ? 'var(--accent-dim)' : 'transparent', alignItems: 'center' }}>
            {/* Agent */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--bg-overlay)', border: '1.5px solid var(--border-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', overflow: 'hidden', flexShrink: 0 }}>
                {isMe && profilePic ? <img src={profilePic} alt="av" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</span>
                  {isMe && <span style={{ fontSize: 9, background: 'var(--accent)', color: 'var(--accent-fg)', fontWeight: 700, padding: '1px 5px' }}>YOU</span>}
                </div>
                <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>{m.role}</span>
              </div>
            </div>

            {/* Status */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: status.color, display: 'inline-block' }} />
              <span style={{ fontSize: 11, color: status.color, fontWeight: 600 }}>{status.label}</span>
            </div>

            {/* Dials */}
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: met.dials > 0 ? 'var(--text-primary)' : 'var(--text-dim)' }}>{met.dials}</span>
            </div>

            {/* Apps */}
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: met.apps > 0 ? 'var(--green)' : 'var(--text-dim)' }}>{met.apps}</span>
            </div>

            {/* Revenue */}
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: met.revenue > 0 ? 'var(--accent)' : 'var(--text-dim)' }}>{fmtRevenue(met.revenue)}</span>
            </div>

            {/* Time online */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
              <Clock size={10} style={{ color: 'var(--text-dim)' }} />
              <span style={{ fontSize: 12, color: met.onlineMin > 0 ? 'var(--text-secondary)' : 'var(--text-dim)', fontWeight: 500 }}>
                {met.onlineMin > 0 ? fmtMin(met.onlineMin) : '—'}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
