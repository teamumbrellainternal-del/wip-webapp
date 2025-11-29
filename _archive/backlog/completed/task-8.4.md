---
id: task-8.4
title: "Build Message Fans Page with AI Draft"
status: "Done"
assignee: []
created_date: "2025-11-15"
labels: ["frontend", "P2", "broadcast"]
milestone: "M8 - Broadcast & Journal Tools"
dependencies: ["task-8.1", "task-8.2"]
estimated_hours: 5
completed_date: "2025-11-17"
---

## Description
Create the Message Fans tool page with contact list selection, message composer, AI draft button (D-046), and send options.

## Acceptance Criteria
- [x] src/pages/MessageFansPage.tsx component created
- [x] Left sidebar with contact lists (search, multi-select)
- [x] Recipient count updates dynamically based on selections
- [x] "Ask Violet to Draft" button (D-046: real AI via Claude API)
- [x] Subject line input
- [x] Message body textarea (text-only, D-049)
- [x] Character/word counter
- [x] "Save Draft", "Schedule Send", "Send Now" buttons
- [x] Datetime picker modal for scheduling
- [x] Confirmation modal before sending
- [x] Responsive layout (mobile + desktop)

## Implementation Plan
1. Create MessageFansPage.tsx in src/pages/
2. Fetch contact lists via GET /v1/contacts/lists
3. Implement left sidebar:
   - Search bar for filtering lists
   - List cards with checkboxes
   - Show contact count per list
4. Calculate total recipient count:
   - Sum selected list counts
   - Update dynamically on selection change
5. Implement "Ask Violet to Draft" button:
   - Call POST /v1/violet/prompt with context='draft_message'
   - Pre-fill subject and body with AI response
   - Show loading state during generation
   - Count toward 50 prompts/day (D-062)
6. Add subject line input field
7. Add message body textarea:
   - Text-only (D-049: no rich text editor)
   - Show character counter
   - No attachment support in MVP
8. Implement "Save Draft" button:
   - Save to local storage or backend drafts table
   - Show success toast
9. Implement "Schedule Send" button:
   - Open datetime picker modal
   - Validate future date
   - Save scheduled message
10. Implement "Send Now" button:
    - Show confirmation modal with recipient count
    - Call POST /v1/broadcast on confirm
    - Show success message with delivery status
11. Add loading states and error handling

## Notes & Comments
**References:**
- docs/initial-spec/eng-spec.md - Screen 16-17 (Message Fans Tool)
- docs/initial-spec/eng-spec.md - D-046 (AI draft via Claude API)
- docs/initial-spec/eng-spec.md - D-049 (Text-only broadcasts)
- docs/initial-spec/eng-spec.md - D-062 (50 prompts/day)
- src/components/ui/* - UI components

**Priority:** P2 - Fan communication UX
**File:** src/pages/MessageFansPage.tsx
**Dependencies:** Requires task-8.1 (broadcast endpoint) and task-8.2 (contact lists)

**EXTERNAL SERVICE INTEGRATION:** Initial development can use mocked Claude API responses for "Ask Violet to Draft" feature. Real AI integration requires task-10.7 (External Service Config) complete for production use.
