# API

Cloudflare Worker backend serving the Umbrella REST API.

## Architecture

```
api/
├── index.ts           # Worker entry point
├── router.ts          # Route registration
├── routes/            # Route definitions (auth, health)
├── controllers/       # Request handlers by domain
├── middleware/        # Auth, CORS, rate-limit, validation
├── models/            # TypeScript interfaces
├── services/          # External services (Claude, Resend, Pusher)
├── storage/           # D1, KV, R2 abstractions
├── mocks/             # Mock services for dev/preview
├── config/            # Environment configuration
├── constants/         # Shared constants
└── utils/             # Helpers (validation, errors, etc.)
```

## Endpoints by Implementation Status

### Auth - IMPLEMENTED

| Method | Path | Description |
| ------ | ---- | ----------- |
| POST | `/v1/auth/webhook` | Clerk webhook handler |
| GET | `/v1/auth/session` | Get current session |
| POST | `/v1/auth/logout` | End session |
| POST | `/v1/auth/refresh` | Refresh session |

### Onboarding - IMPLEMENTED

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/v1/onboarding/status` | Get onboarding progress |
| POST | `/v1/onboarding/artists/step1` | Identity & basics |
| POST | `/v1/onboarding/artists/step2` | Links & story |
| POST | `/v1/onboarding/artists/step3` | Creative profile |
| POST | `/v1/onboarding/artists/step4` | Numbers (final step) |

### Profile - IMPLEMENTED

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/v1/profile` | Get own profile |
| PUT | `/v1/profile` | Update profile |
| DELETE | `/v1/profile` | Delete profile |
| GET | `/v1/profile/completion` | Profile completion % |
| GET | `/v1/profile/actions` | Suggested actions |
| POST | `/v1/profile/avatar` | Upload avatar |
| GET | `/v1/profile/:id` | Public profile (no auth) |

### Profile Tracks - IMPLEMENTED

| Method | Path | Description |
| ------ | ---- | ----------- |
| POST | `/v1/profile/tracks/upload` | Get upload URL |
| POST | `/v1/profile/tracks` | Create track record |
| GET | `/v1/profile/:artistId/tracks` | List artist tracks |
| DELETE | `/v1/profile/tracks/:trackId` | Delete track |

### Artists - IMPLEMENTED

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/v1/artists` | Discover artists (with filters) |
| GET | `/v1/artists/:id` | Get artist profile |
| GET | `/v1/artists/:id/follow` | Check follow status |
| POST | `/v1/artists/:id/follow` | Follow artist |
| DELETE | `/v1/artists/:id/follow` | Unfollow artist |

| Method | Path | Status |
| ------ | ---- | ------ |
| GET | `/v1/artists/:id/tracks` | **STUB** - Returns empty |
| GET | `/v1/artists/:id/reviews` | **STUB** - Returns empty |

### Gigs - IMPLEMENTED

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/v1/gigs` | List/filter gigs |
| POST | `/v1/gigs` | Create gig (venue) |
| GET | `/v1/gigs/mine` | My posted gigs |
| GET | `/v1/gigs/applications` | My applications |
| GET | `/v1/gigs/:id` | Gig details |
| PUT | `/v1/gigs/:id` | Update gig |
| DELETE | `/v1/gigs/:id` | Cancel gig |
| GET | `/v1/gigs/:id/applications` | View applications |
| PUT | `/v1/gigs/:id/applications/:appId` | Accept/reject |
| POST | `/v1/gigs/:id/apply` | Apply to gig |
| DELETE | `/v1/gigs/:id/apply` | Withdraw application |

### Messages - MOSTLY IMPLEMENTED

| Method | Path | Status |
| ------ | ---- | ------ |
| GET | `/v1/conversations` | Implemented |
| GET | `/v1/conversations/:id` | Implemented |
| GET | `/v1/conversations/:id/messages` | Implemented |
| POST | `/v1/conversations` | Implemented |
| POST | `/v1/conversations/:id/messages` | Implemented |
| POST | `/v1/conversations/:id/read` | Implemented |
| DELETE | `/v1/conversations/:id` | **STUB** - Returns success, no deletion |
| POST | `/v1/messages/booking-inquiry` | Implemented |

### Reviews - IMPLEMENTED

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/v1/profile/:artistId/reviews` | List reviews (public) |
| POST | `/v1/profile/reviews/invite` | Invite reviewer |
| POST | `/v1/reviews` | Submit review (token-based) |
| GET | `/v1/reviews/invite/:token` | Get invite details |

### Files - IMPLEMENTED

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/v1/files` | List files |
| GET | `/v1/files/storage` | Storage stats |
| GET | `/v1/files/quota` | Quota info |
| GET | `/v1/files/:id` | Get file |
| POST | `/v1/files/upload` | Get upload URL |
| POST | `/v1/files` | Confirm upload |
| DELETE | `/v1/files/:id` | Delete file |
| POST | `/v1/files/folders` | Create folder |
| PUT | `/v1/files/:fileId/move` | Move file |

### Journal - IMPLEMENTED

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/v1/journal` | List entries |
| GET | `/v1/journal/:id` | Get entry |
| POST | `/v1/journal` | Create entry |
| PUT | `/v1/journal/:id` | Update entry |
| DELETE | `/v1/journal/:id` | Delete entry |

### Violet AI - MOSTLY IMPLEMENTED

| Method | Path | Status |
| ------ | ---- | ------ |
| POST | `/v1/violet/prompt` | Implemented (Claude) |
| GET | `/v1/violet/usage` | Implemented |
| GET | `/v1/violet/suggestions` | Implemented |
| GET | `/v1/violet/history` | **STUB** - Returns empty |
| DELETE | `/v1/violet/history` | **STUB** - Returns success |
| GET | `/v1/violet/conversations` | Implemented |
| POST | `/v1/violet/conversations` | Implemented |
| GET | `/v1/violet/conversations/:id` | Implemented |
| POST | `/v1/violet/conversations/:id/messages` | Implemented |

### Search - PARTIALLY IMPLEMENTED

| Method | Path | Status |
| ------ | ---- | ------ |
| GET | `/v1/search` | Implemented (artists + gigs) |
| GET | `/v1/search/artists` | Implemented |
| GET | `/v1/search/gigs` | Implemented |
| GET | `/v1/search/tracks` | **STUB** - Not in MVP |
| GET | `/v1/search/suggestions` | **STUB** - Not in MVP |

### Analytics - MOSTLY STUBS

| Method | Path | Status |
| ------ | ---- | ------ |
| GET | `/v1/analytics` | Implemented |
| GET | `/v1/analytics/dashboard` | Implemented |
| GET | `/v1/analytics/spotlight` | Implemented (public) |
| GET | `/v1/analytics/goals` | Implemented |
| POST | `/v1/analytics/goals` | Implemented |
| PUT | `/v1/analytics/goals/:id` | Implemented |
| DELETE | `/v1/analytics/goals/:id` | Implemented |
| GET | `/v1/analytics/achievements` | Implemented |
| GET | `/v1/analytics/performance` | Implemented |
| GET | `/v1/analytics/profile-views` | **STUB** - Returns zeros |
| GET | `/v1/analytics/gigs` | **STUB** - Returns zeros |
| GET | `/v1/analytics/messages` | **STUB** - Returns zeros |
| GET | `/v1/analytics/violet` | **STUB** - Returns zeros |
| GET | `/v1/analytics/storage` | **STUB** - Returns zeros |

### Broadcasts - MOSTLY STUBS

| Method | Path | Status |
| ------ | ---- | ------ |
| POST | `/v1/broadcasts` | Implemented (sends email/SMS) |
| GET | `/v1/broadcasts` | **STUB** - Returns empty |
| GET | `/v1/broadcasts/:id` | **STUB** - Returns placeholder |
| GET | `/v1/broadcasts/:id/stats` | **STUB** - Returns zeros |
| DELETE | `/v1/broadcasts/:id` | **STUB** - Returns success |

### Contacts - IMPLEMENTED

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/v1/contacts/lists` | Get contact lists |
| POST | `/v1/contacts/lists` | Create list |
| GET | `/v1/contacts` | Get contacts |
| POST | `/v1/contacts` | Add contact |
| POST | `/v1/contacts/import` | Bulk import |
| PUT | `/v1/contacts/:contactId` | Update contact |
| DELETE | `/v1/contacts/:contactId` | Delete contact |

### Admin (Retool) - IMPLEMENTED

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/v1/admin/stats` | Dashboard overview |
| GET | `/v1/admin/users` | List users |
| GET | `/v1/admin/artists` | List artists |
| GET | `/v1/admin/violet-usage` | AI usage stats |
| GET | `/v1/admin/gigs` | List gigs |
| GET | `/v1/admin/gig-applications` | Applications |
| GET | `/v1/admin/reviews` | List reviews |
| GET | `/v1/admin/messages` | List messages |

### Other

| Method | Path | Status |
| ------ | ---- | ------ |
| GET | `/v1/health` | Implemented |
| GET | `/media/*` | Implemented (R2 file serving) |
| POST | `/v1/pusher/auth` | Implemented |
| DELETE | `/v1/account` | Implemented |

---

## Not Implemented

| Feature | Status |
| ------- | ------ |
| Twilio SMS | Configured but not connected |
| Track search | Deferred (not in MVP) |
| Search autocomplete | Deferred (not in MVP) |
| Detailed analytics | Stubs return placeholder data |

---

## Environment Variables

See `.github/workflows/README.md` for complete secrets documentation.

```bash
# Auth
CLERK_SECRET_KEY=sk_...
CLERK_PUBLISHABLE_KEY=pk_...
CLERK_WEBHOOK_SECRET=whsec_...

# AI
CLAUDE_API_KEY=sk-ant-...

# Email
RESEND_API_KEY=re_...

# Real-time messaging
PUSHER_APP_ID=...
PUSHER_KEY=...
PUSHER_SECRET=...
PUSHER_CLUSTER=...
```

## Adding New Endpoints

1. Create controller in `controllers/<domain>/index.ts`
2. Register route in `index.ts` → `setupRouter()`
3. Add types in `models/<domain>.ts`
4. Add validation in `utils/validation.ts`

## Middleware

All requests pass through (in order):

1. `cors.ts` - CORS headers
2. `auth.ts` - JWT verification via Clerk
3. `rate-limit.ts` - Rate limiting
4. `validation.ts` - Request validation
5. `error-handler.ts` - Error formatting

See `middleware/README.md` for auth details.
