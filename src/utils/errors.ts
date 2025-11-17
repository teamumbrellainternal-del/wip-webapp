/**
 * Error Handling Utilities for Umbrella MVP
 * Custom error classes and error message formatting
 *
 * @see docs/ERROR_MESSAGES.md for error message style guide
 * @see src/lib/error-messages.ts for error message constants
 */

import { getErrorFromStatus, formatErrorForToast, type ErrorMessage } from '@/lib/error-messages'

/**
 * Custom API Error class with status code and details
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'ApiError'
    Object.setPrototypeOf(this, ApiError.prototype)
  }
}

/**
 * Convert API errors to user-friendly messages
 * Uses standardized error messages from error-messages.ts
 */
export function handleApiError(error: unknown): string {
  if (error instanceof ApiError) {
    // If the API response includes a user-friendly message, use it
    if (error.details?.message && typeof error.details.message === 'string') {
      return error.details.message as string
    }

    // Otherwise, use standardized messages based on status code
    const errorMessage = getErrorFromStatus(error.status)
    return formatErrorForToast(errorMessage)
  }

  if (error instanceof Error) {
    // Network errors
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      return 'You\'re offline. Please check your internet connection and try again'
    }

    // Timeout errors
    if (error.message.includes('timeout')) {
      return 'The connection timed out. Please check your internet and try again'
    }

    return error.message
  }

  return 'An unexpected error occurred. Please try again'
}

/**
 * Get full error message object from error
 */
export function getErrorMessage(error: unknown): ErrorMessage {
  if (error instanceof ApiError) {
    return getErrorFromStatus(error.status)
  }

  if (error instanceof Error) {
    return {
      title: 'Error',
      message: error.message,
      action: 'Please try again',
      code: error.name,
    }
  }

  return {
    title: 'Unknown Error',
    message: 'An unexpected error occurred',
    action: 'Please try again',
  }
}

/**
 * Format validation errors from API responses
 */
export function formatValidationErrors(
  errors: Record<string, string[]> | undefined
): string {
  if (!errors) return 'Validation failed'

  const messages = Object.entries(errors)
    .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
    .join('\n')

  return messages || 'Validation failed'
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('Failed to fetch') ||
      error.message.includes('NetworkError') ||
      error.message.includes('Network request failed')
    )
  }
  return false
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.status === 401
  }
  return false
}

/**
 * Check if error is a permission error
 */
export function isPermissionError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.status === 403
  }
  return false
}

/**
 * Retry logic for failed API requests
 */
export async function retryRequest<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: unknown

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      // Don't retry on client errors (4xx)
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        throw error
      }

      // Wait before retrying (exponential backoff)
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
      }
    }
  }

  throw lastError
}
