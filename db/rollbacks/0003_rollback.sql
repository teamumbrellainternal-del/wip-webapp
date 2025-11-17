-- ============================================================================
-- ROLLBACK FOR MIGRATION 0003: Messaging System
-- ============================================================================
-- WARNING: This will DELETE ALL DATA in conversations and messages tables
-- This action is IRREVERSIBLE and will cause data loss
-- ============================================================================

-- Drop tables in reverse dependency order
-- Drop child table first, then parent
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS conversations;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- After rollback, verify tables are removed:
-- SELECT name FROM sqlite_master WHERE type='table' AND name IN ('conversations', 'messages');
-- Expected: No rows returned
-- ============================================================================
