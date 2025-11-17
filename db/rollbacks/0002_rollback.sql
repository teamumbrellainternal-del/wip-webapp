-- ============================================================================
-- ROLLBACK FOR MIGRATION 0002: Portfolio & Marketplace
-- ============================================================================
-- WARNING: This will DELETE ALL DATA in tracks, gigs, gig_applications, and gig_favorites tables
-- This action is IRREVERSIBLE and will cause data loss
-- ============================================================================

-- Drop tables in reverse dependency order
-- Drop child tables first (those with foreign keys), then parent tables
DROP TABLE IF EXISTS gig_favorites;
DROP TABLE IF EXISTS gig_applications;
DROP TABLE IF EXISTS gigs;
DROP TABLE IF EXISTS tracks;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- After rollback, verify tables are removed:
-- SELECT name FROM sqlite_master WHERE type='table' AND name IN ('tracks', 'gigs', 'gig_applications', 'gig_favorites');
-- Expected: No rows returned
-- ============================================================================
