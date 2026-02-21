'use client'
import { TrendingUp, TrendingDown } from 'lucide-react'

export default function CloseRateChart() {
  // Monthly close rate data
  const data = [
    { month: 'Aug', rate: 8.2 },
    { month: 'Sep', rate: 9.1 },
    { month: 'Oct', rate: 10.4 },
    { month: 'Nov', rate: 9.8 },
    { month: 'Dec', rate: 11.2 },
    { month: 'Jan', rate: 12.0 },
  ]

  const current = data[data.length - 1].rate
  const prev    = data[data.length - 2].rate
  const delta   = current - prev
  const pct     = ((delta / prev) * 100).toFixed(1)
  const isUp    = delta >= 0

  const min = Math.min(...data.map(d => d.rate))
  const max = Math.max(...data.map(d => d.rate))
  const range = max - min || 1

  // Build SVG polyline points
  const W = 280, H = 60, PAD = 6
  const points = data.map((d, i) => {
    const x = PAD + (i / (data.length - 1)) * (W - PAD * 2)
    const y = H - PAD - ((d.rate - min) / range) * (H - PAD * 2)
    return `${x},${y}`
  }).join(' ')

  const lastX = PAD + ((data.length - 1) / (data.length - 1)) * (W - PAD * 2)
  const lastY = H - PAD - ((data[data.length - 1].rate - min) / range) * (H - PAD * 2)

  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '18px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Close Rate</p>
          <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1, marginTop: 4 }}>{current}%</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, padding: '3px 8px', background: isUp ? 'rgba(34,197,94,0.10)' : 'rgba(239,68,68,0.10)', border: `1px solid ${isUp ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}` }}>
          {isUp ? <TrendingUp size={11} style={{ color: '#22c55e' }} /> : <TrendingDown size={11} style={{ color: '#ef4444' }} />}
          <span style={{ fontSize: 11, fontWeight: 700, color: isUp ? '#22c55e' : '#ef4444' }}>
            {isUp ? '+' : ''}{pct}%
          </span>
        </div>
      </div>

      {/* SVG line chart */}
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible', display: 'block' }}>
        {/* Grid lines */}
        {[0, 0.5, 1].map(t => (
          <line key={t}
            x1={PAD} y1={H - PAD - t * (H - PAD * 2)}
            x2={W - PAD} y2={H - PAD - t * (H - PAD * 2)}
            stroke="var(--border)" strokeWidth="1"
          />
        ))}
        {/* Area fill */}
        <defs>
          <linearGradient id="crgfill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon
          points={`${PAD},${H - PAD} ${points} ${W - PAD},${H - PAD}`}
          fill="url(#crgfill)"
        />
        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Dot on latest point */}
        <circle cx={lastX} cy={lastY} r="3" fill="var(--accent)" />
        <circle cx={lastX} cy={lastY} r="5.5" fill="var(--accent-glow)" />
      </svg>

      {/* Month labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        {data.map((d, i) => (
          <span key={d.month} style={{
            fontSize: 9, fontWeight: i === data.length - 1 ? 700 : 400,
            color: i === data.length - 1 ? 'var(--accent)' : 'var(--text-muted)',
            letterSpacing: '0.04em',
          }}>{d.month}</span>
        ))}
      </div>
    </div>
  )
}
