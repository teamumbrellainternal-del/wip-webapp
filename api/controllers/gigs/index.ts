/**
 * Gigs controller
 * Handles marketplace gig listings and applications
 */

import type { RouteHandler } from '../../router'
import { successResponse, errorResponse } from '../../utils/response'
import { ErrorCodes } from '../../utils/error-codes'

/**
 * List all gigs (marketplace)
 * GET /v1/gigs
 * Per D-014: Random shuffle, per D-017: Infinite scroll
 */
export const listGigs: RouteHandler = async (ctx) => {
  // Query params: page, limit
  const page = parseInt(ctx.url.searchParams.get('page') || '1')
  const limit = parseInt(ctx.url.searchParams.get('limit') || '20')

  // TODO: Implement gig listing with random shuffle and pagination
  return successResponse(
    {
      gigs: [],
      pagination: {
        page,
        limit,
        total: 0,
        hasMore: false,
      },
    },
    200,
    ctx.requestId
  )
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
