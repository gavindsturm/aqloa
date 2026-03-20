import { Redis } from '@upstash/redis'

// Shared Redis client instance
// Vercel prefixes env vars with KV_REST_API_TOKEN1_ for this project
export const redis = new Redis({
  url: process.env.KV_REST_API_TOKEN1_KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN1_KV_REST_API_TOKEN!,
})

// Key helpers
export const KEYS = {
  members:      'org:members',
  messages:     'org:messages',
  appointments: 'org:appointments',
}
