# PRD: Connect Real Twilio SMS Service

**Document Version:** 1.0  
**Created:** 2025-11-22  
**Target Branch:** `feature/connect-real-sms-service`  
**Estimated Effort:** 4-6 hours  
**Priority:** High (Required for production)

---

## 📋 Executive Summary

**Objective:** Connect the existing real Twilio SMS service implementation to the service factory, enabling production SMS delivery when `USE_MOCKS = "false"` and Twilio credentials are configured.

**Current State:** Real Twilio service code exists at `api/services/twilio.ts` but is not connected. The factory (`api/mocks/index.ts`) always returns mock service regardless of environment configuration.

**Success Criteria:** 
- Real SMS service is used in production when configured
- Mock service continues to work in development/preview
- All existing tests pass
- New tests verify real service integration
- Documentation updated

---

## 🎯 Context & Background

### Current Architecture

The codebase uses a service factory pattern to switch between mock and real services:

```
api/mocks/index.ts (Factory)
    ├── getEmailService(env) → Returns MockResendService or ResendEmailService
    ├── getSMSService(env) → Currently always returns MockTwilioService
    ├── getAIService(env) → Currently always returns MockClaudeService
    └── getStorageService(env) → Currently always returns MockR2Service
```

### Existing Code

**Real Service:** `api/services/twilio.ts`
- ✅ Fully implemented `TwilioSMSService` class
- ✅ Real Twilio API integration
- ✅ Rate limiting (10 messages/second)
- ✅ Retry logic with exponential backoff
- ✅ Failed SMS queue system
- ✅ Delivery logging to database
- ✅ Phone number validation (E.164 format)
- ✅ Message length validation (1600 char limit)
- ✅ Broadcast SMS support

**Mock Service:** `api/mocks/twilio.ts`
- ✅ Fully implemented `MockTwilioService` class
- ✅ Console logging
- ✅ In-memory storage (last 100 SMS)
- ✅ Same interface as real service
- ✅ Phone number validation
- ✅ Message length validation

**Factory:** `api/mocks/index.ts`
- ⚠️ `getSMSService()` always returns mock (lines 58-78)
- ⚠️ Real service import is commented out (line 13)
- ⚠️ Real service instantiation is commented out (lines 67-73)

### Environment Configuration

**Development/Preview:**
```toml
USE_MOCKS = "true"
ENVIRONMENT = "development" or "preview"
```

**Production:**
```toml
USE_MOCKS = "false"
ENVIRONMENT = "production"
TWILIO_ACCOUNT_SID = "<secret>"  # Set via wrangler secret put
TWILIO_AUTH_TOKEN = "<secret>"   # Set via wrangler secret put
TWILIO_PHONE_NUMBER = "<secret>" # Set via wrangler secret put
```

---

## 📐 Requirements

### Functional Requirements

1. **FR1: Service Factory Logic**
   - Factory must check `USE_MOCKS` environment variable
   - Factory must check for `TWILIO_ACCOUNT_SID` secret
   - Factory must check for `TWILIO_AUTH_TOKEN` secret
   - Factory must check for `TWILIO_PHONE_NUMBER` secret (optional, has default)
   - Factory must check for `DB` binding
   - Return real service when: `USE_MOCKS = "false"` AND all Twilio secrets exist AND `DB` exists
   - Return mock service otherwise (backward compatible)

2. **FR2: Type Safety**
   - Factory return type must support both mock and real service interfaces
   - Create union type or interface that both services implement
   - Ensure type compatibility across codebase

3. **FR3: Error Handling**
   - Graceful fallback to mock if real service initialization fails
   - Log errors clearly for debugging
   - Don't break application if real service unavailable

4. **FR4: Backward Compatibility**
   - All existing code using SMS service must continue working
   - Mock service must remain default for development
   - No breaking changes to service interface

5. **FR5: Rate Limiting**
   - Real service must enforce 10 messages/second rate limit
   - Rate limiter must work correctly in production
   - Queue system must handle rate limit exceeded scenarios

### Non-Functional Requirements

1. **NFR1: Performance**
   - Service initialization must be fast (< 10ms)
   - Rate limiting must not cause significant delays
   - No performance degradation vs current mock

2. **NFR2: Reliability**
   - Real service must handle API failures gracefully
   - Retry logic must work as designed
   - Failed SMS must be queued properly
   - Rate limit exceeded must be handled correctly

3. **NFR3: Observability**
   - Log which service is being used (mock vs real)
   - Log SMS delivery attempts
   - Track success/failure rates
   - Monitor rate limit usage

4. **NFR4: Security**
   - API credentials must never be logged
   - Credentials must only be accessed from environment
   - Follow existing secret management patterns

---

## 🔧 Technical Specifications

### Service Interface

Both mock and real services implement the same interface:

```typescript
interface SMSService {
  sendSMS(params: SMSParams): Promise<ServiceResult<SMSResult>>
  sendBroadcast(params: BroadcastSMSParams): Promise<BroadcastResult>
  sendBookingConfirmation(
    to: string,
    data: { gigTitle: string; date: string; location: string; rate: number },
    artistId: string
  ): Promise<ServiceResult<SMSResult>>
  processQueue(): Promise<number>
  getDeliveryStats(artistId: string, days?: number): Promise<{
    totalSent: number
    successCount: number
    failureCount: number
  }>
}
```

### Factory Function Signature

```typescript
export function getSMSService(env: Env): SMSService {
  // Implementation here
}
```

### Environment Interface

```typescript
export interface Env {
  USE_MOCKS?: string
  TWILIO_ACCOUNT_SID?: string
  TWILIO_AUTH_TOKEN?: string
  TWILIO_FROM_PHONE?: string
  DB?: D1Database
  // ... other env vars
}
```

### Rate Limiting

The real service implements a token bucket rate limiter:
- Max tokens: 10 (messages per second)
- Refill rate: 10 tokens per 1000ms
- Blocks until token available

---

## 🖥️ Claude Code Environment Setup

### Required Environment for Implementation

To implement this feature end-to-end, Claude Code requires the following environment configuration:

#### 1. **Twilio API Access (Optional for Testing)**
- **Twilio Account:** Optional - can use mock API responses for testing
- **API Credentials:** Not required for implementation (can use placeholders for tests)
- **Documentation Access:** https://www.twilio.com/docs for API reference

#### 2. **Local Development Environment**
- **Node.js:** Version 20.0.0 or higher
- **npm:** Version 10.0.0 or higher
- **TypeScript:** Installed and configured (already in project)
- **Git:** For version control and branch management

#### 3. **Project Dependencies**
- **All npm packages installed:** `npm install` completed
- **twilio:** Already in dependencies (v5.10.5)
- **TypeScript compilation:** `npm run type-check` passes
- **Local D1 Database:** Configured and accessible for testing
- **Wrangler dev environment:** Can run `wrangler dev` successfully

#### 4. **Required Secrets & Configuration**
- **No secrets required for implementation** (can use mock API responses)
- **Environment variables:** `USE_MOCKS` can be toggled for testing
- **Twilio Credentials:** Verify env var names (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_PHONE`)

#### 5. **Testing Environment**
- **Vitest:** Configured and working (`npm run test` works)
- **Mock Fetch:** Can mock `global.fetch` for API calls in tests
- **D1 Database:** Local database available for delivery tracking tests
- **Mock API Responses:** Can simulate Twilio API responses for testing
- **Rate Limiter Testing:** Can test rate limiting logic without real API calls

#### 6. **Code Access**
- **Full codebase access:** All files in `wip-webapp/` directory
- **Read access to:**
  - `api/services/twilio.ts` (real service implementation)
  - `api/mocks/twilio.ts` (mock service interface)
  - `api/mocks/index.ts` (service factory)
  - `wrangler.toml` (environment configuration)
- **Write access to:**
  - `api/mocks/index.ts` (factory updates)
  - Test files (new test files to create)

#### 7. **External Resources**
- **Twilio API Documentation:** https://www.twilio.com/docs
- **Twilio SMS API Reference:** For understanding request/response format
- **Existing Service Code:** Review `api/services/twilio.ts` for rate limiter implementation

### Environment Verification Checklist

Before starting implementation, verify:
- [ ] `npm run type-check` passes without errors
- [ ] `npm run test` runs successfully
- [ ] Local D1 database is accessible
- [ ] Can read `api/services/twilio.ts` and understand rate limiter
- [ ] Can verify Twilio env var names in `wrangler.toml`
- [ ] Git branch can be created (`feature/connect-real-sms-service`)

### Implementation Workflow

1. **Update Factory Imports:** Uncomment real service import
2. **Create Union Type:** Add type alias for service interface
3. **Update Factory Logic:** Implement conditional service selection with credential checks
4. **Handle Default Phone Number:** Use fallback if `TWILIO_FROM_PHONE` not provided
5. **Update Service Status:** Modify status function to reflect SMS service
6. **Write Tests:** Create comprehensive test suite (can mock API calls)
7. **Test Rate Limiting:** Verify rate limiter works correctly
8. **Verify:** Run all tests and type checks

### Testing Strategy

- **Unit Tests:** Mock the `createTwilioService` function to verify factory logic
- **Integration Tests:** Mock `global.fetch` to simulate Twilio API responses
- **Rate Limiting Tests:** Test rate limiter logic without real API calls
- **No Real API Calls Required:** All tests can use mocked responses to avoid costs

---

## 🛠️ Implementation Steps

### Step 1: Update Service Factory Imports

**File:** `api/mocks/index.ts`

**Action:**
1. Uncomment real service import (line 13)
2. Import the factory function: `createTwilioService`

**Code Change:**
```typescript
// BEFORE (line 13):
// import { TwilioSMSService, createTwilioService } from '../services/twilio'

// AFTER:
import { TwilioSMSService, createTwilioService } from '../services/twilio'
```

### Step 2: Create Union Type for Service Interface

**File:** `api/mocks/index.ts`

**Action:**
Add type alias after imports to support both services:

```typescript
// Add after line 15 (after real service imports)
/**
 * Union type for SMS service (supports both mock and real)
 */
type SMSService = MockTwilioService | TwilioSMSService
```

### Step 3: Update Factory Function Logic

**File:** `api/mocks/index.ts`

**Action:**
Replace `getSMSService()` function (lines 58-78) with new implementation:

```typescript
/**
 * Get SMS service (mock or real based on environment)
 * @param env - Environment variables
 * @returns SMS service instance (mock or real)
 */
export function getSMSService(env: Env): SMSService {
  const useMocks = env.USE_MOCKS === 'true' || env.USE_MOCKS === undefined
  
  // Check if we should use real service
  const hasRequiredSecrets = env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN
  const shouldUseReal = !useMocks && hasRequiredSecrets && env.DB
  
  if (shouldUseReal) {
    try {
      console.log('[SERVICE FACTORY] Using real Twilio SMS service')
      return createTwilioService(
        env.TWILIO_ACCOUNT_SID!,
        env.TWILIO_AUTH_TOKEN!,
        env.TWILIO_FROM_PHONE || '+15555551234', // Default fallback
        env.DB!
      )
    } catch (error) {
      console.error('[SERVICE FACTORY] Failed to initialize real SMS service, falling back to mock:', error)
      return createMockTwilioService(env.TWILIO_FROM_PHONE)
    }
  }
  
  // Default to mock for development/preview or if real service unavailable
  console.log('[SERVICE FACTORY] Using mock SMS service')
  return createMockTwilioService(env.TWILIO_FROM_PHONE)
}
```

### Step 4: Update Service Status Function

**File:** `api/mocks/index.ts`

**Action:**
Update `getServiceStatus()` function (lines 136-156) to accurately reflect SMS service status:

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
  
  // Check if real SMS service would be used
  const hasRequiredSecrets = env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN
  const smsService = !mockMode && hasRequiredSecrets && env.DB ? 'real' : 'mock'
  
  return {
    mockMode,
    services: {
      email: mockMode || !env.RESEND_API_KEY ? 'mock' : 'real',
      sms: smsService,
      ai: mockMode || !env.ANTHROPIC_API_KEY ? 'mock' : 'real',
      storage: mockMode || !env.BUCKET ? 'mock' : 'real',
    },
  }
}
```

### Step 5: Verify Type Compatibility

**Action:**
1. Run TypeScript type check: `npm run type-check`
2. Ensure no type errors introduced
3. Verify all usages of `getSMSService()` still type-check correctly

**Files to Check:**
- `api/utils/sms.ts` (if exists)
- Any controllers using SMS service
- Any other files importing `getSMSService`

---

## 🧪 Testing Requirements

### Unit Tests

**File:** `tests/unit/services/sms-service.test.ts` (create new file)

**Test Cases:**

1. **Factory Returns Mock by Default**
   ```typescript
   test('getSMSService returns mock when USE_MOCKS is true', () => {
     const env = { USE_MOCKS: 'true' }
     const service = getSMSService(env)
     expect(service).toBeInstanceOf(MockTwilioService)
   })
   ```

2. **Factory Returns Mock when USE_MOCKS is undefined**
   ```typescript
   test('getSMSService returns mock when USE_MOCKS is undefined', () => {
     const env = {}
     const service = getSMSService(env)
     expect(service).toBeInstanceOf(MockTwilioService)
   })
   ```

3. **Factory Returns Real Service when Configured**
   ```typescript
   test('getSMSService returns real service when configured', () => {
     const mockDb = createMockD1Database()
     const env = {
       USE_MOCKS: 'false',
       TWILIO_ACCOUNT_SID: 'test_sid',
       TWILIO_AUTH_TOKEN: 'test_token',
       TWILIO_FROM_PHONE: '+1234567890',
       DB: mockDb,
     }
     const service = getSMSService(env)
     expect(service).toBeInstanceOf(TwilioSMSService)
   })
   ```

4. **Factory Uses Default Phone Number**
   ```typescript
   test('getSMSService uses default phone number when not provided', () => {
     const mockDb = createMockD1Database()
     const env = {
       USE_MOCKS: 'false',
       TWILIO_ACCOUNT_SID: 'test_sid',
       TWILIO_AUTH_TOKEN: 'test_token',
       // TWILIO_FROM_PHONE not provided
       DB: mockDb,
     }
     const service = getSMSService(env)
     expect(service).toBeInstanceOf(TwilioSMSService)
     // Verify default phone number is used
   })
   ```

5. **Factory Falls Back to Mock on Error**
   ```typescript
   test('getSMSService falls back to mock if real service fails', () => {
     const env = {
       USE_MOCKS: 'false',
       TWILIO_ACCOUNT_SID: 'test_sid',
       TWILIO_AUTH_TOKEN: 'test_token',
       DB: null, // Missing DB should cause fallback
     }
     const service = getSMSService(env)
     expect(service).toBeInstanceOf(MockTwilioService)
   })
   ```

6. **Factory Requires Both Account SID and Auth Token**
   ```typescript
   test('getSMSService requires both TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN', () => {
     const mockDb = createMockD1Database()
     const env1 = {
       USE_MOCKS: 'false',
       TWILIO_ACCOUNT_SID: 'test_sid',
       // Missing TWILIO_AUTH_TOKEN
       DB: mockDb,
     }
     const service1 = getSMSService(env1)
     expect(service1).toBeInstanceOf(MockTwilioService)
     
     const env2 = {
       USE_MOCKS: 'false',
       // Missing TWILIO_ACCOUNT_SID
       TWILIO_AUTH_TOKEN: 'test_token',
       DB: mockDb,
     }
     const service2 = getSMSService(env2)
     expect(service2).toBeInstanceOf(MockTwilioService)
   })
   ```

7. **Service Status Reports Correctly**
   ```typescript
   test('getServiceStatus reports SMS service correctly', () => {
     const mockDb = createMockD1Database()
     const env = {
       USE_MOCKS: 'false',
       TWILIO_ACCOUNT_SID: 'test_sid',
       TWILIO_AUTH_TOKEN: 'test_token',
       DB: mockDb,
     }
     const status = getServiceStatus(env)
     expect(status.services.sms).toBe('real')
   })
   ```

### Integration Tests

**File:** `tests/integration/sms-service.test.ts` (create new file)

**Test Cases:**

1. **Real Service Sends SMS (with mocked API)**
   ```typescript
   test('real service sends SMS via Twilio API', async () => {
     // Mock fetch to simulate Twilio API
     global.fetch = vi.fn().mockResolvedValue({
       ok: true,
       json: async () => ({ 
         sid: 'SM1234567890abcdef',
         status: 'queued',
       }),
     })
     
     const mockDb = createMockD1Database()
     const service = createTwilioService('test_sid', 'test_token', '+1234567890', mockDb)
     const result = await service.sendSMS({
       to: '+1987654321',
       message: 'Test message',
       messageType: 'booking_confirmation',
     })
     
     expect(result.success).toBe(true)
     expect(global.fetch).toHaveBeenCalledWith(
       expect.stringContaining('api.twilio.com'),
       expect.objectContaining({
         method: 'POST',
         headers: expect.objectContaining({
           Authorization: expect.stringContaining('Basic'),
         }),
       })
     )
   })
   ```

2. **Phone Number Validation**
   ```typescript
   test('real service validates phone number format', async () => {
     const mockDb = createMockD1Database()
     const service = createTwilioService('test_sid', 'test_token', '+1234567890', mockDb)
     
     // Invalid phone number
     const result = await service.sendSMS({
       to: 'invalid-phone',
       message: 'Test',
     })
     
     expect(result.success).toBe(false)
     expect(result.error?.code).toBe('INVALID_PHONE')
   })
   ```

3. **Message Length Validation**
   ```typescript
   test('real service validates message length', async () => {
     const mockDb = createMockD1Database()
     const service = createTwilioService('test_sid', 'test_token', '+1234567890', mockDb)
     
     // Message too long (over 1600 chars)
     const longMessage = 'x'.repeat(1601)
     const result = await service.sendSMS({
       to: '+1987654321',
       message: longMessage,
     })
     
     expect(result.success).toBe(false)
     expect(result.error?.code).toBe('MESSAGE_TOO_LONG')
   })
   ```

4. **Failed SMS is Queued**
   ```typescript
   test('failed SMS is added to retry queue', async () => {
     // Mock API failure
     global.fetch = vi.fn().mockResolvedValue({
       ok: false,
       status: 500,
       json: async () => ({ message: 'Internal error' }),
     })
     
     const mockDb = createMockD1Database()
     const service = createTwilioService('test_sid', 'test_token', '+1234567890', mockDb)
     const result = await service.sendSMS({
       to: '+1987654321',
       message: 'Test',
     })
     
     expect(result.success).toBe(false)
     // Verify SMS was queued in database
     const queueItems = await mockDb.prepare('SELECT * FROM sms_delivery_queue').all()
     expect(queueItems.results.length).toBeGreaterThan(0)
   })
   ```

5. **Rate Limiting Works**
   ```typescript
   test('rate limiting enforces 10 messages per second', async () => {
     global.fetch = vi.fn().mockResolvedValue({
       ok: true,
       json: async () => ({ sid: 'SM123', status: 'queued' }),
     })
     
     const mockDb = createMockD1Database()
     const service = createTwilioService('test_sid', 'test_token', '+1234567890', mockDb)
     
     const startTime = Date.now()
     
     // Send 15 messages (should take at least 1.5 seconds due to rate limit)
     const promises = Array.from({ length: 15 }, (_, i) =>
       service.sendSMS({
         to: `+198765432${i}`,
         message: `Test ${i}`,
       })
     )
     
     await Promise.all(promises)
     const endTime = Date.now()
     const duration = endTime - startTime
     
     // Should take at least 1.4 seconds (15 messages / 10 per second)
     expect(duration).toBeGreaterThanOrEqual(1400)
   })
   ```

6. **Broadcast SMS Works**
   ```typescript
   test('broadcast SMS sends to multiple recipients', async () => {
     global.fetch = vi.fn().mockResolvedValue({
       ok: true,
       json: async () => ({ sid: 'SM123', status: 'queued' }),
     })
     
     const mockDb = createMockD1Database()
     const service = createTwilioService('test_sid', 'test_token', '+1234567890', mockDb)
     
     const result = await service.sendBroadcast({
       recipients: ['+1987654321', '+1987654322', '+1987654323'],
       message: 'Broadcast message',
       artistId: 'artist_123',
     })
     
     expect(result.totalRecipients).toBe(3)
     expect(result.successCount).toBe(3)
     expect(global.fetch).toHaveBeenCalledTimes(3)
   })
   ```

### E2E Tests

**File:** `tests/e2e/sms-delivery.test.ts` (create new file)

**Test Cases:**

1. **SMS Delivery Flow**
   ```typescript
   test('complete SMS delivery flow', async () => {
     // Setup: Create user, configure real service
     // Action: Trigger SMS send (e.g., booking confirmation)
     // Verify: SMS logged in database, delivery status tracked
   })
   ```

2. **Booking Confirmation SMS**
   ```typescript
   test('booking confirmation sends SMS', async () => {
     // Setup: Create booking
     // Action: Send booking confirmation SMS
     // Verify: SMS sent with correct message format
   })
   ```

### Test Setup

**File:** `tests/helpers/mock-env.ts` (update if exists)

**Add helper functions:**
```typescript
export function createSMSServiceEnv(useMocks: boolean = true, hasSecrets: boolean = false) {
  return {
    USE_MOCKS: useMocks ? 'true' : 'false',
    TWILIO_ACCOUNT_SID: hasSecrets ? 'test_account_sid' : undefined,
    TWILIO_AUTH_TOKEN: hasSecrets ? 'test_auth_token' : undefined,
    TWILIO_FROM_PHONE: hasSecrets ? '+1234567890' : undefined,
    DB: createMockD1Database(),
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

### Documentation

- Add JSDoc comments to new/changed functions
- Update inline comments where logic changes
- Document any breaking changes (none expected)

---

## 🔍 Error Handling

### Factory Errors

**Scenario:** Real service initialization fails

**Handling:**
```typescript
try {
  return createTwilioService(...)
} catch (error) {
  console.error('[SERVICE FACTORY] Failed to initialize real SMS service, falling back to mock:', error)
  return createMockTwilioService(env.TWILIO_FROM_PHONE)
}
```

### Service Errors

The real service already handles:
- API failures (retry logic)
- Invalid credentials (caught by fetch)
- Database errors (caught by D1 operations)
- Network timeouts (handled by retry helper)
- Rate limit exceeded (handled by rate limiter)
- Invalid phone numbers (validation before API call)
- Message too long (validation before API call)

**No additional error handling needed** - existing implementation is sufficient.

---

## 📚 Documentation Updates

### Files to Update

1. **`api/mocks/README.md`**
   - Update "How to toggle between mocks and real services" section
   - Add example of enabling real SMS service
   - Document environment variables needed
   - Document rate limiting behavior

2. **`SERVICES_STATUS_REPORT.md`**
   - Update SMS service status to "Real Service Connected"
   - Update action items

3. **`PRODUCTION_SETUP.md`** (if exists)
   - Verify Twilio setup instructions are accurate
   - Add troubleshooting section
   - Document rate limits

### New Documentation

**File:** `docs/SMS_SERVICE.md` (create if doesn't exist)

**Content:**
- How SMS service works
- Mock vs real service differences
- Configuration guide
- Rate limiting details
- Phone number format requirements
- Message length limits
- Troubleshooting common issues
- Twilio API rate limits and quotas

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

### No Changes Needed

The CI/CD pipeline doesn't need updates - it will automatically test the changes.

---

## 🌿 Branch & PR Guidelines

### Branch Naming

**Branch:** `feature/connect-real-sms-service`

**Naming Convention:** `feature/<descriptive-name>`

### PR Title

**Title:** `feat(services): connect real Twilio SMS service to factory`

### PR Description Template

```markdown
## Summary
Connects the existing real Twilio SMS service implementation to the service factory, enabling production SMS delivery.

## Changes
- Updated `api/mocks/index.ts` to conditionally return real service
- Added union type for SMS service interface
- Updated service status function
- Added comprehensive tests including rate limiting

## Testing
- [x] Unit tests added and passing
- [x] Integration tests added and passing (including rate limiting)
- [x] E2E tests added and passing
- [x] All existing tests still pass
- [x] TypeScript compilation succeeds
- [x] Linting passes

## Checklist
- [x] Code follows existing patterns
- [x] Tests added for new functionality
- [x] Rate limiting tested
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

---

## ✅ Acceptance Criteria

### Must Have

- [ ] Factory returns real service when `USE_MOCKS = "false"` and Twilio secrets exist
- [ ] Factory returns mock service by default (backward compatible)
- [ ] Factory requires both `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN`
- [ ] Factory uses default phone number when `TWILIO_FROM_PHONE` not provided
- [ ] All existing tests pass
- [ ] New unit tests added and passing
- [ ] New integration tests added and passing (including rate limiting)
- [ ] TypeScript compilation succeeds
- [ ] ESLint passes
- [ ] Prettier formatting passes
- [ ] Documentation updated

### Should Have

- [ ] E2E tests added
- [ ] Error handling tested
- [ ] Service status function updated
- [ ] Logging added for service selection
- [ ] Rate limiting thoroughly tested

### Nice to Have

- [ ] Performance benchmarks
- [ ] Additional error scenarios tested
- [ ] Monitoring/metrics integration
- [ ] Rate limit monitoring

---

## 🔗 Related Files

### Files to Modify

1. `api/mocks/index.ts` - Service factory (main changes)
2. `tests/unit/services/sms-service.test.ts` - Unit tests (new)
3. `tests/integration/sms-service.test.ts` - Integration tests (new)
4. `tests/e2e/sms-delivery.test.ts` - E2E tests (new)
5. `api/mocks/README.md` - Documentation (update)
6. `SERVICES_STATUS_REPORT.md` - Status report (update)

### Files to Reference

1. `api/services/twilio.ts` - Real service implementation
2. `api/mocks/twilio.ts` - Mock service implementation
3. `api/services/types.ts` - Service type definitions
4. `.github/workflows/ci-cd.yml` - CI/CD pipeline
5. `wrangler.toml` - Environment configuration

---

## 🎓 Implementation Notes

### Key Considerations

1. **Backward Compatibility:** Must not break existing code using SMS service
2. **Type Safety:** Union type ensures both services are compatible
3. **Error Handling:** Graceful fallback prevents application crashes
4. **Rate Limiting:** Critical feature that must work correctly
5. **Testing:** Comprehensive tests ensure reliability, especially rate limiting
6. **Documentation:** Clear docs help future maintainers

### Common Pitfalls to Avoid

1. ❌ Don't remove mock service - it's still needed for development
2. ❌ Don't hardcode credentials - use environment variables
3. ❌ Don't skip error handling - always fallback to mock
4. ❌ Don't forget to update service status function
5. ❌ Don't break existing tests - ensure backward compatibility
6. ❌ Don't forget to test rate limiting - it's a critical feature
7. ❌ Don't skip phone number validation tests

### Success Indicators

- ✅ All tests pass
- ✅ TypeScript compiles without errors
- ✅ Real service works in production environment
- ✅ Mock service still works in development
- ✅ Rate limiting works correctly
- ✅ No breaking changes
- ✅ Documentation is clear and accurate

---

## 📞 Support & Questions

If you encounter issues during implementation:

1. **Check existing code patterns** in `api/mocks/index.ts` for email service (already connected)
2. **Review real service implementation** in `api/services/twilio.ts`
3. **Check test patterns** in `tests/unit/` and `tests/integration/`
4. **Refer to documentation** in `api/mocks/README.md`
5. **Review rate limiting implementation** in `api/services/twilio.ts` (RateLimiter class)

---

**End of PRD**

