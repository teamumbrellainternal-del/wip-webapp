/**
 * Resend Email Service Wrapper
 * Handles transactional emails, broadcasts, and failed delivery queue
 */

import { generateUUIDv4 } from '../utils/uuid'
import { withRetry, calculateNextRetryTime } from './retry-helper'
import {
  EmailParams,
  EmailResult,
  BroadcastEmailParams,
  BroadcastResult,
  EmailTemplate,
  ServiceResult,
  DEFAULT_RETRY_CONFIG,
  EmailQueueItem,
} from './types'

/**
 * Resend API configuration
 */
const RESEND_API_URL = 'https://api.resend.com/emails'
const DEFAULT_FROM_EMAIL = 'noreply@notifications.umbrellalive.com'
const BROADCAST_BATCH_SIZE = 1000 // Per Resend docs: max 1000 recipients per batch

/**
 * Resend email service class
 */
export class ResendEmailService {
  private apiKey: string
  private db: D1Database

  constructor(apiKey: string, db: D1Database) {
    this.apiKey = apiKey
    this.db = db
  }

  /**
   * Send a single email with retry logic
   * @param params - Email parameters
   * @returns Service result with email send result
   */
  async sendEmail(params: EmailParams): Promise<ServiceResult<EmailResult>> {
    // Check if recipient is unsubscribed
    if (typeof params.to === 'string') {
      const isUnsubscribed = await this.checkUnsubscribed(params.to)
      if (isUnsubscribed) {
        return {
          success: false,
          error: {
            code: 'RECIPIENT_UNSUBSCRIBED',
            message: `Recipient ${params.to} has unsubscribed`,
            retryable: false,
          },
        }
      }
    }

    // Inject unsubscribe link if provided
    let html = params.html
    if (params.unsubscribeUrl) {
      html = this.injectUnsubscribeLink(html, params.unsubscribeUrl)
    }

    // Prepare email payload for Resend API
    const payload = {
      from: params.from || DEFAULT_FROM_EMAIL,
      to: Array.isArray(params.to) ? params.to : [params.to],
      subject: params.subject,
      html: html,
      text: params.text,
    }

    // Send with retry logic
    const result = await withRetry<EmailResult>(async () => {
      const response = await fetch(RESEND_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const error = new Error(
          errorData.message || `Resend API error: ${response.status} ${response.statusText}`
        )
        ;(error as any).status = response.status
        throw error
      }

      const data = await response.json()

      return {
        messageId: data.id,
        to: payload.to,
        timestamp: new Date().toISOString(),
      }
    })

    // Log the delivery attempt
    await this.logDelivery(
      params.to,
      params.subject,
      params.template,
      result.success ? 'success' : 'failed',
      result.error?.message,
      result.data?.messageId,
      params.artistId
    )

    // If failed and retryable, add to queue
    if (!result.success && result.error?.retryable) {
      await this.queueEmail(params)
    }

    return result
  }

  /**
   * Send broadcast emails in batches (1000 recipients per call)
   * @param params - Broadcast parameters
   * @returns Broadcast result with success/failure counts
   */
  async sendBroadcast(params: BroadcastEmailParams): Promise<BroadcastResult> {
    const result: BroadcastResult = {
      totalRecipients: params.recipients.length,
      successCount: 0,
      failureCount: 0,
      queuedCount: 0,
    }

    // Filter out unsubscribed recipients
    const validRecipients: string[] = []
    for (const email of params.recipients) {
      const isUnsubscribed = await this.checkUnsubscribed(email)
      if (!isUnsubscribed) {
        validRecipients.push(email)
      }
    }

    // Process in batches of 1000
    const batches = this.chunkArray(validRecipients, BROADCAST_BATCH_SIZE)

    for (const batch of batches) {
      const emailResult = await this.sendEmail({
        to: batch,
        from: DEFAULT_FROM_EMAIL,
        subject: params.subject,
        html: params.html,
        text: params.text,
        template: 'broadcast',
        artistId: params.artistId,
        unsubscribeUrl: params.unsubscribeUrl,
      })

      if (emailResult.success) {
        result.successCount += batch.length
      } else {
        if (emailResult.error?.retryable) {
          result.queuedCount += batch.length
        } else {
          result.failureCount += batch.length
        }
      }
    }

    return result
  }

  /**
   * Send transactional email using template
   * @param template - Email template type
   * @param to - Recipient email
   * @param data - Template data
   * @param artistId - Optional artist ID for tracking
   * @returns Service result
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
   * Queue failed email for retry
   * @param params - Email parameters
   */
  private async queueEmail(params: EmailParams): Promise<void> {
    const id = generateUUIDv4()
    const now = new Date().toISOString()
    const nextRetryAt = calculateNextRetryTime(0, DEFAULT_RETRY_CONFIG)

    await this.db
      .prepare(
        `INSERT INTO email_delivery_queue
        (id, to_email, from_email, subject, html_body, text_body, template_type,
         retry_count, max_retries, next_retry_at, status, artist_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        Array.isArray(params.to) ? params.to.join(',') : params.to,
        params.from || DEFAULT_FROM_EMAIL,
        params.subject,
        params.html,
        params.text || null,
        params.template || null,
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
   * Process queued emails (called by cron or background worker)
   * @returns Number of emails processed
   */
  async processQueue(): Promise<number> {
    const now = new Date().toISOString()

    // Fetch pending items ready for retry
    const result = await this.db
      .prepare(
        `SELECT * FROM email_delivery_queue
         WHERE status = 'pending'
         AND (next_retry_at IS NULL OR next_retry_at <= ?)
         ORDER BY created_at ASC
         LIMIT 100`
      )
      .bind(now)
      .all<EmailQueueItem>()

    const items = result.results || []
    let processed = 0

    for (const item of items) {
      // Mark as processing
      await this.db
        .prepare('UPDATE email_delivery_queue SET status = ?, updated_at = ? WHERE id = ?')
        .bind('processing', now, item.id)
        .run()

      // Attempt to send
      const sendResult = await this.sendEmail({
        to: item.toEmail.split(','),
        from: item.fromEmail,
        subject: item.subject,
        html: item.htmlBody,
        text: item.textBody || undefined,
        template: item.templateType as EmailTemplate | undefined,
        artistId: item.artistId || undefined,
      })

      if (sendResult.success) {
        // Mark as completed
        await this.db
          .prepare('UPDATE email_delivery_queue SET status = ?, updated_at = ? WHERE id = ?')
          .bind('completed', now, item.id)
          .run()
        processed++
      } else {
        const newRetryCount = item.retryCount + 1

        if (newRetryCount >= item.maxRetries) {
          // Max retries reached, mark as failed
          await this.db
            .prepare(
              'UPDATE email_delivery_queue SET status = ?, last_error = ?, updated_at = ? WHERE id = ?'
            )
            .bind('failed', sendResult.error?.message || 'Unknown error', now, item.id)
            .run()
        } else {
          // Schedule next retry
          const nextRetryAt = calculateNextRetryTime(newRetryCount, DEFAULT_RETRY_CONFIG)
          await this.db
            .prepare(
              `UPDATE email_delivery_queue
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
   * Log email delivery attempt
   */
  private async logDelivery(
    to: string | string[],
    subject: string,
    template: EmailTemplate | undefined,
    status: 'success' | 'failed' | 'bounced' | 'rejected',
    errorMessage: string | undefined,
    externalId: string | undefined,
    artistId: string | undefined
  ): Promise<void> {
    const id = generateUUIDv4()
    const now = new Date().toISOString()
    const toEmail = Array.isArray(to) ? to[0] : to

    await this.db
      .prepare(
        `INSERT INTO email_delivery_log
        (id, to_email, subject, template_type, status, error_message, external_id, artist_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        toEmail,
        subject,
        template || null,
        status,
        errorMessage || null,
        externalId || null,
        artistId || null,
        now
      )
      .run()
  }

  /**
   * Check if email is unsubscribed
   */
  private async checkUnsubscribed(email: string): Promise<boolean> {
    const result = await this.db
      .prepare('SELECT id FROM unsubscribe_list WHERE email = ?')
      .bind(email)
      .first()

    return result !== null
  }

  /**
   * Add email to unsubscribe list
   */
  async unsubscribe(email: string, artistId?: string, reason?: string): Promise<void> {
    const id = generateUUIDv4()
    const now = new Date().toISOString()

    await this.db
      .prepare(
        'INSERT OR IGNORE INTO unsubscribe_list (id, email, artist_id, reason, created_at) VALUES (?, ?, ?, ?, ?)'
      )
      .bind(id, email, artistId || null, reason || null, now)
      .run()
  }

  /**
   * Inject unsubscribe link into email HTML
   */
  private injectUnsubscribeLink(html: string, unsubscribeUrl: string): string {
    const unsubscribeFooter = `
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 12px;">
        <p>Don't want to receive these emails? <a href="${unsubscribeUrl}" style="color: #666; text-decoration: underline;">Unsubscribe</a></p>
      </div>
    `

    // Insert before closing body tag if exists, otherwise append
    if (html.includes('</body>')) {
      return html.replace('</body>', `${unsubscribeFooter}</body>`)
    }

    return html + unsubscribeFooter
  }

  /**
   * Render email template
   * In production, these would be proper HTML templates
   * For MVP, using simple inline templates
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

      case 'signup_welcome':
        return {
          subject: 'Welcome to Umbrella — You\'re In!',
          html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Welcome to Umbrella — You're In!</title>
  <div style="display: none; max-height: 0px; overflow: hidden;">
    You've officially stepped under the Umbrella — let's make some noise together! 🎤
  </div>
</head>
<body style="margin: 0; padding: 0; font-family: Inter, Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; max-width: 600px;">
          <!-- Purple Header Bar -->
          <tr>
            <td style="background-color: #9370DB; height: 60px; text-align: center; padding: 20px;">
              <h1 style="margin: 0; color: #ffffff; font-family: Inter, Arial, sans-serif; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Umbrella</h1>
            </td>
          </tr>
          <!-- Email Body -->
          <tr>
            <td style="padding: 40px 32px;">
              <h2 style="margin: 0 0 24px 0; font-family: Inter, Arial, sans-serif; font-size: 24px; font-weight: 700; color: #0a0a0a; letter-spacing: -0.5px;">
                Hey ${data.artistName},
              </h2>
              <p style="margin: 0 0 16px 0; font-family: Inter, Arial, sans-serif; font-size: 16px; line-height: 24px; color: #0a0a0a;">
                You've officially stepped under the Umbrella — and we couldn't be more excited to have you here.
              </p>
              <p style="margin: 0 0 16px 0; font-family: Inter, Arial, sans-serif; font-size: 16px; line-height: 24px; color: #0a0a0a;">
                Umbrella was built for creators like you — the ones who see art not as a hobby, but as a heartbeat. Inside, you'll discover tools to:
              </p>
              <p style="margin: 0 0 8px 0; font-family: Inter, Arial, sans-serif; font-size: 16px; line-height: 24px; color: #0a0a0a;">
                🎤 Connect directly with venues and other artists
              </p>
              <p style="margin: 0 0 8px 0; font-family: Inter, Arial, sans-serif; font-size: 16px; line-height: 24px; color: #0a0a0a;">
                🎨 Collaborate and get discovered
              </p>
              <p style="margin: 0 0 24px 0; font-family: Inter, Arial, sans-serif; font-size: 16px; line-height: 24px; color: #0a0a0a;">
                💡 Turn your creativity into opportunity
              </p>
              <p style="margin: 0 0 16px 0; font-family: Inter, Arial, sans-serif; font-size: 16px; line-height: 24px; color: #0a0a0a;">
                We're opening early access this week — make sure your profile is complete so we can match you with upcoming opportunities first.
              </p>
              <p style="margin: 0 0 32px 0; font-family: Inter, Arial, sans-serif; font-size: 16px; line-height: 24px; color: #0a0a0a;">
                <strong style="font-weight: 600;">Let's make some noise together.</strong>
              </p>
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 32px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${data.profileUrl}" style="display: inline-block; background-color: #ffffff; border: 2px solid #9370DB; color: #000000; padding: 12px 32px; border-radius: 8px; font-family: Inter, Arial, sans-serif; font-size: 16px; font-weight: 600; text-decoration: none; text-align: center;">→ Complete your profile</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #fafafa; padding: 32px; text-align: center; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0 0 16px 0; font-family: Inter, Arial, sans-serif; font-size: 14px; line-height: 20px; color: #737373;">
                ☂️ Umbrella — Create. Connect. Perform.
              </p>
              <p style="margin: 0; font-family: Inter, Arial, sans-serif; font-size: 12px; line-height: 18px; color: #a3a3a3;">
                <a href="${data.unsubscribeUrl || '#'}" style="color: #a3a3a3; text-decoration: underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
          `,
          text: `Hey ${data.artistName},

You've officially stepped under the Umbrella — and we couldn't be more excited to have you here.

Umbrella was built for creators like you — the ones who see art not as a hobby, but as a heartbeat. Inside, you'll discover tools to:

🎤 Connect directly with venues and other artists
🎨 Collaborate and get discovered
💡 Turn your creativity into opportunity

We're opening early access this week — make sure your profile is complete so we can match you with upcoming opportunities first.

Let's make some noise together.

→ Complete your profile: ${data.profileUrl}

☂️ Umbrella — Create. Connect. Perform.`,
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

      case 'connection_request':
        return {
          subject: `${data.requesterName} wants to connect with you on Umbrella`,
          html: `
            <h1>New Connection Request</h1>
            <p><strong>${data.requesterName}</strong> wants to connect with you on Umbrella.</p>
            <p>Connecting expands your professional network and opens doors to collaborations and opportunities.</p>
            <div style="margin: 24px 0;">
              <a href="${data.profileUrl}" style="display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 4px; margin-right: 12px;">View Profile</a>
              <a href="https://app.umbrellalive.com/network" style="display: inline-block; padding: 12px 24px; background: #9370DB; color: #fff; text-decoration: none; border-radius: 4px;">Respond to Request</a>
            </div>
          `,
          text: `${data.requesterName} wants to connect with you on Umbrella. View their profile: ${data.profileUrl}`,
        }

      case 'connection_accepted':
        return {
          subject: `${data.accepterName} accepted your connection request!`,
          html: `
            <h1>You're Now Connected!</h1>
            <p>Great news! <strong>${data.accepterName}</strong> has accepted your connection request.</p>
            <p>You can now:</p>
            <ul>
              <li>See each other's full profiles</li>
              <li>Collaborate on projects</li>
              <li>Share opportunities</li>
            </ul>
            <a href="${data.profileUrl}" style="display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 4px;">View ${data.accepterName}'s Profile</a>
          `,
          text: `${data.accepterName} accepted your connection request on Umbrella! View their profile: ${data.profileUrl}`,
        }

      default:
        return {
          subject: 'Notification from Umbrella',
          html: '<p>No template specified</p>',
          text: 'No template specified',
        }
    }
  }

  /**
   * Chunk array into smaller arrays
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }
}

/**
 * Factory function to create ResendEmailService instance
 */
export function createResendService(apiKey: string, db: D1Database): ResendEmailService {
  return new ResendEmailService(apiKey, db)
}

/**
 * Helper function for sending email (for convenience imports)
 * Note: In production, use createResendService and the class methods
 */
export async function sendEmail(
  apiKey: string,
  db: D1Database,
  params: EmailParams
): Promise<ServiceResult<EmailResult>> {
  const service = createResendService(apiKey, db)
  return service.sendEmail(params)
}
