---
id: task-3.3
title: "Implement Avatar Upload Endpoint"
status: "To Do"
assignee: []
created_date: "2025-11-15"
labels: ["backend", "P0", "profile", "storage"]
milestone: "M3 - Profile Management"
dependencies: ["task-1.4"]
estimated_hours: 3
---

## Description
Implement the endpoint for generating R2 signed URLs for avatar uploads and updating avatar metadata after successful upload.

## Acceptance Criteria
- [ ] POST /v1/profile/avatar/upload endpoint generates signed R2 URL
- [ ] Requires authentication
- [ ] Returns signed URL with 15-minute expiry
- [ ] POST /v1/profile/avatar/confirm endpoint saves avatar metadata
- [ ] Validates file is uploaded to R2 before confirming
- [ ] Updates artist record with new avatar_url
- [ ] Old avatar deleted from R2 (if exists)
- [ ] Proper error handling for upload failures

## Implementation Plan
1. Create POST /v1/profile/avatar/upload route
2. Apply requireAuth middleware
3. Generate R2 signed upload URL for profiles/{artist_id}/avatar.jpg
4. Set upload constraints (15 min expiry, 10MB max, image/jpeg|png|heic only)
5. Return signed URL to client
6. Create POST /v1/profile/avatar/confirm route
7. Verify file exists in R2 via HEAD request
8. Delete old avatar from R2 (if present)
9. Update artist record with new avatar_url
10. Return success with new avatar URL

## Notes & Comments
**References:**
- docs/initial-spec/architecture.md - R2 signed URL strategy
- docs/initial-spec/eng-spec.md - Avatar upload flow
- api/utils/r2.ts - R2 utilities

**Priority:** P0 - Required for profile photos
**File:** api/controllers/profile/index.ts
**Can Run Parallel With:** task-3.1, task-3.2, task-3.4, task-3.7
