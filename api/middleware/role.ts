/**
 * Role-based authorization middleware
 * RBAC Phase 6: Restrict API endpoints based on user role
 */

import type { User } from '../models/user'
import { errorResponse } from '../utils/response'
import { ErrorCodes } from '../utils/error-codes'
import { logger } from '../utils/logger'

export type UserRole = 'artist' | 'venue' | 'fan' | 'collective'

/**
 * requireRole - Middleware factory to check user has specific role(s)
 * Must be used AFTER authMiddleware which sets ctx.user
 *
 * @param allowedRoles - One or more roles that are permitted to access the endpoint
 * @returns Middleware function that returns 403 if role check fails
 *
 * @example
 * // Single role
 * router.post('/v1/gigs', gigsController.createGig, [authMiddleware, requireRole('venue')])
 *
 * // Multiple roles
 * router.get('/v1/some-route', handler, [authMiddleware, requireRole('artist', 'venue')])
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return async (ctx: { user?: User; requestId: string }, next: () => Promise<Response>): Promise<Response> => {
    // Ensure authMiddleware ran first
    if (!ctx.user) {
      logger.error('requireRole called without user in context - authMiddleware must run first', {
        requestId: ctx.requestId,
      })
      return errorResponse(
        ErrorCodes.AUTHENTICATION_FAILED,
        'Authentication required',
        401,
        undefined,
        ctx.requestId
      )
    }

    const userRole = ctx.user.role as UserRole | null

    if (!userRole || !allowedRoles.includes(userRole)) {
      logger.warn('Role authorization failed', {
        requestId: ctx.requestId,
        userId: ctx.user.id,
        userRole,
        requiredRoles: allowedRoles,
      })
      return errorResponse(
        ErrorCodes.AUTHORIZATION_FAILED,
        `This action requires one of these roles: ${allowedRoles.join(', ')}`,
        403,
        { userRole, requiredRoles: allowedRoles },
        ctx.requestId
      )
    }

    logger.debug('Role authorization passed', {
      requestId: ctx.requestId,
      userId: ctx.user.id,
      userRole,
    })

    return next()
  }
}

