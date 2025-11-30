/**
 * Connections controller
 * Handles LinkedIn-style mutual connection requests
 */

import type { RouteHandler } from '../../router'
import { successResponse, errorResponse } from '../../utils/response'
import { ErrorCodes } from '../../utils/error-codes'
import { generateUUIDv4 } from '../../utils/uuid'
import { logger } from '../../utils/logger'
import { createResendService } from '../../services/resend'

// 30-day cooldown in milliseconds for declined connection retries
const DECLINE_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000

/**
 * Send connection request
 * POST /v1/connections/:userId
 */
export const sendRequest: RouteHandler = async (ctx) => {
  logger.info('sendRequest', { userId: ctx.userId, targetUserId: ctx.params.userId })
  
  if (!ctx.userId) {
    return errorResponse(
      ErrorCodes.AUTHENTICATION_FAILED,
      'Authentication required',
      401,
      undefined,
      ctx.requestId
    )
  }

  const { userId: targetUserId } = ctx.params

  if (!targetUserId) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'Target user ID required',
      400,
      'userId',
      ctx.requestId
    )
  }

  // Prevent self-connection
  if (ctx.userId === targetUserId) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'You cannot connect with yourself',
      400,
      undefined,
      ctx.requestId
    )
  }

  try {
    // 1. Verify target user exists
    const targetUser = await ctx.env.DB.prepare(
      'SELECT id, email FROM users WHERE id = ?'
    )
      .bind(targetUserId)
      .first<{ id: string; email: string }>()

    if (!targetUser) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'User not found',
        404,
        'userId',
        ctx.requestId
      )
    }

    // 2. Check for existing connection (in either direction)
    const existingConnection = await ctx.env.DB.prepare(`
      SELECT id, status, requester_user_id, declined_at 
      FROM user_connections 
      WHERE (requester_user_id = ? AND recipient_user_id = ?)
         OR (requester_user_id = ? AND recipient_user_id = ?)
    `)
      .bind(ctx.userId, targetUserId, targetUserId, ctx.userId)
      .first<{ id: string; status: string; requester_user_id: string; declined_at: string | null }>()

    if (existingConnection) {
      // Already connected
      if (existingConnection.status === 'accepted') {
        return errorResponse(
          ErrorCodes.CONFLICT,
          'You are already connected with this user',
          409,
          undefined,
          ctx.requestId
        )
      }

      // Pending request exists
      if (existingConnection.status === 'pending') {
        // If they sent the request to us, inform to accept instead
        if (existingConnection.requester_user_id === targetUserId) {
          return errorResponse(
            ErrorCodes.CONFLICT,
            'This user has already sent you a connection request. Accept it instead.',
            409,
            undefined,
            ctx.requestId
          )
        }
        // We already sent a request
        return errorResponse(
          ErrorCodes.CONFLICT,
          'You already have a pending connection request to this user',
          409,
          undefined,
          ctx.requestId
        )
      }

      // Previously declined - check cooldown
      if (existingConnection.status === 'declined' && existingConnection.declined_at) {
        const declinedTime = new Date(existingConnection.declined_at).getTime()
        const now = Date.now()
        
        if (now - declinedTime < DECLINE_COOLDOWN_MS) {
          const daysRemaining = Math.ceil((DECLINE_COOLDOWN_MS - (now - declinedTime)) / (24 * 60 * 60 * 1000))
          return errorResponse(
            ErrorCodes.CONFLICT,
            `Connection was previously declined. You can send another request in ${daysRemaining} days.`,
            409,
            undefined,
            ctx.requestId
          )
        }
        
        // Cooldown passed - delete old record and allow new request
        await ctx.env.DB.prepare('DELETE FROM user_connections WHERE id = ?')
          .bind(existingConnection.id)
          .run()
      }
    }

    // 3. Create connection request
    const connectionId = generateUUIDv4()
    const now = new Date().toISOString()

    await ctx.env.DB.prepare(`
      INSERT INTO user_connections (id, requester_user_id, recipient_user_id, status, created_at, updated_at)
      VALUES (?, ?, ?, 'pending', ?, ?)
    `)
      .bind(connectionId, ctx.userId, targetUserId, now, now)
      .run()

    // 4. Create in-app notification for recipient
    const requesterArtist = await ctx.env.DB.prepare(
      'SELECT id, stage_name, avatar_url FROM artists WHERE user_id = ?'
    )
      .bind(ctx.userId)
      .first<{ id: string; stage_name: string; avatar_url: string | null }>()

    const notificationId = generateUUIDv4()
    const notificationData = JSON.stringify({
      connection_id: connectionId,
      from_user_id: ctx.userId,
      from_artist_id: requesterArtist?.id, // Artist profile ID for navigation
      from_artist_name: requesterArtist?.stage_name || 'Someone',
    })

    await ctx.env.DB.prepare(`
      INSERT INTO notifications (id, user_id, type, title, body, data, read, created_at)
      VALUES (?, ?, 'connection_request', ?, ?, ?, 0, ?)
    `)
      .bind(
        notificationId,
        targetUserId,
        'New connection request',
        `${requesterArtist?.stage_name || 'Someone'} wants to connect with you`,
        notificationData,
        now
      )
      .run()

    // 5. Send email notification (non-blocking)
    try {
      if (ctx.env.RESEND_API_KEY && requesterArtist?.id) {
        const emailService = createResendService(ctx.env.RESEND_API_KEY, ctx.env.DB)
        await emailService.sendTransactional('connection_request', targetUser.email, {
          requesterName: requesterArtist.stage_name || 'Someone',
          profileUrl: `https://app.umbrellalive.com/artist/${requesterArtist.id}`,
        })
      }
    } catch (emailError) {
      logger.error('sendRequest:email_failed', { error: emailError })
      // Don't fail the request if email fails
    }

    logger.info('sendRequest:success', { connectionId, from: ctx.userId, to: targetUserId })

    return successResponse(
      {
        message: 'Connection request sent',
        connectionId,
        status: 'pending',
      },
      201,
      ctx.requestId
    )
  } catch (error) {
    logger.error('sendRequest:error', { error })
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      'Failed to send connection request',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * List accepted connections
 * GET /v1/connections
 */
export const listConnections: RouteHandler = async (ctx) => {
  logger.info('listConnections', { userId: ctx.userId })
  
  if (!ctx.userId) {
    return errorResponse(
      ErrorCodes.AUTHENTICATION_FAILED,
      'Authentication required',
      401,
      undefined,
      ctx.requestId
    )
  }

  const limit = parseInt(ctx.url.searchParams.get('limit') || '50')
  const offset = parseInt(ctx.url.searchParams.get('offset') || '0')

  try {
    // Get connections where status is accepted (in either direction)
    const connections = await ctx.env.DB.prepare(`
      SELECT 
        uc.id as connection_id,
        uc.created_at as connected_at,
        CASE 
          WHEN uc.requester_user_id = ? THEN uc.recipient_user_id 
          ELSE uc.requester_user_id 
        END as connected_user_id,
        a.id as artist_id,
        a.stage_name as artist_name,
        a.avatar_url,
        a.location_city,
        a.location_state,
        a.primary_genre
      FROM user_connections uc
      LEFT JOIN artists a ON (
        CASE 
          WHEN uc.requester_user_id = ? THEN uc.recipient_user_id 
          ELSE uc.requester_user_id 
        END = a.user_id
      )
      WHERE (uc.requester_user_id = ? OR uc.recipient_user_id = ?)
        AND uc.status = 'accepted'
      ORDER BY uc.updated_at DESC
      LIMIT ? OFFSET ?
    `)
      .bind(ctx.userId, ctx.userId, ctx.userId, ctx.userId, limit, offset)
      .all()

    const countResult = await ctx.env.DB.prepare(`
      SELECT COUNT(*) as count FROM user_connections 
      WHERE (requester_user_id = ? OR recipient_user_id = ?) AND status = 'accepted'
    `)
      .bind(ctx.userId, ctx.userId)
      .first<{ count: number }>()

    return successResponse(
      {
        connections: connections.results || [],
        total: countResult?.count || 0,
        limit,
        offset,
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    logger.error('listConnections:error', { error })
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      'Failed to fetch connections',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * List pending connection requests (received)
 * GET /v1/connections/pending
 */
export const listPending: RouteHandler = async (ctx) => {
  logger.info('listPending', { userId: ctx.userId })
  
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
    const pending = await ctx.env.DB.prepare(`
      SELECT 
        uc.id as connection_id,
        uc.requester_user_id,
        uc.created_at,
        a.id as artist_id,
        a.stage_name as artist_name,
        a.avatar_url,
        a.location_city,
        a.location_state,
        a.primary_genre
      FROM user_connections uc
      LEFT JOIN artists a ON uc.requester_user_id = a.user_id
      WHERE uc.recipient_user_id = ? AND uc.status = 'pending'
      ORDER BY uc.created_at DESC
    `)
      .bind(ctx.userId)
      .all()

    return successResponse(
      {
        requests: pending.results || [],
        count: pending.results?.length || 0,
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    logger.error('listPending:error', { error })
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      'Failed to fetch pending requests',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * List sent connection requests (outgoing pending)
 * GET /v1/connections/sent
 */
export const listSent: RouteHandler = async (ctx) => {
  logger.info('listSent', { userId: ctx.userId })
  
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
    const sent = await ctx.env.DB.prepare(`
      SELECT 
        uc.id as connection_id,
        uc.recipient_user_id,
        uc.created_at,
        a.id as artist_id,
        a.stage_name as artist_name,
        a.avatar_url,
        a.location_city,
        a.location_state,
        a.primary_genre
      FROM user_connections uc
      LEFT JOIN artists a ON uc.recipient_user_id = a.user_id
      WHERE uc.requester_user_id = ? AND uc.status = 'pending'
      ORDER BY uc.created_at DESC
    `)
      .bind(ctx.userId)
      .all()

    return successResponse(
      {
        requests: sent.results || [],
        count: sent.results?.length || 0,
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    logger.error('listSent:error', { error })
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      'Failed to fetch sent requests',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Accept connection request
 * PUT /v1/connections/:requestId/accept
 */
export const acceptRequest: RouteHandler = async (ctx) => {
  logger.info('acceptRequest', { userId: ctx.userId, requestId: ctx.params.requestId })
  
  if (!ctx.userId) {
    return errorResponse(
      ErrorCodes.AUTHENTICATION_FAILED,
      'Authentication required',
      401,
      undefined,
      ctx.requestId
    )
  }

  const { requestId } = ctx.params

  if (!requestId) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'Request ID required',
      400,
      'requestId',
      ctx.requestId
    )
  }

  try {
    // 1. Get the connection request
    const connection = await ctx.env.DB.prepare(`
      SELECT id, requester_user_id, recipient_user_id, status
      FROM user_connections WHERE id = ?
    `)
      .bind(requestId)
      .first<{ id: string; requester_user_id: string; recipient_user_id: string; status: string }>()

    if (!connection) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Connection request not found',
        404,
        'requestId',
        ctx.requestId
      )
    }

    // 2. Verify the current user is the recipient
    if (connection.recipient_user_id !== ctx.userId) {
      return errorResponse(
        ErrorCodes.AUTHORIZATION_FAILED,
        'You can only accept requests sent to you',
        403,
        undefined,
        ctx.requestId
      )
    }

    // 3. Verify it's pending
    if (connection.status !== 'pending') {
      return errorResponse(
        ErrorCodes.CONFLICT,
        `Request is already ${connection.status}`,
        409,
        undefined,
        ctx.requestId
      )
    }

    const now = new Date().toISOString()

    // 4. Update connection status
    await ctx.env.DB.prepare(`
      UPDATE user_connections SET status = 'accepted', updated_at = ? WHERE id = ?
    `)
      .bind(now, requestId)
      .run()

    // 5. Increment connection_count for both users
    // Use COALESCE to handle NULL values (NULL + 1 = NULL in SQLite)
    await ctx.env.DB.prepare(`
      UPDATE artists SET connection_count = COALESCE(connection_count, 0) + 1 
      WHERE user_id IN (?, ?)
    `)
      .bind(ctx.userId, connection.requester_user_id)
      .run()

    // 6. Create notification for the requester
    const accepterArtist = await ctx.env.DB.prepare(
      'SELECT id, stage_name FROM artists WHERE user_id = ?'
    )
      .bind(ctx.userId)
      .first<{ id: string; stage_name: string }>()

    const notificationId = generateUUIDv4()
    const notificationData = JSON.stringify({
      connection_id: requestId,
      from_user_id: ctx.userId,
      from_artist_id: accepterArtist?.id, // Artist profile ID for navigation
    })

    await ctx.env.DB.prepare(`
      INSERT INTO notifications (id, user_id, type, title, body, data, read, created_at)
      VALUES (?, ?, 'connection_accepted', ?, ?, ?, 0, ?)
    `)
      .bind(
        notificationId,
        connection.requester_user_id,
        'Connection accepted!',
        `${accepterArtist?.stage_name || 'Someone'} accepted your connection request`,
        notificationData,
        now
      )
      .run()

    // 7. Send email notification (non-blocking)
    try {
      const requesterUser = await ctx.env.DB.prepare('SELECT email FROM users WHERE id = ?')
        .bind(connection.requester_user_id)
        .first<{ email: string }>()

      if (requesterUser && ctx.env.RESEND_API_KEY && accepterArtist?.id) {
        const emailService = createResendService(ctx.env.RESEND_API_KEY, ctx.env.DB)
        await emailService.sendTransactional('connection_accepted', requesterUser.email, {
          accepterName: accepterArtist.stage_name || 'Someone',
          profileUrl: `https://app.umbrellalive.com/artist/${accepterArtist.id}`,
        })
      }
    } catch (emailError) {
      logger.error('acceptRequest:email_failed', { error: emailError })
    }

    logger.info('acceptRequest:success', { requestId })

    return successResponse(
      {
        message: 'Connection accepted',
        connectionId: requestId,
        status: 'accepted',
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    logger.error('acceptRequest:error', { error })
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      'Failed to accept connection',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Decline connection request
 * PUT /v1/connections/:requestId/decline
 */
export const declineRequest: RouteHandler = async (ctx) => {
  logger.info('declineRequest', { userId: ctx.userId, requestId: ctx.params.requestId })
  
  if (!ctx.userId) {
    return errorResponse(
      ErrorCodes.AUTHENTICATION_FAILED,
      'Authentication required',
      401,
      undefined,
      ctx.requestId
    )
  }

  const { requestId } = ctx.params

  if (!requestId) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'Request ID required',
      400,
      'requestId',
      ctx.requestId
    )
  }

  try {
    // 1. Get the connection request
    const connection = await ctx.env.DB.prepare(`
      SELECT id, requester_user_id, recipient_user_id, status
      FROM user_connections WHERE id = ?
    `)
      .bind(requestId)
      .first<{ id: string; requester_user_id: string; recipient_user_id: string; status: string }>()

    if (!connection) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Connection request not found',
        404,
        'requestId',
        ctx.requestId
      )
    }

    // 2. Verify the current user is the recipient
    if (connection.recipient_user_id !== ctx.userId) {
      return errorResponse(
        ErrorCodes.AUTHORIZATION_FAILED,
        'You can only decline requests sent to you',
        403,
        undefined,
        ctx.requestId
      )
    }

    // 3. Verify it's pending
    if (connection.status !== 'pending') {
      return errorResponse(
        ErrorCodes.CONFLICT,
        `Request is already ${connection.status}`,
        409,
        undefined,
        ctx.requestId
      )
    }

    const now = new Date().toISOString()

    // 4. Update connection status with declined_at timestamp for cooldown tracking
    await ctx.env.DB.prepare(`
      UPDATE user_connections SET status = 'declined', declined_at = ?, updated_at = ? WHERE id = ?
    `)
      .bind(now, now, requestId)
      .run()

    logger.info('declineRequest:success', { requestId })

    return successResponse(
      {
        message: 'Connection request declined',
        connectionId: requestId,
        status: 'declined',
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    logger.error('declineRequest:error', { error })
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      'Failed to decline connection',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Remove an existing connection
 * DELETE /v1/connections/:userId
 */
export const removeConnection: RouteHandler = async (ctx) => {
  logger.info('removeConnection', { userId: ctx.userId, targetUserId: ctx.params.userId })
  
  if (!ctx.userId) {
    return errorResponse(
      ErrorCodes.AUTHENTICATION_FAILED,
      'Authentication required',
      401,
      undefined,
      ctx.requestId
    )
  }

  const { userId: targetUserId } = ctx.params

  if (!targetUserId) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'Target user ID required',
      400,
      'userId',
      ctx.requestId
    )
  }

  try {
    // 1. Find the accepted connection
    const connection = await ctx.env.DB.prepare(`
      SELECT id FROM user_connections 
      WHERE ((requester_user_id = ? AND recipient_user_id = ?)
          OR (requester_user_id = ? AND recipient_user_id = ?))
        AND status = 'accepted'
    `)
      .bind(ctx.userId, targetUserId, targetUserId, ctx.userId)
      .first<{ id: string }>()

    if (!connection) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Connection not found',
        404,
        undefined,
        ctx.requestId
      )
    }

    // 2. Delete the connection
    await ctx.env.DB.prepare('DELETE FROM user_connections WHERE id = ?')
      .bind(connection.id)
      .run()

    // 3. Decrement connection_count for both users
    // Use COALESCE to handle NULL values
    await ctx.env.DB.prepare(`
      UPDATE artists SET connection_count = MAX(COALESCE(connection_count, 0) - 1, 0) 
      WHERE user_id IN (?, ?)
    `)
      .bind(ctx.userId, targetUserId)
      .run()

    logger.info('removeConnection:success', { connectionId: connection.id })

    return successResponse(
      {
        message: 'Connection removed',
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    logger.error('removeConnection:error', { error })
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      'Failed to remove connection',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Get connection status with a specific user
 * GET /v1/connections/:userId/status
 */
export const getStatus: RouteHandler = async (ctx) => {
  logger.info('getStatus', { userId: ctx.userId, targetUserId: ctx.params.userId })
  
  if (!ctx.userId) {
    return errorResponse(
      ErrorCodes.AUTHENTICATION_FAILED,
      'Authentication required',
      401,
      undefined,
      ctx.requestId
    )
  }

  const { userId: targetUserId } = ctx.params

  if (!targetUserId) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'Target user ID required',
      400,
      'userId',
      ctx.requestId
    )
  }

  // Self check
  if (ctx.userId === targetUserId) {
    return successResponse(
      {
        status: 'self',
        connection_id: null,
      },
      200,
      ctx.requestId
    )
  }

  try {
    const connection = await ctx.env.DB.prepare(`
      SELECT id, status, requester_user_id, recipient_user_id
      FROM user_connections 
      WHERE (requester_user_id = ? AND recipient_user_id = ?)
         OR (requester_user_id = ? AND recipient_user_id = ?)
    `)
      .bind(ctx.userId, targetUserId, targetUserId, ctx.userId)
      .first<{ id: string; status: string; requester_user_id: string; recipient_user_id: string }>()

    if (!connection) {
      return successResponse(
        {
          status: 'none',
          connection_id: null,
        },
        200,
        ctx.requestId
      )
    }

    // Determine the status from current user's perspective
    let status: string
    if (connection.status === 'accepted') {
      status = 'connected'
    } else if (connection.status === 'pending') {
      status = connection.requester_user_id === ctx.userId ? 'pending_sent' : 'pending_received'
    } else {
      status = 'none' // declined treated as none for UI purposes
    }

    return successResponse(
      {
        status,
        connection_id: connection.id,
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    logger.error('getStatus:error', { error })
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      'Failed to get connection status',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Get mutual connections with a user
 * GET /v1/connections/:userId/mutual
 */
export const getMutualConnections: RouteHandler = async (ctx) => {
  logger.info('getMutualConnections', { userId: ctx.userId, targetUserId: ctx.params.userId })
  
  if (!ctx.userId) {
    return errorResponse(
      ErrorCodes.AUTHENTICATION_FAILED,
      'Authentication required',
      401,
      undefined,
      ctx.requestId
    )
  }

  const { userId: targetUserId } = ctx.params

  if (!targetUserId) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'Target user ID required',
      400,
      'userId',
      ctx.requestId
    )
  }

  try {
    // Find users who are connected to both the current user AND the target user
    const mutualConnections = await ctx.env.DB.prepare(`
      SELECT DISTINCT
        a.user_id,
        a.id as artist_id,
        a.stage_name as artist_name,
        a.avatar_url
      FROM artists a
      WHERE a.user_id IN (
        -- Users connected to current user
        SELECT CASE 
          WHEN requester_user_id = ? THEN recipient_user_id 
          ELSE requester_user_id 
        END
        FROM user_connections
        WHERE (requester_user_id = ? OR recipient_user_id = ?)
          AND status = 'accepted'
      )
      AND a.user_id IN (
        -- Users connected to target user
        SELECT CASE 
          WHEN requester_user_id = ? THEN recipient_user_id 
          ELSE requester_user_id 
        END
        FROM user_connections
        WHERE (requester_user_id = ? OR recipient_user_id = ?)
          AND status = 'accepted'
      )
      AND a.user_id != ?
      AND a.user_id != ?
      LIMIT 10
    `)
      .bind(
        ctx.userId, ctx.userId, ctx.userId,
        targetUserId, targetUserId, targetUserId,
        ctx.userId, targetUserId
      )
      .all()

    return successResponse(
      {
        mutual_connections: mutualConnections.results || [],
        count: mutualConnections.results?.length || 0,
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    logger.error('getMutualConnections:error', { error })
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      'Failed to get mutual connections',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Cancel a sent connection request (withdraw)
 * DELETE /v1/connections/:requestId/cancel
 */
export const cancelRequest: RouteHandler = async (ctx) => {
  logger.info('cancelRequest', { userId: ctx.userId, requestId: ctx.params.requestId })
  
  if (!ctx.userId) {
    return errorResponse(
      ErrorCodes.AUTHENTICATION_FAILED,
      'Authentication required',
      401,
      undefined,
      ctx.requestId
    )
  }

  const { requestId } = ctx.params

  if (!requestId) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'Request ID required',
      400,
      'requestId',
      ctx.requestId
    )
  }

  try {
    // 1. Get the connection request
    const connection = await ctx.env.DB.prepare(`
      SELECT id, requester_user_id, status
      FROM user_connections WHERE id = ?
    `)
      .bind(requestId)
      .first<{ id: string; requester_user_id: string; status: string }>()

    if (!connection) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Connection request not found',
        404,
        'requestId',
        ctx.requestId
      )
    }

    // 2. Verify the current user is the requester (can only cancel own requests)
    if (connection.requester_user_id !== ctx.userId) {
      return errorResponse(
        ErrorCodes.AUTHORIZATION_FAILED,
        'You can only cancel your own requests',
        403,
        undefined,
        ctx.requestId
      )
    }

    // 3. Verify it's pending
    if (connection.status !== 'pending') {
      return errorResponse(
        ErrorCodes.CONFLICT,
        `Cannot cancel - request is already ${connection.status}`,
        409,
        undefined,
        ctx.requestId
      )
    }

    // 4. Delete the request
    await ctx.env.DB.prepare('DELETE FROM user_connections WHERE id = ?')
      .bind(requestId)
      .run()

    logger.info('cancelRequest:success', { requestId })

    return successResponse(
      {
        message: 'Connection request cancelled',
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    logger.error('cancelRequest:error', { error })
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      'Failed to cancel request',
      500,
      undefined,
      ctx.requestId
    )
  }
}

