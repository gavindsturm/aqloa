'use client'
import { useState, useEffect } from 'react'

interface MonthData { month: string; spend: number; revenue: number }

const BASE_DATA: MonthData[] = [
  { month: 'Aug', spend: 0, revenue: 0 },
  { month: 'Sep', spend: 0, revenue: 0 },
  { month: 'Oct', spend: 0, revenue: 0 },
  { month: 'Nov', spend: 0, revenue: 0 },
  { month: 'Dec', spend: 0, revenue: 0 },
  { month: 'Jan', spend: 0, revenue: 0 },
]

function fmtK(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1000) return `$${Math.round(v / 1000)}K`
  return `$${v}`
}

function makePath(points: { x: number; y: number }[]) {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
}

export default function LeadSpendChart() {
  const [data, setData] = useState<MonthData[]>(BASE_DATA)
  const [hovered, setHovered] = useState<number | null>(null)

  useEffect(() => {
    // Read current month's lead spend from leads page
    const currentSpend = parseFloat(localStorage.getItem('leadSpend') || '0')
    // Read historical data if saved
    const saved = localStorage.getItem('leadSpendHistory')
    const history: MonthData[] = saved ? JSON.parse(saved) : BASE_DATA
    // Always update the last entry's spend to what's on the leads page
    const updated = [...history]
    updated[updated.length - 1] = { ...updated[updated.length - 1], spend: currentSpend }
    setData(updated)
  }, [])

  // Re-read spend from localStorage whenever window focuses (user edited it on leads tab)
  useEffect(() => {
    const onFocus = () => {
      const currentSpend = parseFloat(localStorage.getItem('leadSpend') || '0')
      setData(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { ...updated[updated.length - 1], spend: currentSpend }
        return updated
      })
    }
    window.addEventListener('focus', onFocus)
    // Also poll every 2s for same-tab updates
    const interval = setInterval(() => {
      const currentSpend = parseFloat(localStorage.getItem('leadSpend') || '0')
      setData(prev => {
        const last = prev[prev.length - 1]
        if (last.spend === currentSpend) return prev
        const updated = [...prev]
        updated[updated.length - 1] = { ...updated[updated.length - 1], spend: currentSpend }
        return updated
      })
    }, 1000)
    return () => { window.removeEventListener('focus', onFocus); clearInterval(interval) }
  }, [])

  const W = 440, H = 150, PL = 44, PR = 12, PT = 10, PB = 22
  const maxVal = Math.max(...data.map(d => Math.max(d.revenue, d.spend)), 1)
  const xStep  = (W - PL - PR) / (data.length - 1)

  const revPts   = data.map((d, i) => ({ x: PL + i * xStep, y: PT + (1 - d.revenue / maxVal) * (H - PT - PB) }))
  const spendPts = data.map((d, i) => ({ x: PL + i * xStep, y: PT + (1 - d.spend   / maxVal) * (H - PT - PB) }))

  const revPath   = makePath(revPts)
  const spendPath = makePath(spendPts)
  const areaPath  = `${revPath} L${revPts[revPts.length-1].x},${H-PB} L${revPts[0].x},${H-PB} Z`

  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0)
  const totalSpend   = data.reduce((s, d) => s + d.spend, 0)
  const lastSpend    = data[data.length - 1].spend
  const lastRevenue  = data[data.length - 1].revenue
  const roi          = lastSpend > 0 ? (lastRevenue / lastSpend).toFixed(1) : '—'

  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Lead Spend vs Revenue</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            ROI this month: <span style={{ color: '#22c55e', fontWeight: 700 }}>{roi}{roi !== '—' ? '×' : ''}</span>
            <span style={{ color: 'var(--text-dim)', fontSize: 11, marginLeft: 8 }}>· Edit spend on the Leads page</span>
          </p>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
        {[
          { label: 'Revenue',  value: totalRevenue > 0 ? fmtK(totalRevenue) : '—', color: '#22c55e' },
          { label: 'Spend',    value: totalSpend > 0   ? fmtK(totalSpend)   : '—', color: '#f59e0b' },
          { label: 'Profit',   value: totalRevenue > 0 || totalSpend > 0 ? fmtK(totalRevenue - totalSpend) : '—', color: 'var(--accent)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg-elevated)', padding: '7px 10px', border: '1px solid var(--border-light)' }}>
            <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{s.label}</p>
            <p style={{ fontSize: 14, fontWeight: 800, color: s.color, letterSpacing: '-0.02em' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* SVG line chart */}
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible', display: 'block' }}>
        <defs>
          <linearGradient id="revAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines + Y labels */}
        {[0, 0.25, 0.5, 0.75, 1].map(frac => {
          const y = PT + frac * (H - PT - PB)
          return (
            <g key={frac}>
              <line x1={PL} y1={y} x2={W - PR} y2={y} stroke="var(--border)" strokeWidth="1" opacity="0.4" />
              <text x={PL - 4} y={y + 3} fontSize="9" fill="var(--text-dim)" textAnchor="end">{fmtK(maxVal * (1 - frac))}</text>
            </g>
          )
        })}

        {/* Revenue area */}
        <path d={areaPath} fill="url(#revAreaGrad)" />

        {/* Lines */}
        <path d={spendPath} fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6,3" strokeLinecap="round" strokeLinejoin="round" />
        <path d={revPath}   fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Points + hover */}
        {data.map((d, i) => {
          const rx = revPts[i].x, ry = revPts[i].y
          const sx = spendPts[i].x, sy = spendPts[i].y
          const isHov = hovered === i
          const isLast = i === data.length - 1

          return (
            <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} style={{ cursor: 'default' }}>
              <rect x={rx - xStep / 2} y={PT} width={xStep} height={H - PT - PB} fill="transparent" />
              {isHov && <line x1={rx} y1={PT} x2={rx} y2={H - PB} stroke="var(--border-strong)" strokeWidth="1" strokeDasharray="3,2" />}

              <circle cx={rx} cy={ry} r={isHov || isLast ? 4 : 3} fill="#22c55e" stroke="var(--bg-surface)" strokeWidth="2" />
              <circle cx={sx} cy={sy} r={isHov || isLast ? 4 : 2.5} fill="#f59e0b" stroke="var(--bg-surface)" strokeWidth="2" />

              {isHov && d.revenue > 0 && (
                <g>
                  <rect x={rx - 44} y={ry - 48} width={88} height={42} rx="3" fill="var(--bg-elevated)" stroke="var(--border-strong)" strokeWidth="1" />
                  <text x={rx} y={ry - 31} fontSize="10" fill="#22c55e" textAnchor="middle" fontWeight="700">{fmtK(d.revenue)}</text>
                  <text x={rx} y={ry - 17} fontSize="10" fill="#f59e0b" textAnchor="middle">{d.spend > 0 ? fmtK(d.spend) : 'no spend'}</text>
                </g>
              )}

              <text x={rx} y={H - 4} fontSize="9" fill={isLast ? 'var(--text-secondary)' : 'var(--text-dim)'} textAnchor="middle" fontWeight={isLast ? '700' : '400'}>{d.month}</text>
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <svg width="20" height="3"><line x1="0" y1="1.5" x2="20" y2="1.5" stroke="#22c55e" strokeWidth="2.5" /></svg>
          Revenue
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <svg width="20" height="3"><line x1="0" y1="1.5" x2="20" y2="1.5" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4,3" /></svg>
          Lead Spend
        </div>
      </div>
    </div>
  )
}
