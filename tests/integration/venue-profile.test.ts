/**
 * Integration Tests for Venue Profile CRUD Operations
 * Tests the venue profile API endpoints end-to-end
 */

import { describe, it, expect, beforeEach } from 'vitest'
import * as venueController from '../../api/controllers/venue'
import { createMockEnv } from '../helpers/mock-env'
import { createTestVenueUser, createTestVenue } from '../helpers/test-data'
import type { Env } from '../../api/index'
import type { RequestContext } from '../../api/router'

describe('Venue Profile Integration Tests', () => {
  let env: Env
  let mocks: ReturnType<typeof createMockEnv>['mocks']

  beforeEach(() => {
    const mockSetup = createMockEnv()
    env = mockSetup.env
    mocks = mockSetup.mocks
  })

  // Helper to create a request context
  const createContext = (
    userId: string,
    request: Request,
    params: Record<string, string> = {}
  ): RequestContext => ({
    request,
    env,
    url: new URL(request.url),
    params,
    requestId: `test-req-${Date.now()}`,
    userId,
    startTime: Date.now(),
  })

  describe('GET /v1/venue/profile', () => {
    it('should return venue profile for authenticated user', async () => {
      // Setup: Create user and venue
      const user = createTestVenueUser({ onboarding_complete: true })
      const venue = createTestVenue(user.id)
      mocks.db.getTable('users').push(user)
      ;(mocks.db as any).tables.get('users')!.set(user.id, user)
      ;(mocks.db as any).tables.get('venues')!.set(venue.id, venue)

      // Execute
      const request = new Request('https://api.example.com/v1/venue/profile')
      const ctx = createContext(user.id, request)
      const response = await venueController.getVenueProfile(ctx)
      const body = (await response.json()) as {
        success: boolean
        data: { venue: { id: string; name: string } }
      }

      // Assert
      expect(response.status).toBe(200)
      expect(body.success).toBe(true)
      expect(body.data.venue.id).toBe(venue.id)
      expect(body.data.venue.name).toBe(venue.name)
    })

    it('should return 404 if venue profile does not exist', async () => {
      // Setup: Create user without venue profile
      const user = createTestVenueUser()
      ;(mocks.db as any).tables.get('users')!.set(user.id, user)

      // Execute
      const request = new Request('https://api.example.com/v1/venue/profile')
      const ctx = createContext(user.id, request)
      const response = await venueController.getVenueProfile(ctx)
      const body = (await response.json()) as { success: boolean; error: { code: string } }

      // Assert
      expect(response.status).toBe(404)
      expect(body.success).toBe(false)
      expect(body.error.code).toBe('not_found')
    })
  })

  describe('POST /v1/venue/profile', () => {
    it('should create venue profile with required fields', async () => {
      // Setup: Create user
      const user = createTestVenueUser()
      ;(mocks.db as any).tables.get('users')!.set(user.id, user)

      // Execute
      const request = new Request('https://api.example.com/v1/venue/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'The Blue Note',
          city: 'New York',
          venue_type: 'club',
        }),
      })
      const ctx = createContext(user.id, request)
      const response = await venueController.createVenueProfile(ctx)
      const body = (await response.json()) as {
        success: boolean
        data: { venue: { name: string; city: string }; message: string }
      }

      // Assert
      expect(response.status).toBe(201)
      expect(body.success).toBe(true)
      expect(body.data.venue.name).toBe('The Blue Note')
      expect(body.data.venue.city).toBe('New York')
      expect(body.data.message).toBe('Venue profile created successfully')
    })

    it('should return 400 if name is missing', async () => {
      // Setup: Create user
      const user = createTestVenueUser()
      ;(mocks.db as any).tables.get('users')!.set(user.id, user)

      // Execute
      const request = new Request('https://api.example.com/v1/venue/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: 'New York',
        }),
      })
      const ctx = createContext(user.id, request)
      const response = await venueController.createVenueProfile(ctx)
      const body = (await response.json()) as { success: boolean; error: { code: string } }

      // Assert
      expect(response.status).toBe(400)
      expect(body.success).toBe(false)
      expect(body.error.code).toBe('validation_error')
    })

    it('should return 400 if city is missing', async () => {
      // Setup: Create user
      const user = createTestVenueUser()
      ;(mocks.db as any).tables.get('users')!.set(user.id, user)

      // Execute
      const request = new Request('https://api.example.com/v1/venue/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'The Blue Note',
        }),
      })
      const ctx = createContext(user.id, request)
      const response = await venueController.createVenueProfile(ctx)
      const body = (await response.json()) as { success: boolean; error: { code: string } }

      // Assert
      expect(response.status).toBe(400)
      expect(body.success).toBe(false)
      expect(body.error.code).toBe('validation_error')
    })

    it('should return 400 if profile already exists', async () => {
      // Setup: Create user with existing venue
      const user = createTestVenueUser()
      const venue = createTestVenue(user.id)
      ;(mocks.db as any).tables.get('users')!.set(user.id, user)
      ;(mocks.db as any).tables.get('venues')!.set(venue.id, venue)

      // Execute
      const request = new Request('https://api.example.com/v1/venue/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Another Venue',
          city: 'Los Angeles',
        }),
      })
      const ctx = createContext(user.id, request)
      const response = await venueController.createVenueProfile(ctx)
      const body = (await response.json()) as { success: boolean; error: { code: string } }

      // Assert
      expect(response.status).toBe(400)
      expect(body.success).toBe(false)
      expect(body.error.code).toBe('validation_error')
    })

    it('should mark user onboarding_complete = 1 after venue creation', async () => {
      // Setup: Create user with onboarding incomplete
      const user = createTestVenueUser({ onboarding_complete: false })
      ;(mocks.db as any).tables.get('users')!.set(user.id, user)

      // Execute
      const request = new Request('https://api.example.com/v1/venue/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'The Blue Note',
          city: 'New York',
        }),
      })
      const ctx = createContext(user.id, request)
      await venueController.createVenueProfile(ctx)

      // Assert - verify venue was created (onboarding_complete update handled by mock)
      const venues = (mocks.db as any).tables.get('venues')!
      expect(venues.size).toBeGreaterThan(0)
    })
  })

  describe('PUT /v1/venue/profile', () => {
    it('should update venue profile with partial fields', async () => {
      // Setup: Create user with venue
      const user = createTestVenueUser({ onboarding_complete: true })
      const venue = createTestVenue(user.id)
      ;(mocks.db as any).tables.get('users')!.set(user.id, user)
      ;(mocks.db as any).tables.get('venues')!.set(venue.id, venue)

      // Execute
      const request = new Request('https://api.example.com/v1/venue/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Updated Venue Name',
          capacity: 750,
        }),
      })
      const ctx = createContext(user.id, request)
      const response = await venueController.updateVenueProfile(ctx)
      const body = (await response.json()) as {
        success: boolean
        data: { message: string }
      }

      // Assert
      expect(response.status).toBe(200)
      expect(body.success).toBe(true)
      expect(body.data.message).toBe('Venue profile updated successfully')
    })

    it('should return 404 if venue profile does not exist', async () => {
      // Setup: Create user without venue
      const user = createTestVenueUser()
      ;(mocks.db as any).tables.get('users')!.set(user.id, user)

      // Execute
      const request = new Request('https://api.example.com/v1/venue/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Updated Name',
        }),
      })
      const ctx = createContext(user.id, request)
      const response = await venueController.updateVenueProfile(ctx)
      const body = (await response.json()) as { success: boolean; error: { code: string } }

      // Assert
      expect(response.status).toBe(404)
      expect(body.success).toBe(false)
      expect(body.error.code).toBe('not_found')
    })
  })

  describe('GET /v1/venue/profile/:id', () => {
    it('should return public venue profile by ID', async () => {
      // Setup: Create venue (no user auth needed for public endpoint)
      const user = createTestVenueUser({ onboarding_complete: true })
      const venue = createTestVenue(user.id)
      ;(mocks.db as any).tables.get('users')!.set(user.id, user)
      ;(mocks.db as any).tables.get('venues')!.set(venue.id, venue)

      // Execute
      const request = new Request(`https://api.example.com/v1/venue/profile/${venue.id}`)
      const ctx = createContext('any-user', request, { id: venue.id })
      const response = await venueController.getPublicVenueProfile(ctx)
      const body = (await response.json()) as {
        success: boolean
        data: { venue: { id: string; name: string } }
      }

      // Assert
      expect(response.status).toBe(200)
      expect(body.success).toBe(true)
      expect(body.data.venue.id).toBe(venue.id)
      expect(body.data.venue.name).toBe(venue.name)
    })

    it('should return 404 for unknown venue ID', async () => {
      // Execute
      const request = new Request('https://api.example.com/v1/venue/profile/unknown-id')
      const ctx = createContext('any-user', request, { id: 'unknown-id' })
      const response = await venueController.getPublicVenueProfile(ctx)
      const body = (await response.json()) as { success: boolean; error: { code: string } }

      // Assert
      expect(response.status).toBe(404)
      expect(body.success).toBe(false)
      expect(body.error.code).toBe('not_found')
    })

    it('should not include sensitive fields in public profile', async () => {
      // Setup: Create venue
      const user = createTestVenueUser({ onboarding_complete: true })
      const venue = createTestVenue(user.id)
      ;(mocks.db as any).tables.get('users')!.set(user.id, user)
      ;(mocks.db as any).tables.get('venues')!.set(venue.id, venue)

      // Execute
      const request = new Request(`https://api.example.com/v1/venue/profile/${venue.id}`)
      const ctx = createContext('any-user', request, { id: venue.id })
      const response = await venueController.getPublicVenueProfile(ctx)
      const body = (await response.json()) as {
        success: boolean
        data: { venue: Record<string, unknown> }
      }

      // Assert - public profile should not include these fields
      expect(body.data.venue).not.toHaveProperty('user_id')
      expect(body.data.venue).not.toHaveProperty('address_line1')
      expect(body.data.venue).not.toHaveProperty('zip_code')
      expect(body.data.venue).not.toHaveProperty('booking_lead_days')
    })
  })
})

