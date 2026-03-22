import { NextRequest, NextResponse } from 'next/server'
import { validateToken, consumeToken } from '@/app/lib/tokenStore'
import { redis } from '@/app/lib/redis'
import { createHmac } from 'crypto'

const SECRET = process.env.INVITE_SECRET ?? 'aqloa-invite-secret-change-in-prod-32chars'
function hashPassword(p: string) { return createHmac('sha256', SECRET).update(p).digest('hex') }

export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } }
) {
  const token = decodeURIComponent(params.token)
  const result = await validateToken(token)

  if (!result.valid) {
    const messages: Record<string, string> = {
      not_found:    'This invite link does not exist.',
      expired:      'This invite link has expired (links are valid for 48 hours).',
      already_used: 'This invite link has already been used.',
      invalid_sig:  'This invite link is invalid or has been tampered with.',
    }
    return NextResponse.json(
      { valid: false, reason: result.reason, message: messages[result.reason] },
      { status: 400 }
    )
  }

  const { record } = result
  return NextResponse.json({
    valid: true,
    email: record.email,
    role: record.role,
    invitedByName: record.invitedByName,
    invitedBy: record.invitedBy,
    orgId: record.orgId,
    expiresAt: record.expiresAt,
    minutesRemaining: Math.floor((record.expiresAt - Date.now()) / 60_000),
  })
}

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  const token = decodeURIComponent(params.token)

  const preview = await validateToken(token)
  if (!preview.valid) {
    return NextResponse.json({ success: false, reason: preview.reason }, { status: 400 })
  }

  const body = await req.json().catch(() => ({}))
  const { name, password } = body
  if (!name || !password) {
    return NextResponse.json({ success: false, error: 'Name and password required' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ success: false, error: 'Password must be at least 8 characters' }, { status: 400 })
  }

  const consumed = await consumeToken(token)
  if (!consumed) {
    return NextResponse.json({ success: false, reason: 'already_used' }, { status: 409 })
  }

  const { record } = preview

  // Store password hash — keyed by the INVITED email, not the inviter
  const authKey = `user_auth:${record.email.toLowerCase()}`
  await redis.set(authKey, { passwordHash: hashPassword(password) })

  const newMember = {
    id: Date.now(),
    name: name.trim(),
    email: record.email,          // <-- INVITED person's email, not the inviter's
    role: record.role,
    status: 'active' as const,
    invitedBy: record.invitedBy,
    orgId: record.orgId,
    joinedDate: new Date().toISOString().split('T')[0],
    leads: 0, calls: 0, appointments: 0, closed: 0, revenue: 0,
  }

  return NextResponse.json({ success: true, member: newMember })
}
