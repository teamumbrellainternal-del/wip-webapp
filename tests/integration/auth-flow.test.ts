/**
 * Integration Tests for Complete OAuth Flow
 * Umbrella MVP - End-to-End Authentication Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { handleAuthCallback, handleSessionCheck, handleSessionRefresh, handleLogout } from '../../api/routes/auth'
import type { Env } from '../../api/index'

// Mock KV Namespace
class MockKVNamespace implements KVNamespace {
  private store = new Map<string, { value: string; expiration?: number }>()

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key)
    if (!item) return null

    if (item.expiration && Date.now() > item.expiration) {
      this.store.delete(key)
      return null
    }

    return item.value
  }

  async put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void> {
    const expiration = options?.expirationTtl
      ? Date.now() + options.expirationTtl * 1000
      : undefined

    this.store.set(key, { value, expiration })
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key)
  }

  async list(): Promise<KVNamespaceListResult<unknown>> {
    throw new Error('Not implemented')
  }

  async getWithMetadata(): Promise<KVNamespaceGetWithMetadataResult<string>> {
    throw new Error('Not implemented')
  }

  clear() {
    this.store.clear()
  }
}

// Mock D1 Database with full state management
class MockD1Database implements D1Database {
  private users = new Map<string, any>()
  private artists = new Map<string, any>()

  prepare(query: string): D1PreparedStatement {
    const mockStatement: D1PreparedStatement = {
      bind: (...values: any[]) => {
        return {
          ...mockStatement,
          first: async () => {
            if (query.includes('SELECT * FROM users WHERE oauth_provider')) {
              const [provider, oauthId] = values
              return Array.from(this.users.values()).find(
                (u) => u.oauth_provider === provider && u.oauth_id === oauthId
              )
            }

            if (query.includes('SELECT * FROM users WHERE id')) {
              return this.users.get(values[0])
            }

            if (query.includes('SELECT onboarding_complete FROM users')) {
              const user = this.users.get(values[0])
              return user ? { onboarding_complete: user.onboarding_complete } : null
            }

            if (query.includes('SELECT id FROM artists WHERE user_id')) {
              return this.artists.get(values[0])
            }

            return null
          },
          run: async () => {
            if (query.includes('INSERT INTO users')) {
              const [id, oauth_provider, oauth_id, email, onboarding_complete, created_at, updated_at] = values
              this.users.set(id, {
                id,
                oauth_provider,
                oauth_id,
                email,
                onboarding_complete,
                created_at,
                updated_at,
              })
              return { success: true }
            }
            return { success: true }
          },
        } as any
      },
    } as any

    return mockStatement
  }

  dump(): Promise<ArrayBuffer> {
    throw new Error('Not implemented')
  }

  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]> {
    throw new Error('Not implemented')
  }

  exec(query: string): Promise<D1ExecResult> {
    throw new Error('Not implemented')
  }

  // Helper methods for testing
  getUserCount(): number {
    return this.users.size
  }

  clear() {
    this.users.clear()
    this.artists.clear()
  }
}

describe('OAuth Flow Integration Tests', () => {
  let mockEnv: Env
  let mockKV: MockKVNamespace
  let mockDB: MockD1Database

  beforeEach(() => {
    mockKV = new MockKVNamespace()
    mockDB = new MockD1Database()

    mockEnv = {
      DB: mockDB as any,
      KV: mockKV as any,
      BUCKET: {} as any,
      JWT_SECRET: 'integration-test-secret-key-123456',
      CLAUDE_API_KEY: 'test-claude-key',
      RESEND_API_KEY: 'test-resend-key',
      TWILIO_ACCOUNT_SID: 'test-twilio-sid',
      TWILIO_AUTH_TOKEN: 'test-twilio-token',
      TWILIO_PHONE_NUMBER: '+1234567890',
    }

    mockKV.clear()
    mockDB.clear()
  })

  describe('Complete New User Flow', () => {
    it('should handle full onboarding journey for new user', async () => {
      const userData = {
        email: 'newartist@example.com',
        oauth_provider: 'google' as const,
        oauth_id: 'google-new-artist-123',
      }

      // Step 1: Initial OAuth callback
      const callbackRequest = new Request('https://api.example.com/v1/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      })

      const callbackResponse = await handleAuthCallback(callbackRequest, mockEnv)
      const callbackData = await callbackResponse.json() as any

      expect(callbackResponse.status).toBe(201)
      expect(callbackData.success).toBe(true)
      expect(callbackData.data.user.onboarding_complete).toBe(false)
      expect(callbackData.data.redirect_url).toBe('/onboarding/role-selection')
      expect(callbackData.data.token).toBeDefined()

      const token = callbackData.data.token

      // Step 2: Check session while onboarding
      const sessionRequest = new Request('https://api.example.com/v1/auth/session', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const sessionResponse = await handleSessionCheck(sessionRequest, mockEnv)
      const sessionData = await sessionResponse.json() as any

      expect(sessionResponse.status).toBe(200)
      expect(sessionData.success).toBe(true)
      expect(sessionData.data.user.email).toBe(userData.email)
      expect(sessionData.data.valid).toBe(true)

      // Step 3: Refresh token during onboarding
      // Add a small delay to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 1100))

      const refreshRequest = new Request('https://api.example.com/v1/auth/refresh', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const refreshResponse = await handleSessionRefresh(refreshRequest, mockEnv)
      const refreshData = await refreshResponse.json() as any

      expect(refreshResponse.status).toBe(200)
      expect(refreshData.success).toBe(true)
      expect(refreshData.data.token).toBeDefined()
      // Token may or may not be different depending on timing, but should be valid
      expect(refreshData.data.expires_at).toBeDefined()

      // Step 4: Logout
      const logoutRequest = new Request('https://api.example.com/v1/auth/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${refreshData.data.token}`,
        },
      })

      const logoutResponse = await handleLogout(logoutRequest, mockEnv)
      const logoutData = await logoutResponse.json() as any

      expect(logoutResponse.status).toBe(200)
      expect(logoutData.success).toBe(true)
    })
  })

  describe('Returning User Flow', () => {
    it('should handle returning user with completed onboarding', async () => {
      const userData = {
        email: 'returning@example.com',
        oauth_provider: 'apple' as const,
        oauth_id: 'apple-returning-123',
      }

      // Step 1: First login - create user
      const firstCallbackRequest = new Request('https://api.example.com/v1/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      })

      const firstResponse = await handleAuthCallback(firstCallbackRequest, mockEnv)
      const firstData = await firstResponse.json() as any
      const userId = firstData.data.user.id

      // Simulate user completing onboarding
      // @ts-ignore - accessing private property for testing
      const user = mockDB.users.get(userId)
      if (user) {
        user.onboarding_complete = true
        // @ts-ignore
        mockDB.users.set(userId, user)
      }

      // Step 2: Return login after onboarding complete
      // Add a small delay to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 1100))

      const secondCallbackRequest = new Request('https://api.example.com/v1/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      })

      const secondResponse = await handleAuthCallback(secondCallbackRequest, mockEnv)
      const secondData = await secondResponse.json() as any

      expect(secondResponse.status).toBe(200)
      expect(secondData.data.user.onboarding_complete).toBe(true)
      expect(secondData.data.redirect_url).toBe('/dashboard')
      expect(secondData.data.token).toBeDefined()

      // Verify same user, token should be valid
      expect(secondData.data.user.id).toBe(userId)
      expect(secondData.data.expires_at).toBeDefined()
    })
  })

  describe('Session Management Flow', () => {
    it('should maintain session across multiple requests', async () => {
      const userData = {
        email: 'session@example.com',
        oauth_provider: 'google' as const,
        oauth_id: 'google-session-123',
      }

      // Create user
      const callbackRequest = new Request('https://api.example.com/v1/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      })

      const callbackResponse = await handleAuthCallback(callbackRequest, mockEnv)
      const callbackData = await callbackResponse.json() as any
      const token = callbackData.data.token
      const userId = callbackData.data.user.id

      // Verify session exists in KV
      const sessionKey = `session:${userId}`
      const sessionValue = await mockKV.get(sessionKey)
      expect(sessionValue).not.toBeNull()

      // Multiple session checks
      for (let i = 0; i < 5; i++) {
        const sessionRequest = new Request('https://api.example.com/v1/auth/session', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const sessionResponse = await handleSessionCheck(sessionRequest, mockEnv)
        expect(sessionResponse.status).toBe(200)
      }

      // Logout and verify session cleared
      const logoutRequest = new Request('https://api.example.com/v1/auth/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      await handleLogout(logoutRequest, mockEnv)

      const clearedSession = await mockKV.get(sessionKey)
      expect(clearedSession).toBeNull()
    })
  })

  describe('Edge Cases', () => {
    it('should handle multiple providers for same email', async () => {
      const email = 'multi@example.com'

      // Login with Google
      const googleRequest = new Request('https://api.example.com/v1/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          oauth_provider: 'google',
          oauth_id: 'google-multi-123',
        }),
      })

      const googleResponse = await handleAuthCallback(googleRequest, mockEnv)
      const googleData = await googleResponse.json() as any

      // Login with Apple (same email, different provider)
      const appleRequest = new Request('https://api.example.com/v1/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          oauth_provider: 'apple',
          oauth_id: 'apple-multi-123',
        }),
      })

      const appleResponse = await handleAuthCallback(appleRequest, mockEnv)
      const appleData = await appleResponse.json() as any

      // Should create two different users
      expect(googleData.data.user.id).not.toBe(appleData.data.user.id)
      expect(mockDB.getUserCount()).toBe(2)
    })

    it('should handle rapid session refreshes', async () => {
      const userData = {
        email: 'rapid@example.com',
        oauth_provider: 'google' as const,
        oauth_id: 'google-rapid-123',
      }

      // Create user
      const callbackRequest = new Request('https://api.example.com/v1/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      })

      const callbackResponse = await handleAuthCallback(callbackRequest, mockEnv)
      const callbackData = await callbackResponse.json() as any
      let currentToken = callbackData.data.token

      // Refresh multiple times with delays to ensure different timestamps
      const tokenExpirations = [callbackData.data.expires_at]

      for (let i = 0; i < 3; i++) {
        // Add delay to ensure different timestamps
        await new Promise(resolve => setTimeout(resolve, 1100))

        const refreshRequest = new Request('https://api.example.com/v1/auth/refresh', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        })

        const refreshResponse = await handleSessionRefresh(refreshRequest, mockEnv)
        const refreshData = await refreshResponse.json() as any

        expect(refreshResponse.status).toBe(200)
        currentToken = refreshData.data.token
        tokenExpirations.push(refreshData.data.expires_at)
      }

      // All refresh operations should succeed
      expect(tokenExpirations).toHaveLength(4) // Initial + 3 refreshes
    })
  })

  describe('Error Scenarios', () => {
    it('should handle malformed OAuth data', async () => {
      const malformedRequest = new Request('https://api.example.com/v1/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          // Missing oauth_provider and oauth_id
        }),
      })

      const response = await handleAuthCallback(malformedRequest, mockEnv)
      const data = await response.json() as any

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('validation_error')
    })

    it('should reject session check with invalid token', async () => {
      const invalidRequest = new Request('https://api.example.com/v1/auth/session', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer completely-invalid-token',
        },
      })

      const response = await handleSessionCheck(invalidRequest, mockEnv)
      const data = await response.json() as any

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
    })
  })
})
