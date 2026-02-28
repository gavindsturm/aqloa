'use client'
import { useState } from 'react'
import { X, UserPlus, Trash2, Trophy, Mail, Phone, Copy, Check, Clock, AlertCircle, RefreshCw, ChevronDown, ChevronRight, Shield, Link as LinkIcon } from 'lucide-react'
import { useTeam } from '../context/TeamContext'
import { TeamMember } from '../types'
import TeamChat from './dashboard-widgets/TeamChat'
import TeamPerformance from './dashboard-widgets/TeamPerformance'

interface Props {
  teamMembers: TeamMember[]
  currentUser: string
  profilePic?: string
  onInviteMember: (email: string, role: 'admin' | 'agent' | 'manager') => void
  onRemoveMember: (id: number) => void
}

const UPLINE_SEED = [
  { id: 900, name: 'Marcus Webb',    title: 'Regional Director', revenue: '$2.1M', agents: 14, initials: 'MW', email: 'marcus@aqloa.com', phone: '(555) 900-0001' },
  { id: 901, name: 'Jennifer Chase', title: 'District Manager',  revenue: '$890K', agents: 6,  initials: 'JC', email: 'jennifer@aqloa.com', phone: '(555) 900-0002' },
]

type Tab = 'overview' | 'upline' | 'downline' | 'invites'

export default function TeamManagement({ currentUser, profilePic }: Props) {
  const { members, removeMember, pendingInvites, addPendingInvite, removePendingInvite, getDownline, getUpline, leaderboard } = useTeam()

  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [expandedMember, setExpandedMember] = useState<number | null>(null)

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'agent' | 'manager' | 'admin'>('agent')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteResult, setInviteResult] = useState<{ url: string; email: string; expires: number } | null>(null)
  const [inviteError, setInviteError] = useState('')
  const [copiedToken, setCopiedToken] = useState<string | null>(null)

  const downline = getDownline(currentUser)
  const allDownline = downline.length > 0 ? downline : members.filter(m => m.email !== currentUser).slice(0, 5)

  const card: React.CSSProperties = { background: 'var(--bg-surface)', border: '1px solid var(--border)' }
  const btnPrimary: React.CSSProperties = { background: 'var(--accent)', color: 'var(--accent-fg)', fontWeight: 600, padding: '8px 16px', fontSize: 13, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }
  const btnSecondary: React.CSSProperties = { background: 'transparent', color: 'var(--text-secondary)', fontWeight: 500, padding: '7px 12px', fontSize: 12, border: '1px solid var(--border-light)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5 }
  const inputStyle: React.CSSProperties = { width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', color: 'var(--text-primary)', padding: '9px 12px', fontSize: 13 }

  // ── Send invite via API ────────────────────────────────────────────────────
  const handleSendInvite = async () => {
    setInviteError('')
    if (!inviteEmail.trim()) { setInviteError('Email address is required.'); return }

    setInviteLoading(true)
    try {
      const currentUserName = currentUser.includes('@') ? currentUser.split('@')[0] : currentUser
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail.trim().toLowerCase(),
          role: inviteRole,
          invitedBy: currentUser,
          invitedByName: currentUserName.charAt(0).toUpperCase() + currentUserName.slice(1),
          orgId: localStorage.getItem('orgId') ?? 'default-org',
        }),
      })
      const data = await res.json()
      if (!data.success) { setInviteError(data.error ?? 'Failed to generate invite.'); setInviteLoading(false); return }

      setInviteResult({ url: data.inviteUrl, email: data.email, expires: data.expiresAt })
      addPendingInvite({
        email: data.email, role: inviteRole,
        invitedBy: currentUserName,
        expiresAt: data.expiresAt,
        createdAt: Date.now(),
        token: data.inviteUrl.split('token=')[1] ?? '',
        inviteUrl: data.inviteUrl,
      })
    } catch {
      setInviteError('Network error. Is the server running?')
    }
    setInviteLoading(false)
  }

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedToken(key)
      setTimeout(() => setCopiedToken(null), 2000)
    })
  }

  const resetInviteModal = () => {
    setShowInviteModal(false)
    setInviteEmail('')
    setInviteRole('agent')
    setInviteResult(null)
    setInviteError('')
  }

  const TABS: { id: Tab; label: string; badge?: number }[] = [
    { id: 'overview',  label: 'Overview' },
    { id: 'upline',    label: 'Upline',   badge: getUpline(currentUser).length },
    { id: 'downline',  label: 'Downline', badge: allDownline.length },
    { id: 'invites',   label: 'Invites',  badge: pendingInvites.length || undefined },
  ]

  const activeMembers = members.filter(m => m.status === 'active').length
  const totalRevenue  = members.reduce((s, m) => s + m.revenue, 0)
  const avgClose      = members.length ? (members.reduce((s, m) => s + (m.leads > 0 ? (m.closed / m.leads) * 100 : 0), 0) / members.length) : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>Team</h2>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Manage your org, send invites, track performance</p>
        </div>
        <button onClick={() => setShowInviteModal(true)} style={btnPrimary}><UserPlus size={14} /> Invite Member</button>
      </div>

      {/* Stats strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'Active Members',  value: activeMembers },
          { label: 'Total Revenue',   value: totalRevenue >= 1_000_000 ? `$${(totalRevenue / 1_000_000).toFixed(1)}M` : `$${(totalRevenue / 1000).toFixed(0)}K` },
          { label: 'Avg Close Rate',  value: `${avgClose.toFixed(1)}%` },
          { label: 'Pending Invites', value: pendingInvites.length },
        ].map(stat => (
          <div key={stat.label} style={{ ...card, padding: '14px 16px' }}>
            <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{stat.label}</p>
            <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, background: 'var(--bg-elevated)', padding: 3, width: 'fit-content', border: '1px solid var(--border-light)' }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: '6px 16px', fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer', transition: 'all 0.15s',
            background: activeTab === tab.id ? 'var(--bg-surface)' : 'transparent',
            color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {tab.label}
            {tab.badge != null && tab.badge > 0 && (
              <span style={{ fontSize: 10, background: activeTab === tab.id ? 'var(--accent)' : 'var(--bg-overlay)', color: activeTab === tab.id ? 'var(--accent-fg)' : 'var(--text-muted)', padding: '0 5px', minWidth: 16, textAlign: 'center', fontWeight: 700 }}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '0.85fr 1fr', gap: 16, alignItems: 'start' }}>
          <TeamPerformance currentUser={currentUser} profilePic={profilePic} />
          <TeamChat currentUser={currentUser} />
        </div>
      )}

      {/* ── UPLINE ── */}
      {activeTab === 'upline' && (() => {
        const upline = getUpline(currentUser)
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Your management chain — people above you in the organization.</p>
            {upline.length === 0 && (
              <div style={{ ...card, padding: '32px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Trophy size={24} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
                <p style={{ fontSize: 14 }}>No upline found</p>
                <p style={{ fontSize: 12, marginTop: 4 }}>You may be at the top of the org chart</p>
              </div>
            )}
            {upline.map((person, i) => {
              const initials = person.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
              return (
                <div key={person.id} style={{ ...card, padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ position: 'relative' }}>
                      <div style={{ width: 46, height: 46, borderRadius: '50%', background: i === 0 ? 'var(--accent-dim)' : 'var(--bg-overlay)', border: `2px solid ${i === 0 ? 'var(--accent-glow)' : 'var(--border-strong)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: i === 0 ? 'var(--accent)' : 'var(--text-secondary)' }}>
                        {initials}
                      </div>
                      <div style={{ position: 'absolute', bottom: -2, right: -2, width: 16, height: 16, background: i === 0 ? 'var(--accent)' : 'var(--bg-overlay)', borderRadius: '50%', border: '2px solid var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trophy size={7} color={i === 0 ? 'var(--accent-fg)' : 'var(--text-muted)'} />
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{person.name}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, textTransform: 'capitalize' }}>{person.role}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 20, textAlign: 'right' }}>
                      <div>
                        <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Revenue</p>
                        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>${(person.revenue / 1000).toFixed(0)}K</p>
                      </div>
                      <div>
                        <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Closed</p>
                        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{person.closed}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <a href={`mailto:${person.email}`} style={{ ...btnSecondary, textDecoration: 'none' }}><Mail size={12} /> Message</a>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )
      })()}

      {/* ── DOWNLINE ── */}
      {activeTab === 'downline' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Agents under your supervision. Click any row to expand.</p>
          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 90px', gap: 0, padding: '8px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border-light)' }}>
            {['Agent', 'Role', 'Closed', 'Revenue', 'Status', ''].map(h => (
              <span key={h} style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
            ))}
          </div>
          {allDownline.map(member => {
            const expanded = expandedMember === member.id
            const initials = member.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
            return (
              <div key={member.id} style={{ ...card, overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 90px', gap: 0, padding: '12px 16px', cursor: 'pointer', alignItems: 'center' }}
                  onClick={() => setExpandedMember(expanded ? null : member.id)}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--bg-overlay)', border: '1px solid var(--border-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', flexShrink: 0 }}>{initials}</div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{member.name}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{member.email}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{member.role}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{member.closed}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>${(member.revenue / 1000).toFixed(0)}K</span>
                  <span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, padding: '2px 8px', background: member.status === 'active' ? 'rgba(34,197,94,0.10)' : 'rgba(245,158,11,0.10)', color: member.status === 'active' ? '#22c55e' : '#f59e0b', border: `1px solid ${member.status === 'active' ? 'rgba(34,197,94,0.25)' : 'rgba(245,158,11,0.25)'}` }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: member.status === 'active' ? '#22c55e' : '#f59e0b', flexShrink: 0 }} />
                      {member.status}
                    </span>
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                    <button onClick={e => { e.stopPropagation(); removeMember(member.id) }} style={{ padding: '4px 6px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}
                    ><Trash2 size={13} /></button>
                    {expanded ? <ChevronDown size={13} style={{ color: 'var(--text-muted)' }} /> : <ChevronRight size={13} style={{ color: 'var(--text-muted)' }} />}
                  </div>
                </div>
                {expanded && (
                  <div style={{ padding: '12px 16px 14px', borderTop: '1px solid var(--border)', background: 'var(--bg-elevated)', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
                    {[
                      { label: 'Leads',        value: member.leads },
                      { label: 'Calls',         value: member.calls },
                      { label: 'Appointments',  value: member.appointments },
                      { label: 'Closed',        value: member.closed },
                      { label: 'Joined',        value: member.joinedDate },
                    ].map(item => (
                      <div key={item.label}>
                        <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{item.label}</p>
                        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{item.value}</p>
                      </div>
                    ))}
                    <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8, marginTop: 8 }}>
                      <a href={`mailto:${member.email}`} style={{ ...btnSecondary, textDecoration: 'none', fontSize: 11 }}><Mail size={11} /> Email</a>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── INVITES ── */}
      {activeTab === 'invites' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Active invite links — expire 48 hours after creation.</p>
            <button onClick={() => setShowInviteModal(true)} style={btnPrimary}><UserPlus size={13} /> New Invite</button>
          </div>

          {pendingInvites.length === 0 && (
            <div style={{ ...card, padding: '32px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <LinkIcon size={24} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
              <p style={{ fontSize: 14 }}>No pending invites</p>
              <p style={{ fontSize: 12, marginTop: 4 }}>Invite a team member to get started</p>
            </div>
          )}

          {pendingInvites.map(inv => {
            const now = Date.now()
            const expired = now > inv.expiresAt
            const minsLeft = Math.max(0, Math.floor((inv.expiresAt - now) / 60_000))
            const timeLabel = minsLeft > 60 ? `${Math.floor(minsLeft / 60)}h ${minsLeft % 60}m left` : `${minsLeft}m left`

            return (
              <div key={inv.token} style={{ ...card, padding: '14px 16px', opacity: expired ? 0.55 : 1 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 36, height: 36, background: expired ? 'var(--bg-overlay)' : 'var(--accent-dim)', border: `1px solid ${expired ? 'var(--border-light)' : 'var(--accent-glow)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {expired ? <AlertCircle size={16} style={{ color: '#ef4444' }} /> : <Mail size={16} style={{ color: 'var(--accent)' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{inv.email}</span>
                      <span style={{ fontSize: 10, background: 'var(--bg-overlay)', color: 'var(--text-muted)', padding: '1px 7px', textTransform: 'capitalize', fontWeight: 600 }}>{inv.role}</span>
                      {expired
                        ? <span style={{ fontSize: 10, color: '#ef4444', background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)', padding: '1px 7px', fontWeight: 600 }}>EXPIRED</span>
                        : <span style={{ fontSize: 10, color: '#22c55e', background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.25)', padding: '1px 7px', fontWeight: 600 }}>ACTIVE</span>
                      }
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                      Invited by {inv.invitedBy} · {expired ? 'Expired' : timeLabel}
                    </p>
                    {!expired && (
                      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <code style={{ fontSize: 10, color: 'var(--text-secondary)', background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', padding: '4px 8px', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                          {inv.inviteUrl}
                        </code>
                        <button onClick={() => copyToClipboard(inv.inviteUrl, inv.token)} style={{ ...btnSecondary, padding: '5px 10px', flexShrink: 0 }}>
                          {copiedToken === inv.token ? <Check size={12} style={{ color: '#22c55e' }} /> : <Copy size={12} />}
                        </button>
                      </div>
                    )}
                  </div>
                  <button onClick={() => removePendingInvite(inv.token)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 4, display: 'flex', flexShrink: 0 }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}>
                    <X size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── INVITE MODAL ── */}
      {showInviteModal && (
        <div className="modal-backdrop-enter" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}>
          <div className="modal-enter" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', padding: 28, width: '100%', maxWidth: 460, boxShadow: 'var(--shadow-modal)' }}>

            {!inviteResult ? (
              <>
                {/* Form header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
                  <div>
                    <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Invite Team Member</h3>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>They'll receive a secure, single-use link valid for 48 hours.</p>
                  </div>
                  <button onClick={resetInviteModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={18} /></button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Email Address *</label>
                    <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleSendInvite() }}
                      placeholder="agent@company.com" autoFocus style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Role</label>
                    <select value={inviteRole} onChange={e => setInviteRole(e.target.value as any)} style={inputStyle}>
                      <option value="agent">Agent — Standard access</option>
                      <option value="manager">Manager — Can invite agents</option>
                      <option value="admin">Admin — Full access</option>
                    </select>
                  </div>

                  {/* Security note */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', padding: '10px 12px' }}>
                    <Shield size={13} style={{ color: 'var(--text-muted)', marginTop: 1, flexShrink: 0 }} />
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      Token is HMAC-SHA256 signed, single-use, and expires in 48 hours. It cannot be forged or reused.
                    </p>
                  </div>

                  {inviteError && (
                    <div style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)', padding: '10px 12px', fontSize: 13, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <AlertCircle size={13} /> {inviteError}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                    <button onClick={resetInviteModal} style={{ ...btnSecondary, flex: 1, justifyContent: 'center' }}>Cancel</button>
                    <button onClick={handleSendInvite} disabled={inviteLoading} style={{ ...btnPrimary, flex: 1, justifyContent: 'center', opacity: inviteLoading ? 0.7 : 1 }}>
                      {inviteLoading ? <><RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> Generating…</> : <><LinkIcon size={13} /> Generate Link</>}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* ── SUCCESS: show invite link ── */
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)' }}>Invite Link Ready</h3>
                  <button onClick={resetInviteModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={18} /></button>
                </div>

                {/* Success banner */}
                <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', padding: '12px 14px', marginBottom: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Check size={14} style={{ color: '#22c55e' }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#22c55e' }}>Token generated successfully</span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Invite for <strong style={{ color: 'var(--text-secondary)' }}>{inviteResult.email}</strong> as <strong style={{ color: 'var(--text-secondary)' }}>{inviteRole}</strong>
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                    <Clock size={11} style={{ color: 'var(--text-dim)' }} />
                    <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                      Expires {new Date(inviteResult.expires).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Invite URL */}
                <label style={{ display: 'block', fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
                  Share this link
                </label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                  <code style={{ flex: 1, fontSize: 11, color: 'var(--text-secondary)', background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', padding: '10px 12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                    {inviteResult.url}
                  </code>
                  <button onClick={() => copyToClipboard(inviteResult.url, 'main')} style={{ ...btnPrimary, padding: '10px 14px', flexShrink: 0 }}>
                    {copiedToken === 'main' ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
                  </button>
                </div>

                {/* Email via mailto */}
                <a href={`mailto:${inviteResult.email}?subject=You're invited to join Aqloa&body=Hi!%0A%0AYou've been invited to join our Aqloa team as a ${inviteRole}.%0A%0AClick here to create your account (link expires in 48 hours):%0A${encodeURIComponent(inviteResult.url)}%0A%0AThis is a secure, single-use link.`}
                  style={{ ...btnSecondary, width: '100%', justifyContent: 'center', textDecoration: 'none', marginBottom: 10 }}>
                  <Mail size={13} /> Open in Email Client
                </a>

                <button onClick={resetInviteModal} style={{ ...btnPrimary, width: '100%', justifyContent: 'center' }}>Done</button>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
