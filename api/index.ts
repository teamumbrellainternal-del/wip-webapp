/**
 * Umbrella API Worker Entry Point
 * Main Worker that handles all API routes
 */

import { handleAuthCallback, handleSessionCheck, handleLogout } from './routes/auth'
import { handleHealthCheck } from './routes/health'
import { handleCorsPrelight, addCorsHeaders } from './middleware/cors'
import { handleError } from './middleware/error-handler'
import { errorResponse } from './utils/response'

/**
 * Worker environment bindings
 */
export interface Env {
  DB: D1Database // D1 database binding
  KV: KVNamespace // KV namespace binding
  BUCKET: R2Bucket // R2 bucket binding
  JWT_SECRET: string // JWT signing secret
  CLAUDE_API_KEY: string // Claude API key for Violet
  RESEND_API_KEY: string // Resend API key for emails
  TWILIO_ACCOUNT_SID: string // Twilio account SID
  TWILIO_AUTH_TOKEN: string // Twilio auth token
  TWILIO_PHONE_NUMBER: string // Twilio phone number
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
      let response: Response

      // Health check endpoint (public, no auth)
      if (url.pathname === '/v1/health') {
        response = await handleHealthCheck(env)
        return addCorsHeaders(response)
      }

      // Authentication routes
      if (url.pathname === '/v1/auth/callback' && request.method === 'POST') {
        response = await handleAuthCallback(request, env)
        return addCorsHeaders(response)
      }

      if (url.pathname === '/v1/auth/session' && request.method === 'GET') {
        response = await handleSessionCheck(request, env)
        return addCorsHeaders(response)
      }

      if (url.pathname === '/v1/auth/logout' && request.method === 'POST') {
        response = await handleLogout(request, env)
        return addCorsHeaders(response)
      }

      // Profile routes (placeholder - to be implemented by future sessions)
      if (url.pathname === '/v1/profile' && request.method === 'GET') {
        response = errorResponse(
          'not_implemented',
          'Profile endpoints will be implemented in future sessions',
          501
        )
        return addCorsHeaders(response)
      }

      // Marketplace routes (placeholder - to be implemented by future sessions)
      if (url.pathname.startsWith('/v1/gigs')) {
        response = errorResponse(
          'not_implemented',
          'Marketplace endpoints will be implemented in future sessions',
          501
        )
        return addCorsHeaders(response)
      }

      if (url.pathname.startsWith('/v1/artists')) {
        response = errorResponse(
          'not_implemented',
          'Artist discovery endpoints will be implemented in future sessions',
          501
        )
        return addCorsHeaders(response)
      }

      // Messaging routes (placeholder - to be implemented by future sessions)
      if (url.pathname.startsWith('/v1/conversations') || url.pathname.startsWith('/v1/messages')) {
        response = errorResponse(
          'not_implemented',
          'Messaging endpoints will be implemented in future sessions',
          501
        )
        return addCorsHeaders(response)
      }

      // File management routes (placeholder - to be implemented by future sessions)
      if (url.pathname.startsWith('/v1/files')) {
        response = errorResponse(
          'not_implemented',
          'File management endpoints will be implemented in future sessions',
          501
        )
        return addCorsHeaders(response)
      }

      // Analytics routes (placeholder - to be implemented by future sessions)
      if (url.pathname.startsWith('/v1/analytics')) {
        response = errorResponse(
          'not_implemented',
          'Analytics endpoints will be implemented in future sessions',
          501
        )
        return addCorsHeaders(response)
      }

      // Violet AI routes (placeholder - to be implemented by future sessions)
      if (url.pathname.startsWith('/v1/violet')) {
        response = errorResponse(
          'not_implemented',
          'Violet AI endpoints will be implemented in future sessions',
          501
        )
        return addCorsHeaders(response)
      }

      // Search routes (placeholder - to be implemented by future sessions)
      if (url.pathname.startsWith('/v1/search')) {
        response = errorResponse(
          'not_implemented',
          'Search endpoints will be implemented in future sessions',
          501
        )
        return addCorsHeaders(response)
      }

      // No matching route
      response = errorResponse(
        'not_found',
        `API endpoint not found: ${request.method} ${url.pathname}`,
        404
      )
      return addCorsHeaders(response)
    } catch (error) {
      // Global error handler
      const response = handleError(error)
      return addCorsHeaders(response)
    }
  },
}
