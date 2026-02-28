import { NextRequest, NextResponse } from 'next/server'
import { generateInviteToken, listPendingInvites, revokeToken } from '@/app/lib/tokenStore'

// Rate limit: max 10 invites per org per hour (in-memory — acceptable, just throttling)
const RATE_LIMIT = new Map<string, number[]>()

function checkRateLimit(orgId: string): boolean {
  const now = Date.now()
  const window = 3_600_000
  const hits = (RATE_LIMIT.get(orgId) ?? []).filter(t => now - t < window)
  if (hits.length >= 10) return false
  RATE_LIMIT.set(orgId, [...hits, now])
  return true
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, role, invitedBy, invitedByName, orgId } = body

    if (!email || !role || !invitedBy || !orgId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (!['agent', 'manager', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }
    if (!checkRateLimit(orgId)) {
      return NextResponse.json({ error: 'Rate limit exceeded. Max 10 invites per hour.' }, { status: 429 })
    }

    const record = await generateInviteToken({
      email: email.toLowerCase().trim(),
      role,
      invitedBy,
      invitedByName: invitedByName ?? invitedBy,
      orgId,
      expiresAt: Date.now() + 48 * 3_600_000,
    })

    const baseUrl = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000'
    const inviteUrl = `${baseUrl}/join?token=${encodeURIComponent(record.token)}`

    return NextResponse.json({
      success: true,
      inviteUrl,
      expiresAt: record.expiresAt,
      email: record.email,
      role: record.role,
    })
  } catch (err) {
    console.error('Invite generation error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const orgId = req.nextUrl.searchParams.get('orgId')
  if (!orgId) return NextResponse.json({ error: 'orgId required' }, { status: 400 })

  const pending = await listPendingInvites(orgId)
  return NextResponse.json({
    invites: pending.map(r => ({
      email: r.email,
      role: r.role,
      invitedBy: r.invitedByName,
      expiresAt: r.expiresAt,
      createdAt: r.createdAt,
      token: r.token,
    })),
  })
}

export async function DELETE(req: NextRequest) {
  const { token } = await req.json()
  if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 })
  const revoked = await revokeToken(token)
  return NextResponse.json({ success: revoked })
}
