/**
 * Authentication middleware for Clerk
 * Validates Clerk session tokens and extracts user information
 */

import { verifyToken } from '@clerk/backend/jwt'
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
  CLERK_SECRET_KEY: string
  CLERK_PUBLISHABLE_KEY: string
  CLAUDE_API_KEY: string
  RESEND_API_KEY: string
  TWILIO_ACCOUNT_SID: string
  TWILIO_AUTH_TOKEN: string
  TWILIO_PHONE_NUMBER: string
}

/**
 * User info extracted from Clerk session
 */
export interface ClerkUser {
  userId: string // User ID from our database
  clerkId: string // Clerk user ID
  email: string // Email from Clerk
  oauthProvider: string // 'google' (from Clerk OAuth)
}

/**
 * Extract and validate Clerk session token from header
 * @param request - Incoming request
 * @param env - Worker environment
 * @returns User info if valid
 * @throws Error with appropriate message
 */
export async function authenticateRequest(
  request: Request,
  env: Env
): Promise<ClerkUser> {
  const authHeader = request.headers.get('Authorization')

  if (!authHeader) {
    throw new Error('Missing authentication header')
  }

  if (!authHeader.startsWith('Bearer ')) {
    throw new Error('Invalid Authorization header format. Expected: Bearer <token>')
  }

  const token = authHeader.substring(7)

  if (!token) {
    throw new Error('Missing session token')
  }

  try {
    // Verify Clerk session token
    const payload = await verifyToken(token, {
      secretKey: env.CLERK_SECRET_KEY,
    })

    if (!payload || !payload.sub) {
      throw new Error('Invalid token payload')
    }

    const clerkId = payload.sub
    const email = (payload.email as string) || ''

    // Look up user by Clerk ID in database
    const user = await env.DB.prepare(
      'SELECT * FROM users WHERE clerk_id = ?'
    )
      .bind(clerkId)
      .first<User>()

    if (!user) {
      throw new Error('User not found. Please complete sign-up.')
    }

    return {
      userId: user.id,
      clerkId: clerkId,
      email: email || user.email,
      oauthProvider: user.oauth_provider,
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Clerk token validation failed: ${error.message}`)
    }
    throw new Error('Clerk token validation failed')
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
