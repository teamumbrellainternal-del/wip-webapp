-- Test data operations to verify schema integrity
-- This script tests INSERT and SELECT operations on all major tables

-- Test 1: Insert a test user
INSERT INTO users (id, oauth_provider, oauth_id, email, created_at, updated_at, clerk_id)
VALUES ('test-user-1', 'google', 'google_test123', 'test@example.com', datetime('now'), datetime('now'), 'clerk_test123');

-- Verify user was inserted
SELECT 'User insert test:' as test;
SELECT * FROM users WHERE id = 'test-user-1';

-- Test 2: Insert a test artist linked to the user
INSERT INTO artists (id, user_id, stage_name, created_at, updated_at)
VALUES ('test-artist-1', 'test-user-1', 'Test Artist', datetime('now'), datetime('now'));

-- Verify artist was inserted
SELECT 'Artist insert test:' as test;
SELECT id, user_id, stage_name FROM artists WHERE id = 'test-artist-1';

-- Test 3: Insert a test track
INSERT INTO tracks (id, artist_id, title, file_url, created_at, updated_at)
VALUES ('test-track-1', 'test-artist-1', 'Test Track', 'https://example.com/track.mp3', datetime('now'), datetime('now'));

-- Verify track was inserted
SELECT 'Track insert test:' as test;
SELECT id, artist_id, title FROM tracks WHERE id = 'test-track-1';

-- Test 4: Insert a test gig
INSERT INTO gigs (id, venue_id, title, venue_name, location_city, location_state, date, created_at, updated_at)
VALUES ('test-gig-1', 'test-user-1', 'Test Gig', 'Test Venue', 'Los Angeles', 'CA', '2025-12-01', datetime('now'), datetime('now'));

-- Verify gig was inserted
SELECT 'Gig insert test:' as test;
SELECT id, title, venue_name FROM gigs WHERE id = 'test-gig-1';

-- Test 5: Test foreign key constraint by trying to query related data
SELECT 'Foreign key relationship test:' as test;
SELECT u.email, a.stage_name, t.title
FROM users u
JOIN artists a ON u.id = a.user_id
JOIN tracks t ON a.id = t.artist_id
WHERE u.id = 'test-user-1';

-- Test 6: Insert into messaging tables
INSERT INTO conversations (id, participant_1_id, participant_2_id, created_at, updated_at)
VALUES ('test-conv-1', 'test-user-1', 'test-user-1', datetime('now'), datetime('now'));

INSERT INTO messages (id, conversation_id, sender_id, content, created_at)
VALUES ('test-msg-1', 'test-conv-1', 'test-user-1', 'Test message content', datetime('now'));

SELECT 'Messaging test:' as test;
SELECT id, content FROM messages WHERE id = 'test-msg-1';

-- Test 7: Insert into analytics tables
INSERT INTO daily_metrics (id, artist_id, date, profile_views, created_at)
VALUES ('test-metric-1', 'test-artist-1', '2025-11-15', 100, datetime('now'));

SELECT 'Analytics test:' as test;
SELECT id, profile_views FROM daily_metrics WHERE id = 'test-metric-1';

-- Test 8: Test review with gig reference
INSERT INTO reviews (id, artist_id, reviewer_name, rating, comment, gig_id, created_at)
VALUES ('test-review-1', 'test-artist-1', 'Test Reviewer', 5, 'Great performance!', 'test-gig-1', datetime('now'));

SELECT 'Review test:' as test;
SELECT id, rating, comment FROM reviews WHERE id = 'test-review-1';

-- Cleanup test data
DELETE FROM reviews WHERE id = 'test-review-1';
DELETE FROM daily_metrics WHERE id = 'test-metric-1';
DELETE FROM messages WHERE id = 'test-msg-1';
DELETE FROM conversations WHERE id = 'test-conv-1';
DELETE FROM gigs WHERE id = 'test-gig-1';
DELETE FROM tracks WHERE id = 'test-track-1';
DELETE FROM artists WHERE id = 'test-artist-1';
DELETE FROM users WHERE id = 'test-user-1';

SELECT 'Cleanup complete - all test data removed' as result;
