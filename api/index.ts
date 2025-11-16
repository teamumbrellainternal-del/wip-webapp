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
  router.get('/v1/profile/:id', profileController.getPublicProfile) // Public profile

  // Onboarding routes (auth required)
  router.get('/v1/onboarding/status', onboardingController.getOnboardingStatus, [authMiddleware])
  router.post('/v1/onboarding/step1', onboardingController.submitStep1, [authMiddleware])
  router.post('/v1/onboarding/step2', onboardingController.submitStep2, [authMiddleware])
  router.post('/v1/onboarding/step3', onboardingController.submitStep3, [authMiddleware])
  router.post('/v1/onboarding/step4', onboardingController.submitStep4, [authMiddleware])
  router.post('/v1/onboarding/step5', onboardingController.submitStep5, [authMiddleware])
  router.post('/v1/onboarding/artists/step5', onboardingController.submitArtistStep5, [authMiddleware])
  router.post('/v1/onboarding/reset', onboardingController.resetOnboarding, [authMiddleware])

  // Tracks routes
  router.get('/v1/tracks', tracksController.listTracks, [authMiddleware])
  router.get('/v1/tracks/:id', tracksController.getTrack) // Public
  router.post('/v1/tracks/upload-url', tracksController.getTrackUploadUrl, [authMiddleware])
  router.post('/v1/tracks/confirm', tracksController.confirmTrackUpload, [authMiddleware])
  router.post('/v1/tracks/reorder', tracksController.reorderTracks, [authMiddleware])
  router.put('/v1/tracks/:id', tracksController.updateTrack, [authMiddleware])
  router.delete('/v1/tracks/:id', tracksController.deleteTrack, [authMiddleware])

  // Reviews routes
  router.post('/v1/reviews/invite', reviewsController.inviteReviewer, [authMiddleware])
  router.post('/v1/reviews/submit', reviewsController.submitReview) // Public (token-based)
  router.get('/v1/reviews/artist/:artistId', reviewsController.listArtistReviews) // Public
  router.get('/v1/reviews/invite/:token', reviewsController.getReviewByToken) // Public

  // Gigs routes
  router.get('/v1/gigs', gigsController.listGigs) // Public
  router.get('/v1/gigs/applications', gigsController.getMyApplications, [authMiddleware])
  router.get('/v1/gigs/:id', gigsController.getGig) // Public
  router.post('/v1/gigs', gigsController.createGig, [authMiddleware])
  router.post('/v1/gigs/:id/apply', gigsController.applyToGig, [authMiddleware])
  router.delete('/v1/gigs/:id/apply', gigsController.withdrawApplication, [authMiddleware])

  // Artists routes
  router.get('/v1/artists', artistsController.discoverArtists) // Public
  router.get('/v1/artists/:id', artistsController.getArtist) // Public
  router.get('/v1/artists/:id/tracks', artistsController.getArtistTracks) // Public
  router.get('/v1/artists/:id/reviews', artistsController.getArtistReviews) // Public
  router.post('/v1/artists/:id/follow', artistsController.followArtist, [authMiddleware])
  router.delete('/v1/artists/:id/follow', artistsController.unfollowArtist, [authMiddleware])

  // Messages routes (auth required)
  router.get('/v1/conversations', messagesController.listConversations, [authMiddleware])
  router.get('/v1/conversations/:id', messagesController.getConversation, [authMiddleware])
  router.post('/v1/conversations', messagesController.startConversation, [authMiddleware])
  router.post('/v1/conversations/:id/messages', messagesController.sendMessage, [authMiddleware])
  router.post('/v1/conversations/:id/read', messagesController.markAsRead, [authMiddleware])
  router.delete('/v1/conversations/:id', messagesController.deleteConversation, [authMiddleware])

  // Files routes (auth required)
  router.get('/v1/files', filesController.listFiles, [authMiddleware])
  router.get('/v1/files/storage', filesController.getStorageStats, [authMiddleware])
  router.get('/v1/files/:id', filesController.getFile, [authMiddleware])
  router.post('/v1/files/upload-url', filesController.getUploadUrl, [authMiddleware])
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

  // Search routes (public)
  router.get('/v1/search', searchController.globalSearch)
  router.get('/v1/search/artists', searchController.searchArtists)
  router.get('/v1/search/gigs', searchController.searchGigs)
  router.get('/v1/search/tracks', searchController.searchTracks)
  router.get('/v1/search/suggestions', searchController.getSearchSuggestions)

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
}
