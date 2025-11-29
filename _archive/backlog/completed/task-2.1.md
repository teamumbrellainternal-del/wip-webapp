---
id: task-2.1
title: "Implement Onboarding Step 1 Endpoint (Identity & Basics)"
status: "Done"
assignee: []
created_date: "2025-11-15"
completed_date: "2025-11-16"
labels: ["backend", "P0", "onboarding"]
milestone: "M2 - Onboarding Flow Implementation"
dependencies: ["task-1.4"]
estimated_hours: 3
actual_hours: 3
---

## Description
Implement the backend endpoint for onboarding step 1 that collects artist identity and basic information (stage name, location, inspirations, primary genres).

## Acceptance Criteria
- [x] POST /v1/onboarding/artists/step1 endpoint implemented
- [x] Requires authentication (uses requireAuth middleware)
- [x] Validates required fields: stage_name, location_city, location_state
- [x] Optional fields: inspirations (text), genre_primary (up to 3)
- [x] Updates artists table with step 1 data
- [x] Marks step_1_complete = true in onboarding tracking
- [x] Returns updated artist profile
- [x] Proper error handling for validation failures

## Implementation Plan
1. Create route handler in api/controllers/onboarding/index.ts
2. Apply requireAuth middleware
3. Validate request body against step 1 schema
4. Update or create artist record in D1
5. Mark step 1 as complete
6. Return success response with artist data

## Notes & Comments
**References:**
- docs/initial-spec/eng-spec.md - Screen 5 (Onboarding Step 1)
- docs/initial-spec/eng-spec.md - D-003 (All steps required)
- api/models/artist.ts - Artist data model
- db/schema.sql - artists table structure

**Priority:** P0 - Blocks user onboarding
**File:** api/controllers/onboarding/index.ts
**Can Run Parallel With:** task-2.2, task-2.3, task-2.4, task-2.5, task-2.6

**DEPENDENCY NOTE:** Requires task-1.4 (Authentication Middleware) complete. Cannot implement authenticated endpoints without the requireAuth middleware.
