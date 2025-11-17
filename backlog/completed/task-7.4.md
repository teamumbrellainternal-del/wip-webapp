---
id: task-7.4
title: "Implement Storage Quota Tracking System"
status: "Done"
assignee: []
created_date: "2025-11-15"
completed_date: "2025-11-17"
labels: ["backend", "P2", "files", "storage"]
milestone: "M7 - File Management System"
dependencies: ["task-7.2"]
estimated_hours: 2
---

## Description
Implement the system that tracks storage quota usage per artist and enforces the 50GB limit (D-026).

## Acceptance Criteria
- [x] GET /v1/files/quota endpoint returns current usage and limit
- [x] Requires authentication
- [x] Calculates total storage used: SUM(file_size) from files table
- [x] Returns: storage_used (bytes), storage_limit (50GB in bytes), percentage_used
- [x] Upload endpoints check quota before allowing uploads
- [x] File deletion updates quota (decrements usage)
- [x] Proper error handling

## Implementation Plan
1. Create GET /v1/files/quota route in api/controllers/files/quota.ts
2. Apply requireAuth middleware
3. Query D1: SELECT SUM(file_size) AS total_used FROM files WHERE artist_id = ?
4. Define storage_limit = 50 * 1024 * 1024 * 1024 (50GB in bytes)
5. Calculate percentage_used = (total_used / storage_limit) * 100
6. Return JSON with storage_used, storage_limit, percentage_used
7. Update task-7.1 (upload endpoint) to call quota check before generating URL
8. Update task-7.2 (file confirm) to verify quota after upload
9. Update task-7.2 (file delete) to recalculate quota after deletion
10. Add quota warnings:
    - When usage > 80%: show warning in UI
    - When usage > 95%: show critical warning
    - When usage = 100%: block uploads

## Notes & Comments
**References:**
- docs/initial-spec/eng-spec.md - D-026 (50GB quota per artist)
- docs/initial-spec/architecture.md - Storage quota enforcement
- db/schema.sql - files table

**Priority:** P2 - Quota enforcement
**File:** api/controllers/files/quota.ts
**Dependencies:** Requires task-7.2 (file metadata management)
