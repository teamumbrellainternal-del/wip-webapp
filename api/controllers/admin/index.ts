/**
 * Admin Controller
 * Read-only endpoints for admin dashboard (Retool integration)
 * All endpoints require admin authorization via Clerk metadata
 */

import type { RouteHandler } from '../../router'
import { successResponse, errorResponse } from '../../utils/response'
import { ErrorCodes } from '../../utils/error-codes'
import { logger } from '../../utils/logger'

/**
 * Parse common query parameters for pagination and filtering
 */
function parseQueryParams(url: URL) {
  return {
    limit: Math.min(parseInt(url.searchParams.get('limit') || '50'), 100),
    offset: parseInt(url.searchParams.get('offset') || '0'),
    search: url.searchParams.get('search') || '',
    from: url.searchParams.get('from') || '',
    to: url.searchParams.get('to') || '',
  }
}

/**
 * GET /v1/admin/stats
 * Summary counts for dashboard overview
 */
export const getStats: RouteHandler = async (ctx) => {
  try {
    const [users, artists, gigs, reviews, violetPrompts, messages] = await Promise.all([
      ctx.env.DB.prepare('SELECT COUNT(*) as count FROM users').first<{ count: number }>(),
      ctx.env.DB.prepare('SELECT COUNT(*) as count FROM artists').first<{ count: number }>(),
      ctx.env.DB.prepare('SELECT COUNT(*) as count FROM gigs').first<{ count: number }>(),
      ctx.env.DB.prepare('SELECT COUNT(*) as count FROM reviews').first<{ count: number }>(),
      ctx.env.DB.prepare('SELECT COUNT(*) as count FROM violet_usage').first<{ count: number }>(),
      ctx.env.DB.prepare('SELECT COUNT(*) as count FROM messages').first<{ count: number }>(),
    ])

    // Get today's stats
    const today = new Date().toISOString().split('T')[0]
    const [usersToday, violetToday] = await Promise.all([
      ctx.env.DB.prepare('SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = ?')
        .bind(today)
        .first<{ count: number }>(),
      ctx.env.DB.prepare('SELECT COUNT(*) as count FROM violet_usage WHERE date = ?')
        .bind(today)
        .first<{ count: number }>(),
    ])

    return successResponse({
      totals: {
        users: users?.count || 0,
        artists: artists?.count || 0,
        gigs: gigs?.count || 0,
        reviews: reviews?.count || 0,
        violet_prompts: violetPrompts?.count || 0,
        messages: messages?.count || 0,
      },
      today: {
        new_users: usersToday?.count || 0,
        violet_prompts: violetToday?.count || 0,
      },
      generated_at: new Date().toISOString(),
    })
  } catch (error) {
    logger.error('Admin stats error', {
      requestId: ctx.requestId,
      error: error instanceof Error ? error.message : String(error),
    })
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch stats')
  }
}

/**
 * GET /v1/admin/users
 * List all users with pagination and search
 */
export const getUsers: RouteHandler = async (ctx) => {
  const { limit, offset, search, from, to } = parseQueryParams(ctx.url)

  try {
    let query = `
      SELECT 
        u.id,
        u.email,
        u.oauth_provider,
        u.onboarding_complete,
        u.created_at,
        u.updated_at,
        a.stage_name,
        a.primary_genre,
        a.location_city,
        a.location_state
      FROM users u
      LEFT JOIN artists a ON u.id = a.user_id
      WHERE 1=1
    `
    const bindings: (string | number)[] = []

    if (search) {
      query += ` AND (u.email LIKE ? OR a.stage_name LIKE ?)`
      bindings.push(`%${search}%`, `%${search}%`)
    }

    if (from) {
      query += ` AND DATE(u.created_at) >= ?`
      bindings.push(from)
    }

    if (to) {
      query += ` AND DATE(u.created_at) <= ?`
      bindings.push(to)
    }

    query += ` ORDER BY u.created_at DESC LIMIT ? OFFSET ?`
    bindings.push(limit, offset)

    const results = await ctx.env.DB.prepare(query).bind(...bindings).all()

    // Get total count for pagination
    let countQuery = `SELECT COUNT(*) as total FROM users u LEFT JOIN artists a ON u.id = a.user_id WHERE 1=1`
    const countBindings: string[] = []
    
    if (search) {
      countQuery += ` AND (u.email LIKE ? OR a.stage_name LIKE ?)`
      countBindings.push(`%${search}%`, `%${search}%`)
    }

    const countResult = await ctx.env.DB.prepare(countQuery)
      .bind(...countBindings)
      .first<{ total: number }>()

    return successResponse({
      users: results.results,
      pagination: {
        limit,
        offset,
        total: countResult?.total || 0,
      },
    })
  } catch (error) {
    logger.error('Admin users error', {
      requestId: ctx.requestId,
      error: error instanceof Error ? error.message : String(error),
    })
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch users')
  }
}

/**
 * GET /v1/admin/artists
 * List all artist profiles with user info
 */
export const getArtists: RouteHandler = async (ctx) => {
  const { limit, offset, search } = parseQueryParams(ctx.url)

  try {
    let query = `
      SELECT 
        a.*,
        u.email as user_email,
        u.onboarding_complete
      FROM artists a
      JOIN users u ON a.user_id = u.id
      WHERE 1=1
    `
    const bindings: (string | number)[] = []

    if (search) {
      query += ` AND (a.stage_name LIKE ? OR u.email LIKE ? OR a.primary_genre LIKE ?)`
      bindings.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    query += ` ORDER BY a.created_at DESC LIMIT ? OFFSET ?`
    bindings.push(limit, offset)

    const results = await ctx.env.DB.prepare(query).bind(...bindings).all()

    return successResponse({
      artists: results.results,
      pagination: { limit, offset, total: results.results.length },
    })
  } catch (error) {
    logger.error('Admin artists error', {
      requestId: ctx.requestId,
      error: error instanceof Error ? error.message : String(error),
    })
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch artists')
  }
}

/**
 * GET /v1/admin/violet-usage
 * List all Violet AI prompts
 */
export const getVioletUsage: RouteHandler = async (ctx) => {
  const { limit, offset, from, to } = parseQueryParams(ctx.url)

  try {
    let query = `
      SELECT 
        v.*,
        a.stage_name as artist_name,
        u.email as user_email
      FROM violet_usage v
      JOIN artists a ON v.artist_id = a.id
      JOIN users u ON a.user_id = u.id
      WHERE 1=1
    `
    const bindings: (string | number)[] = []

    if (from) {
      query += ` AND v.date >= ?`
      bindings.push(from)
    }

    if (to) {
      query += ` AND v.date <= ?`
      bindings.push(to)
    }

    query += ` ORDER BY v.created_at DESC LIMIT ? OFFSET ?`
    bindings.push(limit, offset)

    const results = await ctx.env.DB.prepare(query).bind(...bindings).all()

    return successResponse({
      violet_usage: results.results,
      pagination: { limit, offset, total: results.results.length },
    })
  } catch (error) {
    logger.error('Admin violet usage error', {
      requestId: ctx.requestId,
      error: error instanceof Error ? error.message : String(error),
    })
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch violet usage')
  }
}

/**
 * GET /v1/admin/gigs
 * List all gigs with venue info
 */
export const getGigs: RouteHandler = async (ctx) => {
  const { limit, offset, search } = parseQueryParams(ctx.url)
  const status = ctx.url.searchParams.get('status') || ''

  try {
    let query = `
      SELECT 
        g.*,
        u.email as venue_email,
        (SELECT COUNT(*) FROM gig_applications WHERE gig_id = g.id) as application_count
      FROM gigs g
      JOIN users u ON g.venue_id = u.id
      WHERE 1=1
    `
    const bindings: (string | number)[] = []

    if (search) {
      query += ` AND (g.title LIKE ? OR g.venue_name LIKE ? OR g.location_city LIKE ?)`
      bindings.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    if (status) {
      query += ` AND g.status = ?`
      bindings.push(status)
    }

    query += ` ORDER BY g.date DESC LIMIT ? OFFSET ?`
    bindings.push(limit, offset)

    const results = await ctx.env.DB.prepare(query).bind(...bindings).all()

    return successResponse({
      gigs: results.results,
      pagination: { limit, offset, total: results.results.length },
    })
  } catch (error) {
    logger.error('Admin gigs error', {
      requestId: ctx.requestId,
      error: error instanceof Error ? error.message : String(error),
    })
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch gigs')
  }
}

/**
 * GET /v1/admin/gig-applications
 * List all gig applications with artist and gig details
 */
export const getGigApplications: RouteHandler = async (ctx) => {
  const { limit, offset } = parseQueryParams(ctx.url)
  const status = ctx.url.searchParams.get('status') || ''

  try {
    let query = `
      SELECT 
        ga.*,
        a.stage_name as artist_name,
        u.email as artist_email,
        g.title as gig_title,
        g.venue_name,
        g.date as gig_date
      FROM gig_applications ga
      JOIN artists a ON ga.artist_id = a.id
      JOIN users u ON a.user_id = u.id
      JOIN gigs g ON ga.gig_id = g.id
      WHERE 1=1
    `
    const bindings: (string | number)[] = []

    if (status) {
      query += ` AND ga.status = ?`
      bindings.push(status)
    }

    query += ` ORDER BY ga.applied_at DESC LIMIT ? OFFSET ?`
    bindings.push(limit, offset)

    const results = await ctx.env.DB.prepare(query).bind(...bindings).all()

    return successResponse({
      applications: results.results,
      pagination: { limit, offset, total: results.results.length },
    })
  } catch (error) {
    logger.error('Admin gig applications error', {
      requestId: ctx.requestId,
      error: error instanceof Error ? error.message : String(error),
    })
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch gig applications')
  }
}

/**
 * GET /v1/admin/reviews
 * List all reviews with artist info
 */
export const getReviews: RouteHandler = async (ctx) => {
  const { limit, offset } = parseQueryParams(ctx.url)

  try {
    const query = `
      SELECT 
        r.*,
        a.stage_name as artist_name,
        u.email as artist_email
      FROM reviews r
      JOIN artists a ON r.artist_id = a.id
      JOIN users u ON a.user_id = u.id
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `

    const results = await ctx.env.DB.prepare(query).bind(limit, offset).all()

    return successResponse({
      reviews: results.results,
      pagination: { limit, offset, total: results.results.length },
    })
  } catch (error) {
    logger.error('Admin reviews error', {
      requestId: ctx.requestId,
      error: error instanceof Error ? error.message : String(error),
    })
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch reviews')
  }
}

/**
 * GET /v1/admin/messages
 * List recent messages (last 100 by default)
 */
export const getMessages: RouteHandler = async (ctx) => {
  const { limit, offset } = parseQueryParams(ctx.url)

  try {
    const query = `
      SELECT 
        m.*,
        c.participant_1_id,
        c.participant_2_id,
        sender.email as sender_email
      FROM messages m
      JOIN conversations c ON m.conversation_id = c.id
      JOIN users sender ON m.sender_id = sender.id
      ORDER BY m.created_at DESC
      LIMIT ? OFFSET ?
    `

    const results = await ctx.env.DB.prepare(query).bind(limit, offset).all()

    return successResponse({
      messages: results.results,
      pagination: { limit, offset, total: results.results.length },
    })
  } catch (error) {
    logger.error('Admin messages error', {
      requestId: ctx.requestId,
      error: error instanceof Error ? error.message : String(error),
    })
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch messages')
  }
}

