---
id: task-2.4
title: "Implement Onboarding Step 4 Endpoint (Your Numbers)"
status: "To Do"
assignee: []
created_date: "2025-11-15"
labels: ["backend", "P0", "onboarding"]
milestone: "M2 - Onboarding Flow Implementation"
dependencies: ["task-1.4"]
estimated_hours: 3
---

## Description
Implement the backend endpoint for onboarding step 4 that collects artist rates, capacity, time split, and availability preferences.

## Acceptance Criteria
- [ ] POST /v1/onboarding/artists/step4 endpoint implemented
- [ ] Requires authentication
- [ ] Validates rate ranges: practice_rate, performance_rate, recording_rate
- [ ] Validates capacity (monthly gig capacity as number)
- [ ] Validates time_split percentages (must sum to 100)
- [ ] Stores availability calendar data
- [ ] Marks step_4_complete = true
- [ ] Returns updated artist profile

## Implementation Plan
1. Create route handler in api/controllers/onboarding/index.ts
2. Validate numeric fields are within reasonable ranges
3. Validate time_split percentages sum to 100
4. Store rate and capacity data
5. Mark step 4 complete
6. Return success response

## Notes & Comments
**References:**
- docs/initial-spec/eng-spec.md - Screen 8 (Onboarding Step 4)
- api/models/artist.ts

**Priority:** P0 - Blocks user onboarding
**File:** api/controllers/onboarding/index.ts
**Can Run Parallel With:** task-2.1, task-2.2, task-2.3, task-2.5, task-2.6

**DEPENDENCY NOTE:** Requires task-1.4 (Authentication Middleware) complete. Cannot implement authenticated endpoints without the requireAuth middleware.
