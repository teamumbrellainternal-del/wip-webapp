---
id: task-1.5
title: "Build Login Page Component"
status: "To Do"
assignee: []
created_date: "2025-11-15"
labels: ["frontend", "P0", "auth"]
milestone: "M1 - Authentication & Session Management"
dependencies: []
estimated_hours: 3
---

## Description
Create the login page with OAuth buttons for Apple and Google authentication via Cloudflare Access.

## Acceptance Criteria
- [ ] src/pages/LoginPage.tsx component created
- [ ] "Sign in with Apple" button that redirects to Cloudflare Access
- [ ] "Sign in with Google" button that redirects to Cloudflare Access
- [ ] Gradient background matching Umbrella brand
- [ ] Responsive layout (mobile + desktop)
- [ ] Loading state during OAuth redirect
- [ ] Error message display for failed authentication
- [ ] Auto-redirect to dashboard if already authenticated

## Implementation Plan
1. Create LoginPage component in src/pages/
2. Add shadcn/ui Button components for OAuth providers
3. Implement redirect to Cloudflare Access OAuth URLs
4. Add brand styling (gradient background, logo)
5. Implement useAuth hook to check existing session
6. Add error handling for OAuth failures
7. Test OAuth flow end-to-end

## Notes & Comments
**References:**
- docs/initial-spec/eng-spec.md - Screen 1-3 (Authentication)
- docs/initial-spec/eng-spec.md - D-001 (OAuth-only authentication)
- src/components/ui/button.tsx - UI component

**Priority:** P0 - Entry point for all users
**File:** src/pages/LoginPage.tsx
**Can Run Parallel With:** All backend auth tasks (1.1-1.4)
