---
id: task-6.4
title: "Build Messages Page with Thread View"
status: "To Do"
assignee: []
created_date: "2025-11-15"
labels: ["frontend", "P1", "messaging"]
milestone: "M6 - In-App Messaging System"
dependencies: ["task-6.2"]
estimated_hours: 6
---

## Description
Create the messages page with conversation list sidebar, message thread view, quick conversation starters, and message input with sharing buttons.

## Acceptance Criteria
- [ ] src/pages/MessagesPage.tsx component created
- [ ] Left sidebar with conversation list
- [ ] Conversation cards show: participant, context badge, preview, unread indicator, timestamp
- [ ] Main panel shows selected conversation thread
- [ ] Messages display with sender alignment (left/right)
- [ ] Quick conversation starter pills above input
- [ ] Message input with 2000 char limit (D-043)
- [ ] Attachment icon (paperclip)
- [ ] Quick share buttons: Share Track, Share Portfolio, Share Gig Flyer
- [ ] Send button
- [ ] Polling for new messages (5-second interval)
- [ ] Responsive layout (mobile + desktop)

## Implementation Plan
1. Create MessagesPage.tsx in src/pages/
2. Fetch conversations via GET /v1/conversations
3. Implement left sidebar:
   - Render conversation cards
   - Show context badges (Artist/Venue/Producer/Band)
   - Display unread count badges
   - Highlight selected conversation
4. Implement main panel:
   - Fetch messages via GET /v1/conversations/:convId/messages on conversation select
   - Render message thread with sender alignment
   - Show sender avatar, name, timestamp
5. Add quick conversation starters:
   - Pill buttons above input
   - Click pill → populate input with starter text
6. Implement message input:
   - Textarea with 2000 char limit (D-043)
   - Show character counter
   - Enter key sends message
7. Add attachment picker (paperclip icon)
8. Add quick share buttons:
   - Share Track: opens track picker modal → inserts link
   - Share Portfolio: generates portfolio link → inserts
   - Share Gig Flyer: opens gig picker → generates flyer → inserts
9. Wire up send button → POST /v1/conversations/:convId/messages
10. Implement polling:
    - Poll GET /v1/conversations every 5 seconds
    - Update conversation list with new messages
    - If conversation selected, poll GET /v1/conversations/:convId/messages
11. Add loading states and error handling

## Notes & Comments
**References:**
- docs/initial-spec/eng-spec.md - Screen 22 (Messages & Collaboration)
- docs/initial-spec/eng-spec.md - D-043 (2000 char limit)
- docs/initial-spec/eng-spec.md - D-087 (No rate limits)
- docs/initial-spec/architecture.md - Polling-based messaging
- src/components/ui/* - UI components

**Priority:** P1 - Core messaging UX
**File:** src/pages/MessagesPage.tsx
**Dependencies:** Requires task-6.2 (message endpoints)
