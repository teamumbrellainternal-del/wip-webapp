/**
 * Leger v0.1.0 Worker Entry Point
 * Complete API implementation with authentication, secrets, and releases
 */

import { handleAuthValidate } from './routes/auth'
import {
  handleListSecrets,
  handleGetSecret,
  handleUpsertSecret,
  handleDeleteSecret,
} from './routes/secrets'
import {
  handleListReleases,
  handleGetRelease,
  handleCreateRelease,
  handleUpdateRelease,
  handleDeleteRelease,
} from './routes/releases'
import {
  handleTestAuthLogin,
  handleTestListSecrets,
  handleTestGetSecret,
  handleTestUpsertSecret,
  handleTestDeleteSecret,
  handleTestListReleases,
  handleTestGetRelease,
  handleTestCreateRelease,
  handleTestUpdateRelease,
  handleTestDeleteRelease,
} from './routes/test'
import { errorResponse } from './middleware/auth'

export interface Env {
  ASSETS: Fetcher
  LEGER_USERS: KVNamespace
  LEGER_SECRETS: KVNamespace
  LEGER_STATIC: R2Bucket
  LEGER_DB: D1Database
  ENVIRONMENT: string
  APP_VERSION: string
  ENCRYPTION_KEY: string
  JWT_SECRET: string
}

/**
 * Main worker handler
 */
export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)

    // Handle health check endpoint (public, no auth)
    if (url.pathname === '/health' || url.pathname === '/api/health') {
      return new Response(
        JSON.stringify({
          status: 'healthy',
          service: 'leger-app',
          version: env.APP_VERSION || '0.1.0',
          timestamp: new Date().toISOString(),
          environment: env.ENVIRONMENT || 'production',
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        }
      )
    }

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      })
    }

    // Handle API routes
    if (url.pathname.startsWith('/api/')) {
      try {
        // Add CORS headers to all API responses
        const addCorsHeaders = (response: Response): Response => {
          const headers = new Headers(response.headers)
          headers.set('Access-Control-Allow-Origin', '*')
          headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
          headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

          return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers,
          })
        }

        // Authentication routes
        if (url.pathname === '/api/auth/validate' && request.method === 'POST') {
          return addCorsHeaders(await handleAuthValidate(request, env))
        }

        // Secrets routes
        if (url.pathname === '/api/secrets' && request.method === 'GET') {
          return addCorsHeaders(await handleListSecrets(request, env))
        }

        if (url.pathname.startsWith('/api/secrets/')) {
          const secretName = url.pathname.substring('/api/secrets/'.length)

          if (request.method === 'GET') {
            return addCorsHeaders(await handleGetSecret(request, env, secretName))
          }

          if (request.method === 'POST') {
            return addCorsHeaders(await handleUpsertSecret(request, env, secretName))
          }

          if (request.method === 'DELETE') {
            return addCorsHeaders(await handleDeleteSecret(request, env, secretName))
          }
        }

        // Releases routes
        if (url.pathname === '/api/releases') {
          if (request.method === 'GET') {
            return addCorsHeaders(await handleListReleases(request, env))
          }

          if (request.method === 'POST') {
            return addCorsHeaders(await handleCreateRelease(request, env))
          }
        }

        if (url.pathname.startsWith('/api/releases/')) {
          const releaseId = url.pathname.substring('/api/releases/'.length)

          if (request.method === 'GET') {
            return addCorsHeaders(await handleGetRelease(request, env, releaseId))
          }

          if (request.method === 'PUT') {
            return addCorsHeaders(await handleUpdateRelease(request, env, releaseId))
          }

          if (request.method === 'DELETE') {
            return addCorsHeaders(await handleDeleteRelease(request, env, releaseId))
          }
        }

        // Test routes (NO AUTHENTICATION) - for development
        // Test auth endpoint for web UI testing
        if (url.pathname === '/api/test/auth/login' && request.method === 'POST') {
          return addCorsHeaders(await handleTestAuthLogin(request, env))
        }

        if (url.pathname === '/api/test/secrets' && request.method === 'GET') {
          return addCorsHeaders(await handleTestListSecrets(request, env))
        }

        if (url.pathname.startsWith('/api/test/secrets/')) {
          const secretName = url.pathname.substring('/api/test/secrets/'.length)

          if (request.method === 'GET') {
            return addCorsHeaders(await handleTestGetSecret(request, env, secretName))
          }

          if (request.method === 'POST') {
            return addCorsHeaders(await handleTestUpsertSecret(request, env, secretName))
          }

          if (request.method === 'DELETE') {
            return addCorsHeaders(await handleTestDeleteSecret(request, env, secretName))
          }
        }

        if (url.pathname === '/api/test/releases') {
          if (request.method === 'GET') {
            return addCorsHeaders(await handleTestListReleases(request, env))
          }

          if (request.method === 'POST') {
            return addCorsHeaders(await handleTestCreateRelease(request, env))
          }
        }

        if (url.pathname.startsWith('/api/test/releases/')) {
          const releaseId = url.pathname.substring('/api/test/releases/'.length)

          if (request.method === 'GET') {
            return addCorsHeaders(await handleTestGetRelease(request, env, releaseId))
          }

          if (request.method === 'PUT') {
            return addCorsHeaders(await handleTestUpdateRelease(request, env, releaseId))
          }

          if (request.method === 'DELETE') {
            return addCorsHeaders(await handleTestDeleteRelease(request, env, releaseId))
          }
        }

        // No matching route
        return addCorsHeaders(
          errorResponse(
            'not_found',
            `API endpoint not found: ${request.method} ${url.pathname}`,
            404
          )
        )
      } catch (error) {
        console.error('API Error:', error)

        return new Response(
          JSON.stringify({
            success: false,
            error: {
              code: 'internal_error',
              message: 'An unexpected error occurred',
            },
          }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        )
      }
    }

    // For all other requests, serve the SPA
    return env.ASSETS.fetch(request)
  },
}
