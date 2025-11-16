# Umbrella MVP - Database Documentation

This directory contains the D1 database schema, migrations, and seed data for the Umbrella MVP platform.

## Directory Structure

```
db/
├── migrations/           # Versioned migration files (applied in order)
│   ├── 0001_users_artists.sql
│   ├── 0002_tracks_gigs.sql
│   ├── 0003_messaging.sql
│   ├── 0004_files_reviews.sql
│   ├── 0005_analytics.sql
│   ├── 0006_delivery_queues.sql
│   ├── 0007_clerk_integration.sql
│   └── 0008_reference_data_tables.sql
├── schema.sql                    # Consolidated full schema (for reference)
├── seed.sql                      # Legacy development seed data
├── seed.ts                       # Test fixtures for development (task-1.7)
├── seed-production.ts            # Production reference data (task-1.8)
└── README.md                     # This file
```

## Database Overview

**Technology:** Cloudflare D1 (SQLite at edge)

**Total Tables:** 21+ tables covering:
- User authentication (OAuth-only)
- Artist profiles (40+ onboarding attributes)
- Portfolio management (tracks, files)
- Marketplace (gigs, applications)
- Communication (conversations, messages)
- Analytics (daily metrics, goals)
- AI usage (Violet prompts tracking)
- Fan communication (contact lists, broadcasts)

**Key Design Decisions:**
- **D-001:** OAuth-only auth (no password field)
- **D-026:** 50GB storage quota per artist
- **D-043:** 2000 character message limit
- **D-062:** 50 Violet AI prompts/day limit
- **D-008:** Daily batch analytics at midnight UTC

## Quick Start

### 1. Apply Migrations (Local Development)

```bash
# Apply all migrations to local D1 database
wrangler d1 migrations apply umbrella-dev-db --local

# Apply to remote/production
wrangler d1 migrations apply umbrella-dev-db --remote
```

### 2. Seed Production Reference Data (Required)

**IMPORTANT:** Production seed data must be applied before the application can function. This includes genres, tags, and system configuration values required for onboarding and core features.

```bash
# Generate and apply production seed data
npm run seed:production

# Or generate SQL file only (without applying)
npm run seed:production:generate

# Then manually apply if needed
wrangler d1 execute umbrella-dev-db --local --file=db/seed-production-output.sql
```

**What Gets Seeded:**
- **20 genres** - Music genres for onboarding step 1 and marketplace filtering
- **22 tags** - Skills and vibe tags for artist profile creation (onboarding step 3)
- **Default user settings** - Email/SMS notification defaults, privacy settings
- **System configuration** - File upload limits, AI usage limits, pagination settings

**Idempotency:** Safe to run multiple times. Uses `INSERT OR IGNORE` to prevent duplicates.

### 3. Seed Development/Test Data (Optional - For Frontend Development)

**Option A: Comprehensive Test Fixtures (Recommended for Frontend Development)**

```bash
# Generate and apply comprehensive seed data
npm run seed

# Or generate SQL file only (without applying)
npm run seed:generate

# Then manually apply if needed
wrangler d1 execute umbrella-dev-db --local --file=db/seed-output.sql
```

**Option B: Basic Seed Data (Legacy)**

```bash
# Load basic sample data for development
wrangler d1 execute umbrella-dev-db --local --file=db/seed.sql

# Seed remote database (use with caution)
wrangler d1 execute umbrella-dev-db --remote --file=db/seed.sql
```

### 4. Verify Schema Integrity

```bash
# Run verification script (local)
./scripts/verify-schema.sh --local

# Verify remote database
./scripts/verify-schema.sh --remote
```

## Migration Files

Migrations are applied sequentially in order. Each migration is idempotent (uses `IF NOT EXISTS`).

### 0001_users_artists.sql
- **users** - OAuth accounts (Apple/Google only)
- **artists** - Complete artist profiles with 40+ attributes
- **artist_followers** - Social following relationships

### 0002_tracks_gigs.sql
- **tracks** - Music portfolio (unlimited uploads within quota)
- **gigs** - Venue opportunities with urgency flags
- **gig_applications** - Artist applications to gigs
- **gig_favorites** - Saved gigs

### 0003_messaging.sql
- **conversations** - Message threads (polling-based)
- **messages** - Individual messages (2000 char limit)

### 0004_files_reviews.sql
- **files** - File metadata (blobs in R2)
- **folders** - File organization
- **storage_quotas** - 50GB per artist tracking
- **reviews** - Artist reviews (no moderation)
- **timeline_entries** - Career milestones

### 0005_analytics.sql
- **daily_metrics** - Daily aggregated analytics
- **goals** - Artist-defined goals
- **violet_usage** - AI prompt tracking (50/day limit)
- **contact_lists** - Fan segments
- **contact_list_members** - Individual contacts
- **broadcast_messages** - Fan blasts (text-only in MVP)
- **journal_entries** - Creative Studio content

### 0006_delivery_queues.sql
- Delivery queues for background jobs and messaging

### 0007_clerk_integration.sql
- Clerk authentication integration tables

### 0008_reference_data_tables.sql
- **genres** - Music genres for onboarding and marketplace (20 genres)
- **tags** - Skills and vibe tags for artist profiles (22 tags)
- **system_config** - Application-wide configuration and settings

## Seed Data Summary

### Production Seed Data (seed-production.ts)

**New in task-1.8:** The `db/seed-production.ts` TypeScript script generates production reference data required for the application to function.

**Purpose:** Unlike test fixtures which create sample users/artists/gigs for development, production seed data creates the reference data that must exist in production for features to work.

**What Gets Seeded:**

- **20 genres** (Afro-House, Blues, Classical, Country, EDM, Electronica, Folk, Funk, Hip-Hop, House, Jazz, Latin, Metal, Pop, R&B, Reggae, Rock, Soul, Techno, Other)
  - Required for onboarding step 1 (genre selection)
  - Used for marketplace filtering

- **22 tags** - 12 skills + 10 vibe tags
  - **Skills:** Mixing, Mastering, Production, Songwriting, Beat Making, Session Musician, Vocals, Guitar, Piano/Keys, Drums, Bass, DJ
  - **Vibes:** Chill, Energetic, Experimental, Melodic, Dark, Uplifting, Groovy, Atmospheric, Raw, Polished
  - Required for onboarding step 3 (multi-select tags)

- **Default user settings** (stored as JSON in system_config)
  - Email notifications (gig bookings, new messages, marketplace updates, weekly digest)
  - SMS notifications (gig bookings, new messages)
  - Privacy settings (profile visibility, email visibility, phone visibility)
  - Preferences (timezone, language)

- **System configuration values** (15+ settings)
  - File upload limits: 50GB quota per artist, 100MB max per file, 24hr download TTL
  - AI usage limits: 25k tokens/month, 50 prompts/day
  - Messaging limits: 2000 chars max, no rate limits
  - Pagination: 20 gigs/page, 20 artists/page
  - Analytics: cron schedules, retry settings
  - Session: 24hr TTL, refresh disabled

**Features:**
- ✅ **Idempotent** - Safe to run multiple times (uses `INSERT OR IGNORE`)
- ✅ **Production-ready** - Data designed for production deployment
- ✅ **Well-documented** - Each config value includes description
- ✅ **Type-safe** - TypeScript with exported constants for testing

**Usage:**
```bash
# Generate and apply production seed data
npm run seed:production

# Or just generate SQL file
npm run seed:production:generate
```

**Critical:** Without production seed data:
- ❌ Onboarding step 1 cannot display genre options
- ❌ Onboarding step 3 cannot display tag options
- ❌ Marketplace filtering by genre will fail
- ❌ New users will not have default settings

### Difference: Production Seed vs Test Fixtures

| Aspect | Production Seed (task-1.8) | Test Fixtures (task-1.7) |
|--------|---------------------------|--------------------------|
| **Purpose** | Required reference data | Frontend development data |
| **Content** | Genres, tags, config | Sample users, artists, gigs |
| **Environment** | Production + Development | Development only |
| **Frequency** | Run on every deployment | Run once per dev setup |
| **Idempotency** | Required | Required |
| **Size** | Small (20-30 records) | Large (50+ records) |
| **File** | `db/seed-production.ts` | `db/seed.ts` |
| **Script** | `npm run seed:production` | `npm run seed` |

### Comprehensive Test Fixtures (seed.ts)

**New in task-1.7:** The `db/seed.ts` TypeScript script generates comprehensive test data for frontend development:

- **10 test users** with varied onboarding states:
  - 3 users with incomplete onboarding (stopped at different steps)
  - 7 users with complete onboarding
- **20 artist profiles** with complete data:
  - Varied genres (Rock, Pop, Hip-Hop, Electronic, Jazz, etc.)
  - Multiple locations across US cities
  - Complete onboarding data (all 5 steps)
  - Realistic ratings (3.5-5.0 stars)
  - 5 verified artists
  - Profile images, social links, and portfolio data
- **30 gigs** with different statuses and dates:
  - 10 past gigs (completed status)
  - 15 upcoming gigs (open status, various dates)
  - 3 pending gigs
  - 2 cancelled gigs
  - Urgency flags for gigs <7 days with <50% capacity
- **50+ messages** across 10 conversations:
  - Mix of short and long messages (testing 2000 char limit)
  - Some with file attachments
  - Realistic conversation threads
- **Test files** and R2 metadata:
  - 10 audio files (MP3s for tracks) per artist
  - 5 images (profile pictures, promo photos) per artist
  - 3 documents (EPKs, contracts) per artist
  - File metadata for first 10 artists
- **Storage quotas** at varied levels:
  - 20%, 40%, 50%, 70%, 85%, 90% usage across artists
  - 50GB limit per artist (per D-026)
- **Reviews** for artists with ratings

**Features:**
- ✅ **Idempotent** - Safe to run multiple times (clears old data first)
- ✅ **Edge cases** - Tests quota limits, long text fields, special characters
- ✅ **Realistic data** - Proper timestamps, relationships, and business logic
- ✅ **Complete coverage** - All user states, gig statuses, and data types

**Usage:**
```bash
# Install dependencies (if needed)
npm install

# Generate and apply seed data
npm run seed

# Or just generate SQL file
npm run seed:generate
```

### Basic Seed Data (seed.sql - Legacy)

The seed.sql file provides basic development data:

- **3 complete artists** with full onboarding data:
  - Maya Rivers (Indie/Folk)
  - Alex Chen (Electronic/DJ)
  - Jordan Lee (Jazz)
- **9 tracks** across artists
- **6 gigs** (4 open, 2 completed)
- **2 conversations** with 7 messages
- **8 reviews** (including external email invites)
- **7 days of analytics** per artist
- **7 active goals**
- **Contact lists** with sample fan data
- **Journal entries** and timeline milestones

## Common Operations

### Query Data Locally

```bash
# View all artists
wrangler d1 execute umbrella-dev-db --local \
  --command "SELECT stage_name, primary_genre, avg_rating FROM artists;"

# Count total tables
wrangler d1 execute umbrella-dev-db --local \
  --command "SELECT COUNT(*) FROM sqlite_master WHERE type='table';"

# Check indexes
wrangler d1 execute umbrella-dev-db --local \
  --command "SELECT name FROM sqlite_master WHERE type='index' ORDER BY name;"
```

### Inspect Table Structure

```bash
# Show table schema
wrangler d1 execute umbrella-dev-db --local \
  --command "PRAGMA table_info(artists);"

# Show foreign keys
wrangler d1 execute umbrella-dev-db --local \
  --command "PRAGMA foreign_key_list(artists);"
```

### Reset Database (Development Only)

```bash
# WARNING: This deletes all data

# Drop all tables (local)
wrangler d1 execute umbrella-dev-db --local \
  --command "SELECT 'DROP TABLE ' || name || ';' FROM sqlite_master WHERE type='table';" | \
  xargs -I {} wrangler d1 execute umbrella-dev-db --local --command "{}"

# Re-apply migrations
wrangler d1 migrations apply umbrella-dev-db --local

# Re-seed data
wrangler d1 execute umbrella-dev-db --local --file=db/seed.sql
```

## Database Configuration

D1 databases are configured in `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "umbrella-dev-db"
database_id = "your-database-id"
```

## Testing Migrations

Before applying migrations to production:

1. **Test locally first:**
   ```bash
   wrangler d1 migrations apply umbrella-dev-db --local
   ./scripts/verify-schema.sh --local
   ```

2. **Verify schema integrity:**
   - All 21+ tables created
   - 60+ indexes in place
   - Foreign keys enforced
   - Check constraints working

3. **Test with seed data:**
   ```bash
   wrangler d1 execute umbrella-dev-db --local --file=db/seed.sql
   ```

4. **Run integration tests:**
   ```bash
   npm run test:integration
   ```

## Schema Validation Checklist

✅ **Tables:** All 21 tables exist
✅ **Indexes:** 60+ indexes for query performance
✅ **Foreign Keys:** All relationships enforced
✅ **Check Constraints:** Enums and value limits
✅ **Unique Constraints:** Prevent duplicate records
✅ **Primary Keys:** UUIDs as TEXT (generated in Worker)
✅ **Timestamps:** ISO 8601 format (TEXT)
✅ **Nullable Fields:** Appropriate nullability

## Architecture Notes

### D1 Limitations
- **Single-region:** Not globally replicated (acceptable for MVP)
- **10GB max size:** Monitor size, plan Postgres migration at 8GB
- **SQLite-based:** No stored procedures, limited full-text search
- **Write contention:** SQLite write lock (mitigate with batching, KV for ephemeral data)

### When to Migrate to Postgres
Consider migrating when:
- Database size > 8GB
- Write latency > 100ms (lock contention)
- Need multi-region replication
- Need advanced features (triggers, stored procedures)

**Recommended Postgres providers:** Neon (serverless), Supabase, PlanetScale

## Troubleshooting

### "Table already exists" Error
This is normal if migrations were already applied. Migrations use `IF NOT EXISTS` for idempotency.

### Foreign Key Constraint Errors
Ensure foreign keys are enabled:
```bash
wrangler d1 execute umbrella-dev-db --local \
  --command "PRAGMA foreign_keys = ON;"
```

### Slow Queries
Check if indexes are created:
```bash
wrangler d1 execute umbrella-dev-db --local \
  --command "EXPLAIN QUERY PLAN SELECT * FROM artists WHERE primary_genre = 'Indie';"
```

### Migration Apply Fails
Try applying one migration at a time:
```bash
wrangler d1 execute umbrella-dev-db --local \
  --file=db/migrations/0001_users_artists.sql
```

## Related Documentation

- **Architecture Spec:** `/docs/initial-spec/architecture.md` - Full system architecture
- **Database Schema Doc:** `/docs/database-schema.md` - Detailed table documentation
- **Engineering Spec:** `/docs/initial-spec/eng-spec.md` - Business logic and requirements
- **API Models:** `/api/models/*.ts` - TypeScript model definitions

## Support

For issues or questions:
1. Check the [Architecture Spec](../docs/initial-spec/architecture.md) for design decisions
2. Review the [Database Schema Doc](../docs/database-schema.md) for table details
3. Run the verification script: `./scripts/verify-schema.sh --local`
4. Check Wrangler logs: `wrangler d1 migrations list umbrella-dev-db`

---

**Version:** 1.0
**Last Updated:** 2025-10-24
**Maintained By:** Agent 1 (Database Schema & Migrations)
