/**
 * JSON response helpers for consistent API responses
 */

const API_VERSION = 'v1'

/**
 * API response metadata
 */
export interface APIMetadata {
  timestamp: string
  version: string
  requestId?: string
}

/**
 * API error response
 */
export interface APIError {
  success: false
  error: {
    code: string
    message: string
    field?: string
  }
  meta: APIMetadata
}

/**
 * API success response
 */
export interface APISuccess<T = unknown> {
  success: true
  data: T
  meta: APIMetadata
}

/**
 * Create success response with metadata
 * @param data - Response data
 * @param status - HTTP status code (default: 200)
 * @param requestId - Optional request ID for tracing
 * @returns Response object
 */
export function successResponse<T>(
  data: T,
  status: number = 200,
  requestId?: string
): Response {
  const response: APISuccess<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      version: API_VERSION,
      requestId,
    },
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
 * Create error response with metadata
 * @param code - Error code
 * @param message - Error message
 * @param status - HTTP status code (default: 400)
 * @param field - Optional field name for validation errors
 * @param requestId - Optional request ID for tracing
 * @returns Response object
 */
export function errorResponse(
  code: string,
  message: string,
  status: number = 400,
  field?: string,
  requestId?: string
): Response {
  const error: APIError = {
    success: false,
    error: {
      code,
      message,
      field,
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: API_VERSION,
      requestId,
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
