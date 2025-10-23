/**
 * CORS middleware for handling cross-origin requests
 */

/**
 * Add CORS headers to a response
 * @param response - Original response
 * @returns Response with CORS headers
 */
export function addCorsHeaders(response: Response): Response {
  const headers = new Headers(response.headers)
  headers.set('Access-Control-Allow-Origin', '*')
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cf-Access-Jwt-Assertion')

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

/**
 * Handle CORS preflight request
 * @returns Response with CORS headers for OPTIONS request
 */
export function handleCorsPrelight(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cf-Access-Jwt-Assertion',
      'Access-Control-Max-Age': '86400',
    },
  })
}
