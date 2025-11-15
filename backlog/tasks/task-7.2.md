---
id: task-7.2
title: "Implement File Metadata CRUD Endpoints"
status: "To Do"
assignee: []
created_date: "2025-11-15"
labels: ["backend", "P2", "files"]
milestone: "M7 - File Management System"
dependencies: ["task-7.1"]
estimated_hours: 3
---

## Description
Implement endpoints for confirming uploads, listing files, organizing into folders, and deleting files.

## Acceptance Criteria
- [ ] POST /v1/files endpoint confirms upload and saves metadata
- [ ] GET /v1/files endpoint lists all files for artist
- [ ] Supports query params: folder_id, file_type (filter by category)
- [ ] POST /v1/files/folders endpoint creates new folder
- [ ] PUT /v1/files/:fileId/move endpoint moves file to folder
- [ ] DELETE /v1/files/:fileId endpoint deletes file
- [ ] File deletion removes from R2 and updates storage quota
- [ ] Proper error handling

## Implementation Plan
1. Create POST /v1/files route (confirm upload)
2. Apply requireAuth middleware
3. Parse request body: upload_id
4. Fetch upload metadata from KV: upload:{upload_id}
5. Verify file exists in R2 via HEAD request
6. If not found: return 404 "Upload not found"
7. Insert file metadata into files table (artist_id, filename, file_size, file_type, r2_key, folder_id)
8. Delete upload metadata from KV (cleanup)
9. Return 201 Created with file object
10. Create GET /v1/files route (list files)
11. Apply requireAuth
12. Parse query params: folder_id, file_type
13. Query files WHERE artist_id = ? AND folder_id = ? AND file_type = ?
14. Return files array with metadata
15. Create POST /v1/files/folders route
16. Insert folder into folders table (artist_id, folder_name, parent_folder_id)
17. Return folder object
18. Create PUT /v1/files/:fileId/move route
19. Update file folder_id in files table
20. Return success
21. Create DELETE /v1/files/:fileId route
22. Fetch file record from D1
23. Verify user owns file
24. Delete file from R2 using r2_key
25. Delete file metadata from D1
26. Return success

## Notes & Comments
**References:**
- docs/initial-spec/eng-spec.md - Screen 18 (My Files Tool)
- docs/initial-spec/eng-spec.md - D-026 (50GB quota)
- db/schema.sql - files, folders tables

**Priority:** P2 - File management feature
**File:** api/controllers/files/index.ts
**Dependencies:** Requires task-7.1 (signed URLs)
