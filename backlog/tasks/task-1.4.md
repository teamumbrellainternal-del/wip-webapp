---
id: task-1.4
title: "Create Authentication Middleware"
status: "To Do"
assignee: []
created_date: "2025-11-15"
labels: ["backend", "P0", "auth", "middleware"]
milestone: "M1 - Authentication & Session Management"
dependencies: ["task-1.2"]
estimated_hours: 2
---

## Description
Implement authentication middleware that validates sessions for protected routes. This middleware will be used across all endpoints that require authentication.

## Acceptance Criteria
- [ ] requireAuth() middleware function created in api/middleware/auth.ts
- [ ] Validates session token from Authorization header
- [ ] Calls session validation logic (reuse from task-1.2)
- [ ] Attaches user object to request context
- [ ] Returns 401 for invalid/missing tokens
- [ ] Returns 403 for valid tokens but incomplete onboarding (when required)
- [ ] Exports middleware for use in other route handlers

## Implementation Plan
1. Create middleware function that accepts Request and Env
2. Extract token from Authorization header
3. Call session validation logic
4. On success: attach user to request context, call next()
5. On failure: return appropriate error response
6. Create optional requireOnboarding() variant for routes needing complete profiles

## Notes & Comments
**References:**
- docs/initial-spec/architecture.md - Middleware patterns
- api/middleware/auth.ts
- api/utils/jwt.ts

**Priority:** P0 - Blocks all protected endpoints
**File:** api/middleware/auth.ts
**Dependencies:** Requires task-1.2 (session validation logic)
**Unblocks:** All onboarding, profile, marketplace, messaging tasks
