---
id: task-2.11
title: "Build Onboarding Step 5 Frontend Page"
status: "To Do"
assignee: []
created_date: "2025-11-15"
labels: ["frontend", "P0", "onboarding"]
milestone: "M2 - Onboarding Flow Implementation"
dependencies: ["task-2.5"]
estimated_hours: 4
---

## Description
Create the frontend page for onboarding step 5 with 6 yes/no toggle questions and completion redirect.

## Acceptance Criteria
- [ ] src/pages/onboarding/Step5.tsx component created
- [ ] 6 toggle switches for yes/no questions
- [ ] "Submit" button (not "Next")
- [ ] Calls POST /v1/onboarding/artists/step5 on submit
- [ ] Redirects to /dashboard on successful completion
- [ ] Shows completion animation or message
- [ ] "Back" button returns to step 4
- [ ] Progress indicator shows "Step 5 of 5"

## Implementation Plan
1. Create Step5.tsx component
2. Implement 6 toggle questions
3. Wire up API call
4. Add completion redirect logic
5. Optional: Add success animation
6. Implement back navigation

## Notes & Comments
**References:**
- docs/initial-spec/eng-spec.md - Screen 9 (Onboarding Step 5)
- docs/initial-spec/eng-spec.md - D-006 (Redirect to dashboard)
- src/components/ui/switch.tsx

**Priority:** P0 - Blocks user onboarding completion
**File:** src/pages/onboarding/Step5.tsx
**Can Run Parallel With:** task-2.7, task-2.8, task-2.9, task-2.10
