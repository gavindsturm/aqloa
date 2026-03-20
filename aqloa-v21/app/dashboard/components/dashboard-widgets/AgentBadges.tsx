'use client'
import { Award } from 'lucide-react'
import { RANK_TIERS, ALL_BADGES, getRank, getLevelFromXp, getXpProgress } from '../../lib/xpSystem'

interface Props {
  xp: number
  badges: string[]
}

export default function AgentBadges({ xp, badges }: Props) {
  const rank = getRank(xp)
  const level = getLevelFromXp(xp)
  const { earned, needed, pct } = getXpProgress(xp)
  const earnedBadgeDefs = ALL_BADGES.filter(b => badges.includes(b.id))

  // Next rank info
  const currentTierIdx = RANK_TIERS.findIndex(t => t.name === rank.name)
  const nextTier = RANK_TIERS[currentTierIdx + 1]
  const xpToNext = nextTier ? nextTier.min - xp : null

  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '18px 20px', height: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Award size={14} style={{ color: rank.color }} />
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', flex: 1 }}>Your Rank</h3>
      </div>

      {/* Rank display */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `${rank.color}15`, border: `2px solid ${rank.color}60`, fontSize: 22,
        }}>
          {rank.badge}
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: rank.color, letterSpacing: '-0.02em' }}>{rank.name}</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Level {level}</span>
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{xp.toLocaleString()} XP total</span>
        </div>
      </div>

      {/* XP progress bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>
            {nextTier ? `${xpToNext?.toLocaleString()} XP to ${nextTier.name}` : 'MAX RANK'}
          </span>
          <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>{earned} / {needed}</span>
        </div>
        <div style={{ height: 5, background: 'var(--bg-overlay)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: rank.color, transition: 'width 0.6s ease' }} />
        </div>
      </div>

      {/* Rank tier ladder */}
      <div style={{ display: 'flex', gap: 4 }}>
        {RANK_TIERS.map(t => {
          const isActive = t.name === rank.name
          const isPassed = xp >= t.min
          return (
            <div
              key={t.name}
              title={`${t.name} · ${t.min.toLocaleString()} XP`}
              style={{
                flex: 1, height: 4,
                background: isPassed ? t.color : 'var(--bg-overlay)',
                opacity: isActive ? 1 : isPassed ? 0.6 : 0.3,
                transition: 'all 0.3s',
              }}
            />
          )
        })}
      </div>

      {/* Earned badges */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
          Badges {earnedBadgeDefs.length > 0 && <span style={{ color: rank.color }}>· {earnedBadgeDefs.length} earned</span>}
        </p>
        {earnedBadgeDefs.length === 0 ? (
          <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>Close deals and hit goals to earn badges.</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {earnedBadgeDefs.map(b => (
              <span
                key={b.id}
                title={b.description}
                style={{
                  fontSize: 10, fontWeight: 700, padding: '3px 9px',
                  background: 'rgba(212,175,55,0.10)', color: '#d4af37',
                  border: '1px solid rgba(212,175,55,0.35)',
                  letterSpacing: '0.02em',
                }}
              >
                {b.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
