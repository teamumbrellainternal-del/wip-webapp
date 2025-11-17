---
id: task-11.5
title: "Clerk Integration Validation"
status: "To Do"
assignee: []
created_date: "2025-11-17"
labels: ["auth", "P1", "testing", "backend"]
milestone: "M11 - Pre-Launch Readiness & Compliance"
dependencies: ["task-1.1", "task-1.4"]
estimated_hours: 4
---

## Description
Validate Clerk integration end-to-end: email verification flow (Google OAuth pre-verified), webhook failure recovery, and resilience testing.

## Acceptance Criteria
- [ ] Google OAuth signup tested (email pre-verified by Google)
- [ ] User can access platform immediately after Google signup
- [ ] Clerk webhook failures logged and tracked
- [ ] Manual sync function created: syncClerkUser(clerkUserId)
- [ ] Manual sync called when user authenticated but not in D1
- [ ] Manual sync fetches user from Clerk API
- [ ] Manual sync creates user in D1 (same logic as webhook)
- [ ] Duplicate prevention (don't create if exists)
- [ ] Alert sent if manual sync needed (indicates webhook failure)
- [ ] Webhook retry behavior documented (Clerk retries 3x)
- [ ] Test: Webhook fails → user signs up → API call triggers manual sync → user can use platform

## Implementation Plan

### Email Verification Flow (1 hour)
1. Review Clerk dashboard email verification settings
2. Test Google OAuth signup:
   - Sign up with Google account
   - Verify email is pre-verified (Google provides verified email)
   - Confirm immediate access to platform
   - No additional verification required
3. Document for support team:
   - Google users pre-verified (no extra step)
   - How to verify user status in Clerk dashboard
   - How to manually verify if needed (support only)

### Webhook Failure Recovery (3 hours)
4. Add error handling to webhook handler (api/routes/auth.ts):
   - Wrap all webhook logic in try-catch
   - On error: log to console with full details
   - On error: increment KV counter: webhook_failures:{date}
   - Return 500 (tells Clerk to retry)
5. Create api/utils/clerk-sync.ts:
   ```typescript
   async function syncClerkUser(clerkUserId: string, env: Env) {
     // Check if user exists in D1
     const existing = await env.DB.prepare(
       'SELECT id FROM users WHERE clerk_user_id = ?'
     ).bind(clerkUserId).first();
     
     if (existing) return existing;
     
     // Fetch from Clerk API
     const clerkUser = await fetch(
       `https://api.clerk.com/v1/users/${clerkUserId}`,
       { headers: { Authorization: `Bearer ${env.CLERK_SECRET_KEY}` } }
     ).then(r => r.json());
     
     // Extract email
     const email = clerkUser.email_addresses.find(
       e => e.id === clerkUser.primary_email_address_id
     )?.email_address;
     
     // Create user (same logic as webhook)
     const userId = crypto.randomUUID();
     await env.DB.prepare(`
       INSERT INTO users (id, clerk_user_id, email, oauth_provider, oauth_id, onboarding_complete, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     `).bind(userId, clerkUserId, email, 'google', clerkUserId, false, new Date().toISOString(), new Date().toISOString()).run();
     
     console.warn('[WEBHOOK FAILURE RECOVERY] Manually synced:', clerkUserId);
     return { id: userId, clerk_user_id: clerkUserId, email };
   }
   ```
6. Integrate into auth middleware (api/middleware/auth.ts):
   - After validating Clerk token
   - Before querying D1 for user
   - If user not found: call syncClerkUser()
   - Log warning (indicates webhook failed)
   - Continue request normally
7. Add alert on manual sync:
   - Increment KV: manual_syncs:{date}
   - If >5 per day: send alert email (webhook unreliable)
8. Document Clerk webhook retry in docs/AUTH.md:
   - Clerk retries 3x on 5xx errors
   - Exponential backoff
   - If all fail: event lost (manual sync recovers)
9. Test webhook failure recovery:
   - Break webhook handler (throw error)
   - Sign up new user via Clerk
   - Make authenticated API call
   - Verify manual sync creates user
   - Verify user can use platform

## Notes & Comments
**Priority:** P1 - Important for reliability (not launch blocking but important)

**Files to Create:**
- api/utils/clerk-sync.ts

**Files to Modify:**
- api/routes/auth.ts (add webhook error handling)
- api/middleware/auth.ts (integrate manual sync)
- docs/AUTH.md (document retry behavior)

**Dependencies:** Requires task-1.1 (Clerk webhook) and task-1.4 (auth middleware)

**Why This Matters:** Webhook failures are rare but do happen (network issues, Worker deployment during webhook). Without recovery, user authenticated with Clerk but doesn't exist in D1 → cannot use platform. Manual sync resolves transparently.

**Monitoring:** Track manual syncs per day. Many manual syncs indicates webhook endpoint unreliable. Investigate and fix underlying issue.
`
