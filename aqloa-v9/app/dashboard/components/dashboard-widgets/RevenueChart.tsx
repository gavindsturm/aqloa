'use client'
import { TrendingUp } from 'lucide-react'

export default function RevenueChart() {
  const data = [
    { month: 'Aug', revenue: 82 },
    { month: 'Sep', revenue: 95 },
    { month: 'Oct', revenue: 110 },
    { month: 'Nov', revenue: 125 },
    { month: 'Dec', revenue: 118 },
    { month: 'Jan', revenue: 142 },
  ]
  const max = Math.max(...data.map(d => d.revenue))
  const min = Math.min(...data.map(d => d.revenue))
  const range = max - min || 1

  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: 0, padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Revenue Trend</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>Personal monthly performance</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>$142K</p>
          <p style={{ display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'flex-end', color: 'var(--accent)', fontSize: 12, fontWeight: 600, marginTop: 2 }}>
            <TrendingUp size={11} /> +8.2% vs last month
          </p>
        </div>
      </div>

      <div style={{ position: 'relative', height: 160 }}>
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(pct => (
          <div key={pct} style={{ position: 'absolute', left: 40, right: 0, top: `${(100 - pct)}%`, height: 1, background: 'var(--border)', opacity: 0.5 }} />
        ))}
        {/* Y labels */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 36, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', textAlign: 'right', paddingRight: 4 }}>
          <span>${max}K</span>
          <span>${Math.round((max + min) / 2)}K</span>
          <span>${min}K</span>
        </div>
        {/* Bars */}
        <div style={{ position: 'absolute', left: 40, right: 0, top: 0, bottom: 0, display: 'flex', alignItems: 'flex-end', gap: 6 }}>
          {data.map((item, i) => {
            const heightPct = ((item.revenue - min) / range) * 85 + 8
            const isCurrent = i === data.length - 1
            return (
              <div key={item.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: 4 }}>
                <div style={{ width: '100%', borderRadius: '4px 4px 2px 2px', height: `${heightPct}%`, position: 'relative',
                  background: isCurrent ? 'var(--accent)' : 'var(--bg-overlay)',
                  border: isCurrent ? '1px solid rgba(207,69,0,0.4)' : '1px solid var(--border-light)',
                  transition: 'opacity 0.15s', cursor: 'pointer',
                  
                }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                />
                <span style={{ fontSize: 10, color: isCurrent ? 'var(--accent)' : 'var(--text-muted)', fontWeight: isCurrent ? 700 : 400 }}>{item.month}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: 0, background: 'var(--bg-overlay)', border: '1px solid var(--border-strong)' }} />
          Prior months
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: 0, background: 'var(--accent)',  }} />
          Current month
        </div>
      </div>
    </div>
  )
}
