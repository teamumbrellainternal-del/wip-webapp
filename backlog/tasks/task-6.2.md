---
id: task-6.2
title: "Implement Message Send/Receive Endpoints"
status: "To Do"
assignee: []
created_date: "2025-11-15"
labels: ["backend", "P1", "messaging"]
milestone: "M6 - In-App Messaging System"
dependencies: ["task-6.1"]
estimated_hours: 4
---

## Description
Implement endpoints for sending messages within conversations, fetching message threads, and marking conversations as read. 2000 character limit per message (D-043).

## Acceptance Criteria
- [ ] GET /v1/conversations/:convId/messages endpoint fetches message thread
- [ ] Requires authentication and participant validation
- [ ] Returns messages sorted by created_at ASC
- [ ] POST /v1/conversations/:convId/messages endpoint sends new message
- [ ] Validates message content length (D-043: 2000 char limit)
- [ ] Supports file attachments (URLs)
- [ ] Updates conversation updated_at timestamp
- [ ] POST /v1/conversations/:convId/read endpoint marks as read
- [ ] No rate limits (D-087)
- [ ] Proper error handling

## Implementation Plan
1. Create GET /v1/conversations/:convId/messages route
2. Apply requireAuth middleware
3. Validate user is participant in conversation
4. Fetch all messages for conversation from messages table
5. Order by created_at ASC (chronological)
6. Return messages array with sender info, content, attachments, timestamps
7. Create POST /v1/conversations/:convId/messages route
8. Apply requireAuth middleware
9. Validate user is participant
10. Validate message content (D-043: max 2000 chars)
11. Parse attachment URLs (if provided)
12. Insert message into messages table
13. Update conversation updated_at to NOW()
14. Send email notification to recipient via Resend
15. Return 201 Created with message object
16. Create POST /v1/conversations/:convId/read route
17. Update last_read_at for user in conversation_participants table
18. Return success

## Notes & Comments
**References:**
- docs/initial-spec/eng-spec.md - Screen 22 (Messages)
- docs/initial-spec/eng-spec.md - D-043 (2000 char limit)
- docs/initial-spec/eng-spec.md - D-087 (No rate limits)
- docs/initial-spec/architecture.md - Resend email notifications
- db/schema.sql - messages table

**Priority:** P1 - Core messaging feature
**File:** api/controllers/messages/messages.ts
**Dependencies:** Requires task-6.1 (conversations management)

**CRITICAL DEPENDENCY:** This task MUST wait for task-6.1 (Conversation Management) to complete. Messages cannot exist without conversations. Serial dependency enforced.
