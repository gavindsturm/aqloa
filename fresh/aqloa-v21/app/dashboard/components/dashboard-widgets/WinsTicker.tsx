'use client'
import { useEffect, useState, useRef } from 'react'
import { TrendingUp } from 'lucide-react'

interface WinRecord {
  id: string
  agentName: string
  agentEmail: string
  leadName: string
  insuranceType: string
  annualPremium: number
  closedAt: number
}

const TYPE_SHORT: Record<string, string> = {
  'Final Expense': 'FEX',
  'Indexed Universal Life (IUL)': 'IUL',
  'Term Life': 'TERM',
  'Whole Life': 'WL',
  'Annuity': 'ANN',
  'Health Insurance': 'HLTH',
  'Mortgage Protection': 'MP',
  'Other': 'OTH',
}

const TYPE_COLOR: Record<string, string> = {
  'Final Expense': '#f59e0b',
  'Indexed Universal Life (IUL)': '#a78bfa',
  'Term Life': '#60a5fa',
  'Whole Life': '#34d399',
  'Annuity': '#06b6d4',
  'Health Insurance': '#ec4899',
  'Mortgage Protection': '#f97316',
  'Other': '#94a3b8',
}

function fmtPremium(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`
  return `$${n.toFixed(0)}`
}

function timeAgo(ts: number) {
  const mins = Math.floor((Date.now() - ts) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function WinsTicker() {
  const [wins, setWins] = useState<WinRecord[]>([])
  const [pos, setPos] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<number | null>(null)
  const speed = 0.6 // px per frame

  // Load + poll wins
  useEffect(() => {
    const load = () => {
      fetch('/api/wins')
        .then(r => r.json())
        .then(d => setWins((d.wins ?? []).slice(0, 30)))
        .catch(() => {})
    }
    load()
    const interval = setInterval(load, 15000)
    return () => clearInterval(interval)
  }, [])

  // Auto-scroll animation
  useEffect(() => {
    const track = trackRef.current
    if (!track || wins.length === 0) return

    const animate = () => {
      setPos(prev => {
        const half = track.scrollWidth / 2
        return prev >= half ? 0 : prev + speed
      })
      animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [wins.length])

  if (wins.length === 0) return null

  // Duplicate items for seamless loop
  const items = [...wins, ...wins]

  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-light)',
      borderLeft: '3px solid var(--accent)',
      overflow: 'hidden',
      height: 36,
      display: 'flex',
      alignItems: 'center',
    }}>
      {/* Label */}
      <div style={{
        flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '0 12px',
        borderRight: '1px solid var(--border)',
        height: '100%',
        background: 'var(--bg-surface)',
        zIndex: 2,
      }}>
        <TrendingUp size={11} style={{ color: 'var(--accent)' }} />
        <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
          TEAM WINS
        </span>
      </div>

      {/* Ticker track */}
      <div className="wins-ticker-scroll" style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <div
          ref={trackRef}
          className="wins-ticker-track"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 0,
            whiteSpace: 'nowrap',
            transform: `translateX(-${pos}px)`,
            willChange: 'transform',
          }}
        >
          {items.map((w, i) => {
            const color = TYPE_COLOR[w.insuranceType] ?? '#94a3b8'
            const short = TYPE_SHORT[w.insuranceType] ?? 'OTH'
            return (
              <div key={`${w.id}-${i}`} className="wins-ticker-item" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '0 20px',
                borderRight: '1px solid var(--border)',
                height: 36,
                flexShrink: 0,
              }}>
                {/* Type badge */}
                <span style={{
                  fontSize: 9, fontWeight: 800, padding: '1px 5px',
                  background: `${color}20`, color, border: `1px solid ${color}50`,
                  letterSpacing: '0.04em',
                }}>
                  {short}
                </span>
                {/* Agent + lead */}
                <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>
                  {w.agentName}
                </span>
                <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>closed</span>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{w.leadName}</span>
                {/* Premium */}
                <span style={{ fontSize: 12, fontWeight: 800, color: '#22c55e' }}>
                  {fmtPremium(w.annualPremium)}
                </span>
                {/* Time */}
                <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>{timeAgo(w.closedAt)}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
