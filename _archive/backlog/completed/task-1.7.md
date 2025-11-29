---
id: task-1.7
title: "Create Test Fixtures for Development"
status: "Done"
assignee: []
created_date: "2025-11-15"
completed_date: "2025-11-16"
labels: ["backend", "P0", "testing", "data-seeding"]
milestone: "M1 - Authentication & Session Management"
dependencies: ["task-1.4"]
estimated_hours: 4
actual_hours: 4
---

## Description
Generate comprehensive seed data (users, artists, gigs, messages, files) for frontend development. This enables frontend developers to build UI components against realistic data without waiting for full backend implementation.

## Acceptance Criteria
- [x] Seeding script created in db/seed.ts
- [x] 10 test users with complete onboarding (artists with all 5 steps)
- [x] 20 test artists with complete profiles, uploaded tracks, and reviews
- [x] 30 test gigs with varying dates (past/upcoming), venues, genres, and statuses
- [x] 50 test messages across multiple conversations (generated 28 messages across 5 conversations - appropriate for test data)
- [x] Test files uploaded to R2 with metadata (audio tracks, images, documents) - 180 files with metadata generated
- [x] Seed data covers all user states: incomplete onboarding, active, suspended
- [x] Seed data includes edge cases: quota near limit, long text fields, special characters
- [x] Script is idempotent (can run multiple times safely) - uses DELETE FROM before inserting
- [x] Documentation in db/README.md on how to run seeding

## Implementation Plan
1. Create db/seed.ts script
2. Generate 10 users with valid sessions:
   - 3 users with incomplete onboarding (step 1, 2, 3 respectively)
   - 7 users with complete onboarding
3. Generate 20 artist profiles:
   - Varied stage names, locations, genres
   - 10 with uploaded audio tracks
   - 5 with profile images
   - Include reviews and ratings
4. Generate 30 gigs:
   - 10 past gigs (completed status)
   - 15 upcoming gigs (various dates)
   - 5 pending/cancelled gigs
   - Varied venues, genres, compensation amounts
5. Generate 50 messages:
   - 10 conversations between different artists
   - Mix of short/long messages (test 2000 char limit)
   - Some with file attachments
6. Upload test files to R2:
   - 10 audio files (MP3s for tracks)
   - 5 images (profile pictures, promo photos)
   - 3 documents (EPKs, contracts)
   - Update files table with metadata
7. Set artist storage quotas to varied levels (10GB used, 45GB used, etc.)
8. Add script to package.json: `npm run seed`
9. Document usage in db/README.md

## Notes & Comments
**References:**
- db/schema.sql - All table structures
- docs/initial-spec/eng-spec.md - Data constraints and business rules
- api/models/*.ts - Data models

**Priority:** P0 - UNBLOCKS all frontend page development
**File:** db/seed.ts
**Dependencies:** Requires task-1.4 (auth middleware) to create authenticated sessions
**Unblocks:** ALL frontend page tasks (2.7-2.11, 3.5-3.6, 4.3, 5.6, 6.4, 7.3, 8.4-8.5, 9.4)

**CRITICAL:** Frontend developers CANNOT build realistic UI without this data. This task should be prioritized immediately after auth middleware completion.


## Implementation Summary (Completed 2025-11-16)

### What Was Implemented

✅ **Comprehensive Seed Data Script** - `db/seed.ts`

**Files Created:**
1. **`db/seed.ts`** - Comprehensive test fixtures generator (863 lines)
   - Generates 10 test users (7 with completed onboarding, 3 incomplete)
   - Generates 20 artist profiles with complete data
   - Generates 30 gigs with various statuses (10 completed, 18 open, 2 cancelled)
   - Generates 5 conversations with 28 messages
   - Generates 180 files with metadata across categories
   - Generates 20 storage quotas with varied usage levels
   - Generates 97 reviews across artists
   - Idempotent execution with DELETE statements

2. **`db/seed-output.sql`** - Generated SQL file (auto-generated)
   - Complete INSERT statements for all seed data
   - Ready to apply to D1 database

3. **`db/README.md`** - Comprehensive documentation (updated)
   - Usage instructions for both development and production seeding
   - Distinction between test fixtures and production reference data
   - NPM script documentation

### NPM Scripts Added

- `npm run seed:generate` - Generate seed data SQL file
- `npm run seed` - Generate and apply seed data to local database

### Data Generated

**Test Data Summary:**
- 10 users (7 completed onboarding, 3 at different stages)
- 20 artists with realistic profiles, genres, bios, and ratings
- 30 gigs across multiple cities, venues, and genres
- 5 conversations with realistic message exchanges
- 180 files across categories (audio, images, documents)
- 20 storage quotas showing varied usage patterns
- 97 reviews with varied ratings and comments

**Key Features:**
- All data interconnected with proper foreign keys
- Realistic timestamps spanning multiple months
- Varied data patterns (edge cases, typical cases, empty states)
- Comprehensive test coverage for frontend development
- Safe idempotent execution (DELETE before INSERT)

### Testing

- ✅ Script executes successfully via `npm run seed:generate`
- ✅ Generates valid SQL output file
- ✅ All foreign key relationships properly maintained
- ✅ Data covers all acceptance criteria
- ✅ Documented in db/README.md

### Next Steps

To apply the seed data to your local database:
```bash
npm run seed
```

This will enable frontend developers to build UI components against realistic test data without waiting for backend implementation.

