---
id: task-3.1
title: "Implement Get Profile Endpoint"
status: "To Do"
assignee: []
created_date: "2025-11-15"
labels: ["backend", "P0", "profile"]
milestone: "M3 - Profile Management"
dependencies: ["task-1.4"]
estimated_hours: 3
---

## Description
Implement the endpoint that retrieves artist profile data for both public viewing and own profile access. Supports the 6-tab profile system with all profile metadata.

## Acceptance Criteria
- [ ] GET /v1/profile endpoint implemented for own profile
- [ ] GET /v1/profile/:artistId endpoint implemented for public profiles
- [ ] Requires authentication (uses requireAuth middleware)
- [ ] Returns complete artist profile with all tabs data
- [ ] Excludes private fields (phone, earnings) for public profiles
- [ ] Calculates profile completion percentage
- [ ] Returns track count, follower count, rating average
- [ ] Proper error handling (404 if profile not found)

## Implementation Plan
1. Create route handler in api/controllers/profile/index.ts
2. Apply requireAuth middleware
3. Determine if viewing own profile or public profile (compare user_id)
4. Fetch artist record from D1 with all related data
5. If public profile: filter out private fields (phone_number, earnings)
6. Calculate derived metrics (profile_completion, track_count, follower_count, rating_avg)
7. Return profile JSON with appropriate fields

## Notes & Comments
**References:**
- docs/initial-spec/eng-spec.md - Screen 13-14 (6-tab profile system)
- docs/initial-spec/eng-spec.md - D-023 (Edit if own, Share/Report if other's)
- api/models/artist.ts - Artist data model
- db/schema.sql - artists table structure

**Priority:** P0 - Required for profile viewing
**File:** api/controllers/profile/index.ts
**Can Run Parallel With:** task-3.2, task-3.3, task-3.4, task-3.7
