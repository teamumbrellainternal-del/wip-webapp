---
id: task-1.1
title: "Implement OAuth Callback Route Handler"
status: "To Do"
assignee: []
created_date: "2025-11-15"
labels: ["backend", "P0", "auth"]
milestone: "M1 - Authentication & Session Management"
dependencies: ["task-0.2"]
estimated_hours: 3
---

## Description
Implement the OAuth callback handler that processes authentication responses from Apple/Google OAuth providers via Cloudflare Access. This route creates or updates user records and establishes sessions.

## Acceptance Criteria
- [ ] POST /v1/auth/callback endpoint implemented in api/routes/auth.ts
- [ ] Validates Cf-Access-Jwt-Assertion header
- [ ] Creates new user record in D1 if user doesn't exist
- [ ] Updates existing user's oauth_last_login timestamp
- [ ] Stores session in KV with appropriate TTL
- [ ] Returns JWT token and user object in response
- [ ] Redirects to /onboarding/step1 if onboarding_complete = false (D-006)
- [ ] Redirects to /dashboard if onboarding_complete = true

## Implementation Plan
1. Review oauth_providers in database schema (users table)
2. Extract and validate JWT from Cloudflare Access header
3. Check if user exists via oauth_id lookup in D1
4. Create user record if new, update login timestamp if existing
5. Generate session token and store in KV (24h TTL)
6. Determine redirect URL based on onboarding_complete flag
7. Return appropriate response with token and redirect

## Notes & Comments
**References:**
- docs/initial-spec/eng-spec.md - Design decision D-001 (OAuth-only auth)
- docs/initial-spec/eng-spec.md - Design decision D-006 (onboarding redirect)
- docs/AUTH.md - Authentication flow details
- api/models/user.ts - User model structure
- docs/SESSIONS.md - Session structure contract (created in task-0.2)

**Priority:** P0 - Blocks all user authentication
**File:** api/routes/auth.ts lines 19-165
**Dependencies:** task-0.2 (requires session structure contract)
**Can Run Parallel With:** task-1.2 (both use session contract from task-0.2)

**SESSION CONTRACT DEPENDENCY:**
This task creates sessions and stores them in KV. To enable parallel execution with task-1.2 (which validates sessions), both tasks MUST reference the session structure defined in `docs/SESSIONS.md` (created in task-0.2). Without this contract, task-1.1 and task-1.2 may make incompatible assumptions about session format.

**Session Structure (from task-0.2):**
```json
{
  "user_id": "string",
  "oauth_id": "string",
  "oauth_provider": "apple" | "google",
  "email": "string",
  "onboarding_complete": boolean,
  "created_at": "timestamp",
  "expires_at": "timestamp"
}
```

**Parallel Execution Strategy:**
- task-0.2 runs FIRST in Phase 0 → Creates session contract
- task-1.1 and task-1.2 run in PARALLEL → Both reference contract
- No race condition because contract defines shared standard
