'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Eye, EyeOff, Zap, AlertCircle, CheckCircle } from 'lucide-react'

export default function Signup() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) { setError('Please enter your full name.'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name.trim(), email: form.email.trim().toLowerCase(), password: form.password }),
      })
      const data = await res.json()
      if (!data.success) { setError(data.error ?? 'Sign up failed.'); setLoading(false); return }
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('userEmail', data.email)
      setDone(true)
      setTimeout(() => router.push('/dashboard'), 1500)
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  const inp: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
    color: '#fff', padding: '10px 14px', fontSize: 13, borderRadius: 0, outline: 'none',
  }
  const lbl: React.CSSProperties = { display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d10', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 380 }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36, justifyContent: 'center' }}>
          <div style={{ width: 30, height: 30, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={15} color="#000" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 18, color: '#fff', letterSpacing: '-0.03em' }}>Aqloa</span>
        </div>

        {done ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <CheckCircle size={40} style={{ color: '#22c55e', margin: '0 auto 16px' }} />
            <p style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Account created!</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>Taking you to your dashboard…</p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: 6 }}>Create your account</h1>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Start managing your sales team today</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={lbl}>Full Name</label>
                <input type="text" value={form.name} onChange={set('name')} placeholder="Jane Smith" required autoFocus style={inp} />
              </div>
              <div>
                <label style={lbl}>Email</label>
                <input type="email" value={form.email} onChange={set('email')} placeholder="you@company.com" required style={inp} />
              </div>
              <div>
                <label style={lbl}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPass ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="Min. 8 characters" required style={{ ...inp, paddingRight: 42 }} />
                  <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', display: 'flex' }}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div>
                <label style={lbl}>Confirm Password</label>
                <input type="password" value={form.confirm} onChange={set('confirm')} placeholder="Repeat password" required style={inp}
                  onKeyDown={e => { if (e.key === 'Enter') handleSubmit(e as any) }} />
              </div>

              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)', padding: '10px 12px', fontSize: 13, color: '#ef4444' }}>
                  <AlertCircle size={13} /> {error}
                </div>
              )}

              <button type="submit" disabled={loading} style={{
                width: '100%', background: loading ? 'rgba(255,255,255,0.1)' : '#fff',
                color: loading ? 'rgba(255,255,255,0.4)' : '#000',
                fontWeight: 700, padding: '12px 16px', fontSize: 14, border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4,
              }}>
                {loading ? 'Creating account…' : <><span>Get Started</span><ArrowRight size={15} /></>}
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.35)', marginTop: 24 }}>
              Already have an account?{' '}
              <Link href="/login" style={{ color: '#fff', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
