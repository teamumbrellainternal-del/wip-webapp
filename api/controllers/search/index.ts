/**
 * Search controller
 * Handles global search per D-071
 * Searches across artists and gigs (no venues in MVP)
 * Task-5.5: Global search endpoint with KV caching
 */

import type { RouteHandler } from '../../router'
import { successResponse, errorResponse } from '../../utils/response'
import { ErrorCodes } from '../../utils/error-codes'
import crypto from 'node:crypto'

/**
 * Generate cache key hash from query parameters
 */
function generateCacheKey(query: string, type: string, limit: number, offset: number): string {
  const hashInput = `search:${query}:${type}:${limit}:${offset}`
  const hash = crypto.createHash('md5').update(hashInput).digest('hex')
  return `search:${hash}`
}

/**
 * Global search
 * GET /v1/search
 * Query params: q (query), type (artists/gigs/all), limit, offset
 * Requires authentication
 */
export const globalSearch: RouteHandler = async (ctx) => {
  // Validate authentication
  if (!ctx.userId) {
    return errorResponse(
      ErrorCodes.AUTHENTICATION_FAILED,
      'Authentication required',
      401,
      undefined,
      ctx.requestId
    )
  }

  // Parse query parameters
  const query = ctx.url.searchParams.get('q')?.trim()
  const type = ctx.url.searchParams.get('type') || 'all'
  const limit = Math.min(parseInt(ctx.url.searchParams.get('limit') || '20'), 50) // Max 50
  const offset = parseInt(ctx.url.searchParams.get('offset') || '0')

  // Validate query parameter
  if (!query) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'Search query required',
      400,
      'q',
      ctx.requestId
    )
  }

  // Validate type parameter
  if (!['artists', 'gigs', 'all'].includes(type)) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'Invalid type. Must be one of: artists, gigs, all',
      400,
      'type',
      ctx.requestId
    )
  }

  try {
    // Check KV cache first
    const cacheKey = generateCacheKey(query, type, limit, offset)
    const cachedResults = await ctx.env.KV.get(cacheKey, 'json')

    if (cachedResults) {
      console.log(`Search cache hit for query: ${query}`)
      return successResponse(
        {
          ...cachedResults,
          cached: true,
        },
        200,
        ctx.requestId
      )
    }

    console.log(`Search cache miss for query: ${query}, fetching from DB`)

    // Prepare search pattern for LIKE queries
    const searchPattern = `%${query}%`

    let artistResults: any[] = []
    let gigResults: any[] = []
    let artistCount = 0
    let gigCount = 0

    // Search artists if type is 'artists' or 'all'
    if (type === 'artists' || type === 'all') {
      const artistQuery = `
        SELECT
          id,
          stage_name,
          bio,
          primary_genre,
          location_city,
          location_state,
          verified,
          avg_rating,
          total_gigs,
          avatar_url
        FROM artists
        WHERE
          stage_name LIKE ? OR
          bio LIKE ? OR
          primary_genre LIKE ? OR
          location_city LIKE ?
        ORDER BY
          CASE
            WHEN stage_name LIKE ? THEN 1
            WHEN primary_genre LIKE ? THEN 2
            WHEN location_city LIKE ? THEN 3
            ELSE 4
          END,
          avg_rating DESC
        LIMIT ? OFFSET ?
      `

      const artistQueryResult = await ctx.env.DB.prepare(artistQuery)
        .bind(
          searchPattern, // stage_name
          searchPattern, // bio
          searchPattern, // primary_genre
          searchPattern, // location_city
          searchPattern, // ORDER BY stage_name
          searchPattern, // ORDER BY genre
          searchPattern, // ORDER BY location
          limit,
          offset
        )
        .all()

      artistResults = (artistQueryResult.results || []).map((artist: any) => ({
        type: 'artist',
        id: artist.id,
        name: artist.stage_name,
        bio: artist.bio ? (artist.bio.substring(0, 150) + (artist.bio.length > 150 ? '...' : '')) : null,
        genre: artist.primary_genre,
        location: [artist.location_city, artist.location_state].filter(Boolean).join(', '),
        verified: Boolean(artist.verified),
        rating: artist.avg_rating || 0,
        gigs: artist.total_gigs || 0,
        avatarUrl: artist.avatar_url,
      }))

      // Get total artist count
      const artistCountQuery = `
        SELECT COUNT(*) as total
        FROM artists
        WHERE
          stage_name LIKE ? OR
          bio LIKE ? OR
          primary_genre LIKE ? OR
          location_city LIKE ?
      `

      const countResult = await ctx.env.DB.prepare(artistCountQuery)
        .bind(searchPattern, searchPattern, searchPattern, searchPattern)
        .first<{ total: number }>()

      artistCount = countResult?.total || 0
    }

    // Search gigs if type is 'gigs' or 'all'
    if (type === 'gigs' || type === 'all') {
      const gigQuery = `
        SELECT
          id,
          title,
          description,
          venue_name,
          location_city,
          location_state,
          date,
          start_time,
          genre,
          payment_amount,
          payment_type,
          capacity,
          filled_slots,
          urgency_flag,
          status
        FROM gigs
        WHERE
          (title LIKE ? OR
          venue_name LIKE ? OR
          description LIKE ? OR
          location_city LIKE ? OR
          genre LIKE ?)
          AND status = 'open'
        ORDER BY
          CASE
            WHEN title LIKE ? THEN 1
            WHEN venue_name LIKE ? THEN 2
            WHEN genre LIKE ? THEN 3
            WHEN location_city LIKE ? THEN 4
            ELSE 5
          END,
          urgency_flag DESC,
          date ASC
        LIMIT ? OFFSET ?
      `

      const gigQueryResult = await ctx.env.DB.prepare(gigQuery)
        .bind(
          searchPattern, // title
          searchPattern, // venue_name
          searchPattern, // description
          searchPattern, // location_city
          searchPattern, // genre
          searchPattern, // ORDER BY title
          searchPattern, // ORDER BY venue_name
          searchPattern, // ORDER BY genre
          searchPattern, // ORDER BY location
          limit,
          offset
        )
        .all()

      gigResults = (gigQueryResult.results || []).map((gig: any) => ({
        type: 'gig',
        id: gig.id,
        title: gig.title,
        description: gig.description ? (gig.description.substring(0, 150) + (gig.description.length > 150 ? '...' : '')) : null,
        venueName: gig.venue_name,
        location: [gig.location_city, gig.location_state].filter(Boolean).join(', '),
        date: gig.date,
        startTime: gig.start_time,
        genre: gig.genre,
        paymentAmount: gig.payment_amount,
        paymentType: gig.payment_type,
        capacity: gig.capacity,
        filledSlots: gig.filled_slots,
        urgencyFlag: Boolean(gig.urgency_flag),
        status: gig.status,
      }))

      // Get total gig count
      const gigCountQuery = `
        SELECT COUNT(*) as total
        FROM gigs
        WHERE
          (title LIKE ? OR
          venue_name LIKE ? OR
          description LIKE ? OR
          location_city LIKE ? OR
          genre LIKE ?)
          AND status = 'open'
      `

      const countResult = await ctx.env.DB.prepare(gigCountQuery)
        .bind(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern)
        .first<{ total: number }>()

      gigCount = countResult?.total || 0
    }

    // Combine results
    const results = [...artistResults, ...gigResults]
    const totalCount = artistCount + gigCount

    const responseData = {
      query,
      type,
      results,
      totalCount,
      artistCount,
      gigCount,
      limit,
      offset,
      hasMore: offset + results.length < totalCount,
    }

    // Cache results in KV with 15 minute TTL (900 seconds)
    await ctx.env.KV.put(
      cacheKey,
      JSON.stringify(responseData),
      { expirationTtl: 900 } // 15 minutes
    )

    return successResponse(
      {
        ...responseData,
        cached: false,
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    console.error('Search error:', error)
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      error instanceof Error ? error.message : 'Failed to perform search',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Search artists
 * GET /v1/search/artists
 */
export const searchArtists: RouteHandler = async (ctx) => {
  // Redirect to global search with type=artists
  const url = new URL(ctx.request.url)
  url.searchParams.set('type', 'artists')
  url.pathname = '/v1/search'

  // Forward to globalSearch
  const modifiedCtx = {
    ...ctx,
    url,
  }

  return globalSearch(modifiedCtx)
}

/**
 * Search gigs
 * GET /v1/search/gigs
 */
export const searchGigs: RouteHandler = async (ctx) => {
  // Redirect to global search with type=gigs
  const url = new URL(ctx.request.url)
  url.searchParams.set('type', 'gigs')
  url.pathname = '/v1/search'

  // Forward to globalSearch
  const modifiedCtx = {
    ...ctx,
    url,
  }

  return globalSearch(modifiedCtx)
}

/**
 * Search tracks
 * GET /v1/search/tracks
 */
export const searchTracks: RouteHandler = async (ctx) => {
  const query = ctx.url.searchParams.get('q')
  const page = parseInt(ctx.url.searchParams.get('page') || '1')
  const limit = parseInt(ctx.url.searchParams.get('limit') || '20')

  if (!query) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'Search query required',
      400,
      'q',
      ctx.requestId
    )
  }

  // TODO: Implement track search (not in MVP scope for task-5.5)
  return successResponse(
    {
      query,
      tracks: [],
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
 * Get search suggestions (autocomplete)
 * GET /v1/search/suggestions
 */
export const getSearchSuggestions: RouteHandler = async (ctx) => {
  const query = ctx.url.searchParams.get('q')

  if (!query) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'Search query required',
      400,
      'q',
      ctx.requestId
    )
  }

  // TODO: Implement search suggestions/autocomplete (not in MVP scope for task-5.5)
  return successResponse(
    {
      query,
      suggestions: [],
    },
    200,
    ctx.requestId
  )
}
