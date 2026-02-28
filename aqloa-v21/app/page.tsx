'use client'
import Link from 'next/link'

export default function Home() {
  return (
    <div style={{ height: '100vh', position: 'relative', overflow: 'hidden', background: '#000', display: 'flex', flexDirection: 'column' }}>

      <img src="/hero-nature.avif" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', pointerEvents: 'none', userSelect: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.94) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.22) 100%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 58%, rgba(0,0,0,0.35) 0%, transparent 100%)', pointerEvents: 'none' }} />

      {/* Top nav — logo only, no sign in button */}
      <header style={{ position: 'relative', zIndex: 10, flexShrink: 0, display: 'flex', alignItems: 'center', padding: '22px 48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 7L7 2L12 7L7 12L2 7Z" fill="#000" /></svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: 17, color: '#fff', letterSpacing: '-0.03em' }}>Aqloa</span>
        </div>
      </header>

      {/* Hero content */}
      <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 24px 20px', overflow: 'hidden' }}>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 24, height: 1, background: '#fff' }} />
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#fff' }}>Sales Intelligence Platform</span>
          <div style={{ width: 24, height: 1, background: '#fff' }} />
        </div>

        <h1 style={{ fontSize: 'clamp(52px, 9vw, 108px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', lineHeight: 0.9, marginBottom: 20, textShadow: '0 4px 50px rgba(0,0,0,0.6)' }}>
          Aqloa
        </h1>

        <p style={{ fontSize: 'clamp(15px, 1.8vw, 20px)', fontWeight: 300, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.01em', marginBottom: 10, maxWidth: 440, lineHeight: 1.5 }}>
          Every deal. Every day. Closed.
        </p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.44)', marginBottom: 36, maxWidth: 360, lineHeight: 1.7 }}>
          Manage leads, calculate premiums, and grow your team — all in one place.
        </p>

        {/* CTAs — Get Started → signup, Sign In → login */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/signup">
            <button
              style={{ background: '#fff', color: '#000', fontWeight: 700, fontSize: 13, letterSpacing: '0.04em', padding: '13px 38px', border: '2px solid #fff', cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >Get Started →</button>
          </Link>
          <Link href="/login">
            <button
              style={{ background: 'transparent', color: '#fff', fontWeight: 600, fontSize: 13, letterSpacing: '0.04em', padding: '13px 38px', border: '2px solid rgba(255,255,255,0.30)', cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.70)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.30)')}
            >Sign In</button>
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', marginTop: 48, borderTop: '1px solid rgba(255,255,255,0.14)', paddingTop: 24 }}>
          {[
            { value: '94%', label: 'Close Rate Improvement' },
            { value: '3.2×', label: 'More Appointments Set' },
            { value: '$2.1M', label: 'Avg. Agent Revenue' },
          ].map((s, i) => (
            <div key={s.value} style={{ padding: '0 36px', textAlign: 'center', borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.14)' : 'none' }}>
              <div style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.40)', marginTop: 6, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 16, left: 48, zIndex: 10, fontSize: 11, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.04em' }}>
        © 2025 Aqloa
      </div>
    </div>
  )
}
