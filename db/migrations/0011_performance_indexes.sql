-- ============================================================================
-- MIGRATION 0011: Performance Optimization Indexes
-- ============================================================================
-- Task: task-10.3 - Performance optimization pass
-- Created: 2025-11-17
-- Description: Add strategic indexes to optimize common query patterns
-- ============================================================================

-- Index for gig payment amount filtering (price range queries)
-- Used in marketplace gig search with price filters
CREATE INDEX IF NOT EXISTS idx_gigs_payment_amount ON gigs(payment_amount);

-- Composite index for gigs filtered by status and date
-- Optimizes marketplace queries that filter open gigs by date
CREATE INDEX IF NOT EXISTS idx_gigs_status_date ON gigs(status, date);

-- Composite index for gigs by status, genre, and date
-- Optimizes filtered marketplace searches (status + genre + chronological)
CREATE INDEX IF NOT EXISTS idx_gigs_status_genre_date ON gigs(status, genre, date);

-- Index for tracks by artist and plays
-- Optimizes "popular tracks" queries for artist profiles
CREATE INDEX IF NOT EXISTS idx_tracks_artist_plays ON tracks(artist_id, plays DESC);

-- Index for messages by read status
-- Already exists as idx_messages_read (conversation_id, read)
-- Optimizes unread message counts

-- Index for conversation participants lookup
-- Composite index for finding conversations by either participant
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations(participant_1_id, participant_2_id);

-- ============================================================================
-- QUERY PLAN VERIFICATION
-- ============================================================================
-- To verify these indexes are being used, run EXPLAIN QUERY PLAN:
--
-- EXPLAIN QUERY PLAN
-- SELECT * FROM gigs
-- WHERE status = 'open' AND payment_amount BETWEEN 100 AND 500
-- ORDER BY date;
--
-- Expected: Uses idx_gigs_payment_amount or idx_gigs_status_date
-- ============================================================================
