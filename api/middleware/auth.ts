/**
 * Authentication middleware for Cloudflare Access
 * Validates Cloudflare Access JWT tokens and extracts user information
 */

import { verifyJWT, type JWTPayload } from '../utils/jwt'
import type { User } from '../models/user'

/**
 * Environment interface (defined in api/index.ts)
 */
export interface Env {
  DB: D1Database
  KV: KVNamespace
  BUCKET: R2Bucket
  JWT_SECRET: string
  CLAUDE_API_KEY: string
  RESEND_API_KEY: string
  TWILIO_ACCOUNT_SID: string
  TWILIO_AUTH_TOKEN: string
  TWILIO_PHONE_NUMBER: string
}

/**
 * User info extracted from Cloudflare Access JWT
 */
export interface CloudflareAccessUser {
  userId: string // User ID from our database
  email: string // Email from OAuth provider
  oauthProvider: string // 'apple' or 'google'
  oauthId: string // OAuth provider's user ID
}

/**
 * Extract and validate Cloudflare Access JWT from header
 * @param request - Incoming request
 * @param env - Worker environment
 * @returns User info if valid
 * @throws Error with appropriate message
 */
export async function authenticateRequest(
  request: Request,
  env: Env
): Promise<CloudflareAccessUser> {
  // Check for Cloudflare Access JWT header
  const accessJwt = request.headers.get('Cf-Access-Jwt-Assertion')

  if (!accessJwt) {
    // Fallback to Authorization header for testing/development
    const authHeader = request.headers.get('Authorization')

    if (!authHeader) {
      throw new Error('Missing authentication header')
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new Error('Invalid Authorization header format. Expected: Bearer <token>')
    }

    const token = authHeader.substring(7)

    if (!token) {
      throw new Error('Missing JWT token')
    }

    // Validate JWT using our JWT_SECRET
    try {
      const payload = await verifyJWT(token, env.JWT_SECRET)

      // Look up user in database
      const user = await env.DB.prepare(
        'SELECT * FROM users WHERE oauth_provider = ? AND oauth_id = ?'
      )
        .bind(payload.oauth_provider, payload.oauth_id)
        .first<User>()

      if (!user) {
        throw new Error('User not found')
      }

      return {
        userId: user.id,
        email: payload.email,
        oauthProvider: payload.oauth_provider,
        oauthId: payload.oauth_id,
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`JWT validation failed: ${error.message}`)
      }
      throw new Error('JWT validation failed')
    }
  }

  // Validate Cloudflare Access JWT
  // In production, this would validate against Cloudflare's public keys
  // For MVP, we'll use a simplified approach
  try {
    const payload = await verifyJWT(accessJwt, env.JWT_SECRET)

    // Extract OAuth info from Cloudflare Access JWT
    const oauthProvider = payload.oauth_provider || 'google' // Default to google
    const oauthId = payload.oauth_id || payload.sub

    // Check if user exists in database
    const user = await env.DB.prepare(
      'SELECT * FROM users WHERE oauth_provider = ? AND oauth_id = ?'
    )
      .bind(oauthProvider, oauthId)
      .first<User>()

    if (!user) {
      // User doesn't exist yet - they need to complete onboarding
      throw new Error('User not found. Please complete onboarding.')
    }

    return {
      userId: user.id,
      email: payload.email,
      oauthProvider: oauthProvider,
      oauthId: oauthId,
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Cloudflare Access JWT validation failed: ${error.message}`)
    }
    throw new Error('Cloudflare Access JWT validation failed')
  }
}

/**
 * Check if user has completed onboarding
 * @param userId - User ID
 * @param env - Worker environment
 * @returns true if onboarding complete, false otherwise
 */
export async function checkOnboardingComplete(
  userId: string,
  env: Env
): Promise<boolean> {
  const user = await env.DB.prepare(
    'SELECT onboarding_complete FROM users WHERE id = ?'
  )
    .bind(userId)
    .first<Pick<User, 'onboarding_complete'>>()

  if (!user) {
    return false
  }

  return Boolean(user.onboarding_complete)
}
