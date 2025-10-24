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
│   └── 0005_analytics.sql
├── schema.sql           # Consolidated full schema (for reference)
├── seed.sql             # Development seed data
└── README.md            # This file
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

### 2. Seed Development Data

```bash
# Load sample data for development
wrangler d1 execute umbrella-dev-db --local --file=db/seed.sql

# Seed remote database (use with caution)
wrangler d1 execute umbrella-dev-db --remote --file=db/seed.sql
```

### 3. Verify Schema Integrity

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

## Seed Data Summary

The seed.sql file provides realistic development data:

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
