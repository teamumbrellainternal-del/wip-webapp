# PRD: Connect Real Resend Email Service

**Document Version:** 1.0  
**Created:** 2025-11-22  
**Target Branch:** `feature/connect-real-email-service`  
**Estimated Effort:** 4-6 hours  
**Priority:** High (Required for production)

---

## 📋 Executive Summary

**Objective:** Connect the existing real Resend email service implementation to the service factory, enabling production email delivery when `USE_MOCKS = "false"` and `RESEND_API_KEY` is configured.

**Current State:** Real Resend service code exists at `api/services/resend.ts` but is not connected. The factory (`api/mocks/index.ts`) always returns mock service regardless of environment configuration.

**Success Criteria:** 
- Real email service is used in production when configured
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
    ├── getEmailService(env) → Currently always returns MockResendService
    ├── getSMSService(env) → Currently always returns MockTwilioService
    ├── getAIService(env) → Currently always returns MockClaudeService
    └── getStorageService(env) → Currently always returns MockR2Service
```

### Existing Code

**Real Service:** `api/services/resend.ts`
- ✅ Fully implemented `ResendEmailService` class
- ✅ Real Resend API integration
- ✅ Retry logic with exponential backoff
- ✅ Failed email queue system
- ✅ Delivery logging to database
- ✅ Unsubscribe list management
- ✅ Broadcast batching (1000 recipients/batch)
- ✅ Email template rendering

**Mock Service:** `api/mocks/resend.ts`
- ✅ Fully implemented `MockResendService` class
- ✅ Console logging
- ✅ In-memory storage (last 100 emails)
- ✅ Same interface as real service

**Factory:** `api/mocks/index.ts`
- ⚠️ `getEmailService()` always returns mock (lines 36-50)
- ⚠️ Real service import is commented out (line 12)
- ⚠️ Real service instantiation is commented out (lines 44-46)

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
RESEND_API_KEY = "<secret>"  # Set via wrangler secret put
```

---

## 📐 Requirements

### Functional Requirements

1. **FR1: Service Factory Logic**
   - Factory must check `USE_MOCKS` environment variable
   - Factory must check for `RESEND_API_KEY` secret
   - Factory must check for `DB` binding
   - Return real service when: `USE_MOCKS = "false"` AND `RESEND_API_KEY` exists AND `DB` exists
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
   - All existing code using email service must continue working
   - Mock service must remain default for development
   - No breaking changes to service interface

### Non-Functional Requirements

1. **NFR1: Performance**
   - Service initialization must be fast (< 10ms)
   - No performance degradation vs current mock

2. **NFR2: Reliability**
   - Real service must handle API failures gracefully
   - Retry logic must work as designed
   - Failed emails must be queued properly

3. **NFR3: Observability**
   - Log which service is being used (mock vs real)
   - Log email delivery attempts
   - Track success/failure rates

4. **NFR4: Security**
   - API key must never be logged
   - API key must only be accessed from environment
   - Follow existing secret management patterns

---

## 🔧 Technical Specifications

### Service Interface

Both mock and real services implement the same interface:

```typescript
interface EmailService {
  sendEmail(params: EmailParams): Promise<ServiceResult<EmailResult>>
  sendBroadcast(params: BroadcastEmailParams): Promise<BroadcastResult>
  sendTransactional(
    template: EmailTemplate,
    to: string,
    data: Record<string, any>,
    artistId?: string
  ): Promise<ServiceResult<EmailResult>>
  processQueue(): Promise<number>
  unsubscribe(email: string, artistId?: string, reason?: string): Promise<void>
}
```

### Factory Function Signature

```typescript
export function getEmailService(env: Env): EmailService {
  // Implementation here
}
```

### Environment Interface

```typescript
export interface Env {
  USE_MOCKS?: string
  RESEND_API_KEY?: string
  DB?: D1Database
  // ... other env vars
}
```

---

## 🖥️ Claude Code Environment Setup

### Required Environment for Implementation

To implement this feature end-to-end, Claude Code requires the following environment configuration:

#### 1. **Resend API Access (Optional for Testing)**
- **Resend Account:** Optional - can use mock API responses for testing
- **API Key:** Not required for implementation (can use placeholder for tests)
- **Documentation Access:** https://resend.com/docs for API reference

#### 2. **Local Development Environment**
- **Node.js:** Version 20.0.0 or higher
- **npm:** Version 10.0.0 or higher
- **TypeScript:** Installed and configured (already in project)
- **Git:** For version control and branch management

#### 3. **Project Dependencies**
- **All npm packages installed:** `npm install` completed
- **resend:** Already in dependencies (v6.4.2)
- **TypeScript compilation:** `npm run type-check` passes
- **Local D1 Database:** Configured and accessible for testing
- **Wrangler dev environment:** Can run `wrangler dev` successfully

#### 4. **Required Secrets & Configuration**
- **No secrets required for implementation** (can use mock API responses)
- **Environment variables:** `USE_MOCKS` can be toggled for testing
- **Resend API Key:** Verify env var name (`RESEND_API_KEY`)

#### 5. **Testing Environment**
- **Vitest:** Configured and working (`npm run test` works)
- **Mock Fetch:** Can mock `global.fetch` for API calls in tests
- **D1 Database:** Local database available for delivery tracking tests
- **Mock API Responses:** Can simulate Resend API responses for testing

#### 6. **Code Access**
- **Full codebase access:** All files in `wip-webapp/` directory
- **Read access to:**
  - `api/services/resend.ts` (real service implementation)
  - `api/mocks/resend.ts` (mock service interface)
  - `api/mocks/index.ts` (service factory)
  - `wrangler.toml` (environment configuration)
- **Write access to:**
  - `api/mocks/index.ts` (factory updates)
  - Test files (new test files to create)

#### 7. **External Resources**
- **Resend API Documentation:** https://resend.com/docs
- **Resend API Reference:** For understanding request/response format
- **Existing Service Code:** Review `api/services/resend.ts` for implementation details

### Environment Verification Checklist

Before starting implementation, verify:
- [ ] `npm run type-check` passes without errors
- [ ] `npm run test` runs successfully
- [ ] Local D1 database is accessible
- [ ] Can read `api/services/resend.ts` and understand retry logic
- [ ] Can verify Resend env var name in `wrangler.toml`
- [ ] Git branch can be created (`feature/connect-real-email-service`)

### Implementation Workflow

1. **Update Factory Imports:** Uncomment real service import
2. **Create Union Type:** Add type alias for service interface
3. **Update Factory Logic:** Implement conditional service selection
4. **Update Service Status:** Modify status function to reflect email service
5. **Write Tests:** Create comprehensive test suite (can mock API calls)
6. **Test Queue System:** Verify failed email queue works correctly
7. **Verify:** Run all tests and type checks

### Testing Strategy

- **Unit Tests:** Mock the `createResendService` function to verify factory logic
- **Integration Tests:** Mock `global.fetch` to simulate Resend API responses
- **Queue Tests:** Test failed email queue system with mocked failures
- **No Real API Calls Required:** All tests can use mocked responses to avoid costs

---

## 🛠️ Implementation Steps

### Step 1: Update Service Factory Imports

**File:** `api/mocks/index.ts`

**Action:**
1. Uncomment real service import (line 12)
2. Import the factory function: `createResendService`

**Code Change:**
```typescript
// BEFORE (line 12):
// import { ResendEmailService, createResendService } from '../services/resend'

// AFTER:
import { ResendEmailService, createResendService } from '../services/resend'
```

### Step 2: Create Union Type for Service Interface

**File:** `api/mocks/index.ts`

**Action:**
Add type alias after imports to support both services:

```typescript
// Add after line 15 (after real service imports)
/**
 * Union type for email service (supports both mock and real)
 */
type EmailService = MockResendService | ResendEmailService
```

### Step 3: Update Factory Function Logic

**File:** `api/mocks/index.ts`

**Action:**
Replace `getEmailService()` function (lines 36-50) with new implementation:

```typescript
/**
 * Get email service (mock or real based on environment)
 * @param env - Environment variables
 * @returns Email service instance (mock or real)
 */
export function getEmailService(env: Env): EmailService {
  const useMocks = env.USE_MOCKS === 'true' || env.USE_MOCKS === undefined
  
  // Check if we should use real service
  const shouldUseReal = !useMocks && env.RESEND_API_KEY && env.DB
  
  if (shouldUseReal) {
    try {
      console.log('[SERVICE FACTORY] Using real Resend email service')
      return createResendService(env.RESEND_API_KEY, env.DB)
    } catch (error) {
      console.error('[SERVICE FACTORY] Failed to initialize real email service, falling back to mock:', error)
      return createMockResendService()
    }
  }
  
  // Default to mock for development/preview or if real service unavailable
  console.log('[SERVICE FACTORY] Using mock email service')
  return createMockResendService()
}
```

### Step 4: Update Service Status Function

**File:** `api/mocks/index.ts`

**Action:**
Update `getServiceStatus()` function (lines 136-156) to accurately reflect email service status:

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
  
  // Check if real email service would be used
  const emailService = !mockMode && env.RESEND_API_KEY && env.DB ? 'real' : 'mock'
  
  return {
    mockMode,
    services: {
      email: emailService,
      sms: mockMode || !env.TWILIO_ACCOUNT_SID ? 'mock' : 'real',
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
3. Verify all usages of `getEmailService()` still type-check correctly

**Files to Check:**
- `api/controllers/broadcast/index.ts` (if exists)
- `api/utils/email.ts` (if exists)
- Any other files importing `getEmailService`

---

## 🧪 Testing Requirements

### Unit Tests

**File:** `tests/unit/services/email-service.test.ts` (create new file)

**Test Cases:**

1. **Factory Returns Mock by Default**
   ```typescript
   test('getEmailService returns mock when USE_MOCKS is true', () => {
     const env = { USE_MOCKS: 'true' }
     const service = getEmailService(env)
     expect(service).toBeInstanceOf(MockResendService)
   })
   ```

2. **Factory Returns Mock when USE_MOCKS is undefined**
   ```typescript
   test('getEmailService returns mock when USE_MOCKS is undefined', () => {
     const env = {}
     const service = getEmailService(env)
     expect(service).toBeInstanceOf(MockResendService)
   })
   ```

3. **Factory Returns Real Service when Configured**
   ```typescript
   test('getEmailService returns real service when configured', () => {
     const mockDb = createMockD1Database()
     const env = {
       USE_MOCKS: 'false',
       RESEND_API_KEY: 'test_key',
       DB: mockDb,
     }
     const service = getEmailService(env)
     expect(service).toBeInstanceOf(ResendEmailService)
   })
   ```

4. **Factory Falls Back to Mock on Error**
   ```typescript
   test('getEmailService falls back to mock if real service fails', () => {
     const env = {
       USE_MOCKS: 'false',
       RESEND_API_KEY: 'invalid_key',
       DB: null, // Missing DB should cause fallback
     }
     const service = getEmailService(env)
     expect(service).toBeInstanceOf(MockResendService)
   })
   ```

5. **Service Status Reports Correctly**
   ```typescript
   test('getServiceStatus reports email service correctly', () => {
     const mockDb = createMockD1Database()
     const env = {
       USE_MOCKS: 'false',
       RESEND_API_KEY: 'test_key',
       DB: mockDb,
     }
     const status = getServiceStatus(env)
     expect(status.services.email).toBe('real')
   })
   ```

### Integration Tests

**File:** `tests/integration/email-service.test.ts` (create new file)

**Test Cases:**

1. **Real Service Sends Email (with mocked API)**
   ```typescript
   test('real service sends email via Resend API', async () => {
     // Mock fetch to simulate Resend API
     global.fetch = vi.fn().mockResolvedValue({
       ok: true,
       json: async () => ({ id: 'email_123' }),
     })
     
     const mockDb = createMockD1Database()
     const service = createResendService('test_key', mockDb)
     const result = await service.sendEmail({
       to: 'test@example.com',
       subject: 'Test',
       html: '<p>Test</p>',
     })
     
     expect(result.success).toBe(true)
     expect(global.fetch).toHaveBeenCalledWith(
       'https://api.resend.com/emails',
       expect.objectContaining({
         method: 'POST',
         headers: expect.objectContaining({
           Authorization: 'Bearer test_key',
         }),
       })
     )
   })
   ```

2. **Failed Email is Queued**
   ```typescript
   test('failed email is added to retry queue', async () => {
     // Mock API failure
     global.fetch = vi.fn().mockResolvedValue({
       ok: false,
       status: 500,
       json: async () => ({ message: 'Internal error' }),
     })
     
     const mockDb = createMockD1Database()
     const service = createResendService('test_key', mockDb)
     const result = await service.sendEmail({
       to: 'test@example.com',
       subject: 'Test',
       html: '<p>Test</p>',
     })
     
     expect(result.success).toBe(false)
     // Verify email was queued in database
     const queueItems = await mockDb.prepare('SELECT * FROM email_delivery_queue').all()
     expect(queueItems.results.length).toBeGreaterThan(0)
   })
   ```

3. **Unsubscribed Recipients are Skipped**
   ```typescript
   test('unsubscribed recipients are skipped', async () => {
     const mockDb = createMockD1Database()
     // Add unsubscribed email
     await mockDb.prepare(
       'INSERT INTO unsubscribe_list (id, email, created_at) VALUES (?, ?, ?)'
     ).bind('id_123', 'unsub@example.com', new Date().toISOString()).run()
     
     const service = createResendService('test_key', mockDb)
     const result = await service.sendEmail({
       to: 'unsub@example.com',
       subject: 'Test',
       html: '<p>Test</p>',
     })
     
     expect(result.success).toBe(false)
     expect(result.error?.code).toBe('RECIPIENT_UNSUBSCRIBED')
   })
   ```

### E2E Tests

**File:** `tests/e2e/email-delivery.test.ts` (create new file)

**Test Cases:**

1. **Email Delivery Flow**
   ```typescript
   test('complete email delivery flow', async () => {
     // Setup: Create user, configure real service
     // Action: Trigger email send (e.g., booking confirmation)
     // Verify: Email logged in database, delivery status tracked
   })
   ```

2. **Broadcast Email Flow**
   ```typescript
   test('broadcast email to multiple recipients', async () => {
     // Setup: Create artist with fan list
     // Action: Send broadcast email
     // Verify: All recipients receive email, unsubscribed skipped
   })
   ```

### Test Setup

**File:** `tests/helpers/mock-env.ts` (update if exists)

**Add helper functions:**
```typescript
export function createEmailServiceEnv(useMocks: boolean = true, hasApiKey: boolean = false) {
  return {
    USE_MOCKS: useMocks ? 'true' : 'false',
    RESEND_API_KEY: hasApiKey ? 'test_api_key' : undefined,
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
  return createResendService(env.RESEND_API_KEY, env.DB)
} catch (error) {
  console.error('[SERVICE FACTORY] Failed to initialize real email service, falling back to mock:', error)
  return createMockResendService()
}
```

### Service Errors

The real service already handles:
- API failures (retry logic)
- Invalid API keys (caught by fetch)
- Database errors (caught by D1 operations)
- Network timeouts (handled by retry helper)

**No additional error handling needed** - existing implementation is sufficient.

---

## 📚 Documentation Updates

### Files to Update

1. **`api/mocks/README.md`**
   - Update "How to toggle between mocks and real services" section
   - Add example of enabling real email service
   - Document environment variables needed

2. **`SERVICES_STATUS_REPORT.md`**
   - Update email service status to "Real Service Connected"
   - Update action items

3. **`PRODUCTION_SETUP.md`** (if exists)
   - Verify Resend setup instructions are accurate
   - Add troubleshooting section

### New Documentation

**File:** `docs/EMAIL_SERVICE.md` (create if doesn't exist)

**Content:**
- How email service works
- Mock vs real service differences
- Configuration guide
- Troubleshooting common issues
- API rate limits and quotas

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

**Branch:** `feature/connect-real-email-service`

**Naming Convention:** `feature/<descriptive-name>`

### PR Title

**Title:** `feat(services): connect real Resend email service to factory`

### PR Description Template

```markdown
## Summary
Connects the existing real Resend email service implementation to the service factory, enabling production email delivery.

## Changes
- Updated `api/mocks/index.ts` to conditionally return real service
- Added union type for email service interface
- Updated service status function
- Added comprehensive tests

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

- [ ] Factory returns real service when `USE_MOCKS = "false"` and `RESEND_API_KEY` exists
- [ ] Factory returns mock service by default (backward compatible)
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

### Nice to Have

- [ ] Performance benchmarks
- [ ] Additional error scenarios tested
- [ ] Monitoring/metrics integration

---

## 🔗 Related Files

### Files to Modify

1. `api/mocks/index.ts` - Service factory (main changes)
2. `tests/unit/services/email-service.test.ts` - Unit tests (new)
3. `tests/integration/email-service.test.ts` - Integration tests (new)
4. `tests/e2e/email-delivery.test.ts` - E2E tests (new)
5. `api/mocks/README.md` - Documentation (update)
6. `SERVICES_STATUS_REPORT.md` - Status report (update)

### Files to Reference

1. `api/services/resend.ts` - Real service implementation
2. `api/mocks/resend.ts` - Mock service implementation
3. `api/services/types.ts` - Service type definitions
4. `.github/workflows/ci-cd.yml` - CI/CD pipeline
5. `wrangler.toml` - Environment configuration

---

## 🎓 Implementation Notes

### Key Considerations

1. **Backward Compatibility:** Must not break existing code using email service
2. **Type Safety:** Union type ensures both services are compatible
3. **Error Handling:** Graceful fallback prevents application crashes
4. **Testing:** Comprehensive tests ensure reliability
5. **Documentation:** Clear docs help future maintainers

### Common Pitfalls to Avoid

1. ❌ Don't remove mock service - it's still needed for development
2. ❌ Don't hardcode API keys - use environment variables
3. ❌ Don't skip error handling - always fallback to mock
4. ❌ Don't forget to update service status function
5. ❌ Don't break existing tests - ensure backward compatibility

### Success Indicators

- ✅ All tests pass
- ✅ TypeScript compiles without errors
- ✅ Real service works in production environment
- ✅ Mock service still works in development
- ✅ No breaking changes
- ✅ Documentation is clear and accurate

---

## 📞 Support & Questions

If you encounter issues during implementation:

1. **Check existing code patterns** in `api/mocks/index.ts` for other services
2. **Review real service implementation** in `api/services/resend.ts`
3. **Check test patterns** in `tests/unit/` and `tests/integration/`
4. **Refer to documentation** in `api/mocks/README.md`

---

**End of PRD**

