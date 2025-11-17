/**
 * Email Utility - Resend Integration
 * Handles all email sending functionality with support for mock mode
 * Task 10.7: Configure External Service APIs
 */

import { Resend } from 'resend'
import { logger } from './logger'

/**
 * Email template types
 */
export type EmailTemplate =
  | 'gig-booking-confirmation'
  | 'gig-booking-notification'
  | 'message-notification'
  | 'welcome'
  | 'verification'
  | 'password-reset'
  | 'gig-reminder'

/**
 * Email data interfaces
 */
export interface EmailData {
  to: string | string[]
  subject: string
  html: string
  from?: string
  replyTo?: string
}

export interface GigBookingEmailData {
  recipientName: string
  gigTitle: string
  venueName: string
  gigDate: string
  gigTime: string
  paymentAmount: number
  bookingId: string
}

export interface MessageNotificationEmailData {
  recipientName: string
  senderName: string
  messagePreview: string
  conversationUrl: string
}

export interface WelcomeEmailData {
  userName: string
  role: 'artist' | 'venue' | 'fan' | 'collective'
}

/**
 * Initialize Resend client
 */
function getResendClient(apiKey: string): Resend {
  return new Resend(apiKey)
}

/**
 * Check if we're in mock mode
 */
function isMockMode(env: { USE_MOCKS?: string }): boolean {
  return env.USE_MOCKS === 'true'
}

/**
 * Send email using Resend API
 */
export async function sendEmail(
  emailData: EmailData,
  env: { RESEND_API_KEY?: string; USE_MOCKS?: string }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // Mock mode - log instead of sending
    if (isMockMode(env)) {
      logger.info('📧 [MOCK] Email would be sent:', {
        to: emailData.to,
        subject: emailData.subject,
        from: emailData.from || 'Umbrella <notifications@umbrella.app>',
      })
      return {
        success: true,
        messageId: `mock-${Date.now()}`,
      }
    }

    // Validate API key
    if (!env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured')
    }

    // Send real email
    const resend = getResendClient(env.RESEND_API_KEY)
    const result = await resend.emails.send({
      from: emailData.from || 'Umbrella <notifications@umbrella.app>',
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      replyTo: emailData.replyTo,
    })

    logger.info('📧 Email sent successfully:', {
      messageId: result.data?.id,
      to: emailData.to,
      subject: emailData.subject,
    })

    return {
      success: true,
      messageId: result.data?.id,
    }
  } catch (error) {
    logger.error('❌ Email send failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Send gig booking confirmation email to artist
 */
export async function sendGigBookingConfirmation(
  data: GigBookingEmailData,
  recipientEmail: string,
  env: { RESEND_API_KEY?: string; USE_MOCKS?: string }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gig Booking Confirmed</title>
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
    <h1 style="margin: 0; font-size: 28px;">🎉 Gig Confirmed!</h1>
  </div>

  <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi ${data.recipientName},</p>

    <p style="font-size: 16px; margin-bottom: 20px;">
      Great news! Your booking for <strong>${data.gigTitle}</strong> has been confirmed.
    </p>

    <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
      <h2 style="margin-top: 0; color: #667eea; font-size: 20px;">Gig Details</h2>
      <p style="margin: 10px 0;"><strong>Venue:</strong> ${data.venueName}</p>
      <p style="margin: 10px 0;"><strong>Date:</strong> ${data.gigDate}</p>
      <p style="margin: 10px 0;"><strong>Time:</strong> ${data.gigTime}</p>
      <p style="margin: 10px 0;"><strong>Payment:</strong> $${data.paymentAmount}</p>
      <p style="margin: 10px 0;"><strong>Booking ID:</strong> ${data.bookingId}</p>
    </div>

    <p style="font-size: 16px; margin-top: 20px;">
      We'll send you a reminder 24 hours before the gig. If you have any questions, please contact the venue directly through the Umbrella messaging system.
    </p>

    <div style="text-align: center; margin-top: 30px;">
      <a href="https://umbrella.app/dashboard" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">View Dashboard</a>
    </div>

    <p style="font-size: 14px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
      Best regards,<br>
      The Umbrella Team
    </p>
  </div>
</body>
</html>
  `

  return sendEmail(
    {
      to: recipientEmail,
      subject: `Gig Confirmed: ${data.gigTitle} at ${data.venueName}`,
      html,
    },
    env
  )
}

/**
 * Send gig booking notification email to venue
 */
export async function sendGigBookingNotification(
  data: GigBookingEmailData,
  venueEmail: string,
  env: { RESEND_API_KEY?: string; USE_MOCKS?: string }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Gig Booking</title>
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
    <h1 style="margin: 0; font-size: 28px;">🎵 New Booking Received</h1>
  </div>

  <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi ${data.venueName},</p>

    <p style="font-size: 16px; margin-bottom: 20px;">
      You have a new artist booking for <strong>${data.gigTitle}</strong>.
    </p>

    <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
      <h2 style="margin-top: 0; color: #667eea; font-size: 20px;">Booking Details</h2>
      <p style="margin: 10px 0;"><strong>Artist:</strong> ${data.recipientName}</p>
      <p style="margin: 10px 0;"><strong>Date:</strong> ${data.gigDate}</p>
      <p style="margin: 10px 0;"><strong>Time:</strong> ${data.gigTime}</p>
      <p style="margin: 10px 0;"><strong>Payment:</strong> $${data.paymentAmount}</p>
      <p style="margin: 10px 0;"><strong>Booking ID:</strong> ${data.bookingId}</p>
    </div>

    <p style="font-size: 16px; margin-top: 20px;">
      Please reach out to the artist through Umbrella messaging to finalize details.
    </p>

    <div style="text-align: center; margin-top: 30px;">
      <a href="https://umbrella.app/bookings/${data.bookingId}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">View Booking</a>
    </div>

    <p style="font-size: 14px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
      Best regards,<br>
      The Umbrella Team
    </p>
  </div>
</body>
</html>
  `

  return sendEmail(
    {
      to: venueEmail,
      subject: `New Artist Booking: ${data.recipientName} for ${data.gigTitle}`,
      html,
    },
    env
  )
}

/**
 * Send message notification email
 */
export async function sendMessageNotification(
  data: MessageNotificationEmailData,
  recipientEmail: string,
  env: { RESEND_API_KEY?: string; USE_MOCKS?: string }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Message</title>
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
    <h1 style="margin: 0; font-size: 28px;">💬 New Message</h1>
  </div>

  <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi ${data.recipientName},</p>

    <p style="font-size: 16px; margin-bottom: 20px;">
      <strong>${data.senderName}</strong> sent you a message on Umbrella:
    </p>

    <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
      <p style="margin: 0; font-style: italic; color: #555;">"${data.messagePreview}"</p>
    </div>

    <div style="text-align: center; margin-top: 30px;">
      <a href="${data.conversationUrl}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">View Message</a>
    </div>

    <p style="font-size: 14px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
      Best regards,<br>
      The Umbrella Team
    </p>
  </div>
</body>
</html>
  `

  return sendEmail(
    {
      to: recipientEmail,
      subject: `New message from ${data.senderName}`,
      html,
    },
    env
  )
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(
  data: WelcomeEmailData,
  recipientEmail: string,
  env: { RESEND_API_KEY?: string; USE_MOCKS?: string }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const roleSpecificContent = {
    artist: {
      emoji: '🎸',
      title: 'Welcome to Umbrella, Artist!',
      message: 'Get ready to discover amazing gig opportunities and connect with venues.',
      cta: 'Complete Your Profile',
    },
    venue: {
      emoji: '🏛️',
      title: 'Welcome to Umbrella, Venue!',
      message: 'Start finding talented artists for your events.',
      cta: 'Post Your First Gig',
    },
    fan: {
      emoji: '🎵',
      title: 'Welcome to Umbrella, Music Fan!',
      message: 'Discover and support amazing local artists.',
      cta: 'Explore Artists',
    },
    collective: {
      emoji: '🎭',
      title: 'Welcome to Umbrella!',
      message: 'Connect with artists, venues, and fans in your community.',
      cta: 'Get Started',
    },
  }

  const content = roleSpecificContent[data.role]

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Umbrella</title>
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
    <h1 style="margin: 0; font-size: 28px;">${content.emoji} ${content.title}</h1>
  </div>

  <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi ${data.userName},</p>

    <p style="font-size: 16px; margin-bottom: 20px;">
      Welcome to Umbrella! ${content.message}
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="https://umbrella.app/dashboard" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">${content.cta}</a>
    </div>

    <p style="font-size: 14px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
      Need help getting started? Check out our <a href="https://umbrella.app/help" style="color: #667eea;">help center</a> or reply to this email.
    </p>

    <p style="font-size: 14px; color: #666; margin-top: 20px;">
      Best regards,<br>
      The Umbrella Team
    </p>
  </div>
</body>
</html>
  `

  return sendEmail(
    {
      to: recipientEmail,
      subject: content.title,
      html,
    },
    env
  )
}

/**
 * Test email send - useful for verifying configuration
 */
export async function sendTestEmail(
  recipientEmail: string,
  env: { RESEND_API_KEY?: string; USE_MOCKS?: string }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  return sendEmail(
    {
      to: recipientEmail,
      subject: 'Umbrella Email Configuration Test',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Test Email</title>
</head>
<body style="font-family: system-ui, sans-serif; padding: 20px;">
  <h1>Email Configuration Test</h1>
  <p>If you're seeing this, your Resend integration is working correctly!</p>
  <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
</body>
</html>
      `,
    },
    env
  )
}
