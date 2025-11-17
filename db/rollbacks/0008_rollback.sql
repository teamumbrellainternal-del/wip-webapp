-- ============================================================================
-- ROLLBACK FOR MIGRATION 0008: Reference Data Tables
-- ============================================================================
-- WARNING: This will DELETE ALL DATA in genres, tags, and system_config tables
-- This action is IRREVERSIBLE and will cause data loss
-- ============================================================================

-- Drop tables (no foreign key dependencies between them)
DROP TABLE IF EXISTS system_config;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS genres;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- After rollback, verify tables are removed:
-- SELECT name FROM sqlite_master WHERE type='table'
-- WHERE name IN ('genres', 'tags', 'system_config');
-- Expected: No rows returned
-- ============================================================================
