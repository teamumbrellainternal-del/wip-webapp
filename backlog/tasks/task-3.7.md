---
id: task-3.7
title: "Implement Review System Endpoints"
status: "To Do"
assignee: []
created_date: "2025-11-15"
labels: ["backend", "P0", "profile", "reviews"]
milestone: "M3 - Profile Management"
dependencies: ["task-1.4"]
estimated_hours: 4
---

## Description
Implement endpoints for the review system: fetching reviews, inviting reviewers via email, and submitting reviews. No moderation in MVP (D-034).

## Acceptance Criteria
- [ ] GET /v1/profile/:artistId/reviews endpoint lists all reviews
- [ ] POST /v1/profile/reviews/invite endpoint sends email invitation
- [ ] POST /v1/reviews endpoint submits a new review
- [ ] Requires authentication for invite and submit
- [ ] Email invitation includes review link with token
- [ ] Anyone with token can leave review (D-032)
- [ ] No moderation system (D-034: reviews appear immediately)
- [ ] Reviews display reviewer name, rating, text, date
- [ ] Calculates average rating for artist

## Implementation Plan
1. Create GET /v1/profile/:artistId/reviews route
2. Fetch all reviews for artist from D1
3. Return array of review objects with reviewer info
4. Create POST /v1/profile/reviews/invite route
5. Apply requireAuth middleware
6. Generate unique review token (UUID)
7. Send email via Resend with review link (D-032)
8. Store invitation in review_invitations table
9. Create POST /v1/reviews route (public, requires token)
10. Validate review token exists and not expired
11. Insert review into reviews table (D-034: no moderation)
12. Update artist rating_avg in artists table
13. Mark token as used
14. Return success confirmation

## Notes & Comments
**References:**
- docs/initial-spec/eng-spec.md - D-032 (Email invitations to anyone)
- docs/initial-spec/eng-spec.md - D-034 (No moderation in MVP)
- docs/initial-spec/architecture.md - Resend email integration
- db/schema.sql - reviews, review_invitations tables

**Priority:** P0 - Important for artist credibility
**File:** api/controllers/profile/reviews.ts
**Can Run Parallel With:** task-3.1, task-3.2, task-3.3, task-3.4
