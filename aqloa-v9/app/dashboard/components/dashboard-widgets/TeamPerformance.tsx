'use client'
import { Trophy } from 'lucide-react'
import { useTeam } from '../../context/TeamContext'
import { TeamMember } from '../../types'

interface Props { currentUser?: string; profilePic?: string; teamMembers?: TeamMember[] }

const RANK_STYLE = [
  { border: 'var(--accent-glow)', bg: 'var(--accent-dim)',           text: 'var(--accent)', medal: '🥇' },
  { border: 'rgba(160,174,192,0.4)', bg: 'rgba(160,174,192,0.07)',   text: '#94a3b8',       medal: '🥈' },
  { border: 'rgba(196,150,80,0.4)',  bg: 'rgba(196,150,80,0.07)',    text: '#cd9740',       medal: '🥉' },
]

const PERIOD_LABELS: Record<string, string> = { month: 'This Month', quarter: 'This Quarter', all: 'All Time' }

export default function TeamPerformance({ currentUser, profilePic }: Props) {
  const { leaderboard, leaderboardPeriod, setLeaderboardPeriod } = useTeam()

  const myRank = leaderboard.findIndex(m => m.email === currentUser)
  let displayList = leaderboard.slice(0, 8)
  if (myRank >= 8) {
    displayList = [...leaderboard.slice(0, 7), leaderboard[myRank]]
  }
  const maxRevenue = leaderboard[0]?.revenue || 1

  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: 20, height: 520, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <Trophy size={14} style={{ color: '#cd9740' }} />
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', flex: 1 }}>Leaderboard</h3>
        <div style={{ display: 'flex', background: 'var(--bg-elevated)', border: '1px solid var(--border-light)' }}>
          {(['month', 'quarter', 'all'] as const).map(p => (
            <button key={p} onClick={() => setLeaderboardPeriod(p)} style={{
              padding: '4px 10px', fontSize: 10, fontWeight: 600, border: 'none', cursor: 'pointer',
              background: leaderboardPeriod === p ? 'var(--accent)' : 'transparent',
              color: leaderboardPeriod === p ? 'var(--accent-fg)' : 'var(--text-muted)',
              transition: 'all 0.15s', letterSpacing: '0.04em',
            }}>{p === 'all' ? 'All' : p === 'month' ? 'Month' : 'Quarter'}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto', flex: 1 }}>
        {displayList.map((member, idx) => {
          const rc = RANK_STYLE[idx]
          const isMe = member.email === currentUser
          const initials = member.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
          const barPct = (member.revenue / maxRevenue) * 100
          const showSeparator = myRank >= 8 && idx === displayList.length - 1

          return (
            <div key={member.id}>
              {showSeparator && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '4px 0 8px' }}>
                  <div style={{ flex: 1, borderTop: '1px dashed var(--border-strong)' }} />
                  <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>· · ·</span>
                  <div style={{ flex: 1, borderTop: '1px dashed var(--border-strong)' }} />
                </div>
              )}
              <div style={{
                padding: '10px 12px',
                border: `1px solid ${rc ? rc.border : isMe ? 'var(--accent-glow)' : 'var(--border)'}`,
                background: rc ? rc.bg : isMe ? 'var(--accent-dim)' : 'transparent',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 22, textAlign: 'center', flexShrink: 0, fontSize: rc ? 14 : 11, fontWeight: 700, color: rc ? rc.text : 'var(--text-muted)' }}>
                    {rc ? rc.medal : `#${idx + 1}`}
                  </div>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-overlay)', border: `1.5px solid ${rc ? rc.border : 'var(--border-strong)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>
                    {isMe && profilePic ? <img src={profilePic} alt="av" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.name}</span>
                      {isMe && <span style={{ fontSize: 9, background: 'var(--accent)', color: 'var(--accent-fg)', fontWeight: 700, padding: '1px 5px', flexShrink: 0 }}>YOU</span>}
                      <span style={{ fontSize: 10, color: 'var(--text-dim)', marginLeft: 'auto', flexShrink: 0 }}>{member.closed} closed</span>
                    </div>
                    <div style={{ height: 3, background: 'var(--bg-overlay)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${barPct}%`, background: rc ? rc.text : isMe ? 'var(--accent)' : 'var(--border-strong)', transition: 'width 0.8s ease' }} />
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 8 }}>
                    <p style={{ fontSize: 14, fontWeight: 800, color: rc ? rc.text : isMe ? 'var(--accent)' : 'var(--text-primary)', letterSpacing: '-0.02em' }}>${(member.revenue / 1000).toFixed(0)}K</p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <p style={{ fontSize: 10, color: 'var(--text-dim)', textAlign: 'right', marginTop: 10, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        {PERIOD_LABELS[leaderboardPeriod]}
      </p>
    </div>
  )
}
