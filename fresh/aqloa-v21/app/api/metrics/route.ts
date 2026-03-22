import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/app/lib/redis'

// Per-user daily metrics — keyed by email, stores rolling 6-month history
function metricsKey(email: string) {
  return `user:metrics:${email.toLowerCase().trim()}`
}

export interface DailyMetrics {
  date: string           // YYYY-MM-DD
  dials: number
  apps: number
  closed: number
  revenue: number
  onlineMinutes: number
}

export interface UserMetrics {
  totalRevenue: number
  totalClosed: number
  today: DailyMetrics
  history: DailyMetrics[]  // last 6 months, one entry per month
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function monthStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

// GET /api/metrics?email=xxx
export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get('email')
    if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 })
    const metrics = await redis.get<UserMetrics>(metricsKey(email))
    if (!metrics) {
      // First time — return empty
      const empty: UserMetrics = {
        totalRevenue: 0, totalClosed: 0,
        today: { date: todayStr(), dials: 0, apps: 0, closed: 0, revenue: 0, onlineMinutes: 0 },
        history: [],
      }
      return NextResponse.json({ metrics: empty })
    }
    // If today field is stale, reset it (new day)
    if (metrics.today.date !== todayStr()) {
      // Archive the old day into history by month
      const old = metrics.today
      const oldMonth = old.date.substring(0, 7)
      const existing = metrics.history.find(h => h.date === oldMonth)
      if (existing) {
        existing.dials += old.dials
        existing.apps += old.apps
        existing.closed += old.closed
        existing.revenue += old.revenue
      } else {
        metrics.history.push({ date: oldMonth, dials: old.dials, apps: old.apps, closed: old.closed, revenue: old.revenue, onlineMinutes: old.onlineMinutes })
      }
      // Keep last 6 months
      metrics.history = metrics.history.slice(-6)
      metrics.today = { date: todayStr(), dials: 0, apps: 0, closed: 0, revenue: 0, onlineMinutes: 0 }
      await redis.set(metricsKey(email), metrics)
    }
    return NextResponse.json({ metrics })
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// POST /api/metrics — patch user metrics
export async function POST(req: NextRequest) {
  try {
    const { email, patch } = await req.json()
    if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 })

    const existing = await redis.get<UserMetrics>(metricsKey(email))
    const today = todayStr()

    const base: UserMetrics = existing ?? {
      totalRevenue: 0, totalClosed: 0,
      today: { date: today, dials: 0, apps: 0, closed: 0, revenue: 0, onlineMinutes: 0 },
      history: [],
    }

    // Reset today if stale
    if (base.today.date !== today) {
      base.today = { date: today, dials: 0, apps: 0, closed: 0, revenue: 0, onlineMinutes: 0 }
    }

    // Apply patch
    if (patch.today) base.today = { ...base.today, ...patch.today }
    if (patch.totalRevenue !== undefined) base.totalRevenue = patch.totalRevenue
    if (patch.totalClosed !== undefined) base.totalClosed = patch.totalClosed

    await redis.set(metricsKey(email), base)
    return NextResponse.json({ success: true, metrics: base })
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
