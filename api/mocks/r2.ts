/**
 * Mock R2 Storage Service
 * Provides placeholder storage functionality for development without real R2 bucket
 */

import { generateUUIDv4 } from '../utils/uuid'
import { STORAGE_QUOTAS } from '../storage/types'

/**
 * Mock file metadata
 */
interface MockFile {
  key: string
  size: number
  contentType: string
  uploadedAt: string
  artistId: string
  uploadId?: string
}

/**
 * Mock upload intent (for tracking pending uploads)
 */
interface UploadIntent {
  uploadId: string
  key: string
  maxSize: number
  contentType: string
  expiresAt: string
  createdAt: string
  artistId?: string
}

/**
 * In-memory storage
 */
const mockFiles: Map<string, MockFile> = new Map()
const uploadIntents: Map<string, UploadIntent> = new Map()

/**
 * Mock R2 Storage Service
 * Tracks files in memory and simulates quota enforcement
 */
export class MockR2Service {
  /**
   * Generate signed URL for upload
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
      // Generate upload ID
      const uploadId = `upload_${generateUUIDv4()}`

      // Calculate expiration time
      const expiresAt = new Date(Date.now() + params.expiresIn * 1000).toISOString()

      // Store upload intent
      const intent: UploadIntent = {
        uploadId,
        key: params.key,
        maxSize: params.maxSize,
        contentType: params.contentType,
        expiresAt,
        createdAt: new Date().toISOString(),
        artistId: params.artistId,
      }
      uploadIntents.set(uploadId, intent)

      // Generate mock signed URL
      const url = `mock://r2/upload/${uploadId}/${params.key}`

      // Log to console
      console.log('[MOCK R2] Signed URL generated:')
      console.log(`  Key: ${params.key}`)
      console.log(`  Upload ID: ${uploadId}`)
      console.log(`  Max Size: ${Math.floor(params.maxSize / (1024 * 1024))}MB`)
      console.log(`  Expires: ${params.expiresIn} seconds`)
      console.log(`  URL: ${url}`)

      return {
        success: true,
        url,
        uploadId,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate signed URL',
      }
    }
  }

  /**
   * Confirm upload completion
   */
  async confirmUpload(params: {
    uploadId: string
    key: string
    size: number
    artistId?: string
  }): Promise<{
    success: boolean
    fileUrl?: string
    error?: string
  }> {
    try {
      // Check if upload intent exists
      const intent = uploadIntents.get(params.uploadId)
      if (!intent) {
        return {
          success: false,
          error: `Upload intent not found for ID: ${params.uploadId}`,
        }
      }

      // Check if expired
      if (new Date(intent.expiresAt) < new Date()) {
        uploadIntents.delete(params.uploadId)
        return {
          success: false,
          error: 'Upload URL has expired',
        }
      }

      // Check size limit
      if (params.size > intent.maxSize) {
        return {
          success: false,
          error: `File size ${params.size} exceeds maximum ${intent.maxSize}`,
        }
      }

      // Check quota if artistId provided
      if (params.artistId || intent.artistId) {
        const artistId = params.artistId || intent.artistId!
        const quotaCheck = await this.checkQuota(artistId, params.size)
        if (!quotaCheck.allowed) {
          return {
            success: false,
            error: 'Storage quota exceeded',
          }
        }
      }

      // Store file metadata
      const file: MockFile = {
        key: params.key,
        size: params.size,
        contentType: intent.contentType,
        uploadedAt: new Date().toISOString(),
        artistId: params.artistId || intent.artistId || 'unknown',
        uploadId: params.uploadId,
      }
      mockFiles.set(params.key, file)

      // Remove upload intent
      uploadIntents.delete(params.uploadId)

      // Generate mock file URL
      const fileUrl = `mock://r2/files/${params.key}`

      // Log to console
      const sizeMB = (params.size / (1024 * 1024)).toFixed(2)
      const artistId = params.artistId || intent.artistId || 'unknown'
      const quotaUsage = await this.getQuotaUsage(artistId)
      const quotaUsedMB = (quotaUsage.used / (1024 * 1024)).toFixed(2)
      const quotaTotalGB = (quotaUsage.total / (1024 * 1024 * 1024)).toFixed(0)

      console.log('[MOCK R2] Upload confirmed:')
      console.log(`  Upload ID: ${params.uploadId}`)
      console.log(`  Key: ${params.key}`)
      console.log(`  Size: ${sizeMB} MB`)
      console.log(`  Artist quota: ${quotaUsedMB} MB / ${quotaTotalGB} GB`)
      console.log(`  File URL: ${fileUrl}`)

      return {
        success: true,
        fileUrl,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to confirm upload',
      }
    }
  }

  /**
   * Delete a file
   */
  async deleteFile(key: string): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      const file = mockFiles.get(key)
      if (!file) {
        return {
          success: false,
          error: `File not found: ${key}`,
        }
      }

      mockFiles.delete(key)

      const sizeMB = (file.size / (1024 * 1024)).toFixed(2)

      // Log to console
      console.log('[MOCK R2] File deleted:')
      console.log(`  Key: ${key}`)
      console.log(`  Size freed: ${sizeMB} MB`)

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete file',
      }
    }
  }

  /**
   * Get quota usage for an artist
   */
  async getQuotaUsage(artistId: string): Promise<{
    used: number
    total: number
    files: number
  }> {
    let totalBytes = 0
    let fileCount = 0

    for (const file of mockFiles.values()) {
      if (file.artistId === artistId) {
        totalBytes += file.size
        fileCount++
      }
    }

    return {
      used: totalBytes,
      total: STORAGE_QUOTAS.PER_ARTIST, // 50 GB
      files: fileCount,
    }
  }

  /**
   * Check if artist has enough quota for new file
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
   */
  async getFileMetadata(key: string): Promise<{
    success: boolean
    data?: MockFile
    error?: string
  }> {
    const file = mockFiles.get(key)
    if (!file) {
      return {
        success: false,
        error: `File not found: ${key}`,
      }
    }

    return {
      success: true,
      data: file,
    }
  }

  /**
   * List files for an artist
   */
  async listFiles(
    artistId: string,
    prefix?: string
  ): Promise<{
    success: boolean
    files?: MockFile[]
    error?: string
  }> {
    try {
      const files: MockFile[] = []

      for (const file of mockFiles.values()) {
        if (file.artistId === artistId) {
          if (!prefix || file.key.startsWith(prefix)) {
            files.push(file)
          }
        }
      }

      // Sort by upload date (newest first)
      files.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())

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
   * Clear all mock data (for testing)
   */
  clearAll(): void {
    mockFiles.clear()
    uploadIntents.clear()
  }

  /**
   * Get all files (for testing)
   */
  getAllFiles(): MockFile[] {
    return Array.from(mockFiles.values())
  }

  /**
   * Get pending upload intents (for testing)
   */
  getUploadIntents(): UploadIntent[] {
    return Array.from(uploadIntents.values())
  }
}

/**
 * Factory function to create MockR2Service instance
 */
export function createMockR2Service(): MockR2Service {
  return new MockR2Service()
}
