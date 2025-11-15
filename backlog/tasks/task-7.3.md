---
id: task-7.3
title: "Build File Manager Page"
status: "To Do"
assignee: []
created_date: "2025-11-15"
labels: ["frontend", "P2", "files"]
milestone: "M7 - File Management System"
dependencies: ["task-7.2"]
estimated_hours: 5
---

## Description
Create the file manager page with upload zone, file categories, grid/list view, folder organization, and storage quota display.

## Acceptance Criteria
- [ ] src/pages/FilesPage.tsx component created
- [ ] Storage quota display with progress bar (X GB / 50GB used)
- [ ] Upload zone with drag-drop and click-to-upload
- [ ] Left sidebar with file categories (All Files, Press Photos, Music & Audio, Videos, Documents)
- [ ] Category counts displayed
- [ ] "➕ New Folder" button
- [ ] Search bar for filtering files by name
- [ ] Grid/list view toggle
- [ ] File cards with thumbnails, names, sizes, dates
- [ ] Context menu for file actions (rename, move, delete, download)
- [ ] Responsive layout (mobile + desktop)

## Implementation Plan
1. Create FilesPage.tsx in src/pages/
2. Fetch storage quota via GET /v1/analytics (or dedicated endpoint)
3. Display quota progress bar at top
4. Implement upload zone:
   - Drag-drop event handlers
   - Click to open file picker
   - Call POST /v1/files/upload → get signed URL
   - Upload file to R2 directly
   - Call POST /v1/files to confirm
   - Refresh file list
5. Fetch files via GET /v1/files
6. Implement left sidebar categories:
   - Count files by type (image, audio, video, document)
   - Filter files on category click
7. Add "➕ New Folder" button → calls POST /v1/files/folders
8. Implement search bar with debounced filtering
9. Create file cards:
   - Grid view: thumbnail + name + size
   - List view: row with icon + name + size + date
10. Add grid/list view toggle
11. Implement context menu (right-click or kebab menu):
    - Rename: inline edit
    - Move: folder picker modal → PUT /v1/files/:id/move
    - Delete: confirmation modal → DELETE /v1/files/:id
    - Download: generate download URL from R2
12. Add loading states and error handling

## Notes & Comments
**References:**
- docs/initial-spec/eng-spec.md - Screen 18 (My Files Tool)
- docs/initial-spec/eng-spec.md - D-026 (50GB quota)
- docs/initial-spec/eng-spec.md - D-028 (Manual upload only)
- src/components/ui/* - UI components

**Priority:** P2 - File management UX
**File:** src/pages/FilesPage.tsx
**Dependencies:** Requires task-7.2 (file endpoints)
