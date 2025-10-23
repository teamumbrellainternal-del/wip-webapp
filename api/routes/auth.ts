/**
 * Authentication routes
 * Handles OAuth callback, session management, and logout
 */

import { successResponse, errorResponse } from '../utils/response'
import { createJWT } from '../utils/jwt'
import { generateUUIDv4 } from '../utils/uuid'
import { authenticateRequest, checkOnboardingComplete, type Env } from '../middleware/auth'
import type { User } from '../models/user'
import { sanitizeUser, hasCompletedOnboarding } from '../models/user'

/**
 * POST /v1/auth/callback
 * OAuth callback handler - creates or retrieves user after OAuth
 * @param request - Request with OAuth data
 * @param env - Worker environment
 * @returns User data and session token
 */
export async function handleAuthCallback(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json() as {
      email: string
      oauth_provider: 'apple' | 'google'
      oauth_id: string
    }

    const { email, oauth_provider, oauth_id } = body

    if (!email || !oauth_provider || !oauth_id) {
      return errorResponse(
        'validation_error',
        'Missing required fields: email, oauth_provider, oauth_id',
        400
      )
    }

    // Check if user exists
    const existingUser = await env.DB.prepare(
      'SELECT * FROM users WHERE oauth_provider = ? AND oauth_id = ?'
    )
      .bind(oauth_provider, oauth_id)
      .first() as User | null

    if (existingUser) {
      // User exists - create session token
      const token = await createJWT(
        {
          sub: existingUser.id,
          email: existingUser.email,
          oauth_provider: existingUser.oauth_provider,
          oauth_id: existingUser.oauth_id,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
        },
        env.JWT_SECRET
      )

      // Store session in KV
      await env.KV.put(
        `session:${existingUser.id}`,
        JSON.stringify({
          userId: existingUser.id,
          email: existingUser.email,
          oauthProvider: existingUser.oauth_provider,
        }),
        { expirationTtl: 7 * 24 * 60 * 60 } // 7 days
      )

      // Return sanitized user profile
      return successResponse({
        user: sanitizeUser(existingUser),
        token,
      })
    }

    // New user - create user record
    const userId = generateUUIDv4()
    const now = new Date().toISOString()

    await env.DB.prepare(
      `INSERT INTO users (id, oauth_provider, oauth_id, email, onboarding_complete, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(userId, oauth_provider, oauth_id, email, 0, now, now)
      .run()

    // Create session token
    const token = await createJWT(
      {
        sub: userId,
        email,
        oauth_provider,
        oauth_id,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
      },
      env.JWT_SECRET
    )

    // Store session in KV
    await env.KV.put(
      `session:${userId}`,
      JSON.stringify({
        userId,
        email,
        oauthProvider: oauth_provider,
      }),
      { expirationTtl: 7 * 24 * 60 * 60 } // 7 days
    )

    return successResponse(
      {
        user: {
          id: userId,
          email,
          onboarding_complete: false,
        },
        token,
      },
      201
    )
  } catch (error) {
    console.error('Auth callback error:', error)
    return errorResponse(
      'internal_error',
      'Failed to process authentication',
      500
    )
  }
}

/**
 * GET /v1/auth/session
 * Check current session validity
 * @param request - Request with auth header
 * @param env - Worker environment
 * @returns Current user session info
 */
export async function handleSessionCheck(request: Request, env: Env): Promise<Response> {
  try {
    const user = await authenticateRequest(request, env)

    // Check if onboarding is complete
    const onboardingComplete = await checkOnboardingComplete(user.userId, env)

    return successResponse({
      user: {
        id: user.userId,
        email: user.email,
        oauth_provider: user.oauthProvider,
        onboarding_complete: onboardingComplete,
      },
      valid: true,
    })
  } catch (error) {
    if (error instanceof Error) {
      return errorResponse('authentication_failed', error.message, 401)
    }
    return errorResponse('authentication_failed', 'Invalid session', 401)
  }
}

/**
 * POST /v1/auth/logout
 * Clear user session
 * @param request - Request with auth header
 * @param env - Worker environment
 * @returns Success response
 */
export async function handleLogout(request: Request, env: Env): Promise<Response> {
  try {
    const user = await authenticateRequest(request, env)

    // Delete session from KV
    await env.KV.delete(`session:${user.userId}`)

    return successResponse({
      message: 'Logged out successfully',
    })
  } catch (error) {
    // Even if auth fails, return success (idempotent logout)
    return successResponse({
      message: 'Logged out successfully',
    })
  }
}
