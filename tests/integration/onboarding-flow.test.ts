/**
 * Integration Tests for 5-Step Onboarding Flow
 * Tests complete onboarding journey per D-003 and D-004
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { handleAuthCallback } from '../../api/routes/auth'
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

describe('Onboarding Flow Integration Tests', () => {
  let env: Env
  let mocks: any
  let userId: string
  let token: string

  beforeEach(async () => {
    const mockSetup = createMockEnv()
    env = mockSetup.env
    mocks = mockSetup.mocks

    // Create a new user
    const authRequest = new Request('https://api.example.com/v1/auth/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'onboarding-test@example.com',
        oauth_provider: 'google',
        oauth_id: 'google-onboarding-123',
      }),
    })

    const authResponse = await handleAuthCallback(authRequest, env)
    const authData = (await authResponse.json()) as any
    userId = authData.data.user.id
    token = authData.data.token
  })

  describe('Complete 5-Step Onboarding Journey (D-003)', () => {
    it('should complete all 5 onboarding steps successfully', async () => {
      // Step 1: Role Selection
      const step1Data = createOnboardingStep1Data({ role: 'artist' })
      const step1Request = new Request('https://api.example.com/v1/onboarding/step1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(step1Data),
      })

      const ctx1: RequestContext = {
        request: step1Request,
        env,
        url: new URL(step1Request.url),
        params: {},
        requestId: 'test-req-1',
        userId,
        startTime: Date.now(),
      }

      const step1Response = await onboardingController.submitStep1(ctx1)
      const step1Result = (await step1Response.json()) as any

      expect(step1Response.status).toBe(200)
      expect(step1Result.success).toBe(true)
      expect(step1Result.data.step_completed).toBe(1)

      // Step 2: Basic Info
      const step2Data = createOnboardingStep2Data()
      const step2Request = new Request('https://api.example.com/v1/onboarding/step2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(step2Data),
      })

      const ctx2: RequestContext = {
        request: step2Request,
        env,
        url: new URL(step2Request.url),
        params: {},
        requestId: 'test-req-2',
        userId,
        startTime: Date.now(),
      }

      const step2Response = await onboardingController.submitStep2(ctx2)
      const step2Result = (await step2Response.json()) as any

      expect(step2Response.status).toBe(200)
      expect(step2Result.success).toBe(true)
      expect(step2Result.data.step_completed).toBe(2)

      // Step 3: Bio & Links
      const step3Data = createOnboardingStep3Data()
      const step3Request = new Request('https://api.example.com/v1/onboarding/step3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(step3Data),
      })

      const ctx3: RequestContext = {
        request: step3Request,
        env,
        url: new URL(step3Request.url),
        params: {},
        requestId: 'test-req-3',
        userId,
        startTime: Date.now(),
      }

      const step3Response = await onboardingController.submitStep3(ctx3)
      const step3Result = (await step3Response.json()) as any

      expect(step3Response.status).toBe(200)
      expect(step3Result.success).toBe(true)
      expect(step3Result.data.step_completed).toBe(3)

      // Step 4: What You're Looking For
      const step4Data = createOnboardingStep4Data()
      const step4Request = new Request('https://api.example.com/v1/onboarding/step4', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(step4Data),
      })

      const ctx4: RequestContext = {
        request: step4Request,
        env,
        url: new URL(step4Request.url),
        params: {},
        requestId: 'test-req-4',
        userId,
        startTime: Date.now(),
      }

      const step4Response = await onboardingController.submitStep4(ctx4)
      const step4Result = (await step4Response.json()) as any

      expect(step4Response.status).toBe(200)
      expect(step4Result.success).toBe(true)
      expect(step4Result.data.step_completed).toBe(4)

      // Step 5: Profile Image (Final Step)
      const step5Data = createOnboardingStep5Data()
      const step5Request = new Request('https://api.example.com/v1/onboarding/step5', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(step5Data),
      })

      const ctx5: RequestContext = {
        request: step5Request,
        env,
        url: new URL(step5Request.url),
        params: {},
        requestId: 'test-req-5',
        userId,
        startTime: Date.now(),
      }

      const step5Response = await onboardingController.submitStep5(ctx5)
      const step5Result = (await step5Response.json()) as any

      expect(step5Response.status).toBe(200)
      expect(step5Result.success).toBe(true)
      expect(step5Result.data.step_completed).toBe(5)
      expect(step5Result.data.onboarding_complete).toBe(true)

      // Verify artist profile was created
      const artists = mocks.db.getTable('artists')
      expect(artists.length).toBe(1)
      expect(artists[0].user_id).toBe(userId)
      expect(artists[0].artist_name).toBe(step2Data.artist_name)

      // Verify user onboarding status updated
      const user = mocks.db
        .getTable('users')
        .find((u: any) => u.id === userId)
      expect(user.onboarding_complete).toBe(true)
    })

    it('should enforce sequential step completion', async () => {
      // Try to skip to step 3 without completing step 1 and 2
      const step3Data = createOnboardingStep3Data()
      const step3Request = new Request('https://api.example.com/v1/onboarding/step3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(step3Data),
      })

      const ctx: RequestContext = {
        request: step3Request,
        env,
        url: new URL(step3Request.url),
        params: {},
        requestId: 'test-req',
        userId,
        startTime: Date.now(),
      }

      const response = await onboardingController.submitStep3(ctx)
      const result = (await response.json()) as any

      // Should fail because steps 1 and 2 not completed
      expect(response.status).toBe(400)
      expect(result.success).toBe(false)
      expect(result.error.code).toContain('ONBOARDING')
    })

    it('should validate required fields for each step', async () => {
      // Step 1: Missing role
      const invalidStep1Request = new Request('https://api.example.com/v1/onboarding/step1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}), // Missing role
      })

      const ctx1: RequestContext = {
        request: invalidStep1Request,
        env,
        url: new URL(invalidStep1Request.url),
        params: {},
        requestId: 'test-req',
        userId,
        startTime: Date.now(),
      }

      const step1Response = await onboardingController.submitStep1(ctx1)
      const step1Result = (await step1Response.json()) as any

      expect(step1Response.status).toBe(400)
      expect(step1Result.success).toBe(false)

      // Complete step 1 correctly
      const validStep1Request = new Request('https://api.example.com/v1/onboarding/step1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(createOnboardingStep1Data()),
      })

      const ctx1Valid: RequestContext = {
        request: validStep1Request,
        env,
        url: new URL(validStep1Request.url),
        params: {},
        requestId: 'test-req-2',
        userId,
        startTime: Date.now(),
      }

      await onboardingController.submitStep1(ctx1Valid)

      // Step 2: Missing required fields
      const invalidStep2Request = new Request('https://api.example.com/v1/onboarding/step2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          artist_name: 'Test Artist',
          // Missing genre_primary, location_city, etc.
        }),
      })

      const ctx2: RequestContext = {
        request: invalidStep2Request,
        env,
        url: new URL(invalidStep2Request.url),
        params: {},
        requestId: 'test-req-3',
        userId,
        startTime: Date.now(),
      }

      const step2Response = await onboardingController.submitStep2(ctx2)
      const step2Result = (await step2Response.json()) as any

      expect(step2Response.status).toBe(400)
      expect(step2Result.success).toBe(false)
    })
  })

  describe('No Progress Saved on Exit (D-004)', () => {
    it('should not save partial progress if user exits mid-flow', async () => {
      // Complete step 1
      const step1Request = new Request('https://api.example.com/v1/onboarding/step1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(createOnboardingStep1Data()),
      })

      const ctx1: RequestContext = {
        request: step1Request,
        env,
        url: new URL(step1Request.url),
        params: {},
        requestId: 'test-req-1',
        userId,
        startTime: Date.now(),
      }

      await onboardingController.submitStep1(ctx1)

      // Complete step 2
      const step2Request = new Request('https://api.example.com/v1/onboarding/step2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(createOnboardingStep2Data()),
      })

      const ctx2: RequestContext = {
        request: step2Request,
        env,
        url: new URL(step2Request.url),
        params: {},
        requestId: 'test-req-2',
        userId,
        startTime: Date.now(),
      }

      await onboardingController.submitStep2(ctx2)

      // Check status - should show progress
      const statusRequest = new Request('https://api.example.com/v1/onboarding/status')

      const statusCtx: RequestContext = {
        request: statusRequest,
        env,
        url: new URL(statusRequest.url),
        params: {},
        requestId: 'test-req-3',
        userId,
        startTime: Date.now(),
      }

      const statusResponse = await onboardingController.getOnboardingStatus(statusCtx)
      const statusResult = (await statusResponse.json()) as any

      expect(statusResult.data.current_step).toBe(2)

      // User exits and resets onboarding
      const resetRequest = new Request('https://api.example.com/v1/onboarding/reset', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const resetCtx: RequestContext = {
        request: resetRequest,
        env,
        url: new URL(resetRequest.url),
        params: {},
        requestId: 'test-req-4',
        userId,
        startTime: Date.now(),
      }

      const resetResponse = await onboardingController.resetOnboarding(resetCtx)
      const resetResult = (await resetResponse.json()) as any

      expect(resetResponse.status).toBe(200)
      expect(resetResult.success).toBe(true)

      // Verify progress was cleared
      const statusAfterResetCtx: RequestContext = {
        request: statusRequest,
        env,
        url: new URL(statusRequest.url),
        params: {},
        requestId: 'test-req-5',
        userId,
        startTime: Date.now(),
      }

      const statusAfterReset = await onboardingController.getOnboardingStatus(statusAfterResetCtx)
      const statusAfterResetResult = (await statusAfterReset.json()) as any

      expect(statusAfterResetResult.data.current_step).toBe(0)
      expect(statusAfterResetResult.data.onboarding_complete).toBe(false)

      // Verify no artist profile was created
      const artists = mocks.db.getTable('artists')
      expect(artists.length).toBe(0)
    })
  })

  describe('Onboarding Status Tracking', () => {
    it('should track onboarding progress accurately', async () => {
      // Initial status - no progress
      const initialStatusRequest = new Request('https://api.example.com/v1/onboarding/status')

      const initialCtx: RequestContext = {
        request: initialStatusRequest,
        env,
        url: new URL(initialStatusRequest.url),
        params: {},
        requestId: 'test-req-1',
        userId,
        startTime: Date.now(),
      }

      const initialStatus = await onboardingController.getOnboardingStatus(initialCtx)
      const initialResult = (await initialStatus.json()) as any

      expect(initialResult.data.current_step).toBe(0)
      expect(initialResult.data.onboarding_complete).toBe(false)

      // Complete steps 1-3
      const steps = [
        { num: 1, data: createOnboardingStep1Data(), handler: onboardingController.submitStep1 },
        { num: 2, data: createOnboardingStep2Data(), handler: onboardingController.submitStep2 },
        { num: 3, data: createOnboardingStep3Data(), handler: onboardingController.submitStep3 },
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

      // Check status after step 3
      const midStatusCtx: RequestContext = {
        request: initialStatusRequest,
        env,
        url: new URL(initialStatusRequest.url),
        params: {},
        requestId: 'test-req-mid',
        userId,
        startTime: Date.now(),
      }

      const midStatus = await onboardingController.getOnboardingStatus(midStatusCtx)
      const midResult = (await midStatus.json()) as any

      expect(midResult.data.current_step).toBe(3)
      expect(midResult.data.onboarding_complete).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('should handle duplicate step submissions', async () => {
      // Submit step 1
      const step1Data = createOnboardingStep1Data()
      const step1Request = new Request('https://api.example.com/v1/onboarding/step1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(step1Data),
      })

      const ctx1: RequestContext = {
        request: step1Request,
        env,
        url: new URL(step1Request.url),
        params: {},
        requestId: 'test-req-1',
        userId,
        startTime: Date.now(),
      }

      const firstSubmit = await onboardingController.submitStep1(ctx1)
      const firstResult = (await firstSubmit.json()) as any

      expect(firstSubmit.status).toBe(200)
      expect(firstResult.data.step_completed).toBe(1)

      // Submit step 1 again
      const ctx2: RequestContext = {
        request: step1Request,
        env,
        url: new URL(step1Request.url),
        params: {},
        requestId: 'test-req-2',
        userId,
        startTime: Date.now(),
      }

      const secondSubmit = await onboardingController.submitStep1(ctx2)
      const secondResult = (await secondSubmit.json()) as any

      // Should succeed (idempotent)
      expect(secondSubmit.status).toBe(200)
      expect(secondResult.data.step_completed).toBe(1)
    })

    it('should prevent completing onboarding twice', async () => {
      // Complete all 5 steps
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

      // Verify only one artist created
      const artistsBefore = mocks.db.getTable('artists')
      expect(artistsBefore.length).toBe(1)

      // Try to submit step 5 again
      const step5Request = new Request('https://api.example.com/v1/onboarding/step5', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(createOnboardingStep5Data()),
      })

      const ctxDuplicate: RequestContext = {
        request: step5Request,
        env,
        url: new URL(step5Request.url),
        params: {},
        requestId: 'test-req-duplicate',
        userId,
        startTime: Date.now(),
      }

      const duplicateResponse = await onboardingController.submitStep5(ctxDuplicate)

      // Should either succeed idempotently or reject
      const artistsAfter = mocks.db.getTable('artists')
      expect(artistsAfter.length).toBe(1) // Still only one artist
    })
  })
})
