-- Umbrella MVP Migration 0001: Core Entities
-- Users and Artists tables with full onboarding attributes

-- Users table (OAuth-linked accounts)
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

-- Artists table (40+ attributes from onboarding)
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

  -- Onboarding Step 2 - Additional fields
  tasks_outsource TEXT,
  sound_uniqueness TEXT,
  dream_venue TEXT,
  biggest_inspiration TEXT,
  favorite_create_time TEXT,
  platform_pain_point TEXT,

  -- Social & Portfolio
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
  total_earnings INTEGER DEFAULT 0,
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

-- Artist followers (for social features)
CREATE TABLE IF NOT EXISTS artist_followers (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  follower_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  UNIQUE(artist_id, follower_user_id)
);

CREATE INDEX IF NOT EXISTS idx_followers_artist ON artist_followers(artist_id);
CREATE INDEX IF NOT EXISTS idx_followers_user ON artist_followers(follower_user_id);
