/**
 * Umbrella API Worker Entry Point
 * Main Worker that handles all API routes using the Router system
 * Implements task-10.2 requirements for error tracking and logging
 */

import { Toucan } from 'toucan-js'
import { Router } from './router'
import { handleClerkWebhook, handleSessionCheck, handleLogout, handleSessionRefresh } from './routes/auth'
import { handleHealthCheck } from './routes/health'
import { handleCorsPrelight, addCorsHeaders } from './middleware/cors'
import { handleError } from './middleware/error-handler'
import { loggerMiddleware } from './middleware/logger'
import { errorResponse } from './utils/response'
import { ErrorCodes } from './utils/error-codes'
import { violetRateLimitMiddleware, rateLimitPublic, rateLimitUser } from './middleware/rate-limit'
import { authenticateRequest } from './middleware/auth'
import { logger, setEnvironment } from './utils/logger'
import { validateAndLogEnvironment } from './utils/validate-env'

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
import * as contactsController from './controllers/contacts'
import * as violetController from './controllers/violet'
import * as searchController from './controllers/search'
import * as accountController from './controllers/account'
import * as adminController from './controllers/admin'
import * as pusherController from './controllers/pusher'
import * as mediaController from './controllers/media'
import * as connectionsController from './controllers/connections'
import * as notificationsController from './controllers/notifications'
import * as venueController from './controllers/venue'
import * as sitemapController from './controllers/sitemap'
import { aggregateAnalytics, handleAnalyticsCron } from './controllers/cron/analytics'
import { requireAdmin } from './middleware/admin'
import { requireRole } from './middleware/role'

/**
 * Worker environment bindings
 */
export interface Env {
  ASSETS: Fetcher // Assets binding for serving frontend
  DB: D1Database // D1 database binding
  KV: KVNamespace // KV namespace binding
  BUCKET?: R2Bucket // R2 bucket binding (optional until created)
  USE_MOCKS?: string // Demo/preview mode flag
  JWT_SECRET: string // JWT signing secret
  CLERK_SECRET_KEY: string // Clerk secret key
  CLERK_PUBLISHABLE_KEY: string // Clerk publishable key
  CLERK_WEBHOOK_SECRET: string // Clerk webhook secret
  CLAUDE_API_KEY: string // Claude API key for Violet
  RESEND_API_KEY: string // Resend API key for emails
  TWILIO_ACCOUNT_SID: string // Twilio account SID
  TWILIO_AUTH_TOKEN: string // Twilio auth token
  TWILIO_PHONE_NUMBER: string // Twilio phone number
  PUSHER_APP_ID?: string // Pusher app ID for real-time messaging
  PUSHER_KEY?: string // Pusher key for real-time messaging
  PUSHER_SECRET?: string // Pusher secret for real-time messaging
  PUSHER_CLUSTER?: string // Pusher cluster region (e.g., us2, eu)
  SENTRY_DSN?: string // Sentry DSN for error tracking (optional)
  ENVIRONMENT?: string // Environment name (production, staging, dev)
}

/**
 * Authentication middleware wrapper
 * Sets ctx.userId (string) and ctx.user (full User object) for role-based checks
 */
async function authMiddleware(ctx: any, next: () => Promise<Response>): Promise<Response> {
  try {
    const clerkUser = await authenticateRequest(ctx.request, ctx.env)
    ctx.userId = clerkUser.userId

    // Fetch full user record for role-based middleware (RBAC Phase 6)
    const user = await ctx.env.DB.prepare('SELECT * FROM users WHERE id = ?')
      .bind(clerkUser.userId)
      .first()
    ctx.user = user

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
 * Optional authentication middleware - populates ctx.userId if authenticated, but doesn't reject if not
 * Useful for endpoints that work for both authenticated and unauthenticated users
 */
async function optionalAuthMiddleware(ctx: any, next: () => Promise<Response>): Promise<Response> {
  try {
    const user = await authenticateRequest(ctx.request, ctx.env)
    ctx.userId = user.userId
  } catch {
    // Silently continue without userId for unauthenticated requests
    ctx.userId = undefined
  }
  return next()
}

/**
 * Admin authorization middleware wrapper
 * Requires authentication + admin role in Clerk publicMetadata
 */
async function adminMiddleware(ctx: any, next: () => Promise<Response>): Promise<Response> {
  try {
    const adminUser = await requireAdmin(ctx.request, ctx.env)
    ctx.userId = adminUser.id
    ctx.isAdmin = true
    return next()
  } catch (error) {
    const statusCode = error instanceof Error && error.message.includes('Admin') ? 403 : 401
    return errorResponse(
      statusCode === 403 ? ErrorCodes.AUTHORIZATION_FAILED : ErrorCodes.AUTHENTICATION_FAILED,
      error instanceof Error ? error.message : 'Authorization failed',
      statusCode,
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

  // Sitemap for SEO (public)
  router.get('/sitemap.xml', sitemapController.getSitemap)

  // Media routes (public - serves files from R2)
  router.get('/media/*', mediaController.serveFile)

  // Auth routes
  router.post('/v1/auth/webhook', async (ctx) => handleClerkWebhook(ctx.request, ctx.env, ctx.requestId))
  router.get('/v1/auth/session', async (ctx) => handleSessionCheck(ctx.request, ctx.env))
  router.post('/v1/auth/logout', async (ctx) => handleLogout(ctx.request, ctx.env))
  router.post('/v1/auth/refresh', async (ctx) => handleSessionRefresh(ctx.request, ctx.env))

  // Account routes (auth required)
  router.delete('/v1/account', accountController.deleteAccount, [authMiddleware])
  router.put('/v1/users/role', accountController.updateUserRole, [authMiddleware])

  // Profile routes (auth required)
  router.get('/v1/profile', profileController.getProfile, [authMiddleware])
  router.put('/v1/profile', profileController.updateProfile, [authMiddleware])
  router.delete('/v1/profile', profileController.deleteProfile, [authMiddleware])
  router.get('/v1/profile/completion', profileController.getProfileCompletion, [authMiddleware])
  router.get('/v1/profile/actions', profileController.getProfileActions, [authMiddleware])
  router.post('/v1/profile/avatar', profileController.uploadAvatar, [authMiddleware])
  router.post('/v1/profile/cover', profileController.uploadCover, [authMiddleware])
  router.put('/v1/profile/slug', profileController.updateSlug, [authMiddleware]) // Update custom URL slug
  router.get('/v1/profile/slug/:slug/available', profileController.checkSlugAvailability) // Check slug availability (public)
  router.get('/v1/profile/:id', profileController.getPublicProfile) // Public profile (supports ID or slug)

  // Profile tracks routes (task-3.4)
  router.post('/v1/profile/tracks/upload', profileTracksController.generateTrackUploadUrl, [authMiddleware])
  router.post('/v1/profile/tracks/direct', profileTracksController.uploadTrackDirect, [authMiddleware]) // Direct upload for local dev
  router.post('/v1/profile/tracks', profileTracksController.createTrack, [authMiddleware])
  router.get('/v1/profile/:artistId/tracks', profileTracksController.getArtistTracks) // Public
  router.delete('/v1/profile/tracks/:trackId', profileTracksController.deleteTrack, [authMiddleware])

  // Profile media routes (Explore gallery)
  router.get('/v1/profile/:artistId/media', filesController.getPublicMedia) // Public

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
  router.post('/v1/onboarding/artists/step2', onboardingController.submitArtistStep2, [authMiddleware])
  router.post('/v1/onboarding/artists/step3', onboardingController.submitArtistStep3, [authMiddleware])
  router.post('/v1/onboarding/artists/step4', onboardingController.submitArtistStep4, [authMiddleware])
  router.post('/v1/onboarding/artists/step5', onboardingController.submitArtistStep5, [authMiddleware])

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

  // Gigs routes - with RBAC role guards (Phase 6)
  router.get('/v1/gigs', gigsController.listGigs, [authMiddleware]) // Browse marketplace (all roles)
  router.post('/v1/gigs', gigsController.createGig, [authMiddleware, requireRole('venue')]) // Create gig (venue only)
  router.get('/v1/gigs/mine', gigsController.getMyGigs, [authMiddleware, requireRole('venue')]) // My posted gigs (venue only)
  router.get('/v1/gigs/applications', gigsController.getMyApplications, [authMiddleware, requireRole('artist')]) // My applications (artist only)
  router.get('/v1/gigs/:id', gigsController.getGig, [authMiddleware]) // View gig details (all roles)
  router.put('/v1/gigs/:id', gigsController.updateGig, [authMiddleware, requireRole('venue')]) // Update gig (venue only)
  router.delete('/v1/gigs/:id', gigsController.deleteGig, [authMiddleware, requireRole('venue')]) // Cancel gig (venue only)
  router.get('/v1/gigs/:id/applications', gigsController.getGigApplications, [authMiddleware, requireRole('venue')]) // View applications (venue only)
  router.put('/v1/gigs/:id/applications/:appId', gigsController.updateApplicationStatus, [authMiddleware, requireRole('venue')]) // Accept/reject (venue only)
  router.post('/v1/gigs/:id/apply', gigsController.applyToGig, [authMiddleware, requireRole('artist')]) // Apply to gig (artist only)
  router.delete('/v1/gigs/:id/apply', gigsController.withdrawApplication, [authMiddleware, requireRole('artist')]) // Withdraw application (artist only)

  // Venue routes - with RBAC role guards
  router.get('/v1/venue/profile', venueController.getVenueProfile, [authMiddleware, requireRole('venue')]) // Get own venue profile
  router.post('/v1/venue/profile', venueController.createVenueProfile, [authMiddleware, requireRole('venue')]) // Create venue profile (onboarding)
  router.put('/v1/venue/profile', venueController.updateVenueProfile, [authMiddleware, requireRole('venue')]) // Update venue profile
  router.put('/v1/venue/profile/slug', venueController.updateVenueSlug, [authMiddleware, requireRole('venue')]) // Update custom URL slug
  router.get('/v1/venue/profile/slug/:slug/available', venueController.checkVenueSlugAvailability) // Check slug availability (public)
  router.get('/v1/venue/profile/:id', venueController.getPublicVenueProfile) // Public venue profile (supports ID or slug)

  // Artists routes
  router.get('/v1/artists', artistsController.discoverArtists, [authMiddleware]) // Auth required for distance calculation (task-5.4)
  router.get('/v1/artists/:id', artistsController.getArtist) // Public
  router.get('/v1/artists/:id/tracks', artistsController.getArtistTracks) // Public
  router.get('/v1/artists/:id/reviews', artistsController.getArtistReviews) // Public
  router.get('/v1/artists/:id/follow', artistsController.getFollowStatus, [optionalAuthMiddleware]) // Returns is_following if authenticated
  router.post('/v1/artists/:id/follow', artistsController.followArtist, [authMiddleware])
  router.delete('/v1/artists/:id/follow', artistsController.unfollowArtist, [authMiddleware])

  // Connections routes (auth required) - LinkedIn-style mutual connections
  router.post('/v1/connections/:userId', connectionsController.sendRequest, [authMiddleware])
  router.get('/v1/connections', connectionsController.listConnections, [authMiddleware])
  router.get('/v1/connections/pending', connectionsController.listPending, [authMiddleware])
  router.get('/v1/connections/sent', connectionsController.listSent, [authMiddleware])
  router.put('/v1/connections/:requestId/accept', connectionsController.acceptRequest, [authMiddleware])
  router.put('/v1/connections/:requestId/decline', connectionsController.declineRequest, [authMiddleware])
  router.delete('/v1/connections/:requestId/cancel', connectionsController.cancelRequest, [authMiddleware])
  router.delete('/v1/connections/:userId', connectionsController.removeConnection, [authMiddleware])
  router.get('/v1/connections/:userId/status', connectionsController.getStatus, [authMiddleware])
  router.get('/v1/connections/:userId/mutual', connectionsController.getMutualConnections, [authMiddleware])

  // Notifications routes (auth required)
  router.get('/v1/notifications', notificationsController.list, [authMiddleware])
  router.get('/v1/notifications/count', notificationsController.getUnreadCount, [authMiddleware])
  router.put('/v1/notifications/:id/read', notificationsController.markRead, [authMiddleware])
  router.put('/v1/notifications/read-all', notificationsController.markAllRead, [authMiddleware])
  router.delete('/v1/notifications/:id', notificationsController.deleteNotification, [authMiddleware])

  // Messages routes (auth required)
  router.get('/v1/conversations', messagesController.listConversations, [authMiddleware])
  router.get('/v1/conversations/:id', messagesController.getConversation, [authMiddleware])
  router.get('/v1/conversations/:id/messages', messagesController.getMessages, [authMiddleware])
  router.post('/v1/conversations', messagesController.startConversation, [authMiddleware])
  router.post('/v1/conversations/:id/messages', messagesController.sendMessage, [authMiddleware])
  router.post('/v1/conversations/:id/read', messagesController.markAsRead, [authMiddleware])
  router.delete('/v1/conversations/:id', messagesController.deleteConversation, [authMiddleware])
  router.post('/v1/messages/booking-inquiry', messagesController.createBookingInquiry, [authMiddleware])

  // Pusher authentication (for real-time private channels)
  router.post('/v1/pusher/auth', pusherController.authenticate, [authMiddleware])

  // Files routes (auth required)
  router.post('/v1/files', filesController.confirmFileUpload, [authMiddleware]) // Confirm upload
  router.get('/v1/files', filesController.listFiles, [authMiddleware])
  router.get('/v1/files/storage', filesController.getStorageStats, [authMiddleware])
  router.get('/v1/files/quota', filesController.getQuota, [authMiddleware]) // task-7.4
  router.get('/v1/files/:id', filesController.getFile, [authMiddleware])
  router.post('/v1/files/upload', filesController.generateUploadUrl, [authMiddleware]) // task-7.1
  router.post('/v1/files/upload-url', filesController.getUploadUrl, [authMiddleware]) // legacy
  router.post('/v1/files/direct', filesController.uploadFileDirect, [authMiddleware]) // direct upload (like avatar)
  router.post('/v1/files/:id/confirm', filesController.confirmUpload, [authMiddleware])
  router.delete('/v1/files/:id', filesController.deleteFile, [authMiddleware])

  // Folder routes (auth required)
  router.post('/v1/files/folders', filesController.createFolder, [authMiddleware])
  router.put('/v1/files/:fileId/move', filesController.moveFile, [authMiddleware])

  // Journal routes (auth required)
  router.get('/v1/journal', journalController.listEntries, [authMiddleware])
  router.get('/v1/journal/:id', journalController.getEntry, [authMiddleware])
  router.post('/v1/journal', journalController.createEntry, [authMiddleware])
  router.put('/v1/journal/:id', journalController.updateEntry, [authMiddleware])
  router.delete('/v1/journal/:id', journalController.deleteEntry, [authMiddleware])

  // Analytics routes (auth required)
  router.get('/v1/analytics', analyticsController.getAnalytics, [authMiddleware])
  router.get('/v1/analytics/dashboard', analyticsController.getDashboard, [authMiddleware])
  router.get('/v1/analytics/profile-views', analyticsController.getProfileViews, [authMiddleware])
  router.get('/v1/analytics/gigs', analyticsController.getGigAnalytics, [authMiddleware])
  router.get('/v1/analytics/messages', analyticsController.getMessageAnalytics, [authMiddleware])
  router.get('/v1/analytics/violet', analyticsController.getVioletAnalytics, [authMiddleware])
  router.get('/v1/analytics/storage', analyticsController.getStorageAnalytics, [authMiddleware])
  router.get('/v1/analytics/spotlight', analyticsController.getSpotlightArtists) // Public (task-4.4)
  router.get('/v1/analytics/goals', analyticsController.getGoals, [authMiddleware])
  router.post('/v1/analytics/goals', analyticsController.createGoal, [authMiddleware])
  router.put('/v1/analytics/goals/:id', analyticsController.updateGoal, [authMiddleware])
  router.delete('/v1/analytics/goals/:id', analyticsController.deleteGoal, [authMiddleware])
  router.get('/v1/analytics/achievements', analyticsController.getAchievements, [authMiddleware])
  router.get('/v1/analytics/performance', analyticsController.getPerformance, [authMiddleware])

  // Broadcast routes (auth required)
  router.get('/v1/broadcasts', broadcastController.listBroadcasts, [authMiddleware])
  router.get('/v1/broadcasts/:id', broadcastController.getBroadcast, [authMiddleware])
  router.get('/v1/broadcasts/:id/stats', broadcastController.getBroadcastStats, [authMiddleware])
  router.post('/v1/broadcasts', broadcastController.createBroadcast, [authMiddleware])
  router.delete('/v1/broadcasts/:id', broadcastController.deleteBroadcast, [authMiddleware])

  // Contacts routes (auth required) - task-8.2
  router.get('/v1/contacts/lists', contactsController.getContactLists, [authMiddleware])
  router.post('/v1/contacts/lists', contactsController.createContactList, [authMiddleware])
  router.get('/v1/contacts', contactsController.getContacts, [authMiddleware])
  router.post('/v1/contacts', contactsController.createContact, [authMiddleware])
  router.post('/v1/contacts/import', contactsController.importContacts, [authMiddleware])
  router.put('/v1/contacts/:contactId', contactsController.updateContact, [authMiddleware])
  router.delete('/v1/contacts/:contactId', contactsController.deleteContact, [authMiddleware])

  // Violet AI routes (auth required, rate limited)
  router.post('/v1/violet/prompt', violetController.sendPrompt, [
    authMiddleware,
    violetRateLimitMiddleware,
  ])
  router.get('/v1/violet/history', violetController.getHistory, [authMiddleware])
  router.get('/v1/violet/usage', violetController.getUsage, [authMiddleware])
  router.get('/v1/violet/suggestions', violetController.getSuggestions, [authMiddleware])
  router.delete('/v1/violet/history', violetController.clearHistory, [authMiddleware])

  // Violet AI Conversation routes (chat interface)
  router.get('/v1/violet/conversations', violetController.listConversations, [authMiddleware])
  router.post('/v1/violet/conversations', violetController.createConversation, [authMiddleware])
  router.get('/v1/violet/conversations/:id', violetController.getConversation, [authMiddleware])
  router.post('/v1/violet/conversations/:id/messages', violetController.sendConversationMessage, [
    authMiddleware,
    violetRateLimitMiddleware,
  ])

  // Search routes (auth required) - Task-5.5
  router.get('/v1/search', searchController.globalSearch, [authMiddleware])
  router.get('/v1/search/artists', searchController.searchArtists, [authMiddleware])
  router.get('/v1/search/gigs', searchController.searchGigs, [authMiddleware])
  router.get('/v1/search/tracks', searchController.searchTracks, [authMiddleware])
  router.get('/v1/search/suggestions', searchController.getSearchSuggestions, [authMiddleware])

  // Admin routes (admin role required) - For Retool integration
  router.get('/v1/admin/stats', adminController.getStats, [adminMiddleware])
  router.get('/v1/admin/users', adminController.getUsers, [adminMiddleware])
  router.get('/v1/admin/artists', adminController.getArtists, [adminMiddleware])
  router.get('/v1/admin/violet-usage', adminController.getVioletUsage, [adminMiddleware])
  router.get('/v1/admin/gigs', adminController.getGigs, [adminMiddleware])
  router.get('/v1/admin/gig-applications', adminController.getGigApplications, [adminMiddleware])
  router.get('/v1/admin/reviews', adminController.getReviews, [adminMiddleware])
  router.get('/v1/admin/messages', adminController.getMessages, [adminMiddleware])

  // Cron routes (manual trigger with ?force=true)
  router.get('/cron/analytics', async (ctx) => handleAnalyticsCron(ctx.request, ctx.env))

  return router
}

/**
 * Initialize Sentry for error tracking
 */
function initSentry(request: Request, env: Env, ctx: ExecutionContext): Toucan | undefined {
  // Only initialize Sentry if DSN is provided
  if (!env.SENTRY_DSN) {
    return undefined
  }

  const sentry = new Toucan({
    dsn: env.SENTRY_DSN,
    context: ctx,
    request,
    environment: env.ENVIRONMENT || 'development',
    // Performance monitoring sample rate: 10% in production
    tracesSampleRate: env.ENVIRONMENT === 'production' ? 0.1 : 1.0,
    // Enable debug mode in development
    debug: env.ENVIRONMENT !== 'production',
  })

  // Set user context if available (will be set later in auth middleware)
  // sentry.setUser({ id: userId })

  return sentry
}

/**
 * Add security headers to response
 * Includes CSP, HSTS, and other security headers
 */
function addSecurityHeaders(response: Response, env: Env): Response {
  const headers = new Headers(response.headers)

  // Content Security Policy - only set if not already present
  // (allows individual controllers like media to set their own CSP)
  if (!response.headers.has('Content-Security-Policy')) {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "media-src 'self' https:",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')

    headers.set('Content-Security-Policy', csp)
  }

  // Prevent MIME type sniffing
  headers.set('X-Content-Type-Options', 'nosniff')

  // Enable XSS protection (legacy browsers)
  headers.set('X-XSS-Protection', '1; mode=block')

  // Prevent clickjacking - only set if not already present
  // (allows media controller to set SAMEORIGIN for iframe-viewable content)
  if (!response.headers.has('X-Frame-Options')) {
    headers.set('X-Frame-Options', 'DENY')
  }

  // HSTS (only in production)
  if (env.ENVIRONMENT === 'production') {
    headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }

  // Referrer policy
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Permissions policy
  headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

/**
 * Main Worker export
 */
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)

    // Set environment for logger
    setEnvironment(env.ENVIRONMENT || 'development')

    // Validate environment on startup (skip for test/demo routes)
    const isTestAuthRoute =
      url.pathname === '/auth/test' ||
      url.pathname === '/test/auth/login' ||
      url.pathname === '/api/test/auth/login'

    if (!isTestAuthRoute) {
      try {
        validateAndLogEnvironment(env)
      } catch (error) {
        // Return 500 if environment validation fails
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Environment validation failed',
            message: error instanceof Error ? error.message : 'Unknown error',
          }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      }
    }

    // Initialize Sentry for error tracking
    const sentry = initSentry(request, env, ctx)

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleCorsPrelight(request, env.ENVIRONMENT)
    }

    try {
      // Setup router
      const router = setupRouter()

      // Try to match route
      const response = await router.handle(request, env)

      // If route matched, return the response with CORS and security headers
      if (response) {
        let finalResponse = addCorsHeaders(response, request, env.ENVIRONMENT)
        finalResponse = addSecurityHeaders(finalResponse, env)
        return finalResponse
      }

      // If no API route matched, serve static assets (SPA)
      // This allows the frontend to handle client-side routing
      return env.ASSETS.fetch(request)
    } catch (error) {
      // Global error handler with Sentry integration
      let response = handleError(error, undefined, sentry, {
        endpoint: url.pathname,
        method: request.method,
      })
      response = addCorsHeaders(response, request, env.ENVIRONMENT)
      response = addSecurityHeaders(response, env)
      return response
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
