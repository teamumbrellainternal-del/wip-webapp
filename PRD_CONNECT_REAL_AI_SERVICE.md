# PRD: Connect Real Claude AI Service (Violet)

**Document Version:** 1.0  
**Created:** 2025-11-22  
**Target Branch:** `feature/connect-real-ai-service`  
**Estimated Effort:** 5-7 hours  
**Priority:** High (Required for production)

---

## 📋 Executive Summary

**Objective:** Connect the existing real Claude AI service implementation to the service factory, enabling production AI generation when `USE_MOCKS = "false"` and `ANTHROPIC_API_KEY` (or `CLAUDE_API_KEY`) is configured.

**Current State:** Real Claude service code exists at `api/services/claude.ts` but is not connected. The factory (`api/mocks/index.ts`) always returns mock service regardless of environment configuration. The real service has a `useRealAPI` flag that must be set to `true`.

**Success Criteria:** 
- Real AI service is used in production when configured
- Mock service continues to work in development/preview
- Daily limit tracking works correctly
- Token usage tracking works correctly
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
    ├── getSMSService(env) → Returns MockTwilioService or TwilioSMSService
    ├── getAIService(env) → Currently always returns MockClaudeService
    └── getStorageService(env) → Currently always returns MockR2Service
```

### Existing Code

**Real Service:** `api/services/claude.ts`
- ✅ Fully implemented `ClaudeAPIService` class
- ✅ Real Claude API integration (Claude Sonnet 4.5)
- ✅ Daily limit tracking (50 prompts/day per artist)
- ✅ Token usage tracking
- ✅ Usage statistics
- ✅ Cost estimation
- ✅ Multiple prompt types (bio, songwriting, career advice, etc.)
- ⚠️ Has `useRealAPI` constructor parameter (defaults to `false`)

**Mock Service:** `api/mocks/claude.ts`
- ✅ Fully implemented `MockClaudeService` class
- ✅ Pre-defined placeholder responses
- ✅ Daily limit tracking (simulated)
- ✅ Usage statistics (simulated)
- ✅ Same interface as real service

**Factory:** `api/mocks/index.ts`
- ⚠️ `getAIService()` always returns mock (lines 85-100)
- ⚠️ Real service import is commented out (line 14)
- ⚠️ Real service instantiation is commented out (lines 94-95)

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
ANTHROPIC_API_KEY = "<secret>"  # Set via wrangler secret put
# OR
CLAUDE_API_KEY = "<secret>"      # Alternative name (check codebase)
```

### Important Notes

1. **API Key Name:** The codebase may use either `ANTHROPIC_API_KEY` or `CLAUDE_API_KEY`. Check `api/index.ts` and `wrangler.toml` to confirm which is used.

2. **useRealAPI Flag:** The `ClaudeAPIService` constructor has a `useRealAPI` parameter that defaults to `false`. This must be set to `true` when creating the real service.

3. **Daily Limits:** Real service enforces 50 prompts/day per artist (VIOLET_DAILY_LIMIT). Mock service simulates this.

4. **Token Limits:** Real service tracks token usage. Monthly limit is 25,000 tokens per user (per D-059).

---

## 📐 Requirements

### Functional Requirements

1. **FR1: Service Factory Logic**
   - Factory must check `USE_MOCKS` environment variable
   - Factory must check for `ANTHROPIC_API_KEY` or `CLAUDE_API_KEY` secret
   - Factory must check for `DB` binding
   - Return real service when: `USE_MOCKS = "false"` AND API key exists AND `DB` exists
   - Return mock service otherwise (backward compatible)
   - **CRITICAL:** Must set `useRealAPI: true` when creating real service

2. **FR2: Type Safety**
   - Factory return type must support both mock and real service interfaces
   - Create union type or interface that both services implement
   - Ensure type compatibility across codebase

3. **FR3: Error Handling**
   - Graceful fallback to mock if real service initialization fails
   - Log errors clearly for debugging
   - Don't break application if real service unavailable

4. **FR4: Backward Compatibility**
   - All existing code using AI service must continue working
   - Mock service must remain default for development
   - No breaking changes to service interface

5. **FR5: Daily Limit Tracking**
   - Real service must enforce daily limits correctly
   - Database tracking must work
   - Limit resets at midnight UTC

6. **FR6: Token Tracking**
   - Real service must track token usage
   - Database tracking must work
   - Monthly limits must be enforced

### Non-Functional Requirements

1. **NFR1: Performance**
   - Service initialization must be fast (< 10ms)
   - API calls should complete within reasonable time
   - No performance degradation vs current mock

2. **NFR2: Reliability**
   - Real service must handle API failures gracefully
   - Retry logic must work as designed
   - Daily limit exceeded must return proper error
   - Token limit exceeded must return proper error

3. **NFR3: Observability**
   - Log which service is being used (mock vs real)
   - Log AI generation attempts
   - Track success/failure rates
   - Monitor token usage
   - Monitor daily limit usage

4. **NFR4: Security**
   - API key must never be logged
   - API key must only be accessed from environment
   - Follow existing secret management patterns

5. **NFR5: Cost Management**
   - Token usage must be tracked accurately
   - Cost estimation must be available
   - Monthly limits must be enforced

---

## 🔧 Technical Specifications

### Service Interface

Both mock and real services implement the same interface:

```typescript
interface AIService {
  generateResponse(params: ClaudeParams): Promise<ServiceResult<ClaudeResult>>
  checkDailyLimit(artistId: string): Promise<{
    allowed: boolean
    currentCount: number
    limit: number
    resetsAt: string
  }>
  getUsageStats(artistId: string, days?: number): Promise<{
    totalPrompts: number
    totalTokens: number
    byFeature: Record<ClaudePromptType, number>
  }>
  getDailyUsage(artistId: string): Promise<number>
  estimateCost(inputTokens: number, outputTokens: number): number
}
```

### Factory Function Signature

```typescript
export function getAIService(env: Env): AIService {
  // Implementation here
}
```

### Environment Interface

```typescript
export interface Env {
  USE_MOCKS?: string
  ANTHROPIC_API_KEY?: string
  CLAUDE_API_KEY?: string  // Check which is actually used
  DB?: D1Database
  // ... other env vars
}
```

### Claude API Configuration

- **API URL:** `https://api.anthropic.com/v1/messages`
- **Model:** `claude-sonnet-4-5-20250929`
- **Default Max Tokens:** 1024
- **Default Temperature:** 0.7
- **Daily Limit:** 50 prompts per artist
- **Monthly Token Limit:** 25,000 tokens per user

---

## 🖥️ Claude Code Environment Setup

### Required Environment for Implementation

To implement this feature end-to-end, Claude Code requires the following environment configuration:

#### 1. **Anthropic API Access (Optional for Testing)**
- **Anthropic Account:** Optional - can use mock API responses for testing
- **API Key:** Not required for implementation (can use placeholder for tests)
- **Documentation Access:** https://docs.anthropic.com for API reference

#### 2. **Local Development Environment**
- **Node.js:** Version 20.0.0 or higher
- **npm:** Version 10.0.0 or higher
- **TypeScript:** Installed and configured (already in project)
- **Git:** For version control and branch management

#### 3. **Project Dependencies**
- **All npm packages installed:** `npm install` completed
- **@anthropic-ai/sdk:** Already in dependencies (v0.69.0)
- **TypeScript compilation:** `npm run type-check` passes
- **Local D1 Database:** Configured and accessible for testing
- **Wrangler dev environment:** Can run `wrangler dev` successfully

#### 4. **Required Secrets & Configuration**
- **No secrets required for implementation** (can use mock API responses)
- **Environment variables:** `USE_MOCKS` can be toggled for testing
- **API Key Name:** Verify whether `ANTHROPIC_API_KEY` or `CLAUDE_API_KEY` is used (check `api/index.ts`)

#### 5. **Testing Environment**
- **Vitest:** Configured and working (`npm run test` works)
- **Mock Fetch:** Can mock `global.fetch` for API calls in tests
- **D1 Database:** Local database available for usage tracking tests
- **Mock API Responses:** Can simulate Claude API responses for testing

#### 6. **Code Access**
- **Full codebase access:** All files in `wip-webapp/` directory
- **Read access to:**
  - `api/services/claude.ts` (real service implementation)
  - `api/mocks/claude.ts` (mock service interface)
  - `api/mocks/index.ts` (service factory)
  - `api/index.ts` (verify API key name)
  - `wrangler.toml` (environment configuration)
- **Write access to:**
  - `api/mocks/index.ts` (factory updates)
  - Test files (new test files to create)

#### 7. **External Resources**
- **Anthropic API Documentation:** https://docs.anthropic.com
- **Claude API Reference:** For understanding request/response format
- **Existing Service Code:** Review `api/services/claude.ts` for implementation details

### Environment Verification Checklist

Before starting implementation, verify:
- [ ] `npm run type-check` passes without errors
- [ ] `npm run test` runs successfully
- [ ] Local D1 database is accessible
- [ ] Can read `api/services/claude.ts` and understand the `useRealAPI` flag
- [ ] Can verify API key name in `api/index.ts` or `wrangler.toml`
- [ ] Git branch can be created (`feature/connect-real-ai-service`)

### Implementation Workflow

1. **Verify API Key Name:** Check which env var name is used (`ANTHROPIC_API_KEY` vs `CLAUDE_API_KEY`)
2. **Update Factory Imports:** Uncomment real service import
3. **Create Union Type:** Add type alias for service interface
4. **Update Factory Logic:** Implement conditional service selection
5. **Set useRealAPI Flag:** Ensure `useRealAPI: true` when creating real service
6. **Update Service Status:** Modify status function to reflect AI service
7. **Write Tests:** Create comprehensive test suite (can mock API calls)
8. **Verify:** Run all tests and type checks

### Testing Strategy

- **Unit Tests:** Mock the `createClaudeService` function to verify factory logic
- **Integration Tests:** Mock `global.fetch` to simulate Claude API responses
- **No Real API Calls Required:** All tests can use mocked responses to avoid costs

---

## 🛠️ Implementation Steps

### Step 1: Verify API Key Name

**Action:**
Check which environment variable name is used:
1. Check `api/index.ts` for `ANTHROPIC_API_KEY` or `CLAUDE_API_KEY`
2. Check `wrangler.toml` for API key references
3. Update this PRD if different from `ANTHROPIC_API_KEY`

**Files to Check:**
- `api/index.ts` (line 53)
- `wrangler.toml` (search for "CLAUDE" or "ANTHROPIC")
- `worker-configuration.d.ts` (if exists)

### Step 2: Update Service Factory Imports

**File:** `api/mocks/index.ts`

**Action:**
1. Uncomment real service import (line 14)
2. Import the factory function: `createClaudeService`

**Code Change:**
```typescript
// BEFORE (line 14):
// import { ClaudeAPIService, createClaudeService } from '../services/claude'

// AFTER:
import { ClaudeAPIService, createClaudeService } from '../services/claude'
```

### Step 3: Create Union Type for Service Interface

**File:** `api/mocks/index.ts`

**Action:**
Add type alias after imports to support both services:

```typescript
// Add after line 15 (after real service imports)
/**
 * Union type for AI service (supports both mock and real)
 */
type AIService = MockClaudeService | ClaudeAPIService
```

### Step 4: Update Factory Function Logic

**File:** `api/mocks/index.ts`

**Action:**
Replace `getAIService()` function (lines 85-100) with new implementation:

```typescript
/**
 * Get AI service (mock or real based on environment)
 * @param env - Environment variables
 * @returns AI service instance (mock or real)
 */
export function getAIService(env: Env): AIService {
  const useMocks = env.USE_MOCKS === 'true' || env.USE_MOCKS === undefined
  
  // Check API key (support both ANTHROPIC_API_KEY and CLAUDE_API_KEY)
  const apiKey = env.ANTHROPIC_API_KEY || env.CLAUDE_API_KEY
  
  // Check if we should use real service
  const shouldUseReal = !useMocks && apiKey && env.DB
  
  if (shouldUseReal) {
    try {
      console.log('[SERVICE FACTORY] Using real Claude AI service')
      // CRITICAL: Set useRealAPI to true to enable real API calls
      return createClaudeService(apiKey!, env.DB!, true)
    } catch (error) {
      console.error('[SERVICE FACTORY] Failed to initialize real AI service, falling back to mock:', error)
      return createMockClaudeService()
    }
  }
  
  // Default to mock for development/preview or if real service unavailable
  console.log('[SERVICE FACTORY] Using mock Claude AI service')
  return createMockClaudeService()
}
```

### Step 5: Update Service Status Function

**File:** `api/mocks/index.ts`

**Action:**
Update `getServiceStatus()` function (lines 136-156) to accurately reflect AI service status:

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
  
  // Check if real AI service would be used
  const apiKey = env.ANTHROPIC_API_KEY || env.CLAUDE_API_KEY
  const aiService = !mockMode && apiKey && env.DB ? 'real' : 'mock'
  
  return {
    mockMode,
    services: {
      email: mockMode || !env.RESEND_API_KEY ? 'mock' : 'real',
      sms: mockMode || !env.TWILIO_ACCOUNT_SID ? 'mock' : 'real',
      ai: aiService,
      storage: mockMode || !env.BUCKET ? 'mock' : 'real',
    },
  }
}
```

### Step 6: Verify Type Compatibility

**Action:**
1. Run TypeScript type check: `npm run type-check`
2. Ensure no type errors introduced
3. Verify all usages of `getAIService()` still type-check correctly

**Files to Check:**
- `api/controllers/violet/index.ts` (if exists)
- `api/utils/ai-prompts.ts` (if exists)
- Any other files importing `getAIService`

---

## 🧪 Testing Requirements

### Unit Tests

**File:** `tests/unit/services/ai-service.test.ts` (create new file)

**Test Cases:**

1. **Factory Returns Mock by Default**
   ```typescript
   test('getAIService returns mock when USE_MOCKS is true', () => {
     const env = { USE_MOCKS: 'true' }
     const service = getAIService(env)
     expect(service).toBeInstanceOf(MockClaudeService)
   })
   ```

2. **Factory Returns Mock when USE_MOCKS is undefined**
   ```typescript
   test('getAIService returns mock when USE_MOCKS is undefined', () => {
     const env = {}
     const service = getAIService(env)
     expect(service).toBeInstanceOf(MockClaudeService)
   })
   ```

3. **Factory Returns Real Service when Configured**
   ```typescript
   test('getAIService returns real service when configured', () => {
     const mockDb = createMockD1Database()
     const env = {
       USE_MOCKS: 'false',
       ANTHROPIC_API_KEY: 'test_key',
       DB: mockDb,
     }
     const service = getAIService(env)
     expect(service).toBeInstanceOf(ClaudeAPIService)
   })
   ```

4. **Factory Supports CLAUDE_API_KEY Alternative**
   ```typescript
   test('getAIService supports CLAUDE_API_KEY environment variable', () => {
     const mockDb = createMockD1Database()
     const env = {
       USE_MOCKS: 'false',
       CLAUDE_API_KEY: 'test_key', // Alternative name
       DB: mockDb,
     }
     const service = getAIService(env)
     expect(service).toBeInstanceOf(ClaudeAPIService)
   })
   ```

5. **Factory Falls Back to Mock on Error**
   ```typescript
   test('getAIService falls back to mock if real service fails', () => {
     const env = {
       USE_MOCKS: 'false',
       ANTHROPIC_API_KEY: 'invalid_key',
       DB: null, // Missing DB should cause fallback
     }
     const service = getAIService(env)
     expect(service).toBeInstanceOf(MockClaudeService)
   })
   ```

6. **Real Service Uses useRealAPI Flag**
   ```typescript
   test('real service is created with useRealAPI=true', () => {
     const mockDb = createMockD1Database()
     const createSpy = vi.spyOn(require('../services/claude'), 'createClaudeService')
     
     const env = {
       USE_MOCKS: 'false',
       ANTHROPIC_API_KEY: 'test_key',
       DB: mockDb,
     }
     getAIService(env)
     
     expect(createSpy).toHaveBeenCalledWith('test_key', mockDb, true)
   })
   ```

7. **Service Status Reports Correctly**
   ```typescript
   test('getServiceStatus reports AI service correctly', () => {
     const mockDb = createMockD1Database()
     const env = {
       USE_MOCKS: 'false',
       ANTHROPIC_API_KEY: 'test_key',
       DB: mockDb,
     }
     const status = getServiceStatus(env)
     expect(status.services.ai).toBe('real')
   })
   ```

### Integration Tests

**File:** `tests/integration/ai-service.test.ts` (create new file)

**Test Cases:**

1. **Real Service Generates Response (with mocked API)**
   ```typescript
   test('real service generates response via Claude API', async () => {
     // Mock fetch to simulate Claude API
     global.fetch = vi.fn().mockResolvedValue({
       ok: true,
       json: async () => ({
         content: [{ text: 'Generated response' }],
         usage: { output_tokens: 50 },
       }),
     })
     
     const mockDb = createMockD1Database()
     const service = createClaudeService('test_key', mockDb, true)
     const result = await service.generateResponse({
       prompt: 'Write a bio',
       promptType: 'bio_generator',
       artistId: 'artist_123',
     })
     
     expect(result.success).toBe(true)
     expect(result.data?.response).toBe('Generated response')
     expect(global.fetch).toHaveBeenCalledWith(
       'https://api.anthropic.com/v1/messages',
       expect.objectContaining({
         method: 'POST',
         headers: expect.objectContaining({
           'x-api-key': 'test_key',
         }),
       })
     )
   })
   ```

2. **Daily Limit Enforcement**
   ```typescript
   test('real service enforces daily limit', async () => {
     const mockDb = createMockD1Database()
     const today = new Date().toISOString().split('T')[0]
     
     // Insert 50 usage records (at limit)
     for (let i = 0; i < 50; i++) {
       await mockDb.prepare(
         'INSERT INTO violet_usage (id, artist_id, date, prompt_count, feature_used, prompt_text, response_tokens, created_at) VALUES (?, ?, ?, 1, ?, ?, ?, ?)'
       ).bind(
         `id_${i}`,
         'artist_123',
         today,
         'bio_generator',
         'Test prompt',
         100,
         new Date().toISOString()
       ).run()
     }
     
     const service = createClaudeService('test_key', mockDb, true)
     const result = await service.generateResponse({
       prompt: 'Write a bio',
       promptType: 'bio_generator',
       artistId: 'artist_123',
     })
     
     expect(result.success).toBe(false)
     expect(result.error?.code).toBe('DAILY_LIMIT_EXCEEDED')
   })
   ```

3. **Usage Tracking**
   ```typescript
   test('real service tracks usage in database', async () => {
     global.fetch = vi.fn().mockResolvedValue({
       ok: true,
       json: async () => ({
         content: [{ text: 'Response' }],
         usage: { output_tokens: 50 },
       }),
     })
     
     const mockDb = createMockD1Database()
     const service = createClaudeService('test_key', mockDb, true)
     
     await service.generateResponse({
       prompt: 'Test prompt',
       promptType: 'bio_generator',
       artistId: 'artist_123',
     })
     
     // Verify usage was logged
     const usage = await mockDb.prepare(
       'SELECT * FROM violet_usage WHERE artist_id = ?'
     ).bind('artist_123').all()
     
     expect(usage.results.length).toBeGreaterThan(0)
   })
   ```

4. **Token Usage Tracking**
   ```typescript
   test('real service tracks token usage correctly', async () => {
     global.fetch = vi.fn().mockResolvedValue({
       ok: true,
       json: async () => ({
         content: [{ text: 'Response' }],
         usage: { 
           input_tokens: 100,
           output_tokens: 50,
         },
       }),
     })
     
     const mockDb = createMockD1Database()
     const service = createClaudeService('test_key', mockDb, true)
     const result = await service.generateResponse({
       prompt: 'Test prompt',
       promptType: 'bio_generator',
       artistId: 'artist_123',
     })
     
     expect(result.success).toBe(true)
     expect(result.data?.tokensUsed).toBe(50) // Output tokens
   })
   ```

5. **API Failure Handling**
   ```typescript
   test('real service handles API failures gracefully', async () => {
     global.fetch = vi.fn().mockResolvedValue({
       ok: false,
       status: 429, // Rate limit
       json: async () => ({ error: { message: 'Rate limit exceeded' } }),
     })
     
     const mockDb = createMockD1Database()
     const service = createClaudeService('test_key', mockDb, true)
     const result = await service.generateResponse({
       prompt: 'Test',
       promptType: 'bio_generator',
       artistId: 'artist_123',
     })
     
     expect(result.success).toBe(false)
     expect(result.error).toBeDefined()
   })
   ```

6. **Usage Statistics**
   ```typescript
   test('real service provides usage statistics', async () => {
     const mockDb = createMockD1Database()
     const today = new Date().toISOString().split('T')[0]
     
     // Insert test usage records
     await mockDb.prepare(
       'INSERT INTO violet_usage (id, artist_id, date, prompt_count, feature_used, prompt_text, response_tokens, created_at) VALUES (?, ?, ?, 1, ?, ?, ?, ?)'
     ).bind('id_1', 'artist_123', today, 'bio_generator', 'Prompt 1', 100, new Date().toISOString()).run()
     
     const service = createClaudeService('test_key', mockDb, true)
     const stats = await service.getUsageStats('artist_123', 30)
     
     expect(stats.totalPrompts).toBeGreaterThan(0)
     expect(stats.totalTokens).toBeGreaterThan(0)
     expect(stats.byFeature).toHaveProperty('bio_generator')
   })
   ```

### E2E Tests

**File:** `tests/e2e/violet-ai.test.ts` (create new file)

**Test Cases:**

1. **AI Generation Flow**
   ```typescript
   test('complete AI generation flow', async () => {
     // Setup: Create user, configure real service
     // Action: Generate bio using Violet AI
     // Verify: Response generated, usage tracked, daily limit updated
   })
   ```

2. **Daily Limit Enforcement**
   ```typescript
   test('daily limit prevents overuse', async () => {
     // Setup: Create user, send 50 prompts (at limit)
     // Action: Attempt 51st prompt
     // Verify: Request rejected with daily limit error
   })
   ```

### Test Setup

**File:** `tests/helpers/mock-env.ts` (update if exists)

**Add helper functions:**
```typescript
export function createAIServiceEnv(useMocks: boolean = true, hasApiKey: boolean = false) {
  return {
    USE_MOCKS: useMocks ? 'true' : 'false',
    ANTHROPIC_API_KEY: hasApiKey ? 'test_api_key' : undefined,
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
- Document API key name (ANTHROPIC_API_KEY vs CLAUDE_API_KEY)

---

## 🔍 Error Handling

### Factory Errors

**Scenario:** Real service initialization fails

**Handling:**
```typescript
try {
  return createClaudeService(apiKey!, env.DB!, true)
} catch (error) {
  console.error('[SERVICE FACTORY] Failed to initialize real AI service, falling back to mock:', error)
  return createMockClaudeService()
}
```

### Service Errors

The real service already handles:
- API failures (retry logic)
- Invalid API keys (caught by fetch)
- Database errors (caught by D1 operations)
- Network timeouts (handled by retry helper)
- Daily limit exceeded (returns proper error)
- Token limit exceeded (returns proper error)

**No additional error handling needed** - existing implementation is sufficient.

---

## 📚 Documentation Updates

### Files to Update

1. **`api/mocks/README.md`**
   - Update "How to toggle between mocks and real services" section
   - Add example of enabling real AI service
   - Document environment variables needed
   - Document daily limit behavior
   - Document token tracking

2. **`SERVICES_STATUS_REPORT.md`**
   - Update AI service status to "Real Service Connected"
   - Update action items

3. **`PRODUCTION_SETUP.md`** (if exists)
   - Verify Claude/Anthropic setup instructions are accurate
   - Add troubleshooting section
   - Document daily limits
   - Document token limits

### New Documentation

**File:** `docs/AI_SERVICE.md` (create if doesn't exist)

**Content:**
- How AI service works
- Mock vs real service differences
- Configuration guide
- Daily limit details
- Token tracking and limits
- Cost estimation
- Troubleshooting common issues
- Claude API rate limits and quotas

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

**Note:** E2E tests that call real Claude API will need mocked API responses to avoid costs.

---

## 🌿 Branch & PR Guidelines

### Branch Naming

**Branch:** `feature/connect-real-ai-service`

**Naming Convention:** `feature/<descriptive-name>`

### PR Title

**Title:** `feat(services): connect real Claude AI service to factory`

### PR Description Template

```markdown
## Summary
Connects the existing real Claude AI service implementation to the service factory, enabling production AI generation.

## Changes
- Updated `api/mocks/index.ts` to conditionally return real service
- Added union type for AI service interface
- Updated service status function
- Set useRealAPI flag to true for real service
- Added comprehensive tests including daily limit and token tracking

## Testing
- [x] Unit tests added and passing
- [x] Integration tests added and passing (including daily limits)
- [x] E2E tests added and passing
- [x] All existing tests still pass
- [x] TypeScript compilation succeeds
- [x] Linting passes

## Checklist
- [x] Code follows existing patterns
- [x] Tests added for new functionality
- [x] Daily limit tracking tested
- [x] Token tracking tested
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

- [ ] Factory returns real service when `USE_MOCKS = "false"` and API key exists
- [ ] Factory returns mock service by default (backward compatible)
- [ ] Factory supports both `ANTHROPIC_API_KEY` and `CLAUDE_API_KEY`
- [ ] Real service created with `useRealAPI: true`
- [ ] All existing tests pass
- [ ] New unit tests added and passing
- [ ] New integration tests added and passing (including daily limits)
- [ ] TypeScript compilation succeeds
- [ ] ESLint passes
- [ ] Prettier formatting passes
- [ ] Documentation updated

### Should Have

- [ ] E2E tests added
- [ ] Error handling tested
- [ ] Service status function updated
- [ ] Logging added for service selection
- [ ] Daily limit tracking thoroughly tested
- [ ] Token tracking thoroughly tested

### Nice to Have

- [ ] Performance benchmarks
- [ ] Additional error scenarios tested
- [ ] Monitoring/metrics integration
- [ ] Cost tracking dashboard

---

## 🔗 Related Files

### Files to Modify

1. `api/mocks/index.ts` - Service factory (main changes)
2. `tests/unit/services/ai-service.test.ts` - Unit tests (new)
3. `tests/integration/ai-service.test.ts` - Integration tests (new)
4. `tests/e2e/violet-ai.test.ts` - E2E tests (new)
5. `api/mocks/README.md` - Documentation (update)
6. `SERVICES_STATUS_REPORT.md` - Status report (update)

### Files to Reference

1. `api/services/claude.ts` - Real service implementation
2. `api/mocks/claude.ts` - Mock service implementation
3. `api/services/types.ts` - Service type definitions
4. `.github/workflows/ci-cd.yml` - CI/CD pipeline
5. `wrangler.toml` - Environment configuration
6. `api/index.ts` - Check API key name

---

## 🎓 Implementation Notes

### Key Considerations

1. **Backward Compatibility:** Must not break existing code using AI service
2. **Type Safety:** Union type ensures both services are compatible
3. **Error Handling:** Graceful fallback prevents application crashes
4. **useRealAPI Flag:** CRITICAL - must be set to `true` for real API calls
5. **Daily Limits:** Important feature that must work correctly
6. **Token Tracking:** Required for cost management
7. **Testing:** Comprehensive tests ensure reliability, especially limits

### Common Pitfalls to Avoid

1. ❌ Don't remove mock service - it's still needed for development
2. ❌ Don't hardcode API keys - use environment variables
3. ❌ Don't skip error handling - always fallback to mock
4. ❌ Don't forget to update service status function
5. ❌ Don't break existing tests - ensure backward compatibility
6. ❌ Don't forget `useRealAPI: true` - real API won't work without it
7. ❌ Don't skip daily limit tests - critical feature
8. ❌ Don't forget to check API key name (ANTHROPIC_API_KEY vs CLAUDE_API_KEY)

### Success Indicators

- ✅ All tests pass
- ✅ TypeScript compiles without errors
- ✅ Real service works in production environment
- ✅ Mock service still works in development
- ✅ Daily limits work correctly
- ✅ Token tracking works correctly
- ✅ No breaking changes
- ✅ Documentation is clear and accurate

---

## 📞 Support & Questions

If you encounter issues during implementation:

1. **Check existing code patterns** in `api/mocks/index.ts` for email/SMS services (already connected)
2. **Review real service implementation** in `api/services/claude.ts`
3. **Check test patterns** in `tests/unit/` and `tests/integration/`
4. **Refer to documentation** in `api/mocks/README.md`
5. **Verify API key name** in `api/index.ts` and `wrangler.toml`
6. **Check useRealAPI flag** - ensure it's set to `true` when creating real service

---

**End of PRD**

