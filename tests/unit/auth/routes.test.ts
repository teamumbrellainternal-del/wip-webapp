/**
 * Unit Tests for Authentication Routes
 * Umbrella MVP - OAuth Flow Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { handleAuthCallback, handleSessionCheck, handleLogout, handleSessionRefresh } from '../../../api/routes/auth'
import { createJWT } from '../../../api/utils/jwt'
import type { Env } from '../../../api/index'

// Mock Clerk backend for token verification
vi.mock('@clerk/backend', () => ({
  verifyToken: vi.fn().mockImplementation(async (token: string) => {
    // Mock successful token verification
    // Parse the JWT to extract payload (simplified for testing)
    try {
      const parts = token.split('.')
      if (parts.length !== 3) {
        throw new Error('Invalid token format')
      }
      // Decode base64url payload
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
      const payload = JSON.parse(atob(base64))
      return payload
    } catch (_error) {
      throw new Error('Invalid token')
    }
  }),
}))

// Mock Clerk JWT verification (dynamic import)
vi.mock('@clerk/backend/jwt', () => ({
  verifyToken: vi.fn().mockImplementation(async (token: string) => {
    // Mock successful token verification
    // Parse the JWT to extract payload (simplified for testing)
    try {
      const parts = token.split('.')
      if (parts.length !== 3) {
        throw new Error('Invalid token format')
      }
      // Decode base64url payload
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
      const payload = JSON.parse(atob(base64))
      return payload
    } catch (_error) {
      throw new Error('Invalid token')
    }
  }),
}))

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

// Mock D1 Database
class MockD1Database implements D1Database {
  private users = new Map<string, any>()
  private artists = new Map<string, any>()

  prepare(query: string): D1PreparedStatement {
    const mockStatement: D1PreparedStatement = {
      bind: (...values: any[]) => {
        return {
          ...mockStatement,
          first: async () => {
            // Handle SELECT queries
            if (query.includes('SELECT * FROM users WHERE oauth_provider')) {
              const [provider, oauthId] = values
              return Array.from(this.users.values()).find(
                (u) => u.oauth_provider === provider && u.oauth_id === oauthId
              )
            }

            if (query.includes('SELECT * FROM users WHERE clerk_id')) {
              const [clerkId] = values
              return Array.from(this.users.values()).find(
                (u) => u.clerk_id === clerkId
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
            // Handle INSERT queries
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

  batch<T = unknown>(_statements: D1PreparedStatement[]): Promise<D1Result<T>[]> {
    throw new Error('Not implemented')
  }

  exec(_query: string): Promise<D1ExecResult> {
    throw new Error('Not implemented')
  }
}

describe('Authentication Routes', () => {
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
      JWT_SECRET: 'test-jwt-secret-123456',
      CLERK_SECRET_KEY: 'sk_test_12345',
      CLERK_PUBLISHABLE_KEY: 'pk_test_12345',
      CLAUDE_API_KEY: 'test-claude-key',
      RESEND_API_KEY: 'test-resend-key',
      TWILIO_ACCOUNT_SID: 'test-twilio-sid',
      TWILIO_AUTH_TOKEN: 'test-twilio-token',
      TWILIO_PHONE_NUMBER: '+1234567890',
    }

    mockKV.clear()
  })

  describe('handleAuthCallback', () => {
    it('should create new user and redirect to onboarding', async () => {
      const request = new Request('https://api.example.com/v1/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'newuser@example.com',
          oauth_provider: 'google',
          oauth_id: 'google-123',
        }),
      })

      const response = await handleAuthCallback(request, mockEnv)
      const data = await response.json() as any

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.user.email).toBe('newuser@example.com')
      expect(data.data.user.onboarding_complete).toBe(false)
      expect(data.data.redirect_url).toBe('/onboarding/role-selection')
      expect(data.data.token).toBeDefined()
    })

    it('should return existing user and check onboarding status', async () => {
      // Create existing user
      const userId = 'existing-user-123'
      const user = {
        id: userId,
        oauth_provider: 'google',
        oauth_id: 'google-existing',
        email: 'existing@example.com',
        onboarding_complete: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // @ts-ignore - accessing private property for testing
      mockDB.users.set(userId, user)

      const request = new Request('https://api.example.com/v1/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          oauth_provider: user.oauth_provider,
          oauth_id: user.oauth_id,
        }),
      })

      const response = await handleAuthCallback(request, mockEnv)
      const data = await response.json() as any

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.user.id).toBe(userId)
      expect(data.data.redirect_url).toBe('/dashboard')
    })

    it('should redirect to onboarding if user incomplete', async () => {
      // Create user with incomplete onboarding
      const userId = 'incomplete-user-123'
      const user = {
        id: userId,
        oauth_provider: 'apple',
        oauth_id: 'apple-incomplete',
        email: 'incomplete@example.com',
        onboarding_complete: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // @ts-ignore
      mockDB.users.set(userId, user)

      const request = new Request('https://api.example.com/v1/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          oauth_provider: user.oauth_provider,
          oauth_id: user.oauth_id,
        }),
      })

      const response = await handleAuthCallback(request, mockEnv)
      const data = await response.json() as any

      expect(response.status).toBe(200)
      expect(data.data.redirect_url).toBe('/onboarding/role-selection')
    })

    it('should redirect to step1 if artist profile exists but onboarding incomplete', async () => {
      // Create user with incomplete onboarding but with artist profile
      const userId = 'artist-incomplete-123'
      const user = {
        id: userId,
        oauth_provider: 'google',
        oauth_id: 'google-artist-incomplete',
        email: 'artist-incomplete@example.com',
        onboarding_complete: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // @ts-ignore
      mockDB.users.set(userId, user)
      // @ts-ignore
      mockDB.artists.set(userId, { id: 'artist-123', user_id: userId })

      const request = new Request('https://api.example.com/v1/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          oauth_provider: user.oauth_provider,
          oauth_id: user.oauth_id,
        }),
      })

      const response = await handleAuthCallback(request, mockEnv)
      const data = await response.json() as any

      expect(response.status).toBe(200)
      expect(data.data.redirect_url).toBe('/onboarding/artists/step1')
    })

    it('should return error for missing required fields', async () => {
      const request = new Request('https://api.example.com/v1/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          // Missing oauth_provider and oauth_id
        }),
      })

      const response = await handleAuthCallback(request, mockEnv)
      const data = await response.json() as any

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('validation_error')
    })
  })

  describe('handleSessionCheck', () => {
    it('should return user data for valid session', async () => {
      const userId = 'session-user-123'
      const clerkId = 'clerk_session_123'
      const user = {
        id: userId,
        clerk_id: clerkId,
        oauth_provider: 'google',
        oauth_id: 'google-session',
        email: 'session@example.com',
        onboarding_complete: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // @ts-ignore
      mockDB.users.set(userId, user)

      // Create session token with clerk_id as sub
      const token = await createJWT(
        {
          sub: clerkId,
          email: user.email,
          oauth_provider: user.oauth_provider,
          oauth_id: user.oauth_id,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 3600,
        },
        mockEnv.JWT_SECRET
      )

      const request = new Request('https://api.example.com/v1/auth/session', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const response = await handleSessionCheck(request, mockEnv)
      const data = await response.json() as any

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.user.id).toBe(userId)
      expect(data.data.user.clerk_user_id).toBe(clerkId)
      expect(data.data.session).toBeDefined()
      expect(data.data.session.expires_at).toBeDefined()
    })

    it('should return error for missing auth header', async () => {
      const request = new Request('https://api.example.com/v1/auth/session', {
        method: 'GET',
      })

      const response = await handleSessionCheck(request, mockEnv)
      const data = await response.json() as any

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
    })
  })

  describe('handleLogout', () => {
    it('should clear session and return success', async () => {
      const userId = 'logout-user-123'
      const clerkId = 'clerk_logout_123'
      const user = {
        id: userId,
        clerk_id: clerkId,
        oauth_provider: 'google',
        oauth_id: 'google-logout',
        email: 'logout@example.com',
        onboarding_complete: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // @ts-ignore
      mockDB.users.set(userId, user)

      // Set session in KV
      await mockKV.put(`session:${userId}`, JSON.stringify({ userId }))

      // Create auth token with clerk_id as sub
      const token = await createJWT(
        {
          sub: clerkId,
          email: user.email,
          oauth_provider: user.oauth_provider,
          oauth_id: user.oauth_id,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 3600,
        },
        mockEnv.JWT_SECRET
      )

      const request = new Request('https://api.example.com/v1/auth/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const response = await handleLogout(request, mockEnv)
      const data = await response.json() as any

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.message).toBe('Logged out successfully')

      // Verify session was deleted
      const sessionData = await mockKV.get(`session:${userId}`)
      expect(sessionData).toBeNull()
    })

    it('should return success even without auth (idempotent)', async () => {
      const request = new Request('https://api.example.com/v1/auth/logout', {
        method: 'POST',
      })

      const response = await handleLogout(request, mockEnv)
      const data = await response.json() as any

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })

  describe('handleSessionRefresh', () => {
    it('should refresh token and extend session', async () => {
      const userId = 'refresh-user-123'
      const clerkId = 'clerk_refresh_123'
      const user = {
        id: userId,
        clerk_id: clerkId,
        oauth_provider: 'google',
        oauth_id: 'google-refresh',
        email: 'refresh@example.com',
        onboarding_complete: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // @ts-ignore
      mockDB.users.set(userId, user)

      // Create expiring token with clerk_id as sub
      const oldToken = await createJWT(
        {
          sub: clerkId,
          email: user.email,
          oauth_provider: user.oauth_provider,
          oauth_id: user.oauth_id,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 3600,
        },
        mockEnv.JWT_SECRET
      )

      const request = new Request('https://api.example.com/v1/auth/refresh', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${oldToken}`,
        },
      })

      const response = await handleSessionRefresh(request, mockEnv)
      const data = await response.json() as any

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.token).toBeDefined()
      expect(data.data.token).not.toBe(oldToken)
      expect(data.data.expires_at).toBeDefined()
    })

    it('should return error for invalid token', async () => {
      const request = new Request('https://api.example.com/v1/auth/refresh', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer invalid-token',
        },
      })

      const response = await handleSessionRefresh(request, mockEnv)
      const data = await response.json() as any

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
    })
  })
})
