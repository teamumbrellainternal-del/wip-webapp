---
id: task-2.2
title: "Implement Onboarding Step 2 Endpoint (Links & Story)"
status: "To Do"
assignee: []
created_date: "2025-11-15"
labels: ["backend", "P0", "onboarding"]
milestone: "M2 - Onboarding Flow Implementation"
dependencies: ["task-1.4"]
estimated_hours: 3
---

## Description
Implement the backend endpoint for onboarding step 2 that collects social platform connections (minimum 3 required) and qualitative questions about the artist's story.

## Acceptance Criteria
- [ ] POST /v1/onboarding/artists/step2 endpoint implemented
- [ ] Requires authentication
- [ ] Validates minimum 3 social platform links
- [ ] Accepts: Instagram, Facebook, YouTube, SoundCloud, Spotify, TikTok, Twitter
- [ ] Collects qualitative questions: your_story, creative_approach, fan_connection
- [ ] Updates artists table with step 2 data
- [ ] Marks step_2_complete = true
- [ ] Returns updated artist profile

## Implementation Plan
1. Create route handler in api/controllers/onboarding/index.ts
2. Validate at least 3 social links provided
3. Validate URL formats for each platform
4. Store social links in JSON field
5. Store qualitative answers
6. Mark step 2 complete
7. Return success response

## Notes & Comments
**References:**
- docs/initial-spec/eng-spec.md - Screen 6 (Onboarding Step 2)
- docs/initial-spec/eng-spec.md - D-004 (Minimum 3 social links)
- api/models/artist.ts

**Priority:** P0 - Blocks user onboarding
**File:** api/controllers/onboarding/index.ts
**Can Run Parallel With:** task-2.1, task-2.3, task-2.4, task-2.5, task-2.6
