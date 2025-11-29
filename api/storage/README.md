# Storage Layer

Cloudflare KV and R2 storage utilities.

## Files

| File         | Purpose                                      |
| ------------ | -------------------------------------------- |
| `kv.ts`    | KV operations (sessions, cache, rate limits) |
| `r2.ts`    | R2 operations (file upload, signed URLs)     |
| `types.ts` | TypeScript interfaces                        |
| `index.ts` | Re-exports                                   |

## KV Storage (`kv.ts`)

### Sessions (7-day TTL)

```typescript
import { setSession, getSession, deleteSession } from './storage'

await setSession(env.KV, sessionId, { userId, email, provider })
const result = await getSession(env.KV, sessionId)
await deleteSession(env.KV, sessionId)
```

### Violet Rate Limiting (24-hour TTL)

```typescript
import { checkVioletRateLimit, incrementVioletRateLimit } from './storage'

const check = await checkVioletRateLimit(env.KV, userId, 50)
if (check.data.exceeded) { /* return 429 */ }
await incrementVioletRateLimit(env.KV, userId)
```

### Caching

```typescript
import { cacheProfile, getCachedProfile } from './storage'

await cacheProfile(env.KV, userId, profileData)  // 1-hour TTL
const cached = await getCachedProfile(env.KV, userId)
```

## R2 Storage (`r2.ts`)

### Folder Structure

```
umbrella-{env}-media/
├── profiles/{artistId}/    # Profile images
├── tracks/{artistId}/      # Audio files
├── media/{artistId}/       # Videos, press kit
└── files/{artistId}/       # Documents
```

### File Operations

```typescript
import { uploadFile, generateDownloadSignedUrl, deleteFile } from './storage'

// Upload
await uploadFile(env.BUCKET, key, fileData, { contentType, size })

// Signed download URL (1-hour TTL)
const result = await generateDownloadSignedUrl(env.BUCKET, key)

// Delete
await deleteFile(env.BUCKET, key)
```

### Quota Enforcement

```typescript
import { checkStorageQuota, calculateStorageUsage } from './storage'

// Check before upload (50GB per artist)
const quota = await checkStorageQuota(env.BUCKET, artistId, fileSize)
if (!quota.data.allowed) { /* return 429 */ }

// Get usage stats
const usage = await calculateStorageUsage(env.BUCKET, artistId)
```

## TTL Values

| Type              | TTL      | Purpose             |
| ----------------- | -------- | ------------------- |
| Session           | 7 days   | User sessions       |
| Profile Cache     | 1 hour   | Profile data        |
| Search Cache      | 15 min   | Search results      |
| Violet Rate Limit | 24 hours | Resets midnight UTC |
| Upload URL        | 15 min   | Presigned upload    |
| Download URL      | 1 hour   | Presigned download  |

## Limits

- **Storage quota**: 50GB per artist
- **Max file size**: 100MB
- **Violet prompts**: 50/day per artist

## Cloudflare Resources

### R2 Buckets

| Environment | Bucket Name |
|-------------|-------------|
| Local (dev) | `umbrella-dev-media` |
| Preview | `umbrella-preview-media` |
| Staging | `umbrella-staging-media` |
| Production | `umbrella-prod-media` |
