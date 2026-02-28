import { NextRequest, NextResponse } from 'next/server'
import { redis, KEYS } from '@/app/lib/redis'
import { ChatMessage } from '@/app/context/TeamContext'

const SEED_MESSAGES: ChatMessage[] = [
  { id: '1', sender: 'Sarah Mitchell', senderEmail: 'sarah@aqloa.com', initials: 'SM', text: 'Great job on that big sale today, Mike! 🎉', timestamp: Date.now() - 3_600_000, channel: 'general', reactions: { '🔥': ['mike@aqloa.com'] } },
  { id: '2', sender: 'Mike Chen', senderEmail: 'mike@aqloa.com', initials: 'MC', text: 'Thanks! The premium calculator really helped close the deal.', timestamp: Date.now() - 3_480_000, channel: 'general' },
  { id: '3', sender: 'Joseph Asmann', senderEmail: 'joseph@aqloa.com', initials: 'JA', text: 'Anyone have tips for handling objections about premium costs?', timestamp: Date.now() - 2_700_000, channel: 'general' },
  { id: '4', sender: 'Emily Rodriguez', senderEmail: 'emily@aqloa.com', initials: 'ER', text: "I show them the monthly breakdown vs their coffee budget. Works every time!", timestamp: Date.now() - 2_600_000, channel: 'general', reactions: { '😂': ['mike@aqloa.com', 'sarah@aqloa.com'], '👍': ['kevin@aqloa.com'] } },
  { id: '5', sender: 'Sarah Mitchell', senderEmail: 'sarah@aqloa.com', initials: 'SM', text: 'Big lead coming in — $2M policy. Anyone available for a three-way call tomorrow?', timestamp: Date.now() - 1_800_000, channel: 'sales' },
  { id: '6', sender: 'Kevin Park', senderEmail: 'kevin@aqloa.com', initials: 'KP', text: "I'm available 10am–2pm EST", timestamp: Date.now() - 1_700_000, channel: 'sales' },
]

async function getMessages(): Promise<ChatMessage[]> {
  const stored = await redis.get<ChatMessage[]>(KEYS.messages)
  if (!stored) {
    await redis.set(KEYS.messages, SEED_MESSAGES)
    return SEED_MESSAGES
  }
  return stored
}

// GET /api/chat?since=timestamp  — poll for new messages
export async function GET(req: NextRequest) {
  try {
    const since = Number(req.nextUrl.searchParams.get('since') ?? 0)
    const messages = await getMessages()
    const filtered = since > 0 ? messages.filter(m => m.timestamp > since) : messages
    return NextResponse.json({ messages: filtered, serverTime: Date.now() })
  } catch (err) {
    console.error('GET /api/chat error:', err)
    return NextResponse.json({ error: 'Failed to load messages' }, { status: 500 })
  }
}

// POST /api/chat  — send a message or update reactions
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const messages = await getMessages()

    if (body.type === 'reaction') {
      // Toggle reaction on existing message
      const { msgId, emoji, userEmail } = body
      const updated = messages.map((m: ChatMessage) => {
        if (m.id !== msgId) return m
        const reactions = { ...(m.reactions ?? {}) }
        const users = reactions[emoji] ?? []
        reactions[emoji] = users.includes(userEmail)
          ? users.filter((u: string) => u !== userEmail)
          : [...users, userEmail]
        if (reactions[emoji].length === 0) delete reactions[emoji]
        return { ...m, reactions }
      })
      await redis.set(KEYS.messages, updated)
      return NextResponse.json({ success: true })
    }

    // New message
    const msg: ChatMessage = body.message
    if (!msg?.id || !msg?.text) {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 })
    }
    // Keep last 500 messages max
    const updated = [...messages, msg].slice(-500)
    await redis.set(KEYS.messages, updated)
    return NextResponse.json({ success: true, message: msg })
  } catch (err) {
    console.error('POST /api/chat error:', err)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
