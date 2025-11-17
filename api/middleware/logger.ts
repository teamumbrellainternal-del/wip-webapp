/**
 * Request logging middleware
 * Logs all requests in structured JSON format
 * Implements task-10.2 requirements for request/response logging with timing
 */

import type { Middleware } from '../router'
import { logger, sanitizeHeaders } from '../utils/logger'

/**
 * Logger middleware that logs all requests in structured JSON format
 */
export const loggerMiddleware: Middleware = async (ctx, next) => {
  const startTime = ctx.startTime

  try {
    // Execute next middleware/handler
    const response = await next()

    // Log successful request
    logger.info('Request completed', {
      requestId: ctx.requestId,
      method: ctx.request.method,
      endpoint: ctx.url.pathname,
      parameters: {
        query: ctx.url.search,
        params: ctx.params,
      },
      statusCode: response.status,
      duration: Date.now() - startTime,
      userId: ctx.userId,
      userAgent: ctx.request.headers.get('User-Agent') || undefined,
      ip: ctx.request.headers.get('CF-Connecting-IP') || undefined,
      headers: sanitizeHeaders(ctx.request.headers),
    })

    return response
  } catch (error) {
    // Log failed request
    logger.error('Request failed', {
      requestId: ctx.requestId,
      method: ctx.request.method,
      endpoint: ctx.url.pathname,
      parameters: {
        query: ctx.url.search,
        params: ctx.params,
      },
      statusCode: 500,
      duration: Date.now() - startTime,
      userId: ctx.userId,
      userAgent: ctx.request.headers.get('User-Agent') || undefined,
      ip: ctx.request.headers.get('CF-Connecting-IP') || undefined,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })

    throw error
  }
}
