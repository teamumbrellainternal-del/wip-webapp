---
id: task-4.1
title: "Implement Analytics Aggregation Endpoint"
status: "To Do"
assignee: []
created_date: "2025-11-15"
labels: ["backend", "P0", "analytics"]
milestone: "M4 - Dashboard & Analytics Foundation"
dependencies: ["task-1.4"]
estimated_hours: 4
---

## Description
Implement the endpoint that aggregates and returns analytics data for the artist dashboard and growth page. Daily batch updates at midnight UTC (D-008).

## Acceptance Criteria
- [ ] GET /v1/analytics endpoint implemented
- [ ] Requires authentication
- [ ] Returns metrics: total_earnings, gig_count, profile_views, follower_count
- [ ] Supports query params: period (month/year), start_date, end_date
- [ ] Calculates percentage changes from previous period
- [ ] Returns chart data for performance visualization
- [ ] Peak values calculated (peak_revenue, peak_gigs, peak_fans)
- [ ] Data sourced from daily batch aggregation (D-008)

## Implementation Plan
1. Create GET /v1/analytics route in api/controllers/analytics/index.ts
2. Apply requireAuth middleware
3. Parse query parameters (period, date range)
4. Fetch analytics records from analytics table filtered by artist_id and date range
5. Calculate current period totals (earnings, gigs, views, followers)
6. Calculate previous period totals for comparison
7. Compute percentage changes
8. Prepare chart data array (date → metrics mapping)
9. Calculate peak values across all data
10. Return JSON with metrics, chart data, peaks, percentage changes

## Notes & Comments
**References:**
- docs/initial-spec/eng-spec.md - Screen 23 (Growth & Analytics)
- docs/initial-spec/eng-spec.md - D-008 (Daily batch at midnight UTC)
- docs/initial-spec/eng-spec.md - D-070 (Platform followers only)
- db/schema.sql - analytics table

**Priority:** P0 - Core dashboard feature
**File:** api/controllers/analytics/index.ts
**Can Run Parallel With:** task-4.4
