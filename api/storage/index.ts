/**
 * Storage Layer - Barrel Export
 * Umbrella MVP - Cloudflare Workers Storage
 *
 * Centralized exports for KV and R2 storage utilities
 */

// Types
export * from './types'

// KV Operations
export {
  setSession,
  getSession,
  deleteSession,
  cacheProfile,
  getCachedProfile,
  invalidateProfileCache,
  cacheSearchResults,
  getCachedSearchResults,
  checkVioletRateLimit,
  incrementVioletRateLimit,
  setUploadUrlMetadata,
  getUploadUrlMetadata,
  deleteUploadUrlMetadata,
} from './kv'

// R2 Operations
export {
  buildR2Key,
  validateFileType,
  validateFileSize,
  generateUploadSignedUrl,
  generateDownloadSignedUrl,
  calculateStorageUsage,
  checkStorageQuota,
  uploadFile,
  getFileMetadata,
  deleteFile,
  listArtistFiles,
  deleteAllArtistFiles,
} from './r2'
