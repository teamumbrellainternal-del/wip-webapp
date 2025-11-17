# Authentication & Session Management

## Overview

This document describes the authentication system for Umbrella MVP, including Clerk-based session management, JWT validation, and onboarding state tracking.

**⚠️ CLERK MIGRATION**: The system uses [Clerk](https://clerk.com) for authentication and session management. Clerk handles OAuth with Apple/Google, session lifecycle, and token management. Legacy references to custom JWT and KV session storage are being phased out.

## Architecture

### Authentication Flow

```
┌─────────────┐      ┌──────────────┐      ┌─────────┐      ┌────────┐
│   Frontend  │─────▶│  Cloudflare  │─────▶│ Worker  │─────▶│   D1   │
│             │      │    Access    │      │  Auth   │      │  User  │
└─────────────┘      └──────────────┘      └─────────┘      └────────┘
       │                     │                    │               │
       │                     │                    ▼               │
       │                     │              ┌─────────┐           │
       │                     │              │   KV    │           │
       │                     │              │ Session │           │
       │                     │              └─────────┘           │
       │                     │                                    │
       └─────────────────────┴────────────────────────────────────┘
                           JWT Token
```

### Key Components

1. **Cloudflare Access**: Handles OAuth with Apple/Google (per D-001)
2. **Worker Auth Routes**: Process OAuth callbacks and manage sessions
3. **D1 Database**: Stores user records
4. **KV Store**: Caches session data (7-day TTL)
5. **JWT Tokens**: Signed with HS256 for session validation

## API Endpoints

### POST /v1/auth/callback

OAuth callback handler - creates or retrieves user after OAuth.

**Request Body:**
```json
{
  "email": "user@example.com",
  "oauth_provider": "google",
  "oauth_id": "google-user-123"
}
```

**Response (New User):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-v4",
      "oauth_provider": "google",
      "oauth_id": "google-user-123",
      "email": "user@example.com",
      "onboarding_complete": false,
      "created_at": "2025-10-24T14:00:00.000Z",
      "updated_at": "2025-10-24T14:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_at": "2025-10-31T14:00:00.000Z",
    "redirect_url": "/onboarding/role-selection"
  },
  "meta": {
    "timestamp": "2025-10-24T14:00:00.000Z",
    "version": "v1"
  }
}
```

**Redirect Logic:**

| Condition | Redirect URL |
|-----------|-------------|
| New user (no artist profile) | `/onboarding/role-selection` |
| Existing user, onboarding incomplete, has artist profile | `/onboarding/artists/step1` |
| Existing user, onboarding incomplete, no artist profile | `/onboarding/role-selection` |
| Existing user, onboarding complete | `/dashboard` |

### GET /v1/auth/session

Check current session validity.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-v4",
      "oauth_provider": "google",
      "oauth_id": "google-user-123",
      "email": "user@example.com",
      "onboarding_complete": true,
      "created_at": "2025-10-24T14:00:00.000Z",
      "updated_at": "2025-10-24T14:00:00.000Z"
    },
    "valid": true
  }
}
```

### POST /v1/auth/refresh

Refresh session token (extends expiry by 7 days).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_at": "2025-10-31T14:00:00.000Z"
  }
}
```

### POST /v1/auth/logout

**⚠️ OPTIONAL ENDPOINT** - With Clerk, session management is handled client-side via `clerk.signOut()`. This backend endpoint is optional and primarily used for logging/analytics.

**Headers:**
```
Authorization: Bearer <clerk-session-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Logged out successfully"
  }
}
```

**Notes:**
- This endpoint does NOT invalidate sessions (Clerk handles that client-side)
- Used primarily for tracking logout events in analytics
- Returns success even if authentication fails (idempotent)
- Frontend should call `clerk.signOut()` for actual session termination

## JWT Structure

### Payload

```typescript
interface JWTPayload {
  sub: string          // user_id
  email: string        // User email from OAuth
  oauth_provider: string // 'apple' or 'google'
  oauth_id: string     // OAuth provider's user ID
  iat: number          // Issued at timestamp (seconds)
  exp: number          // Expiry timestamp (seconds, 7 days from iat)
}
```

### Algorithm

- **Algorithm**: HS256 (HMAC with SHA-256)
- **Secret**: Stored in `JWT_SECRET` environment variable
- **Expiry**: 7 days from issuance
- **Format**: Standard JWT format (header.payload.signature)

### Example Token

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsIm9hdXRoX3Byb3ZpZGVyIjoiZ29vZ2xlIiwib2F1dGhfaWQiOiJnb29nbGUtMTIzIiwiaWF0IjoxNzI5NzgwODAwLCJleHAiOjE3MzAzODU2MDB9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

## Session Management

### KV Storage

Sessions are cached in Cloudflare KV with a 7-day TTL.

**Key Format**: `session:{user_id}`

**Value Structure**:
```json
{
  "userId": "uuid-v4",
  "email": "user@example.com",
  "oauthProvider": "google"
}
```

### Session Lifecycle

1. **Creation**: Session created on successful OAuth callback
2. **Validation**: Session checked on protected routes via `authenticateRequest` middleware
3. **Refresh**: Session extended by 7 days on `/v1/auth/refresh`
4. **Expiry**: Automatic deletion after 7 days or manual logout
5. **Cleanup**: KV automatically removes expired sessions

## Authentication Middleware

### authenticateRequest

Validates JWT and returns user information.

```typescript
export async function authenticateRequest(
  request: Request,
  env: Env
): Promise<CloudflareAccessUser>
```

**Header Priority**:
1. `Cf-Access-Jwt-Assertion` (Cloudflare Access JWT)
2. `Authorization: Bearer <token>` (fallback for testing/development)

**Returns**:
```typescript
interface CloudflareAccessUser {
  userId: string
  email: string
  oauthProvider: string
  oauthId: string
}
```

**Throws**: Error with descriptive message if authentication fails

### checkOnboardingComplete

Checks if user has completed onboarding.

```typescript
export async function checkOnboardingComplete(
  userId: string,
  env: Env
): Promise<boolean>
```

## Onboarding State Tracking

### States

| State | Description | Next Step |
|-------|-------------|-----------|
| No user record | User hasn't authenticated | OAuth callback |
| User record, no artist profile | User created but hasn't selected role | `/onboarding/role-selection` |
| Artist profile, onboarding incomplete | User started but didn't finish onboarding | `/onboarding/artists/step1` |
| Onboarding complete | User ready to use platform | `/dashboard` |

### Design Decisions

- **D-001**: OAuth-only authentication (Apple/Google via Cloudflare Access)
- **D-003**: All 5 onboarding steps required before platform access
- **D-004**: No progress saved on exit (must complete in one session)
- **D-006**: Resume from last incomplete step if artist profile exists

## Security Considerations

### JWT Security

- **Secret Rotation**: Change `JWT_SECRET` periodically in production
- **Token Expiry**: 7-day expiry balances security and UX
- **Signature Verification**: All tokens validated before use
- **No Sensitive Data**: JWTs contain only user ID and OAuth info

### Session Security

- **KV Isolation**: Each user has separate session key
- **Automatic Cleanup**: Expired sessions removed by KV TTL
- **Logout Cleanup**: Sessions immediately deleted on logout
- **No Password Storage**: OAuth-only per D-001

### OAuth Security

- **Provider Trust**: Rely on Apple/Google OAuth security
- **Cloudflare Access**: Additional security layer before Worker
- **Email Verification**: Assume OAuth providers verify emails
- **Unique Constraints**: `(oauth_provider, oauth_id)` prevents duplicates

## Testing

### Unit Tests

- **JWT Creation**: `tests/unit/auth/jwt.test.ts`
- **JWT Verification**: Token validation, expiry, signature checks
- **Auth Routes**: OAuth callback, session check, logout, refresh

### Integration Tests

- **Complete Flows**: `tests/integration/auth-flow.test.ts`
- **New User Journey**: OAuth → Session → Refresh → Logout
- **Returning User**: Onboarding state detection
- **Edge Cases**: Multiple providers, rapid refreshes

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

## Error Handling

### Common Errors

| Error Code | HTTP Status | Description | Resolution |
|------------|-------------|-------------|------------|
| `validation_error` | 400 | Missing required fields | Check request body |
| `authentication_failed` | 401 | Invalid or expired token | Re-authenticate |
| `user_not_found` | 404 | User doesn't exist | Complete OAuth flow |
| `internal_error` | 500 | Server error | Check logs |

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "authentication_failed",
    "message": "JWT validation failed: Token expired",
    "field": null
  },
  "meta": {
    "timestamp": "2025-10-24T14:00:00.000Z",
    "version": "v1"
  }
}
```

## Environment Variables

Required environment variables in `wrangler.toml`:

```toml
[env.dev]
JWT_SECRET = "your-secret-key-min-32-chars"

[[env.dev.d1_databases]]
binding = "DB"
database_name = "umbrella-dev-db"

[[env.dev.kv_namespaces]]
binding = "KV"
id = "your-kv-namespace-id"
```

## Development Guide

### Local Testing

1. **Start Worker**:
   ```bash
   npm run dev:worker
   ```

2. **Test OAuth Callback**:
   ```bash
   curl -X POST http://localhost:8787/v1/auth/callback \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","oauth_provider":"google","oauth_id":"google-123"}'
   ```

3. **Extract Token** from response and test session:
   ```bash
   curl http://localhost:8787/v1/auth/session \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
   ```

### Adding New OAuth Providers

To add new OAuth providers (future work):

1. Update `oauth_provider` CHECK constraint in `db/schema.sql`:
   ```sql
   oauth_provider TEXT NOT NULL CHECK (oauth_provider IN ('apple', 'google', 'spotify'))
   ```

2. Update `JWTPayload` interface in `api/utils/jwt.ts`

3. Update tests to include new provider

## Performance Considerations

- **KV Caching**: Sessions cached to reduce D1 queries
- **JWT Validation**: Stateless validation (no DB lookup)
- **Session Refresh**: Only updates KV and generates new token
- **Logout**: Single KV delete operation

## Monitoring & Observability

### Key Metrics

- **OAuth Callback Success Rate**: Track successful vs. failed callbacks
- **Session Duration**: Average time between creation and logout
- **Token Refresh Rate**: How often users refresh tokens
- **Authentication Errors**: Track 401 responses by error type

### Logs

All authentication operations log to console:
- OAuth callback attempts
- JWT validation failures
- Session creation/deletion
- Unexpected errors

## Clerk Logout Flow

With Clerk, logout is primarily a client-side operation:

1. **Frontend calls `clerk.signOut()`**: This is the primary logout mechanism
2. **Clerk invalidates session**: Session tokens are revoked client-side
3. **User redirected**: Typically to login page or public homepage
4. **(Optional) Backend logging**: Frontend can call POST `/v1/auth/logout` for analytics

**Example Frontend Implementation:**
```typescript
import { useClerk } from '@clerk/clerk-react'

function LogoutButton() {
  const { signOut } = useClerk()

  const handleLogout = async () => {
    // Optional: Call backend for logging
    try {
      await fetch('/v1/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await getToken()}`,
        },
      })
    } catch (error) {
      console.error('Logout logging failed:', error)
    }

    // Primary logout action
    await signOut()
  }

  return <button onClick={handleLogout}>Logout</button>
}
```

**Key Points:**
- Backend session deletion is NOT required (Clerk manages sessions)
- Backend `/v1/auth/logout` endpoint is optional for analytics only
- Always call `clerk.signOut()` for actual session termination
- Logout is idempotent and always returns success

## Clerk Webhook Integration & Failure Recovery

### Webhook Event Flow

Clerk sends webhooks to notify our backend when user events occur:

```
┌────────────┐      ┌──────────────────┐      ┌─────────┐
│   Clerk    │─────▶│  POST /v1/auth/  │─────▶│   D1    │
│   Server   │      │     webhook      │      │  users  │
└────────────┘      └──────────────────┘      └─────────┘
                            │
                            │ (on error)
                            ▼
                    ┌──────────────────┐
                    │  Return 500      │
                    │  Clerk retries   │
                    └──────────────────┘
```

### Webhook Events

| Event | Description | Action |
|-------|-------------|--------|
| `user.created` | New user signs up | Create user record in D1 |
| `user.updated` | User profile updated | Update user email in D1 |
| `user.deleted` | User account deleted | Delete user from D1 |
| `session.created` | New session created | Log for monitoring |

### Webhook Retry Behavior

**Clerk's Retry Policy:**
- **Retries**: 3 attempts on 5xx errors
- **Backoff**: Exponential backoff between retries
- **Timeout**: 10 seconds per attempt
- **Final Failure**: If all 3 retries fail, event is lost

**Our Error Handling:**
```typescript
// On webhook error:
1. Log full error details to console
2. Increment KV counter: webhook_failures:{date}
3. Return 500 status (tells Clerk to retry)
```

### Email Verification with Google OAuth

**Google OAuth Pre-Verification:**
- Users signing up with Google OAuth have pre-verified emails
- Google provides verified email addresses in OAuth response
- No additional email verification step required
- Users can access platform immediately after signup

**Verification Status:**
- **Google/Apple OAuth**: Email pre-verified by provider
- **Manual Verification**: Not currently implemented (OAuth-only auth per D-001)

**Support Team Actions:**
- View user verification status in Clerk dashboard
- Manually verify users if needed (support escalation only)
- Check email verification in user profile settings

### Manual Sync (Webhook Failure Recovery)

**Problem:**
When webhooks fail (network issues, Worker deployment, rate limits), users authenticate successfully with Clerk but don't exist in our D1 database, preventing platform access.

**Solution:**
Automatic manual sync recovers from webhook failures transparently.

**Recovery Flow:**
```
┌──────────────────┐
│  User logs in    │
│  with Clerk      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Token validated  │
│ by auth middleware│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐      ┌─────────────────────┐
│ Query D1 for     │─────▶│ User found?         │
│ user by clerk_id │      │ → Return user       │
└──────────────────┘      └─────────────────────┘
         │                         │
         │ User NOT found          │
         ▼                         │
┌──────────────────────────┐      │
│ MANUAL SYNC TRIGGERED    │      │
│ 1. Fetch from Clerk API  │      │
│ 2. Extract email/provider│      │
│ 3. Create user in D1     │      │
│ 4. Log warning           │      │
│ 5. Increment counter     │      │
│ 6. Return user           │      │
└────────┬─────────────────┘      │
         │                        │
         └────────────────────────┘
                  │
                  ▼
          ┌──────────────┐
          │ User can now │
          │ use platform │
          └──────────────┘
```

**Implementation:**
- **Location**: `api/utils/clerk-sync.ts` - `syncClerkUser()`
- **Trigger**: Auth middleware when user not found in D1
- **Process**: Fetch from Clerk API, create in D1, log warning
- **Duplicate Prevention**: Check for existing user before creating
- **Monitoring**: Increment KV counter `manual_syncs:{date}`

**Code Example:**
```typescript
import { syncClerkUser } from '../utils/clerk-sync'

// In auth middleware
let user = await env.DB.prepare('SELECT * FROM users WHERE clerk_id = ?')
  .bind(clerkId)
  .first<User>()

if (!user) {
  // Manual sync triggered
  user = await syncClerkUser(clerkId, env)
  console.warn('[WEBHOOK FAILURE RECOVERY] User synced manually')
}
```

### Monitoring & Alerts

**Webhook Failure Tracking:**
```typescript
// KV Key: webhook_failures:{YYYY-MM-DD}
// Value: Integer count of failures for that day
// TTL: 7 days

const stats = await getWebhookFailureStats(env, 7)
// Returns: { '2025-11-17': 2, '2025-11-16': 0, ... }
```

**Manual Sync Tracking:**
```typescript
// KV Key: manual_syncs:{YYYY-MM-DD}
// Value: Integer count of manual syncs for that day
// TTL: 7 days

const stats = await getManualSyncStats(env, 7)
// Returns: { '2025-11-17': 3, '2025-11-16': 1, ... }
```

**Alert Thresholds:**
- **>5 manual syncs per day**: Indicates webhook endpoint unreliable
- **Action**: Investigate webhook configuration, check Worker health
- **Log Level**: ERROR with message about high sync count

**Monitoring Queries:**
```bash
# Check webhook failures (last 7 days)
wrangler kv:key list --namespace-id=<KV_ID> --prefix="webhook_failures:"

# Check manual syncs (last 7 days)
wrangler kv:key list --namespace-id=<KV_ID> --prefix="manual_syncs:"
```

### Testing Webhook Failure Recovery

**Test Scenario: Webhook Fails, User Signs Up, Manual Sync Recovers**

1. **Break webhook handler** (for testing):
   ```typescript
   // In api/routes/auth.ts - handleUserCreated()
   throw new Error('TESTING: Simulated webhook failure')
   ```

2. **Sign up new user via Clerk**:
   - User creates account with Google OAuth
   - Clerk webhook fires but fails (returns 500)
   - Clerk retries 3 times, all fail
   - User authenticated with Clerk, but NOT in D1

3. **Make authenticated API call**:
   ```bash
   curl -H "Authorization: Bearer <clerk-token>" \
        http://localhost:8787/v1/auth/session
   ```

4. **Verify manual sync triggered**:
   - Check logs for `[WEBHOOK FAILURE RECOVERY]` messages
   - User successfully created in D1
   - Response includes user data
   - Counter incremented: `manual_syncs:2025-11-17`

5. **Verify user can use platform**:
   - Subsequent API calls work normally
   - User can complete onboarding
   - No repeated sync attempts

**Expected Logs:**
```
[WEBHOOK ERROR] user.created failed: {...}
[KV] Incremented webhook_failures:2025-11-17 to 1
[AUTH MIDDLEWARE] User user_xxx not found in D1. Attempting manual sync...
[WEBHOOK FAILURE RECOVERY] Fetching user from Clerk API
[WEBHOOK FAILURE RECOVERY] Successfully created user for Clerk ID user_xxx
[KV] Incremented manual_syncs:2025-11-17 to 1
[AUTH MIDDLEWARE] Manual sync successful, proceeding with request
```

### Troubleshooting

**Issue: High webhook failure rate**
- **Check**: Webhook secret configured correctly
- **Check**: Worker deployment health
- **Check**: Network connectivity to Clerk
- **Action**: Review Worker logs for specific errors

**Issue: High manual sync rate**
- **Indicates**: Webhook endpoint unreliable
- **Check**: Worker resource limits (CPU, memory)
- **Check**: Database connection pool
- **Action**: Investigate root cause, fix webhook handler

**Issue: Manual sync fails**
- **Check**: Clerk API key valid
- **Check**: User exists in Clerk
- **Check**: Database schema matches expectations
- **Action**: User must re-authenticate

**Issue: Duplicate users created**
- **Prevention**: UNIQUE constraint on `clerk_id` column
- **Handling**: Manual sync catches duplicate error, fetches existing user
- **Action**: No action needed, handled automatically

## Future Enhancements

- [ ] Add session device tracking (browser, IP)
- [ ] Implement "remember me" with longer expiry
- [ ] Add email verification for secondary emails
- [ ] Support multi-device session management
- [ ] Add rate limiting for auth endpoints
- [ ] Implement session activity timestamps
- [ ] Integrate Clerk webhooks for advanced session tracking

## References

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk React SDK](https://clerk.com/docs/references/react/use-clerk)
- [Clerk Backend SDK](https://clerk.com/docs/references/backend/overview)
- [Clerk Webhooks](https://clerk.com/docs/integrations/webhooks/overview)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)
- [OAuth 2.0 Spec](https://datatracker.ietf.org/doc/html/rfc6749)
- Architecture Spec: D-001 (OAuth-only), D-003 (Onboarding), D-004 (No save), D-006 (Resume)
