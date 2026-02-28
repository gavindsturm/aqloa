'use client'
import { useEffect, useState } from 'react'
import { Trophy, DollarSign } from 'lucide-react'

interface WinRecord {
  id: string
  agentName: string
  agentEmail: string
  leadName: string
  insuranceType: string
  annualPremium: number
  closedAt: number
}

function timeAgo(ts: number) {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const TYPE_COLORS: Record<string, string> = {
  'Term Life': '#3b82f6',
  'Final Expense': '#f59e0b',
  'Indexed Universal Life (IUL)': '#8b5cf6',
  'Whole Life': '#22c55e',
  'Annuity': '#06b6d4',
  'Health Insurance': '#ec4899',
  'Mortgage Protection': '#f97316',
  'Other': '#94a3b8',
}

export default function TeamWins() {
  const [wins, setWins] = useState<WinRecord[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    fetch('/api/wins')
      .then(r => r.json())
      .then(d => { setWins(d.wins ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 10000) // poll every 10s
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: 20, height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Trophy size={14} style={{ color: '#f59e0b' }} />
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', flex: 1 }}>Team Wins</h3>
        <span style={{ fontSize: 10, color: 'var(--text-muted)', background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', padding: '2px 8px' }}>LIVE</span>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 13 }}>Loading…</div>
      )}

      {!loading && wins.length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
          <DollarSign size={28} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
          <p style={{ fontSize: 13 }}>No deals closed yet</p>
          <p style={{ fontSize: 11, marginTop: 4 }}>Close your first deal to see it here!</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {wins.map(win => {
          const color = TYPE_COLORS[win.insuranceType] ?? '#94a3b8'
          const initials = win.agentName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
          return (
            <div key={win.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', borderLeft: `3px solid ${color}` }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${color}22`, border: `1.5px solid ${color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color, flexShrink: 0 }}>
                {initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{win.agentName}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>closed</span>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>{win.leadName}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', background: `${color}18`, color, border: `1px solid ${color}33` }}>
                    {win.insuranceType}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{timeAgo(win.closedAt)}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ fontSize: 15, fontWeight: 800, color: '#22c55e', letterSpacing: '-0.02em' }}>
                  ${win.annualPremium.toLocaleString()}
                </p>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>annual</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
