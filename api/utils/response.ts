/**
 * JSON response helpers for consistent API responses
 */

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
}

/**
 * API success response
 */
export interface APISuccess<T = unknown> {
  success: true
  data: T
}

/**
 * Create success response
 * @param data - Response data
 * @param status - HTTP status code (default: 200)
 * @returns Response object
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
 * Create error response
 * @param code - Error code
 * @param message - Error message
 * @param status - HTTP status code (default: 400)
 * @param field - Optional field name for validation errors
 * @returns Response object
 */
export function errorResponse(
  code: string,
  message: string,
  status: number = 400,
  field?: string
): Response {
  const error: APIError = {
    success: false,
    error: {
      code,
      message,
      field,
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
