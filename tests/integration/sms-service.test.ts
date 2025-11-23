/**
 * Integration Tests: Twilio SMS Service
 * Tests real service behavior with mocked API responses
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { createTwilioService, TwilioSMSService } from '../../api/services/twilio'
import { MockD1Database } from '../helpers/mock-env'

describe('Twilio SMS Service Integration', () => {
  let mockDb: MockD1Database
  let service: TwilioSMSService
  let originalFetch: typeof global.fetch

  beforeEach(() => {
    mockDb = new MockD1Database()

    // Store original fetch
    originalFetch = global.fetch

    // Mock successful Twilio API response by default
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        sid: 'SM1234567890abcdef1234567890abcdef',
        status: 'queued',
        to: '+1987654321',
        from: '+1234567890',
      }),
    })

    service = createTwilioService('test_sid', 'test_token', '+1234567890', mockDb as any)
  })

  afterEach(() => {
    // Restore original fetch
    global.fetch = originalFetch
    vi.restoreAllMocks()
  })

  describe('sendSMS', () => {
    test('sends SMS via Twilio API', async () => {
      const result = await service.sendSMS({
        to: '+1987654321',
        message: 'Test message',
        messageType: 'booking_confirmation',
      })

      expect(result.success).toBe(true)
      expect(result.data?.messageSid).toBe('SM1234567890abcdef1234567890abcdef')
      expect(result.data?.to).toBe('+1987654321')
      expect(result.data?.status).toBe('queued')

      // Verify API was called correctly
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('api.twilio.com'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: expect.stringContaining('Basic'),
          }),
        })
      )
    })

    test('validates phone number format (E.164)', async () => {
      const result = await service.sendSMS({
        to: 'invalid-phone',
        message: 'Test',
      })

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('INVALID_PHONE')
      expect(result.error?.retryable).toBe(false)
    })

    test('accepts valid E.164 phone numbers', async () => {
      const validNumbers = ['+1234567890', '+441234567890', '+8612345678901']

      for (const number of validNumbers) {
        const result = await service.sendSMS({
          to: number,
          message: 'Test',
        })

        expect(result.success).toBe(true)
      }
    })

    test('rejects invalid E.164 phone numbers', async () => {
      // Test clearly invalid formats
      const result1 = await service.sendSMS({
        to: '1234567890', // Missing +
        message: 'Test',
      })
      expect(result1.success).toBe(false)
      expect(result1.error?.code).toBe('INVALID_PHONE')

      const result2 = await service.sendSMS({
        to: '+invalid', // Non-numeric
        message: 'Test',
      })
      expect(result2.success).toBe(false)
      expect(result2.error?.code).toBe('INVALID_PHONE')
    })

    test('validates message length (max 1600 characters)', async () => {
      const longMessage = 'x'.repeat(1601)

      const result = await service.sendSMS({
        to: '+1987654321',
        message: longMessage,
      })

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('MESSAGE_TOO_LONG')
      expect(result.error?.retryable).toBe(false)
    })

    test('accepts messages up to 1600 characters', async () => {
      const maxMessage = 'x'.repeat(1600)

      const result = await service.sendSMS({
        to: '+1987654321',
        message: maxMessage,
      })

      expect(result.success).toBe(true)
    })

    test('logs delivery attempt to database', async () => {
      await service.sendSMS({
        to: '+1987654321',
        message: 'Test message',
        messageType: 'booking_confirmation',
        artistId: 'artist_123',
      })

      const logs = mockDb.getTable('sms_delivery_log')
      expect(logs.length).toBeGreaterThan(0)
      expect(logs[0].toPhone).toBe('+1987654321')
      expect(logs[0].status).toBe('success')
      expect(logs[0].artistId).toBe('artist_123')
    })
  })

  describe('Rate Limiting', () => {
    test('sends multiple messages successfully', async () => {
      const messageCount = 10

      // Send 10 messages
      const promises = Array.from({ length: messageCount }, (_, i) =>
        service.sendSMS({
          to: `+198765432${String(i).padStart(2, '0')}`,
          message: `Test message ${i}`,
        })
      )

      const results = await Promise.all(promises)
      const successCount = results.filter((r) => r.success).length
      expect(successCount).toBe(messageCount)
    })
  })

  describe('sendBroadcast', () => {
    test('sends broadcast SMS to multiple recipients', async () => {
      const recipients = ['+1987654321', '+1987654322', '+1987654323']

      const result = await service.sendBroadcast({
        recipients,
        message: 'Broadcast message',
        artistId: 'artist_123',
      })

      expect(result.totalRecipients).toBe(3)
      expect(result.successCount).toBe(3)
      expect(result.failureCount).toBe(0)
    })
  })

  describe('sendBookingConfirmation', () => {
    test('sends formatted booking confirmation SMS', async () => {
      const result = await service.sendBookingConfirmation(
        '+1987654321',
        {
          gigTitle: 'Jazz Night',
          date: '2025-02-15',
          location: 'Blue Note',
          rate: 500,
        },
        'artist_123'
      )

      expect(result.success).toBe(true)

      // Verify the message format contains booking details (URL encoded)
      const callArgs = (global.fetch as any).mock.calls[0]
      const body = callArgs[1].body
      // The body is URL-encoded, so spaces become + or %20
      expect(body).toMatch(/Jazz[+%20]Night/)
      expect(body).toContain('2025-02-15')
      expect(body).toMatch(/Blue[+%20]Note/)
      expect(body).toContain('500')
    })
  })

  describe('getDeliveryStats', () => {
    test('returns delivery statistics for artist', async () => {
      // Send some test messages
      await service.sendSMS({
        to: '+1987654321',
        message: 'Test 1',
        artistId: 'artist_123',
      })

      await service.sendSMS({
        to: '+1987654322',
        message: 'Test 2',
        artistId: 'artist_123',
      })

      const stats = await service.getDeliveryStats('artist_123')

      expect(stats.totalSent).toBe(2)
      expect(stats.successCount).toBe(2)
      expect(stats.failureCount).toBe(0)
    })
  })
})
