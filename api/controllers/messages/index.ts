/**
 * Messages controller
 * Handles messaging system (conversations and messages)
 * Per D-043: 2000 character message limit
 */

import type { RouteHandler } from '../../router'
import { successResponse, errorResponse } from '../../utils/response'
import { ErrorCodes } from '../../utils/error-codes'
import { generateUUIDv4 } from '../../utils/uuid'
import { validateMessageLength } from '../../models/message'
import type { Conversation } from '../../models/conversation'
import type { Message } from '../../models/message'
import { createResendService } from '../../services/resend'

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
 * Get messages in conversation
 * GET /v1/conversations/:id/messages
 */
export const getMessages: RouteHandler = async (ctx) => {
  if (!ctx.userId) {
    return errorResponse(
      ErrorCodes.AUTHENTICATION_FAILED,
      'Authentication required',
      401,
      undefined,
      ctx.requestId
    )
  }

  const { id: conversationId } = ctx.params

  if (!conversationId) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'Conversation ID required',
      400,
      'id',
      ctx.requestId
    )
  }

  try {
    // Verify conversation exists and user is a participant
    const conversation = await ctx.env.DB.prepare(
      'SELECT * FROM conversations WHERE id = ?'
    )
      .bind(conversationId)
      .first<Conversation>()

    if (!conversation) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Conversation not found',
        404,
        undefined,
        ctx.requestId
      )
    }

    // Verify user is a participant
    if (conversation.participant_1_id !== ctx.userId && conversation.participant_2_id !== ctx.userId) {
      return errorResponse(
        ErrorCodes.FORBIDDEN,
        'You are not a participant in this conversation',
        403,
        undefined,
        ctx.requestId
      )
    }

    // Fetch messages ordered by created_at ASC (chronological)
    const messagesResult = await ctx.env.DB.prepare(
      `SELECT m.*, u.email as sender_email
       FROM messages m
       LEFT JOIN users u ON m.sender_id = u.id
       WHERE m.conversation_id = ?
       ORDER BY m.created_at ASC`
    )
      .bind(conversationId)
      .all()

    const messages = messagesResult.results || []

    // Get participant info for context
    const participants = await ctx.env.DB.prepare(
      `SELECT u.id, u.email, a.stage_name, a.avatar_url
       FROM users u
       LEFT JOIN artists a ON u.id = a.user_id
       WHERE u.id IN (?, ?)`
    )
      .bind(conversation.participant_1_id, conversation.participant_2_id)
      .all()

    const participantMap = new Map(
      (participants.results || []).map((p: any) => [p.id, p])
    )

    // Enrich messages with sender info
    const enrichedMessages = messages.map((msg: any) => {
      const sender = participantMap.get(msg.sender_id)
      return {
        id: msg.id,
        conversation_id: msg.conversation_id,
        sender_id: msg.sender_id,
        sender_name: sender?.stage_name || sender?.email || 'Unknown',
        sender_avatar: sender?.avatar_url || null,
        content: msg.content,
        attachment_url: msg.attachment_url,
        attachment_filename: msg.attachment_filename,
        attachment_size: msg.attachment_size,
        read: msg.read === 1,
        created_at: msg.created_at,
      }
    })

    return successResponse(
      {
        messages: enrichedMessages,
        conversation_id: conversationId,
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error fetching messages:', error)
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to fetch messages',
      500,
      undefined,
      ctx.requestId
    )
  }
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

  const { id: conversationId } = ctx.params

  if (!conversationId) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'Conversation ID required',
      400,
      'id',
      ctx.requestId
    )
  }

  try {
    // Parse request body
    const body = await ctx.request.json()
    const { content, attachment_url, attachment_filename, attachment_size } = body

    // Validate message content
    if (!content || typeof content !== 'string') {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Message content is required',
        400,
        'content',
        ctx.requestId
      )
    }

    // Validate message length (D-043: 2000 char limit)
    if (!validateMessageLength(content)) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Message must be between 1 and 2000 characters',
        400,
        'content',
        ctx.requestId
      )
    }

    // Verify conversation exists and user is a participant
    const conversation = await ctx.env.DB.prepare(
      'SELECT * FROM conversations WHERE id = ?'
    )
      .bind(conversationId)
      .first<Conversation>()

    if (!conversation) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Conversation not found',
        404,
        undefined,
        ctx.requestId
      )
    }

    // Verify user is a participant
    if (conversation.participant_1_id !== ctx.userId && conversation.participant_2_id !== ctx.userId) {
      return errorResponse(
        ErrorCodes.FORBIDDEN,
        'You are not a participant in this conversation',
        403,
        undefined,
        ctx.requestId
      )
    }

    // Create message
    const messageId = generateUUIDv4()
    const now = new Date().toISOString()

    await ctx.env.DB.prepare(
      `INSERT INTO messages (id, conversation_id, sender_id, content, attachment_url, attachment_filename, attachment_size, read, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        messageId,
        conversationId,
        ctx.userId,
        content,
        attachment_url || null,
        attachment_filename || null,
        attachment_size || null,
        0,
        now
      )
      .run()

    // Update conversation: last_message_at, last_message_preview, and increment unread count for recipient
    const messagePreview = content.length > 100 ? content.substring(0, 100) + '...' : content
    const recipientId = conversation.participant_1_id === ctx.userId
      ? conversation.participant_2_id
      : conversation.participant_1_id

    // Determine which unread count to increment
    const unreadField = conversation.participant_1_id === recipientId
      ? 'unread_count_p1'
      : 'unread_count_p2'

    await ctx.env.DB.prepare(
      `UPDATE conversations
       SET last_message_at = ?,
           last_message_preview = ?,
           ${unreadField} = ${unreadField} + 1,
           updated_at = ?
       WHERE id = ?`
    )
      .bind(now, messagePreview, now, conversationId)
      .run()

    // Send email notification to recipient via Resend
    try {
      const recipient = await ctx.env.DB.prepare(
        'SELECT u.email, a.stage_name FROM users u LEFT JOIN artists a ON u.id = a.user_id WHERE u.id = ?'
      )
        .bind(recipientId)
        .first()

      const sender = await ctx.env.DB.prepare(
        'SELECT u.email, a.stage_name FROM users u LEFT JOIN artists a ON u.id = a.user_id WHERE u.id = ?'
      )
        .bind(ctx.userId)
        .first()

      if (recipient && sender && recipient.email) {
        const resendService = createResendService(ctx.env.RESEND_API_KEY, ctx.env.DB)
        await resendService.sendTransactional(
          'message_notification',
          recipient.email,
          {
            senderName: sender.stage_name || sender.email || 'Someone',
            messagePreview: messagePreview,
            conversationUrl: `https://umbrella.app/messages/${conversationId}`,
          }
        )
      }
    } catch (emailError) {
      // Log but don't fail the request if email fails
      console.error('Failed to send email notification:', emailError)
    }

    // Fetch the created message with sender info
    const createdMessage = await ctx.env.DB.prepare(
      `SELECT m.*, u.email as sender_email, a.stage_name as sender_name, a.avatar_url as sender_avatar
       FROM messages m
       LEFT JOIN users u ON m.sender_id = u.id
       LEFT JOIN artists a ON u.id = a.user_id
       WHERE m.id = ?`
    )
      .bind(messageId)
      .first()

    return successResponse(
      {
        message: createdMessage,
      },
      201,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error sending message:', error)
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to send message',
      500,
      undefined,
      ctx.requestId
    )
  }
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

  const { id: conversationId } = ctx.params

  if (!conversationId) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'Conversation ID required',
      400,
      'id',
      ctx.requestId
    )
  }

  try {
    // Verify conversation exists and user is a participant
    const conversation = await ctx.env.DB.prepare(
      'SELECT * FROM conversations WHERE id = ?'
    )
      .bind(conversationId)
      .first<Conversation>()

    if (!conversation) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Conversation not found',
        404,
        undefined,
        ctx.requestId
      )
    }

    // Verify user is a participant
    if (conversation.participant_1_id !== ctx.userId && conversation.participant_2_id !== ctx.userId) {
      return errorResponse(
        ErrorCodes.FORBIDDEN,
        'You are not a participant in this conversation',
        403,
        undefined,
        ctx.requestId
      )
    }

    // Mark all messages as read for this user
    await ctx.env.DB.prepare(
      `UPDATE messages
       SET read = 1
       WHERE conversation_id = ?
       AND sender_id != ?`
    )
      .bind(conversationId, ctx.userId)
      .run()

    // Reset unread count for this user in the conversation
    const unreadField = conversation.participant_1_id === ctx.userId
      ? 'unread_count_p1'
      : 'unread_count_p2'

    await ctx.env.DB.prepare(
      `UPDATE conversations
       SET ${unreadField} = 0,
           updated_at = ?
       WHERE id = ?`
    )
      .bind(new Date().toISOString(), conversationId)
      .run()

    return successResponse(
      {
        message: 'Conversation marked as read',
        conversation_id: conversationId,
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error marking conversation as read:', error)
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to mark conversation as read',
      500,
      undefined,
      ctx.requestId
    )
  }
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
