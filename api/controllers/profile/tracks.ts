/**
 * Profile Tracks Controller
 * Handles track upload and management for artist profiles
 *
 * Implements task-3.4: Track Upload & Management Endpoints
 *
 * Features:
 * - POST /v1/profile/tracks/upload - Generate signed R2 URL for track upload
 * - POST /v1/profile/tracks - Save track metadata after upload
 * - GET /v1/profile/:artistId/tracks - List all tracks for an artist
 * - DELETE /v1/profile/tracks/:trackId - Remove track and update quota
 *
 * References:
 * - D-024: Inline track playback
 * - D-026: No upload limit, 50GB storage quota only
 */

import type { RouteHandler } from '../../router'
import { successResponse, errorResponse } from '../../utils/response'
import { ErrorCodes } from '../../utils/error-codes'
import { generateUUIDv4 } from '../../utils/uuid'
import {
  buildR2Key,
  validateFileType,
  validateFileSize,
  checkStorageQuota,
  deleteFile as deleteR2File,
  generateUploadSignedUrl,
} from '../../storage/r2'
import { R2_PATHS, TTL, STORAGE_QUOTAS } from '../../storage/types'

/**
 * POST /v1/profile/tracks/upload
 * Generate signed R2 URL for direct track upload
 *
 * Requirements (from task-3.4):
 * - Requires authentication
 * - Returns signed URL for direct R2 upload (15 min expiry, 50MB max)
 * - Validates audio file types (mp3, wav, flac)
 * - No upload limit enforced (D-026: constrained by 50GB storage only)
 */
export const generateTrackUploadUrl: RouteHandler = async (ctx) => {
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

    // Validate required fields
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

    // Validate file type - must be audio (mp3, wav, flac per D-024)
    const fileValidation = validateFileType(contentType, ['AUDIO'])
    if (!fileValidation.valid) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        fileValidation.error || 'Invalid file type. Allowed: mp3, wav, flac',
        400,
        undefined,
        ctx.requestId
      )
    }

    // Validate file size (50MB max per D-026)
    const maxSize = 50 * 1024 * 1024 // 50MB in bytes
    const sizeValidation = validateFileSize(fileSize, maxSize)
    if (!sizeValidation.valid) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        sizeValidation.error || `File size exceeds maximum of 50MB`,
        400,
        undefined,
        ctx.requestId
      )
    }

    // Check 50GB storage quota (D-026)
    const quotaCheck = await checkStorageQuota(ctx.env.BUCKET, artist.id, fileSize)
    if (!quotaCheck.success || !quotaCheck.data) {
      return errorResponse(
        ErrorCodes.STORAGE_QUOTA_EXCEEDED,
        'Storage quota check failed',
        500,
        undefined,
        ctx.requestId
      )
    }

    if (!quotaCheck.data.allowed) {
      const usedGB = Math.round(quotaCheck.data.currentUsage.totalBytes / (1024 * 1024 * 1024) * 100) / 100
      return errorResponse(
        ErrorCodes.STORAGE_QUOTA_EXCEEDED,
        `Storage quota exceeded. Used: ${usedGB}GB / 50GB`,
        429,
        undefined,
        ctx.requestId
      )
    }

    // Generate unique track ID and R2 key
    const trackId = generateUUIDv4()
    const fileKey = buildR2Key(R2_PATHS.TRACKS, artist.id, `${trackId}-${filename}`)

    // Generate upload ID for tracking
    const uploadId = generateUUIDv4()

    // Generate signed URL for R2 upload (15 min expiry per D-026)
    const signedUrlResult = await generateUploadSignedUrl(
      ctx.env.BUCKET,
      fileKey,
      {
        expiresIn: TTL.UPLOAD_URL, // 15 minutes
        maxFileSize: maxSize,
        contentType,
      }
    )

    // Store upload metadata in KV for verification after upload
    const uploadMetadata = {
      uploadId,
      trackId,
      artistId: artist.id,
      userId: ctx.userId,
      filename,
      fileSize,
      contentType,
      fileKey,
      createdAt: new Date().toISOString(),
      expiresAt: signedUrlResult.expiresAt,
    }

    await ctx.env.KV.put(
      `upload:track:${uploadId}`,
      JSON.stringify(uploadMetadata),
      { expirationTtl: TTL.UPLOAD_URL } // 15 minutes
    )

    return successResponse(
      {
        uploadId,
        uploadUrl: signedUrlResult.url,
        fileKey,
        expiresAt: signedUrlResult.expiresAt,
        maxFileSize: maxSize,
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error generating track upload URL:', error)
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to generate upload URL',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * POST /v1/profile/tracks
 * Save track metadata after successful upload to R2
 *
 * Requirements (from task-3.4):
 * - Verify file in R2, get file size
 * - Check 50GB storage quota (D-026)
 * - Insert track metadata into tracks table
 * - Update storage quota tracking
 */
export const createTrack: RouteHandler = async (ctx) => {
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
    const {
      uploadId,
      title,
      genre,
      coverArtUrl,
      durationSeconds,
      releaseYear,
      spotifyUrl,
      appleMusicUrl,
      soundcloudUrl,
    } = body

    // Validate required fields
    if (!uploadId || !title) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'uploadId and title are required',
        400,
        undefined,
        ctx.requestId
      )
    }

    // Get upload metadata from KV
    const uploadMetadataStr = await ctx.env.KV.get(`upload:track:${uploadId}`)
    if (!uploadMetadataStr) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Upload not found or expired. Please request a new upload URL.',
        404,
        undefined,
        ctx.requestId
      )
    }

    const uploadMetadata = JSON.parse(uploadMetadataStr)

    // Verify user owns this upload
    if (uploadMetadata.userId !== ctx.userId) {
      return errorResponse(
        ErrorCodes.UNAUTHORIZED,
        'Unauthorized to confirm this upload',
        403,
        undefined,
        ctx.requestId
      )
    }

    // Verify file exists in R2 and get actual file size
    // In production, we'd check R2 here. For MVP, use metadata fileSize
    const actualFileSize = uploadMetadata.fileSize

    // Double-check storage quota before committing
    const quotaCheck = await checkStorageQuota(ctx.env.BUCKET, uploadMetadata.artistId, actualFileSize)
    if (!quotaCheck.success || !quotaCheck.data || !quotaCheck.data.allowed) {
      return errorResponse(
        ErrorCodes.STORAGE_QUOTA_EXCEEDED,
        'Storage quota exceeded',
        429,
        undefined,
        ctx.requestId
      )
    }

    const now = new Date().toISOString()

    // Get current max display_order for artist
    const maxOrder = await ctx.env.DB.prepare(
      'SELECT MAX(display_order) as max_order FROM tracks WHERE artist_id = ?'
    ).bind(uploadMetadata.artistId).first<{ max_order: number | null }>()

    const displayOrder = (maxOrder?.max_order || 0) + 1

    // Insert track metadata into tracks table
    await ctx.env.DB.prepare(
      `INSERT INTO tracks (
        id, artist_id, title, duration_seconds, file_url, cover_art_url, genre,
        release_year, spotify_url, apple_music_url, soundcloud_url,
        display_order, plays, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`
    ).bind(
      uploadMetadata.trackId,
      uploadMetadata.artistId,
      title,
      durationSeconds || null,
      uploadMetadata.fileKey, // R2 key stored as file_url
      coverArtUrl || null,
      genre || null,
      releaseYear || new Date().getFullYear(),
      spotifyUrl || null,
      appleMusicUrl || null,
      soundcloudUrl || null,
      displayOrder,
      now,
      now
    ).run()

    // Update storage quota tracking
    await ctx.env.DB.prepare(
      `INSERT INTO storage_quotas (artist_id, used_bytes, limit_bytes, updated_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(artist_id)
       DO UPDATE SET used_bytes = used_bytes + ?, updated_at = ?`
    ).bind(
      uploadMetadata.artistId,
      actualFileSize,
      STORAGE_QUOTAS.PER_ARTIST,
      now,
      actualFileSize,
      now
    ).run()

    // Delete upload metadata from KV (upload confirmed)
    await ctx.env.KV.delete(`upload:track:${uploadId}`)

    // Get created track
    const track = await ctx.env.DB.prepare(
      'SELECT * FROM tracks WHERE id = ?'
    ).bind(uploadMetadata.trackId).first()

    return successResponse(
      {
        message: 'Track uploaded successfully',
        track,
      },
      201,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error creating track:', error)
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to create track',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * GET /v1/profile/:artistId/tracks
 * List all tracks for an artist
 *
 * Requirements (from task-3.4):
 * - Returns array of all tracks for artist
 * - Public endpoint (no auth required)
 */
export const getArtistTracks: RouteHandler = async (ctx) => {
  const { artistId } = ctx.params

  if (!artistId) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'Artist ID required',
      400,
      undefined,
      ctx.requestId
    )
  }

  try {
    // Verify artist exists
    const artist = await ctx.env.DB.prepare(
      'SELECT id, stage_name FROM artists WHERE id = ?'
    ).bind(artistId).first<{ id: string; stage_name: string }>()

    if (!artist) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Artist not found',
        404,
        undefined,
        ctx.requestId
      )
    }

    // Get all tracks for artist, ordered by display_order
    const tracks = await ctx.env.DB.prepare(
      'SELECT * FROM tracks WHERE artist_id = ? ORDER BY display_order ASC, created_at DESC'
    ).bind(artistId).all()

    return successResponse(
      {
        artistId,
        artistName: artist.stage_name,
        tracks: tracks.results || [],
        count: tracks.results?.length || 0,
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error listing artist tracks:', error)
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      'Failed to list tracks',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * POST /v1/profile/tracks/direct
 * Upload track directly (for local development)
 * Accepts multipart/form-data with file and metadata
 *
 * This bypasses the signed URL flow and uploads directly to R2
 */
export const uploadTrackDirect: RouteHandler = async (ctx) => {
  if (!ctx.userId) {
    return errorResponse(
      ErrorCodes.AUTHENTICATION_FAILED,
      'Authentication required',
      401,
      undefined,
      ctx.requestId
    )
  }

  // Check if R2 storage is configured
  if (!ctx.env.BUCKET) {
    return errorResponse(
      ErrorCodes.SERVICE_UNAVAILABLE,
      'File storage is not configured',
      503,
      undefined,
      ctx.requestId
    )
  }

  try {
    // Parse multipart form data
    const formData = await ctx.request.formData()
    const file = formData.get('file') as File | null
    const title = formData.get('title') as string | null
    const genre = formData.get('genre') as string | null
    const coverArtUrl = formData.get('cover_art_url') as string | null

    if (!file) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'No file provided. Send file in form-data with key "file"',
        400,
        undefined,
        ctx.requestId
      )
    }

    if (!title) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Title is required',
        400,
        undefined,
        ctx.requestId
      )
    }

    const contentType = file.type
    const fileSize = file.size
    const filename = file.name

    console.log(`Track upload - filename: ${filename}, contentType: ${contentType}, size: ${fileSize}, title: ${title}`)

    // Get artist profile
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

    // Validate file type - must be audio
    const ALLOWED_AUDIO_TYPES = [
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/wave',
      'audio/x-wav',
      'audio/flac',
      'audio/x-flac',
      'audio/x-m4a',
      'audio/m4a',
      'audio/aac',
      'audio/ogg',
      'audio/webm',
    ]

    if (!ALLOWED_AUDIO_TYPES.includes(contentType)) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        `Invalid file type "${contentType}". Allowed types: MP3, WAV, FLAC, M4A, AAC, OGG`,
        400,
        undefined,
        ctx.requestId
      )
    }

    // Validate file size (50MB max)
    const MAX_FILE_SIZE = 50 * 1024 * 1024
    if (fileSize > MAX_FILE_SIZE) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        `File size ${Math.round(fileSize / (1024 * 1024))}MB exceeds maximum allowed size of 50MB`,
        400,
        undefined,
        ctx.requestId
      )
    }

    // Check storage quota (50GB per artist)
    const STORAGE_QUOTA = 50 * 1024 * 1024 * 1024
    const storageQuery = await ctx.env.DB.prepare(
      'SELECT SUM(file_size_bytes) as total FROM files WHERE artist_id = ?'
    ).bind(artist.id).first<{ total: number | null }>()

    const currentUsage = storageQuery?.total || 0
    if (currentUsage + fileSize > STORAGE_QUOTA) {
      const usedGB = (currentUsage / (1024 * 1024 * 1024)).toFixed(2)
      return errorResponse(
        ErrorCodes.STORAGE_QUOTA_EXCEEDED,
        `Storage quota exceeded. Current usage: ${usedGB}GB / 50GB`,
        429,
        undefined,
        ctx.requestId
      )
    }

    // Generate unique track ID and R2 key
    const trackId = generateUUIDv4()
    const timestamp = Date.now()
    const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
    const r2Key = `tracks/${artist.id}/${timestamp}-${trackId}-${safeFilename}`

    // Upload file to R2
    const fileBuffer = await file.arrayBuffer()
    await ctx.env.BUCKET.put(r2Key, fileBuffer, {
      httpMetadata: {
        contentType: contentType,
      },
      customMetadata: {
        uploadedBy: ctx.userId,
        uploadedAt: new Date().toISOString(),
        originalFilename: filename,
        trackId: trackId,
        title: title,
      },
    })

    console.log(`Track uploaded to R2: ${r2Key}`)

    const now = new Date().toISOString()

    // Get current max display_order for artist
    const maxOrder = await ctx.env.DB.prepare(
      'SELECT MAX(display_order) as max_order FROM tracks WHERE artist_id = ?'
    ).bind(artist.id).first<{ max_order: number | null }>()

    const displayOrder = (maxOrder?.max_order || 0) + 1

    // Insert track metadata into tracks table
    await ctx.env.DB.prepare(
      `INSERT INTO tracks (
        id, artist_id, title, duration_seconds, file_url, cover_art_url, genre,
        release_year, spotify_url, apple_music_url, soundcloud_url,
        display_order, plays, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`
    ).bind(
      trackId,
      artist.id,
      title,
      null, // duration_seconds - would need audio analysis
      r2Key,
      coverArtUrl || null, // cover_art_url from uploaded image
      genre || null,
      new Date().getFullYear(),
      null, // spotify_url
      null, // apple_music_url
      null, // soundcloud_url
      displayOrder,
      now,
      now
    ).run()

    // Update storage quota tracking
    const existingQuota = await ctx.env.DB.prepare(
      'SELECT used_bytes FROM storage_quotas WHERE artist_id = ?'
    ).bind(artist.id).first<{ used_bytes: number }>()

    if (existingQuota) {
      await ctx.env.DB.prepare(
        'UPDATE storage_quotas SET used_bytes = used_bytes + ?, updated_at = ? WHERE artist_id = ?'
      ).bind(fileSize, now, artist.id).run()
    } else {
      await ctx.env.DB.prepare(
        'INSERT INTO storage_quotas (artist_id, used_bytes, limit_bytes, updated_at) VALUES (?, ?, ?, ?)'
      ).bind(artist.id, fileSize, STORAGE_QUOTA, now).run()
    }

    // Get created track
    const track = await ctx.env.DB.prepare(
      'SELECT * FROM tracks WHERE id = ?'
    ).bind(trackId).first()

    return successResponse(
      {
        message: 'Track uploaded successfully',
        track: {
          ...track,
          file_url: `/media/${r2Key}`,
        },
      },
      201,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error uploading track directly:', error)
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to upload track',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * DELETE /v1/profile/tracks/:trackId
 * Remove track and update storage quota
 *
 * Requirements (from task-3.4):
 * - Remove track metadata from D1
 * - Delete file from R2
 * - Update storage quota
 */
export const deleteTrack: RouteHandler = async (ctx) => {
  if (!ctx.userId) {
    return errorResponse(
      ErrorCodes.AUTHENTICATION_FAILED,
      'Authentication required',
      401,
      undefined,
      ctx.requestId
    )
  }

  const { trackId } = ctx.params

  if (!trackId) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'Track ID required',
      400,
      undefined,
      ctx.requestId
    )
  }

  try {
    // Get artist profile
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

    // Get track info (verify ownership)
    const track = await ctx.env.DB.prepare(
      'SELECT * FROM tracks WHERE id = ? AND artist_id = ?'
    ).bind(trackId, artist.id).first<any>()

    if (!track) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Track not found or unauthorized',
        404,
        undefined,
        ctx.requestId
      )
    }

    // Get file size from R2 metadata or estimate
    // In production, we'd query R2 to get actual file size
    // For now, we'll need to track this separately
    let fileSize = 0

    // Try to get file from R2 to determine size
    try {
      const r2Object = await ctx.env.BUCKET.head(track.file_url)
      if (r2Object) {
        fileSize = r2Object.size
      }
    } catch (err) {
      console.warn('Could not determine file size from R2:', err)
      // Continue with deletion even if we can't get the exact size
    }

    // Delete track metadata from D1
    await ctx.env.DB.prepare(
      'DELETE FROM tracks WHERE id = ?'
    ).bind(trackId).run()

    // Delete file from R2
    if (track.file_url) {
      try {
        await deleteR2File(ctx.env.BUCKET, track.file_url)
      } catch (err) {
        console.error('Failed to delete R2 file:', err)
        // Continue even if R2 deletion fails - metadata is already deleted
      }
    }

    // Update storage quota (subtract file size)
    if (fileSize > 0) {
      const now = new Date().toISOString()
      await ctx.env.DB.prepare(
        'UPDATE storage_quotas SET used_bytes = MAX(0, used_bytes - ?), updated_at = ? WHERE artist_id = ?'
      ).bind(fileSize, now, artist.id).run()
    }

    return successResponse(
      {
        message: 'Track deleted successfully',
        trackId,
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error deleting track:', error)
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to delete track',
      500,
      undefined,
      ctx.requestId
    )
  }
}
