/**
 * Router system for Umbrella API Worker
 * Handles route matching, parameter extraction, and middleware execution
 */

import type { Env } from './index'

/**
 * Route parameters extracted from path
 */
export interface RouteParams {
  [key: string]: string
}

/**
 * Request context with parsed information
 */
export interface RequestContext {
  request: Request
  env: Env
  url: URL
  params: RouteParams
  requestId: string
  userId?: string
  startTime: number
}

/**
 * Route handler function
 */
export type RouteHandler = (ctx: RequestContext) => Promise<Response> | Response

/**
 * Middleware function
 */
export type Middleware = (
  ctx: RequestContext,
  next: () => Promise<Response>
) => Promise<Response> | Response

/**
 * Route definition
 */
export interface Route {
  method: string
  pattern: RegExp
  paramNames: string[]
  handler: RouteHandler
  middleware: Middleware[]
}

/**
 * Router class for handling API routes
 */
export class Router {
  private routes: Route[] = []
  private globalMiddleware: Middleware[] = []

  /**
   * Add global middleware that runs for all routes
   */
  use(middleware: Middleware): void {
    this.globalMiddleware.push(middleware)
  }

  /**
   * Add a route with optional middleware
   */
  addRoute(
    method: string,
    path: string,
    handler: RouteHandler,
    middleware: Middleware[] = []
  ): void {
    const { pattern, paramNames } = this.pathToRegex(path)
    this.routes.push({
      method: method.toUpperCase(),
      pattern,
      paramNames,
      handler,
      middleware,
    })
  }

  /**
   * Convenience methods for HTTP verbs
   */
  get(path: string, handler: RouteHandler, middleware: Middleware[] = []): void {
    this.addRoute('GET', path, handler, middleware)
  }

  post(path: string, handler: RouteHandler, middleware: Middleware[] = []): void {
    this.addRoute('POST', path, handler, middleware)
  }

  put(path: string, handler: RouteHandler, middleware: Middleware[] = []): void {
    this.addRoute('PUT', path, handler, middleware)
  }

  delete(path: string, handler: RouteHandler, middleware: Middleware[] = []): void {
    this.addRoute('DELETE', path, handler, middleware)
  }

  patch(path: string, handler: RouteHandler, middleware: Middleware[] = []): void {
    this.addRoute('PATCH', path, handler, middleware)
  }

  /**
   * Match request to route and execute handler with middleware
   */
  async handle(request: Request, env: Env): Promise<Response | null> {
    const url = new URL(request.url)
    const method = request.method.toUpperCase()

    // Find matching route
    for (const route of this.routes) {
      if (route.method !== method) {
        continue
      }

      const match = url.pathname.match(route.pattern)
      if (!match) {
        continue
      }

      // Extract route parameters
      const params: RouteParams = {}
      route.paramNames.forEach((name, index) => {
        params[name] = match[index + 1]
      })

      // Create request context
      const requestId = request.headers.get('X-Request-ID') || this.generateRequestId()
      const ctx: RequestContext = {
        request,
        env,
        url,
        params,
        requestId,
        startTime: Date.now(),
      }

      // Build middleware chain (global + route-specific)
      const allMiddleware = [...this.globalMiddleware, ...route.middleware]

      // Execute middleware chain and handler
      const executeMiddleware = async (index: number): Promise<Response> => {
        if (index < allMiddleware.length) {
          // Execute middleware
          const middleware = allMiddleware[index]
          return middleware(ctx, () => executeMiddleware(index + 1))
        } else {
          // Execute handler
          return route.handler(ctx)
        }
      }

      return executeMiddleware(0)
    }

    // No matching route found
    return null
  }

  /**
   * Convert path pattern to regex and extract parameter names
   * Supports patterns like /users/:id/posts/:postId
   * Also supports wildcard patterns like /media/* (matches /media/anything/here)
   */
  private pathToRegex(path: string): { pattern: RegExp; paramNames: string[] } {
    const paramNames: string[] = []

    // Replace :param with regex capture group
    let pattern = path.replace(/:([a-zA-Z0-9_]+)/g, (_, paramName) => {
      paramNames.push(paramName)
      return '([^/]+)'
    })

    // Handle wildcard * at end of path (matches any remaining path)
    // /media/* becomes /media/(.*)
    if (pattern.endsWith('/*')) {
      paramNames.push('wildcard')
      pattern = pattern.slice(0, -2) + '/(.*)'
    }

    // Ensure exact match
    return {
      pattern: new RegExp(`^${pattern}$`),
      paramNames,
    }
  }

  /**
   * Generate unique request ID for tracing
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }
}
