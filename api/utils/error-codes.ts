/**
 * Standardized error codes for the Umbrella API
 * Based on architecture spec error handling requirements
 */

/**
 * HTTP status codes with error codes
 */
export const ErrorCodes = {
  // 400 - Bad Request
  VALIDATION_ERROR: 'validation_error',
  INVALID_REQUEST: 'invalid_request',
  INVALID_JSON: 'invalid_json',
  MISSING_FIELD: 'missing_field',
  INVALID_FORMAT: 'invalid_format',

  // 401 - Unauthorized
  AUTHENTICATION_FAILED: 'authentication_failed',
  INVALID_TOKEN: 'invalid_token',
  TOKEN_EXPIRED: 'token_expired',
  MISSING_TOKEN: 'missing_token',

  // 403 - Forbidden
  UNAUTHORIZED: 'unauthorized',
  FORBIDDEN: 'forbidden',
  ONBOARDING_INCOMPLETE: 'onboarding_incomplete',
  INSUFFICIENT_PERMISSIONS: 'insufficient_permissions',

  // 404 - Not Found
  NOT_FOUND: 'not_found',
  RESOURCE_NOT_FOUND: 'resource_not_found',
  ENDPOINT_NOT_FOUND: 'endpoint_not_found',
  USER_NOT_FOUND: 'user_not_found',

  // 409 - Conflict
  CONFLICT: 'conflict',
  DUPLICATE_RESOURCE: 'duplicate_resource',

  // 429 - Rate Limit
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  QUOTA_EXCEEDED: 'quota_exceeded',
  VIOLET_LIMIT_EXCEEDED: 'violet_limit_exceeded',
  STORAGE_QUOTA_EXCEEDED: 'storage_quota_exceeded',

  // 500 - Internal Server Error
  INTERNAL_ERROR: 'internal_error',
  DATABASE_ERROR: 'database_error',
  STORAGE_ERROR: 'storage_error',

  // 503 - Service Unavailable
  SERVICE_UNAVAILABLE: 'service_unavailable',
  MAINTENANCE_MODE: 'maintenance_mode',
  EXTERNAL_SERVICE_ERROR: 'external_service_error',

  // Feature specific
  NOT_IMPLEMENTED: 'not_implemented',
} as const

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes]

/**
 * Error messages mapped to codes
 */
export const ErrorMessages: Record<ErrorCode, string> = {
  // 400
  [ErrorCodes.VALIDATION_ERROR]: 'Request validation failed',
  [ErrorCodes.INVALID_REQUEST]: 'Invalid request',
  [ErrorCodes.INVALID_JSON]: 'Invalid JSON in request body',
  [ErrorCodes.MISSING_FIELD]: 'Required field missing',
  [ErrorCodes.INVALID_FORMAT]: 'Invalid field format',

  // 401
  [ErrorCodes.AUTHENTICATION_FAILED]: 'Authentication failed',
  [ErrorCodes.INVALID_TOKEN]: 'Invalid authentication token',
  [ErrorCodes.TOKEN_EXPIRED]: 'Authentication token expired',
  [ErrorCodes.MISSING_TOKEN]: 'Authentication token missing',

  // 403
  [ErrorCodes.UNAUTHORIZED]: 'Unauthorized access',
  [ErrorCodes.FORBIDDEN]: 'Access forbidden',
  [ErrorCodes.ONBOARDING_INCOMPLETE]: 'Onboarding not complete',
  [ErrorCodes.INSUFFICIENT_PERMISSIONS]: 'Insufficient permissions',

  // 404
  [ErrorCodes.NOT_FOUND]: 'Resource not found',
  [ErrorCodes.RESOURCE_NOT_FOUND]: 'Requested resource not found',
  [ErrorCodes.ENDPOINT_NOT_FOUND]: 'API endpoint not found',
  [ErrorCodes.USER_NOT_FOUND]: 'User not found',

  // 409
  [ErrorCodes.CONFLICT]: 'Resource conflict',
  [ErrorCodes.DUPLICATE_RESOURCE]: 'Duplicate resource',

  // 429
  [ErrorCodes.RATE_LIMIT_EXCEEDED]: 'Rate limit exceeded',
  [ErrorCodes.QUOTA_EXCEEDED]: 'Quota exceeded',
  [ErrorCodes.VIOLET_LIMIT_EXCEEDED]: 'Violet daily limit exceeded (50 prompts/day)',
  [ErrorCodes.STORAGE_QUOTA_EXCEEDED]: 'Storage quota exceeded (50GB limit)',

  // 500
  [ErrorCodes.INTERNAL_ERROR]: 'Internal server error',
  [ErrorCodes.DATABASE_ERROR]: 'Database error',
  [ErrorCodes.STORAGE_ERROR]: 'Storage error',

  // 503
  [ErrorCodes.SERVICE_UNAVAILABLE]: 'Service temporarily unavailable',
  [ErrorCodes.MAINTENANCE_MODE]: 'Service in maintenance mode',
  [ErrorCodes.EXTERNAL_SERVICE_ERROR]: 'External service error',

  // Feature specific
  [ErrorCodes.NOT_IMPLEMENTED]: 'Feature not yet implemented',
}

/**
 * Get HTTP status code for error code
 */
export function getStatusCodeForError(code: ErrorCode): number {
  if (code.includes('validation') || code.includes('invalid') || code.includes('missing')) {
    return 400
  }
  if (code.includes('authentication') || code.includes('token')) {
    return 401
  }
  if (code.includes('unauthorized') || code.includes('forbidden') || code.includes('permission')) {
    return 403
  }
  if (code.includes('not_found')) {
    return 404
  }
  if (code.includes('conflict') || code.includes('duplicate')) {
    return 409
  }
  if (code.includes('limit') || code.includes('quota')) {
    return 429
  }
  if (code.includes('unavailable') || code.includes('maintenance') || code.includes('external')) {
    return 503
  }
  // Default to 500 for internal/database/storage errors
  return 500
}
