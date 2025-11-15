---
id: task-1.2
title: "Implement Session Validation Endpoint"
status: "To Do"
assignee: []
created_date: "2025-11-15"
labels: ["backend", "P0", "auth"]
milestone: "M1 - Authentication & Session Management"
dependencies: []
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

**Priority:** P0 - Required for protected routes
**File:** api/routes/auth.ts
**Can Run Parallel With:** task-1.1, task-1.3, task-1.5

**CRITICAL PATH:** This task MUST complete before task-1.4 (Authentication Middleware). Task-1.4 blocks all backend endpoints in M2-M9 (~40 tasks), making this one of the most critical tasks in the entire project.
