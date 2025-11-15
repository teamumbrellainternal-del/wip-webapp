---
id: task-5.6
title: "Build Marketplace Page with Infinite Scroll"
status: "To Do"
assignee: []
created_date: "2025-11-15"
labels: ["frontend", "P1", "marketplace"]
milestone: "M5 - Marketplace Discovery System"
dependencies: ["task-5.1", "task-5.4"]
estimated_hours: 6
---

## Description
Create the marketplace page with two tabs (Find Gigs, Discover Artists), search, filters, infinite scroll, and detail sidebar.

## Acceptance Criteria
- [ ] src/pages/MarketplacePage.tsx component created
- [ ] Two tabs: "Find Gigs" and "Discover Artists"
- [ ] Search bar for keyword search (D-071: Artists + Gigs)
- [ ] Filter chips (genre, location, date, price for gigs; genre, location, verified for artists)
- [ ] "Filters" button opens advanced filter modal
- [ ] Gig/artist listing cards in scrollable grid
- [ ] Infinite scroll loading (D-017: no pagination controls)
- [ ] Right sidebar for detail view on card click
- [ ] Favorite/heart icon on cards
- [ ] Apply button on gig cards (D-077: single-click)
- [ ] Responsive layout (mobile + desktop)
- [ ] **✓ CHECKPOINT:** Test marketplace browse→filter→apply flow before proceeding to M6

## Implementation Plan
1. Create MarketplacePage.tsx in src/pages/
2. Implement tab navigation (Find Gigs / Discover Artists)
3. Add search bar component with debounced input
4. Implement filter chips with active state
5. Create advanced filters modal (opens on "Filters" button)
6. For Find Gigs tab:
   - Fetch gigs via GET /v1/gigs with filters/pagination
   - Render GigCard components in grid
   - Show urgency badges (D-010)
   - Add "Apply" button (D-077: calls POST /v1/gigs/:id/apply)
7. For Discover Artists tab:
   - Fetch artists via GET /v1/artists with filters/pagination
   - Render ArtistCard components in grid
   - Show verification badges
8. Implement infinite scroll:
   - Detect scroll to bottom
   - Load next page (increment offset)
   - Append results to existing list
   - Show loading indicator at bottom
9. Implement right sidebar detail view:
   - Click card → fetch details → populate sidebar
   - Show full gig/artist details
   - Add close button
10. Add loading states and error handling

## Notes & Comments
**References:**
- docs/initial-spec/eng-spec.md - Screen 11-12 (Marketplace)
- docs/initial-spec/eng-spec.md - D-014 (Random shuffle)
- docs/initial-spec/eng-spec.md - D-017 (Infinite scroll)
- docs/initial-spec/eng-spec.md - D-071 (Search scope)
- docs/initial-spec/eng-spec.md - D-077 (Single-click apply)
- src/components/ui/* - UI components

**Priority:** P1 - Core discovery feature
**File:** src/pages/MarketplacePage.tsx
**Can Run Parallel With:** None (depends on task-5.1 and task-5.4)
