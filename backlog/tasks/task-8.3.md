---
id: task-8.3
title: "Implement Journal (Creative Studio) Endpoints"
status: "To Do"
assignee: []
created_date: "2025-11-15"
labels: ["backend", "P2", "journal"]
milestone: "M8 - Broadcast & Journal Tools"
dependencies: ["task-1.4"]
estimated_hours: 4
---

## Description
Implement CRUD endpoints for journal entries in the Creative Studio tool, supporting block-based content storage.

## Acceptance Criteria
- [ ] GET /v1/journal endpoint lists all journal entries for artist
- [ ] Requires authentication
- [ ] Supports query param: entry_type (song_idea/set_plan/general_note)
- [ ] GET /v1/journal/:entryId endpoint fetches single entry
- [ ] POST /v1/journal endpoint creates new entry
- [ ] Accepts: entry_type, title (optional), blocks (JSON array)
- [ ] PUT /v1/journal/:entryId endpoint updates entry
- [ ] DELETE /v1/journal/:entryId endpoint deletes entry
- [ ] Blocks stored as JSON with type, content, order
- [ ] Auto-save timestamps tracked
- [ ] Proper error handling

## Implementation Plan
1. Create GET /v1/journal route in api/controllers/journal/index.ts
2. Apply requireAuth middleware
3. Parse query param: entry_type (optional filter)
4. Query journal_entries WHERE artist_id = ? AND entry_type = ?
5. Order by updated_at DESC
6. Return entries array (exclude full blocks in list view, show summary only)
7. Create GET /v1/journal/:entryId route
8. Apply requireAuth
9. Validate user owns entry
10. Fetch entry with full blocks JSON
11. Return entry object
12. Create POST /v1/journal route
13. Parse request body: entry_type, title, blocks[]
14. Validate blocks array structure (each block has type, content, order)
15. Insert entry into journal_entries table with blocks as JSON
16. Return 201 Created with entry object
17. Create PUT /v1/journal/:entryId route
18. Validate user owns entry
19. Update entry fields (title, blocks, auto_saved_at)
20. Return updated entry
21. Create DELETE /v1/journal/:entryId route
22. Validate user owns entry
23. Delete entry from journal_entries table
24. Return success

## Notes & Comments
**References:**
- docs/initial-spec/eng-spec.md - Screen 19-20 (Creative Studio Tool)
- docs/initial-spec/eng-spec.md - D-028 (Manual upload only for media blocks)
- db/schema.sql - journal_entries table

**Priority:** P2 - Creative tool
**File:** api/controllers/journal/index.ts
**Can Run Parallel With:** task-8.1, task-8.2

**DEPENDENCY NOTE:** Requires task-1.4 (Authentication Middleware) complete. Cannot implement authenticated endpoints without the requireAuth middleware.
