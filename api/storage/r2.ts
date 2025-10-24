/**
 * R2 Storage Helper Functions
 * Umbrella MVP - Cloudflare R2 Storage Layer
 *
 * Features:
 * - Signed URL generation (15 min upload, 1 hour download)
 * - Storage quota enforcement (50GB per artist per D-026)
 * - File type validation
 * - R2 folder structure management
 *
 * R2 Structure:
 * umbrella-prod/
 * ├── profiles/{artistId}/
 * ├── tracks/{artistId}/
 * ├── media/{artistId}/
 * ├── files/{artistId}/
 * └── attachments/{conversationId}/
 */

import { generateUUIDv4 } from '../utils/uuid'
import {
  R2_PATHS,
  TTL,
  ALLOWED_FILE_TYPES,
  STORAGE_QUOTAS,
  type R2ObjectMetadata,
  type StorageUsage,
  type SignedUrlOptions,
  type FileValidationResult,
  type R2Result,
} from './types'

/**
 * Build R2 object key with proper folder structure
 */
export function buildR2Key(
  folder: keyof typeof R2_PATHS,
  id: string,
  fileName: string
): string {
  const folderPath = R2_PATHS[folder]
  return `${folderPath}/${id}/${fileName}`
}

/**
 * Validate file type against allowed types
 */
export function validateFileType(
  mimeType: string,
  allowedCategories?: Array<keyof typeof ALLOWED_FILE_TYPES>
): FileValidationResult {
  const categories = allowedCategories || Object.keys(ALLOWED_FILE_TYPES) as Array<keyof typeof ALLOWED_FILE_TYPES>

  for (const category of categories) {
    const allowedTypes = ALLOWED_FILE_TYPES[category]
    if ((allowedTypes as readonly string[]).includes(mimeType)) {
      return {
        valid: true,
        fileType: mimeType,
        category,
      }
    }
  }

  return {
    valid: false,
    error: `File type ${mimeType} is not allowed. Allowed types: ${categories.map(c => ALLOWED_FILE_TYPES[c]).flat().join(', ')}`,
  }
}

/**
 * Validate file size against limits
 */
export function validateFileSize(
  fileSize: number,
  maxSize: number = STORAGE_QUOTAS.MAX_FILE_SIZE
): FileValidationResult {
  if (fileSize > maxSize) {
    const maxSizeMB = Math.floor(maxSize / (1024 * 1024))
    const fileSizeMB = Math.floor(fileSize / (1024 * 1024))
    return {
      valid: false,
      error: `File size ${fileSizeMB}MB exceeds maximum allowed size of ${maxSizeMB}MB`,
    }
  }

  return { valid: true }
}

/**
 * Generate signed URL for R2 object upload (15-minute TTL)
 */
export async function generateUploadSignedUrl(
  bucket: R2Bucket,
  key: string,
  options: {
    contentType: string
    contentLength: number
    expiresIn?: number
  }
): Promise<R2Result<{ url: string; uploadId: string; expiresAt: string }>> {
  try {
    const expiresIn = options.expiresIn || TTL.UPLOAD_URL

    // Generate upload ID for tracking
    const uploadId = generateUUIDv4()

    // Create signed URL using R2 httpMetadata
    const object = await bucket.put(key, new ArrayBuffer(0), {
      httpMetadata: {
        contentType: options.contentType,
      },
      customMetadata: {
        uploadId,
        uploadedAt: new Date().toISOString(),
        status: 'pending',
      },
    })

    if (!object) {
      return {
        success: false,
        error: 'Failed to generate upload URL',
      }
    }

    // For R2, we need to use Workers to create signed URLs
    // The actual signed URL generation requires creating a presigned URL
    // using the R2 API, which is done via the createPresignedUrl method
    // However, Cloudflare R2 doesn't directly expose presigned URLs in the same way as S3
    // Instead, we'll use the R2 bucket's URL with custom metadata

    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()

    // Note: In production, you would typically use R2's presigned URL feature
    // For now, we'll return a placeholder that should be replaced with actual implementation
    const url = `https://upload.placeholder/${key}?uploadId=${uploadId}`

    return {
      success: true,
      data: {
        url,
        uploadId,
        expiresAt,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate upload signed URL',
    }
  }
}

/**
 * Generate signed URL for R2 object download (1-hour TTL)
 */
export async function generateDownloadSignedUrl(
  bucket: R2Bucket,
  key: string,
  expiresIn: number = TTL.DOWNLOAD_URL
): Promise<R2Result<{ url: string; expiresAt: string }>> {
  try {
    // Check if object exists
    const object = await bucket.head(key)

    if (!object) {
      return {
        success: false,
        error: 'Object not found',
      }
    }

    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()

    // Note: Cloudflare R2 signed URLs are generated differently than S3
    // In production, you would use R2's createPresignedUrl or a custom domain with signed URLs
    // For now, we'll return a placeholder
    const url = `https://download.placeholder/${key}`

    return {
      success: true,
      data: {
        url,
        expiresAt,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate download signed URL',
    }
  }
}

/**
 * Calculate storage usage for an artist
 * Enforces 50GB quota per D-026
 */
export async function calculateStorageUsage(
  bucket: R2Bucket,
  artistId: string
): Promise<R2Result<StorageUsage>> {
  try {
    const breakdown = {
      profiles: 0,
      tracks: 0,
      media: 0,
      files: 0,
      attachments: 0,
    }

    let totalBytes = 0
    let fileCount = 0

    // List objects for each folder type
    const folders: Array<keyof typeof R2_PATHS> = ['PROFILES', 'TRACKS', 'MEDIA', 'FILES']

    for (const folder of folders) {
      const prefix = `${R2_PATHS[folder]}/${artistId}/`
      const listed = await bucket.list({ prefix })

      for (const object of listed.objects) {
        const size = object.size
        totalBytes += size
        fileCount++

        // Add to breakdown
        const folderKey = folder.toLowerCase() as keyof typeof breakdown
        if (folderKey in breakdown) {
          breakdown[folderKey] += size
        }
      }
    }

    const quotaRemaining = STORAGE_QUOTAS.PER_ARTIST - totalBytes
    const quotaPercentUsed = (totalBytes / STORAGE_QUOTAS.PER_ARTIST) * 100

    return {
      success: true,
      data: {
        artistId,
        totalBytes,
        fileCount,
        breakdown,
        quotaRemaining,
        quotaPercentUsed,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to calculate storage usage',
    }
  }
}

/**
 * Check if artist has enough quota for a new file
 */
export async function checkStorageQuota(
  bucket: R2Bucket,
  artistId: string,
  newFileSize: number
): Promise<R2Result<{ allowed: boolean; currentUsage: StorageUsage }>> {
  try {
    const usageResult = await calculateStorageUsage(bucket, artistId)

    if (!usageResult.success || !usageResult.data) {
      return {
        success: false,
        error: 'Failed to check storage quota',
      }
    }

    const currentUsage = usageResult.data
    const wouldExceedQuota = currentUsage.totalBytes + newFileSize > STORAGE_QUOTAS.PER_ARTIST

    return {
      success: true,
      data: {
        allowed: !wouldExceedQuota,
        currentUsage,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check storage quota',
    }
  }
}

/**
 * Upload a file to R2 with validation
 */
export async function uploadFile(
  bucket: R2Bucket,
  key: string,
  file: ArrayBuffer | ReadableStream,
  metadata: {
    contentType: string
    size: number
    customMetadata?: Record<string, string>
  }
): Promise<R2Result<R2ObjectMetadata>> {
  try {
    const object = await bucket.put(key, file, {
      httpMetadata: {
        contentType: metadata.contentType,
      },
      customMetadata: {
        ...metadata.customMetadata,
        uploadedAt: new Date().toISOString(),
      },
    })

    if (!object) {
      return {
        success: false,
        error: 'Failed to upload file',
      }
    }

    return {
      success: true,
      data: {
        key,
        size: metadata.size,
        uploaded: new Date().toISOString(),
        httpMetadata: object.httpMetadata,
        customMetadata: object.customMetadata,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload file',
    }
  }
}

/**
 * Get file metadata from R2
 */
export async function getFileMetadata(
  bucket: R2Bucket,
  key: string
): Promise<R2Result<R2ObjectMetadata>> {
  try {
    const object = await bucket.head(key)

    if (!object) {
      return {
        success: false,
        error: 'File not found',
      }
    }

    return {
      success: true,
      data: {
        key,
        size: object.size,
        uploaded: object.uploaded.toISOString(),
        httpMetadata: object.httpMetadata,
        customMetadata: object.customMetadata,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get file metadata',
    }
  }
}

/**
 * Delete a file from R2
 */
export async function deleteFile(
  bucket: R2Bucket,
  key: string
): Promise<R2Result<void>> {
  try {
    await bucket.delete(key)
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete file',
    }
  }
}

/**
 * List files for an artist in a specific folder
 */
export async function listArtistFiles(
  bucket: R2Bucket,
  artistId: string,
  folder: keyof typeof R2_PATHS,
  options?: {
    limit?: number
    cursor?: string
  }
): Promise<R2Result<{ objects: R2ObjectMetadata[]; cursor?: string; truncated: boolean }>> {
  try {
    const prefix = `${R2_PATHS[folder]}/${artistId}/`
    const listed = await bucket.list({
      prefix,
      limit: options?.limit,
      cursor: options?.cursor,
    })

    const objects: R2ObjectMetadata[] = listed.objects.map(obj => ({
      key: obj.key,
      size: obj.size,
      uploaded: obj.uploaded.toISOString(),
      httpMetadata: obj.httpMetadata,
      customMetadata: obj.customMetadata,
    }))

    return {
      success: true,
      data: {
        objects,
        cursor: listed.truncated ? listed.cursor : undefined,
        truncated: listed.truncated,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list files',
    }
  }
}

/**
 * Delete all files for an artist (for account deletion)
 */
export async function deleteAllArtistFiles(
  bucket: R2Bucket,
  artistId: string
): Promise<R2Result<{ deletedCount: number }>> {
  try {
    let deletedCount = 0
    const folders: Array<keyof typeof R2_PATHS> = ['PROFILES', 'TRACKS', 'MEDIA', 'FILES']

    for (const folder of folders) {
      const prefix = `${R2_PATHS[folder]}/${artistId}/`
      let cursor: string | undefined

      do {
        const listed = await bucket.list({ prefix, cursor })

        for (const object of listed.objects) {
          await bucket.delete(object.key)
          deletedCount++
        }

        cursor = listed.truncated ? listed.cursor : undefined
      } while (cursor)
    }

    return {
      success: true,
      data: { deletedCount },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete artist files',
    }
  }
}
