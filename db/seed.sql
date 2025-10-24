-- ============================================================================
-- UMBRELLA MVP - DEVELOPMENT SEED DATA
-- ============================================================================
-- Purpose: Populate database with realistic sample data for development/testing
-- Usage: wrangler d1 execute umbrella-dev-db --local --file=db/seed.sql
--
-- This seed data creates a complete artist ecosystem with:
-- - 5 test users (3 artists, 2 venues)
-- - Complete artist profiles with all onboarding data
-- - Sample tracks, gigs, reviews, and conversations
-- - Realistic timestamps and relationships
-- ============================================================================

-- ============================================================================
-- SECTION 1: USERS (OAuth accounts)
-- ============================================================================

INSERT INTO users (id, oauth_provider, oauth_id, email, onboarding_complete, created_at, updated_at) VALUES
  ('u_artist_1', 'google', 'google_123456', 'maya.rivers@example.com', 1, '2025-10-01T10:00:00Z', '2025-10-01T10:30:00Z'),
  ('u_artist_2', 'apple', 'apple_789012', 'alex.chen@example.com', 1, '2025-10-02T14:20:00Z', '2025-10-02T14:50:00Z'),
  ('u_artist_3', 'google', 'google_345678', 'jordan.lee@example.com', 1, '2025-10-03T09:15:00Z', '2025-10-03T09:45:00Z'),
  ('u_venue_1', 'google', 'google_901234', 'booking@thefillmore.example.com', 0, '2025-10-05T11:00:00Z', '2025-10-05T11:00:00Z'),
  ('u_venue_2', 'apple', 'apple_567890', 'events@bluenotejazz.example.com', 0, '2025-10-06T16:30:00Z', '2025-10-06T16:30:00Z');

-- ============================================================================
-- SECTION 2: ARTISTS (Complete Profiles)
-- ============================================================================

-- Artist 1: Maya Rivers (Indie/Folk Singer-Songwriter)
INSERT INTO artists (
  id, user_id, stage_name, legal_name, pronouns, location_city, location_state, location_country, location_zip, phone_number,
  bio, story, tagline, primary_genre, secondary_genres, influences, artist_type, equipment, daw, platforms, subscriptions, struggles,
  base_rate_flat, base_rate_hourly, rates_negotiable, largest_show_capacity, travel_radius_miles, available_weekdays, available_weekends, advance_booking_weeks, available_dates, time_split_creative, time_split_logistics,
  currently_making_music, confident_online_presence, struggles_creative_niche, knows_where_find_gigs, paid_fairly_performing, understands_royalties,
  tasks_outsource, sound_uniqueness, dream_venue, biggest_inspiration, favorite_create_time, platform_pain_point,
  website_url, instagram_handle, tiktok_handle, youtube_url, spotify_url, apple_music_url, soundcloud_url,
  verified, avatar_url, banner_url, avg_rating, total_reviews, total_gigs, total_earnings, profile_views, follower_count,
  created_at, updated_at
) VALUES (
  'a_maya_rivers', 'u_artist_1', 'Maya Rivers', 'Maya Elizabeth Rivers', 'she/her', 'San Francisco', 'CA', 'US', '94102', '+14155551234',
  'Indie folk singer-songwriter blending acoustic storytelling with electronic textures. Known for intimate vocals and poetic lyrics that explore themes of identity, home, and belonging.',
  'I started writing songs in my college dorm room, just me and a guitar. Five years later, I''ve played over 200 shows across the US and released two EPs. My music is deeply personal but I hope it resonates universally.',
  'Stories told through strings and synths',
  'Indie', '["Folk", "Electronic", "Singer-Songwriter"]', '["Bon Iver", "Phoebe Bridgers", "Sylvan Esso", "The National"]', '["solo"]',
  '["Acoustic Guitar", "MIDI Keyboard", "Shure SM7B", "Audio Interface"]', '["Logic Pro", "Ableton Live"]', '["Spotify", "Instagram", "TikTok", "YouTube"]', '["Spotify for Artists", "DistroKid"]', '["Finding consistent gigs", "Marketing myself online"]',
  800, 150, 1, 250, 100, 1, 1, 3, '["2025-11-15", "2025-11-22", "2025-12-10"]', 70, 30,
  1, 1, 0, 1, 0, 1,
  'Social media content creation and email marketing', 'My blend of acoustic folk with electronic production creates an otherworldly intimate atmosphere', 'Red Rocks Amphitheatre', 'My grandmother who taught me to play guitar', 'Late night, 10pm-2am', 'Hard to find venues that match my vibe and pay fairly',
  'https://mayarivers.example.com', '@mayariversmusic', '@mayarivers', 'https://youtube.com/@mayarivers', 'https://open.spotify.com/artist/mayarivers', 'https://music.apple.com/artist/mayarivers', 'https://soundcloud.com/mayarivers',
  1, 'https://storage.umbrella.app/profiles/a_maya_rivers/avatar.jpg', 'https://storage.umbrella.app/profiles/a_maya_rivers/banner.jpg',
  4.7, 12, 48, 38400, 1250, 327,
  '2025-10-01T10:30:00Z', '2025-10-20T08:15:00Z'
);

-- Artist 2: Alex Chen (Electronic/DJ Producer)
INSERT INTO artists (
  id, user_id, stage_name, legal_name, pronouns, location_city, location_state, location_country, location_zip, phone_number,
  bio, story, tagline, primary_genre, secondary_genres, influences, artist_type, equipment, daw, platforms, subscriptions, struggles,
  base_rate_flat, base_rate_hourly, rates_negotiable, largest_show_capacity, travel_radius_miles, available_weekdays, available_weekends, advance_booking_weeks, available_dates, time_split_creative, time_split_logistics,
  currently_making_music, confident_online_presence, struggles_creative_niche, knows_where_find_gigs, paid_fairly_performing, understands_royalties,
  tasks_outsource, sound_uniqueness, dream_venue, biggest_inspiration, favorite_create_time, platform_pain_point,
  website_url, instagram_handle, tiktok_handle, spotify_url, soundcloud_url,
  verified, avatar_url, avg_rating, total_reviews, total_gigs, total_earnings, profile_views, follower_count,
  created_at, updated_at
) VALUES (
  'a_alex_chen', 'u_artist_2', 'ALEX//CHEN', 'Alex Chen', 'they/them', 'Los Angeles', 'CA', 'US', '90028', '+13235559876',
  'Electronic music producer and DJ specializing in melodic house and techno. Creating immersive sonic experiences that move both body and mind.',
  'From bedroom producer to club resident DJ in 3 years. My journey started with a laptop and a dream, now I play festivals and clubs across the West Coast. Still grinding every day to perfect my craft.',
  'Melodic journeys through house & techno',
  'Electronic', '["House", "Techno", "Ambient"]', '["Âme", "Kiasmos", "Bonobo", "Jon Hopkins"]', '["solo", "dj", "producer"]',
  '["Pioneer DDJ-1000", "Ableton Push", "Moog Subsequent 37", "Studio Monitors"]', '["Ableton Live", "Serum", "Kontakt"]', '["SoundCloud", "Spotify", "Instagram", "YouTube"]', '["SoundCloud Pro", "Splice"]', '["Standing out in oversaturated market", "Getting paid fairly for club gigs"]',
  1500, 200, 1, 1000, 150, 1, 1, 2, '["2025-11-08", "2025-11-16", "2025-12-01", "2025-12-15"]', 80, 20,
  1, 1, 0, 0, 0, 0,
  'Booking management and contract negotiation', 'I blend emotional melodic progressions with driving techno rhythms - makes people cry on the dancefloor', 'Berghain, Berlin', 'The LA underground rave scene that welcomed me', 'Afternoon, 2pm-6pm', 'Venues often don''t understand electronic music and lowball on rates',
  'https://alexchenmusic.example.com', '@alexchenmusic', '@alexchen_dj', 'https://open.spotify.com/artist/alexchen', 'https://soundcloud.com/alexchen',
  0, 'https://storage.umbrella.app/profiles/a_alex_chen/avatar.jpg',
  4.9, 8, 32, 44800, 892, 1543,
  '2025-10-02T14:50:00Z', '2025-10-21T19:45:00Z'
);

-- Artist 3: Jordan Lee (Jazz/Blues Multi-Instrumentalist)
INSERT INTO artists (
  id, user_id, stage_name, legal_name, pronouns, location_city, location_state, location_country, location_zip, phone_number,
  bio, story, tagline, primary_genre, secondary_genres, influences, artist_type, equipment, daw, platforms, subscriptions, struggles,
  base_rate_flat, base_rate_hourly, rates_negotiable, largest_show_capacity, travel_radius_miles, available_weekdays, available_weekends, advance_booking_weeks, available_dates, time_split_creative, time_split_logistics,
  currently_making_music, confident_online_presence, struggles_creative_niche, knows_where_find_gigs, paid_fairly_performing, understands_royalties,
  tasks_outsource, sound_uniqueness, dream_venue, biggest_inspiration, favorite_create_time, platform_pain_point,
  instagram_handle, spotify_url, apple_music_url, bandcamp_url,
  verified, avatar_url, avg_rating, total_reviews, total_gigs, total_earnings, profile_views, follower_count,
  created_at, updated_at
) VALUES (
  'a_jordan_lee', 'u_artist_3', 'Jordan Lee Trio', 'Jordan Lee', 'he/him', 'New Orleans', 'LA', 'US', '70130', '+15045553421',
  'Jazz pianist and composer rooted in New Orleans tradition. Leading a trio that explores the boundaries between classic jazz, blues, and modern improvisation.',
  'Grew up in the French Quarter listening to street musicians. Studied at Berklee, came back home to keep the New Orleans jazz tradition alive while pushing it forward. My trio has been playing the local scene for 5 years.',
  'New Orleans jazz with a modern twist',
  'Jazz', '["Blues", "Soul", "R&B"]', '["Thelonious Monk", "Herbie Hancock", "Robert Glasper", "Brad Mehldau"]', '["band"]',
  '["Yamaha Grand Piano", "Rhodes Electric Piano", "Upright Bass", "Drum Kit"]', '["Pro Tools"]', '["Spotify", "Bandcamp", "Instagram"]', '["Bandcamp Pro"]', '["Getting younger audiences to jazz shows", "Fair compensation for session work"]',
  1200, 180, 1, 500, 75, 1, 1, 4, '["2025-11-20", "2025-12-05", "2025-12-18"]', 60, 40,
  1, 0, 0, 1, 1, 1,
  'Website maintenance and graphic design', 'We honor the New Orleans legacy while bringing fresh harmonic ideas and improvisation', 'Blue Note Jazz Club, NYC', 'My grandfather who played with Ellis Marsalis', 'Morning, 9am-1pm', 'Hard to find venues that respect jazz as an art form and pay accordingly',
  '@jordanleejazz', 'https://open.spotify.com/artist/jordanlee', 'https://music.apple.com/artist/jordanlee', 'https://jordanlee.bandcamp.com',
  1, 'https://storage.umbrella.app/profiles/a_jordan_lee/avatar.jpg',
  4.8, 15, 67, 76200, 543, 189,
  '2025-10-03T09:45:00Z', '2025-10-19T12:30:00Z'
);

-- ============================================================================
-- SECTION 3: ARTIST FOLLOWERS (Social relationships)
-- ============================================================================

INSERT INTO artist_followers (id, artist_id, follower_user_id, created_at) VALUES
  ('f_1', 'a_maya_rivers', 'u_artist_2', '2025-10-10T14:22:00Z'),
  ('f_2', 'a_maya_rivers', 'u_artist_3', '2025-10-12T09:18:00Z'),
  ('f_3', 'a_alex_chen', 'u_artist_1', '2025-10-11T16:45:00Z'),
  ('f_4', 'a_alex_chen', 'u_artist_3', '2025-10-13T20:12:00Z'),
  ('f_5', 'a_jordan_lee', 'u_artist_1', '2025-10-14T11:30:00Z'),
  ('f_6', 'a_jordan_lee', 'u_artist_2', '2025-10-15T13:55:00Z');

-- ============================================================================
-- SECTION 4: TRACKS (Portfolio)
-- ============================================================================

-- Maya Rivers' tracks
INSERT INTO tracks (id, artist_id, title, duration_seconds, file_url, cover_art_url, genre, release_year, spotify_url, display_order, plays, created_at, updated_at) VALUES
  ('t_maya_1', 'a_maya_rivers', 'Homeward', 245, 'https://storage.umbrella.app/tracks/a_maya_rivers/homeward.mp3', 'https://storage.umbrella.app/tracks/a_maya_rivers/homeward_cover.jpg', 'Indie', 2024, 'https://open.spotify.com/track/homeward', 1, 3420, '2025-10-01T12:00:00Z', '2025-10-01T12:00:00Z'),
  ('t_maya_2', 'a_maya_rivers', 'Golden Hour', 198, 'https://storage.umbrella.app/tracks/a_maya_rivers/golden_hour.mp3', 'https://storage.umbrella.app/tracks/a_maya_rivers/golden_hour_cover.jpg', 'Folk', 2024, 'https://open.spotify.com/track/goldenhour', 2, 2890, '2025-10-01T12:05:00Z', '2025-10-01T12:05:00Z'),
  ('t_maya_3', 'a_maya_rivers', 'Wildfire (Live)', 312, 'https://storage.umbrella.app/tracks/a_maya_rivers/wildfire_live.mp3', 'https://storage.umbrella.app/tracks/a_maya_rivers/wildfire_cover.jpg', 'Indie', 2025, 'https://open.spotify.com/track/wildfire', 3, 1567, '2025-10-01T12:10:00Z', '2025-10-01T12:10:00Z');

-- Alex Chen's tracks
INSERT INTO tracks (id, artist_id, title, duration_seconds, file_url, cover_art_url, genre, soundcloud_url, display_order, plays, created_at, updated_at) VALUES
  ('t_alex_1', 'a_alex_chen', 'Neon Dreams', 402, 'https://storage.umbrella.app/tracks/a_alex_chen/neon_dreams.mp3', 'https://storage.umbrella.app/tracks/a_alex_chen/neon_cover.jpg', 'House', 'https://soundcloud.com/alexchen/neon-dreams', 1, 8943, '2025-10-02T16:00:00Z', '2025-10-02T16:00:00Z'),
  ('t_alex_2', 'a_alex_chen', 'Midnight Drive', 378, 'https://storage.umbrella.app/tracks/a_alex_chen/midnight_drive.mp3', 'https://storage.umbrella.app/tracks/a_alex_chen/midnight_cover.jpg', 'Techno', 'https://soundcloud.com/alexchen/midnight-drive', 2, 7234, '2025-10-02T16:10:00Z', '2025-10-02T16:10:00Z'),
  ('t_alex_3', 'a_alex_chen', 'Ethereal', 456, 'https://storage.umbrella.app/tracks/a_alex_chen/ethereal.mp3', 'https://storage.umbrella.app/tracks/a_alex_chen/ethereal_cover.jpg', 'Ambient', 'https://soundcloud.com/alexchen/ethereal', 3, 5621, '2025-10-02T16:20:00Z', '2025-10-02T16:20:00Z'),
  ('t_alex_4', 'a_alex_chen', 'Lost in Translation (Remix)', 389, 'https://storage.umbrella.app/tracks/a_alex_chen/lost_remix.mp3', 'https://storage.umbrella.app/tracks/a_alex_chen/lost_cover.jpg', 'House', 'https://soundcloud.com/alexchen/lost-remix', 4, 4892, '2025-10-02T16:30:00Z', '2025-10-02T16:30:00Z');

-- Jordan Lee's tracks
INSERT INTO tracks (id, artist_id, title, duration_seconds, file_url, cover_art_url, genre, release_year, spotify_url, apple_music_url, display_order, plays, created_at, updated_at) VALUES
  ('t_jordan_1', 'a_jordan_lee', 'Basin Street Blues (Trio Version)', 342, 'https://storage.umbrella.app/tracks/a_jordan_lee/basin_street.mp3', 'https://storage.umbrella.app/tracks/a_jordan_lee/trio_cover.jpg', 'Jazz', 2023, 'https://open.spotify.com/track/basinstreet', 'https://music.apple.com/track/basinstreet', 1, 2104, '2025-10-03T11:00:00Z', '2025-10-03T11:00:00Z'),
  ('t_jordan_2', 'a_jordan_lee', 'Crescent City Nocturne', 298, 'https://storage.umbrella.app/tracks/a_jordan_lee/crescent_nocturne.mp3', 'https://storage.umbrella.app/tracks/a_jordan_lee/nocturne_cover.jpg', 'Jazz', 2024, 'https://open.spotify.com/track/crescentnoc', 'https://music.apple.com/track/crescentnoc', 2, 1876, '2025-10-03T11:10:00Z', '2025-10-03T11:10:00Z');

-- ============================================================================
-- SECTION 5: STORAGE QUOTAS
-- ============================================================================

INSERT INTO storage_quotas (artist_id, used_bytes, limit_bytes, updated_at) VALUES
  ('a_maya_rivers', 2458032128, 53687091200, '2025-10-20T08:15:00Z'),  -- ~2.3GB used
  ('a_alex_chen', 8946728960, 53687091200, '2025-10-21T19:45:00Z'),    -- ~8.3GB used
  ('a_jordan_lee', 1572864000, 53687091200, '2025-10-19T12:30:00Z');   -- ~1.5GB used

-- ============================================================================
-- SECTION 6: GIGS (Marketplace Opportunities)
-- ============================================================================

INSERT INTO gigs (id, venue_id, title, description, venue_name, location_city, location_state, location_address, location_zip, date, start_time, end_time, genre, capacity, filled_slots, payment_amount, payment_type, urgency_flag, status, created_at, updated_at) VALUES
  -- Upcoming gigs (open for applications)
  ('g_fillmore_1', 'u_venue_1', 'Sunday Sessions: Acoustic Night', 'Intimate acoustic showcase featuring emerging singer-songwriters. 2-hour sets with full sound system and lighting.', 'The Fillmore SF', 'San Francisco', 'CA', '1805 Geary Blvd', '94115', '2025-11-15', '19:00', '22:00', 'Indie', 3, 1, 800, 'flat', 0, 'open', '2025-10-10T10:00:00Z', '2025-10-10T10:00:00Z'),

  ('g_fillmore_2', 'u_venue_1', 'New Year''s Eve Dance Party', 'Ring in 2026 with a night of electronic music. Seeking DJs for 90-minute sets. Full production and bar revenue share.', 'The Fillmore SF', 'San Francisco', 'CA', '1805 Geary Blvd', '94115', '2025-12-31', '21:00', '02:00', 'Electronic', 5, 2, 2000, 'flat', 0, 'open', '2025-10-12T14:30:00Z', '2025-10-12T14:30:00Z'),

  ('g_bluenote_1', 'u_venue_2', 'Friday Jazz Series', 'Weekly jazz series featuring local talent. Looking for trios/quartets. Two 45-minute sets with 15-min break.', 'Blue Note Jazz Club', 'New Orleans', 'LA', '534 Frenchmen St', '70116', '2025-11-22', '20:00', '23:00', 'Jazz', 2, 0, 1200, 'flat', 0, 'open', '2025-10-15T11:20:00Z', '2025-10-15T11:20:00Z'),

  -- Urgent gig (within 7 days, less than 50% filled)
  ('g_bluenote_urgent', 'u_venue_2', 'URGENT: Saturday Night Replacement', 'Last-minute cancellation! Need a jazz pianist or trio for this Saturday. Great exposure, loyal audience. Can accommodate various styles.', 'Blue Note Jazz Club', 'New Orleans', 'LA', '534 Frenchmen St', '70116', '2025-10-28', '21:00', '00:00', 'Jazz', 2, 0, 1000, 'flat', 1, 'open', '2025-10-22T16:45:00Z', '2025-10-22T16:45:00Z'),

  -- Completed gigs (for analytics)
  ('g_complete_1', 'u_venue_1', 'Indie Showcase October', 'Monthly showcase featuring Bay Area indie artists', 'The Fillmore SF', 'San Francisco', 'CA', '1805 Geary Blvd', '94115', '2025-10-05', '19:00', '22:00', 'Indie', 4, 4, 800, 'flat', 0, 'completed', '2025-09-20T09:00:00Z', '2025-10-06T10:30:00Z'),

  ('g_complete_2', 'u_venue_2', 'Jazz Brunch Special', 'Sunday jazz brunch with live music', 'Blue Note Jazz Club', 'New Orleans', 'LA', '534 Frenchmen St', '70116', '2025-10-15', '11:00', '14:00', 'Jazz', 1, 1, 600, 'flat', 0, 'completed', '2025-09-25T13:00:00Z', '2025-10-16T09:15:00Z');

-- ============================================================================
-- SECTION 7: GIG APPLICATIONS
-- ============================================================================

INSERT INTO gig_applications (id, gig_id, artist_id, status, applied_at, responded_at) VALUES
  ('ga_1', 'g_fillmore_1', 'a_maya_rivers', 'accepted', '2025-10-11T14:23:00Z', '2025-10-12T10:15:00Z'),
  ('ga_2', 'g_fillmore_2', 'a_alex_chen', 'accepted', '2025-10-13T09:45:00Z', '2025-10-13T15:30:00Z'),
  ('ga_3', 'g_fillmore_2', 'a_jordan_lee', 'pending', '2025-10-14T11:20:00Z', NULL),
  ('ga_4', 'g_bluenote_1', 'a_jordan_lee', 'pending', '2025-10-16T08:30:00Z', NULL),
  ('ga_5', 'g_bluenote_urgent', 'a_jordan_lee', 'pending', '2025-10-23T07:15:00Z', NULL),
  -- Completed gig applications
  ('ga_complete_1', 'g_complete_1', 'a_maya_rivers', 'accepted', '2025-09-22T10:00:00Z', '2025-09-23T11:00:00Z'),
  ('ga_complete_2', 'g_complete_2', 'a_jordan_lee', 'accepted', '2025-09-26T14:30:00Z', '2025-09-27T09:00:00Z');

-- ============================================================================
-- SECTION 8: GIG FAVORITES
-- ============================================================================

INSERT INTO gig_favorites (id, gig_id, artist_id, created_at) VALUES
  ('gf_1', 'g_fillmore_2', 'a_maya_rivers', '2025-10-13T16:20:00Z'),
  ('gf_2', 'g_bluenote_1', 'a_alex_chen', '2025-10-16T10:45:00Z'),
  ('gf_3', 'g_fillmore_1', 'a_jordan_lee', '2025-10-11T09:30:00Z');

-- ============================================================================
-- SECTION 9: CONVERSATIONS & MESSAGES
-- ============================================================================

-- Conversation 1: Maya & Alex discussing collaboration
INSERT INTO conversations (id, participant_1_id, participant_2_id, last_message_at, last_message_preview, unread_count_p1, unread_count_p2, created_at, updated_at) VALUES
  ('conv_1', 'u_artist_1', 'u_artist_2', '2025-10-18T14:32:00Z', 'I''d love to collab! Maybe we could blend some of your electronic textures...', 0, 1, '2025-10-17T10:00:00Z', '2025-10-18T14:32:00Z');

INSERT INTO messages (id, conversation_id, sender_id, content, read, created_at) VALUES
  ('msg_1_1', 'conv_1', 'u_artist_1', 'Hey Alex! Love your track "Neon Dreams" - that melody is gorgeous. Would you ever be interested in doing a collaboration? I think our styles could blend really well.', 1, '2025-10-17T10:05:00Z'),
  ('msg_1_2', 'conv_1', 'u_artist_2', 'Maya!! Thank you so much! I''ve been following your stuff too - "Homeward" has been on repeat for me. A collab would be amazing! What were you thinking?', 1, '2025-10-17T16:45:00Z'),
  ('msg_1_3', 'conv_1', 'u_artist_1', 'I''d love to collab! Maybe we could blend some of your electronic textures with my acoustic singer-songwriter vibe? I have a few demos I''ve been working on that could be perfect.', 0, '2025-10-18T14:32:00Z');

-- Conversation 2: Alex & Venue booking inquiry
INSERT INTO conversations (id, participant_1_id, participant_2_id, last_message_at, last_message_preview, unread_count_p1, unread_count_p2, created_at, updated_at) VALUES
  ('conv_2', 'u_artist_2', 'u_venue_1', '2025-10-20T11:15:00Z', 'Perfect! I''ll send over my rider and we can finalize the set time. Thanks for having me!', 1, 0, '2025-10-13T15:30:00Z', '2025-10-20T11:15:00Z');

INSERT INTO messages (id, conversation_id, sender_id, content, read, created_at) VALUES
  ('msg_2_1', 'conv_2', 'u_venue_1', 'Hi Alex! We''d love to have you for our NYE Dance Party. Your sound is exactly what we''re looking for. Are you available Dec 31st? We''re offering $2000 for a 90-min set.', 1, '2025-10-13T15:30:00Z'),
  ('msg_2_2', 'conv_2', 'u_artist_2', 'Hey! Yes I''m totally available and would love to play! NYE at The Fillmore would be incredible. $2000 works for me. What time slot are you thinking?', 1, '2025-10-15T09:20:00Z'),
  ('msg_2_3', 'conv_2', 'u_venue_1', 'Awesome! We''re thinking 11:30pm-1:00am for the countdown set. Full production support, and we''ll promote heavily on socials. Sound good?', 1, '2025-10-16T10:45:00Z'),
  ('msg_2_4', 'conv_2', 'u_artist_2', 'Perfect! I''ll send over my rider and we can finalize the set time. Thanks for having me!', 0, '2025-10-20T11:15:00Z');

-- ============================================================================
-- SECTION 10: REVIEWS
-- ============================================================================

-- Reviews for Maya Rivers
INSERT INTO reviews (id, artist_id, reviewer_user_id, reviewer_name, rating, comment, gig_id, created_at) VALUES
  ('r_maya_1', 'a_maya_rivers', 'u_artist_2', 'Alex Chen', 5, 'Maya has such a unique voice and her songwriting is incredible. Saw her at a small venue and was blown away. Can''t wait to see what she does next!', NULL, '2025-10-10T15:30:00Z'),
  ('r_maya_2', 'a_maya_rivers', 'u_artist_3', 'Jordan Lee', 5, 'Beautiful performance at The Fillmore. Her blend of folk and electronic is really innovative. Would love to share a bill again!', 'g_complete_1', '2025-10-07T11:20:00Z');

-- Email invitation review for Maya (external reviewer)
INSERT INTO reviews (id, artist_id, reviewer_email, reviewer_name, rating, comment, invite_token, created_at) VALUES
  ('r_maya_3', 'a_maya_rivers', 'sarah.music.fan@example.com', 'Sarah M.', 4, 'Caught Maya at a local coffee shop show - her lyrics are so poetic and relatable. Would definitely see her again!', 'invite_tok_maya_123', '2025-10-12T18:45:00Z');

-- Reviews for Alex Chen
INSERT INTO reviews (id, artist_id, reviewer_user_id, reviewer_name, rating, comment, created_at) VALUES
  ('r_alex_1', 'a_alex_chen', 'u_artist_1', 'Maya Rivers', 5, 'Alex creates such immersive soundscapes. Saw them at a warehouse show and the energy was unreal. True artist!', '2025-10-11T19:10:00Z'),
  ('r_alex_2', 'a_alex_chen', 'u_artist_3', 'Jordan Lee', 5, 'One of the best electronic sets I''ve experienced. Alex knows how to read a room and build momentum. Professional and talented.', '2025-10-13T21:35:00Z');

-- Reviews for Jordan Lee
INSERT INTO reviews (id, artist_id, reviewer_user_id, reviewer_name, rating, comment, gig_id, created_at) VALUES
  ('r_jordan_1', 'a_jordan_lee', 'u_artist_1', 'Maya Rivers', 5, 'The trio''s musicianship is outstanding. Jordan''s piano playing is both technically impressive and deeply emotional. Real jazz!', 'g_complete_2', '2025-10-16T14:20:00Z'),
  ('r_jordan_2', 'a_jordan_lee', 'u_artist_2', 'Alex Chen', 5, 'Caught them at Blue Note and was mesmerized. They honor the tradition while bringing fresh ideas. Would book them in a heartbeat!', NULL, '2025-10-14T16:50:00Z');

-- ============================================================================
-- SECTION 11: TIMELINE ENTRIES
-- ============================================================================

INSERT INTO timeline_entries (id, artist_id, date, title, description, entry_type, created_at) VALUES
  ('tl_maya_1', 'a_maya_rivers', '2023-06-15', 'Released debut EP "Currents"', 'Five-track EP recorded in my bedroom studio. Featured on several Spotify playlists.', 'release', '2025-10-01T12:00:00Z'),
  ('tl_maya_2', 'a_maya_rivers', '2024-03-20', 'First headlining show at Café du Nord', 'Sold out 200-capacity venue. Opening act was amazing and the crowd energy was incredible.', 'gig', '2025-10-01T12:05:00Z'),
  ('tl_maya_3', 'a_maya_rivers', '2025-10-05', 'Played The Fillmore for the first time', 'Dream venue! Opening slot for Indie Showcase. Can''t believe I got to play this legendary stage.', 'gig', '2025-10-06T11:00:00Z'),

  ('tl_alex_1', 'a_alex_chen', '2023-01-10', 'First club residency at The Echo LA', 'Monthly residency that lasted 18 months. Helped build my local following.', 'milestone', '2025-10-02T15:00:00Z'),
  ('tl_alex_2', 'a_alex_chen', '2024-08-15', 'Released "Neon Dreams" - hit 100k plays', 'Biggest track so far. Got support from major DJs and playlist features.', 'release', '2025-10-02T15:10:00Z'),

  ('tl_jordan_1', 'a_jordan_lee', '2021-05-20', 'Formed Jordan Lee Trio', 'After years of solo piano, finally found the right musicians. We clicked immediately.', 'milestone', '2025-10-03T10:00:00Z'),
  ('tl_jordan_2', 'a_jordan_lee', '2023-11-12', 'Released album "Crescent City Sessions"', 'Recorded live at Preservation Hall. Proud to honor the New Orleans tradition.', 'release', '2025-10-03T10:10:00Z'),
  ('tl_jordan_3', 'a_jordan_lee', '2025-10-15', 'Sunday Jazz Brunch at Blue Note', 'Regular gig that brings in steady income and keeps us connected to the community.', 'gig', '2025-10-16T10:00:00Z');

-- ============================================================================
-- SECTION 12: DAILY METRICS (Historical Analytics)
-- ============================================================================

-- Maya Rivers - last 7 days
INSERT INTO daily_metrics (id, artist_id, date, profile_views, gigs_completed, earnings, avg_rating, follower_count, track_plays, created_at) VALUES
  ('dm_maya_1', 'a_maya_rivers', '2025-10-14', 45, 0, 0, 4.7, 315, 142, '2025-10-15T00:00:00Z'),
  ('dm_maya_2', 'a_maya_rivers', '2025-10-15', 52, 0, 0, 4.7, 318, 156, '2025-10-16T00:00:00Z'),
  ('dm_maya_3', 'a_maya_rivers', '2025-10-16', 38, 0, 0, 4.7, 320, 134, '2025-10-17T00:00:00Z'),
  ('dm_maya_4', 'a_maya_rivers', '2025-10-17', 67, 0, 0, 4.7, 323, 189, '2025-10-18T00:00:00Z'),
  ('dm_maya_5', 'a_maya_rivers', '2025-10-18', 71, 0, 0, 4.7, 325, 198, '2025-10-19T00:00:00Z'),
  ('dm_maya_6', 'a_maya_rivers', '2025-10-19', 55, 0, 0, 4.7, 326, 167, '2025-10-20T00:00:00Z'),
  ('dm_maya_7', 'a_maya_rivers', '2025-10-20', 48, 0, 0, 4.7, 327, 145, '2025-10-21T00:00:00Z');

-- Alex Chen - last 7 days
INSERT INTO daily_metrics (id, artist_id, date, profile_views, gigs_completed, earnings, avg_rating, follower_count, track_plays, created_at) VALUES
  ('dm_alex_1', 'a_alex_chen', '2025-10-14', 132, 0, 0, 4.9, 1520, 412, '2025-10-15T00:00:00Z'),
  ('dm_alex_2', 'a_alex_chen', '2025-10-15', 145, 0, 0, 4.9, 1528, 438, '2025-10-16T00:00:00Z'),
  ('dm_alex_3', 'a_alex_chen', '2025-10-16', 156, 0, 0, 4.9, 1534, 467, '2025-10-17T00:00:00Z'),
  ('dm_alex_4', 'a_alex_chen', '2025-10-17', 128, 0, 0, 4.9, 1537, 401, '2025-10-18T00:00:00Z'),
  ('dm_alex_5', 'a_alex_chen', '2025-10-18', 149, 0, 0, 4.9, 1540, 445, '2025-10-19T00:00:00Z'),
  ('dm_alex_6', 'a_alex_chen', '2025-10-19', 138, 0, 0, 4.9, 1542, 423, '2025-10-20T00:00:00Z'),
  ('dm_alex_7', 'a_alex_chen', '2025-10-20', 142, 0, 0, 4.9, 1543, 431, '2025-10-21T00:00:00Z');

-- Jordan Lee - last 7 days
INSERT INTO daily_metrics (id, artist_id, date, profile_views, gigs_completed, earnings, avg_rating, follower_count, track_plays, created_at) VALUES
  ('dm_jordan_1', 'a_jordan_lee', '2025-10-14', 28, 0, 0, 4.8, 182, 87, '2025-10-15T00:00:00Z'),
  ('dm_jordan_2', 'a_jordan_lee', '2025-10-15', 32, 1, 600, 4.8, 184, 95, '2025-10-16T00:00:00Z'),
  ('dm_jordan_3', 'a_jordan_lee', '2025-10-16', 45, 0, 0, 4.9, 186, 112, '2025-10-17T00:00:00Z'),
  ('dm_jordan_4', 'a_jordan_lee', '2025-10-17', 38, 0, 0, 4.9, 187, 98, '2025-10-18T00:00:00Z'),
  ('dm_jordan_5', 'a_jordan_lee', '2025-10-18', 41, 0, 0, 4.9, 188, 104, '2025-10-19T00:00:00Z'),
  ('dm_jordan_6', 'a_jordan_lee', '2025-10-19', 36, 0, 0, 4.9, 189, 91, '2025-10-20T00:00:00Z'),
  ('dm_jordan_7', 'a_jordan_lee', '2025-10-20', 29, 0, 0, 4.9, 189, 82, '2025-10-21T00:00:00Z');

-- ============================================================================
-- SECTION 13: GOALS
-- ============================================================================

INSERT INTO goals (id, artist_id, title, description, target_value, current_value, goal_type, target_date, completed, created_at, updated_at) VALUES
  ('goal_maya_1', 'a_maya_rivers', 'Reach 500 followers', 'Build my audience on the platform to 500 followers', 500, 327, 'followers', '2025-12-31', 0, '2025-10-01T12:00:00Z', '2025-10-21T00:00:00Z'),
  ('goal_maya_2', 'a_maya_rivers', 'Book 10 gigs by year-end', 'Get 10 paid gigs before the end of 2025', 10, 5, 'gigs', '2025-12-31', 0, '2025-10-01T12:05:00Z', '2025-10-21T00:00:00Z'),
  ('goal_maya_3', 'a_maya_rivers', 'Release new single', 'Finish and release my next single "Northern Lights"', 1, 0, 'tracks', '2025-11-30', 0, '2025-10-10T09:00:00Z', '2025-10-10T09:00:00Z'),

  ('goal_alex_1', 'a_alex_chen', 'Play a festival', 'Get booked for at least one music festival', 1, 0, 'custom', '2026-06-30', 0, '2025-10-02T15:00:00Z', '2025-10-02T15:00:00Z'),
  ('goal_alex_2', 'a_alex_chen', 'Earn $60k from gigs this year', 'Hit $60k in gig earnings for 2025', 60000, 44800, 'earnings', '2025-12-31', 0, '2025-10-02T15:10:00Z', '2025-10-21T00:00:00Z'),

  ('goal_jordan_1', 'a_jordan_lee', 'Record live album at Preservation Hall', 'Save up and book studio time for live recording', 1, 0, 'custom', '2026-03-31', 0, '2025-10-03T10:00:00Z', '2025-10-03T10:00:00Z'),
  ('goal_jordan_2', 'a_jordan_lee', 'Play 80 gigs this year', 'Maintain regular gigging schedule - target 80 shows', 80, 67, 'gigs', '2025-12-31', 0, '2025-10-03T10:10:00Z', '2025-10-21T00:00:00Z');

-- ============================================================================
-- SECTION 14: VIOLET AI USAGE
-- ============================================================================

INSERT INTO violet_usage (id, artist_id, date, prompt_count, feature_used, prompt_text, response_tokens, created_at) VALUES
  ('v_maya_1', 'a_maya_rivers', '2025-10-20', 3, 'draft_message', 'Help me write a fan update about my upcoming shows', 247, '2025-10-20T14:30:00Z'),
  ('v_maya_2', 'a_maya_rivers', '2025-10-20', 4, 'gig_inquiry', 'Write a professional inquiry to The Independent SF about playing there', 312, '2025-10-20T16:45:00Z'),
  ('v_maya_3', 'a_maya_rivers', '2025-10-21', 1, 'songwriting', 'I need help with a bridge section for my song about leaving home', 189, '2025-10-21T10:15:00Z'),

  ('v_alex_1', 'a_alex_chen', '2025-10-19', 2, 'career_advice', 'How do I break into the festival circuit as an electronic artist?', 423, '2025-10-19T11:20:00Z'),
  ('v_alex_2', 'a_alex_chen', '2025-10-20', 1, 'draft_message', 'Help me write a post-show thank you message to the venue and fans', 198, '2025-10-20T23:45:00Z'),

  ('v_jordan_1', 'a_jordan_lee', '2025-10-18', 5, 'gig_inquiry', 'Write an inquiry to Jazz at Lincoln Center about booking opportunities', 367, '2025-10-18T09:30:00Z'),
  ('v_jordan_2', 'a_jordan_lee', '2025-10-19', 2, 'career_advice', 'How can I attract younger audiences to jazz shows?', 445, '2025-10-19T14:20:00Z');

-- ============================================================================
-- SECTION 15: CONTACT LISTS & BROADCAST MESSAGES
-- ============================================================================

-- Contact lists for Maya Rivers
INSERT INTO contact_lists (id, artist_id, name, description, created_at) VALUES
  ('cl_maya_1', 'a_maya_rivers', 'All Fans', 'Complete fan mailing list', '2025-10-01T13:00:00Z'),
  ('cl_maya_2', 'a_maya_rivers', 'Bay Area Fans', 'Fans in San Francisco Bay Area for local show announcements', '2025-10-05T10:30:00Z'),
  ('cl_maya_3', 'a_maya_rivers', 'VIP Supporters', 'Super fans who come to multiple shows', '2025-10-08T15:45:00Z');

-- Sample contacts for Maya's lists
INSERT INTO contact_list_members (id, list_id, email, phone, name, opted_in_email, opted_in_sms, created_at, updated_at) VALUES
  ('clm_1', 'cl_maya_1', 'jessica.fan@example.com', '+14155559001', 'Jessica R.', 1, 1, '2025-10-01T14:00:00Z', '2025-10-01T14:00:00Z'),
  ('clm_2', 'cl_maya_1', 'mike.music@example.com', '+16505559002', 'Mike T.', 1, 0, '2025-10-02T11:20:00Z', '2025-10-02T11:20:00Z'),
  ('clm_3', 'cl_maya_2', 'sarah.sf@example.com', '+14155559003', 'Sarah M.', 1, 1, '2025-10-05T10:45:00Z', '2025-10-05T10:45:00Z'),
  ('clm_4', 'cl_maya_3', 'emma.vip@example.com', '+14155559004', 'Emma L.', 1, 1, '2025-10-08T16:00:00Z', '2025-10-08T16:00:00Z');

-- Broadcast message example
INSERT INTO broadcast_messages (id, artist_id, subject, body, recipient_count, sent_via, sent_at, created_at) VALUES
  ('bm_maya_1', 'a_maya_rivers', 'New show announcement - November 15th at The Fillmore!',
   'Hey everyone! I''m so excited to announce I''ll be playing at The Fillmore on November 15th for their Sunday Sessions acoustic night. This venue has been a dream of mine forever and I can''t believe it''s happening! Tickets are on sale now at thefillmoresf.com. Hope to see you there! - Maya',
   127, 'both', '2025-10-12T18:00:00Z', '2025-10-12T17:45:00Z');

-- ============================================================================
-- SECTION 16: FILES & FOLDERS
-- ============================================================================

-- Folders for Maya Rivers
INSERT INTO folders (id, artist_id, name, parent_folder_id, created_at) VALUES
  ('folder_maya_1', 'a_maya_rivers', 'Press Photos', NULL, '2025-10-01T13:30:00Z'),
  ('folder_maya_2', 'a_maya_rivers', 'Music Files', NULL, '2025-10-01T13:31:00Z'),
  ('folder_maya_3', 'a_maya_rivers', 'Contracts & Riders', NULL, '2025-10-01T13:32:00Z'),
  ('folder_maya_4', 'a_maya_rivers', '2024 EPK', 'folder_maya_1', '2025-10-01T13:35:00Z');

-- Sample files for Maya
INSERT INTO files (id, artist_id, filename, file_size_bytes, mime_type, r2_key, category, folder_id, created_at) VALUES
  ('file_maya_1', 'a_maya_rivers', 'maya_rivers_press_photo_1.jpg', 3458920, 'image/jpeg', 'files/a_maya_rivers/press_photo_1.jpg', 'press_photo', 'folder_maya_1', '2025-10-01T14:00:00Z'),
  ('file_maya_2', 'a_maya_rivers', 'maya_rivers_bio_2024.pdf', 125840, 'application/pdf', 'files/a_maya_rivers/bio_2024.pdf', 'document', 'folder_maya_4', '2025-10-01T14:10:00Z'),
  ('file_maya_3', 'a_maya_rivers', 'homeward_master.wav', 52874312, 'audio/wav', 'files/a_maya_rivers/homeward_master.wav', 'music', 'folder_maya_2', '2025-10-01T14:20:00Z'),
  ('file_maya_4', 'a_maya_rivers', 'tech_rider_2025.pdf', 98234, 'application/pdf', 'files/a_maya_rivers/tech_rider.pdf', 'document', 'folder_maya_3', '2025-10-01T14:30:00Z');

-- ============================================================================
-- SECTION 17: JOURNAL ENTRIES
-- ============================================================================

INSERT INTO journal_entries (id, artist_id, title, content, entry_type, created_at, updated_at) VALUES
  ('j_maya_1', 'a_maya_rivers', 'Reflections on my first Fillmore show',
   '[{"type":"text","content":"Still processing last night. Playing The Fillmore has been a dream since I moved to SF five years ago. Walking onto that stage, seeing the psychedelic posters on the walls, feeling the history of that room... it was surreal."},{"type":"text","content":"The crowd was so warm and receptive. When I played Homeward, I looked up and saw people singing along. That moment made all the late nights and self-doubt worth it. This is why I make music."},{"type":"text","content":"Now to keep the momentum going. More shows, more writing, keep growing. But tonight, I celebrate."}]',
   'text', '2025-10-06T23:45:00Z', '2025-10-06T23:45:00Z'),

  ('j_alex_1', 'a_alex_chen', 'Production notes - new track "Midnight Drive"',
   '[{"type":"text","content":"Working on this new track and I think I finally nailed the vibe I was going for. That driving bassline with the ethereal pads creates the perfect tension."},{"type":"text","content":"Key production notes: - Kick drum layered with sub bass for maximum impact - Reverb on the lead synth (Valhalla VintageVerb, large hall preset) - Side-chain compression on everything to give it that pumping feel - Break at 2:30 needs more energy, maybe add a riser?"}]',
   'text', '2025-10-15T16:20:00Z', '2025-10-15T16:20:00Z'),

  ('j_jordan_1', 'a_jordan_lee', 'Jazz Brunch thoughts',
   '[{"type":"text","content":"Sunday brunch gigs at Blue Note have become a beautiful routine. Every week, we get to connect with the community, play music we love, and make a living doing it."},{"type":"text","content":"Today we explored a new arrangement of Basin Street Blues. The way Marcus took that bass solo in the second chorus was pure magic. This is what I love about jazz - you never play the same thing twice."},{"type":"text","content":"Grateful for this trio, this venue, and this city that keeps jazz alive."}]',
   'text', '2025-10-16T15:30:00Z', '2025-10-16T15:30:00Z');

-- ============================================================================
-- SEED DATA SUMMARY
-- ============================================================================
-- Users: 5 (3 artists, 2 venues)
-- Artists: 3 complete profiles with full onboarding data
-- Tracks: 9 tracks across 3 artists
-- Gigs: 6 gigs (4 open, 2 completed, 1 urgent)
-- Conversations: 2 with 7 total messages
-- Reviews: 8 reviews (including 1 email-invited external review)
-- Timeline Entries: 8 career milestones
-- Daily Metrics: 21 days of analytics data
-- Goals: 7 active goals
-- Violet Usage: 7 AI interactions
-- Contact Lists: 3 lists with 4 contacts
-- Broadcast Messages: 1 example
-- Folders: 4 with nested structure
-- Files: 4 sample files
-- Journal Entries: 3 creative studio entries
--
-- This seed data provides a realistic development environment with:
-- - Complete artist journeys from onboarding to active platform use
-- - Social interactions (follows, messages, reviews)
-- - Marketplace activity (gig applications, favorites)
-- - Historical analytics data for dashboard testing
-- - All major features represented with sample data
-- ============================================================================
