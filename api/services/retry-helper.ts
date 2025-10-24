/**
 * Retry helper with exponential backoff for external service calls
 */

import { RetryConfig, DEFAULT_RETRY_CONFIG, ServiceResult } from './types'

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Calculate exponential backoff delay
 * @param attemptNumber - Current retry attempt (0-indexed)
 * @param config - Retry configuration
 * @returns Delay in milliseconds
 */
export function calculateBackoffDelay(attemptNumber: number, config: RetryConfig): number {
  const delay = config.initialDelayMs * Math.pow(config.backoffMultiplier, attemptNumber)
  return Math.min(delay, config.maxDelayMs)
}

/**
 * Execute operation with retry logic and exponential backoff
 * @param operation - Async operation to execute
 * @param config - Retry configuration (optional, uses defaults if not provided)
 * @returns Service result with success/error information
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<ServiceResult<T>> {
  const retryConfig: RetryConfig = { ...DEFAULT_RETRY_CONFIG, ...config }
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      const result = await operation()
      return {
        success: true,
        data: result,
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Check if error is retryable
      const isRetryable = isRetryableError(error)

      // If not retryable or this was the last attempt, fail immediately
      if (!isRetryable || attempt === retryConfig.maxRetries) {
        return {
          success: false,
          error: {
            code: getErrorCode(error),
            message: lastError.message,
            retryable: isRetryable,
          },
        }
      }

      // Calculate backoff delay for next attempt
      const delay = calculateBackoffDelay(attempt, retryConfig)

      // Wait before retrying
      await sleep(delay)
    }
  }

  // Should never reach here, but TypeScript needs this
  return {
    success: false,
    error: {
      code: 'RETRY_EXHAUSTED',
      message: lastError?.message || 'Unknown error after retries',
      retryable: false,
    },
  }
}

/**
 * Determine if an error is retryable
 * Network errors, timeouts, and 5xx server errors are retryable
 * 4xx client errors (except 429 rate limit) are not retryable
 */
function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()

    // Network errors are retryable
    if (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('connection') ||
      message.includes('econnrefused') ||
      message.includes('enotfound')
    ) {
      return true
    }

    // Rate limit errors are retryable
    if (message.includes('rate limit') || message.includes('429')) {
      return true
    }

    // Server errors (5xx) are retryable
    if (message.includes('500') || message.includes('502') || message.includes('503')) {
      return true
    }

    // Client errors (4xx except 429) are not retryable
    if (
      message.includes('400') ||
      message.includes('401') ||
      message.includes('403') ||
      message.includes('404')
    ) {
      return false
    }
  }

  // Check for fetch Response objects
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as { status: number }).status

    // Rate limit is retryable
    if (status === 429) {
      return true
    }

    // Server errors are retryable
    if (status >= 500) {
      return true
    }

    // Client errors are not retryable
    if (status >= 400 && status < 500) {
      return false
    }
  }

  // Default to retryable for unknown errors
  return true
}

/**
 * Extract error code from error object
 */
function getErrorCode(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()

    if (message.includes('network')) return 'NETWORK_ERROR'
    if (message.includes('timeout')) return 'TIMEOUT_ERROR'
    if (message.includes('rate limit') || message.includes('429')) return 'RATE_LIMIT_ERROR'
    if (message.includes('401')) return 'UNAUTHORIZED'
    if (message.includes('403')) return 'FORBIDDEN'
    if (message.includes('404')) return 'NOT_FOUND'
    if (message.includes('500') || message.includes('502') || message.includes('503'))
      return 'SERVER_ERROR'

    return 'UNKNOWN_ERROR'
  }

  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as { status: number }).status

    if (status === 429) return 'RATE_LIMIT_ERROR'
    if (status === 401) return 'UNAUTHORIZED'
    if (status === 403) return 'FORBIDDEN'
    if (status === 404) return 'NOT_FOUND'
    if (status >= 500) return 'SERVER_ERROR'
    if (status >= 400) return 'CLIENT_ERROR'
  }

  return 'UNKNOWN_ERROR'
}

/**
 * Calculate next retry timestamp (ISO string)
 * @param attemptNumber - Current attempt number
 * @param config - Retry configuration
 * @returns ISO timestamp string for next retry
 */
export function calculateNextRetryTime(attemptNumber: number, config: RetryConfig): string {
  const delay = calculateBackoffDelay(attemptNumber, config)
  const nextRetry = new Date(Date.now() + delay)
  return nextRetry.toISOString()
}
