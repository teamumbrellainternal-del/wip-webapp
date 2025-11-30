/**
 * Broadcast controller
 * Handles fan messaging broadcasts
 * Per D-049: Text-only broadcasts (no images in Release 1)
 * Implements task-8.1: Broadcast Message Endpoint
 */

import type { RouteHandler } from '../../router'
import { successResponse, errorResponse } from '../../utils/response'
import { ErrorCodes } from '../../utils/error-codes'
import { generateUUIDv4 } from '../../utils/uuid'
import { createResendService } from '../../services/resend'
import { getSMSService } from '../../mocks'
import { FOLLOWERS_LIST_ID } from '../contacts'

/**
 * List broadcasts
 * GET /v1/broadcasts
 */
export const listBroadcasts: RouteHandler = async (ctx) => {
  if (!ctx.userId) {
    return errorResponse(
      ErrorCodes.AUTHENTICATION_FAILED,
      'Authentication required',
      401,
      undefined,
      ctx.requestId
    )
  }

  // Query params: page, limit
  const page = parseInt(ctx.url.searchParams.get('page') || '1')
  const limit = parseInt(ctx.url.searchParams.get('limit') || '20')

  // TODO: Implement broadcast listing
  return successResponse(
    {
      broadcasts: [],
      pagination: {
        page,
        limit,
        total: 0,
        hasMore: false,
      },
    },
    200,
    ctx.requestId
  )
}

/**
 * Get broadcast by ID
 * GET /v1/broadcasts/:id
 */
export const getBroadcast: RouteHandler = async (ctx) => {
  if (!ctx.userId) {
    return errorResponse(
      ErrorCodes.AUTHENTICATION_FAILED,
      'Authentication required',
      401,
      undefined,
      ctx.requestId
    )
  }

  const { id } = ctx.params

  if (!id) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'Broadcast ID required',
      400,
      'id',
      ctx.requestId
    )
  }

  // TODO: Implement broadcast retrieval
  return successResponse(
    {
      id,
      message: 'Sample broadcast message',
      sentAt: new Date().toISOString(),
      recipientCount: 0,
      deliveredCount: 0,
    },
    200,
    ctx.requestId
  )
}

/**
 * Create and send broadcast
 * POST /v1/broadcasts
 * Per D-049: Text-only (no image attachments)
 * Implements task-8.1: Send broadcast messages via email and SMS
 */
export const createBroadcast: RouteHandler = async (ctx) => {
  if (!ctx.userId) {
    return errorResponse(
      ErrorCodes.AUTHENTICATION_FAILED,
      'Authentication required',
      401,
      undefined,
      ctx.requestId
    )
  }

  try {
    // Parse request body
    const body = await ctx.request.json()
    const { list_ids, subject, body: messageBody } = body

    // Validate required fields
    if (!list_ids || !Array.isArray(list_ids) || list_ids.length === 0) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'list_ids must be a non-empty array',
        400,
        'list_ids',
        ctx.requestId
      )
    }

    if (!subject || typeof subject !== 'string' || subject.trim().length === 0) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'subject is required',
        400,
        'subject',
        ctx.requestId
      )
    }

    if (!messageBody || typeof messageBody !== 'string' || messageBody.trim().length === 0) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'body is required',
        400,
        'body',
        ctx.requestId
      )
    }

    // Validate text-only (D-049: no attachments in MVP)
    // Body should be plain text, not HTML with images
    if (messageBody.includes('<img') || messageBody.includes('data:image')) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Image attachments not supported in MVP (D-049)',
        400,
        'body',
        ctx.requestId
      )
    }

    // Get artist_id from user_id
    const artist = await ctx.env.DB.prepare(
      'SELECT id, stage_name FROM artists WHERE user_id = ?'
    )
      .bind(ctx.userId)
      .first<{ id: string; stage_name: string }>()

    if (!artist) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Artist profile not found',
        404,
        undefined,
        ctx.requestId
      )
    }

    // Separate followers list_id from regular list_ids
    const hasFollowersList = list_ids.includes(FOLLOWERS_LIST_ID)
    const regularListIds = list_ids.filter((id: string) => id !== FOLLOWERS_LIST_ID)

    // Type for contact records
    type ContactRecord = {
      email: string | null
      phone: string | null
      opted_in_email: number
      opted_in_sms: number
    }

    // Fetch contacts from regular contact lists (if any selected)
    let regularContacts: ContactRecord[] = []
    if (regularListIds.length > 0) {
      const placeholders = regularListIds.map(() => '?').join(',')
      const contactsQuery = `
        SELECT email, phone, opted_in_email, opted_in_sms
        FROM contact_list_members
        WHERE list_id IN (${placeholders})
      `
      const result = await ctx.env.DB.prepare(contactsQuery)
        .bind(...regularListIds)
        .all<ContactRecord>()
      regularContacts = result.results || []
    }

    // Fetch followers' emails if followers list is selected
    let followerContacts: ContactRecord[] = []
    if (hasFollowersList) {
      const followersQuery = `
        SELECT u.email, NULL as phone, 1 as opted_in_email, 0 as opted_in_sms
        FROM artist_followers af
        INNER JOIN users u ON af.follower_user_id = u.id
        WHERE af.artist_id = ?
      `
      const result = await ctx.env.DB.prepare(followersQuery)
        .bind(artist.id)
        .all<ContactRecord>()
      followerContacts = result.results || []
    }

    // Merge all contacts
    const allContacts = [...regularContacts, ...followerContacts]

    if (allContacts.length === 0) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'No contacts found in specified lists',
        400,
        'list_ids',
        ctx.requestId
      )
    }

    // Filter contacts by opt-in status and collect recipients
    const emailRecipients: string[] = []
    const smsRecipients: string[] = []

    for (const contact of allContacts) {
      // Add to email list if opted in and has email
      if (contact.opted_in_email && contact.email) {
        emailRecipients.push(contact.email)
      }

      // Add to SMS list if opted in and has phone
      if (contact.opted_in_sms && contact.phone) {
        smsRecipients.push(contact.phone)
      }
    }

    // Deduplicate recipients (a follower could also be in a manual contact list)
    const uniqueEmailRecipients = [...new Set(emailRecipients)]
    const uniqueSmsRecipients = [...new Set(smsRecipients)]

    const totalRecipients = new Set([...uniqueEmailRecipients, ...uniqueSmsRecipients]).size
    let emailsSent = 0
    let smsSent = 0

    // Send emails via Resend (batch processing, max 1000 per batch)
    if (uniqueEmailRecipients.length > 0) {
      const resendService = createResendService(ctx.env.RESEND_API_KEY, ctx.env.DB)

      // Convert plain text body to simple HTML
      const htmlBody = `
        <p>Hi there,</p>
        <p>${messageBody.replace(/\n/g, '<br>')}</p>
        <p>- ${artist.stage_name}</p>
        <hr>
        <p style="font-size: 12px; color: #666;">
          <a href="{{unsubscribe_url}}">Unsubscribe</a> from future messages
        </p>
      `

      const emailResult = await resendService.sendBroadcast({
        recipients: uniqueEmailRecipients,
        subject,
        html: htmlBody,
        text: `${messageBody}\n\n- ${artist.stage_name}\n\nUnsubscribe: {{unsubscribe_url}}`,
        artistId: artist.id,
        unsubscribeUrl: `https://umbrella.app/unsubscribe`,
      })

      emailsSent = emailResult.successCount + emailResult.queuedCount
    }

    // Send SMS via SMS service (falls back to mock when Twilio not configured)
    if (uniqueSmsRecipients.length > 0) {
      const smsService = getSMSService(ctx.env)

      // Add opt-out instructions to SMS (required by Twilio)
      const smsMessage = `${messageBody}\n\n- ${artist.stage_name}\n\nReply STOP to unsubscribe`

      const smsResult = await smsService.sendBroadcast({
        recipients: uniqueSmsRecipients,
        message: smsMessage,
        artistId: artist.id,
      })

      smsSent = smsResult.successCount + smsResult.queuedCount
    }

    // Determine sent_via value
    let sentVia: 'email' | 'sms' | 'both' = 'email'
    if (emailRecipients.length > 0 && smsRecipients.length > 0) {
      sentVia = 'both'
    } else if (smsRecipients.length > 0) {
      sentVia = 'sms'
    }

    // Record broadcast in broadcast_messages table
    const broadcastId = generateUUIDv4()
    const now = new Date().toISOString()

    await ctx.env.DB.prepare(
      `INSERT INTO broadcast_messages
       (id, artist_id, subject, body, recipient_count, sent_via, sent_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(broadcastId, artist.id, subject, messageBody, totalRecipients, sentVia, now, now)
      .run()

    // Return success with recipient count
    return successResponse(
      {
        id: broadcastId,
        message: 'Broadcast sent successfully',
        recipient_count: totalRecipients,
        emails_sent: emailsSent,
        sms_sent: smsSent,
        sent_at: now,
      },
      201,
      ctx.requestId
    )
  } catch (error) {
    console.error('Broadcast error:', error)

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Invalid JSON in request body',
        400,
        undefined,
        ctx.requestId
      )
    }

    // Handle database errors
    if (error instanceof Error && error.message.includes('D1_ERROR')) {
      return errorResponse(
        ErrorCodes.DATABASE_ERROR,
        'Database error while creating broadcast',
        500,
        undefined,
        ctx.requestId
      )
    }

    // Generic error
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      error instanceof Error ? error.message : 'An error occurred while creating broadcast',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Get broadcast stats
 * GET /v1/broadcasts/:id/stats
 */
export const getBroadcastStats: RouteHandler = async (ctx) => {
  if (!ctx.userId) {
    return errorResponse(
      ErrorCodes.AUTHENTICATION_FAILED,
      'Authentication required',
      401,
      undefined,
      ctx.requestId
    )
  }

  const { id } = ctx.params

  // TODO: Implement broadcast stats
  return successResponse(
    {
      id,
      sent: 0,
      delivered: 0,
      failed: 0,
      pending: 0,
    },
    200,
    ctx.requestId
  )
}

/**
 * Delete broadcast
 * DELETE /v1/broadcasts/:id
 */
export const deleteBroadcast: RouteHandler = async (ctx) => {
  if (!ctx.userId) {
    return errorResponse(
      ErrorCodes.AUTHENTICATION_FAILED,
      'Authentication required',
      401,
      undefined,
      ctx.requestId
    )
  }

  const { id } = ctx.params

  // TODO: Implement broadcast deletion (can only delete unsent broadcasts)
  return successResponse(
    {
      message: 'Broadcast deleted successfully',
    },
    200,
    ctx.requestId
  )
}
