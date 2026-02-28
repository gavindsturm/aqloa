import { NextRequest, NextResponse } from 'next/server'
import { redis, KEYS } from '@/app/lib/redis'
import { Appointment } from '@/app/dashboard/types'

async function getSharedAppointments(): Promise<Appointment[]> {
  const stored = await redis.get<Appointment[]>(KEYS.appointments)
  return stored ?? []
}

// GET — return all shared appointments
export async function GET() {
  try {
    const appointments = await getSharedAppointments()
    return NextResponse.json({ appointments })
  } catch (err) {
    console.error('GET /api/appointments error:', err)
    return NextResponse.json({ error: 'Failed to load appointments' }, { status: 500 })
  }
}

// POST — create or update a shared appointment
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const apt: Appointment = body.appointment
    if (!apt?.id || !apt?.date) {
      return NextResponse.json({ error: 'Invalid appointment' }, { status: 400 })
    }
    const current = await getSharedAppointments()
    const exists = current.find(a => a.id === apt.id)
    const updated = exists
      ? current.map(a => a.id === apt.id ? apt : a)
      : [...current, apt]
    await redis.set(KEYS.appointments, updated)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('POST /api/appointments error:', err)
    return NextResponse.json({ error: 'Failed to save appointment' }, { status: 500 })
  }
}

// DELETE — remove a shared appointment by id
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    const current = await getSharedAppointments()
    await redis.set(KEYS.appointments, current.filter(a => a.id !== id))
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/appointments error:', err)
    return NextResponse.json({ error: 'Failed to delete appointment' }, { status: 500 })
  }
}
