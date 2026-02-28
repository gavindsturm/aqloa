'use client'
import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react'
import { TeamMember } from '../dashboard/types'

// ── Types ─────────────────────────────────────────────────────────────────────
export interface ChatMessage {
  id: string
  sender: string
  senderEmail: string
  initials: string
  text: string
  timestamp: number
  channel: string
  reactions?: Record<string, string[]>
}

export interface PendingInvite {
  email: string
  role: string
  invitedBy: string
  expiresAt: number
  createdAt: number
  token: string
  inviteUrl: string
}

export interface OrgNode {
  member: TeamMember
  uplineId?: number
  downlineIds: number[]
}

interface TeamCtx {
  members: TeamMember[]
  addMember: (m: TeamMember) => Promise<void>
  removeMember: (id: number) => Promise<void>
  updateMember: (id: number, patch: Partial<TeamMember>) => Promise<void>
  orgTree: Map<number, OrgNode>
  getUpline: (email: string) => TeamMember[]
  getDownline: (email: string) => TeamMember[]
  messages: ChatMessage[]
  sendMessage: (text: string, channel: string, sender: string, senderEmail: string) => Promise<void>
  addReaction: (msgId: string, emoji: string, userEmail: string) => Promise<void>
  activeChannel: string
  setActiveChannel: (c: string) => void
  pendingInvites: PendingInvite[]
  addPendingInvite: (inv: PendingInvite) => void
  removePendingInvite: (token: string) => void
  leaderboard: TeamMember[]
  leaderboardPeriod: 'month' | 'quarter' | 'all'
  setLeaderboardPeriod: (p: 'month' | 'quarter' | 'all') => void
  membersLoading: boolean
  chatLoading: boolean
}

const TeamContext = createContext<TeamCtx>({} as TeamCtx)
export const useTeam = () => useContext(TeamContext)

// ── Org tree ──────────────────────────────────────────────────────────────────
// Uses invitedBy field first (real relationship), falls back to role-based hierarchy
function buildOrgTree(members: TeamMember[]): Map<number, OrgNode> {
  const tree = new Map<number, OrgNode>()
  const sorted = [...members].sort((a, b) => new Date(a.joinedDate).getTime() - new Date(b.joinedDate).getTime())
  sorted.forEach(m => tree.set(m.id, { member: m, downlineIds: [] }))

  sorted.forEach(m => {
    // If this member was invited by someone, wire that relationship directly
    if (m.invitedBy) {
      const inviter = sorted.find(x => x.email === m.invitedBy)
      if (inviter && inviter.id !== m.id) {
        tree.get(m.id)!.uplineId = inviter.id
        const inviterNode = tree.get(inviter.id)!
        if (!inviterNode.downlineIds.includes(m.id)) {
          inviterNode.downlineIds.push(m.id)
        }
        return // skip fallback logic
      }
    }

    // Fallback: role-based hierarchy for seed/legacy members without invitedBy
    const admins   = sorted.filter(x => x.role === 'admin')
    const managers = sorted.filter(x => x.role === 'manager')
    if (m.role === 'manager') {
      const upline = admins[0]
      if (upline && upline.id !== m.id) {
        tree.get(m.id)!.uplineId = upline.id
        const node = tree.get(upline.id)!
        if (!node.downlineIds.includes(m.id)) node.downlineIds.push(m.id)
      }
    } else if (m.role === 'agent') {
      const upline = managers.length > 0 ? managers[0] : admins[0]
      if (upline && upline.id !== m.id) {
        tree.get(m.id)!.uplineId = upline.id
        const node = tree.get(upline.id)!
        if (!node.downlineIds.includes(m.id)) node.downlineIds.push(m.id)
      }
    }
  })

  return tree
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function TeamProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([])
  const [activeChannel, setActiveChannel] = useState('general')
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<'month' | 'quarter' | 'all'>('month')
  const [membersLoading, setMembersLoading] = useState(true)
  const [chatLoading, setChatLoading] = useState(true)
  const lastMessageTime = useRef<number>(0)
  const pollInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── Load members from API ─────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/members')
      .then(r => r.json())
      .then(data => { setMembers(data.members ?? []); setMembersLoading(false) })
      .catch(() => setMembersLoading(false))
  }, [])

  // ── Poll members every 15s so leaderboard stays live ───────────────────────
  useEffect(() => {
    const poll = setInterval(() => {
      fetch('/api/members')
        .then(r => r.json())
        .then(data => { if (data.members) setMembers(data.members) })
        .catch(() => {})
    }, 15000)
    return () => clearInterval(poll)
  }, [])

  // ── Load chat + poll for new messages every 5s ────────────────────────────
  useEffect(() => {
    const loadMessages = async (since = 0) => {
      try {
        const r = await fetch(`/api/chat${since > 0 ? `?since=${since}` : ''}`)
        const data = await r.json()
        if (!data.messages) return
        if (since === 0) {
          setMessages(data.messages)
          setChatLoading(false)
        } else {
          if (data.messages.length > 0) {
            setMessages(prev => {
              const existingIds = new Set(prev.map((m: ChatMessage) => m.id))
              const newMsgs = data.messages.filter((m: ChatMessage) => !existingIds.has(m.id))
              return newMsgs.length > 0 ? [...prev, ...newMsgs] : prev
            })
          }
        }
        if (data.serverTime) lastMessageTime.current = data.serverTime
      } catch {}
    }

    loadMessages(0)
    pollInterval.current = setInterval(() => loadMessages(lastMessageTime.current), 5000)
    return () => { if (pollInterval.current) clearInterval(pollInterval.current) }
  }, [])

  // Load pending invites from localStorage (these are local to the manager's browser)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('pendingInvites')
      if (stored) setPendingInvites(JSON.parse(stored))
    } catch {}
  }, [])

  // ── Member actions ────────────────────────────────────────────────────────
  const addMember = useCallback(async (m: TeamMember) => {
    const res = await fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(m),
    })
    const data = await res.json()
    if (data.success) {
      setMembers(prev => {
        const idx = prev.findIndex(x => x.email === m.email)
        if (idx >= 0) { const u = [...prev]; u[idx] = m; return u }
        return [...prev, m]
      })
    }
  }, [])

  const removeMember = useCallback(async (id: number) => {
    await fetch(`/api/members?id=${id}`, { method: 'DELETE' })
    setMembers(prev => prev.filter(m => m.id !== id))
  }, [])

  const updateMember = useCallback(async (id: number, patch: Partial<TeamMember>) => {
    setMembers(prev => {
      const updated = prev.map(m => m.id === id ? { ...m, ...patch } : m)
      const member = updated.find(m => m.id === id)
      if (member) {
        fetch('/api/members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(member),
        })
      }
      return updated
    })
  }, [])

  // ── Chat actions ──────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (text: string, channel: string, sender: string, senderEmail: string) => {
    const initials = sender.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    const msg: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      sender, senderEmail, initials, text, timestamp: Date.now(), channel,
    }
    // Optimistic update
    setMessages(prev => [...prev, msg])
    await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg }),
    })
  }, [])

  const addReaction = useCallback(async (msgId: string, emoji: string, userEmail: string) => {
    // Optimistic update
    setMessages(prev => prev.map(m => {
      if (m.id !== msgId) return m
      const reactions = { ...(m.reactions ?? {}) }
      const users = reactions[emoji] ?? []
      reactions[emoji] = users.includes(userEmail) ? users.filter(u => u !== userEmail) : [...users, userEmail]
      if (reactions[emoji].length === 0) delete reactions[emoji]
      return { ...m, reactions }
    }))
    await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'reaction', msgId, emoji, userEmail }),
    })
  }, [])

  // ── Invites (local to manager browser) ───────────────────────────────────
  const addPendingInvite = useCallback((inv: PendingInvite) => {
    setPendingInvites(prev => {
      const updated = [inv, ...prev.filter(i => i.email !== inv.email)]
      localStorage.setItem('pendingInvites', JSON.stringify(updated))
      return updated
    })
  }, [])

  const removePendingInvite = useCallback((token: string) => {
    setPendingInvites(prev => {
      const updated = prev.filter(i => i.token !== token)
      localStorage.setItem('pendingInvites', JSON.stringify(updated))
      return updated
    })
  }, [])

  // ── Derived ───────────────────────────────────────────────────────────────
  const orgTree = buildOrgTree(members)

  const getUpline = useCallback((email: string) => {
    const member = members.find(m => m.email === email)
    if (!member) return []
    const node = orgTree.get(member.id)
    if (!node?.uplineId) return []
    const up = members.find(m => m.id === node.uplineId)
    return up ? [up] : []
  }, [members, orgTree])

  const getDownline = useCallback((email: string) => {
    const member = members.find(m => m.email === email)
    if (!member) return []
    const node = orgTree.get(member.id)
    if (!node) return []
    return node.downlineIds.map(id => members.find(m => m.id === id)).filter(Boolean) as TeamMember[]
  }, [members, orgTree])

  const leaderboard = [...members].filter(m => m.status === 'active').sort((a, b) => b.revenue - a.revenue)

  return (
    <TeamContext.Provider value={{
      members, addMember, removeMember, updateMember,
      orgTree, getUpline, getDownline,
      messages, sendMessage, addReaction, activeChannel, setActiveChannel,
      pendingInvites, addPendingInvite, removePendingInvite,
      leaderboard, leaderboardPeriod, setLeaderboardPeriod,
      membersLoading, chatLoading,
    }}>
      {children}
    </TeamContext.Provider>
  )
}
