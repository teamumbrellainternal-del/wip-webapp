/**
 * Mock Resend Email Service
 * Provides placeholder email functionality for development without real API calls
 */

import { generateUUIDv4 } from '../utils/uuid'
import {
  EmailParams,
  EmailResult,
  BroadcastEmailParams,
  BroadcastResult,
  EmailTemplate,
  ServiceResult,
} from '../services/types'

/**
 * In-memory storage for sent emails (for testing/debugging)
 */
interface SentEmail {
  id: string
  to: string | string[]
  from: string
  subject: string
  html: string
  text?: string
  timestamp: string
}

const sentEmails: SentEmail[] = []

/**
 * Mock Resend Email Service
 * Logs emails to console and stores them in memory
 */
export class MockResendService {
  /**
   * Send a single email (mocked)
   */
  async sendEmail(params: EmailParams): Promise<ServiceResult<EmailResult>> {
    // Validate email addresses (basic format check)
    const recipients = Array.isArray(params.to) ? params.to : [params.to]
    for (const email of recipients) {
      if (!this.isValidEmail(email)) {
        return {
          success: false,
          error: {
            code: 'INVALID_EMAIL',
            message: `Invalid email address: ${email}`,
            retryable: false,
          },
        }
      }
    }

    // Generate mock message ID
    const messageId = `mock_${generateUUIDv4()}`
    const timestamp = new Date().toISOString()

    // Store in memory
    const sentEmail: SentEmail = {
      id: messageId,
      to: params.to,
      from: params.from || 'noreply@umbrella.app',
      subject: params.subject,
      html: params.html,
      text: params.text,
      timestamp,
    }
    sentEmails.push(sentEmail)

    // Keep only last 100 emails in memory
    if (sentEmails.length > 100) {
      sentEmails.shift()
    }

    // Log to console
    console.log('[MOCK RESEND] Email sent:')
    console.log(`  To: ${Array.isArray(params.to) ? params.to.join(', ') : params.to}`)
    console.log(`  From: ${params.from || 'noreply@umbrella.app'}`)
    console.log(`  Subject: ${params.subject}`)
    console.log(`  Body: ${params.html.substring(0, 100)}${params.html.length > 100 ? '...' : ''}`)
    console.log(`  Message ID: ${messageId}`)

    return {
      success: true,
      data: {
        messageId,
        to: recipients,
        timestamp,
      },
    }
  }

  /**
   * Send broadcast emails (mocked)
   */
  async sendBroadcast(params: BroadcastEmailParams): Promise<BroadcastResult> {
    const result: BroadcastResult = {
      totalRecipients: params.recipients.length,
      successCount: 0,
      failureCount: 0,
      queuedCount: 0,
    }

    // Mock: all emails succeed
    for (const recipient of params.recipients) {
      const emailResult = await this.sendEmail({
        to: recipient,
        subject: params.subject,
        html: params.html,
        text: params.text,
        template: 'broadcast',
        artistId: params.artistId,
      })

      if (emailResult.success) {
        result.successCount++
      } else {
        result.failureCount++
      }
    }

    console.log('[MOCK RESEND] Broadcast sent:')
    console.log(`  Total recipients: ${result.totalRecipients}`)
    console.log(`  Successful: ${result.successCount}`)
    console.log(`  Failed: ${result.failureCount}`)

    return result
  }

  /**
   * Send transactional email using template (mocked)
   */
  async sendTransactional(
    template: EmailTemplate,
    to: string,
    data: Record<string, any>,
    artistId?: string
  ): Promise<ServiceResult<EmailResult>> {
    const emailContent = this.renderTemplate(template, data)

    return this.sendEmail({
      to,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      template,
      artistId,
    })
  }

  /**
   * Get sent emails (for testing)
   */
  getSentEmails(): SentEmail[] {
    return [...sentEmails]
  }

  /**
   * Clear sent emails (for testing)
   */
  clearSentEmails(): void {
    sentEmails.length = 0
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Render email template (simple mock templates)
   */
  private renderTemplate(
    template: EmailTemplate,
    data: Record<string, any>
  ): { subject: string; html: string; text: string } {
    switch (template) {
      case 'welcome':
        return {
          subject: 'Welcome to Umbrella!',
          html: `
            <h1>Welcome to Umbrella, ${data.artistName}!</h1>
            <p>We're excited to have you join our community of artists.</p>
            <p>Get started by completing your profile and exploring opportunities in the marketplace.</p>
            <a href="${data.profileUrl}" style="display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 4px;">Complete Your Profile</a>
          `,
          text: `Welcome to Umbrella, ${data.artistName}! We're excited to have you join our community. Get started by completing your profile: ${data.profileUrl}`,
        }

      case 'booking_confirmation':
        return {
          subject: `Booking Confirmed: ${data.gigTitle}`,
          html: `
            <h1>Booking Confirmed!</h1>
            <p>Your booking for <strong>${data.gigTitle}</strong> has been confirmed.</p>
            <p><strong>Date:</strong> ${data.date}</p>
            <p><strong>Location:</strong> ${data.location}</p>
            <p><strong>Rate:</strong> $${data.rate}</p>
            <a href="${data.gigUrl}" style="display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 4px;">View Details</a>
          `,
          text: `Booking Confirmed! Your booking for ${data.gigTitle} has been confirmed. Date: ${data.date}. Location: ${data.location}. Rate: $${data.rate}. View details: ${data.gigUrl}`,
        }

      case 'message_notification':
        return {
          subject: `New message from ${data.senderName}`,
          html: `
            <h1>You have a new message</h1>
            <p><strong>${data.senderName}</strong> sent you a message:</p>
            <blockquote style="border-left: 4px solid #eee; padding-left: 16px; margin: 20px 0;">${data.messagePreview}</blockquote>
            <a href="${data.conversationUrl}" style="display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 4px;">Read Message</a>
          `,
          text: `New message from ${data.senderName}: ${data.messagePreview}. Read more: ${data.conversationUrl}`,
        }

      case 'review_invitation':
        return {
          subject: `Please review your experience with ${data.otherPartyName}`,
          html: `
            <h1>How was your experience?</h1>
            <p>You recently completed a gig with <strong>${data.otherPartyName}</strong>.</p>
            <p>We'd love to hear about your experience. Your review helps build trust in the Umbrella community.</p>
            <a href="${data.reviewUrl}" style="display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 4px;">Leave a Review</a>
          `,
          text: `How was your experience with ${data.otherPartyName}? Leave a review: ${data.reviewUrl}`,
        }

      case 'broadcast':
        return {
          subject: data.subject || 'Update from Umbrella',
          html: data.html || '<p>No content provided</p>',
          text: data.text || 'No content provided',
        }

      default:
        return {
          subject: 'Notification from Umbrella',
          html: '<p>No template specified</p>',
          text: 'No template specified',
        }
    }
  }
}

/**
 * Factory function to create MockResendService instance
 */
export function createMockResendService(): MockResendService {
  return new MockResendService()
}
