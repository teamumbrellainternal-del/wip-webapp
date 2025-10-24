# Storage Layer Documentation

Cloudflare Workers storage utilities for Umbrella MVP, providing KV and R2 storage operations with proper TTL strategies, quota enforcement, and file validation.

## Overview

This module provides comprehensive storage management for:
- **KV Namespace**: Session management, caching, and rate limiting
- **R2 Bucket**: File storage with quota enforcement and signed URLs

## KV Storage Patterns

### Session Management (7-day TTL)

```typescript
import { setSession, getSession, deleteSession } from './storage'

// Store session
await setSession(env.KV, sessionId, {
  userId: 'user-123',
  email: 'artist@example.com',
  provider: 'google',
  createdAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  lastAccess: new Date().toISOString(),
})

// Get session
const result = await getSession(env.KV, sessionId)
if (result.success) {
  console.log('Session:', result.data)
}

// Delete session (logout)
await deleteSession(env.KV, sessionId)
```

### Profile Cache (1-hour TTL)

```typescript
import { cacheProfile, getCachedProfile, invalidateProfileCache } from './storage'

// Cache profile
await cacheProfile(env.KV, userId, {
  userId: 'user-123',
  artistName: 'John Doe',
  bio: 'Professional musician',
  location: 'Los Angeles, CA',
})

// Get cached profile
const result = await getCachedProfile(env.KV, userId)
if (result.success) {
  console.log('Cached profile:', result.data)
} else {
  // Profile not cached, fetch from database
}

// Invalidate cache after profile update
await invalidateProfileCache(env.KV, userId)
```

### Search Results Cache (15-minute TTL)

```typescript
import { cacheSearchResults, getCachedSearchResults } from './storage'

// Cache search results
await cacheSearchResults(
  env.KV,
  'jazz musicians',
  { location: 'LA', genre: 'jazz' },
  searchResults,
  totalCount
)

// Get cached search results
const result = await getCachedSearchResults(
  env.KV,
  'jazz musicians',
  { location: 'LA', genre: 'jazz' }
)
if (result.success) {
  console.log('Cached results:', result.data.results)
}
```

### Violet AI Rate Limiting (24-hour TTL, resets at midnight UTC per D-062)

```typescript
import { checkVioletRateLimit, incrementVioletRateLimit } from './storage'

// Check rate limit before processing prompt
const checkResult = await checkVioletRateLimit(env.KV, userId, 50)
if (checkResult.success && checkResult.data.exceeded) {
  return errorResponse(
    'rate_limit_exceeded',
    `Daily limit of 50 prompts reached. Resets at ${checkResult.data.resetsAt}`,
    429
  )
}

// Increment counter after successful prompt
const incrementResult = await incrementVioletRateLimit(env.KV, userId)
console.log(`Prompt count: ${incrementResult.data?.count}`)
```

### Upload Signed URL Metadata (15-minute TTL)

```typescript
import { setUploadUrlMetadata, getUploadUrlMetadata } from './storage'

// Store upload metadata
await setUploadUrlMetadata(env.KV, uploadId, {
  uploadId,
  userId: 'user-123',
  fileName: 'track.mp3',
  fileType: 'audio/mpeg',
  fileSize: 5242880,
  path: 'tracks/user-123/track.mp3',
  expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
})

// Retrieve upload metadata
const result = await getUploadUrlMetadata(env.KV, uploadId)
if (result.success) {
  console.log('Upload metadata:', result.data)
}
```

## R2 Storage Operations

### R2 Folder Structure

```
umbrella-prod/
├── profiles/{artistId}/       # Profile images, headers
├── tracks/{artistId}/          # Audio files
├── media/{artistId}/           # Videos, images, press kit
├── files/{artistId}/           # PDFs, documents
└── attachments/{conversationId}/ # Message attachments
```

### File Upload with Validation

```typescript
import {
  buildR2Key,
  validateFileType,
  validateFileSize,
  checkStorageQuota,
  uploadFile
} from './storage'

// Validate file type
const typeValidation = validateFileType('audio/mpeg', ['AUDIO'])
if (!typeValidation.valid) {
  return errorResponse('invalid_file_type', typeValidation.error, 400)
}

// Validate file size
const sizeValidation = validateFileSize(fileSize)
if (!sizeValidation.valid) {
  return errorResponse('file_too_large', sizeValidation.error, 400)
}

// Check storage quota (50GB per artist per D-026)
const quotaCheck = await checkStorageQuota(env.BUCKET, artistId, fileSize)
if (!quotaCheck.success || !quotaCheck.data.allowed) {
  const usage = quotaCheck.data?.currentUsage
  return errorResponse(
    'storage_quota_exceeded',
    `Storage quota exceeded. Using ${usage?.quotaPercentUsed.toFixed(1)}% of 50GB`,
    429
  )
}

// Build R2 key
const key = buildR2Key('TRACKS', artistId, fileName)

// Upload file
const result = await uploadFile(env.BUCKET, key, fileData, {
  contentType: 'audio/mpeg',
  size: fileSize,
  customMetadata: {
    trackId: 'track-123',
    uploadedBy: userId,
  },
})
```

### Signed URL Generation

```typescript
import { generateUploadSignedUrl, generateDownloadSignedUrl } from './storage'

// Generate upload URL (15-minute TTL)
const uploadResult = await generateUploadSignedUrl(
  env.BUCKET,
  key,
  {
    contentType: 'audio/mpeg',
    contentLength: fileSize,
  }
)
if (uploadResult.success) {
  console.log('Upload URL:', uploadResult.data.url)
  console.log('Expires at:', uploadResult.data.expiresAt)
}

// Generate download URL (1-hour TTL)
const downloadResult = await generateDownloadSignedUrl(env.BUCKET, key)
if (downloadResult.success) {
  console.log('Download URL:', downloadResult.data.url)
}
```

### Storage Usage Tracking

```typescript
import { calculateStorageUsage } from './storage'

const result = await calculateStorageUsage(env.BUCKET, artistId)
if (result.success) {
  const usage = result.data
  console.log(`Total storage: ${(usage.totalBytes / (1024 ** 3)).toFixed(2)} GB`)
  console.log(`Files: ${usage.fileCount}`)
  console.log(`Quota used: ${usage.quotaPercentUsed.toFixed(1)}%`)
  console.log('Breakdown:', usage.breakdown)
}
```

### File Management

```typescript
import {
  getFileMetadata,
  deleteFile,
  listArtistFiles
} from './storage'

// Get file metadata
const metadata = await getFileMetadata(env.BUCKET, key)

// List files
const files = await listArtistFiles(env.BUCKET, artistId, 'TRACKS', {
  limit: 50,
})

// Delete file
await deleteFile(env.BUCKET, key)

// Delete all artist files (account deletion)
await deleteAllArtistFiles(env.BUCKET, artistId)
```

## Constants Reference

### TTL Values (in seconds)

```typescript
TTL.SESSION = 604800          // 7 days
TTL.PROFILE_CACHE = 3600      // 1 hour
TTL.SEARCH_CACHE = 900        // 15 minutes
TTL.VIOLET_RATE_LIMIT = 86400 // 24 hours
TTL.UPLOAD_URL = 900          // 15 minutes
TTL.DOWNLOAD_URL = 3600       // 1 hour
```

### Storage Quotas

```typescript
STORAGE_QUOTAS.PER_ARTIST = 53687091200  // 50GB (per D-026)
STORAGE_QUOTAS.MAX_FILE_SIZE = 104857600 // 100MB
```

### Allowed File Types

```typescript
ALLOWED_FILE_TYPES.IMAGES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
ALLOWED_FILE_TYPES.AUDIO = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/aac']
ALLOWED_FILE_TYPES.VIDEO = ['video/mp4', 'video/webm', 'video/quicktime']
ALLOWED_FILE_TYPES.DOCUMENTS = ['application/pdf', 'application/msword', '...']
```

## Design Decisions

- **D-026**: 50GB storage quota per artist
- **D-062**: Violet AI limited to 50 prompts per day, resets at midnight UTC
- **KV TTL Strategy**: Balances cache hit rates with data freshness
- **Signed URLs**: Temporary access for secure uploads/downloads without exposing bucket
- **File Validation**: Prevents malicious uploads and enforces size limits

## Error Handling

All storage functions return a result object with `success` boolean:

```typescript
interface KVResult<T> {
  success: boolean
  data?: T
  error?: string
  cached?: boolean
}

interface R2Result<T> {
  success: boolean
  data?: T
  error?: string
}
```

Always check `success` before accessing `data`:

```typescript
const result = await getSession(env.KV, sessionId)
if (!result.success) {
  return errorResponse('session_error', result.error || 'Unknown error', 500)
}
// Safe to use result.data
```

## Testing

Run unit tests:
```bash
npm test api/storage
```

Test coverage includes:
- KV operations with TTL validation
- R2 quota enforcement
- File type validation
- Signed URL generation
- Rate limiting logic

## Future Enhancements

- [ ] Implement actual R2 presigned URLs (currently placeholders)
- [ ] Add multi-region replication
- [ ] Implement CDN integration for downloads
- [ ] Add file versioning support
- [ ] Implement automatic cleanup of expired uploads
