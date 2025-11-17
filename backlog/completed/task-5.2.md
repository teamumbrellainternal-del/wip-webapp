---
id: task-5.2
title: "Implement Single Gig Detail Endpoint"
status: "Done"
assignee: []
created_date: "2025-11-15"
completed_date: "2025-11-16"
labels: ["backend", "P1", "marketplace"]
milestone: "M5 - Marketplace Discovery System"
dependencies: ["task-1.4"]
estimated_hours: 2
---

## Description
Implement the endpoint for fetching detailed information about a single gig, displayed in the right sidebar of the marketplace.

## Acceptance Criteria
- [x] GET /v1/gigs/:gigId endpoint implemented
- [x] Requires authentication
- [x] Returns complete gig details: venue, title, description, date, time, capacity, location, payment, requirements
- [x] Returns venue information: name, rating, review_count, contact_info
- [x] Returns urgency flag if applicable (D-010)
- [x] Returns application status if user already applied
- [x] 404 error if gig not found
- [x] Proper error handling

## Implementation Plan
1. Create GET /v1/gigs/:gigId route in api/controllers/marketplace/gigs.ts
2. Apply requireAuth middleware
3. Parse gigId from route params
4. Fetch gig record from D1 with JOIN to venues table
5. Calculate urgency_flag (D-010: within 7 days with <50% capacity)
6. Check if authenticated user already applied (query gig_applications table)
7. If not found: return 404
8. Return JSON with complete gig details + venue info + application_status

## Notes & Comments
**References:**
- docs/initial-spec/eng-spec.md - Screen 11 (Gig detail sidebar)
- docs/initial-spec/eng-spec.md - D-010 (Urgent badge logic)
- db/schema.sql - gigs, venues tables

**Priority:** P1 - Required for gig details
**File:** api/controllers/marketplace/gigs.ts
**Can Run Parallel With:** task-5.1, task-5.3, task-5.4, task-5.5

**DEPENDENCY NOTE:** Requires task-1.4 (Authentication Middleware) complete. Cannot implement authenticated endpoints without the requireAuth middleware.
