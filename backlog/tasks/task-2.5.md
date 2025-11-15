---
id: task-2.5
title: "Implement Onboarding Step 5 Endpoint (Quick Questions)"
status: "To Do"
assignee: []
created_date: "2025-11-15"
labels: ["backend", "P0", "onboarding"]
milestone: "M2 - Onboarding Flow Implementation"
dependencies: ["task-1.4"]
estimated_hours: 3
---

## Description
Implement the backend endpoint for onboarding step 5 that collects final yes/no toggles, marks onboarding as complete, and redirects user to dashboard.

## Acceptance Criteria
- [ ] POST /v1/onboarding/artists/step5 endpoint implemented
- [ ] Requires authentication
- [ ] Accepts 6 yes/no questions as boolean fields
- [ ] Updates user record: onboarding_complete = true
- [ ] Marks step_5_complete = true
- [ ] Returns updated artist profile with redirect_url = /dashboard
- [ ] Transaction safety: wrap updates in single D1 transaction

## Implementation Plan
1. Create route handler in api/controllers/onboarding/index.ts
2. Validate boolean fields for 6 questions
3. Begin D1 transaction
4. Update artist record with step 5 data
5. Update user record: onboarding_complete = true
6. Commit transaction
7. Return success with dashboard redirect

## Notes & Comments
**References:**
- docs/initial-spec/eng-spec.md - Screen 9 (Onboarding Step 5)
- docs/initial-spec/eng-spec.md - D-006 (Redirect to dashboard on completion)
- api/models/artist.ts, api/models/user.ts

**Priority:** P0 - Blocks user onboarding completion
**File:** api/controllers/onboarding/index.ts
**Can Run Parallel With:** task-2.1, task-2.2, task-2.3, task-2.4, task-2.6

**DEPENDENCY NOTE:** Requires task-1.4 (Authentication Middleware) complete. Cannot implement authenticated endpoints without the requireAuth middleware.
