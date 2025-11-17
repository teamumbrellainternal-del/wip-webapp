/**
 * SMS Utility - Twilio Integration
 * Handles all SMS sending functionality with support for mock mode
 * Task 10.7: Configure External Service APIs
 * Reference: D-045 (SMS for bookings)
 */

import twilio from 'twilio'
import { logger } from './logger'

const Twilio = twilio

/**
 * SMS template types
 */
export type SMSTemplate =
  | 'gig-booking-confirmation'
  | 'gig-reminder-24h'
  | 'gig-reminder-2h'
  | 'booking-cancellation'
  | 'verification-code'

/**
 * SMS data interfaces
 */
export interface SMSData {
  to: string
  body: string
  from?: string
}

export interface GigBookingSMSData {
  recipientName: string
  gigTitle: string
  venueName: string
  gigDate: string
  gigTime: string
  bookingId: string
}

export interface VerificationCodeSMSData {
  code: string
  expiryMinutes: number
}

/**
 * Initialize Twilio client
 */
function getTwilioClient(accountSid: string, authToken: string): Twilio {
  return new Twilio(accountSid, authToken)
}

/**
 * Check if we're in mock mode
 */
function isMockMode(env: { USE_MOCKS?: string }): boolean {
  return env.USE_MOCKS === 'true'
}

/**
 * Format phone number to E.164 format if needed
 * Twilio requires phone numbers in E.164 format: +[country code][number]
 */
export function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '')

  // If it doesn't start with country code, assume US (+1)
  if (!phoneNumber.startsWith('+')) {
    return `+1${cleaned}`
  }

  return `+${cleaned}`
}

/**
 * Send SMS using Twilio API
 */
export async function sendSMS(
  smsData: SMSData,
  env: {
    TWILIO_ACCOUNT_SID?: string
    TWILIO_AUTH_TOKEN?: string
    TWILIO_PHONE_NUMBER?: string
    USE_MOCKS?: string
  }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const formattedTo = formatPhoneNumber(smsData.to)

    // Mock mode - log instead of sending
    if (isMockMode(env)) {
      logger.info('📱 [MOCK] SMS would be sent:', {
        to: formattedTo,
        body: smsData.body,
        from: smsData.from || env.TWILIO_PHONE_NUMBER || '+1234567890',
      })
      return {
        success: true,
        messageId: `mock-sms-${Date.now()}`,
      }
    }

    // Validate credentials
    if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN) {
      throw new Error('Twilio credentials are not configured')
    }

    if (!env.TWILIO_PHONE_NUMBER) {
      throw new Error('TWILIO_PHONE_NUMBER is not configured')
    }

    // Send real SMS
    const twilio = getTwilioClient(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN)
    const message = await twilio.messages.create({
      body: smsData.body,
      from: smsData.from || env.TWILIO_PHONE_NUMBER,
      to: formattedTo,
    })

    logger.info('📱 SMS sent successfully:', {
      messageId: message.sid,
      to: formattedTo,
      status: message.status,
    })

    return {
      success: true,
      messageId: message.sid,
    }
  } catch (error) {
    logger.error('❌ SMS send failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Send gig booking confirmation SMS (D-045)
 */
export async function sendGigBookingConfirmationSMS(
  data: GigBookingSMSData,
  recipientPhone: string,
  env: {
    TWILIO_ACCOUNT_SID?: string
    TWILIO_AUTH_TOKEN?: string
    TWILIO_PHONE_NUMBER?: string
    USE_MOCKS?: string
  }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const body = `🎉 Gig Confirmed!

Hi ${data.recipientName}, your booking for "${data.gigTitle}" at ${data.venueName} is confirmed.

📅 ${data.gigDate} at ${data.gigTime}

Booking ID: ${data.bookingId}

We'll send you a reminder 24 hours before the gig. View details: https://umbrella.app/bookings/${data.bookingId}

- Umbrella`

  return sendSMS({ to: recipientPhone, body }, env)
}

/**
 * Send 24-hour gig reminder SMS
 */
export async function sendGigReminder24h(
  data: GigBookingSMSData,
  recipientPhone: string,
  env: {
    TWILIO_ACCOUNT_SID?: string
    TWILIO_AUTH_TOKEN?: string
    TWILIO_PHONE_NUMBER?: string
    USE_MOCKS?: string
  }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const body = `⏰ Gig Reminder

Hi ${data.recipientName}, your gig at ${data.venueName} is tomorrow!

📅 ${data.gigDate} at ${data.gigTime}
🎵 ${data.gigTitle}

Make sure you're prepared and arrive on time. Break a leg!

- Umbrella`

  return sendSMS({ to: recipientPhone, body }, env)
}

/**
 * Send 2-hour gig reminder SMS
 */
export async function sendGigReminder2h(
  data: GigBookingSMSData,
  recipientPhone: string,
  env: {
    TWILIO_ACCOUNT_SID?: string
    TWILIO_AUTH_TOKEN?: string
    TWILIO_PHONE_NUMBER?: string
    USE_MOCKS?: string
  }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const body = `⏰ Gig in 2 Hours!

${data.recipientName}, your performance at ${data.venueName} is in 2 hours.

🎵 ${data.gigTitle}
⏰ ${data.gigTime}

Good luck! 🎸

- Umbrella`

  return sendSMS({ to: recipientPhone, body }, env)
}

/**
 * Send booking cancellation SMS
 */
export async function sendBookingCancellationSMS(
  data: GigBookingSMSData,
  recipientPhone: string,
  reason?: string,
  env?: {
    TWILIO_ACCOUNT_SID?: string
    TWILIO_AUTH_TOKEN?: string
    TWILIO_PHONE_NUMBER?: string
    USE_MOCKS?: string
  }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const reasonText = reason ? `\n\nReason: ${reason}` : ''

  const body = `❌ Booking Cancelled

Hi ${data.recipientName}, unfortunately the booking for "${data.gigTitle}" at ${data.venueName} on ${data.gigDate} has been cancelled.${reasonText}

Booking ID: ${data.bookingId}

If you have questions, please contact support or the venue through Umbrella messaging.

- Umbrella`

  return sendSMS({ to: recipientPhone, body }, env || {})
}

/**
 * Send verification code SMS
 */
export async function sendVerificationCodeSMS(
  data: VerificationCodeSMSData,
  recipientPhone: string,
  env: {
    TWILIO_ACCOUNT_SID?: string
    TWILIO_AUTH_TOKEN?: string
    TWILIO_PHONE_NUMBER?: string
    USE_MOCKS?: string
  }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const body = `Your Umbrella verification code is: ${data.code}

This code will expire in ${data.expiryMinutes} minutes.

If you didn't request this code, please ignore this message.

- Umbrella`

  return sendSMS({ to: recipientPhone, body }, env)
}

/**
 * Test SMS send - useful for verifying configuration
 */
export async function sendTestSMS(
  recipientPhone: string,
  env: {
    TWILIO_ACCOUNT_SID?: string
    TWILIO_AUTH_TOKEN?: string
    TWILIO_PHONE_NUMBER?: string
    USE_MOCKS?: string
  }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const body = `Umbrella SMS Configuration Test

If you're seeing this, your Twilio integration is working correctly!

Timestamp: ${new Date().toISOString()}

- Umbrella`

  return sendSMS({ to: recipientPhone, body }, env)
}
