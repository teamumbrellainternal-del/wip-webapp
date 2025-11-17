-- ============================================================================
-- ROLLBACK FOR MIGRATION 0010: Cron Job Logging
-- ============================================================================
-- WARNING: This will DELETE ALL DATA in cron_logs table
-- This action is IRREVERSIBLE and will cause data loss
-- ============================================================================

-- Drop the cron_logs table
DROP TABLE IF EXISTS cron_logs;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- After rollback, verify table is removed:
-- SELECT name FROM sqlite_master WHERE type='table' AND name='cron_logs';
-- Expected: No rows returned
-- ============================================================================
