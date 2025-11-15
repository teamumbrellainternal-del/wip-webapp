-- Schema Validation Queries for Umbrella D1 Database
-- Run this after applying all migrations to verify schema integrity

-- 1. List all tables (should see all tables from all migrations)
SELECT 'Tables:' as section;
SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;

-- 2. List all indexes (should see all indexes created)
SELECT 'Indexes:' as section;
SELECT name FROM sqlite_master WHERE type='index' ORDER BY name;

-- 3. Verify foreign key constraints are enabled
SELECT 'Foreign Keys Status:' as section;
PRAGMA foreign_keys;

-- 4. Get table info for critical tables
SELECT 'Users Table Schema:' as section;
PRAGMA table_info(users);

SELECT 'Artists Table Schema:' as section;
PRAGMA table_info(artists);

SELECT 'Tracks Table Schema:' as section;
PRAGMA table_info(tracks);

SELECT 'Gigs Table Schema:' as section;
PRAGMA table_info(gigs);

-- 5. Verify foreign key relationships
SELECT 'Foreign Keys for artists:' as section;
PRAGMA foreign_key_list(artists);

SELECT 'Foreign Keys for tracks:' as section;
PRAGMA foreign_key_list(tracks);

SELECT 'Foreign Keys for gig_applications:' as section;
PRAGMA foreign_key_list(gig_applications);

-- 6. Count tables (should be 30+ tables)
SELECT 'Total Table Count:' as section;
SELECT COUNT(*) as table_count FROM sqlite_master WHERE type='table';
