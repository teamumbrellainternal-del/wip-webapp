/**
 * Authentication routes
 * Handles Clerk authentication, session management, and user provisioning
 */

import { successResponse, errorResponse } from '../utils/response'
import { generateUUIDv4 } from '../utils/uuid'
import { authenticateRequest, checkOnboardingComplete, type Env } from '../middleware/auth'
import type { User } from '../models/user'
import { Webhook } from 'svix'
import { createJWT } from '../utils/jwt'

/**
 * POST /v1/auth/webhook
 * Clerk webhook handler - creates/updates user when Clerk events occur
 * @param request - Request with Clerk webhook data
 * @param env - Worker environment
 * @returns Success response
 */
export async function handleClerkWebhook(request: Request, env: Env): Promise<Response> {
  try {
    // Verify webhook signature
    const webhookSecret = env.CLERK_WEBHOOK_SECRET

    if (!webhookSecret) {
      return errorResponse('configuration_error', 'Webhook secret not configured', 500)
    }

    const svixId = request.headers.get('svix-id')
    const svixTimestamp = request.headers.get('svix-timestamp')
    const svixSignature = request.headers.get('svix-signature')

    if (!svixId || !svixTimestamp || !svixSignature) {
      return errorResponse('validation_error', 'Missing webhook headers', 400)
    }

    const payload = await request.text()
    const wh = new Webhook(webhookSecret)

    let evt: any
    try {
      evt = wh.verify(payload, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      })
    } catch (err) {
      console.error('Webhook verification failed:', err)
      return errorResponse('validation_error', 'Invalid webhook signature', 400)
    }

    const eventType = evt.type
    const userData = evt.data

    switch (eventType) {
      case 'user.created':
        return await handleUserCreated(userData, env)
      case 'user.updated':
        return await handleUserUpdated(userData, env)
      case 'user.deleted':
        return await handleUserDeleted(userData, env)
      case 'session.created':
        return await handleSessionCreated(userData, env)
      default:
        console.log(`Unhandled webhook event: ${eventType}`)
        return successResponse({ message: 'Event received but not processed' })
    }
  } catch (error) {
    console.error('Webhook error:', error)
    return errorResponse('internal_error', 'Failed to process webhook', 500)
  }
}

/**
 * Handle user.created webhook event
 */
async function handleUserCreated(userData: any, env: Env): Promise<Response> {
  try {
    const clerkId = userData.id
    const email = userData.email_addresses?.[0]?.email_address || ''

    // Determine OAuth provider from external accounts
    let oauthProvider = 'google' // Default to Google
    const externalAccounts = userData.external_accounts || []
    if (externalAccounts.length > 0) {
      const provider = externalAccounts[0].provider
      oauthProvider = provider === 'oauth_apple' ? 'apple' : 'google'
    }

    // Check if user already exists
    const existingUser = await env.DB.prepare(
      'SELECT * FROM users WHERE clerk_id = ?'
    )
      .bind(clerkId)
      .first<User>()

    if (existingUser) {
      console.log(`User ${clerkId} already exists, skipping creation`)
      return successResponse({ message: 'User already exists' })
    }

    // Create new user
    const userId = generateUUIDv4()
    const now = new Date().toISOString()
    const oauthId = userData.external_accounts?.[0]?.id || clerkId

    await env.DB.prepare(
      `INSERT INTO users (id, clerk_id, oauth_provider, oauth_id, email, onboarding_complete, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(userId, clerkId, oauthProvider, oauthId, email, 0, now, now)
      .run()

    console.log(`Created user ${userId} for Clerk ID ${clerkId}`)
    return successResponse({ message: 'User created successfully', userId }, 201)
  } catch (error) {
    console.error('Error creating user:', error)
    return errorResponse('internal_error', 'Failed to create user', 500)
  }
}

/**
 * Handle user.updated webhook event
 */
async function handleUserUpdated(userData: any, env: Env): Promise<Response> {
  try {
    const clerkId = userData.id
    const email = userData.email_addresses?.[0]?.email_address || ''
    const now = new Date().toISOString()

    const result = await env.DB.prepare(
      'UPDATE users SET email = ?, updated_at = ? WHERE clerk_id = ?'
    )
      .bind(email, now, clerkId)
      .run()

    if (result.meta.changes === 0) {
      console.warn(`User ${clerkId} not found for update`)
      return errorResponse('user_not_found', 'User not found', 404)
    }

    console.log(`Updated user for Clerk ID ${clerkId}`)
    return successResponse({ message: 'User updated successfully' })
  } catch (error) {
    console.error('Error updating user:', error)
    return errorResponse('internal_error', 'Failed to update user', 500)
  }
}

/**
 * Handle user.deleted webhook event
 */
async function handleUserDeleted(userData: any, env: Env): Promise<Response> {
  try {
    const clerkId = userData.id

    // Soft delete or hard delete - for now we'll delete the user
    // In production you might want to soft delete and cascade
    const result = await env.DB.prepare(
      'DELETE FROM users WHERE clerk_id = ?'
    )
      .bind(clerkId)
      .run()

    if (result.meta.changes === 0) {
      console.warn(`User ${clerkId} not found for deletion`)
      return errorResponse('user_not_found', 'User not found', 404)
    }

    console.log(`Deleted user for Clerk ID ${clerkId}`)
    return successResponse({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return errorResponse('internal_error', 'Failed to delete user', 500)
  }
}

/**
 * Handle session.created webhook event
 */
async function handleSessionCreated(sessionData: any, env: Env): Promise<Response> {
  try {
    const userId = sessionData.user_id

    // Clerk manages sessions - we just log for monitoring
    console.log(`Session created for Clerk user: ${userId}`)

    // Optionally, you could update user's last_login timestamp
    // or track session metadata in your database

    return successResponse({ message: 'Session logged successfully' })
  } catch (error) {
    console.error('Error handling session creation:', error)
    return errorResponse('internal_error', 'Failed to handle session creation', 500)
  }
}

/**
 * GET /v1/auth/session
 * Validates Clerk session token and returns current user data
 * @param request - Request with Authorization header (Bearer format)
 * @param env - Worker environment
 * @returns Current user session info with Clerk session metadata
 */
export async function handleSessionCheck(request: Request, env: Env): Promise<Response> {
  // Extract Bearer token from Authorization header
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) {
    return errorResponse('MISSING_TOKEN', 'Authorization header required', 401)
  }

  try {
    // Verify Clerk token and get full payload
    const { verifyToken } = await import('@clerk/backend/jwt')
    const payload = await verifyToken(token, {
      secretKey: env.CLERK_SECRET_KEY,
    })

    if (!payload || !payload.sub) {
      return errorResponse('INVALID_TOKEN', 'Invalid token payload', 401)
    }

    // Extract Clerk user ID from token
    const clerkId = payload.sub

    // Fetch user from D1 by clerk_id
    const dbUser = await env.DB.prepare(
      'SELECT * FROM users WHERE clerk_id = ?'
    )
      .bind(clerkId)
      .first()

    if (!dbUser) {
      return errorResponse('USER_NOT_FOUND', 'User not found', 404)
    }

    // Return user and session data with Clerk session metadata
    return successResponse({
      user: {
        id: dbUser.id,
        clerk_user_id: dbUser.clerk_id,
        email: dbUser.email,
        onboarding_complete: Boolean(dbUser.onboarding_complete),
      },
      session: {
        clerk_session_id: payload.sid as string,
        expires_at: new Date((payload.exp as number) * 1000).toISOString(),
      },
    })
  } catch (error) {
    console.error('Token verification failed:', error)
    return errorResponse('INVALID_TOKEN', 'Invalid or expired token', 401)
  }
}

/**
 * POST /v1/auth/logout
 * Optional logout endpoint for logging/analytics
 * NOTE: With Clerk, session management is handled client-side via clerk.signOut()
 * This endpoint is optional and primarily for tracking logout events
 * @param request - Request with auth header
 * @param env - Worker environment
 * @returns Success response
 */
export async function handleLogout(request: Request, env: Env): Promise<Response> {
  try {
    // Optional: Extract user info for logging
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    let userId: string | undefined
    try {
      const user = await authenticateRequest(request, env)
      userId = user.userId
    } catch (error) {
      // If auth fails, still log the attempt
      console.log({
        event: 'logout_attempt',
        timestamp: new Date().toISOString(),
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }

    // Log logout event for analytics/monitoring
    console.log({
      event: 'user_logout',
      timestamp: new Date().toISOString(),
      userId: userId || 'unknown',
      success: true,
    })

    // Return success (Clerk handles session invalidation client-side)
    return successResponse({
      success: true,
      message: 'Logged out successfully',
    })
  } catch (error) {
    // Even if logging fails, return success (idempotent logout)
    console.error('Logout error:', error)
    return successResponse({
      success: true,
      message: 'Logged out successfully',
    })
  }
}

/**
 * POST /v1/auth/refresh
 * Refresh session token
 * @param request - Request with auth header
 * @param env - Worker environment
 * @returns New session token
 */
export async function handleSessionRefresh(request: Request, env: Env): Promise<Response> {
  try {
    const user = await authenticateRequest(request, env)

    // Fetch current user from database
    const dbUser = await env.DB.prepare(
      'SELECT * FROM users WHERE id = ?'
    )
      .bind(user.userId)
      .first<User>()

    if (!dbUser) {
      return errorResponse('user_not_found', 'User not found', 404)
    }

    // Create new session token with extended expiry
    const token = await createJWT(
      {
        sub: dbUser.id,
        email: dbUser.email,
        oauth_provider: dbUser.oauth_provider,
        oauth_id: dbUser.oauth_id,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
      },
      env.JWT_SECRET
    )

    // Update session in KV
    await env.KV.put(
      `session:${dbUser.id}`,
      JSON.stringify({
        userId: dbUser.id,
        email: dbUser.email,
        oauthProvider: dbUser.oauth_provider,
      }),
      { expirationTtl: 7 * 24 * 60 * 60 } // 7 days
    )

    return successResponse({
      token,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    })
  } catch (error) {
    if (error instanceof Error) {
      return errorResponse('authentication_failed', error.message, 401)
    }
    return errorResponse('authentication_failed', 'Session refresh failed', 401)
  }
}
