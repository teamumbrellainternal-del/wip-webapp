/**
 * Analytics controller
 * Handles daily batch metrics per D-008
 * Metrics calculated at midnight UTC
 */

import type { RouteHandler } from '../../router'
import { successResponse, errorResponse } from '../../utils/response'
import { ErrorCodes } from '../../utils/error-codes'

export const getDashboard: RouteHandler = async (ctx) => {
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

    // 2. Determine date range (current month vs previous month)
    const today = new Date()
    const currentStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const currentEnd = today
    const previousStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const previousEnd = new Date(today.getFullYear(), today.getMonth(), 0)

    // Format dates
    const formatDate = (date: Date) => date.toISOString().split('T')[0]
    const currentStartStr = formatDate(currentStart)
    const currentEndStr = formatDate(currentEnd)
    const previousStartStr = formatDate(previousStart)
    const previousEndStr = formatDate(previousEnd)

    // 3. Fetch key metrics
    // Earnings & Gigs
    const currentMetrics = await ctx.env.DB.prepare(`
      SELECT
        SUM(earnings) as total_earnings,
        SUM(gigs_completed) as total_gigs,
        SUM(profile_views) as total_views
      FROM daily_metrics
      WHERE artist_id = ? AND date >= ? AND date <= ?
    `).bind(artist.id, currentStartStr, currentEndStr).first<any>()

    const previousMetrics = await ctx.env.DB.prepare(`
      SELECT
        SUM(earnings) as total_earnings,
        SUM(gigs_completed) as total_gigs,
        SUM(profile_views) as total_views
      FROM daily_metrics
      WHERE artist_id = ? AND date >= ? AND date <= ?
    `).bind(artist.id, previousStartStr, previousEndStr).first<any>()

    // Calculate percentage changes
    const calculateChange = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0
      return Math.round(((current - previous) / previous) * 100)
    }

    // 4. Get latest messages (stub for now - would query messages table)
    // TODO: Query real messages table once populated
    const messages: any[] = []

    // 5. Get latest endorsements (stub for now - would query reviews table)
    // TODO: Query real reviews table once populated
    const endorsements: any[] = []

    // 6. Get new opportunities (open gigs)
    // D-010: Prioritize urgent gigs
    const opportunitiesResult = await ctx.env.DB.prepare(`
      SELECT
        id,
        title,
        venue_name,
        payment_amount,
        date,
        urgency_flag
      FROM gigs
      WHERE status = 'open' AND date >= ?
      ORDER BY urgency_flag DESC, date ASC
      LIMIT 3
    `).bind(currentStartStr).all()

    const opportunities = (opportunitiesResult.results || []).map((gig: any) => ({
      id: gig.id,
      title: gig.title,
      venue_name: gig.venue_name,
      payment_amount: gig.payment_amount,
      date: gig.date,
      urgency_flag: Boolean(gig.urgency_flag),
      match_score: 0 // Placeholder for matching algorithm
    }))

    // 7. Return dashboard data
    return successResponse(
      {
        earnings: {
          current_month: currentMetrics?.total_earnings || 0,
          percentage_change: calculateChange(
            currentMetrics?.total_earnings || 0,
            previousMetrics?.total_earnings || 0
          ),
        },
        gigs_booked: {
          count: currentMetrics?.total_gigs || 0,
          timeframe: 'this month',
        },
        profile_views: {
          count: currentMetrics?.total_views || 0,
          percentage_change: calculateChange(
            currentMetrics?.total_views || 0,
            previousMetrics?.total_views || 0
          ),
        },
        messages,
        endorsements,
        opportunities,
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      'Failed to fetch dashboard data',
      500,
      undefined,
      ctx.requestId
    )
  }
}

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

/**
 * Get user goals
 * GET /v1/analytics/goals
 *
 * Returns all goals for the authenticated user with progress tracking
 */
export const getGoals: RouteHandler = async (ctx) => {
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

    // 2. Fetch all goals for this artist
    const result = await ctx.env.DB.prepare(`
      SELECT
        id,
        title,
        description,
        target_value,
        current_value,
        goal_type,
        target_date,
        completed,
        created_at,
        updated_at
      FROM goals
      WHERE artist_id = ?
      ORDER BY completed ASC, target_date ASC
    `).bind(artist.id).all()

    // 3. Map to frontend format
    const goals = (result.results || []).map((goal: any) => ({
      id: goal.id,
      title: goal.title,
      description: goal.description || null,
      type: goal.goal_type,
      target: goal.target_value,
      current: goal.current_value || 0,
      deadline: goal.target_date || null,
      status: goal.completed ? 'completed' : 'active',
      progress: goal.target_value > 0
        ? Math.min(100, Math.round((goal.current_value / goal.target_value) * 100))
        : 0,
      created_at: goal.created_at,
      updated_at: goal.updated_at,
    }))

    return successResponse(goals, 200, ctx.requestId)
  } catch (error) {
    console.error('Error fetching goals:', error)
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      'Failed to fetch goals',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Create a new goal
 * POST /v1/analytics/goals
 *
 * Request body:
 * - title: string (required)
 * - description: string (optional)
 * - target_value: number (required)
 * - goal_type: 'earnings' | 'gigs' | 'followers' | 'tracks' | 'custom'
 * - target_date: ISO date string (optional)
 */
export const createGoal: RouteHandler = async (ctx) => {
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

    // 2. Parse request body
    const body = await ctx.request.json() as any

    // 3. Validate required fields
    if (!body.title || !body.target_value || !body.goal_type) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Missing required fields: title, target_value, goal_type',
        400,
        undefined,
        ctx.requestId
      )
    }

    // 4. Validate goal_type
    const validTypes = ['earnings', 'gigs', 'followers', 'tracks', 'custom']
    if (!validTypes.includes(body.goal_type)) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        `Invalid goal_type. Must be one of: ${validTypes.join(', ')}`,
        400,
        undefined,
        ctx.requestId
      )
    }

    // 5. Generate goal ID
    const goalId = `goal_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    const now = new Date().toISOString()

    // 6. Insert goal into database
    await ctx.env.DB.prepare(`
      INSERT INTO goals (
        id, artist_id, title, description, target_value, current_value,
        goal_type, target_date, completed, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 0, ?, ?, 0, ?, ?)
    `).bind(
      goalId,
      artist.id,
      body.title,
      body.description || null,
      body.target_value,
      body.goal_type,
      body.target_date || null,
      now,
      now
    ).run()

    // 7. Return created goal
    const createdGoal = {
      id: goalId,
      title: body.title,
      description: body.description || null,
      type: body.goal_type,
      target: body.target_value,
      current: 0,
      deadline: body.target_date || null,
      status: 'active',
      progress: 0,
      created_at: now,
      updated_at: now,
    }

    return successResponse(createdGoal, 201, ctx.requestId)
  } catch (error) {
    console.error('Error creating goal:', error)
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      'Failed to create goal',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Update a goal
 * PUT /v1/analytics/goals/:id
 *
 * Request body:
 * - title: string (optional)
 * - description: string (optional)
 * - target_value: number (optional)
 * - current_value: number (optional)
 * - target_date: ISO date string (optional)
 * - completed: boolean (optional)
 */
export const updateGoal: RouteHandler = async (ctx) => {
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
    const goalId = ctx.params.id

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

    // 2. Verify goal belongs to this artist
    const existingGoal = await ctx.env.DB.prepare(
      'SELECT id FROM goals WHERE id = ? AND artist_id = ?'
    ).bind(goalId, artist.id).first()

    if (!existingGoal) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Goal not found',
        404,
        undefined,
        ctx.requestId
      )
    }

    // 3. Parse request body
    const body = await ctx.request.json() as any

    // 4. Build dynamic UPDATE query
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
    if (body.target_value !== undefined) {
      updates.push('target_value = ?')
      values.push(body.target_value)
    }
    if (body.current_value !== undefined) {
      updates.push('current_value = ?')
      values.push(body.current_value)
    }
    if (body.target_date !== undefined) {
      updates.push('target_date = ?')
      values.push(body.target_date)
    }
    if (body.completed !== undefined) {
      updates.push('completed = ?')
      values.push(body.completed ? 1 : 0)
    }

    // Always update updated_at
    updates.push('updated_at = ?')
    values.push(new Date().toISOString())

    // 5. Execute update
    if (updates.length > 0) {
      values.push(goalId, artist.id)
      await ctx.env.DB.prepare(`
        UPDATE goals
        SET ${updates.join(', ')}
        WHERE id = ? AND artist_id = ?
      `).bind(...values).run()
    }

    // 6. Fetch updated goal
    const updatedGoal = await ctx.env.DB.prepare(`
      SELECT
        id, title, description, target_value, current_value,
        goal_type, target_date, completed, created_at, updated_at
      FROM goals
      WHERE id = ?
    `).bind(goalId).first<any>()

    // 7. Return updated goal
    return successResponse(
      {
        id: updatedGoal.id,
        title: updatedGoal.title,
        description: updatedGoal.description || null,
        type: updatedGoal.goal_type,
        target: updatedGoal.target_value,
        current: updatedGoal.current_value || 0,
        deadline: updatedGoal.target_date || null,
        status: updatedGoal.completed ? 'completed' : 'active',
        progress: updatedGoal.target_value > 0
          ? Math.min(100, Math.round((updatedGoal.current_value / updatedGoal.target_value) * 100))
          : 0,
        created_at: updatedGoal.created_at,
        updated_at: updatedGoal.updated_at,
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error updating goal:', error)
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      'Failed to update goal',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Delete a goal
 * DELETE /v1/analytics/goals/:id
 */
export const deleteGoal: RouteHandler = async (ctx) => {
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
    const goalId = ctx.params.id

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

    // 2. Delete goal (only if it belongs to this artist)
    const result = await ctx.env.DB.prepare(
      'DELETE FROM goals WHERE id = ? AND artist_id = ?'
    ).bind(goalId, artist.id).run()

    // 3. Check if goal was deleted
    if (result.meta.changes === 0) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Goal not found',
        404,
        undefined,
        ctx.requestId
      )
    }

    // 4. Return success
    return successResponse(
      { message: 'Goal deleted successfully', id: goalId },
      200,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error deleting goal:', error)
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      'Failed to delete goal',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Get user achievements
 * GET /v1/analytics/achievements
 *
 * Returns all achievements (both unlocked and locked) with progress
 */
export const getAchievements: RouteHandler = async (ctx) => {
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

    // 2. Fetch all system achievements with user progress
    const result = await ctx.env.DB.prepare(`
      SELECT
        a.id,
        a.name,
        a.description,
        a.icon,
        a.category,
        a.points,
        a.rarity,
        ua.unlocked_at,
        ua.progress
      FROM achievements a
      LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.artist_id = ?
      ORDER BY ua.unlocked_at DESC, a.rarity DESC, a.category
    `).bind(artist.id).all()

    // 3. Map to frontend format
    const achievements = (result.results || []).map((ach: any) => ({
      id: ach.id,
      name: ach.name,
      description: ach.description,
      icon: ach.icon || 'trophy',
      category: ach.category,
      points: ach.points || 0,
      rarity: ach.rarity || 'common',
      unlocked_at: ach.unlocked_at || null,
      progress: ach.progress || 0,
      locked: !ach.unlocked_at,
    }))

    return successResponse(achievements, 200, ctx.requestId)
  } catch (error) {
    console.error('Error fetching achievements:', error)
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      'Failed to fetch achievements',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Get performance data for charts
 * GET /v1/analytics/performance
 *
 * Query params:
 * - period: 'monthly' or 'yearly' (default: 'monthly')
 *
 * This is a convenience wrapper around getAnalytics for the GrowthPage charts
 */
export const getPerformance: RouteHandler = async (ctx) => {
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
    // Parse period parameter
    const period = ctx.url.searchParams.get('period') || 'monthly'

    // Map 'monthly' to 'month' and 'yearly' to 'year' for the analytics endpoint
    const analyticsResponse = await getAnalytics({
      ...ctx,
      url: new URL(`${ctx.url.origin}${ctx.url.pathname}?period=${period === 'monthly' ? 'month' : 'year'}`)
    })

    // If getAnalytics returned an error, pass it through
    if (analyticsResponse.status !== 200) {
      return analyticsResponse
    }

    // Parse the response and extract chart data
    const data = await analyticsResponse.json()

    // Transform chart_data into the format expected by the frontend
    // Frontend expects: { period, earnings: [{date, value}], gigs: [{date, value}], profile_views: [{date, value}] }
    const chartData = data.chart_data || []

    const earnings = chartData.map((point: any) => ({
      date: point.date,
      value: point.earnings || 0
    }))

    const gigs = chartData.map((point: any) => ({
      date: point.date,
      value: point.gigs || 0
    }))

    const profile_views = chartData.map((point: any) => ({
      date: point.date,
      value: point.views || 0
    }))

    // Return performance data in the format expected by the frontend
    return successResponse(
      {
        period: period,
        earnings,
        gigs,
        profile_views,
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error fetching performance data:', error)
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      'Failed to fetch performance data',
      500,
      undefined,
      ctx.requestId
    )
  }
}
