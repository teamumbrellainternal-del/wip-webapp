---
id: task-3.2
title: "Implement Update Profile Endpoint"
status: "To Do"
assignee: []
created_date: "2025-11-15"
labels: ["backend", "P0", "profile"]
milestone: "M3 - Profile Management"
dependencies: ["task-1.4"]
estimated_hours: 3
---

## Description
Implement the endpoint for updating artist profile information. Allows editing of basic info, bio, rates, availability, and social links.

## Acceptance Criteria
- [ ] PUT /v1/profile endpoint implemented
- [ ] Requires authentication
- [ ] Only allows updating own profile (not other artists)
- [ ] Validates editable fields: artist_name, bio, location, phone, social_links, rates, availability
- [ ] Read-only fields protected (email, oauth_id, onboarding_complete)
- [ ] Updates profile completion percentage after save
- [ ] Returns updated profile data
- [ ] Proper error handling (403 if trying to edit other's profile)

## Implementation Plan
1. Create PUT route handler in api/controllers/profile/index.ts
2. Apply requireAuth middleware
3. Verify user_id matches profile being edited (authorization check)
4. Validate request body fields against allowed updates
5. Ensure read-only fields not modified (email, oauth_id per D-099)
6. Update artist record in D1
7. Recalculate profile_completion_percentage
8. Return updated profile JSON

## Notes & Comments
**References:**
- docs/initial-spec/eng-spec.md - Screen 6 (Profile Edit)
- docs/initial-spec/eng-spec.md - D-022 (Separate /profile/edit route)
- docs/initial-spec/eng-spec.md - D-099 (Email/credentials read-only)
- api/models/artist.ts

**Priority:** P0 - Required for profile editing
**File:** api/controllers/profile/index.ts
**Can Run Parallel With:** task-3.1, task-3.3, task-3.4, task-3.7

**DEPENDENCY NOTE:** Requires task-1.4 (Authentication Middleware) complete. Cannot implement authenticated endpoints without the requireAuth middleware.
