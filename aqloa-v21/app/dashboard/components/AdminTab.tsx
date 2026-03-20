'use client'
import { useState } from 'react'
import { Users, Phone, FileText, DollarSign, TrendingUp, Edit2, X, Save, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'
import { TeamMember } from '../types'
import { getRank } from '../lib/xpSystem'

interface Props {
  teamMembers: TeamMember[]
  currentRole: string
  userEmail: string
  card: React.CSSProperties
  btnPrimary: React.CSSProperties
  btnSecondary: React.CSSProperties
  inputStyle: React.CSSProperties
  onUpdateMember: (id: number, patch: Partial<TeamMember>) => void
}

interface EditingAgent {
  id: number
  chargebacks: number
  debt: number
  overrides: string
  agentNotes: string
  role: 'admin' | 'agent' | 'manager'
  status: 'active' | 'pending' | 'inactive'
}

export default function AdminTab({ teamMembers, currentRole, userEmail, card, btnPrimary, btnSecondary, inputStyle, onUpdateMember }: Props) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<EditingAgent | null>(null)
  const [saving, setSaving] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const today = new Date().toISOString().split('T')[0]

  // Build downline using invitedBy chain only
  const getDownlineIds = (email: string, all: TeamMember[]): number[] => {
    const direct = all.filter(m => m.invitedBy === email)
    return direct.flatMap(m => [m.id, ...getDownlineIds(m.email, all)])
  }

  const managedIds = currentRole === 'admin'
    ? teamMembers.map(m => m.id)
    : (() => {
        const me = teamMembers.find(m => m.email === userEmail)
        return me ? [me.id, ...getDownlineIds(userEmail, teamMembers)] : []
      })()

  const managedMembers = teamMembers.filter(m => managedIds.includes(m.id))

  // Org stats
  const totalRevenue = managedMembers.reduce((s, m) => s + m.revenue, 0)
  const totalClosed = managedMembers.reduce((s, m) => s + m.closed, 0)
  const todayDials = managedMembers.reduce((s, m) => s + (m.dailyMetricsDate === today ? (m.dailyDials ?? 0) : 0), 0)
  const todayApps = managedMembers.reduce((s, m) => s + (m.dailyMetricsDate === today ? (m.dailyApplications ?? 0) : 0), 0)
  const todayRevenue = managedMembers.reduce((s, m) => s + (m.dailyMetricsDate === today ? (m.dailyRevenue ?? 0) : 0), 0)
  const totalChargebacks = managedMembers.reduce((s, m) => s + (m.chargebacks ?? 0), 0)
  const totalDebt = managedMembers.reduce((s, m) => s + (m.debt ?? 0), 0)

  const startEdit = (m: TeamMember) => {
    setEditForm({
      id: m.id,
      chargebacks: m.chargebacks ?? 0,
      debt: m.debt ?? 0,
      overrides: m.overrides ?? '',
      agentNotes: m.agentNotes ?? '',
      role: m.role,
      status: m.status,
    })
    setEditingId(m.id)
  }

  const saveEdit = async () => {
    if (!editForm) return
    setSaving(true)
    onUpdateMember(editForm.id, {
      chargebacks: editForm.chargebacks,
      debt: editForm.debt,
      overrides: editForm.overrides,
      agentNotes: editForm.agentNotes,
      role: editForm.role,
      status: editForm.status,
    })
    await new Promise(r => setTimeout(r, 400))
    setSaving(false)
    setEditingId(null)
    setEditForm(null)
  }

  const fmt = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(1)}K` : `$${n.toLocaleString()}`

  const roleColor = (role: string) =>
    role === 'admin' ? '#f59e0b' : role === 'manager' ? '#a78bfa' : '#94a3b8'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          {currentRole === 'admin' ? 'Organization Admin' : 'Team Management'}
        </h2>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
          {managedMembers.length} members · Edit agents, track debt, chargebacks & overrides
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'Members', value: managedMembers.length, icon: Users, color: 'var(--accent)' },
          { label: "Today's Dials", value: todayDials, icon: Phone, color: '#60a5fa' },
          { label: "Today's Revenue", value: fmt(todayRevenue), icon: DollarSign, color: '#34d399' },
          { label: 'All-Time Revenue', value: fmt(totalRevenue), icon: TrendingUp, color: '#f59e0b' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} style={{ ...card, padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Icon size={12} style={{ color }} />
              <span style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</span>
            </div>
            <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Alert row if chargebacks/debt */}
      {(totalChargebacks > 0 || totalDebt > 0) && (
        <div style={{ display: 'flex', gap: 12 }}>
          {totalChargebacks > 0 && (
            <div style={{ flex: 1, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={13} style={{ color: '#ef4444', flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>{totalChargebacks} total chargebacks across org</span>
            </div>
          )}
          {totalDebt > 0 && (
            <div style={{ flex: 1, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={13} style={{ color: '#f59e0b', flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: '#f59e0b', fontWeight: 600 }}>{fmt(totalDebt)} total agent debt across org</span>
            </div>
          )}
        </div>
      )}

      {/* Agent Table */}
      <div style={{ ...card, overflow: 'hidden' }}>
        {/* Header row */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Users size={13} style={{ color: 'var(--accent)' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Agent Roster</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>Click a row to expand · Edit to manage debt, chargebacks & overrides</span>
        </div>

        {/* Column labels */}
        <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 80px 75px 65px 65px 80px 85px 80px 40px', padding: '7px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
          {['Agent', 'Role', 'Status', 'Dials', 'Closed', 'Revenue', 'Chargebacks', 'Debt', ''].map(h => (
            <span key={h} style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</span>
          ))}
        </div>

        {managedMembers.length === 0 && (
          <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-dim)', fontSize: 13 }}>
            No agents in your organization yet.
          </div>
        )}

        {managedMembers.map(m => {
          const met = m.dailyMetricsDate === today ? { dials: m.dailyDials ?? 0 } : { dials: 0 }
          const rc = roleColor(m.role)
          const sc = m.status === 'active' ? '#22c55e' : m.status === 'pending' ? '#f59e0b' : '#94a3b8'
          const initials = m.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
          const inviter = teamMembers.find(x => x.email === m.invitedBy)
          const rank = getRank(m.xp ?? 0)
          const isExpanded = expandedId === m.id
          const isEditing = editingId === m.id
          const hasIssues = (m.chargebacks ?? 0) > 0 || (m.debt ?? 0) > 0

          return (
            <div key={m.id}>
              {/* Main row */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : m.id)}
                style={{ display: 'grid', gridTemplateColumns: '2.5fr 80px 75px 65px 65px 80px 85px 80px 40px', padding: '10px 20px', borderBottom: '1px solid var(--border)', alignItems: 'center', cursor: 'pointer', background: m.email === userEmail ? 'var(--accent-dim)' : isExpanded ? 'var(--bg-elevated)' : 'transparent', transition: 'background 0.1s' }}>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--bg-overlay)', border: `1.5px solid ${rank.color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: rank.color, flexShrink: 0 }}>
                    {initials}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{m.name}</span>
                      <span title={rank.name} style={{ fontSize: 8, fontWeight: 800, padding: '1px 4px', background: `${rank.color}20`, color: rank.color, border: `1px solid ${rank.color}44` }}>{rank.badge} {rank.label}</span>
                      {hasIssues && <span title="Has chargebacks or debt"><AlertTriangle size={10} style={{ color: '#ef4444' }} /></span>}
                    </div>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{m.email}</span>
                  </div>
                </div>

                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', background: `${rc}18`, color: rc, border: `1px solid ${rc}40`, width: 'fit-content' }}>{m.role}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: sc }} />
                  <span style={{ fontSize: 11, color: sc, fontWeight: 600 }}>{m.status}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: met.dials > 0 ? 'var(--text-primary)' : 'var(--text-dim)' }}>{met.dials}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{m.closed}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>{fmt(m.revenue)}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: (m.chargebacks ?? 0) > 0 ? '#ef4444' : 'var(--text-dim)' }}>
                  {(m.chargebacks ?? 0) > 0 ? `⚠ ${m.chargebacks}` : '—'}
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: (m.debt ?? 0) > 0 ? '#f59e0b' : 'var(--text-dim)' }}>
                  {(m.debt ?? 0) > 0 ? fmt(m.debt!) : '—'}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isExpanded ? <ChevronUp size={14} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />}
                </div>
              </div>

              {/* Expanded detail panel */}
              {isExpanded && (
                <div style={{ padding: '16px 20px', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
                  {!isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {/* Info grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                        <InfoCard label="Invited By" value={inviter ? inviter.name : m.invitedBy ?? 'Direct signup'} />
                        <InfoCard label="Joined" value={m.joinedDate} />
                        <InfoCard label="XP / Rank" value={`${m.xp ?? 0} XP · ${rank.name}`} valueColor={rank.color} />
                        <InfoCard label="Chargebacks" value={(m.chargebacks ?? 0) === 0 ? 'None' : String(m.chargebacks)} valueColor={(m.chargebacks ?? 0) > 0 ? '#ef4444' : undefined} />
                        <InfoCard label="Debt" value={(m.debt ?? 0) === 0 ? 'None' : fmt(m.debt!)} valueColor={(m.debt ?? 0) > 0 ? '#f59e0b' : undefined} />
                        <InfoCard label="All-Time Closed" value={String(m.closed)} />
                      </div>
                      {m.overrides && (
                        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '10px 14px' }}>
                          <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Override Arrangement</p>
                          <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{m.overrides}</p>
                        </div>
                      )}
                      {m.agentNotes && (
                        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '10px 14px' }}>
                          <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Admin Notes</p>
                          <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{m.agentNotes}</p>
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => startEdit(m)} style={{ ...btnPrimary, fontSize: 12, padding: '7px 14px' }}>
                          <Edit2 size={12} /> Edit Agent
                        </button>
                      </div>
                    </div>
                  ) : editForm && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        {/* Role */}
                        <div>
                          <label style={labelStyle}>Role</label>
                          <select
                            value={editForm.role}
                            onChange={e => setEditForm(f => f ? { ...f, role: e.target.value as any } : f)}
                            style={inputStyle}
                          >
                            <option value="agent">Agent</option>
                            <option value="manager">Manager</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                        {/* Status */}
                        <div>
                          <label style={labelStyle}>Status</label>
                          <select
                            value={editForm.status}
                            onChange={e => setEditForm(f => f ? { ...f, status: e.target.value as any } : f)}
                            style={inputStyle}
                          >
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </div>
                        {/* Chargebacks */}
                        <div>
                          <label style={labelStyle}>Chargebacks (count)</label>
                          <input
                            type="number" min={0}
                            value={editForm.chargebacks}
                            onChange={e => setEditForm(f => f ? { ...f, chargebacks: parseInt(e.target.value) || 0 } : f)}
                            style={inputStyle}
                          />
                        </div>
                        {/* Debt */}
                        <div>
                          <label style={labelStyle}>Debt ($)</label>
                          <input
                            type="number" min={0}
                            value={editForm.debt}
                            onChange={e => setEditForm(f => f ? { ...f, debt: parseFloat(e.target.value) || 0 } : f)}
                            style={inputStyle}
                            placeholder="0"
                          />
                        </div>
                      </div>
                      {/* Overrides */}
                      <div>
                        <label style={labelStyle}>Override Arrangement</label>
                        <textarea
                          value={editForm.overrides}
                          onChange={e => setEditForm(f => f ? { ...f, overrides: e.target.value } : f)}
                          placeholder="e.g. 5% override on all FEX production from their downline..."
                          rows={2}
                          style={{ ...inputStyle, resize: 'none' }}
                        />
                      </div>
                      {/* Notes */}
                      <div>
                        <label style={labelStyle}>Admin Notes (private)</label>
                        <textarea
                          value={editForm.agentNotes}
                          onChange={e => setEditForm(f => f ? { ...f, agentNotes: e.target.value } : f)}
                          placeholder="Internal notes about this agent..."
                          rows={2}
                          style={{ ...inputStyle, resize: 'none' }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={saveEdit} disabled={saving} style={{ ...btnPrimary, fontSize: 12, padding: '7px 14px', opacity: saving ? 0.6 : 1 }}>
                          <Save size={12} /> {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button onClick={() => { setEditingId(null); setEditForm(null) }} style={{ ...btnSecondary, fontSize: 12, padding: '7px 14px' }}>
                          <X size={12} /> Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function InfoCard({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '8px 12px' }}>
      <p style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3 }}>{label}</p>
      <p style={{ fontSize: 13, fontWeight: 700, color: valueColor ?? 'var(--text-primary)' }}>{value}</p>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 9, color: 'var(--text-muted)', fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5,
}
