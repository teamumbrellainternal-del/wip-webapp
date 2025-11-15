---
id: task-1.3
title: "Implement Logout Endpoint"
status: "To Do"
assignee: []
created_date: "2025-11-15"
labels: ["backend", "P0", "auth"]
milestone: "M1 - Authentication & Session Management"
dependencies: []
estimated_hours: 1
---

## Description
**OPTIONAL ENDPOINT** - Create a lightweight logout endpoint for logging/analytics purposes. With Clerk, session management is handled client-side via `clerk.signOut()`, so this backend endpoint is optional and primarily for tracking logout events.

⚠️ **MAJOR CHANGE**: Clerk manages sessions. Frontend calls `clerk.signOut()` directly. This backend endpoint is OPTIONAL and only used for logging/analytics.

## Acceptance Criteria

### Option 1: Keep Simple Endpoint (Recommended)
- [ ] DELETE /v1/auth/session endpoint implemented in api/routes/auth.ts
- [ ] Logs logout event for analytics/monitoring
- [ ] Returns success confirmation (200 OK)
- [ ] No session deletion needed (Clerk handles this)

### Option 2: Remove Endpoint Entirely
- [ ] Remove DELETE /v1/auth/session from API
- [ ] Frontend uses Clerk's `signOut()` method only
- [ ] Update API documentation to reflect removal

## Implementation Plan

### If Keeping Endpoint (Option 1):
```typescript
async function logout(request: Request): Promise<Response> {
  // Optional: Extract user info for logging
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')

  // Log logout event
  console.log({
    event: 'user_logout',
    timestamp: new Date().toISOString(),
    // Could include user_id if needed for analytics
  })

  return new Response(JSON.stringify({
    success: true,
    message: 'Logged out successfully'
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}
```

### If Removing Endpoint (Option 2):
1. Remove DELETE /v1/auth/session route
2. Update API contract documentation
3. Frontend implementation:
   ```typescript
   import { useClerk } from '@clerk/nextjs'

   function LogoutButton() {
     const { signOut } = useClerk()

     return (
       <button onClick={() => signOut()}>
         Logout
       </button>
     )
   }
   ```

## Notes & Comments
**References:**
- docs/AUTH.md - Logout flow
- Clerk signOut documentation
- api/routes/auth.ts

**Priority:** P3 (OPTIONAL) - Clerk handles logout
**File:** api/routes/auth.ts (if keeping endpoint)
**Can Run Parallel With:** All auth tasks

**CLERK MIGRATION CHANGES:**
- ❌ **Removed:** KV session deletion (no longer needed)
- ❌ **Removed:** Session token parsing
- ⚠️ **Changed:** Endpoint is now OPTIONAL
- ✅ **Added:** Frontend uses `clerk.signOut()` directly
- ✅ **Optional:** Backend endpoint for logging only

**Recommendation:**
Consider **Option 2 (Remove Endpoint)** unless you have specific requirements for:
- Server-side logout logging
- Analytics tracking of logout events
- Audit trails

Clerk handles all session invalidation automatically, making this endpoint unnecessary for core functionality.

**Frontend Logout Flow (Clerk):**
1. User clicks logout button
2. Frontend calls `clerk.signOut()`
3. Clerk invalidates session client-side
4. User redirected to login page
5. Optional: Call backend endpoint for logging

**Why This Changed:**
- Clerk manages session lifecycle (creation, validation, expiration, revocation)
- No custom session storage in KV/Redis needed
- Session tokens are handled by Clerk's infrastructure
- Logout is a client-side operation (clearing cookies/tokens)
