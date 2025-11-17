/**
 * CORS middleware for handling cross-origin requests
 * Implements environment-specific allowed origins for security
 */

/**
 * Get allowed origins based on environment
 */
function getAllowedOrigins(environment?: string): string[] {
  const env = environment || 'development'

  switch (env) {
    case 'production':
      return ['https://umbrella.app', 'https://www.umbrella.app']
    case 'preview':
    case 'staging':
      return ['https://preview.umbrella.app', 'https://staging.umbrella.app']
    case 'development':
    case 'dev':
    default:
      return ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000']
  }
}

/**
 * Check if origin is allowed
 * @param origin - Request origin
 * @param allowedOrigins - List of allowed origins
 * @returns The origin if allowed, null otherwise
 */
function isOriginAllowed(origin: string | null, allowedOrigins: string[]): string | null {
  if (!origin) {
    return null
  }

  // Exact match check
  if (allowedOrigins.includes(origin)) {
    return origin
  }

  return null
}

/**
 * Add CORS headers to a response
 * @param response - Original response
 * @param request - Original request
 * @param environment - Environment name
 * @returns Response with CORS headers
 */
export function addCorsHeaders(response: Response, request?: Request, environment?: string): Response {
  const headers = new Headers(response.headers)
  const allowedOrigins = getAllowedOrigins(environment)

  // Get origin from request
  const requestOrigin = request?.headers.get('Origin') || null
  const allowedOrigin = isOriginAllowed(requestOrigin, allowedOrigins)

  // Set CORS headers
  if (allowedOrigin) {
    headers.set('Access-Control-Allow-Origin', allowedOrigin)
    headers.set('Access-Control-Allow-Credentials', 'true')
  } else {
    // Fallback to first allowed origin if no request origin
    headers.set('Access-Control-Allow-Origin', allowedOrigins[0])
  }

  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cf-Access-Jwt-Assertion')
  headers.set('Access-Control-Max-Age', '86400')

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

/**
 * Handle CORS preflight request
 * @param request - Preflight request
 * @param environment - Environment name
 * @returns Response with CORS headers for OPTIONS request
 */
export function handleCorsPrelight(request: Request, environment?: string): Response {
  const allowedOrigins = getAllowedOrigins(environment)
  const requestOrigin = request.headers.get('Origin') || null
  const allowedOrigin = isOriginAllowed(requestOrigin, allowedOrigins)

  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cf-Access-Jwt-Assertion',
    'Access-Control-Max-Age': '86400',
  }

  if (allowedOrigin) {
    headers['Access-Control-Allow-Origin'] = allowedOrigin
    headers['Access-Control-Allow-Credentials'] = 'true'
  } else {
    // Fallback to first allowed origin
    headers['Access-Control-Allow-Origin'] = allowedOrigins[0]
  }

  return new Response(null, {
    status: 204,
    headers,
  })
}
