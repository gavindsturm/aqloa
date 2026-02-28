'use client'
import { useState } from 'react'
import { Mail, MessageSquare, Clock, Send, Calendar, Users, Zap, Copy } from 'lucide-react'
import { Lead } from '../types'

interface Props {
  leads: Lead[]
  onSendMessages: (leadIds: number[], type: 'email' | 'sms', message: string, schedule?: string) => void
}

const EMAIL_TEMPLATES = [
  {
    name: 'Introduction',
    subject: 'Your Free Insurance Quote is Ready',
    body: `Hi {name},

Thank you for your interest in life insurance. I've prepared a personalized quote based on your information.

Your preliminary quote: {value}

I'd love to discuss how we can protect your family's future. Are you available for a quick 15-minute call this week?

Best regards,
{agent}`
  },
  {
    name: 'Follow-up',
    subject: 'Following Up on Your Insurance Quote',
    body: `Hi {name},

I wanted to follow up on the quote I sent you earlier. Do you have any questions about the coverage options?

I'm here to help make this process as simple as possible.

When would be a good time to connect?

Best,
{agent}`
  },
  {
    name: 'Special Offer',
    subject: 'Limited Time: Save 15% on Your Premium',
    body: `Hi {name},

Great news! We're currently running a special promotion that could save you 15% on your life insurance premium.

This offer expires in 48 hours. Would you like to schedule a quick call to lock in your savings?

Best regards,
{agent}`
  }
]

const SMS_TEMPLATES = [
  'Hi {name}! Your insurance quote is ready. Can we schedule a quick call this week? Reply YES if interested.',
  '{name}, just following up on your quote. Any questions? Text back or call me anytime.',
  'Hi {name}! Limited time offer - save 15% on your premium. Interested? Reply YES for details.'
]

export default function CRMAutomation({ leads, onSendMessages }: Props) {
  const [messageType, setMessageType] = useState<'email' | 'sms'>('email')
  const [selectedLeads, setSelectedLeads] = useState<number[]>([])
  const [message, setMessage] = useState('')
  const [subject, setSubject] = useState('')
  const [scheduleType, setScheduleType] = useState<'now' | 'scheduled'>('now')
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const filteredLeads = leads.filter(lead => 
    filterStatus === 'all' || lead.status === filterStatus
  )

  const handleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([])
    } else {
      setSelectedLeads(filteredLeads.map(l => l.id))
    }
  }

  const handleSelectTemplate = (template: typeof EMAIL_TEMPLATES[0] | string) => {
    if (messageType === 'email' && typeof template === 'object') {
      setSubject(template.subject)
      setMessage(template.body)
    } else if (typeof template === 'string') {
      setMessage(template)
    }
  }

  const handleSend = () => {
    if (selectedLeads.length === 0) {
      alert('Please select at least one lead')
      return
    }
    if (!message.trim()) {
      alert('Please enter a message')
      return
    }

    const schedule = scheduleType === 'scheduled' ? `${scheduleDate} ${scheduleTime}` : undefined
    onSendMessages(selectedLeads, messageType, message, schedule)
    
    // Reset form
    setSelectedLeads([])
    setMessage('')
    setSubject('')
  }

  return (
    <div className="space-y-6">
      {/* Message Type Selection */}
      <div className="bg-[var(--bg-base)] p-6 rounded-none border border-[var(--border)] shadow-none">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">CRM Automation Center</h2>
        
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => setMessageType('email')}
            className={`flex-1 px-6 py-3 rounded-none font-medium transition-all ${
              messageType === 'email'
                ? 'bg-[var(--accent)] text-black shadow-none'
                : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'
            }`}
          >
            <Mail className="w-5 h-5 inline mr-2" />
            Email Campaign
          </button>
          <button
            onClick={() => setMessageType('sms')}
            className={`flex-1 px-6 py-3 rounded-none font-medium transition-all ${
              messageType === 'sms'
                ? 'bg-[var(--accent)] text-black shadow-none'
                : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'
            }`}
          >
            <MessageSquare className="w-5 h-5 inline mr-2" />
            SMS Campaign
          </button>
        </div>

        {/* Templates */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-[var(--text-primary)] mb-3">
            <Zap className="w-4 h-4 inline mr-1" />
            Quick Templates
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {messageType === 'email' 
              ? EMAIL_TEMPLATES.map((template, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectTemplate(template)}
                    className="p-3 text-left border border-[var(--border-light)] rounded-none hover:border-neutral-400 hover:bg-[var(--bg-deep)] transition-all"
                  >
                    <p className="font-semibold text-sm text-[var(--text-primary)]">{template.name}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">{template.body.substring(0, 60)}...</p>
                  </button>
                ))
              : SMS_TEMPLATES.map((template, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectTemplate(template)}
                    className="p-3 text-left border border-[var(--border-light)] rounded-none hover:border-neutral-400 hover:bg-[var(--bg-deep)] transition-all"
                  >
                    <p className="text-xs text-[var(--text-primary)] line-clamp-3">{template}</p>
                  </button>
                ))
            }
          </div>
        </div>

        {/* Message Composer */}
        {messageType === 'email' && (
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
              Email Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2 border border-[var(--border-light)] rounded-none focus:outline-none focus:border-[var(--accent)]"
              placeholder="Enter email subject..."
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
            Message Content
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full h-40 px-4 py-3 border border-[var(--border-light)] rounded-none focus:outline-none focus:border-[var(--accent)]"
            placeholder={messageType === 'email' ? 'Type your email message...' : 'Type your SMS message (160 char limit)...'}
            maxLength={messageType === 'sms' ? 160 : undefined}
          />
          {messageType === 'sms' && (
            <p className="text-xs text-[var(--text-muted)] mt-1">{message.length} / 160 characters</p>
          )}
          <p className="text-xs text-[var(--text-muted)] mt-2">
            Use placeholders: {'{name}'}, {'{value}'}, {'{agent}'}
          </p>
        </div>

        {/* Scheduling */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-[var(--text-primary)] mb-3">
            <Clock className="w-4 h-4 inline mr-1" />
            Send Timing
          </label>
          <div className="flex items-center space-x-4 mb-3">
            <button
              onClick={() => setScheduleType('now')}
              className={`px-4 py-2 rounded-none text-sm font-medium ${
                scheduleType === 'now'
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-[var(--bg-surface)] text-[var(--text-secondary)]'
              }`}
            >
              Send Now
            </button>
            <button
              onClick={() => setScheduleType('scheduled')}
              className={`px-4 py-2 rounded-none text-sm font-medium ${
                scheduleType === 'scheduled'
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-[var(--bg-surface)] text-[var(--text-secondary)]'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-1" />
              Schedule for Later
            </button>
          </div>
          
          {scheduleType === 'scheduled' && (
            <div className="flex space-x-3">
              <input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="px-3 py-2 border border-[var(--border-light)] rounded-none"
              />
              <input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="px-3 py-2 border border-[var(--border-light)] rounded-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* Recipient Selection */}
      <div className="bg-[var(--bg-base)] p-6 rounded-none border border-[var(--border)] shadow-none">
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-1">
            <Users className="w-4 h-4" />
            Select Recipients
            <span className="ml-1 px-2 py-0.5 bg-[var(--bg-surface)] text-[var(--text-secondary)] rounded-full text-xs font-bold">{selectedLeads.length} selected</span>
          </label>
          <button
            onClick={handleSelectAll}
            className="px-4 py-1.5 text-xs font-semibold bg-[var(--accent)] text-black rounded-full hover:bg-[var(--bg-elevated)] transition-colors"
          >
            {selectedLeads.length === filteredLeads.length && filteredLeads.length > 0 ? 'Deselect All' : 'Select All'}
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {(['all', 'new', 'contacted', 'qualified'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                filterStatus === status
                  ? status === 'all'
                    ? 'bg-[var(--accent)] text-black border-neutral-900'
                    : status === 'new'
                    ? 'bg-[var(--accent)] text-black border-[var(--accent)]'
                    : status === 'contacted'
                    ? 'bg-[var(--border-light)] text-[var(--text-secondary)] border-[rgba(255,255,255,0.20)]'
                    : 'bg-[var(--accent)] text-black border-[var(--accent)]'
                  : 'bg-[var(--bg-base)] text-[var(--text-muted)] border-[var(--border-light)] hover:border-neutral-400 hover:bg-[var(--bg-deep)]'
              }`}
            >
              {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
        
        <div className="max-h-64 overflow-y-auto border border-[var(--border)] rounded-none p-3 space-y-2">
          {filteredLeads.map(lead => (
            <label 
              key={lead.id} 
              className="flex items-center space-x-3 cursor-pointer hover:bg-[var(--bg-deep)] p-2 rounded transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedLeads.includes(lead.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedLeads([...selectedLeads, lead.id])
                  } else {
                    setSelectedLeads(selectedLeads.filter(id => id !== lead.id))
                  }
                }}
                className="w-4 h-4 rounded"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)]">{lead.name}</p>
                <p className="text-xs text-[var(--text-muted)] truncate">{lead.email} • {lead.status}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Send Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSend}
          disabled={selectedLeads.length === 0 || !message.trim()}
          className="px-8 py-3 bg-[var(--accent)] text-black rounded-none font-semibold hover:bg-[var(--accent)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-none"
        >
          <Send className="w-5 h-5" />
          <span>
            {scheduleType === 'scheduled' 
              ? `Schedule ${messageType === 'email' ? 'Emails' : 'Messages'}`
              : `Send ${messageType === 'email' ? 'Emails' : 'Messages'} Now`
            }
          </span>
        </button>
      </div>
    </div>
  )
}
