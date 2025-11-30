/**
 * Notifications controller
 * Handles in-app notifications
 */

import type { RouteHandler } from '../../router'
import { successResponse, errorResponse } from '../../utils/response'
import { ErrorCodes } from '../../utils/error-codes'
import { logger } from '../../utils/logger'

/**
 * List notifications for the current user
 * GET /v1/notifications
 */
export const list: RouteHandler = async (ctx) => {
  logger.info('notifications:list', { userId: ctx.userId })
  
  if (!ctx.userId) {
    return errorResponse(
      ErrorCodes.AUTHENTICATION_FAILED,
      'Authentication required',
      401,
      undefined,
      ctx.requestId
    )
  }

  const limit = parseInt(ctx.url.searchParams.get('limit') || '20')
  const offset = parseInt(ctx.url.searchParams.get('offset') || '0')
  const unreadOnly = ctx.url.searchParams.get('unread_only') === 'true'

  try {
    // Build query
    let query = `
      SELECT id, type, title, body, data, read, created_at
      FROM notifications
      WHERE user_id = ?
    `
    const bindings: any[] = [ctx.userId]

    if (unreadOnly) {
      query += ` AND read = 0`
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`
    bindings.push(limit, offset)

    const notifications = await ctx.env.DB.prepare(query)
      .bind(...bindings)
      .all()

    // Get unread count
    const unreadResult = await ctx.env.DB.prepare(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read = 0'
    )
      .bind(ctx.userId)
      .first<{ count: number }>()

    // Get total count
    const totalResult = await ctx.env.DB.prepare(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ?'
    )
      .bind(ctx.userId)
      .first<{ count: number }>()

    // Parse JSON data field for each notification
    const parsedNotifications = (notifications.results || []).map((n: any) => ({
      ...n,
      data: n.data ? JSON.parse(n.data) : null,
      read: n.read === 1,
    }))

    return successResponse(
      {
        notifications: parsedNotifications,
        unread_count: unreadResult?.count || 0,
        total: totalResult?.count || 0,
        limit,
        offset,
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    logger.error('notifications:list:error', { error })
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      'Failed to fetch notifications',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Mark a single notification as read
 * PUT /v1/notifications/:id/read
 */
export const markRead: RouteHandler = async (ctx) => {
  logger.info('notifications:markRead', { userId: ctx.userId, notificationId: ctx.params.id })
  
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
      'Notification ID required',
      400,
      'id',
      ctx.requestId
    )
  }

  try {
    // Verify notification belongs to user
    const notification = await ctx.env.DB.prepare(
      'SELECT id FROM notifications WHERE id = ? AND user_id = ?'
    )
      .bind(id, ctx.userId)
      .first()

    if (!notification) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Notification not found',
        404,
        'id',
        ctx.requestId
      )
    }

    // Mark as read
    await ctx.env.DB.prepare('UPDATE notifications SET read = 1 WHERE id = ?')
      .bind(id)
      .run()

    logger.info('notifications:markRead:success', { notificationId: id })

    return successResponse(
      {
        message: 'Notification marked as read',
        id,
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    logger.error('notifications:markRead:error', { error })
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      'Failed to mark notification as read',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Mark all notifications as read
 * PUT /v1/notifications/read-all
 */
export const markAllRead: RouteHandler = async (ctx) => {
  logger.info('notifications:markAllRead', { userId: ctx.userId })
  
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
    const result = await ctx.env.DB.prepare(
      'UPDATE notifications SET read = 1 WHERE user_id = ? AND read = 0'
    )
      .bind(ctx.userId)
      .run()

    logger.info('notifications:markAllRead:success', { count: result.meta?.changes })

    return successResponse(
      {
        message: 'All notifications marked as read',
        count: result.meta?.changes || 0,
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    logger.error('notifications:markAllRead:error', { error })
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      'Failed to mark notifications as read',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Get unread notification count
 * GET /v1/notifications/count
 */
export const getUnreadCount: RouteHandler = async (ctx) => {
  logger.info('notifications:getUnreadCount', { userId: ctx.userId })
  
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
    const result = await ctx.env.DB.prepare(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read = 0'
    )
      .bind(ctx.userId)
      .first<{ count: number }>()

    return successResponse(
      {
        unread_count: result?.count || 0,
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    logger.error('notifications:getUnreadCount:error', { error })
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      'Failed to get unread count',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Delete a notification
 * DELETE /v1/notifications/:id
 */
export const deleteNotification: RouteHandler = async (ctx) => {
  logger.info('notifications:delete', { userId: ctx.userId, notificationId: ctx.params.id })
  
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
      'Notification ID required',
      400,
      'id',
      ctx.requestId
    )
  }

  try {
    // Verify notification belongs to user and delete
    const result = await ctx.env.DB.prepare(
      'DELETE FROM notifications WHERE id = ? AND user_id = ?'
    )
      .bind(id, ctx.userId)
      .run()

    if (result.meta?.changes === 0) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Notification not found',
        404,
        'id',
        ctx.requestId
      )
    }

    logger.info('notifications:delete:success', { notificationId: id })

    return successResponse(
      {
        message: 'Notification deleted',
        id,
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    logger.error('notifications:delete:error', { error })
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      'Failed to delete notification',
      500,
      undefined,
      ctx.requestId
    )
  }
}

