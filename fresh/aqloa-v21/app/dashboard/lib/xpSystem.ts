// ─── XP & BADGE SYSTEM ───────────────────────────────────────────────────────

export interface BadgeDefinition {
  id: string
  name: string
  emoji: string
  description: string
  howToEarn: string
  category: 'sales' | 'activity' | 'team' | 'streak' | 'milestone'
  xpReward: number
}

export interface EarnedBadge {
  id: string
  earnedAt: string // ISO
}

export const XP_EVENTS: Record<string, number> = {
  close_deal:       150,
  hit_daily_dials:   50,
  hit_daily_apps:    75,
  hit_all_goals:    100,
  send_chat_msg:      5,
  book_appointment:  30,
  send_email:        10,
  log_call:          10,
  add_lead:           5,
  invite_agent:     100,
  add_to_calendar:   15,
  run_eligibility:   20,
  save_notes:         5,
  streak_day:        25,
}

export const RANK_TIERS = [
  { min: 0,      name: 'Rookie',     color: '#64748b', glow: 'rgba(100,116,139,0.3)', badge: '◈', label: 'RK' },
  { min: 500,    name: 'Agent',      color: '#60a5fa', glow: 'rgba(96,165,250,0.3)',  badge: '◆', label: 'AG' },
  { min: 1500,   name: 'Producer',   color: '#34d399', glow: 'rgba(52,211,153,0.3)',  badge: '❖', label: 'PR' },
  { min: 3500,   name: 'Senior',     color: '#a78bfa', glow: 'rgba(167,139,250,0.3)', badge: '✦', label: 'SR' },
  { min: 7000,   name: 'Elite',      color: '#f59e0b', glow: 'rgba(245,158,11,0.3)',  badge: '★', label: 'EL' },
  { min: 13000,  name: 'Director',   color: '#f97316', glow: 'rgba(249,115,22,0.3)',  badge: '⬡', label: 'DR' },
  { min: 25000,  name: 'VP',         color: '#ef4444', glow: 'rgba(239,68,68,0.3)',   badge: '⬟', label: 'VP' },
  { min: 50000,  name: 'Legend',     color: '#d4af37', glow: 'rgba(212,175,55,0.4)',  badge: '♛', label: 'LG' },
]

export function getRank(xp: number) {
  let rank = RANK_TIERS[0]
  for (const tier of RANK_TIERS) {
    if (xp >= tier.min) rank = tier
  }
  return rank
}

export function getLevelFromXp(xp: number) {
  return Math.floor(xp / 500) + 1
}

export function getXpProgress(xp: number) {
  const levelXp = Math.floor(xp / 500) * 500
  return { earned: xp - levelXp, needed: 500, pct: ((xp - levelXp) / 500) * 100 }
}

export const ALL_BADGES: BadgeDefinition[] = [
  // ─── Sales ───────────────────────────────────────────────────────────────
  {
    id: 'first_close', name: 'First Blood', emoji: '🎯', category: 'sales', xpReward: 200,
    description: 'Closed your first deal.',
    howToEarn: 'Close any deal from a lead.',
  },
  {
    id: 'closer_5', name: 'On a Roll', emoji: '🔥', category: 'sales', xpReward: 300,
    description: 'Closed 5 deals total.',
    howToEarn: 'Close 5 deals (cumulative).',
  },
  {
    id: 'closer_25', name: 'Deal Machine', emoji: '💰', category: 'sales', xpReward: 500,
    description: 'Closed 25 deals total.',
    howToEarn: 'Close 25 deals (cumulative).',
  },
  {
    id: 'closer_100', name: 'Centurion', emoji: '⚔️', category: 'sales', xpReward: 1000,
    description: 'Closed 100 deals. An elite milestone.',
    howToEarn: 'Close 100 deals (cumulative).',
  },
  {
    id: 'revenue_10k', name: 'Five-Figure Club', emoji: '💵', category: 'sales', xpReward: 400,
    description: 'Generated $10,000+ in annual premium.',
    howToEarn: 'Accumulate $10,000 in closed deal revenue.',
  },
  {
    id: 'revenue_100k', name: 'Six-Figure Club', emoji: '🏦', category: 'sales', xpReward: 1000,
    description: 'Generated $100,000+ in annual premium.',
    howToEarn: 'Accumulate $100,000 in closed deal revenue.',
  },
  {
    id: 'fex_specialist', name: 'FEX Specialist', emoji: '🛡️', category: 'sales', xpReward: 350,
    description: 'Expert in Final Expense products.',
    howToEarn: 'Close 10 FEX policies.',
  },
  {
    id: 'iul_pro', name: 'IUL Pro', emoji: '📈', category: 'sales', xpReward: 400,
    description: 'Mastered Indexed Universal Life.',
    howToEarn: 'Close 5 IUL policies.',
  },
  {
    id: 'term_closer', name: 'Term Titan', emoji: '📋', category: 'sales', xpReward: 300,
    description: 'Consistent term life closer.',
    howToEarn: 'Close 10 Term Life policies.',
  },
  // ─── Activity ─────────────────────────────────────────────────────────────
  {
    id: 'dialer_100', name: 'Phone Warrior', emoji: '📞', category: 'activity', xpReward: 250,
    description: 'Logged 100 calls.',
    howToEarn: 'Use the Call Lead button 100 times.',
  },
  {
    id: 'dialer_500', name: 'Dialing Machine', emoji: '☎️', category: 'activity', xpReward: 500,
    description: 'Logged 500 calls.',
    howToEarn: 'Use the Call Lead button 500 times.',
  },
  {
    id: 'emailer_50', name: 'Inbox Hero', emoji: '📧', category: 'activity', xpReward: 150,
    description: 'Sent 50 emails to leads.',
    howToEarn: 'Use the Send Email button 50 times.',
  },
  {
    id: 'appointments_10', name: 'Calendar King', emoji: '📅', category: 'activity', xpReward: 200,
    description: 'Booked 10 appointments.',
    howToEarn: 'Add 10 appointments to your calendar.',
  },
  {
    id: 'appointments_50', name: 'Scheduling Legend', emoji: '🗓️', category: 'activity', xpReward: 400,
    description: 'Booked 50 appointments.',
    howToEarn: 'Add 50 appointments to your calendar.',
  },
  {
    id: 'leads_25', name: 'Lead Magnet', emoji: '🧲', category: 'activity', xpReward: 150,
    description: 'Added 25 leads to your pipeline.',
    howToEarn: 'Import or add 25 leads.',
  },
  {
    id: 'leads_100', name: 'Pipeline Builder', emoji: '🚰', category: 'activity', xpReward: 350,
    description: 'Built a pipeline of 100 leads.',
    howToEarn: 'Import or add 100 leads.',
  },
  {
    id: 'eligibility_run', name: 'Underwriter', emoji: '🔍', category: 'activity', xpReward: 75,
    description: 'Ran 10 eligibility screens.',
    howToEarn: 'Run the Eligibility Screener 10 times.',
  },
  {
    id: 'goals_first', name: 'Goal Crusher', emoji: '🎯', category: 'activity', xpReward: 150,
    description: 'Hit all 3 daily goals in a single day.',
    howToEarn: 'Complete Dials, Applications, and Deals Closed goals in one day.',
  },
  {
    id: 'goals_week', name: 'Perfect Week', emoji: '💪', category: 'activity', xpReward: 400,
    description: 'Hit all daily goals 5 days in a row.',
    howToEarn: 'Complete all daily goals 5 consecutive days.',
  },
  // ─── Team ─────────────────────────────────────────────────────────────────
  {
    id: 'team_chat_10', name: 'Team Player', emoji: '💬', category: 'team', xpReward: 75,
    description: 'Active participant in team chat.',
    howToEarn: 'Send 10 messages in team chat.',
  },
  {
    id: 'team_chat_100', name: 'Community Builder', emoji: '🏘️', category: 'team', xpReward: 200,
    description: 'A voice the team relies on.',
    howToEarn: 'Send 100 messages in team chat.',
  },
  {
    id: 'recruiter_1', name: 'Talent Scout', emoji: '🤝', category: 'team', xpReward: 200,
    description: 'Grew the team by inviting an agent.',
    howToEarn: 'Invite your first agent to join Aqloa.',
  },
  {
    id: 'recruiter_5', name: 'Team Builder', emoji: '👥', category: 'team', xpReward: 500,
    description: 'Built a downline of 5 agents.',
    howToEarn: 'Have 5 agents join under your invite link.',
  },
  // ─── Streak ───────────────────────────────────────────────────────────────
  {
    id: 'streak_3', name: 'Hat Trick', emoji: '🎩', category: 'streak', xpReward: 75,
    description: 'Active 3 days in a row.',
    howToEarn: 'Log in and take action 3 consecutive days.',
  },
  {
    id: 'streak_7', name: 'Week Warrior', emoji: '🗡️', category: 'streak', xpReward: 200,
    description: 'Active 7 days in a row.',
    howToEarn: 'Log in and take action 7 consecutive days.',
  },
  {
    id: 'streak_30', name: 'Ironclad', emoji: '🔩', category: 'streak', xpReward: 500,
    description: 'Active 30 days in a row. Legendary consistency.',
    howToEarn: 'Log in and take action 30 consecutive days.',
  },
  // ─── Milestones ──────────────────────────────────────────────────────────
  {
    id: 'rank_producer', name: 'Producer Rank', emoji: '🏆', category: 'milestone', xpReward: 0,
    description: 'Reached Producer rank.',
    howToEarn: 'Earn 1,500 XP total.',
  },
  {
    id: 'rank_elite', name: 'Elite Rank', emoji: '⭐', category: 'milestone', xpReward: 0,
    description: 'Reached Elite rank.',
    howToEarn: 'Earn 7,000 XP total.',
  },
  {
    id: 'level_10', name: 'Level 10', emoji: '🔟', category: 'milestone', xpReward: 0,
    description: 'Reached Level 10.',
    howToEarn: 'Earn 4,500 XP total.',
  },
]

export function getBadge(id: string): BadgeDefinition | undefined {
  return ALL_BADGES.find(b => b.id === id)
}

export const CATEGORY_LABELS: Record<string, string> = {
  sales: '💰 Sales',
  activity: '⚡ Activity',
  team: '👥 Team',
  streak: '🔥 Streak',
  milestone: '🏆 Milestone',
}
