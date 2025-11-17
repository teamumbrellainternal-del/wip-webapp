/**
 * Umbrella API Worker Entry Point
 * Main Worker that handles all API routes using the Router system
 */

import { Router } from './router'
import { handleClerkWebhook, handleSessionCheck, handleLogout, handleSessionRefresh } from './routes/auth'
import { handleHealthCheck } from './routes/health'
import { handleCorsPrelight, addCorsHeaders } from './middleware/cors'
import { handleError } from './middleware/error-handler'
import { loggerMiddleware } from './middleware/logger'
import { errorResponse } from './utils/response'
import { ErrorCodes } from './utils/error-codes'
import { violetRateLimitMiddleware } from './middleware/rate-limit'
import { authenticateRequest } from './middleware/auth'

// Import controllers
import * as profileController from './controllers/profile'
import * as profileTracksController from './controllers/profile/tracks'
import * as onboardingController from './controllers/onboarding'
import * as tracksController from './controllers/tracks'
import * as reviewsController from './controllers/reviews'
import * as gigsController from './controllers/gigs'
import * as artistsController from './controllers/artists'
import * as messagesController from './controllers/messages'
import * as filesController from './controllers/files'
import * as journalController from './controllers/journal'
import * as analyticsController from './controllers/analytics'
import * as broadcastController from './controllers/broadcast'
import * as violetController from './controllers/violet'
import * as searchController from './controllers/search'
import { aggregateAnalytics, handleAnalyticsCron } from './controllers/cron/analytics'

/**
 * Worker environment bindings
 */
export interface Env {
  ASSETS: Fetcher // Assets binding for serving frontend
  DB: D1Database // D1 database binding
  KV: KVNamespace // KV namespace binding
  BUCKET: R2Bucket // R2 bucket binding
  JWT_SECRET: string // JWT signing secret
  CLERK_SECRET_KEY: string // Clerk secret key
  CLERK_PUBLISHABLE_KEY: string // Clerk publishable key
  CLERK_WEBHOOK_SECRET: string // Clerk webhook secret
  CLAUDE_API_KEY: string // Claude API key for Violet
  RESEND_API_KEY: string // Resend API key for emails
  TWILIO_ACCOUNT_SID: string // Twilio account SID
  TWILIO_AUTH_TOKEN: string // Twilio auth token
  TWILIO_PHONE_NUMBER: string // Twilio phone number
}

/**
 * Authentication middleware wrapper
 */
async function authMiddleware(ctx: any, next: () => Promise<Response>): Promise<Response> {
  try {
    const user = await authenticateRequest(ctx.request, ctx.env)
    ctx.userId = user.userId
    return next()
  } catch (error) {
    return errorResponse(
      ErrorCodes.AUTHENTICATION_FAILED,
      error instanceof Error ? error.message : 'Authentication failed',
      401,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Setup router with all routes
 */
function setupRouter(): Router {
  const router = new Router()

  // Add global middleware
  router.use(loggerMiddleware)

  // Public routes (no auth required)
  router.get('/v1/health', async (ctx) => handleHealthCheck(ctx.env))

  // Auth routes
  router.post('/v1/auth/webhook', async (ctx) => handleClerkWebhook(ctx.request, ctx.env))
  router.get('/v1/auth/session', async (ctx) => handleSessionCheck(ctx.request, ctx.env))
  router.post('/v1/auth/logout', async (ctx) => handleLogout(ctx.request, ctx.env))
  router.post('/v1/auth/refresh', async (ctx) => handleSessionRefresh(ctx.request, ctx.env))

  // Profile routes (auth required)
  router.get('/v1/profile', profileController.getProfile, [authMiddleware])
  router.put('/v1/profile', profileController.updateProfile, [authMiddleware])
  router.delete('/v1/profile', profileController.deleteProfile, [authMiddleware])
  router.get('/v1/profile/completion', profileController.getProfileCompletion, [authMiddleware])
  router.get('/v1/profile/actions', profileController.getProfileActions, [authMiddleware])
  router.post('/v1/profile/avatar/upload', profileController.uploadAvatar, [authMiddleware])
  router.post('/v1/profile/avatar/confirm', profileController.confirmAvatarUpload, [authMiddleware])
  router.get('/v1/profile/:id', profileController.getPublicProfile) // Public profile

  // Profile tracks routes (task-3.4)
  router.post('/v1/profile/tracks/upload', profileTracksController.generateTrackUploadUrl, [authMiddleware])
  router.post('/v1/profile/tracks', profileTracksController.createTrack, [authMiddleware])
  router.get('/v1/profile/:artistId/tracks', profileTracksController.getArtistTracks) // Public
  router.delete('/v1/profile/tracks/:trackId', profileTracksController.deleteTrack, [authMiddleware])

  // Onboarding routes (auth required)
  router.get('/v1/onboarding/status', onboardingController.getOnboardingStatus, [authMiddleware])
  router.post('/v1/onboarding/step1', onboardingController.submitStep1, [authMiddleware])
  router.post('/v1/onboarding/step2', onboardingController.submitStep2, [authMiddleware])
  router.post('/v1/onboarding/step3', onboardingController.submitStep3, [authMiddleware])
  router.post('/v1/onboarding/step4', onboardingController.submitStep4, [authMiddleware])
  router.post('/v1/onboarding/step5', onboardingController.submitStep5, [authMiddleware])
  router.post('/v1/onboarding/artists/step5', onboardingController.submitArtistStep5, [authMiddleware])
  router.post('/v1/onboarding/reset', onboardingController.resetOnboarding, [authMiddleware])

  // New Artist Onboarding routes (incremental D1-based approach)
  router.post('/v1/onboarding/artists/step1', onboardingController.submitArtistStep1, [authMiddleware])

  // Tracks routes
  router.get('/v1/tracks', tracksController.listTracks, [authMiddleware])
  router.get('/v1/tracks/:id', tracksController.getTrack) // Public
  router.post('/v1/tracks/upload-url', tracksController.getTrackUploadUrl, [authMiddleware])
  router.post('/v1/tracks/confirm', tracksController.confirmTrackUpload, [authMiddleware])
  router.post('/v1/tracks/reorder', tracksController.reorderTracks, [authMiddleware])
  router.put('/v1/tracks/:id', tracksController.updateTrack, [authMiddleware])
  router.delete('/v1/tracks/:id', tracksController.deleteTrack, [authMiddleware])

  // Reviews routes (task-3.7)
  router.get('/v1/profile/:artistId/reviews', reviewsController.listArtistReviews) // Public
  router.post('/v1/profile/reviews/invite', reviewsController.inviteReviewer, [authMiddleware])
  router.post('/v1/reviews', reviewsController.submitReview) // Public (token-based)
  router.get('/v1/reviews/invite/:token', reviewsController.getReviewByToken) // Public (for pre-filling form)

  // Gigs routes
  router.get('/v1/gigs', gigsController.listGigs, [authMiddleware]) // Requires auth (task-5.1)
  router.get('/v1/gigs/applications', gigsController.getMyApplications, [authMiddleware])
  router.get('/v1/gigs/:id', gigsController.getGig, [authMiddleware]) // Auth required (task-5.2)
  router.post('/v1/gigs', gigsController.createGig, [authMiddleware])
  router.post('/v1/gigs/:id/apply', gigsController.applyToGig, [authMiddleware])
  router.delete('/v1/gigs/:id/apply', gigsController.withdrawApplication, [authMiddleware])

  // Artists routes
  router.get('/v1/artists', artistsController.discoverArtists, [authMiddleware]) // Auth required for distance calculation (task-5.4)
  router.get('/v1/artists/:id', artistsController.getArtist) // Public
  router.get('/v1/artists/:id/tracks', artistsController.getArtistTracks) // Public
  router.get('/v1/artists/:id/reviews', artistsController.getArtistReviews) // Public
  router.post('/v1/artists/:id/follow', artistsController.followArtist, [authMiddleware])
  router.delete('/v1/artists/:id/follow', artistsController.unfollowArtist, [authMiddleware])

  // Messages routes (auth required)
  router.get('/v1/conversations', messagesController.listConversations, [authMiddleware])
  router.get('/v1/conversations/:id', messagesController.getConversation, [authMiddleware])
  router.get('/v1/conversations/:id/messages', messagesController.getMessages, [authMiddleware])
  router.post('/v1/conversations', messagesController.startConversation, [authMiddleware])
  router.post('/v1/conversations/:id/messages', messagesController.sendMessage, [authMiddleware])
  router.post('/v1/conversations/:id/read', messagesController.markAsRead, [authMiddleware])
  router.delete('/v1/conversations/:id', messagesController.deleteConversation, [authMiddleware])
  router.post('/v1/messages/booking-inquiry', messagesController.createBookingInquiry, [authMiddleware])

  // Files routes (auth required)
  router.get('/v1/files', filesController.listFiles, [authMiddleware])
  router.get('/v1/files/storage', filesController.getStorageStats, [authMiddleware])
  router.get('/v1/files/:id', filesController.getFile, [authMiddleware])
  router.post('/v1/files/upload', filesController.generateUploadUrl, [authMiddleware]) // task-7.1
  router.post('/v1/files/upload-url', filesController.getUploadUrl, [authMiddleware]) // legacy
  router.post('/v1/files/:id/confirm', filesController.confirmUpload, [authMiddleware])
  router.delete('/v1/files/:id', filesController.deleteFile, [authMiddleware])

  // Journal routes (auth required)
  router.get('/v1/journal', journalController.listEntries, [authMiddleware])
  router.get('/v1/journal/tags', journalController.getTags, [authMiddleware])
  router.get('/v1/journal/:id', journalController.getEntry, [authMiddleware])
  router.post('/v1/journal', journalController.createEntry, [authMiddleware])
  router.put('/v1/journal/:id', journalController.updateEntry, [authMiddleware])
  router.delete('/v1/journal/:id', journalController.deleteEntry, [authMiddleware])

  // Analytics routes (auth required)
  router.get('/v1/analytics', analyticsController.getAnalytics, [authMiddleware])
  router.get('/v1/analytics/profile-views', analyticsController.getProfileViews, [authMiddleware])
  router.get('/v1/analytics/gigs', analyticsController.getGigAnalytics, [authMiddleware])
  router.get('/v1/analytics/messages', analyticsController.getMessageAnalytics, [authMiddleware])
  router.get('/v1/analytics/violet', analyticsController.getVioletAnalytics, [authMiddleware])
  router.get('/v1/analytics/storage', analyticsController.getStorageAnalytics, [authMiddleware])
  router.get('/v1/analytics/spotlight', analyticsController.getSpotlightArtists) // Public (task-4.4)

  // Broadcast routes (auth required)
  router.get('/v1/broadcasts', broadcastController.listBroadcasts, [authMiddleware])
  router.get('/v1/broadcasts/:id', broadcastController.getBroadcast, [authMiddleware])
  router.get('/v1/broadcasts/:id/stats', broadcastController.getBroadcastStats, [authMiddleware])
  router.post('/v1/broadcasts', broadcastController.createBroadcast, [authMiddleware])
  router.delete('/v1/broadcasts/:id', broadcastController.deleteBroadcast, [authMiddleware])

  // Violet AI routes (auth required, rate limited)
  router.post('/v1/violet/prompt', violetController.sendPrompt, [
    authMiddleware,
    violetRateLimitMiddleware,
  ])
  router.get('/v1/violet/history', violetController.getHistory, [authMiddleware])
  router.get('/v1/violet/usage', violetController.getUsage, [authMiddleware])
  router.get('/v1/violet/suggestions', violetController.getSuggestions, [authMiddleware])
  router.delete('/v1/violet/history', violetController.clearHistory, [authMiddleware])

  // Search routes (auth required) - Task-5.5
  router.get('/v1/search', searchController.globalSearch, [authMiddleware])
  router.get('/v1/search/artists', searchController.searchArtists, [authMiddleware])
  router.get('/v1/search/gigs', searchController.searchGigs, [authMiddleware])
  router.get('/v1/search/tracks', searchController.searchTracks, [authMiddleware])
  router.get('/v1/search/suggestions', searchController.getSearchSuggestions, [authMiddleware])

  // Cron routes (manual trigger with ?force=true)
  router.get('/cron/analytics', async (ctx) => handleAnalyticsCron(ctx.request, ctx.env))

  return router
}

/**
 * Main Worker export
 */
export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleCorsPrelight()
    }

    try {
      // Setup router
      const router = setupRouter()

      // Try to match route
      const response = await router.handle(request, env)

      // If route matched, return the response
      if (response) {
        return addCorsHeaders(response)
      }

      // If no API route matched, serve static assets (SPA)
      // This allows the frontend to handle client-side routing
      return env.ASSETS.fetch(request)
    } catch (error) {
      // Global error handler
      const response = handleError(error)
      return addCorsHeaders(response)
    }
  },

  /**
   * Scheduled cron handler
   * Runs daily at midnight UTC (configured in wrangler.toml)
   */
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    // Run analytics aggregation with retry logic
    const maxRetries = 3
    const retryDelays = [2000, 4000, 8000] // Exponential backoff: 2s, 4s, 8s

    let lastError: Error | null = null

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        console.log(`Analytics cron attempt ${attempt + 1}/${maxRetries}`)
        const response = await aggregateAnalytics(env)

        // Check if successful
        const result = await response.json()
        if (response.ok || result.success) {
          console.log('Analytics cron completed successfully')
          return
        }

        // If not successful, treat as error
        lastError = new Error(result.error || 'Analytics aggregation failed')
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error')
        console.error(`Analytics cron attempt ${attempt + 1} failed:`, lastError.message)
      }

      // If not the last attempt, wait before retrying
      if (attempt < maxRetries - 1) {
        const delay = retryDelays[attempt]
        console.log(`Retrying in ${delay}ms...`)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }

    // All retries failed - log critical error
    console.error('Analytics cron failed after all retries:', lastError?.message)

    // TODO: Send alert email to CTO/admin
    // This would require implementing email alerting via Resend
    // For now, we log the critical failure
    console.error('CRITICAL: Analytics aggregation failed after 3 retries. Manual intervention required.')
  },
}
