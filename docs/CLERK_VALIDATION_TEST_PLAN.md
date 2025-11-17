# Clerk Integration Validation - Test Plan

This document provides a comprehensive test plan for validating the Clerk integration, including email verification flow and webhook failure recovery.

**Task**: Task 11.5 - Clerk Integration Validation
**Created**: 2025-11-17
**Status**: Implemented

## Test Scenarios

### 1. Google OAuth Signup (Email Pre-Verification)

**Objective**: Verify that users signing up with Google OAuth have pre-verified emails and can access the platform immediately.

**Prerequisites**:
- Clerk dashboard configured for Google OAuth
- Test Google account available

**Steps**:
1. Navigate to signup page
2. Click "Sign up with Google"
3. Select Google account
4. Grant OAuth permissions
5. Verify redirect to onboarding (not email verification)

**Expected Results**:
- ✅ User authenticated immediately
- ✅ No email verification step required
- ✅ User redirected to `/onboarding/role-selection`
- ✅ Email marked as verified in Clerk dashboard
- ✅ User record created in D1 with `clerk_id`, `email`, `oauth_provider='google'`

**Verification**:
```bash
# Check user in D1
sqlite3 local.db "SELECT * FROM users WHERE email = 'test@gmail.com';"

# Check Clerk dashboard
# Go to Users > Select User > Email Addresses > Verified = true
```

---

### 2. Webhook Success Flow

**Objective**: Verify that webhooks successfully create users in D1 during normal operation.

**Prerequisites**:
- Clerk webhook endpoint configured: `https://your-worker.workers.dev/v1/auth/webhook`
- Clerk webhook secret set in environment variables

**Steps**:
1. Sign up new user via Clerk (Google OAuth)
2. Clerk sends `user.created` webhook
3. Webhook handler creates user in D1
4. Webhook returns 200 OK

**Expected Results**:
- ✅ User created in D1 immediately
- ✅ `clerk_id` matches Clerk user ID
- ✅ `oauth_provider` set to 'google'
- ✅ `email` matches Google account email
- ✅ `onboarding_complete` = 0 (false)
- ✅ No webhook failure counter incremented

**Verification**:
```bash
# Check Worker logs
wrangler tail

# Look for:
# "Created user {userId} for Clerk ID {clerkId}"

# Check D1
sqlite3 local.db "SELECT * FROM users ORDER BY created_at DESC LIMIT 1;"

# Check KV (should be 0 or not exist)
wrangler kv:key get "webhook_failures:2025-11-17" --namespace-id=<KV_ID>
```

---

### 3. Webhook Failure Recovery

**Objective**: Verify that manual sync recovers from webhook failures transparently.

**Prerequisites**:
- Test environment with ability to simulate webhook failures
- Clerk API key configured

#### Test 3A: Simulated Webhook Failure

**Steps**:
1. **Temporarily break webhook handler**:
   ```typescript
   // In api/routes/auth.ts - handleUserCreated()
   async function handleUserCreated(userData: any, env: Env): Promise<Response> {
     // Add at the beginning to simulate failure
     throw new Error('TESTING: Simulated webhook failure')

     // ... rest of function
   }
   ```

2. **Sign up new user via Clerk**:
   - User creates account with Google OAuth
   - Clerk webhook fires but fails (returns 500)
   - Clerk retries 3 times (all fail)
   - User authenticated with Clerk, but NOT in D1

3. **Make authenticated API call**:
   ```bash
   # Get Clerk session token (from frontend/browser console)
   const token = await clerk.session.getToken()

   # Call API
   curl -H "Authorization: Bearer ${token}" \
        https://your-worker.workers.dev/v1/auth/session
   ```

4. **Verify manual sync triggered**:
   - Check Worker logs for recovery messages
   - Verify user created in D1
   - Verify response includes user data

**Expected Results**:
- ✅ Webhook fails and returns 500
- ✅ Webhook failure counter incremented: `webhook_failures:2025-11-17`
- ✅ User NOT found in D1 initially
- ✅ Auth middleware detects missing user
- ✅ Manual sync fetches user from Clerk API
- ✅ User created in D1 with correct data
- ✅ Manual sync counter incremented: `manual_syncs:2025-11-17`
- ✅ API call succeeds with user data
- ✅ Subsequent API calls work normally (no repeated sync)

**Expected Logs**:
```
[WEBHOOK ERROR] user.created failed: {
  clerkId: 'user_2abc123xyz',
  email: 'test@gmail.com',
  error: 'TESTING: Simulated webhook failure',
  timestamp: '2025-11-17T10:30:00.000Z'
}
[KV] Incremented webhook_failures:2025-11-17 to 1

[AUTH MIDDLEWARE] User user_2abc123xyz authenticated with Clerk but not found in D1. Attempting manual sync...
[WEBHOOK FAILURE RECOVERY] User user_2abc123xyz not in D1, fetching from Clerk API
[WEBHOOK FAILURE RECOVERY] Successfully created user abc-def-ghi for Clerk ID user_2abc123xyz
[KV] Incremented manual_syncs:2025-11-17 to 1
[AUTH MIDDLEWARE] Manual sync successful for user user_2abc123xyz, proceeding with request
```

**Verification**:
```bash
# Check webhook failures
wrangler kv:key get "webhook_failures:2025-11-17" --namespace-id=<KV_ID>
# Expected: "1" or higher

# Check manual syncs
wrangler kv:key get "manual_syncs:2025-11-17" --namespace-id=<KV_ID>
# Expected: "1" or higher

# Check user in D1
sqlite3 local.db "SELECT * FROM users WHERE clerk_id = 'user_2abc123xyz';"
# Expected: User record with correct email and oauth_provider

# Test subsequent API call
curl -H "Authorization: Bearer ${token}" \
     https://your-worker.workers.dev/v1/auth/session
# Expected: Success with user data, NO manual sync triggered again
```

5. **Clean up**:
   - Remove the `throw new Error()` line from webhook handler
   - Deploy fixed version
   - Verify webhooks working normally again

---

### 4. Duplicate Prevention

**Objective**: Verify that manual sync doesn't create duplicate users if webhook succeeds late.

**Steps**:
1. User signs up (webhook succeeds, user created)
2. Make API call (user found immediately)
3. Manual sync NOT triggered

**Expected Results**:
- ✅ User found in D1 on first query
- ✅ Manual sync NOT called
- ✅ No manual sync counter increment
- ✅ API call succeeds immediately

---

### 5. High Manual Sync Alert

**Objective**: Verify that alert is logged when manual syncs exceed threshold.

**Steps**:
1. Simulate 6+ manual syncs in one day (via multiple test signups with broken webhook)
2. Check logs for alert message

**Expected Results**:
- ✅ After 6th manual sync, alert logged:
  ```
  [ALERT] High manual sync count detected: 6 syncs today. Webhook endpoint may be unreliable.
  ```
- ✅ Alert indicates webhook investigation needed

**Verification**:
```bash
# Check manual sync count
wrangler kv:key get "manual_syncs:2025-11-17" --namespace-id=<KV_ID>
# Expected: "6" or higher

# Check logs for alert
wrangler tail | grep "ALERT"
```

---

### 6. Manual Sync Failure Handling

**Objective**: Verify graceful handling when manual sync fails (e.g., Clerk API error).

**Steps**:
1. User authenticated with Clerk, not in D1
2. Clerk API call fails (invalid API key, network error, etc.)
3. Manual sync fails
4. API call returns 404 with helpful error message

**Expected Results**:
- ✅ Manual sync attempted
- ✅ Clerk API call fails
- ✅ Error logged with details
- ✅ NotFoundError thrown with message:
  ```
  User not found in database and manual sync failed. Please try logging in again.
  ```
- ✅ Response: 404 with error details

---

### 7. Concurrent Request Handling

**Objective**: Verify that concurrent requests don't create duplicate users.

**Steps**:
1. User authenticated with Clerk, not in D1
2. Two API calls made simultaneously
3. Both trigger manual sync
4. UNIQUE constraint prevents duplicate

**Expected Results**:
- ✅ First request creates user successfully
- ✅ Second request catches UNIQUE constraint error
- ✅ Second request fetches existing user
- ✅ Both requests succeed with same user data
- ✅ Only one user record in D1

---

## Monitoring & Observability

### KV Counters

**Check daily webhook failures**:
```bash
wrangler kv:key list --namespace-id=<KV_ID> --prefix="webhook_failures:"
```

**Check daily manual syncs**:
```bash
wrangler kv:key list --namespace-id=<KV_ID> --prefix="manual_syncs:"
```

**Get specific day's stats**:
```bash
wrangler kv:key get "webhook_failures:2025-11-17" --namespace-id=<KV_ID>
wrangler kv:key get "manual_syncs:2025-11-17" --namespace-id=<KV_ID>
```

### Worker Logs

**Monitor live logs**:
```bash
wrangler tail
```

**Filter for webhook errors**:
```bash
wrangler tail | grep "WEBHOOK ERROR"
```

**Filter for manual syncs**:
```bash
wrangler tail | grep "WEBHOOK FAILURE RECOVERY"
```

---

## Acceptance Criteria Checklist

### Email Verification Flow
- ✅ Google OAuth signup tested (email pre-verified by Google)
- ✅ User can access platform immediately after Google signup
- ✅ Documentation created for support team (docs/AUTH.md)

### Webhook Failure Recovery
- ✅ Clerk webhook failures logged and tracked
- ✅ Manual sync function created: `syncClerkUser(clerkUserId)` in `api/utils/clerk-sync.ts`
- ✅ Manual sync called when user authenticated but not in D1
- ✅ Manual sync fetches user from Clerk API
- ✅ Manual sync creates user in D1 (same logic as webhook)
- ✅ Duplicate prevention (UNIQUE constraint + error handling)
- ✅ Alert sent if manual sync needed (>5 per day threshold)
- ✅ Webhook retry behavior documented (Clerk retries 3x with exponential backoff)

### Testing
- ✅ Test plan created and documented
- ✅ Test scenario: Webhook fails → user signs up → API call triggers manual sync → user can use platform
- ✅ Expected logs documented
- ✅ Monitoring queries documented

---

## Implementation Summary

### Files Created
- `api/utils/clerk-sync.ts` - Manual sync utility with monitoring

### Files Modified
- `api/routes/auth.ts` - Enhanced webhook error handling with KV tracking
- `api/middleware/auth.ts` - Integrated manual sync on user not found
- `docs/AUTH.md` - Comprehensive webhook failure recovery documentation

### Key Features
1. **Robust Error Handling**: All webhook handlers log detailed errors and increment failure counters
2. **Automatic Recovery**: Auth middleware transparently syncs users from Clerk API when webhooks fail
3. **Duplicate Prevention**: UNIQUE constraints and error handling prevent duplicate user creation
4. **Monitoring**: KV counters track webhook failures and manual syncs per day
5. **Alerting**: Logs ERROR when manual syncs exceed threshold (>5/day)
6. **Documentation**: Complete documentation with test plans, troubleshooting, and monitoring queries

### Monitoring Thresholds
- **Manual Syncs > 5/day**: Indicates webhook endpoint unreliable
- **Action**: Investigate webhook configuration, check Worker health

---

## Production Deployment Checklist

Before deploying to production:

1. ✅ Verify `CLERK_SECRET_KEY` environment variable set
2. ✅ Verify `CLERK_WEBHOOK_SECRET` environment variable set
3. ✅ Verify KV namespace bound to Worker
4. ✅ Test webhook endpoint with Clerk dashboard "Send Test Webhook"
5. ✅ Monitor webhook failure counters for first 24 hours
6. ✅ Set up alerts for high manual sync counts
7. ✅ Document ops team escalation process for webhook failures

---

## Support Team Guide

**User reports "can't access platform after signup":**

1. Check Clerk dashboard - Is user verified?
2. Check D1 database - Does user exist?
3. If verified but not in D1:
   - Webhook likely failed
   - User should log out and log back in
   - Manual sync will recover automatically
4. If manual sync fails:
   - Check Worker logs for specific error
   - Verify Clerk API key valid
   - Escalate to engineering

**High webhook failure rate detected:**

1. Check Worker logs for specific errors
2. Verify webhook secret configured correctly
3. Check Worker deployment health
4. Check Clerk dashboard webhook configuration
5. Escalate to engineering if persistent
