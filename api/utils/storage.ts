/**
 * R2 Storage Utility
 * Handles file storage, signed URLs, and file management with Cloudflare R2
 * Task 10.7: Configure External Service APIs
 * References: D-028 (24-hour download links), Task 7.1 (R2 integration)
 */

import { logger } from './logger'
import { generateId as uuidv4 } from './uuid'

/**
 * File metadata interface
 */
export interface FileMetadata {
  id: string
  filename: string
  contentType: string
  size: number
  uploadedBy: string
  uploadedAt: string
  key: string // R2 object key
  bucket: string
  tags?: Record<string, string>
}

/**
 * Upload options
 */
export interface UploadOptions {
  filename: string
  contentType: string
  userId: string
  folder?: string // Optional folder prefix (e.g., 'avatars/', 'tracks/')
  metadata?: Record<string, string>
  customKey?: string
}

/**
 * Signed URL options
 */
export interface SignedURLOptions {
  expiresIn?: number // Seconds until expiry (default: 24 hours per D-028)
  action?: 'read' | 'write'
}

/**
 * File upload result
 */
export interface UploadResult {
  success: boolean
  fileId?: string
  key?: string
  url?: string
  error?: string
}

/**
 * Signed URL result
 */
export interface SignedURLResult {
  success: boolean
  url?: string
  expiresAt?: string
  error?: string
}

/**
 * Generate unique file key
 */
function generateFileKey(userId: string, filename: string, folder?: string): string {
  const fileId = uuidv4()
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
  const prefix = folder ? `${folder.replace(/\/+$/, '')}/` : ''

  return `${prefix}${userId}/${fileId}-${sanitizedFilename}`
}

/**
 * Check if we're in mock mode
 */
function isMockMode(env: { USE_MOCKS?: string }): boolean {
  return env.USE_MOCKS === 'true'
}

/**
 * Upload file to R2
 */
export async function uploadFile(
  file: ArrayBuffer | ReadableStream,
  options: UploadOptions,
  bucket: any,
  env: { USE_MOCKS?: string }
): Promise<UploadResult> {
  try {
    const key = options.customKey || generateFileKey(options.userId, options.filename, options.folder)

    // Mock mode - simulate upload
    if (isMockMode(env)) {
      logger.info('☁️ [MOCK] File would be uploaded to R2:', {
        key,
        filename: options.filename,
        contentType: options.contentType,
      })
      return {
        success: true,
        fileId: key.split('/').pop()?.split('-')[0],
        key,
        url: `https://mock-r2.example.com/${key}`,
      }
    }

    // Prepare metadata
    const httpMetadata = {
      contentType: options.contentType,
    }

    const customMetadata: Record<string, string> = {
      uploadedBy: options.userId,
      uploadedAt: new Date().toISOString(),
      filename: options.filename,
      ...options.metadata,
    }

    // Upload to R2
    await bucket.put(key, file, {
      httpMetadata,
      customMetadata,
    })

    logger.info('☁️ File uploaded to R2 successfully:', {
      key,
      filename: options.filename,
      contentType: options.contentType,
    })

    return {
      success: true,
      fileId: key.split('/').pop()?.split('-')[0],
      key,
    }
  } catch (error) {
    logger.error('❌ R2 upload failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Generate signed URL for upload (presigned PUT URL)
 */
export async function generateUploadURL(
  options: UploadOptions,
  bucket: any,
  env: { USE_MOCKS?: string },
  expiresIn: number = 3600 // 1 hour default for uploads
): Promise<SignedURLResult> {
  try {
    const key = options.customKey || generateFileKey(options.userId, options.filename, options.folder)

    // Mock mode
    if (isMockMode(env)) {
      logger.info('☁️ [MOCK] Signed upload URL would be generated for:', { key })
      const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()
      return {
        success: true,
        url: `https://mock-r2.example.com/upload/${key}?signature=mock&expires=${expiresAt}`,
        expiresAt,
      }
    }

    // Generate presigned URL for PUT
    const url = await bucket.createMultipartUpload(key, {
      httpMetadata: {
        contentType: options.contentType,
      },
      customMetadata: {
        uploadedBy: options.userId,
        filename: options.filename,
      },
    })

    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()

    logger.info('☁️ Signed upload URL generated:', {
      key,
      expiresIn,
    })

    return {
      success: true,
      url: url.uploadId, // Note: This is simplified - actual implementation would need proper presigned URL
      expiresAt,
    }
  } catch (error) {
    logger.error('❌ Failed to generate upload URL:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Generate signed URL for download (D-028: 24-hour expiry)
 */
export async function generateDownloadURL(
  key: string,
  bucket: any,
  env: { USE_MOCKS?: string },
  expiresIn: number = 86400 // 24 hours default per D-028
): Promise<SignedURLResult> {
  try {
    // Mock mode
    if (isMockMode(env)) {
      logger.info('☁️ [MOCK] Signed download URL would be generated for:', { key })
      const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()
      return {
        success: true,
        url: `https://mock-r2.example.com/download/${key}?signature=mock&expires=${expiresAt}`,
        expiresAt,
      }
    }

    // Check if file exists
    const object = await bucket.head(key)
    if (!object) {
      return {
        success: false,
        error: 'File not found',
      }
    }

    // Generate signed URL
    // Note: R2 doesn't have native presigned URLs like S3, but you can use Workers to create them
    // For now, we'll use a simple URL structure that would be validated by a Worker endpoint
    const expiresAt = new Date(Date.now() + expiresIn * 1000)
    const signature = await generateSignature(key, expiresAt.getTime())

    const url = `https://files.umbrella.app/${key}?expires=${expiresAt.getTime()}&signature=${signature}`

    logger.info('☁️ Signed download URL generated:', {
      key,
      expiresIn,
      expiresAt: expiresAt.toISOString(),
    })

    return {
      success: true,
      url,
      expiresAt: expiresAt.toISOString(),
    }
  } catch (error) {
    logger.error('❌ Failed to generate download URL:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get file from R2
 */
export async function getFile(
  key: string,
  bucket: any,
  env: { USE_MOCKS?: string }
): Promise<{ success: boolean; file?: any; error?: string }> {
  try {
    // Mock mode
    if (isMockMode(env)) {
      logger.info('☁️ [MOCK] File would be retrieved from R2:', { key })
      return {
        success: true,
        file: undefined, // Mock doesn't return actual file
      }
    }

    const object = await bucket.get(key)

    if (!object) {
      return {
        success: false,
        error: 'File not found',
      }
    }

    logger.info('☁️ File retrieved from R2:', {
      key,
      size: object.size,
      contentType: object.httpMetadata?.contentType,
    })

    return {
      success: true,
      file: object,
    }
  } catch (error) {
    logger.error('❌ Failed to get file from R2:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Delete file from R2
 */
export async function deleteFile(
  key: string,
  bucket: any,
  env: { USE_MOCKS?: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    // Mock mode
    if (isMockMode(env)) {
      logger.info('☁️ [MOCK] File would be deleted from R2:', { key })
      return { success: true }
    }

    await bucket.delete(key)

    logger.info('☁️ File deleted from R2:', { key })

    return { success: true }
  } catch (error) {
    logger.error('❌ Failed to delete file from R2:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * List files in a folder
 */
export async function listFiles(
  prefix: string,
  bucket: any,
  env: { USE_MOCKS?: string },
  limit: number = 100
): Promise<{ success: boolean; files?: any; error?: string }> {
  try {
    // Mock mode
    if (isMockMode(env)) {
      logger.info('☁️ [MOCK] Files would be listed from R2 with prefix:', { prefix })
      return {
        success: true,
        files: undefined, // Mock doesn't return actual list
      }
    }

    const list = await bucket.list({
      prefix,
      limit,
    })

    logger.info('☁️ Files listed from R2:', {
      prefix,
      count: list.objects.length,
    })

    return {
      success: true,
      files: list,
    }
  } catch (error) {
    logger.error('❌ Failed to list files from R2:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get file metadata
 */
export async function getFileMetadata(
  key: string,
  bucket: any,
  env: { USE_MOCKS?: string }
): Promise<{ success: boolean; metadata?: any; error?: string }> {
  try {
    // Mock mode
    if (isMockMode(env)) {
      logger.info('☁️ [MOCK] File metadata would be retrieved from R2:', { key })
      return {
        success: true,
        metadata: undefined,
      }
    }

    const object = await bucket.head(key)

    if (!object) {
      return {
        success: false,
        error: 'File not found',
      }
    }

    logger.info('☁️ File metadata retrieved from R2:', {
      key,
      size: object.size,
    })

    return {
      success: true,
      metadata: object,
    }
  } catch (error) {
    logger.error('❌ Failed to get file metadata:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Generate signature for signed URLs
 * This is a simplified version - production should use HMAC-SHA256 with a secret key
 */
async function generateSignature(key: string, expiresAt: number): Promise<string> {
  const data = `${key}:${expiresAt}`
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)

  // Use crypto.subtle to generate hash
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')

  return hashHex
}

/**
 * Verify signed URL signature
 */
export async function verifySignature(
  key: string,
  expiresAt: number,
  signature: string
): Promise<boolean> {
  // Check if expired
  if (Date.now() > expiresAt) {
    return false
  }

  // Verify signature
  const expectedSignature = await generateSignature(key, expiresAt)
  return signature === expectedSignature
}

/**
 * Configure CORS for R2 bucket
 * Note: This is documentation - actual CORS configuration is done via Wrangler or Dashboard
 */
export const R2_CORS_CONFIG = {
  AllowedOrigins: ['https://umbrella.app', 'https://*.umbrella.app'],
  AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
  AllowedHeaders: ['*'],
  ExposeHeaders: ['ETag', 'Content-Length', 'Content-Type'],
  MaxAgeSeconds: 3600,
}

/**
 * Recommended folder structure for R2
 */
export const R2_FOLDERS = {
  AVATARS: 'avatars/',
  BANNERS: 'banners/',
  TRACKS: 'tracks/',
  EPK_FILES: 'epk/',
  VENUE_IMAGES: 'venues/',
  GIG_POSTERS: 'gigs/',
  ATTACHMENTS: 'attachments/',
  TEMP: 'temp/',
} as const
