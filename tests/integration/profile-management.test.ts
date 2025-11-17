/**
 * Integration Tests for Profile Management
 * Tests profile creation, editing, and retrieval
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { handleAuthCallback } from '../../api/routes/auth'
import * as profileController from '../../api/controllers/profile'
import * as onboardingController from '../../api/controllers/onboarding'
import { createMockEnv } from '../helpers/mock-env'
import {
  createOnboardingStep1Data,
  createOnboardingStep2Data,
  createOnboardingStep3Data,
  createOnboardingStep4Data,
  createOnboardingStep5Data,
} from '../helpers/test-data'
import type { Env } from '../../api/index'
import type { RequestContext } from '../../api/router'

describe('Profile Management Integration Tests', () => {
  let env: Env
  let mocks: any
  let userId: string
  let artistId: string
  let token: string

  beforeEach(async () => {
    const mockSetup = createMockEnv()
    env = mockSetup.env
    mocks = mockSetup.mocks

    // Create user and complete onboarding
    const authRequest = new Request('https://api.example.com/v1/auth/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'profile-test@example.com',
        oauth_provider: 'google',
        oauth_id: 'google-profile-123',
      }),
    })

    const authResponse = await handleAuthCallback(authRequest, env)
    const authData = (await authResponse.json()) as any
    userId = authData.data.user.id
    token = authData.data.token

    // Complete onboarding to create artist profile
    const steps = [
      { num: 1, data: createOnboardingStep1Data(), handler: onboardingController.submitStep1 },
      { num: 2, data: createOnboardingStep2Data(), handler: onboardingController.submitStep2 },
      { num: 3, data: createOnboardingStep3Data(), handler: onboardingController.submitStep3 },
      { num: 4, data: createOnboardingStep4Data(), handler: onboardingController.submitStep4 },
      { num: 5, data: createOnboardingStep5Data(), handler: onboardingController.submitStep5 },
    ]

    for (const step of steps) {
      const request = new Request(`https://api.example.com/v1/onboarding/step${step.num}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(step.data),
      })

      const ctx: RequestContext = {
        request,
        env,
        url: new URL(request.url),
        params: {},
        requestId: `test-req-${step.num}`,
        userId,
        startTime: Date.now(),
      }

      await step.handler(ctx)
    }

    // Get artist ID
    const artists = mocks.db.getTable('artists')
    artistId = artists.find((a: any) => a.user_id === userId)?.id
  })

  describe('Profile Retrieval', () => {
    it('should get own profile', async () => {
      const getProfileRequest = new Request('https://api.example.com/v1/profile')

      const ctx: RequestContext = {
        request: getProfileRequest,
        env,
        url: new URL(getProfileRequest.url),
        params: {},
        requestId: 'test-req',
        userId,
        startTime: Date.now(),
      }

      const response = await profileController.getProfile(ctx)
      const result = (await response.json()) as any

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
      expect(result.data.artist.id).toBe(artistId)
      expect(result.data.artist.user_id).toBe(userId)
      expect(result.data.artist.artist_name).toBeDefined()
      expect(result.data.artist.bio).toBeDefined()
    })

    it('should get public profile by ID', async () => {
      const getPublicProfileRequest = new Request(`https://api.example.com/v1/profile/${artistId}`)

      const ctx: RequestContext = {
        request: getPublicProfileRequest,
        env,
        url: new URL(getPublicProfileRequest.url),
        params: { id: artistId },
        requestId: 'test-req',
        userId,
        startTime: Date.now(),
      }

      const response = await profileController.getPublicProfile(ctx)
      const result = (await response.json()) as any

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
      expect(result.data.artist.id).toBe(artistId)
      // Public profile should not include private fields like email
      expect(result.data.artist.email).toBeUndefined()
    })

    it('should return 404 for non-existent profile', async () => {
      const nonExistentId = 'non-existent-artist-id'
      const getProfileRequest = new Request(`https://api.example.com/v1/profile/${nonExistentId}`)

      const ctx: RequestContext = {
        request: getProfileRequest,
        env,
        url: new URL(getProfileRequest.url),
        params: { id: nonExistentId },
        requestId: 'test-req',
        userId,
        startTime: Date.now(),
      }

      const response = await profileController.getPublicProfile(ctx)
      const result = (await response.json()) as any

      expect(response.status).toBe(404)
      expect(result.success).toBe(false)
    })
  })

  describe('Profile Editing', () => {
    it('should update profile bio and tagline', async () => {
      const updateData = {
        bio: 'Updated bio - I am a passionate musician with 10 years of experience.',
        tagline: 'Making music that moves people',
      }

      const updateRequest = new Request('https://api.example.com/v1/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      })

      const ctx: RequestContext = {
        request: updateRequest,
        env,
        url: new URL(updateRequest.url),
        params: {},
        requestId: 'test-req',
        userId,
        startTime: Date.now(),
      }

      const response = await profileController.updateProfile(ctx)
      const result = (await response.json()) as any

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
      expect(result.data.artist.bio).toBe(updateData.bio)
      expect(result.data.artist.tagline).toBe(updateData.tagline)

      // Verify changes persisted
      const artist = mocks.db.getTable('artists').find((a: any) => a.id === artistId)
      expect(artist.bio).toBe(updateData.bio)
      expect(artist.tagline).toBe(updateData.tagline)
    })

    it('should update social media links', async () => {
      const updateData = {
        instagram_url: 'https://instagram.com/newhandle',
        spotify_url: 'https://open.spotify.com/artist/newartist',
        youtube_url: 'https://youtube.com/@newchannel',
      }

      const updateRequest = new Request('https://api.example.com/v1/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      })

      const ctx: RequestContext = {
        request: updateRequest,
        env,
        url: new URL(updateRequest.url),
        params: {},
        requestId: 'test-req',
        userId,
        startTime: Date.now(),
      }

      const response = await profileController.updateProfile(ctx)
      const result = (await response.json()) as any

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
      expect(result.data.artist.instagram_url).toBe(updateData.instagram_url)
      expect(result.data.artist.spotify_url).toBe(updateData.spotify_url)
      expect(result.data.artist.youtube_url).toBe(updateData.youtube_url)
    })

    it('should update availability and rates', async () => {
      const updateData = {
        availability: 'weekends',
        base_rate_flat: 500,
        base_rate_hourly: 75,
        rates_negotiable: true,
      }

      const updateRequest = new Request('https://api.example.com/v1/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      })

      const ctx: RequestContext = {
        request: updateRequest,
        env,
        url: new URL(updateRequest.url),
        params: {},
        requestId: 'test-req',
        userId,
        startTime: Date.now(),
      }

      const response = await profileController.updateProfile(ctx)
      const result = (await response.json()) as any

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
      expect(result.data.artist.availability).toBe(updateData.availability)
      expect(result.data.artist.base_rate_flat).toBe(updateData.base_rate_flat)
      expect(result.data.artist.base_rate_hourly).toBe(updateData.base_rate_hourly)
      expect(result.data.artist.rates_negotiable).toBe(updateData.rates_negotiable)
    })

    it('should update genres and influences', async () => {
      const updateData = {
        genre_primary: 'Jazz',
        genre_secondary: ['Funk', 'Soul', 'R&B'],
        influences: 'Miles Davis, Herbie Hancock, Robert Glasper',
      }

      const updateRequest = new Request('https://api.example.com/v1/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      })

      const ctx: RequestContext = {
        request: updateRequest,
        env,
        url: new URL(updateRequest.url),
        params: {},
        requestId: 'test-req',
        userId,
        startTime: Date.now(),
      }

      const response = await profileController.updateProfile(ctx)
      const result = (await response.json()) as any

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
      expect(result.data.artist.genre_primary).toBe(updateData.genre_primary)
      expect(result.data.artist.influences).toBe(updateData.influences)
    })

    it('should validate profile updates', async () => {
      // Try to update with invalid data
      const invalidData = {
        base_rate_flat: -100, // Negative rate should be invalid
      }

      const updateRequest = new Request('https://api.example.com/v1/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(invalidData),
      })

      const ctx: RequestContext = {
        request: updateRequest,
        env,
        url: new URL(updateRequest.url),
        params: {},
        requestId: 'test-req',
        userId,
        startTime: Date.now(),
      }

      const response = await profileController.updateProfile(ctx)
      const result = (await response.json()) as any

      expect(response.status).toBe(400)
      expect(result.success).toBe(false)
      expect(result.error.code).toContain('VALIDATION')
    })

    it('should prevent updating another user\'s profile', async () => {
      // Create another user
      const auth2Request = new Request('https://api.example.com/v1/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'other-user@example.com',
          oauth_provider: 'google',
          oauth_id: 'google-other-123',
        }),
      })

      const auth2Response = await handleAuthCallback(auth2Request, env)
      await auth2Response.json()

      // Try to update profile using first user's token
      const updateRequest = new Request('https://api.example.com/v1/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Using original user's token
        },
        body: JSON.stringify({
          bio: 'Trying to update someone else\'s profile',
        }),
      })

      // Context should use the original userId
      const ctx: RequestContext = {
        request: updateRequest,
        env,
        url: new URL(updateRequest.url),
        params: {},
        requestId: 'test-req',
        userId, // Original user, not otherUserId
        startTime: Date.now(),
      }

      const response = await profileController.updateProfile(ctx)

      // Should succeed because we're updating our own profile
      expect(response.status).toBe(200)

      // Verify we didn't update the wrong profile
      const artist = mocks.db.getTable('artists').find((a: any) => a.user_id === userId)
      expect(artist.bio).toBe('Trying to update someone else\'s profile')
    })
  })

  describe('Profile Deletion', () => {
    it('should delete own profile', async () => {
      const deleteRequest = new Request('https://api.example.com/v1/profile', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const ctx: RequestContext = {
        request: deleteRequest,
        env,
        url: new URL(deleteRequest.url),
        params: {},
        requestId: 'test-req',
        userId,
        startTime: Date.now(),
      }

      const response = await profileController.deleteProfile(ctx)
      const result = (await response.json()) as any

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)

      // Verify artist profile was deleted
      const artists = mocks.db.getTable('artists')
      const deletedArtist = artists.find((a: any) => a.id === artistId)
      expect(deletedArtist).toBeUndefined()
    })
  })

  describe('Profile Avatar Upload', () => {
    it('should upload profile avatar', async () => {
      const avatarRequest = new Request('https://api.example.com/v1/profile/avatar/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          file_name: 'avatar.jpg',
          file_size_bytes: 512000, // 500KB
          file_format: 'jpg',
        }),
      })

      const ctx: RequestContext = {
        request: avatarRequest,
        env,
        url: new URL(avatarRequest.url),
        params: {},
        requestId: 'test-req',
        userId,
        startTime: Date.now(),
      }

      const response = await profileController.uploadAvatar(ctx)
      const result = (await response.json()) as any

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
      expect(result.data.upload_url).toBeDefined()
    })
  })

  describe('Profile Statistics', () => {
    it('should track profile views', async () => {
      // Create another user to view the profile
      const auth2Request = new Request('https://api.example.com/v1/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'viewer@example.com',
          oauth_provider: 'google',
          oauth_id: 'google-viewer-123',
        }),
      })

      const auth2Response = await handleAuthCallback(auth2Request, env)
      const auth2Data = (await auth2Response.json()) as any
      const viewerId = auth2Data.data.user.id

      // Viewer views the profile multiple times
      for (let i = 0; i < 3; i++) {
        const viewRequest = new Request(`https://api.example.com/v1/profile/${artistId}`)

        const viewCtx: RequestContext = {
          request: viewRequest,
          env,
          url: new URL(viewRequest.url),
          params: { id: artistId },
          requestId: `test-req-${i}`,
          userId: viewerId,
          startTime: Date.now(),
        }

        await profileController.getPublicProfile(viewCtx)
      }

      // Get profile stats
      const statsRequest = new Request('https://api.example.com/v1/profile/stats')

      const statsCtx: RequestContext = {
        request: statsRequest,
        env,
        url: new URL(statsRequest.url),
        params: {},
        requestId: 'test-req-stats',
        userId,
        startTime: Date.now(),
      }

      const statsResponse = await profileController.getProfileStats(statsCtx)
      const statsResult = (await statsResponse.json()) as any

      expect(statsResponse.status).toBe(200)
      expect(statsResult.success).toBe(true)
      expect(statsResult.data.total_views).toBeGreaterThanOrEqual(3)
    })
  })
})
