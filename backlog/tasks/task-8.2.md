---
id: task-8.2
title: "Implement Contact List Management Endpoints"
status: "Done"
assignee: []
created_date: "2025-11-15"
completed_date: "2025-11-17"
labels: ["backend", "P2", "broadcast", "contacts"]
milestone: "M8 - Broadcast & Journal Tools"
dependencies: ["task-1.4"]
estimated_hours: 3
---

## Description
Implement endpoints for managing contact lists and individual contacts for the broadcast system.

## Acceptance Criteria
- [x] GET /v1/contacts/lists endpoint returns all contact lists for artist
- [x] Requires authentication
- [x] Returns lists with: list_id, list_name, contact_count, list_description
- [x] POST /v1/contacts/lists endpoint creates new list
- [x] GET /v1/contacts endpoint lists contacts (filter by list_id)
- [x] POST /v1/contacts endpoint adds single contact
- [x] POST /v1/contacts/import endpoint bulk imports contacts
- [x] PUT /v1/contacts/:contactId endpoint updates contact (opt-in status)
- [x] DELETE /v1/contacts/:contactId endpoint removes contact
- [x] Proper error handling

## Implementation Plan
1. Create GET /v1/contacts/lists route in api/controllers/contacts/lists.ts
2. Apply requireAuth middleware
3. Query contact_lists WHERE artist_id = ?
4. For each list, count contacts: SELECT COUNT(*) FROM contacts WHERE list_id = ?
5. Return array of list objects with counts
6. Create POST /v1/contacts/lists route
7. Insert new list into contact_lists table (artist_id, list_name, list_type)
8. Return list object
9. Create GET /v1/contacts route
10. Parse query param: list_id (optional)
11. Query contacts WHERE artist_id = ? AND list_id = ?
12. Return contacts array
13. Create POST /v1/contacts route (single contact)
14. Insert contact into contacts table (artist_id, list_id, email, phone, name, opted_in)
15. Return contact object
16. Create POST /v1/contacts/import route (bulk import)
17. Parse CSV or JSON array from request body
18. Validate email/phone formats
19. Bulk insert into contacts table
20. Return success with import_count
21. Create PUT /v1/contacts/:contactId route (update)
22. Update contact fields (opted_in status primary use case)
23. Return updated contact
24. Create DELETE /v1/contacts/:contactId route
25. Delete contact from contacts table
26. Return success

## Notes & Comments
**References:**
- docs/initial-spec/eng-spec.md - Screen 16-17 (Contact lists)
- docs/initial-spec/architecture.md - Contact list management
- db/schema.sql - contact_lists, contacts tables

**Priority:** P2 - Required for broadcast feature
**File:** api/controllers/contacts/index.ts
**Can Run Parallel With:** task-8.1, task-8.3

**DEPENDENCY NOTE:** Requires task-1.4 (Authentication Middleware) complete. Cannot implement authenticated endpoints without the requireAuth middleware.
