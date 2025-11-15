---
id: task-8.5
title: "Build Creative Studio (Journal) Page"
status: "To Do"
assignee: []
created_date: "2025-11-15"
labels: ["frontend", "P2", "journal"]
milestone: "M8 - Broadcast & Journal Tools"
dependencies: ["task-8.3"]
estimated_hours: 6
---

## Description
Create the Creative Studio page with unified entry editor, 3 tabs (Song Ideas, Set Planning, General Notes), block-based content editor, and auto-save.

## Acceptance Criteria
- [ ] src/pages/CreativeStudioPage.tsx component created
- [ ] Unified entry editor with 3 tabs
- [ ] Toolbar with block type buttons (Text, Image, Audio/Video, Checklist)
- [ ] Block-based content editor (add, reorder, delete blocks)
- [ ] Text block with textarea
- [ ] Image block with upload (D-028: manual only)
- [ ] Audio/Video block with upload or embed URL (D-028: manual only)
- [ ] Checklist block with add/remove/check tasks
- [ ] Auto-save every 30 seconds
- [ ] "Auto-saved" indicator with timestamp
- [ ] Block counter in footer
- [ ] "Save Entry" button
- [ ] Responsive layout (mobile + desktop)

## Implementation Plan
1. Create CreativeStudioPage.tsx in src/pages/
2. Fetch journal entries via GET /v1/journal
3. Implement tab navigation (Song Ideas, Set Planning, General Notes)
4. Create toolbar with 4 block type buttons
5. Implement block editor:
   - Maintain blocks array in component state
   - Render blocks dynamically based on type
6. Create block components:
   - TextBlock: textarea with rich text support
   - ImageBlock: upload button → POST /v1/files/upload → R2 upload → display
   - AudioVideoBlock: upload button OR embed URL input
   - ChecklistBlock: task input + add button, checkboxes for each task
7. Implement block actions:
   - Add block: append to blocks array
   - Reorder blocks: drag handles (react-beautiful-dnd or similar)
   - Delete block: remove from blocks array
8. Implement auto-save:
   - useEffect with 30-second interval
   - Call PUT /v1/journal/:entryId with current blocks
   - Update "Auto-saved" indicator with timestamp
9. Add block counter in footer: "X blocks"
10. Implement "Save Entry" button:
    - Call PUT /v1/journal/:entryId
    - Show success toast
    - Clear unsaved changes flag
11. Add loading states and error handling

## Notes & Comments
**References:**
- docs/initial-spec/eng-spec.md - Screen 19-20 (Creative Studio Tool)
- docs/initial-spec/eng-spec.md - D-028 (Manual upload only)
- db/schema.sql - journal_entries table
- src/components/ui/* - UI components

**Priority:** P2 - Creative tool UX
**File:** src/pages/CreativeStudioPage.tsx
**Dependencies:** Requires task-8.3 (journal endpoints)
