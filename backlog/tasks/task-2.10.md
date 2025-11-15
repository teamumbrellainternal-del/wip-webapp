---
id: task-2.10
title: "Build Onboarding Step 4 Frontend Page"
status: "To Do"
assignee: []
created_date: "2025-11-15"
labels: ["frontend", "P0", "onboarding"]
milestone: "M2 - Onboarding Flow Implementation"
dependencies: ["task-2.4"]
estimated_hours: 4
---

## Description
Create the frontend page for onboarding step 4 with sliders for rates, capacity, time split, and date picker for availability.

## Acceptance Criteria
- [ ] src/pages/onboarding/Step4.tsx component created
- [ ] Slider inputs for: practice_rate, performance_rate, recording_rate
- [ ] Numeric input for monthly gig capacity
- [ ] Time split sliders (percentages must sum to 100)
- [ ] Date range picker for availability
- [ ] Real-time validation of time split sum
- [ ] Calls POST /v1/onboarding/artists/step4 on submit
- [ ] "Back" and "Next" navigation
- [ ] Progress indicator shows "Step 4 of 5"

## Implementation Plan
1. Create Step4.tsx component
2. Implement slider components for rates
3. Add capacity numeric input
4. Implement time split with auto-calculation
5. Add date picker
6. Wire up API call
7. Add validation

## Notes & Comments
**References:**
- docs/initial-spec/eng-spec.md - Screen 8 (Onboarding Step 4)
- src/components/ui/slider.tsx, calendar.tsx

**Priority:** P0 - Blocks user onboarding UI
**File:** src/pages/onboarding/Step4.tsx
**Can Run Parallel With:** task-2.7, task-2.8, task-2.9, task-2.11
