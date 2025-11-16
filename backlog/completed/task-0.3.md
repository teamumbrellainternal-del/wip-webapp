---
id: task-0.3
title: "Create Mock Implementations for External Services"
status: "Done"
assignee: []
created_date: "2025-11-15"
completed_date: "2025-11-15"
labels: ["backend", "P0", "testing", "mocks", "infrastructure"]
milestone: "M0 - Pre-Development Setup"
dependencies: []
estimated_hours: 2
actual_hours: 2
---

## Description
Create mock implementations for all external services (Resend, Twilio, Claude AI, R2 storage) to unblock development of tasks 7.1, 8.1, 8.4, 9.1 without waiting for real API integration in M10. Mocks should mirror real API responses closely to ensure smooth transition to production services.

## Acceptance Criteria
- [x] Mock Resend email API implemented in `api/mocks/resend.ts`
- [x] Mock Twilio SMS API implemented in `api/mocks/twilio.ts`
- [x] Mock Claude AI API implemented in `api/mocks/claude.ts`
- [x] Mock R2 storage implemented in `api/mocks/r2.ts`
- [x] All mocks export consistent interface matching real services
- [x] Mocks log activity to console for debugging
- [x] Mocks store state in memory for testing (optional persistence in KV)
- [x] Environment variable to toggle between mock and real services
- [x] All mocks tested with sample calls
- [x] Documentation in `api/mocks/README.md` on how to use mocks

## Completion Notes

All mock services have been successfully implemented and are ready for use. Key achievements:

1. **Mock Services Created:**
   - `api/mocks/resend.ts` - Email service with template support and broadcast functionality
   - `api/mocks/twilio.ts` - SMS service with E.164 validation and rate limiting
   - `api/mocks/claude.ts` - AI service with pre-defined responses and daily limits
   - `api/mocks/r2.ts` - Storage service with quota tracking and upload flow

2. **Service Factory (`api/mocks/index.ts`):**
   - Centralized factory for getting mock or real services
   - Environment-based service selection via `USE_MOCKS` variable
   - Service status checking utilities
   - Graceful fallback to mocks when credentials missing

3. **Features Implemented:**
   - All mocks log operations to console for debugging
   - In-memory state tracking for testing
   - Consistent interfaces matching real service APIs
   - Input validation (email format, phone numbers, file sizes)
   - Quota enforcement (50GB per artist for R2, 50 prompts/day for AI)
   - Mock response generation for all service types

4. **Documentation:**
   - Comprehensive README.md with usage examples
   - API documentation for each mock service
   - Migration guide for M10 real service integration
   - Testing utilities and debugging tips

5. **Environment Configuration:**
   - Added `USE_MOCKS = "true"` to wrangler.toml
   - Defaults to mock mode for development
   - Easy toggle to real services in M10

**Tasks Unblocked:**
- Task 7.1 (File upload) - Can now use mock R2 storage
- Task 8.1 (Broadcasts) - Can now use mock email/SMS services
- Task 8.4 (AI content) - Can now use mock Claude AI service
- Task 9.1 (AI features) - Can now use mock Claude AI service

## Implementation Plan

### 1. Create Mock Resend Email API

**File:** `api/mocks/resend.ts`

**Interface:**
```typescript
export interface MockResendService {
  sendEmail(params: {
    to: string | string[];
    from: string;
    subject: string;
    html: string;
  }): Promise<{
    success: boolean;
    messageId: string;
    error?: string;
  }>;
}
```

**Implementation:**
- Accept email parameters
- Validate email addresses (basic format check)
- Log email to console:
  ```
  [MOCK RESEND] Email sent:
  To: artist@example.com
  From: noreply@umbrella.app
  Subject: Gig Booking Confirmation
  Body: [first 100 chars]...
  ```
- Store sent emails in memory array for testing
- Return mock success response with generated messageId
- Simulate rate limits if needed

### 2. Create Mock Twilio SMS API

**File:** `api/mocks/twilio.ts`

**Interface:**
```typescript
export interface MockTwilioService {
  sendSMS(params: {
    to: string;
    from: string;
    body: string;
  }): Promise<{
    success: boolean;
    sid: string;
    error?: string;
  }>;
}
```

**Implementation:**
- Accept SMS parameters
- Validate phone number format (basic check)
- Log SMS to console:
  ```
  [MOCK TWILIO] SMS sent:
  To: +1234567890
  From: +1987654321
  Body: Your gig booking has been confirmed!
  ```
- Store sent SMS in memory array for testing
- Return mock success response with generated SID
- Respect SMS length limits (160 chars, or segment)

### 3. Create Mock Claude AI API

**File:** `api/mocks/claude.ts`

**Interface:**
```typescript
export interface MockClaudeService {
  generateText(params: {
    prompt: string;
    maxTokens?: number;
    temperature?: number;
  }): Promise<{
    text: string;
    tokens: number;
    error?: string;
  }>;

  getUsage(): Promise<{
    tokensUsed: number;
    tokensLimit: number;
    promptsToday: number;
    promptsLimit: number;
  }>;
}
```

**Implementation:**
- Accept prompt and generation parameters
- Detect prompt type (bio, cover letter, EPK) using keyword matching
- Return pre-defined responses for common prompts:
  ```typescript
  const MOCK_RESPONSES = {
    bio: "This is a mock AI-generated artist bio...",
    cover_letter: "Dear Venue Manager, This is a mock AI-generated cover letter...",
    epk: "# Electronic Press Kit\n\nThis is a mock AI-generated EPK..."
  };
  ```
- Track token usage in memory (increment by 50-200 tokens per prompt)
- Enforce mock rate limits:
  - 25,000 tokens/month (per D-059)
  - 50 prompts/day (per D-062)
- Return mock response with text and token count
- Log AI generation to console:
  ```
  [MOCK CLAUDE] AI generation:
  Prompt: [first 50 chars]...
  Tokens: 150
  Response: [first 100 chars]...
  ```

### 4. Create Mock R2 Storage

**File:** `api/mocks/r2.ts`

**Interface:**
```typescript
export interface MockR2Service {
  generateSignedURL(params: {
    key: string;
    expiresIn: number;
    contentType: string;
    maxSize: number;
  }): Promise<{
    url: string;
    uploadId: string;
    error?: string;
  }>;

  confirmUpload(params: {
    uploadId: string;
    key: string;
    size: number;
  }): Promise<{
    success: boolean;
    fileUrl: string;
    error?: string;
  }>;

  deleteFile(key: string): Promise<{
    success: boolean;
    error?: string;
  }>;

  getQuotaUsage(artistId: string): Promise<{
    used: number;
    total: number;
    files: number;
  }>;
}
```

**Implementation:**
- **generateSignedURL:**
  - Generate mock signed URL: `mock://r2/upload/{uploadId}/{key}`
  - Store upload intent in memory with TTL (15 minutes)
  - Track reserved quota (for pessimistic locking in task-7.1)
  - Log upload request:
    ```
    [MOCK R2] Signed URL generated:
    Key: artist_123/track_audio.mp3
    Upload ID: upload_abc123
    Max Size: 50MB
    Expires: 15 minutes
    ```

- **confirmUpload:**
  - Remove upload intent from memory
  - Add file to mock storage (track metadata in memory)
  - Update artist's quota usage
  - Return mock file URL: `mock://r2/files/{key}`
  - Log confirmation:
    ```
    [MOCK R2] Upload confirmed:
    Upload ID: upload_abc123
    Key: artist_123/track_audio.mp3
    Size: 5.2 MB
    Artist quota: 5.2 MB / 50 GB
    ```

- **deleteFile:**
  - Remove file from mock storage
  - Decrease artist's quota usage
  - Log deletion:
    ```
    [MOCK R2] File deleted:
    Key: artist_123/track_audio.mp3
    Size freed: 5.2 MB
    ```

- **getQuotaUsage:**
  - Calculate total size of all files for artist
  - Return usage stats:
    ```json
    {
      "used": 5242880,  // bytes
      "total": 53687091200,  // 50 GB
      "files": 3
    }
    ```

### 5. Create Mock Service Factory

**File:** `api/mocks/index.ts`

**Purpose:** Centralized factory to provide mocks or real services based on environment

**Implementation:**
```typescript
import { MockResendService } from './resend';
import { MockTwilioService } from './twilio';
import { MockClaudeService } from './claude';
import { MockR2Service } from './r2';

// Real service imports (when available)
// import { RealResendService } from '../services/resend';
// etc.

export function getEmailService(env: Env) {
  if (env.USE_MOCKS === 'true') {
    return new MockResendService();
  }
  // return new RealResendService(env.RESEND_API_KEY);
  return new MockResendService(); // Default to mock until M10
}

export function getSMSService(env: Env) {
  if (env.USE_MOCKS === 'true') {
    return new MockTwilioService();
  }
  // return new RealTwilioService(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
  return new MockTwilioService(); // Default to mock until M10
}

export function getAIService(env: Env) {
  if (env.USE_MOCKS === 'true') {
    return new MockClaudeService();
  }
  // return new RealClaudeService(env.ANTHROPIC_API_KEY);
  return new MockClaudeService(); // Default to mock until M10
}

export function getStorageService(env: Env) {
  if (env.USE_MOCKS === 'true') {
    return new MockR2Service();
  }
  // return new RealR2Service(env.R2_BUCKET);
  return new MockR2Service(); // Default to mock until M10
}
```

### 6. Create Documentation

**File:** `api/mocks/README.md`

**Content:**
- Purpose of mocks
- How to use each mock service
- How to toggle between mocks and real services
- Mock limitations vs real services
- When mocks will be replaced (M10)

### 7. Testing

Test each mock with sample calls:
```typescript
// Test email mock
const emailService = getEmailService(env);
await emailService.sendEmail({
  to: 'test@example.com',
  from: 'noreply@umbrella.app',
  subject: 'Test Email',
  html: '<p>Test body</p>'
});

// Test SMS mock
const smsService = getSMSService(env);
await smsService.sendSMS({
  to: '+1234567890',
  from: '+1987654321',
  body: 'Test SMS'
});

// Test AI mock
const aiService = getAIService(env);
await aiService.generateText({
  prompt: 'Write an artist bio for a jazz musician',
  maxTokens: 500
});

// Test R2 mock
const storageService = getStorageService(env);
const { url, uploadId } = await storageService.generateSignedURL({
  key: 'test/file.mp3',
  expiresIn: 900,
  contentType: 'audio/mpeg',
  maxSize: 50 * 1024 * 1024
});
await storageService.confirmUpload({
  uploadId,
  key: 'test/file.mp3',
  size: 5 * 1024 * 1024
});
```

## Notes & Comments
**References:**
- docs/initial-spec/eng-spec.md - External service requirements
- api/services/ directory - Where real services will be implemented
- task-10.7 - Real external service integration (M10)

**Priority:** P0 - UNBLOCKS tasks 7.1, 8.1, 8.4, 9.1
**File:** api/mocks/*.ts
**Dependencies:** None (can run in parallel with task-0.1 and task-0.2)
**Unblocks:** File upload (task-7.1), broadcasts (task-8.1), AI generation (task-8.4, 9.1)

**CRITICAL:** Without mocks, development of M7-M9 features is blocked until M10 when real services are configured. Mocks enable immediate development and testing.

**Why This Task Exists:**
Identified in REFINEMENT_REPORT_pt2.md Issue #4 - The backlog says tasks 7.1, 8.1, 8.4, 9.1 "can use mocked responses initially," but no task defines what those mocks are or who creates them. This blocks development of advanced features until task-10.7 in M10, delaying visual progress.

## Environment Variable Configuration

Add to `wrangler.toml`:
```toml
[vars]
USE_MOCKS = "true"  # Set to "false" in M10 after real services configured
```

## Migration to Real Services (M10)

When task-10.7 is complete:
1. Implement real service classes matching mock interfaces
2. Update service factory to use real services when `USE_MOCKS = "false"`
3. Test each real service thoroughly
4. Gradually migrate: Test one service at a time
5. Keep mocks available for development environment

## Mock vs Real Service Feature Parity

| Feature | Mock | Real (M10) |
|---------|------|------------|
| Email sending | ✅ (logs to console) | ✅ (real delivery) |
| SMS sending | ✅ (logs to console) | ✅ (real delivery) |
| AI generation | ✅ (pre-defined responses) | ✅ (real Claude API) |
| File storage | ✅ (in-memory) | ✅ (R2 bucket) |
| Quota tracking | ✅ (in-memory) | ✅ (D1 + R2) |
| Rate limiting | ✅ (mock limits) | ✅ (real limits) |
