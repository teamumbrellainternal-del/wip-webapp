-- Umbrella MVP Migration 0008: Reference Data Tables
-- Genres, Tags, and System Configuration tables for production seed data

-- Genres table (music genres for onboarding and marketplace)
CREATE TABLE IF NOT EXISTS genres (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_genres_slug ON genres(slug);
CREATE INDEX IF NOT EXISTS idx_genres_name ON genres(name);

-- Tags table (skills and vibe tags for artist profiles)
CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('skill', 'vibe')),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_tags_category ON tags(category);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);

-- System configuration table (application-wide settings)
CREATE TABLE IF NOT EXISTS system_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_system_config_key ON system_config(key);
