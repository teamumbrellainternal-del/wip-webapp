---
id: task-11.7
title: "UX Consistency Audit"
status: "To Do"
assignee: []
created_date: "2025-11-17"
labels: ["frontend", "P2", "ux"]
milestone: "M11 - Pre-Launch Readiness & Compliance"
dependencies: []
estimated_hours: 6
---

## Description
Audit all user-triggered actions for consistent loading states and error messages. Ensure every button, form, and async action provides clear feedback.

## Acceptance Criteria
- [ ] Checklist created of all async actions (auth, onboarding, profile, marketplace, messaging, files, broadcasts, Violet)
- [ ] Each action audited for loading state presence
- [ ] Missing loading states identified and fixed
- [ ] Consistent loading patterns established (button spinner, skeleton loader, overlay)
- [ ] All error messages audited (frontend and backend)
- [ ] Technical error messages replaced with user-friendly versions
- [ ] Error message style guide created
- [ ] Error messages include actionable next steps
- [ ] Loading states tested on slow connection (throttle network)
- [ ] Error messages tested with users for clarity

## Implementation Plan

### Loading States Audit (3 hours)
1. Create audit checklist of all async actions:
   - Auth: Login, Logout
   - Onboarding: Next buttons (steps 1-4), Submit (step 5)
   - Profile: Save Changes, Avatar upload, Track upload
   - Marketplace: Apply to Gig, Search, Filters, Infinite scroll
   - Messaging: Send Message, Create conversation
   - Files: File upload, File deletion
   - Broadcasts: Send Now, Ask Violet to Draft
   - Violet: All prompt submissions
2. Audit each action:
   - Trigger action
   - Observe UI during loading
   - Check for loading indicator
   - Check if action can be triggered multiple times (should disable)
3. Define loading patterns:
   - Buttons: Show spinner + "Loading..." text, disable button
   - Forms: Disable inputs during submission
   - Lists: Show skeleton loaders (not spinners)
   - Page loads: Show overlay with large spinner
4. Create reusable components:
   - Spinner component
   - SkeletonLoader component
   - LoadingOverlay component
   - ButtonSpinner component
5. Fix missing loading states:
   - Add to components missing indicators
   - Use consistent patterns
   - Disable buttons/inputs during loading
6. Test on slow connection:
   - DevTools → Network → Throttle to "Slow 3G"
   - Trigger all actions
   - Verify loading states visible
   - Verify no UI flashing (too fast)

### Error Messages Audit (3 hours)
7. Create error message style guide in docs/ERROR_MESSAGES.md:
   - Validation errors: Clear, specific, actionable
   - Authorization errors: Explain permission issue
   - Server errors: Apologize, suggest retry
   - Network errors: Explain connection issue
8. Define error structure:
   ```typescript
   {
     title: string,       // "Upload Failed"
     message: string,     // "File is too large"
     action: string,      // "Try a file under 50 MB"
     code: string         // "FILE_TOO_LARGE" (for support)
   }
   ```
9. Audit frontend error messages:
   - Search for catch blocks, error states
   - Note all user-facing messages
   - Identify technical/unclear messages
10. Audit backend error responses:
    - Review all API endpoints
    - Check 400, 401, 403, 404, 500 responses
    - Note all error messages
11. Create error message constants:
    - src/lib/error-messages.ts (frontend)
    - api/utils/error-messages.ts (backend)
12. Replace technical messages:
    - "Clerk API returned 401" → "Your session has expired. Please log in again."
    - "Foreign key constraint failed" → "This item is being used and cannot be deleted."
    - "Network request failed" → "Unable to connect. Check your internet connection."
13. Add actionable next steps:
    - Validation: "Email is required. Please enter your email address."
    - Authorization: "You don't have permission. Contact support if this is a mistake."
    - Server: "Something went wrong. Please try again. If this persists, contact support."
14. Standardize error display:
    - Use consistent components (ErrorToast, ErrorModal)
    - Use consistent colors (red)
    - Use consistent icons (exclamation triangle)

## Notes & Comments
**Priority:** P2 - Nice to have (improves UX but not launch blocking)

**Files to Create:**
- docs/ERROR_MESSAGES.md (style guide)
- src/lib/error-messages.ts (frontend constants)
- api/utils/error-messages.ts (backend constants)

**Files to Audit:**
- All page components
- All form components
- All API route handlers

**Loading Best Practice:** If operation <300ms, don't show loading (too fast to perceive, causes flashing). If >300ms, show loading.

**Error Principles:** Be specific (say exactly what's wrong), be human (plain language), be helpful (suggest fix), be honest (if it's our fault, say so).

