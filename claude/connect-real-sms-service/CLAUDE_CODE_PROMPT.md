# Claude Code CLI Prompt - SMS Service

Copy and paste this entire prompt into Claude Code CLI:

---

```
Read CLAUDE.md for full context about this codebase and implementation patterns.

Then implement the SMS Service connection feature following PRD_CONNECT_REAL_SMS_SERVICE.md.

## Environment Variables Setup

**Important:** The project uses environment variables configured in:
- `wip-webapp/.env` - Local environment variables (for frontend/build)
- `wip-webapp/.dev.vars` - Development variables for Wrangler (Cloudflare Workers)

**Reference files:**
- `wip-webapp/.env.example` - Example frontend environment variables (lines 40-44 show Twilio and Claude API keys)
- `wip-webapp/.dev.vars.example` - Example Wrangler environment variables (lines 19-22 show Twilio credentials)

**For SMS Service:**
- `TWILIO_ACCOUNT_SID` is configured in `.dev.vars` (see `.dev.vars.example` line 20)
- `TWILIO_AUTH_TOKEN` is configured in `.dev.vars` (see `.dev.vars.example` line 21)
- `TWILIO_PHONE_NUMBER` is configured in `.dev.vars` (see `.dev.vars.example` line 22)
- **Note:** The factory uses `TWILIO_FROM_PHONE` but `.dev.vars.example` shows `TWILIO_PHONE_NUMBER` - verify which name is actually used in the codebase by checking `api/mocks/index.ts` and `wrangler.toml`
- The factory checks for both `env.TWILIO_ACCOUNT_SID` AND `env.TWILIO_AUTH_TOKEN` AND `env.DB` binding
- In local development with `wrangler dev`, environment variables come from `.dev.vars`
- The actual `.dev.vars` file exists (not just `.dev.vars.example`) - Claude Code should be aware these variables are already set up
- When testing, you can use mocked API responses - real API keys are not required for implementation

## Branch Management

1. Create a new branch with naming pattern: `claude/connect-real-sms-service-[unique-id]`
   - Generate a unique identifier (timestamp or random string)
   - Example format: `claude/connect-real-sms-service-$(date +%s)` or use a short hash
   
2. Work entirely on this branch - do not modify main or other branches

3. When implementation is complete, create a Pull Request:
   - Base branch: `main`
   - Title: "feat(services): connect real Twilio SMS service to factory"
   - Description: Use the PR template from PRD_CONNECT_REAL_SMS_SERVICE.md (around lines 756-787)
   - Include all acceptance criteria checklist items from the PRD

## Implementation Requirements

Follow the PRD step-by-step (PRD_CONNECT_REAL_SMS_SERVICE.md):

1. **Step 1:** Update Service Factory Imports
   - Uncomment line 13 in `api/mocks/index.ts`: `import { TwilioSMSService, createTwilioService } from '../services/twilio'`

2. **Step 2:** Create Union Type
   - Add after imports: `type SMSService = MockTwilioService | TwilioSMSService`

3. **Step 3:** Update Factory Function Logic
   - Replace `getSMSService()` function (lines 58-78 in `api/mocks/index.ts`)
   - Uncomment the real service return statement (lines 67-73)
   - Update return type to `SMSService`
   - Add try/catch error handling with fallback to mock
   - **CRITICAL:** Handle default phone number: `env.TWILIO_FROM_PHONE || '+15555551234'`
   - **CRITICAL:** Require both `TWILIO_ACCOUNT_SID` AND `TWILIO_AUTH_TOKEN`
   - Follow the pattern shown in PRD (lines 239-271)

4. **Step 4:** Update Service Status Function
   - Modify `getServiceStatus()` to accurately reflect SMS service status
   - Check for both `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` (both required)
   - Check for `DB` binding
   - Follow pattern in PRD (lines 280-305)

5. **Step 5:** Verify Type Compatibility
   - Run `npm run type-check` - must pass with no errors
   - Ensure no type errors introduced

6. **Step 6:** Write Comprehensive Tests
   - Create `tests/unit/services/sms-service.test.ts` with all test cases from PRD (lines 330-432)
   - Create `tests/integration/sms-service.test.ts` with all test cases from PRD (lines 434-583)
   - **CRITICAL:** Include rate limiting tests (PRD lines 532-560)
   - **CRITICAL:** Test phone number validation (PRD lines 473-488)
   - **CRITICAL:** Test message length validation (PRD lines 490-506)
   - All tests must pass
   - Use mocked API responses (no real API calls needed)

7. **Step 7:** Update Documentation
   - Update `api/mocks/README.md` if it exists (follow PRD lines 772-776)
   - Update `SERVICES_STATUS_REPORT.md` if it exists (follow PRD lines 778-780)
   - Follow PRD documentation requirements (lines 768-799)

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
4. **Testing:** Write tests for all scenarios including:
   - Rate limiting (10 messages/second)
   - Phone number validation (E.164 format)
   - Message length validation (1600 char limit)
   - Default phone number fallback
   - Both credentials required (SID and Auth Token)
   - Error cases and fallbacks

## SMS-Specific Requirements

1. **Multiple Credentials:** Factory must check for BOTH `TWILIO_ACCOUNT_SID` AND `TWILIO_AUTH_TOKEN`
   - If either is missing, use mock service
   - Test both scenarios (missing SID, missing Token)

2. **Default Phone Number:** Handle `TWILIO_FROM_PHONE` with fallback
   - Use `env.TWILIO_FROM_PHONE || '+15555551234'` as default
   - Pass to both mock and real service constructors

3. **Rate Limiting:** Real service has rate limiting (10 messages/second)
   - Test rate limiter works correctly
   - Test that rate limit is enforced
   - See PRD lines 532-560 for rate limiting test requirements

4. **Validation:** Real service validates:
   - Phone numbers (E.164 format)
   - Message length (1600 char limit)
   - Test both validation scenarios

## Workflow

1. Read `CLAUDE.md` completely for context
2. Read `PRD_CONNECT_REAL_SMS_SERVICE.md` completely
3. Review existing factory pattern in `api/mocks/index.ts` (lines 58-78)
4. Review real service implementation: `api/services/twilio.ts`
   - Pay attention to rate limiter implementation
   - Note constructor parameters
5. Review mock service implementation: `api/mocks/twilio.ts`
6. Create branch: `claude/connect-real-sms-service-[unique-id]`
7. Implement step-by-step following PRD
8. Write tests as you implement (don't skip tests, especially rate limiting)
9. Run `npm run type-check` after each major step
10. Run `npm run lint` after each major step  
11. Run `npm run test` after each major step
12. Verify all acceptance criteria from PRD are met
13. Create Pull Request when complete

## Verification Checklist

Before considering implementation complete, verify:

- [ ] Factory returns real service when `USE_MOCKS = "false"` and both Twilio secrets exist
- [ ] Factory returns mock service by default (backward compatible)
- [ ] Factory requires BOTH `TWILIO_ACCOUNT_SID` AND `TWILIO_AUTH_TOKEN`
- [ ] Factory uses default phone number when `TWILIO_FROM_PHONE` not provided
- [ ] Union type created correctly
- [ ] Service status function updated correctly
- [ ] All unit tests added and passing
- [ ] All integration tests added and passing
- [ ] Rate limiting tests added and passing
- [ ] Phone number validation tests added and passing
- [ ] Message length validation tests added and passing
- [ ] TypeScript compilation succeeds (`npm run type-check`)
- [ ] ESLint passes (`npm run lint`)
- [ ] All existing tests still pass
- [ ] Documentation updated
- [ ] No breaking changes
- [ ] Code follows existing patterns

## Files to Modify

- `api/mocks/index.ts` - Main factory file (uncomment imports, update functions)
- `tests/unit/services/sms-service.test.ts` - New file (create)
- `tests/integration/sms-service.test.ts` - New file (create)
- `api/mocks/README.md` - Update if exists
- `SERVICES_STATUS_REPORT.md` - Update if exists

## Reference Files

- **PRD:** `PRD_CONNECT_REAL_SMS_SERVICE.md`
- **Context:** `CLAUDE.md`
- **Environment Setup:** `claude/CLAUDE_CODE_ENVIRONMENT_SETUP.md`
- **Real Service:** `api/services/twilio.ts`
- **Mock Service:** `api/mocks/twilio.ts`
- **Factory Pattern:** `api/mocks/index.ts` (lines 58-78 show current pattern)

## Important Notes

- **Rate Limiting:** The real service implements a token bucket rate limiter (10 messages/second). Test this thoroughly.
- **Phone Number Format:** Must be E.164 format (e.g., `+1234567890`)
- **Message Length:** Maximum 1600 characters
- **Default Phone:** Use `'+15555551234'` as fallback if `TWILIO_FROM_PHONE` not provided
- **Both Credentials Required:** Unlike email service, SMS requires TWO secrets (SID and Token)

Start by reading CLAUDE.md, then PRD_CONNECT_REAL_SMS_SERVICE.md, then begin implementation on a new branch.
```

---

## Usage

Copy the entire prompt above (between the triple backticks) and paste it into Claude Code CLI in a separate terminal instance.

Claude Code will:

1. Read the context files
2. Create a branch with pattern `claude/connect-real-sms-service-[unique-id]`
3. Implement the feature step-by-step
4. Write comprehensive tests (especially rate limiting)
5. Create a Pull Request when complete

## Parallel Execution

You can run this in parallel with the Email Service implementation:

- **Terminal 1:** Email Service (`claude/connect-real-email-service/CLAUDE_CODE_PROMPT.md`)
- **Terminal 2:** SMS Service (`claude/connect-real-sms-service/CLAUDE_CODE_PROMPT.md`)

Both features modify different parts of `api/mocks/index.ts` and create different test files, so they won't conflict.
