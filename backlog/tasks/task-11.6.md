---
id: task-11.6
title: "Database Optimization"
status: "To Do"
assignee: []
created_date: "2025-11-17"
labels: ["database", "P1", "performance"]
milestone: "M11 - Pre-Launch Readiness & Compliance"
dependencies: ["task-0.1"]
estimated_hours: 4
---

## Description
Validate all foreign keys have indexes, identify missing indexes, test migration rollback procedures to ensure data safety.

## Acceptance Criteria
- [ ] All foreign key columns have indexes
- [ ] All frequently queried columns have indexes (WHERE, JOIN, ORDER BY)
- [ ] Query plans analyzed with EXPLAIN QUERY PLAN
- [ ] Missing indexes identified and migration created if needed
- [ ] Rollback tested for each migration (0001-0007)
- [ ] Reversible migrations identified
- [ ] Irreversible migrations documented (DROP COLUMN, DROP TABLE)
- [ ] Rollback SQL scripts created for reversible migrations
- [ ] Rollback limitations documented in docs/MIGRATION_ROLLBACK.md
- [ ] Rollback tested in development database

## Implementation Plan

### Index Validation (2 hours)
1. Query D1 for existing indexes:
   ```sql
   SELECT name, tbl_name, sql FROM sqlite_master WHERE type='index' ORDER BY tbl_name;
   ```
2. Create index audit checklist:
   - Check each foreign key has index:
     - artists.user_id → users
     - tracks.artist_id → artists
     - messages.conversation_id → conversations
     - gig_applications.artist_id → artists
     - files.artist_id → artists
     - All other foreign keys
3. Check common query patterns:
   - WHERE user_id = ? (needs index on user_id)
   - WHERE artist_id = ? (needs index on artist_id)
   - WHERE created_at > ? (if frequent, needs index)
   - ORDER BY updated_at DESC (if frequent, needs index)
4. Analyze query plans:
   ```sql
   EXPLAIN QUERY PLAN SELECT * FROM artists WHERE user_id = ?;
   ```
   - Look for "SCAN TABLE" (bad - full scan)
   - Look for "SEARCH TABLE USING INDEX" (good - using index)
5. Create missing indexes:
   - Write migration: db/migrations/0008_add_missing_indexes.sql
   - Add indexes for foreign keys without indexes
   - Example:
   ```sql
   CREATE INDEX IF NOT EXISTS idx_artists_user_id ON artists(user_id);
   CREATE INDEX IF NOT EXISTS idx_tracks_artist_id ON tracks(artist_id);
   ```
6. Test index performance:
   - Run query before index (time it)
   - Create index
   - Run query after index (time it)
   - Verify EXPLAIN shows index usage

### Migration Rollback Testing (2 hours)
7. Review each migration file:
   - 0001_users_artists.sql
   - 0002_tracks_gigs.sql
   - 0003_messaging.sql
   - 0004_files_reviews.sql
   - 0005_analytics.sql
   - 0006_delivery_queues.sql
   - 0007_clerk_integration.sql
8. Categorize by reversibility:
   - Fully reversible: CREATE TABLE → DROP TABLE
   - Partially reversible: ADD COLUMN → DROP COLUMN (data lost)
   - Irreversible: DROP COLUMN (data permanently deleted)
9. Create rollback SQL for reversible migrations:
   - db/rollbacks/0001_rollback.sql: DROP TABLE artists; DROP TABLE users;
   - db/rollbacks/0002_rollback.sql: DROP TABLE gigs; DROP TABLE tracks;
   - etc.
10. Test rollback in development:
    ```bash
    # Apply migration
    wrangler d1 execute umbrella-dev-db --file=db/migrations/0001_users_artists.sql
    
    # Insert test data
    wrangler d1 execute umbrella-dev-db --command="INSERT INTO users (...) VALUES (...);"
    
    # Rollback
    wrangler d1 execute umbrella-dev-db --file=db/rollbacks/0001_rollback.sql
    
    # Verify tables removed
    wrangler d1 execute umbrella-dev-db --command="SELECT name FROM sqlite_master WHERE type='table';"
    ```
11. Document rollback procedures in docs/MIGRATION_ROLLBACK.md:
    - For each migration: Reversibility, Rollback SQL, Data loss warning
    - Document irreversible operations (cannot rollback without data loss)
    - Best practice: Fix forward with new migration (not rollback)
12. Create rollback decision flowchart:
    - Data corruption? → Restore from backup
    - Schema issue? → Fix forward with new migration
    - Critical bug? → Rollback if safe, else restore from backup

## Notes & Comments
**Priority:** P1 - Important for performance and incident response

**Files to Create:**
- db/migrations/0008_add_missing_indexes.sql (if needed)
- db/rollbacks/*.sql (rollback scripts)
- docs/MIGRATION_ROLLBACK.md

**Dependencies:** Requires task-0.1 (migrations applied)

**Index Strategy:** Primary keys auto-indexed. Unique constraints auto-indexed. Foreign keys NOT auto-indexed (must create manually).

**When to Index:** Foreign keys (always), WHERE clauses (if frequent), JOIN conditions (always), ORDER BY (if frequent).

**Rollback Philosophy:** In production, prefer fix-forward over rollback. Only rollback if data corruption occurring or no other option. Always backup before rollback.

