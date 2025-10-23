/**
 * JWT validation utilities for CLI authentication
 * Uses HS256 algorithm with shared secret
 */

import { base64UrlDecode, base64UrlEncode } from './encoding'

export interface JWTPayload {
  sub: string // user_uuid (derived from tailscale_user_id)
  tailscale_user_id: string // "u123456789"
  email: string // "alice@github"
  tailnet: string // "example.ts.net"
  iat: number // Issued at timestamp (seconds)
  exp: number // Expiry timestamp (seconds)
}

/**
 * Verify JWT signature and decode payload
 * @param token - JWT token from CLI
 * @param secret - Shared secret for verification
 * @returns Decoded payload if valid
 * @throws Error if invalid or expired
 */
export async function verifyJWT(token: string, secret: string): Promise<JWTPayload> {
  const parts = token.split('.')
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format')
  }

  const [headerB64, payloadB64, signatureB64] = parts

  // Decode header and payload
  const header = JSON.parse(new TextDecoder().decode(base64UrlDecode(headerB64)))
  const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(payloadB64)))

  // Verify algorithm
  if (header.alg !== 'HS256') {
    throw new Error('Unsupported algorithm')
  }

  // Verify signature
  const data = `${headerB64}.${payloadB64}`
  const expectedSignature = await signHS256(data, secret)

  if (signatureB64 !== expectedSignature) {
    throw new Error('Invalid signature')
  }

  // Check expiration
  const now = Math.floor(Date.now() / 1000)
  if (payload.exp && payload.exp < now) {
    throw new Error('Token expired')
  }

  // Validate required fields
  if (!payload.sub || !payload.tailscale_user_id || !payload.email || !payload.tailnet) {
    throw new Error('Missing required JWT fields')
  }

  return payload as JWTPayload
}

/**
 * Sign data using HMAC-SHA256
 * @param data - Data to sign
 * @param secret - Secret key
 * @returns Base64url-encoded signature
 */
async function signHS256(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data))

  return base64UrlEncode(signature)
}

/**
 * Create JWT (for testing purposes)
 * @param payload - JWT payload
 * @param secret - Secret key
 * @returns JWT token
 */
export async function createJWT(payload: JWTPayload, secret: string): Promise<string> {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  }

  const headerB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(header)).buffer)
  const payloadB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)).buffer)

  const data = `${headerB64}.${payloadB64}`
  const signature = await signHS256(data, secret)

  return `${data}.${signature}`
}
