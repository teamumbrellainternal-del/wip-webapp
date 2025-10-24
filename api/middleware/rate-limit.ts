/**
 * Rate limiting middleware
 * Implements rate limits using KV storage
 * Per D-062: Violet AI limited to 50 prompts/day per artist
 */

import type { Middleware } from '../router'
import { errorResponse } from '../utils/response'
import { ErrorCodes } from '../utils/error-codes'

/**
 * Rate limit configuration
 */
interface RateLimitConfig {
  limit: number // Maximum requests
  window: number // Time window in seconds
  keyPrefix: string // KV key prefix
}

/**
 * Create rate limiting middleware
 * @param config - Rate limit configuration
 * @returns Middleware function
 */
export function createRateLimitMiddleware(config: RateLimitConfig): Middleware {
  return async (ctx, next) => {
    const { limit, window, keyPrefix } = config

    // Require authentication for rate limiting
    if (!ctx.userId) {
      return errorResponse(
        ErrorCodes.AUTHENTICATION_FAILED,
        'Authentication required',
        401,
        undefined,
        ctx.requestId
      )
    }

    // Generate rate limit key
    const key = `${keyPrefix}:${ctx.userId}`

    // Get current count from KV
    const currentCount = await ctx.env.KV.get<number>(key, 'json')
    const count = currentCount || 0

    // Check if limit exceeded
    if (count >= limit) {
      return errorResponse(
        ErrorCodes.RATE_LIMIT_EXCEEDED,
        `Rate limit exceeded. Maximum ${limit} requests per ${window / 86400} day(s).`,
        429,
        undefined,
        ctx.requestId
      )
    }

    // Increment counter
    const newCount = count + 1
    const ttl = window // TTL in seconds

    // Store with expiration
    await ctx.env.KV.put(key, JSON.stringify(newCount), {
      expirationTtl: ttl,
    })

    // Continue to next middleware/handler
    return next()
  }
}

/**
 * Violet AI rate limit middleware (50 prompts/day per D-062)
 */
export const violetRateLimitMiddleware = createRateLimitMiddleware({
  limit: 50,
  window: 86400, // 24 hours in seconds
  keyPrefix: 'rate_limit:violet',
})

/**
 * Check remaining rate limit quota
 * @param userId - User ID
 * @param keyPrefix - KV key prefix
 * @param limit - Maximum requests
 * @param kv - KV namespace
 * @returns Remaining quota and reset time
 */
export async function checkRateLimit(
  userId: string,
  keyPrefix: string,
  limit: number,
  kv: KVNamespace
): Promise<{
  remaining: number
  limit: number
  resetAt: string | null
}> {
  const key = `${keyPrefix}:${userId}`

  // Get current count and metadata
  const result = await kv.getWithMetadata<number>(key, 'json')
  const count = result.value || 0

  // Calculate remaining
  const remaining = Math.max(0, limit - count)

  // Get reset time from KV metadata (expiration)
  let resetAt: string | null = null
  if (result.metadata && typeof result.metadata === 'object' && 'expiration' in result.metadata) {
    const expiration = (result.metadata as { expiration: number }).expiration
    resetAt = new Date(expiration * 1000).toISOString()
  }

  return {
    remaining,
    limit,
    resetAt,
  }
}
