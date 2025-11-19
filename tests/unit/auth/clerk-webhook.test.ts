/**
 * Unit Tests for Clerk Webhook Handler
 * Tests for user.created, user.updated, user.deleted, and session.created events
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { handleClerkWebhook } from '../../../api/routes/auth'
import type { Env } from '../../../api/index'

// Mock Svix Webhook with proper constructor
vi.mock('svix', () => {
  class MockWebhook {
    verify(payload: string) {
      // Mock successful verification by default
      return JSON.parse(payload)
    }
  }

  return {
    Webhook: MockWebhook,
  }
})

// Mock D1 Database
class MockD1Database implements D1Database {
  private users = new Map<string, any>()

  prepare(query: string): D1PreparedStatement {
    const mockStatement: D1PreparedStatement = {
      bind: (...values: any[]) => {
        return {
          ...mockStatement,
          first: async () => {
            // Handle SELECT queries
            if (query.includes('SELECT * FROM users WHERE clerk_id')) {
              const [clerkId] = values
              return Array.from(this.users.values()).find((u) => u.clerk_id === clerkId)
            }
            return null
          },
          run: async () => {
            // Handle INSERT queries
            if (query.includes('INSERT INTO users')) {
              const [id, clerk_id, oauth_provider, oauth_id, email, onboarding_complete, created_at, updated_at] = values
              this.users.set(id, {
                id,
                clerk_id,
                oauth_provider,
                oauth_id,
                email,
                onboarding_complete,
                created_at,
                updated_at,
              })
              return { success: true, meta: { changes: 1 } }
            }

            // Handle UPDATE queries
            if (query.includes('UPDATE users SET email')) {
              const [email, updated_at, clerk_id] = values
              const user = Array.from(this.users.values()).find((u) => u.clerk_id === clerk_id)
              if (user) {
                user.email = email
                user.updated_at = updated_at
                return { success: true, meta: { changes: 1 } }
              }
              return { success: false, meta: { changes: 0 } }
            }

            // Handle DELETE queries
            if (query.includes('DELETE FROM users WHERE clerk_id')) {
              const [clerk_id] = values
              const user = Array.from(this.users.values()).find((u) => u.clerk_id === clerk_id)
              if (user) {
                this.users.delete(user.id)
                return { success: true, meta: { changes: 1 } }
              }
              return { success: false, meta: { changes: 0 } }
            }

            return { success: true, meta: { changes: 0 } }
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

  // Test helper
  clear() {
    this.users.clear()
  }
}

describe('Clerk Webhook Handler', () => {
  let mockEnv: Env
  let mockDB: MockD1Database

  beforeEach(() => {
    mockDB = new MockD1Database()

    mockEnv = {
      DB: mockDB as any,
      KV: {} as any,
      BUCKET: {} as any,
      JWT_SECRET: 'test-jwt-secret-123456',
      CLERK_SECRET_KEY: 'sk_test_12345',
      CLERK_PUBLISHABLE_KEY: 'pk_test_12345',
      CLERK_WEBHOOK_SECRET: 'whsec_test_12345',
      CLAUDE_API_KEY: 'test-claude-key',
      RESEND_API_KEY: 'test-resend-key',
      TWILIO_ACCOUNT_SID: 'test-twilio-sid',
      TWILIO_AUTH_TOKEN: 'test-twilio-token',
      TWILIO_PHONE_NUMBER: '+1234567890',
    }

    mockDB.clear()
    vi.clearAllMocks()
  })

  describe('handleClerkWebhook - user.created', () => {
    it('should create new user on user.created event', async () => {
      const webhookPayload = {
        type: 'user.created',
        data: {
          id: 'user_clerkid123',
          email_addresses: [
            {
              id: 'email_123',
              email_address: 'newuser@example.com',
            },
          ],
          external_accounts: [
            {
              provider: 'oauth_google',
              id: 'google_123',
            },
          ],
        },
      }

      const request = new Request('https://api.example.com/v1/auth/webhook', {
        method: 'POST',
        headers: {
          'svix-id': 'msg_123',
          'svix-timestamp': '1234567890',
          'svix-signature': 'v1,signature',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload),
      })

      const response = await handleClerkWebhook(request, mockEnv)
      const data = (await response.json()) as any

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.message).toBe('User created successfully')
      expect(data.data.userId).toBeDefined()
    })

    it('should handle duplicate user creation gracefully', async () => {
      const clerkId = 'user_duplicate123'

      // Pre-create user
      await mockDB
        .prepare(
          'INSERT INTO users (id, clerk_id, oauth_provider, oauth_id, email, onboarding_complete, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        )
        .bind(
          'existing-user-id',
          clerkId,
          'google',
          'google_123',
          'existing@example.com',
          0,
          new Date().toISOString(),
          new Date().toISOString()
        )
        .run()

      const webhookPayload = {
        type: 'user.created',
        data: {
          id: clerkId,
          email_addresses: [
            {
              id: 'email_123',
              email_address: 'existing@example.com',
            },
          ],
          external_accounts: [
            {
              provider: 'oauth_google',
              id: 'google_123',
            },
          ],
        },
      }

      const request = new Request('https://api.example.com/v1/auth/webhook', {
        method: 'POST',
        headers: {
          'svix-id': 'msg_456',
          'svix-timestamp': '1234567890',
          'svix-signature': 'v1,signature',
        },
        body: JSON.stringify(webhookPayload),
      })

      const response = await handleClerkWebhook(request, mockEnv)
      const data = (await response.json()) as any

      expect(response.status).toBe(200)
      expect(data.data.message).toBe('User already exists')
    })
  })

  describe('handleClerkWebhook - user.updated', () => {
    it('should update user email on user.updated event', async () => {
      const clerkId = 'user_update123'

      // Pre-create user
      await mockDB
        .prepare(
          'INSERT INTO users (id, clerk_id, oauth_provider, oauth_id, email, onboarding_complete, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        )
        .bind(
          'user-id-123',
          clerkId,
          'google',
          'google_123',
          'old@example.com',
          0,
          new Date().toISOString(),
          new Date().toISOString()
        )
        .run()

      const webhookPayload = {
        type: 'user.updated',
        data: {
          id: clerkId,
          email_addresses: [
            {
              id: 'email_123',
              email_address: 'new@example.com',
            },
          ],
        },
      }

      const request = new Request('https://api.example.com/v1/auth/webhook', {
        method: 'POST',
        headers: {
          'svix-id': 'msg_789',
          'svix-timestamp': '1234567890',
          'svix-signature': 'v1,signature',
        },
        body: JSON.stringify(webhookPayload),
      })

      const response = await handleClerkWebhook(request, mockEnv)
      const data = (await response.json()) as any

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.message).toBe('User updated successfully')
    })

    it('should return 404 for non-existent user update', async () => {
      const webhookPayload = {
        type: 'user.updated',
        data: {
          id: 'user_nonexistent',
          email_addresses: [
            {
              id: 'email_123',
              email_address: 'new@example.com',
            },
          ],
        },
      }

      const request = new Request('https://api.example.com/v1/auth/webhook', {
        method: 'POST',
        headers: {
          'svix-id': 'msg_999',
          'svix-timestamp': '1234567890',
          'svix-signature': 'v1,signature',
        },
        body: JSON.stringify(webhookPayload),
      })

      const response = await handleClerkWebhook(request, mockEnv)
      const data = (await response.json()) as any

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('user_not_found')
    })
  })

  describe('handleClerkWebhook - user.deleted', () => {
    it('should delete user on user.deleted event', async () => {
      const clerkId = 'user_delete123'

      // Pre-create user
      await mockDB
        .prepare(
          'INSERT INTO users (id, clerk_id, oauth_provider, oauth_id, email, onboarding_complete, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        )
        .bind(
          'user-id-delete',
          clerkId,
          'google',
          'google_123',
          'delete@example.com',
          0,
          new Date().toISOString(),
          new Date().toISOString()
        )
        .run()

      const webhookPayload = {
        type: 'user.deleted',
        data: {
          id: clerkId,
        },
      }

      const request = new Request('https://api.example.com/v1/auth/webhook', {
        method: 'POST',
        headers: {
          'svix-id': 'msg_delete',
          'svix-timestamp': '1234567890',
          'svix-signature': 'v1,signature',
        },
        body: JSON.stringify(webhookPayload),
      })

      const response = await handleClerkWebhook(request, mockEnv)
      const data = (await response.json()) as any

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.message).toBe('User deleted successfully')
    })
  })

  describe('handleClerkWebhook - session.created', () => {
    it('should log session creation event', async () => {
      const webhookPayload = {
        type: 'session.created',
        data: {
          user_id: 'user_session123',
          id: 'session_123',
        },
      }

      const request = new Request('https://api.example.com/v1/auth/webhook', {
        method: 'POST',
        headers: {
          'svix-id': 'msg_session',
          'svix-timestamp': '1234567890',
          'svix-signature': 'v1,signature',
        },
        body: JSON.stringify(webhookPayload),
      })

      const response = await handleClerkWebhook(request, mockEnv)
      const data = (await response.json()) as any

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.message).toBe('Session logged successfully')
    })
  })

  describe('handleClerkWebhook - validation', () => {
    it('should return 400 for missing webhook headers', async () => {
      const request = new Request('https://api.example.com/v1/auth/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'user.created', data: {} }),
      })

      const response = await handleClerkWebhook(request, mockEnv)
      const data = (await response.json()) as any

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('validation_error')
    })

    it('should return 500 for missing webhook secret', async () => {
      const envWithoutSecret = {
        ...mockEnv,
        CLERK_WEBHOOK_SECRET: undefined as any,
      }

      const request = new Request('https://api.example.com/v1/auth/webhook', {
        method: 'POST',
        headers: {
          'svix-id': 'msg_123',
          'svix-timestamp': '1234567890',
          'svix-signature': 'v1,signature',
        },
        body: JSON.stringify({ type: 'user.created', data: {} }),
      })

      const response = await handleClerkWebhook(request, envWithoutSecret)
      const data = (await response.json()) as any

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('configuration_error')
    })

    it('should handle unrecognized webhook events gracefully', async () => {
      const webhookPayload = {
        type: 'unknown.event',
        data: {},
      }

      const request = new Request('https://api.example.com/v1/auth/webhook', {
        method: 'POST',
        headers: {
          'svix-id': 'msg_unknown',
          'svix-timestamp': '1234567890',
          'svix-signature': 'v1,signature',
        },
        body: JSON.stringify(webhookPayload),
      })

      const response = await handleClerkWebhook(request, mockEnv)
      const data = (await response.json()) as any

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.message).toBe('Event received but not processed')
    })
  })
})
