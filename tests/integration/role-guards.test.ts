/**
 * Integration Tests for Role-Based Access Control Guards
 * Tests that API endpoints properly enforce role restrictions
 */

import { describe, it, expect, vi } from 'vitest'
import { requireRole } from '../../api/middleware/role'
import type { User } from '../../api/models/user'

describe('Role Guards Integration Tests', () => {
  // Helper to create a mock user with specific role
  const createMockUser = (
    role: 'artist' | 'venue' | 'fan' | 'collective' | null,
    overrides?: Partial<User>
  ): User =>
    ({
      id: `user-${Date.now()}`,
      clerk_id: `clerk_${Date.now()}`,
      oauth_provider: 'google',
      oauth_id: `oauth_${Date.now()}`,
      email: 'test@example.com',
      role,
      onboarding_complete: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...overrides,
    }) as User

  // Mock next function that returns success
  const mockNext = () => vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true }), { status: 200 }))

  describe('Gig Creation - Venue Only', () => {
    const gigCreationMiddleware = requireRole('venue')

    it('should allow venue user to create gig (POST /v1/gigs)', async () => {
      const venueUser = createMockUser('venue')
      const ctx = { user: venueUser, requestId: 'test-123' }
      const next = mockNext()

      const response = await gigCreationMiddleware(ctx, next)

      expect(next).toHaveBeenCalledTimes(1)
      expect(response.status).toBe(200)
    })

    it('should deny artist from creating gig', async () => {
      const artistUser = createMockUser('artist')
      const ctx = { user: artistUser, requestId: 'test-123' }
      const next = mockNext()

      const response = await gigCreationMiddleware(ctx, next)

      expect(next).not.toHaveBeenCalled()
      expect(response.status).toBe(403)
    })

    it('should deny fan from creating gig', async () => {
      const fanUser = createMockUser('fan')
      const ctx = { user: fanUser, requestId: 'test-123' }
      const next = mockNext()

      const response = await gigCreationMiddleware(ctx, next)

      expect(next).not.toHaveBeenCalled()
      expect(response.status).toBe(403)
    })
  })

  describe('Gig Application - Artist Only', () => {
    const applyToGigMiddleware = requireRole('artist')

    it('should allow artist to apply to gig (POST /v1/gigs/:id/apply)', async () => {
      const artistUser = createMockUser('artist')
      const ctx = { user: artistUser, requestId: 'test-123' }
      const next = mockNext()

      const response = await applyToGigMiddleware(ctx, next)

      expect(next).toHaveBeenCalledTimes(1)
      expect(response.status).toBe(200)
    })

    it('should deny venue from applying to gig', async () => {
      const venueUser = createMockUser('venue')
      const ctx = { user: venueUser, requestId: 'test-123' }
      const next = mockNext()

      const response = await applyToGigMiddleware(ctx, next)

      expect(next).not.toHaveBeenCalled()
      expect(response.status).toBe(403)
    })

    it('should deny fan from applying to gig', async () => {
      const fanUser = createMockUser('fan')
      const ctx = { user: fanUser, requestId: 'test-123' }
      const next = mockNext()

      const response = await applyToGigMiddleware(ctx, next)

      expect(next).not.toHaveBeenCalled()
      expect(response.status).toBe(403)
    })
  })

  describe('View Gig Applications - Venue Only', () => {
    const viewApplicationsMiddleware = requireRole('venue')

    it('should allow venue to view gig applications (GET /v1/gigs/:id/applications)', async () => {
      const venueUser = createMockUser('venue')
      const ctx = { user: venueUser, requestId: 'test-123' }
      const next = mockNext()

      const response = await viewApplicationsMiddleware(ctx, next)

      expect(next).toHaveBeenCalledTimes(1)
      expect(response.status).toBe(200)
    })

    it('should deny artist from viewing gig applications', async () => {
      const artistUser = createMockUser('artist')
      const ctx = { user: artistUser, requestId: 'test-123' }
      const next = mockNext()

      const response = await viewApplicationsMiddleware(ctx, next)

      expect(next).not.toHaveBeenCalled()
      expect(response.status).toBe(403)
    })
  })

  describe('Accept/Reject Applications - Venue Only', () => {
    const manageApplicationsMiddleware = requireRole('venue')

    it('should allow venue to accept/reject applications (PUT /v1/gigs/:id/applications/:appId)', async () => {
      const venueUser = createMockUser('venue')
      const ctx = { user: venueUser, requestId: 'test-123' }
      const next = mockNext()

      const response = await manageApplicationsMiddleware(ctx, next)

      expect(next).toHaveBeenCalledTimes(1)
      expect(response.status).toBe(200)
    })

    it('should deny artist from managing applications', async () => {
      const artistUser = createMockUser('artist')
      const ctx = { user: artistUser, requestId: 'test-123' }
      const next = mockNext()

      const response = await manageApplicationsMiddleware(ctx, next)

      expect(next).not.toHaveBeenCalled()
      expect(response.status).toBe(403)
    })
  })

  describe('Withdraw Application - Artist Only', () => {
    const withdrawMiddleware = requireRole('artist')

    it('should allow artist to withdraw application (DELETE /v1/gigs/:id/apply)', async () => {
      const artistUser = createMockUser('artist')
      const ctx = { user: artistUser, requestId: 'test-123' }
      const next = mockNext()

      const response = await withdrawMiddleware(ctx, next)

      expect(next).toHaveBeenCalledTimes(1)
      expect(response.status).toBe(200)
    })

    it('should deny venue from withdrawing application', async () => {
      const venueUser = createMockUser('venue')
      const ctx = { user: venueUser, requestId: 'test-123' }
      const next = mockNext()

      const response = await withdrawMiddleware(ctx, next)

      expect(next).not.toHaveBeenCalled()
      expect(response.status).toBe(403)
    })
  })

  describe('My Gigs - Venue Only', () => {
    const myGigsMiddleware = requireRole('venue')

    it('should allow venue to view their posted gigs (GET /v1/gigs/mine)', async () => {
      const venueUser = createMockUser('venue')
      const ctx = { user: venueUser, requestId: 'test-123' }
      const next = mockNext()

      const response = await myGigsMiddleware(ctx, next)

      expect(next).toHaveBeenCalledTimes(1)
      expect(response.status).toBe(200)
    })

    it('should deny artist from accessing venue gigs list', async () => {
      const artistUser = createMockUser('artist')
      const ctx = { user: artistUser, requestId: 'test-123' }
      const next = mockNext()

      const response = await myGigsMiddleware(ctx, next)

      expect(next).not.toHaveBeenCalled()
      expect(response.status).toBe(403)
    })
  })

  describe('My Applications - Artist Only', () => {
    const myApplicationsMiddleware = requireRole('artist')

    it('should allow artist to view their applications (GET /v1/gigs/applications)', async () => {
      const artistUser = createMockUser('artist')
      const ctx = { user: artistUser, requestId: 'test-123' }
      const next = mockNext()

      const response = await myApplicationsMiddleware(ctx, next)

      expect(next).toHaveBeenCalledTimes(1)
      expect(response.status).toBe(200)
    })

    it('should deny venue from accessing artist applications list', async () => {
      const venueUser = createMockUser('venue')
      const ctx = { user: venueUser, requestId: 'test-123' }
      const next = mockNext()

      const response = await myApplicationsMiddleware(ctx, next)

      expect(next).not.toHaveBeenCalled()
      expect(response.status).toBe(403)
    })
  })

  describe('Venue Profile Endpoints - Venue Only', () => {
    const venueProfileMiddleware = requireRole('venue')

    it('should allow venue to access venue profile endpoints', async () => {
      const venueUser = createMockUser('venue')
      const ctx = { user: venueUser, requestId: 'test-123' }
      const next = mockNext()

      const response = await venueProfileMiddleware(ctx, next)

      expect(next).toHaveBeenCalledTimes(1)
      expect(response.status).toBe(200)
    })

    it('should deny artist from accessing venue profile endpoints', async () => {
      const artistUser = createMockUser('artist')
      const ctx = { user: artistUser, requestId: 'test-123' }
      const next = mockNext()

      const response = await venueProfileMiddleware(ctx, next)

      expect(next).not.toHaveBeenCalled()
      expect(response.status).toBe(403)
    })
  })

  describe('Error Response Details', () => {
    it('should include proper error message in 403 response', async () => {
      const middleware = requireRole('venue')
      const artistUser = createMockUser('artist')
      const ctx = { user: artistUser, requestId: 'test-123' }
      const next = mockNext()

      const response = await middleware(ctx, next)
      const body = await response.json()

      expect(response.status).toBe(403)
      expect(body.success).toBe(false)
      // The error response includes role info in the message
      expect(body.error.message).toContain('venue')
    })
  })

  describe('Users Without Role Selected', () => {
    it('should deny access to role-protected endpoints for users with null role', async () => {
      const noRoleUser = createMockUser(null)
      const middleware = requireRole('artist', 'venue')
      const ctx = { user: noRoleUser, requestId: 'test-123' }
      const next = mockNext()

      const response = await middleware(ctx, next)

      expect(next).not.toHaveBeenCalled()
      expect(response.status).toBe(403)
    })
  })
})

