/**
 * Profile controller
 * Handles artist profile CRUD operations and profile completion calculation
 *
 * Features:
 * - Get own profile (full data)
 * - Get public profile by ID (public fields only)
 * - Update profile (edit mode per D-022)
 * - Delete profile (soft delete)
 * - Profile completion percentage
 * - Profile actions menu (per D-023)
 */

import type { RouteHandler } from '../../router'
import { successResponse, errorResponse } from '../../utils/response'
import { ErrorCodes } from '../../utils/error-codes'
import type { Artist } from '../../models/artist'
import {
  calculateProfileCompletion,
  sanitizeArtistPublic,
  parseArrayField,
  serializeArrayField,
} from '../../models/artist'

/**
 * Get artist profile (own profile with full data)
 * GET /v1/profile
 */
export const getProfile: RouteHandler = async (ctx) => {
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
    // Get artist profile by user_id
    const artist = await ctx.env.DB.prepare(
      'SELECT * FROM artists WHERE user_id = ?'
    ).bind(ctx.userId).first<Artist>()

    if (!artist) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Artist profile not found. Please complete onboarding.',
        404,
        undefined,
        ctx.requestId
      )
    }

    // Get track count
    const tracksCount = await ctx.env.DB.prepare(
      'SELECT COUNT(*) as count FROM tracks WHERE artist_id = ?'
    ).bind(artist.id).first<{ count: number }>()

    // Calculate profile completion
    const completionPercentage = calculateProfileCompletion(artist)

    // Parse JSON array fields for response
    const response = {
      ...artist,
      secondary_genres: parseArrayField(artist.secondary_genres),
      influences: parseArrayField(artist.influences),
      artist_type: parseArrayField(artist.artist_type),
      equipment: parseArrayField(artist.equipment),
      daw: parseArrayField(artist.daw),
      platforms: parseArrayField(artist.platforms),
      subscriptions: parseArrayField(artist.subscriptions),
      struggles: parseArrayField(artist.struggles),
      available_dates: parseArrayField(artist.available_dates),
      profile_completion: completionPercentage,
      track_count: tracksCount?.count || 0,
    }

    return successResponse(response, 200, ctx.requestId)
  } catch (error) {
    console.error('Error getting profile:', error)
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      'Failed to get profile',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Update artist profile
 * PUT /v1/profile
 * Allows updating any artist field (edit mode per D-022)
 */
export const updateProfile: RouteHandler = async (ctx) => {
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

    // Get existing artist profile
    const artist = await ctx.env.DB.prepare(
      'SELECT * FROM artists WHERE user_id = ?'
    ).bind(ctx.userId).first<Artist>()

    if (!artist) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Artist profile not found',
        404,
        undefined,
        ctx.requestId
      )
    }

    // Build dynamic UPDATE query based on provided fields
    const allowedFields = [
      'stage_name',
      'legal_name',
      'pronouns',
      'location_city',
      'location_state',
      'location_country',
      'location_zip',
      'phone_number',
      'bio',
      'story',
      'tagline',
      'primary_genre',
      'secondary_genres',
      'influences',
      'artist_type',
      'equipment',
      'daw',
      'platforms',
      'subscriptions',
      'struggles',
      'base_rate_flat',
      'base_rate_hourly',
      'rates_negotiable',
      'largest_show_capacity',
      'travel_radius_miles',
      'available_weekdays',
      'available_weekends',
      'advance_booking_weeks',
      'available_dates',
      'time_split_creative',
      'time_split_logistics',
      'currently_making_music',
      'confident_online_presence',
      'struggles_creative_niche',
      'knows_where_find_gigs',
      'paid_fairly_performing',
      'understands_royalties',
      'tasks_outsource',
      'sound_uniqueness',
      'dream_venue',
      'biggest_inspiration',
      'favorite_create_time',
      'platform_pain_point',
      'website_url',
      'instagram_handle',
      'tiktok_handle',
      'youtube_url',
      'spotify_url',
      'apple_music_url',
      'soundcloud_url',
      'facebook_url',
      'twitter_url',
      'bandcamp_url',
      'avatar_url',
      'banner_url',
    ]

    const updates: string[] = []
    const values: any[] = []

    for (const [key, value] of Object.entries(body)) {
      if (allowedFields.includes(key)) {
        // Handle array fields - serialize to JSON
        if (
          [
            'secondary_genres',
            'influences',
            'artist_type',
            'equipment',
            'daw',
            'platforms',
            'subscriptions',
            'struggles',
            'available_dates',
          ].includes(key)
        ) {
          if (Array.isArray(value)) {
            updates.push(`${key} = ?`)
            values.push(serializeArrayField(value))
          }
        } else {
          updates.push(`${key} = ?`)
          values.push(value)
        }
      }
    }

    if (updates.length === 0) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'No valid fields to update',
        400,
        undefined,
        ctx.requestId
      )
    }

    // Add updated_at timestamp
    updates.push('updated_at = ?')
    values.push(new Date().toISOString())

    // Add user_id to WHERE clause
    values.push(ctx.userId)

    // Execute update
    const query = `UPDATE artists SET ${updates.join(', ')} WHERE user_id = ?`
    await ctx.env.DB.prepare(query).bind(...values).run()

    // Get updated profile
    const updatedArtist = await ctx.env.DB.prepare(
      'SELECT * FROM artists WHERE user_id = ?'
    ).bind(ctx.userId).first<Artist>()

    if (!updatedArtist) {
      return errorResponse(
        ErrorCodes.INTERNAL_ERROR,
        'Failed to retrieve updated profile',
        500,
        undefined,
        ctx.requestId
      )
    }

    // Calculate new completion percentage
    const completionPercentage = calculateProfileCompletion(updatedArtist)

    // Parse JSON array fields for response
    const response = {
      ...updatedArtist,
      secondary_genres: parseArrayField(updatedArtist.secondary_genres),
      influences: parseArrayField(updatedArtist.influences),
      artist_type: parseArrayField(updatedArtist.artist_type),
      equipment: parseArrayField(updatedArtist.equipment),
      daw: parseArrayField(updatedArtist.daw),
      platforms: parseArrayField(updatedArtist.platforms),
      subscriptions: parseArrayField(updatedArtist.subscriptions),
      struggles: parseArrayField(updatedArtist.struggles),
      available_dates: parseArrayField(updatedArtist.available_dates),
      profile_completion: completionPercentage,
    }

    return successResponse(
      {
        message: 'Profile updated successfully',
        profile: response,
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error updating profile:', error)
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to update profile',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Delete artist profile (soft delete)
 * DELETE /v1/profile
 * In production, this would be a soft delete or account deactivation
 */
export const deleteProfile: RouteHandler = async (ctx) => {
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
    // Get artist ID for cleanup
    const artist = await ctx.env.DB.prepare(
      'SELECT id FROM artists WHERE user_id = ?'
    ).bind(ctx.userId).first<{ id: string }>()

    if (!artist) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Artist profile not found',
        404,
        undefined,
        ctx.requestId
      )
    }

    // In production, implement soft delete by adding a deleted_at field
    // For MVP, we'll do hard delete with CASCADE handling foreign keys

    // Delete artist profile (CASCADE will handle related records)
    await ctx.env.DB.prepare('DELETE FROM artists WHERE user_id = ?')
      .bind(ctx.userId)
      .run()

    // Delete storage quota
    await ctx.env.DB.prepare('DELETE FROM storage_quotas WHERE artist_id = ?')
      .bind(artist.id)
      .run()

    // Reset user's onboarding_complete flag
    await ctx.env.DB.prepare('UPDATE users SET onboarding_complete = 0, updated_at = ? WHERE id = ?')
      .bind(new Date().toISOString(), ctx.userId)
      .run()

    // Note: R2 files cleanup should be done via a background job
    // For now, we'll leave them (orphaned files)

    return successResponse(
      {
        message: 'Profile deleted successfully',
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error deleting profile:', error)
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to delete profile',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Get public profile by ID
 * GET /v1/profile/:id
 * Returns public fields only (per D-024 for portfolio retrieval)
 */
export const getPublicProfile: RouteHandler = async (ctx) => {
  const { id } = ctx.params

  if (!id) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'Profile ID required',
      400,
      'id',
      ctx.requestId
    )
  }

  try {
    // Get artist profile by ID
    const artist = await ctx.env.DB.prepare(
      'SELECT * FROM artists WHERE id = ?'
    ).bind(id).first<Artist>()

    if (!artist) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Artist profile not found',
        404,
        undefined,
        ctx.requestId
      )
    }

    // Sanitize to public profile (only public fields)
    const publicProfile = sanitizeArtistPublic(artist)

    // Get tracks count
    const tracksCount = await ctx.env.DB.prepare(
      'SELECT COUNT(*) as count FROM tracks WHERE artist_id = ?'
    ).bind(id).first<{ count: number }>()

    // Get recent tracks (for inline playback per D-024)
    const tracks = await ctx.env.DB.prepare(
      'SELECT id, title, duration_seconds, file_url, cover_art_url, genre, plays FROM tracks WHERE artist_id = ? ORDER BY display_order ASC, created_at DESC LIMIT 10'
    ).bind(id).all()

    // Get recent reviews (sample)
    const reviews = await ctx.env.DB.prepare(
      'SELECT id, reviewer_name, rating, comment, created_at FROM reviews WHERE artist_id = ? ORDER BY created_at DESC LIMIT 5'
    ).bind(id).all()

    // Increment profile view count (fire and forget)
    ctx.env.DB.prepare('UPDATE artists SET profile_views = profile_views + 1 WHERE id = ?')
      .bind(id)
      .run()
      .catch((err) => console.error('Failed to increment profile views:', err))

    return successResponse(
      {
        ...publicProfile,
        stats: {
          tracksCount: tracksCount?.count || 0,
          reviewsCount: artist.total_reviews,
          gigsCompleted: artist.total_gigs,
          profileViews: artist.profile_views,
          followers: artist.follower_count,
        },
        tracks: tracks.results || [],
        recentReviews: reviews.results || [],
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error getting public profile:', error)
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      'Failed to get public profile',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Get profile completion status
 * GET /v1/profile/completion
 * Returns profile completion percentage and missing fields
 */
export const getProfileCompletion: RouteHandler = async (ctx) => {
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
    // Get artist profile
    const artist = await ctx.env.DB.prepare(
      'SELECT * FROM artists WHERE user_id = ?'
    ).bind(ctx.userId).first<Artist>()

    if (!artist) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Artist profile not found',
        404,
        undefined,
        ctx.requestId
      )
    }

    // Calculate completion percentage
    const completionPercentage = calculateProfileCompletion(artist)

    // Identify missing required fields
    const requiredFields = [
      'stage_name',
      'location_city',
      'location_state',
      'bio',
      'primary_genre',
      'base_rate_flat',
      'avatar_url',
    ]

    const missingFields = requiredFields.filter(
      (field) => !artist[field as keyof Artist]
    )

    // Identify missing optional fields (for recommendations)
    const optionalFields = [
      'tagline',
      'website_url',
      'instagram_handle',
      'spotify_url',
      'secondary_genres',
      'influences',
    ]

    const missingOptionalFields = optionalFields.filter(
      (field) => !artist[field as keyof Artist]
    )

    return successResponse(
      {
        completionPercentage,
        missingRequiredFields: missingFields,
        missingOptionalFields: missingOptionalFields,
        recommendations: generateCompletionRecommendations(missingFields, missingOptionalFields),
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error getting profile completion:', error)
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      'Failed to get profile completion',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Get profile actions menu (per D-023)
 * GET /v1/profile/actions
 * Returns available actions for the artist profile
 */
export const getProfileActions: RouteHandler = async (ctx) => {
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
    // Get artist profile
    const artist = await ctx.env.DB.prepare(
      'SELECT id, verified FROM artists WHERE user_id = ?'
    ).bind(ctx.userId).first<{ id: string; verified: boolean }>()

    if (!artist) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Artist profile not found',
        404,
        undefined,
        ctx.requestId
      )
    }

    // Define available actions
    const actions = [
      {
        id: 'edit_profile',
        label: 'Edit Profile',
        route: '/profile/edit',
        icon: 'edit',
      },
      {
        id: 'upload_track',
        label: 'Upload Track',
        route: '/tracks/upload',
        icon: 'music',
      },
      {
        id: 'manage_tracks',
        label: 'Manage Tracks',
        route: '/tracks',
        icon: 'list',
      },
      {
        id: 'invite_review',
        label: 'Invite Review',
        route: '/reviews/invite',
        icon: 'star',
      },
      {
        id: 'view_analytics',
        label: 'View Analytics',
        route: '/analytics',
        icon: 'chart',
      },
      {
        id: 'share_profile',
        label: 'Share Profile',
        route: `/profile/${artist.id}`,
        icon: 'share',
      },
    ]

    // Add verification action if not verified
    if (!artist.verified) {
      actions.push({
        id: 'request_verification',
        label: 'Request Verification',
        route: '/profile/verify',
        icon: 'badge',
      })
    }

    return successResponse(
      {
        actions,
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error getting profile actions:', error)
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      'Failed to get profile actions',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Helper: Generate profile completion recommendations
 */
function generateCompletionRecommendations(
  missingRequired: string[],
  missingOptional: string[]
): string[] {
  const recommendations: string[] = []

  if (missingRequired.length > 0) {
    recommendations.push(
      `Complete ${missingRequired.length} required fields to make your profile public`
    )
  }

  if (missingRequired.includes('avatar_url')) {
    recommendations.push('Upload a profile photo to increase visibility')
  }

  if (missingRequired.includes('bio')) {
    recommendations.push('Add a bio to tell your story to potential collaborators')
  }

  if (missingRequired.includes('base_rate_flat')) {
    recommendations.push('Set your rates to appear in gig marketplace')
  }

  if (missingOptional.includes('instagram_handle') || missingOptional.includes('spotify_url')) {
    recommendations.push('Connect your social media profiles to increase discoverability')
  }

  if (missingOptional.includes('secondary_genres')) {
    recommendations.push('Add secondary genres to appear in more searches')
  }

  if (missingOptional.includes('influences')) {
    recommendations.push('List your influences to connect with like-minded artists')
  }

  return recommendations
}

/**
 * Get avatar upload signed URL
 * POST /v1/profile/avatar/upload
 * Generates R2 signed URL for avatar upload with 15-minute expiry
 */
export const uploadAvatar: RouteHandler = async (ctx) => {
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
    const { filename, fileSize, contentType } = body

    if (!filename || !fileSize || !contentType) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'filename, fileSize, and contentType are required',
        400,
        undefined,
        ctx.requestId
      )
    }

    // Get artist profile
    const artist = await ctx.env.DB.prepare(
      'SELECT id, avatar_url FROM artists WHERE user_id = ?'
    ).bind(ctx.userId).first<{ id: string; avatar_url: string | null }>()

    if (!artist) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Artist profile not found',
        404,
        undefined,
        ctx.requestId
      )
    }

    // Validate file type (images only)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
    if (!allowedTypes.includes(contentType)) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
        400,
        undefined,
        ctx.requestId
      )
    }

    // Validate file size (10MB max for avatars)
    const MAX_AVATAR_SIZE = 10 * 1024 * 1024 // 10MB
    if (fileSize > MAX_AVATAR_SIZE) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        `File size ${Math.round(fileSize / (1024 * 1024))}MB exceeds maximum allowed size of 10MB`,
        400,
        undefined,
        ctx.requestId
      )
    }

    // Generate file extension from content type
    const extMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/heic': 'heic',
    }
    const ext = extMap[contentType] || 'jpg'

    // Build R2 key for avatar (standardized naming)
    const fileKey = `profiles/${artist.id}/avatar.${ext}`

    // Generate upload ID for tracking
    const uploadId = `avatar-${artist.id}-${Date.now()}`

    // Store upload metadata in KV (for verification after upload)
    const uploadMetadata = {
      uploadId,
      artistId: artist.id,
      userId: ctx.userId,
      filename,
      fileSize,
      contentType,
      fileKey,
      oldAvatarUrl: artist.avatar_url,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
    }

    await ctx.env.KV.put(
      `upload:avatar:${uploadId}`,
      JSON.stringify(uploadMetadata),
      { expirationTtl: 900 } // 15 minutes
    )

    // Generate upload URL (placeholder for MVP, replace with actual R2 presigned URL)
    const uploadUrl = `https://upload.umbrella.dev/${fileKey}?uploadId=${uploadId}`

    return successResponse(
      {
        uploadId,
        uploadUrl,
        fileKey,
        expiresAt: uploadMetadata.expiresAt,
        maxFileSize: MAX_AVATAR_SIZE,
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error generating avatar upload URL:', error)
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to generate avatar upload URL',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Confirm avatar upload and update artist record
 * POST /v1/profile/avatar/confirm
 * Validates file exists in R2 and updates artist avatar_url
 */
export const confirmAvatarUpload: RouteHandler = async (ctx) => {
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
    const { uploadId } = body

    if (!uploadId) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'uploadId is required',
        400,
        undefined,
        ctx.requestId
      )
    }

    // Get upload metadata from KV
    const uploadMetadataStr = await ctx.env.KV.get(`upload:avatar:${uploadId}`)

    if (!uploadMetadataStr) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Upload session not found or expired',
        404,
        undefined,
        ctx.requestId
      )
    }

    const uploadMetadata = JSON.parse(uploadMetadataStr)

    // Verify user owns this upload
    if (uploadMetadata.userId !== ctx.userId) {
      return errorResponse(
        ErrorCodes.AUTHORIZATION_FAILED,
        'Unauthorized to confirm this upload',
        403,
        undefined,
        ctx.requestId
      )
    }

    // Verify file exists in R2 via HEAD request
    const fileExists = await ctx.env.BUCKET.head(uploadMetadata.fileKey)

    if (!fileExists) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'File not found in storage. Upload may have failed.',
        404,
        undefined,
        ctx.requestId
      )
    }

    // Delete old avatar from R2 if it exists
    if (uploadMetadata.oldAvatarUrl) {
      try {
        // Extract key from URL (assumes URL format: https://.../profiles/{artistId}/avatar.{ext})
        const urlMatch = uploadMetadata.oldAvatarUrl.match(/profiles\/[^\/]+\/avatar\.[a-z]+/)
        if (urlMatch) {
          const oldKey = urlMatch[0]
          // Only delete if it's different from the new key
          if (oldKey !== uploadMetadata.fileKey) {
            await ctx.env.BUCKET.delete(oldKey)
            console.log(`Deleted old avatar: ${oldKey}`)
          }
        }
      } catch (error) {
        console.error('Error deleting old avatar:', error)
        // Continue even if deletion fails - not critical
      }
    }

    // Build public URL for the avatar
    const avatarUrl = `https://pub-umbrella.r2.dev/${uploadMetadata.fileKey}`

    // Update artist record with new avatar_url
    await ctx.env.DB.prepare(
      'UPDATE artists SET avatar_url = ?, updated_at = ? WHERE user_id = ?'
    )
      .bind(avatarUrl, new Date().toISOString(), ctx.userId)
      .run()

    // Clean up KV upload metadata
    await ctx.env.KV.delete(`upload:avatar:${uploadId}`)

    // Get updated profile
    const updatedArtist = await ctx.env.DB.prepare(
      'SELECT * FROM artists WHERE user_id = ?'
    ).bind(ctx.userId).first<Artist>()

    if (!updatedArtist) {
      return errorResponse(
        ErrorCodes.INTERNAL_ERROR,
        'Failed to retrieve updated profile',
        500,
        undefined,
        ctx.requestId
      )
    }

    // Calculate new completion percentage
    const completionPercentage = calculateProfileCompletion(updatedArtist)

    // Parse JSON array fields for response
    const response = {
      ...updatedArtist,
      secondary_genres: parseArrayField(updatedArtist.secondary_genres),
      influences: parseArrayField(updatedArtist.influences),
      artist_type: parseArrayField(updatedArtist.artist_type),
      equipment: parseArrayField(updatedArtist.equipment),
      daw: parseArrayField(updatedArtist.daw),
      platforms: parseArrayField(updatedArtist.platforms),
      subscriptions: parseArrayField(updatedArtist.subscriptions),
      struggles: parseArrayField(updatedArtist.struggles),
      available_dates: parseArrayField(updatedArtist.available_dates),
      profile_completion: completionPercentage,
    }

    return successResponse(
      {
        message: 'Avatar uploaded successfully',
        avatarUrl,
        profile: response,
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error confirming avatar upload:', error)
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to confirm avatar upload',
      500,
      undefined,
      ctx.requestId
    )
  }
}
