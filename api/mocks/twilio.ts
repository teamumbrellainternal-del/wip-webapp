/**
 * Mock Twilio SMS Service
 * Provides placeholder SMS functionality for development without real API calls
 */

import { generateUUIDv4 } from '../utils/uuid'
import {
  SMSParams,
  SMSResult,
  BroadcastSMSParams,
  BroadcastResult,
  SMSMessageType,
  ServiceResult,
} from '../services/types'

/**
 * In-memory storage for sent SMS (for testing/debugging)
 */
interface SentSMS {
  id: string
  to: string
  from: string
  message: string
  messageType?: SMSMessageType
  timestamp: string
}

const sentSMS: SentSMS[] = []

/**
 * Mock Twilio SMS Service
 * Logs SMS to console and stores them in memory
 */
export class MockTwilioService {
  private fromPhone: string

  constructor(fromPhone: string = '+15555551234') {
    this.fromPhone = fromPhone
  }

  /**
   * Send a single SMS (mocked)
   */
  async sendSMS(params: SMSParams): Promise<ServiceResult<SMSResult>> {
    // Validate phone number format
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

    // Validate message length (1600 chars max)
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

    // Generate mock SID
    const messageSid = `SM${generateUUIDv4().replace(/-/g, '')}`
    const timestamp = new Date().toISOString()

    // Store in memory
    const sentMessage: SentSMS = {
      id: messageSid,
      to: params.to,
      from: this.fromPhone,
      message: params.message,
      messageType: params.messageType,
      timestamp,
    }
    sentSMS.push(sentMessage)

    // Keep only last 100 SMS in memory
    if (sentSMS.length > 100) {
      sentSMS.shift()
    }

    // Log to console
    console.log('[MOCK TWILIO] SMS sent:')
    console.log(`  To: ${params.to}`)
    console.log(`  From: ${this.fromPhone}`)
    console.log(`  Body: ${params.message}`)
    console.log(`  SID: ${messageSid}`)
    if (params.messageType) {
      console.log(`  Type: ${params.messageType}`)
    }

    return {
      success: true,
      data: {
        messageSid,
        to: params.to,
        status: 'sent',
        timestamp,
      },
    }
  }

  /**
   * Send broadcast SMS (mocked)
   */
  async sendBroadcast(params: BroadcastSMSParams): Promise<BroadcastResult> {
    const result: BroadcastResult = {
      totalRecipients: params.recipients.length,
      successCount: 0,
      failureCount: 0,
      queuedCount: 0,
    }

    // Mock: all SMS succeed
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
        result.failureCount++
      }
    }

    console.log('[MOCK TWILIO] Broadcast sent:')
    console.log(`  Total recipients: ${result.totalRecipients}`)
    console.log(`  Successful: ${result.successCount}`)
    console.log(`  Failed: ${result.failureCount}`)

    return result
  }

  /**
   * Send booking confirmation SMS (mocked)
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
   * Get sent SMS (for testing)
   */
  getSentSMS(): SentSMS[] {
    return [...sentSMS]
  }

  /**
   * Clear sent SMS (for testing)
   */
  clearSentSMS(): void {
    sentSMS.length = 0
  }

  /**
   * Validate phone number format (E.164: +1234567890)
   */
  private isValidPhoneNumber(phone: string): boolean {
    const e164Regex = /^\+[1-9]\d{1,14}$/
    return e164Regex.test(phone)
  }

  /**
   * Get delivery statistics (mocked)
   */
  async getDeliveryStats(
    artistId: string,
    days: number = 30
  ): Promise<{
    totalSent: number
    successCount: number
    failureCount: number
  }> {
    // Mock: return sample stats
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    const relevantSMS = sentSMS.filter((sms) => {
      const smsDate = new Date(sms.timestamp)
      return smsDate >= cutoffDate
    })

    return {
      totalSent: relevantSMS.length,
      successCount: relevantSMS.length,
      failureCount: 0,
    }
  }
}

/**
 * Factory function to create MockTwilioService instance
 */
export function createMockTwilioService(fromPhone?: string): MockTwilioService {
  return new MockTwilioService(fromPhone)
}
