---
id: task-2.6
title: "Implement Onboarding Status Endpoint"
status: "To Do"
assignee: []
created_date: "2025-11-15"
labels: ["backend", "P0", "onboarding"]
milestone: "M2 - Onboarding Flow Implementation"
dependencies: ["task-1.4"]
estimated_hours: 2
---

## Description
Implement an endpoint that returns the current onboarding status for a user, showing which steps have been completed and which step to show next.

## Acceptance Criteria
- [ ] GET /v1/onboarding/status endpoint implemented
- [ ] Requires authentication
- [ ] Returns object with: current_step, steps_complete, onboarding_complete
- [ ] Determines current_step based on which steps are incomplete
- [ ] Returns redirect_url for next step or dashboard if complete
- [ ] Handles users who haven't started onboarding

## Implementation Plan
1. Create route handler in api/controllers/onboarding/index.ts
2. Fetch user and artist records from D1
3. Check step_1_complete through step_5_complete flags
4. Calculate current_step (first incomplete step)
5. Return status object with appropriate redirect URL

## Notes & Comments
**References:**
- docs/initial-spec/eng-spec.md - D-006 (Onboarding redirect logic)
- api/models/artist.ts, api/models/user.ts

**Priority:** P0 - Required by frontend onboarding flow
**File:** api/controllers/onboarding/index.ts
**Can Run Parallel With:** All other M2 backend tasks
