# Claude Code CLI Prompt - Email Service

Copy and paste this entire prompt into Claude Code CLI:

---

```
Read CLAUDE.md for full context about this codebase and implementation patterns.

Then implement the Email Service connection feature following PRD_CONNECT_REAL_EMAIL_SERVICE.md.

## Environment Variables Setup

**Important:** The project uses environment variables configured in:
- `wip-webapp/.env` - Local environment variables (for frontend/build)
- `wip-webapp/.dev.vars` - Development variables for Wrangler (Cloudflare Workers)

**Reference files:**
- `wip-webapp/.env.example` - Example frontend environment variables
- `wip-webapp/.dev.vars.example` - Example Wrangler environment variables (lines 16-17 show `RESEND_API_KEY`)

**For Email Service:**
- `RESEND_API_KEY` is configured in `.dev.vars` (see `.dev.vars.example` line 17)
- The factory checks for `env.RESEND_API_KEY` and `env.DB` binding
- In local development with `wrangler dev`, environment variables come from `.dev.vars`
- The actual `.dev.vars` file exists (not just `.dev.vars.example`) - Claude Code should be aware these variables are already set up
- When testing, you can use mocked API responses - real API keys are not required for implementation

## Branch Management

1. Create a new branch with naming pattern: `claude/connect-real-email-service-[unique-id]`
   - Use a short unique identifier (like a timestamp or random string)
   - Example: `claude/connect-real-email-service-$(date +%s)` or similar
   
2. Work entirely on this branch - do not modify main or other branches

3. When implementation is complete, create a Pull Request:
   - Base branch: `main`
   - Title: "feat(services): connect real Resend email service to factory"
   - Description: Use the PR template from PRD_CONNECT_REAL_EMAIL_SERVICE.md (lines 600-630)
   - Include all acceptance criteria checklist items

## Implementation Requirements

Follow the PRD step-by-step (PRD_CONNECT_REAL_EMAIL_SERVICE.md):

1. **Step 1:** Update Service Factory Imports
   - Uncomment line 12: `import { ResendEmailService, createResendService } from '../services/resend'`

2. **Step 2:** Create Union Type
   - Add: `type EmailService = MockResendService | ResendEmailService`
   - Place after imports section

3. **Step 3:** Update Factory Function Logic
   - Replace `getEmailService()` function (lines 36-51)
   - Uncomment the real service return statement
   - Update return type to `EmailService`
   - Add try/catch error handling with fallback to mock

4. **Step 4:** Update Service Status Function
   - Modify `getServiceStatus()` to accurately reflect email service status
   - Check for `RESEND_API_KEY` and `DB` binding

5. **Step 5:** Verify Type Compatibility
   - Run `npm run type-check` - must pass
   - Ensure no type errors introduced

6. **Step 6:** Write Comprehensive Tests
   - Create `tests/unit/services/email-service.test.ts`
   - Create `tests/integration/email-service.test.ts`
   - Follow test cases specified in PRD (lines 290-460)
   - All tests must pass

7. **Step 7:** Update Documentation
   - Update `api/mocks/README.md` if it exists
   - Update `SERVICES_STATUS_REPORT.md` if it exists
   - Follow PRD documentation requirements (lines 613-630)

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
4. **Testing:** Write tests for all scenarios including error cases

## Workflow

1. Read CLAUDE.md completely for context
2. Read PRD_CONNECT_REAL_EMAIL_SERVICE.md completely
3. Review existing factory pattern in `api/mocks/index.ts` (lines 36-51)
4. Review real service: `api/services/resend.ts`
5. Review mock service: `api/mocks/resend.ts`
6. Create branch: `claude/connect-real-email-service-[unique-id]`
7. Implement step-by-step following PRD
8. Write tests as you implement (don't skip tests)
9. Run `npm run type-check` after each major step
10. Run `npm run lint` after each major step
11. Run `npm run test` after each major step
12. Verify all acceptance criteria met
13. Create Pull Request when complete

## Verification Checklist

Before considering implementation complete:

- [ ] Factory returns real service when `USE_MOCKS = "false"` and `RESEND_API_KEY` exists
- [ ] Factory returns mock service by default (backward compatible)
- [ ] Union type created correctly
- [ ] Service status function updated correctly
- [ ] All unit tests added and passing
- [ ] All integration tests added and passing
- [ ] TypeScript compilation succeeds (`npm run type-check`)
- [ ] ESLint passes (`npm run lint`)
- [ ] All existing tests still pass
- [ ] Documentation updated
- [ ] No breaking changes
- [ ] Code follows existing patterns

## Files to Modify

- `api/mocks/index.ts` - Main factory file (uncomment imports, update functions)
- `tests/unit/services/email-service.test.ts` - New file (create)
- `tests/integration/email-service.test.ts` - New file (create)
- `api/mocks/README.md` - Update if exists
- `SERVICES_STATUS_REPORT.md` - Update if exists

## Reference Files

- **PRD:** `PRD_CONNECT_REAL_EMAIL_SERVICE.md`
- **Context:** `CLAUDE.md`
- **Environment Setup:** `claude/CLAUDE_CODE_ENVIRONMENT_SETUP.md`
- **Real Service:** `api/services/resend.ts`
- **Mock Service:** `api/mocks/resend.ts`
- **Factory Pattern:** `api/mocks/index.ts` (lines 36-51 show current pattern)

Start by reading CLAUDE.md, then PRD_CONNECT_REAL_EMAIL_SERVICE.md, then begin implementation on a new branch.
```

---

## Usage

Copy the entire prompt above (between the triple backticks) and paste it into Claude Code CLI.

Claude Code will:
1. Read the context files
2. Create a branch with pattern `claude/connect-real-email-service-[unique-id]`
3. Implement the feature step-by-step
4. Write comprehensive tests
5. Create a Pull Request when complete

