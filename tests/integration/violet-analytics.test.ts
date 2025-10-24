/**
 * Integration Tests for Violet AI Rate Limiting and Analytics Batch Processing
 * Tests Violet 50 prompts/day limit (D-062) and analytics midnight UTC batch (D-008)
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { handleAuthCallback } from '../../api/routes/auth'
import * as violetController from '../../api/controllers/violet'
import * as analyticsController from '../../api/controllers/analytics'
import { createMockEnv } from '../helpers/mock-env'
import { createTestArtist } from '../helpers/test-data'
import type { Env } from '../../api/index'
import type { RequestContext } from '../../api/router'

describe('Violet AI and Analytics Integration Tests', () => {
  let env: Env
  let mocks: any
  let userId: string
  let artistId: string
  let token: string

  beforeEach(async () => {
    const mockSetup = createMockEnv()
    env = mockSetup.env
    mocks = mockSetup.mocks

    // Create user and artist
    const authRequest = new Request('https://api.example.com/v1/auth/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'violet-test@example.com',
        oauth_provider: 'google',
        oauth_id: 'google-violet-123',
      }),
    })

    const authResponse = await handleAuthCallback(authRequest, env)
    const authData = (await authResponse.json()) as any
    userId = authData.data.user.id
    token = authData.data.token

    // Create artist profile
    const artist = createTestArtist(userId)
    artistId = artist.id
    mocks.db.getTable('artists').push(artist)
  })

  describe('Violet Rate Limiting (D-062: 50 prompts/day)', () => {
    it('should allow up to 50 prompts per day', async () => {
      // Send 50 prompts
      for (let i = 0; i < 50; i++) {
        const promptRequest = new Request('https://api.example.com/v1/violet/prompt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            prompt: `Test prompt ${i + 1}`,
          }),
        })

        const promptCtx: RequestContext = {
          request: promptRequest,
          env,
          url: new URL(promptRequest.url),
          params: {},
          requestId: `test-req-${i}`,
          userId,
          startTime: Date.now(),
        }

        const response = await violetController.sendPrompt(promptCtx)
        const result = (await response.json()) as any

        expect(response.status).toBe(200)
        expect(result.success).toBe(true)
        expect(result.data.response).toBeDefined()
        expect(result.data.remaining_prompts_today).toBe(49 - i)
      }

      // Verify all 50 prompts were stored
      const prompts = mocks.db.getTable('violet_prompts')
      expect(prompts.filter((p: any) => p.artist_id === artistId).length).toBe(50)
    })

    it('should reject 51st prompt (exceeds daily limit)', async () => {
      // Send 50 prompts (reaching the limit)
      for (let i = 0; i < 50; i++) {
        const promptRequest = new Request('https://api.example.com/v1/violet/prompt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            prompt: `Test prompt ${i + 1}`,
          }),
        })

        const promptCtx: RequestContext = {
          request: promptRequest,
          env,
          url: new URL(promptRequest.url),
          params: {},
          requestId: `test-req-${i}`,
          userId,
          startTime: Date.now(),
        }

        await violetController.sendPrompt(promptCtx)
      }

      // Try to send the 51st prompt
      const exceededRequest = new Request('https://api.example.com/v1/violet/prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt: 'This should be rejected',
        }),
      })

      const exceededCtx: RequestContext = {
        request: exceededRequest,
        env,
        url: new URL(exceededRequest.url),
        params: {},
        requestId: 'test-req-51',
        userId,
        startTime: Date.now(),
      }

      const exceededResponse = await violetController.sendPrompt(exceededCtx)
      const exceededResult = (await exceededResponse.json()) as any

      expect(exceededResponse.status).toBe(429) // Too Many Requests
      expect(exceededResult.success).toBe(false)
      expect(exceededResult.error.code).toContain('RATE_LIMIT')
      expect(exceededResult.error.message).toContain('50')
    })

    it('should track prompt usage correctly', async () => {
      // Send 25 prompts
      for (let i = 0; i < 25; i++) {
        const promptRequest = new Request('https://api.example.com/v1/violet/prompt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            prompt: `Test prompt ${i + 1}`,
          }),
        })

        const promptCtx: RequestContext = {
          request: promptRequest,
          env,
          url: new URL(promptRequest.url),
          params: {},
          requestId: `test-req-${i}`,
          userId,
          startTime: Date.now(),
        }

        await violetController.sendPrompt(promptCtx)
      }

      // Check usage
      const usageRequest = new Request('https://api.example.com/v1/violet/usage')

      const usageCtx: RequestContext = {
        request: usageRequest,
        env,
        url: new URL(usageRequest.url),
        params: {},
        requestId: 'test-req-usage',
        userId,
        startTime: Date.now(),
      }

      const usageResponse = await violetController.getUsage(usageCtx)
      const usageResult = (await usageResponse.json()) as any

      expect(usageResponse.status).toBe(200)
      expect(usageResult.success).toBe(true)
      expect(usageResult.data.prompts_used_today).toBe(25)
      expect(usageResult.data.prompts_remaining_today).toBe(25)
      expect(usageResult.data.daily_limit).toBe(50)
    })

    it('should return placeholder responses (not real AI in Release 1)', async () => {
      const promptRequest = new Request('https://api.example.com/v1/violet/prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt: 'What gigs should I apply to?',
        }),
      })

      const promptCtx: RequestContext = {
        request: promptRequest,
        env,
        url: new URL(promptRequest.url),
        params: {},
        requestId: 'test-req',
        userId,
        startTime: Date.now(),
      }

      const response = await violetController.sendPrompt(promptCtx)
      const result = (await response.json()) as any

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
      expect(result.data.response).toBeDefined()
      // Verify it's a placeholder response
      expect(result.data.is_placeholder).toBe(true)
    })

    it('should retrieve prompt history', async () => {
      // Send a few prompts
      const prompts = [
        'Help me write a bio',
        'What gigs should I apply to?',
        'How can I improve my profile?',
      ]

      for (const prompt of prompts) {
        const promptRequest = new Request('https://api.example.com/v1/violet/prompt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ prompt }),
        })

        const promptCtx: RequestContext = {
          request: promptRequest,
          env,
          url: new URL(promptRequest.url),
          params: {},
          requestId: `test-req-${prompt}`,
          userId,
          startTime: Date.now(),
        }

        await violetController.sendPrompt(promptCtx)
      }

      // Get history
      const historyRequest = new Request('https://api.example.com/v1/violet/history')

      const historyCtx: RequestContext = {
        request: historyRequest,
        env,
        url: new URL(historyRequest.url),
        params: {},
        requestId: 'test-req-history',
        userId,
        startTime: Date.now(),
      }

      const historyResponse = await violetController.getHistory(historyCtx)
      const historyResult = (await historyResponse.json()) as any

      expect(historyResponse.status).toBe(200)
      expect(historyResult.success).toBe(true)
      expect(historyResult.data.history.length).toBe(3)
      expect(historyResult.data.history[0].prompt).toBe(prompts[0])
    })

    it('should clear prompt history', async () => {
      // Send prompts
      for (let i = 0; i < 5; i++) {
        const promptRequest = new Request('https://api.example.com/v1/violet/prompt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            prompt: `Prompt ${i}`,
          }),
        })

        const promptCtx: RequestContext = {
          request: promptRequest,
          env,
          url: new URL(promptRequest.url),
          params: {},
          requestId: `test-req-${i}`,
          userId,
          startTime: Date.now(),
        }

        await violetController.sendPrompt(promptCtx)
      }

      // Clear history
      const clearRequest = new Request('https://api.example.com/v1/violet/history', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const clearCtx: RequestContext = {
        request: clearRequest,
        env,
        url: new URL(clearRequest.url),
        params: {},
        requestId: 'test-req-clear',
        userId,
        startTime: Date.now(),
      }

      const clearResponse = await violetController.clearHistory(clearCtx)
      const clearResult = (await clearResponse.json()) as any

      expect(clearResponse.status).toBe(200)
      expect(clearResult.success).toBe(true)

      // Verify history is empty
      const historyRequest = new Request('https://api.example.com/v1/violet/history')

      const historyCtx: RequestContext = {
        request: historyRequest,
        env,
        url: new URL(historyRequest.url),
        params: {},
        requestId: 'test-req-history',
        userId,
        startTime: Date.now(),
      }

      const historyResponse = await violetController.getHistory(historyCtx)
      const historyResult = (await historyResponse.json()) as any

      expect(historyResult.data.history.length).toBe(0)
    })
  })

  describe('Analytics Batch Processing (D-008: Midnight UTC)', () => {
    it('should retrieve daily analytics summary', async () => {
      // Simulate some analytics data in D1
      const today = new Date().toISOString().split('T')[0]

      // Mock analytics data
      const analyticsData = {
        id: 'analytics-1',
        artist_id: artistId,
        date: today,
        profile_views: 42,
        gig_applications_sent: 5,
        messages_received: 8,
        violet_prompts_used: 12,
        created_at: new Date().toISOString(),
      }

      mocks.db.getTable('analytics_daily').push(analyticsData)

      // Get analytics
      const analyticsRequest = new Request('https://api.example.com/v1/analytics')

      const analyticsCtx: RequestContext = {
        request: analyticsRequest,
        env,
        url: new URL(analyticsRequest.url),
        params: {},
        requestId: 'test-req',
        userId,
        startTime: Date.now(),
      }

      const analyticsResponse = await analyticsController.getAnalytics(analyticsCtx)
      const analyticsResult = (await analyticsResponse.json()) as any

      expect(analyticsResponse.status).toBe(200)
      expect(analyticsResult.success).toBe(true)
      expect(analyticsResult.data.today.profile_views).toBe(42)
      expect(analyticsResult.data.today.gig_applications_sent).toBe(5)
      expect(analyticsResult.data.today.messages_received).toBe(8)
      expect(analyticsResult.data.today.violet_prompts_used).toBe(12)
    })

    it('should track profile view analytics', async () => {
      const viewsRequest = new Request('https://api.example.com/v1/analytics/profile-views')

      const viewsCtx: RequestContext = {
        request: viewsRequest,
        env,
        url: new URL(viewsRequest.url),
        params: {},
        requestId: 'test-req',
        userId,
        startTime: Date.now(),
      }

      const viewsResponse = await analyticsController.getProfileViews(viewsCtx)
      const viewsResult = (await viewsResponse.json()) as any

      expect(viewsResponse.status).toBe(200)
      expect(viewsResult.success).toBe(true)
      expect(viewsResult.data.views).toBeDefined()
      expect(Array.isArray(viewsResult.data.views)).toBe(true)
    })

    it('should track gig analytics', async () => {
      const gigsRequest = new Request('https://api.example.com/v1/analytics/gigs')

      const gigsCtx: RequestContext = {
        request: gigsRequest,
        env,
        url: new URL(gigsRequest.url),
        params: {},
        requestId: 'test-req',
        userId,
        startTime: Date.now(),
      }

      const gigsResponse = await analyticsController.getGigAnalytics(gigsCtx)
      const gigsResult = (await gigsResponse.json()) as any

      expect(gigsResponse.status).toBe(200)
      expect(gigsResult.success).toBe(true)
      expect(gigsResult.data.applications).toBeDefined()
    })

    it('should track message analytics', async () => {
      const messagesRequest = new Request('https://api.example.com/v1/analytics/messages')

      const messagesCtx: RequestContext = {
        request: messagesRequest,
        env,
        url: new URL(messagesRequest.url),
        params: {},
        requestId: 'test-req',
        userId,
        startTime: Date.now(),
      }

      const messagesResponse = await analyticsController.getMessageAnalytics(messagesCtx)
      const messagesResult = (await messagesResponse.json()) as any

      expect(messagesResponse.status).toBe(200)
      expect(messagesResult.success).toBe(true)
      expect(messagesResult.data.sent).toBeDefined()
      expect(messagesResult.data.received).toBeDefined()
    })

    it('should track Violet usage analytics', async () => {
      // Send some Violet prompts
      for (let i = 0; i < 10; i++) {
        const promptRequest = new Request('https://api.example.com/v1/violet/prompt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            prompt: `Test prompt ${i}`,
          }),
        })

        const promptCtx: RequestContext = {
          request: promptRequest,
          env,
          url: new URL(promptRequest.url),
          params: {},
          requestId: `test-req-${i}`,
          userId,
          startTime: Date.now(),
        }

        await violetController.sendPrompt(promptCtx)
      }

      // Get Violet analytics
      const violetAnalyticsRequest = new Request('https://api.example.com/v1/analytics/violet')

      const violetAnalyticsCtx: RequestContext = {
        request: violetAnalyticsRequest,
        env,
        url: new URL(violetAnalyticsRequest.url),
        params: {},
        requestId: 'test-req',
        userId,
        startTime: Date.now(),
      }

      const violetAnalyticsResponse = await analyticsController.getVioletAnalytics(violetAnalyticsCtx)
      const violetAnalyticsResult = (await violetAnalyticsResponse.json()) as any

      expect(violetAnalyticsResponse.status).toBe(200)
      expect(violetAnalyticsResult.success).toBe(true)
      expect(violetAnalyticsResult.data.prompts_used_today).toBe(10)
    })

    it('should track storage analytics', async () => {
      const storageRequest = new Request('https://api.example.com/v1/analytics/storage')

      const storageCtx: RequestContext = {
        request: storageRequest,
        env,
        url: new URL(storageRequest.url),
        params: {},
        requestId: 'test-req',
        userId,
        startTime: Date.now(),
      }

      const storageResponse = await analyticsController.getStorageAnalytics(storageCtx)
      const storageResult = (await storageResponse.json()) as any

      expect(storageResponse.status).toBe(200)
      expect(storageResult.success).toBe(true)
      expect(storageResult.data.total_bytes_used).toBeDefined()
      expect(storageResult.data.quota_bytes).toBe(53687091200) // 50GB
    })
  })

  describe('Violet Suggestions', () => {
    it('should provide contextual suggestions based on profile', async () => {
      const suggestionsRequest = new Request('https://api.example.com/v1/violet/suggestions')

      const suggestionsCtx: RequestContext = {
        request: suggestionsRequest,
        env,
        url: new URL(suggestionsRequest.url),
        params: {},
        requestId: 'test-req',
        userId,
        startTime: Date.now(),
      }

      const suggestionsResponse = await violetController.getSuggestions(suggestionsCtx)
      const suggestionsResult = (await suggestionsResponse.json()) as any

      expect(suggestionsResponse.status).toBe(200)
      expect(suggestionsResult.success).toBe(true)
      expect(Array.isArray(suggestionsResult.data.suggestions)).toBe(true)
      expect(suggestionsResult.data.suggestions.length).toBeGreaterThan(0)
    })
  })
})
