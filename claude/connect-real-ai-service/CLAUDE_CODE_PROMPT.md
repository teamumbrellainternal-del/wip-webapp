# Claude Code CLI Prompt - AI Service (Violet)

Copy and paste this entire prompt into Claude Code CLI:

---

```
Read CLAUDE.md for full context about this codebase and implementation patterns.

Then implement the AI Service connection feature following PRD_CONNECT_REAL_AI_SERVICE.md.

## Environment Variables Setup

**Important:** The project uses environment variables configured in:
- `wip-webapp/.env` - Local environment variables (for frontend/build)
- `wip-webapp/.dev.vars` - Development variables for Wrangler (Cloudflare Workers)

**Reference files:**
- `wip-webapp/.env.example` - Example frontend environment variables (lines 40-44 show Twilio and Claude API keys)
- `wip-webapp/.dev.vars.example` - Example Wrangler environment variables (line 14 shows `CLAUDE_API_KEY`)

**For AI Service:**
- **CRITICAL:** There's a naming discrepancy - verify which API key name is actually used:
  - `.dev.vars.example` shows `CLAUDE_API_KEY` (line 14)
  - Factory currently checks for `ANTHROPIC_API_KEY` (see `api/mocks/index.ts` line 113)
  - Other parts of codebase use `CLAUDE_API_KEY` (see `api/index.ts`, `api/utils/validate-env.ts`)
  - **Action Required:** Check `api/index.ts`, `wrangler.toml`, and `api/mocks/index.ts` to determine which name is correct
  - Support BOTH names in factory: `env.ANTHROPIC_API_KEY || env.CLAUDE_API_KEY` (as per PRD)
- The factory checks for API key AND `env.DB` binding
- In local development with `wrangler dev`, environment variables come from `.dev.vars`
- The actual `.dev.vars` file exists (not just `.dev.vars.example`) - Claude Code should be aware these variables are already set up
- When testing, you can use mocked API responses - real API keys are not required for implementation

## Branch Management

1. Create a new branch with naming pattern: `claude/connect-real-ai-service-[unique-id]`
   - Generate a unique identifier (timestamp or random string)
   - Example format: `claude/connect-real-ai-service-$(date +%s)` or use a short hash
   
2. Work entirely on this branch - do not modify main or other branches

3. When implementation is complete, create a Pull Request:
   - Base branch: `main`
   - Title: "feat(services): connect real Claude AI service to factory"
   - Description: Use the PR template from PRD_CONNECT_REAL_AI_SERVICE.md (around lines 797-830)
   - Include all acceptance criteria checklist items from the PRD

## Implementation Requirements

Follow the PRD step-by-step (PRD_CONNECT_REAL_AI_SERVICE.md):

1. **Step 1:** Verify API Key Name
   - Check `api/index.ts` for which API key name is used
   - Check `wrangler.toml` for API key references
   - Check `api/mocks/index.ts` (currently uses `ANTHROPIC_API_KEY` on line 113)
   - Update factory to support BOTH `ANTHROPIC_API_KEY` and `CLAUDE_API_KEY` (as per PRD Step 1)

2. **Step 2:** Update Service Factory Imports
   - Uncomment line 14 in `api/mocks/index.ts`: `import { ClaudeAPIService, createClaudeService } from '../services/claude'`

3. **Step 3:** Create Union Type
   - Add after imports: `type AIService = MockClaudeService | ClaudeAPIService`

4. **Step 4:** Update Factory Function Logic
   - Replace `getAIService()` function (lines 110-125 in `api/mocks/index.ts`)
   - Uncomment the real service return statement (lines 119-120)
   - **CRITICAL:** Must set `useRealAPI: true` when creating real service: `createClaudeService(apiKey!, env.DB!, true)`
   - **CRITICAL:** Support both API key names: `const apiKey = env.ANTHROPIC_API_KEY || env.CLAUDE_API_KEY`
   - Update return type to `AIService`
   - Add try/catch error handling with fallback to mock
   - Follow the pattern shown in PRD (lines 280-303)

5. **Step 5:** Update Service Status Function
   - Modify `getServiceStatus()` to accurately reflect AI service status
   - Check for API key (support both names) AND `DB` binding
   - Follow pattern in PRD (lines 313-338)

6. **Step 6:** Verify Type Compatibility
   - Run `npm run type-check` - must pass with no errors
   - Ensure no type errors introduced

7. **Step 7:** Write Comprehensive Tests
   - Create `tests/unit/services/ai-service.test.ts` with all test cases from PRD (lines 363-451)
   - Create `tests/integration/ai-service.test.ts` with all test cases from PRD (lines 453-622)
   - **CRITICAL:** Test that `useRealAPI: true` is passed to service constructor (PRD lines 422-437)
   - **CRITICAL:** Test daily limit enforcement (PRD lines 493-524)
   - **CRITICAL:** Test token usage tracking (PRD lines 555-580)
   - **CRITICAL:** Test both API key name variations (`ANTHROPIC_API_KEY` and `CLAUDE_API_KEY`)
   - All tests must pass
   - Use mocked API responses (no real API calls needed)

8. **Step 8:** Update Documentation
   - Update `api/mocks/README.md` if it exists (follow PRD lines 808-813)
   - Update `SERVICES_STATUS_REPORT.md` if it exists (follow PRD lines 815-817)
   - Follow PRD documentation requirements (lines 804-837)

## Quality Requirements

- ✅ All code must pass: `npm run type-check`
- ✅ All code must pass: `npm run lint` (max 45 warnings)
- ✅ All tests must pass: `npm run test`
- ✅ Follow existing code patterns and style
- ✅ Add JSDoc comments to new/changed functions
- ✅ Ensure type safety (no 'any' types)
- ✅ Maintain backward compatibility (mock service remains default)

## Critical Requirements

1. **Backward Compatibility:** Mock service must remain default when `USE_MOCKS = "true"` or secrets missing
2. **Error Handling:** Always fallback to mock if real service initialization fails
3. **Type Safety:** Use union type to ensure both services are compatible
4. **useRealAPI Flag:** **CRITICAL** - Must set `useRealAPI: true` when creating real service, otherwise real API won't work
5. **API Key Name:** Support both `ANTHROPIC_API_KEY` and `CLAUDE_API_KEY` for compatibility
6. **Testing:** Write tests for all scenarios including:
   - Daily limit enforcement (50 prompts/day per artist)
   - Token usage tracking (25,000 tokens/month per user)
   - Usage statistics
   - Both API key name variations
   - Error cases and fallbacks

## AI-Specific Requirements

1. **useRealAPI Flag:** The `ClaudeAPIService` constructor has a `useRealAPI` parameter that defaults to `false`
   - **MUST** be set to `true` when creating real service: `createClaudeService(apiKey, db, true)`
   - If not set to `true`, the service will not make real API calls
   - Test that this flag is correctly passed (see PRD lines 422-437)

2. **API Key Name Verification:** The codebase uses different names in different places
   - Factory currently uses: `ANTHROPIC_API_KEY`
   - `.dev.vars.example` uses: `CLAUDE_API_KEY`
   - Other files use: `CLAUDE_API_KEY`
   - **Solution:** Support both names in factory: `env.ANTHROPIC_API_KEY || env.CLAUDE_API_KEY`

3. **Daily Limits:** Real service enforces 50 prompts/day per artist (VIOLET_DAILY_LIMIT)
   - Test daily limit enforcement thoroughly
   - Test limit resets at midnight UTC
   - See PRD lines 493-524 for daily limit test requirements

4. **Token Tracking:** Real service tracks token usage
   - Monthly limit: 25,000 tokens per user (per D-059)
   - Test token usage tracking
   - Test token limit enforcement
   - See PRD lines 555-580 for token tracking test requirements

5. **Usage Statistics:** Real service provides usage statistics
   - Test `getUsageStats()` method
   - Test `getDailyUsage()` method
   - Test `checkDailyLimit()` method
   - See PRD lines 604-622 for usage statistics test requirements

## Workflow

1. Read `CLAUDE.md` completely for context
2. Read `PRD_CONNECT_REAL_AI_SERVICE.md` completely
3. **Verify API Key Name:** Check `api/index.ts`, `wrangler.toml`, and `api/mocks/index.ts` to determine which API key name is used
4. Review existing factory pattern in `api/mocks/index.ts` (lines 110-125)
5. Review real service implementation: `api/services/claude.ts`
   - Pay attention to `useRealAPI` constructor parameter
   - Note constructor signature: `createClaudeService(apiKey, db, useRealAPI)`
   - Understand daily limit and token tracking implementation
6. Review mock service implementation: `api/mocks/claude.ts`
7. Create branch: `claude/connect-real-ai-service-[unique-id]`
8. Implement step-by-step following PRD
9. Write tests as you implement (don't skip tests, especially daily limits and token tracking)
10. Run `npm run type-check` after each major step
11. Run `npm run lint` after each major step  
12. Run `npm run test` after each major step
13. Verify all acceptance criteria from PRD are met
14. Create Pull Request when complete

## Verification Checklist

Before considering implementation complete, verify:

- [ ] API key name verified and both names supported (`ANTHROPIC_API_KEY` and `CLAUDE_API_KEY`)
- [ ] Factory returns real service when `USE_MOCKS = "false"` and API key exists
- [ ] Factory returns mock service by default (backward compatible)
- [ ] **CRITICAL:** `useRealAPI: true` is passed when creating real service
- [ ] Union type created correctly
- [ ] Service status function updated correctly
- [ ] All unit tests added and passing
- [ ] All integration tests added and passing
- [ ] Daily limit tests added and passing
- [ ] Token tracking tests added and passing
- [ ] Usage statistics tests added and passing
- [ ] Both API key name variations tested
- [ ] TypeScript compilation succeeds (`npm run type-check`)
- [ ] ESLint passes (`npm run lint`)
- [ ] All existing tests still pass
- [ ] Documentation updated
- [ ] No breaking changes
- [ ] Code follows existing patterns

## Files to Modify

- `api/mocks/index.ts` - Main factory file (uncomment imports, update functions, support both API key names)
- `tests/unit/services/ai-service.test.ts` - New file (create)
- `tests/integration/ai-service.test.ts` - New file (create)
- `api/mocks/README.md` - Update if exists
- `SERVICES_STATUS_REPORT.md` - Update if exists

## Reference Files

- **PRD:** `PRD_CONNECT_REAL_AI_SERVICE.md`
- **Context:** `CLAUDE.md`
- **Environment Setup:** `claude/CLAUDE_CODE_ENVIRONMENT_SETUP.md`
- **Real Service:** `api/services/claude.ts`
- **Mock Service:** `api/mocks/claude.ts`
- **Factory Pattern:** `api/mocks/index.ts` (lines 110-125 show current pattern)
- **API Key Check:** `api/index.ts` (line 53), `api/utils/validate-env.ts` (lines 103-117)

## Important Notes

- **useRealAPI Flag:** **CRITICAL** - The `ClaudeAPIService` constructor has a `useRealAPI` parameter that defaults to `false`. This MUST be set to `true` when creating the real service, otherwise it won't make real API calls. This is the most common mistake - don't forget it!
- **API Key Name:** The codebase uses both `ANTHROPIC_API_KEY` and `CLAUDE_API_KEY`. Support both for compatibility.
- **Daily Limits:** Real service enforces 50 prompts/day per artist. Test this thoroughly.
- **Token Limits:** Monthly limit is 25,000 tokens per user. Test token tracking and limit enforcement.
- **Database Required:** Real service requires `DB` binding for usage tracking and limits.

Start by reading CLAUDE.md, then PRD_CONNECT_REAL_AI_SERVICE.md, verify the API key name, then begin implementation on a new branch.
```

---

## Usage

Copy the entire prompt above (between the triple backticks) and paste it into Claude Code CLI in a separate terminal instance.

Claude Code will:
1. Read the context files
2. Verify which API key name is used
3. Create a branch with pattern `claude/connect-real-ai-service-[unique-id]`
4. Implement the feature step-by-step
5. Write comprehensive tests (especially daily limits and token tracking)
6. Create a Pull Request when complete

## Parallel Execution

You can run this in parallel with the Email and SMS Service implementations:
- **Terminal 1:** Email Service (`claude/connect-real-email-service/CLAUDE_CODE_PROMPT.md`)
- **Terminal 2:** SMS Service (`claude/connect-real-sms-service/CLAUDE_CODE_PROMPT.md`)
- **Terminal 3:** AI Service (`claude/connect-real-ai-service/CLAUDE_CODE_PROMPT.md`)

All three features modify different parts of `api/mocks/index.ts` and create different test files, so they won't conflict.

## Key Differences from Other Services

- **useRealAPI Flag:** Must be set to `true` - this is critical!
- **API Key Name:** Need to support both `ANTHROPIC_API_KEY` and `CLAUDE_API_KEY`
- **Daily Limits:** 50 prompts/day per artist - test thoroughly
- **Token Tracking:** 25,000 tokens/month per user - test tracking and limits
- **Usage Statistics:** More complex than other services - test all stats methods

