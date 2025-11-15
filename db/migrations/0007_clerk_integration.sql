-- Umbrella Migration 0007: Clerk Integration
-- Add Clerk user ID for easier lookups and session management

-- Add clerk_id column to users table (SQLite doesn't support UNIQUE in ALTER TABLE ADD COLUMN)
ALTER TABLE users ADD COLUMN clerk_id TEXT;

-- Create unique index for fast Clerk ID lookups (enforces uniqueness)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id) WHERE clerk_id IS NOT NULL;

-- Note: oauth_provider and oauth_id remain for backward compatibility
-- Clerk will use 'clerk' as oauth_provider and store the Clerk user ID in oauth_id
