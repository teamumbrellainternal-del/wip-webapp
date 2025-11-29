/**
 * Pusher Authentication Controller
 * Handles private channel authentication for real-time messaging
 * 
 * Private channels (prefixed with 'private-') require server-side authentication.
 * This endpoint validates user access to channels before granting subscription rights.
 */

import type { RouteHandler } from '../../router'
import { successResponse, errorResponse } from '../../utils/response'
import { ErrorCodes } from '../../utils/error-codes'
import { logger } from '../../utils/logger'

/**
 * Generate HMAC-SHA256 signature for Pusher authentication
 * Uses Web Crypto API (available in Cloudflare Workers)
 */
async function generatePusherSignature(secret: string, stringToSign: string): Promise<string> {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const messageData = encoder.encode(stringToSign)

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData)

  // Convert to hex string
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Extract conversation ID from channel name
 * Channel format: private-conversation-{conversationId}
 */
function extractConversationId(channelName: string): string | null {
  const match = channelName.match(/^private-conversation-(.+)$/)
  return match ? match[1] : null
}

/**
 * Extract user ID from channel name
 * Channel format: private-user-{userId}
 */
function extractUserId(channelName: string): string | null {
  const match = channelName.match(/^private-user-(.+)$/)
  return match ? match[1] : null
}

/**
 * Authenticate Pusher private channel subscription
 * POST /v1/pusher/auth
 * 
 * Called automatically by Pusher client when subscribing to private channels.
 * Validates user has access to the requested channel and returns signed auth token.
 * 
 * Request body (form-encoded by Pusher client):
 * - socket_id: The Pusher socket connection ID
 * - channel_name: The channel being subscribed to (e.g., private-conversation-{id})
 * 
 * Response:
 * - auth: "{pusher_key}:{signature}" - signed token for Pusher validation
 */
export const authenticate: RouteHandler = async (ctx) => {
  const startTime = Date.now()

  // Verify user is authenticated
  if (!ctx.userId) {
    logger.warn('PusherController', 'authenticate', 'Unauthenticated Pusher auth attempt')
    return errorResponse(
      ErrorCodes.AUTHENTICATION_FAILED,
      'Authentication required',
      401,
      undefined,
      ctx.requestId
    )
  }

  // Check Pusher credentials are configured
  const pusherKey = ctx.env.PUSHER_KEY
  const pusherSecret = ctx.env.PUSHER_SECRET

  if (!pusherKey || !pusherSecret) {
    logger.error('PusherController', 'authenticate', 'Pusher credentials not configured')
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Real-time messaging not configured',
      500,
      undefined,
      ctx.requestId
    )
  }

  try {
    // Parse request body - Pusher sends form-encoded data
    const contentType = ctx.request.headers.get('content-type') || ''
    let socketId: string | null = null
    let channelName: string | null = null

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await ctx.request.formData()
      socketId = formData.get('socket_id') as string | null
      channelName = formData.get('channel_name') as string | null
    } else if (contentType.includes('application/json')) {
      const body = await ctx.request.json() as { socket_id?: string; channel_name?: string }
      socketId = body.socket_id || null
      channelName = body.channel_name || null
    } else {
      // Try form data as fallback
      try {
        const formData = await ctx.request.formData()
        socketId = formData.get('socket_id') as string | null
        channelName = formData.get('channel_name') as string | null
      } catch {
        // Try JSON as final fallback
        const body = await ctx.request.json() as { socket_id?: string; channel_name?: string }
        socketId = body.socket_id || null
        channelName = body.channel_name || null
      }
    }

    if (!socketId || !channelName) {
      logger.warn('PusherController', 'authenticate', 'Missing socket_id or channel_name', {
        hasSocketId: !!socketId,
        hasChannelName: !!channelName,
      })
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'socket_id and channel_name are required',
        400,
        undefined,
        ctx.requestId
      )
    }

    logger.debug('PusherController', 'authenticate', 'Validating channel access', {
      userId: ctx.userId,
      channelName,
      socketId: socketId.substring(0, 10) + '...', // Log partial for privacy
    })

    // Validate user has access to the requested channel
    const isAuthorized = await validateChannelAccess(ctx, channelName)

    if (!isAuthorized) {
      logger.warn('PusherController', 'authenticate', 'Channel access denied', {
        userId: ctx.userId,
        channelName,
      })
      return errorResponse(
        ErrorCodes.AUTHORIZATION_FAILED,
        'Access denied to this channel',
        403,
        undefined,
        ctx.requestId
      )
    }

    // Generate Pusher auth signature
    // Format: {socket_id}:{channel_name} signed with HMAC-SHA256
    const stringToSign = `${socketId}:${channelName}`
    const signature = await generatePusherSignature(pusherSecret, stringToSign)

    const duration = Date.now() - startTime
    logger.info('PusherController', 'authenticate', 'Channel access granted', {
      userId: ctx.userId,
      channelName,
      duration,
    })

    // Return auth token in Pusher's expected format
    // Note: Pusher expects this exact JSON structure
    return new Response(
      JSON.stringify({
        auth: `${pusherKey}:${signature}`,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('PusherController', 'authenticate', 'Pusher auth failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: ctx.userId,
      duration,
    })

    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to authenticate channel',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Validate user has access to the requested Pusher channel
 * 
 * Channel types:
 * - private-conversation-{id}: User must be a participant in the conversation
 * - private-user-{id}: User can only subscribe to their own channel
 */
async function validateChannelAccess(ctx: any, channelName: string): Promise<boolean> {
  // User's personal channel - only allow subscription to own channel
  const userId = extractUserId(channelName)
  if (userId) {
    return userId === ctx.userId
  }

  // Conversation channel - verify user is a participant
  const conversationId = extractConversationId(channelName)
  if (conversationId) {
    const conversation = await ctx.env.DB.prepare(
      `SELECT id FROM conversations 
       WHERE id = ? 
       AND (participant_1_id = ? OR participant_2_id = ?)`
    )
      .bind(conversationId, ctx.userId, ctx.userId)
      .first<{ id: string }>()

    return conversation !== null
  }

  // Unknown channel type - deny access
  logger.warn('PusherController', 'validateChannelAccess', 'Unknown channel type', {
    channelName,
    userId: ctx.userId,
  })
  return false
}

