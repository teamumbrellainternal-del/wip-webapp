---
id: task-1.7
title: "Create Test Fixtures for Development"
status: "To Do"
assignee: []
created_date: "2025-11-15"
labels: ["backend", "P0", "testing", "data-seeding"]
milestone: "M1 - Authentication & Session Management"
dependencies: ["task-1.4"]
estimated_hours: 4
---

## Description
Generate comprehensive seed data (users, artists, gigs, messages, files) for frontend development. This enables frontend developers to build UI components against realistic data without waiting for full backend implementation.

## Acceptance Criteria
- [ ] Seeding script created in db/seed.ts
- [ ] 10 test users with complete onboarding (artists with all 5 steps)
- [ ] 20 test artists with complete profiles, uploaded tracks, and reviews
- [ ] 30 test gigs with varying dates (past/upcoming), venues, genres, and statuses
- [ ] 50 test messages across multiple conversations
- [ ] Test files uploaded to R2 with metadata (audio tracks, images, documents)
- [ ] Seed data covers all user states: incomplete onboarding, active, suspended
- [ ] Seed data includes edge cases: quota near limit, long text fields, special characters
- [ ] Script is idempotent (can run multiple times safely)
- [ ] Documentation in db/README.md on how to run seeding

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
