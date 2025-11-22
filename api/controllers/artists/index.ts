/**
 * Artists controller
 * Handles artist discovery and search
 */

import type { RouteHandler } from '../../router'
import { successResponse, errorResponse } from '../../utils/response'
import { ErrorCodes } from '../../utils/error-codes'

/**
 * Discover artists (marketplace)
 * GET /v1/artists
 * Per D-014: Random shuffle, per D-017: Infinite scroll
 * Task-5.4: Marketplace artist discovery with filters
 */
export const discoverArtists: RouteHandler = async (ctx) => {
  // Parse query parameters
  const genres = ctx.url.searchParams.getAll('genre[]')
  const location = ctx.url.searchParams.get('location') || ''
  const verified = ctx.url.searchParams.get('verified') === 'true'
  const availableNow = ctx.url.searchParams.get('available_now') === 'true'
  const limit = parseInt(ctx.url.searchParams.get('limit') || '20')
  const offset = parseInt(ctx.url.searchParams.get('offset') || '0')

  try {
    // Get authenticated user's location for distance calculation
    let userLocation: { lat?: number; lon?: number; city?: string; state?: string } = {}

    if (ctx.userId) {
      // Fetch user's artist profile to get location
      const userArtist = await ctx.env.DB.prepare(
        'SELECT location_city, location_state FROM artists WHERE user_id = ?'
      )
        .bind(ctx.userId)
        .first<{ location_city: string | null; location_state: string | null }>()

      if (userArtist) {
        userLocation.city = userArtist.location_city || undefined
        userLocation.state = userArtist.location_state || undefined
      }
    }

    // Build query with filters
    let query = `
      SELECT
        a.id,
        a.stage_name,
        a.verified,
        a.primary_genre,
        a.location_city,
        a.location_state,
        a.bio,
        a.avg_rating,
        a.total_gigs,
        a.base_rate_flat,
        a.base_rate_hourly,
        a.available_dates,
        a.avatar_url,
        (SELECT COUNT(*) FROM artist_followers WHERE artist_id = a.id) as follower_count
      FROM artists a
      WHERE 1=1
    `

    const bindings: any[] = []

    // Filter by genre (if provided)
    if (genres.length > 0) {
      const placeholders = genres.map(() => '?').join(',')
      query += ` AND a.primary_genre IN (${placeholders})`
      bindings.push(...genres)
    }

    // Filter by location (city or state)
    if (location) {
      query += ` AND (a.location_city = ? OR a.location_state = ?)`
      bindings.push(location, location)
    }

    // Filter by verified status
    if (verified) {
      query += ` AND a.verified = 1`
    }

    // Filter by available_now (has future available dates)
    if (availableNow) {
      const today = new Date().toISOString().split('T')[0]
      query += ` AND a.available_dates IS NOT NULL AND a.available_dates != '[]'`
    }

    // Add random shuffle (D-014)
    query += ` ORDER BY RANDOM()`

    // Add pagination
    query += ` LIMIT ? OFFSET ?`
    bindings.push(limit, offset)

    // Execute query
    const results = await ctx.env.DB.prepare(query)
      .bind(...bindings)
      .all<{
        id: string
        stage_name: string
        verified: number
        primary_genre: string | null
        location_city: string | null
        location_state: string | null
        bio: string | null
        avg_rating: number
        total_gigs: number
        base_rate_flat: number | null
        base_rate_hourly: number | null
        available_dates: string | null
        avatar_url: string | null
        follower_count: number
      }>()

    // Get total count (without limit/offset)
    let countQuery = `
      SELECT COUNT(*) as total
      FROM artists a
      WHERE 1=1
    `
    const countBindings: any[] = []

    if (genres.length > 0) {
      const placeholders = genres.map(() => '?').join(',')
      countQuery += ` AND a.primary_genre IN (${placeholders})`
      countBindings.push(...genres)
    }

    if (location) {
      countQuery += ` AND (a.location_city = ? OR a.location_state = ?)`
      countBindings.push(location, location)
    }

    if (verified) {
      countQuery += ` AND a.verified = 1`
    }

    if (availableNow) {
      countQuery += ` AND a.available_dates IS NOT NULL AND a.available_dates != '[]'`
    }

    const countResult = await ctx.env.DB.prepare(countQuery)
      .bind(...countBindings)
      .first<{ total: number }>()

    const totalCount = countResult?.total || 0

    // Format artist data
    const artists = results.results?.map((artist) => {
      // Calculate distance from user (if user location available)
      let distance: number | null = null
      // Note: Distance calculation would require geocoding lat/lon from city/state
      // For MVP, we'll return null and implement geocoding in post-MVP

      // Parse price range
      let priceRange = 'Negotiable'
      if (artist.base_rate_flat) {
        priceRange = `$${artist.base_rate_flat}`
      } else if (artist.base_rate_hourly) {
        priceRange = `$${artist.base_rate_hourly}/hr`
      }

      // Bio preview (first 150 characters)
      const bioPreview = artist.bio
        ? artist.bio.substring(0, 150) + (artist.bio.length > 150 ? '...' : '')
        : null

      return {
        id: artist.id,
        artist_name: artist.stage_name,
        full_name: artist.stage_name, // Using stage_name as legal_name may be null
        bio: bioPreview,
        location: [artist.location_city, artist.location_state]
          .filter(Boolean)
          .join(', '),
        genres: artist.primary_genre ? [artist.primary_genre] : [],
        verified: Boolean(artist.verified),
        rating_avg: artist.avg_rating,
        review_count: 0, // TODO: Get actual review count from reviews table
        follower_count: artist.follower_count,
        gigs_completed: artist.total_gigs,
        price_range_min: artist.base_rate_flat || artist.base_rate_hourly || undefined,
        price_range_max: artist.base_rate_flat || artist.base_rate_hourly || undefined,
        avatar_url: artist.avatar_url || undefined,
        banner_url: undefined, // TODO: Add banner_url to database
        social_links: {}, // TODO: Add social_links to response
        created_at: new Date().toISOString(), // TODO: Add created_at to query
        updated_at: new Date().toISOString(), // TODO: Add updated_at to query
      }
    }) || []

    // Return response with artists and pagination metadata
    // Frontend expects: { data, total, page, limit, has_more }
    const page = Math.floor(offset / limit) + 1
    return successResponse(
      {
        data: artists,
        total: totalCount,
        page,
        limit,
        has_more: offset + artists.length < totalCount,
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      error instanceof Error ? error.message : 'Failed to fetch artists',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Get artist by ID (public profile)
 * GET /v1/artists/:id
 */
export const getArtist: RouteHandler = async (ctx) => {
  const { id } = ctx.params

  if (!id) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'Artist ID required',
      400,
      'id',
      ctx.requestId
    )
  }

  try {
    // Fetch artist from database
    const artist = await ctx.env.DB.prepare(`
      SELECT
        a.id,
        a.stage_name,
        a.legal_name,
        a.verified,
        a.primary_genre,
        a.secondary_genres,
        a.location_city,
        a.location_state,
        a.bio,
        a.avg_rating,
        a.total_gigs,
        a.avatar_url,
        a.website_url,
        (SELECT COUNT(*) FROM artist_followers WHERE artist_id = a.id) as follower_count
      FROM artists a
      WHERE a.id = ?
    `).bind(id).first<{
      id: string
      stage_name: string
      legal_name: string | null
      verified: number
      primary_genre: string | null
      secondary_genres: string | null
      location_city: string | null
      location_state: string | null
      bio: string | null
      avg_rating: number
      total_gigs: number
      avatar_url: string | null
      website_url: string | null
      follower_count: number
    }>()

    if (!artist) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Artist not found',
        404,
        undefined,
        ctx.requestId
      )
    }

    // Parse genres
    const genres: string[] = []
    if (artist.primary_genre) {
      genres.push(artist.primary_genre)
    }
    if (artist.secondary_genres) {
      try {
        const secondaryGenres = JSON.parse(artist.secondary_genres)
        if (Array.isArray(secondaryGenres)) {
          genres.push(...secondaryGenres)
        }
      } catch (e) {
        // Ignore JSON parse errors
      }
    }

    // Build social links (only website_url exists in schema for now)
    const social_links: any = {}
    if (artist.website_url) social_links.website = artist.website_url
    // TODO: Add other social links when columns are added to database

    // Return artist data matching the Artist interface
    return successResponse(
      {
        id: artist.id,
        artist_name: artist.stage_name,
        full_name: artist.legal_name || artist.stage_name,
        bio: artist.bio || undefined,
        location: [artist.location_city, artist.location_state]
          .filter(Boolean)
          .join(', '),
        genres,
        verified: Boolean(artist.verified),
        rating_avg: artist.avg_rating,
        review_count: 0, // TODO: Get actual review count
        follower_count: artist.follower_count,
        gigs_completed: artist.total_gigs,
        avatar_url: artist.avatar_url || undefined,
        banner_url: undefined, // TODO: Add banner_url column to database
        social_links,
        created_at: new Date().toISOString(), // TODO: Add to database
        updated_at: new Date().toISOString(), // TODO: Add to database
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      error instanceof Error ? error.message : 'Failed to fetch artist',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Get artist's tracks
 * GET /v1/artists/:id/tracks
 */
export const getArtistTracks: RouteHandler = async (ctx) => {
  const { id } = ctx.params

  if (!id) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'Artist ID required',
      400,
      'id',
      ctx.requestId
    )
  }

  // TODO: Implement track listing
  return successResponse(
    {
      tracks: [],
    },
    200,
    ctx.requestId
  )
}

/**
 * Get artist's reviews
 * GET /v1/artists/:id/reviews
 */
export const getArtistReviews: RouteHandler = async (ctx) => {
  const { id } = ctx.params

  if (!id) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'Artist ID required',
      400,
      'id',
      ctx.requestId
    )
  }

  // TODO: Implement review listing
  return successResponse(
    {
      reviews: [],
      averageRating: 0,
      totalCount: 0,
    },
    200,
    ctx.requestId
  )
}

/**
 * Follow artist
 * POST /v1/artists/:id/follow
 */
export const followArtist: RouteHandler = async (ctx) => {
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
      'Artist ID required',
      400,
      'id',
      ctx.requestId
    )
  }

  // TODO: Implement follow functionality
  return successResponse(
    {
      message: 'Artist followed successfully',
      artistId: id,
    },
    200,
    ctx.requestId
  )
}

/**
 * Unfollow artist
 * DELETE /v1/artists/:id/follow
 */
export const unfollowArtist: RouteHandler = async (ctx) => {
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

  // TODO: Implement unfollow functionality
  return successResponse(
    {
      message: 'Artist unfollowed successfully',
      artistId: id,
    },
    200,
    ctx.requestId
  )
}
