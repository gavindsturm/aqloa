'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Eye, EyeOff, Zap, AlertCircle, TrendingUp, Users, Shield } from 'lucide-react'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      })
      const data = await res.json()
      if (!data.success) { setError(data.error ?? 'Login failed.'); setLoading(false); return }
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('userEmail', data.email)
      router.push('/dashboard')
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  const inp: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
    color: '#fff', borderRadius: 0, padding: '10px 14px', fontSize: 13,
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#000' }}>
      {/* Left panel — hidden on small screens */}
      <div style={{ width: 400, flexShrink: 0, background: '#0a0a0a', borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '40px 36px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
            <div style={{ width: 32, height: 32, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={16} color="#000" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, color: '#fff', letterSpacing: '-0.03em' }}>Aqloa</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 500, letterSpacing: '0.04em' }}>SALES INTELLIGENCE</div>
            </div>
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: 12 }}>
            The platform built for insurance professionals
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
            Manage leads, calculate premiums, and grow your team — all in one place.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {[
            { stat: '94%', label: 'Close rate improvement', icon: TrendingUp },
            { stat: '3.2×', label: 'More appointments set', icon: Users },
            { stat: '$2.1M', label: 'Average agent revenue', icon: Shield },
          ].map(({ stat, label, icon: Icon }) => (
            <div key={stat} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={16} style={{ color: '#fff' }} />
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>{stat}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>{label}</div>
              </div>
            </div>
          ))}
        </div>
        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>© 2025 Aqloa. All rights reserved.</p>
      </div>

      {/* Right form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#0d0d10' }}>
        <div style={{ width: '100%', maxWidth: 360 }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: 6 }}>Welcome back</h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required autoFocus style={inp} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={{ ...inp, paddingRight: 42 }} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', display: 'flex' }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)', padding: '10px 12px', fontSize: 13, color: '#ef4444' }}>
                <AlertCircle size={13} /> {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', background: loading ? 'rgba(255,255,255,0.1)' : '#fff',
              color: loading ? 'rgba(255,255,255,0.4)' : '#000',
              fontWeight: 700, padding: '11px 16px', fontSize: 14, border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4,
            }}>
              {loading ? 'Signing in…' : <><span>Sign In</span><ArrowRight size={15} /></>}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.35)', marginTop: 24 }}>
            New to Aqloa?{' '}
            <Link href="/signup" style={{ color: '#fff', fontWeight: 600, textDecoration: 'none' }}>Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
