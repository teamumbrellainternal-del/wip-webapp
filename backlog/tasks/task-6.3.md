---
id: task-6.3
title: "Implement Book Artist Pre-Filled Inquiry"
status: "To Do"
assignee: []
created_date: "2025-11-15"
labels: ["backend", "P1", "messaging", "booking"]
milestone: "M6 - In-App Messaging System"
dependencies: ["task-6.1", "task-6.2"]
estimated_hours: 2
---

## Description
Implement the "Book Artist" flow that opens a message composer with a pre-filled booking inquiry template (D-076).

## Acceptance Criteria
- [ ] POST /v1/messages/booking-inquiry endpoint creates conversation + pre-filled message
- [ ] Requires authentication
- [ ] Creates conversation between user and artist (if not exists)
- [ ] Pre-fills message with booking inquiry template
- [ ] Template includes: artist name, requesting user name, booking details prompt
- [ ] Returns conversation_id and message_id for frontend to open composer
- [ ] Proper error handling

## Implementation Plan
1. Create POST /v1/messages/booking-inquiry route in api/controllers/messages/index.ts
2. Apply requireAuth middleware
3. Parse request body: artist_id
4. Fetch artist details (name) from artists table
5. Fetch requesting user details from users table
6. Check for existing conversation between user and artist
7. If no conversation: create new conversation
8. Generate pre-filled message template:
   - "Hi [Artist Name], I'd like to discuss booking you for [event/venue]. Here are the details…"
9. Insert message into messages table with sender = requesting user
10. Return JSON with conversation_id, message_id, and pre-filled_content
11. Frontend uses this to open message composer with content pre-filled

## Notes & Comments
**References:**
- docs/initial-spec/eng-spec.md - D-076 (Book artist opens message composer with pre-filled inquiry)
- docs/initial-spec/eng-spec.md - Screen 13 (Artist profile "Book Artist" button)

**Priority:** P1 - Important booking flow
**File:** api/controllers/messages/index.ts
**Dependencies:** Requires task-6.1 (conversations) and task-6.2 (messages)
