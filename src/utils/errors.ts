/**
 * Error Handling Utilities for Umbrella MVP
 * Custom error classes and error message formatting
 */

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
 */
export function handleApiError(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
        return error.details?.message as string || 'Invalid request. Please check your input.'
      case 401:
        return 'Please sign in to continue'
      case 403:
        return "You don't have permission to do that"
      case 404:
        return 'Resource not found'
      case 409:
        return 'This action conflicts with existing data'
      case 422:
        return 'Please check your input and try again'
      case 429:
        return 'Too many requests. Please try again later.'
      case 500:
        return 'Something went wrong on our end. Please try again.'
      case 502:
      case 503:
        return 'Service temporarily unavailable. Please try again in a moment.'
      case 504:
        return 'Request timed out. Please try again.'
      default:
        return error.message || 'Something went wrong. Please try again.'
    }
  }

  if (error instanceof Error) {
    // Network errors
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      return 'Network error. Please check your connection and try again.'
    }
    return error.message
  }

  return 'An unexpected error occurred'
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
