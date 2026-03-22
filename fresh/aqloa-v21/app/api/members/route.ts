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

async function getMembers(): Promise<TeamMember[]> {
  const stored = await redis.get<TeamMember[]>(KEYS.members)
  return stored ?? []
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

// POST /api/members  — add or update a member (deep merge so partial patches don't wipe fields)
export async function POST(req: NextRequest) {
  try {
    const patch = await req.json()
    const members = await getMembers()
    // Match by email first, then id
    const idx = patch.email
      ? members.findIndex(m => m.email === patch.email)
      : patch.id ? members.findIndex(m => m.id === patch.id) : -1

    if (idx >= 0) {
      // Deep merge — keep existing fields, overlay with patch
      members[idx] = { ...members[idx], ...patch }
    } else {
      members.push(patch as TeamMember)
    }
    await redis.set(KEYS.members, members)
    return NextResponse.json({ success: true, member: idx >= 0 ? members[idx] : patch })
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
