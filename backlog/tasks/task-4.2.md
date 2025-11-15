---
id: task-4.2
title: "Implement Analytics Cron Job"
status: "To Do"
assignee: []
created_date: "2025-11-15"
labels: ["backend", "P0", "analytics", "cron"]
milestone: "M4 - Dashboard & Analytics Foundation"
dependencies: ["task-4.1"]
estimated_hours: 3
---

## Description
Implement the cron job that runs daily at midnight UTC to aggregate analytics data for all artists (D-008).

## Acceptance Criteria
- [ ] Cron job configured in wrangler.toml to run at midnight UTC
- [ ] Job handler endpoint created at /cron/analytics
- [ ] Aggregates data for all artists in single run
- [ ] Calculates: total_earnings (from completed gigs), gig_count, profile_views, follower_count
- [ ] Inserts daily analytics record for each artist
- [ ] Uses D1 transactions for atomicity
- [ ] Logs completion time and artist count processed
- [ ] Error handling and retry logic for failed aggregations

## Implementation Plan
1. Add cron trigger to wrangler.toml: `0 0 * * *` (midnight UTC)
2. Create /cron/analytics route handler
3. Fetch all active artists from artists table
4. For each artist:
   - Calculate yesterday's total_earnings (sum of completed gig payments)
   - Count completed gigs (D-080: either party can mark complete)
   - Count profile views from profile_views table
   - Count platform followers (D-070: platform only)
5. Begin D1 transaction
6. Insert analytics record for each artist (artist_id, date, metrics)
7. Commit transaction
8. Log success: "Analytics aggregated for X artists"
9. Add error handling: log failures, continue processing other artists

## Notes & Comments
**References:**
- docs/initial-spec/eng-spec.md - D-008 (Daily batch at midnight UTC)
- docs/initial-spec/eng-spec.md - D-070 (Platform followers only)
- docs/initial-spec/eng-spec.md - D-080 (Either party marks complete)
- docs/initial-spec/architecture.md - Cron pattern
- wrangler.toml - Cron configuration

**Priority:** P0 - Required for metrics updates
**File:** api/cron/analytics.ts
**Dependencies:** Requires task-4.1 (analytics table and logic)
