-- ============================================================================
-- MIGRATION 0015: User Connections (LinkedIn-style mutual connections)
-- ============================================================================
-- Creates the user_connections table for two-way connection requests
-- Adds connection_count column to artists table
-- ============================================================================

-- User connections table (mutual connection requests)
-- Unlike artist_followers (one-way), connections require acceptance from both parties
CREATE TABLE IF NOT EXISTS user_connections (
  id TEXT PRIMARY KEY,
  requester_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  declined_at TEXT, -- Timestamp when declined (for 30-day retry cooldown)
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  -- Prevent duplicate connection requests (A->B is same as B->A for connections)
  UNIQUE(requester_user_id, recipient_user_id)
);

-- Indexes for efficient bi-directional lookups
CREATE INDEX IF NOT EXISTS idx_connections_requester ON user_connections(requester_user_id);
CREATE INDEX IF NOT EXISTS idx_connections_recipient ON user_connections(recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_connections_status ON user_connections(status);
CREATE INDEX IF NOT EXISTS idx_connections_declined_at ON user_connections(declined_at) WHERE declined_at IS NOT NULL;

-- Add connection_count to artists table (similar to follower_count)
ALTER TABLE artists ADD COLUMN connection_count INTEGER DEFAULT 0;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- After migration, verify:
-- PRAGMA table_info(user_connections);
-- PRAGMA table_info(artists); -- Should show connection_count column
-- SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='user_connections';
-- ============================================================================

