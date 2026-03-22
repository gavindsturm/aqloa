'use client'
import { getRank } from '../lib/xpSystem'

interface Props {
  xp?: number
  size?: 'xs' | 'sm' | 'md'
}

export default function RankBadge({ xp = 0, size = 'xs' }: Props) {
  const rank = getRank(xp)
  const fontSize = size === 'md' ? 10 : size === 'sm' ? 9 : 8
  const padding = size === 'md' ? '2px 7px' : size === 'sm' ? '1px 6px' : '1px 4px'

  return (
    <span
      title={`${rank.name} · ${xp} XP`}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 3,
        fontSize, fontWeight: 800, padding,
        background: `${rank.color}20`,
        color: rank.color,
        border: `1px solid ${rank.color}50`,
        letterSpacing: '0.03em',
        flexShrink: 0,
        lineHeight: 1.4,
      }}
    >
      {rank.badge} {rank.name.toUpperCase()}
    </span>
  )
}
