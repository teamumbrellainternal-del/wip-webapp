---
id: task-6.1
title: "Implement Conversation Management Endpoints"
status: "To Do"
assignee: []
created_date: "2025-11-15"
labels: ["backend", "P1", "messaging"]
milestone: "M6 - In-App Messaging System"
dependencies: ["task-1.4"]
estimated_hours: 4
---

## Description
Implement endpoints for listing conversations, fetching conversation details, and creating new conversations for in-app messaging.

## Acceptance Criteria
- [ ] GET /v1/conversations endpoint lists all conversations for user
- [ ] Requires authentication
- [ ] Returns conversations with: participants, context type, last message preview, unread count, timestamp
- [ ] Sorted by updated_at DESC (most recent first)
- [ ] GET /v1/conversations/:convId endpoint fetches single conversation details
- [ ] Returns participant info and basic metadata
- [ ] POST /v1/conversations endpoint creates new conversation
- [ ] Validates participants exist
- [ ] Prevents duplicate conversations (same participants)
- [ ] Proper error handling

## Implementation Plan
1. Create GET /v1/conversations route in api/controllers/messages/conversations.ts
2. Apply requireAuth middleware
3. Query conversations table WHERE participant1_id = user_id OR participant2_id = user_id
4. Fetch last message preview for each conversation
5. Calculate unread_count for each conversation
6. Determine context_type (Artist/Venue/Producer/Band) based on participant types
7. Order by updated_at DESC
8. Return conversations array
9. Create GET /v1/conversations/:convId route
10. Validate user is participant
11. Fetch conversation details
12. Return conversation object
13. Create POST /v1/conversations route
14. Validate participants array (must have 2 participants)
15. Check for existing conversation between same participants
16. If exists: return existing conversation
17. If not: create new conversation record
18. Return new conversation object

## Notes & Comments
**References:**
- docs/initial-spec/eng-spec.md - Screen 22 (Messages & Collaboration)
- docs/initial-spec/eng-spec.md - D-087 (No rate limits)
- db/schema.sql - conversations table

**Priority:** P1 - Core messaging feature
**File:** api/controllers/messages/conversations.ts
**Can Run Parallel With:** None (other M6 tasks depend on this)
