# Migration Rollback Guide

This document provides comprehensive guidance on rolling back database migrations in the Umbrella platform. It covers rollback procedures, data safety considerations, and decision-making flowcharts.

## Table of Contents

1. [Rollback Philosophy](#rollback-philosophy)
2. [Rollback Decision Flowchart](#rollback-decision-flowchart)
3. [Migration Reversibility Matrix](#migration-reversibility-matrix)
4. [Rollback Procedures](#rollback-procedures)
5. [Testing Rollbacks](#testing-rollbacks)
6. [Best Practices](#best-practices)

---

## Rollback Philosophy

**In production, prefer fix-forward over rollback.**

### When to Rollback

✅ **Safe to rollback when:**
- You're in development/staging environment
- Schema issue detected immediately after migration (within minutes)
- No user data has been created yet
- Migration only added indexes (no data loss)
- Critical bug with no other option

❌ **DO NOT rollback when:**
- Data has been created/modified by users
- More than a few hours have passed since migration
- Multiple dependent systems are already using new schema
- Rollback would cause data loss in production

### Fix-Forward Approach

Instead of rolling back, create a new migration that:
- Adds missing constraints
- Fixes incorrect data types
- Adjusts indexes
- Preserves existing data

**Example:** If a column has wrong type, create new column with correct type, migrate data, drop old column.

---

## Rollback Decision Flowchart

```
┌─────────────────────────────┐
│  Migration Issue Detected   │
└──────────┬──────────────────┘
           │
           ▼
    ┌──────────────┐
    │ In Production? │
    └──┬─────────┬──┘
       │         │
      YES       NO
       │         │
       │         └──────────────┐
       │                        │
       ▼                        ▼
  ┌────────────────┐   ┌──────────────────┐
  │ Data Corruption? │   │  Rollback OK!    │
  └──┬──────────┬──┘   │ (Dev/Staging)    │
     │          │      └──────────────────┘
    YES        NO
     │          │
     │          └──────────────┐
     │                         │
     ▼                         ▼
┌────────────────┐    ┌──────────────────┐
│ Restore Backup │    │ Can Fix Forward? │
└────────────────┘    └──┬───────────┬───┘
                         │           │
                        YES         NO
                         │           │
                         ▼           ▼
                  ┌─────────────┐  ┌──────────────┐
                  │ Fix Forward │  │ Rollback     │
                  │ (Preferred) │  │ (Last Resort)│
                  └─────────────┘  └──────────────┘
```

---

## Migration Reversibility Matrix

| Migration | Type | Reversibility | Data Loss | Complexity | Rollback File |
|-----------|------|---------------|-----------|------------|---------------|
| **0001** | CREATE TABLE | ✅ Reversible | ⚠️ Yes | 🟢 Simple | `0001_rollback.sql` |
| **0002** | CREATE TABLE | ✅ Reversible | ⚠️ Yes | 🟢 Simple | `0002_rollback.sql` |
| **0003** | CREATE TABLE | ✅ Reversible | ⚠️ Yes | 🟢 Simple | `0003_rollback.sql` |
| **0004** | CREATE TABLE | ✅ Reversible | ⚠️ Yes | 🟢 Simple | `0004_rollback.sql` |
| **0005** | CREATE TABLE | ✅ Reversible | ⚠️ Yes | 🟢 Simple | `0005_rollback.sql` |
| **0006** | CREATE TABLE | ✅ Reversible | ⚠️ Yes | 🟢 Simple | `0006_rollback.sql` |
| **0007** | ALTER TABLE (ADD COLUMN) | ⚠️ Difficult | 🟡 Maybe | 🔴 Complex | `0007_rollback.sql` |
| **0008** | CREATE TABLE | ✅ Reversible | ⚠️ Yes | 🟢 Simple | `0008_rollback.sql` |
| **0009** | ALTER TABLE (ADD COLUMN) | ⚠️ Difficult | 🟡 Maybe | 🔴 Complex | `0009_rollback.sql` |
| **0010** | CREATE TABLE | ✅ Reversible | ⚠️ Yes | 🟢 Simple | `0010_rollback.sql` |
| **0011** | CREATE INDEX | ✅ Reversible | ✅ None | 🟢 Simple | `0011_rollback.sql` |
| **0012** | CREATE INDEX | ✅ Reversible | ✅ None | 🟢 Simple | `0012_rollback.sql` |

### Legend
- **✅ Reversible**: Can be rolled back with SQL script
- **⚠️ Difficult**: Requires table recreation (SQLite limitation)
- **⚠️ Yes**: Rollback will delete data
- **🟡 Maybe**: Depends on whether data exists in new columns
- **✅ None**: No data loss (indexes only)
- **🟢 Simple**: Single DROP statement
- **🔴 Complex**: Requires table recreation

---

## Rollback Procedures

### Standard Rollback (Simple)

For migrations that create tables or indexes:

```bash
# Step 1: Identify the migration to rollback
# Example: Rolling back migration 0010

# Step 2: Execute the rollback script
wrangler d1 execute umbrella-dev-db --file=db/rollbacks/0010_rollback.sql

# Step 3: Verify rollback success
wrangler d1 execute umbrella-dev-db --command="SELECT name FROM sqlite_master WHERE type='table' AND name='cron_logs';"

# Expected: No rows returned
```

### Complex Rollback (ALTER TABLE)

For migrations 0007 and 0009 (ADD COLUMN):

**⚠️ WARNING: These are complex and risky. Prefer fix-forward approach.**

```bash
# Migration 0007: Adds clerk_id column to users table
# Option 1: Leave the column (RECOMMENDED - it's nullable)
# Option 2: Use rollback script (RISKY - see 0007_rollback.sql for details)

# Migration 0009: Adds step tracking columns (redundant - columns already exist)
# Option 1: Drop index only (SAFE)
wrangler d1 execute umbrella-dev-db --command="DROP INDEX IF EXISTS idx_artists_onboarding_complete;"

# Option 2: Full rollback not recommended (columns used by application)
```

### Index-Only Rollback (Safe)

For migrations 0011 and 0012:

```bash
# These rollbacks only remove indexes - NO DATA LOSS

# Rollback migration 0011 (performance indexes)
wrangler d1 execute umbrella-dev-db --file=db/rollbacks/0011_rollback.sql

# Rollback migration 0012 (foreign key index)
wrangler d1 execute umbrella-dev-db --file=db/rollbacks/0012_rollback.sql

# Impact: Performance degradation, but functionality preserved
```

---

## Detailed Migration Analysis

### Migration 0001: Core Entities

**Tables Created:**
- `users` (with 2 indexes)
- `artists` (with 6 indexes)
- `artist_followers` (with 2 indexes)

**Rollback Impact:**
- ❌ **DELETES ALL**: User accounts, artist profiles, follower relationships
- ❌ **CASCADES TO**: All other tables (most have foreign keys to artists/users)
- 🔥 **DANGER LEVEL: CRITICAL** - This is essentially wiping the entire database

**Rollback Command:**
```bash
wrangler d1 execute umbrella-dev-db --file=db/rollbacks/0001_rollback.sql
```

**When to Rollback:**
- ✅ Fresh database with no data
- ❌ NEVER in production with real users

---

### Migration 0002: Portfolio & Marketplace

**Tables Created:**
- `tracks` (with 3 indexes)
- `gigs` (with 6 indexes)
- `gig_applications` (with 3 indexes)
- `gig_favorites` (with 2 indexes)

**Rollback Impact:**
- ❌ **DELETES ALL**: Artist music tracks, gig postings, applications, favorites
- 🔥 **DANGER LEVEL: HIGH** - Destroys marketplace data

**Rollback Command:**
```bash
wrangler d1 execute umbrella-dev-db --file=db/rollbacks/0002_rollback.sql
```

---

### Migration 0003: Messaging System

**Tables Created:**
- `conversations` (with 3 indexes)
- `messages` (with 3 indexes)

**Rollback Impact:**
- ❌ **DELETES ALL**: Message history between users
- 🔥 **DANGER LEVEL: HIGH** - Users lose all conversations

**Rollback Command:**
```bash
wrangler d1 execute umbrella-dev-db --file=db/rollbacks/0003_rollback.sql
```

---

### Migration 0004: Files & Reviews

**Tables Created:**
- `files` (with 3 indexes)
- `folders` (with 2 indexes)
- `storage_quotas`
- `reviews` (with 4 indexes)
- `timeline_entries` (with 2 indexes)

**Rollback Impact:**
- ❌ **DELETES ALL**: File metadata, reviews, timeline
- ⚠️ **NOTE**: R2 file blobs are NOT deleted (manual cleanup needed)
- 🔥 **DANGER LEVEL: HIGH** - Artists lose file organization and reviews

**Rollback Command:**
```bash
wrangler d1 execute umbrella-dev-db --file=db/rollbacks/0004_rollback.sql
```

**Post-Rollback Cleanup:**
```bash
# R2 files must be cleaned up separately
# This is a manual process - no automated cleanup
```

---

### Migration 0005: Analytics & AI Usage

**Tables Created:**
- `daily_metrics`, `violet_usage`, `contact_lists`, `contact_list_members`
- `broadcast_messages`, `journal_entries`, `goals`

**Rollback Impact:**
- ❌ **DELETES ALL**: Analytics history, AI usage logs, contact lists, journals, goals
- 🔥 **DANGER LEVEL: MEDIUM** - Historical data loss, but can be rebuilt

**Rollback Command:**
```bash
wrangler d1 execute umbrella-dev-db --file=db/rollbacks/0005_rollback.sql
```

---

### Migration 0006: Delivery Queues

**Tables Created:**
- `email_delivery_queue`, `sms_delivery_queue`
- `email_delivery_log`, `sms_delivery_log`, `unsubscribe_list`

**Rollback Impact:**
- ❌ **DELETES ALL**: Pending emails/SMS, delivery logs, unsubscribe list
- ⚠️ **RISK**: Pending messages in queue will be lost
- 🔥 **DANGER LEVEL: MEDIUM** - May cause missed notifications

**Rollback Command:**
```bash
wrangler d1 execute umbrella-dev-db --file=db/rollbacks/0006_rollback.sql
```

---

### Migration 0007: Clerk Integration

**Changes:**
- Adds `clerk_id` column to `users` table
- Adds unique index on `clerk_id`

**Rollback Impact:**
- 🔴 **COMPLEX**: Requires table recreation (SQLite limitation)
- ⚠️ **RISK**: Foreign key relationships temporarily broken during rollback
- 🔥 **DANGER LEVEL: HIGH** - Complex operation with failure risk

**Rollback Command:**
```bash
wrangler d1 execute umbrella-dev-db --file=db/rollbacks/0007_rollback.sql
```

**RECOMMENDATION:**
```
DO NOT ROLLBACK IN PRODUCTION

Instead:
1. Leave the column (it's nullable and harmless)
2. Or use fix-forward approach with new migration
```

---

### Migration 0008: Reference Data

**Tables Created:**
- `genres`, `tags`, `system_config`

**Rollback Impact:**
- ❌ **DELETES ALL**: Genre definitions, tags, system configuration
- 🔥 **DANGER LEVEL: LOW** - Can be reseeded easily

**Rollback Command:**
```bash
wrangler d1 execute umbrella-dev-db --file=db/rollbacks/0008_rollback.sql
```

**Post-Rollback:**
```bash
# Reseed reference data
wrangler d1 execute umbrella-dev-db --file=db/seed-production.ts
```

---

### Migration 0009: Onboarding Step Tracking

**Changes:**
- Adds step tracking columns to `artists` table (REDUNDANT - already exist in 0001)
- Adds composite index on step columns

**Rollback Impact:**
- 🟡 **LIMITED**: Only drops the index (columns already existed)
- 🔥 **DANGER LEVEL: MINIMAL** - Safe operation

**Rollback Command:**
```bash
wrangler d1 execute umbrella-dev-db --file=db/rollbacks/0009_rollback.sql
```

**Note:** This migration is idempotent and somewhat redundant.

---

### Migration 0010: Cron Logs

**Tables Created:**
- `cron_logs` (with 3 indexes)

**Rollback Impact:**
- ❌ **DELETES ALL**: Cron job execution history
- 🔥 **DANGER LEVEL: MINIMAL** - Log data only, can be rebuilt

**Rollback Command:**
```bash
wrangler d1 execute umbrella-dev-db --file=db/rollbacks/0010_rollback.sql
```

---

### Migration 0011: Performance Indexes

**Indexes Created:**
- `idx_gigs_payment_amount`
- `idx_gigs_status_date`
- `idx_gigs_status_genre_date`
- `idx_tracks_artist_plays`
- `idx_conversations_participants`

**Rollback Impact:**
- ✅ **NO DATA LOSS** - Only removes indexes
- ⚠️ **PERFORMANCE**: Queries will be slower after rollback
- 🔥 **DANGER LEVEL: NONE** - Completely safe

**Rollback Command:**
```bash
wrangler d1 execute umbrella-dev-db --file=db/rollbacks/0011_rollback.sql
```

**When to Rollback:**
- Index causing query plan issues
- Need to rebuild index with different configuration
- Testing performance without indexes

---

### Migration 0012: Missing Foreign Key Index

**Indexes Created:**
- `idx_reviews_reviewer_user` (on `reviews.reviewer_user_id`)

**Rollback Impact:**
- ✅ **NO DATA LOSS** - Only removes index
- ⚠️ **PERFORMANCE**: Queries by reviewer will be slower
- 🔉 **DANGER LEVEL: NONE** - Completely safe

**Rollback Command:**
```bash
wrangler d1 execute umbrella-dev-db --file=db/rollbacks/0012_rollback.sql
```

---

## Testing Rollbacks

### Development Environment Testing

Always test rollbacks in development before considering for production:

```bash
# 1. Apply migration
wrangler d1 execute umbrella-dev-db --file=db/migrations/0010_cron_logs.sql

# 2. Insert test data
wrangler d1 execute umbrella-dev-db --command="
  INSERT INTO cron_logs (id, job_name, start_time, status, created_at)
  VALUES ('test-1', 'test_job', '2025-11-17T10:00:00Z', 'completed', '2025-11-17T10:00:00Z');
"

# 3. Verify data exists
wrangler d1 execute umbrella-dev-db --command="SELECT * FROM cron_logs;"

# 4. Execute rollback
wrangler d1 execute umbrella-dev-db --file=db/rollbacks/0010_rollback.sql

# 5. Verify table removed
wrangler d1 execute umbrella-dev-db --command="SELECT name FROM sqlite_master WHERE type='table' AND name='cron_logs';"

# Expected: No rows returned
```

### Rollback Testing Checklist

Before rolling back in production:

- [ ] Tested rollback in development environment
- [ ] Verified rollback SQL executes without errors
- [ ] Confirmed expected tables/indexes are removed
- [ ] Tested application still functions after rollback
- [ ] Identified all data that will be lost
- [ ] Created backup of production database
- [ ] Documented rollback reason and decision
- [ ] Have fix-forward plan as backup option
- [ ] Stakeholders notified of potential downtime/data loss

---

## Best Practices

### 1. Always Backup Before Rollback

```bash
# Create backup before any rollback
wrangler d1 export umbrella-prod-db --output=backup-$(date +%Y%m%d-%H%M%S).sql
```

### 2. Use Transactions (When Possible)

```sql
-- Wrap rollback in transaction (if database supports it)
BEGIN TRANSACTION;

-- Rollback SQL here
DROP TABLE IF EXISTS example_table;

-- Verify changes before committing
SELECT name FROM sqlite_master WHERE type='table';

-- If OK, commit; otherwise rollback
COMMIT;
-- Or: ROLLBACK;
```

### 3. Test Rollback in Staging First

Never rollback directly in production without testing:

```bash
# Test in staging first
wrangler d1 execute umbrella-staging-db --file=db/rollbacks/0010_rollback.sql

# Verify application still works in staging
npm run test:staging

# Only then proceed to production (if absolutely necessary)
```

### 4. Document Every Rollback

Create incident report:

```markdown
## Rollback Incident Report

**Date:** 2025-11-17
**Migration:** 0010_cron_logs.sql
**Reason:** Table structure incorrect, foreign key missing
**Executed By:** [Name]
**Environment:** Development
**Data Lost:** 150 cron log entries (non-critical)
**Downtime:** 0 minutes
**Fix-Forward Plan:** Apply corrected migration 0010_v2_cron_logs.sql
```

### 5. Prefer Partial Rollbacks

Instead of rolling back entire migration, drop specific problematic parts:

```sql
-- Instead of full rollback, just drop problematic index
DROP INDEX IF EXISTS idx_problematic_index;

-- Or just drop problematic column (if SQLite supports it)
-- Or add fix-forward migration
```

### 6. Understand SQLite Limitations

SQLite does not support:
- `ALTER TABLE DROP COLUMN` (requires table recreation)
- `ALTER TABLE MODIFY COLUMN` (requires table recreation)
- Some constraint modifications

**Workaround:** Create new table with correct schema, copy data, swap tables.

### 7. Monitor After Rollback

After rollback, monitor:
- Application error logs
- Database query performance
- User-reported issues
- Foreign key constraint violations

---

## Emergency Rollback Procedure

If critical production issue requires immediate rollback:

### 1. Incident Declaration
```bash
# Alert team
echo "INCIDENT: Executing emergency rollback of migration 0010"
```

### 2. Create Backup
```bash
# CRITICAL: Backup before any changes
wrangler d1 export umbrella-prod-db --output=emergency-backup-$(date +%Y%m%d-%H%M%S).sql
```

### 3. Execute Rollback
```bash
# Execute rollback
wrangler d1 execute umbrella-prod-db --file=db/rollbacks/0010_rollback.sql
```

### 4. Verify
```bash
# Verify rollback success
wrangler d1 execute umbrella-prod-db --command="SELECT name FROM sqlite_master WHERE type='table' AND name='cron_logs';"
```

### 5. Test Application
```bash
# Verify application health
curl https://umbrella.app/health
```

### 6. Post-Incident
- Document what happened
- Create fix-forward migration
- Review incident in team retrospective

---

## Index Audit Results (Task 11.6)

### Foreign Key Index Coverage

**Total Foreign Keys:** 29
**Indexed Foreign Keys:** 28
**Missing Indexes:** 1 (Fixed in migration 0012)

### Foreign Key Index Status

| Table | Foreign Key | References | Index | Status |
|-------|-------------|------------|-------|--------|
| artists | user_id | users(id) | idx_artists_user_id | ✅ |
| artist_followers | artist_id | artists(id) | idx_followers_artist | ✅ |
| artist_followers | follower_user_id | users(id) | idx_followers_user | ✅ |
| tracks | artist_id | artists(id) | idx_tracks_artist_id | ✅ |
| gigs | venue_id | users(id) | idx_gigs_venue | ✅ |
| gig_applications | gig_id | gigs(id) | idx_applications_gig | ✅ |
| gig_applications | artist_id | artists(id) | idx_applications_artist | ✅ |
| gig_favorites | gig_id | gigs(id) | idx_favorites_gig | ✅ |
| gig_favorites | artist_id | artists(id) | idx_favorites_artist | ✅ |
| conversations | participant_1_id | users(id) | idx_conversations_p1 | ✅ |
| conversations | participant_2_id | users(id) | idx_conversations_p2 | ✅ |
| messages | conversation_id | conversations(id) | idx_messages_conversation | ✅ |
| messages | sender_id | users(id) | idx_messages_sender | ✅ |
| files | artist_id | artists(id) | idx_files_artist | ✅ |
| files | folder_id | folders(id) | idx_files_folder | ✅ |
| folders | artist_id | artists(id) | idx_folders_artist | ✅ |
| folders | parent_folder_id | folders(id) | idx_folders_parent | ✅ |
| storage_quotas | artist_id | artists(id) | PRIMARY KEY | ✅ |
| reviews | artist_id | artists(id) | idx_reviews_artist | ✅ |
| reviews | reviewer_user_id | users(id) | idx_reviews_reviewer_user | ✅ (Added in 0012) |
| reviews | gig_id | gigs(id) | idx_reviews_gig | ✅ |
| timeline_entries | artist_id | artists(id) | idx_timeline_artist | ✅ |
| daily_metrics | artist_id | artists(id) | idx_metrics_artist_date | ✅ |
| violet_usage | artist_id | artists(id) | idx_violet_artist_date | ✅ |
| contact_lists | artist_id | artists(id) | idx_contact_lists_artist | ✅ |
| contact_list_members | list_id | contact_lists(id) | idx_contacts_list | ✅ |
| broadcast_messages | artist_id | artists(id) | idx_broadcasts_artist | ✅ |
| journal_entries | artist_id | artists(id) | idx_journal_artist | ✅ |
| goals | artist_id | artists(id) | idx_goals_artist | ✅ |

**Conclusion:** All foreign keys now have indexes after applying migration 0012.

---

## Summary

- **Total Migrations:** 12
- **Reversible (Simple):** 9 (migrations 0001-0006, 0008, 0010-0012)
- **Complex Reversibility:** 2 (migrations 0007, 0009)
- **Safe Rollback (No Data Loss):** 2 (migrations 0011, 0012)

**Key Takeaway:** Always prefer fix-forward approach in production. Rollbacks are for development/staging or emergency situations only.

---

## Additional Resources

- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [SQLite ALTER TABLE Limitations](https://www.sqlite.org/lang_altertable.html)
- [Database Migration Best Practices](https://www.thoughtworks.com/insights/articles/evolutionary-database-design)

---

**Last Updated:** 2025-11-17
**Task:** task-11.6
**Author:** Database Optimization Team
