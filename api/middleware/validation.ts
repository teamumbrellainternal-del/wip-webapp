/**
 * Validation middleware
 * Validates request body and parameters against schemas
 */

import type { Middleware, RequestContext } from '../router'
import { errorResponse } from '../utils/response'
import { ErrorCodes } from '../utils/error-codes'

/**
 * Schema validation function type
 */
export type ValidationSchema<T> = (data: unknown) => {
  success: boolean
  data?: T
  error?: {
    message: string
    field?: string
  }
}

/**
 * Create validation middleware for request body
 */
export function validateBody<T>(schema: ValidationSchema<T>): Middleware {
  return async (ctx: RequestContext, next) => {
    // Parse request body
    let body: unknown
    try {
      const text = await ctx.request.text()
      body = text ? JSON.parse(text) : {}
    } catch (error) {
      return errorResponse(
        ErrorCodes.INVALID_JSON,
        'Invalid JSON in request body',
        400,
        undefined,
        ctx.requestId
      )
    }

    // Validate against schema
    const result = schema(body)
    if (!result.success) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        result.error?.message || 'Validation failed',
        400,
        result.error?.field,
        ctx.requestId
      )
    }

    // Attach validated data to context for handler to use
    // Note: We'd extend RequestContext to have a `body` field in production
    // For now, handlers will re-parse the body

    return next()
  }
}

/**
 * Create validation middleware for path parameters
 */
export function validateParams<T>(schema: ValidationSchema<T>): Middleware {
  return async (ctx: RequestContext, next) => {
    // Validate params
    const result = schema(ctx.params)
    if (!result.success) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        result.error?.message || 'Invalid path parameters',
        400,
        result.error?.field,
        ctx.requestId
      )
    }

    return next()
  }
}

/**
 * Create validation middleware for query parameters
 */
export function validateQuery<T>(schema: ValidationSchema<T>): Middleware {
  return async (ctx: RequestContext, next) => {
    // Parse query params to object
    const query: Record<string, string> = {}
    ctx.url.searchParams.forEach((value, key) => {
      query[key] = value
    })

    // Validate query
    const result = schema(query)
    if (!result.success) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        result.error?.message || 'Invalid query parameters',
        400,
        result.error?.field,
        ctx.requestId
      )
    }

    return next()
  }
}

/**
 * Simple schema validators for common patterns
 */
export const Validators = {
  /**
   * Validate UUID format
   */
  uuid: (value: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(value)
  },

  /**
   * Validate required string
   */
  requiredString: (value: unknown): value is string => {
    return typeof value === 'string' && value.length > 0
  },

  /**
   * Validate email format
   */
  email: (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value)
  },

  /**
   * Validate phone number (E.164 format)
   */
  phone: (value: string): boolean => {
    const phoneRegex = /^\+[1-9]\d{1,14}$/
    return phoneRegex.test(value)
  },

  /**
   * Validate URL format
   */
  url: (value: string): boolean => {
    try {
      new URL(value)
      return true
    } catch {
      return false
    }
  },
}
