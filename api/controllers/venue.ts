/**
 * Venue Controller
 * Handles venue profile CRUD operations for the two-sided marketplace
 */

import { v4 as uuidv4 } from 'uuid'
import type { RouteHandler } from '../router'
import { successResponse, errorResponse } from '../utils/response'
import { ErrorCodes } from '../utils/error-codes'
import { logger } from '../utils/logger'
import {
  type Venue,
  type CreateVenueInput,
  type UpdateVenueInput,
  toVenueProfileResponse,
  toPublicVenueProfile,
} from '../models/venue'

/**
 * GET /v1/venue/profile
 * Get the current user's venue profile
 */
export const getVenueProfile: RouteHandler = async (ctx) => {
  const userId = ctx.userId

  logger.info('venue:getProfile', { userId })

  try {
    const venue = await ctx.env.DB.prepare(
      'SELECT * FROM venues WHERE user_id = ?'
    )
      .bind(userId)
      .first<Venue>()

    if (!venue) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Venue profile not found. Please complete onboarding.',
        404,
        undefined,
        ctx.requestId
      )
    }

    return successResponse({
      venue: toVenueProfileResponse(venue),
    })
  } catch (error) {
    logger.error('venue:getProfile:error', {
      userId,
      error: error instanceof Error ? error.message : String(error),
    })
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to fetch venue profile',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * POST /v1/venue/profile
 * Create a new venue profile (during onboarding)
 */
export const createVenueProfile: RouteHandler = async (ctx) => {
  const userId = ctx.userId

  logger.info('venue:createProfile', { userId })

  try {
    // Check if venue profile already exists
    const existing = await ctx.env.DB.prepare(
      'SELECT id FROM venues WHERE user_id = ?'
    )
      .bind(userId)
      .first()

    if (existing) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Venue profile already exists. Use PUT to update.',
        400,
        undefined,
        ctx.requestId
      )
    }

    // Parse request body
    const input = (await ctx.request.json()) as CreateVenueInput

    // Validate required fields
    if (!input.name || !input.city) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Name and city are required',
        400,
        { missing: !input.name ? 'name' : 'city' },
        ctx.requestId
      )
    }

    const now = new Date().toISOString()
    const venueId = uuidv4()

    // Insert venue profile
    await ctx.env.DB.prepare(
      `INSERT INTO venues (
        id, user_id, name, tagline, venue_type, city, state,
        capacity, standing_capacity, seated_capacity, stage_size,
        sound_system, has_green_room, has_parking, booking_lead_days,
        preferred_genres, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        venueId,
        userId,
        input.name,
        input.tagline || null,
        input.venue_type || null,
        input.city,
        input.state || null,
        input.capacity || null,
        input.standing_capacity || null,
        input.seated_capacity || null,
        input.stage_size || null,
        input.sound_system || null,
        input.has_green_room ? 1 : 0,
        input.has_parking ? 1 : 0,
        input.booking_lead_days || 14,
        input.preferred_genres ? JSON.stringify(input.preferred_genres) : null,
        now,
        now
      )
      .run()

    // Mark user onboarding as complete
    await ctx.env.DB.prepare(
      'UPDATE users SET onboarding_complete = 1, updated_at = ? WHERE id = ?'
    )
      .bind(now, userId)
      .run()

    // Fetch the created venue
    const venue = await ctx.env.DB.prepare(
      'SELECT * FROM venues WHERE id = ?'
    )
      .bind(venueId)
      .first<Venue>()

    logger.info('venue:createProfile:success', { userId, venueId })

    return successResponse(
      {
        venue: toVenueProfileResponse(venue!),
        message: 'Venue profile created successfully',
      },
      201
    )
  } catch (error) {
    logger.error('venue:createProfile:error', {
      userId,
      error: error instanceof Error ? error.message : String(error),
    })
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to create venue profile',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * PUT /v1/venue/profile
 * Update the current user's venue profile
 */
export const updateVenueProfile: RouteHandler = async (ctx) => {
  const userId = ctx.userId

  logger.info('venue:updateProfile', { userId })

  try {
    // Check if venue profile exists
    const existing = await ctx.env.DB.prepare(
      'SELECT * FROM venues WHERE user_id = ?'
    )
      .bind(userId)
      .first<Venue>()

    if (!existing) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Venue profile not found',
        404,
        undefined,
        ctx.requestId
      )
    }

    // Parse request body
    const input = (await ctx.request.json()) as UpdateVenueInput

    const now = new Date().toISOString()

    // Build dynamic update query
    const updates: string[] = ['updated_at = ?']
    const values: (string | number | null)[] = [now]

    if (input.name !== undefined) {
      updates.push('name = ?')
      values.push(input.name)
    }
    if (input.tagline !== undefined) {
      updates.push('tagline = ?')
      values.push(input.tagline)
    }
    if (input.venue_type !== undefined) {
      updates.push('venue_type = ?')
      values.push(input.venue_type)
    }
    if (input.address_line1 !== undefined) {
      updates.push('address_line1 = ?')
      values.push(input.address_line1)
    }
    if (input.address_line2 !== undefined) {
      updates.push('address_line2 = ?')
      values.push(input.address_line2)
    }
    if (input.city !== undefined) {
      updates.push('city = ?')
      values.push(input.city)
    }
    if (input.state !== undefined) {
      updates.push('state = ?')
      values.push(input.state)
    }
    if (input.zip_code !== undefined) {
      updates.push('zip_code = ?')
      values.push(input.zip_code)
    }
    if (input.country !== undefined) {
      updates.push('country = ?')
      values.push(input.country)
    }
    if (input.capacity !== undefined) {
      updates.push('capacity = ?')
      values.push(input.capacity)
    }
    if (input.standing_capacity !== undefined) {
      updates.push('standing_capacity = ?')
      values.push(input.standing_capacity)
    }
    if (input.seated_capacity !== undefined) {
      updates.push('seated_capacity = ?')
      values.push(input.seated_capacity)
    }
    if (input.stage_size !== undefined) {
      updates.push('stage_size = ?')
      values.push(input.stage_size)
    }
    if (input.sound_system !== undefined) {
      updates.push('sound_system = ?')
      values.push(input.sound_system)
    }
    if (input.has_green_room !== undefined) {
      updates.push('has_green_room = ?')
      values.push(input.has_green_room ? 1 : 0)
    }
    if (input.has_parking !== undefined) {
      updates.push('has_parking = ?')
      values.push(input.has_parking ? 1 : 0)
    }
    if (input.status !== undefined) {
      updates.push('status = ?')
      values.push(input.status)
    }
    if (input.booking_lead_days !== undefined) {
      updates.push('booking_lead_days = ?')
      values.push(input.booking_lead_days)
    }
    if (input.preferred_genres !== undefined) {
      updates.push('preferred_genres = ?')
      values.push(JSON.stringify(input.preferred_genres))
    }
    if (input.avatar_url !== undefined) {
      updates.push('avatar_url = ?')
      values.push(input.avatar_url)
    }
    if (input.cover_url !== undefined) {
      updates.push('cover_url = ?')
      values.push(input.cover_url)
    }

    // Add user_id for WHERE clause
    values.push(userId)

    // Execute update
    await ctx.env.DB.prepare(
      `UPDATE venues SET ${updates.join(', ')} WHERE user_id = ?`
    )
      .bind(...values)
      .run()

    // Fetch updated venue
    const venue = await ctx.env.DB.prepare(
      'SELECT * FROM venues WHERE user_id = ?'
    )
      .bind(userId)
      .first<Venue>()

    logger.info('venue:updateProfile:success', { userId, venueId: venue?.id })

    return successResponse({
      venue: toVenueProfileResponse(venue!),
      message: 'Venue profile updated successfully',
    })
  } catch (error) {
    logger.error('venue:updateProfile:error', {
      userId,
      error: error instanceof Error ? error.message : String(error),
    })
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to update venue profile',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * GET /v1/venue/profile/:id
 * Get a public venue profile by ID
 */
export const getPublicVenueProfile: RouteHandler = async (ctx) => {
  const venueId = ctx.params.id

  logger.info('venue:getPublicProfile', { venueId })

  try {
    const venue = await ctx.env.DB.prepare(
      'SELECT * FROM venues WHERE id = ?'
    )
      .bind(venueId)
      .first<Venue>()

    if (!venue) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Venue not found',
        404,
        undefined,
        ctx.requestId
      )
    }

    return successResponse({
      venue: toPublicVenueProfile(venue),
    })
  } catch (error) {
    logger.error('venue:getPublicProfile:error', {
      venueId,
      error: error instanceof Error ? error.message : String(error),
    })
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to fetch venue profile',
      500,
      undefined,
      ctx.requestId
    )
  }
}

