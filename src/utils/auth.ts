/**
 * Authentication Utilities
 * Helper functions for JWT handling and OAuth flow
 */

import { jwtDecode } from 'jwt-decode'

export interface JWTPayload {
  sub: string // user ID
  email: string
  name?: string
  exp: number // expiry timestamp
  iat: number // issued at
}

/**
 * Decode a JWT token and return its payload
 */
export function decodeJWT(token: string): JWTPayload {
  return jwtDecode<JWTPayload>(token)
}

/**
 * Check if a JWT token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = decodeJWT(token)
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

/**
 * Extract email from JWT token
 */
export function extractEmailFromJWT(token: string): string {
  const payload = decodeJWT(token)
  return payload.email
}

/**
 * Extract JWT from Cloudflare Access callback
 * Tries multiple sources: cookie, query param, header
 */
export function extractJWT(): string {
  // Try CF_Authorization cookie first (Cloudflare Access JWT)
  const jwtCookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith('CF_Authorization='))
    ?.split('=')[1]

  if (jwtCookie) return jwtCookie

  // Try URL query params as fallback
  const params = new URLSearchParams(window.location.search)
  const jwtParam = params.get('jwt') || params.get('access_token')

  if (jwtParam) return jwtParam

  throw new Error('No JWT found in callback')
}

/**
 * Build Cloudflare Access OAuth URL
 */
export function buildOAuthUrl(provider: 'apple' | 'google'): string {
  // TODO: Replace with actual Cloudflare Access team domain from environment
  // For now, using a placeholder - this will need to be configured
  const cfAccessDomain = import.meta.env.VITE_CF_ACCESS_DOMAIN || 'your-team.cloudflareaccess.com'
  const redirectUri = `${window.location.origin}/auth/callback`

  return `https://${cfAccessDomain}/cdn-cgi/access/login?redirect_uri=${encodeURIComponent(redirectUri)}&provider=${provider}`
}
