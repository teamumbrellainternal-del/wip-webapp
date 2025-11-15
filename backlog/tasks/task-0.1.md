---
id: task-0.1
title: "Database Migrations & Schema Validation"
status: "To Do"
assignee: []
created_date: "2025-11-15"
labels: ["backend", "P0", "database", "infrastructure"]
milestone: "M0 - Pre-Development Setup"
dependencies: []
estimated_hours: 1
---

## Description
Apply all database migrations to the D1 database and validate schema integrity before any development work begins. This ensures all tables, indexes, foreign keys, and constraints are in place before backend endpoints try to query them.

## Acceptance Criteria
- [ ] All 7 migration files applied in correct order to D1 database:
  - 0001_users_artists.sql
  - 0002_tracks_gigs.sql
  - 0003_messaging.sql
  - 0004_files_reviews.sql
  - 0005_analytics.sql
  - 0006_delivery_queues.sql
  - 0007_clerk_integration.sql
- [ ] Schema integrity validated (foreign keys, indexes, constraints)
- [ ] Test queries run successfully for each table
- [ ] Migration script is idempotent (safe to run multiple times)
- [ ] Migration status documented in `db/MIGRATION_STATUS.md`
- [ ] Rollback tested for each migration (if applicable)
- [ ] All tables referenced in task backlog verified to exist

## Implementation Plan
1. Review all 7 migration files in `db/migrations/` directory
2. Verify migration order is correct (dependencies between migrations)
3. Apply migrations to D1 database using wrangler:
   ```bash
   wrangler d1 execute umbrella-db --file=db/migrations/0001_users_artists.sql
   wrangler d1 execute umbrella-db --file=db/migrations/0002_tracks_gigs.sql
   # ... continue for all migrations
   ```
4. Validate schema with test queries:
   ```sql
   -- Verify tables exist
   SELECT name FROM sqlite_master WHERE type='table';

   -- Verify foreign keys
   PRAGMA foreign_key_list(table_name);

   -- Verify indexes
   SELECT name FROM sqlite_master WHERE type='index';
   ```
5. Test sample inserts/selects on each table
6. Document migration status:
   - Which migrations applied
   - Any errors encountered
   - Verification results
7. Create `db/MIGRATION_STATUS.md` with results
8. Test rollback safety (if migrations support rollback)

## Notes & Comments
**References:**
- db/migrations/ directory - All migration files
- docs/initial-spec/architecture.md - Database architecture
- wrangler.toml - D1 database binding

**Priority:** P0 - BLOCKS all backend development
**File:** db/migrations/*.sql
**Dependencies:** None (first task in Phase 0)
**Unblocks:** ALL backend tasks (can't query non-existent tables)

**CRITICAL:** This task MUST complete before M1 starts. Developers cannot build endpoints that query tables that don't exist yet.

**Why This Task Exists:**
Identified in REFINEMENT_REPORT_pt2.md Issue #2 - The backlog references database tables throughout M1-M9, but no task owned applying the migrations. This creates risk of runtime errors when endpoints try to query missing tables.

## Verification Checklist
After completion, verify:
- [ ] All tables exist: users, artists, tracks, gigs, conversations, messages, files, reviews, analytics, delivery_queues, etc.
- [ ] Foreign key constraints are active (PRAGMA foreign_keys = ON)
- [ ] Indexes are created for performance-critical queries
- [ ] No migration errors in wrangler output
- [ ] Sample data can be inserted into each table
- [ ] Sample queries return expected results
