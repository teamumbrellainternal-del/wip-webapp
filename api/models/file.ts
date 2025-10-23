/**
 * File data models
 * File metadata for R2 storage (50GB quota per artist)
 */

/**
 * File record stored in D1 (metadata only, blobs in R2)
 */
export interface File {
  id: string
  artist_id: string
  filename: string
  file_size_bytes: number
  mime_type: string
  r2_key: string // R2 object key
  category: 'press_photo' | 'music' | 'video' | 'document' | 'other' | null
  folder_id: string | null
  created_at: string
}

/**
 * Folder record for file organization
 */
export interface Folder {
  id: string
  artist_id: string
  name: string
  parent_folder_id: string | null
  created_at: string
}

/**
 * Storage quota record
 */
export interface StorageQuota {
  artist_id: string
  used_bytes: number
  limit_bytes: number
  updated_at: string
}

/**
 * File creation input
 */
export interface CreateFileInput {
  artist_id: string
  filename: string
  file_size_bytes: number
  mime_type: string
  r2_key: string
  category?: 'press_photo' | 'music' | 'video' | 'document' | 'other'
  folder_id?: string
}

/**
 * Folder creation input
 */
export interface CreateFolderInput {
  artist_id: string
  name: string
  parent_folder_id?: string
}

/**
 * Helper functions
 */

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  const kb = bytes / 1024
  const mb = kb / 1024
  const gb = mb / 1024

  if (gb >= 1) return `${gb.toFixed(2)} GB`
  if (mb >= 1) return `${mb.toFixed(2)} MB`
  if (kb >= 1) return `${kb.toFixed(2)} KB`
  return `${bytes} bytes`
}

/**
 * Calculate storage quota percentage used
 */
export function calculateQuotaPercentage(quota: StorageQuota): number {
  return Math.round((quota.used_bytes / quota.limit_bytes) * 100)
}

/**
 * Check if storage quota exceeded
 */
export function isQuotaExceeded(quota: StorageQuota): boolean {
  return quota.used_bytes >= quota.limit_bytes
}

/**
 * Calculate remaining storage
 */
export function remainingStorage(quota: StorageQuota): number {
  return Math.max(0, quota.limit_bytes - quota.used_bytes)
}

/**
 * Get file category from MIME type
 */
export function getCategoryFromMimeType(mimeType: string): File['category'] {
  if (mimeType.startsWith('image/')) return 'press_photo'
  if (mimeType.startsWith('audio/')) return 'music'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType === 'application/pdf' || mimeType.includes('document')) return 'document'
  return 'other'
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.')
  return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : ''
}

/**
 * Validate file type against allowed types
 */
export function isAllowedFileType(mimeType: string): boolean {
  const allowedTypes = [
    // Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/heic',
    'image/gif',
    // Audio
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/flac',
    'audio/m4a',
    // Video
    'video/mp4',
    'video/quicktime',
    'video/x-m4v',
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ]

  return allowedTypes.includes(mimeType)
}

/**
 * Check if file can be uploaded given current quota
 */
export function canUploadFile(quota: StorageQuota, fileSize: number): boolean {
  return quota.used_bytes + fileSize <= quota.limit_bytes
}

/**
 * Get icon name for file type
 */
export function getFileIcon(file: File): string {
  if (file.category === 'press_photo') return 'image'
  if (file.category === 'music') return 'music'
  if (file.category === 'video') return 'video'
  if (file.category === 'document') return 'document'
  return 'file'
}
