import { Redis } from '@upstash/redis'

// Shared Redis client instance
export const redis = Redis.fromEnv()

// Key helpers
export const KEYS = {
  members:      'org:members',
  messages:     'org:messages',
  appointments: 'org:appointments',
}
