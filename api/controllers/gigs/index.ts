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
    // Frontend expects: { data, total, page, limit, has_more }
    const page = Math.floor(offset / limit) + 1
    return successResponse(
      {
        data: gigsWithUrgency,
        total: totalCount,
        page,
        limit,
        has_more: offset + gigs.length < totalCount,
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
 * Create new gig (Venue Owners only)
 * POST /v1/gigs
 *
 * Request body:
 * - title: string (required)
 * - description: string (optional)
 * - venue_name: string (required)
 * - location_city: string (required)
 * - location_state: string (required)
 * - location_address: string (optional)
 * - location_zip: string (optional)
 * - date: ISO date string (required)
 * - start_time: HH:MM (optional)
 * - end_time: HH:MM (optional)
 * - genre: string (optional)
 * - capacity: number (optional)
 * - payment_amount: number (optional)
 * - payment_type: 'flat' | 'hourly' | 'negotiable' (optional)
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

  try {
    const { generateUUIDv4 } = await import('../../utils/uuid')
    const body = await ctx.request.json() as any

    // Validate required fields
    if (!body.title || !body.venue_name || !body.location_city || !body.location_state || !body.date) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Missing required fields: title, venue_name, location_city, location_state, date',
        400,
        undefined,
        ctx.requestId
      )
    }

    // Validate payment_type if provided
    if (body.payment_type && !['flat', 'hourly', 'negotiable'].includes(body.payment_type)) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Invalid payment_type. Must be one of: flat, hourly, negotiable',
        400,
        undefined,
        ctx.requestId
      )
    }

    const gigId = generateUUIDv4()
    const now = new Date().toISOString()

    // Insert gig into database
    await ctx.env.DB.prepare(`
      INSERT INTO gigs (
        id, venue_id, title, description, venue_name,
        location_city, location_state, location_address, location_zip,
        date, start_time, end_time, genre, capacity, filled_slots,
        payment_amount, payment_type, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, 'open', ?, ?)
    `).bind(
      gigId,
      ctx.userId,
      body.title,
      body.description || null,
      body.venue_name,
      body.location_city,
      body.location_state,
      body.location_address || null,
      body.location_zip || null,
      body.date,
      body.start_time || null,
      body.end_time || null,
      body.genre || null,
      body.capacity || null,
      body.payment_amount || null,
      body.payment_type || 'negotiable',
      now,
      now
    ).run()

    return successResponse(
      {
        message: 'Gig created successfully',
        id: gigId,
        title: body.title,
        date: body.date,
        location: `${body.location_city}, ${body.location_state}`,
        status: 'open',
      },
      201,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error creating gig:', error)
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      'Failed to create gig',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Apply to gig (single-click per spec)
 * POST /v1/gigs/:id/apply
 * D-077: Single-click apply sends artist profile + rates to venue
 * D-079: Email + SMS confirmations to both parties
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

  const { id: gigId } = ctx.params

  if (!gigId) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'Gig ID required',
      400,
      'id',
      ctx.requestId
    )
  }

  const { generateUUIDv4 } = await import('../../utils/uuid')
  const { createResendService } = await import('../../services/resend')
  const { createTwilioService } = await import('../../services/twilio')

  try {
    // 1. Fetch artist profile for the authenticated user
    const artist = await ctx.env.DB.prepare(
      'SELECT * FROM artists WHERE user_id = ?'
    )
      .bind(ctx.userId)
      .first()

    if (!artist) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Artist profile not found. Please complete onboarding first.',
        404,
        undefined,
        ctx.requestId
      )
    }

    const artistId = artist.id as string

    // 2. Check if user already applied to this gig
    const existingApplication = await ctx.env.DB.prepare(
      'SELECT id FROM gig_applications WHERE gig_id = ? AND artist_id = ?'
    )
      .bind(gigId, artistId)
      .first()

    if (existingApplication) {
      return errorResponse(
        ErrorCodes.CONFLICT,
        'You have already applied to this gig',
        409,
        undefined,
        ctx.requestId
      )
    }

    // 3. Fetch gig details
    const gig = await ctx.env.DB.prepare('SELECT * FROM gigs WHERE id = ?')
      .bind(gigId)
      .first()

    if (!gig) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Gig not found',
        404,
        undefined,
        ctx.requestId
      )
    }

    // Check if gig is still open
    if (gig.status !== 'open') {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'This gig is no longer accepting applications',
        400,
        undefined,
        ctx.requestId
      )
    }

    // 4. Fetch venue (user) details
    const venue = await ctx.env.DB.prepare('SELECT * FROM users WHERE id = ?')
      .bind(gig.venue_id)
      .first()

    if (!venue) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Venue not found',
        404,
        undefined,
        ctx.requestId
      )
    }

    // 5. Fetch artist user details for confirmation
    const artistUser = await ctx.env.DB.prepare('SELECT * FROM users WHERE id = ?')
      .bind(ctx.userId)
      .first()

    if (!artistUser) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'User not found',
        404,
        undefined,
        ctx.requestId
      )
    }

    // 6. Create gig application record
    const applicationId = generateUUIDv4()
    const now = new Date().toISOString()

    await ctx.env.DB.prepare(
      `INSERT INTO gig_applications (id, gig_id, artist_id, status, applied_at)
       VALUES (?, ?, ?, 'pending', ?)`
    )
      .bind(applicationId, gigId, artistId, now)
      .run()

    // 7. Prepare notification content
    const artistName = artist.stage_name as string
    const artistBio = artist.bio as string | null
    const artistRateFlat = artist.base_rate_flat as number | null
    const artistRateHourly = artist.base_rate_hourly as number | null
    const artistPortfolio = artist.website_url as string | null
    const gigTitle = gig.title as string
    const gigDate = gig.date as string
    const gigLocation = `${gig.location_city}, ${gig.location_state}`

    // Format rates for display
    let ratesText = 'Rates: '
    if (artistRateFlat) {
      ratesText += `$${artistRateFlat} (flat rate)`
      if (artistRateHourly) ratesText += ` or $${artistRateHourly}/hour`
    } else if (artistRateHourly) {
      ratesText += `$${artistRateHourly}/hour`
    } else {
      ratesText += 'Negotiable'
    }

    // 8. Send email to venue
    const resendService = createResendService(ctx.env.RESEND_API_KEY, ctx.env.DB)

    const venueEmailHtml = `
      <h1>New Gig Application: ${artistName}</h1>
      <p>You have received a new application for your gig <strong>"${gigTitle}"</strong>.</p>

      <h2>Artist Details</h2>
      <p><strong>Name:</strong> ${artistName}</p>
      ${artistBio ? `<p><strong>Bio:</strong> ${artistBio}</p>` : ''}
      <p><strong>${ratesText}</strong></p>
      ${artistPortfolio ? `<p><strong>Portfolio:</strong> <a href="${artistPortfolio}">${artistPortfolio}</a></p>` : ''}

      <h2>Gig Details</h2>
      <p><strong>Title:</strong> ${gigTitle}</p>
      <p><strong>Date:</strong> ${gigDate}</p>
      <p><strong>Location:</strong> ${gigLocation}</p>

      <p>Log in to your Umbrella account to review this application and respond to the artist.</p>
    `

    await resendService.sendEmail({
      to: venue.email as string,
      subject: `New Application: ${artistName}`,
      html: venueEmailHtml,
      text: `New application from ${artistName} for "${gigTitle}". ${ratesText}. Log in to review.`,
    })

    // 9. Send SMS to venue (if venue has artist profile with phone)
    const venueArtist = await ctx.env.DB.prepare(
      'SELECT phone_number FROM artists WHERE user_id = ?'
    )
      .bind(gig.venue_id)
      .first()

    if (venueArtist && venueArtist.phone_number) {
      const twilioService = createTwilioService(
        ctx.env.TWILIO_ACCOUNT_SID,
        ctx.env.TWILIO_AUTH_TOKEN,
        ctx.env.TWILIO_PHONE_NUMBER,
        ctx.env.DB
      )

      const venueSmsMessage = `New gig application from ${artistName} for "${gigTitle}". Check your email for details.`

      await twilioService.sendSMS({
        to: venueArtist.phone_number as string,
        message: venueSmsMessage,
        messageType: 'notification',
      })
    }

    // 10. Send confirmation email to artist
    const artistEmailHtml = `
      <h1>Application Submitted Successfully</h1>
      <p>Hi ${artistName},</p>
      <p>Your application for <strong>"${gigTitle}"</strong> has been submitted successfully.</p>

      <h2>Gig Details</h2>
      <p><strong>Title:</strong> ${gigTitle}</p>
      <p><strong>Date:</strong> ${gigDate}</p>
      <p><strong>Location:</strong> ${gigLocation}</p>
      <p><strong>Venue:</strong> ${gig.venue_name}</p>

      <p>The venue will review your application and get back to you soon. You'll receive a notification once they respond.</p>
      <p>Good luck!</p>
    `

    await resendService.sendEmail({
      to: artistUser.email as string,
      subject: `Application Submitted: ${gigTitle}`,
      html: artistEmailHtml,
      text: `Your application for "${gigTitle}" on ${gigDate} has been submitted successfully. The venue will review and respond soon.`,
      artistId,
    })

    // 11. Send confirmation SMS to artist (if phone available)
    if (artist.phone_number) {
      const twilioService = createTwilioService(
        ctx.env.TWILIO_ACCOUNT_SID,
        ctx.env.TWILIO_AUTH_TOKEN,
        ctx.env.TWILIO_PHONE_NUMBER,
        ctx.env.DB
      )

      const artistSmsMessage = `Application submitted for "${gigTitle}" on ${gigDate}. The venue will review and respond soon. Good luck!`

      await twilioService.sendSMS({
        to: artist.phone_number as string,
        message: artistSmsMessage,
        messageType: 'notification',
        artistId,
      })
    }

    // 12. Return success response
    return successResponse(
      {
        message: 'Application submitted successfully',
        applicationId,
        gigId,
        gigTitle,
        appliedAt: now,
      },
      201,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error applying to gig:', error)
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      error instanceof Error ? error.message : 'Failed to submit application',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Update gig (Venue Owners only - own gigs)
 * PUT /v1/gigs/:id
 */
export const updateGig: RouteHandler = async (ctx) => {
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

  try {
    const body = await ctx.request.json() as any

    // Verify gig belongs to this user
    const existingGig = await ctx.env.DB.prepare(
      'SELECT id FROM gigs WHERE id = ? AND venue_id = ?'
    ).bind(id, ctx.userId).first()

    if (!existingGig) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Gig not found or you do not have permission to edit it',
        404,
        undefined,
        ctx.requestId
      )
    }

    // Build dynamic UPDATE query
    const updates: string[] = []
    const values: any[] = []

    if (body.title !== undefined) {
      updates.push('title = ?')
      values.push(body.title)
    }
    if (body.description !== undefined) {
      updates.push('description = ?')
      values.push(body.description)
    }
    if (body.venue_name !== undefined) {
      updates.push('venue_name = ?')
      values.push(body.venue_name)
    }
    if (body.location_city !== undefined) {
      updates.push('location_city = ?')
      values.push(body.location_city)
    }
    if (body.location_state !== undefined) {
      updates.push('location_state = ?')
      values.push(body.location_state)
    }
    if (body.location_address !== undefined) {
      updates.push('location_address = ?')
      values.push(body.location_address)
    }
    if (body.location_zip !== undefined) {
      updates.push('location_zip = ?')
      values.push(body.location_zip)
    }
    if (body.date !== undefined) {
      updates.push('date = ?')
      values.push(body.date)
    }
    if (body.start_time !== undefined) {
      updates.push('start_time = ?')
      values.push(body.start_time)
    }
    if (body.end_time !== undefined) {
      updates.push('end_time = ?')
      values.push(body.end_time)
    }
    if (body.genre !== undefined) {
      updates.push('genre = ?')
      values.push(body.genre)
    }
    if (body.capacity !== undefined) {
      updates.push('capacity = ?')
      values.push(body.capacity)
    }
    if (body.payment_amount !== undefined) {
      updates.push('payment_amount = ?')
      values.push(body.payment_amount)
    }
    if (body.payment_type !== undefined) {
      updates.push('payment_type = ?')
      values.push(body.payment_type)
    }

    // Always update updated_at
    updates.push('updated_at = ?')
    values.push(new Date().toISOString())

    if (updates.length > 0) {
      values.push(id, ctx.userId)
      await ctx.env.DB.prepare(`
        UPDATE gigs
        SET ${updates.join(', ')}
        WHERE id = ? AND venue_id = ?
      `).bind(...values).run()
    }

    return successResponse(
      { message: 'Gig updated successfully', id },
      200,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error updating gig:', error)
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      'Failed to update gig',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Delete/Cancel gig (Venue Owners only - own gigs)
 * DELETE /v1/gigs/:id
 */
export const deleteGig: RouteHandler = async (ctx) => {
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

  try {
    // Verify gig belongs to this user
    const existingGig = await ctx.env.DB.prepare(
      'SELECT id, status FROM gigs WHERE id = ? AND venue_id = ?'
    ).bind(id, ctx.userId).first<any>()

    if (!existingGig) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Gig not found or you do not have permission to delete it',
        404,
        undefined,
        ctx.requestId
      )
    }

    // Update status to 'cancelled' instead of deleting (preserve data)
    await ctx.env.DB.prepare(
      'UPDATE gigs SET status = ?, updated_at = ? WHERE id = ?'
    ).bind('cancelled', new Date().toISOString(), id).run()

    return successResponse(
      { message: 'Gig cancelled successfully', id },
      200,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error deleting gig:', error)
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      'Failed to delete gig',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Get my posted gigs (Venue Owners)
 * GET /v1/gigs/mine
 */
export const getMyGigs: RouteHandler = async (ctx) => {
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
    const result = await ctx.env.DB.prepare(`
      SELECT * FROM gigs
      WHERE venue_id = ?
      ORDER BY date DESC, created_at DESC
    `).bind(ctx.userId).all()

    const gigs = (result.results || []).map((gig: any) => ({
      id: gig.id,
      title: gig.title,
      description: gig.description,
      venue_name: gig.venue_name,
      location: `${gig.location_city}, ${gig.location_state}`,
      date: gig.date,
      start_time: gig.start_time,
      end_time: gig.end_time,
      genre: gig.genre,
      capacity: gig.capacity,
      filled_slots: gig.filled_slots,
      payment_amount: gig.payment_amount,
      payment_type: gig.payment_type,
      status: gig.status,
      created_at: gig.created_at,
      updated_at: gig.updated_at,
    }))

    return successResponse({ gigs }, 200, ctx.requestId)
  } catch (error) {
    console.error('Error fetching my gigs:', error)
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
 * Get applications for a specific gig (Venue Owners only - own gigs)
 * GET /v1/gigs/:id/applications
 */
export const getGigApplications: RouteHandler = async (ctx) => {
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

  try {
    // Verify gig belongs to this user
    const gig = await ctx.env.DB.prepare(
      'SELECT id FROM gigs WHERE id = ? AND venue_id = ?'
    ).bind(id, ctx.userId).first()

    if (!gig) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Gig not found or you do not have permission to view applications',
        404,
        undefined,
        ctx.requestId
      )
    }

    // Fetch all applications for this gig with artist details
    const result = await ctx.env.DB.prepare(`
      SELECT
        ga.id,
        ga.status,
        ga.applied_at,
        a.id as artist_id,
        a.stage_name,
        a.bio,
        a.base_rate_flat,
        a.base_rate_hourly,
        a.website_url,
        a.avatar_url,
        a.avg_rating,
        a.total_gigs
      FROM gig_applications ga
      JOIN artists a ON ga.artist_id = a.id
      WHERE ga.gig_id = ?
      ORDER BY ga.applied_at DESC
    `).bind(id).all()

    const applications = (result.results || []).map((app: any) => ({
      id: app.id,
      status: app.status,
      applied_at: app.applied_at,
      artist: {
        id: app.artist_id,
        stage_name: app.stage_name,
        bio: app.bio,
        base_rate_flat: app.base_rate_flat,
        base_rate_hourly: app.base_rate_hourly,
        website_url: app.website_url,
        avatar_url: app.avatar_url,
        avg_rating: app.avg_rating,
        total_gigs: app.total_gigs,
      },
    }))

    return successResponse({ applications }, 200, ctx.requestId)
  } catch (error) {
    console.error('Error fetching gig applications:', error)
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      'Failed to fetch applications',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Update application status (Venue Owners - accept/reject)
 * PUT /v1/gigs/:id/applications/:appId
 *
 * Request body:
 * - status: 'accepted' | 'rejected'
 */
export const updateApplicationStatus: RouteHandler = async (ctx) => {
  if (!ctx.userId) {
    return errorResponse(
      ErrorCodes.AUTHENTICATION_FAILED,
      'Authentication required',
      401,
      undefined,
      ctx.requestId
    )
  }

  const { id: gigId, appId } = ctx.params

  try {
    const body = await ctx.request.json() as any

    // Validate status
    if (!body.status || !['accepted', 'rejected'].includes(body.status)) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Status must be either "accepted" or "rejected"',
        400,
        undefined,
        ctx.requestId
      )
    }

    // Verify gig belongs to this user
    const gig = await ctx.env.DB.prepare(
      'SELECT id FROM gigs WHERE id = ? AND venue_id = ?'
    ).bind(gigId, ctx.userId).first()

    if (!gig) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Gig not found or you do not have permission',
        404,
        undefined,
        ctx.requestId
      )
    }

    // Update application status
    const result = await ctx.env.DB.prepare(
      'UPDATE gig_applications SET status = ? WHERE id = ? AND gig_id = ?'
    ).bind(body.status, appId, gigId).run()

    if (result.meta.changes === 0) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Application not found',
        404,
        undefined,
        ctx.requestId
      )
    }

    // TODO: Send notification email/SMS to artist about status change

    return successResponse(
      {
        message: `Application ${body.status} successfully`,
        applicationId: appId,
        status: body.status,
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error updating application status:', error)
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      'Failed to update application status',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Get my gig applications (Artists)
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

  try {
    // Get artist ID from user_id
    const artist = await ctx.env.DB.prepare(
      'SELECT id FROM artists WHERE user_id = ?'
    ).bind(ctx.userId).first<{ id: string }>()

    if (!artist) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Artist profile not found. Please complete onboarding.',
        404,
        undefined,
        ctx.requestId
      )
    }

    // Fetch all applications with gig details
    const result = await ctx.env.DB.prepare(`
      SELECT
        ga.id,
        ga.status,
        ga.applied_at,
        g.id as gig_id,
        g.title,
        g.venue_name,
        g.location_city,
        g.location_state,
        g.date,
        g.start_time,
        g.payment_amount,
        g.status as gig_status
      FROM gig_applications ga
      JOIN gigs g ON ga.gig_id = g.id
      WHERE ga.artist_id = ?
      ORDER BY ga.applied_at DESC
    `).bind(artist.id).all()

    const applications = (result.results || []).map((app: any) => ({
      id: app.id,
      status: app.status,
      applied_at: app.applied_at,
      gig: {
        id: app.gig_id,
        title: app.title,
        venue_name: app.venue_name,
        location: `${app.location_city}, ${app.location_state}`,
        date: app.date,
        start_time: app.start_time,
        payment_amount: app.payment_amount,
        status: app.gig_status,
      },
    }))

    return successResponse({ applications }, 200, ctx.requestId)
  } catch (error) {
    console.error('Error fetching my applications:', error)
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      'Failed to fetch applications',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Withdraw gig application (Artists)
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

  const { id: gigId } = ctx.params

  try {
    // Get artist ID from user_id
    const artist = await ctx.env.DB.prepare(
      'SELECT id FROM artists WHERE user_id = ?'
    ).bind(ctx.userId).first<{ id: string }>()

    if (!artist) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Artist profile not found. Please complete onboarding.',
        404,
        undefined,
        ctx.requestId
      )
    }

    // Delete the application
    const result = await ctx.env.DB.prepare(
      'DELETE FROM gig_applications WHERE gig_id = ? AND artist_id = ?'
    ).bind(gigId, artist.id).run()

    if (result.meta.changes === 0) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Application not found or already withdrawn',
        404,
        undefined,
        ctx.requestId
      )
    }

    return successResponse(
      {
        message: 'Application withdrawn successfully',
        gigId,
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error withdrawing application:', error)
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      'Failed to withdraw application',
      500,
      undefined,
      ctx.requestId
    )
  }
}
