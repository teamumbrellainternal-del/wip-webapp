/**
 * Reviews controller
 * Handles review invitation system and review submission per D-032
 *
 * Features:
 * - Invite reviewers via email (non-platform users)
 * - Submit reviews via invite token
 * - List reviews for artist
 */

import type { RouteHandler } from '../../router'
import { successResponse, errorResponse } from '../../utils/response'
import { ErrorCodes } from '../../utils/error-codes'
import { generateUUIDv4 } from '../../utils/uuid'
import { isValidEmail } from '../../utils/validation'
import { sendEmail } from '../../services/resend'

/**
 * Invite reviewer via email
 * POST /v1/reviews/invite
 * Per D-032: Artists can invite anyone via email to leave review
 */
export const inviteReviewer: RouteHandler = async (ctx) => {
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
    const body = await ctx.request.json()
    const { email, reviewerName, gigId } = body

    if (!email || !reviewerName) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'email and reviewerName are required',
        400,
        undefined,
        ctx.requestId
      )
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Invalid email format',
        400,
        'email',
        ctx.requestId
      )
    }

    // Get artist profile
    const artist = await ctx.env.DB.prepare(
      'SELECT id, stage_name FROM artists WHERE user_id = ?'
    ).bind(ctx.userId).first<{ id: string; stage_name: string }>()

    if (!artist) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Artist profile not found',
        404,
        undefined,
        ctx.requestId
      )
    }

    // Check if review already exists for this email
    const existingReview = await ctx.env.DB.prepare(
      'SELECT id FROM reviews WHERE artist_id = ? AND reviewer_email = ?'
    ).bind(artist.id, email).first()

    if (existingReview) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'This email has already submitted a review',
        400,
        undefined,
        ctx.requestId
      )
    }

    // Generate unique invite token
    const inviteToken = generateUUIDv4()

    // Create review invitation record
    const reviewId = generateUUIDv4()
    const now = new Date().toISOString()

    await ctx.env.DB.prepare(
      `INSERT INTO reviews (
        id, artist_id, reviewer_email, reviewer_name, rating, comment,
        gig_id, invite_token, created_at
      ) VALUES (?, ?, ?, ?, NULL, NULL, ?, ?, ?)`
    ).bind(
      reviewId,
      artist.id,
      email,
      reviewerName,
      gigId || null,
      inviteToken,
      now
    ).run()

    // Send invitation email via Resend
    const inviteUrl = `https://umbrella.app/review/${inviteToken}`

    const emailResult = await sendEmail(ctx.env, {
      to: email,
      subject: `${artist.stage_name} is requesting your review`,
      html: `
        <h2>Hi ${reviewerName},</h2>
        <p>${artist.stage_name} has invited you to leave a review of their work.</p>
        <p>Click the link below to submit your review:</p>
        <p><a href="${inviteUrl}">Submit Review</a></p>
        <p>This link is unique to you and will only work once.</p>
        <p>Thanks,<br/>The Umbrella Team</p>
      `,
      from: 'noreply@umbrella.app',
    })

    if (!emailResult.success) {
      // Delete the review record if email fails
      await ctx.env.DB.prepare('DELETE FROM reviews WHERE id = ?').bind(reviewId).run()

      return errorResponse(
        ErrorCodes.EXTERNAL_SERVICE_ERROR,
        'Failed to send invitation email',
        500,
        undefined,
        ctx.requestId
      )
    }

    return successResponse(
      {
        message: 'Review invitation sent successfully',
        inviteToken,
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error inviting reviewer:', error)
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to invite reviewer',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Submit review via invite token
 * POST /v1/reviews/submit
 * Public endpoint (no auth required)
 */
export const submitReview: RouteHandler = async (ctx) => {
  try {
    const body = await ctx.request.json()
    const { inviteToken, rating, comment } = body

    if (!inviteToken || !rating) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'inviteToken and rating are required',
        400,
        undefined,
        ctx.requestId
      )
    }

    // Validate rating (1-5)
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Rating must be between 1 and 5',
        400,
        'rating',
        ctx.requestId
      )
    }

    // Find review by invite token
    const review = await ctx.env.DB.prepare(
      'SELECT * FROM reviews WHERE invite_token = ?'
    ).bind(inviteToken).first<any>()

    if (!review) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Invalid or expired invite token',
        404,
        undefined,
        ctx.requestId
      )
    }

    // Check if review already submitted
    if (review.rating !== null) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Review has already been submitted',
        400,
        undefined,
        ctx.requestId
      )
    }

    // Update review with rating and comment
    await ctx.env.DB.prepare(
      'UPDATE reviews SET rating = ?, comment = ? WHERE id = ?'
    ).bind(rating, comment || null, review.id).run()

    // Update artist's avg_rating and total_reviews
    // Get all ratings for artist
    const ratingsResult = await ctx.env.DB.prepare(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews FROM reviews WHERE artist_id = ? AND rating IS NOT NULL'
    ).bind(review.artist_id).first<{ avg_rating: number; total_reviews: number }>()

    if (ratingsResult) {
      await ctx.env.DB.prepare(
        'UPDATE artists SET avg_rating = ?, total_reviews = ?, updated_at = ? WHERE id = ?'
      ).bind(
        ratingsResult.avg_rating || 0,
        ratingsResult.total_reviews || 0,
        new Date().toISOString(),
        review.artist_id
      ).run()
    }

    return successResponse(
      {
        message: 'Review submitted successfully',
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error submitting review:', error)
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to submit review',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * List reviews for artist
 * GET /v1/reviews/artist/:artistId
 * Public endpoint
 */
export const listArtistReviews: RouteHandler = async (ctx) => {
  const { artistId } = ctx.params

  if (!artistId) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'Artist ID required',
      400,
      undefined,
      ctx.requestId
    )
  }

  try {
    // Get all submitted reviews for artist (rating not null)
    const reviews = await ctx.env.DB.prepare(
      'SELECT id, reviewer_name, rating, comment, created_at FROM reviews WHERE artist_id = ? AND rating IS NOT NULL ORDER BY created_at DESC'
    ).bind(artistId).all()

    return successResponse(
      {
        reviews: reviews.results || [],
        count: reviews.results?.length || 0,
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error listing reviews:', error)
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      'Failed to list reviews',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Get review by invite token (for pre-filling form)
 * GET /v1/reviews/invite/:token
 * Public endpoint
 */
export const getReviewByToken: RouteHandler = async (ctx) => {
  const { token } = ctx.params

  if (!token) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'Invite token required',
      400,
      undefined,
      ctx.requestId
    )
  }

  try {
    // Get review and artist info by token
    const review = await ctx.env.DB.prepare(
      `SELECT
        reviews.id,
        reviews.reviewer_name,
        reviews.rating,
        reviews.comment,
        artists.stage_name,
        artists.avatar_url
      FROM reviews
      JOIN artists ON reviews.artist_id = artists.id
      WHERE reviews.invite_token = ?`
    ).bind(token).first()

    if (!review) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Invalid or expired invite token',
        404,
        undefined,
        ctx.requestId
      )
    }

    return successResponse(review, 200, ctx.requestId)
  } catch (error) {
    console.error('Error getting review by token:', error)
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      'Failed to get review',
      500,
      undefined,
      ctx.requestId
    )
  }
}
