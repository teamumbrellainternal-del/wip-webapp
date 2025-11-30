-- ============================================================================
-- ROLLBACK FOR MIGRATION 0015: User Connections
-- ============================================================================
-- WARNING: This migration adds a table and a column to the artists table
-- SQLite does not support DROP COLUMN directly
-- Rollback requires recreating the table without the column
-- ============================================================================

-- ROLLBACK NOT RECOMMENDED IN PRODUCTION
-- Instead, consider leaving the table/column (they're harmless if unused)
-- Or use fix-forward approach with a new migration

-- If rollback is absolutely necessary:

-- Step 1: Drop the user_connections table
DROP TABLE IF EXISTS user_connections;

-- Step 2: For the connection_count column in artists table
-- SQLite requires table recreation to remove a column
-- RECOMMENDATION: Leave connection_count column (it's nullable and won't break anything)

-- If you must remove the column, follow these steps:
-- 1. Create a new artists table without connection_count
-- 2. Copy data from artists to the new table
-- 3. Drop the old artists table
-- 4. Rename the new table to artists
-- 5. Recreate all indexes and foreign key relationships

-- This is a COMPLEX and RISKY operation that could break foreign key relationships
-- with tracks, reviews, gig_applications, etc.

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- After rollback, verify:
-- SELECT name FROM sqlite_master WHERE type='table' AND name='user_connections';
-- Expected: No results (table should not exist)
-- ============================================================================

