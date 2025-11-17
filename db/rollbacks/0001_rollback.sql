-- ============================================================================
-- ROLLBACK FOR MIGRATION 0001: Core Entities
-- ============================================================================
-- WARNING: This will DELETE ALL DATA in users, artists, and artist_followers tables
-- This action is IRREVERSIBLE and will cause data loss
-- ============================================================================

-- Drop tables in reverse dependency order
-- Drop child tables first, then parent tables
DROP TABLE IF EXISTS artist_followers;
DROP TABLE IF EXISTS artists;
DROP TABLE IF EXISTS users;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- After rollback, verify tables are removed:
-- SELECT name FROM sqlite_master WHERE type='table' AND name IN ('users', 'artists', 'artist_followers');
-- Expected: No rows returned
-- ============================================================================
