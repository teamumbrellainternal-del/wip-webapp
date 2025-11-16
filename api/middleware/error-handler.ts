/**
 * Error handling middleware
 * Converts errors to appropriate HTTP responses
 * Implements task-1.4 requirements for standardized error handling
 */

import { errorResponse } from '../utils/response'
import { AppError, isAppError } from '../utils/errors'

/**
 * Check if running in production environment
 */
function isProduction(): boolean {
  // In Cloudflare Workers, we can check the environment
  // For now, we'll use a simple heuristic
  return typeof process !== 'undefined' && process.env?.NODE_ENV === 'production'
}

/**
 * Sanitize error message for production
 * Removes sensitive details like stack traces, file paths, database queries
 */
function sanitizeErrorMessage(message: string, statusCode: number): string {
  if (!isProduction()) {
    return message
  }

  // In production, don't expose internal details for 500 errors
  if (statusCode >= 500) {
    return 'An internal error occurred. Please try again later.'
  }

  // For 4xx errors, return the message but sanitize sensitive patterns
  return message
    .replace(/\/[^ ]*\.ts/g, '[file]') // Remove file paths
    .replace(/D1_ERROR:[^:]+:/g, 'Database error:') // Sanitize D1 errors
    .replace(/SELECT .+ FROM/gi, 'Database query') // Remove SQL queries
}

/**
 * Log error with full details to console
 * Includes stack trace, timestamp, and error context
 */
function logError(error: unknown, context?: Record<string, any>): void {
  const timestamp = new Date().toISOString()

  if (isAppError(error)) {
    console.error('[ERROR]', {
      timestamp,
      type: error.name,
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      details: error.details,
      stack: error.stack,
      context,
    })
  } else if (error instanceof Error) {
    console.error('[ERROR]', {
      timestamp,
      type: error.name,
      message: error.message,
      stack: error.stack,
      context,
    })
  } else {
    console.error('[ERROR]', {
      timestamp,
      type: 'Unknown',
      error: String(error),
      context,
    })
  }
}

/**
 * Handle common errors and convert to appropriate responses
 * @param error - Error to handle
 * @param requestId - Optional request ID for tracing
 * @returns Response with appropriate status code and error message
 */
export function handleError(error: unknown, requestId?: string): Response {
  // Log error with full details
  logError(error, { requestId })

  // Handle custom AppError instances
  if (isAppError(error)) {
    const sanitizedMessage = sanitizeErrorMessage(error.message, error.statusCode)

    return errorResponse(
      error.code,
      sanitizedMessage,
      error.statusCode,
      undefined,
      requestId
    )
  }

  // Handle standard Error instances (legacy support)
  if (error instanceof Error) {
    // JWT and authentication errors
    if (
      error.message.includes('JWT') ||
      error.message.includes('token') ||
      error.message.includes('expired') ||
      error.message.includes('signature')
    ) {
      const sanitizedMessage = sanitizeErrorMessage(error.message, 401)
      return errorResponse('AUTHENTICATION_ERROR', sanitizedMessage, 401, undefined, requestId)
    }

    // Authorization errors
    if (error.message.includes('Authorization') || error.message.includes('Forbidden')) {
      const sanitizedMessage = sanitizeErrorMessage(error.message, 403)
      return errorResponse('AUTHORIZATION_ERROR', sanitizedMessage, 403, undefined, requestId)
    }

    // Validation errors
    if (
      error.message.includes('Invalid') ||
      error.message.includes('validation') ||
      error.message.includes('required')
    ) {
      const sanitizedMessage = sanitizeErrorMessage(error.message, 400)
      return errorResponse('VALIDATION_ERROR', sanitizedMessage, 400, undefined, requestId)
    }

    // Not found errors
    if (error.message.includes('not found') || error.message.includes('does not exist')) {
      const sanitizedMessage = sanitizeErrorMessage(error.message, 404)
      return errorResponse('NOT_FOUND', sanitizedMessage, 404, undefined, requestId)
    }

    // Rate limit errors
    if (error.message.includes('rate limit') || error.message.includes('quota')) {
      const sanitizedMessage = sanitizeErrorMessage(error.message, 429)
      return errorResponse('RATE_LIMIT_EXCEEDED', sanitizedMessage, 429, undefined, requestId)
    }

    // Generic error with message
    const sanitizedMessage = sanitizeErrorMessage(error.message, 500)
    return errorResponse('INTERNAL_ERROR', sanitizedMessage, 500, undefined, requestId)
  }

  // Unknown error type
  const genericMessage = sanitizeErrorMessage('An unexpected error occurred', 500)
  return errorResponse('INTERNAL_ERROR', genericMessage, 500, undefined, requestId)
}
