/**
 * Authentication middleware for Clerk
 * Validates Clerk session tokens and extracts user information
 * Implements task-1.4 requirements for authentication and authorization
 */

import { verifyToken } from '@clerk/backend'
import { verifyJWT, type JWTPayload } from '../utils/jwt'
import { logger } from '../utils/logger'
import type { User } from '../models/user'
import {
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  DatabaseError,
} from '../utils/errors'
import { syncClerkUser } from '../utils/clerk-sync'

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
 * @throws AuthenticationError, NotFoundError
 * @deprecated Use requireAuth() instead for new code
 */
export async function authenticateRequest(
  request: Request,
  env: Env
): Promise<ClerkUser> {
  const user = await requireAuth(request, env)

  // Convert User to ClerkUser format for backward compatibility
  return {
    userId: user.id,
    clerkId: user.clerk_id || '',
    email: user.email,
    oauthProvider: user.oauth_provider,
  }
}

/**
 * requireAuth - Main authentication middleware function
 * Validates Clerk session token and fetches user from D1
 *
 * @param request - Incoming request
 * @param env - Worker environment
 * @returns User object from database
 * @throws AuthenticationError (401) for invalid/missing tokens
 * @throws NotFoundError (404) if user not found in D1 (webhook sync issue)
 * @throws DatabaseError (500) for database errors
 */
export async function requireAuth(
  request: Request,
  env: Env
): Promise<User> {
    // 1. Extract token from Authorization header
    const authHeader = request.headers.get('Authorization')
    const requestId = request.headers.get('X-Request-ID') || 'unknown-request-id'

    if (!authHeader) {
      logger.warn('Missing authentication header', { requestId })
      throw new AuthenticationError('Missing authentication header')
    }

    if (!authHeader.startsWith('Bearer ')) {
      logger.warn('Invalid Authorization header format', { requestId })
      throw new AuthenticationError(
        'Invalid Authorization header format. Expected: Bearer <token>'
      )
    }

    const token = authHeader.replace('Bearer ', '')

    if (!token) {
      logger.warn('Missing session token', { requestId })
      throw new AuthenticationError('Missing session token')
    }

    try {
      // 2. Verify Clerk session token
      logger.debug('Verifying Clerk session token', { requestId })
      const payload = await verifyToken(token, {
        secretKey: env.CLERK_SECRET_KEY,
      })

      if (!payload || !payload.sub) {
        logger.error('Invalid token payload', { requestId, payload })
        throw new AuthenticationError('Invalid token payload')
      }

      const clerkId = payload.sub
      logger.debug('Token verified', { requestId, clerkId })

      // 3. Fetch user from D1 by clerk_id
      let user = await env.DB.prepare(
        'SELECT * FROM users WHERE clerk_id = ?'
      )
        .bind(clerkId)
        .first<User>()

      // 4. If user not found, attempt manual sync (webhook failure recovery)
      if (!user) {
        logger.warn(
          `[AUTH MIDDLEWARE] User authenticated with Clerk but not found in D1. Attempting manual sync...`,
          { requestId, clerkId }
        )

        try {
          // Fetch user from Clerk API and create in D1
          user = await syncClerkUser(clerkId, env)
          logger.info(
            `[AUTH MIDDLEWARE] Manual sync successful, proceeding with request`,
            { requestId, clerkId, userId: user.id }
          )
        } catch (syncError) {
          logger.error('[AUTH MIDDLEWARE] Manual sync failed', {
            requestId,
            clerkId,
            error: syncError instanceof Error ? syncError.message : String(syncError),
          })

          // If manual sync fails, throw NotFoundError
          throw new NotFoundError(
            'User not found in database and manual sync failed. Please try logging in again.',
            {
              clerkId,
              syncError: syncError instanceof Error ? syncError.message : undefined,
            }
          )
        }
      } else {
        logger.debug('User found in D1', { requestId, userId: user.id })
      }

      // 5. Return user object
      return user
  } catch (error) {
    // Re-throw our custom errors
    if (
      error instanceof AuthenticationError ||
      error instanceof NotFoundError ||
      error instanceof DatabaseError
    ) {
      throw error
    }

    // Clerk token verification errors
    if (error instanceof Error) {
      // Check for common Clerk token errors
      if (
        error.message.includes('expired') ||
        error.message.includes('signature') ||
        error.message.includes('invalid')
      ) {
        throw new AuthenticationError('Invalid or expired session token', {
          originalError: error.message,
        })
      }

      // Database errors
      if (error.message.includes('D1_ERROR') || error.message.includes('database')) {
        throw new DatabaseError('Database error during authentication', {
          originalError: error.message,
        })
      }

      throw new AuthenticationError(`Authentication failed: ${error.message}`)
    }

    throw new AuthenticationError('Authentication failed')
  }
}

/**
 * requireOnboarding - Authentication middleware with onboarding check
 * Validates Clerk session token AND ensures user has completed onboarding
 *
 * @param request - Incoming request
 * @param env - Worker environment
 * @returns User object from database with completed onboarding
 * @throws AuthenticationError (401) for invalid/missing tokens
 * @throws AuthorizationError (403) for valid tokens but incomplete onboarding
 * @throws NotFoundError (404) if user not found in D1
 */
export async function requireOnboarding(
  request: Request,
  env: Env
): Promise<User> {
  // First, authenticate the user
  const user = await requireAuth(request, env)

  // Check if onboarding is complete
  if (!user.onboarding_complete) {
    throw new AuthorizationError(
      'Onboarding incomplete. Please complete onboarding to access this resource.',
      {
        userId: user.id,
        onboardingComplete: false,
      }
    )
  }

  return user
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
