---
id: task-9.4
title: "Build Violet Toolkit Page with Intent Picker"
status: "To Do"
assignee: []
created_date: "2025-11-15"
labels: ["frontend", "P2", "violet"]
milestone: "M9 - Violet AI Integration"
dependencies: ["task-9.1"]
estimated_hours: 5
---

## Description
Create the Violet Toolkit page with 10 categories, 30+ sub-tools, hero section, and intent picker modal (D-058).

## Acceptance Criteria
- [ ] src/pages/VioletPage.tsx component created
- [ ] Hero section with "Meet Violet" heading and feature grid
- [ ] "Start Creating Together" button (D-058: opens intent picker modal)
- [ ] "Explore My Toolkit" button (scrolls to categories)
- [ ] Left sidebar with 10 toolkit categories
- [ ] Categories expand/collapse on click
- [ ] Sub-tools listed under each category
- [ ] "Popular" badges on high-usage categories
- [ ] Intent picker modal with 6 intent options
- [ ] Free-form question input in modal
- [ ] Usage counter: "X/50 prompts used today"
- [ ] Responsive layout (mobile + desktop)

## Implementation Plan
1. Create VioletPage.tsx in src/pages/
2. Fetch usage stats via GET /v1/violet/usage
3. Display usage counter at top: "23/50 prompts used today"
4. Implement hero section:
   - Heading: "Meet Violet — Your AI Copilot"
   - Feature grid: 6 quick action icons
   - "Start Creating Together" button → opens intent picker modal
   - "Explore My Toolkit" button → scrolls to categories
5. Implement left sidebar with categories:
   - 10 categories (Gigs & Bookings, Creative Growth, Songwriting, etc.)
   - Click category → expand/collapse sub-tools
   - "Popular" badges on high-usage categories
   - Click sub-tool → navigate to specific feature page
6. Create intent picker modal component:
   - 6 intent category buttons (Find gig, Finish track, Grow fanbase, Connect with artists, Plan content, Get advice)
   - Free-form text input: "Describe what you need help with..."
   - "Ask Violet" button
7. Wire up intent picker:
   - Category button click → navigate to relevant toolkit section
   - Free-form question submit → call POST /v1/violet/prompt → display response
   - Count toward 50/day limit (D-062)
8. Add "See Violet in Action" section with sample conversations
9. Add loading states and error handling

## Notes & Comments
**References:**
- docs/initial-spec/eng-spec.md - Screen 21 (Violet's Toolkit)
- docs/initial-spec/eng-spec.md - D-058 (Intent picker modal)
- docs/initial-spec/eng-spec.md - D-062 (50 prompts/day limit)
- src/components/ui/* - UI components

**Priority:** P2 - Violet navigation UX
**File:** src/pages/VioletPage.tsx
**Dependencies:** Requires task-9.1 (prompt endpoint)
