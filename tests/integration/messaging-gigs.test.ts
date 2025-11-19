/**
 * Integration Tests for Messaging and Gig Applications
 * Tests message sending (D-043: 2000 char limit) and gig application flow (D-077: single-click)
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { handleAuthCallback } from '../../api/routes/auth'
import * as messagesController from '../../api/controllers/messages'
import * as gigsController from '../../api/controllers/gigs'
import { createMockEnv } from '../helpers/mock-env'
import { createTestArtist, createTestGig, createLargeText } from '../helpers/test-data'
import type { Env } from '../../api/index'
import type { RequestContext } from '../../api/router'

describe.skip('Messaging and Gig Application Integration Tests', () => {
  let env: Env
  let mocks: any
  let user1Id: string
  let user2Id: string
  let artist1Id: string
  let artist2Id: string
  let token1: string
  let token2: string

  beforeEach(async () => {
    const mockSetup = createMockEnv()
    env = mockSetup.env
    mocks = mockSetup.mocks

    // Create two users for messaging tests
    const auth1Request = new Request('https://api.example.com/v1/auth/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'artist1@example.com',
        oauth_provider: 'google',
        oauth_id: 'google-artist1-123',
      }),
    })

    const auth1Response = await handleAuthCallback(auth1Request, env)
    const auth1Data = (await auth1Response.json()) as any
    user1Id = auth1Data.data.user.id
    token1 = auth1Data.data.token

    const auth2Request = new Request('https://api.example.com/v1/auth/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'artist2@example.com',
        oauth_provider: 'apple',
        oauth_id: 'apple-artist2-456',
      }),
    })

    const auth2Response = await handleAuthCallback(auth2Request, env)
    const auth2Data = (await auth2Response.json()) as any
    user2Id = auth2Data.data.user.id
    token2 = auth2Data.data.token

    // Create artist profiles
    const artist1 = createTestArtist(user1Id, { artist_name: 'Artist One' })
    const artist2 = createTestArtist(user2Id, { artist_name: 'Artist Two' })
    artist1Id = artist1.id
    artist2Id = artist2.id

    mocks.db.getTable('artists').push(artist1, artist2)
  })

  describe('Message Sending with Character Limit (D-043)', () => {
    it('should send message within 2000 character limit', async () => {
      // Start conversation
      const startConversationRequest = new Request('https://api.example.com/v1/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token1}`,
        },
        body: JSON.stringify({
          recipient_id: artist2Id,
          initial_message: 'Hi! I would love to collaborate with you on a project.',
        }),
      })

      const startCtx: RequestContext = {
        request: startConversationRequest,
        env,
        url: new URL(startConversationRequest.url),
        params: {},
        requestId: 'test-req-1',
        userId: user1Id,
        startTime: Date.now(),
      }

      const startResponse = await messagesController.startConversation(startCtx)
      const startResult = (await startResponse.json()) as any

      expect(startResponse.status).toBe(201)
      expect(startResult.success).toBe(true)
      expect(startResult.data.conversation.id).toBeDefined()

      const conversationId = startResult.data.conversation.id

      // Send a message with exactly 2000 characters
      const message2000 = createLargeText(2000)
      const sendMessageRequest = new Request(
        `https://api.example.com/v1/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token1}`,
          },
          body: JSON.stringify({
            content: message2000,
          }),
        }
      )

      const sendCtx: RequestContext = {
        request: sendMessageRequest,
        env,
        url: new URL(sendMessageRequest.url),
        params: { id: conversationId },
        requestId: 'test-req-2',
        userId: user1Id,
        startTime: Date.now(),
      }

      const sendResponse = await messagesController.sendMessage(sendCtx)
      const sendResult = (await sendResponse.json()) as any

      expect(sendResponse.status).toBe(201)
      expect(sendResult.success).toBe(true)
      expect(sendResult.data.message.content.length).toBe(2000)
    })

    it('should reject message exceeding 2000 characters', async () => {
      // Start conversation
      const startConversationRequest = new Request('https://api.example.com/v1/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token1}`,
        },
        body: JSON.stringify({
          recipient_id: artist2Id,
          initial_message: 'Hello',
        }),
      })

      const startCtx: RequestContext = {
        request: startConversationRequest,
        env,
        url: new URL(startConversationRequest.url),
        params: {},
        requestId: 'test-req-1',
        userId: user1Id,
        startTime: Date.now(),
      }

      const startResponse = await messagesController.startConversation(startCtx)
      const startResult = (await startResponse.json()) as any
      const conversationId = startResult.data.conversation.id

      // Try to send message with 2001 characters (exceeds limit)
      const message2001 = createLargeText(2001)
      const sendMessageRequest = new Request(
        `https://api.example.com/v1/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token1}`,
          },
          body: JSON.stringify({
            content: message2001,
          }),
        }
      )

      const sendCtx: RequestContext = {
        request: sendMessageRequest,
        env,
        url: new URL(sendMessageRequest.url),
        params: { id: conversationId },
        requestId: 'test-req-2',
        userId: user1Id,
        startTime: Date.now(),
      }

      const sendResponse = await messagesController.sendMessage(sendCtx)
      const sendResult = (await sendResponse.json()) as any

      expect(sendResponse.status).toBe(400)
      expect(sendResult.success).toBe(false)
      expect(sendResult.error.code).toContain('MESSAGE')
      expect(sendResult.error.message).toContain('2000')
    })

    it('should handle bidirectional messaging', async () => {
      // Artist 1 starts conversation with Artist 2
      const startRequest = new Request('https://api.example.com/v1/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token1}`,
        },
        body: JSON.stringify({
          recipient_id: artist2Id,
          initial_message: 'Hey, want to collaborate?',
        }),
      })

      const startCtx: RequestContext = {
        request: startRequest,
        env,
        url: new URL(startRequest.url),
        params: {},
        requestId: 'test-req-1',
        userId: user1Id,
        startTime: Date.now(),
      }

      const startResponse = await messagesController.startConversation(startCtx)
      const startResult = (await startResponse.json()) as any
      const conversationId = startResult.data.conversation.id

      // Artist 2 replies
      const replyRequest = new Request(
        `https://api.example.com/v1/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token2}`,
          },
          body: JSON.stringify({
            content: 'Sure! What did you have in mind?',
          }),
        }
      )

      const replyCtx: RequestContext = {
        request: replyRequest,
        env,
        url: new URL(replyRequest.url),
        params: { id: conversationId },
        requestId: 'test-req-2',
        userId: user2Id,
        startTime: Date.now(),
      }

      const replyResponse = await messagesController.sendMessage(replyCtx)
      const replyResult = (await replyResponse.json()) as any

      expect(replyResponse.status).toBe(201)
      expect(replyResult.success).toBe(true)

      // Artist 1 can view the conversation
      const viewRequest = new Request(
        `https://api.example.com/v1/conversations/${conversationId}`
      )

      const viewCtx: RequestContext = {
        request: viewRequest,
        env,
        url: new URL(viewRequest.url),
        params: { id: conversationId },
        requestId: 'test-req-3',
        userId: user1Id,
        startTime: Date.now(),
      }

      const viewResponse = await messagesController.getConversation(viewCtx)
      const viewResult = (await viewResponse.json()) as any

      expect(viewResponse.status).toBe(200)
      expect(viewResult.data.messages.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Single-Click Gig Application (D-077)', () => {
    it('should apply to gig with single click', async () => {
      // Create a gig posted by Artist 2
      const gig = createTestGig(artist2Id, {
        title: 'Looking for guitarist for local show',
        gig_type: 'performance',
        genre_required: 'Rock',
      })
      mocks.db.getTable('gigs').push(gig)

      // Artist 1 applies to the gig
      const applyRequest = new Request(`https://api.example.com/v1/gigs/${gig.id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token1}`,
        },
        body: JSON.stringify({
          message: 'I would love to play at this show!',
        }),
      })

      const applyCtx: RequestContext = {
        request: applyRequest,
        env,
        url: new URL(applyRequest.url),
        params: { id: gig.id },
        requestId: 'test-req-1',
        userId: user1Id,
        startTime: Date.now(),
      }

      const applyResponse = await gigsController.applyToGig(applyCtx)
      const applyResult = (await applyResponse.json()) as any

      expect(applyResponse.status).toBe(201)
      expect(applyResult.success).toBe(true)
      expect(applyResult.data.application.gig_id).toBe(gig.id)
      expect(applyResult.data.application.artist_id).toBe(artist1Id)
      expect(applyResult.data.application.status).toBe('pending')

      // Verify application was created in database
      const applications = mocks.db.getTable('gig_applications')
      expect(applications.length).toBe(1)
      expect(applications[0].gig_id).toBe(gig.id)
      expect(applications[0].artist_id).toBe(artist1Id)
    })

    it('should prevent duplicate applications to same gig', async () => {
      // Create a gig
      const gig = createTestGig(artist2Id, {
        title: 'Studio session needed',
        gig_type: 'collaboration',
      })
      mocks.db.getTable('gigs').push(gig)

      // First application
      const apply1Request = new Request(`https://api.example.com/v1/gigs/${gig.id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token1}`,
        },
        body: JSON.stringify({
          message: 'Interested!',
        }),
      })

      const apply1Ctx: RequestContext = {
        request: apply1Request,
        env,
        url: new URL(apply1Request.url),
        params: { id: gig.id },
        requestId: 'test-req-1',
        userId: user1Id,
        startTime: Date.now(),
      }

      const apply1Response = await gigsController.applyToGig(apply1Ctx)
      expect(apply1Response.status).toBe(201)

      // Try to apply again
      const apply2Request = new Request(`https://api.example.com/v1/gigs/${gig.id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token1}`,
        },
        body: JSON.stringify({
          message: 'Still interested!',
        }),
      })

      const apply2Ctx: RequestContext = {
        request: apply2Request,
        env,
        url: new URL(apply2Request.url),
        params: { id: gig.id },
        requestId: 'test-req-2',
        userId: user1Id,
        startTime: Date.now(),
      }

      const apply2Response = await gigsController.applyToGig(apply2Ctx)
      const apply2Result = (await apply2Response.json()) as any

      expect(apply2Response.status).toBe(400)
      expect(apply2Result.success).toBe(false)
      expect(apply2Result.error.code).toContain('APPLICATION')
    })

    it('should allow withdrawing application', async () => {
      // Create gig and apply
      const gig = createTestGig(artist2Id)
      mocks.db.getTable('gigs').push(gig)

      const applyRequest = new Request(`https://api.example.com/v1/gigs/${gig.id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token1}`,
        },
        body: JSON.stringify({
          message: 'Interested',
        }),
      })

      const applyCtx: RequestContext = {
        request: applyRequest,
        env,
        url: new URL(applyRequest.url),
        params: { id: gig.id },
        requestId: 'test-req-1',
        userId: user1Id,
        startTime: Date.now(),
      }

      await gigsController.applyToGig(applyCtx)

      // Withdraw application
      const withdrawRequest = new Request(`https://api.example.com/v1/gigs/${gig.id}/apply`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token1}`,
        },
      })

      const withdrawCtx: RequestContext = {
        request: withdrawRequest,
        env,
        url: new URL(withdrawRequest.url),
        params: { id: gig.id },
        requestId: 'test-req-2',
        userId: user1Id,
        startTime: Date.now(),
      }

      const withdrawResponse = await gigsController.withdrawApplication(withdrawCtx)
      const withdrawResult = (await withdrawResponse.json()) as any

      expect(withdrawResponse.status).toBe(200)
      expect(withdrawResult.success).toBe(true)

      // Verify application removed
      const applications = mocks.db
        .getTable('gig_applications')
        .filter((a: any) => a.gig_id === gig.id && a.artist_id === artist1Id)
      expect(applications.length).toBe(0)
    })

    it('should list my applications', async () => {
      // Create multiple gigs and apply to them
      const gig1 = createTestGig(artist2Id, { title: 'Gig 1' })
      const gig2 = createTestGig(artist2Id, { title: 'Gig 2' })
      const gig3 = createTestGig(artist2Id, { title: 'Gig 3' })

      mocks.db.getTable('gigs').push(gig1, gig2, gig3)

      for (const gig of [gig1, gig2, gig3]) {
        const applyRequest = new Request(`https://api.example.com/v1/gigs/${gig.id}/apply`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token1}`,
          },
          body: JSON.stringify({
            message: `Interested in ${gig.title}`,
          }),
        })

        const applyCtx: RequestContext = {
          request: applyRequest,
          env,
          url: new URL(applyRequest.url),
          params: { id: gig.id },
          requestId: `test-req-apply-${gig.id}`,
          userId: user1Id,
          startTime: Date.now(),
        }

        await gigsController.applyToGig(applyCtx)
      }

      // Get my applications
      const listRequest = new Request('https://api.example.com/v1/gigs/applications')

      const listCtx: RequestContext = {
        request: listRequest,
        env,
        url: new URL(listRequest.url),
        params: {},
        requestId: 'test-req-list',
        userId: user1Id,
        startTime: Date.now(),
      }

      const listResponse = await gigsController.getMyApplications(listCtx)
      const listResult = (await listResponse.json()) as any

      expect(listResponse.status).toBe(200)
      expect(listResult.success).toBe(true)
      expect(listResult.data.applications.length).toBe(3)
    })
  })

  describe('Conversation Management', () => {
    it('should list all conversations for a user', async () => {
      // Create additional user
      const auth3Request = new Request('https://api.example.com/v1/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'artist3@example.com',
          oauth_provider: 'google',
          oauth_id: 'google-artist3-789',
        }),
      })

      const auth3Response = await handleAuthCallback(auth3Request, env)
      const auth3Data = (await auth3Response.json()) as any
      const user3Id = auth3Data.data.user.id

      const artist3 = createTestArtist(user3Id, { artist_name: 'Artist Three' })
      mocks.db.getTable('artists').push(artist3)

      // Artist 1 starts conversations with Artist 2 and Artist 3
      const recipients = [artist2Id, artist3.id]

      for (const recipientId of recipients) {
        const startRequest = new Request('https://api.example.com/v1/conversations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token1}`,
          },
          body: JSON.stringify({
            recipient_id: recipientId,
            initial_message: `Hello from Artist 1 to ${recipientId}`,
          }),
        })

        const startCtx: RequestContext = {
          request: startRequest,
          env,
          url: new URL(startRequest.url),
          params: {},
          requestId: `test-req-${recipientId}`,
          userId: user1Id,
          startTime: Date.now(),
        }

        await messagesController.startConversation(startCtx)
      }

      // List conversations for Artist 1
      const listRequest = new Request('https://api.example.com/v1/conversations')

      const listCtx: RequestContext = {
        request: listRequest,
        env,
        url: new URL(listRequest.url),
        params: {},
        requestId: 'test-req-list',
        userId: user1Id,
        startTime: Date.now(),
      }

      const listResponse = await messagesController.listConversations(listCtx)
      const listResult = (await listResponse.json()) as any

      expect(listResponse.status).toBe(200)
      expect(listResult.success).toBe(true)
      expect(listResult.data.conversations.length).toBe(2)
    })

    it('should mark conversation as read', async () => {
      // Start conversation
      const startRequest = new Request('https://api.example.com/v1/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token1}`,
        },
        body: JSON.stringify({
          recipient_id: artist2Id,
          initial_message: 'Hello',
        }),
      })

      const startCtx: RequestContext = {
        request: startRequest,
        env,
        url: new URL(startRequest.url),
        params: {},
        requestId: 'test-req-1',
        userId: user1Id,
        startTime: Date.now(),
      }

      const startResponse = await messagesController.startConversation(startCtx)
      const startResult = (await startResponse.json()) as any
      const conversationId = startResult.data.conversation.id

      // Artist 2 marks as read
      const markReadRequest = new Request(
        `https://api.example.com/v1/conversations/${conversationId}/read`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token2}`,
          },
        }
      )

      const markReadCtx: RequestContext = {
        request: markReadRequest,
        env,
        url: new URL(markReadRequest.url),
        params: { id: conversationId },
        requestId: 'test-req-2',
        userId: user2Id,
        startTime: Date.now(),
      }

      const markReadResponse = await messagesController.markAsRead(markReadCtx)
      const markReadResult = (await markReadResponse.json()) as any

      expect(markReadResponse.status).toBe(200)
      expect(markReadResult.success).toBe(true)
    })
  })
})
