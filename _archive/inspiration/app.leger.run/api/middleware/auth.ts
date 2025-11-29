/**
 * Authentication middleware
 * Validates JWT tokens and extracts user information
 */

import { verifyJWT, type JWTPayload } from '../utils/jwt'

/**
 * Environment interface (defined in api/index.ts)
 */
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
 * Authenticated request with user info
 */
export interface AuthenticatedRequest extends Request {
  user: JWTPayload
}

/**
 * API error response
 */
export interface APIError {
  success: false
  error: {
    code: string
    message: string
    action?: string
    docs?: string
  }
}

/**
 * API success response
 */
export interface APISuccess<T = unknown> {
  success: true
  data: T
}

/**
 * Extract and validate JWT from Authorization header
 * @param request - Incoming request
 * @param env - Worker environment
 * @returns JWT payload if valid
 * @throws Error with appropriate message
 */
export async function authenticateRequest(
  request: Request,
  env: Env
): Promise<JWTPayload> {
  const authHeader = request.headers.get('Authorization')

  if (!authHeader) {
    throw new Error('Missing Authorization header')
  }

  if (!authHeader.startsWith('Bearer ')) {
    throw new Error('Invalid Authorization header format. Expected: Bearer <token>')
  }

  const token = authHeader.substring(7)

  if (!token) {
    throw new Error('Missing JWT token')
  }

  try {
    const payload = await verifyJWT(token, env.JWT_SECRET)
    return payload
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`JWT validation failed: ${error.message}`)
    }
    throw new Error('JWT validation failed')
  }
}

/**
 * Create error response
 */
export function errorResponse(
  code: string,
  message: string,
  status: number,
  action?: string,
  docs?: string
): Response {
  const error: APIError = {
    success: false,
    error: {
      code,
      message,
      action,
      docs,
    },
  }

  return new Response(JSON.stringify(error), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  })
}

/**
 * Create success response
 */
export function successResponse<T>(data: T, status: number = 200): Response {
  const response: APISuccess<T> = {
    success: true,
    data,
  }

  return new Response(JSON.stringify(response), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  })
}

/**
 * Handle common errors and convert to appropriate responses
 */
export function handleError(error: unknown): Response {
  console.error('API Error:', error)

  if (error instanceof Error) {
    // JWT errors
    if (
      error.message.includes('JWT') ||
      error.message.includes('token') ||
      error.message.includes('expired')
    ) {
      return errorResponse(
        'authentication_failed',
        error.message,
        401,
        'Please run: leger auth login',
        'https://docs.leger.run/authentication'
      )
    }

    // Authorization errors
    if (error.message.includes('Authorization')) {
      return errorResponse('unauthorized', error.message, 401)
    }

    // Validation errors
    if (error.message.includes('Invalid') || error.message.includes('validation')) {
      return errorResponse('validation_error', error.message, 400)
    }

    // Not found errors
    if (error.message.includes('not found') || error.message.includes('does not exist')) {
      return errorResponse('not_found', error.message, 404)
    }

    // Generic error
    return errorResponse('internal_error', error.message, 500)
  }

  // Unknown error type
  return errorResponse('internal_error', 'An unexpected error occurred', 500)
}
