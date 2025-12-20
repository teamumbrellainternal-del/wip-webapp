-- ============================================================================
-- MIGRATION: Create venues table for venue profiles
-- Version: 0018
-- Description: Creates the venues table to store venue profile data
--              This enables the two-sided marketplace with venue mode
-- ============================================================================

-- Venues table (venue profiles linked to users with role='venue')
CREATE TABLE IF NOT EXISTS venues (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- Identity
  name TEXT NOT NULL,
  tagline TEXT,
  venue_type TEXT CHECK (venue_type IN ('club', 'bar', 'theater', 'arena', 'outdoor', 'restaurant', 'other')),
  
  -- Location
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'US',
  
  -- Venue Details
  capacity INTEGER,
  standing_capacity INTEGER,
  seated_capacity INTEGER,
  stage_size TEXT CHECK (stage_size IN ('small', 'medium', 'large')),
  sound_system TEXT,
  has_green_room BOOLEAN DEFAULT 0,
  has_parking BOOLEAN DEFAULT 0,
  
  -- Booking
  status TEXT DEFAULT 'open_for_bookings' CHECK (status IN ('open_for_bookings', 'closed', 'limited')),
  booking_lead_days INTEGER DEFAULT 14,
  preferred_genres TEXT, -- JSON array
  
  -- Media
  avatar_url TEXT,
  cover_url TEXT,
  
  -- Verification
  verified BOOLEAN DEFAULT 0,
  
  -- Stats (cached, updated periodically)
  events_hosted INTEGER DEFAULT 0,
  total_artists_booked INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_venues_user_id ON venues(user_id);
CREATE INDEX IF NOT EXISTS idx_venues_city ON venues(city);
CREATE INDEX IF NOT EXISTS idx_venues_status ON venues(status);
CREATE INDEX IF NOT EXISTS idx_venues_venue_type ON venues(venue_type);

