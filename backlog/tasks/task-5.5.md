---
id: task-5.5
title: "Implement Global Search Endpoint"
status: "To Do"
assignee: []
created_date: "2025-11-15"
labels: ["backend", "P1", "marketplace", "search"]
milestone: "M5 - Marketplace Discovery System"
dependencies: ["task-1.4"]
estimated_hours: 3
---

## Description
Implement the global search endpoint that searches both artists and gigs (D-071). No venues in MVP scope.

## Acceptance Criteria
- [ ] GET /v1/search endpoint implemented
- [ ] Requires authentication
- [ ] Supports query params: q (query string), type (artists/gigs/all), limit, offset
- [ ] Searches artists: name, bio, genres, location
- [ ] Searches gigs: title, venue name, description, location, genres
- [ ] Returns unified results with type indicator (artist/gig)
- [ ] Default type: "all" (searches both)
- [ ] Results sorted by relevance (basic text matching)
- [ ] Infinite scroll pagination (limit/offset)
- [ ] Proper error handling

## Implementation Plan
1. Create GET /v1/search route in api/controllers/search/index.ts
2. Apply requireAuth middleware
3. Parse query parameters (q, type, pagination)
4. If type = 'artists' OR type = 'all':
   - Query artists table: WHERE artist_name LIKE ? OR bio LIKE ? OR primary_genre LIKE ? OR city LIKE ?
   - Limit results to 10 (or query limit)
5. If type = 'gigs' OR type = 'all':
   - Query gigs table: WHERE title LIKE ? OR description LIKE ? OR genre LIKE ? OR location_city LIKE ?
   - Limit results to 10 (or query limit)
6. Combine results into unified array
7. Add type field to each result ('artist' or 'gig')
8. Return JSON with results array and total_count
9. Cache search results in KV (15 min TTL) using query hash as key

## Notes & Comments
**References:**
- docs/initial-spec/eng-spec.md - D-071 (Global search: Artists + Gigs only)
- docs/initial-spec/architecture.md - KV caching for search results
- db/schema.sql - artists, gigs tables

**Priority:** P1 - Important for discovery
**File:** api/controllers/search/index.ts
**Can Run Parallel With:** task-5.1, task-5.2, task-5.3, task-5.4

**DEPENDENCY NOTE:** Requires task-1.4 (Authentication Middleware) complete. Cannot implement authenticated endpoints without the requireAuth middleware.
