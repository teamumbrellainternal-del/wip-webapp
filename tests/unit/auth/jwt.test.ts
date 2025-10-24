/**
 * Unit Tests for JWT Validation Utilities
 * Umbrella MVP - Authentication Tests
 */

import { describe, it, expect, beforeAll } from 'vitest'
import { createJWT, verifyJWT, type JWTPayload } from '../../../api/utils/jwt'

describe('JWT Utilities', () => {
  const testSecret = 'test-secret-key-for-jwt-signing-123456'
  let validPayload: JWTPayload

  beforeAll(() => {
    validPayload = {
      sub: 'user-123',
      email: 'test@example.com',
      oauth_provider: 'google',
      oauth_id: 'google-12345',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
    }
  })

  describe('createJWT', () => {
    it('should create a valid JWT token', async () => {
      const token = await createJWT(validPayload, testSecret)

      expect(token).toBeDefined()
      expect(token.split('.')).toHaveLength(3)
    })

    it('should create tokens with header, payload, and signature', async () => {
      const token = await createJWT(validPayload, testSecret)
      const [header, payload, signature] = token.split('.')

      expect(header).toBeDefined()
      expect(payload).toBeDefined()
      expect(signature).toBeDefined()
    })
  })

  describe('verifyJWT', () => {
    it('should verify and decode a valid JWT', async () => {
      const token = await createJWT(validPayload, testSecret)
      const decoded = await verifyJWT(token, testSecret)

      expect(decoded.sub).toBe(validPayload.sub)
      expect(decoded.email).toBe(validPayload.email)
      expect(decoded.oauth_provider).toBe(validPayload.oauth_provider)
      expect(decoded.oauth_id).toBe(validPayload.oauth_id)
    })

    it('should reject JWT with invalid signature', async () => {
      const token = await createJWT(validPayload, testSecret)
      const wrongSecret = 'wrong-secret'

      await expect(verifyJWT(token, wrongSecret)).rejects.toThrow('Invalid signature')
    })

    it('should reject expired JWT', async () => {
      const expiredPayload: JWTPayload = {
        ...validPayload,
        exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
      }

      const token = await createJWT(expiredPayload, testSecret)

      await expect(verifyJWT(token, testSecret)).rejects.toThrow('Token expired')
    })

    it('should reject JWT with invalid format', async () => {
      const invalidToken = 'not.a.valid.jwt.token'

      await expect(verifyJWT(invalidToken, testSecret)).rejects.toThrow('Invalid JWT format')
    })

    it('should reject JWT with missing required fields', async () => {
      const incompletePayload = {
        sub: 'user-123',
        // Missing email
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      } as JWTPayload

      const token = await createJWT(incompletePayload, testSecret)

      await expect(verifyJWT(token, testSecret)).rejects.toThrow('Missing required JWT fields')
    })

    it('should reject JWT with unsupported algorithm', async () => {
      // Manually create a JWT with wrong algorithm
      const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
      const payload = btoa(JSON.stringify(validPayload))
      const fakeToken = `${header}.${payload}.fakesignature`

      await expect(verifyJWT(fakeToken, testSecret)).rejects.toThrow('Unsupported algorithm')
    })
  })

  describe('JWT roundtrip', () => {
    it('should create and verify token with all OAuth providers', async () => {
      const providers = ['apple', 'google'] as const

      for (const provider of providers) {
        const payload: JWTPayload = {
          ...validPayload,
          oauth_provider: provider,
        }

        const token = await createJWT(payload, testSecret)
        const decoded = await verifyJWT(token, testSecret)

        expect(decoded.oauth_provider).toBe(provider)
      }
    })

    it('should handle long expiry times', async () => {
      const longExpiryPayload: JWTPayload = {
        ...validPayload,
        exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
      }

      const token = await createJWT(longExpiryPayload, testSecret)
      const decoded = await verifyJWT(token, testSecret)

      expect(decoded.exp).toBe(longExpiryPayload.exp)
    })
  })
})
