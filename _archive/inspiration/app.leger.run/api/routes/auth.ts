/**
 * Authentication routes
 * POST /api/auth/validate - Validate CLI-generated JWT
 */

import type { Env } from '../middleware/auth'
import { authenticateRequest, successResponse, errorResponse } from '../middleware/auth'
import { getUserByTailscaleId, createUser, updateLastSeen, toUserProfile } from '../services/user'

/**
 * POST /api/auth/validate
 * Validate CLI-generated JWT and establish web session
 */
export async function handleAuthValidate(request: Request, env: Env): Promise<Response> {
  try {
    // Validate JWT
    const payload = await authenticateRequest(request, env)

    // Check if user exists
    let user = await getUserByTailscaleId(env, payload.tailscale_user_id)

    if (!user) {
      // Create new user
      user = await createUser(env, {
        tailscale_user_id: payload.tailscale_user_id,
        tailscale_email: payload.email,
        tailnet: payload.tailnet,
        device_id: 'web', // Web doesn't have device_id, use placeholder
        cli_version: undefined,
      })
    } else {
      // Update last seen for existing user
      await updateLastSeen(env, user.user_uuid, 'web')
    }

    // Return user profile
    return successResponse({
      user: toUserProfile(user),
    })
  } catch (error) {
    if (error instanceof Error) {
      return errorResponse(
        'authentication_failed',
        error.message,
        401,
        'Please run: leger auth login',
        'https://docs.leger.run/authentication'
      )
    }

    return errorResponse(
      'authentication_failed',
      'Invalid or expired JWT token',
      401,
      'Please run: leger auth login',
      'https://docs.leger.run/authentication'
    )
  }
}
