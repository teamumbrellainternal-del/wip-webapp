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
import { generateSlug, generateUniqueSlug, validateSlug, normalizeSlug } from '../utils/slug'

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

    // Process slug: use provided slug, or auto-generate from venue name
    let slug: string
    if (input.slug) {
      // Validate and normalize provided slug
      const normalizedSlug = normalizeSlug(input.slug)
      const slugValidation = validateSlug(normalizedSlug)
      if (!slugValidation.valid) {
        return errorResponse(
          ErrorCodes.VALIDATION_ERROR,
          slugValidation.error || 'Invalid profile URL',
          400,
          { field: 'slug' },
          ctx.requestId
        )
      }

      // Check uniqueness
      const existingSlug = await ctx.env.DB.prepare(
        'SELECT id FROM venues WHERE slug = ?'
      ).bind(normalizedSlug).first<{ id: string }>()

      if (existingSlug) {
        return errorResponse(
          ErrorCodes.VALIDATION_ERROR,
          'This profile URL is already taken. Please choose a different one.',
          400,
          { field: 'slug' },
          ctx.requestId
        )
      }
      slug = normalizedSlug
    } else {
      // Auto-generate slug from venue name
      const allSlugs = await ctx.env.DB.prepare(
        'SELECT slug FROM venues WHERE slug IS NOT NULL'
      ).all<{ slug: string }>()
      const existingSlugs = new Set(allSlugs.results?.map(r => r.slug) || [])
      slug = generateUniqueSlug(input.name, existingSlugs)
    }

    // Insert venue profile
    await ctx.env.DB.prepare(
      `INSERT INTO venues (
        id, user_id, slug, name, tagline, venue_type, city, state,
        capacity, standing_capacity, seated_capacity, stage_size,
        sound_system, has_green_room, has_parking, booking_lead_days,
        preferred_genres, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        venueId,
        userId,
        slug,
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
 * Get a public venue profile by ID or slug
 * Supports both UUID and slug-based lookups for SEO-friendly URLs
 */
export const getPublicVenueProfile: RouteHandler = async (ctx) => {
  const venueIdOrSlug = ctx.params.id

  logger.info('venue:getPublicProfile', { venueIdOrSlug })

  try {
    // Determine if id is a UUID or a slug
    // UUID v4 pattern: 8-4-4-4-12 hex characters
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(venueIdOrSlug)

    let venue: Venue | null
    if (isUUID) {
      venue = await ctx.env.DB.prepare(
        'SELECT * FROM venues WHERE id = ?'
      )
        .bind(venueIdOrSlug)
        .first<Venue>()
    } else {
      // Lookup by slug
      venue = await ctx.env.DB.prepare(
        'SELECT * FROM venues WHERE slug = ?'
      )
        .bind(venueIdOrSlug.toLowerCase())
        .first<Venue>()
    }

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
      venueIdOrSlug,
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
 * PUT /v1/venue/profile/slug
 * Update venue profile slug (custom URL)
 * Allows venues to customize their profile URL slug
 */
export const updateVenueSlug: RouteHandler = async (ctx) => {
  const userId = ctx.userId

  if (!userId) {
    return errorResponse(
      ErrorCodes.AUTHENTICATION_FAILED,
      'Authentication required',
      401,
      undefined,
      ctx.requestId
    )
  }

  try {
    const body = await ctx.request.json() as { slug?: string }
    const { slug } = body

    if (!slug) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Slug is required',
        400,
        'slug',
        ctx.requestId
      )
    }

    // Normalize and validate the slug
    const normalizedSlug = normalizeSlug(slug)
    const validation = validateSlug(normalizedSlug)

    if (!validation.valid) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        validation.error || 'Invalid slug',
        400,
        'slug',
        ctx.requestId
      )
    }

    // Get venue profile
    const venue = await ctx.env.DB.prepare(
      'SELECT id, slug FROM venues WHERE user_id = ?'
    ).bind(userId).first<{ id: string; slug: string | null }>()

    if (!venue) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Venue profile not found',
        404,
        undefined,
        ctx.requestId
      )
    }

    // Check if slug is already taken by another venue
    const existingVenue = await ctx.env.DB.prepare(
      'SELECT id FROM venues WHERE slug = ? AND id != ?'
    ).bind(normalizedSlug, venue.id).first<{ id: string }>()

    if (existingVenue) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'This URL is already taken. Please choose a different slug.',
        400,
        'slug',
        ctx.requestId
      )
    }

    // Update the slug
    await ctx.env.DB.prepare(
      'UPDATE venues SET slug = ?, updated_at = ? WHERE id = ?'
    ).bind(normalizedSlug, new Date().toISOString(), venue.id).run()

    logger.info('venue:updateSlug', 'Venue slug updated', {
      venueId: venue.id,
      oldSlug: venue.slug,
      newSlug: normalizedSlug,
    })

    return successResponse({
      message: 'Profile URL updated successfully',
      slug: normalizedSlug,
      url: `/venue/${normalizedSlug}`,
    }, 200, ctx.requestId)
  } catch (error) {
    logger.error('venue:updateSlug:error', {
      userId,
      error: error instanceof Error ? error.message : String(error),
    })
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to update profile URL',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * GET /v1/venue/profile/slug/:slug/available
 * Check venue slug availability
 * Returns whether a slug is available for use
 */
export const checkVenueSlugAvailability: RouteHandler = async (ctx) => {
  const { slug } = ctx.params

  if (!slug) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'Slug is required',
      400,
      'slug',
      ctx.requestId
    )
  }

  try {
    // Normalize and validate the slug
    const normalizedSlug = normalizeSlug(slug)
    const validation = validateSlug(normalizedSlug)

    if (!validation.valid) {
      return successResponse({
        available: false,
        slug: normalizedSlug,
        error: validation.error,
      }, 200, ctx.requestId)
    }

    // Check if slug exists in database
    const existingVenue = await ctx.env.DB.prepare(
      'SELECT id FROM venues WHERE slug = ?'
    ).bind(normalizedSlug).first<{ id: string }>()

    const available = !existingVenue

    // Generate suggestion if not available
    let suggestion: string | undefined
    if (!available) {
      // Get all existing slugs that start with the normalized slug
      const similarSlugs = await ctx.env.DB.prepare(
        'SELECT slug FROM venues WHERE slug LIKE ?'
      ).bind(`${normalizedSlug}%`).all<{ slug: string }>()

      const existingSlugs = new Set(similarSlugs.results?.map(r => r.slug) || [])
      suggestion = generateUniqueSlug(normalizedSlug, existingSlugs)
    }

    return successResponse({
      available,
      slug: normalizedSlug,
      suggestion,
    }, 200, ctx.requestId)
  } catch (error) {
    logger.error('venue:checkSlugAvailability:error', {
      slug,
      error: error instanceof Error ? error.message : String(error),
    })
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to check slug availability',
      500,
      undefined,
      ctx.requestId
    )
  }
}

