/**
 * Integration Tests for Artist Booking Flow
 * Tests complete flow: discover artist → contact → negotiate → book
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { handleAuthCallback } from '../../api/routes/auth'
import * as artistsController from '../../api/controllers/artists'
import * as messagesController from '../../api/controllers/messages'
import * as gigsController from '../../api/controllers/gigs'
import { createMockEnv } from '../helpers/mock-env'
import { createTestArtist, createTestGig } from '../helpers/test-data'
import type { Env } from '../../api/index'
import type { RequestContext } from '../../api/router'

describe.skip('Artist Booking Flow Integration Tests', () => {
  let env: Env
  let mocks: any
  let bookerUserId: string
  let artistUserId: string
  let artistId: string
  let bookerToken: string
  let artistToken: string

  beforeEach(async () => {
    const mockSetup = createMockEnv()
    env = mockSetup.env
    mocks = mockSetup.mocks

    // Create booker (person looking to hire an artist)
    const bookerAuthRequest = new Request('https://api.example.com/v1/auth/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'booker@example.com',
        oauth_provider: 'google',
        oauth_id: 'google-booker-123',
      }),
    })

    const bookerAuthResponse = await handleAuthCallback(bookerAuthRequest, env)
    const bookerAuthData = (await bookerAuthResponse.json()) as any
    bookerUserId = bookerAuthData.data.user.id
    bookerToken = bookerAuthData.data.token

    // Create artist (person to be hired)
    const artistAuthRequest = new Request('https://api.example.com/v1/auth/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'artist@example.com',
        oauth_provider: 'google',
        oauth_id: 'google-artist-123',
      }),
    })

    const artistAuthResponse = await handleAuthCallback(artistAuthRequest, env)
    const artistAuthData = (await artistAuthResponse.json()) as any
    artistUserId = artistAuthData.data.user.id
    artistToken = artistAuthData.data.token

    // Create artist profile
    const artist = createTestArtist(artistUserId, {
      artist_name: 'Professional Guitarist',
      genre_primary: 'Rock',
      location_city: 'Austin',
      location_state: 'TX',
      base_rate_flat: 800,
      base_rate_hourly: 150,
      rates_negotiable: true,
      availability: 'weekends',
      verified: true,
    })
    artistId = artist.id
    mocks.db.getTable('artists').push(artist)
  })

  describe('Complete Booking Journey', () => {
    it('should complete full artist booking flow: discover → contact → book', async () => {
      // Step 1: Booker discovers artist by browsing
      const discoverRequest = new Request('https://api.example.com/v1/artists?genre=Rock&city=Austin')

      const discoverCtx: RequestContext = {
        request: discoverRequest,
        env,
        url: new URL(discoverRequest.url),
        params: {},
        requestId: 'test-req-1',
        userId: bookerUserId,
        startTime: Date.now(),
      }

      const discoverResponse = await artistsController.listArtists(discoverCtx)
      const discoverResult = (await discoverResponse.json()) as any

      expect(discoverResponse.status).toBe(200)
      expect(discoverResult.data.artists.length).toBeGreaterThanOrEqual(1)
      const foundArtist = discoverResult.data.artists[0]
      expect(foundArtist.id).toBe(artistId)

      // Step 2: Booker views artist's full profile
      const viewProfileRequest = new Request(`https://api.example.com/v1/artists/${artistId}`)

      const viewProfileCtx: RequestContext = {
        request: viewProfileRequest,
        env,
        url: new URL(viewProfileRequest.url),
        params: { id: artistId },
        requestId: 'test-req-2',
        userId: bookerUserId,
        startTime: Date.now(),
      }

      const viewProfileResponse = await artistsController.getArtist(viewProfileCtx)
      const viewProfileResult = (await viewProfileResponse.json()) as any

      expect(viewProfileResponse.status).toBe(200)
      expect(viewProfileResult.data.artist.artist_name).toBe('Professional Guitarist')
      expect(viewProfileResult.data.artist.base_rate_flat).toBe(800)
      expect(viewProfileResult.data.artist.rates_negotiable).toBe(true)

      // Step 3: Booker initiates contact via message
      const contactRequest = new Request('https://api.example.com/v1/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bookerToken}`,
        },
        body: JSON.stringify({
          recipient_id: artistId,
          initial_message: 'Hi! I would love to book you for a wedding gig on June 15th. Are you available?',
        }),
      })

      const contactCtx: RequestContext = {
        request: contactRequest,
        env,
        url: new URL(contactRequest.url),
        params: {},
        requestId: 'test-req-3',
        userId: bookerUserId,
        startTime: Date.now(),
      }

      const contactResponse = await messagesController.startConversation(contactCtx)
      const contactResult = (await contactResponse.json()) as any

      expect(contactResponse.status).toBe(201)
      expect(contactResult.success).toBe(true)
      const conversationId = contactResult.data.conversation.id

      // Step 4: Artist responds with availability and rate
      const artistReplyRequest = new Request(
        `https://api.example.com/v1/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${artistToken}`,
          },
          body: JSON.stringify({
            content: 'Yes, I am available on June 15th! My rate for a wedding is $1200 for 4 hours. Does that work for you?',
          }),
        }
      )

      const artistReplyCtx: RequestContext = {
        request: artistReplyRequest,
        env,
        url: new URL(artistReplyRequest.url),
        params: { id: conversationId },
        requestId: 'test-req-4',
        userId: artistUserId,
        startTime: Date.now(),
      }

      const artistReplyResponse = await messagesController.sendMessage(artistReplyCtx)
      expect(artistReplyResponse.status).toBe(201)

      // Step 5: Booker confirms booking (simplified - in real app this might be a dedicated booking endpoint)
      const confirmRequest = new Request(
        `https://api.example.com/v1/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${bookerToken}`,
          },
          body: JSON.stringify({
            content: 'Perfect! Let\'s book it. I will send you the contract details.',
          }),
        }
      )

      const confirmCtx: RequestContext = {
        request: confirmRequest,
        env,
        url: new URL(confirmRequest.url),
        params: { id: conversationId },
        requestId: 'test-req-5',
        userId: bookerUserId,
        startTime: Date.now(),
      }

      const confirmResponse = await messagesController.sendMessage(confirmCtx)
      const confirmResult = (await confirmResponse.json()) as any

      expect(confirmResponse.status).toBe(201)
      expect(confirmResult.success).toBe(true)

      // Verify conversation has all messages
      const viewConversationRequest = new Request(
        `https://api.example.com/v1/conversations/${conversationId}`
      )

      const viewConversationCtx: RequestContext = {
        request: viewConversationRequest,
        env,
        url: new URL(viewConversationRequest.url),
        params: { id: conversationId },
        requestId: 'test-req-6',
        userId: bookerUserId,
        startTime: Date.now(),
      }

      const viewConversationResponse = await messagesController.getConversation(viewConversationCtx)
      const viewConversationResult = (await viewConversationResponse.json()) as any

      expect(viewConversationResponse.status).toBe(200)
      expect(viewConversationResult.data.messages.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('Gig-Based Booking (Artist Posts Availability)', () => {
    it('should allow artist to post gig and booker to apply', async () => {
      // Step 1: Artist posts a gig looking for work
      const postGigRequest = new Request('https://api.example.com/v1/gigs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${artistToken}`,
        },
        body: JSON.stringify({
          title: 'Available for Session Work - Guitar',
          description: 'Looking for recording session opportunities. Rock, Blues, Country.',
          gig_type: 'recording',
          genre_required: 'Rock',
          location_city: 'Austin',
          location_state: 'TX',
          compensation_type: 'hourly',
          compensation_amount: 150,
          status: 'open',
        }),
      })

      const postGigCtx: RequestContext = {
        request: postGigRequest,
        env,
        url: new URL(postGigRequest.url),
        params: {},
        requestId: 'test-req-1',
        userId: artistUserId,
        startTime: Date.now(),
      }

      const postGigResponse = await gigsController.createGig(postGigCtx)
      const postGigResult = (await postGigResponse.json()) as any

      expect(postGigResponse.status).toBe(201)
      expect(postGigResult.success).toBe(true)
      const gigId = postGigResult.data.gig.id

      // Step 2: Booker browses gigs and finds this one
      const browseGigsRequest = new Request('https://api.example.com/v1/gigs?type=recording&genre=Rock')

      const browseGigsCtx: RequestContext = {
        request: browseGigsRequest,
        env,
        url: new URL(browseGigsRequest.url),
        params: {},
        requestId: 'test-req-2',
        userId: bookerUserId,
        startTime: Date.now(),
      }

      const browseGigsResponse = await gigsController.listGigs(browseGigsCtx)
      const browseGigsResult = (await browseGigsResponse.json()) as any

      expect(browseGigsResponse.status).toBe(200)
      expect(browseGigsResult.data.gigs.length).toBeGreaterThanOrEqual(1)
      const foundGig = browseGigsResult.data.gigs.find((g: any) => g.id === gigId)
      expect(foundGig).toBeDefined()

      // Step 3: Booker applies to/responds to the gig
      const applyRequest = new Request(`https://api.example.com/v1/gigs/${gigId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bookerToken}`,
        },
        body: JSON.stringify({
          message: 'I have a recording project that would be perfect for you. Interested in discussing?',
        }),
      })

      const applyCtx: RequestContext = {
        request: applyRequest,
        env,
        url: new URL(applyRequest.url),
        params: { id: gigId },
        requestId: 'test-req-3',
        userId: bookerUserId,
        startTime: Date.now(),
      }

      const applyResponse = await gigsController.applyToGig(applyCtx)
      const applyResult = (await applyResponse.json()) as any

      expect(applyResponse.status).toBe(201)
      expect(applyResult.success).toBe(true)
      expect(applyResult.data.application.gig_id).toBe(gigId)
    })
  })

  describe('Direct Booking Flow (Booker Posts Need)', () => {
    it('should allow booker to post need and artist to apply', async () => {
      // Create booker's artist profile (they also can post gigs)
      const bookerArtist = createTestArtist(bookerUserId, {
        artist_name: 'Event Organizer',
        genre_primary: 'Various',
      })
      mocks.db.getTable('artists').push(bookerArtist)

      // Step 1: Booker posts a gig looking for guitarists
      const postGigRequest = new Request('https://api.example.com/v1/gigs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bookerToken}`,
        },
        body: JSON.stringify({
          title: 'Guitarist Needed for Wedding - June 15th',
          description: 'Looking for experienced guitarist for 4-hour wedding reception. Rock and pop covers.',
          gig_type: 'performance',
          genre_required: 'Rock',
          location_city: 'Austin',
          location_state: 'TX',
          compensation_type: 'flat',
          compensation_amount: 1200,
          status: 'open',
        }),
      })

      const postGigCtx: RequestContext = {
        request: postGigRequest,
        env,
        url: new URL(postGigRequest.url),
        params: {},
        requestId: 'test-req-1',
        userId: bookerUserId,
        startTime: Date.now(),
      }

      const postGigResponse = await gigsController.createGig(postGigCtx)
      const postGigResult = (await postGigResponse.json()) as any

      expect(postGigResponse.status).toBe(201)
      const gigId = postGigResult.data.gig.id

      // Step 2: Artist browses available gigs
      const browseRequest = new Request('https://api.example.com/v1/gigs?genre=Rock&city=Austin')

      const browseCtx: RequestContext = {
        request: browseRequest,
        env,
        url: new URL(browseRequest.url),
        params: {},
        requestId: 'test-req-2',
        userId: artistUserId,
        startTime: Date.now(),
      }

      const browseResponse = await gigsController.listGigs(browseCtx)
      const browseResult = (await browseResponse.json()) as any

      expect(browseResponse.status).toBe(200)
      const foundGig = browseResult.data.gigs.find((g: any) => g.id === gigId)
      expect(foundGig).toBeDefined()
      expect(foundGig.title).toContain('Wedding')

      // Step 3: Artist applies to the gig
      const applyRequest = new Request(`https://api.example.com/v1/gigs/${gigId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${artistToken}`,
        },
        body: JSON.stringify({
          message: 'I would love to play at this wedding! I have 10 years of experience and a wide repertoire of rock and pop covers.',
        }),
      })

      const applyCtx: RequestContext = {
        request: applyRequest,
        env,
        url: new URL(applyRequest.url),
        params: { id: gigId },
        requestId: 'test-req-3',
        userId: artistUserId,
        startTime: Date.now(),
      }

      const applyResponse = await gigsController.applyToGig(applyCtx)
      const applyResult = (await applyResponse.json()) as any

      expect(applyResponse.status).toBe(201)
      expect(applyResult.success).toBe(true)

      // Step 4: Booker views applications to their gig
      const viewApplicationsRequest = new Request(`https://api.example.com/v1/gigs/${gigId}/applications`)

      const viewApplicationsCtx: RequestContext = {
        request: viewApplicationsRequest,
        env,
        url: new URL(viewApplicationsRequest.url),
        params: { id: gigId },
        requestId: 'test-req-4',
        userId: bookerUserId,
        startTime: Date.now(),
      }

      const viewApplicationsResponse = await gigsController.getGigApplications(viewApplicationsCtx)
      const viewApplicationsResult = (await viewApplicationsResponse.json()) as any

      expect(viewApplicationsResponse.status).toBe(200)
      expect(viewApplicationsResult.success).toBe(true)
      expect(viewApplicationsResult.data.applications.length).toBeGreaterThanOrEqual(1)
      const application = viewApplicationsResult.data.applications[0]
      expect(application.artist_id).toBe(artistId)

      // Step 5: Booker accepts the application
      const acceptRequest = new Request(
        `https://api.example.com/v1/gigs/${gigId}/applications/${application.id}/accept`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${bookerToken}`,
          },
        }
      )

      const acceptCtx: RequestContext = {
        request: acceptRequest,
        env,
        url: new URL(acceptRequest.url),
        params: { id: gigId, applicationId: application.id },
        requestId: 'test-req-5',
        userId: bookerUserId,
        startTime: Date.now(),
      }

      const acceptResponse = await gigsController.acceptApplication(acceptCtx)
      const acceptResult = (await acceptResponse.json()) as any

      expect(acceptResponse.status).toBe(200)
      expect(acceptResult.success).toBe(true)
      expect(acceptResult.data.application.status).toBe('accepted')
    })
  })

  describe('Booking Workflow Validation', () => {
    it('should prevent double-booking', async () => {
      // Create a gig
      const bookerArtist = createTestArtist(bookerUserId)
      mocks.db.getTable('artists').push(bookerArtist)

      const gig = createTestGig(bookerArtist.id, {
        title: 'Test Gig',
        status: 'open',
      })
      mocks.db.getTable('gigs').push(gig)

      // First application
      const apply1Request = new Request(`https://api.example.com/v1/gigs/${gig.id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${artistToken}`,
        },
        body: JSON.stringify({
          message: 'First application',
        }),
      })

      const apply1Ctx: RequestContext = {
        request: apply1Request,
        env,
        url: new URL(apply1Request.url),
        params: { id: gig.id },
        requestId: 'test-req-1',
        userId: artistUserId,
        startTime: Date.now(),
      }

      const apply1Response = await gigsController.applyToGig(apply1Ctx)
      expect(apply1Response.status).toBe(201)

      // Try to apply again
      const apply2Request = new Request(`https://api.example.com/v1/gigs/${gig.id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${artistToken}`,
        },
        body: JSON.stringify({
          message: 'Second application (should fail)',
        }),
      })

      const apply2Ctx: RequestContext = {
        request: apply2Request,
        env,
        url: new URL(apply2Request.url),
        params: { id: gig.id },
        requestId: 'test-req-2',
        userId: artistUserId,
        startTime: Date.now(),
      }

      const apply2Response = await gigsController.applyToGig(apply2Ctx)
      const apply2Result = (await apply2Response.json()) as any

      expect(apply2Response.status).toBe(400)
      expect(apply2Result.success).toBe(false)
    })

    it('should prevent applying to closed gigs', async () => {
      const bookerArtist = createTestArtist(bookerUserId)
      mocks.db.getTable('artists').push(bookerArtist)

      const closedGig = createTestGig(bookerArtist.id, {
        title: 'Closed Gig',
        status: 'closed',
      })
      mocks.db.getTable('gigs').push(closedGig)

      const applyRequest = new Request(`https://api.example.com/v1/gigs/${closedGig.id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${artistToken}`,
        },
        body: JSON.stringify({
          message: 'Trying to apply to closed gig',
        }),
      })

      const applyCtx: RequestContext = {
        request: applyRequest,
        env,
        url: new URL(applyRequest.url),
        params: { id: closedGig.id },
        requestId: 'test-req',
        userId: artistUserId,
        startTime: Date.now(),
      }

      const applyResponse = await gigsController.applyToGig(applyCtx)
      const applyResult = (await applyResponse.json()) as any

      expect(applyResponse.status).toBe(400)
      expect(applyResult.success).toBe(false)
    })

    it('should prevent self-application to own gig', async () => {
      const artistProfile = createTestArtist(artistUserId)
      mocks.db.getTable('artists').push(artistProfile)

      const ownGig = createTestGig(artistProfile.id, {
        title: 'My Own Gig',
        status: 'open',
      })
      mocks.db.getTable('gigs').push(ownGig)

      // Try to apply to own gig
      const applyRequest = new Request(`https://api.example.com/v1/gigs/${ownGig.id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${artistToken}`,
        },
        body: JSON.stringify({
          message: 'Applying to my own gig',
        }),
      })

      const applyCtx: RequestContext = {
        request: applyRequest,
        env,
        url: new URL(applyRequest.url),
        params: { id: ownGig.id },
        requestId: 'test-req',
        userId: artistUserId,
        startTime: Date.now(),
      }

      const applyResponse = await gigsController.applyToGig(applyCtx)
      const applyResult = (await applyResponse.json()) as any

      expect(applyResponse.status).toBe(400)
      expect(applyResult.success).toBe(false)
      expect(applyResult.error.message).toContain('own gig')
    })
  })

  describe('Booking Notifications and Updates', () => {
    it('should track application status changes', async () => {
      const bookerArtist = createTestArtist(bookerUserId)
      mocks.db.getTable('artists').push(bookerArtist)

      const gig = createTestGig(bookerArtist.id, { status: 'open' })
      mocks.db.getTable('gigs').push(gig)

      // Apply to gig
      const applyRequest = new Request(`https://api.example.com/v1/gigs/${gig.id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${artistToken}`,
        },
        body: JSON.stringify({ message: 'Application' }),
      })

      const applyCtx: RequestContext = {
        request: applyRequest,
        env,
        url: new URL(applyRequest.url),
        params: { id: gig.id },
        requestId: 'test-req-1',
        userId: artistUserId,
        startTime: Date.now(),
      }

      const applyResponse = await gigsController.applyToGig(applyCtx)
      const applyResult = (await applyResponse.json()) as any
      const applicationId = applyResult.data.application.id

      // Initial status should be pending
      expect(applyResult.data.application.status).toBe('pending')

      // Reject the application
      const rejectRequest = new Request(
        `https://api.example.com/v1/gigs/${gig.id}/applications/${applicationId}/reject`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${bookerToken}`,
          },
        }
      )

      const rejectCtx: RequestContext = {
        request: rejectRequest,
        env,
        url: new URL(rejectRequest.url),
        params: { id: gig.id, applicationId },
        requestId: 'test-req-2',
        userId: bookerUserId,
        startTime: Date.now(),
      }

      const rejectResponse = await gigsController.rejectApplication(rejectCtx)
      const rejectResult = (await rejectResponse.json()) as any

      expect(rejectResponse.status).toBe(200)
      expect(rejectResult.data.application.status).toBe('rejected')
    })
  })
})
