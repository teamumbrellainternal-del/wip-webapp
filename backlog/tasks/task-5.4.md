---
id: task-5.4
title: "Implement Artist Discovery Endpoint"
status: "To Do"
assignee: []
created_date: "2025-11-15"
labels: ["backend", "P1", "marketplace"]
milestone: "M5 - Marketplace Discovery System"
dependencies: ["task-1.4"]
estimated_hours: 4
---

## Description
Implement the endpoint for browsing artists in the marketplace with filters (genre, location, verified status) and infinite scroll pagination. Default sort: random shuffle (D-014).

## Acceptance Criteria
- [ ] GET /v1/artists endpoint implemented
- [ ] Requires authentication
- [ ] Supports query params: genre[], location, verified, available_now, limit, offset
- [ ] Default sort: RANDOM() (D-014)
- [ ] Returns artist cards with: name, verification badge, genre, distance, bio preview, rating, followers, gigs, price range
- [ ] Calculates distance from authenticated user location (if available)
- [ ] Infinite scroll pagination (D-017: limit/offset params)
- [ ] Returns total count for UI display
- [ ] Proper error handling

## Implementation Plan
1. Create GET /v1/artists route in api/controllers/marketplace/artists.ts
2. Apply requireAuth middleware
3. Get authenticated user's location (for distance calculation)
4. Parse query parameters (filters, pagination)
5. Build D1 query with WHERE clauses:
   - primary_genre IN (?) if genre[] provided
   - city = ? OR state = ? if location provided
   - verified_status = true if verified filter
   - has future available_dates if available_now filter
6. Add ORDER BY RANDOM() (D-014)
7. Add LIMIT ? OFFSET ? for pagination
8. Execute query and fetch artist records
9. For each artist, calculate distance from user (if user location available)
10. Fetch follower_count (D-070: platform followers only)
11. Return JSON with artists array and total_count

## Notes & Comments
**References:**
- docs/initial-spec/eng-spec.md - Screen 12 (Marketplace - Discover Artists)
- docs/initial-spec/eng-spec.md - D-014 (Random shuffle)
- docs/initial-spec/eng-spec.md - D-017 (Infinite scroll)
- docs/initial-spec/eng-spec.md - D-070 (Platform followers only)
- db/schema.sql - artists table

**Priority:** P1 - Core marketplace feature
**File:** api/controllers/marketplace/artists.ts
**Can Run Parallel With:** task-5.1, task-5.2, task-5.3, task-5.5

**DEPENDENCY NOTE:** Requires task-1.4 (Authentication Middleware) complete. Cannot implement authenticated endpoints without the requireAuth middleware.
