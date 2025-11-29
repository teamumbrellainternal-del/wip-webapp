# Backend API Infrastructure

**Session 1 Implementation - Infrastructure Build**

This document describes the backend API infrastructure completed in Session 1 of the Umbrella MVP build.

## Completed

- [x] Worker entry point with routing
- [x] Authentication middleware (Cloudflare Access compatible)
- [x] Auth routes (callback, session, logout)
- [x] Utilities copied from boilerplate (jwt, crypto, encoding, uuid, response)
- [x] CORS middleware
- [x] Error handling middleware
- [x] Health check endpoint
- [x] Wrangler configuration for dev/staging/production
- [x] Environment variables template

## Architecture Overview

The Umbrella API is built on Cloudflare Workers with the following stack:

- **Runtime**: Cloudflare Workers (edge compute)
- **Database**: D1 (SQLite at edge)
- **Cache**: KV (key-value store)
- **Storage**: R2 (S3-compatible object storage)
- **Authentication**: Cloudflare Access JWT validation
- **Language**: TypeScript

## Directory Structure

```
api/
├── index.ts                    # Worker entry point
├── middleware/
│   ├── auth.ts                 # Cloudflare Access JWT validation
│   ├── cors.ts                 # CORS headers handling
│   └── error-handler.ts        # Global error handling
├── routes/
│   ├── auth.ts                 # Authentication endpoints
│   └── health.ts               # Health check endpoint
└── utils/
    ├── jwt.ts                  # JWT utilities
    ├── crypto.ts               # Encryption utilities
    ├── encoding.ts             # Base64URL encoding
    ├── uuid.ts                 # UUID generation
    └── response.ts             # JSON response helpers
```

## API Endpoints Implemented

### Authentication Endpoints

#### POST /v1/auth/callback
OAuth callback handler - creates or retrieves user after OAuth authentication.

**Request Body:**
```json
{
  "email": "user@example.com",
  "oauth_provider": "apple",
  "oauth_id": "001234.abc123..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "onboarding_complete": false
    },
    "token": "jwt-token-here"
  }
}
```

#### GET /v1/auth/session
Check current session validity.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "oauth_provider": "apple",
      "onboarding_complete": false
    },
    "valid": true
  }
}
```

#### POST /v1/auth/logout
Clear user session.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

### Health Check Endpoint

#### GET /v1/health
Returns API health status (no authentication required).

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "service": "umbrella-api",
    "version": "0.1.0",
    "timestamp": "2025-10-23T12:00:00.000Z",
    "environment": "development"
  }
}
```

## Authentication Flow

### Development/Testing Flow (JWT Bearer Token)
1. Client calls POST /v1/auth/callback with OAuth data
2. Worker creates/retrieves user from D1
3. Worker generates JWT token (7-day expiry)
4. Worker stores session in KV (7-day TTL)
5. Client receives token and user data
6. Client includes token in Authorization header for authenticated requests

### Production Flow (Cloudflare Access)
1. User authenticates via Cloudflare Access (Apple/Google OAuth)
2. Cloudflare Access sets JWT in `Cf-Access-Jwt-Assertion` header
3. Worker validates JWT on each request
4. Worker extracts user info and checks D1 for user record
5. If new user → create user record, redirect to onboarding
6. If existing user → check onboarding_complete flag

## Middleware

### Authentication Middleware (auth.ts)
- Validates JWT tokens (both Cloudflare Access and Bearer tokens)
- Extracts user information (userId, email, OAuth provider)
- Checks user existence in database
- Supports fallback to Authorization header for testing

### CORS Middleware (cors.ts)
- Adds CORS headers to all responses
- Handles preflight OPTIONS requests
- Allows all origins in development (configure for production)

### Error Handler Middleware (error-handler.ts)
- Catches all unhandled errors
- Converts errors to appropriate HTTP status codes
- Returns consistent error response format
- Logs errors for debugging

## Utilities

### jwt.ts
- JWT verification with HS256 algorithm
- JWT creation for session tokens
- Signature validation
- Expiry checking

### crypto.ts
- AES-256-GCM encryption/decryption
- Master key generation
- Nonce generation for encryption

### encoding.ts
- Base64URL encoding/decoding
- RFC 4648 compliant
- Used for JWT and encryption

### uuid.ts
- UUID v4 generation (random)
- UUID v5 generation (deterministic)
- UUID validation

### response.ts
- Success response helper
- Error response helper
- Consistent JSON format

## Environment Configuration

### Development Environment
```bash
# Create Cloudflare resources
wrangler d1 create umbrella-dev-db
wrangler kv:namespace create KV --preview
wrangler r2 bucket create umbrella-dev-media

# Copy environment variables
cp .dev.vars.example .dev.vars
# Edit .dev.vars with your API keys

# Run locally
wrangler dev
```

### Staging Environment
- Separate D1, KV, R2 resources
- Deploy with: `wrangler deploy --env staging`

### Production Environment
- Production D1, KV, R2 resources
- Deploy with: `wrangler deploy --env production`

## Manual Setup Required

1. **Create D1 database**
   ```bash
   wrangler d1 create umbrella-dev-db
   ```
   Copy the database_id and update wrangler.toml

2. **Create KV namespace**
   ```bash
   wrangler kv:namespace create KV --preview
   ```
   Copy the id and update wrangler.toml

3. **Create R2 bucket**
   ```bash
   wrangler r2 bucket create umbrella-dev-media
   ```

4. **Configure environment variables**
   ```bash
   cp .dev.vars.example .dev.vars
   # Edit .dev.vars with your actual values
   ```

5. **Add secrets for production**
   ```bash
   wrangler secret put JWT_SECRET
   wrangler secret put CLAUDE_API_KEY
   wrangler secret put RESEND_API_KEY
   wrangler secret put TWILIO_ACCOUNT_SID
   wrangler secret put TWILIO_AUTH_TOKEN
   wrangler secret put TWILIO_PHONE_NUMBER
   ```

6. **Configure Cloudflare Access (optional for production)**
   - Set up Apple OAuth application
   - Set up Google OAuth application
   - Configure Cloudflare Access with OAuth providers
   - Update access policies

## Testing

### Run Locally
```bash
wrangler dev
```

### Test Health Check
```bash
curl http://localhost:8787/v1/health
```

### Test Auth Callback
```bash
curl -X POST http://localhost:8787/v1/auth/callback \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "oauth_provider": "google",
    "oauth_id": "123456789"
  }'
```

### Test Session Check
```bash
curl http://localhost:8787/v1/auth/session \
  -H "Authorization: Bearer <jwt-token-from-callback>"
```

### Test Logout
```bash
curl -X POST http://localhost:8787/v1/auth/logout \
  -H "Authorization: Bearer <jwt-token>"
```

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "error_code",
    "message": "Human-readable error message",
    "field": "field_name (optional)"
  }
}
```

### Error Codes
- `authentication_failed` (401) - Invalid or expired JWT
- `unauthorized` (403) - Valid auth but insufficient permissions
- `validation_error` (400) - Invalid input data
- `not_found` (404) - Resource doesn't exist
- `rate_limit_exceeded` (429) - Too many requests
- `internal_error` (500) - Server error
- `not_implemented` (501) - Endpoint not yet implemented

## Architecture Notes

### Authentication Strategy
- **Development**: JWT tokens with HS256 algorithm, 7-day expiry
- **Production**: Cloudflare Access JWT validation
- **Session Storage**: KV with 7-day TTL
- **User Lookup**: Composite key (oauth_provider + oauth_id)
- **Onboarding Check**: Flag checked on every authenticated request

### Security Features
- JWT signature verification
- Token expiry validation
- Session storage in KV (encrypted at rest)
- OAuth-only authentication (no passwords)
- CORS protection
- Input validation on all endpoints

### Performance Optimizations
- KV caching for sessions (avoid repeated D1 queries)
- Edge execution (Cloudflare Workers at 300+ locations)
- Stateless Workers (horizontal auto-scaling)
- CORS headers cached (reduce overhead)

## Next Steps (Future Sessions)

The following endpoints will be implemented in future sessions:

### Session 2: UI Foundation
- Frontend components and hooks
- React app shell
- Theme system

### Session 3: Database & Models
- D1 migrations for all tables
- TypeScript models for all entities
- Service layer for business logic

### Session 4: DevOps & Build
- GitHub Actions workflows
- Build scripts
- Testing setup

### Future API Endpoints
1. **Profile Endpoints** (GET/PUT /v1/profile)
2. **Onboarding Endpoints** (POST /v1/onboarding/*)
3. **Marketplace Endpoints** (GET /v1/gigs, /v1/artists)
4. **Messaging Endpoints** (GET/POST /v1/conversations/*)
5. **File Management** (POST /v1/files/upload, R2 signed URLs)
6. **Analytics** (GET /v1/analytics)
7. **Violet AI** (POST /v1/violet/prompt with rate limiting)
8. **Search** (GET /v1/search)

## Troubleshooting

### Worker won't start
- Check that wrangler.toml has correct binding names (DB, KV, BUCKET)
- Verify .dev.vars has all required secrets
- Check for syntax errors: `npm run type-check`

### Authentication fails
- Verify JWT_SECRET is set in .dev.vars
- Check that user exists in D1 users table
- Verify token format: should be "Bearer <token>"

### Database queries fail
- Check that D1 database is created: `wrangler d1 list`
- Verify database_id in wrangler.toml matches created database
- Run migrations (when available in Session 3)

### CORS errors
- Verify CORS middleware is applied to all routes
- Check browser console for specific CORS error
- Ensure OPTIONS requests return 204 status

## File Boundaries

**Session 1 owns these files:**
- ✅ `api/*` (all API code)
- ✅ `wrangler.toml`
- ✅ `.dev.vars.example`
- ✅ `docs/backend-api-setup.md`

**Do NOT modify these files (owned by other sessions):**
- ❌ `src/*` (Session 2: UI Foundation)
- ❌ `db/*` (Session 3: Database Schema)
- ❌ `.github/*` (Session 4: DevOps)
- ❌ `scripts/*` (Session 4: DevOps)
- ❌ Root config files except wrangler.toml (Session 4: DevOps)

## Success Criteria

- [x] Worker runs with `wrangler dev`
- [x] Auth middleware validates JWT tokens
- [x] Routes return proper JSON responses
- [x] CORS headers applied to all responses
- [x] Error handling catches and formats errors
- [x] Health check returns 200 OK
- [x] Documentation complete with API examples
- [x] No file conflicts with other sessions
- [x] Environment configuration ready for all environments

## Contributors

- **Session 1**: Backend API Infrastructure
- **Architecture Reference**: architecture.md, eng-spec.md
- **Inspiration**: app.leger.run boilerplate patterns

---

**Built with [Claude Code](https://claude.com/claude-code)**

**Last Updated**: October 23, 2025
