/**
 * Artists controller
 * Handles artist discovery and search
 */

import type { RouteHandler } from '../../router'
import { successResponse, errorResponse } from '../../utils/response'
import { ErrorCodes } from '../../utils/error-codes'
import { generateUUIDv4 } from '../../utils/uuid'
import { createResendService } from '../../services/resend'
import { logger } from '../../utils/logger'

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
        a.user_id,
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
        user_id: string
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
        user_id: artist.user_id, // User ID for starting conversations
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
        a.user_id,
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
        a.instagram_handle,
        a.tiktok_handle,
        a.youtube_url,
        a.spotify_url,
        a.apple_music_url,
        a.soundcloud_url,
        a.facebook_url,
        a.twitter_url,
        a.bandcamp_url,
        a.connection_count,
        (SELECT COUNT(*) FROM artist_followers WHERE artist_id = a.id) as follower_count
      FROM artists a
      WHERE a.id = ?
    `).bind(id).first<{
      id: string
      user_id: string
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
      instagram_handle: string | null
      tiktok_handle: string | null
      youtube_url: string | null
      spotify_url: string | null
      apple_music_url: string | null
      soundcloud_url: string | null
      facebook_url: string | null
      twitter_url: string | null
      bandcamp_url: string | null
      connection_count: number | null
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

    // Build social links object for frontend compatibility
    const social_links: Record<string, string> = {}
    if (artist.website_url) social_links.website = artist.website_url
    if (artist.instagram_handle) social_links.instagram = artist.instagram_handle
    if (artist.tiktok_handle) social_links.tiktok = artist.tiktok_handle
    if (artist.youtube_url) social_links.youtube = artist.youtube_url
    if (artist.spotify_url) social_links.spotify = artist.spotify_url
    if (artist.apple_music_url) social_links.apple_music = artist.apple_music_url
    if (artist.soundcloud_url) social_links.soundcloud = artist.soundcloud_url
    if (artist.facebook_url) social_links.facebook = artist.facebook_url
    if (artist.twitter_url) social_links.twitter = artist.twitter_url
    if (artist.bandcamp_url) social_links.bandcamp = artist.bandcamp_url

    // Return artist data matching the Artist interface
    return successResponse(
      {
        id: artist.id,
        user_id: artist.user_id, // User ID for starting conversations
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
        connection_count: artist.connection_count || 0,
        gigs_completed: artist.total_gigs,
        avatar_url: artist.avatar_url || undefined,
        banner_url: undefined, // TODO: Add banner_url column to database
        social_links,
        // Also include flat field names for SocialLinksBar component
        website_url: artist.website_url,
        instagram_handle: artist.instagram_handle,
        tiktok_handle: artist.tiktok_handle,
        youtube_url: artist.youtube_url,
        spotify_url: artist.spotify_url,
        apple_music_url: artist.apple_music_url,
        soundcloud_url: artist.soundcloud_url,
        facebook_url: artist.facebook_url,
        twitter_url: artist.twitter_url,
        bandcamp_url: artist.bandcamp_url,
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
    [], // Return array directly to match frontend expectation (Track[])
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
    [], // Return array directly to match frontend expectation (Review[])
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

  const { id: artistId } = ctx.params

  if (!artistId) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'Artist ID required',
      400,
      'id',
      ctx.requestId
    )
  }

  try {
    // 1. Validate artist exists
    const artist = await ctx.env.DB.prepare(
      'SELECT id, user_id, follower_count FROM artists WHERE id = ?'
    )
      .bind(artistId)
      .first<{ id: string; user_id: string; follower_count: number }>()

    if (!artist) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Artist not found',
        404,
        'id',
        ctx.requestId
      )
    }

    // 2. Prevent self-follow (user cannot follow their own artist profile)
    if (artist.user_id === ctx.userId) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'You cannot follow your own profile',
        400,
        undefined,
        ctx.requestId
      )
    }

    // 3. Check if already following
    const existingFollow = await ctx.env.DB.prepare(
      'SELECT id FROM artist_followers WHERE artist_id = ? AND follower_user_id = ?'
    )
      .bind(artistId, ctx.userId)
      .first()

    if (existingFollow) {
      return errorResponse(
        ErrorCodes.CONFLICT,
        'You are already following this artist',
        409,
        undefined,
        ctx.requestId
      )
    }

    // 4. INSERT into artist_followers table
    const followId = generateUUIDv4()
    const now = new Date().toISOString()

    await ctx.env.DB.prepare(
      'INSERT INTO artist_followers (id, artist_id, follower_user_id, created_at) VALUES (?, ?, ?, ?)'
    )
      .bind(followId, artistId, ctx.userId, now)
      .run()

    // 5. UPDATE follower_count on the artists table (atomic increment)
    await ctx.env.DB.prepare(
      'UPDATE artists SET follower_count = follower_count + 1 WHERE id = ?'
    )
      .bind(artistId)
      .run()

    // 5.5. Send in-app notification + email to followed artist (fire-and-forget)
    try {
      // Get follower's artist info
      const followerArtist = await ctx.env.DB.prepare(
        'SELECT id, stage_name, avatar_url FROM artists WHERE user_id = ?'
      )
        .bind(ctx.userId)
        .first<{ id: string; stage_name: string; avatar_url: string | null }>()

      // Get followed artist's email
      const followedUser = await ctx.env.DB.prepare(
        'SELECT email FROM users WHERE id = ?'
      )
        .bind(artist.user_id)
        .first<{ email: string }>()

      if (followerArtist && followedUser) {
        const followerName = followerArtist.stage_name || 'Someone'

        // Create in-app notification
        const notificationId = generateUUIDv4()
        const notificationData = JSON.stringify({
          follower_user_id: ctx.userId,
          follower_artist_id: followerArtist.id,
          follower_artist_name: followerName,
        })

        await ctx.env.DB.prepare(`
          INSERT INTO notifications (id, user_id, type, title, body, data, read, created_at)
          VALUES (?, ?, 'new_follower', ?, ?, ?, 0, ?)
        `)
          .bind(
            notificationId,
            artist.user_id,
            `${followerName} started following you`,
            `${followerName} is now following your profile on Umbrella.`,
            notificationData,
            now
          )
          .run()

        // Send email notification (non-blocking)
        if (ctx.env.RESEND_API_KEY) {
          const emailService = createResendService(ctx.env.RESEND_API_KEY, ctx.env.DB)
          await emailService.sendTransactional('new_follower', followedUser.email, {
            followerName: followerName,
            profileUrl: `https://app.umbrellalive.com/artist/${followerArtist.id}`,
          })
        }

        logger.info('ArtistsController', 'followArtist', 'Notification sent', {
          followedUserId: artist.user_id,
          notificationId,
        })
      }
    } catch (notificationError) {
      // Log but don't fail - notification is non-critical
      logger.error('ArtistsController', 'followArtist', 'Failed to send notification', {
        error: notificationError instanceof Error ? notificationError.message : 'Unknown error',
        artistId,
      })
    }

    // 6. Get actual follower count from artist_followers table (consistent with getArtist)
    const countResult = await ctx.env.DB.prepare(
      'SELECT COUNT(*) as count FROM artist_followers WHERE artist_id = ?'
    )
      .bind(artistId)
      .first<{ count: number }>()

    const actualFollowerCount = countResult?.count || 0

    return successResponse(
      {
        message: 'Artist followed successfully',
        artistId,
        follower_count: actualFollowerCount,
        is_following: true,
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error following artist:', error)
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      'Failed to follow artist',
      500,
      undefined,
      ctx.requestId
    )
  }
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

  const { id: artistId } = ctx.params

  if (!artistId) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'Artist ID required',
      400,
      'id',
      ctx.requestId
    )
  }

  try {
    // 1. Validate artist exists
    const artist = await ctx.env.DB.prepare(
      'SELECT id, follower_count FROM artists WHERE id = ?'
    )
      .bind(artistId)
      .first<{ id: string; follower_count: number }>()

    if (!artist) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Artist not found',
        404,
        'id',
        ctx.requestId
      )
    }

    // 2. Check if follow relationship exists
    const existingFollow = await ctx.env.DB.prepare(
      'SELECT id FROM artist_followers WHERE artist_id = ? AND follower_user_id = ?'
    )
      .bind(artistId, ctx.userId)
      .first()

    if (!existingFollow) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'You are not following this artist',
        404,
        undefined,
        ctx.requestId
      )
    }

    // 3. DELETE from artist_followers table
    await ctx.env.DB.prepare(
      'DELETE FROM artist_followers WHERE artist_id = ? AND follower_user_id = ?'
    )
      .bind(artistId, ctx.userId)
      .run()

    // 4. UPDATE follower_count on the artists table (atomic decrement, floor at 0)
    await ctx.env.DB.prepare(
      'UPDATE artists SET follower_count = MAX(follower_count - 1, 0) WHERE id = ?'
    )
      .bind(artistId)
      .run()

    // 5. Get actual follower count from artist_followers table (consistent with getArtist)
    const countResult = await ctx.env.DB.prepare(
      'SELECT COUNT(*) as count FROM artist_followers WHERE artist_id = ?'
    )
      .bind(artistId)
      .first<{ count: number }>()

    const actualFollowerCount = countResult?.count || 0

    return successResponse(
      {
        message: 'Artist unfollowed successfully',
        artistId,
        follower_count: actualFollowerCount,
        is_following: false,
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error unfollowing artist:', error)
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      'Failed to unfollow artist',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Get follow status for an artist
 * GET /v1/artists/:id/follow
 * Returns whether the authenticated user is following the artist and the follower count
 */
export const getFollowStatus: RouteHandler = async (ctx) => {
  const { id: artistId } = ctx.params

  if (!artistId) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'Artist ID required',
      400,
      'id',
      ctx.requestId
    )
  }

  try {
    // Verify artist exists
    const artist = await ctx.env.DB.prepare(
      'SELECT id FROM artists WHERE id = ?'
    )
      .bind(artistId)
      .first<{ id: string }>()

    if (!artist) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Artist not found',
        404,
        'id',
        ctx.requestId
      )
    }

    // Get actual follower count from artist_followers table (consistent with getArtist)
    const countResult = await ctx.env.DB.prepare(
      'SELECT COUNT(*) as count FROM artist_followers WHERE artist_id = ?'
    )
      .bind(artistId)
      .first<{ count: number }>()

    const followerCount = countResult?.count || 0

    // Check if user is following (only if authenticated)
    let isFollowing = false
    if (ctx.userId) {
      const followRecord = await ctx.env.DB.prepare(
        'SELECT id FROM artist_followers WHERE artist_id = ? AND follower_user_id = ?'
      )
        .bind(artistId, ctx.userId)
        .first()

      isFollowing = !!followRecord
    }

    return successResponse(
      {
        artistId,
        is_following: isFollowing,
        follower_count: followerCount,
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error getting follow status:', error)
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      'Failed to get follow status',
      500,
      undefined,
      ctx.requestId
    )
  }
}
