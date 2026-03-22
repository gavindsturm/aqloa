'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, XCircle, Clock, Loader, Eye, EyeOff, UserPlus, Shield } from 'lucide-react'

interface InviteInfo {
  valid: boolean
  email?: string
  role?: string
  invitedByName?: string
  expiresAt?: number
  minutesRemaining?: number
  reason?: string
  message?: string
}

function JoinPageInner() {
  const router = useRouter()
  const params = useSearchParams()
  const token = params.get('token') ?? ''

  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({ name: '', password: '', confirm: '' })

  useEffect(() => {
    if (!token) { setLoading(false); return }
    fetch(`/api/invite/${encodeURIComponent(token)}`)
      .then(r => r.json())
      .then(data => { setInviteInfo(data); setLoading(false) })
      .catch(() => { setInviteInfo({ valid: false, reason: 'not_found', message: 'Could not reach the server.' }); setLoading(false) })
  }, [token])

  const handleAccept = async () => {
    setError('')
    if (!form.name.trim()) { setError('Please enter your full name.'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/invite/${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, password: form.password }),
      })
      const data = await res.json()
      if (!data.success) { setError(data.error ?? data.reason ?? 'Something went wrong.'); setSubmitting(false); return }

      // Save new member to shared Redis store so everyone sees them
      await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data.member),
      })
      // Store auth in localStorage for this browser session
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('userEmail', data.member.email)
      localStorage.setItem('orgId', data.member.orgId)
      setDone(true)
      setTimeout(() => router.push('/dashboard'), 2200)
    } catch {
      setError('Network error. Please try again.')
      setSubmitting(false)
    }
  }

  const roleLabel: Record<string, string> = { agent: 'Agent', manager: 'Manager', admin: 'Administrator' }
  const expiryLabel = inviteInfo?.minutesRemaining != null
    ? inviteInfo.minutesRemaining > 60
      ? `${Math.floor(inviteInfo.minutesRemaining / 60)}h ${inviteInfo.minutesRemaining % 60}m remaining`
      : `${inviteInfo.minutesRemaining} minutes remaining`
    : ''

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px', fontSize: 14, borderRadius: 0,
    background: 'var(--bg-elevated)', border: '1px solid var(--border-light)',
    color: 'var(--text-primary)', outline: 'none',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 440 }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36, justifyContent: 'center' }}>
          <div style={{ width: 30, height: 30, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 7L7 2L12 7L7 12L2 7Z" fill="var(--accent-fg)" /></svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>Aqloa</span>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', padding: 32 }}>

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
              <Loader size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
              <p style={{ fontSize: 14 }}>Validating invite…</p>
            </div>
          )}

          {/* No token */}
          {!loading && !token && (
            <div style={{ textAlign: 'center' }}>
              <XCircle size={36} style={{ color: '#ef4444', margin: '0 auto 12px' }} />
              <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>No invite token</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>This link is missing a token. Ask your manager for a new invite link.</p>
            </div>
          )}

          {/* Invalid token */}
          {!loading && token && inviteInfo && !inviteInfo.valid && (
            <div style={{ textAlign: 'center' }}>
              <XCircle size={36} style={{ color: '#ef4444', margin: '0 auto 12px' }} />
              <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                {inviteInfo.reason === 'expired' ? 'Invite Expired' :
                 inviteInfo.reason === 'already_used' ? 'Already Used' : 'Invalid Invite'}
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{inviteInfo.message}</p>
              <p style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 16 }}>Contact your manager to receive a new invite link.</p>
            </div>
          )}

          {/* Success - account created */}
          {done && (
            <div style={{ textAlign: 'center' }}>
              <CheckCircle size={36} style={{ color: '#22c55e', margin: '0 auto 12px' }} />
              <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Account Created!</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Redirecting you to the dashboard…</p>
            </div>
          )}

          {/* Valid - show join form */}
          {!loading && !done && token && inviteInfo?.valid && (
            <>
              {/* Invite banner */}
              <div style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-glow)', padding: '14px 16px', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <UserPlus size={14} style={{ color: 'var(--accent)' }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Team Invite</span>
                </div>
                <p style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 600 }}>
                  {inviteInfo.invitedByName} invited you to join as <span style={{ color: 'var(--accent)' }}>{roleLabel[inviteInfo.role!] ?? inviteInfo.role}</span>
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>For: {inviteInfo.email}</p>
                {expiryLabel && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                    <Clock size={11} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{expiryLabel}</span>
                  </div>
                )}
              </div>

              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4, letterSpacing: '-0.02em' }}>Create your account</h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 22 }}>Set up your Aqloa account to get started.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Full Name</label>
                  <input style={inputStyle} type="text" placeholder="Jane Smith" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoFocus />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Email</label>
                  <input style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }} type="email" value={inviteInfo.email} readOnly />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input style={{ ...inputStyle, paddingRight: 42 }} type={showPass ? 'text' : 'password'} placeholder="Min. 8 characters" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                    <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Confirm Password</label>
                  <input style={inputStyle} type="password" placeholder="Repeat password" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                    onKeyDown={e => { if (e.key === 'Enter') handleAccept() }} />
                </div>

                {error && (
                  <div style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)', padding: '10px 12px', fontSize: 13, color: '#ef4444' }}>
                    {error}
                  </div>
                )}

                <button onClick={handleAccept} disabled={submitting} style={{
                  width: '100%', padding: '13px', fontSize: 14, fontWeight: 700,
                  background: submitting ? 'var(--bg-overlay)' : 'var(--accent)',
                  color: submitting ? 'var(--text-muted)' : 'var(--accent-fg)',
                  border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4,
                }}>
                  {submitting ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Creating account…</> : 'Join Team →'}
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 18, justifyContent: 'center' }}>
                <Shield size={11} style={{ color: 'var(--text-dim)' }} />
                <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>This link is single-use and expires in 48 hours</span>
              </div>
            </>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Loading…</div>}>
      <JoinPageInner />
    </Suspense>
  )
}
