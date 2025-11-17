---
id: task-10.1
title: "Create Integration Test Suite"
status: "To Do"
assignee: []
created_date: "2025-11-15"
labels: ["testing", "P0", "integration"]
milestone: "M10 - Testing, Bug Fixes & Deployment"
dependencies: []
estimated_hours: 6
---

## Description
Create integration tests for critical user flows: signup/onboarding, profile creation, marketplace browsing, messaging, and booking.

## Acceptance Criteria
- [ ] Test suite created using Vitest or similar framework
- [ ] Tests cover critical path: OAuth → Onboarding → Dashboard
- [ ] Tests for profile creation and editing
- [ ] Tests for marketplace browsing (gigs + artists)
- [ ] Tests for messaging flow (create conversation, send message)
- [ ] Tests for booking flow (apply to gig, book artist)
- [ ] Tests for file upload and storage quota
- [ ] Tests for Violet AI prompt (with mocked Claude API)
- [ ] All tests pass successfully
- [ ] Test coverage report generated

## Implementation Plan
1. Set up test environment in tests/integration/
2. Configure test database (separate D1 instance or SQLite file)
3. Create test fixtures (sample users, artists, gigs)
4. Write signup/onboarding flow test:
   - Mock Cloudflare Access OAuth
   - POST /v1/auth/callback
   - POST /v1/onboarding/artists/step1-5
   - Verify onboarding_complete = true
   - Verify redirect to /dashboard
5. Write profile tests:
   - GET /v1/profile
   - PUT /v1/profile
   - POST /v1/profile/tracks
   - Verify updates persist
6. Write marketplace tests:
   - GET /v1/gigs with filters
   - GET /v1/artists with filters
   - POST /v1/gigs/:id/apply
   - Verify application created
7. Write messaging tests:
   - POST /v1/conversations
   - POST /v1/conversations/:id/messages
   - GET /v1/conversations/:id/messages
   - Verify messages delivered
8. Write file upload tests:
   - POST /v1/files/upload
   - Upload to R2 (mocked)
   - POST /v1/files (confirm)
   - Verify storage quota updated
9. Write Violet tests:
   - POST /v1/violet/prompt (mock Claude API)
   - Verify rate limit enforced
   - GET /v1/violet/usage
10. Run all tests and generate coverage report

## Notes & Comments
**References:**
- docs/initial-spec/eng-spec.md - All user flows
- tests/ directory structure

**Priority:** P0 - Quality assurance
**File:** tests/integration/*.test.ts
**Can Run Parallel With:** task-10.2, task-10.3
