/**
 * Files controller
 * Handles file management and R2 signed URLs
 * Per D-026: 50GB storage quota per artist
 * Implements task-7.2: File Metadata CRUD Endpoints
 */

import type { RouteHandler } from '../../router'
import { successResponse, errorResponse } from '../../utils/response'
import { ErrorCodes } from '../../utils/error-codes'
import { generateUUIDv4 } from '../../utils/uuid'
import { getUploadUrlMetadata, deleteUploadUrlMetadata } from '../../storage/kv'
import { getFileMetadata, deleteFile as deleteR2File } from '../../storage/r2'

/**
 * Confirm file upload
 * POST /v1/files
 *
 * Confirms an upload by saving file metadata to D1
 * Deletes reserved quota from KV
 * Adds file size to artist's storage quota
 */
export const confirmFileUpload: RouteHandler = async (ctx) => {
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
    const { upload_id } = body

    if (!upload_id) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'upload_id is required',
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

    // Fetch upload metadata from KV
    const uploadMetadata = await getUploadUrlMetadata(ctx.env.KV, upload_id)

    if (!uploadMetadata.success || !uploadMetadata.data) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Upload not found or expired',
        404,
        undefined,
        ctx.requestId
      )
    }

    const { fileName, fileType, fileSize, path } = uploadMetadata.data

    // Verify file exists in R2 via HEAD request
    const r2Metadata = await getFileMetadata(ctx.env.BUCKET, path)

    if (!r2Metadata.success) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'File not found in storage',
        404,
        undefined,
        ctx.requestId
      )
    }

    // Determine file category based on MIME type
    let category = 'other'
    if (fileType.startsWith('image/')) category = 'press_photo'
    else if (fileType.startsWith('audio/')) category = 'music'
    else if (fileType.startsWith('video/')) category = 'video'
    else if (fileType.includes('pdf') || fileType.includes('document')) category = 'document'

    // Insert file metadata into files table
    const fileId = generateUUIDv4()
    const now = new Date().toISOString()

    await ctx.env.DB.prepare(
      `INSERT INTO files (id, artist_id, filename, file_size_bytes, mime_type, r2_key, category, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      fileId,
      artist.id,
      fileName,
      fileSize,
      fileType,
      path,
      category,
      now
    ).run()

    // Update storage quota
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
      ).bind(artist.id, fileSize, 53687091200, now).run()
    }

    // Delete upload metadata from KV (cleanup)
    await deleteUploadUrlMetadata(ctx.env.KV, upload_id)

    // Delete reserved quota entry from KV
    const reservedQuotaKey = `quota:reserved:${artist.id}:${upload_id}`
    await ctx.env.KV.delete(reservedQuotaKey)

    return successResponse(
      {
        id: fileId,
        filename: fileName,
        fileSize,
        mimeType: fileType,
        category,
        r2Key: path,
        createdAt: now,
      },
      201,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error confirming file upload:', error)
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to confirm file upload',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * List user's files
 * GET /v1/files
 *
 * Query params:
 * - folder_id: Filter by folder
 * - file_type: Filter by category (press_photo, music, video, document, other)
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

    // Query params
    const folderId = ctx.url.searchParams.get('folder_id')
    const fileType = ctx.url.searchParams.get('file_type')

    // Build query
    let query = 'SELECT * FROM files WHERE artist_id = ?'
    const params: any[] = [artist.id]

    if (folderId) {
      query += ' AND folder_id = ?'
      params.push(folderId)
    }

    if (fileType) {
      query += ' AND category = ?'
      params.push(fileType)
    }

    query += ' ORDER BY created_at DESC'

    const result = await ctx.env.DB.prepare(query).bind(...params).all()

    // Get storage usage
    const quota = await ctx.env.DB.prepare(
      'SELECT used_bytes, limit_bytes FROM storage_quotas WHERE artist_id = ?'
    ).bind(artist.id).first<{ used_bytes: number; limit_bytes: number }>()

    return successResponse(
      {
        files: result.results || [],
        storageUsed: quota?.used_bytes || 0,
        storageQuota: quota?.limit_bytes || 53687091200,
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error listing files:', error)
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to list files',
      500,
      undefined,
      ctx.requestId
    )
  }
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

  try {
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

    // Get file from database
    const file = await ctx.env.DB.prepare(
      'SELECT * FROM files WHERE id = ? AND artist_id = ?'
    ).bind(id, artist.id).first()

    if (!file) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'File not found',
        404,
        undefined,
        ctx.requestId
      )
    }

    return successResponse(file, 200, ctx.requestId)
  } catch (error) {
    console.error('Error getting file:', error)
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to get file',
      500,
      undefined,
      ctx.requestId
    )
  }
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
 *
 * Deletes file from R2 and database
 * Updates storage quota
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

  try {
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

    // Fetch file record from D1
    const file = await ctx.env.DB.prepare(
      'SELECT * FROM files WHERE id = ? AND artist_id = ?'
    ).bind(id, artist.id).first<{
      id: string
      r2_key: string
      file_size_bytes: number
    }>()

    if (!file) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'File not found',
        404,
        undefined,
        ctx.requestId
      )
    }

    // Delete file from R2
    const deleteResult = await deleteR2File(ctx.env.BUCKET, file.r2_key)

    if (!deleteResult.success) {
      console.error('Failed to delete file from R2:', deleteResult.error)
      // Continue with database cleanup even if R2 deletion fails
    }

    // Delete file metadata from D1
    await ctx.env.DB.prepare(
      'DELETE FROM files WHERE id = ?'
    ).bind(id).run()

    // Update storage quota
    const now = new Date().toISOString()
    await ctx.env.DB.prepare(
      'UPDATE storage_quotas SET used_bytes = used_bytes - ?, updated_at = ? WHERE artist_id = ?'
    ).bind(file.file_size_bytes, now, artist.id).run()

    return successResponse(
      {
        message: 'File deleted successfully',
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error deleting file:', error)
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to delete file',
      500,
      undefined,
      ctx.requestId
    )
  }
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

    // Get storage usage
    const quota = await ctx.env.DB.prepare(
      'SELECT used_bytes, limit_bytes FROM storage_quotas WHERE artist_id = ?'
    ).bind(artist.id).first<{ used_bytes: number; limit_bytes: number }>()

    const used = quota?.used_bytes || 0
    const limit = quota?.limit_bytes || 53687091200
    const percentage = limit > 0 ? (used / limit) * 100 : 0

    return successResponse(
      {
        used,
        quota: limit,
        percentage: Math.round(percentage * 100) / 100,
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error getting storage stats:', error)
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to get storage stats',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Create a new folder
 * POST /v1/files/folders
 *
 * Request body:
 * - name: Folder name
 * - parent_folder_id: Optional parent folder ID
 */
export const createFolder: RouteHandler = async (ctx) => {
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
    const { name, parent_folder_id } = body

    if (!name) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Folder name is required',
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

    // If parent_folder_id is provided, verify it exists and belongs to the artist
    if (parent_folder_id) {
      const parentFolder = await ctx.env.DB.prepare(
        'SELECT id FROM folders WHERE id = ? AND artist_id = ?'
      ).bind(parent_folder_id, artist.id).first()

      if (!parentFolder) {
        return errorResponse(
          ErrorCodes.NOT_FOUND,
          'Parent folder not found',
          404,
          undefined,
          ctx.requestId
        )
      }
    }

    // Insert folder into folders table
    const folderId = generateUUIDv4()
    const now = new Date().toISOString()

    await ctx.env.DB.prepare(
      `INSERT INTO folders (id, artist_id, name, parent_folder_id, created_at)
       VALUES (?, ?, ?, ?, ?)`
    ).bind(
      folderId,
      artist.id,
      name,
      parent_folder_id || null,
      now
    ).run()

    return successResponse(
      {
        id: folderId,
        name,
        parent_folder_id: parent_folder_id || null,
        createdAt: now,
      },
      201,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error creating folder:', error)
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to create folder',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Move file to a folder
 * PUT /v1/files/:fileId/move
 *
 * Request body:
 * - folder_id: Target folder ID (null to move to root)
 */
export const moveFile: RouteHandler = async (ctx) => {
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
    const { fileId } = ctx.params

    if (!fileId) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'File ID required',
        400,
        undefined,
        ctx.requestId
      )
    }

    const body = await ctx.request.json()
    const { folder_id } = body

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

    // Verify file exists and belongs to the artist
    const file = await ctx.env.DB.prepare(
      'SELECT id FROM files WHERE id = ? AND artist_id = ?'
    ).bind(fileId, artist.id).first()

    if (!file) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'File not found',
        404,
        undefined,
        ctx.requestId
      )
    }

    // If folder_id is provided, verify it exists and belongs to the artist
    if (folder_id) {
      const folder = await ctx.env.DB.prepare(
        'SELECT id FROM folders WHERE id = ? AND artist_id = ?'
      ).bind(folder_id, artist.id).first()

      if (!folder) {
        return errorResponse(
          ErrorCodes.NOT_FOUND,
          'Folder not found',
          404,
          undefined,
          ctx.requestId
        )
      }
    }

    // Update file folder_id
    await ctx.env.DB.prepare(
      'UPDATE files SET folder_id = ? WHERE id = ?'
    ).bind(folder_id || null, fileId).run()

    return successResponse(
      {
        message: 'File moved successfully',
        fileId,
        folderId: folder_id || null,
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error moving file:', error)
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to move file',
      500,
      undefined,
      ctx.requestId
    )
  }
}
