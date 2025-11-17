/**
 * Integration Tests for Marketplace Browsing
 * Tests artist discovery with filters and gig browsing
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { handleAuthCallback } from '../../api/routes/auth'
import * as artistsController from '../../api/controllers/artists'
import * as gigsController from '../../api/controllers/gigs'
import * as searchController from '../../api/controllers/search'
import { createMockEnv } from '../helpers/mock-env'
import { createTestArtist, createTestGig } from '../helpers/test-data'
import type { Env } from '../../api/index'
import type { RequestContext } from '../../api/router'

describe('Marketplace Browsing Integration Tests', () => {
  let env: Env
  let mocks: any
  let userId: string
  let token: string

  beforeEach(async () => {
    const mockSetup = createMockEnv()
    env = mockSetup.env
    mocks = mockSetup.mocks

    // Create authenticated user
    const authRequest = new Request('https://api.example.com/v1/auth/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'marketplace-test@example.com',
        oauth_provider: 'google',
        oauth_id: 'google-marketplace-123',
      }),
    })

    const authResponse = await handleAuthCallback(authRequest, env)
    const authData = (await authResponse.json()) as any
    userId = authData.data.user.id
    token = authData.data.token

    // Create test artists with different characteristics
    const testArtists = [
      createTestArtist('user-1', {
        artist_name: 'Jazz Virtuoso',
        genre_primary: 'Jazz',
        location_city: 'New York',
        location_state: 'NY',
        base_rate_hourly: 150,
        verified: true,
      }),
      createTestArtist('user-2', {
        artist_name: 'Rock Legend',
        genre_primary: 'Rock',
        location_city: 'Los Angeles',
        location_state: 'CA',
        base_rate_hourly: 200,
        verified: false,
      }),
      createTestArtist('user-3', {
        artist_name: 'Hip Hop Producer',
        genre_primary: 'Hip-Hop',
        location_city: 'Atlanta',
        location_state: 'GA',
        base_rate_hourly: 100,
        verified: true,
      }),
      createTestArtist('user-4', {
        artist_name: 'Country Singer',
        genre_primary: 'Country',
        location_city: 'Nashville',
        location_state: 'TN',
        base_rate_hourly: 125,
        verified: false,
      }),
      createTestArtist('user-5', {
        artist_name: 'EDM DJ',
        genre_primary: 'Electronic',
        location_city: 'Miami',
        location_state: 'FL',
        base_rate_hourly: 175,
        verified: true,
      }),
    ]

    mocks.db.getTable('artists').push(...testArtists)

    // Create test gigs
    const testGigs = [
      createTestGig(testArtists[0].id, {
        title: 'Jazz Night at Blue Note',
        gig_type: 'performance',
        genre_required: 'Jazz',
        location_city: 'New York',
        location_state: 'NY',
        compensation_amount: 500,
        status: 'open',
      }),
      createTestGig(testArtists[1].id, {
        title: 'Rock Festival Lineup',
        gig_type: 'performance',
        genre_required: 'Rock',
        location_city: 'Los Angeles',
        location_state: 'CA',
        compensation_amount: 1000,
        status: 'open',
      }),
      createTestGig(testArtists[2].id, {
        title: 'Beat Making Session',
        gig_type: 'collaboration',
        genre_required: 'Hip-Hop',
        location_city: 'Atlanta',
        location_state: 'GA',
        compensation_amount: 300,
        status: 'open',
      }),
      createTestGig(testArtists[3].id, {
        title: 'Studio Recording Project',
        gig_type: 'recording',
        genre_required: 'Country',
        location_city: 'Nashville',
        location_state: 'TN',
        compensation_amount: 750,
        status: 'closed',
      }),
    ]

    mocks.db.getTable('gigs').push(...testGigs)
  })

  describe('Artist Discovery with Filters', () => {
    it('should list all artists without filters', async () => {
      const listRequest = new Request('https://api.example.com/v1/artists')

      const ctx: RequestContext = {
        request: listRequest,
        env,
        url: new URL(listRequest.url),
        params: {},
        requestId: 'test-req',
        userId,
        startTime: Date.now(),
      }

      const response = await artistsController.listArtists(ctx)
      const result = (await response.json()) as any

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
      expect(result.data.artists.length).toBe(5)
      expect(result.data.total_count).toBe(5)
    })

    it('should filter artists by genre', async () => {
      const listRequest = new Request('https://api.example.com/v1/artists?genre=Jazz')

      const ctx: RequestContext = {
        request: listRequest,
        env,
        url: new URL(listRequest.url),
        params: {},
        requestId: 'test-req',
        userId,
        startTime: Date.now(),
      }

      const response = await artistsController.listArtists(ctx)
      const result = (await response.json()) as any

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
      expect(result.data.artists.length).toBe(1)
      expect(result.data.artists[0].genre_primary).toBe('Jazz')
    })

    it('should filter artists by location', async () => {
      const listRequest = new Request('https://api.example.com/v1/artists?city=New York&state=NY')

      const ctx: RequestContext = {
        request: listRequest,
        env,
        url: new URL(listRequest.url),
        params: {},
        requestId: 'test-req',
        userId,
        startTime: Date.now(),
      }

      const response = await artistsController.listArtists(ctx)
      const result = (await response.json()) as any

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
      expect(result.data.artists.length).toBe(1)
      expect(result.data.artists[0].location_city).toBe('New York')
    })

    it('should filter artists by rate range', async () => {
      const listRequest = new Request('https://api.example.com/v1/artists?min_rate=100&max_rate=150')

      const ctx: RequestContext = {
        request: listRequest,
        env,
        url: new URL(listRequest.url),
        params: {},
        requestId: 'test-req',
        userId,
        startTime: Date.now(),
      }

      const response = await artistsController.listArtists(ctx)
      const result = (await response.json()) as any

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
      // Should include Jazz Virtuoso (150), Hip Hop Producer (100), and Country Singer (125)
      expect(result.data.artists.length).toBe(3)
      for (const artist of result.data.artists) {
        expect(artist.base_rate_hourly).toBeGreaterThanOrEqual(100)
        expect(artist.base_rate_hourly).toBeLessThanOrEqual(150)
      }
    })

    it('should filter verified artists only', async () => {
      const listRequest = new Request('https://api.example.com/v1/artists?verified=true')

      const ctx: RequestContext = {
        request: listRequest,
        env,
        url: new URL(listRequest.url),
        params: {},
        requestId: 'test-req',
        userId,
        startTime: Date.now(),
      }

      const response = await artistsController.listArtists(ctx)
      const result = (await response.json()) as any

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
      expect(result.data.artists.length).toBe(3) // Jazz, Hip-Hop, EDM are verified
      for (const artist of result.data.artists) {
        expect(artist.verified).toBe(true)
      }
    })

    it('should combine multiple filters', async () => {
      const listRequest = new Request('https://api.example.com/v1/artists?genre=Jazz&verified=true&min_rate=100')

      const ctx: RequestContext = {
        request: listRequest,
        env,
        url: new URL(listRequest.url),
        params: {},
        requestId: 'test-req',
        userId,
        startTime: Date.now(),
      }

      const response = await artistsController.listArtists(ctx)
      const result = (await response.json()) as any

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
      expect(result.data.artists.length).toBe(1)
      expect(result.data.artists[0].genre_primary).toBe('Jazz')
      expect(result.data.artists[0].verified).toBe(true)
    })

    it('should support pagination', async () => {
      const page1Request = new Request('https://api.example.com/v1/artists?limit=2&offset=0')

      const ctx1: RequestContext = {
        request: page1Request,
        env,
        url: new URL(page1Request.url),
        params: {},
        requestId: 'test-req-1',
        userId,
        startTime: Date.now(),
      }

      const page1Response = await artistsController.listArtists(ctx1)
      const page1Result = (await page1Response.json()) as any

      expect(page1Response.status).toBe(200)
      expect(page1Result.data.artists.length).toBe(2)

      const page2Request = new Request('https://api.example.com/v1/artists?limit=2&offset=2')

      const ctx2: RequestContext = {
        request: page2Request,
        env,
        url: new URL(page2Request.url),
        params: {},
        requestId: 'test-req-2',
        userId,
        startTime: Date.now(),
      }

      const page2Response = await artistsController.listArtists(ctx2)
      const page2Result = (await page2Response.json()) as any

      expect(page2Response.status).toBe(200)
      expect(page2Result.data.artists.length).toBe(2)

      // Ensure different artists on different pages
      expect(page1Result.data.artists[0].id).not.toBe(page2Result.data.artists[0].id)
    })
  })

  describe('Gig Browsing with Filters', () => {
    it('should list all open gigs', async () => {
      const listRequest = new Request('https://api.example.com/v1/gigs?status=open')

      const ctx: RequestContext = {
        request: listRequest,
        env,
        url: new URL(listRequest.url),
        params: {},
        requestId: 'test-req',
        userId,
        startTime: Date.now(),
      }

      const response = await gigsController.listGigs(ctx)
      const result = (await response.json()) as any

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
      expect(result.data.gigs.length).toBe(3) // 3 open gigs
      for (const gig of result.data.gigs) {
        expect(gig.status).toBe('open')
      }
    })

    it('should filter gigs by genre', async () => {
      const listRequest = new Request('https://api.example.com/v1/gigs?genre=Rock')

      const ctx: RequestContext = {
        request: listRequest,
        env,
        url: new URL(listRequest.url),
        params: {},
        requestId: 'test-req',
        userId,
        startTime: Date.now(),
      }

      const response = await gigsController.listGigs(ctx)
      const result = (await response.json()) as any

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
      expect(result.data.gigs.length).toBe(1)
      expect(result.data.gigs[0].genre_required).toBe('Rock')
    })

    it('should filter gigs by type', async () => {
      const listRequest = new Request('https://api.example.com/v1/gigs?type=performance')

      const ctx: RequestContext = {
        request: listRequest,
        env,
        url: new URL(listRequest.url),
        params: {},
        requestId: 'test-req',
        userId,
        startTime: Date.now(),
      }

      const response = await gigsController.listGigs(ctx)
      const result = (await response.json()) as any

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
      expect(result.data.gigs.length).toBe(2)
      for (const gig of result.data.gigs) {
        expect(gig.gig_type).toBe('performance')
      }
    })

    it('should filter gigs by location', async () => {
      const listRequest = new Request('https://api.example.com/v1/gigs?city=Los Angeles&state=CA')

      const ctx: RequestContext = {
        request: listRequest,
        env,
        url: new URL(listRequest.url),
        params: {},
        requestId: 'test-req',
        userId,
        startTime: Date.now(),
      }

      const response = await gigsController.listGigs(ctx)
      const result = (await response.json()) as any

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
      expect(result.data.gigs.length).toBe(1)
      expect(result.data.gigs[0].location_city).toBe('Los Angeles')
    })

    it('should filter gigs by compensation range', async () => {
      const listRequest = new Request('https://api.example.com/v1/gigs?min_compensation=500&max_compensation=1000')

      const ctx: RequestContext = {
        request: listRequest,
        env,
        url: new URL(listRequest.url),
        params: {},
        requestId: 'test-req',
        userId,
        startTime: Date.now(),
      }

      const response = await gigsController.listGigs(ctx)
      const result = (await response.json()) as any

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
      expect(result.data.gigs.length).toBe(3) // 500, 750, 1000
      for (const gig of result.data.gigs) {
        expect(gig.compensation_amount).toBeGreaterThanOrEqual(500)
        expect(gig.compensation_amount).toBeLessThanOrEqual(1000)
      }
    })

    it('should sort gigs by compensation (highest first)', async () => {
      const listRequest = new Request('https://api.example.com/v1/gigs?sort_by=compensation&order=desc')

      const ctx: RequestContext = {
        request: listRequest,
        env,
        url: new URL(listRequest.url),
        params: {},
        requestId: 'test-req',
        userId,
        startTime: Date.now(),
      }

      const response = await gigsController.listGigs(ctx)
      const result = (await response.json()) as any

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)

      // Verify descending order
      for (let i = 0; i < result.data.gigs.length - 1; i++) {
        expect(result.data.gigs[i].compensation_amount).toBeGreaterThanOrEqual(
          result.data.gigs[i + 1].compensation_amount
        )
      }
    })

    it('should sort gigs by date posted (newest first)', async () => {
      const listRequest = new Request('https://api.example.com/v1/gigs?sort_by=date&order=desc')

      const ctx: RequestContext = {
        request: listRequest,
        env,
        url: new URL(listRequest.url),
        params: {},
        requestId: 'test-req',
        userId,
        startTime: Date.now(),
      }

      const response = await gigsController.listGigs(ctx)
      const result = (await response.json()) as any

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
      expect(result.data.gigs.length).toBeGreaterThan(0)
    })
  })

  describe('Global Search', () => {
    it('should search across artists and gigs', async () => {
      const searchRequest = new Request('https://api.example.com/v1/search?q=Jazz')

      const ctx: RequestContext = {
        request: searchRequest,
        env,
        url: new URL(searchRequest.url),
        params: {},
        requestId: 'test-req',
        userId,
        startTime: Date.now(),
      }

      const response = await searchController.globalSearch(ctx)
      const result = (await response.json()) as any

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
      expect(result.data.artists).toBeDefined()
      expect(result.data.gigs).toBeDefined()

      // Should find the Jazz artist and Jazz gig
      expect(result.data.artists.length).toBeGreaterThanOrEqual(1)
      expect(result.data.gigs.length).toBeGreaterThanOrEqual(1)
    })

    it('should search artists by name', async () => {
      const searchRequest = new Request('https://api.example.com/v1/search/artists?q=Rock Legend')

      const ctx: RequestContext = {
        request: searchRequest,
        env,
        url: new URL(searchRequest.url),
        params: {},
        requestId: 'test-req',
        userId,
        startTime: Date.now(),
      }

      const response = await searchController.searchArtists(ctx)
      const result = (await response.json()) as any

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
      expect(result.data.artists.length).toBe(1)
      expect(result.data.artists[0].artist_name).toBe('Rock Legend')
    })

    it('should search gigs by title', async () => {
      const searchRequest = new Request('https://api.example.com/v1/search/gigs?q=Festival')

      const ctx: RequestContext = {
        request: searchRequest,
        env,
        url: new URL(searchRequest.url),
        params: {},
        requestId: 'test-req',
        userId,
        startTime: Date.now(),
      }

      const response = await searchController.searchGigs(ctx)
      const result = (await response.json()) as any

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
      expect(result.data.gigs.length).toBe(1)
      expect(result.data.gigs[0].title).toContain('Festival')
    })

    it('should return empty results for no matches', async () => {
      const searchRequest = new Request('https://api.example.com/v1/search?q=NonexistentQueryXYZ123')

      const ctx: RequestContext = {
        request: searchRequest,
        env,
        url: new URL(searchRequest.url),
        params: {},
        requestId: 'test-req',
        userId,
        startTime: Date.now(),
      }

      const response = await searchController.globalSearch(ctx)
      const result = (await response.json()) as any

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
      expect(result.data.artists.length).toBe(0)
      expect(result.data.gigs.length).toBe(0)
    })
  })

  describe('Artist Following', () => {
    it('should follow an artist', async () => {
      const artists = mocks.db.getTable('artists')
      const artistToFollow = artists[0]

      const followRequest = new Request(`https://api.example.com/v1/artists/${artistToFollow.id}/follow`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const ctx: RequestContext = {
        request: followRequest,
        env,
        url: new URL(followRequest.url),
        params: { id: artistToFollow.id },
        requestId: 'test-req',
        userId,
        startTime: Date.now(),
      }

      const response = await artistsController.followArtist(ctx)
      const result = (await response.json()) as any

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)

      // Verify follow relationship created
      const followers = mocks.db.getTable('artist_followers')
      const followRecord = followers.find(
        (f: any) => f.artist_id === artistToFollow.id && f.follower_id === userId
      )
      expect(followRecord).toBeDefined()
    })

    it('should unfollow an artist', async () => {
      const artists = mocks.db.getTable('artists')
      const artistToFollow = artists[0]

      // First follow
      const followRequest = new Request(`https://api.example.com/v1/artists/${artistToFollow.id}/follow`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const followCtx: RequestContext = {
        request: followRequest,
        env,
        url: new URL(followRequest.url),
        params: { id: artistToFollow.id },
        requestId: 'test-req-1',
        userId,
        startTime: Date.now(),
      }

      await artistsController.followArtist(followCtx)

      // Then unfollow
      const unfollowRequest = new Request(`https://api.example.com/v1/artists/${artistToFollow.id}/follow`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const unfollowCtx: RequestContext = {
        request: unfollowRequest,
        env,
        url: new URL(unfollowRequest.url),
        params: { id: artistToFollow.id },
        requestId: 'test-req-2',
        userId,
        startTime: Date.now(),
      }

      const response = await artistsController.unfollowArtist(unfollowCtx)
      const result = (await response.json()) as any

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)

      // Verify follow relationship removed
      const followers = mocks.db.getTable('artist_followers')
      const followRecord = followers.find(
        (f: any) => f.artist_id === artistToFollow.id && f.follower_id === userId
      )
      expect(followRecord).toBeUndefined()
    })

    it('should list followed artists', async () => {
      const artists = mocks.db.getTable('artists')

      // Follow multiple artists
      for (let i = 0; i < 3; i++) {
        const followRequest = new Request(`https://api.example.com/v1/artists/${artists[i].id}/follow`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const ctx: RequestContext = {
          request: followRequest,
          env,
          url: new URL(followRequest.url),
          params: { id: artists[i].id },
          requestId: `test-req-${i}`,
          userId,
          startTime: Date.now(),
        }

        await artistsController.followArtist(ctx)
      }

      // List followed artists
      const listRequest = new Request('https://api.example.com/v1/artists/following')

      const listCtx: RequestContext = {
        request: listRequest,
        env,
        url: new URL(listRequest.url),
        params: {},
        requestId: 'test-req-list',
        userId,
        startTime: Date.now(),
      }

      const response = await artistsController.getFollowedArtists(listCtx)
      const result = (await response.json()) as any

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
      expect(result.data.artists.length).toBe(3)
    })
  })
})
