/**
 * Unit Tests for Role Middleware
 * Tests the role-based authorization middleware
 */

import { describe, it, expect, vi } from 'vitest'
import { requireRole } from '../../../api/middleware/role'
import type { User } from '../../../api/models/user'

describe('Role Middleware', () => {
  // Helper to create a mock user
  const createMockUser = (role: string | null): User =>
    ({
      id: 'user-123',
      clerk_id: 'clerk_123',
      oauth_provider: 'google',
      oauth_id: 'oauth_123',
      email: 'test@example.com',
      role,
      onboarding_complete: 1,
      created_at: '2024-01-15T10:00:00.000Z',
      updated_at: '2024-01-15T10:00:00.000Z',
    }) as User

  // Helper to create a mock context
  const createMockContext = (user?: User) => ({
    user,
    requestId: 'test-request-123',
  })

  // Helper to create a mock next function
  const createMockNext = () => vi.fn().mockResolvedValue(new Response('OK', { status: 200 }))

  describe('requireRole - Single Role', () => {
    it('should pass when user has the required role', async () => {
      const middleware = requireRole('venue')
      const ctx = createMockContext(createMockUser('venue'))
      const next = createMockNext()

      const response = await middleware(ctx, next)

      expect(next).toHaveBeenCalledTimes(1)
      expect(response.status).toBe(200)
    })

    it('should return 403 when user has wrong role', async () => {
      const middleware = requireRole('venue')
      const ctx = createMockContext(createMockUser('artist'))
      const next = createMockNext()

      const response = await middleware(ctx, next)

      expect(next).not.toHaveBeenCalled()
      expect(response.status).toBe(403)

      const body = (await response.json()) as { success: boolean; error: { message: string } }
      expect(body.success).toBe(false)
      expect(body.error.message).toContain('venue')
    })

    it('should return 403 when user has no role (null)', async () => {
      const middleware = requireRole('artist')
      const ctx = createMockContext(createMockUser(null))
      const next = createMockNext()

      const response = await middleware(ctx, next)

      expect(next).not.toHaveBeenCalled()
      expect(response.status).toBe(403)
    })
  })

  describe('requireRole - Multiple Roles', () => {
    it('should pass when user has one of multiple allowed roles', async () => {
      const middleware = requireRole('artist', 'venue')
      const artistCtx = createMockContext(createMockUser('artist'))
      const venueCtx = createMockContext(createMockUser('venue'))
      const nextArtist = createMockNext()
      const nextVenue = createMockNext()

      const artistResponse = await middleware(artistCtx, nextArtist)
      const venueResponse = await middleware(venueCtx, nextVenue)

      expect(nextArtist).toHaveBeenCalledTimes(1)
      expect(nextVenue).toHaveBeenCalledTimes(1)
      expect(artistResponse.status).toBe(200)
      expect(venueResponse.status).toBe(200)
    })

    it('should return 403 when user role is not in allowed list', async () => {
      const middleware = requireRole('artist', 'venue')
      const ctx = createMockContext(createMockUser('fan'))
      const next = createMockNext()

      const response = await middleware(ctx, next)

      expect(next).not.toHaveBeenCalled()
      expect(response.status).toBe(403)

      const body = (await response.json()) as { success: boolean; error: { message: string } }
      expect(body.error.message).toContain('artist')
      expect(body.error.message).toContain('venue')
    })
  })

  describe('requireRole - Authentication Errors', () => {
    it('should return 401 when user is undefined in context', async () => {
      const middleware = requireRole('venue')
      const ctx = createMockContext(undefined)
      const next = createMockNext()

      const response = await middleware(ctx, next)

      expect(next).not.toHaveBeenCalled()
      expect(response.status).toBe(401)

      const body = (await response.json()) as { success: boolean; error: { message: string } }
      expect(body.success).toBe(false)
      expect(body.error.message).toContain('Authentication')
    })
  })

  describe('requireRole - All Role Types', () => {
    const allRoles = ['artist', 'venue', 'fan', 'collective'] as const

    allRoles.forEach((role) => {
      it(`should accept ${role} role when it is in allowed list`, async () => {
        const middleware = requireRole(role)
        const ctx = createMockContext(createMockUser(role))
        const next = createMockNext()

        const response = await middleware(ctx, next)

        expect(next).toHaveBeenCalledTimes(1)
        expect(response.status).toBe(200)
      })
    })
  })

  describe('requireRole - Error Response Format', () => {
    it('should include required roles in error message', async () => {
      const middleware = requireRole('venue')
      const ctx = createMockContext(createMockUser('artist'))
      const next = createMockNext()

      const response = await middleware(ctx, next)
      const body = await response.json()

      expect(response.status).toBe(403)
      expect(body.success).toBe(false)
      // The error response includes role info in the message
      expect(body.error.message).toContain('venue')
    })
  })
})

