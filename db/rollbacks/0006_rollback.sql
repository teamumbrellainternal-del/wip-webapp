-- ============================================================================
-- ROLLBACK FOR MIGRATION 0006: Delivery Queue System
-- ============================================================================
-- WARNING: This will DELETE ALL DATA in delivery queue and log tables
-- This action is IRREVERSIBLE and will cause data loss
-- ============================================================================

-- Drop tables (no foreign key dependencies between them)
DROP TABLE IF EXISTS unsubscribe_list;
DROP TABLE IF EXISTS sms_delivery_log;
DROP TABLE IF EXISTS email_delivery_log;
DROP TABLE IF EXISTS sms_delivery_queue;
DROP TABLE IF EXISTS email_delivery_queue;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- After rollback, verify tables are removed:
-- SELECT name FROM sqlite_master WHERE type='table'
-- WHERE name IN ('email_delivery_queue', 'sms_delivery_queue', 'email_delivery_log',
--                'sms_delivery_log', 'unsubscribe_list');
-- Expected: No rows returned
-- ============================================================================
