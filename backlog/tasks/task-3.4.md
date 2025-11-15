---
id: task-3.4
title: "Implement Track Upload & Management Endpoints"
status: "To Do"
assignee: []
created_date: "2025-11-15"
labels: ["backend", "P0", "profile", "storage"]
milestone: "M3 - Profile Management"
dependencies: ["task-1.4"]
estimated_hours: 4
---

## Description
Implement endpoints for uploading tracks (audio files) to artist profiles, including signed URL generation, metadata management, and track deletion. No upload limit enforced (D-026).

## Acceptance Criteria
- [ ] POST /v1/profile/tracks/upload endpoint generates signed R2 URL
- [ ] Requires authentication
- [ ] Returns signed URL for direct R2 upload (15 min expiry, 50MB max)
- [ ] POST /v1/profile/tracks endpoint saves track metadata after upload
- [ ] GET /v1/profile/:artistId/tracks endpoint lists all tracks
- [ ] DELETE /v1/profile/tracks/:trackId endpoint removes track
- [ ] No upload limit enforced (D-026: constrained by 50GB storage only)
- [ ] Validates audio file types (mp3, wav, flac)
- [ ] Updates storage quota tracking

## Implementation Plan
1. Create POST /v1/profile/tracks/upload route
2. Generate R2 signed URL for tracks/{artist_id}/{track_id}.{ext}
3. Return signed URL with metadata placeholder
4. Create POST /v1/profile/tracks route (confirm upload)
5. Verify file in R2, get file size
6. Check 50GB storage quota (D-026)
7. Insert track metadata into tracks table (title, type, duration, file_size, r2_key)
8. Create GET /v1/profile/:artistId/tracks route
9. Return array of all tracks for artist
10. Create DELETE /v1/profile/tracks/:trackId route
11. Remove track metadata from D1
12. Delete file from R2
13. Update storage quota

## Notes & Comments
**References:**
- docs/initial-spec/eng-spec.md - D-024 (Inline track playback)
- docs/initial-spec/eng-spec.md - D-026 (No upload limit, 50GB quota)
- docs/initial-spec/architecture.md - R2 storage strategy
- db/schema.sql - tracks table

**Priority:** P0 - Core profile feature
**File:** api/controllers/profile/tracks.ts
**Can Run Parallel With:** task-3.1, task-3.2, task-3.3, task-3.7

**DEPENDENCY NOTE:** Requires task-1.4 (Authentication Middleware) complete. Cannot implement authenticated endpoints without the requireAuth middleware.
