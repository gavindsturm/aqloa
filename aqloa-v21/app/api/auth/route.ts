import { NextRequest, NextResponse } from 'next/server'
import { redis, KEYS } from '@/app/lib/redis'
import { createHmac } from 'crypto'
import { TeamMember } from '@/app/dashboard/types'

const SECRET = process.env.INVITE_SECRET ?? 'aqloa-invite-secret-change-in-prod-32chars'
function hashPassword(p: string) { return createHmac('sha256', SECRET).update(p).digest('hex') }

const DEMO_EMAILS = ['joseph@aqloa.com','sarah@aqloa.com','mike@aqloa.com','emily@aqloa.com','kevin@aqloa.com','alex@aqloa.com','priya@aqloa.com','tom@aqloa.com']

// POST /api/auth  — login
export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  if (!email || !password) return NextResponse.json({ success: false, error: 'Email and password required' }, { status: 400 })

  const normalEmail = email.toLowerCase().trim()
  const key = `user_auth:${normalEmail}`
  const stored = await redis.get<{ passwordHash: string }>(key)

  if (!stored) {
    if (DEMO_EMAILS.includes(normalEmail)) {
      return NextResponse.json({ success: true, email: normalEmail })
    }
    // Check if user exists in members (pre-auth user) — let them set a password now
    const members = await redis.get<TeamMember[]>(KEYS.members) ?? []
    const existing = members.find(m => m.email === normalEmail)
    if (existing) {
      // Auto-register their password on first login
      await redis.set(key, { passwordHash: hashPassword(password) })
      return NextResponse.json({ success: true, email: normalEmail })
    }
    return NextResponse.json({ success: false, error: 'No account found. Use an invite link to join, or sign up.' }, { status: 401 })
  }

  if (hashPassword(password) !== stored.passwordHash) {
    return NextResponse.json({ success: false, error: 'Incorrect password.' }, { status: 401 })
  }
  return NextResponse.json({ success: true, email: normalEmail })
}

// PUT /api/auth  — sign up (new account, no invite required for first admin)
export async function PUT(req: NextRequest) {
  const { name, email, password } = await req.json()
  if (!name || !email || !password) return NextResponse.json({ success: false, error: 'Name, email and password required' }, { status: 400 })
  if (password.length < 8) return NextResponse.json({ success: false, error: 'Password must be at least 8 characters' }, { status: 400 })

  const normalEmail = email.toLowerCase().trim()
  const key = `user_auth:${normalEmail}`

  // Don't allow overwriting existing accounts
  const existing = await redis.get<{ passwordHash: string }>(key)
  if (existing) return NextResponse.json({ success: false, error: 'An account with this email already exists. Sign in instead.' }, { status: 409 })

  // Store password hash
  await redis.set(key, { passwordHash: hashPassword(password) })

  // Add to members store
  const members = await redis.get<TeamMember[]>(KEYS.members) ?? []
  const alreadyMember = members.find(m => m.email === normalEmail)
  if (!alreadyMember) {
    const newMember: TeamMember = {
      id: Date.now(), name: name.trim(), email: normalEmail,
      role: 'agent', status: 'active',
      leads: 0, calls: 0, appointments: 0, closed: 0, revenue: 0,
      joinedDate: new Date().toISOString().split('T')[0],
    }
    members.push(newMember)
    await redis.set(KEYS.members, members)
  }

  return NextResponse.json({ success: true, email: normalEmail })
}
