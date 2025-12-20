-- ============================================================================
-- Migration 0017: Add role column to users table for RBAC
-- ============================================================================
-- Purpose: Enable role-based access control by storing user roles
-- Valid roles: 'artist', 'venue', 'fan', 'collective'
-- Default: 'artist' for existing users (all went through artist onboarding)
-- ============================================================================

-- Add role column with constraint for valid values
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'artist' 
  CHECK (role IN ('artist', 'venue', 'fan', 'collective'));

-- Create index for role-based queries (filtering users by role)
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

