'use client'
import { useState } from 'react'
import { X, UserPlus, Calendar, Phone, DollarSign, Users, CheckCheck, Trash2, Check } from 'lucide-react'

interface Notification {
  id: number; type: string; title: string; message: string; time: string; read: boolean
}
interface Props { isOpen: boolean; onClose: () => void }

const INITIAL: Notification[] = [
  { id: 1, type: 'lead', title: 'New Lead Assigned', message: 'John Patterson from Facebook Ads has been assigned to you', time: '5 min ago', read: false },
  { id: 2, type: 'appointment', title: 'Upcoming Appointment', message: 'Meeting with Maria Garcia in 30 minutes', time: '10 min ago', read: false },
  { id: 3, type: 'team', title: 'Team Member Joined', message: 'Emily Rodriguez has accepted your invitation', time: '1 hour ago', read: false },
  { id: 4, type: 'revenue', title: 'Commission Milestone', message: 'You have reached $50K in revenue this month', time: '2 hours ago', read: true },
  { id: 5, type: 'call', title: 'Missed Call', message: 'Missed call from Thomas Lee at 2:30 PM', time: '3 hours ago', read: true },
]

const TYPE_CONFIG: Record<string, { icon: any; color: string }> = {
  lead:        { icon: UserPlus,  color: 'var(--accent)' },
  appointment: { icon: Calendar,  color: 'var(--purple)' },
  call:        { icon: Phone,     color: 'var(--amber)' },
  revenue:     { icon: DollarSign,color: 'var(--accent)' },
  team:        { icon: Users,     color: 'var(--accent)' },
}

export default function NotificationsPanel({ isOpen, onClose }: Props) {
  const [notifications, setNotifications] = useState(INITIAL)
  const unread = notifications.filter(n => !n.read).length

  return (
    <div className={`panel-slide-right ${isOpen ? 'open' : 'closed'}`}>
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 flex-shrink-0" style={{borderBottom: '1px solid var(--border)'}}>
          <div>
            <h2 style={{color: 'var(--text-primary)', fontWeight: 700, fontSize: 18}}>Notifications</h2>
            {unread > 0 && <p style={{color: 'var(--text-muted)', fontSize: 12, marginTop: 2}}>{unread} unread</p>}
          </div>
          <div className="flex items-center gap-2">
            {unread > 0 && (
              <button onClick={() => setNotifications(p => p.map(n => ({...n, read: true})))}
                style={{background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4}}>
                <CheckCheck size={14}/> Mark all read
              </button>
            )}
            <button onClick={onClose} style={{background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', borderRadius: 0, cursor: 'pointer', padding: 6, color: 'var(--text-muted)', display: 'flex'}}>
              <X size={16}/>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {notifications.length === 0 ? (
            <div className="text-center py-16" style={{color: 'var(--text-muted)', fontSize: 13}}>No notifications</div>
          ) : notifications.map(n => {
            const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.team
            const Icon = cfg.icon
            return (
              <div key={n.id} className="flex items-start gap-3 px-6 py-4 transition-all group" style={{background: !n.read ? 'rgba(207,69,0,0.03)' : 'transparent', borderBottom: '1px solid var(--border)'}}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                onMouseLeave={e => (e.currentTarget.style.background = !n.read ? 'rgba(207,69,0,0.03)' : 'transparent')}
              >
                <div style={{width: 34, height: 34, borderRadius: 0, background: `${cfg.color}18`, border: `1px solid ${cfg.color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2}}>
                  <Icon size={15} style={{color: cfg.color}}/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p style={{color: 'var(--text-primary)', fontSize: 13, fontWeight: n.read ? 400 : 600}}>{n.title}</p>
                    {!n.read && <span style={{width: 7, height: 7, background: 'var(--accent)', borderRadius: '50%', flexShrink: 0, marginTop: 4}}/>}
                  </div>
                  <p style={{color: 'var(--text-muted)', fontSize: 12, marginTop: 2, lineHeight: 1.4}}>{n.message}</p>
                  <p style={{color: 'var(--text-muted)', fontSize: 11, marginTop: 4}}>{n.time}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  {!n.read && <button onClick={() => setNotifications(p => p.map(x => x.id === n.id ? {...x, read: true} : x))}
                    style={{padding: 5, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex'}}><Check size={13}/></button>}
                  <button onClick={() => setNotifications(p => p.filter(x => x.id !== n.id))}
                    style={{padding: 5, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex'}}><Trash2 size={13}/></button>
                </div>
              </div>
            )
          })}
        </div>

        {notifications.length > 0 && (
          <div className="px-6 py-4 flex-shrink-0" style={{borderTop: '1px solid var(--border)'}}>
            <button onClick={() => setNotifications([])}
              style={{background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4}}>
              <Trash2 size={13}/> Clear all notifications
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
