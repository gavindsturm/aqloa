'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bell, Settings, Users as UsersIcon, Calendar as CalendarIcon,
  UserPlus, Phone, DollarSign, LayoutDashboard, LogOut, User, Mail,
  Filter, X, FileText, TrendingUp, TrendingDown, Clock, Save, Upload, Target, Award,
  Shield, ChevronRight, ArrowUpRight, Zap, Star, MoreHorizontal, Search
} from 'lucide-react'
import NotificationsPanel from './components/NotificationsPanel'
import SettingsPanel from './components/SettingsPanel'
import CalendarSystem from './components/CalendarSystem'
import TeamManagement from './components/TeamManagement'

import CRMAutomation from './components/CRMAutomation'
import DailyGoals from './components/dashboard-widgets/DailyGoals'
import StatsOverview from './components/dashboard-widgets/StatsOverview'
import RecentActivity from './components/dashboard-widgets/RecentActivity'
import RevenueChart from './components/dashboard-widgets/RevenueChart'
import TeamFeed from './components/dashboard-widgets/TeamFeed'
import CloseRateChart from './components/dashboard-widgets/CloseRateChart'
import TeamWins from './components/dashboard-widgets/TeamWins'
import LeadSpendChart from './components/dashboard-widgets/LeadSpendChart'
import { Lead, Appointment, TeamMember } from './types'
import { formatCurrency } from '../lib/utils'
import { useTeam } from './context/TeamContext'

const SAMPLE_LEADS: Lead[] = [
  { id: 1, name: 'John Patterson', phone: '(555) 123-4567', email: 'john@example.com', source: 'Facebook Ads', status: 'new', value: '$500K', assignedTo: '', time: '5 min ago', notes: '', age: 35, smoker: false, medications: [], healthConditions: [] },
  { id: 2, name: 'Maria Garcia', phone: '(555) 234-5678', email: 'maria@example.com', source: 'Google Ads', status: 'contacted', value: '$1M', assignedTo: '', time: '1 hour ago', notes: '', age: 42, smoker: false, medications: ['Lisinopril'], healthConditions: [] },
  { id: 3, name: 'Thomas Lee', phone: '(555) 345-6789', email: 'thomas@example.com', source: 'Referral', status: 'qualified', value: '$750K', assignedTo: '', time: '2 hours ago', notes: '', age: 38, smoker: true, medications: ['Metformin'], healthConditions: [] },
  { id: 4, name: 'Sarah Johnson', phone: '(555) 456-7890', email: 'sarah@example.com', source: 'Website', status: 'new', value: '$250K', assignedTo: '', time: '3 hours ago', notes: '', age: 29, smoker: false, medications: [], healthConditions: [] },
  { id: 5, name: 'David Chen', phone: '(555) 567-8901', email: 'david@example.com', source: 'LinkedIn', status: 'contacted', value: '$2M', assignedTo: '', time: '4 hours ago', notes: '', age: 51, smoker: false, medications: ['Atorvastatin (Lipitor)', 'Lisinopril'], healthConditions: [] },
  { id: 6, name: 'Emily Rodriguez', phone: '(555) 678-9012', email: 'emily@example.com', source: 'Facebook Ads', status: 'qualified', value: '$1.5M', assignedTo: '', time: '5 hours ago', notes: '', age: 44, smoker: false, medications: ['Levothyroxine (Synthroid)'], healthConditions: [] },
  { id: 7, name: 'Michael Brown', phone: '(555) 789-0123', email: 'michael@example.com', source: 'Google Ads', status: 'new', value: '$500K', assignedTo: '', time: '6 hours ago', notes: '', age: 33, smoker: true, medications: [], healthConditions: [] },
  { id: 8, name: 'Jennifer White', phone: '(555) 890-1234', email: 'jennifer@example.com', source: 'Referral', status: 'contacted', value: '$800K', assignedTo: '', time: '7 hours ago', notes: '', age: 47, smoker: false, medications: ['Sertraline (Zoloft)'], healthConditions: [] },
  { id: 9, name: 'Robert Taylor', phone: '(555) 901-2345', email: 'robert@example.com', source: 'Website', status: 'qualified', value: '$1M', assignedTo: '', time: '8 hours ago', notes: '', age: 55, smoker: false, medications: ['Metformin', 'Lisinopril'], healthConditions: [] },
  { id: 10, name: 'Linda Martinez', phone: '(555) 012-3456', email: 'linda@example.com', source: 'Facebook Ads', status: 'new', value: '$600K', assignedTo: '', time: '1 day ago', notes: '', age: 40, smoker: false, medications: [], healthConditions: [] },
  { id: 11, name: 'James Wilson', phone: '(555) 111-2222', email: 'james@example.com', source: 'Google Ads', status: 'contacted', value: '$900K', assignedTo: '', time: '1 day ago', notes: '', age: 36, smoker: false, medications: ['Albuterol Inhaler'], healthConditions: [] },
  { id: 12, name: 'Patricia Anderson', phone: '(555) 222-3333', email: 'patricia@example.com', source: 'LinkedIn', status: 'new', value: '$1.2M', assignedTo: '', time: '1 day ago', notes: '', age: 49, smoker: true, medications: ['Omeprazole (Prilosec)'], healthConditions: [] },
  { id: 13, name: 'Christopher Davis', phone: '(555) 333-4444', email: 'christopher@example.com', source: 'Referral', status: 'qualified', value: '$700K', assignedTo: '', time: '2 days ago', notes: '', age: 41, smoker: false, medications: [], healthConditions: [] },
  { id: 14, name: 'Nancy Thompson', phone: '(555) 444-5555', email: 'nancy@example.com', source: 'Website', status: 'contacted', value: '$550K', assignedTo: '', time: '2 days ago', notes: '', age: 45, smoker: false, medications: ['Amlodipine'], healthConditions: [] },
  { id: 15, name: 'Daniel Moore', phone: '(555) 555-6666', email: 'daniel@example.com', source: 'Facebook Ads', status: 'new', value: '$850K', assignedTo: '', time: '2 days ago', notes: '', age: 52, smoker: false, medications: ['Gabapentin'], healthConditions: [] },
  { id: 16, name: 'Karen Jackson', phone: '(555) 666-7777', email: 'karen@example.com', source: 'Google Ads', status: 'qualified', value: '$1.1M', assignedTo: '', time: '3 days ago', notes: '', age: 39, smoker: false, medications: ['Escitalopram (Lexapro)'], healthConditions: [] },
  { id: 17, name: 'Steven Harris', phone: '(555) 777-8888', email: 'steven@example.com', source: 'LinkedIn', status: 'contacted', value: '$950K', assignedTo: '', time: '3 days ago', notes: '', age: 48, smoker: true, medications: ['Metoprolol'], healthConditions: [] },
  { id: 18, name: 'Betty Clark', phone: '(555) 888-9999', email: 'betty@example.com', source: 'Referral', status: 'new', value: '$650K', assignedTo: '', time: '3 days ago', notes: '', age: 43, smoker: false, medications: [], healthConditions: [] },
  { id: 19, name: 'Kenneth Lewis', phone: '(555) 999-0000', email: 'kenneth@example.com', source: 'Website', status: 'contacted', value: '$1.3M', assignedTo: '', time: '4 days ago', notes: '', age: 54, smoker: false, medications: ['Simvastatin', 'Losartan'], healthConditions: [] },
  { id: 20, name: 'Donna Robinson', phone: '(555) 000-1111', email: 'donna@example.com', source: 'Facebook Ads', status: 'qualified', value: '$775K', assignedTo: '', time: '4 days ago', notes: '', age: 37, smoker: false, medications: ['Fluoxetine (Prozac)'], healthConditions: [] },
]

const STATUS_STYLE: Record<string, { bg: string; color: string; border: string; dot: string }> = {
  new:       { bg: 'rgba(59,130,246,0.10)',  color: '#60a5fa',  border: 'rgba(59,130,246,0.25)',  dot: '#3b82f6' },
  contacted: { bg: 'var(--accent-dim)',  color: 'var(--accent-light)',  border: 'var(--accent-glow)',  dot: 'var(--accent)' },
  qualified: { bg: 'rgba(16,185,129,0.10)',  color: '#34d399',  border: 'rgba(16,185,129,0.25)',  dot: '#10b981' },
  closed:    { bg: 'var(--border)', color: 'var(--text-dim)',  border: 'var(--border)', dot: 'var(--text-dim)' },
}

export default function Dashboard() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState('')
  const [activeTab, setActiveTab] = useState('dashboard')
  const [tabKey, setTabKey] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [viewingLeadDetail, setViewingLeadDetail] = useState<Lead | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLeadsForCRM, setSelectedLeadsForCRM] = useState<number[]>([])
  const [crmMessage, setCrmMessage] = useState('')
  const [crmType, setCrmType] = useState<'email' | 'sms'>('email')
  const [leads, setLeads] = useState<Lead[]>(SAMPLE_LEADS)
  const [leadSpend, setLeadSpend] = useState<number>(0)
  const [editingSpend, setEditingSpend] = useState(false)
  const [spendInput, setSpendInput] = useState('')
  const [closeDealModal, setCloseDealModal] = useState<{ lead: Lead } | null>(null)
  const [closeDealForm, setCloseDealForm] = useState({ insuranceType: 'Term Life', annualPremium: '' })
  const [closeDealLoading, setCloseDealLoading] = useState(false)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [showProfile, setShowProfile] = useState(false)
  const [showComingSoon, setShowComingSoon] = useState(false)
  const [profileData, setProfileData] = useState({ displayName: '', bio: '', phone: '', title: 'Insurance Agent', profilePic: '' })
  const [profileDraft, setProfileDraft] = useState({ displayName: '', bio: '', phone: '', title: '', profilePic: '' })
  const [xp, setXp] = useState(0)
  const [streak, setStreak] = useState(0)
  const [badges, setBadges] = useState<string[]>([])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAuth = localStorage.getItem('isAuthenticated')
      const email = localStorage.getItem('userEmail') || ''
      if (!isAuth) { router.push('/login'); return }
      setUserEmail(email)
      setLeads(leads.map(l => ({ ...l, assignedTo: email })))
      const saved = localStorage.getItem('profileData')
      if (saved) { const p = JSON.parse(saved); setProfileData(p); setProfileDraft(p) }
      else { const d = { displayName: email.split('@')[0], bio: '', phone: '', title: 'Insurance Agent', profilePic: '' }; setProfileData(d); setProfileDraft(d) }
      setLeadSpend(parseFloat(localStorage.getItem('leadSpend') || '0'))
      setXp(parseInt(localStorage.getItem('userXp') || '340'))
      setStreak(parseInt(localStorage.getItem('userStreak') || '7'))
      setBadges(JSON.parse(localStorage.getItem('userBadges') || '["Top Closer","Call Master","Fast Responder"]'))
      // Ensure current user exists in the shared Redis member store
      fetch('/api/members').then(r => r.json()).then(data => {
        const allMembers: TeamMember[] = data.members ?? []
        const existing = allMembers.find((m: TeamMember) => m.email === email)
        if (!existing) {
          // New user not yet in Redis — create their record
          const newMember: TeamMember = {
            id: Date.now(), name: email.split('@')[0], email,
            role: 'agent', status: 'active',
            leads: 0, calls: 0, appointments: 0, closed: 0, revenue: 0,
            joinedDate: new Date().toISOString().split('T')[0],
          }
          fetch('/api/members', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newMember) })
        }
      })
    }
  }, [router])

  const handleTabChange = (id: string) => { setActiveTab(id); setTabKey(k => k + 1); if (typeof window !== 'undefined') { document.querySelector('main')?.scrollTo({ top: 0, behavior: 'instant' }) } }
  const handleCreateAppointment = (apt: Appointment) => setAppointments([...appointments, { ...apt, id: Date.now() }])
  const handleUpdateAppointment = (apt: Appointment) => setAppointments(appointments.map(a => a.id === apt.id ? apt : a))
  const handleDeleteAppointment = (id: number) => setAppointments(appointments.filter(a => a.id !== id))
  const handleInviteMember = (email: string, role: 'admin' | 'agent' | 'manager') => {
    setTeamMembers([...teamMembers, { id: Date.now(), name: email.split('@')[0], email, role, status: 'pending', leads: 0, calls: 0, appointments: 0, closed: 0, revenue: 0, joinedDate: new Date().toISOString().split('T')[0] }])
    alert(`Invitation sent to ${email}`)
  }
  const handleRemoveMember = (id: number) => setTeamMembers(teamMembers.filter(m => m.id !== id))
  const handleUpdateLead = (lead: Lead) => {
    setLeads(leads.map(l => l.id === lead.id ? lead : l))
    if (viewingLeadDetail?.id === lead.id) setViewingLeadDetail(lead)
    setShowComingSoon(false); setSelectedLead(null)
  }

  const handleCloseLead = (lead: Lead) => {
    // Open modal to enter deal details
    setCloseDealForm({
      insuranceType: 'Term Life',
      annualPremium: lead.annualPremium ? String(lead.annualPremium) : lead.monthlyPremium ? String(Math.round(lead.monthlyPremium * 12)) : '',
    })
    setCloseDealModal({ lead })
  }

  const submitCloseDeal = async () => {
    if (!closeDealModal) return
    const annualPremium = parseFloat(closeDealForm.annualPremium.replace(/[^0-9.]/g, ''))
    if (!annualPremium || annualPremium <= 0) return
    setCloseDealLoading(true)

    const lead = closeDealModal.lead
    // Mark lead closed
    const closedLead = { ...lead, status: 'closed' as const, annualPremium }
    setLeads(prev => prev.map(l => l.id === lead.id ? closedLead : l))
    if (viewingLeadDetail?.id === lead.id) setViewingLeadDetail(closedLead)

    // Update member revenue in Redis
    const res = await fetch('/api/members')
    const data = await res.json()
    const allMembers: TeamMember[] = data.members ?? []
    const me = allMembers.find(m => m.email === userEmail)
    if (me) {
      const updated: TeamMember = { ...me, closed: me.closed + 1, revenue: me.revenue + Math.round(annualPremium), status: 'active' }
      await fetch('/api/members', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated) })
      // Update local state immediately so leaderboard reflects the change without waiting for poll
      setTeamMembers(prev => prev.map(m => m.email === userEmail ? updated : m))
    }

    // Post to team wins feed
    const agentName = profileData.displayName || userEmail.split('@')[0]
    await fetch('/api/wins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        agentName, agentEmail: userEmail,
        leadName: lead.name,
        insuranceType: closeDealForm.insuranceType,
        annualPremium,
        closedAt: Date.now(),
      }),
    })

    setCloseDealLoading(false)
    setCloseDealModal(null)
  }

  const saveLeadNotes = () => { if (viewingLeadDetail) { handleUpdateLead(viewingLeadDetail); alert('Notes saved!') } }
  const handleLogout = () => { localStorage.removeItem('isAuthenticated'); localStorage.removeItem('userEmail'); router.push('/login') }
  const openProfile = () => { setProfileDraft({ ...profileData }); setShowProfile(true) }
  const saveProfile = () => {
    setProfileData({ ...profileDraft })
    localStorage.setItem('profileData', JSON.stringify(profileDraft))
    if (profileDraft.displayName) setTeamMembers(prev => prev.map(m => m.email === userEmail ? { ...m, name: profileDraft.displayName } : m))
    setShowProfile(false)
  }
  const handleProfilePicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setProfileDraft(prev => ({ ...prev, profilePic: ev.target?.result as string }))
    reader.readAsDataURL(file)
  }
  // ── CSV Import Modal ──
  const [showCSVModal, setShowCSVModal] = useState(false)
  const [csvPreview, setCsvPreview] = useState<{ headers: string[]; rows: string[][] }>({ headers: [], rows: [] })
  const [csvRawText, setCsvRawText] = useState('')
  const [csvImporting, setCsvImporting] = useState(false)

  const handleCSVFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = event => {
      const text = event.target?.result as string
      setCsvRawText(text)
      const lines = text.split('\n').filter(l => l.trim())
      const headers = lines[0].split(',').map(s => s.trim().replace(/^"|"$/g, ''))
      const rows = lines.slice(1, 6).map(l => l.split(',').map(s => s.trim().replace(/^"|"$/g, '')))
      setCsvPreview({ headers, rows })
      setShowCSVModal(true)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleCSVImport = () => {
    setCsvImporting(true)
    const lines = csvRawText.split('\n').filter(l => l.trim())
    const headers = lines[0].split(',').map(s => s.trim().toLowerCase().replace(/^"|"$/g, ''))
    const get = (row: string[], keys: string[]) => {
      for (const k of keys) { const i = headers.findIndex(h => h.includes(k)); if (i !== -1) return row[i]?.trim().replace(/^"|"$/g, '') || '' }
      return ''
    }
    const newLeads: Lead[] = []
    lines.slice(1).forEach((row, index) => {
      const cols = row.split(',').map(s => s.trim().replace(/^"|"$/g, ''))
      const name  = get(cols, ['name','first','full'])
      const email = get(cols, ['email'])
      if (!name && !email) return
      newLeads.push({
        id: Date.now() + index,
        name:   name  || email.split('@')[0],
        email:  email || '',
        phone:  get(cols, ['phone','tel','mobile']) || '',
        source: get(cols, ['source','lead source','channel']) || 'CSV Import',
        value:  get(cols, ['value','coverage','amount']) || '$500K',
        status: 'new',
        assignedTo: userEmail,
        time: 'Just now', notes: '',
        age: parseInt(get(cols, ['age','dob'])) || 35,
        smoker: false, medications: [], healthConditions: [],
      })
    })
    setLeads(prev => [...prev, ...newLeads])
    setCsvImporting(false)
    setShowCSVModal(false)
    setCsvPreview({ headers: [], rows: [] })
    setCsvRawText('')
  }

  const handleCSVUpload = handleCSVFileSelect // legacy alias
  const sendCRMMessages = () => {
    if (!selectedLeadsForCRM.length) { alert('Please select at least one lead'); return }
    if (!crmMessage.trim()) { alert('Please enter a message'); return }
    const names = leads.filter(l => selectedLeadsForCRM.includes(l.id)).map(l => l.name).join(', ')
    alert(`${crmType === 'email' ? 'Email' : 'SMS'} sent to: ${names}`)
    setSelectedLeadsForCRM([]); setCrmMessage('')
  }

  const getStatus = (status: string) => STATUS_STYLE[status] || STATUS_STYLE.closed
  const filteredLeads = leads.filter(l => {
    const ms = statusFilter === 'all' || l.status === statusFilter
    const mso = sourceFilter === 'all' || l.source === sourceFilter
    const mq = !searchTerm || l.name.toLowerCase().includes(searchTerm.toLowerCase()) || l.email.toLowerCase().includes(searchTerm.toLowerCase()) || l.phone.includes(searchTerm)
    return ms && mso && mq
  })
  const uniqueSources = Array.from(new Set(leads.map(l => l.source)))

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leads',     label: 'Leads',     icon: FileText },
    { id: 'calendar',  label: 'Calendar',  icon: CalendarIcon },
    { id: 'team',      label: 'Team',      icon: UsersIcon },
    { id: 'crm',       label: 'CRM',       icon: Mail },
  ]

  const PAGE_TITLES: Record<string, string> = {
    dashboard: 'Dashboard', leads: 'Leads', calendar: 'Calendar', team: 'Team', crm: 'CRM'
  }

  // ── Shared style tokens ──
  const card: React.CSSProperties = { background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 0 }
  const cardElevated: React.CSSProperties = { background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', borderRadius: 0 }
  const btnPrimary: React.CSSProperties = { background: 'var(--accent)', color: 'var(--accent-fg)', fontWeight: 600, padding: '8px 16px', borderRadius: 0, fontSize: 13, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'opacity 0.15s' }
  const btnSecondary: React.CSSProperties = { background: 'transparent', color: 'var(--text-secondary)', fontWeight: 500, padding: '8px 14px', borderRadius: 0, fontSize: 13, border: '1px solid var(--border-light)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }
  const inputStyle: React.CSSProperties = { background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', color: 'var(--text-primary)', borderRadius: 0, padding: '9px 12px', fontSize: 13, width: '100%' }

  const displayName = profileData.displayName || userEmail.split('@')[0]
  const levelNum = Math.floor(xp / 500) + 1
  const xpPct = ((xp % 500) / 500) * 100

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>

      {/* ════ SIDEBAR ════ */}
      <aside style={{
        width: 220, flexShrink: 0, height: '100vh', position: 'sticky', top: 0,
        background: 'var(--bg-base)', borderRight: '1px solid var(--border-light)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, background: 'var(--accent)', borderRadius: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Zap size={14} color="#000" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>Aqloa</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.02em' }}>SALES PLATFORM</div>
            </div>
          </div>
        </div>

        {/* User card */}
        <button onClick={openProfile} style={{ margin: '12px 12px 0', background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', borderRadius: 0, padding: '10px 12px', cursor: 'pointer', textAlign: 'left', width: 'calc(100% - 24px)', transition: 'border-color 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-light)')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--bg-overlay)', border: '1.5px solid var(--border-strong)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {profileData.profilePic ? <img src={profileData.profilePic} alt="p" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={15} style={{ color: 'var(--text-muted)' }} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</p>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>{profileData.title || 'Insurance Agent'}</p>
            </div>
          </div>
          {/* XP bar */}
          <div style={{ marginTop: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 10, color: 'var(--text-muted)' }}>
              <span>Level {levelNum}</span><span>{xp} XP · {streak}d streak</span>
            </div>
            <div style={{ height: 3, background: 'var(--bg-overlay)', borderRadius: 0, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${xpPct}%`, background: 'var(--accent)', borderRadius: 0, transition: 'width 0.6s ease' }} />
            </div>
          </div>
        </button>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 10px 8px' }}>Navigation</p>
          {navItems.map(item => {
            const active = activeTab === item.id
            return (
              <button key={item.id} onClick={() => handleTabChange(item.id)} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                borderRadius: 0, border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
                background: active ? 'var(--accent-dim)' : 'transparent',
                color: active ? 'var(--accent-light)' : 'var(--text-secondary)',
                fontWeight: active ? 600 : 400, fontSize: 13,
                transition: 'all 0.15s',
                boxShadow: active ? 'inset 3px 0 0 var(--accent)' : 'none',
              }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-primary)' } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' } }}
              >
                <item.icon size={15} />
                <span>{item.label}</span>
                {active && <div style={{ marginLeft: 'auto', width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />}
              </button>
            )
          })}
        </nav>

        {/* Bottom actions */}
        <div style={{ padding: '8px 8px 16px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[
            { label: 'Notifications', icon: Bell, onClick: () => setShowNotifications(!showNotifications), badge: true },
            { label: 'Settings', icon: Settings, onClick: () => setShowSettings(!showSettings) },
            { label: 'Sign Out', icon: LogOut, onClick: handleLogout },
          ].map(item => (
            <button key={item.label} onClick={item.onClick} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 0,
              border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
              color: 'var(--text-muted)', background: 'transparent', fontSize: 13, position: 'relative',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              <item.icon size={14} /><span>{item.label}</span>
              {item.badge && <span style={{ position: 'absolute', top: 8, right: 10, width: 6, height: 6, background: '#ef4444', borderRadius: '50%', border: '1.5px solid var(--bg-surface)' }} />}
            </button>
          ))}
        </div>
      </aside>

      {/* ════ MAIN CONTENT ════ */}
      <div style={{ flex: 1, minWidth: 0, height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

        {/* Top header bar */}
        <header style={{ height: 56, flexShrink: 0, background: 'var(--bg-base)', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Aqloa</span>
            <ChevronRight size={12} style={{ color: 'var(--text-dim)' }} />
            <span style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 600 }}>{PAGE_TITLES[activeTab]}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            <div style={{ width: 1, height: 18, background: 'var(--border-light)' }} />
            <button onClick={() => setShowNotifications(true)} style={{ ...btnSecondary, padding: '6px 10px', position: 'relative' }}>
              <Bell size={14} />
              <span style={{ position: 'absolute', top: 4, right: 4, width: 6, height: 6, background: '#ef4444', borderRadius: '50%', border: '1.5px solid var(--bg-surface)' }} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflow: 'auto', padding: 24, background: 'var(--bg-base)' }}>
          <div key={tabKey} className="tab-content-enter">

            {/* ══════ DASHBOARD ══════ */}
            {activeTab === 'dashboard' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="card-stagger">

                {/* Welcome + badges */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                      Good morning, {displayName} 👋
                    </h1>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, marginBottom: 10 }}>Here's what's happening with your pipeline today.</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      <span style={{ background: 'rgba(212,175,55,0.12)', color: '#d4af37', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 0, border: '1px solid rgba(212,175,55,0.35)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        ⭐ Lv {levelNum} · {xp} XP · {streak}d streak
                      </span>
                      {badges.map((b, i) => (
                        <span key={i} style={{ background: 'rgba(212,175,55,0.12)', color: '#d4af37', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 0, border: '1px solid rgba(212,175,55,0.35)' }}>🏅 {b}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Top row: Lead Spend vs Revenue + Daily Goals */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
                  <LeadSpendChart />
                  <DailyGoals goals={[
                    { label: 'Calls Made', current: 43, target: 50, icon: Phone, color: 'blue' },
                    { label: 'Appointments Set', current: 5, target: 10, icon: CalendarIcon, color: 'purple' },
                    { label: 'Deals Closed', current: 2, target: 3, icon: DollarSign, color: 'green' },
                  ]} />
                </div>

                {/* Bottom row: Team Wins + Close Rate */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
                  <TeamWins />
                  <CloseRateChart />
                </div>
              </div>
            )}

            {/* ══════ LEADS ══════ */}
            {activeTab === 'leads' && !viewingLeadDetail && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="card-stagger">
                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                  {[
                    { label: 'Total Leads', value: leads.length, Icon: UserPlus, change: '+12%', changeSign: '+' },
                    { label: 'Calls Made', value: 43, Icon: Phone, change: '+5%', changeSign: '+' },
                    { label: 'Appointments', value: appointments.length, Icon: CalendarIcon, change: '-2%', changeSign: '-' },
                  ].map(({ label, value, Icon, change, changeSign }) => {
                    const isPos = changeSign === '+'
                    const isNeg = changeSign === '-'
                    const chipColor  = isPos ? '#22c55e' : isNeg ? '#ef4444' : 'var(--text-muted)'
                    const chipBg     = isPos ? 'rgba(34,197,94,0.10)' : isNeg ? 'rgba(239,68,68,0.10)' : 'transparent'
                    const chipBorder = isPos ? 'rgba(34,197,94,0.25)' : isNeg ? 'rgba(239,68,68,0.25)' : 'transparent'
                    return (
                      <div key={label} style={{ ...card, padding: '18px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                          <div style={{ flex: 1 }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
                            <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 24, marginTop: 4, letterSpacing: '-0.02em' }}>{value}</p>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 3, marginTop: 6, fontSize: 11, fontWeight: 700, color: chipColor, padding: '2px 6px', background: chipBg, border: `1px solid ${chipBorder}` }}>
                              {isPos ? <TrendingUp size={10} /> : isNeg ? <TrendingDown size={10} /> : null}
                              {change} this month
                            </div>
                          </div>
                          <div style={{ width: 36, height: 36, background: 'var(--bg-overlay)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Icon size={16} style={{ color: 'var(--text-muted)' }} />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {/* Lead Spend — editable card */}
                  <div style={{ ...card, padding: '18px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                          <p style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Lead Spend</p>
                          {!editingSpend && (
                            <button onClick={() => { setSpendInput(String(leadSpend || '')); setEditingSpend(true) }}
                              style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', background: 'var(--bg-overlay)', border: '1px solid var(--border-light)', padding: '2px 8px', cursor: 'pointer', letterSpacing: '0.04em' }}>
                              EDIT
                            </button>
                          )}
                        </div>
                        {editingSpend ? (
                          <div style={{ marginTop: 4 }}>
                            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)' }}>
                              <span style={{ padding: '0 10px', fontSize: 16, color: 'var(--text-muted)', fontWeight: 500, borderRight: '1px solid var(--border-light)' }}>$</span>
                              <input
                                autoFocus type="number" value={spendInput}
                                onChange={e => setSpendInput(e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') { const val = parseFloat(spendInput) || 0; setLeadSpend(val); localStorage.setItem('leadSpend', String(val)); setEditingSpend(false) }
                                  if (e.key === 'Escape') setEditingSpend(false)
                                }}
                                placeholder="0"
                                style={{ flex: 1, padding: '8px 10px', fontSize: 20, fontWeight: 700, background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', width: '100%' }}
                              />
                            </div>
                            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                              <button
                                onClick={() => { const val = parseFloat(spendInput) || 0; setLeadSpend(val); localStorage.setItem('leadSpend', String(val)); setEditingSpend(false) }}
                                style={{ flex: 1, padding: '7px', background: 'var(--accent)', color: 'var(--accent-fg)', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer' }}>
                                Save
                              </button>
                              <button onClick={() => setEditingSpend(false)}
                                style={{ padding: '7px 12px', background: 'var(--bg-overlay)', border: '1px solid var(--border-light)', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12 }}>
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 24, letterSpacing: '-0.02em', marginTop: 4 }}>
                            {leadSpend > 0 ? `$${leadSpend.toLocaleString()}` : <span style={{ color: 'var(--text-dim)' }}>Not set</span>}
                          </p>
                        )}
                        {!editingSpend && (
                          <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 6 }}>This month's spend</p>
                        )}
                      </div>
                      <div style={{ width: 36, height: 36, background: 'var(--bg-overlay)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <DollarSign size={16} style={{ color: 'var(--text-muted)' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filter bar */}
                <div style={{ ...card, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 180 }}>
                      <Search size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input type="text" placeholder="Search leads..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                        style={{ ...inputStyle, paddingLeft: 34 }} />
                    </div>
                    {[
                      { value: statusFilter, onChange: setStatusFilter, opts: [['all', 'All Statuses'], ['new', 'New'], ['contacted', 'Contacted'], ['qualified', 'Qualified'], ['closed', 'Closed']] },
                      { value: sourceFilter, onChange: setSourceFilter, opts: [['all', 'All Sources'], ...uniqueSources.map(s => [s, s])] },
                    ].map((sel, idx) => (
                      <select key={idx} value={sel.value} onChange={e => sel.onChange(e.target.value)} style={{ ...inputStyle, width: 'auto', minWidth: 140, flex: '0 0 auto' }}>
                        {sel.opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    ))}
                    <label style={{ ...btnSecondary, cursor: 'pointer', flexShrink: 0 }}>
                      <Upload size={13} /> Import CSV
                      <input type="file" accept=".csv" onChange={handleCSVFileSelect} style={{ display: 'none' }} />
                    </label>
                  </div>
                </div>

                {/* Table */}
                <div style={{ ...card, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>All Leads <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 13 }}>({filteredLeads.length})</span></span>
                  </div>
                  {/* Table header */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 110px', gap: 0, padding: '8px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
                    {['Contact', 'Source', 'Value', 'Status', ''].map(h => (
                      <span key={h} style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
                    ))}
                  </div>
                  {filteredLeads.map((lead, i) => {
                    const st = getStatus(lead.status)
                    return (
                      <div key={lead.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 110px', gap: 0, padding: '12px 20px', borderBottom: i < filteredLeads.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'center', cursor: 'pointer', transition: 'background 0.1s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        onClick={() => setViewingLeadDetail(lead)}
                      >
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{lead.name}</p>
                          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{lead.email}</p>
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{lead.source}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{lead.value}</span>
                        <span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 0, background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: st.dot, flexShrink: 0 }} />{lead.status}
                          </span>
                        </span>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          {lead.status !== 'closed' && (
                            <button
                              onClick={e => { e.stopPropagation(); handleCloseLead(lead) }}
                              style={{ padding: '5px 8px', background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 0, cursor: 'pointer', color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600 }}
                              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(34,197,94,0.20)')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(34,197,94,0.10)')}
                              title="Close Deal"
                            >
                              <DollarSign size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ══════ LEAD DETAIL ══════ */}
            {activeTab === 'leads' && viewingLeadDetail && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <button onClick={() => setViewingLeadDetail(null)} style={{ fontSize: 12, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                      ← Back to Leads
                    </button>
                    <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{viewingLeadDetail.name}</h1>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {viewingLeadDetail.status !== 'closed' && (
                      <button
                        onClick={() => handleCloseLead(viewingLeadDetail)}
                        style={{ background: '#22c55e', color: '#fff', fontWeight: 700, padding: '8px 18px', borderRadius: 0, fontSize: 13, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                      >
                        <DollarSign size={14} /> Close Deal
                      </button>
                    )}
                    {viewingLeadDetail.status === 'closed' && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, padding: '8px 16px', background: 'rgba(34,197,94,0.10)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }}>
                        ✓ Deal Closed
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {/* Contact info */}
                    <div style={{ ...card, padding: 20 }}>
                      <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 14 }}>Contact Information</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        {[
                          { label: 'Name', value: viewingLeadDetail.name },
                          { label: 'Phone', value: viewingLeadDetail.phone },
                          { label: 'Email', value: viewingLeadDetail.email },
                          { label: 'Source', value: viewingLeadDetail.source },
                          { label: 'Value', value: viewingLeadDetail.value },
                          { label: 'Added', value: viewingLeadDetail.time },
                        ].map(f => (
                          <div key={f.label}>
                            <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{f.label}</p>
                            <p style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{f.value}</p>
                          </div>
                        ))}
                        <div>
                          <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Status</p>
                          {(() => { const s = getStatus(viewingLeadDetail.status); return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 0, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}><span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot }} />{viewingLeadDetail.status}</span> })()}
                        </div>
                        <div>
                          <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Smoker</p>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 0, background: viewingLeadDetail.smoker ? 'var(--red-dim)' : 'var(--bg-overlay)', color: viewingLeadDetail.smoker ? 'var(--red)' : 'var(--green)', border: `1px solid ${viewingLeadDetail.smoker ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.25)'}` }}>{viewingLeadDetail.smoker ? 'Yes' : 'No'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Quote */}
                    {viewingLeadDetail.selectedCarrier && viewingLeadDetail.monthlyPremium && (
                      <div style={{ ...card, overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Shield size={14} style={{ color: 'var(--text-muted)' }} />
                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Insurance Quote</span>
                          </div>
                        </div>
                        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                            <div>
                              <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Selected Carrier</p>
                              <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{viewingLeadDetail.selectedCarrier}</p>
                              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{viewingLeadDetail.quoteCoverage ? formatCurrency(viewingLeadDetail.quoteCoverage) : ''}{viewingLeadDetail.quoteTerm ? ` · ${viewingLeadDetail.quoteTerm}yr` : ''}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent)', letterSpacing: '-0.02em', lineHeight: 1 }}>{formatCurrency(viewingLeadDetail.monthlyPremium)}</p>
                              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>per month · {formatCurrency(viewingLeadDetail.annualPremium ?? 0)}/yr</p>
                            </div>
                          </div>
                        </div>
                        {viewingLeadDetail.carrierQuotes && viewingLeadDetail.carrierQuotes.length > 1 && (
                          <div style={{ padding: '14px 20px' }}>
                            {viewingLeadDetail.carrierQuotes.map((q, idx) => (
                              <div key={q.carrier} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 0, background: q.carrier === viewingLeadDetail.selectedCarrier ? 'var(--bg-overlay)' : 'transparent', border: `1px solid ${q.carrier === viewingLeadDetail.selectedCarrier ? 'var(--border-strong)' : 'transparent'}`, marginBottom: 4 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 18 }}>#{idx + 1}</span>
                                  <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{q.carrier}</span>
                                  {q.carrier === viewingLeadDetail.selectedCarrier && <span style={{ fontSize: 10, background: 'var(--accent)', color: 'var(--accent-fg)', fontWeight: 700, padding: '1px 6px', borderRadius: 0 }}>Selected</span>}
                                  {idx === 0 && q.carrier !== viewingLeadDetail.selectedCarrier && <span style={{ fontSize: 10, background: 'var(--bg-overlay)', color: 'var(--text-secondary)', fontWeight: 700, padding: '1px 6px', borderRadius: 0, border: '1px solid rgba(16,185,129,0.25)' }}>Best Rate</span>}
                                </div>
                                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{formatCurrency(q.monthly)}/mo</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Notes */}
                    <div style={{ ...card, padding: 20 }}>
                      <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>Notes</h3>
                      <textarea value={viewingLeadDetail.notes} onChange={e => setViewingLeadDetail({ ...viewingLeadDetail, notes: e.target.value })} placeholder="Add notes..."
                        style={{ ...inputStyle, height: 90, resize: 'none' }} />
                      <button onClick={saveLeadNotes} style={{ ...btnPrimary, marginTop: 10 }}><Save size={12} /> Save Notes</button>
                    </div>
                  </div>

                  {/* Right sidebar */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ ...card, padding: 18 }}>
                      <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>Profile</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {[
                          { label: 'Age', value: viewingLeadDetail.age ?? 'N/A' },
                          { label: 'Smoker', value: viewingLeadDetail.smoker ? 'Yes' : 'No' },
                          { label: 'Medications', value: viewingLeadDetail.medications?.length ?? 0 },
                          { label: 'Conditions', value: viewingLeadDetail.healthConditions?.length ?? 0 },
                          ...(viewingLeadDetail.selectedCarrier ? [
                            { label: 'Carrier', value: viewingLeadDetail.selectedCarrier },
                            { label: 'Monthly', value: formatCurrency(viewingLeadDetail.monthlyPremium ?? 0) },
                          ] : []),
                        ].map(item => (
                          <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.label}</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{String(item.value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ ...card, padding: 18 }}>
                      <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>Actions</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <button style={{ ...btnSecondary, width: '100%', justifyContent: 'center' }}><Phone size={13} /> Call Lead</button>
                        <button style={{ ...btnSecondary, width: '100%', justifyContent: 'center' }}><Mail size={13} /> Send Email</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══════ CALENDAR ══════ */}
            {activeTab === 'calendar' && (
              <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Calendar</h2>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Manage your appointments and schedule</p>
                </div>
                <div style={{ padding: 20 }}>
                  <CalendarSystem appointments={appointments} currentUser={userEmail}
                    onCreateAppointment={handleCreateAppointment}
                    onUpdateAppointment={handleUpdateAppointment}
                    onDeleteAppointment={handleDeleteAppointment}
                  />
                </div>
              </div>
            )}

            {/* ══════ TEAM ══════ */}
            {activeTab === 'team' && (
              <TeamManagement teamMembers={teamMembers} currentUser={userEmail} profilePic={profileData.profilePic}
                onInviteMember={() => {}} onRemoveMember={() => {}} />
            )}

            {/* ══════ CRM ══════ */}
            {activeTab === 'crm' && <CRMAutomation leads={leads} onSendMessages={sendCRMMessages} />}

          </div>
        </main>
      </div>

      {/* Panels & Modals */}
      <NotificationsPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} currentUser={userEmail} onOpenProfile={openProfile} />

      {/* ── CSV IMPORT MODAL ── */}
      {showCSVModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowCSVModal(false)}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', width: '100%', maxWidth: 640, boxShadow: '0 24px 80px rgba(0,0,0,0.6)', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Import CSV</h2>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Preview your data before importing</p>
              </div>
              <button onClick={() => setShowCSVModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 4 }}><X size={16} /></button>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', padding: '12px 16px', marginBottom: 16, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7 }}>
                <strong style={{ color: 'var(--text-secondary)' }}>Recognized columns:</strong> name, email, phone, source, value, age<br/>
                Column names are auto-detected — your CSV doesn't need to be in any specific order.
              </div>
              {csvPreview.headers.length > 0 && (
                <div style={{ overflowX: 'auto', marginBottom: 20 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Preview (first 5 rows)</p>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-elevated)' }}>
                        {csvPreview.headers.map((h, i) => (
                          <th key={i} style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvPreview.rows.map((row, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                          {row.map((cell, j) => (
                            <td key={j} style={{ padding: '8px 10px', color: 'var(--text-secondary)', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cell || '—'}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setShowCSVModal(false)}
                  style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid var(--border-strong)', borderRadius: 0, color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={handleCSVImport} disabled={csvImporting}
                  style={{ flex: 2, padding: '10px', background: 'var(--accent)', border: 'none', borderRadius: 0, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: csvImporting ? 0.7 : 1 }}>
                  <Upload size={14} /> {csvImporting ? 'Importing...' : `Import ${csvRawText.split('\n').filter(l => l.trim()).length - 1} Leads`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CLOSE DEAL MODAL ── */}
      {closeDealModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', width: '100%', maxWidth: 420, boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Close Deal 🎉</h2>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{closeDealModal.lead.name}</p>
              </div>
              <button onClick={() => setCloseDealModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Insurance Type</label>
                <select value={closeDealForm.insuranceType} onChange={e => setCloseDealForm(f => ({ ...f, insuranceType: e.target.value }))} style={inputStyle}>
                  <option>Term Life</option>
                  <option>Final Expense</option>
                  <option>Indexed Universal Life (IUL)</option>
                  <option>Whole Life</option>
                  <option>Annuity</option>
                  <option>Health Insurance</option>
                  <option>Mortgage Protection</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Annualized Premium ($)</label>
                <input
                  type="number" min="0" step="1"
                  value={closeDealForm.annualPremium}
                  onChange={e => setCloseDealForm(f => ({ ...f, annualPremium: e.target.value }))}
                  placeholder="e.g. 4800"
                  style={inputStyle}
                  autoFocus
                  onKeyDown={e => { if (e.key === 'Enter') submitCloseDeal() }}
                />
                {closeDealForm.annualPremium && parseFloat(closeDealForm.annualPremium) > 0 && (
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    = {formatCurrency(parseFloat(closeDealForm.annualPremium) / 12)}/mo
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button onClick={() => setCloseDealModal(null)} style={{ ...btnSecondary, flex: 1, justifyContent: 'center' }}>Cancel</button>
                <button
                  onClick={submitCloseDeal}
                  disabled={closeDealLoading || !closeDealForm.annualPremium || parseFloat(closeDealForm.annualPremium) <= 0}
                  style={{ flex: 1, justifyContent: 'center', background: '#22c55e', color: '#fff', fontWeight: 700, padding: '9px 16px', fontSize: 13, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, opacity: (!closeDealForm.annualPremium || parseFloat(closeDealForm.annualPremium) <= 0) ? 0.5 : 1 }}
                >
                  <DollarSign size={13} /> {closeDealLoading ? 'Saving…' : 'Confirm Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile modal */}
      {showProfile && (
        <div className="modal-backdrop-enter" style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-enter" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: 0, width: '100%', maxWidth: 480, overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Edit Profile</h2>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Update your personal information</p>
              </div>
              <button onClick={() => setShowProfile(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--bg-overlay)', border: '2px solid var(--border-strong)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {profileDraft.profilePic ? <img src={profileDraft.profilePic} alt="p" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={24} style={{ color: 'var(--text-muted)' }} />}
              </div>
              <div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 8 }}>Profile Photo</p>
                <label style={{ ...btnSecondary, fontSize: 12, cursor: 'pointer' }}>
                  <Upload size={12} /> Upload
                  <input type="file" accept="image/*" onChange={handleProfilePicUpload} style={{ display: 'none' }} />
                </label>
                {profileDraft.profilePic && <button onClick={() => setProfileDraft(p => ({ ...p, profilePic: '' }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12, marginLeft: 10, textDecoration: 'underline' }}>Remove</button>}
              </div>
            </div>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[{ label: 'Display Name', key: 'displayName', placeholder: 'Your name' }, { label: 'Job Title', key: 'title', placeholder: 'Insurance Agent' }].map(f => (
                  <div key={f.key}>
                    <label style={{ display: 'block', fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>{f.label}</label>
                    <input type="text" value={(profileDraft as any)[f.key]} placeholder={f.placeholder} onChange={e => setProfileDraft(p => ({ ...p, [f.key]: e.target.value }))} style={inputStyle} />
                  </div>
                ))}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Bio</label>
                <textarea value={profileDraft.bio} onChange={e => setProfileDraft(p => ({ ...p, bio: e.target.value }))} placeholder="Tell your team about yourself..." rows={3} style={{ ...inputStyle, resize: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Phone</label>
                <input type="tel" value={profileDraft.phone} onChange={e => setProfileDraft(p => ({ ...p, phone: e.target.value }))} placeholder="(555) 000-0000" style={inputStyle} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, padding: '14px 20px' }}>
              <button onClick={() => setShowProfile(false)} style={{ ...btnSecondary, flex: 1, justifyContent: 'center' }}>Cancel</button>
              <button onClick={saveProfile} style={{ ...btnPrimary, flex: 1, justifyContent: 'center' }}><Save size={12} /> Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
