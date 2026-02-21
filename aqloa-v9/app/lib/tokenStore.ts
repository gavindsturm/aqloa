import { createHmac, randomBytes } from 'crypto'

export interface InviteRecord {
  token: string
  email: string
  role: 'agent' | 'manager' | 'admin'
  invitedBy: string
  invitedByName: string
  orgId: string
  expiresAt: number
  usedAt?: number
  createdAt: number
}

export type ValidationResult =
  | { valid: true;  record: InviteRecord }
  | { valid: false; reason: 'not_found' | 'expired' | 'already_used' | 'invalid_sig' }

const PREFIX = 'invite:'
const ORG_INDEX = 'invite_org:'

function tokenKey(token: string) { return `${PREFIX}${token}` }
function orgKey(orgId: string)   { return `${ORG_INDEX}${orgId}` }

async function getRedis() {
  const { Redis } = await import('@upstash/redis')
  return Redis.fromEnv()
}

const MEM = new Map<string, InviteRecord>()
const MEM_SETS = new Map<string, Set<string>>()
const useMemory = !process.env.KV_REST_API_URL

// Upstash auto-deserializes JSON, so we store/retrieve InviteRecord directly
async function kvGet(key: string): Promise<InviteRecord | null> {
  if (useMemory) return MEM.get(key) ?? null
  const redis = await getRedis()
  return redis.get<InviteRecord>(key)
}

async function kvSet(key: string, value: InviteRecord, expiresAtMs: number): Promise<void> {
  if (useMemory) { MEM.set(key, value); return }
  const redis = await getRedis()
  const ttlSeconds = Math.ceil((expiresAtMs + 86_400_000 - Date.now()) / 1000)
  await redis.set(key, value, { ex: Math.max(ttlSeconds, 60) })
}

async function kvDel(key: string): Promise<void> {
  if (useMemory) { MEM.delete(key); return }
  const redis = await getRedis()
  await redis.del(key)
}

async function orgIndexAdd(orgId: string, token: string): Promise<void> {
  if (useMemory) {
    if (!MEM_SETS.has(orgKey(orgId))) MEM_SETS.set(orgKey(orgId), new Set())
    MEM_SETS.get(orgKey(orgId))!.add(token)
    return
  }
  const redis = await getRedis()
  await redis.sadd(orgKey(orgId), token)
}

async function orgIndexMembers(orgId: string): Promise<string[]> {
  if (useMemory) return Array.from(MEM_SETS.get(orgKey(orgId)) ?? [])
  const redis = await getRedis()
  return redis.smembers(orgKey(orgId))
}

async function orgIndexRemove(orgId: string, token: string): Promise<void> {
  if (useMemory) { MEM_SETS.get(orgKey(orgId))?.delete(token); return }
  const redis = await getRedis()
  await redis.srem(orgKey(orgId), token)
}

const SECRET = process.env.INVITE_SECRET ?? 'aqloa-invite-secret-change-in-prod-32chars'

export async function generateInviteToken(
  data: Omit<InviteRecord, 'token' | 'createdAt'>
): Promise<InviteRecord> {
  const rawToken = randomBytes(32).toString('hex')
  const sig = createHmac('sha256', SECRET).update(rawToken).digest('hex')
  const token = `${rawToken}.${sig}`
  const record: InviteRecord = { ...data, token, createdAt: Date.now() }
  await kvSet(tokenKey(token), record, data.expiresAt)
  await orgIndexAdd(data.orgId, token)
  return record
}

export async function validateToken(token: string): Promise<ValidationResult> {
  const parts = token.split('.')
  if (parts.length !== 2) return { valid: false, reason: 'invalid_sig' }
  const [rawToken, providedSig] = parts
  const expectedSig = createHmac('sha256', SECRET).update(rawToken).digest('hex')
  if (!timingSafeEqual(providedSig, expectedSig)) return { valid: false, reason: 'invalid_sig' }
  const record = await kvGet(tokenKey(token))
  if (!record) return { valid: false, reason: 'not_found' }
  if (Date.now() > record.expiresAt) return { valid: false, reason: 'expired' }
  if (record.usedAt) return { valid: false, reason: 'already_used' }
  return { valid: true, record }
}

export async function consumeToken(token: string): Promise<boolean> {
  const result = await validateToken(token)
  if (!result.valid) return false
  const updated: InviteRecord = { ...result.record, usedAt: Date.now() }
  await kvSet(tokenKey(token), updated, result.record.expiresAt)
  return true
}

export async function listPendingInvites(orgId: string): Promise<InviteRecord[]> {
  const tokens = await orgIndexMembers(orgId)
  const now = Date.now()
  const records: InviteRecord[] = []
  await Promise.all(tokens.map(async token => {
    const record = await kvGet(tokenKey(token))
    if (!record) { await orgIndexRemove(orgId, token); return }
    if (!record.usedAt && now < record.expiresAt) records.push(record)
  }))
  return records
}

export async function revokeToken(token: string): Promise<boolean> {
  const record = await kvGet(tokenKey(token))
  if (!record) return false
  await kvDel(tokenKey(token))
  await orgIndexRemove(record.orgId, token)
  return true
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}
