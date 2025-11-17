-- ============================================================================
-- ROLLBACK FOR MIGRATION 0012: Missing Foreign Key Index
-- ============================================================================
-- This rollback removes the foreign key index added in migration 0012
-- No data loss - only removes index to revert to pre-optimization state
-- ============================================================================

-- Drop the index created in migration 0012
DROP INDEX IF EXISTS idx_reviews_reviewer_user;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- After rollback, verify index is removed:
-- SELECT name FROM sqlite_master WHERE type='index' AND name='idx_reviews_reviewer_user';
-- Expected: No rows returned
-- ============================================================================

-- ============================================================================
-- IMPACT ASSESSMENT
-- ============================================================================
-- Removing this index will:
-- - Slow down queries that filter reviews by reviewer_user_id
-- - Slow down JOIN operations involving reviews and users on reviewer_user_id
-- - Slow down ON DELETE SET NULL cascade operations
--
-- This rollback is SAFE (no data loss) but will degrade performance for
-- queries involving the reviewer_user_id foreign key
-- ============================================================================
