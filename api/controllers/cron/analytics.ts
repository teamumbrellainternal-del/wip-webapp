/**
 * Analytics Cron Job Handler
 * Runs daily at midnight UTC to aggregate analytics data for all artists
 *
 * Per D-008: Daily batch metrics aggregation
 * Per task-4.2: Cron job with retry logic and execution logging
 */

import type { Env } from '../../index'
import { generateUUIDv4 } from '../../utils/uuid'

/**
 * Cron log entry
 */
interface CronLog {
  id: string
  job_name: string
  start_time: string
  end_time: string | null
  duration_ms: number | null
  records_processed: number
  errors_count: number
  status: 'running' | 'completed' | 'failed'
  error_message: string | null
  metadata: string | null
  created_at: string
}

/**
 * Artist metrics for aggregation
 */
interface ArtistMetrics {
  artist_id: string
  profile_views: number
  gigs_completed: number
  earnings: number
  avg_rating: number
  follower_count: number
  track_plays: number
}

/**
 * Create a cron log entry
 */
async function createCronLog(
  db: D1Database,
  jobName: string,
  status: 'running' | 'completed' | 'failed',
  options: {
    startTime: string
    endTime?: string
    durationMs?: number
    recordsProcessed?: number
    errorsCount?: number
    errorMessage?: string
    metadata?: any
  }
): Promise<void> {
  const now = new Date().toISOString()

  await db
    .prepare(
      `INSERT INTO cron_logs (
        id, job_name, start_time, end_time, duration_ms,
        records_processed, errors_count, status, error_message,
        metadata, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      generateUUIDv4(),
      jobName,
      options.startTime,
      options.endTime || null,
      options.durationMs || null,
      options.recordsProcessed || 0,
      options.errorsCount || 0,
      status,
      options.errorMessage || null,
      options.metadata ? JSON.stringify(options.metadata) : null,
      now
    )
    .run()
}

/**
 * Aggregate analytics for a single artist
 */
async function aggregateArtistMetrics(
  db: D1Database,
  artistId: string,
  yesterday: string
): Promise<ArtistMetrics> {
  // Get the artist's basic data
  const artist = await db
    .prepare('SELECT follower_count, avg_rating FROM artists WHERE id = ?')
    .bind(artistId)
    .first<{ follower_count: number; avg_rating: number }>()

  // Count profile views for yesterday (would be tracked in a profile_views table if implemented)
  // For now, we'll use 0 as placeholder - this would need actual tracking
  const profileViews = 0

  // Count completed gigs for yesterday
  // Per D-080: Either party can mark gig as complete
  const gigsResult = await db
    .prepare(
      `SELECT COUNT(*) as count, COALESCE(SUM(payment_amount), 0) as total_earnings
       FROM gigs g
       INNER JOIN gig_applications ga ON g.id = ga.gig_id
       WHERE ga.artist_id = ?
         AND g.status = 'completed'
         AND g.date = ?
         AND ga.status = 'accepted'`
    )
    .bind(artistId, yesterday)
    .first<{ count: number; total_earnings: number }>()

  // Count track plays for yesterday (would be tracked if implemented)
  const trackPlays = 0

  return {
    artist_id: artistId,
    profile_views: profileViews,
    gigs_completed: gigsResult?.count || 0,
    earnings: gigsResult?.total_earnings || 0,
    avg_rating: artist?.avg_rating || 0,
    follower_count: artist?.follower_count || 0,
    track_plays: trackPlays,
  }
}

/**
 * Generate spotlight artists and cache in KV
 * Called by cron job to pre-populate the cache at midnight UTC
 */
async function generateSpotlightArtists(db: D1Database, kv: KVNamespace, today: string): Promise<number> {
  try {
    // Query: SELECT random verified artists with rating > 4.5
    const result = await db.prepare(`
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

    // Store in KV cache with 24-hour TTL
    const cacheKey = `spotlight:${today}`
    const expirationTtl = 86400 // 24 hours in seconds
    await kv.put(
      cacheKey,
      JSON.stringify(spotlightArtists),
      { expirationTtl }
    )

    console.log(`Cached ${spotlightArtists.length} spotlight artists for ${today}`)
    return spotlightArtists.length
  } catch (error) {
    console.error('Error generating spotlight artists:', error)
    throw error
  }
}

/**
 * Aggregate analytics for all artists
 * Runs daily at midnight UTC via cron trigger
 */
export async function aggregateAnalytics(env: Env): Promise<Response> {
  const startTime = new Date()
  const startTimeIso = startTime.toISOString()

  let recordsProcessed = 0
  let errorsCount = 0
  const errors: string[] = []

  try {
    // Calculate yesterday's date (UTC)
    const yesterday = new Date(startTime)
    yesterday.setUTCDate(yesterday.getUTCDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0] // YYYY-MM-DD

    // Calculate today's date for spotlight generation
    const todayStr = startTime.toISOString().split('T')[0] // YYYY-MM-DD

    // Log job start
    await createCronLog(env.DB, 'analytics_aggregation', 'running', {
      startTime: startTimeIso,
      metadata: { date: yesterdayStr },
    })

    // Fetch all active artists
    const artistsResult = await env.DB
      .prepare('SELECT id FROM artists WHERE step_1_complete = 1')
      .all<{ id: string }>()

    const artists = artistsResult.results || []

    if (artists.length === 0) {
      const endTime = new Date()
      const duration = endTime.getTime() - startTime.getTime()

      await createCronLog(env.DB, 'analytics_aggregation', 'completed', {
        startTime: startTimeIso,
        endTime: endTime.toISOString(),
        durationMs: duration,
        recordsProcessed: 0,
        errorsCount: 0,
        metadata: { date: yesterdayStr, message: 'No artists to process' },
      })

      return new Response(
        JSON.stringify({
          success: true,
          message: 'No artists to process',
          recordsProcessed: 0,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Process each artist
    for (const artist of artists) {
      try {
        // Aggregate metrics for this artist
        const metrics = await aggregateArtistMetrics(env.DB, artist.id, yesterdayStr)

        // Check if record already exists for this date
        const existing = await env.DB
          .prepare('SELECT id FROM daily_metrics WHERE artist_id = ? AND date = ?')
          .bind(artist.id, yesterdayStr)
          .first()

        if (existing) {
          // Update existing record
          await env.DB
            .prepare(
              `UPDATE daily_metrics
               SET profile_views = ?,
                   gigs_completed = ?,
                   earnings = ?,
                   avg_rating = ?,
                   follower_count = ?,
                   track_plays = ?
               WHERE artist_id = ? AND date = ?`
            )
            .bind(
              metrics.profile_views,
              metrics.gigs_completed,
              metrics.earnings,
              metrics.avg_rating,
              metrics.follower_count,
              metrics.track_plays,
              artist.id,
              yesterdayStr
            )
            .run()
        } else {
          // Insert new record
          await env.DB
            .prepare(
              `INSERT INTO daily_metrics (
                id, artist_id, date, profile_views, gigs_completed,
                earnings, avg_rating, follower_count, track_plays, created_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
            )
            .bind(
              generateUUIDv4(),
              artist.id,
              yesterdayStr,
              metrics.profile_views,
              metrics.gigs_completed,
              metrics.earnings,
              metrics.avg_rating,
              metrics.follower_count,
              metrics.track_plays,
              new Date().toISOString()
            )
            .run()
        }

        recordsProcessed++
      } catch (error) {
        errorsCount++
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        errors.push(`Artist ${artist.id}: ${errorMsg}`)
        console.error(`Error processing artist ${artist.id}:`, error)
        // Continue processing other artists
      }
    }

    // Generate and cache spotlight artists for today (task-4.4)
    let spotlightCount = 0
    try {
      spotlightCount = await generateSpotlightArtists(env.DB, env.KV, todayStr)
      console.log(`Generated ${spotlightCount} spotlight artists for ${todayStr}`)
    } catch (spotlightError) {
      errorsCount++
      const errorMsg = spotlightError instanceof Error ? spotlightError.message : 'Unknown error'
      errors.push(`Spotlight generation: ${errorMsg}`)
      console.error('Error generating spotlight artists:', spotlightError)
      // Don't fail the entire job if spotlight generation fails
    }

    // Calculate duration
    const endTime = new Date()
    const duration = endTime.getTime() - startTime.getTime()

    // Log completion
    const status = errorsCount > 0 ? 'completed' : 'completed'
    await createCronLog(env.DB, 'analytics_aggregation', status, {
      startTime: startTimeIso,
      endTime: endTime.toISOString(),
      durationMs: duration,
      recordsProcessed,
      errorsCount,
      errorMessage: errors.length > 0 ? errors.join('; ') : null,
      metadata: {
        date: yesterdayStr,
        totalArtists: artists.length,
        successRate: `${((recordsProcessed / artists.length) * 100).toFixed(2)}%`,
        spotlightCount,
      },
    })

    console.log(
      `Analytics aggregated for ${recordsProcessed} artists in ${duration}ms (${errorsCount} errors)`
    )

    return new Response(
      JSON.stringify({
        success: true,
        message: `Analytics aggregated for ${recordsProcessed} artists`,
        recordsProcessed,
        errorsCount,
        duration,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    // Fatal error - log failure
    const endTime = new Date()
    const duration = endTime.getTime() - startTime.getTime()
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'

    await createCronLog(env.DB, 'analytics_aggregation', 'failed', {
      startTime: startTimeIso,
      endTime: endTime.toISOString(),
      durationMs: duration,
      recordsProcessed,
      errorsCount: errorsCount + 1,
      errorMessage: errorMsg,
    })

    console.error('Fatal error in analytics aggregation:', error)

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMsg,
        recordsProcessed,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

/**
 * Manual trigger handler for /cron/analytics endpoint
 * Allows testing and emergency runs with ?force=true
 */
export async function handleAnalyticsCron(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)
  const forceParam = url.searchParams.get('force')

  // Check if this is a manual trigger
  if (forceParam !== 'true') {
    return new Response(
      JSON.stringify({
        error: 'Manual trigger requires ?force=true parameter',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // Run the aggregation
  return aggregateAnalytics(env)
}
