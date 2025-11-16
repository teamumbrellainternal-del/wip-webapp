/**
 * Messages controller
 * Handles messaging system (conversations and messages)
 * Per D-043: 2000 character message limit
 */

import type { RouteHandler } from '../../router'
import { successResponse, errorResponse } from '../../utils/response'
import { ErrorCodes } from '../../utils/error-codes'

/**
 * List conversations
 * GET /v1/conversations
 */
export const listConversations: RouteHandler = async (ctx) => {
  if (!ctx.userId) {
    return errorResponse(
      ErrorCodes.AUTHENTICATION_FAILED,
      'Authentication required',
      401,
      undefined,
      ctx.requestId
    )
  }

  // TODO: Implement conversation listing
  return successResponse(
    {
      conversations: [],
    },
    200,
    ctx.requestId
  )
}

/**
 * Get conversation by ID
 * GET /v1/conversations/:id
 */
export const getConversation: RouteHandler = async (ctx) => {
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
      'Conversation ID required',
      400,
      'id',
      ctx.requestId
    )
  }

  // TODO: Implement conversation retrieval
  return successResponse(
    {
      id,
      participants: [],
      messages: [],
      createdAt: new Date().toISOString(),
    },
    200,
    ctx.requestId
  )
}

/**
 * Start new conversation
 * POST /v1/conversations
 */
export const startConversation: RouteHandler = async (ctx) => {
  if (!ctx.userId) {
    return errorResponse(
      ErrorCodes.AUTHENTICATION_FAILED,
      'Authentication required',
      401,
      undefined,
      ctx.requestId
    )
  }

  // TODO: Implement conversation creation
  return successResponse(
    {
      message: 'Conversation created successfully',
      conversationId: 'new-conversation-id',
    },
    201,
    ctx.requestId
  )
}

/**
 * Send message in conversation
 * POST /v1/conversations/:id/messages
 * Per D-043: 2000 character limit
 */
export const sendMessage: RouteHandler = async (ctx) => {
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
      'Conversation ID required',
      400,
      'id',
      ctx.requestId
    )
  }

  // TODO: Validate message length (2000 chars) and save
  return successResponse(
    {
      message: 'Message sent successfully',
      messageId: 'new-message-id',
      conversationId: id,
    },
    201,
    ctx.requestId
  )
}

/**
 * Mark conversation as read
 * POST /v1/conversations/:id/read
 */
export const markAsRead: RouteHandler = async (ctx) => {
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

  // TODO: Implement mark as read
  return successResponse(
    {
      message: 'Conversation marked as read',
      conversationId: id,
    },
    200,
    ctx.requestId
  )
}

/**
 * Delete conversation
 * DELETE /v1/conversations/:id
 */
export const deleteConversation: RouteHandler = async (ctx) => {
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

  // TODO: Implement conversation deletion (soft delete)
  return successResponse(
    {
      message: 'Conversation deleted successfully',
    },
    200,
    ctx.requestId
  )
}

/**
 * Create booking inquiry (pre-filled message)
 * POST /v1/messages/booking-inquiry
 * Per D-076: Book artist opens message composer with pre-filled inquiry
 */
export const createBookingInquiry: RouteHandler = async (ctx) => {
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
    const body = await ctx.request.json() as { artist_id?: string }
    const { artist_id } = body

    // Validate artist_id
    if (!artist_id) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'artist_id is required',
        400,
        'artist_id',
        ctx.requestId
      )
    }

    // Fetch artist details
    const artist = await ctx.env.DB.prepare(
      'SELECT id, user_id, stage_name FROM artists WHERE id = ?'
    )
      .bind(artist_id)
      .first<{ id: string; user_id: string; stage_name: string }>()

    if (!artist) {
      return errorResponse(
        ErrorCodes.RESOURCE_NOT_FOUND,
        'Artist not found',
        404,
        'artist_id',
        ctx.requestId
      )
    }

    // Prevent booking yourself
    if (artist.user_id === ctx.userId) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Cannot book yourself',
        400,
        'artist_id',
        ctx.requestId
      )
    }

    // Fetch requesting user details
    const user = await ctx.env.DB.prepare(
      'SELECT id, email FROM users WHERE id = ?'
    )
      .bind(ctx.userId)
      .first<{ id: string; email: string }>()

    if (!user) {
      return errorResponse(
        ErrorCodes.AUTHENTICATION_FAILED,
        'User not found',
        401,
        undefined,
        ctx.requestId
      )
    }

    // Check for existing conversation
    // Note: conversations table uses unique(participant_1_id, participant_2_id)
    // We need to check both orderings since the constraint is directional
    let conversation = await ctx.env.DB.prepare(
      `SELECT id FROM conversations
       WHERE (participant_1_id = ? AND participant_2_id = ?)
          OR (participant_1_id = ? AND participant_2_id = ?)`
    )
      .bind(ctx.userId, artist.user_id, artist.user_id, ctx.userId)
      .first<{ id: string }>()

    // Create conversation if it doesn't exist
    if (!conversation) {
      const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      const now = new Date().toISOString()

      await ctx.env.DB.prepare(
        `INSERT INTO conversations (
          id, participant_1_id, participant_2_id,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?)`
      )
        .bind(conversationId, ctx.userId, artist.user_id, now, now)
        .run()

      conversation = { id: conversationId }
    }

    // Generate pre-filled message template
    const userDisplayName = user.email.split('@')[0] // Use email prefix as display name
    const preFillContent = `Hi ${artist.stage_name}, I'd like to discuss booking you for an upcoming event. Here are the details I have in mind:\n\n- Event Type: \n- Date: \n- Location: \n- Budget: \n- Additional Details: \n\nLooking forward to hearing from you!`

    // Create the pre-filled message
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    const now = new Date().toISOString()

    await ctx.env.DB.prepare(
      `INSERT INTO messages (
        id, conversation_id, sender_id, content, created_at
      ) VALUES (?, ?, ?, ?, ?)`
    )
      .bind(messageId, conversation.id, ctx.userId, preFillContent, now)
      .run()

    // Update conversation with last message info
    await ctx.env.DB.prepare(
      `UPDATE conversations
       SET last_message_at = ?,
           last_message_preview = ?,
           unread_count_p2 = unread_count_p2 + 1,
           updated_at = ?
       WHERE id = ?`
    )
      .bind(now, preFillContent.substring(0, 100), now, conversation.id)
      .run()

    // Return conversation and message details
    return successResponse(
      {
        conversation_id: conversation.id,
        message_id: messageId,
        pre_filled_content: preFillContent,
        artist_name: artist.stage_name,
      },
      201,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error creating booking inquiry:', error)
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to create booking inquiry',
      500,
      undefined,
      ctx.requestId
    )
  }
}
