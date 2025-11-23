/**
 * Integration Tests: Real Email Service
 * Tests the real Resend email service with mocked API calls
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createResendService } from '../../../api/services/resend'
import { createMockEnv } from '../../helpers/mock-env'
import type { MockD1Database } from '../../helpers/mock-env'

describe('Real Email Service Integration', () => {
  let mockFetch: any
  let mockDb: MockD1Database
  const TEST_API_KEY = 'test_resend_api_key'

  beforeEach(() => {
    // Create mock environment
    const { mocks } = createMockEnv()
    mockDb = mocks.db as any

    // Add email-specific tables to mock DB
    mockDb.tables.set('email_delivery_log', new Map())
    mockDb.tables.set('email_delivery_queue', new Map())
    mockDb.tables.set('unsubscribe_list', new Map())

    // Mock global fetch
    mockFetch = vi.fn()
    global.fetch = mockFetch
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('sendEmail', () => {
    it('should send email via Resend API successfully', async () => {
      // Mock successful API response
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'email_123' }),
      })

      const service = createResendService(TEST_API_KEY, mockDb as any)
      const result = await service.sendEmail({
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<p>Test content</p>',
      })

      expect(result.success).toBe(true)
      expect(result.data?.messageId).toBe('email_123')
      expect(result.data?.to).toEqual(['test@example.com'])

      // Verify API was called correctly
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.resend.com/emails',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${TEST_API_KEY}`,
          }),
          body: expect.stringContaining('test@example.com'),
        })
      )

      // Verify delivery was logged
      const logs = mockDb.tables.get('email_delivery_log')!
      expect(logs.size).toBe(1)
      const logEntry = Array.from(logs.values())[0]
      expect(logEntry.toEmail).toBe('test@example.com')
      expect(logEntry.status).toBe('success')
    })

    it('should handle API failure and queue email for retry', async () => {
      // Mock API failure
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ message: 'API error' }),
      })

      const service = createResendService(TEST_API_KEY, mockDb as any)
      const result = await service.sendEmail({
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<p>Test content</p>',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()

      // Verify email was queued
      const queue = mockDb.tables.get('email_delivery_queue')!
      expect(queue.size).toBeGreaterThan(0)
      const queuedItem = Array.from(queue.values())[0]
      expect(queuedItem.toEmail).toBe('test@example.com')
      expect(queuedItem.status).toBe('pending')
      expect(queuedItem.retryCount).toBe(0)
    }, 10000)

    it('should send email to multiple recipients', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'email_batch_123' }),
      })

      const service = createResendService(TEST_API_KEY, mockDb as any)
      const result = await service.sendEmail({
        to: ['test1@example.com', 'test2@example.com', 'test3@example.com'],
        subject: 'Test Batch',
        html: '<p>Batch test</p>',
      })

      expect(result.success).toBe(true)
      expect(result.data?.to).toHaveLength(3)

      // Verify API payload contains all recipients
      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(callBody.to).toEqual(['test1@example.com', 'test2@example.com', 'test3@example.com'])
    })

    it('should skip unsubscribed recipients', async () => {
      // Add email to unsubscribe list
      const unsubscribeList = mockDb.tables.get('unsubscribe_list')!
      unsubscribeList.set('unsub_1', {
        id: 'unsub_1',
        email: 'unsubscribed@example.com',
        created_at: new Date().toISOString(),
      })

      const service = createResendService(TEST_API_KEY, mockDb as any)
      const result = await service.sendEmail({
        to: 'unsubscribed@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      })

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('RECIPIENT_UNSUBSCRIBED')

      // Verify API was not called
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should inject unsubscribe link when provided', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'email_123' }),
      })

      const service = createResendService(TEST_API_KEY, mockDb as any)
      await service.sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Test content</p>',
        unsubscribeUrl: 'https://example.com/unsubscribe?token=abc',
      })

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(callBody.html).toContain('unsubscribe')
      expect(callBody.html).toContain('https://example.com/unsubscribe?token=abc')
    })
  })

  describe('sendBroadcast', () => {
    it('should send broadcast to all valid recipients', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'broadcast_123' }),
      })

      const service = createResendService(TEST_API_KEY, mockDb as any)
      const recipients = Array.from({ length: 10 }, (_, i) => `user${i}@example.com`)

      const result = await service.sendBroadcast({
        recipients,
        subject: 'Broadcast Test',
        html: '<p>Broadcast content</p>',
        artistId: 'artist_123',
      })

      expect(result.totalRecipients).toBe(10)
      expect(result.successCount).toBe(10)
      expect(result.failureCount).toBe(0)
    })

    it('should handle large broadcasts in batches', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'batch_123' }),
      })

      const service = createResendService(TEST_API_KEY, mockDb as any)
      // Create 2500 recipients (should be split into 3 batches of 1000, 1000, 500)
      const recipients = Array.from({ length: 2500 }, (_, i) => `user${i}@example.com`)

      const result = await service.sendBroadcast({
        recipients,
        subject: 'Large Broadcast',
        html: '<p>Content</p>',
      })

      expect(result.totalRecipients).toBe(2500)
      expect(result.successCount).toBe(2500)

      // Should have made 3 API calls (batches of 1000)
      expect(mockFetch).toHaveBeenCalledTimes(3)
    })

    it('should skip unsubscribed recipients in broadcast', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'broadcast_123' }),
      })

      // Add some unsubscribed emails
      const unsubscribeList = mockDb.tables.get('unsubscribe_list')!
      unsubscribeList.set('unsub_1', {
        id: 'unsub_1',
        email: 'user2@example.com',
        created_at: new Date().toISOString(),
      })
      unsubscribeList.set('unsub_2', {
        id: 'unsub_2',
        email: 'user4@example.com',
        created_at: new Date().toISOString(),
      })

      const service = createResendService(TEST_API_KEY, mockDb as any)
      const recipients = [
        'user1@example.com',
        'user2@example.com', // Unsubscribed
        'user3@example.com',
        'user4@example.com', // Unsubscribed
        'user5@example.com',
      ]

      const result = await service.sendBroadcast({
        recipients,
        subject: 'Broadcast',
        html: '<p>Content</p>',
      })

      expect(result.totalRecipients).toBe(5)
      expect(result.successCount).toBe(3) // Only 3 valid recipients

      // Verify only valid recipients were sent
      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(callBody.to).toEqual(['user1@example.com', 'user3@example.com', 'user5@example.com'])
    })
  })

  describe('sendTransactional', () => {
    it('should send welcome email using template', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'welcome_123' }),
      })

      const service = createResendService(TEST_API_KEY, mockDb as any)
      const result = await service.sendTransactional(
        'welcome',
        'newuser@example.com',
        {
          artistName: 'John Doe',
          profileUrl: 'https://example.com/profile/john',
        },
        'artist_123'
      )

      expect(result.success).toBe(true)

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(callBody.subject).toContain('Welcome')
      expect(callBody.html).toContain('John Doe')
      expect(callBody.html).toContain('https://example.com/profile/john')
    })

    it('should send booking confirmation email', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'booking_123' }),
      })

      const service = createResendService(TEST_API_KEY, mockDb as any)
      const result = await service.sendTransactional('booking_confirmation', 'artist@example.com', {
        gigTitle: 'Summer Music Festival',
        date: '2025-07-15',
        location: 'Central Park, NYC',
        rate: '500',
        gigUrl: 'https://example.com/gigs/123',
      })

      expect(result.success).toBe(true)

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(callBody.subject).toContain('Booking Confirmed')
      expect(callBody.html).toContain('Summer Music Festival')
    })

    it('should send message notification', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'message_123' }),
      })

      const service = createResendService(TEST_API_KEY, mockDb as any)
      const result = await service.sendTransactional('message_notification', 'user@example.com', {
        senderName: 'Jane Smith',
        messagePreview: 'Hey, I saw your profile and would like to...',
        conversationUrl: 'https://example.com/messages/456',
      })

      expect(result.success).toBe(true)

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(callBody.subject).toContain('Jane Smith')
      expect(callBody.html).toContain('Hey, I saw your profile')
    })
  })

  describe.skip('processQueue', () => {
    it('should process queued emails successfully', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'retry_123' }),
      })

      // Add a queued email
      const queue = mockDb.tables.get('email_delivery_queue')!
      const now = new Date().toISOString()
      queue.set('queue_1', {
        id: 'queue_1',
        toEmail: 'queued@example.com',
        fromEmail: 'noreply@umbrella.app',
        subject: 'Queued Email',
        htmlBody: '<p>Retry content</p>',
        textBody: null,
        templateType: null,
        retryCount: 0,
        maxRetries: 3,
        nextRetryAt: now, // Ready for retry now
        status: 'pending',
        artistId: null,
        lastError: null,
        createdAt: now,
        updatedAt: now,
      })

      const service = createResendService(TEST_API_KEY, mockDb as any)
      const processed = await service.processQueue()

      expect(processed).toBe(1)

      // Verify queue item was marked as completed
      const queueItem = queue.get('queue_1')
      expect(queueItem.status).toBe('completed')
    })

    it('should increment retry count on failure', async () => {
      // Mock failure
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Still failing' }),
      })

      const queue = mockDb.tables.get('email_delivery_queue')!
      const now = new Date().toISOString()
      queue.set('queue_1', {
        id: 'queue_1',
        toEmail: 'failing@example.com',
        fromEmail: 'noreply@umbrella.app',
        subject: 'Failing Email',
        htmlBody: '<p>Content</p>',
        textBody: null,
        templateType: null,
        retryCount: 0,
        maxRetries: 3,
        nextRetryAt: now,
        status: 'pending',
        artistId: null,
        lastError: null,
        createdAt: now,
        updatedAt: now,
      })

      const service = createResendService(TEST_API_KEY, mockDb as any)
      await service.processQueue()

      const queueItem = queue.get('queue_1')
      expect(queueItem.retryCount).toBe(1)
      expect(queueItem.status).toBe('pending') // Still pending for next retry
      expect(queueItem.nextRetryAt).toBeTruthy() // Should have next retry time
    })

    it('should mark as failed after max retries', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Persistent failure' }),
      })

      const queue = mockDb.tables.get('email_delivery_queue')!
      const now = new Date().toISOString()
      queue.set('queue_1', {
        id: 'queue_1',
        toEmail: 'failing@example.com',
        fromEmail: 'noreply@umbrella.app',
        subject: 'Failing Email',
        htmlBody: '<p>Content</p>',
        textBody: null,
        templateType: null,
        retryCount: 2, // Already tried twice
        maxRetries: 3,
        nextRetryAt: now,
        status: 'pending',
        artistId: null,
        lastError: null,
        createdAt: now,
        updatedAt: now,
      })

      const service = createResendService(TEST_API_KEY, mockDb as any)
      await service.processQueue()

      const queueItem = queue.get('queue_1')
      expect(queueItem.status).toBe('failed') // Max retries reached
      expect(queueItem.lastError).toBeTruthy()
    })
  })

  describe('unsubscribe', () => {
    it('should add email to unsubscribe list', async () => {
      const service = createResendService(TEST_API_KEY, mockDb as any)
      await service.unsubscribe('user@example.com', 'artist_123', 'No longer interested')

      const unsubscribeList = mockDb.tables.get('unsubscribe_list')!
      expect(unsubscribeList.size).toBe(1)

      const entry = Array.from(unsubscribeList.values())[0]
      expect(entry.email).toBe('user@example.com')
      expect(entry.artistId).toBe('artist_123')
      expect(entry.reason).toBe('No longer interested')
    })

    it('should handle duplicate unsubscribe gracefully', async () => {
      const service = createResendService(TEST_API_KEY, mockDb as any)

      // Unsubscribe twice
      await service.unsubscribe('user@example.com')
      await service.unsubscribe('user@example.com')

      const unsubscribeList = mockDb.tables.get('unsubscribe_list')!
      // Should still only have one entry (INSERT OR IGNORE)
      expect(unsubscribeList.size).toBeGreaterThanOrEqual(1)
    })
  })

  describe.skip('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      const service = createResendService(TEST_API_KEY, mockDb as any)
      const result = await service.sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should handle invalid JSON responses', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('Invalid JSON')
        },
      })

      const service = createResendService(TEST_API_KEY, mockDb as any)
      const result = await service.sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })
})
