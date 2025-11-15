---
id: task-2.9
title: "Build Onboarding Step 3 Frontend Page"
status: "To Do"
assignee: []
created_date: "2025-11-15"
labels: ["frontend", "P0", "onboarding"]
milestone: "M2 - Onboarding Flow Implementation"
dependencies: ["task-2.3"]
estimated_hours: 4
---

## Description
Create the frontend page for onboarding step 3 with tag selection across 7 categories.

## Acceptance Criteria
- [ ] src/pages/onboarding/Step3.tsx component created
- [ ] 7 tag selection sections: artist_type, genres, equipment, skills, influences, goals, values
- [ ] Multi-select tag interface with visual feedback
- [ ] Calls POST /v1/onboarding/artists/step3 on submit
- [ ] "Back" and "Next" navigation buttons
- [ ] Progress indicator shows "Step 3 of 5"

## Implementation Plan
1. Create Step3.tsx component
2. Implement tag selection component
3. Create 7 category sections
4. Wire up API call
5. Add navigation
6. Style tag selections

## Notes & Comments
**References:**
- docs/initial-spec/eng-spec.md - Screen 7 (Onboarding Step 3)

**Priority:** P0 - Blocks user onboarding UI
**File:** src/pages/onboarding/Step3.tsx
**Can Run Parallel With:** task-2.7, task-2.8, task-2.10, task-2.11
