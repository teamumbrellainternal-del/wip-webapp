---
id: task-1.2
title: "Implement Session Validation Endpoint"
status: "To Do"
assignee: []
created_date: "2025-11-15"
labels: ["backend", "P0", "auth"]
milestone: "M1 - Authentication & Session Management"
dependencies: ["task-0.2"]
estimated_hours: 2
---

## Description
Create an endpoint that validates session tokens and returns current user data. This endpoint is called by the frontend on app load to restore authenticated sessions.

## Acceptance Criteria
- [ ] GET /v1/auth/session endpoint implemented in api/routes/auth.ts
- [ ] Extracts session token from Authorization header
- [ ] Validates token signature and expiration
- [ ] Retrieves session data from KV
- [ ] Fetches current user record from D1
- [ ] Returns user object and session metadata
- [ ] Returns 401 error for invalid/expired tokens
- [ ] Handles missing tokens gracefully

## Implementation Plan
1. Extract Bearer token from Authorization header
2. Validate JWT signature using JWT_SECRET
3. Check token expiration timestamp
4. Lookup session in KV using token
5. If session exists, fetch user from D1
6. Return user data with onboarding_complete status
7. Implement error handling for various failure modes

## Notes & Comments
**References:**
- docs/AUTH.md - Session validation flow
- api/utils/jwt.ts - JWT utilities
- api/models/user.ts - User model
- docs/SESSIONS.md - Session structure contract (created in task-0.2)

**Priority:** P0 - Required for protected routes
**File:** api/routes/auth.ts
**Dependencies:** task-0.2 (requires session structure contract)
**Can Run Parallel With:** task-1.1 (both use session contract from task-0.2)

**CRITICAL PATH:** This task MUST complete before task-1.4 (Authentication Middleware). Task-1.4 blocks all backend endpoints in M2-M9 (~40 tasks), making this one of the most critical tasks in the entire project.

**SESSION CONTRACT DEPENDENCY:**
This task validates sessions created by task-1.1. To enable parallel execution, both tasks MUST reference the session structure defined in `docs/SESSIONS.md` (created in task-0.2). Without this contract, task-1.1 might create sessions in format A while task-1.2 expects format B, causing validation failures.

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
- Integration testing occurs after both tasks complete

**Dependency Resolution (REFINEMENT_REPORT_pt2.md Issue #1):**
Original concern: How can task-1.2 validate sessions that don't exist yet?
Resolution: Session contract allows parallel development. Integration testing validates compatibility after both tasks complete.
