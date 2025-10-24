/**
 * Onboarding controller
 * Handles 5-step artist onboarding flow per D-003
 *
 * Steps:
 * 1. Identity & Basics (stage_name, genre, location)
 * 2. Links & Your Story (min 3 social links, bio, story)
 * 3. Creative Profile Tags (genres, influences, equipment)
 * 4. Your Numbers (rates, availability, metrics)
 * 5. Quick Questions (Yes/No questions about music career)
 *
 * Design Decisions:
 * - D-003: All 5 steps required for completion
 * - D-004: No progress saved on exit (stored in KV as temporary session data)
 * - D-006: Restart from Step 1 if incomplete
 */

import type { RouteHandler } from '../../router'
import { successResponse, errorResponse } from '../../utils/response'
import { ErrorCodes } from '../../utils/error-codes'
import { generateUUIDv4 } from '../../utils/uuid'
import {
  validateStep1,
  validateStep2,
  validateStep3,
  validateStep4,
  validateStep5,
  sanitizeHandle,
} from '../../utils/validation'
import { serializeArrayField } from '../../models/artist'

/**
 * Onboarding session stored in KV (temporary data, deleted after completion or timeout)
 */
interface OnboardingSession {
  userId: string
  currentStep: number
  completedSteps: number[]
  data: {
    step1?: any
    step2?: any
    step3?: any
    step4?: any
    step5?: any
  }
  createdAt: string
  updatedAt: string
  expiresAt: string
}

/**
 * Get onboarding session key for KV
 */
function getOnboardingSessionKey(userId: string): string {
  return `onboarding:${userId}`
}

/**
 * Get onboarding session from KV
 */
async function getOnboardingSession(
  kv: KVNamespace,
  userId: string
): Promise<OnboardingSession | null> {
  const key = getOnboardingSessionKey(userId)
  const sessionData = await kv.get(key, 'json')
  return sessionData as OnboardingSession | null
}

/**
 * Save onboarding session to KV (24-hour TTL per D-004)
 */
async function saveOnboardingSession(
  kv: KVNamespace,
  session: OnboardingSession
): Promise<void> {
  const key = getOnboardingSessionKey(session.userId)
  const ttl = 60 * 60 * 24 // 24 hours
  await kv.put(key, JSON.stringify(session), { expirationTtl: ttl })
}

/**
 * Delete onboarding session from KV
 */
async function deleteOnboardingSession(kv: KVNamespace, userId: string): Promise<void> {
  const key = getOnboardingSessionKey(userId)
  await kv.delete(key)
}

/**
 * Get onboarding status
 * GET /v1/onboarding/status
 */
export const getOnboardingStatus: RouteHandler = async (ctx) => {
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
    // Check if user has completed onboarding
    const userResult = await ctx.env.DB.prepare(
      'SELECT onboarding_complete FROM users WHERE id = ?'
    ).bind(ctx.userId).first<{ onboarding_complete: boolean }>()

    if (!userResult) {
      return errorResponse(
        ErrorCodes.USER_NOT_FOUND,
        'User not found',
        404,
        undefined,
        ctx.requestId
      )
    }

    // If onboarding is complete, return completed status
    if (userResult.onboarding_complete) {
      return successResponse(
        {
          complete: true,
          currentStep: 5,
          completedSteps: [1, 2, 3, 4, 5],
          steps: [
            { step: 1, name: 'identity_basics', complete: true },
            { step: 2, name: 'links_story', complete: true },
            { step: 3, name: 'creative_profile', complete: true },
            { step: 4, name: 'your_numbers', complete: true },
            { step: 5, name: 'quick_questions', complete: true },
          ],
        },
        200,
        ctx.requestId
      )
    }

    // Get onboarding session from KV
    const session = await getOnboardingSession(ctx.env.KV, ctx.userId)

    if (!session) {
      // No session exists, start from step 1
      return successResponse(
        {
          complete: false,
          currentStep: 1,
          completedSteps: [],
          steps: [
            { step: 1, name: 'identity_basics', complete: false },
            { step: 2, name: 'links_story', complete: false },
            { step: 3, name: 'creative_profile', complete: false },
            { step: 4, name: 'your_numbers', complete: false },
            { step: 5, name: 'quick_questions', complete: false },
          ],
        },
        200,
        ctx.requestId
      )
    }

    // Return current session status
    return successResponse(
      {
        complete: false,
        currentStep: session.currentStep,
        completedSteps: session.completedSteps,
        steps: [
          { step: 1, name: 'identity_basics', complete: session.completedSteps.includes(1) },
          { step: 2, name: 'links_story', complete: session.completedSteps.includes(2) },
          { step: 3, name: 'creative_profile', complete: session.completedSteps.includes(3) },
          { step: 4, name: 'your_numbers', complete: session.completedSteps.includes(4) },
          { step: 5, name: 'quick_questions', complete: session.completedSteps.includes(5) },
        ],
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error getting onboarding status:', error)
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      'Failed to get onboarding status',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Submit step 1: Identity & Basics
 * POST /v1/onboarding/step1
 * Required: stage_name, primary_genre
 */
export const submitStep1: RouteHandler = async (ctx) => {
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

    // Validate step 1 data
    const validation = validateStep1(body)
    if (!validation.valid) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Validation failed',
        400,
        undefined,
        ctx.requestId
      )
    }

    // Get or create onboarding session
    let session = await getOnboardingSession(ctx.env.KV, ctx.userId)

    if (!session) {
      session = {
        userId: ctx.userId,
        currentStep: 1,
        completedSteps: [],
        data: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }
    }

    // Save step 1 data to session
    session.data.step1 = body
    session.completedSteps = [1]
    session.currentStep = 2
    session.updatedAt = new Date().toISOString()

    // Save session to KV
    await saveOnboardingSession(ctx.env.KV, session)

    return successResponse(
      {
        message: 'Step 1 completed',
        nextStep: 2,
        completedSteps: session.completedSteps,
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error submitting step 1:', error)
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to submit step 1',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Submit step 2: Links & Your Story
 * POST /v1/onboarding/step2
 * Required: Minimum 3 social links
 */
export const submitStep2: RouteHandler = async (ctx) => {
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

    // Validate step 2 data
    const validation = validateStep2(body)
    if (!validation.valid) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        JSON.stringify(validation.errors),
        400,
        undefined,
        ctx.requestId
      )
    }

    // Get onboarding session
    const session = await getOnboardingSession(ctx.env.KV, ctx.userId)

    if (!session || !session.completedSteps.includes(1)) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Step 1 must be completed first',
        400,
        undefined,
        ctx.requestId
      )
    }

    // Sanitize social media handles
    if (body.instagram_handle) {
      body.instagram_handle = sanitizeHandle(body.instagram_handle)
    }
    if (body.tiktok_handle) {
      body.tiktok_handle = sanitizeHandle(body.tiktok_handle)
    }

    // Save step 2 data to session
    session.data.step2 = body
    if (!session.completedSteps.includes(2)) {
      session.completedSteps.push(2)
    }
    session.currentStep = 3
    session.updatedAt = new Date().toISOString()

    // Save session to KV
    await saveOnboardingSession(ctx.env.KV, session)

    return successResponse(
      {
        message: 'Step 2 completed',
        nextStep: 3,
        completedSteps: session.completedSteps,
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error submitting step 2:', error)
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to submit step 2',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Submit step 3: Creative Profile Tags
 * POST /v1/onboarding/step3
 */
export const submitStep3: RouteHandler = async (ctx) => {
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

    // Validate step 3 data
    const validation = validateStep3(body)
    if (!validation.valid) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        JSON.stringify(validation.errors),
        400,
        undefined,
        ctx.requestId
      )
    }

    // Get onboarding session
    const session = await getOnboardingSession(ctx.env.KV, ctx.userId)

    if (!session || !session.completedSteps.includes(2)) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Step 2 must be completed first',
        400,
        undefined,
        ctx.requestId
      )
    }

    // Save step 3 data to session
    session.data.step3 = body
    if (!session.completedSteps.includes(3)) {
      session.completedSteps.push(3)
    }
    session.currentStep = 4
    session.updatedAt = new Date().toISOString()

    // Save session to KV
    await saveOnboardingSession(ctx.env.KV, session)

    return successResponse(
      {
        message: 'Step 3 completed',
        nextStep: 4,
        completedSteps: session.completedSteps,
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error submitting step 3:', error)
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to submit step 3',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Submit step 4: Your Numbers
 * POST /v1/onboarding/step4
 */
export const submitStep4: RouteHandler = async (ctx) => {
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

    // Validate step 4 data
    const validation = validateStep4(body)
    if (!validation.valid) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        JSON.stringify(validation.errors),
        400,
        undefined,
        ctx.requestId
      )
    }

    // Get onboarding session
    const session = await getOnboardingSession(ctx.env.KV, ctx.userId)

    if (!session || !session.completedSteps.includes(3)) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Step 3 must be completed first',
        400,
        undefined,
        ctx.requestId
      )
    }

    // Save step 4 data to session
    session.data.step4 = body
    if (!session.completedSteps.includes(4)) {
      session.completedSteps.push(4)
    }
    session.currentStep = 5
    session.updatedAt = new Date().toISOString()

    // Save session to KV
    await saveOnboardingSession(ctx.env.KV, session)

    return successResponse(
      {
        message: 'Step 4 completed',
        nextStep: 5,
        completedSteps: session.completedSteps,
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error submitting step 4:', error)
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to submit step 4',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Submit step 5: Quick Questions
 * POST /v1/onboarding/step5
 * This is the final step - creates the artist profile in D1
 */
export const submitStep5: RouteHandler = async (ctx) => {
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

    // Validate step 5 data
    const validation = validateStep5(body)
    if (!validation.valid) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        JSON.stringify(validation.errors),
        400,
        undefined,
        ctx.requestId
      )
    }

    // Get onboarding session
    const session = await getOnboardingSession(ctx.env.KV, ctx.userId)

    if (!session || !session.completedSteps.includes(4)) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Step 4 must be completed first',
        400,
        undefined,
        ctx.requestId
      )
    }

    // Save step 5 data to session
    session.data.step5 = body

    // Combine all steps to create artist profile
    const artistData = {
      ...session.data.step1,
      ...session.data.step2,
      ...session.data.step3,
      ...session.data.step4,
      ...session.data.step5,
    }

    // Generate artist ID
    const artistId = generateUUIDv4()
    const now = new Date().toISOString()

    // Serialize array fields to JSON
    const secondaryGenres = artistData.secondary_genres
      ? serializeArrayField(artistData.secondary_genres)
      : null
    const influences = artistData.influences ? serializeArrayField(artistData.influences) : null
    const artistType = artistData.artist_type ? serializeArrayField(artistData.artist_type) : null
    const equipment = artistData.equipment ? serializeArrayField(artistData.equipment) : null
    const daw = artistData.daw ? serializeArrayField(artistData.daw) : null
    const platforms = artistData.platforms ? serializeArrayField(artistData.platforms) : null
    const subscriptions = artistData.subscriptions
      ? serializeArrayField(artistData.subscriptions)
      : null
    const struggles = artistData.struggles ? serializeArrayField(artistData.struggles) : null
    const availableDates = artistData.available_dates
      ? serializeArrayField(artistData.available_dates)
      : null

    // Insert artist profile into D1
    await ctx.env.DB.prepare(
      `INSERT INTO artists (
        id, user_id,
        stage_name, legal_name, pronouns, location_city, location_state, location_country, location_zip, phone_number,
        bio, story, tagline,
        primary_genre, secondary_genres, influences, artist_type, equipment, daw, platforms, subscriptions, struggles,
        base_rate_flat, base_rate_hourly, rates_negotiable, largest_show_capacity, travel_radius_miles,
        available_weekdays, available_weekends, advance_booking_weeks, available_dates,
        time_split_creative, time_split_logistics,
        currently_making_music, confident_online_presence, struggles_creative_niche,
        knows_where_find_gigs, paid_fairly_performing, understands_royalties,
        tasks_outsource, sound_uniqueness, dream_venue, biggest_inspiration, favorite_create_time, platform_pain_point,
        website_url, instagram_handle, tiktok_handle, youtube_url, spotify_url, apple_music_url,
        soundcloud_url, facebook_url, twitter_url, bandcamp_url,
        verified, avatar_url, banner_url, avg_rating, total_reviews, total_gigs, total_earnings, profile_views, follower_count,
        created_at, updated_at
      ) VALUES (
        ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        0, NULL, NULL, 0, 0, 0, 0, 0, 0,
        ?, ?
      )`
    )
      .bind(
        artistId,
        ctx.userId,
        artistData.stage_name,
        artistData.legal_name || null,
        artistData.pronouns || null,
        artistData.location_city || null,
        artistData.location_state || null,
        artistData.location_country || 'US',
        artistData.location_zip || null,
        artistData.phone_number || null,
        artistData.bio || null,
        artistData.story || null,
        artistData.tagline || null,
        artistData.primary_genre,
        secondaryGenres,
        influences,
        artistType,
        equipment,
        daw,
        platforms,
        subscriptions,
        struggles,
        artistData.base_rate_flat || null,
        artistData.base_rate_hourly || null,
        artistData.rates_negotiable !== undefined ? artistData.rates_negotiable : true,
        artistData.largest_show_capacity || null,
        artistData.travel_radius_miles || null,
        artistData.available_weekdays !== undefined ? artistData.available_weekdays : true,
        artistData.available_weekends !== undefined ? artistData.available_weekends : true,
        artistData.advance_booking_weeks || 2,
        availableDates,
        artistData.time_split_creative || null,
        artistData.time_split_logistics || null,
        artistData.currently_making_music || null,
        artistData.confident_online_presence || null,
        artistData.struggles_creative_niche || null,
        artistData.knows_where_find_gigs || null,
        artistData.paid_fairly_performing || null,
        artistData.understands_royalties || null,
        artistData.tasks_outsource || null,
        artistData.sound_uniqueness || null,
        artistData.dream_venue || null,
        artistData.biggest_inspiration || null,
        artistData.favorite_create_time || null,
        artistData.platform_pain_point || null,
        artistData.website_url || null,
        artistData.instagram_handle || null,
        artistData.tiktok_handle || null,
        artistData.youtube_url || null,
        artistData.spotify_url || null,
        artistData.apple_music_url || null,
        artistData.soundcloud_url || null,
        artistData.facebook_url || null,
        artistData.twitter_url || null,
        artistData.bandcamp_url || null,
        now,
        now
      )
      .run()

    // Update user's onboarding_complete flag
    await ctx.env.DB.prepare('UPDATE users SET onboarding_complete = 1, updated_at = ? WHERE id = ?')
      .bind(now, ctx.userId)
      .run()

    // Initialize storage quota for artist
    await ctx.env.DB.prepare(
      'INSERT INTO storage_quotas (artist_id, used_bytes, limit_bytes, updated_at) VALUES (?, 0, 53687091200, ?)'
    )
      .bind(artistId, now)
      .run()

    // Delete onboarding session from KV (no longer needed per D-004)
    await deleteOnboardingSession(ctx.env.KV, ctx.userId)

    return successResponse(
      {
        message: 'Onboarding completed successfully',
        complete: true,
        artistId,
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error submitting step 5:', error)
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to complete onboarding',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Reset onboarding (for testing/debugging)
 * POST /v1/onboarding/reset
 * Deletes KV session and resets user's onboarding_complete flag
 */
export const resetOnboarding: RouteHandler = async (ctx) => {
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
    // Delete onboarding session from KV
    await deleteOnboardingSession(ctx.env.KV, ctx.userId)

    // Reset user's onboarding_complete flag
    await ctx.env.DB.prepare('UPDATE users SET onboarding_complete = 0, updated_at = ? WHERE id = ?')
      .bind(new Date().toISOString(), ctx.userId)
      .run()

    // Delete artist profile if exists (soft delete would be better in production)
    await ctx.env.DB.prepare('DELETE FROM artists WHERE user_id = ?').bind(ctx.userId).run()

    return successResponse(
      {
        message: 'Onboarding reset successfully',
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error resetting onboarding:', error)
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to reset onboarding',
      500,
      undefined,
      ctx.requestId
    )
  }
}
