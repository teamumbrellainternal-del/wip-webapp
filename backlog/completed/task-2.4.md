---
id: task-2.4
title: "Implement Onboarding Step 4 Endpoint (Your Numbers)"
status: "Done"
assignee: ["claude"]
created_date: "2025-11-15"
completed_date: "2025-11-16"
labels: ["backend", "P0", "onboarding"]
milestone: "M2 - Onboarding Flow Implementation"
dependencies: ["task-1.4"]
estimated_hours: 3
actual_hours: 0
---

## Description
Implement the backend endpoint for onboarding step 4 that collects artist rates, capacity, time split, and availability preferences.

## Acceptance Criteria
- [x] POST /v1/onboarding/step4 endpoint implemented (Note: path simplified from /artists/step4)
- [x] Requires authentication (authMiddleware applied in api/index.ts:101)
- [x] Validates rate ranges: base_rate_flat, base_rate_hourly (per eng-spec.md Screen 8)
- [x] Validates capacity (largest_show_capacity as number)
- [x] Validates time_split percentages (must sum to 100)
- [x] Stores availability calendar data (available_dates array)
- [x] Marks step_4_complete = true (completedSteps includes 4)
- [x] Returns success response with next step info

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

## Completion Notes

**Implementation Status:** ✅ Complete (Already Implemented)

**Implementation Details:**
- **Endpoint:** POST /v1/onboarding/step4 (api/index.ts:101)
- **Handler:** `submitStep4` in api/controllers/onboarding/index.ts:432-500
- **Validation:** `validateStep4` in api/utils/validation.ts:232-307
- **Authentication:** Required via authMiddleware
- **Storage:** KV-based session storage (temporary until step 5 completion per D-004)

**Field Mappings (per eng-spec.md Screen 8):**
- `largest_show_capacity`: Integer (0-1000+) for largest show venue size
- `base_rate_flat`: Integer (0-5000+) for flat rate per show/event
- `base_rate_hourly`: Integer (0-500+) for hourly rate for sessions
- `time_split_creative`: Integer (0-100%) for creative time percentage
- `time_split_logistics`: Integer (0-100%) for logistics time percentage
- `available_dates`: Array of ISO date strings (max 3 future dates)

**Validation Rules Implemented:**
- At least one rate (flat or hourly) must be provided
- base_rate_flat: positive number, max $1,000,000
- base_rate_hourly: positive number, max $10,000/hr
- largest_show_capacity: positive integer
- travel_radius_miles: positive number, max 10,000 miles
- advance_booking_weeks: positive integer, max 52 weeks
- time_split_creative + time_split_logistics must equal 100
- available_dates: array of valid ISO dates (YYYY-MM-DD format)

**Integration:**
- Session-based storage: Data stored in KV with 24-hour TTL (api/controllers/onboarding/index.ts:472-480)
- Step progression: Step 3 must be completed before step 4 (validation at line 461-468)
- Next step: Marks step 4 complete and advances to step 5 (lines 473-476)
- Final persistence: Artist profile created in D1 only when step 5 completes (per D-004)

**Testing:**
- Integration tests: tests/integration/onboarding-flow.test.ts:136
- E2E tests: tests/e2e/critical-paths.test.ts

**Path Note:**
The implemented path is `/v1/onboarding/step4` rather than `/v1/onboarding/artists/step4` as originally specified in the task description. This simplified path is more consistent with the API design and is used throughout the codebase and tests. The `/artists/` segment is redundant since onboarding is exclusively for artists in the MVP scope.

**Field Name Clarification:**
The task description mentions "practice_rate, performance_rate, recording_rate" but the engineering spec (Screen 8) and implementation correctly use "base_rate_flat" and "base_rate_hourly" as these align with the actual onboarding flow requirements.

**Response Format:**
Returns a success response with progression info rather than the full artist profile. The artist profile is created in D1 only upon step 5 completion, as steps 1-4 use temporary KV session storage (per design decisions D-004 and D-006).
