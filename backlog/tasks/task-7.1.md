---
id: task-7.1
title: "Implement File Upload Signed URL Endpoint"
status: "To Do"
assignee: []
created_date: "2025-11-15"
labels: ["backend", "P2", "files", "storage"]
milestone: "M7 - File Management System"
dependencies: ["task-1.4"]
estimated_hours: 3
---

## Description
Implement the endpoint that generates R2 signed upload URLs for file uploads, with 50GB quota enforcement (D-026).

## Acceptance Criteria
- [ ] POST /v1/files/upload endpoint implemented
- [ ] Requires authentication
- [ ] Validates file type (image, audio, video, document)
- [ ] Checks storage quota before generating URL (50GB limit per artist)
- [ ] Generates signed R2 URL with 15-minute expiry
- [ ] URL constraints: max 50MB per file, specific content types
- [ ] Returns upload_id and signed_url
- [ ] Stores temporary metadata in KV (15 min TTL)
- [ ] Proper error handling (quota exceeded, invalid file type)

## Implementation Plan
1. Create POST /v1/files/upload route in api/controllers/files/index.ts
2. Apply requireAuth middleware
3. Parse request body: filename, content_type, file_size
4. Validate content_type against allowed types:
   - Images: image/jpeg, image/png, image/heic
   - Audio: audio/mpeg, audio/wav, audio/flac
   - Video: video/mp4, video/quicktime
   - Documents: application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document
5. **Pessimistic quota locking to prevent race conditions:**
   - Query D1 for current storage usage: SELECT SUM(file_size) FROM files WHERE artist_id = ?
   - Query KV for all reserved uploads: SCAN quota:reserved:{artist_id}:*
   - Calculate total_reserved = sum of all reserved file sizes
   - Check quota: current_usage + total_reserved + new_file_size <= 50GB (D-026)
   - If quota exceeded: return 400 Bad Request "Storage quota exceeded"
6. Generate upload_id (UUID)
7. **Reserve quota in KV:** SET quota:reserved:{artist_id}:{upload_id} = file_size (TTL: 15 minutes)
8. Generate R2 signed upload URL for files/{artist_id}/{upload_id}-{filename}
9. Set constraints: expiresIn=900 (15 min), maxSize=50MB, contentType
10. Store upload metadata in KV: upload:{upload_id} → {artist_id, filename, file_size, content_type, expires_at}
11. Return JSON with upload_id and signed_url
12. **Note:** Reserved quota auto-releases after 15 minutes if upload not confirmed (task-7.2)

## Notes & Comments
**References:**
- docs/initial-spec/eng-spec.md - Screen 18 (My Files Tool)
- docs/initial-spec/eng-spec.md - D-026 (No upload limit, 50GB quota)
- docs/initial-spec/architecture.md - R2 signed URL strategy
- db/schema.sql - files table

**Priority:** P2 - File management feature
**File:** api/controllers/files/index.ts
**Can Run Parallel With:** task-7.2

**EXTERNAL SERVICE INTEGRATION:** Initial development can use mocked R2 responses for testing. Real R2 integration requires task-10.7 (External Service Config) complete for production use.
