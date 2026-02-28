import { NextRequest, NextResponse } from 'next/server'
import { redis, KEYS } from '@/app/lib/redis'
import { TeamMember } from '@/app/dashboard/types'

const SEED_MEMBERS: TeamMember[] = [
  { id: 100, name: 'Joseph Asmann',   email: 'joseph@aqloa.com',  role: 'admin',   status: 'active', leads: 0, calls: 0, appointments: 0, closed: 0, revenue: 0, joinedDate: '2024-01-15' },
  { id: 101, name: 'Sarah Mitchell',  email: 'sarah@aqloa.com',   role: 'manager', status: 'active', leads: 0, calls: 0, appointments: 0, closed: 0, revenue: 0, joinedDate: '2024-02-01' },
  { id: 102, name: 'Mike Chen',       email: 'mike@aqloa.com',    role: 'agent',   status: 'active', leads: 0, calls: 0, appointments: 0, closed: 0, revenue: 0, joinedDate: '2024-03-10' },
  { id: 103, name: 'Emily Rodriguez', email: 'emily@aqloa.com',   role: 'agent',   status: 'active', leads: 0, calls: 0, appointments: 0, closed: 0, revenue: 0, joinedDate: '2024-04-05' },
  { id: 104, name: 'Kevin Park',      email: 'kevin@aqloa.com',   role: 'agent',   status: 'active', leads: 0, calls: 0, appointments: 0, closed: 0, revenue: 0, joinedDate: '2024-05-12' },
  { id: 200, name: 'Alex Turner',     email: 'alex@aqloa.com',    role: 'agent',   status: 'active', leads: 0, calls: 0, appointments: 0, closed: 0, revenue: 0, joinedDate: '2024-03-01' },
  { id: 201, name: 'Priya Nair',      email: 'priya@aqloa.com',   role: 'agent',   status: 'active', leads: 0, calls: 0, appointments: 0, closed: 0, revenue: 0, joinedDate: '2024-04-15' },
  { id: 202, name: 'Tom Bradley',     email: 'tom@aqloa.com',     role: 'agent',   status: 'pending',leads: 0, calls: 0, appointments: 0, closed: 0, revenue: 0, joinedDate: '2024-06-10' },
]

const SEED_VERSION = 'v2-reset' // bump this to force a re-seed

async function getMembers(): Promise<TeamMember[]> {
  // Check if we've seeded this version already
  const seededVersion = await redis.get<string>('seed_version')
  if (seededVersion !== SEED_VERSION) {
    // Re-seed: wipe old data and start fresh with zeroed metrics
    await redis.set(KEYS.members, SEED_MEMBERS)
    await redis.set('seed_version', SEED_VERSION)
    return SEED_MEMBERS
  }
  const stored = await redis.get<TeamMember[]>(KEYS.members)
  if (!stored || stored.length === 0) {
    await redis.set(KEYS.members, SEED_MEMBERS)
    return SEED_MEMBERS
  }
  // Merge: ensure seed members always exist but preserve their updated stats
  const merged = [...SEED_MEMBERS]
  stored.forEach(m => {
    const idx = merged.findIndex(x => x.email === m.email)
    if (idx >= 0) merged[idx] = m
    else merged.push(m)
  })
  return merged
}

// GET /api/members
export async function GET() {
  try {
    const members = await getMembers()
    return NextResponse.json({ members })
  } catch (err) {
    console.error('GET /api/members error:', err)
    return NextResponse.json({ error: 'Failed to load members' }, { status: 500 })
  }
}

// POST /api/members  — add or update a member
export async function POST(req: NextRequest) {
  try {
    const member: TeamMember = await req.json()
    const members = await getMembers()
    const idx = members.findIndex(m => m.email === member.email)
    if (idx >= 0) members[idx] = member
    else members.push(member)
    await redis.set(KEYS.members, members)
    return NextResponse.json({ success: true, member })
  } catch (err) {
    console.error('POST /api/members error:', err)
    return NextResponse.json({ error: 'Failed to save member' }, { status: 500 })
  }
}

// DELETE /api/members?id=xxx
export async function DELETE(req: NextRequest) {
  try {
    const id = Number(req.nextUrl.searchParams.get('id'))
    const members = await getMembers()
    const updated = members.filter(m => m.id !== id)
    await redis.set(KEYS.members, updated)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/members error:', err)
    return NextResponse.json({ error: 'Failed to delete member' }, { status: 500 })
  }
}
