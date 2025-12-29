-- ============================================================================
-- MIGRATION: Add profile slugs for SEO-friendly URLs
-- Version: 0019
-- Description: Adds slug columns to artists and venues tables for human-readable
--              profile URLs (e.g., /artist/john-doe instead of /artist/uuid)
-- ============================================================================

-- Add slug column to artists table
ALTER TABLE artists ADD COLUMN slug TEXT UNIQUE;

-- Add slug column to venues table
ALTER TABLE venues ADD COLUMN slug TEXT UNIQUE;

-- Create indexes for fast slug lookup
CREATE INDEX IF NOT EXISTS idx_artists_slug ON artists(slug);
CREATE INDEX IF NOT EXISTS idx_venues_slug ON venues(slug);

