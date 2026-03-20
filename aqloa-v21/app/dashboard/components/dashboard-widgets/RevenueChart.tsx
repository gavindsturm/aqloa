'use client'
import { TrendingUp } from 'lucide-react'

interface MonthData { date: string; revenue: number }
interface Props {
  totalRevenue?: number
  todayRevenue?: number
  history?: MonthData[]
}

const MONTH_NAMES: Record<string, string> = {
  '01':'Jan','02':'Feb','03':'Mar','04':'Apr','05':'May','06':'Jun',
  '07':'Jul','08':'Aug','09':'Sep','10':'Oct','11':'Nov','12':'Dec'
}

export default function RevenueChart({ totalRevenue = 0, todayRevenue = 0, history = [] }: Props) {
  // Build display data: last 6 months from history + current month
  const currentMonth = new Date().toISOString().substring(0, 7)
  const displayData: { label: string; value: number; isCurrent: boolean }[] = []

  // Fill history months
  const allMonths = [...history]
  // Add current month placeholder
  const currentInHistory = history.find(h => h.date === currentMonth)
  if (!currentInHistory) {
    allMonths.push({ date: currentMonth, revenue: todayRevenue })
  }

  // Take last 6
  const last6 = allMonths.slice(-6)
  last6.forEach(m => {
    const [, mm] = m.date.split('-')
    displayData.push({
      label: MONTH_NAMES[mm] ?? m.date,
      value: m.date === currentMonth ? (currentInHistory ? currentInHistory.revenue + todayRevenue : todayRevenue) : m.revenue,
      isCurrent: m.date === currentMonth,
    })
  })

  // Pad to 6 if less
  while (displayData.length < 6) {
    displayData.unshift({ label: '—', value: 0, isCurrent: false })
  }

  const max = Math.max(...displayData.map(d => d.value), 1)
  const currentMonthRevenue = displayData.find(d => d.isCurrent)?.value ?? 0
  const prevMonthRevenue = displayData.filter(d => !d.isCurrent).slice(-1)[0]?.value ?? 0
  const pctChange = prevMonthRevenue > 0 ? ((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue * 100).toFixed(1) : null

  const fmt = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(1)}K` : `$${n}`

  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: 0, padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Revenue Trend</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>Personal monthly performance</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>{fmt(totalRevenue)}</p>
          {pctChange !== null && (
            <p style={{ display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'flex-end', color: parseFloat(pctChange) >= 0 ? 'var(--accent)' : '#ef4444', fontSize: 12, fontWeight: 600, marginTop: 2 }}>
              <TrendingUp size={11} /> {parseFloat(pctChange) >= 0 ? '+' : ''}{pctChange}% vs last month
            </p>
          )}
          {pctChange === null && totalRevenue === 0 && (
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Close deals to track revenue</p>
          )}
        </div>
      </div>

      <div style={{ position: 'relative', height: 160 }}>
        {[0, 25, 50, 75, 100].map(pct => (
          <div key={pct} style={{ position: 'absolute', left: 40, right: 0, top: `${100 - pct}%`, height: 1, background: 'var(--border)', opacity: 0.5 }} />
        ))}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 36, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', textAlign: 'right', paddingRight: 4 }}>
          <span>{fmt(max)}</span>
          <span>{fmt(Math.round(max / 2))}</span>
          <span>$0</span>
        </div>
        <div style={{ position: 'absolute', left: 40, right: 0, top: 0, bottom: 0, display: 'flex', alignItems: 'flex-end', gap: 6 }}>
          {displayData.map((item, i) => {
            const heightPct = max > 0 ? ((item.value / max) * 85 + (item.value > 0 ? 5 : 0)) : 4
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: 4 }}>
                <div style={{ width: '100%', borderRadius: '4px 4px 2px 2px', height: `${heightPct}%`, background: item.isCurrent ? 'var(--accent)' : 'var(--bg-overlay)', border: item.isCurrent ? '1px solid rgba(207,69,0,0.4)' : '1px solid var(--border-light)', transition: 'opacity 0.15s', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                />
                <span style={{ fontSize: 10, color: item.isCurrent ? 'var(--accent)' : 'var(--text-muted)', fontWeight: item.isCurrent ? 700 : 400 }}>{item.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 10, height: 10, background: 'var(--bg-overlay)', border: '1px solid var(--border-strong)' }} />
          Prior months
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 10, height: 10, background: 'var(--accent)' }} />
          Current month
        </div>
      </div>
    </div>
  )
}
