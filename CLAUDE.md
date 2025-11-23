# Claude Code Implementation Guide

This file provides essential context and instructions for Claude Code to implement service integration features in this codebase.

## 🎯 Current Implementation Tasks

There are **4 service integration features** ready for implementation:

1. **Setup Real R2 Storage Service** - `PRD_SETUP_REAL_R2_STORAGE.md`
2. **Connect Real AI Service (Violet)** - `PRD_CONNECT_REAL_AI_SERVICE.md`
3. **Connect Real SMS Service** - `PRD_CONNECT_REAL_SMS_SERVICE.md`
4. **Connect Real Email Service** - `PRD_CONNECT_REAL_EMAIL_SERVICE.md`

Each feature has a comprehensive PRD with step-by-step implementation instructions.

---

## 📋 Essential Context

### Project Structure

```
wip-webapp/
├── api/
│   ├── mocks/
│   │   ├── index.ts          # Service factory (MAIN FILE TO MODIFY)
│   │   ├── resend.ts         # Mock email service
│   │   ├── twilio.ts         # Mock SMS service
│   │   ├── claude.ts         # Mock AI service
│   │   └── r2.ts             # Mock storage service
│   ├── services/
│   │   ├── resend.ts         # Real email service (already implemented)
│   │   ├── twilio.ts         # Real SMS service (already implemented)
│   │   ├── claude.ts         # Real AI service (already implemented)
│   │   └── r2.ts             # Real storage service (TO BE CREATED)
│   └── storage/
│       └── r2.ts             # R2 helper functions
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── claude/                   # Feature folders and guides
│   ├── CLAUDE_CODE_ENVIRONMENT_SETUP.md
│   ├── BRANCH_MANAGEMENT.md
│   └── [feature-folders]/
└── PRD_*.md                  # Product Requirements Documents
```

### Service Factory Pattern

The codebase uses a **service factory pattern** to switch between mock and real services:

**Location:** `api/mocks/index.ts`

**Current State:**
- ✅ Email service: Mock only (real service exists but not connected)
- ✅ SMS service: Mock only (real service exists but not connected)
- ✅ AI service: Mock only (real service exists but not connected)
- ✅ Storage service: Mock only (real service needs to be created)

**Pattern to Follow:**
Look at how email service is structured (lines 36-51) - it shows the pattern but real service is commented out. The goal is to:
1. Uncomment real service imports
2. Create union types for service interfaces
3. Update factory functions to conditionally return real or mock service
4. Update service status function

### Environment Configuration

**File:** `wrangler.toml`

**Key Variables:**
- `USE_MOCKS`: `"true"` for development, `"false"` for production
- `ENVIRONMENT`: `"development"`, `"preview"`, or `"production"`

**Service-Specific Secrets:**
- `RESEND_API_KEY`: For email service
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_PHONE`: For SMS service
- `ANTHROPIC_API_KEY` or `CLAUDE_API_KEY`: For AI service (check which is used)
- `BUCKET`: R2Bucket binding for storage service

---

## 🚀 How to Implement a Feature

### Step 1: Read the PRD

Each feature has a comprehensive PRD:
- `PRD_SETUP_REAL_R2_STORAGE.md`
- `PRD_CONNECT_REAL_AI_SERVICE.md`
- `PRD_CONNECT_REAL_SMS_SERVICE.md`
- `PRD_CONNECT_REAL_EMAIL_SERVICE.md`

**Each PRD contains:**
- Executive summary
- Current state analysis
- Technical specifications
- **🖥️ Claude Code Environment Setup** section (read this!)
- Step-by-step implementation instructions
- Testing requirements
- Acceptance criteria

### Step 2: Review Environment Setup

**Read:** `claude/CLAUDE_CODE_ENVIRONMENT_SETUP.md`

This guide covers:
- System requirements
- Cloudflare setup
- Wrangler CLI configuration
- Testing environment
- Pre-implementation checklist

### Step 3: Check Branch Management

**Read:** `claude/BRANCH_MANAGEMENT.md`

**Important:** 
- PRDs may be on a specific branch (check `fix/api-pagination-and-data-structure`)
- Specify branch in your prompt if not on `main`
- Verify PRD files exist before starting

### Step 4: Review Existing Patterns

**Before implementing, review:**

1. **Service Factory:** `api/mocks/index.ts`
   - See how services are structured
   - Understand the factory pattern
   - Note commented-out real service code

2. **Real Service Implementation:** `api/services/[service].ts`
   - Understand the real service interface
   - Check constructor parameters
   - Note any special flags (e.g., `useRealAPI` for Claude)

3. **Mock Service Implementation:** `api/mocks/[service].ts`
   - Understand the mock service interface
   - Ensure interfaces match between mock and real

4. **R2 Helpers (for R2 feature):** `api/storage/r2.ts`
   - Review helper functions
   - Understand how to use them in real service

### Step 5: Implement Step-by-Step

Follow the PRD's "Implementation Steps" section exactly:

1. **Update Factory Imports** - Uncomment real service imports
2. **Create Union Types** - Add type aliases for service interfaces
3. **Update Factory Logic** - Implement conditional service selection
4. **Update Service Status** - Modify status function
5. **Write Tests** - Create comprehensive test suite
6. **Verify** - Run all checks

### Step 6: Quality Checks

After implementation, verify:

```bash
npm run type-check    # TypeScript compilation
npm run lint          # ESLint checks
npm run test          # All tests pass
```

---

## ⚠️ Critical Requirements

### 1. Backward Compatibility

**MUST maintain backward compatibility:**
- Mock service remains **default** for development
- Real service only used when `USE_MOCKS = "false"` AND required secrets exist
- No breaking changes to existing code

### 2. Type Safety

**MUST ensure type safety:**
- Create union types: `type ServiceName = MockService | RealService`
- No `any` types
- Proper error handling types
- All TypeScript checks must pass

### 3. Error Handling

**MUST handle errors gracefully:**
- Fallback to mock if real service initialization fails
- Log errors clearly for debugging
- Don't break application if real service unavailable

### 4. Testing

**MUST write comprehensive tests:**
- Unit tests for factory logic
- Integration tests with mocked API calls
- Test error handling and fallbacks
- Test backward compatibility
- All tests must pass

### 5. Service-Specific Notes

#### R2 Storage Service
- **CRITICAL:** R2 doesn't support S3-style presigned URLs directly
- Research Cloudflare R2 presigned URL approach
- May need custom domain or Workers endpoint
- See PRD Step 5 for research requirements

#### AI Service (Claude)
- **CRITICAL:** Must set `useRealAPI: true` when creating real service
- Check which API key name is used: `ANTHROPIC_API_KEY` or `CLAUDE_API_KEY`
- Verify in `api/index.ts` or `wrangler.toml`

#### SMS Service (Twilio)
- Requires both `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN`
- Default phone number fallback if `TWILIO_FROM_PHONE` not provided
- Rate limiting is critical - test thoroughly

#### Email Service (Resend)
- Requires `RESEND_API_KEY` and `DB` binding
- Failed email queue system must work correctly
- Test unsubscribe list handling

---

## 📝 Implementation Template

Use this template when implementing a feature:

```
I'm implementing [FEATURE_NAME] following PRD_SETUP_REAL_R2_STORAGE.md.

Before starting:
1. Read the PRD completely: PRD_SETUP_REAL_R2_STORAGE.md
2. Review environment setup: claude/CLAUDE_CODE_ENVIRONMENT_SETUP.md
3. Check branch: [specify branch if not main]
4. Review existing patterns in api/mocks/index.ts

Implementation Steps:
1. [Follow PRD Step 1]
2. [Follow PRD Step 2]
3. [Continue with all PRD steps]

Quality Requirements:
- Pass: npm run type-check
- Pass: npm run lint
- Pass: npm run test
- Maintain backward compatibility
- Follow existing code patterns
- Add JSDoc comments

After each major step:
- Run type-check
- Run lint
- Run tests
- Verify no breaking changes
```

---

## 🔍 Key Files Reference

### Service Factory
- **Main File:** `api/mocks/index.ts`
- **Pattern:** Lines 36-51 show email service pattern (commented real service)

### Real Services (Already Implemented)
- **Email:** `api/services/resend.ts`
- **SMS:** `api/services/twilio.ts`
- **AI:** `api/services/claude.ts`
- **Storage:** `api/services/r2.ts` (TO BE CREATED)

### Mock Services
- **Email:** `api/mocks/resend.ts`
- **SMS:** `api/mocks/twilio.ts`
- **AI:** `api/mocks/claude.ts`
- **Storage:** `api/mocks/r2.ts`

### Configuration
- **Environment:** `wrangler.toml`
- **Package:** `package.json`
- **TypeScript:** `tsconfig.json`

### Documentation
- **Environment Setup:** `claude/CLAUDE_CODE_ENVIRONMENT_SETUP.md`
- **Branch Management:** `claude/BRANCH_MANAGEMENT.md`
- **Service Factory:** `api/mocks/README.md` (if exists)

---

## ✅ Pre-Implementation Checklist

Before starting any feature:

- [ ] Read the feature's PRD completely
- [ ] Read `claude/CLAUDE_CODE_ENVIRONMENT_SETUP.md`
- [ ] Read `claude/BRANCH_MANAGEMENT.md`
- [ ] Verify PRD files exist (check branch if needed)
- [ ] Review `api/mocks/index.ts` to understand factory pattern
- [ ] Review real service implementation in `api/services/[service].ts`
- [ ] Review mock service implementation in `api/mocks/[service].ts`
- [ ] Run `npm run type-check` (should pass)
- [ ] Run `npm run test` (should pass)
- [ ] Create feature branch: `git checkout -b feature/[feature-name]`

---

## 🎓 Common Patterns

### Factory Function Pattern

```typescript
export function getServiceName(env: Env): ServiceType {
  const useMocks = env.USE_MOCKS === 'true' || env.USE_MOCKS === undefined
  
  // Check if we should use real service
  const shouldUseReal = !useMocks && env.REQUIRED_SECRET && env.DB
  
  if (shouldUseReal) {
    try {
      console.log('[SERVICE FACTORY] Using real ServiceName service')
      return createRealService(env.REQUIRED_SECRET!, env.DB!)
    } catch (error) {
      console.error('[SERVICE FACTORY] Failed to initialize real service, falling back to mock:', error)
      return createMockService()
    }
  }
  
  // Default to mock
  console.log('[SERVICE FACTORY] Using mock ServiceName service')
  return createMockService()
}
```

### Union Type Pattern

```typescript
// Add after imports
type ServiceType = MockService | RealService
```

### Service Status Pattern

```typescript
export function getServiceStatus(env: Env): {
  mockMode: boolean
  services: {
    serviceName: 'mock' | 'real'
  }
} {
  const mockMode = isMockMode(env)
  const serviceName = !mockMode && env.REQUIRED_SECRET && env.DB ? 'real' : 'mock'
  
  return {
    mockMode,
    services: {
      serviceName,
    },
  }
}
```

---

## 🐛 Troubleshooting

### Can't Find PRD Files
- Check which branch has the PRDs: `git branch --contains <commit-hash>`
- Specify branch in prompt: `Branch: fix/api-pagination-and-data-structure`
- Or merge PRDs to main first

### Type Errors
- Ensure union types are created correctly
- Check that mock and real services implement same interface
- Run `npm run type-check` to see specific errors

### Test Failures
- Ensure all mocks are set up correctly
- Check that test helpers exist
- Run `npm run test -- --reporter=verbose` for details

### Service Not Working
- Verify environment variables are set correctly
- Check `USE_MOCKS` value
- Verify required secrets exist
- Check service status function returns correct value

---

## 📚 Additional Resources

### Cloudflare Documentation
- **Workers:** https://developers.cloudflare.com/workers/
- **R2:** https://developers.cloudflare.com/r2/
- **D1:** https://developers.cloudflare.com/d1/
- **Wrangler:** https://developers.cloudflare.com/workers/wrangler/

### API Documentation
- **Resend:** https://resend.com/docs
- **Twilio:** https://www.twilio.com/docs
- **Anthropic:** https://docs.anthropic.com

### Project Documentation
- **Service Factory:** `api/mocks/README.md`
- **API Configuration:** `docs/api-configuration.md`
- **Production Setup:** `PRODUCTION_SETUP.md`

---

## 🎯 Success Criteria

After implementing a feature, verify:

- [ ] All PRD acceptance criteria met
- [ ] Factory returns real service when configured correctly
- [ ] Factory returns mock service by default (backward compatible)
- [ ] All tests pass (`npm run test`)
- [ ] TypeScript compiles (`npm run type-check`)
- [ ] Linting passes (`npm run lint`)
- [ ] Service status function updated correctly
- [ ] Documentation updated
- [ ] No breaking changes
- [ ] Code follows existing patterns

---

**Last Updated:** 2025-01-22  
**Maintained By:** Development Team

**Remember:** Read the PRD first, follow it step-by-step, test frequently, and maintain backward compatibility!

