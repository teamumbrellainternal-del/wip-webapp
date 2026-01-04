-- ============================================================================
-- MIGRATION: Add profile slugs for SEO-friendly URLs
-- Version: 0019
-- Description: Adds slug columns to artists and venues tables for human-readable
--              profile URLs (e.g., /artist/john-doe instead of /artist/uuid)
-- ============================================================================

-- Add slug column to artists table (without UNIQUE - SQLite limitation)
ALTER TABLE artists ADD COLUMN slug TEXT;

-- Add slug column to venues table (without UNIQUE - SQLite limitation)
ALTER TABLE venues ADD COLUMN slug TEXT;

-- Create unique indexes for slug lookup (enforces uniqueness)
CREATE UNIQUE INDEX IF NOT EXISTS idx_artists_slug ON artists(slug);
CREATE UNIQUE INDEX IF NOT EXISTS idx_venues_slug ON venues(slug);

