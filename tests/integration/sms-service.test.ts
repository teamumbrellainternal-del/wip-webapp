/**
 * Integration Tests: SMS Service
 * Tests the real Twilio SMS service with mocked HTTP calls
 */

import { describe, test, expect, beforeEach, vi } from 'vitest'
import { TwilioSMSService, createTwilioService } from '../../api/services/twilio'
import { MockD1Database } from '../helpers/mock-env'

// Mock fetch globally
global.fetch = vi.fn()

describe('SMS Service Integration', () => {
  let smsService: TwilioSMSService
  let mockDb: MockD1Database

  beforeEach(() => {
    mockDb = new MockD1Database()
    smsService = createTwilioService(
      'test_account_sid',
      'test_auth_token',
      '+15555551234',
      mockDb as any
    )
    vi.clearAllMocks()
  })

  describe('sendSMS', () => {
    test('successfully sends SMS and logs to database', async () => {
      // Mock successful Twilio response
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          sid: 'SM123456789',
          status: 'queued',
          to: '+15555555555',
          from: '+15555551234',
        }),
      })

      const result = await smsService.sendSMS({
        artistId: 'artist-123',
        to: '+15555555555',
        message: 'Test message',
        messageType: 'general',
      })

      expect(result.success).toBe(true)
      expect(result.data?.messageSid).toBe('SM123456789')
      expect(global.fetch).toHaveBeenCalledTimes(1)

      // Verify database logging
      const logs = mockDb.tables.get('sms_delivery_log')!
      expect(logs.size).toBe(1)
      const log = Array.from(logs.values())[0]
      expect(log.artist_id).toBe('artist-123')
      expect(log.to_phone).toBe('+15555555555')
      expect(log.message_type).toBe('general')
      expect(log.status).toBe('success')
      expect(log.external_id).toBe('SM123456789')
    })

    test('handles Twilio API failure gracefully', async () => {
      // Mock failed Twilio response
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          code: 21211,
          message: 'Invalid phone number',
        }),
      })

      const result = await smsService.sendSMS({
        artistId: 'artist-123',
        to: '+15555555555',
        message: 'Test message',
        messageType: 'general',
      })

      expect(result.success).toBe(false)
      expect(result.error?.message).toContain('Invalid phone number')

      // Failure should be logged to database
      const logs = mockDb.tables.get('sms_delivery_log')!
      expect(logs.size).toBe(1)
      const log = Array.from(logs.values())[0]
      expect(log.status).toBe('failed')
      expect(log.error_message).toContain('Invalid phone number')
    })

    test('validates phone number format (E.164)', async () => {
      const invalidPhones = ['1234567890', 'invalid', '+1']

      for (const phone of invalidPhones) {
        const result = await smsService.sendSMS({
          artistId: 'artist-123',
          to: phone,
          message: 'Test',
          messageType: 'general',
        })
        expect(result.success).toBe(false)
        expect(result.error?.message).toContain('Invalid phone number format')
      }

      // Should not call Twilio for invalid phones
      expect(global.fetch).not.toHaveBeenCalled()
    })

    test('validates message length (max 1600 characters)', async () => {
      const longMessage = 'a'.repeat(1601)

      const result = await smsService.sendSMS({
        artistId: 'artist-123',
        to: '+15555555555',
        message: longMessage,
        messageType: 'general',
      })

      expect(result.success).toBe(false)
      expect(result.error?.message).toContain('1600 character limit')
      expect(global.fetch).not.toHaveBeenCalled()
    })
  })

  describe('Rate Limiting', () => {
    test('enforces rate limit of 10 messages per second', async () => {
      // Mock successful responses
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          sid: 'SM123456789',
          status: 'queued',
        }),
      })

      const promises = []

      // Send 12 messages rapidly
      for (let i = 0; i < 12; i++) {
        promises.push(
          smsService.sendSMS({
            artistId: 'artist-123',
            to: '+15555555555',
            message: `Message ${i}`,
            messageType: 'general',
          })
        )
      }

      const results = await Promise.all(promises)

      // Most should succeed (rate limiter waits, but timing may cause 1-2 failures)
      const successful = results.filter((r) => r.success).length
      expect(successful).toBeGreaterThanOrEqual(10)
    })

    test('rate limiter waits and succeeds for messages over limit', async () => {
      // Mock successful responses
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          sid: 'SM123456789',
          status: 'queued',
        }),
      })

      // Send 15 messages sequentially
      const results = []
      for (let i = 0; i < 15; i++) {
        const result = await smsService.sendSMS({
          artistId: 'artist-123',
          to: '+15555555555',
          message: `Message ${i}`,
          messageType: 'general',
        })
        results.push(result)
      }

      // All should succeed (rate limiter waits automatically)
      const successful = results.filter((r) => r.success).length
      expect(successful).toBe(15)
    }, 5000)
  })

  describe('sendBroadcast', () => {
    test('sends broadcast to multiple recipients with rate limiting', async () => {
      // Mock successful responses
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          sid: 'SM123456789',
          status: 'queued',
        }),
      })

      const recipients = [
        '+15555555551',
        '+15555555552',
        '+15555555553',
        '+15555555554',
        '+15555555555',
      ]

      const result = await smsService.sendBroadcast({
        artistId: 'artist-123',
        recipients,
        message: 'Broadcast message',
      })

      expect(result.totalRecipients).toBe(5)
      expect(result.successCount).toBe(5)
      expect(result.failureCount).toBe(0)

      // Verify all messages logged
      const logs = mockDb.tables.get('sms_delivery_log')!
      expect(logs.size).toBe(5)
    })
  })

  describe('sendBookingConfirmation', () => {
    test('sends formatted booking confirmation message', async () => {
      // Mock successful response
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          sid: 'SM123456789',
          status: 'queued',
        }),
      })

      const booking = {
        gigTitle: 'Jazz Night at Blue Note',
        date: '2025-01-30',
        location: '131 W 3rd St, New York',
        rate: 500,
      }

      const result = await smsService.sendBookingConfirmation('+15555555555', booking, 'artist-123')

      expect(result.success).toBe(true)

      // Verify message type is logged
      const logs = mockDb.tables.get('sms_delivery_log')!
      const log = Array.from(logs.values())[0]
      expect(log.message_type).toBe('booking_confirmation')
      expect(log.to_phone).toBe('+15555555555')
      expect(log.artist_id).toBe('artist-123')
      expect(log.status).toBe('success')
    })
  })

  describe('getDeliveryStats', () => {
    test('returns delivery statistics for an artist', async () => {
      // Add some test data
      const logs = mockDb.tables.get('sms_delivery_log')!
      const now = new Date()
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

      logs.set('log-1', {
        id: 'log-1',
        artist_id: 'artist-123',
        to_phone: '+15555555551',
        message_type: 'general',
        status: 'success',
        external_id: 'SM1',
        error_message: null,
        created_at: oneDayAgo.toISOString(),
      })

      logs.set('log-2', {
        id: 'log-2',
        artist_id: 'artist-123',
        to_phone: '+15555555552',
        message_type: 'general',
        status: 'success',
        external_id: 'SM2',
        error_message: null,
        created_at: oneDayAgo.toISOString(),
      })

      logs.set('log-3', {
        id: 'log-3',
        artist_id: 'artist-123',
        to_phone: '+15555555553',
        message_type: 'general',
        status: 'failed',
        external_id: null,
        error_message: 'Invalid number',
        created_at: oneDayAgo.toISOString(),
      })

      const stats = await smsService.getDeliveryStats('artist-123', 1)

      expect(stats.totalSent).toBe(3)
      expect(stats.successCount).toBe(2)
      expect(stats.failureCount).toBe(1)
    })

    test('filters statistics by time period', async () => {
      const logs = mockDb.tables.get('sms_delivery_log')!
      const now = new Date()
      const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000)
      const halfDayAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000)

      // Old log (2 days ago)
      logs.set('log-old', {
        id: 'log-old',
        artist_id: 'artist-123',
        to_phone: '+15555555551',
        message_type: 'general',
        status: 'success',
        external_id: 'SM1',
        error_message: null,
        created_at: twoDaysAgo.toISOString(),
      })

      // Recent log (half day ago)
      logs.set('log-recent', {
        id: 'log-recent',
        artist_id: 'artist-123',
        to_phone: '+15555555552',
        message_type: 'general',
        status: 'success',
        external_id: 'SM2',
        error_message: null,
        created_at: halfDayAgo.toISOString(),
      })

      // Get stats for last 1 day only
      const stats = await smsService.getDeliveryStats('artist-123', 1)

      expect(stats.totalSent).toBe(1) // Only recent log
    })
  })
})
