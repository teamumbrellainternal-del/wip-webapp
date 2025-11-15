---
id: task-5.3
title: "Implement Single-Click Gig Application"
status: "To Do"
assignee: []
created_date: "2025-11-15"
labels: ["backend", "P1", "marketplace", "booking"]
milestone: "M5 - Marketplace Discovery System"
dependencies: ["task-1.4"]
estimated_hours: 3
---

## Description
Implement the endpoint for applying to gigs with a single click. Automatically sends artist profile + rates to venue (D-077). Sends email + SMS confirmations (D-079).

## Acceptance Criteria
- [ ] POST /v1/gigs/:gigId/apply endpoint implemented
- [ ] Requires authentication
- [ ] Creates gig_application record with status "Applied"
- [ ] Fetches artist profile (name, bio, rates, portfolio)
- [ ] Sends email to venue with artist details (via Resend)
- [ ] Sends SMS to venue with artist details (via Twilio) (D-079)
- [ ] Sends confirmation email to artist (D-079)
- [ ] Sends confirmation SMS to artist (D-079)
- [ ] Returns success confirmation
- [ ] Prevents duplicate applications (409 if already applied)

## Implementation Plan
1. Create POST /v1/gigs/:gigId/apply route in api/controllers/marketplace/gigs.ts
2. Apply requireAuth middleware
3. Parse gigId from route params
4. Check if user already applied (query gig_applications)
5. If already applied: return 409 Conflict
6. Fetch artist profile from artists table
7. Fetch gig + venue details from gigs/venues tables
8. Create gig_application record (artist_id, gig_id, status='Applied', applied_at)
9. Send email to venue via Resend (D-079):
   - Subject: "New Application: [Artist Name]"
   - Body: Artist profile, rates, portfolio link
10. Send SMS to venue via Twilio (D-079):
    - Body: "New gig application from [Artist Name]. Check your email for details."
11. Send confirmation email to artist (D-079)
12. Send confirmation SMS to artist (D-079)
13. Return 201 Created with success message

## Notes & Comments
**References:**
- docs/initial-spec/eng-spec.md - D-077 (Single-click apply)
- docs/initial-spec/eng-spec.md - D-079 (Email + SMS confirmations)
- docs/initial-spec/architecture.md - Resend/Twilio integration
- db/schema.sql - gig_applications table

**Priority:** P1 - Core booking feature
**File:** api/controllers/marketplace/gigs.ts
**Can Run Parallel With:** task-5.1, task-5.2, task-5.4, task-5.5
