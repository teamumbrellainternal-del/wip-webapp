---
id: task-1.8
title: "Production Seed Data"
status: "Done"
assignee: []
created_date: "2025-11-15"
completed_date: "2025-11-16"
labels: ["backend", "P0", "data-seeding", "production"]
milestone: "M1 - Authentication & Session Management"
dependencies: ["task-0.1"]
estimated_hours: 2
---

## Description
Create production seed data required for the application to function: genres, tags, default settings, and system configuration values. This differs from task-1.7 (test fixtures) which creates development/test data. Production seed data is the reference data that must exist in production for features to work.

## Acceptance Criteria
- [x] Production seeding script created in `db/seed-production.ts`
- [x] Genres table seeded with all 20+ genres from eng-spec
- [x] Tags table seeded with skills and vibe tags for onboarding
- [x] Default settings created for new users
- [x] System configuration values seeded
- [x] Script is idempotent (safe to run multiple times)
- [x] Script can be run via: `npm run seed:production`
- [x] Documentation in `db/README.md` on production seed data
- [x] All seeded data validated (no duplicates, correct format)

## Implementation Plan

### 1. Create Genres Seed Data

**Purpose:** Required for onboarding step 1 (genre selection) and marketplace filtering

**Data Source:** docs/initial-spec/eng-spec.md - Genre list

**Implementation:**
```typescript
const GENRES = [
  { id: 1, name: 'Afro-House', slug: 'afro-house' },
  { id: 2, name: 'Blues', slug: 'blues' },
  { id: 3, name: 'Classical', slug: 'classical' },
  { id: 4, name: 'Country', slug: 'country' },
  { id: 5, name: 'EDM', slug: 'edm' },
  { id: 6, name: 'Electronica', slug: 'electronica' },
  { id: 7, name: 'Folk', slug: 'folk' },
  { id: 8, name: 'Funk', slug: 'funk' },
  { id: 9, name: 'Hip-Hop', slug: 'hip-hop' },
  { id: 10, name: 'House', slug: 'house' },
  { id: 11, name: 'Jazz', slug: 'jazz' },
  { id: 12, name: 'Latin', slug: 'latin' },
  { id: 13, name: 'Metal', slug: 'metal' },
  { id: 14, name: 'Pop', slug: 'pop' },
  { id: 15, name: 'R&B', slug: 'r-b' },
  { id: 16, name: 'Reggae', slug: 'reggae' },
  { id: 17, name: 'Rock', slug: 'rock' },
  { id: 18, name: 'Soul', slug: 'soul' },
  { id: 19, name: 'Techno', slug: 'techno' },
  { id: 20, name: 'Other', slug: 'other' }
];

// Insert into genres table
for (const genre of GENRES) {
  await env.DB.prepare(`
    INSERT OR IGNORE INTO genres (id, name, slug)
    VALUES (?, ?, ?)
  `).bind(genre.id, genre.name, genre.slug).run();
}
```

### 2. Create Tags Seed Data

**Purpose:** Required for onboarding step 3 (multi-select tags)

**Data Source:** docs/initial-spec/eng-spec.md - Onboarding step 3

**Tag Categories:**

**Skills Tags:**
```typescript
const SKILLS_TAGS = [
  { id: 1, category: 'skill', name: 'Mixing', slug: 'mixing' },
  { id: 2, category: 'skill', name: 'Mastering', slug: 'mastering' },
  { id: 3, category: 'skill', name: 'Production', slug: 'production' },
  { id: 4, category: 'skill', name: 'Songwriting', slug: 'songwriting' },
  { id: 5, category: 'skill', name: 'Beat Making', slug: 'beat-making' },
  { id: 6, category: 'skill', name: 'Session Musician', slug: 'session-musician' },
  { id: 7, category: 'skill', name: 'Vocals', slug: 'vocals' },
  { id: 8, category: 'skill', name: 'Guitar', slug: 'guitar' },
  { id: 9, category: 'skill', name: 'Piano/Keys', slug: 'piano-keys' },
  { id: 10, category: 'skill', name: 'Drums', slug: 'drums' },
  { id: 11, category: 'skill', name: 'Bass', slug: 'bass' },
  { id: 12, category: 'skill', name: 'DJ', slug: 'dj' }
];
```

**Vibe Tags:**
```typescript
const VIBE_TAGS = [
  { id: 13, category: 'vibe', name: 'Chill', slug: 'chill' },
  { id: 14, category: 'vibe', name: 'Energetic', slug: 'energetic' },
  { id: 15, category: 'vibe', name: 'Experimental', slug: 'experimental' },
  { id: 16, category: 'vibe', name: 'Melodic', slug: 'melodic' },
  { id: 17, category: 'vibe', name: 'Dark', slug: 'dark' },
  { id: 18, category: 'vibe', name: 'Uplifting', slug: 'uplifting' },
  { id: 19, category: 'vibe', name: 'Groovy', slug: 'groovy' },
  { id: 20, category: 'vibe', name: 'Atmospheric', slug: 'atmospheric' },
  { id: 21, category: 'vibe', name: 'Raw', slug: 'raw' },
  { id: 22, category: 'vibe', name: 'Polished', slug: 'polished' }
];
```

### 3. Create Default Settings

**Purpose:** Applied to all new users on creation

**Implementation:**
```typescript
const DEFAULT_SETTINGS = {
  email_notifications: {
    gig_bookings: true,
    new_messages: true,
    marketplace_updates: false,
    weekly_digest: true
  },
  sms_notifications: {
    gig_bookings: true,  // per D-045
    new_messages: false
  },
  privacy: {
    profile_visibility: 'public',
    email_visibility: 'private',
    phone_visibility: 'private'
  },
  preferences: {
    timezone: 'America/New_York',  // Default, user can change
    language: 'en'
  }
};

// Store as JSON in settings table or as separate config entries
await env.DB.prepare(`
  INSERT OR IGNORE INTO system_config (key, value)
  VALUES ('default_user_settings', ?)
`).bind(JSON.stringify(DEFAULT_SETTINGS)).run();
```

### 4. Create System Configuration Values

**Purpose:** Application-wide limits and settings

**Implementation:**
```typescript
const SYSTEM_CONFIG = [
  // File upload limits (per D-028)
  { key: 'file_upload_quota_per_artist', value: '53687091200' },  // 50 GB in bytes
  { key: 'file_upload_max_size_per_file', value: '104857600' },  // 100 MB in bytes
  { key: 'file_download_link_ttl', value: '86400' },  // 24 hours in seconds

  // AI usage limits (per D-059, D-062)
  { key: 'ai_tokens_per_month', value: '25000' },  // 25k tokens/month
  { key: 'ai_prompts_per_day', value: '50' },  // 50 prompts/day

  // Messaging limits (per D-087)
  { key: 'message_max_length', value: '2000' },  // 2000 chars
  { key: 'message_rate_limit', value: 'none' },  // No rate limits per D-087

  // Marketplace settings
  { key: 'gigs_per_page', value: '20' },
  { key: 'artists_per_page', value: '20' },

  // Analytics cron settings
  { key: 'analytics_cron_schedule', value: '0 0 * * *' },  // Daily at midnight
  { key: 'analytics_cron_retry_attempts', value: '3' },
  { key: 'analytics_cron_retry_backoff', value: '2000,4000,8000' },  // ms

  // Session settings
  { key: 'session_ttl', value: '86400' },  // 24 hours
  { key: 'session_refresh_enabled', value: 'false' }
];

for (const config of SYSTEM_CONFIG) {
  await env.DB.prepare(`
    INSERT OR IGNORE INTO system_config (key, value)
    VALUES (?, ?)
  `).bind(config.key, config.value).run();
}
```

### 5. Make Script Idempotent

Use `INSERT OR IGNORE` to prevent duplicate entries on multiple runs:
```typescript
// Safe to run multiple times
INSERT OR IGNORE INTO genres (id, name, slug) VALUES (?, ?, ?);
```

Or check existence before insert:
```typescript
const existing = await env.DB.prepare(`
  SELECT id FROM genres WHERE slug = ?
`).bind(slug).first();

if (!existing) {
  // Insert
}
```

### 6. Create NPM Script

Add to `package.json`:
```json
{
  "scripts": {
    "seed:production": "wrangler dev --local --persist db/seed-production.ts"
  }
}
```

### 7. Documentation

Add to `db/README.md`:
```markdown
## Production Seed Data

Production seed data is reference data required for the application to function.

### Running Production Seed

```bash
npm run seed:production
```

### What Gets Seeded

- **Genres:** 20+ music genres for onboarding and marketplace
- **Tags:** Skills and vibe tags for artist profiles
- **Default Settings:** Email/SMS notification defaults for new users
- **System Config:** Application-wide limits and settings

### Difference from Test Fixtures (task-1.7)

- **Production Seed (task-1.8):** Reference data, runs in production
- **Test Fixtures (task-1.7):** Sample users/artists/gigs, runs in development only

### Idempotency

The seed script is safe to run multiple times. It uses `INSERT OR IGNORE` to prevent duplicates.
```

## Notes & Comments
**References:**
- docs/initial-spec/eng-spec.md - Genre list, tag options, system limits
- db/schema.sql - genres, tags, system_config tables
- task-1.7 - Test fixtures (different purpose)

**Priority:** P0 - Blocks onboarding and marketplace features
**File:** db/seed-production.ts
**Dependencies:** task-0.1 (migrations must be applied first)
**Unblocks:** Onboarding (needs genres), Marketplace (needs genres/tags)

**CRITICAL:** Without production seed data:
- Onboarding step 1 cannot display genre options
- Onboarding step 3 cannot display tag options
- Marketplace filtering by genre will fail
- New users will not have default settings

**Why This Task Exists:**
Identified in REFINEMENT_REPORT_pt2.md Issue #5 - task-1.7 creates test fixtures for development, but there's no task for production reference data. The app cannot function without genres, tags, and default settings seeded.

## Difference from task-1.7 (Test Fixtures)

| Aspect | task-1.7 (Test Fixtures) | task-1.8 (Production Seed) |
|--------|--------------------------|----------------------------|
| Purpose | Frontend development data | Required reference data |
| Content | Sample users, artists, gigs | Genres, tags, config |
| Environment | Development only | Production + Development |
| Frequency | Run once per dev setup | Run on every deployment |
| Idempotency | Optional | Required |
| Size | Large (50+ records) | Small (20-30 records) |

## Validation Checklist

After running seed script, verify:
- [ ] 20+ genres exist in genres table
- [ ] 20+ tags exist in tags table (skills + vibes)
- [ ] Default settings available in system_config
- [ ] All system config values present
- [ ] No duplicate entries
- [ ] Script can run multiple times without errors
- [ ] Onboarding step 1 can query genres successfully
- [ ] Onboarding step 3 can query tags successfully
