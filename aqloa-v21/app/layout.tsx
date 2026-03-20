import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from './context/ThemeContext'
import { TeamProvider } from './context/TeamContext'

export const metadata: Metadata = {
  title: 'Aqloa — Sales Intelligence',
  description: 'Professional insurance sales platform',
}

// Inline script runs before React hydration — prevents flash of wrong theme
const themeScript = `
(function() {
  try {
    var mode = localStorage.getItem('themeMode') || 'dark';
    var key  = localStorage.getItem('themeAccent') || 'silver';
    var accents = {
      silver: { hex:'#ffffff', light:'#e0e0e0', dim:'rgba(255,255,255,0.10)', glow:'rgba(255,255,255,0.20)', fg:'#000000' },
      orange: { hex:'#cf4500', light:'#e05010', dim:'rgba(207,69,0,0.12)',    glow:'rgba(207,69,0,0.22)',    fg:'#ffffff' },
      green:  { hex:'#16a34a', light:'#22c55e', dim:'rgba(22,163,74,0.12)',   glow:'rgba(22,163,74,0.22)',   fg:'#ffffff' },
      blue:   { hex:'#2563eb', light:'#3b82f6', dim:'rgba(37,99,235,0.12)',   glow:'rgba(37,99,235,0.22)',   fg:'#ffffff' },
      pink:   { hex:'#db2777', light:'#ec4899', dim:'rgba(219,39,119,0.12)',  glow:'rgba(219,39,119,0.22)',  fg:'#ffffff' },
      purple: { hex:'#7c3aed', light:'#8b5cf6', dim:'rgba(124,58,237,0.12)',  glow:'rgba(124,58,237,0.22)',  fg:'#ffffff' },
      cyan:   { hex:'#0891b2', light:'#06b6d4', dim:'rgba(8,145,178,0.12)',   glow:'rgba(8,145,178,0.22)',   fg:'#ffffff' },
      red:    { hex:'#dc2626', light:'#ef4444', dim:'rgba(220,38,38,0.12)',   glow:'rgba(220,38,38,0.22)',   fg:'#ffffff' },
    };
    var a = accents[key] || accents.silver;
    var root = document.documentElement;
    root.setAttribute('data-theme', mode);
    root.style.setProperty('--accent',       a.hex);
    root.style.setProperty('--accent-light', a.light);
    root.style.setProperty('--accent-dim',   a.dim);
    root.style.setProperty('--accent-glow',  a.glow);
    root.style.setProperty('--accent-fg',    a.fg);
  } catch(e) {}
})();
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider><TeamProvider>{children}</TeamProvider></ThemeProvider>
      </body>
    </html>
  )
}
