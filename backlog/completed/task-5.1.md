---
id: task-5.1
title: "Implement Gig Listing Endpoint with Filters"
status: "Completed"
assignee: []
created_date: "2025-11-15"
completed_date: "2025-11-16"
labels: ["backend", "P1", "marketplace"]
milestone: "M5 - Marketplace Discovery System"
dependencies: ["task-1.4"]
estimated_hours: 4
---

## Description
Implement the endpoint for browsing gigs in the marketplace with filters (genre, location, date, price) and infinite scroll pagination. Default sort: random shuffle (D-014).

## Acceptance Criteria
- [x] GET /v1/gigs endpoint implemented
- [x] Requires authentication
- [x] Supports query params: genre[], location, date_start, date_end, price_min, price_max, limit, offset
- [x] Default sort: RANDOM() (D-014)
- [x] Returns gig cards with: venue, title, date, capacity, location, rating, genre, payment
- [x] Calculates urgency flag (D-010: within 7 days with <50% capacity)
- [x] Infinite scroll pagination (D-017: limit/offset params)
- [x] Returns total count for UI display
- [x] Proper error handling

## Implementation Plan
1. Create GET /v1/gigs route in api/controllers/marketplace/gigs.ts
2. Apply requireAuth middleware
3. Parse query parameters (filters, pagination)
4. Build D1 query with WHERE clauses for filters:
   - genre IN (?) if genre[] provided
   - location_city = ? if location provided
   - date BETWEEN ? AND ? if date range provided
   - payment BETWEEN ? AND ? if price range provided
5. Add ORDER BY RANDOM() (D-014)
6. Add LIMIT ? OFFSET ? for pagination
7. Execute query and fetch gig records
8. For each gig, calculate urgency_flag (D-010):
   - (date - today) <= 7 days AND capacity_filled < 50%
9. Fetch venue ratings and review counts
10. Return JSON with gigs array and total_count

## Notes & Comments
**References:**
- docs/initial-spec/eng-spec.md - Screen 11 (Marketplace - Find Gigs)
- docs/initial-spec/eng-spec.md - D-010 (Urgent badge logic)
- docs/initial-spec/eng-spec.md - D-014 (Random shuffle)
- docs/initial-spec/eng-spec.md - D-017 (Infinite scroll)
- db/schema.sql - gigs table

**Priority:** P1 - Core marketplace feature
**File:** api/controllers/marketplace/gigs.ts
**Can Run Parallel With:** task-5.2, task-5.3, task-5.4, task-5.5

**DEPENDENCY NOTE:** Requires task-1.4 (Authentication Middleware) complete. Cannot implement authenticated endpoints without the requireAuth middleware.
