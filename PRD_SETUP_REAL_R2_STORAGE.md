# PRD: Setup Real R2 Storage Service

**Document Version:** 1.0  
**Created:** 2025-11-22  
**Target Branch:** `feature/setup-real-r2-storage`  
**Estimated Effort:** 6-8 hours  
**Priority:** High (Required for production file storage)

---

## 📋 Executive Summary

**Objective:** Create real R2 storage service wrapper, configure R2 bucket in Cloudflare, and connect it to the service factory, enabling production file storage when `USE_MOCKS = "false"` and R2 bucket is configured.

**Current State:** 
- Mock R2 service exists at `api/mocks/r2.ts` with full interface
- R2 helper functions exist at `api/storage/r2.ts` but don't implement service interface
- No R2 bucket created in Cloudflare
- Factory (`api/mocks/index.ts`) always returns mock service
- R2 bucket binding not configured in `wrangler.toml` for production

**Success Criteria:** 
- R2 bucket created in Cloudflare
- Real R2 service wrapper created implementing same interface as mock
- Factory returns real service when R2 bucket is configured
- Mock service continues to work in development/preview
- All existing tests pass
- New tests verify real R2 integration
- Documentation updated

---

## 🎯 Context & Background

### Current Architecture

The codebase uses a service factory pattern to switch between mock and real services:

```
api/mocks/index.ts (Factory)
    ├── getEmailService(env) → Returns MockResendService or ResendEmailService
    ├── getSMSService(env) → Returns MockTwilioService or TwilioSMSService
    ├── getAIService(env) → Returns MockClaudeService or ClaudeAPIService
    └── getStorageService(env) → Currently always returns MockR2Service
```

### Existing Code

**Mock Service:** `api/mocks/r2.ts`
- ✅ Fully implemented `MockR2Service` class
- ✅ Interface: `generateSignedURL`, `deleteFile`, `getQuotaUsage`, `getFileMetadata`, `listFiles`
- ✅ In-memory file storage
- ✅ Quota tracking (50GB per artist)
- ✅ Upload intent tracking

**R2 Helper Functions:** `api/storage/r2.ts`
- ✅ Helper functions for R2 operations
- ✅ Functions: `generateUploadSignedUrl`, `generateDownloadSignedUrl`, `uploadFile`, `deleteFile`, `getFileMetadata`, etc.
- ⚠️ **Does NOT implement service interface** - different API

**Factory:** `api/mocks/index.ts`
- ⚠️ `getStorageService()` always returns mock (lines 107-120)
- ⚠️ No real R2 service wrapper exists yet

**R2 Bucket Configuration:**
- ⚠️ R2 bucket not created in Cloudflare
- ⚠️ R2 bucket binding commented out in `wrangler.toml` for production
- ✅ R2 bucket binding exists for dev environment (line 133-135)

### Environment Configuration

**Development:**
```toml
USE_MOCKS = "true"
ENVIRONMENT = "development"
[[env.dev.r2_buckets]]
binding = "BUCKET"
bucket_name = "umbrella-dev-media"  # Already configured
```

**Production:**
```toml
USE_MOCKS = "false"
ENVIRONMENT = "production"
# [[env.production.r2_buckets]]  # COMMENTED OUT - needs to be uncommented
# binding = "BUCKET"
# bucket_name = "umbrella-prod-media"
```

---

## 📐 Requirements

### Functional Requirements

1. **FR1: Create R2 Bucket in Cloudflare**
   - Create production R2 bucket: `umbrella-prod-media`
   - Create staging R2 bucket: `umbrella-staging-media` (optional)
   - Configure bucket settings (CORS, public access if needed)

2. **FR2: Create Real R2 Service Wrapper**
   - Create `api/services/r2.ts` with `R2StorageService` class
   - Implement same interface as `MockR2Service`
   - Use R2 bucket directly via `env.BUCKET`
   - Implement all methods: `generateSignedURL`, `deleteFile`, `getQuotaUsage`, `getFileMetadata`, `listFiles`

3. **FR3: Update wrangler.toml**
   - Uncomment R2 bucket binding for production
   - Add bucket name: `umbrella-prod-media`
   - Ensure bucket binding is correct

4. **FR4: Service Factory Logic**
   - Factory must check `USE_MOCKS` environment variable
   - Factory must check for `BUCKET` binding
   - Return real service when: `USE_MOCKS = "false"` AND `BUCKET` exists
   - Return mock service otherwise (backward compatible)

5. **FR5: Signed URL Generation**
   - Real service must generate actual R2 presigned URLs
   - Upload URLs: 15-minute expiry
   - Download URLs: 24-hour expiry (per D-028)
   - URLs must be valid and functional

6. **FR6: Quota Tracking**
   - Real service must calculate actual storage usage from R2
   - Enforce 50GB per artist limit (per D-026)
   - Track usage accurately across all file types

7. **FR7: File Operations**
   - Real service must support file upload, delete, list operations
   - File metadata must be stored correctly
   - File operations must be atomic and reliable

### Non-Functional Requirements

1. **NFR1: Performance**
   - Service initialization must be fast (< 10ms)
   - File operations must be efficient
   - No performance degradation vs current mock

2. **NFR2: Reliability**
   - Real service must handle R2 API failures gracefully
   - File operations must be atomic
   - Quota checks must be accurate

3. **NFR3: Observability**
   - Log which service is being used (mock vs real)
   - Log file operations
   - Track storage usage
   - Monitor quota usage

4. **NFR4: Security**
   - Signed URLs must have proper expiration
   - File access must be properly scoped
   - CORS must be configured correctly

5. **NFR5: Cost Management**
   - Storage usage must be tracked accurately
   - Quota limits must be enforced
   - Large file uploads must be handled efficiently

---

## 🔧 Technical Specifications

### Service Interface

Both mock and real services must implement the same interface:

```typescript
interface StorageService {
  generateSignedURL(params: {
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
  }>
  
  deleteFile(key: string): Promise<{
    success: boolean
    error?: string
  }>
  
  getQuotaUsage(artistId: string): Promise<{
    used: number
    total: number
    files: number
  }>
  
  getFileMetadata(key: string): Promise<{
    success: boolean
    data?: FileMetadata
    error?: string
  }>
  
  listFiles(
    artistId: string,
    folder?: string,
    limit?: number
  ): Promise<{
    success: boolean
    files?: FileMetadata[]
    error?: string
  }>
}
```

### Factory Function Signature

```typescript
export function getStorageService(env: Env): StorageService {
  // Implementation here
}
```

### Environment Interface

```typescript
export interface Env {
  USE_MOCKS?: string
  BUCKET?: R2Bucket
  DB?: D1Database
  // ... other env vars
}
```

### R2 Bucket Structure

```
umbrella-prod-media/
├── files/{artistId}/
│   ├── {uploadId}-{filename}
│   └── ...
├── profiles/{artistId}/
│   └── ...
├── tracks/{artistId}/
│   └── ...
├── media/{artistId}/
│   └── ...
└── attachments/{conversationId}/
    └── ...
```

### Storage Quotas

- **Per Artist:** 50GB (53,687,091,200 bytes)
- **Max File Size:** 100MB (104,857,600 bytes)
- **Upload URL TTL:** 15 minutes (900 seconds)
- **Download URL TTL:** 24 hours (86,400 seconds)

---

## 🖥️ Claude Code Environment Setup

### Required Environment for Implementation

To implement this feature end-to-end, Claude Code requires the following environment configuration:

#### 1. **Cloudflare Account & Wrangler CLI**
- **Cloudflare Account:** Active account with R2 access enabled
- **Wrangler CLI:** Installed and authenticated (`npm install -g wrangler` or `npm install wrangler`)
- **Authentication:** `wrangler login` completed successfully
- **Account ID:** Available in Cloudflare dashboard (needed for R2 operations)

#### 2. **Local Development Environment**
- **Node.js:** Version 20.0.0 or higher
- **npm:** Version 10.0.0 or higher
- **TypeScript:** Installed and configured (already in project)
- **Git:** For version control and branch management

#### 3. **Cloudflare R2 Access**
- **R2 Bucket Creation Permissions:** Ability to create R2 buckets via Wrangler CLI
- **R2 Bucket Management:** Access to Cloudflare dashboard for bucket configuration
- **CORS Configuration:** Ability to configure CORS settings (via dashboard or API)

#### 4. **Project Dependencies**
- **All npm packages installed:** `npm install` completed
- **TypeScript compilation:** `npm run type-check` passes
- **Local D1 Database:** Configured and accessible for testing
- **Wrangler dev environment:** Can run `wrangler dev` successfully

#### 5. **Required Secrets & Configuration**
- **No secrets required for implementation** (R2 bucket binding is configured in `wrangler.toml`)
- **Environment variables:** `USE_MOCKS` can be toggled for testing
- **R2 Bucket Binding:** Must be configured in `wrangler.toml` (will be done during implementation)

#### 6. **Testing Environment**
- **Vitest:** Configured and working (`npm run test` works)
- **Mock R2 Bucket:** Can use local R2 bucket or mock for testing
- **D1 Database:** Local database available for quota tracking tests

#### 7. **Code Access**
- **Full codebase access:** All files in `wip-webapp/` directory
- **Read access to:**
  - `api/mocks/r2.ts` (mock service interface)
  - `api/storage/r2.ts` (R2 helper functions)
  - `api/mocks/index.ts` (service factory)
  - `wrangler.toml` (environment configuration)
- **Write access to:**
  - `api/services/r2.ts` (new file to create)
  - `api/mocks/index.ts` (factory updates)
  - `wrangler.toml` (R2 bucket binding)
  - Test files (new test files to create)

#### 8. **External Resources**
- **Cloudflare R2 Documentation:** https://developers.cloudflare.com/r2/
- **Wrangler R2 Commands:** https://developers.cloudflare.com/workers/wrangler/commands/#r2
- **R2 API Reference:** For understanding presigned URL generation

### Environment Verification Checklist

Before starting implementation, verify:
- [ ] `wrangler --version` shows installed version
- [ ] `wrangler whoami` shows authenticated account
- [ ] `npm run type-check` passes without errors
- [ ] `npm run test` runs successfully
- [ ] Can access Cloudflare dashboard
- [ ] Local D1 database is accessible
- [ ] Git branch can be created (`feature/setup-real-r2-storage`)

### Implementation Workflow

1. **Create R2 Bucket:** Use `wrangler r2 bucket create umbrella-prod-media`
2. **Configure CORS:** Set up CORS via Cloudflare dashboard or API
3. **Update wrangler.toml:** Uncomment and configure R2 bucket binding
4. **Create Service Wrapper:** Implement `api/services/r2.ts`
5. **Update Factory:** Modify `api/mocks/index.ts` to use real service
6. **Write Tests:** Create comprehensive test suite
7. **Verify:** Run all tests and type checks

---

## 🛠️ Implementation Steps

### Step 1: Create R2 Bucket in Cloudflare

**Action:** Create production R2 bucket using Wrangler CLI

**Commands:**
```bash
# Create production bucket
wrangler r2 bucket create umbrella-prod-media

# (Optional) Create staging bucket
wrangler r2 bucket create umbrella-staging-media --env staging

# Verify bucket was created
wrangler r2 bucket list
```

**Expected Output:**
```
✅ Successfully created bucket "umbrella-prod-media"
```

**Verification:**
- Check Cloudflare dashboard: https://dash.cloudflare.com → R2 → Buckets
- Verify bucket appears in list

### Step 2: Configure CORS for R2 Bucket

**Action:** Configure CORS to allow direct uploads from frontend

**Create File:** `scripts/configure-r2-cors.js` (if doesn't exist)

**CORS Configuration:**
```json
{
  "AllowedOrigins": ["https://umbrella.app", "https://*.umbrella.app"],
  "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
  "AllowedHeaders": ["*"],
  "ExposeHeaders": ["ETag"],
  "MaxAgeSeconds": 3600
}
```

**Command:**
```bash
# Configure CORS (requires Cloudflare API or dashboard)
# Or use: wrangler r2 bucket cors put umbrella-prod-media --cors-config=cors.json
```

**Note:** CORS configuration may need to be done via Cloudflare dashboard or API. Document the process.

### Step 3: Update wrangler.toml

**File:** `wrangler.toml`

**Action:** Uncomment and configure R2 bucket binding for production (lines 188-192)

**Code Change:**
```toml
# BEFORE (lines 188-192):
# Production R2 bucket binding
# Uncomment after creating the bucket via: wrangler r2 bucket create umbrella-prod
# [[env.production.r2_buckets]]
# binding = "BUCKET"
# bucket_name = "umbrella-prod"

# AFTER:
# Production R2 bucket binding
[[env.production.r2_buckets]]
binding = "BUCKET"
bucket_name = "umbrella-prod-media"
```

**Also Update Preview Environment (if needed):**
```toml
# Preview environment (lines 108-110)
# Uncomment if you want preview to use real R2 (optional)
# [[env.preview.r2_buckets]]
# binding = "BUCKET"
# bucket_name = "umbrella-dev-media"  # Can share dev bucket
```

### Step 4: Create Real R2 Service Wrapper

**File:** `api/services/r2.ts` (create new file)

**Action:** Create `R2StorageService` class implementing the same interface as `MockR2Service`

**Implementation Template:**
```typescript
/**
 * Real R2 Storage Service Wrapper
 * Implements storage service interface using Cloudflare R2 bucket
 */

import { generateUUIDv4 } from '../utils/uuid'
import { STORAGE_QUOTAS } from '../storage/types'
import {
  generateUploadSignedUrl,
  generateDownloadSignedUrl,
  deleteFile as deleteR2File,
  getFileMetadata as getR2FileMetadata,
  calculateStorageUsage,
  listArtistFiles,
} from '../storage/r2'

/**
 * Real R2 Storage Service
 * Uses Cloudflare R2 bucket for persistent file storage
 */
export class R2StorageService {
  private bucket: R2Bucket

  constructor(bucket: R2Bucket) {
    this.bucket = bucket
  }

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
      const uploadId = generateUUIDv4()

      // Use R2 helper to generate signed URL
      const result = await generateUploadSignedUrl(
        this.bucket,
        params.key,
        {
          contentType: params.contentType,
          contentLength: params.maxSize,
          expiresIn: params.expiresIn,
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
   * Delete file from R2
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
      console.error('[R2 STORAGE] Failed to get quota usage:', error)
      return {
        used: 0,
        total: STORAGE_QUOTAS.PER_ARTIST,
        files: 0,
      }
    }
  }

  /**
   * Get file metadata
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
}

/**
 * Factory function to create R2StorageService instance
 */
export function createR2Service(bucket: R2Bucket): R2StorageService {
  return new R2StorageService(bucket)
}
```

**Note:** You may need to adjust the implementation based on:
- How `generateUploadSignedUrl` actually works in Cloudflare R2
- Whether R2 supports presigned URLs natively or requires custom implementation
- The exact return types from `api/storage/r2.ts` helper functions

### Step 5: Fix R2 Helper Functions (if needed)

**File:** `api/storage/r2.ts`

**Action:** Review and fix signed URL generation functions (lines 93-153, 158-194)

**Issue:** Current implementation has placeholder URLs. Need to implement real R2 presigned URLs.

**Research Required:**
- Cloudflare R2 presigned URL API
- How to generate presigned PUT URLs for uploads
- How to generate presigned GET URLs for downloads

**Possible Implementation:**
```typescript
// For uploads - R2 doesn't have native presigned URLs
// May need to use Workers to proxy or use R2's public URL with custom domain
// OR use R2's createMultipartUpload for large files

// For downloads - can use R2's public URL or custom domain
// OR generate signed URLs via Workers endpoint
```

**Note:** This is a critical step. Cloudflare R2 doesn't support S3-style presigned URLs directly. You may need to:
1. Use R2's public URL feature with custom domain
2. Create a Workers endpoint that generates signed URLs
3. Use R2's multipart upload API for large files

**Check Cloudflare R2 Documentation:**
- https://developers.cloudflare.com/r2/
- Search for "presigned URLs" or "signed URLs"

### Step 6: Update Service Factory Imports

**File:** `api/mocks/index.ts`

**Action:**
1. Import real R2 service (add after line 9)
2. Import factory function: `createR2Service`

**Code Change:**
```typescript
// Add after line 9:
import { R2StorageService, createR2Service } from '../services/r2'
```

### Step 7: Create Union Type for Service Interface

**File:** `api/mocks/index.ts`

**Action:**
Add type alias after imports:

```typescript
// Add after real service imports
/**
 * Union type for storage service (supports both mock and real)
 */
type StorageService = MockR2Service | R2StorageService
```

### Step 8: Update Factory Function Logic

**File:** `api/mocks/index.ts`

**Action:**
Replace `getStorageService()` function (lines 107-120) with new implementation:

```typescript
/**
 * Get storage service (mock or real based on environment)
 * @param env - Environment variables
 * @returns Storage service instance (mock or real)
 */
export function getStorageService(env: Env): StorageService {
  const useMocks = env.USE_MOCKS === 'true' || env.USE_MOCKS === undefined
  
  // Check if we should use real service
  const shouldUseReal = !useMocks && env.BUCKET
  
  if (shouldUseReal) {
    try {
      console.log('[SERVICE FACTORY] Using real R2 storage service')
      return createR2Service(env.BUCKET!)
    } catch (error) {
      console.error('[SERVICE FACTORY] Failed to initialize real R2 service, falling back to mock:', error)
      return createMockR2Service()
    }
  }
  
  // Default to mock for development/preview or if real service unavailable
  console.log('[SERVICE FACTORY] Using mock R2 storage service')
  return createMockR2Service()
}
```

### Step 9: Update Service Status Function

**File:** `api/mocks/index.ts`

**Action:**
Update `getServiceStatus()` function to accurately reflect storage service status:

```typescript
export function getServiceStatus(env: Env): {
  mockMode: boolean
  services: {
    email: 'mock' | 'real'
    sms: 'mock' | 'real'
    ai: 'mock' | 'real'
    storage: 'mock' | 'real'
  }
} {
  const mockMode = isMockMode(env)
  
  // Check if real storage service would be used
  const storageService = !mockMode && env.BUCKET ? 'real' : 'mock'
  
  return {
    mockMode,
    services: {
      email: mockMode || !env.RESEND_API_KEY ? 'mock' : 'real',
      sms: mockMode || !env.TWILIO_ACCOUNT_SID ? 'mock' : 'real',
      ai: mockMode || !env.ANTHROPIC_API_KEY ? 'mock' : 'real',
      storage: storageService,
    },
  }
}
```

### Step 10: Verify Type Compatibility

**Action:**
1. Run TypeScript type check: `npm run type-check`
2. Ensure no type errors introduced
3. Verify all usages of `getStorageService()` still type-check correctly

**Files to Check:**
- `api/controllers/files/index.ts` (line 482-483)
- Any other files importing `getStorageService`

---

## 🧪 Testing Requirements

### Unit Tests

**File:** `tests/unit/services/r2-service.test.ts` (create new file)

**Test Cases:**

1. **Factory Returns Mock by Default**
   ```typescript
   test('getStorageService returns mock when USE_MOCKS is true', () => {
     const env = { USE_MOCKS: 'true' }
     const service = getStorageService(env)
     expect(service).toBeInstanceOf(MockR2Service)
   })
   ```

2. **Factory Returns Mock when USE_MOCKS is undefined**
   ```typescript
   test('getStorageService returns mock when USE_MOCKS is undefined', () => {
     const env = {}
     const service = getStorageService(env)
     expect(service).toBeInstanceOf(MockR2Service)
   })
   ```

3. **Factory Returns Real Service when Configured**
   ```typescript
   test('getStorageService returns real service when configured', () => {
     const mockBucket = createMockR2Bucket()
     const env = {
       USE_MOCKS: 'false',
       BUCKET: mockBucket,
     }
     const service = getStorageService(env)
     expect(service).toBeInstanceOf(R2StorageService)
   })
   ```

4. **Factory Falls Back to Mock on Error**
   ```typescript
   test('getStorageService falls back to mock if real service fails', () => {
     const env = {
       USE_MOCKS: 'false',
       BUCKET: null, // Missing bucket should cause fallback
     }
     const service = getStorageService(env)
     expect(service).toBeInstanceOf(MockR2Service)
   })
   ```

5. **Service Status Reports Correctly**
   ```typescript
   test('getServiceStatus reports storage service correctly', () => {
     const mockBucket = createMockR2Bucket()
     const env = {
       USE_MOCKS: 'false',
       BUCKET: mockBucket,
     }
     const status = getServiceStatus(env)
     expect(status.services.storage).toBe('real')
   })
   ```

### Integration Tests

**File:** `tests/integration/r2-storage.test.ts` (create new file)

**Test Cases:**

1. **Real Service Generates Signed URL**
   ```typescript
   test('real service generates signed upload URL', async () => {
     const mockBucket = createMockR2Bucket()
     const service = createR2Service(mockBucket)
     
     const result = await service.generateSignedURL({
       key: 'files/artist_123/test.jpg',
       expiresIn: 900,
       contentType: 'image/jpeg',
       maxSize: 5242880,
       artistId: 'artist_123',
     })
     
     expect(result.success).toBe(true)
     expect(result.url).toBeDefined()
     expect(result.uploadId).toBeDefined()
   })
   ```

2. **Real Service Deletes File**
   ```typescript
   test('real service deletes file from R2', async () => {
     const mockBucket = createMockR2Bucket()
     // Setup: Add test file to bucket
     await mockBucket.put('test-key', new ArrayBuffer(100))
     
     const service = createR2Service(mockBucket)
     const result = await service.deleteFile('test-key')
     
     expect(result.success).toBe(true)
     // Verify file was deleted
     const file = await mockBucket.head('test-key')
     expect(file).toBeNull()
   })
   ```

3. **Real Service Calculates Quota Usage**
   ```typescript
   test('real service calculates quota usage correctly', async () => {
     const mockBucket = createMockR2Bucket()
     // Setup: Add test files
     await mockBucket.put('files/artist_123/file1.jpg', new ArrayBuffer(1000))
     await mockBucket.put('files/artist_123/file2.jpg', new ArrayBuffer(2000))
     
     const service = createR2Service(mockBucket)
     const usage = await service.getQuotaUsage('artist_123')
     
     expect(usage.used).toBe(3000)
     expect(usage.total).toBe(53687091200) // 50GB
     expect(usage.files).toBe(2)
   })
   ```

4. **Real Service Gets File Metadata**
   ```typescript
   test('real service gets file metadata', async () => {
     const mockBucket = createMockR2Bucket()
     // Setup: Add test file
     await mockBucket.put('test-key', new ArrayBuffer(100), {
       httpMetadata: { contentType: 'image/jpeg' },
     })
     
     const service = createR2Service(mockBucket)
     const result = await service.getFileMetadata('test-key')
     
     expect(result.success).toBe(true)
     expect(result.data?.key).toBe('test-key')
     expect(result.data?.size).toBe(100)
     expect(result.data?.contentType).toBe('image/jpeg')
   })
   ```

5. **Real Service Lists Files**
   ```typescript
   test('real service lists files for artist', async () => {
     const mockBucket = createMockR2Bucket()
     // Setup: Add test files
     await mockBucket.put('files/artist_123/file1.jpg', new ArrayBuffer(100))
     await mockBucket.put('files/artist_123/file2.jpg', new ArrayBuffer(200))
     
     const service = createR2Service(mockBucket)
     const result = await service.listFiles('artist_123', 'files')
     
     expect(result.success).toBe(true)
     expect(result.files?.length).toBe(2)
   })
   ```

6. **Quota Enforcement**
   ```typescript
   test('real service enforces storage quota', async () => {
     const mockBucket = createMockR2Bucket()
     // Setup: Fill quota to limit
     const largeFile = new ArrayBuffer(53687091200) // 50GB
     await mockBucket.put('files/artist_123/large.bin', largeFile)
     
     const service = createR2Service(mockBucket)
     const usage = await service.getQuotaUsage('artist_123')
     
     expect(usage.used).toBeGreaterThanOrEqual(53687091200)
     expect(usage.used).toBeLessThanOrEqual(usage.total)
   })
   ```

### E2E Tests

**File:** `tests/e2e/file-storage.test.ts` (create new file)

**Test Cases:**

1. **Complete File Upload Flow**
   ```typescript
   test('complete file upload flow with real R2', async () => {
     // Setup: Create user, configure real R2 service
     // Action: Request upload URL, upload file, confirm upload
     // Verify: File exists in R2, metadata stored in database, quota updated
   })
   ```

2. **File Download Flow**
   ```typescript
   test('file download with signed URL', async () => {
     // Setup: Upload file to R2
     // Action: Request download URL
     // Verify: Signed URL is valid and file can be downloaded
   })
   ```

3. **File Deletion Flow**
   ```typescript
   test('file deletion updates quota', async () => {
     // Setup: Upload file, verify quota usage
     // Action: Delete file
     // Verify: File removed from R2, quota updated in database
   })
   ```

### Test Setup

**File:** `tests/helpers/mock-env.ts` (update if exists)

**Add helper functions:**
```typescript
export function createMockR2Bucket(): R2Bucket {
  // Create mock R2 bucket for testing
  // Use vitest's mock or create a simple in-memory implementation
}

export function createStorageServiceEnv(useMocks: boolean = true, hasBucket: boolean = false) {
  return {
    USE_MOCKS: useMocks ? 'true' : 'false',
    BUCKET: hasBucket ? createMockR2Bucket() : undefined,
  }
}
```

---

## 📝 Code Quality Requirements

### Linting

- All code must pass ESLint: `npm run lint`
- Max warnings: 45 (current limit)
- Fix all auto-fixable issues: `npm run lint:fix`

### Formatting

- All code must pass Prettier: `npm run format:check`
- Auto-format before commit: `npm run format`

### Type Safety

- All code must pass TypeScript: `npm run type-check`
- No `any` types (use proper types)
- Proper error handling types
- R2Bucket type from `@cloudflare/workers-types`

### Documentation

- Add JSDoc comments to new/changed functions
- Update inline comments where logic changes
- Document R2 bucket setup process
- Document CORS configuration
- Document signed URL generation approach

---

## 🔍 Error Handling

### Factory Errors

**Scenario:** Real service initialization fails

**Handling:**
```typescript
try {
  return createR2Service(env.BUCKET!)
} catch (error) {
  console.error('[SERVICE FACTORY] Failed to initialize real R2 service, falling back to mock:', error)
  return createMockR2Service()
}
```

### Service Errors

The real service must handle:
- R2 API failures (bucket operations)
- File not found errors
- Quota exceeded errors
- Invalid file operations
- Network timeouts

**Error Handling Pattern:**
```typescript
try {
  // R2 operation
} catch (error) {
  return {
    success: false,
    error: error instanceof Error ? error.message : 'Unknown error',
  }
}
```

---

## 📚 Documentation Updates

### Files to Update

1. **`api/mocks/README.md`**
   - Update "How to toggle between mocks and real services" section
   - Add example of enabling real R2 service
   - Document R2 bucket setup process
   - Document CORS configuration

2. **`SERVICES_STATUS_REPORT.md`**
   - Update storage service status to "Real Service Connected"
   - Update action items

3. **`PRODUCTION_SETUP.md`** (if exists)
   - Add R2 bucket creation instructions
   - Add CORS configuration guide
   - Add troubleshooting section

### New Documentation

**File:** `docs/R2_STORAGE.md` (create if doesn't exist)

**Content:**
- How R2 storage works
- Mock vs real service differences
- R2 bucket setup guide
- CORS configuration
- Signed URL generation
- Storage quota management
- File organization structure
- Troubleshooting common issues
- R2 API limits and quotas

---

## 🚀 CI/CD Considerations

### Pre-Commit Checks

All must pass:
- `npm run type-check`
- `npm run lint`
- `npm run format:check`

### CI Pipeline

The existing CI/CD pipeline (`.github/workflows/ci-cd.yml`) will:
1. ✅ Run lint and type check (already configured)
2. ✅ Run tests (will include new tests)
3. ✅ Build worker (will verify imports work)
4. ✅ Deploy preview (will test in preview environment)

### R2 Bucket in CI

**Note:** CI/CD tests will use mock R2 service (no real bucket needed for tests)

**For E2E tests with real R2:**
- May need to create test R2 bucket
- Or use mock for all CI/CD tests
- Document approach in test files

---

## 🌿 Branch & PR Guidelines

### Branch Naming

**Branch:** `feature/setup-real-r2-storage`

**Naming Convention:** `feature/<descriptive-name>`

### PR Title

**Title:** `feat(storage): setup real R2 storage service and bucket`

### PR Description Template

```markdown
## Summary
Creates real R2 storage service wrapper, configures R2 bucket in Cloudflare, and connects it to the service factory.

## Changes
- Created `api/services/r2.ts` with R2StorageService class
- Updated `api/mocks/index.ts` to conditionally return real service
- Updated `wrangler.toml` to bind R2 bucket for production
- Created R2 bucket in Cloudflare: `umbrella-prod-media`
- Configured CORS for R2 bucket
- Fixed R2 helper functions for signed URL generation
- Added comprehensive tests

## Infrastructure
- [x] R2 bucket created: `umbrella-prod-media`
- [x] CORS configured for bucket
- [x] Bucket binding added to wrangler.toml

## Testing
- [x] Unit tests added and passing
- [x] Integration tests added and passing
- [x] E2E tests added and passing
- [x] All existing tests still pass
- [x] TypeScript compilation succeeds
- [x] Linting passes

## Checklist
- [x] Code follows existing patterns
- [x] Tests added for new functionality
- [x] R2 bucket created and configured
- [x] CORS configured
- [x] Documentation updated
- [x] No breaking changes
- [x] Backward compatible

## Related
- Closes #[issue-number] (if applicable)
- Related to SERVICES_STATUS_REPORT.md
```

### PR Requirements

1. **All CI checks must pass**
2. **Code review required** (at least 1 approval)
3. **No merge conflicts** with main branch
4. **Documentation updated**
5. **Tests added and passing**
6. **R2 bucket created** (verify in Cloudflare dashboard)

---

## ✅ Acceptance Criteria

### Must Have

- [ ] R2 bucket created in Cloudflare: `umbrella-prod-media`
- [ ] CORS configured for R2 bucket
- [ ] Real R2 service wrapper created (`api/services/r2.ts`)
- [ ] Factory returns real service when `USE_MOCKS = "false"` and `BUCKET` exists
- [ ] Factory returns mock service by default (backward compatible)
- [ ] R2 bucket binding added to `wrangler.toml` for production
- [ ] Signed URL generation works correctly
- [ ] All existing tests pass
- [ ] New unit tests added and passing
- [ ] New integration tests added and passing
- [ ] TypeScript compilation succeeds
- [ ] ESLint passes
- [ ] Prettier formatting passes
- [ ] Documentation updated

### Should Have

- [ ] E2E tests added
- [ ] Error handling tested
- [ ] Service status function updated
- [ ] Logging added for service selection
- [ ] Quota tracking thoroughly tested
- [ ] File operations thoroughly tested

### Nice to Have

- [ ] Staging R2 bucket created
- [ ] Performance benchmarks
- [ ] Additional error scenarios tested
- [ ] Monitoring/metrics integration
- [ ] Storage usage dashboard

---

## 🔗 Related Files

### Files to Create

1. `api/services/r2.ts` - Real R2 service wrapper (new)
2. `tests/unit/services/r2-service.test.ts` - Unit tests (new)
3. `tests/integration/r2-storage.test.ts` - Integration tests (new)
4. `tests/e2e/file-storage.test.ts` - E2E tests (new)
5. `docs/R2_STORAGE.md` - Documentation (new)

### Files to Modify

1. `api/mocks/index.ts` - Service factory (main changes)
2. `wrangler.toml` - R2 bucket binding (uncomment and configure)
3. `api/storage/r2.ts` - Fix signed URL generation (if needed)
4. `api/mocks/README.md` - Documentation (update)
5. `SERVICES_STATUS_REPORT.md` - Status report (update)

### Files to Reference

1. `api/mocks/r2.ts` - Mock service implementation (interface reference)
2. `api/storage/r2.ts` - R2 helper functions
3. `api/storage/types.ts` - Storage type definitions
4. `.github/workflows/ci-cd.yml` - CI/CD pipeline
5. `wrangler.toml` - Environment configuration

---

## 🎓 Implementation Notes

### Key Considerations

1. **R2 Presigned URLs:** Cloudflare R2 doesn't support S3-style presigned URLs directly. Research the correct approach:
   - May need custom domain with R2
   - May need Workers endpoint for signed URLs
   - May need to use R2's public URL feature

2. **Backward Compatibility:** Must not break existing code using storage service

3. **Type Safety:** Union type ensures both services are compatible

4. **Error Handling:** Graceful fallback prevents application crashes

5. **Quota Tracking:** Critical feature that must work correctly

6. **Testing:** Comprehensive tests ensure reliability

### Common Pitfalls to Avoid

1. ❌ Don't remove mock service - it's still needed for development
2. ❌ Don't hardcode bucket names - use environment configuration
3. ❌ Don't skip error handling - always fallback to mock
4. ❌ Don't forget to update service status function
5. ❌ Don't break existing tests - ensure backward compatibility
6. ❌ Don't forget CORS configuration - required for direct uploads
7. ❌ Don't assume R2 works like S3 - research Cloudflare-specific APIs
8. ❌ Don't skip quota tracking tests - critical feature

### Research Required

Before implementing, research:
1. **Cloudflare R2 Presigned URLs:**
   - How to generate presigned PUT URLs for uploads
   - How to generate presigned GET URLs for downloads
   - Whether custom domain is required
   - Whether Workers endpoint is needed

2. **R2 API Documentation:**
   - https://developers.cloudflare.com/r2/
   - R2 bucket operations
   - R2 signed URLs
   - R2 CORS configuration

3. **Existing Code Patterns:**
   - Check how `api/storage/r2.ts` currently handles signed URLs
   - Check if there are any examples in the codebase
   - Review Cloudflare Workers R2 examples

### Success Indicators

- ✅ All tests pass
- ✅ TypeScript compiles without errors
- ✅ Real service works in production environment
- ✅ Mock service still works in development
- ✅ Signed URLs are valid and functional
- ✅ Quota tracking works correctly
- ✅ File operations work correctly
- ✅ No breaking changes
- ✅ Documentation is clear and accurate
- ✅ R2 bucket is accessible and configured correctly

---

## 📞 Support & Questions

If you encounter issues during implementation:

1. **Check existing code patterns** in `api/mocks/index.ts` for other services (already connected)
2. **Review mock service implementation** in `api/mocks/r2.ts` for interface reference
3. **Review R2 helper functions** in `api/storage/r2.ts`
4. **Check test patterns** in `tests/unit/` and `tests/integration/`
5. **Refer to documentation** in `api/mocks/README.md`
6. **Research Cloudflare R2 docs** for signed URL generation
7. **Check Cloudflare dashboard** for bucket configuration

---

**End of PRD**

