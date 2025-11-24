-- Umbrella MVP Migration 0005: Analytics & AI Usage
-- Daily metrics aggregation and Violet AI usage tracking

-- Daily analytics (aggregated at midnight UTC)
CREATE TABLE IF NOT EXISTS daily_metrics (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  date TEXT NOT NULL, -- YYYY-MM-DD
  profile_views INTEGER DEFAULT 0,
  gigs_completed INTEGER DEFAULT 0,
  earnings INTEGER DEFAULT 0, -- User-reported from completed gigs
  avg_rating REAL DEFAULT 0,
  follower_count INTEGER DEFAULT 0,
  track_plays INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  UNIQUE(artist_id, date)
);

CREATE INDEX IF NOT EXISTS idx_metrics_artist_date ON daily_metrics(artist_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_date ON daily_metrics(date);

-- Violet AI usage tracking (50 prompts/day limit)
CREATE TABLE IF NOT EXISTS violet_usage (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  date TEXT NOT NULL, -- YYYY-MM-DD
  prompt_count INTEGER DEFAULT 0,
  feature_used TEXT, -- e.g., 'draft_message', 'gig_inquiry', 'songwriting'
  prompt_text TEXT,
  response_tokens INTEGER,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_violet_artist_date ON violet_usage(artist_id, date);
CREATE INDEX IF NOT EXISTS idx_violet_feature ON violet_usage(feature_used);

-- Contact lists (for fan messaging/broadcasts)
CREATE TABLE IF NOT EXISTS contact_lists (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_contact_lists_artist ON contact_lists(artist_id);

-- Contact list members (fans for broadcasts)
CREATE TABLE IF NOT EXISTS contact_list_members (
  id TEXT PRIMARY KEY,
  list_id TEXT NOT NULL REFERENCES contact_lists(id) ON DELETE CASCADE,
  email TEXT,
  phone TEXT,
  name TEXT,
  opted_in_email BOOLEAN DEFAULT 1,
  opted_in_sms BOOLEAN DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_contacts_list ON contact_list_members(list_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contact_list_members(email);
CREATE INDEX IF NOT EXISTS idx_contacts_phone ON contact_list_members(phone);

-- Broadcast messages (fan blasts - text-only in MVP)
CREATE TABLE IF NOT EXISTS broadcast_messages (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  recipient_count INTEGER DEFAULT 0,
  sent_via TEXT CHECK (sent_via IN ('email', 'sms', 'both')),
  sent_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_broadcasts_artist ON broadcast_messages(artist_id);
CREATE INDEX IF NOT EXISTS idx_broadcasts_sent ON broadcast_messages(sent_at DESC);

-- Journal entries (Creative Studio - block-based editor)
CREATE TABLE IF NOT EXISTS journal_entries (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT, -- JSON blocks (text, video, audio, images)
  entry_type TEXT CHECK (entry_type IN ('song_idea', 'set_plan', 'general_note')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_journal_artist ON journal_entries(artist_id);
CREATE INDEX IF NOT EXISTS idx_journal_updated ON journal_entries(artist_id, updated_at DESC);

-- Goals tracking (artist-defined goals)
CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_value INTEGER,
  current_value INTEGER DEFAULT 0,
  goal_type TEXT CHECK (goal_type IN ('earnings', 'gigs', 'followers', 'tracks', 'custom')),
  target_date TEXT, -- ISO date
  completed BOOLEAN DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_goals_artist ON goals(artist_id);
CREATE INDEX IF NOT EXISTS idx_goals_completed ON goals(artist_id, completed);
CREATE INDEX IF NOT EXISTS idx_goals_date ON goals(target_date);
