/**
 * Admin authorization middleware
 * Validates that the authenticated user has admin role via Clerk publicMetadata
 */

import { createClerkClient } from '@clerk/backend'
import { requireAuth, type Env } from './auth'
import { AuthorizationError } from '../utils/errors'
import { logger } from '../utils/logger'
import type { User } from '../models/user'

/**
 * Extended user type with admin flag
 */
export interface AdminUser extends User {
  isAdmin: true
}

/**
 * requireAdmin - Admin authorization middleware
 * Validates Clerk session token AND checks for admin role in publicMetadata
 *
 * @param request - Incoming request
 * @param env - Worker environment
 * @returns User object with admin confirmation
 * @throws AuthenticationError (401) for invalid/missing tokens
 * @throws AuthorizationError (403) if user is not an admin
 */
export async function requireAdmin(
  request: Request,
  env: Env
): Promise<AdminUser> {
  const requestId = request.headers.get('X-Request-ID') || 'unknown'

  // First, authenticate the user normally
  const user = await requireAuth(request, env)

  logger.debug('Checking admin authorization', {
    requestId,
    userId: user.id,
    clerkId: user.clerk_id,
  })

  // Fetch user metadata from Clerk to check admin role
  try {
    const clerk = createClerkClient({ secretKey: env.CLERK_SECRET_KEY })
    const clerkUser = await clerk.users.getUser(user.clerk_id!)

    const role = clerkUser.publicMetadata?.role as string | undefined

    if (role !== 'admin') {
      logger.warn('Admin access denied - user is not admin', {
        requestId,
        userId: user.id,
        role: role || 'none',
      })
      throw new AuthorizationError('Admin access required', {
        userId: user.id,
        role: role || 'none',
      })
    }

    logger.info('Admin access granted', {
      requestId,
      userId: user.id,
    })

    return {
      ...user,
      isAdmin: true,
    }
  } catch (error) {
    // Re-throw AuthorizationError as-is
    if (error instanceof AuthorizationError) {
      throw error
    }

    // Log and wrap other errors
    logger.error('Failed to verify admin status', {
      requestId,
      userId: user.id,
      error: error instanceof Error ? error.message : String(error),
    })

    throw new AuthorizationError('Unable to verify admin status', {
      userId: user.id,
      originalError: error instanceof Error ? error.message : undefined,
    })
  }
}

