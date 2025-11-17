/**
 * Files controller
 * Handles file management and R2 signed URLs
 * Per D-026: 50GB storage quota per artist
 */

import type { RouteHandler } from '../../router'
import { successResponse, errorResponse } from '../../utils/response'
import { ErrorCodes } from '../../utils/error-codes'

/**
 * List user's files
 * GET /v1/files
 */
export const listFiles: RouteHandler = async (ctx) => {
  if (!ctx.userId) {
    return errorResponse(
      ErrorCodes.AUTHENTICATION_FAILED,
      'Authentication required',
      401,
      undefined,
      ctx.requestId
    )
  }

  // Query params: type (audio, image, video, document)
  const fileType = ctx.url.searchParams.get('type')

  // TODO: Implement file listing from database
  return successResponse(
    {
      files: [],
      storageUsed: 0,
      storageQuota: 53687091200, // 50GB in bytes
    },
    200,
    ctx.requestId
  )
}

/**
 * Get file details
 * GET /v1/files/:id
 */
export const getFile: RouteHandler = async (ctx) => {
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
      'File ID required',
      400,
      'id',
      ctx.requestId
    )
  }

  // TODO: Implement file retrieval
  return successResponse(
    {
      id,
      filename: 'sample-file.mp3',
      type: 'audio',
      size: 5242880, // 5MB
      url: 'https://example.com/sample-file.mp3',
      createdAt: new Date().toISOString(),
    },
    200,
    ctx.requestId
  )
}

/**
 * Generate signed URL for file upload
 * POST /v1/files/upload
 * Implements task-7.1: File Upload Signed URL Endpoint with pessimistic quota locking
 *
 * Per D-026: 50GB storage quota per artist
 * Returns R2 signed URL for direct upload with 15-minute expiry
 */
export const generateUploadUrl: RouteHandler = async (ctx) => {
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
    // Parse request body
    const body = await ctx.request.json() as {
      filename?: string
      content_type?: string
      file_size?: number
    }

    const { filename, content_type, file_size } = body

    // Validate required fields
    if (!filename || !content_type || !file_size) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Missing required fields: filename, content_type, file_size',
        400,
        'body',
        ctx.requestId
      )
    }

    // Validate file size (max 50MB per file)
    const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
    if (file_size > MAX_FILE_SIZE) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        `File size exceeds maximum allowed size of 50MB`,
        400,
        'file_size',
        ctx.requestId
      )
    }

    // Validate content type against allowed types
    const ALLOWED_CONTENT_TYPES = [
      // Images
      'image/jpeg',
      'image/png',
      'image/heic',
      // Audio
      'audio/mpeg',
      'audio/wav',
      'audio/flac',
      // Video
      'video/mp4',
      'video/quicktime',
      // Documents
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]

    if (!ALLOWED_CONTENT_TYPES.includes(content_type)) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        `Invalid file type. Allowed types: ${ALLOWED_CONTENT_TYPES.join(', ')}`,
        400,
        'content_type',
        ctx.requestId
      )
    }

    // Get artist_id for the user
    const user = await ctx.env.DB.prepare('SELECT id FROM users WHERE id = ?')
      .bind(ctx.userId)
      .first<{ id: string }>()

    if (!user) {
      return errorResponse(
        ErrorCodes.AUTHENTICATION_FAILED,
        'User not found',
        404,
        undefined,
        ctx.requestId
      )
    }

    // Get artist record
    const artist = await ctx.env.DB.prepare('SELECT id FROM artists WHERE user_id = ?')
      .bind(ctx.userId)
      .first<{ id: string }>()

    if (!artist) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Artist profile not found. Please complete onboarding first.',
        403,
        undefined,
        ctx.requestId
      )
    }

    const artistId = artist.id

    // === PESSIMISTIC QUOTA CHECKING WITH RESERVATION ===
    // Step 1: Query D1 for current storage usage
    const storageQuery = await ctx.env.DB.prepare(
      'SELECT SUM(file_size_bytes) as total FROM files WHERE artist_id = ?'
    )
      .bind(artistId)
      .first<{ total: number | null }>()

    const currentUsage = storageQuery?.total || 0

    // Step 2: Query KV for all reserved uploads for this artist
    // We need to list all keys matching quota:reserved:{artistId}:*
    const reservationPrefix = `quota:reserved:${artistId}:`
    const reservationList = await ctx.env.KV.list({ prefix: reservationPrefix })

    let totalReserved = 0
    for (const key of reservationList.keys) {
      const reservedSize = await ctx.env.KV.get(key.name)
      if (reservedSize) {
        totalReserved += parseInt(reservedSize, 10)
      }
    }

    // Step 3: Check quota (50GB limit per D-026)
    const STORAGE_QUOTA = 50 * 1024 * 1024 * 1024 // 50GB in bytes
    const totalUsageWithReservations = currentUsage + totalReserved + file_size

    if (totalUsageWithReservations > STORAGE_QUOTA) {
      const usedGB = (currentUsage / (1024 * 1024 * 1024)).toFixed(2)
      const quotaGB = (STORAGE_QUOTA / (1024 * 1024 * 1024)).toFixed(0)
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        `Storage quota exceeded. Current usage: ${usedGB}GB / ${quotaGB}GB`,
        400,
        'file_size',
        ctx.requestId
      )
    }

    // Step 4: Generate upload_id
    const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`

    // Step 5: Reserve quota in KV (15 minute TTL)
    const RESERVATION_TTL = 15 * 60 // 15 minutes
    const reservationKey = `${reservationPrefix}${uploadId}`
    await ctx.env.KV.put(reservationKey, file_size.toString(), {
      expirationTtl: RESERVATION_TTL,
    })

    // Step 6: Generate R2 signed upload URL
    const r2Key = `files/${artistId}/${uploadId}-${filename}`

    // Use mock R2 service for development
    const { getStorageService } = await import('../../mocks')
    const storageService = getStorageService(ctx.env)

    const signedUrlResult = await storageService.generateSignedURL({
      key: r2Key,
      expiresIn: RESERVATION_TTL,
      contentType: content_type,
      maxSize: MAX_FILE_SIZE,
      artistId: artistId,
    })

    if (!signedUrlResult.success || !signedUrlResult.url) {
      return errorResponse(
        ErrorCodes.INTERNAL_ERROR,
        'Failed to generate signed URL',
        500,
        undefined,
        ctx.requestId
      )
    }

    const signedUrl = signedUrlResult.url
    const expiresAt = new Date(Date.now() + RESERVATION_TTL * 1000).toISOString()

    // Step 7: Store upload metadata in KV (15 minute TTL)
    const uploadMetadata = {
      uploadId,
      userId: ctx.userId,
      artistId,
      filename,
      fileSize: file_size,
      contentType: content_type,
      r2Key,
      expiresAt,
      createdAt: new Date().toISOString(),
    }

    await ctx.env.KV.put(`upload:${uploadId}`, JSON.stringify(uploadMetadata), {
      expirationTtl: RESERVATION_TTL,
    })

    // Step 8: Return response with upload_id and signed_url
    return successResponse(
      {
        upload_id: uploadId,
        signed_url: signedUrl,
        expires_at: expiresAt,
        max_file_size: MAX_FILE_SIZE,
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error generating upload URL:', error)
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      error instanceof Error ? error.message : 'Failed to generate upload URL',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Get upload signed URL (legacy endpoint)
 * POST /v1/files/upload-url
 * Returns R2 signed URL for direct upload
 * @deprecated Use generateUploadUrl instead (POST /v1/files/upload)
 */
export const getUploadUrl: RouteHandler = async (ctx) => {
  // Redirect to new implementation
  return generateUploadUrl(ctx)
}

/**
 * Confirm file upload
 * POST /v1/files/:id/confirm
 */
export const confirmUpload: RouteHandler = async (ctx) => {
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

  // TODO: Confirm upload and update database
  return successResponse(
    {
      message: 'File upload confirmed',
      fileId: id,
    },
    200,
    ctx.requestId
  )
}

/**
 * Delete file
 * DELETE /v1/files/:id
 */
export const deleteFile: RouteHandler = async (ctx) => {
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

  // TODO: Delete file from R2 and database
  return successResponse(
    {
      message: 'File deleted successfully',
    },
    200,
    ctx.requestId
  )
}

/**
 * Get storage usage stats
 * GET /v1/files/storage
 */
export const getStorageStats: RouteHandler = async (ctx) => {
  if (!ctx.userId) {
    return errorResponse(
      ErrorCodes.AUTHENTICATION_FAILED,
      'Authentication required',
      401,
      undefined,
      ctx.requestId
    )
  }

  // TODO: Calculate storage usage
  return successResponse(
    {
      used: 0,
      quota: 53687091200, // 50GB in bytes
      percentage: 0,
    },
    200,
    ctx.requestId
  )
}
