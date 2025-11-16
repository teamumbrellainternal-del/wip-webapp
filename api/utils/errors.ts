/**
 * Custom error classes for standardized error handling
 * Based on task-1.4 requirements and REFINEMENT_REPORT_pt2.md Issue #6
 */

/**
 * Base application error class
 */
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR',
    public details?: Record<string, any>
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }

  /**
   * Sanitize error message for production
   * Removes sensitive details like stack traces, file paths, etc.
   */
  getSanitizedMessage(): string {
    // In production, return generic messages for 500 errors
    if (this.statusCode >= 500) {
      return 'An internal error occurred. Please try again later.'
    }
    return this.message
  }
}

/**
 * 400 - Validation/Bad Request Errors
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 400, 'VALIDATION_ERROR', details)
  }
}

/**
 * 401 - Authentication Errors
 */
export class AuthenticationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 401, 'AUTHENTICATION_ERROR', details)
  }
}

/**
 * 403 - Authorization/Forbidden Errors
 */
export class AuthorizationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 403, 'AUTHORIZATION_ERROR', details)
  }
}

/**
 * 404 - Not Found Errors
 */
export class NotFoundError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 404, 'NOT_FOUND', details)
  }
}

/**
 * 500 - Database Errors
 */
export class DatabaseError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 500, 'DATABASE_ERROR', details)
  }
}

/**
 * 500 - Storage Errors
 */
export class StorageError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 500, 'STORAGE_ERROR', details)
  }
}

/**
 * 429 - Rate Limit Errors
 */
export class RateLimitError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', details)
  }
}

/**
 * 503 - Service Unavailable Errors
 */
export class ServiceUnavailableError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 503, 'SERVICE_UNAVAILABLE', details)
  }
}

/**
 * Helper to check if error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}
