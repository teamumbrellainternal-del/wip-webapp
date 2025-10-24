/**
 * KV Storage Wrapper with TTL Strategies
 * Umbrella MVP - Cloudflare Workers KV Layer
 *
 * Implements caching patterns for:
 * - Session tokens (7-day TTL)
 * - Search results cache (15-min TTL)
 * - Profile cache (1-hour TTL)
 * - Violet rate limiting (24-hour TTL, reset at midnight per D-062)
 * - Upload signed URLs (15-min TTL)
 */

import {
  KV_KEYS,
  TTL,
  type SessionData,
  type ProfileCache,
  type SearchCache,
  type VioletRateLimit,
  type UploadUrlMetadata,
  type KVResult,
} from './types'

/**
 * Generate a KV key with namespace prefix
 */
function kvKey(namespace: string, id: string): string {
  return `${namespace}:${id}`
}

/**
 * Parse JSON from KV with error handling
 */
function parseKVValue<T>(value: string | null): T | null {
  if (!value) return null
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

/**
 * Session Management
 */

/**
 * Store a session in KV with 7-day TTL
 */
export async function setSession(
  kv: KVNamespace,
  sessionId: string,
  data: SessionData
): Promise<KVResult<void>> {
  try {
    const key = kvKey(KV_KEYS.SESSION, sessionId)
    await kv.put(key, JSON.stringify(data), {
      expirationTtl: TTL.SESSION,
    })
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to store session',
    }
  }
}

/**
 * Get a session from KV
 */
export async function getSession(
  kv: KVNamespace,
  sessionId: string
): Promise<KVResult<SessionData>> {
  try {
    const key = kvKey(KV_KEYS.SESSION, sessionId)
    const value = await kv.get(key)
    const data = parseKVValue<SessionData>(value)

    if (!data) {
      return {
        success: false,
        error: 'Session not found or expired',
      }
    }

    return {
      success: true,
      data,
      cached: true,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get session',
    }
  }
}

/**
 * Delete a session from KV
 */
export async function deleteSession(
  kv: KVNamespace,
  sessionId: string
): Promise<KVResult<void>> {
  try {
    const key = kvKey(KV_KEYS.SESSION, sessionId)
    await kv.delete(key)
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete session',
    }
  }
}

/**
 * Profile Cache Management
 */

/**
 * Cache a user profile with 1-hour TTL
 */
export async function cacheProfile(
  kv: KVNamespace,
  userId: string,
  data: Omit<ProfileCache, 'cachedAt'>
): Promise<KVResult<void>> {
  try {
    const key = kvKey(KV_KEYS.PROFILE_CACHE, userId)
    const profileData: ProfileCache = {
      ...data,
      cachedAt: new Date().toISOString(),
    }

    await kv.put(key, JSON.stringify(profileData), {
      expirationTtl: TTL.PROFILE_CACHE,
    })

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cache profile',
    }
  }
}

/**
 * Get cached profile
 */
export async function getCachedProfile(
  kv: KVNamespace,
  userId: string
): Promise<KVResult<ProfileCache>> {
  try {
    const key = kvKey(KV_KEYS.PROFILE_CACHE, userId)
    const value = await kv.get(key)
    const data = parseKVValue<ProfileCache>(value)

    if (!data) {
      return {
        success: false,
        error: 'Profile cache not found or expired',
      }
    }

    return {
      success: true,
      data,
      cached: true,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get cached profile',
    }
  }
}

/**
 * Invalidate profile cache
 */
export async function invalidateProfileCache(
  kv: KVNamespace,
  userId: string
): Promise<KVResult<void>> {
  try {
    const key = kvKey(KV_KEYS.PROFILE_CACHE, userId)
    await kv.delete(key)
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to invalidate profile cache',
    }
  }
}

/**
 * Search Results Cache Management
 */

/**
 * Generate a cache key hash from search parameters
 */
function generateSearchHash(query: string, filters: Record<string, unknown>): string {
  const searchString = `${query}:${JSON.stringify(filters)}`
  // Simple hash function for cache key (not cryptographic)
  let hash = 0
  for (let i = 0; i < searchString.length; i++) {
    const char = searchString.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36)
}

/**
 * Cache search results with 15-minute TTL
 */
export async function cacheSearchResults(
  kv: KVNamespace,
  query: string,
  filters: Record<string, unknown>,
  results: unknown[],
  totalCount: number
): Promise<KVResult<void>> {
  try {
    const hash = generateSearchHash(query, filters)
    const key = kvKey(KV_KEYS.SEARCH_CACHE, hash)

    const searchData: SearchCache = {
      query,
      filters,
      results,
      totalCount,
      cachedAt: new Date().toISOString(),
    }

    await kv.put(key, JSON.stringify(searchData), {
      expirationTtl: TTL.SEARCH_CACHE,
    })

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cache search results',
    }
  }
}

/**
 * Get cached search results
 */
export async function getCachedSearchResults(
  kv: KVNamespace,
  query: string,
  filters: Record<string, unknown>
): Promise<KVResult<SearchCache>> {
  try {
    const hash = generateSearchHash(query, filters)
    const key = kvKey(KV_KEYS.SEARCH_CACHE, hash)
    const value = await kv.get(key)
    const data = parseKVValue<SearchCache>(value)

    if (!data) {
      return {
        success: false,
        error: 'Search cache not found or expired',
      }
    }

    return {
      success: true,
      data,
      cached: true,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get cached search results',
    }
  }
}

/**
 * Violet AI Rate Limiting (50 prompts/day per D-062)
 */

/**
 * Get current date in YYYY-MM-DD format (UTC)
 */
function getCurrentDateUTC(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * Get midnight UTC timestamp for rate limit reset
 */
function getMidnightUTC(): string {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
  tomorrow.setUTCHours(0, 0, 0, 0)
  return tomorrow.toISOString()
}

/**
 * Check and increment Violet rate limit
 * Returns the current count and whether the limit is exceeded
 */
export async function checkVioletRateLimit(
  kv: KVNamespace,
  userId: string,
  maxPrompts: number = 50
): Promise<KVResult<{ count: number; exceeded: boolean; resetsAt: string }>> {
  try {
    const date = getCurrentDateUTC()
    const key = kvKey(KV_KEYS.VIOLET_RATE_LIMIT, `${userId}:${date}`)
    const value = await kv.get(key)

    let rateLimit: VioletRateLimit

    if (!value) {
      // Initialize new rate limit counter
      rateLimit = {
        userId,
        date,
        promptCount: 0,
        lastPromptAt: new Date().toISOString(),
        resetsAt: getMidnightUTC(),
      }
    } else {
      rateLimit = parseKVValue<VioletRateLimit>(value) || {
        userId,
        date,
        promptCount: 0,
        lastPromptAt: new Date().toISOString(),
        resetsAt: getMidnightUTC(),
      }
    }

    const exceeded = rateLimit.promptCount >= maxPrompts

    return {
      success: true,
      data: {
        count: rateLimit.promptCount,
        exceeded,
        resetsAt: rateLimit.resetsAt,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check rate limit',
    }
  }
}

/**
 * Increment Violet rate limit counter
 */
export async function incrementVioletRateLimit(
  kv: KVNamespace,
  userId: string
): Promise<KVResult<{ count: number; resetsAt: string }>> {
  try {
    const date = getCurrentDateUTC()
    const key = kvKey(KV_KEYS.VIOLET_RATE_LIMIT, `${userId}:${date}`)
    const value = await kv.get(key)

    let rateLimit: VioletRateLimit

    if (!value) {
      rateLimit = {
        userId,
        date,
        promptCount: 1,
        lastPromptAt: new Date().toISOString(),
        resetsAt: getMidnightUTC(),
      }
    } else {
      const existing = parseKVValue<VioletRateLimit>(value)
      rateLimit = {
        userId,
        date,
        promptCount: (existing?.promptCount || 0) + 1,
        lastPromptAt: new Date().toISOString(),
        resetsAt: existing?.resetsAt || getMidnightUTC(),
      }
    }

    // Calculate seconds until midnight UTC for TTL
    const now = new Date()
    const midnight = new Date(rateLimit.resetsAt)
    const ttl = Math.floor((midnight.getTime() - now.getTime()) / 1000)

    await kv.put(key, JSON.stringify(rateLimit), {
      expirationTtl: Math.max(ttl, TTL.VIOLET_RATE_LIMIT),
    })

    return {
      success: true,
      data: {
        count: rateLimit.promptCount,
        resetsAt: rateLimit.resetsAt,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to increment rate limit',
    }
  }
}

/**
 * Upload Signed URL Management
 */

/**
 * Store upload URL metadata with 15-minute TTL
 */
export async function setUploadUrlMetadata(
  kv: KVNamespace,
  uploadId: string,
  metadata: Omit<UploadUrlMetadata, 'createdAt'>
): Promise<KVResult<void>> {
  try {
    const key = kvKey(KV_KEYS.UPLOAD_URL, uploadId)
    const data: UploadUrlMetadata = {
      ...metadata,
      createdAt: new Date().toISOString(),
    }

    await kv.put(key, JSON.stringify(data), {
      expirationTtl: TTL.UPLOAD_URL,
    })

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to store upload metadata',
    }
  }
}

/**
 * Get upload URL metadata
 */
export async function getUploadUrlMetadata(
  kv: KVNamespace,
  uploadId: string
): Promise<KVResult<UploadUrlMetadata>> {
  try {
    const key = kvKey(KV_KEYS.UPLOAD_URL, uploadId)
    const value = await kv.get(key)
    const data = parseKVValue<UploadUrlMetadata>(value)

    if (!data) {
      return {
        success: false,
        error: 'Upload metadata not found or expired',
      }
    }

    return {
      success: true,
      data,
      cached: true,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get upload metadata',
    }
  }
}

/**
 * Delete upload URL metadata after successful upload
 */
export async function deleteUploadUrlMetadata(
  kv: KVNamespace,
  uploadId: string
): Promise<KVResult<void>> {
  try {
    const key = kvKey(KV_KEYS.UPLOAD_URL, uploadId)
    await kv.delete(key)
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete upload metadata',
    }
  }
}
