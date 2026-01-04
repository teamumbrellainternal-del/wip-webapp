-- ============================================================================
-- ROLLBACK: Remove profile slugs
-- Version: 0019
-- Description: Removes slug columns from artists and venues tables
-- ============================================================================

-- Drop indexes first
DROP INDEX IF EXISTS idx_artists_slug;
DROP INDEX IF EXISTS idx_venues_slug;

-- Note: SQLite does not support DROP COLUMN directly
-- We would need to recreate the tables without the slug columns
-- For D1/SQLite, this is a complex operation that requires:
-- 1. Create new table without slug column
-- 2. Copy data
-- 3. Drop old table
-- 4. Rename new table

-- For artists table:
CREATE TABLE IF NOT EXISTS artists_backup AS SELECT 
  id, user_id, stage_name, legal_name, pronouns, location_city, location_state,
  location_country, location_zip, phone_number, bio, story, tagline, primary_genre,
  secondary_genres, influences, artist_type, equipment, daw, platforms, subscriptions,
  struggles, base_rate_flat, base_rate_hourly, rates_negotiable, largest_show_capacity,
  travel_radius_miles, available_weekdays, available_weekends, advance_booking_weeks,
  available_dates, time_split_creative, time_split_logistics, currently_making_music,
  confident_online_presence, struggles_creative_niche, knows_where_find_gigs,
  paid_fairly_performing, understands_royalties, tasks_outsource, sound_uniqueness,
  dream_venue, biggest_inspiration, favorite_create_time, platform_pain_point,
  website_url, instagram_handle, tiktok_handle, youtube_url, spotify_url,
  apple_music_url, soundcloud_url, facebook_url, twitter_url, bandcamp_url,
  avatar_url, banner_url, verified, profile_views, follower_count, total_gigs,
  total_reviews, avg_rating, created_at, updated_at
FROM artists;

DROP TABLE artists;
ALTER TABLE artists_backup RENAME TO artists;

-- For venues table:
CREATE TABLE IF NOT EXISTS venues_backup AS SELECT
  id, user_id, name, tagline, venue_type, address_line1, address_line2,
  city, state, zip_code, country, capacity, standing_capacity, seated_capacity,
  stage_size, sound_system, has_green_room, has_parking, status, booking_lead_days,
  preferred_genres, avatar_url, cover_url, verified, events_hosted,
  total_artists_booked, created_at, updated_at
FROM venues;

DROP TABLE venues;
ALTER TABLE venues_backup RENAME TO venues;

-- Recreate indexes that were on original tables
CREATE INDEX IF NOT EXISTS idx_artists_user_id ON artists(user_id);
CREATE INDEX IF NOT EXISTS idx_venues_user_id ON venues(user_id);
CREATE INDEX IF NOT EXISTS idx_venues_city ON venues(city);
CREATE INDEX IF NOT EXISTS idx_venues_status ON venues(status);
CREATE INDEX IF NOT EXISTS idx_venues_venue_type ON venues(venue_type);

