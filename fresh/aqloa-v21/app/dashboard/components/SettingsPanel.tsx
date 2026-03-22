'use client'
import { useState, useEffect } from 'react'
import { X, User, Bell, Calendar, Lock, Save, Check, ChevronRight, Palette, Moon, Sun } from 'lucide-react'
import { useTheme, ACCENT_COLORS, ThemeMode, AccentKey } from '../../context/ThemeContext'

interface Props {
  isOpen: boolean
  onClose: () => void
  currentUser: string
  onOpenProfile?: () => void
}

const DEFAULT_SETTINGS = {
  timezone: 'America/New_York',
  emailNotifications: true,
  smsNotifications: false,
  desktopNotifications: true,
  newLeadAlerts: true,
  appointmentReminders: true,
  teamUpdates: false,
  defaultView: 'all',
  weekStartsOn: 'sunday',
  defaultDuration: 60,
  autoAcceptShared: false,
  shareCalendar: true,
  showInDirectory: true,
  allowDirectMessages: true,
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        position: 'relative', display: 'inline-flex', alignItems: 'center',
        width: 36, height: 20, flexShrink: 0, cursor: 'pointer',
        background: checked ? 'var(--accent)' : 'var(--bg-overlay)',
        border: '1px solid var(--border-light)',
        transition: 'background 0.2s',
      }}
    >
      <span style={{
        position: 'absolute',
        width: 14, height: 14,
        background: 'var(--bg-surface)',
        left: checked ? 18 : 2,
        transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }} />
    </button>
  )
}

const SectionHeader = ({ icon: Icon, label }: { icon: any; label: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
    <Icon size={14} style={{ color: 'var(--text-muted)' }} />
    <h3 style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.10em' }}>{label}</h3>
  </div>
)

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
    <span style={{ fontSize: 13, color: 'var(--text-muted)', width: 140, flexShrink: 0 }}>{label}</span>
    {children}
  </div>
)

const CheckRow = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
    <Toggle checked={checked} onChange={onChange} />
  </div>
)

const StyledSelect = ({ value, onChange, options }: { value: string | number; onChange: (v: string) => void; options: [string | number, string][] }) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    style={{
      flex: 1, padding: '7px 32px 7px 10px', fontSize: 12,
      background: 'var(--bg-elevated)', color: 'var(--text-primary)',
      border: '1px solid var(--border-light)',
    }}
  >
    {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
  </select>
)

export default function SettingsPanel({ isOpen, onClose, currentUser, onOpenProfile }: Props) {
  const { mode, accentKey, setMode, setAccent } = useTheme()
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [saved, setSaved] = useState(false)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    const s = localStorage.getItem('appSettings')
    if (s) setSettings(JSON.parse(s))
  }, [])

  const update = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setDirty(true); setSaved(false)
  }

  const handleSave = () => {
    localStorage.setItem('appSettings', JSON.stringify(settings))
    setSaved(true); setDirty(false)
    setTimeout(() => setSaved(false), 2500)
  }

  const sectionStyle: React.CSSProperties = { marginBottom: 28 }
  const dividerStyle: React.CSSProperties = { height: 1, background: 'var(--border)', margin: '8px 0 14px' }

  return (
    <div className={`panel-slide-right ${isOpen ? 'open' : 'closed'}`}>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Settings</h2>
          <button onClick={onClose} style={{ padding: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

          {/* ── APPEARANCE ── */}
          <div style={sectionStyle}>
            <SectionHeader icon={Palette} label="Appearance" />

            {/* Dark / Light Mode */}
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Mode</p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
              {(['dark', 'light'] as ThemeMode[]).map(m => {
                const active = mode === m
                return (
                  <button key={m} onClick={() => setMode(m)} style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '10px 0', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                    background: active ? 'var(--accent)' : 'var(--bg-elevated)',
                    color: active ? 'var(--accent-fg)' : 'var(--text-secondary)',
                    border: active ? '1px solid var(--accent)' : '1px solid var(--border-light)',
                    transition: 'all 0.15s',
                  }}>
                    {m === 'dark' ? <Moon size={13} /> : <Sun size={13} />}
                    {m === 'dark' ? 'Dark' : 'Light'}
                  </button>
                )
              })}
            </div>

            {/* Accent Color */}
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>Accent Color</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {ACCENT_COLORS.map(c => {
                const active = accentKey === c.key
                return (
                  <button key={c.key} onClick={() => setAccent(c.key as AccentKey)} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    padding: '10px 6px', cursor: 'pointer',
                    background: active ? 'var(--bg-elevated)' : 'transparent',
                    border: active ? `2px solid ${c.hex}` : '2px solid var(--border)',
                    transition: 'all 0.15s',
                  }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = 'var(--border-strong)' }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = 'var(--border)' }}
                  >
                    <div style={{ width: 22, height: 22, background: c.hex, position: 'relative' }}>
                      {active && (
                        <div style={{
                          position: 'absolute', inset: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Check size={12} color={c.fg} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: 10, color: active ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: active ? 700 : 400, letterSpacing: '0.02em' }}>
                      {c.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div style={dividerStyle} />

          {/* ── PROFILE ── */}
          <div style={sectionStyle}>
            <SectionHeader icon={User} label="Profile" />
            <button
              onClick={() => { onOpenProfile?.(); onClose() }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px', cursor: 'pointer', marginBottom: 14,
                background: 'var(--bg-elevated)', border: '1px solid var(--border-light)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, background: 'var(--bg-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={14} style={{ color: 'var(--text-muted)' }} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{currentUser.split('@')[0]}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>Edit photo, name, bio & contact</p>
                </div>
              </div>
              <ChevronRight size={14} style={{ color: 'var(--text-dim)' }} />
            </button>
            <Row label="Timezone">
              <StyledSelect value={settings.timezone} onChange={v => update('timezone', v)} options={[
                ['America/New_York', 'Eastern Time'],
                ['America/Chicago', 'Central Time'],
                ['America/Denver', 'Mountain Time'],
                ['America/Los_Angeles', 'Pacific Time'],
              ]} />
            </Row>
          </div>

          <div style={dividerStyle} />

          {/* ── NOTIFICATIONS ── */}
          <div style={sectionStyle}>
            <SectionHeader icon={Bell} label="Notifications" />
            {[
              { key: 'emailNotifications',    label: 'Email Notifications' },
              { key: 'smsNotifications',       label: 'SMS Notifications' },
              { key: 'desktopNotifications',   label: 'Desktop Notifications' },
              { key: 'newLeadAlerts',          label: 'New Lead Alerts' },
              { key: 'appointmentReminders',   label: 'Appointment Reminders' },
              { key: 'teamUpdates',            label: 'Team Updates' },
            ].map(({ key, label }) => (
              <CheckRow key={key} label={label} checked={(settings as any)[key]} onChange={v => update(key, v)} />
            ))}
          </div>

          <div style={dividerStyle} />

          {/* ── CALENDAR ── */}
          <div style={sectionStyle}>
            <SectionHeader icon={Calendar} label="Calendar" />
            <Row label="Default View">
              <StyledSelect value={settings.defaultView} onChange={v => update('defaultView', v)} options={[
                ['all', 'All Appointments'], ['shared', 'Shared Only'], ['personal', 'Personal Only'],
              ]} />
            </Row>
            <Row label="Week Starts">
              <StyledSelect value={settings.weekStartsOn} onChange={v => update('weekStartsOn', v)} options={[
                ['sunday', 'Sunday'], ['monday', 'Monday'],
              ]} />
            </Row>
            <Row label="Apt. Duration">
              <StyledSelect value={settings.defaultDuration} onChange={v => update('defaultDuration', v)} options={[
                [30, '30 minutes'], [45, '45 minutes'], [60, '1 hour'], [90, '1.5 hours'], [120, '2 hours'],
              ]} />
            </Row>
            <CheckRow label="Auto-accept shared" checked={settings.autoAcceptShared} onChange={v => update('autoAcceptShared', v)} />
          </div>

          <div style={dividerStyle} />

          {/* ── PRIVACY ── */}
          <div style={sectionStyle}>
            <SectionHeader icon={Lock} label="Privacy" />
            {[
              { key: 'shareCalendar',      label: 'Share calendar with team' },
              { key: 'showInDirectory',    label: 'Show in team directory' },
              { key: 'allowDirectMessages',label: 'Allow direct messages' },
            ].map(({ key, label }) => (
              <CheckRow key={key} label={label} checked={(settings as any)[key]} onChange={v => update(key, v)} />
            ))}
          </div>

        </div>

        {/* Save footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          <button
            onClick={handleSave}
            disabled={!dirty && !saved}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '11px 0', fontSize: 13, fontWeight: 600, cursor: dirty ? 'pointer' : 'default',
              background: saved ? 'var(--positive)' : dirty ? 'var(--accent)' : 'var(--bg-elevated)',
              color: (saved || dirty) ? 'var(--accent-fg)' : 'var(--text-dim)',
              border: 'none', transition: 'all 0.2s',
            }}
          >
            {saved ? <><Check size={14} /> Saved</> : <><Save size={14} /> Save Settings</>}
          </button>
        </div>

      </div>
    </div>
  )
}
