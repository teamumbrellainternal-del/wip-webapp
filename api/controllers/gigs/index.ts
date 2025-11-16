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

  // TODO: Implement gig retrieval
  return successResponse(
    {
      id,
      title: 'Sample Gig',
      description: 'Sample gig description',
      type: 'performance',
      date: new Date().toISOString(),
      location: 'Los Angeles, CA',
      budget: 500,
      status: 'open',
    },
    200,
    ctx.requestId
  )
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
