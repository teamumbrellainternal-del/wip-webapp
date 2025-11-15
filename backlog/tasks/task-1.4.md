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

### Authentication Middleware
- [ ] requireAuth() middleware function created in api/middleware/auth.ts
- [ ] Validates session token from Authorization header
- [ ] Calls session validation logic (reuse from task-1.2)
- [ ] Attaches user object to request context
- [ ] Returns 401 for invalid/missing tokens
- [ ] Returns 403 for valid tokens but incomplete onboarding (when required)
- [ ] Exports middleware for use in other route handlers

### Error Handling Middleware (NEW - from REFINEMENT_REPORT_pt2.md Issue #6)
- [ ] Create global error handler middleware in api/middleware/error.ts
- [ ] Catch all uncaught exceptions from route handlers
- [ ] Return standardized error response format:
  ```json
  {
    "error": {
      "code": "ERROR_CODE",
      "message": "Human-readable error message",
      "details": { /* optional additional context */ }
    }
  }
  ```
- [ ] Map common errors to appropriate HTTP status codes:
  - 400: Validation errors (invalid input, missing fields)
  - 401: Authentication errors (invalid/expired token)
  - 403: Authorization errors (insufficient permissions)
  - 404: Not found errors (resource doesn't exist)
  - 500: Internal server errors (database errors, unexpected failures)
- [ ] Log all errors to console with stack traces
- [ ] Sanitize error messages (don't expose internal details in production)
- [ ] Apply error handler to all routes globally

## Implementation Plan

### 1. Authentication Middleware (api/middleware/auth.ts)
1. Create requireAuth() middleware function that accepts Request and Env
2. Extract token from Authorization header (Bearer format)
3. Call session validation logic (reuse from task-1.2)
4. On success: attach user object to request context, call next()
5. On failure: throw appropriate error (handled by error middleware)
6. Create optional requireOnboarding() variant for routes needing complete profiles

### 2. Error Handling Middleware (api/middleware/error.ts)
1. Create global error handler that wraps all route handlers
2. Implement try-catch for all route logic
3. Define standardized error response format
4. Create error type mapping:
   ```typescript
   const ERROR_MAPPINGS = {
     ValidationError: { status: 400, code: 'VALIDATION_ERROR' },
     AuthenticationError: { status: 401, code: 'AUTHENTICATION_ERROR' },
     AuthorizationError: { status: 403, code: 'AUTHORIZATION_ERROR' },
     NotFoundError: { status: 404, code: 'NOT_FOUND' },
     DatabaseError: { status: 500, code: 'INTERNAL_SERVER_ERROR' },
     // ... more mappings
   };
   ```
5. Log all errors with stack traces to console:
   ```typescript
   console.error('[ERROR]', {
     timestamp: new Date().toISOString(),
     error: error.message,
     stack: error.stack,
     path: request.url,
     method: request.method
   });
   ```
6. Sanitize error messages for production (don't expose DB queries, file paths, etc.)
7. Return standardized error response
8. Apply error handler globally to all routes

## Notes & Comments
**References:**
- docs/initial-spec/architecture.md - Middleware patterns
- api/middleware/auth.ts
- api/middleware/error.ts (NEW)
- api/utils/jwt.ts
- docs/API_CONTRACT.md - Error response format (from task-0.2)

**Priority:** P0 - Blocks all protected endpoints
**File:** api/middleware/auth.ts, api/middleware/error.ts
**Dependencies:** Requires task-1.2 (session validation logic)
**Unblocks:** All onboarding, profile, marketplace, messaging tasks

**CRITICAL BOTTLENECK:** This task BLOCKS all backend endpoints in M2-M9 (~40 tasks). After task-1.2 completes, this becomes the HIGHEST priority task in the project. Every backend API endpoint depends on this middleware for authentication.

**ERROR HANDLING MIDDLEWARE ADDITION (REFINEMENT_REPORT_pt2.md Issue #6):**
Originally, this task only included authentication middleware. However, Issue #6 identified that there's no standardized error handling for routes in M2-M9. Without error handling middleware:
- Routes would implement ad-hoc error responses (inconsistent formats)
- Uncaught exceptions would crash workers
- Integration with Sentry (task-10.2) would be harder

**Solution:** Add error handling middleware to this task. This provides:
- ✅ Standardized error responses across all endpoints
- ✅ Consistent HTTP status codes
- ✅ Proper error logging (Sentry integration comes later in task-10.2)
- ✅ No additional time cost (fits within 2-hour estimate)

**Why Combine with task-1.4:**
- Auth middleware and error handling are foundational infrastructure
- Both block all M2-M9 backend work
- Both should be in place before downstream development starts
- Easier to test together (error handling tests auth failures)

**Sentry Integration Note:**
task-10.2 (Error Tracking) will later add Sentry integration. The error handling middleware created here logs to console. task-10.2 will enhance logging to also send to Sentry, but the basic error handling structure is needed NOW.
