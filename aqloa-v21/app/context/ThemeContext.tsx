'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export type ThemeMode = 'dark' | 'light'
export type AccentKey = 'orange' | 'green' | 'blue' | 'pink' | 'purple' | 'cyan' | 'red' | 'silver'

export interface AccentColor {
  key: AccentKey
  label: string
  hex: string
  light: string
  dim: string
  glow: string
  fg: string   // text color on accent bg
}

export const ACCENT_COLORS: AccentColor[] = [
  { key: 'silver', label: 'White',   hex: '#ffffff', light: '#e0e0e0', dim: 'rgba(255,255,255,0.10)', glow: 'rgba(255,255,255,0.20)', fg: '#000000' },
  { key: 'orange', label: 'Orange',  hex: '#cf4500', light: '#e05010', dim: 'rgba(207,69,0,0.12)',   glow: 'rgba(207,69,0,0.22)',   fg: '#ffffff' },
  { key: 'green',  label: 'Green',   hex: '#16a34a', light: '#22c55e', dim: 'rgba(22,163,74,0.12)',  glow: 'rgba(22,163,74,0.22)',  fg: '#ffffff' },
  { key: 'blue',   label: 'Blue',    hex: '#2563eb', light: '#3b82f6', dim: 'rgba(37,99,235,0.12)',  glow: 'rgba(37,99,235,0.22)',  fg: '#ffffff' },
  { key: 'pink',   label: 'Pink',    hex: '#db2777', light: '#ec4899', dim: 'rgba(219,39,119,0.12)', glow: 'rgba(219,39,119,0.22)', fg: '#ffffff' },
  { key: 'purple', label: 'Purple',  hex: '#7c3aed', light: '#8b5cf6', dim: 'rgba(124,58,237,0.12)', glow: 'rgba(124,58,237,0.22)', fg: '#ffffff' },
  { key: 'cyan',   label: 'Cyan',    hex: '#0891b2', light: '#06b6d4', dim: 'rgba(8,145,178,0.12)',  glow: 'rgba(8,145,178,0.22)',  fg: '#ffffff' },
  { key: 'red',    label: 'Red',     hex: '#dc2626', light: '#ef4444', dim: 'rgba(220,38,38,0.12)',  glow: 'rgba(220,38,38,0.22)',  fg: '#ffffff' },
]

interface ThemeCtx {
  mode: ThemeMode
  accentKey: AccentKey
  accent: AccentColor
  setMode: (m: ThemeMode) => void
  setAccent: (k: AccentKey) => void
}

const ThemeContext = createContext<ThemeCtx>({
  mode: 'dark', accentKey: 'silver',
  accent: ACCENT_COLORS[0],
  setMode: () => {}, setAccent: () => {},
})

function applyTheme(mode: ThemeMode, accent: AccentColor) {
  const root = document.documentElement
  root.setAttribute('data-theme', mode)
  root.style.setProperty('--accent',       accent.hex)
  root.style.setProperty('--accent-light', accent.light)
  root.style.setProperty('--accent-dim',   accent.dim)
  root.style.setProperty('--accent-glow',  accent.glow)
  root.style.setProperty('--accent-fg',    accent.fg)
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('dark')
  const [accentKey, setAccentKeyState] = useState<AccentKey>('silver')

  const accent = ACCENT_COLORS.find(c => c.key === accentKey) ?? ACCENT_COLORS[0]

  useEffect(() => {
    const savedMode   = (localStorage.getItem('themeMode')   as ThemeMode) ?? 'dark'
    const savedAccent = (localStorage.getItem('themeAccent') as AccentKey) ?? 'silver'
    setModeState(savedMode)
    setAccentKeyState(savedAccent)
    const a = ACCENT_COLORS.find(c => c.key === savedAccent) ?? ACCENT_COLORS[0]
    applyTheme(savedMode, a)
  }, [])

  const setMode = (m: ThemeMode) => {
    setModeState(m)
    localStorage.setItem('themeMode', m)
    applyTheme(m, accent)
  }

  const setAccent = (k: AccentKey) => {
    setAccentKeyState(k)
    localStorage.setItem('themeAccent', k)
    const a = ACCENT_COLORS.find(c => c.key === k) ?? ACCENT_COLORS[0]
    applyTheme(mode, a)
  }

  return (
    <ThemeContext.Provider value={{ mode, accentKey, accent, setMode, setAccent }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
