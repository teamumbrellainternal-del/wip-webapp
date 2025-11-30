-- ============================================================================
-- ROLLBACK FOR MIGRATION 0016: Notifications System
-- ============================================================================
-- WARNING: This will delete all notification data
-- ============================================================================

-- ROLLBACK NOT RECOMMENDED IN PRODUCTION
-- Instead, consider leaving the table (it's harmless if unused)
-- Or use fix-forward approach with a new migration

-- If rollback is absolutely necessary:
DROP TABLE IF EXISTS notifications;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- After rollback, verify:
-- SELECT name FROM sqlite_master WHERE type='table' AND name='notifications';
-- Expected: No results (table should not exist)
-- ============================================================================

