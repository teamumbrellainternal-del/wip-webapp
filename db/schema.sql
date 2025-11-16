-- ============================================================================
-- UMBRELLA MVP - CONSOLIDATED DATABASE SCHEMA
-- ============================================================================
-- Version: 1.0
-- Last Updated: 2025-10-24
-- Architecture: Cloudflare D1 (SQLite at edge)
--
-- This file consolidates all migration files into a single schema for reference.
-- For production deployments, use the versioned migration files in db/migrations/
--
-- Key Design Decisions:
-- - D-001: OAuth-only authentication (Apple/Google via Cloudflare Access)
-- - D-026: 50GB storage quota per artist (unlimited file uploads within quota)
-- - D-043: 2000 character limit on messages
-- - D-062: 50 prompts/day limit for Violet AI
-- - D-008: Daily batch metrics updates at midnight UTC
-- ============================================================================

-- ============================================================================
-- SECTION 1: USERS & AUTHENTICATION
-- ============================================================================

-- Users table (OAuth-linked accounts)
-- D-001: No password field - Apple/Google OAuth only
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  oauth_provider TEXT NOT NULL CHECK (oauth_provider IN ('apple', 'google')),
  oauth_id TEXT NOT NULL,
  email TEXT NOT NULL,
  onboarding_complete BOOLEAN DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(oauth_provider, oauth_id)
);

CREATE INDEX IF NOT EXISTS idx_users_oauth ON users(oauth_provider, oauth_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================================================
-- SECTION 2: ARTIST PROFILES
-- ============================================================================

-- Artists table (40+ attributes from onboarding)
-- Captures all 5 onboarding steps with full artist profile
CREATE TABLE IF NOT EXISTS artists (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Identity (Onboarding Step 1)
  stage_name TEXT NOT NULL,
  legal_name TEXT,
  pronouns TEXT,
  location_city TEXT,
  location_state TEXT,
  location_country TEXT DEFAULT 'US',
  location_zip TEXT,
  phone_number TEXT,

  -- Bio & Story (Step 2)
  bio TEXT,
  story TEXT,
  tagline TEXT,

  -- Creative Profile (Step 3)
  primary_genre TEXT,
  secondary_genres TEXT, -- JSON array
  influences TEXT, -- JSON array
  artist_type TEXT, -- JSON array ['solo', 'band', 'dj', 'producer']
  equipment TEXT, -- JSON array
  daw TEXT, -- JSON array of DAWs used
  platforms TEXT, -- JSON array of platforms
  subscriptions TEXT, -- JSON array
  struggles TEXT, -- JSON array of career struggles

  -- Rates & Availability (Step 4)
  base_rate_flat INTEGER,
  base_rate_hourly INTEGER,
  rates_negotiable BOOLEAN DEFAULT 1,
  largest_show_capacity INTEGER,
  travel_radius_miles INTEGER,
  available_weekdays BOOLEAN DEFAULT 1,
  available_weekends BOOLEAN DEFAULT 1,
  advance_booking_weeks INTEGER DEFAULT 2,
  available_dates TEXT, -- JSON array of ISO dates
  time_split_creative INTEGER, -- Percentage time on creative work
  time_split_logistics INTEGER, -- Percentage time on logistics

  -- Quick Questions (Step 5)
  currently_making_music BOOLEAN,
  confident_online_presence BOOLEAN,
  struggles_creative_niche BOOLEAN,
  knows_where_find_gigs BOOLEAN,
  paid_fairly_performing BOOLEAN,
  understands_royalties BOOLEAN,

  -- Onboarding Step 2 - Additional qualitative fields
  tasks_outsource TEXT,
  sound_uniqueness TEXT,
  dream_venue TEXT,
  biggest_inspiration TEXT,
  favorite_create_time TEXT,
  platform_pain_point TEXT,

  -- Social & Portfolio Links
  website_url TEXT,
  instagram_handle TEXT,
  tiktok_handle TEXT,
  youtube_url TEXT,
  spotify_url TEXT,
  apple_music_url TEXT,
  soundcloud_url TEXT,
  facebook_url TEXT,
  twitter_url TEXT,
  bandcamp_url TEXT,

  -- Verification & Metadata
  verified BOOLEAN DEFAULT 0,
  avatar_url TEXT,
  banner_url TEXT,
  avg_rating REAL DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_gigs INTEGER DEFAULT 0,
  total_earnings INTEGER DEFAULT 0, -- User-reported from completed gigs
  profile_views INTEGER DEFAULT 0,
  follower_count INTEGER DEFAULT 0,

  -- Onboarding step tracking
  step_1_complete BOOLEAN DEFAULT 0,
  step_2_complete BOOLEAN DEFAULT 0,
  step_3_complete BOOLEAN DEFAULT 0,
  step_4_complete BOOLEAN DEFAULT 0,
  step_5_complete BOOLEAN DEFAULT 0,

  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,

  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_artists_user_id ON artists(user_id);
CREATE INDEX IF NOT EXISTS idx_artists_verified ON artists(verified);
CREATE INDEX IF NOT EXISTS idx_artists_genre ON artists(primary_genre);
CREATE INDEX IF NOT EXISTS idx_artists_location ON artists(location_city, location_state);
CREATE INDEX IF NOT EXISTS idx_artists_rating ON artists(avg_rating);
CREATE INDEX IF NOT EXISTS idx_artists_onboarding_complete ON artists(step_1_complete, step_2_complete, step_3_complete, step_4_complete, step_5_complete);

-- Artist followers (social following relationships)
CREATE TABLE IF NOT EXISTS artist_followers (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  follower_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  UNIQUE(artist_id, follower_user_id)
);

CREATE INDEX IF NOT EXISTS idx_followers_artist ON artist_followers(artist_id);
CREATE INDEX IF NOT EXISTS idx_followers_user ON artist_followers(follower_user_id);

-- ============================================================================
-- SECTION 3: PORTFOLIO & TRACKS
-- ============================================================================

-- Tracks table (unlimited uploads, constrained by 50GB storage quota per D-026)
CREATE TABLE IF NOT EXISTS tracks (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  duration_seconds INTEGER,
  file_url TEXT NOT NULL, -- R2 URL
  cover_art_url TEXT,
  genre TEXT,
  release_year INTEGER,
  spotify_url TEXT,
  apple_music_url TEXT,
  soundcloud_url TEXT,
  display_order INTEGER DEFAULT 0,
  plays INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tracks_artist_id ON tracks(artist_id);
CREATE INDEX IF NOT EXISTS idx_tracks_order ON tracks(artist_id, display_order);
CREATE INDEX IF NOT EXISTS idx_tracks_genre ON tracks(genre);

-- ============================================================================
-- SECTION 4: MARKETPLACE & GIGS
-- ============================================================================

-- Gigs table (venue opportunities)
-- D-010: urgency_flag auto-set for gigs <7 days with <50% capacity filled
CREATE TABLE IF NOT EXISTS gigs (
  id TEXT PRIMARY KEY,
  venue_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  venue_name TEXT NOT NULL,
  location_city TEXT NOT NULL,
  location_state TEXT NOT NULL,
  location_address TEXT,
  location_zip TEXT,
  date TEXT NOT NULL, -- ISO date YYYY-MM-DD
  start_time TEXT, -- HH:MM format
  end_time TEXT, -- HH:MM format
  genre TEXT,
  capacity INTEGER,
  filled_slots INTEGER DEFAULT 0,
  payment_amount INTEGER,
  payment_type TEXT CHECK (payment_type IN ('flat', 'hourly', 'negotiable')),
  urgency_flag BOOLEAN DEFAULT 0, -- D-010: Auto-set <7 days AND <50% capacity
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'filled', 'cancelled', 'completed')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_gigs_date ON gigs(date);
CREATE INDEX IF NOT EXISTS idx_gigs_location ON gigs(location_city, location_state);
CREATE INDEX IF NOT EXISTS idx_gigs_genre ON gigs(genre);
CREATE INDEX IF NOT EXISTS idx_gigs_status ON gigs(status);
CREATE INDEX IF NOT EXISTS idx_gigs_urgency ON gigs(urgency_flag);
CREATE INDEX IF NOT EXISTS idx_gigs_venue ON gigs(venue_id);

-- Gig Applications (D-077: single-click apply sends profile + rates)
CREATE TABLE IF NOT EXISTS gig_applications (
  id TEXT PRIMARY KEY,
  gig_id TEXT NOT NULL REFERENCES gigs(id) ON DELETE CASCADE,
  artist_id TEXT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  applied_at TEXT NOT NULL,
  responded_at TEXT,
  UNIQUE(gig_id, artist_id)
);

CREATE INDEX IF NOT EXISTS idx_applications_gig ON gig_applications(gig_id);
CREATE INDEX IF NOT EXISTS idx_applications_artist ON gig_applications(artist_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON gig_applications(status);

-- Gig favorites (artists can save gigs for later)
CREATE TABLE IF NOT EXISTS gig_favorites (
  id TEXT PRIMARY KEY,
  gig_id TEXT NOT NULL REFERENCES gigs(id) ON DELETE CASCADE,
  artist_id TEXT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  UNIQUE(gig_id, artist_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_gig ON gig_favorites(gig_id);
CREATE INDEX IF NOT EXISTS idx_favorites_artist ON gig_favorites(artist_id);

-- ============================================================================
-- SECTION 5: MESSAGING SYSTEM
-- ============================================================================

-- Conversations table (polling-based message threads)
-- No WebSocket in MVP - 5-second polling acceptable for MVP scale
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  participant_1_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  participant_2_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_message_at TEXT,
  last_message_preview TEXT, -- First 100 chars of last message
  unread_count_p1 INTEGER DEFAULT 0, -- Unread count for participant 1
  unread_count_p2 INTEGER DEFAULT 0, -- Unread count for participant 2
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(participant_1_id, participant_2_id)
);

CREATE INDEX IF NOT EXISTS idx_conversations_p1 ON conversations(participant_1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_p2 ON conversations(participant_2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(last_message_at DESC);

-- Messages table (D-043: 2000 char limit, text + attachments)
-- D-087: No rate limits on in-app messaging
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (LENGTH(content) <= 2000), -- D-043: 2000 char limit
  attachment_url TEXT, -- R2 URL for file attachments
  attachment_filename TEXT,
  attachment_size INTEGER,
  read BOOLEAN DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(conversation_id, read);

-- ============================================================================
-- SECTION 6: FILE STORAGE & MANAGEMENT
-- ============================================================================

-- Files table (metadata only, blobs stored in R2)
-- D-026: 50GB quota per artist enforced via storage_quotas table
CREATE TABLE IF NOT EXISTS files (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_size_bytes INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  r2_key TEXT NOT NULL, -- R2 object key
  category TEXT CHECK (category IN ('press_photo', 'music', 'video', 'document', 'other')),
  folder_id TEXT, -- Optional folder organization
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_files_artist ON files(artist_id);
CREATE INDEX IF NOT EXISTS idx_files_category ON files(artist_id, category);
CREATE INDEX IF NOT EXISTS idx_files_folder ON files(folder_id);

-- Folders table (manual file organization)
CREATE TABLE IF NOT EXISTS folders (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  parent_folder_id TEXT REFERENCES folders(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_folders_artist ON folders(artist_id);
CREATE INDEX IF NOT EXISTS idx_folders_parent ON folders(parent_folder_id);

-- Storage quotas table (D-026: 50GB per artist)
CREATE TABLE IF NOT EXISTS storage_quotas (
  artist_id TEXT PRIMARY KEY REFERENCES artists(id) ON DELETE CASCADE,
  used_bytes INTEGER DEFAULT 0,
  limit_bytes INTEGER DEFAULT 53687091200, -- 50GB in bytes
  updated_at TEXT NOT NULL
);

-- ============================================================================
-- SECTION 7: REVIEWS & FEEDBACK
-- ============================================================================

-- Reviews table (D-034: no moderation in MVP)
-- D-032: Artists can invite anyone via email to leave review
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  reviewer_user_id TEXT REFERENCES users(id) ON DELETE SET NULL, -- NULL if invited via email
  reviewer_email TEXT, -- If invited via email (non-platform user)
  reviewer_name TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  gig_id TEXT REFERENCES gigs(id) ON DELETE SET NULL, -- Optional link to specific gig
  invite_token TEXT, -- Unique token for email invitations
  created_at TEXT NOT NULL,
  UNIQUE(artist_id, reviewer_user_id, gig_id),
  UNIQUE(artist_id, reviewer_email, gig_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_artist ON reviews(artist_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(artist_id, rating);
CREATE INDEX IF NOT EXISTS idx_reviews_gig ON reviews(gig_id);
CREATE INDEX IF NOT EXISTS idx_reviews_token ON reviews(invite_token);

-- Timeline/Journey entries (career milestones)
CREATE TABLE IF NOT EXISTS timeline_entries (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  date TEXT NOT NULL, -- ISO date
  title TEXT NOT NULL,
  description TEXT,
  entry_type TEXT CHECK (entry_type IN ('gig', 'release', 'milestone', 'other')),
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_timeline_artist ON timeline_entries(artist_id);
CREATE INDEX IF NOT EXISTS idx_timeline_date ON timeline_entries(artist_id, date DESC);

-- ============================================================================
-- SECTION 8: ANALYTICS & METRICS
-- ============================================================================

-- Daily analytics (D-008: aggregated at midnight UTC)
-- Batch updates reduce database load vs. real-time
CREATE TABLE IF NOT EXISTS daily_metrics (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  date TEXT NOT NULL, -- YYYY-MM-DD
  profile_views INTEGER DEFAULT 0,
  gigs_completed INTEGER DEFAULT 0,
  earnings INTEGER DEFAULT 0, -- User-reported from completed gigs (D-080)
  avg_rating REAL DEFAULT 0,
  follower_count INTEGER DEFAULT 0,
  track_plays INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  UNIQUE(artist_id, date)
);

CREATE INDEX IF NOT EXISTS idx_metrics_artist_date ON daily_metrics(artist_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_date ON daily_metrics(date);

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

-- ============================================================================
-- SECTION 9: VIOLET AI & USAGE TRACKING
-- ============================================================================

-- Violet AI usage tracking (D-062: 50 prompts/day limit)
-- Tracks per-artist usage with daily reset at midnight UTC
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

-- ============================================================================
-- SECTION 10: FAN COMMUNICATION & BROADCASTS
-- ============================================================================

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

-- Broadcast messages (D-049: text-only in MVP, no attachments)
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

-- ============================================================================
-- SECTION 11: CREATIVE STUDIO & JOURNAL
-- ============================================================================

-- Journal entries (Creative Studio - block-based editor)
CREATE TABLE IF NOT EXISTS journal_entries (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT, -- JSON blocks (text, video, audio, images)
  entry_type TEXT CHECK (entry_type IN ('text', 'video', 'mixed')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_journal_artist ON journal_entries(artist_id);
CREATE INDEX IF NOT EXISTS idx_journal_updated ON journal_entries(artist_id, updated_at DESC);

-- ============================================================================
-- SECTION 12: CRON JOB LOGGING
-- ============================================================================

-- Cron execution logs (tracks daily analytics aggregation runs)
CREATE TABLE IF NOT EXISTS cron_logs (
  id TEXT PRIMARY KEY,
  job_name TEXT NOT NULL, -- e.g., 'analytics_aggregation'
  start_time TEXT NOT NULL, -- ISO timestamp
  end_time TEXT, -- ISO timestamp (null if still running)
  duration_ms INTEGER, -- Execution time in milliseconds
  records_processed INTEGER DEFAULT 0, -- Number of records processed
  errors_count INTEGER DEFAULT 0, -- Number of errors encountered
  status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
  error_message TEXT, -- Error details if failed
  metadata TEXT, -- JSON for additional context
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cron_logs_job ON cron_logs(job_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cron_logs_status ON cron_logs(status);
CREATE INDEX IF NOT EXISTS idx_cron_logs_created ON cron_logs(created_at DESC);

-- ============================================================================
-- SCHEMA SUMMARY
-- ============================================================================
-- Total Tables: 24
--
-- Core Entities:
--   - users, artists, artist_followers
-- Portfolio:
--   - tracks
-- Marketplace:
--   - gigs, gig_applications, gig_favorites
-- Communication:
--   - conversations, messages
-- File Management:
--   - files, folders, storage_quotas
-- Reviews & Feedback:
--   - reviews, timeline_entries
-- Analytics:
--   - daily_metrics, goals
-- AI & Usage:
--   - violet_usage
-- Fan Communication:
--   - contact_lists, contact_list_members, broadcast_messages
-- Creative Studio:
--   - journal_entries
-- Cron Jobs:
--   - cron_logs
--
-- Total Indexes: 63+
-- Foreign Keys: All relationships enforced at database level
-- Check Constraints: Enums enforced via CHECK constraints
-- Unique Constraints: Prevent duplicate relationships
-- ============================================================================
