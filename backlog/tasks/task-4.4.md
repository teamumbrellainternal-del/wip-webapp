---
id: task-4.4
title: "Implement Spotlight Artists Feature"
status: "Done"
assignee: []
created_date: "2025-11-15"
labels: ["backend", "P1", "analytics"]
milestone: "M4 - Dashboard & Analytics Foundation"
dependencies: ["task-1.4"]
estimated_hours: 2
---

## Description
Implement the endpoint that returns spotlight artists for the Growth page: random verified artists with >4.5 rating (D-068).

## Acceptance Criteria
- [x] GET /v1/analytics/spotlight endpoint implemented
- [x] Returns 10 random verified artists with rating > 4.5
- [x] Artist data includes: name, genre, rating, gig_count, verification badge
- [x] Uses random selection (D-068: no algorithm)
- [x] Caches result in KV with 24-hour TTL
- [x] Refreshes daily at midnight UTC (same as analytics cron)
- [x] Public endpoint (no auth required)

## Implementation Plan
1. Create GET /v1/analytics/spotlight route
2. Check KV for cached spotlight data (key: `spotlight:{date}`)
3. If cache hit: return cached artists
4. If cache miss:
   - Query D1: SELECT * FROM artists WHERE verified = true AND rating_avg > 4.5 ORDER BY RANDOM() LIMIT 10
   - Fetch artist names, genres, ratings, gig counts
5. Cache result in KV with 24-hour TTL
6. Return array of spotlight artist objects
7. Optional: Add spotlight calculation to analytics cron job (task-4.2)

## Notes & Comments
**References:**
- docs/initial-spec/eng-spec.md - Screen 23 (Spotlight Artists section)
- docs/initial-spec/eng-spec.md - D-068 (Random verified artists with >4.5 rating)
- docs/initial-spec/architecture.md - KV caching strategy
- db/schema.sql - artists table

**Priority:** P1 - Nice-to-have for Growth page
**File:** api/controllers/analytics/spotlight.ts
**Can Run Parallel With:** task-4.1

**DEPENDENCY NOTE:** Requires task-1.4 (Authentication Middleware) complete. Cannot implement authenticated endpoints without the requireAuth middleware.
