-- ============================================================================
-- MIGRATION 0016: Notifications System
-- ============================================================================
-- Creates the notifications table for in-app notifications
-- Supports connection requests, connection accepted, and future notification types
-- ============================================================================

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('connection_request', 'connection_accepted', 'message', 'gig_application', 'review', 'system')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data TEXT, -- JSON string for additional context (e.g., { "connection_id": "...", "from_user_id": "..." })
  read INTEGER DEFAULT 0, -- SQLite boolean: 0 = unread, 1 = read
  created_at TEXT NOT NULL
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- After migration, verify:
-- PRAGMA table_info(notifications);
-- SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='notifications';
-- ============================================================================

