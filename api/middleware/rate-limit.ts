/**
 * Rate limiting middleware
 * Implements comprehensive rate limits using KV storage
 * - Per-IP rate limiting for public endpoints (20 req/min)
 * - Per-user rate limiting for authenticated endpoints (100 req/min)
 * - Per D-062: Violet AI limited to 50 prompts/day per artist
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
  requireAuth?: boolean // Whether authentication is required
  identifier?: 'ip' | 'userId' // What to use as identifier (default: userId)
}

/**
 * Get client IP address from request
 */
function getClientIP(request: Request): string {
  // Cloudflare provides the real IP in CF-Connecting-IP header
  const cfIP = request.headers.get('CF-Connecting-IP')
  if (cfIP) return cfIP

  // Fallback to X-Forwarded-For
  const forwardedFor = request.headers.get('X-Forwarded-For')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  // Last resort fallback
  return 'unknown'
}

/**
 * Get current time window (floored to the minute)
 * For sliding window rate limiting
 */
function getCurrentWindow(): number {
  return Math.floor(Date.now() / 1000 / 60) // Unix timestamp floored to minute
}

/**
 * Create rate limiting middleware
 * @param config - Rate limit configuration
 * @returns Middleware function
 */
export function createRateLimitMiddleware(config: RateLimitConfig): Middleware {
  return async (ctx, next) => {
    const { limit, window, keyPrefix, requireAuth = true, identifier = 'userId' } = config

    // Determine identifier
    let identifierValue: string
    if (identifier === 'ip') {
      identifierValue = getClientIP(ctx.request)
    } else {
      // Require authentication for user-based rate limiting
      if (!ctx.userId) {
        if (requireAuth) {
          return errorResponse(
            ErrorCodes.AUTHENTICATION_FAILED,
            'Authentication required',
            401,
            undefined,
            ctx.requestId
          )
        } else {
          // Fallback to IP if not authenticated
          identifierValue = getClientIP(ctx.request)
        }
      } else {
        identifierValue = ctx.userId
      }
    }

    // For minute-based rate limiting, use sliding window
    const currentWindow = getCurrentWindow()
    const key = `${keyPrefix}:${identifierValue}:${currentWindow}`

    // Get current count from KV
    const currentCount = await ctx.env.KV.get<number>(key, 'json')
    const count = currentCount || 0

    // Calculate reset time (end of current window)
    const resetTime = (currentWindow + 1) * 60 // Next minute in Unix timestamp
    const retryAfter = resetTime - Math.floor(Date.now() / 1000)

    // Check if limit exceeded
    if (count >= limit) {
      // Create error response with rate limit headers
      const response = errorResponse(
        ErrorCodes.RATE_LIMIT_EXCEEDED,
        `Rate limit exceeded. Maximum ${limit} requests per ${window / 60} minute(s).`,
        429,
        undefined,
        ctx.requestId
      )

      // Add rate limit headers
      const headers = new Headers(response.headers)
      headers.set('X-RateLimit-Limit', limit.toString())
      headers.set('X-RateLimit-Remaining', '0')
      headers.set('X-RateLimit-Reset', resetTime.toString())
      headers.set('Retry-After', retryAfter.toString())

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      })
    }

    // Increment counter
    const newCount = count + 1
    const ttl = window // TTL in seconds

    // Store with expiration
    await ctx.env.KV.put(key, JSON.stringify(newCount), {
      expirationTtl: ttl,
    })

    // Continue to next middleware/handler
    const response = await next()

    // Add rate limit headers to successful responses
    const headers = new Headers(response.headers)
    headers.set('X-RateLimit-Limit', limit.toString())
    headers.set('X-RateLimit-Remaining', Math.max(0, limit - newCount).toString())
    headers.set('X-RateLimit-Reset', resetTime.toString())

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  }
}

/**
 * Public endpoint rate limit middleware
 * 20 requests per minute per IP address
 */
export const rateLimitPublic = createRateLimitMiddleware({
  limit: 20,
  window: 60, // 1 minute in seconds
  keyPrefix: 'ratelimit:public',
  requireAuth: false,
  identifier: 'ip',
})

/**
 * Authenticated endpoint rate limit middleware
 * 100 requests per minute per user
 */
export const rateLimitUser = createRateLimitMiddleware({
  limit: 100,
  window: 60, // 1 minute in seconds
  keyPrefix: 'ratelimit:user',
  requireAuth: true,
  identifier: 'userId',
})

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
