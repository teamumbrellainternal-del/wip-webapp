-- ============================================================================
-- ROLLBACK FOR MIGRATION 0011: Performance Optimization Indexes
-- ============================================================================
-- This rollback removes the performance indexes added in migration 0011
-- No data loss - only removes indexes to revert to pre-optimization state
-- ============================================================================

-- Drop all indexes created in migration 0011
DROP INDEX IF EXISTS idx_gigs_payment_amount;
DROP INDEX IF EXISTS idx_gigs_status_date;
DROP INDEX IF EXISTS idx_gigs_status_genre_date;
DROP INDEX IF EXISTS idx_tracks_artist_plays;
DROP INDEX IF EXISTS idx_conversations_participants;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- After rollback, verify indexes are removed:
-- SELECT name FROM sqlite_master WHERE type='index'
-- WHERE name IN ('idx_gigs_payment_amount', 'idx_gigs_status_date',
--                'idx_gigs_status_genre_date', 'idx_tracks_artist_plays',
--                'idx_conversations_participants');
-- Expected: No rows returned
-- ============================================================================

-- ============================================================================
-- IMPACT ASSESSMENT
-- ============================================================================
-- Removing these indexes will:
-- - Slow down marketplace gig searches with price filters
-- - Slow down filtered searches by status/genre/date
-- - Slow down popular tracks queries on artist profiles
-- - Slow down conversation lookup by participants
--
-- This rollback is SAFE (no data loss) but will degrade performance
-- ============================================================================
