import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/app/lib/redis'
import { Lead } from '@/app/dashboard/types'

function leadsKey(email: string) {
  return `user:leads:${email.toLowerCase().trim()}`
}

// GET /api/leads?email=xxx
export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get('email')
    if (!email) return NextResponse.json({ leads: [] })
    const leads = await redis.get<Lead[]>(leadsKey(email)) ?? []
    return NextResponse.json({ leads })
  } catch (err) {
    return NextResponse.json({ leads: [] })
  }
}

// POST /api/leads — save full leads array for a user
export async function POST(req: NextRequest) {
  try {
    const { email, leads } = await req.json()
    if (!email || !Array.isArray(leads)) return NextResponse.json({ error: 'bad request' }, { status: 400 })
    await redis.set(leadsKey(email), leads)
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
