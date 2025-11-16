---
id: task-4.3
title: "Build Dashboard Page with Metrics"
status: "Done"
assignee: []
created_date: "2025-11-15"
labels: ["frontend", "P0", "dashboard"]
milestone: "M4 - Dashboard & Analytics Foundation"
dependencies: ["task-4.1"]
estimated_hours: 5
---

## Description
Create the main dashboard page showing welcome message, metrics cards, opportunities widget, messages widget, endorsements, and quick actions.

## Acceptance Criteria
- [x] src/pages/DashboardPage.tsx component created
- [x] Welcome section with artist name
- [x] 3 metrics cards: This Month (earnings + %), Gigs Booked, Profile Views
- [x] New Opportunities section showing latest 3 gigs (D-011)
- [x] Messages widget with 3 recent message previews
- [x] Recent Endorsements widget
- [x] Quick Actions widget (Find Gigs, Find Collaborators, View Analytics)
- [x] Violet prompt at bottom (D-058: opens intent picker modal)
- [x] All metrics updated from daily batch (D-008)
- [x] Responsive layout (mobile + desktop)
- [x] **✓ CHECKPOINT:** Test dashboard displays metrics correctly before proceeding to M5

## Implementation Plan
1. Create DashboardPage.tsx in src/pages/
2. Fetch analytics data via GET /v1/analytics?period=month
3. Implement welcome section with user name
4. Create metrics cards component:
   - This Month: earnings with % change
   - Gigs Booked: count with timeframe
   - Profile Views: count with % change
5. Fetch latest 3 gigs via GET /v1/gigs?limit=3&sort=newest (D-011)
6. Render New Opportunities section with gig cards
7. Fetch recent messages via GET /v1/conversations?limit=3
8. Render Messages widget with previews and unread badges
9. Fetch recent endorsements via GET /v1/profile/endorsements?limit=3
10. Render Recent Endorsements widget
11. Create Quick Actions widget with 3 action buttons
12. Add Violet prompt section (D-058: onClick opens intent picker modal)
13. Add loading states and error handling

## Notes & Comments
**References:**
- docs/initial-spec/eng-spec.md - Screen 10 (Dashboard)
- docs/initial-spec/eng-spec.md - D-008 (Daily batch metrics)
- docs/initial-spec/eng-spec.md - D-011 (Latest 3 gigs)
- docs/initial-spec/eng-spec.md - D-058 (Intent picker modal)
- src/components/ui/* - UI components

**Priority:** P0 - Main landing page
**File:** src/pages/DashboardPage.tsx
**Can Run Parallel With:** None (depends on task-4.1)
