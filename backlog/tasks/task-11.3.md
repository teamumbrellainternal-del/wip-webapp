---
id: task-11.3
title: "Error Pages & Session Handling"
status: "Done"
assignee: []
created_date: "2025-11-17"
labels: ["frontend", "P0", "ux"]
milestone: "M11 - Pre-Launch Readiness & Compliance"
dependencies: ["task-1.6"]
estimated_hours: 6
---

## Description
Create custom 404 and 500 error pages, implement offline state detection, and handle Clerk session timeout gracefully without losing user work.

## Acceptance Criteria
- [x] 404 page created with navigation options (Dashboard, Browse Gigs, Home)
- [x] 500 page created with refresh and contact support options
- [x] Invalid routes redirect to 404 page
- [x] Unhandled exceptions show 500 page
- [x] Error boundary wraps entire app
- [x] Session timeout modal shows when Clerk session expires
- [x] Session timeout modal requires re-login (cannot dismiss)
- [x] Unsaved form data preserved in localStorage before redirect
- [x] After re-login, attempt to restore user to previous location
- [x] Offline banner appears when browser loses connection
- [x] Offline banner shows: "You're offline. Some features may not work."
- [x] API calls fail gracefully when offline
- [x] Offline banner disappears when connection restored
- [x] All pages styled with brand kit, mobile responsive

## Implementation Plan

### Error Pages (2 hours)
1. Create NotFoundPage.tsx (404):
   - Heading: "Page Not Found"
   - Subheading: "The page you're looking for doesn't exist or has been moved."
   - 3 buttons: "Go to Dashboard", "Browse Gigs", "Back to Home"
   - Brand kit styling
2. Create ServerErrorPage.tsx (500):
   - Heading: "Something Went Wrong"
   - Subheading: "We're aware of the issue and working on a fix. Please try again in a few minutes."
   - 2 buttons: "Refresh Page", "Contact Support"
   - Brand kit styling
3. Add catch-all route: path="*" → NotFoundPage
4. Create ErrorBoundary.tsx component
5. Wrap App in ErrorBoundary
6. On error: log to Sentry (if configured), render ServerErrorPage
7. Test: Navigate to /invalid-route, trigger unhandled exception

### Session Timeout Handling (2 hours)
8. Create SessionTimeoutModal component:
   - Title: "Session Expired"
   - Message: "Your session has expired for security. Please log in again to continue."
   - "Log In" button → redirects to Clerk login
   - Cannot be dismissed (must log in)
9. Create session timeout interceptor in src/lib/api-client.ts
10. Detect 401 status from API calls
11. Save current form data to localStorage before modal:
    - Key: `unsaved:{page}:{timestamp}`
    - Value: form data object
    - TTL: 1 hour (clear stale data)
12. Save current URL in localStorage
13. Show SessionTimeoutModal
14. After re-login, check localStorage for unsaved data
15. If found, offer to restore (show toast)
16. Redirect to saved URL
17. Test: Expire Clerk session, make API call, verify modal appears

### Offline State Handling (2 hours)
18. Create OfflineBanner component
19. Listen to window 'offline' and 'online' events
20. Check navigator.onLine on mount
21. Show banner when offline: "You're offline. Some features may not work."
22. Add "Learn More" link (optional)
23. Yellow/warning background color
24. Fixed position at top or bottom
25. Integrate with API client:
    - Before API call: check if offline
    - If offline: don't attempt call, show offline message
    - If online: proceed normally
26. When online event fires: hide banner, retry queued requests (GET only)
27. Add to App.tsx or root layout
28. Test: Disable network in DevTools, verify banner, re-enable, verify banner disappears

## Notes & Comments
**Priority:** P0 - LAUNCH BLOCKER (default Cloudflare errors are bad UX)

**Files to Create:**
- src/pages/NotFoundPage.tsx
- src/pages/ServerErrorPage.tsx
- src/components/ErrorBoundary.tsx
- src/components/SessionTimeoutModal.tsx
- src/components/OfflineBanner.tsx

**Files to Modify:**
- src/router.tsx (add catch-all 404 route)
- src/App.tsx (wrap in ErrorBoundary, add OfflineBanner)
- src/lib/api-client.ts (add 401 interceptor, offline detection)

**Session Timeout:** Clerk sessions have configurable TTL (default 7 days with auto-refresh). Timeout is rare but must be handled gracefully.

**Work Preservation:** Best effort only. Can preserve form inputs, drafts, search filters. Cannot preserve file uploads in progress or non-serializable state.

**Offline Detection:** navigator.onLine only detects complete network loss. User may have connection but slow/failing requests - handle separately with timeouts.

