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
