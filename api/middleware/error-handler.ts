/**
 * Error handling middleware
 * Converts errors to appropriate HTTP responses
 */

import { errorResponse } from '../utils/response'

/**
 * Handle common errors and convert to appropriate responses
 * @param error - Error to handle
 * @returns Response with appropriate status code and error message
 */
export function handleError(error: unknown): Response {
  console.error('API Error:', error)

  if (error instanceof Error) {
    // JWT and authentication errors
    if (
      error.message.includes('JWT') ||
      error.message.includes('token') ||
      error.message.includes('expired') ||
      error.message.includes('signature')
    ) {
      return errorResponse(
        'authentication_failed',
        error.message,
        401
      )
    }

    // Authorization errors
    if (error.message.includes('Authorization') || error.message.includes('Forbidden')) {
      return errorResponse('unauthorized', error.message, 403)
    }

    // Validation errors
    if (error.message.includes('Invalid') || error.message.includes('validation') || error.message.includes('required')) {
      return errorResponse('validation_error', error.message, 400)
    }

    // Not found errors
    if (error.message.includes('not found') || error.message.includes('does not exist')) {
      return errorResponse('not_found', error.message, 404)
    }

    // Rate limit errors
    if (error.message.includes('rate limit') || error.message.includes('quota')) {
      return errorResponse('rate_limit_exceeded', error.message, 429)
    }

    // Generic error with message
    return errorResponse('internal_error', error.message, 500)
  }

  // Unknown error type
  return errorResponse('internal_error', 'An unexpected error occurred', 500)
}
