-- Umbrella MVP Migration 0002: Portfolio & Marketplace
-- Tracks (artist music portfolio) and Gigs (venue opportunities)

-- Tracks table (unlimited uploads, constrained by 50GB storage)
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

-- Gigs table (venue opportunities)
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
  urgency_flag BOOLEAN DEFAULT 0, -- Auto-set: <7 days AND <50% capacity filled
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

-- Gig Applications (artists applying to gigs)
CREATE TABLE IF NOT EXISTS gig_applications (
  id TEXT PRIMARY KEY,
  gig_id TEXT NOT NULL REFERENCES gigs(id) ON DELETE CASCADE,
  artist_id TEXT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', rejected')),
  applied_at TEXT NOT NULL,
  responded_at TEXT,
  UNIQUE(gig_id, artist_id)
);

CREATE INDEX IF NOT EXISTS idx_applications_gig ON gig_applications(gig_id);
CREATE INDEX IF NOT EXISTS idx_applications_artist ON gig_applications(artist_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON gig_applications(status);

-- Gig favorites (artists can favorite gigs for later)
CREATE TABLE IF NOT EXISTS gig_favorites (
  id TEXT PRIMARY KEY,
  gig_id TEXT NOT NULL REFERENCES gigs(id) ON DELETE CASCADE,
  artist_id TEXT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  UNIQUE(gig_id, artist_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_gig ON gig_favorites(gig_id);
CREATE INDEX IF NOT EXISTS idx_favorites_artist ON gig_favorites(artist_id);
