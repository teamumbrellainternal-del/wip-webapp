/**
 * Gigs controller
 * Handles marketplace gig listings and applications
 */

import type { RouteHandler } from '../../router'
import { successResponse, errorResponse } from '../../utils/response'
import { ErrorCodes } from '../../utils/error-codes'
import type { Gig } from '../../models/gig'
import { isUrgent } from '../../models/gig'

/**
 * List all gigs (marketplace)
 * GET /v1/gigs
 * Per D-014: Random shuffle, per D-017: Infinite scroll
 * Supports filtering by genre, location, date range, and price range
 */
export const listGigs: RouteHandler = async (ctx) => {
  // Parse pagination params (limit/offset per D-017)
  const limit = Math.min(parseInt(ctx.url.searchParams.get('limit') || '20'), 100)
  const offset = parseInt(ctx.url.searchParams.get('offset') || '0')

  // Parse filter params
  const genres = ctx.url.searchParams.getAll('genre[]')
  const location = ctx.url.searchParams.get('location')
  const dateStart = ctx.url.searchParams.get('date_start')
  const dateEnd = ctx.url.searchParams.get('date_end')
  const priceMin = ctx.url.searchParams.get('price_min')
  const priceMax = ctx.url.searchParams.get('price_max')

  try {
    // Build dynamic WHERE clause
    const whereClauses: string[] = ["status = 'open'"] // Only show open gigs
    const queryParams: any[] = []

    // Genre filter (IN clause for multiple genres)
    if (genres.length > 0) {
      const placeholders = genres.map(() => '?').join(', ')
      whereClauses.push(`genre IN (${placeholders})`)
      queryParams.push(...genres)
    }

    // Location filter (city)
    if (location) {
      whereClauses.push('location_city = ?')
      queryParams.push(location)
    }

    // Date range filter
    if (dateStart && dateEnd) {
      whereClauses.push('date BETWEEN ? AND ?')
      queryParams.push(dateStart, dateEnd)
    } else if (dateStart) {
      whereClauses.push('date >= ?')
      queryParams.push(dateStart)
    } else if (dateEnd) {
      whereClauses.push('date <= ?')
      queryParams.push(dateEnd)
    }

    // Price range filter
    if (priceMin && priceMax) {
      whereClauses.push('payment_amount BETWEEN ? AND ?')
      queryParams.push(parseInt(priceMin), parseInt(priceMax))
    } else if (priceMin) {
      whereClauses.push('payment_amount >= ?')
      queryParams.push(parseInt(priceMin))
    } else if (priceMax) {
      whereClauses.push('payment_amount <= ?')
      queryParams.push(parseInt(priceMax))
    }

    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) as count FROM gigs ${whereClause}`
    const countResult = await ctx.env.DB.prepare(countQuery)
      .bind(...queryParams)
      .first<{ count: number }>()

    const totalCount = countResult?.count || 0

    // Build main query with random shuffle (D-014) and pagination (D-017)
    const gigsQuery = `
      SELECT *
      FROM gigs
      ${whereClause}
      ORDER BY RANDOM()
      LIMIT ? OFFSET ?
    `

    // Execute query
    const result = await ctx.env.DB.prepare(gigsQuery)
      .bind(...queryParams, limit, offset)
      .all<Gig>()

    const gigs = result.results || []

    // Calculate urgency flag for each gig (D-010)
    // Urgency: within 7 days AND <50% capacity filled
    const gigsWithUrgency = gigs.map((gig) => {
      const urgencyFlag = isUrgent(gig)
      const capacityFilled = gig.capacity ? Math.round((gig.filled_slots / gig.capacity) * 100) : 0

      return {
        id: gig.id,
        venue_id: gig.venue_id,
        venue_name: gig.venue_name,
        title: gig.title,
        description: gig.description,
        location: `${gig.location_city}, ${gig.location_state}`,
        location_city: gig.location_city,
        location_state: gig.location_state,
        date: gig.date,
        start_time: gig.start_time,
        end_time: gig.end_time,
        genre: gig.genre,
        capacity: gig.capacity,
        filled_slots: gig.filled_slots,
        capacity_filled_percentage: capacityFilled,
        payment: gig.payment_amount,
        payment_type: gig.payment_type,
        urgency_flag: urgencyFlag,
        status: gig.status,
      }
    })

    // Return response with gigs and pagination metadata
    return successResponse(
      {
        gigs: gigsWithUrgency,
        total_count: totalCount,
        pagination: {
          limit,
          offset,
          has_more: offset + gigs.length < totalCount,
        },
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error listing gigs:', error)
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      'Failed to fetch gigs',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Get gig details by ID
 * GET /v1/gigs/:id
 * Per task-5.2: Returns complete gig details with venue info and application status
 */
export const getGig: RouteHandler = async (ctx) => {
  const { id } = ctx.params

  if (!id) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'Gig ID required',
      400,
      'id',
      ctx.requestId
    )
  }

  // Require authentication to get application status
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
    // Fetch gig with venue information (JOIN with users table for venue details)
    const gig = await ctx.env.DB.prepare(
      `SELECT
        g.*,
        u.email as venue_email
      FROM gigs g
      LEFT JOIN users u ON g.venue_id = u.id
      WHERE g.id = ?`
    )
      .bind(id)
      .first()

    if (!gig) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Gig not found',
        404,
        'id',
        ctx.requestId
      )
    }

    // Calculate urgency flag (D-010: within 7 days with <50% capacity)
    const gigDate = new Date(gig.date as string)
    const now = new Date()
    const daysUntilGig = Math.ceil((gigDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    const capacityFilled = gig.capacity ? ((gig.filled_slots as number) / (gig.capacity as number)) * 100 : 0
    const urgency_flag = daysUntilGig <= 7 && daysUntilGig > 0 && capacityFilled < 50

    // Check if authenticated user already applied
    const application = await ctx.env.DB.prepare(
      `SELECT status, applied_at
       FROM gig_applications
       WHERE gig_id = ? AND artist_id IN (
         SELECT id FROM artists WHERE user_id = ?
       )`
    )
      .bind(id, ctx.userId)
      .first()

    // Build response with complete gig details
    const response = {
      id: gig.id,
      title: gig.title,
      description: gig.description,
      date: gig.date,
      start_time: gig.start_time,
      end_time: gig.end_time,
      capacity: gig.capacity,
      filled_slots: gig.filled_slots,
      payment_amount: gig.payment_amount,
      payment_type: gig.payment_type,
      genre: gig.genre,
      status: gig.status,
      urgency_flag,

      // Location information
      location: {
        city: gig.location_city,
        state: gig.location_state,
        address: gig.location_address,
        zip: gig.location_zip,
      },

      // Venue information
      venue: {
        id: gig.venue_id,
        name: gig.venue_name,
        email: gig.venue_email || null,
        // Note: rating and review_count would come from artists table if venue is also an artist
        // For now, we'll return null as venues aren't artists in the current schema
        rating: null,
        review_count: null,
      },

      // Application status (if user already applied)
      application_status: application ? {
        status: application.status,
        applied_at: application.applied_at,
      } : null,

      created_at: gig.created_at,
      updated_at: gig.updated_at,
    }

    return successResponse(response, 200, ctx.requestId)
  } catch (error) {
    console.error('Error fetching gig:', error)
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to fetch gig details',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Create new gig
 * POST /v1/gigs
 */
export const createGig: RouteHandler = async (ctx) => {
  if (!ctx.userId) {
    return errorResponse(
      ErrorCodes.AUTHENTICATION_FAILED,
      'Authentication required',
      401,
      undefined,
      ctx.requestId
    )
  }

  // TODO: Implement gig creation
  return successResponse(
    {
      message: 'Gig created successfully',
      id: 'new-gig-id',
    },
    201,
    ctx.requestId
  )
}

/**
 * Apply to gig (single-click per spec)
 * POST /v1/gigs/:id/apply
 */
export const applyToGig: RouteHandler = async (ctx) => {
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
      'Gig ID required',
      400,
      'id',
      ctx.requestId
    )
  }

  // TODO: Implement gig application
  return successResponse(
    {
      message: 'Application submitted successfully',
      gigId: id,
      applicationId: 'new-application-id',
    },
    200,
    ctx.requestId
  )
}

/**
 * Get my gig applications
 * GET /v1/gigs/applications
 */
export const getMyApplications: RouteHandler = async (ctx) => {
  if (!ctx.userId) {
    return errorResponse(
      ErrorCodes.AUTHENTICATION_FAILED,
      'Authentication required',
      401,
      undefined,
      ctx.requestId
    )
  }

  // TODO: Implement application listing
  return successResponse(
    {
      applications: [],
    },
    200,
    ctx.requestId
  )
}

/**
 * Withdraw gig application
 * DELETE /v1/gigs/:id/apply
 */
export const withdrawApplication: RouteHandler = async (ctx) => {
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

  // TODO: Implement application withdrawal
  return successResponse(
    {
      message: 'Application withdrawn successfully',
      gigId: id,
    },
    200,
    ctx.requestId
  )
}
