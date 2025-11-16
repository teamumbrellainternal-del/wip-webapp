---
id: task-3.5
title: "Build Profile View Page with 6-Tab System"
status: "Done"
assignee: []
created_date: "2025-11-15"
completed_date: "2025-11-16"
labels: ["frontend", "P0", "profile"]
milestone: "M3 - Profile Management"
dependencies: ["task-3.1", "task-3.4"]
estimated_hours: 6
---

## Description
Create the artist profile page with 6-tab navigation system: Overview, Portfolio, Explore, Journey, Reviews, Opportunities. Supports both public view and own profile view.

## Acceptance Criteria
- [x] src/pages/ProfilePage.tsx component created
- [x] Hero section with avatar, name, verification badge, location, metrics
- [x] Social links display (website, Facebook, Instagram, TikTok, tip jar)
- [x] Profile actions menu (D-023: Edit if own, Share/Report if other's)
- [x] Follow/unfollow button
- [x] Book artist button (D-076: opens message composer with pre-filled inquiry)
- [x] 6 tabs: Overview, Portfolio, Explore, Journey, Reviews, Opportunities
- [x] Tab content rendered based on active tab
- [x] Inline audio player for tracks (D-024)
- [x] Responsive layout (mobile + desktop)

## Implementation Plan
1. Create ProfilePage.tsx in src/pages/
2. Fetch profile data via GET /v1/profile/:artistId
3. Implement hero section with profile photo, name, badges, metrics
4. Add social links display with icons
5. Implement tab navigation with active state
6. Create tab content components:
   - OverviewTab: bio, portfolio preview, endorsements
   - PortfolioTab: all tracks with inline player (D-024)
   - ExploreTab: media gallery grid
   - JourneyTab: timeline with events
   - ReviewsTab: review cards list
   - OpportunitiesTab: latest 3 gigs (D-011)
7. Add profile actions menu (D-023: Edit if own, Share/Report if other's)
8. Wire up Follow and Book Artist buttons
9. Implement inline audio player for tracks (D-024)
10. Add loading states and error handling

## Notes & Comments
**References:**
- docs/initial-spec/eng-spec.md - Screen 13-14 (6-tab profile)
- docs/initial-spec/eng-spec.md - D-023 (Profile actions menu)
- docs/initial-spec/eng-spec.md - D-024 (Inline track playback)
- docs/initial-spec/eng-spec.md - D-076 (Book artist → message composer)
- src/components/ui/* - UI components

**Priority:** P0 - Core user experience
**File:** src/pages/ProfilePage.tsx
**Can Run Parallel With:** task-3.6
