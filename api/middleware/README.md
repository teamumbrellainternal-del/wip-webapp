# Middleware

Request middleware for the Umbrella API.

## Authentication (Clerk)

Authentication uses [Clerk](https://clerk.com) with Google OAuth.

### Setup

1. Create Clerk application at [dashboard.clerk.com](https://dashboard.clerk.com)
2. Enable Google OAuth under Social Connections
3. Create webhook for `user.created`, `user.updated`, `user.deleted` events
4. Set environment variables:

```bash
CLERK_SECRET_KEY=sk_...          # From Clerk dashboard
CLERK_PUBLISHABLE_KEY=pk_...     # From Clerk dashboard  
CLERK_WEBHOOK_SECRET=whsec_...   # From webhook settings
```

### How It Works

1. Frontend uses Clerk SDK for Google OAuth login
2. Clerk issues JWT token after successful auth
3. Frontend sends token in `Authorization: Bearer <token>` header
4. `auth.ts` validates token via `@clerk/backend`
5. User record fetched/synced from D1 database

### Public Routes (No Auth)

These routes do not require authentication:
- `GET /v1/health` - Health check
- `GET /media/*` - Serve files from R2
- `POST /v1/auth/webhook` - Clerk webhook
- `GET /v1/auth/session` - Check session
- `POST /v1/auth/logout` - Logout
- `GET /v1/profile/:id` - Public artist profile
- `GET /v1/profile/:artistId/tracks` - Artist's tracks
- `GET /v1/profile/:artistId/reviews` - Artist's reviews
- `GET /v1/artists/:id` - Artist details
- `GET /v1/artists/:id/tracks` - Artist tracks
- `GET /v1/artists/:id/reviews` - Artist reviews
- `GET /v1/tracks/:id` - Single track
- `POST /v1/reviews` - Submit review (token-based)
- `GET /v1/reviews/invite/:token` - Review invite details
- `GET /v1/analytics/spotlight` - Featured artists

### Auth Functions

```typescript
import { requireAuth, requireOnboarding } from '../middleware/auth'

// Basic auth - just validates token
const user = await requireAuth(request, env)
// user.id, user.email, user.clerk_id available

// Requires completed onboarding (throws 403 if incomplete)
const user = await requireOnboarding(request, env)
```

### Admin Routes

Admin routes use `adminMiddleware` which checks for `role: "admin"` in Clerk publicMetadata:

```typescript
import { requireAdmin } from '../middleware/admin'

const adminUser = await requireAdmin(request, env)
```

## Other Middleware

| File | Purpose |
|------|---------|
| `admin.ts` | Admin role verification via Clerk metadata |
| `cors.ts` | CORS headers for allowed origins |
| `rate-limit.ts` | Request rate limiting via KV |
| `validation.ts` | Request body validation |
| `error-handler.ts` | Consistent error responses |
| `error.ts` | Error class definitions |
| `logger.ts` | Request logging |

## Troubleshooting

**"User not found" after login**
- Check Clerk webhook is configured correctly
- Verify webhook secret matches `CLERK_WEBHOOK_SECRET`
- Check Workers logs for webhook errors

**"Invalid token" errors**  
- Ensure `CLERK_SECRET_KEY` is correct
- Token may be expired - Clerk SDK handles refresh automatically
