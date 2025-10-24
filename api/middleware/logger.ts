/**
 * Request logging middleware
 * Logs all requests in structured JSON format
 */

import type { Middleware } from '../router'

/**
 * Log entry structure
 */
interface LogEntry {
  timestamp: string
  requestId: string
  method: string
  path: string
  query: string
  status: number
  duration: number
  userId?: string
  userAgent?: string
  ip?: string
  error?: string
}

/**
 * Logger middleware that logs all requests in structured JSON format
 */
export const loggerMiddleware: Middleware = async (ctx, next) => {
  const startTime = ctx.startTime

  try {
    // Execute next middleware/handler
    const response = await next()

    // Log successful request
    logRequest({
      timestamp: new Date().toISOString(),
      requestId: ctx.requestId,
      method: ctx.request.method,
      path: ctx.url.pathname,
      query: ctx.url.search,
      status: response.status,
      duration: Date.now() - startTime,
      userId: ctx.userId,
      userAgent: ctx.request.headers.get('User-Agent') || undefined,
      ip: ctx.request.headers.get('CF-Connecting-IP') || undefined,
    })

    return response
  } catch (error) {
    // Log failed request
    logRequest({
      timestamp: new Date().toISOString(),
      requestId: ctx.requestId,
      method: ctx.request.method,
      path: ctx.url.pathname,
      query: ctx.url.search,
      status: 500,
      duration: Date.now() - startTime,
      userId: ctx.userId,
      userAgent: ctx.request.headers.get('User-Agent') || undefined,
      ip: ctx.request.headers.get('CF-Connecting-IP') || undefined,
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    throw error
  }
}

/**
 * Log request in structured JSON format
 */
function logRequest(entry: LogEntry): void {
  console.log(JSON.stringify(entry))
}
