-- Umbrella Migration 0007: Clerk Integration
-- Add Clerk user ID for easier lookups and session management

-- Add clerk_id column to users table
ALTER TABLE users ADD COLUMN clerk_id TEXT UNIQUE;

-- Create index for fast Clerk ID lookups
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);

-- Note: oauth_provider and oauth_id remain for backward compatibility
-- Clerk will use 'clerk' as oauth_provider and store the Clerk user ID in oauth_id
