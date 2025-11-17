-- ============================================================================
-- ROLLBACK FOR MIGRATION 0005: Analytics & AI Usage
-- ============================================================================
-- WARNING: This will DELETE ALL DATA in analytics, AI usage, and creative studio tables
-- This action is IRREVERSIBLE and will cause data loss
-- ============================================================================

-- Drop tables in reverse dependency order
-- Drop child tables first, then parent tables
DROP TABLE IF EXISTS goals;
DROP TABLE IF EXISTS journal_entries;
DROP TABLE IF EXISTS broadcast_messages;
DROP TABLE IF EXISTS contact_list_members;
DROP TABLE IF EXISTS contact_lists;
DROP TABLE IF EXISTS violet_usage;
DROP TABLE IF EXISTS daily_metrics;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- After rollback, verify tables are removed:
-- SELECT name FROM sqlite_master WHERE type='table'
-- WHERE name IN ('daily_metrics', 'violet_usage', 'contact_lists', 'contact_list_members',
--                'broadcast_messages', 'journal_entries', 'goals');
-- Expected: No rows returned
-- ============================================================================
