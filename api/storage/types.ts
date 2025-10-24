/**
 * Storage TypeScript types for KV and R2 operations
 * Umbrella MVP - Cloudflare Workers Storage Layer
 */

/**
 * KV Cache Keys - Namespace patterns for different data types
 */
export const KV_KEYS = {
  SESSION: 'session',           // session:{sessionId}
  PROFILE_CACHE: 'profile',     // profile:{userId}
  SEARCH_CACHE: 'search',       // search:{hash}
  VIOLET_RATE_LIMIT: 'violet',  // violet:{userId}:{date}
  UPLOAD_URL: 'upload',         // upload:{uploadId}
} as const

/**
 * TTL values in seconds for different cache types
 */
export const TTL = {
  SESSION: 7 * 24 * 60 * 60,           // 7 days
  PROFILE_CACHE: 60 * 60,              // 1 hour
  SEARCH_CACHE: 15 * 60,               // 15 minutes
  VIOLET_RATE_LIMIT: 24 * 60 * 60,     // 24 hours
  UPLOAD_URL: 15 * 60,                 // 15 minutes
  DOWNLOAD_URL: 60 * 60,               // 1 hour
} as const

/**
 * R2 folder structure paths
 */
export const R2_PATHS = {
  PROFILES: 'profiles',           // profiles/{artistId}/
  TRACKS: 'tracks',               // tracks/{artistId}/
  MEDIA: 'media',                 // media/{artistId}/
  FILES: 'files',                 // files/{artistId}/
  ATTACHMENTS: 'attachments',     // attachments/{conversationId}/
} as const

/**
 * File type validation rules
 */
export const ALLOWED_FILE_TYPES = {
  IMAGES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  AUDIO: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/aac'],
  VIDEO: ['video/mp4', 'video/webm', 'video/quicktime'],
  DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
} as const

/**
 * Storage quota limits (in bytes)
 */
export const STORAGE_QUOTAS = {
  PER_ARTIST: 50 * 1024 * 1024 * 1024, // 50GB per artist (per D-026)
  MAX_FILE_SIZE: 100 * 1024 * 1024,     // 100MB per file
} as const

/**
 * Session data structure stored in KV
 */
export interface SessionData {
  userId: string
  email: string
  provider: 'apple' | 'google'
  createdAt: string
  expiresAt: string
  lastAccess: string
}

/**
 * Profile cache structure
 */
export interface ProfileCache {
  userId: string
  artistName: string
  bio?: string
  location?: string
  cachedAt: string
}

/**
 * Search cache structure
 */
export interface SearchCache {
  query: string
  filters: Record<string, unknown>
  results: unknown[]
  totalCount: number
  cachedAt: string
}

/**
 * Violet rate limit tracking
 */
export interface VioletRateLimit {
  userId: string
  date: string // YYYY-MM-DD format
  promptCount: number
  lastPromptAt: string
  resetsAt: string // Midnight UTC
}

/**
 * Upload signed URL metadata
 */
export interface UploadUrlMetadata {
  uploadId: string
  userId: string
  fileName: string
  fileType: string
  fileSize: number
  path: string
  expiresAt: string
  createdAt: string
}

/**
 * R2 object metadata
 */
export interface R2ObjectMetadata {
  key: string
  size: number
  uploaded: string
  httpMetadata?: R2HTTPMetadata
  customMetadata?: Record<string, string>
}

/**
 * Storage usage summary for an artist
 */
export interface StorageUsage {
  artistId: string
  totalBytes: number
  fileCount: number
  breakdown: {
    profiles: number
    tracks: number
    media: number
    files: number
    attachments: number
  }
  quotaRemaining: number
  quotaPercentUsed: number
}

/**
 * Signed URL generation options
 */
export interface SignedUrlOptions {
  method: 'GET' | 'PUT'
  expiresIn: number // seconds
  contentType?: string
  contentLength?: number
}

/**
 * File validation result
 */
export interface FileValidationResult {
  valid: boolean
  error?: string
  fileType?: string
  category?: keyof typeof ALLOWED_FILE_TYPES
}

/**
 * KV operation result
 */
export interface KVResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
  cached?: boolean
}

/**
 * R2 operation result
 */
export interface R2Result<T = unknown> {
  success: boolean
  data?: T
  error?: string
}
