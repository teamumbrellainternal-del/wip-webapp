---
id: task-3.6
title: "Build Profile Edit Page"
status: "To Do"
assignee: []
created_date: "2025-11-15"
labels: ["frontend", "P0", "profile"]
milestone: "M3 - Profile Management"
dependencies: ["task-3.2", "task-3.3"]
estimated_hours: 5
---

## Description
Create the profile edit page as a separate route (D-022) allowing artists to update their profile information, rates, availability, and social links.

## Acceptance Criteria
- [ ] src/pages/ProfileEditPage.tsx component created
- [ ] Separate route: /profile/edit (D-022)
- [ ] Form sections: Basic info, Social links, Rates, Availability, Profile photo
- [ ] Pre-filled with current profile data
- [ ] Validates required fields before submission
- [ ] Calls PUT /v1/profile endpoint on save
- [ ] Avatar upload via signed URL (calls POST /v1/profile/avatar/upload)
- [ ] Shows profile completion percentage
- [ ] "Save Changes" button with optimistic UI update
- [ ] "Cancel" button returns to public profile view

## Implementation Plan
1. Create ProfileEditPage.tsx in src/pages/
2. Fetch current profile data via GET /v1/profile
3. Implement form sections with react-hook-form:
   - Basic info: artist_name, location, phone, bio
   - Social links: add/remove/update links
   - Rates: flat_rate, hourly_rate
   - Availability: date picker for up to 3 dates
4. Add avatar upload flow:
   - Click to select file
   - Call POST /v1/profile/avatar/upload
   - Upload to R2 signed URL
   - Call POST /v1/profile/avatar/confirm
5. Implement validation rules
6. Wire up "Save Changes" → PUT /v1/profile
7. Add optimistic UI updates
8. Implement "Cancel" → navigate back to /profile/view
9. Add loading/error states

## Notes & Comments
**References:**
- docs/initial-spec/eng-spec.md - Screen 6 (Profile Edit)
- docs/initial-spec/eng-spec.md - D-022 (Separate /profile/edit route)
- docs/initial-spec/eng-spec.md - D-099 (Email/credentials read-only)
- src/components/ui/input.tsx, select.tsx

**Priority:** P0 - Required for profile management
**File:** src/pages/ProfileEditPage.tsx
**Can Run Parallel With:** task-3.5
