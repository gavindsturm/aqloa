'use client'
import { useState, useRef, useEffect, useMemo } from 'react'
import { Send, Hash } from 'lucide-react'
import { useTeam } from '../../context/TeamContext'

const CHANNELS = [
  { id: 'general', label: 'general' },
  { id: 'sales',   label: 'sales' },
  { id: 'support', label: 'support' },
]

const QUICK_REACTIONS = ['👍', '🔥', '😂', '💪', '🎉', '❤️']

interface Props { currentUser: string }

function formatTime(ts: number) {
  const d = new Date(ts)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diffDays === 0) return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  if (diffDays === 1) return `Yesterday ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function TeamChat({ currentUser }: Props) {
  const { messages, sendMessage, addReaction, activeChannel, setActiveChannel } = useTeam()
  const [text, setText] = useState('')
  const [showReactFor, setShowReactFor] = useState<string | null>(null)
  const [onlineCount] = useState(Math.floor(Math.random() * 4) + 2)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const channelMessages = useMemo(
    () => messages.filter(m => m.channel === activeChannel),
    [messages, activeChannel]
  )

  const messagesRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight
    }
  }, [channelMessages.length])

  const handleSend = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    const senderName = currentUser.includes('@') ? currentUser.split('@')[0] : currentUser
    const displayName = senderName.charAt(0).toUpperCase() + senderName.slice(1)
    sendMessage(trimmed, activeChannel, displayName, currentUser)
    setText('')
    inputRef.current?.focus({ preventScroll: true })
  }

  const isMe = (email: string) =>
    email === currentUser || email.split('@')[0] === currentUser.split('@')[0]

  const grouped = channelMessages.reduce<Array<{ messages: typeof channelMessages; senderEmail: string; sender: string }>>((acc, msg) => {
    const last = acc[acc.length - 1]
    const gap = last && (msg.timestamp - last.messages[last.messages.length - 1].timestamp) < 120_000
    if (last && last.senderEmail === msg.senderEmail && gap) {
      last.messages.push(msg)
    } else {
      acc.push({ messages: [msg], sender: msg.sender, senderEmail: msg.senderEmail })
    }
    return acc
  }, [])

  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', height: 520 }}>

      {/* Channel tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        {CHANNELS.map(ch => (
          <button key={ch.id} onClick={() => setActiveChannel(ch.id)} style={{
            flex: 1, padding: '10px 6px', fontSize: 11, fontWeight: 600,
            background: activeChannel === ch.id ? 'var(--bg-elevated)' : 'transparent',
            color: activeChannel === ch.id ? 'var(--text-primary)' : 'var(--text-muted)',
            border: 'none',
            borderBottom: activeChannel === ch.id ? '2px solid var(--accent)' : '2px solid transparent',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
            transition: 'all 0.15s',
          }}>
            <Hash size={10} />#{ch.label}
          </button>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0 12px', flexShrink: 0 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{onlineCount} online</span>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesRef}
        style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 2 }}
        onClick={() => setShowReactFor(null)}
      >
        {channelMessages.length === 0 && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8, color: 'var(--text-dim)', marginTop: 40 }}>
            <Hash size={28} />
            <p style={{ fontSize: 13 }}>No messages in #{activeChannel} yet</p>
          </div>
        )}

        {grouped.map((group, gi) => {
          const mine = isMe(group.senderEmail)
          const initials = group.sender.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
          return (
            <div key={gi} style={{ display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start', gap: 2, marginBottom: 8 }}>
              {!mine && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 38 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{group.sender}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>{formatTime(group.messages[0].timestamp)}</span>
                </div>
              )}
              {group.messages.map((msg, mi) => (
                <div key={msg.id} style={{ display: 'flex', flexDirection: mine ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 8, maxWidth: '80%' }}>
                  {!mine && mi === 0 && (
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--accent-dim)', border: '1.5px solid var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'var(--accent)', flexShrink: 0 }}>
                      {initials}
                    </div>
                  )}
                  {!mine && mi > 0 && <div style={{ width: 30, flexShrink: 0 }} />}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start', gap: 3 }}>
                    {/* Message bubble */}
                    <div
                      onMouseEnter={() => setShowReactFor(msg.id)}
                      onMouseLeave={() => setShowReactFor(null)}
                      style={{ position: 'relative' }}
                    >
                      <div style={{
                        background: mine ? 'var(--accent)' : 'var(--bg-elevated)',
                        color: mine ? 'var(--accent-fg)' : 'var(--text-secondary)',
                        border: mine ? 'none' : '1px solid var(--border-light)',
                        padding: '8px 12px', fontSize: 13, lineHeight: 1.5, wordBreak: 'break-word',
                        borderRadius: mine ? '8px 8px 2px 8px' : '8px 8px 8px 2px',
                      }}>
                        {msg.text}
                      </div>

                      {/* Reaction picker — appears BELOW the bubble on hover */}
                      {showReactFor === msg.id && (
                        <div
                          onClick={e => e.stopPropagation()}
                          style={{
                            position: 'absolute',
                            top: '100%',
                            marginTop: 4,
                            [mine ? 'right' : 'left']: 0,
                            display: 'flex', gap: 4,
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-strong)',
                            padding: '5px 8px',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                            zIndex: 10,
                            borderRadius: 8,
                          }}>
                          {QUICK_REACTIONS.map(emoji => (
                            <button key={emoji}
                              onClick={() => { addReaction(msg.id, emoji, currentUser); setShowReactFor(null) }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: '0 3px', lineHeight: 1, transition: 'transform 0.1s' }}
                              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.35)')}
                              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                            >{emoji}</button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Existing reactions */}
                    {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                        {Object.entries(msg.reactions).map(([emoji, users]) => (
                          <button key={emoji} onClick={() => addReaction(msg.id, emoji, currentUser)}
                            style={{
                              background: (users as string[]).includes(currentUser) ? 'var(--accent-dim)' : 'var(--bg-overlay)',
                              border: `1px solid ${(users as string[]).includes(currentUser) ? 'var(--accent-glow)' : 'var(--border-light)'}`,
                              borderRadius: 12, padding: '2px 8px', fontSize: 12, cursor: 'pointer',
                              display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--text-secondary)',
                            }}>
                            {emoji} <span style={{ fontSize: 10, fontWeight: 700 }}>{(users as string[]).length}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {mine && mi === group.messages.length - 1 && (
                      <div style={{ fontSize: 10, color: 'var(--text-dim)', textAlign: 'right' }}>{formatTime(msg.timestamp)}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        })}
        <div />
      </div>

      {/* Input */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
        <input ref={inputRef} type="text" value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
          placeholder={`Message #${activeChannel}…`}
          style={{ flex: 1, background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', color: 'var(--text-primary)', padding: '8px 12px', fontSize: 13 }}
        />
        <button onClick={handleSend} disabled={!text.trim()} style={{ width: 36, height: 36, background: text.trim() ? 'var(--accent)' : 'var(--bg-overlay)', border: 'none', cursor: text.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.15s' }}>
          <Send size={14} color={text.trim() ? 'var(--accent-fg)' : 'var(--text-dim)'} />
        </button>
      </div>
    </div>
  )
}
