# 4 Parallel Claude Code Sessions - Infrastructure Build

Each session creates a standalone PR to `dev` branch with non-overlapping files. All sessions run in parallel.

---

## **Session 1: Backend API Infrastructure**
**Branch:** `infra/backend-api-auth`  
**Owner:** Backend foundation + auth patterns

### **Files to Reference from `/inspiration/app.leger.run`**
```
inspiration/app.leger.run/api/
├── index.ts                    # Worker entry point pattern
├── middleware/auth.ts          # JWT validation (adapt)
├── utils/
│   ├── jwt.ts                  # Token utilities
│   ├── crypto.ts               # Encryption/hashing
│   ├── encoding.ts             # Base64, URL encoding
│   └── uuid.ts                 # ID generation
└── routes/
    └── auth.ts                 # Auth route pattern
```

### **Files to Create (Session 1 writes these)**
```
umbrella/
├── api/
│   ├── index.ts                # NEW - Umbrella worker entry
│   ├── middleware/
│   │   ├── auth.ts             # ADAPTED - Cloudflare Access JWT
│   │   ├── cors.ts             # NEW
│   │   └── error-handler.ts   # NEW
│   ├── routes/
│   │   ├── auth.ts             # NEW - OAuth callback, session check
│   │   └── health.ts           # NEW - Health check endpoint
│   └── utils/
│       ├── jwt.ts              # COPIED from inspiration
│       ├── crypto.ts           # COPIED from inspiration
│       ├── encoding.ts         # COPIED from inspiration
│       ├── uuid.ts             # COPIED from inspiration
│       └── response.ts         # NEW - JSON response helpers
├── wrangler.toml               # NEW - Full config with D1/KV/R2
└── .dev.vars.example           # NEW - Environment variables template
```

### **System Prompt for Session 1**

```markdown
# Session 1: Backend API Infrastructure

## Context
You are setting up the backend API foundation for Umbrella, a marketplace connecting artists and venues. Reference the existing Cloudflare Workers patterns in `/inspiration/app.leger.run/api/`.

## Your Mission
Build the core Worker API with routing, authentication middleware, and utilities.

## Reference Materials
1. **MUST READ:** `/inspiration/app.leger.run/api/index.ts` - Worker entry point structure
2. **MUST READ:** `/inspiration/app.leger.run/api/middleware/auth.ts` - Auth middleware pattern
3. **MUST READ:** `/inspiration/app.leger.run/api/utils/*.ts` - Copy these utilities directly
4. **MUST READ:** Project root - `architecture.md` and `eng-spec.md`

## Tasks

### 1. Worker Entry Point (`api/index.ts`)
Create the main Worker with route handling:
```typescript
- Router pattern from inspiration/api/index.ts
- Routes: /v1/auth/*, /v1/health
- Error boundary
- CORS handling
- Bindings: env.DB (D1), env.KV, env.BUCKET (R2)
```

### 2. Authentication Middleware (`api/middleware/auth.ts`)
**CRITICAL ADAPTATION NEEDED:**
- Inspiration uses custom JWT
- Umbrella uses **Cloudflare Access JWT** (header: `Cf-Access-Jwt-Assertion`)
- Validate Access token
- Extract user from `oauth_provider` + `oauth_id`
- Check `onboarding_complete` flag (architecture.md D-006)
- Store session in KV (1 hour TTL)

Reference pattern from inspiration but adapt for Access.

### 3. Auth Routes (`api/routes/auth.ts`)
Implement:
- `POST /v1/auth/callback` - OAuth callback handler
  - Validate Cloudflare Access JWT
  - Look up user in D1 by oauth_id
  - If new user → create user record
  - If existing → check onboarding_complete
  - Return session token
- `GET /v1/auth/session` - Check session validity
- `POST /v1/auth/logout` - Clear session from KV

### 4. Utilities (`api/utils/`)
**COPY DIRECTLY** from inspiration:
- `jwt.ts`
- `crypto.ts`
- `encoding.ts`
- `uuid.ts`

**CREATE NEW:**
- `response.ts` - JSON response helpers
```typescript
export const successResponse = (data: any, status = 200)
export const errorResponse = (message: string, status = 400)
```

### 5. Wrangler Config (`wrangler.toml`)
Create complete config:
```toml
name = "umbrella-api"
compatibility_date = "2024-01-01"

[env.dev]
[[env.dev.d1_databases]]
binding = "DB"
database_name = "umbrella-dev-db"
database_id = "TBD"  # Add after creation

[[env.dev.kv_namespaces]]
binding = "KV"
id = "TBD"

[[env.dev.r2_buckets]]
binding = "BUCKET"
bucket_name = "umbrella-dev-media"

# Add staging and production configs too
```

### 6. Environment Variables (`.dev.vars.example`)
```bash
CLAUDE_API_KEY=sk-...
RESEND_API_KEY=re_...
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
JWT_SECRET=...
```

## Documentation Required
Create `/docs/backend-api-setup.md`:

### Structure:
```markdown
# Backend API Infrastructure

## Completed
- [x] Worker entry point with routing
- [x] Authentication middleware (Cloudflare Access)
- [x] Auth routes (callback, session, logout)
- [x] Utilities copied from boilerplate
- [x] Wrangler configuration

## API Endpoints Implemented
- POST /v1/auth/callback - OAuth handler
- GET /v1/auth/session - Session check
- POST /v1/auth/logout - Logout
- GET /v1/health - Health check

## Next Steps (Future Sessions)
1. Add profile endpoints (GET/PUT /v1/profile)
2. Add onboarding endpoints (POST /v1/onboarding/*)
3. Add marketplace endpoints (GET /v1/gigs, /v1/artists)
4. Add messaging endpoints (GET/POST /v1/conversations/*)
5. Implement file upload (R2 signed URLs)

## Manual Setup Required
1. Create D1 database: `wrangler d1 create umbrella-dev-db`
2. Create KV namespace: `wrangler kv:namespace create KV --preview`
3. Create R2 bucket: `wrangler r2 bucket create umbrella-dev-media`
4. Update wrangler.toml with IDs
5. Configure Cloudflare Access (Apple/Google OAuth)
6. Add secrets: `wrangler secret put CLAUDE_API_KEY` (etc.)

## Testing
```bash
# Run locally
wrangler dev

# Test auth callback
curl -X POST http://localhost:8787/v1/auth/callback \
  -H "Cf-Access-Jwt-Assertion: <jwt>" \
  -H "Content-Type: application/json"

# Test session
curl http://localhost:8787/v1/auth/session \
  -H "Authorization: Bearer <token>"
```

## Architecture Notes
- Uses Cloudflare Access for OAuth (no custom OAuth flow)
- Session tokens stored in KV with 1-hour TTL
- User lookup by composite key: oauth_provider + oauth_id
- Onboarding status checked on every authenticated request
```

## File Boundaries (DO NOT TOUCH)
❌ Do NOT create any files in:
- `src/*` (Session 2)
- `db/*` (Session 3)
- `.github/*` (Session 4)
- `scripts/*` (Session 4)

✅ Only create files in:
- `api/*`
- `wrangler.toml`
- `.dev.vars.example`
- `/docs/backend-api-setup.md`

## Success Criteria
- [ ] Worker runs with `wrangler dev`
- [ ] Auth middleware validates Access JWT
- [ ] Routes return proper JSON responses
- [ ] Documentation complete with next steps
- [ ] No file conflicts with other sessions
```

---

## **Session 2: UI Foundation & Component Library**
**Branch:** `infra/ui-components-hooks`  
**Owner:** Frontend foundation

### **Files to Reference**
```
inspiration/app.leger.run/src/
├── components/
│   ├── ui/*.tsx               # All shadcn components
│   ├── layout/*.tsx           # AppLayout, PageHeader
│   ├── theme-provider.tsx
│   └── ErrorBoundary.tsx
├── hooks/*.ts                 # All custom hooks
└── lib/
    └── utils.ts               # cn() and utilities
```

### **Files to Create**
```
umbrella/src/
├── components/
│   ├── ui/                    # COPY ALL from inspiration
│   ├── layout/                # COPY ALL from inspiration
│   ├── theme-provider.tsx     # COPIED
│   ├── theme-toggle.tsx       # COPIED
│   └── ErrorBoundary.tsx      # COPIED
├── hooks/
│   ├── use-toast.ts           # COPIED
│   ├── use-theme.ts           # COPIED
│   ├── use-local-storage.ts   # COPIED
│   ├── use-mobile.tsx         # COPIED
│   ├── use-auth.ts            # ADAPTED for Umbrella
│   └── use-api.ts             # NEW - API client hooks
├── lib/
│   ├── utils.ts               # COPIED
│   └── api-client.ts          # ADAPTED - Umbrella endpoints
├── App.tsx                    # NEW - Root app component
├── main.tsx                   # NEW - React entry point
└── index.css                  # COPIED from inspiration
```

### **System Prompt for Session 2**

```markdown
# Session 2: UI Foundation & Component Library

## Context
Set up the complete React UI foundation for Umbrella using proven shadcn/ui patterns from the boilerplate.

## Your Mission
Copy the entire UI component library, hooks, and create the React app shell.

## Reference Materials
1. **COPY IN BULK:** `/inspiration/app.leger.run/src/components/ui/*.tsx` - All components
2. **COPY IN BULK:** `/inspiration/app.leger.run/src/components/layout/*.tsx`
3. **MUST READ:** `/inspiration/app.leger.run/src/hooks/*.ts` - Hook patterns
4. **MUST ADAPT:** `/inspiration/app.leger.run/src/lib/api-client.ts`

## Tasks

### 1. Copy UI Components (`src/components/ui/`)
**COPY ALL FILES** from inspiration/app.leger.run/src/components/ui/:
- accordion.tsx, alert.tsx, badge.tsx, button.tsx, card.tsx, checkbox.tsx
- dialog.tsx, dropdown-menu.tsx, form.tsx, input.tsx, label.tsx
- popover.tsx, select.tsx, separator.tsx, sheet.tsx, switch.tsx
- tabs.tsx, toast.tsx, tooltip.tsx
- (Copy ALL 40+ components - this is your UI library)

### 2. Copy Layout Components (`src/components/layout/`)
**COPY ALL:**
- AppLayout.tsx
- PageHeader.tsx
- PageLayout.tsx

### 3. Copy Theme System
**COPY DIRECTLY:**
- `src/components/theme-provider.tsx`
- `src/components/theme-toggle.tsx`
- `src/components/ErrorBoundary.tsx`

### 4. Copy Hooks (`src/hooks/`)
**COPY DIRECTLY:**
- use-toast.ts
- use-theme.ts
- use-local-storage.ts
- use-mobile.tsx

**ADAPT** `use-auth.ts`:
```typescript
// Change from leger-labs auth to Umbrella auth
// Check for oauth_provider + oauth_id instead of API keys
// Add onboarding_complete check
```

**CREATE NEW** `use-api.ts`:
```typescript
// Generic API hooks for Umbrella endpoints
export function useProfile() { ... }
export function useGigs() { ... }
export function useArtists() { ... }
```

### 5. Utilities (`src/lib/`)
**COPY DIRECTLY:**
- `utils.ts` (the famous `cn()` function)

**ADAPT** `api-client.ts`:
```typescript
// Change base URL to /v1/*
// Umbrella endpoints:
const endpoints = {
  auth: {
    callback: '/v1/auth/callback',
    session: '/v1/auth/session',
    logout: '/v1/auth/logout'
  },
  profile: {
    get: '/v1/profile',
    update: '/v1/profile'
  },
  // Add stubs for future endpoints (marketplace, messaging, etc.)
}
```

### 6. React App Shell
**CREATE** `src/App.tsx`:
```typescript
import { ThemeProvider } from './components/theme-provider'
import { Toaster } from './components/ui/toaster'
import { ErrorBoundary } from './components/ErrorBoundary'

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <div className="min-h-screen bg-background">
          {/* Router will go here in future sessions */}
          <h1>Umbrella MVP</h1>
        </div>
        <Toaster />
      </ThemeProvider>
    </ErrorBoundary>
  )
}
```

**CREATE** `src/main.tsx`:
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

**COPY** `src/index.css` from inspiration (Tailwind base styles)

### 7. Create `index.html`:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Umbrella - Artist Marketplace</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

## Documentation Required
Create `/docs/ui-foundation.md`:

```markdown
# UI Foundation & Component Library

## Completed
- [x] 40+ shadcn/ui components copied
- [x] Layout components (AppLayout, PageHeader, PageLayout)
- [x] Theme system (light/dark mode)
- [x] Toast notifications
- [x] Error boundaries
- [x] Custom hooks (toast, theme, local storage, auth)
- [x] Utility functions (cn, API client)
- [x] React app shell

## Component Library Inventory
### Core UI Components
- Buttons, Inputs, Labels, Forms
- Cards, Badges, Avatars
- Dialogs, Sheets, Popovers, Dropdowns
- Tabs, Accordions, Collapsibles
- Toasts, Alerts
- Selects, Checkboxes, Switches, Radios
- Progress, Sliders, Calendars
- Tables, Pagination
- Navigation Menus, Breadcrumbs
- Charts, Carousels
- Command Palette

### Layout Components
- AppLayout (main app shell)
- PageHeader (page titles, breadcrumbs)
- PageLayout (consistent page structure)

### Custom Hooks
- useToast() - Toast notifications
- useTheme() - Light/dark mode
- useLocalStorage() - Persistent state
- useMobile() - Responsive breakpoints
- useAuth() - Authentication state
- useApi() - API request wrapper

## Next Steps (Future Sessions)
1. Build domain-specific components:
   - ArtistCard, GigCard (marketplace)
   - ProfileTabs (6-tab artist profile)
   - MessageThread (messaging)
   - VioletPromptInterface (AI toolkit)
2. Add routing with React Router
3. Build page layouts (Dashboard, Marketplace, Messages, Profile)
4. Integrate with backend API

## Usage Examples
```tsx
// Using components
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

function MyComponent() {
  const { toast } = useToast()
  
  return (
    <Card>
      <Button onClick={() => toast({ title: "Success!" })}>
        Click me
      </Button>
    </Card>
  )
}
```

## Testing
```bash
# Run dev server
npm run dev

# Should see:
# - "Umbrella MVP" heading
# - No console errors
# - Light/dark theme toggle works (when added to UI)
```

## Architecture Notes
- All components use Tailwind CSS for styling
- Theme system uses CSS variables (see index.css)
- Components are fully typed with TypeScript
- Follows shadcn/ui conventions (consistent API)
```

## File Boundaries (DO NOT TOUCH)
❌ Do NOT create any files in:
- `api/*` (Session 1)
- `db/*` (Session 3)
- `.github/*` (Session 4)
- Root config files except index.html (Session 4 handles those)

✅ Only create files in:
- `src/*`
- `index.html`
- `/docs/ui-foundation.md`

## Success Criteria
- [ ] Can run `npm run dev` and see basic React app
- [ ] All UI components compile without errors
- [ ] Theme toggle works
- [ ] No TypeScript errors
- [ ] Documentation complete
```

---

## **Session 3: Database Schema & Data Models**
**Branch:** `infra/database-models`  
**Owner:** D1 migrations + data layer

### **Files to Reference**
```
inspiration/app.leger.run/
├── db/migrations/0001_initial.sql    # Migration pattern
├── api/models/*.ts                   # Model patterns
└── api/services/*.ts                 # Service layer patterns
```

### **Files to Create**
```
umbrella/
├── db/migrations/
│   ├── 0001_users_artists.sql        # Users + Artists tables
│   ├── 0002_tracks_gigs.sql          # Portfolio + Marketplace
│   ├── 0003_messaging.sql            # Conversations + Messages
│   ├── 0004_files_reviews.sql        # File metadata + Reviews
│   └── 0005_analytics.sql            # Analytics + Violet usage
└── api/models/
    ├── user.ts                        # User model (ADAPTED)
    ├── artist.ts                      # NEW - 40 attributes
    ├── track.ts                       # NEW
    ├── gig.ts                         # NEW
    ├── message.ts                     # NEW
    ├── conversation.ts                # NEW
    ├── file.ts                        # NEW
    ├── review.ts                      # NEW
    └── analytics.ts                   # NEW
```

### **System Prompt for Session 3**

```markdown
# Session 3: Database Schema & Data Models

## Context
Build the complete D1 database schema and model layer for Umbrella following the data model in architecture.md.

## Your Mission
Create 5 migration files with all tables, indexes, and TypeScript models.

## Reference Materials
1. **MUST READ:** Project root - `architecture.md` (Data Model section - has complete schema)
2. **MUST READ:** Project root - `eng-spec.md` (requirements for each entity)
3. **REFERENCE:** `/inspiration/app.leger.run/db/migrations/0001_initial.sql` - Migration structure
4. **REFERENCE:** `/inspiration/app.leger.run/api/models/*.ts` - Model patterns

## Tasks

### 1. Migration 0001: Core Entities (`db/migrations/0001_users_artists.sql`)
```sql
-- Users table (from architecture.md)
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  oauth_provider TEXT NOT NULL CHECK (oauth_provider IN ('apple', 'google')),
  oauth_id TEXT NOT NULL,
  email TEXT NOT NULL,
  onboarding_complete BOOLEAN DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(oauth_provider, oauth_id)
);

CREATE INDEX idx_users_oauth ON users(oauth_provider, oauth_id);

-- Artists table (from architecture.md - 40 attributes)
CREATE TABLE artists (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  -- Identity (from onboarding step 1)
  stage_name TEXT NOT NULL,
  legal_name TEXT,
  pronouns TEXT,
  location_city TEXT,
  location_state TEXT,
  location_country TEXT,
  -- Bio & Story (step 2)
  bio TEXT,
  story TEXT,
  tagline TEXT,
  -- Creative Profile (step 3)
  primary_genre TEXT,
  secondary_genres TEXT,  -- JSON array
  influences TEXT,  -- JSON array
  performance_types TEXT,  -- JSON array ['solo', 'band', 'dj']
  equipment TEXT,
  -- Rates & Availability (step 4)
  base_rate_flat INTEGER,
  base_rate_hourly INTEGER,
  rates_negotiable BOOLEAN,
  travel_radius_miles INTEGER,
  available_weekdays BOOLEAN,
  available_weekends BOOLEAN,
  advance_booking_weeks INTEGER,
  -- Quick Questions (step 5)
  years_performing INTEGER,
  biggest_gig TEXT,
  dream_collaboration TEXT,
  -- Social & Portfolio
  website_url TEXT,
  instagram_handle TEXT,
  tiktok_handle TEXT,
  youtube_url TEXT,
  spotify_url TEXT,
  apple_music_url TEXT,
  soundcloud_url TEXT,
  -- Verification & Metadata
  verified BOOLEAN DEFAULT 0,
  avatar_url TEXT,
  banner_url TEXT,
  avg_rating REAL DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_gigs INTEGER DEFAULT 0,
  total_earnings INTEGER DEFAULT 0,
  profile_views INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_artists_user_id ON artists(user_id);
CREATE INDEX idx_artists_verified ON artists(verified);
CREATE INDEX idx_artists_genre ON artists(primary_genre);
CREATE INDEX idx_artists_location ON artists(location_city, location_state);
```

### 2. Migration 0002: Portfolio & Marketplace (`db/migrations/0002_tracks_gigs.sql`)
```sql
-- Tracks table (from architecture.md)
CREATE TABLE tracks (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL REFERENCES artists(id),
  title TEXT NOT NULL,
  duration_seconds INTEGER,
  file_url TEXT NOT NULL,  -- R2 URL
  cover_art_url TEXT,
  genre TEXT,
  release_year INTEGER,
  spotify_url TEXT,
  apple_music_url TEXT,
  display_order INTEGER DEFAULT 0,
  plays INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_tracks_artist_id ON tracks(artist_id);
CREATE INDEX idx_tracks_order ON tracks(artist_id, display_order);

-- Gigs table (from architecture.md)
CREATE TABLE gigs (
  id TEXT PRIMARY KEY,
  venue_id TEXT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  venue_name TEXT NOT NULL,
  location_city TEXT NOT NULL,
  location_state TEXT NOT NULL,
  location_address TEXT,
  date TEXT NOT NULL,  -- ISO date
  start_time TEXT,
  end_time TEXT,
  genre TEXT,
  payment_amount INTEGER,
  payment_type TEXT CHECK (payment_type IN ('flat', 'hourly', 'negotiable')),
  urgency_flag BOOLEAN DEFAULT 0,  -- <7 days = urgent
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'filled', 'cancelled')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_gigs_date ON gigs(date);
CREATE INDEX idx_gigs_location ON gigs(location_city, location_state);
CREATE INDEX idx_gigs_genre ON gigs(genre);
CREATE INDEX idx_gigs_status ON gigs(status);

-- Gig Applications
CREATE TABLE gig_applications (
  id TEXT PRIMARY KEY,
  gig_id TEXT NOT NULL REFERENCES gigs(id),
  artist_id TEXT NOT NULL REFERENCES artists(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TEXT NOT NULL,
  UNIQUE(gig_id, artist_id)
);

CREATE INDEX idx_applications_gig ON gig_applications(gig_id);
CREATE INDEX idx_applications_artist ON gig_applications(artist_id);
```

### 3. Migration 0003: Messaging (`db/migrations/0003_messaging.sql`)
```sql
-- Conversations
CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  participant_1_id TEXT NOT NULL REFERENCES users(id),
  participant_2_id TEXT NOT NULL REFERENCES users(id),
  last_message_at TEXT,
  created_at TEXT NOT NULL,
  UNIQUE(participant_1_id, participant_2_id)
);

CREATE INDEX idx_conversations_p1 ON conversations(participant_1_id);
CREATE INDEX idx_conversations_p2 ON conversations(participant_2_id);

-- Messages
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES conversations(id),
  sender_id TEXT NOT NULL REFERENCES users(id),
  content TEXT NOT NULL CHECK (LENGTH(content) <= 2000),  -- D-043
  read BOOLEAN DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX idx_messages_sender ON messages(sender_id);
```

### 4. Migration 0004: Files & Reviews (`db/migrations/0004_files_reviews.sql`)
```sql
-- Files (metadata only, blobs in R2)
CREATE TABLE files (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL REFERENCES artists(id),
  filename TEXT NOT NULL,
  file_size_bytes INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  r2_key TEXT NOT NULL,  -- R2 object key
  category TEXT CHECK (category IN ('press_photo', 'music', 'video', 'document', 'other')),
  created_at TEXT NOT NULL
);

CREATE INDEX idx_files_artist ON files(artist_id);
CREATE INDEX idx_files_category ON files(artist_id, category);

-- Storage quota tracking
CREATE TABLE storage_quotas (
  artist_id TEXT PRIMARY KEY REFERENCES artists(id),
  used_bytes INTEGER DEFAULT 0,
  limit_bytes INTEGER DEFAULT 53687091200,  -- 50GB in bytes
  updated_at TEXT NOT NULL
);

-- Reviews
CREATE TABLE reviews (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL REFERENCES artists(id),
  reviewer_user_id TEXT NOT NULL REFERENCES users(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  gig_id TEXT REFERENCES gigs(id),  -- Optional link to gig
  created_at TEXT NOT NULL,
  UNIQUE(artist_id, reviewer_user_id, gig_id)
);

CREATE INDEX idx_reviews_artist ON reviews(artist_id);
CREATE INDEX idx_reviews_rating ON reviews(artist_id, rating);
```

### 5. Migration 0005: Analytics & AI (`db/migrations/0005_analytics.sql`)
```sql
-- Daily analytics (D-008: aggregated at midnight UTC)
CREATE TABLE daily_metrics (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL REFERENCES artists(id),
  date TEXT NOT NULL,  -- YYYY-MM-DD
  profile_views INTEGER DEFAULT 0,
  gigs_completed INTEGER DEFAULT 0,
  earnings INTEGER DEFAULT 0,
  avg_rating REAL DEFAULT 0,
  created_at TEXT NOT NULL,
  UNIQUE(artist_id, date)
);

CREATE INDEX idx_metrics_artist_date ON daily_metrics(artist_id, date);

-- Violet AI usage tracking (D-062: 50 prompts/day limit)
CREATE TABLE violet_usage (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL REFERENCES artists(id),
  date TEXT NOT NULL,  -- YYYY-MM-DD
  prompt_count INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  UNIQUE(artist_id, date)
);

CREATE INDEX idx_violet_usage ON violet_usage(artist_id, date);

-- Contact lists (for fan messaging)
CREATE TABLE contact_lists (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL REFERENCES artists(id),
  name TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE contact_list_members (
  id TEXT PRIMARY KEY,
  list_id TEXT NOT NULL REFERENCES contact_lists(id),
  email TEXT,
  phone TEXT,
  opted_in BOOLEAN DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE INDEX idx_contacts_list ON contact_list_members(list_id);
```

### 6. TypeScript Models (`api/models/*.ts`)

**ADAPT** `user.ts` from inspiration:
```typescript
export interface User {
  id: string;
  oauth_provider: 'apple' | 'google';
  oauth_id: string;
  email: string;
  onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
}
```

**CREATE NEW** `artist.ts`:
```typescript
// Full Artist interface with all 40 attributes from architecture.md
export interface Artist {
  id: string;
  user_id: string;
  // Identity
  stage_name: string;
  legal_name?: string;
  // ... all other fields from schema
}

// Helper functions
export function calculateAverageRating(artist: Artist): number
export function isProfileComplete(artist: Artist): boolean
```

**CREATE NEW** models for: `track.ts`, `gig.ts`, `message.ts`, `conversation.ts`, `file.ts`, `review.ts`, `analytics.ts`

Each model should include:
- Interface definition
- Helper functions (CRUD operations, validations)
- Type guards

## Documentation Required
Create `/docs/database-schema.md`:

```markdown
# Database Schema & Data Models

## Completed
- [x] 5 migration files created
- [x] 15+ tables defined
- [x] All indexes from architecture.md
- [x] TypeScript models for all entities
- [x] Foreign key constraints
- [x] Check constraints for enums

## Tables Created

### Core Entities (0001)
- users - OAuth users
- artists - Artist profiles (40 attributes)

### Portfolio & Marketplace (0002)
- tracks - Music portfolio
- gigs - Venue opportunities
- gig_applications - Artist applications

### Communication (0003)
- conversations - Message threads
- messages - Individual messages (2000 char limit)

### Assets & Feedback (0004)
- files - File metadata (R2 references)
- storage_quotas - 50GB tracking
- reviews - Artist reviews (1-5 stars)

### Analytics & AI (0005)
- daily_metrics - Daily aggregated stats
- violet_usage - AI prompt tracking (50/day)
- contact_lists - Fan segments
- contact_list_members - Fan contacts

## Key Constraints
- Users: Unique per oauth_provider + oauth_id
- Artists: One per user_id
- Gig Applications: One per gig + artist
- Messages: Max 2000 characters (D-043)
- Reviews: Unique per artist + reviewer + gig
- Ratings: 1-5 only

## Indexes Created
25+ indexes for optimal query performance:
- OAuth lookups
- Location searches
- Genre filtering
- Date ranges
- Message threads
- File categories

## Next Steps (Implementation)
1. Run migrations in development:
   ```bash
   wrangler d1 migrations apply umbrella-dev-db --local
   ```
2. Create service layer for each model
3. Add CRUD endpoints in API
4. Implement business logic (reviews, analytics, quotas)

## Testing Migrations
```bash
# Apply locally
wrangler d1 migrations apply umbrella-dev-db --local

# Verify tables
wrangler d1 execute umbrella-dev-db --local \
  --command "SELECT name FROM sqlite_master WHERE type='table'"

# Check schema
wrangler d1 execute umbrella-dev-db --local \
  --command "PRAGMA table_info(artists)"
```

## Data Model Decisions
- JSON arrays for multi-value fields (genres, influences)
- Separate tables for relationships (gig_applications, reviews)
- Storage tracking at artist level (not global)
- Daily metrics pre-aggregated (not real-time)
- Soft deletes not implemented (hard deletes only)

## Foreign Key Cascade Rules
- ON DELETE CASCADE: reviews, gig_applications, files
- ON DELETE SET NULL: gigs (if venue deleted, gig remains)
- No cascades: analytics (preserve historical data)
```

## File Boundaries (DO NOT TOUCH)
❌ Do NOT create any files in:
- `api/*` except `api/models/`
- `src/*` (Session 2)
- `.github/*` (Session 4)

✅ Only create files in:
- `db/migrations/`
- `api/models/`
- `/docs/database-schema.md`

## Success Criteria
- [ ] 5 migration files created
- [ ] All tables match architecture.md exactly
- [ ] TypeScript models compile without errors
- [ ] Can apply migrations with `wrangler d1 migrations apply --local`
- [ ] Documentation complete
```

---

## **Session 4: DevOps & Build Configuration**
**Branch:** `infra/devops-build-config`  
**Owner:** CI/CD, configs, scripts

### **Files to Reference**
```
inspiration/app.leger.run/
├── .github/workflows/*.yml
├── scripts/build-worker.js
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.cjs
├── eslint.config.js
├── package.json
└── [other configs]
```

### **Files to Create**
```
umbrella/
├── .github/workflows/
│   ├── pr-checks.yml              # NEW - Run on PRs
│   ├── deploy-preview.yml         # NEW - Deploy preview env
│   ├── deploy-staging.yml         # NEW - Deploy to staging
│   ├── deploy-production.yml      # NEW - Deploy to prod
│   ├── claude-code.yml            # COPIED
│   └── commitlint.yml             # NEW
├── scripts/
│   ├── build-worker.js            # COPIED
│   └── setup-cloudflare.sh        # NEW - Bootstrap script
├── vite.config.ts                 # COPIED + ADAPTED
├── tsconfig.json                  # COPIED
├── tsconfig.node.json             # COPIED
├── tailwind.config.cjs            # COPIED
├── postcss.config.js              # COPIED
├── eslint.config.js               # COPIED
├── .prettierrc                    # COPIED
├── .gitignore                     # NEW
├── package.json                   # ADAPTED - Umbrella deps
└── README.md                      # NEW
```

### **System Prompt for Session 4**

```markdown
# Session 4: DevOps & Build Configuration

## Context
Set up all build tooling, CI/CD pipelines, and project configuration for Umbrella.

## Your Mission
Create GitHub workflows, build scripts, and all configuration files.

## Reference Materials
1. **COPY:** `/inspiration/app.leger.run/.github/workflows/*.yml`
2. **COPY:** `/inspiration/app.leger.run/scripts/build-worker.js`
3. **COPY:** All config files from inspiration root
4. **MUST READ:** Project root - `architecture.md`, `eng-spec.md`

## Tasks

### 1. GitHub Workflows (`.github/workflows/`)

**CREATE** `pr-checks.yml`:
```yaml
name: PR Checks
on:
  pull_request:
    branches: [dev, staging, main]
jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
```

**CREATE** `deploy-preview.yml`:
```yaml
name: Deploy Preview
on:
  pull_request:
    types: [opened, synchronize]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build
      - run: npx wrangler deploy --env preview
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

**CREATE** `deploy-staging.yml`:
```yaml
name: Deploy Staging
on:
  push:
    branches: [staging]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build
      - run: npx wrangler deploy --env staging
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

**CREATE** `deploy-production.yml`:
```yaml
name: Deploy Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build
      - run: npx wrangler deploy --env production
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

**COPY** `claude-code.yml` from inspiration

**CREATE** `commitlint.yml`:
```yaml
name: Commitlint
on: [pull_request]
jobs:
  commitlint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: wagoid/commitlint-github-action@v5
```

### 2. Build Scripts (`scripts/`)

**COPY DIRECTLY** `build-worker.js` from inspiration

**CREATE** `setup-cloudflare.sh`:
```bash
#!/bin/bash
# Bootstrap script for Cloudflare resources

echo "Creating D1 database..."
wrangler d1 create umbrella-dev-db

echo "Creating KV namespace..."
wrangler kv:namespace create KV --preview

echo "Creating R2 bucket..."
wrangler r2 bucket create umbrella-dev-media

echo "Done! Update wrangler.toml with the IDs above."
```

### 3. Vite Config (`vite.config.ts`)

**ADAPT** from inspiration:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/v1': {
        target: 'http://localhost:8787',  // Worker dev server
        changeOrigin: true,
      },
    },
  },
})
```

### 4. TypeScript Configs

**COPY DIRECTLY:**
- `tsconfig.json`
- `tsconfig.node.json`

### 5. Styling Configs

**COPY DIRECTLY:**
- `tailwind.config.cjs`
- `postcss.config.js`

### 6. Code Quality Configs

**COPY DIRECTLY:**
- `eslint.config.js`
- `.prettierrc`

### 7. Package.json

**ADAPT** from inspiration:
```json
{
  "name": "umbrella-app",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "dev:worker": "wrangler dev api/index.ts",
    "build": "tsc && vite build",
    "build:worker": "node scripts/build-worker.js",
    "preview": "vite preview",
    "lint": "eslint .",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit",
    "migrate": "wrangler d1 migrations apply umbrella-dev-db --local",
    "deploy": "npm run build && wrangler deploy"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@radix-ui/react-*": "...",
    "lucide-react": "^0.263.1",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.20231025.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.55.0",
    "postcss": "^8.4.32",
    "prettier": "^3.1.0",
    "tailwindcss": "^3.3.6",
    "typescript": "^5.3.3",
    "vite": "^5.0.8",
    "wrangler": "^3.22.1"
  }
}
```

### 8. Git Configuration

**CREATE** `.gitignore`:
```
# Dependencies
node_modules/
.pnp
.pnp.js

# Build
dist/
.wrangler/
.dev.vars

# Logs
*.log

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Env
.env
.env.local
.env.*.local
```

### 9. README

**CREATE** `README.md`:
```markdown
# Umbrella MVP

Artist marketplace connecting musicians with venues.

## Quick Start

### Prerequisites
- Node.js 20+
- Cloudflare account
- Wrangler CLI

### Setup
```bash
# Install dependencies
npm install

# Bootstrap Cloudflare resources
./scripts/setup-cloudflare.sh

# Update wrangler.toml with resource IDs

# Run migrations
npm run migrate

# Start dev servers (separate terminals)
npm run dev           # Frontend (port 5173)
npm run dev:worker    # Backend (port 8787)
```

### Development
```bash
npm run dev           # Start frontend
npm run lint          # Check code
npm run format        # Format code
npm run type-check    # Check types
```

### Deployment
```bash
git push origin dev       # Deploys preview
git push origin staging   # Deploys staging
git push origin main      # Deploys production
```

## Architecture
- Frontend: React + Vite + Tailwind + shadcn/ui
- Backend: Cloudflare Workers
- Database: D1 (SQLite)
- Storage: R2 (objects) + KV (cache)
- Auth: Cloudflare Access (Apple/Google OAuth)

## Documentation
- `/docs/backend-api-setup.md` - API infrastructure
- `/docs/ui-foundation.md` - Frontend components
- `/docs/database-schema.md` - Database schema
- `/docs/devops-build-config.md` - This document

## Contributing
1. Create feature branch from `dev`
2. Follow conventional commits (`feat:`, `fix:`, `docs:`)
3. Open PR against `dev`
4. CI runs tests + deploys preview
5. Merge after approval

## Stack
- TypeScript
- React 18
- Cloudflare Workers
- D1 (SQLite)
- R2 (S3-compatible storage)
- KV (key-value cache)
- Tailwind CSS
- shadcn/ui components
```

## Documentation Required
Create `/docs/devops-build-config.md`:

```markdown
# DevOps & Build Configuration

## Completed
- [x] 6 GitHub workflows
- [x] Build scripts
- [x] Vite configuration
- [x] TypeScript configuration
- [x] Tailwind + PostCSS
- [x] ESLint + Prettier
- [x] Package.json with all dependencies
- [x] Git configuration
- [x] README documentation

## GitHub Workflows

### PR Checks (`pr-checks.yml`)
Runs on all PRs:
- Linting (ESLint)
- Type checking (TypeScript)
- Tests (future: add vitest)
- Format checking (Prettier)

### Deploy Preview (`deploy-preview.yml`)
- Triggers on PR open/update
- Deploys to preview environment
- Adds preview URL to PR comments

### Deploy Staging (`deploy-staging.yml`)
- Triggers on push to `staging` branch
- Deploys to umbrella-staging.workers.dev
- Runs against staging D1/KV/R2

### Deploy Production (`deploy-production.yml`)
- Triggers on push to `main` branch
- Deploys to umbrella.app
- Runs against production D1/KV/R2
- Requires manual approval (add protection rule)

### Claude Code (`claude-code.yml`)
- Auto-labels PRs created by Claude Code
- Runs additional validation
- Posts progress updates

### Commitlint (`commitlint.yml`)
- Enforces conventional commits
- Blocks PRs with invalid commit messages

## Build Scripts

### `scripts/build-worker.js`
Bundles Worker code with esbuild:
- Resolves TypeScript
- Bundles dependencies
- Outputs to `dist/worker.js`

### `scripts/setup-cloudflare.sh`
Bootstraps Cloudflare resources:
- Creates D1 database
- Creates KV namespace
- Creates R2 bucket
- Prints IDs for wrangler.toml

## Configuration Files

### Vite (`vite.config.ts`)
- React plugin
- Path aliases (`@/*` → `./src/*`)
- Proxy `/v1/*` to Worker (dev only)

### TypeScript (`tsconfig.json`)
- Strict mode enabled
- Path aliases configured
- React JSX transform
- ES2022 target

### Tailwind (`tailwind.config.cjs`)
- Content paths for purging
- Custom theme colors
- shadcn/ui presets

### ESLint (`eslint.config.js`)
- TypeScript rules
- React rules
- Import sorting
- Prettier integration

### Prettier (`.prettierrc`)
- Single quotes
- 2-space indent
- Semicolons
- Trailing commas

## Package Scripts

```json
{
  "dev": "vite",                    // Frontend dev server
  "dev:worker": "wrangler dev",     // Worker dev server
  "build": "vite build",            // Build frontend
  "build:worker": "build script",   // Build worker
  "lint": "eslint .",               // Lint code
  "format": "prettier --write .",   // Format code
  "type-check": "tsc --noEmit",     // Check types
  "migrate": "wrangler d1 ...",     // Run migrations
  "deploy": "build + wrangler"      // Deploy both
}
```

## Dependencies

### Production
- React 18 + React DOM
- All Radix UI components (shadcn/ui)
- lucide-react (icons)
- class-variance-authority (CVA)
- clsx + tailwind-merge

### Development
- Vite 5
- TypeScript 5
- Wrangler 3
- Tailwind CSS 3
- ESLint + Prettier
- Cloudflare Workers types

## Environment Variables

Required secrets (set with `wrangler secret put`):
- `CLAUDE_API_KEY` - Anthropic API key
- `RESEND_API_KEY` - Resend email API
- `TWILIO_ACCOUNT_SID` - Twilio account
- `TWILIO_AUTH_TOKEN` - Twilio auth
- `TWILIO_PHONE_NUMBER` - Twilio phone
- `JWT_SECRET` - Session signing

## Git Workflow

### Branching
```
main (production)
  ↑
staging (pre-production)
  ↑
dev (development)
  ↑
feature/* (feature branches)
```

### Commit Convention
```
feat: Add artist onboarding
fix: Resolve auth token validation
docs: Update API documentation
chore: Upgrade dependencies
refactor: Simplify gig filtering
test: Add marketplace tests
```

## Next Steps
1. Add Vitest for testing
2. Add Storybook for component development
3. Set up Sentry error tracking
4. Add performance monitoring
5. Configure branch protection rules
6. Set up secret management (GitHub Actions)

## Testing Workflows

```bash
# Trigger PR checks manually
git push origin feature/my-feature

# Test build locally
npm run build
npm run build:worker

# Test deploy (to preview)
npx wrangler deploy --env preview
```

## Troubleshooting

### Build Fails
- Check TypeScript errors: `npm run type-check`
- Check for missing dependencies: `npm ci`

### Deploy Fails
- Verify CLOUDFLARE_API_TOKEN secret is set
- Check wrangler.toml has correct resource IDs
- Verify migrations applied: `npm run migrate`

### Dev Server Issues
- Check ports 5173 (Vite) and 8787 (Worker) are free
- Verify `.dev.vars` has required keys
- Check D1 database created locally
```

## File Boundaries (DO NOT TOUCH)
❌ Do NOT create any files in:
- `api/*` except scripts if needed (Session 1)
- `src/*` (Session 2)
- `db/migrations/` (Session 3)

✅ Only create files in:
- `.github/workflows/`
- `scripts/`
- Root config files (vite, typescript, tailwind, etc.)
- `.gitignore`
- `README.md`
- `/docs/devops-build-config.md`

## Success Criteria
- [ ] All workflows pass validation
- [ ] Can run `npm install` successfully
- [ ] Can run `npm run build` successfully
- [ ] All config files valid (no syntax errors)
- [ ] README complete
- [ ] Documentation complete
```

---

## **Execution Instructions**

1. **Run all 4 sessions in parallel** (separate terminals/machines)
2. **Each session creates a PR to `dev` branch:**
   - `infra/backend-api-auth` → Session 1
   - `infra/ui-components-hooks` → Session 2
   - `infra/database-models` → Session 3
   - `infra/devops-build-config` → Session 4

3. **File boundaries ensure no conflicts**
4. **After all 4 PRs merge:**
   ```bash
   # Test the complete infrastructure
   npm install
   npm run migrate
   npm run dev        # Terminal 1
   npm run dev:worker # Terminal 2
   
   # Should see:
   # - React app at localhost:5173
   # - Worker at localhost:8787
   # - No build errors
   ```

5. **Next phase:** Start building domain features (onboarding, marketplace, etc.)

Each session is fully independent and creates production-ready infrastructure that later sessions can build upon. The `/docs/*.md` files created by each session guide the next phase of development.
