---
id: task-2.8
title: "Build Onboarding Step 2 Frontend Page"
status: "To Do"
assignee: []
created_date: "2025-11-15"
labels: ["frontend", "P0", "onboarding"]
milestone: "M2 - Onboarding Flow Implementation"
dependencies: ["task-2.2"]
estimated_hours: 4
---

## Description
Create the frontend page for onboarding step 2 that collects social links (minimum 3) and qualitative questions.

## Acceptance Criteria
- [ ] src/pages/onboarding/Step2.tsx component created
- [ ] Social link inputs for: Instagram, Facebook, YouTube, SoundCloud, Spotify, TikTok, Twitter
- [ ] Validates minimum 3 links required
- [ ] Validates URL formats
- [ ] Three textarea fields for qualitative questions
- [ ] Calls POST /v1/onboarding/artists/step2 on submit
- [ ] "Back" button returns to step 1
- [ ] "Next" button navigates to step 3 on success
- [ ] Progress indicator shows "Step 2 of 5"

## Implementation Plan
1. Create Step2.tsx component
2. Implement social link input group
3. Add validation for minimum 3 links
4. Add URL format validation
5. Wire up API call
6. Implement back/next navigation
7. Add progress indicator

## Notes & Comments
**References:**
- docs/initial-spec/eng-spec.md - Screen 6 (Onboarding Step 2)
- docs/initial-spec/eng-spec.md - D-004 (Minimum 3 social links)

**Priority:** P0 - Blocks user onboarding UI
**File:** src/pages/onboarding/Step2.tsx
**Can Run Parallel With:** task-2.7, task-2.9, task-2.10, task-2.11
