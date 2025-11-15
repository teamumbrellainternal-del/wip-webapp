---
id: task-2.3
title: "Implement Onboarding Step 3 Endpoint (Creative Profile)"
status: "To Do"
assignee: []
created_date: "2025-11-15"
labels: ["backend", "P0", "onboarding"]
milestone: "M2 - Onboarding Flow Implementation"
dependencies: ["task-1.4"]
estimated_hours: 3
---

## Description
Implement the backend endpoint for onboarding step 3 that collects tag selections across 7 categories for the artist's creative profile.

## Acceptance Criteria
- [ ] POST /v1/onboarding/artists/step3 endpoint implemented
- [ ] Requires authentication
- [ ] Accepts tags for 7 categories: artist_type, genres, equipment, skills, influences, goals, values
- [ ] Validates tag selections from predefined lists
- [ ] Stores tags in artist profile
- [ ] Marks step_3_complete = true
- [ ] Returns updated artist profile

## Implementation Plan
1. Create route handler in api/controllers/onboarding/index.ts
2. Define allowed tags for each category
3. Validate submitted tags against allowed lists
4. Store tags in appropriate artist fields
5. Mark step 3 complete
6. Return success response

## Notes & Comments
**References:**
- docs/initial-spec/eng-spec.md - Screen 7 (Onboarding Step 3)
- api/models/artist.ts

**Priority:** P0 - Blocks user onboarding
**File:** api/controllers/onboarding/index.ts
**Can Run Parallel With:** task-2.1, task-2.2, task-2.4, task-2.5, task-2.6

**DEPENDENCY NOTE:** Requires task-1.4 (Authentication Middleware) complete. Cannot implement authenticated endpoints without the requireAuth middleware.
