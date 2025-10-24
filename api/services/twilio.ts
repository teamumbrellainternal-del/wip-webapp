/**
 * Twilio SMS Service Wrapper
 * Handles SMS delivery, broadcasts, and rate limiting
 */

import { generateUUIDv4 } from '../utils/uuid'
import { withRetry, calculateNextRetryTime } from './retry-helper'
import {
  SMSParams,
  SMSResult,
  BroadcastSMSParams,
  BroadcastResult,
  SMSMessageType,
  ServiceResult,
  DEFAULT_RETRY_CONFIG,
  SMSQueueItem,
} from './types'

/**
 * Twilio API configuration
 */
const TWILIO_API_URL = 'https://api.twilio.com/2010-04-01/Accounts'
const SMS_RATE_LIMIT = 10 // 10 messages per second
const SMS_RATE_WINDOW_MS = 1000 // 1 second window

/**
 * Rate limiter for SMS sending
 */
class RateLimiter {
  private tokens: number
  private lastRefill: number
  private maxTokens: number
  private refillRate: number // tokens per millisecond

  constructor(maxPerSecond: number) {
    this.maxTokens = maxPerSecond
    this.tokens = maxPerSecond
    this.lastRefill = Date.now()
    this.refillRate = maxPerSecond / 1000 // Convert to per millisecond
  }

  /**
   * Wait until a token is available
   */
  async waitForToken(): Promise<void> {
    while (true) {
      this.refill()

      if (this.tokens >= 1) {
        this.tokens -= 1
        return
      }

      // Wait before checking again
      await this.sleep(50)
    }
  }

  /**
   * Refill tokens based on elapsed time
   */
  private refill(): void {
    const now = Date.now()
    const elapsed = now - this.lastRefill
    const tokensToAdd = elapsed * this.refillRate

    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd)
    this.lastRefill = now
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

/**
 * Twilio SMS service class
 */
export class TwilioSMSService {
  private accountSid: string
  private authToken: string
  private fromPhone: string
  private db: D1Database
  private rateLimiter: RateLimiter

  constructor(accountSid: string, authToken: string, fromPhone: string, db: D1Database) {
    this.accountSid = accountSid
    this.authToken = authToken
    this.fromPhone = fromPhone
    this.db = db
    this.rateLimiter = new RateLimiter(SMS_RATE_LIMIT)
  }

  /**
   * Send a single SMS with retry logic
   * @param params - SMS parameters
   * @returns Service result with SMS send result
   */
  async sendSMS(params: SMSParams): Promise<ServiceResult<SMSResult>> {
    // Validate phone number format (basic validation)
    if (!this.isValidPhoneNumber(params.to)) {
      return {
        success: false,
        error: {
          code: 'INVALID_PHONE',
          message: `Invalid phone number format: ${params.to}`,
          retryable: false,
        },
      }
    }

    // Validate message length (SMS limit is 1600 characters for concatenated messages)
    if (params.message.length > 1600) {
      return {
        success: false,
        error: {
          code: 'MESSAGE_TOO_LONG',
          message: `Message exceeds 1600 character limit (${params.message.length} characters)`,
          retryable: false,
        },
      }
    }

    // Wait for rate limit token
    await this.rateLimiter.waitForToken()

    // Prepare SMS payload for Twilio API
    const payload = new URLSearchParams({
      To: params.to,
      From: this.fromPhone,
      Body: params.message,
    })

    // Send with retry logic
    const result = await withRetry<SMSResult>(async () => {
      const url = `${TWILIO_API_URL}/${this.accountSid}/Messages.json`

      // Create Basic Auth header
      const authHeader = 'Basic ' + btoa(`${this.accountSid}:${this.authToken}`)

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: authHeader,
        },
        body: payload.toString(),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const error = new Error(
          errorData.message || `Twilio API error: ${response.status} ${response.statusText}`
        )
        ;(error as any).status = response.status
        throw error
      }

      const data = await response.json()

      return {
        messageSid: data.sid,
        to: params.to,
        status: data.status,
        timestamp: new Date().toISOString(),
      }
    })

    // Log the delivery attempt
    await this.logDelivery(
      params.to,
      params.messageType,
      result.success ? 'success' : 'failed',
      result.error?.message,
      result.data?.messageSid,
      params.artistId
    )

    // If failed and retryable, add to queue
    if (!result.success && result.error?.retryable) {
      await this.queueSMS(params)
    }

    return result
  }

  /**
   * Send broadcast SMS with rate limiting (10/sec)
   * @param params - Broadcast parameters
   * @returns Broadcast result with success/failure counts
   */
  async sendBroadcast(params: BroadcastSMSParams): Promise<BroadcastResult> {
    const result: BroadcastResult = {
      totalRecipients: params.recipients.length,
      successCount: 0,
      failureCount: 0,
      queuedCount: 0,
    }

    // Send to each recipient with rate limiting
    for (const phone of params.recipients) {
      const smsResult = await this.sendSMS({
        to: phone,
        message: params.message,
        messageType: 'broadcast',
        artistId: params.artistId,
      })

      if (smsResult.success) {
        result.successCount++
      } else {
        if (smsResult.error?.retryable) {
          result.queuedCount++
        } else {
          result.failureCount++
        }
      }
    }

    return result
  }

  /**
   * Send booking confirmation SMS
   * @param to - Recipient phone number
   * @param data - Booking data
   * @param artistId - Artist ID for tracking
   * @returns Service result
   */
  async sendBookingConfirmation(
    to: string,
    data: {
      gigTitle: string
      date: string
      location: string
      rate: number
    },
    artistId: string
  ): Promise<ServiceResult<SMSResult>> {
    const message = `Booking Confirmed: ${data.gigTitle} on ${data.date} at ${data.location}. Rate: $${data.rate}. Reply STOP to unsubscribe.`

    return this.sendSMS({
      to,
      message,
      messageType: 'booking_confirmation',
      artistId,
    })
  }

  /**
   * Queue failed SMS for retry
   * @param params - SMS parameters
   */
  private async queueSMS(params: SMSParams): Promise<void> {
    const id = generateUUIDv4()
    const now = new Date().toISOString()
    const nextRetryAt = calculateNextRetryTime(0, DEFAULT_RETRY_CONFIG)

    await this.db
      .prepare(
        `INSERT INTO sms_delivery_queue
        (id, to_phone, from_phone, message, message_type,
         retry_count, max_retries, next_retry_at, status, artist_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        params.to,
        this.fromPhone,
        params.message,
        params.messageType || null,
        0,
        DEFAULT_RETRY_CONFIG.maxRetries,
        nextRetryAt,
        'pending',
        params.artistId || null,
        now,
        now
      )
      .run()
  }

  /**
   * Process queued SMS messages (called by cron or background worker)
   * @returns Number of messages processed
   */
  async processQueue(): Promise<number> {
    const now = new Date().toISOString()

    // Fetch pending items ready for retry
    const result = await this.db
      .prepare(
        `SELECT * FROM sms_delivery_queue
         WHERE status = 'pending'
         AND (next_retry_at IS NULL OR next_retry_at <= ?)
         ORDER BY created_at ASC
         LIMIT 100`
      )
      .bind(now)
      .all<SMSQueueItem>()

    const items = result.results || []
    let processed = 0

    for (const item of items) {
      // Mark as processing
      await this.db
        .prepare('UPDATE sms_delivery_queue SET status = ?, updated_at = ? WHERE id = ?')
        .bind('processing', now, item.id)
        .run()

      // Attempt to send
      const sendResult = await this.sendSMS({
        to: item.toPhone,
        message: item.message,
        messageType: item.messageType as SMSMessageType | undefined,
        artistId: item.artistId || undefined,
      })

      if (sendResult.success) {
        // Mark as completed
        await this.db
          .prepare('UPDATE sms_delivery_queue SET status = ?, updated_at = ? WHERE id = ?')
          .bind('completed', now, item.id)
          .run()
        processed++
      } else {
        const newRetryCount = item.retryCount + 1

        if (newRetryCount >= item.maxRetries) {
          // Max retries reached, mark as failed
          await this.db
            .prepare(
              'UPDATE sms_delivery_queue SET status = ?, last_error = ?, updated_at = ? WHERE id = ?'
            )
            .bind('failed', sendResult.error?.message || 'Unknown error', now, item.id)
            .run()
        } else {
          // Schedule next retry
          const nextRetryAt = calculateNextRetryTime(newRetryCount, DEFAULT_RETRY_CONFIG)
          await this.db
            .prepare(
              `UPDATE sms_delivery_queue
               SET retry_count = ?, next_retry_at = ?, last_error = ?, status = ?, updated_at = ?
               WHERE id = ?`
            )
            .bind(
              newRetryCount,
              nextRetryAt,
              sendResult.error?.message || 'Unknown error',
              'pending',
              now,
              item.id
            )
            .run()
        }
      }
    }

    return processed
  }

  /**
   * Log SMS delivery attempt
   */
  private async logDelivery(
    to: string,
    messageType: SMSMessageType | undefined,
    status: 'success' | 'failed' | 'undelivered',
    errorMessage: string | undefined,
    externalId: string | undefined,
    artistId: string | undefined
  ): Promise<void> {
    const id = generateUUIDv4()
    const now = new Date().toISOString()

    await this.db
      .prepare(
        `INSERT INTO sms_delivery_log
        (id, to_phone, message_type, status, error_message, external_id, artist_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        to,
        messageType || null,
        status,
        errorMessage || null,
        externalId || null,
        artistId || null,
        now
      )
      .run()
  }

  /**
   * Validate phone number format (E.164 format: +1234567890)
   */
  private isValidPhoneNumber(phone: string): boolean {
    // Basic E.164 validation: starts with +, followed by 1-15 digits
    const e164Regex = /^\+[1-9]\d{1,14}$/
    return e164Regex.test(phone)
  }

  /**
   * Get delivery statistics for an artist
   * @param artistId - Artist ID
   * @param days - Number of days to look back (default: 30)
   * @returns Delivery statistics
   */
  async getDeliveryStats(
    artistId: string,
    days: number = 30
  ): Promise<{
    totalSent: number
    successCount: number
    failureCount: number
  }> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    const cutoffISO = cutoffDate.toISOString()

    const result = await this.db
      .prepare(
        `SELECT
          COUNT(*) as total_sent,
          SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success_count,
          SUM(CASE WHEN status IN ('failed', 'undelivered') THEN 1 ELSE 0 END) as failure_count
         FROM sms_delivery_log
         WHERE artist_id = ? AND created_at >= ?`
      )
      .bind(artistId, cutoffISO)
      .first<{ total_sent: number; success_count: number; failure_count: number }>()

    return {
      totalSent: result?.total_sent || 0,
      successCount: result?.success_count || 0,
      failureCount: result?.failure_count || 0,
    }
  }
}

/**
 * Factory function to create TwilioSMSService instance
 */
export function createTwilioService(
  accountSid: string,
  authToken: string,
  fromPhone: string,
  db: D1Database
): TwilioSMSService {
  return new TwilioSMSService(accountSid, authToken, fromPhone, db)
}
