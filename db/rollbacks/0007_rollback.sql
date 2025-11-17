-- ============================================================================
-- ROLLBACK FOR MIGRATION 0007: Clerk Integration
-- ============================================================================
-- WARNING: This migration adds a column to the users table
-- SQLite does not support DROP COLUMN directly
-- Rollback requires recreating the table without the column
-- This is a COMPLEX operation and should be done carefully
-- ============================================================================

-- ROLLBACK NOT RECOMMENDED IN PRODUCTION
-- Instead, consider leaving the column (it's nullable and won't break anything)
-- Or use fix-forward approach with a new migration

-- If rollback is absolutely necessary, follow these steps:

-- Step 1: Create temporary table without clerk_id column
CREATE TABLE IF NOT EXISTS users_temp (
  id TEXT PRIMARY KEY,
  oauth_provider TEXT NOT NULL CHECK (oauth_provider IN ('apple', 'google')),
  oauth_id TEXT NOT NULL,
  email TEXT NOT NULL,
  onboarding_complete BOOLEAN DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(oauth_provider, oauth_id)
);

-- Step 2: Copy data from users to users_temp (excluding clerk_id)
INSERT INTO users_temp SELECT id, oauth_provider, oauth_id, email, onboarding_complete, created_at, updated_at FROM users;

-- Step 3: Drop original table
DROP TABLE users;

-- Step 4: Rename temp table to users
ALTER TABLE users_temp RENAME TO users;

-- Step 5: Recreate indexes
CREATE INDEX IF NOT EXISTS idx_users_oauth ON users(oauth_provider, oauth_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- After rollback, verify clerk_id column is gone:
-- PRAGMA table_info(users);
-- Expected: No column named 'clerk_id'
-- ============================================================================

-- ============================================================================
-- IMPORTANT NOTES
-- ============================================================================
-- This rollback is COMPLEX and RISKY because:
-- 1. Foreign key relationships may be temporarily broken during table recreation
-- 2. Data loss occurs if the INSERT SELECT is not correct
-- 3. Triggers and constraints need careful handling
--
-- RECOMMENDATION: Do NOT rollback this migration in production
-- Instead, use fix-forward approach or leave the column
-- ============================================================================
