-- ============================================================================
-- ROLLBACK FOR MIGRATION 0009: Onboarding Step Tracking
-- ============================================================================
-- WARNING: This migration adds columns to the artists table
-- SQLite does not support DROP COLUMN directly
-- NOTE: These columns already exist in migration 0001, making this migration redundant
-- ============================================================================

-- ROLLBACK NOT APPLICABLE
-- This migration is redundant because the step_*_complete columns already exist
-- in the artists table from migration 0001 (lines 103-107)
--
-- The "CREATE INDEX IF NOT EXISTS" at the end is idempotent and safe
-- If you need to rollback the index, use:

DROP INDEX IF EXISTS idx_artists_onboarding_complete;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- After rollback, verify index is removed:
-- SELECT name FROM sqlite_master WHERE type='index' AND name='idx_artists_onboarding_complete';
-- Expected: No rows returned
-- ============================================================================

-- ============================================================================
-- IMPORTANT NOTES
-- ============================================================================
-- The columns themselves cannot be easily removed because:
-- 1. They already existed before this migration
-- 2. SQLite does not support DROP COLUMN without table recreation
-- 3. Other parts of the application depend on these columns
--
-- RECOMMENDATION: Only drop the index if needed; keep the columns
-- ============================================================================
