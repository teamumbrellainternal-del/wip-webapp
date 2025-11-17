-- ============================================================================
-- ROLLBACK FOR MIGRATION 0004: Files & Reviews
-- ============================================================================
-- WARNING: This will DELETE ALL DATA in files, folders, storage_quotas, reviews, and timeline_entries tables
-- This action is IRREVERSIBLE and will cause data loss
-- ============================================================================

-- Drop tables in reverse dependency order
-- Drop child tables first (those with foreign keys), then parent tables
DROP TABLE IF EXISTS timeline_entries;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS storage_quotas;
DROP TABLE IF EXISTS files;
DROP TABLE IF EXISTS folders;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- After rollback, verify tables are removed:
-- SELECT name FROM sqlite_master WHERE type='table'
-- WHERE name IN ('files', 'folders', 'storage_quotas', 'reviews', 'timeline_entries');
-- Expected: No rows returned
-- ============================================================================
