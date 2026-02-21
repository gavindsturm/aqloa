'use client'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

interface Stat {
  label: string
  value: string | number
  icon: LucideIcon
  change?: string      // e.g. "+12%" or "-3.1%" — sign determines color
  changeSuffix?: string // e.g. "this month"
}
interface Props { stats: Stat[] }

function ChangeChip({ change, suffix = 'this month' }: { change: string; suffix?: string }) {
  const isPositive = change.startsWith('+')
  const isNegative = change.startsWith('-')
  const color  = isPositive ? '#22c55e' : isNegative ? '#ef4444' : 'var(--text-muted)'
  const bg     = isPositive ? 'rgba(34,197,94,0.10)' : isNegative ? 'rgba(239,68,68,0.10)' : 'transparent'
  const border = isPositive ? 'rgba(34,197,94,0.25)' : isNegative ? 'rgba(239,68,68,0.25)' : 'transparent'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 8 }}>
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 3,
        fontSize: 11, fontWeight: 700, color,
        padding: '2px 6px', background: bg, border: `1px solid ${border}`,
      }}>
        {isPositive ? <TrendingUp size={10} /> : isNegative ? <TrendingDown size={10} /> : null}
        {change}
      </span>
      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{suffix}</span>
    </div>
  )
}

export default function StatsOverview({ stats }: Props) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${stats.length}, 1fr)`, gap: 12 }}>
      {stats.map((stat, idx) => {
        const Icon = stat.icon
        return (
          <div key={idx} style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            padding: '18px 20px', transition: 'border-color 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{stat.label}</p>
                <p style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: 26, marginTop: 6, letterSpacing: '-0.03em', lineHeight: 1 }}>{stat.value}</p>
                {stat.change && <ChangeChip change={stat.change} suffix={stat.changeSuffix} />}
              </div>
              <div style={{ width: 36, height: 36, background: 'var(--bg-overlay)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={16} style={{ color: 'var(--text-muted)' }} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
