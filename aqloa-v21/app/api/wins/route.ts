import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/app/lib/redis'

export interface WinRecord {
  id: string
  agentName: string
  agentEmail: string
  leadName: string
  insuranceType: string
  annualPremium: number
  closedAt: number
}

const WINS_KEY = 'org:wins'

async function getWins(): Promise<WinRecord[]> {
  return await redis.get<WinRecord[]>(WINS_KEY) ?? []
}

export async function GET() {
  const wins = await getWins()
  return NextResponse.json({ wins: wins.slice(-50).reverse() }) // last 50, newest first
}

export async function POST(req: NextRequest) {
  const win: WinRecord = await req.json()
  const wins = await getWins()
  wins.push(win)
  await redis.set(WINS_KEY, wins.slice(-200)) // keep last 200
  return NextResponse.json({ success: true })
}
