-- ============================================================================
-- MIGRATION 0012: Missing Foreign Key Index
-- ============================================================================
-- Task: task-11.6 - Database Optimization
-- Created: 2025-11-17
-- Description: Add missing index on reviews.reviewer_user_id foreign key
-- ============================================================================

-- Index for reviews by reviewer (foreign key index)
-- This foreign key was missing an index, which is important for:
-- 1. JOIN operations when querying reviews by reviewer
-- 2. ON DELETE SET NULL cascade operations performance
-- 3. Future queries like "show all reviews written by this user"
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_user ON reviews(reviewer_user_id);

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- To verify this index is being used, run:
-- EXPLAIN QUERY PLAN SELECT * FROM reviews WHERE reviewer_user_id = 'user_123';
-- Expected: SEARCH TABLE reviews USING INDEX idx_reviews_reviewer_user
-- ============================================================================
