/**
 * Real R2 Storage Service Wrapper
 * Implements storage service interface using Cloudflare R2 bucket
 */

import { generateUUIDv4 } from '../utils/uuid'
import { STORAGE_QUOTAS, R2_PATHS } from '../storage/types'
import {
  generateUploadSignedUrl,
  generateDownloadSignedUrl,
  deleteFile as deleteR2File,
  getFileMetadata as getR2FileMetadata,
  calculateStorageUsage,
  listArtistFiles,
} from '../storage/r2'

/**
 * R2 API credentials interface
 */
interface R2Credentials {
  accessKeyId: string
  secretAccessKey: string
  accountId: string
  bucketName: string
}

/**
 * Real R2 Storage Service
 * Uses Cloudflare R2 bucket for persistent file storage with presigned URLs
 */
export class R2StorageService {
  private bucket: R2Bucket
  private credentials?: R2Credentials

  constructor(bucket: R2Bucket, credentials?: R2Credentials) {
    this.bucket = bucket
    this.credentials = credentials

    if (!credentials) {
      console.warn('[R2 STORAGE SERVICE] Initialized without R2 API credentials - presigned URLs will use placeholders')
    }
  }

  /**
   * Generate signed URL for upload
   * @param params - Upload parameters including key, expiry, content type, max size, and artist ID
   * @returns Promise with signed URL and upload ID
   */
  async generateSignedURL(params: {
    key: string
    expiresIn: number
    contentType: string
    maxSize: number
    artistId?: string
  }): Promise<{
    success: boolean
    url?: string
    uploadId?: string
    error?: string
  }> {
    try {
      // Check quota if artistId provided
      if (params.artistId) {
        const quotaCheck = await this.checkQuota(params.artistId, params.maxSize)
        if (!quotaCheck.allowed) {
          return {
            success: false,
            error: `Storage quota exceeded. Current usage: ${(quotaCheck.currentUsage / (1024 * 1024 * 1024)).toFixed(2)}GB / ${(STORAGE_QUOTAS.PER_ARTIST / (1024 * 1024 * 1024))}GB`,
          }
        }
      }

      // Generate signed URL using helper function
      const result = await generateUploadSignedUrl(
        this.bucket,
        params.key,
        {
          contentType: params.contentType,
          contentLength: params.maxSize,
          expiresIn: params.expiresIn,
          credentials: this.credentials,
        }
      )

      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error || 'Failed to generate signed URL',
        }
      }

      return {
        success: true,
        url: result.data.url,
        uploadId: result.data.uploadId,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate signed URL',
      }
    }
  }

  /**
   * Delete file from R2
   * @param key - File key to delete
   * @returns Promise with success status
   */
  async deleteFile(key: string): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      const result = await deleteR2File(this.bucket, key)
      return result
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete file',
      }
    }
  }

  /**
   * Get quota usage for an artist
   * @param artistId - Artist ID to check quota for
   * @returns Promise with used bytes, total quota, and file count
   */
  async getQuotaUsage(artistId: string): Promise<{
    used: number
    total: number
    files: number
  }> {
    try {
      const result = await calculateStorageUsage(this.bucket, artistId)

      if (!result.success || !result.data) {
        return {
          used: 0,
          total: STORAGE_QUOTAS.PER_ARTIST,
          files: 0,
        }
      }

      return {
        used: result.data.totalBytes,
        total: STORAGE_QUOTAS.PER_ARTIST,
        files: result.data.fileCount,
      }
    } catch (error) {
      console.error('[R2 STORAGE SERVICE] Failed to get quota usage:', error)
      return {
        used: 0,
        total: STORAGE_QUOTAS.PER_ARTIST,
        files: 0,
      }
    }
  }

  /**
   * Check if artist has enough quota for new file
   * @private
   * @param artistId - Artist ID to check
   * @param newFileSize - Size of new file in bytes
   * @returns Promise with allowed status and current usage
   */
  private async checkQuota(
    artistId: string,
    newFileSize: number
  ): Promise<{ allowed: boolean; currentUsage: number }> {
    const usage = await this.getQuotaUsage(artistId)
    const wouldExceedQuota = usage.used + newFileSize > STORAGE_QUOTAS.PER_ARTIST

    return {
      allowed: !wouldExceedQuota,
      currentUsage: usage.used,
    }
  }

  /**
   * Get file metadata
   * @param key - File key to get metadata for
   * @returns Promise with file metadata
   */
  async getFileMetadata(key: string): Promise<{
    success: boolean
    data?: {
      key: string
      size: number
      contentType: string
      uploadedAt: string
    }
    error?: string
  }> {
    try {
      const result = await getR2FileMetadata(this.bucket, key)

      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error || 'File not found',
        }
      }

      return {
        success: true,
        data: {
          key: result.data.key,
          size: result.data.size,
          contentType: result.data.httpMetadata?.contentType || 'application/octet-stream',
          uploadedAt: result.data.uploaded,
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
   * List files for an artist
   * @param artistId - Artist ID to list files for
   * @param folder - Optional folder to filter by (default: 'files')
   * @param limit - Optional limit on number of files to return
   * @returns Promise with list of files
   */
  async listFiles(
    artistId: string,
    folder?: string,
    limit?: number
  ): Promise<{
    success: boolean
    files?: Array<{
      key: string
      size: number
      contentType: string
      uploadedAt: string
    }>
    error?: string
  }> {
    try {
      // Map folder string to R2_PATHS key
      const folderKey = folder ? (folder.toUpperCase() as keyof typeof R2_PATHS) : 'FILES'

      // Validate folder key exists
      if (!(folderKey in R2_PATHS)) {
        return {
          success: false,
          error: `Invalid folder: ${folder}. Must be one of: ${Object.keys(R2_PATHS).join(', ')}`,
        }
      }

      const result = await listArtistFiles(
        this.bucket,
        artistId,
        folderKey,
        { limit }
      )

      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error || 'Failed to list files',
        }
      }

      const files = result.data.objects.map(obj => ({
        key: obj.key,
        size: obj.size,
        contentType: obj.httpMetadata?.contentType || 'application/octet-stream',
        uploadedAt: obj.uploaded,
      }))

      return {
        success: true,
        files,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list files',
      }
    }
  }

  /**
   * Generate download URL for a file
   * @param key - File key to generate download URL for
   * @param expiresIn - Expiry time in seconds (default: 24 hours per D-028)
   * @returns Promise with signed download URL
   */
  async generateDownloadURL(
    key: string,
    expiresIn: number = 86400
  ): Promise<{
    success: boolean
    url?: string
    error?: string
  }> {
    try {
      const result = await generateDownloadSignedUrl(
        this.bucket,
        key,
        expiresIn,
        this.credentials
      )

      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error || 'Failed to generate download URL',
        }
      }

      return {
        success: true,
        url: result.data.url,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate download URL',
      }
    }
  }
}

/**
 * Factory function to create R2StorageService instance
 * @param bucket - R2 bucket binding
 * @param credentials - Optional R2 API credentials for presigned URLs
 * @returns R2StorageService instance
 */
export function createR2Service(
  bucket: R2Bucket,
  credentials?: {
    accessKeyId: string
    secretAccessKey: string
    accountId: string
    bucketName: string
  }
): R2StorageService {
  return new R2StorageService(bucket, credentials)
}
