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
 * Per Task-6.1: Returns conversations with participants, context type, last message preview, unread count
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

  try {
    // Query all conversations where the user is a participant
    const conversationsQuery = `
      SELECT
        c.id,
        c.participant_1_id,
        c.participant_2_id,
        c.last_message_at,
        c.last_message_preview,
        c.unread_count_p1,
        c.unread_count_p2,
        c.created_at,
        c.updated_at
      FROM conversations c
      WHERE c.participant_1_id = ? OR c.participant_2_id = ?
      ORDER BY c.last_message_at DESC, c.created_at DESC
    `

    const conversations = await ctx.env.DB.prepare(conversationsQuery)
      .bind(ctx.userId, ctx.userId)
      .all<{
        id: string
        participant_1_id: string
        participant_2_id: string
        last_message_at: string | null
        last_message_preview: string | null
        unread_count_p1: number
        unread_count_p2: number
        created_at: string
        updated_at: string
      }>()

    if (!conversations.results || conversations.results.length === 0) {
      return successResponse(
        {
          conversations: [],
        },
        200,
        ctx.requestId
      )
    }

    // Get all unique participant IDs
    const participantIds = new Set<string>()
    conversations.results.forEach((conv) => {
      participantIds.add(conv.participant_1_id)
      participantIds.add(conv.participant_2_id)
    })

    // Fetch user and artist details for all participants
    const participantIdsArray = Array.from(participantIds)
    const placeholders = participantIdsArray.map(() => '?').join(',')

    const participantsQuery = `
      SELECT
        u.id as user_id,
        u.email,
        a.id as artist_id,
        a.stage_name,
        a.avatar_url,
        a.artist_type
      FROM users u
      LEFT JOIN artists a ON a.user_id = u.id
      WHERE u.id IN (${placeholders})
    `

    const participants = await ctx.env.DB.prepare(participantsQuery)
      .bind(...participantIdsArray)
      .all<{
        user_id: string
        email: string
        artist_id: string | null
        stage_name: string | null
        avatar_url: string | null
        artist_type: string | null
      }>()

    // Create a map of user_id -> participant info
    const participantMap = new Map<string, any>()
    participants.results?.forEach((p) => {
      participantMap.set(p.user_id, {
        userId: p.user_id,
        email: p.email,
        artistId: p.artist_id,
        name: p.stage_name || p.email.split('@')[0],
        avatarUrl: p.avatar_url,
        type: p.artist_type ? JSON.parse(p.artist_type)[0] || 'Artist' : 'User',
      })
    })

    // Format conversation data
    const formattedConversations = conversations.results.map((conv) => {
      // Determine the other participant (not the current user)
      const otherParticipantId =
        conv.participant_1_id === ctx.userId
          ? conv.participant_2_id
          : conv.participant_1_id

      const otherParticipant = participantMap.get(otherParticipantId)

      // Determine unread count for current user
      const unreadCount =
        conv.participant_1_id === ctx.userId
          ? conv.unread_count_p1
          : conv.unread_count_p2

      return {
        id: conv.id,
        participants: [
          participantMap.get(conv.participant_1_id),
          participantMap.get(conv.participant_2_id),
        ].filter(Boolean),
        otherParticipant,
        contextType: otherParticipant?.type || 'User',
        lastMessagePreview: conv.last_message_preview,
        lastMessageAt: conv.last_message_at,
        unreadCount,
        createdAt: conv.created_at,
        updatedAt: conv.updated_at,
      }
    })

    return successResponse(
      {
        conversations: formattedConversations,
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      error instanceof Error ? error.message : 'Failed to fetch conversations',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Get conversation by ID
 * GET /v1/conversations/:id
 * Per Task-6.1: Returns participant info and basic metadata
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

  try {
    // Fetch conversation and validate user is a participant
    const conversation = await ctx.env.DB.prepare(
      `SELECT
        c.id,
        c.participant_1_id,
        c.participant_2_id,
        c.last_message_at,
        c.last_message_preview,
        c.unread_count_p1,
        c.unread_count_p2,
        c.created_at,
        c.updated_at
      FROM conversations c
      WHERE c.id = ?
      AND (c.participant_1_id = ? OR c.participant_2_id = ?)`
    )
      .bind(id, ctx.userId, ctx.userId)
      .first<{
        id: string
        participant_1_id: string
        participant_2_id: string
        last_message_at: string | null
        last_message_preview: string | null
        unread_count_p1: number
        unread_count_p2: number
        created_at: string
        updated_at: string
      }>()

    if (!conversation) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Conversation not found or access denied',
        404,
        undefined,
        ctx.requestId
      )
    }

    // Fetch participant details
    const participants = await ctx.env.DB.prepare(
      `SELECT
        u.id as user_id,
        u.email,
        a.id as artist_id,
        a.stage_name,
        a.avatar_url,
        a.artist_type
      FROM users u
      LEFT JOIN artists a ON a.user_id = u.id
      WHERE u.id IN (?, ?)`
    )
      .bind(conversation.participant_1_id, conversation.participant_2_id)
      .all<{
        user_id: string
        email: string
        artist_id: string | null
        stage_name: string | null
        avatar_url: string | null
        artist_type: string | null
      }>()

    // Format participant data
    const formattedParticipants =
      participants.results?.map((p) => ({
        userId: p.user_id,
        email: p.email,
        artistId: p.artist_id,
        name: p.stage_name || p.email.split('@')[0],
        avatarUrl: p.avatar_url,
        type: p.artist_type ? JSON.parse(p.artist_type)[0] || 'Artist' : 'User',
      })) || []

    // Determine the other participant
    const otherParticipant = formattedParticipants.find(
      (p) => p.userId !== ctx.userId
    )

    // Determine unread count for current user
    const unreadCount =
      conversation.participant_1_id === ctx.userId
        ? conversation.unread_count_p1
        : conversation.unread_count_p2

    return successResponse(
      {
        id: conversation.id,
        participants: formattedParticipants,
        otherParticipant,
        contextType: otherParticipant?.type || 'User',
        lastMessagePreview: conversation.last_message_preview,
        lastMessageAt: conversation.last_message_at,
        unreadCount,
        createdAt: conversation.created_at,
        updatedAt: conversation.updated_at,
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      error instanceof Error ? error.message : 'Failed to fetch conversation',
      500,
      undefined,
      ctx.requestId
    )
  }
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
 * Per Task-6.1: Validates participants, prevents duplicates, returns conversation
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

  try {
    // Parse request body
    const body = await ctx.request.json() as { participantId: string }

    if (!body.participantId) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Participant ID is required',
        400,
        'participantId',
        ctx.requestId
      )
    }

    // Validate participant cannot be the current user
    if (body.participantId === ctx.userId) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Cannot create conversation with yourself',
        400,
        'participantId',
        ctx.requestId
      )
    }

    // Validate participant exists
    const participant = await ctx.env.DB.prepare(
      'SELECT id FROM users WHERE id = ?'
    )
      .bind(body.participantId)
      .first<{ id: string }>()

    if (!participant) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Participant not found',
        404,
        'participantId',
        ctx.requestId
      )
    }

    // Check for existing conversation between these two users
    // Since the UNIQUE constraint is on (participant_1_id, participant_2_id),
    // we need to check both orderings
    const existingConversation = await ctx.env.DB.prepare(
      `SELECT id FROM conversations
       WHERE (participant_1_id = ? AND participant_2_id = ?)
       OR (participant_1_id = ? AND participant_2_id = ?)`
    )
      .bind(ctx.userId, body.participantId, body.participantId, ctx.userId)
      .first<{ id: string }>()

    if (existingConversation) {
      // Fetch the existing conversation details
      const conversation = await ctx.env.DB.prepare(
        `SELECT
          c.id,
          c.participant_1_id,
          c.participant_2_id,
          c.last_message_at,
          c.last_message_preview,
          c.unread_count_p1,
          c.unread_count_p2,
          c.created_at,
          c.updated_at
        FROM conversations c
        WHERE c.id = ?`
      )
        .bind(existingConversation.id)
        .first<{
          id: string
          participant_1_id: string
          participant_2_id: string
          last_message_at: string | null
          last_message_preview: string | null
          unread_count_p1: number
          unread_count_p2: number
          created_at: string
          updated_at: string
        }>()

      // Fetch participant details
      const participants = await ctx.env.DB.prepare(
        `SELECT
          u.id as user_id,
          u.email,
          a.id as artist_id,
          a.stage_name,
          a.avatar_url,
          a.artist_type
        FROM users u
        LEFT JOIN artists a ON a.user_id = u.id
        WHERE u.id IN (?, ?)`
      )
        .bind(conversation!.participant_1_id, conversation!.participant_2_id)
        .all<{
          user_id: string
          email: string
          artist_id: string | null
          stage_name: string | null
          avatar_url: string | null
          artist_type: string | null
        }>()

      const formattedParticipants =
        participants.results?.map((p) => ({
          userId: p.user_id,
          email: p.email,
          artistId: p.artist_id,
          name: p.stage_name || p.email.split('@')[0],
          avatarUrl: p.avatar_url,
          type: p.artist_type ? JSON.parse(p.artist_type)[0] || 'Artist' : 'User',
        })) || []

      const otherParticipant = formattedParticipants.find(
        (p) => p.userId !== ctx.userId
      )

      const unreadCount =
        conversation!.participant_1_id === ctx.userId
          ? conversation!.unread_count_p1
          : conversation!.unread_count_p2

      return successResponse(
        {
          conversation: {
            id: conversation!.id,
            participants: formattedParticipants,
            otherParticipant,
            contextType: otherParticipant?.type || 'User',
            lastMessagePreview: conversation!.last_message_preview,
            lastMessageAt: conversation!.last_message_at,
            unreadCount,
            createdAt: conversation!.created_at,
            updatedAt: conversation!.updated_at,
          },
          isNew: false,
        },
        200,
        ctx.requestId
      )
    }

    // Create new conversation
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    const now = new Date().toISOString()

    await ctx.env.DB.prepare(
      `INSERT INTO conversations (
        id,
        participant_1_id,
        participant_2_id,
        last_message_at,
        last_message_preview,
        unread_count_p1,
        unread_count_p2,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        conversationId,
        ctx.userId,
        body.participantId,
        null,
        null,
        0,
        0,
        now,
        now
      )
      .run()

    // Fetch participant details for the response
    const participants = await ctx.env.DB.prepare(
      `SELECT
        u.id as user_id,
        u.email,
        a.id as artist_id,
        a.stage_name,
        a.avatar_url,
        a.artist_type
      FROM users u
      LEFT JOIN artists a ON a.user_id = u.id
      WHERE u.id IN (?, ?)`
    )
      .bind(ctx.userId, body.participantId)
      .all<{
        user_id: string
        email: string
        artist_id: string | null
        stage_name: string | null
        avatar_url: string | null
        artist_type: string | null
      }>()

    const formattedParticipants =
      participants.results?.map((p) => ({
        userId: p.user_id,
        email: p.email,
        artistId: p.artist_id,
        name: p.stage_name || p.email.split('@')[0],
        avatarUrl: p.avatar_url,
        type: p.artist_type ? JSON.parse(p.artist_type)[0] || 'Artist' : 'User',
      })) || []

    const otherParticipant = formattedParticipants.find(
      (p) => p.userId !== ctx.userId
    )

    return successResponse(
      {
        conversation: {
          id: conversationId,
          participants: formattedParticipants,
          otherParticipant,
          contextType: otherParticipant?.type || 'User',
          lastMessagePreview: null,
          lastMessageAt: null,
          unreadCount: 0,
          createdAt: now,
          updatedAt: now,
        },
        isNew: true,
      },
      201,
      ctx.requestId
    )
  } catch (error) {
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      error instanceof Error ? error.message : 'Failed to create conversation',
      500,
      undefined,
      ctx.requestId
    )
  }
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
