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
Create an endpoint that validates Clerk session tokens and returns current user data. This endpoint is called by the frontend on app load to restore authenticated sessions.

## Acceptance Criteria
- [ ] GET /v1/auth/session endpoint implemented in api/routes/auth.ts
- [ ] Extracts Clerk session token from Authorization header (Bearer format)
- [ ] Uses `@clerk/backend` SDK for token verification
- [ ] Validates token signature and expiration via Clerk
- [ ] Fetches current user record from D1 (by clerk_user_id)
- [ ] Returns user object and session metadata
- [ ] Returns 401 error for invalid/expired tokens
- [ ] Handles missing tokens gracefully
- [ ] Works with Clerk's session token format

## Implementation Plan
1. Extract Bearer token from Authorization header
2. Verify token using `@clerk/backend` SDK's `verifyToken()` function
3. Extract Clerk user ID from verified session (`session.sub`)
4. Query D1 for user by `clerk_user_id` column
5. Return user data with onboarding_complete status and session metadata
6. Implement error handling for:
   - Missing Authorization header
   - Invalid/expired Clerk token
   - User not found in D1 (edge case: webhook hasn't synced yet)

## Example Implementation

```typescript
import { verifyToken } from '@clerk/backend'

async function validateSession(request: Request, env: Env): Promise<Response> {
  // 1. Extract token
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) {
    return new Response(JSON.stringify({
      error: { code: 'MISSING_TOKEN', message: 'Authorization header required' }
    }), { status: 401 })
  }

  try {
    // 2. Verify Clerk token
    const session = await verifyToken(token, {
      secretKey: env.CLERK_SECRET_KEY
    })

    // 3. Fetch user from D1
    const user = await env.DB.prepare(
      'SELECT * FROM users WHERE clerk_user_id = ?'
    ).bind(session.sub).first()

    if (!user) {
      return new Response(JSON.stringify({
        error: { code: 'USER_NOT_FOUND', message: 'User not found' }
      }), { status: 404 })
    }

    // 4. Return user and session data
    return new Response(JSON.stringify({
      user: {
        id: user.id,
        clerk_user_id: user.clerk_user_id,
        email: user.email,
        onboarding_complete: user.onboarding_complete
      },
      session: {
        clerk_session_id: session.sid,
        expires_at: new Date(session.exp * 1000).toISOString()
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Token verification failed:', error)
    return new Response(JSON.stringify({
      error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' }
    }), { status: 401 })
  }
}
```

## Notes & Comments
**References:**
- docs/AUTH.md - Session validation flow
- `@clerk/backend` SDK documentation
- api/models/user.ts - User model
- docs/SESSIONS.md - Session structure contract (created in task-0.2)

**Priority:** P0 - Required for protected routes
**File:** api/routes/auth.ts
**Dependencies:** task-1.1 (Clerk webhook must create users first)

**CRITICAL PATH:** This task MUST complete before task-1.4 (Authentication Middleware). Task-1.4 blocks all backend endpoints in M2-M9 (~40 tasks), making this one of the most critical tasks in the entire project.

**CLERK MIGRATION CHANGES:**
- ❌ **Removed:** Custom JWT validation using JWT_SECRET
- ❌ **Removed:** KV session lookup
- ❌ **Removed:** `Cf-Access-Jwt-Assertion` header
- ✅ **Added:** Clerk token verification via `@clerk/backend` SDK
- ✅ **Added:** Standard `Authorization: Bearer <token>` header
- ✅ **Added:** D1 query by `clerk_user_id` column

**Session Response Format (Updated for Clerk):**
```json
{
  "user": {
    "id": "uuid-v4",
    "clerk_user_id": "user_2abc...",
    "email": "artist@example.com",
    "onboarding_complete": false
  },
  "session": {
    "clerk_session_id": "sess_xyz...",
    "expires_at": "2025-11-16T12:00:00Z"
  }
}
```

**How This Works with Clerk:**
1. Frontend obtains Clerk session token after OAuth
2. Frontend sends token via `Authorization: Bearer <token>` header
3. Backend validates token using Clerk SDK (no custom JWT logic)
4. Backend fetches user from D1 using `clerk_user_id` from token
5. Returns user data and session metadata

**Edge Cases:**
- User authenticated with Clerk but not yet synced to D1 (webhook delay)
  - Return 404 with clear error message
  - Frontend should retry after brief delay
- Token expired (handled by Clerk SDK)
  - Return 401, frontend triggers re-authentication
