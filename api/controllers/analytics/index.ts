/**
 * Analytics controller
 * Handles daily batch metrics per D-008
 * Metrics calculated at midnight UTC
 */

import type { RouteHandler } from '../../router'
import { successResponse, errorResponse } from '../../utils/response'
import { ErrorCodes } from '../../utils/error-codes'

/**
 * Get analytics overview
 * GET /v1/analytics
 *
 * Query params:
 * - period: 'month' or 'year' (default: 'month')
 * - start_date: ISO date YYYY-MM-DD (optional)
 * - end_date: ISO date YYYY-MM-DD (optional)
 *
 * Returns aggregated metrics with percentage changes, chart data, and peak values
 */
export const getAnalytics: RouteHandler = async (ctx) => {
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
    // 1. Get artist profile from user_id
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

    // 2. Parse query parameters
    const period = ctx.url.searchParams.get('period') || 'month'
    const customStartDate = ctx.url.searchParams.get('start_date')
    const customEndDate = ctx.url.searchParams.get('end_date')

    // 3. Calculate date ranges for current and previous periods
    const today = new Date()
    let currentStart: Date
    let currentEnd: Date
    let previousStart: Date
    let previousEnd: Date

    if (customStartDate && customEndDate) {
      // Use custom date range
      currentStart = new Date(customStartDate)
      currentEnd = new Date(customEndDate)

      // Calculate previous period of same length
      const periodLength = Math.floor((currentEnd.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24))
      previousEnd = new Date(currentStart)
      previousEnd.setDate(previousEnd.getDate() - 1)
      previousStart = new Date(previousEnd)
      previousStart.setDate(previousStart.getDate() - periodLength)
    } else if (period === 'year') {
      // Current year
      currentStart = new Date(today.getFullYear(), 0, 1)
      currentEnd = today

      // Previous year
      previousStart = new Date(today.getFullYear() - 1, 0, 1)
      previousEnd = new Date(today.getFullYear() - 1, 11, 31)
    } else {
      // Default to month
      currentStart = new Date(today.getFullYear(), today.getMonth(), 1)
      currentEnd = today

      // Previous month
      previousStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      previousEnd = new Date(today.getFullYear(), today.getMonth(), 0)
    }

    // Format dates as YYYY-MM-DD for SQL query
    const formatDate = (date: Date) => date.toISOString().split('T')[0]
    const currentStartStr = formatDate(currentStart)
    const currentEndStr = formatDate(currentEnd)
    const previousStartStr = formatDate(previousStart)
    const previousEndStr = formatDate(previousEnd)

    // 4. Fetch current period metrics from daily_metrics table
    const currentMetrics = await ctx.env.DB.prepare(`
      SELECT
        date,
        profile_views,
        gigs_completed,
        earnings,
        avg_rating,
        follower_count,
        track_plays
      FROM daily_metrics
      WHERE artist_id = ? AND date >= ? AND date <= ?
      ORDER BY date ASC
    `).bind(artist.id, currentStartStr, currentEndStr).all()

    // 5. Fetch previous period metrics for comparison
    const previousMetrics = await ctx.env.DB.prepare(`
      SELECT
        profile_views,
        gigs_completed,
        earnings,
        follower_count
      FROM daily_metrics
      WHERE artist_id = ? AND date >= ? AND date <= ?
      ORDER BY date ASC
    `).bind(artist.id, previousStartStr, previousEndStr).all()

    // 6. Calculate current period totals
    const currentData = currentMetrics.results || []
    const previousData = previousMetrics.results || []

    const currentEarnings = currentData.reduce((sum: number, row: any) => sum + (row.earnings || 0), 0)
    const currentGigs = currentData.reduce((sum: number, row: any) => sum + (row.gigs_completed || 0), 0)
    const currentViews = currentData.reduce((sum: number, row: any) => sum + (row.profile_views || 0), 0)

    // For follower_count and avg_rating, use the latest value
    const latestMetric = currentData.length > 0 ? currentData[currentData.length - 1] : null
    const currentFollowers = latestMetric?.follower_count || 0
    const currentRating = latestMetric?.avg_rating || 0

    // 7. Calculate previous period totals
    const previousEarnings = previousData.reduce((sum: number, row: any) => sum + (row.earnings || 0), 0)
    const previousGigs = previousData.reduce((sum: number, row: any) => sum + (row.gigs_completed || 0), 0)
    const previousViews = previousData.reduce((sum: number, row: any) => sum + (row.profile_views || 0), 0)
    const previousFollowers = previousData.length > 0 ? previousData[previousData.length - 1]?.follower_count || 0 : 0

    // 8. Calculate percentage changes
    const calculateChange = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0
      return Math.round(((current - previous) / previous) * 100)
    }

    const earningsChange = calculateChange(currentEarnings, previousEarnings)
    const gigsChange = calculateChange(currentGigs, previousGigs)
    const viewsChange = calculateChange(currentViews, previousViews)
    const followersChange = calculateChange(currentFollowers, previousFollowers)

    // 9. Generate chart data array (date → metrics mapping)
    const chartData = currentData.map((row: any) => ({
      date: row.date,
      earnings: row.earnings || 0,
      gigs: row.gigs_completed || 0,
      views: row.profile_views || 0,
      followers: row.follower_count || 0,
      rating: row.avg_rating || 0,
    }))

    // 10. Calculate peak values across all current period data
    const peakRevenue = Math.max(...currentData.map((row: any) => row.earnings || 0), 0)
    const peakGigs = Math.max(...currentData.map((row: any) => row.gigs_completed || 0), 0)
    const peakFans = Math.max(...currentData.map((row: any) => row.follower_count || 0), 0)

    // 11. Return comprehensive analytics response
    return successResponse(
      {
        period,
        date_range: {
          start: currentStartStr,
          end: currentEndStr,
        },
        metrics: {
          total_earnings: currentEarnings,
          earnings_change: earningsChange,
          gig_count: currentGigs,
          gig_change: gigsChange,
          profile_views: currentViews,
          views_change: viewsChange,
          follower_count: currentFollowers,
          followers_change: followersChange,
          avg_rating: currentRating,
        },
        chart_data: chartData,
        peaks: {
          peak_revenue: peakRevenue,
          peak_gigs: peakGigs,
          peak_fans: peakFans,
        },
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      'Failed to fetch analytics data',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Get profile views analytics
 * GET /v1/analytics/profile-views
 */
export const getProfileViews: RouteHandler = async (ctx) => {
  if (!ctx.userId) {
    return errorResponse(
      ErrorCodes.AUTHENTICATION_FAILED,
      'Authentication required',
      401,
      undefined,
      ctx.requestId
    )
  }

  // TODO: Implement profile view analytics
  return successResponse(
    {
      total: 0,
      daily: [],
    },
    200,
    ctx.requestId
  )
}

/**
 * Get gig analytics
 * GET /v1/analytics/gigs
 */
export const getGigAnalytics: RouteHandler = async (ctx) => {
  if (!ctx.userId) {
    return errorResponse(
      ErrorCodes.AUTHENTICATION_FAILED,
      'Authentication required',
      401,
      undefined,
      ctx.requestId
    )
  }

  // TODO: Implement gig analytics
  return successResponse(
    {
      applicationsSubmitted: 0,
      applicationsAccepted: 0,
      gigsCompleted: 0,
      averageRating: 0,
    },
    200,
    ctx.requestId
  )
}

/**
 * Get messaging analytics
 * GET /v1/analytics/messages
 */
export const getMessageAnalytics: RouteHandler = async (ctx) => {
  if (!ctx.userId) {
    return errorResponse(
      ErrorCodes.AUTHENTICATION_FAILED,
      'Authentication required',
      401,
      undefined,
      ctx.requestId
    )
  }

  // TODO: Implement message analytics
  return successResponse(
    {
      sent: 0,
      received: 0,
      conversations: 0,
      averageResponseTime: 0,
    },
    200,
    ctx.requestId
  )
}

/**
 * Get Violet AI usage analytics
 * GET /v1/analytics/violet
 */
export const getVioletAnalytics: RouteHandler = async (ctx) => {
  if (!ctx.userId) {
    return errorResponse(
      ErrorCodes.AUTHENTICATION_FAILED,
      'Authentication required',
      401,
      undefined,
      ctx.requestId
    )
  }

  // TODO: Implement Violet usage analytics
  return successResponse(
    {
      promptsUsed: 0,
      dailyLimit: 50,
      remaining: 50,
      resetAt: new Date(Date.now() + 86400000).toISOString(),
    },
    200,
    ctx.requestId
  )
}

/**
 * Get storage analytics
 * GET /v1/analytics/storage
 */
export const getStorageAnalytics: RouteHandler = async (ctx) => {
  if (!ctx.userId) {
    return errorResponse(
      ErrorCodes.AUTHENTICATION_FAILED,
      'Authentication required',
      401,
      undefined,
      ctx.requestId
    )
  }

  // TODO: Implement storage analytics
  return successResponse(
    {
      used: 0,
      quota: 53687091200, // 50GB
      byType: {
        audio: 0,
        image: 0,
        video: 0,
        document: 0,
      },
    },
    200,
    ctx.requestId
  )
}

/**
 * Get spotlight artists for Growth page
 * GET /v1/analytics/spotlight
 *
 * Per D-068: Returns 10 random verified artists with rating > 4.5
 * Public endpoint (no auth required)
 * Uses KV cache with 24-hour TTL
 */
export const getSpotlightArtists: RouteHandler = async (ctx) => {
  try {
    // 1. Calculate cache key with today's date (UTC)
    const today = new Date()
    const dateKey = today.toISOString().split('T')[0] // YYYY-MM-DD format
    const cacheKey = `spotlight:${dateKey}`

    // 2. Check KV cache for spotlight data
    const cachedData = await ctx.env.KV.get(cacheKey, 'json')
    if (cachedData) {
      console.log(`Spotlight cache hit for ${dateKey}`)
      return successResponse(
        {
          spotlight_artists: cachedData,
          cached: true,
          date: dateKey,
        },
        200,
        ctx.requestId
      )
    }

    // 3. Cache miss - query database for spotlight artists
    console.log(`Spotlight cache miss for ${dateKey}, fetching from DB`)

    // Query: SELECT random verified artists with rating > 4.5
    // SQLite uses RANDOM() for random ordering
    const result = await ctx.env.DB.prepare(`
      SELECT
        id,
        stage_name as name,
        primary_genre as genre,
        avg_rating as rating,
        total_gigs as gig_count,
        verified,
        avatar_url
      FROM artists
      WHERE verified = 1 AND avg_rating > 4.5
      ORDER BY RANDOM()
      LIMIT 10
    `).all()

    const spotlightArtists = (result.results || []).map((artist: any) => ({
      id: artist.id,
      name: artist.name,
      genre: artist.genre || 'Unknown',
      rating: Number(artist.rating) || 0,
      gig_count: artist.gig_count || 0,
      verified: Boolean(artist.verified),
      avatar_url: artist.avatar_url || null,
    }))

    // 4. Store in KV cache with 24-hour TTL (86400 seconds)
    // Cache will expire at midnight UTC tomorrow
    const expirationTtl = 86400 // 24 hours in seconds
    await ctx.env.KV.put(
      cacheKey,
      JSON.stringify(spotlightArtists),
      { expirationTtl }
    )

    console.log(`Cached ${spotlightArtists.length} spotlight artists for ${dateKey}`)

    // 5. Return spotlight artists
    return successResponse(
      {
        spotlight_artists: spotlightArtists,
        cached: false,
        date: dateKey,
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error fetching spotlight artists:', error)
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      'Failed to fetch spotlight artists',
      500,
      undefined,
      ctx.requestId
    )
  }
}
