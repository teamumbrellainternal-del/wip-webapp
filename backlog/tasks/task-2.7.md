---
id: task-2.7
title: "Build Onboarding Step 1 Frontend Page"
status: "To Do"
assignee: []
created_date: "2025-11-15"
labels: ["frontend", "P0", "onboarding"]
milestone: "M2 - Onboarding Flow Implementation"
dependencies: ["task-2.1"]
estimated_hours: 4
---

## Description
Create the frontend page for onboarding step 1 that collects identity and basic information with form validation.

## Acceptance Criteria
- [ ] src/pages/onboarding/Step1.tsx component created
- [ ] Form fields: stage_name (required), location_city, location_state
- [ ] Optional fields: inspirations (textarea), genre_primary (multi-select, max 3)
- [ ] Client-side validation for required fields
- [ ] Calls POST /v1/onboarding/artists/step1 on submit
- [ ] Shows loading state during API call
- [ ] Error handling with user-friendly messages
- [ ] "Next" button navigates to step 2 on success
- [ ] Progress indicator shows "Step 1 of 5"

## Implementation Plan
1. Create Step1.tsx component in src/pages/onboarding/
2. Set up form with react-hook-form
3. Implement validation rules
4. Wire up API call using apiClient.submitStep1()
5. Add loading/error states
6. Implement navigation to step 2
7. Add progress indicator component

## Notes & Comments
**References:**
- docs/initial-spec/eng-spec.md - Screen 5 (Onboarding Step 1)
- src/components/ui/input.tsx, select.tsx - UI components
- src/lib/api-client.ts - API utilities

**Priority:** P0 - Blocks user onboarding UI
**File:** src/pages/onboarding/Step1.tsx
**Can Run Parallel With:** task-2.8, task-2.9, task-2.10, task-2.11
