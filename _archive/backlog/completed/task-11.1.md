---
id: task-11.1
title: "Legal & Compliance Setup"
status: "Done"
assignee: []
created_date: "2025-11-17"
completed_date: "2025-11-17"
labels: ["legal", "P0", "compliance", "frontend", "backend"]
milestone: "M11 - Pre-Launch Readiness & Compliance"
dependencies: ["task-1.4"]
estimated_hours: 8
actual_hours: 8
---

## Description
Create all legally required pages and functionality: Terms of Service, Privacy Policy, Cookie Policy, cookie consent banner, and account deletion flow (California CCPA compliance).

## Acceptance Criteria
- [x] Terms of Service page created at /legal/terms
- [x] Privacy Policy page created at /legal/privacy (discloses Clerk, Resend, Twilio, Cloudflare, Anthropic)
- [x] Cookie Policy page created at /legal/cookies
- [x] All legal pages linked in footer on every page
- [x] Cookie consent banner appears on first visit, dismisses on accept
- [x] Cookie consent choice stored in localStorage
- [x] DELETE /v1/account endpoint implemented
- [x] Account deletion requires typing "DELETE" for confirmation
- [x] Deletion removes all user data (users, artists, tracks, files, messages, reviews)
- [x] Deletion removes files from R2 bucket
- [x] Deletion removes Clerk user via Clerk API
- [x] Confirmation email sent after deletion
- [x] Settings page has "Delete Account" section with danger styling

## Implementation Plan

### Legal Pages (3 hours)
1. Create src/pages/legal/ directory
2. Create TermsPage.tsx:
   - Sections: Acceptance, User Accounts, Service Description, Content Ownership, Prohibited Uses, Termination, Disclaimers, Limitation of Liability, Governing Law (US), Changes to Terms
   - Last updated date at top
   - Brand kit styling
3. Create PrivacyPage.tsx:
   - Sections: Information Collection, How We Use Information, Information Sharing, Data Storage, User Rights (California CCPA), Cookies, Children's Privacy, Changes to Policy, Contact
   - Disclose third parties: Clerk, Resend, Twilio, Cloudflare, Anthropic
   - California CCPA rights: access, deletion, opt-out of sale (note we don't sell data)
4. Create CookiesPage.tsx:
   - Sections: What Are Cookies, Cookies We Use, Essential Cookies (Clerk session), How to Control Cookies
   - List cookie names, purposes, durations
5. Add routes: /legal/terms, /legal/privacy, /legal/cookies
6. Update Footer.tsx with legal page links

### Cookie Consent Banner (1 hour)
7. Create CookieBanner.tsx component
8. Check localStorage for cookie_consent on mount
9. Show banner if not set: "We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies."
10. Add "Learn More" link to /legal/cookies
11. Add "Accept" button → set localStorage: cookie_consent = "accepted"
12. Add to App.tsx or root layout

### Account Deletion Flow (4 hours)
13. Create DELETE /v1/account route in api/routes/account.ts
14. Apply requireAuth middleware
15. Begin D1 transaction for atomic deletion:
    - Delete from files table (WHERE artist_id = ?)
    - Delete files from R2 bucket (list all keys, delete each)
    - Delete from tracks, messages, conversations, reviews, gig_applications, analytics, violet_usage, journal_entries, broadcast_messages, contacts, artists, users tables
16. Commit D1 transaction
17. Delete Clerk user: DELETE /v1/users/{clerk_user_id} via Clerk API
18. Send confirmation email via Resend
19. Return 200 OK
20. Add error handling (rollback on D1 failure, graceful degradation on Clerk failure)
21. Add "Delete Account" section to Settings page (bottom, red danger styling)
22. Create confirmation modal requiring typing "DELETE"
23. Wire up delete button → call DELETE /v1/account → redirect to login with "Account deleted" message

## Notes & Comments
**Priority:** P0 - LAUNCH BLOCKER (legal requirement for US launch)

**Files to Create:**
- src/pages/legal/TermsPage.tsx
- src/pages/legal/PrivacyPage.tsx
- src/pages/legal/CookiesPage.tsx
- src/components/CookieBanner.tsx
- api/routes/account.ts

**Files to Modify:**
- src/components/Footer.tsx (add legal links)
- src/router.tsx (add legal routes)
- src/App.tsx (add CookieBanner)
- api/index.ts (register DELETE /v1/account route)
- src/pages/SettingsPage.tsx (add Delete Account section)

**Legal Note:** Content should be reviewed by legal counsel before production launch. Placeholder content acceptable for MVP testing but must be replaced with lawyer-reviewed versions before public launch.

**California CCPA:** Requires "right to delete" for all users (not just California residents). Account deletion must complete within 45 days (we do it immediately).

