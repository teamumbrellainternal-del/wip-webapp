# Production Readiness Checklist

**Purpose:** This checklist consolidates all M11 Pre-Launch Readiness & Compliance tasks into a single verification document. Every item must be verified and checked before production deployment.

**Last Updated:** 2025-11-17

---

## Overview

This checklist ensures that Umbrella is production-ready across all critical areas:
- Legal & Compliance
- Security & Authentication
- Infrastructure & Monitoring
- User Experience
- Database & Performance
- SEO & Branding

**CRITICAL:** This checklist must be 100% complete before production launch. Any incomplete items are potential launch blockers.

---

## Legal & Compliance (Task 11.1)

### Legal Pages
- [ ] Terms of Service page deployed at `/legal/terms`
  - **Verify:** Navigate to https://umbrella.app/legal/terms
  - **Pass Criteria:** Page loads, displays complete terms, last updated date shown

- [ ] Privacy Policy page deployed at `/legal/privacy`
  - **Verify:** Navigate to https://umbrella.app/legal/privacy
  - **Pass Criteria:** Page loads, discloses all third parties (Clerk, Resend, Twilio, Cloudflare, Anthropic), includes California CCPA rights

- [ ] Cookie Policy page deployed at `/legal/cookies`
  - **Verify:** Navigate to https://umbrella.app/legal/cookies
  - **Pass Criteria:** Page loads, lists all cookies with names, purposes, and durations

- [ ] Legal pages linked in footer on all pages
  - **Verify:** Check footer on Dashboard, Marketplace, Profile pages
  - **Pass Criteria:** Footer contains working links to all three legal pages

### Cookie Consent
- [ ] Cookie consent banner appears on first visit
  - **Verify:** Open site in incognito/private mode
  - **Pass Criteria:** Banner appears with message, "Learn More" link, and "Accept" button

- [ ] Cookie consent banner dismisses on accept
  - **Verify:** Click "Accept" button
  - **Pass Criteria:** Banner disappears and doesn't reappear on page refresh

- [ ] Cookie consent choice stored in localStorage
  - **Verify:** Check localStorage for `cookie_consent` key after accepting
  - **Pass Criteria:** Key exists with value "accepted"

### Account Deletion (CCPA Compliance)
- [ ] DELETE `/v1/account` endpoint implemented
  - **Verify:** Test with authenticated request: `curl -X DELETE https://umbrella.app/v1/account -H "Authorization: Bearer TOKEN"`
  - **Pass Criteria:** Returns 200 OK

- [ ] Account deletion requires typing "DELETE" for confirmation
  - **Verify:** Try to delete account from Settings page
  - **Pass Criteria:** Modal requires typing "DELETE" exactly

- [ ] Deletion removes all user data from D1 database
  - **Verify:** Check database after deletion for user records
  - **Pass Criteria:** All records removed from users, artists, tracks, files, messages, reviews, gig_applications, analytics, violet_usage, journal_entries, broadcast_messages, contacts tables

- [ ] Deletion removes files from R2 bucket
  - **Verify:** Check R2 bucket after deletion
  - **Pass Criteria:** All user files deleted from bucket

- [ ] Deletion removes Clerk user
  - **Verify:** Check Clerk dashboard after deletion
  - **Pass Criteria:** User no longer exists in Clerk

- [ ] Confirmation email sent after deletion
  - **Verify:** Check email inbox after deletion
  - **Pass Criteria:** Confirmation email received from Resend

- [ ] Settings page has "Delete Account" section with danger styling
  - **Verify:** Navigate to Settings page
  - **Pass Criteria:** Section exists at bottom with red/warning styling

**Legal Note:** Legal page content should be reviewed by legal counsel before production launch.

---

## Security & Authentication (Tasks 11.2, 11.5)

### Rate Limiting
- [ ] Rate limiting configured: 20 req/min for public endpoints
  - **Verify:** Send 21 rapid requests to `/v1/auth/callback` or `/v1/search` from same IP
  - **Pass Criteria:** 21st request returns 429 status

- [ ] Rate limiting configured: 100 req/min for authenticated endpoints
  - **Verify:** Send 101 rapid authenticated requests to any protected endpoint
  - **Pass Criteria:** 101st request returns 429 status

- [ ] Rate limit headers returned (X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset)
  - **Verify:** Check response headers from any API call
  - **Pass Criteria:** All three headers present with correct values

- [ ] 429 responses include Retry-After header
  - **Verify:** Trigger rate limit, check response headers
  - **Pass Criteria:** Retry-After header present with seconds until reset

### Input Sanitization
- [ ] All D1 queries use parameterized statements
  - **Verify:** Code audit - search for `.prepare()` and `.bind()` usage
  - **Pass Criteria:** No string concatenation or template literal interpolation in SQL queries

- [ ] All user inputs validated (email, phone, URLs, filenames)
  - **Verify:** Test API endpoints with invalid inputs (malformed email, invalid phone, javascript: URL, ../ in filename)
  - **Pass Criteria:** All invalid inputs rejected with appropriate error messages

- [ ] File uploads validate MIME type server-side
  - **Verify:** Attempt to upload file with .exe extension or wrong MIME type
  - **Pass Criteria:** Upload rejected with error message

- [ ] HTML content sanitized
  - **Verify:** Test any rich text inputs with <script> tags
  - **Pass Criteria:** Script tags removed or escaped

- [ ] Content Security Policy headers configured
  - **Verify:** Check response headers for CSP
  - **Pass Criteria:** Content-Security-Policy header present with restrictive policy

### Environment Validation
- [ ] Environment variables validated on Worker startup
  - **Verify:** Check Worker logs on deployment
  - **Pass Criteria:** No missing variable errors, Worker starts successfully

- [ ] Worker fails fast if required secrets missing
  - **Verify:** Remove a required secret and deploy
  - **Pass Criteria:** Worker returns 500 with clear error about missing secret

### CORS Policy
- [ ] CORS middleware configured with allowed origins
  - **Verify:** Make cross-origin request from unauthorized domain
  - **Pass Criteria:** Request blocked with CORS error

- [ ] CORS credentials enabled for auth cookies
  - **Verify:** Check Access-Control-Allow-Credentials header
  - **Pass Criteria:** Header set to "true"

- [ ] Preflight OPTIONS requests handled
  - **Verify:** Send OPTIONS request to API endpoint
  - **Pass Criteria:** Returns 204 with CORS headers

### Clerk Integration
- [ ] Google OAuth email verification tested
  - **Verify:** Sign up with Google account
  - **Pass Criteria:** Email pre-verified, immediate access granted

- [ ] Clerk webhook failures logged and tracked
  - **Verify:** Check Worker logs and KV for webhook_failures counter
  - **Pass Criteria:** Failures logged with full details

- [ ] Manual sync function handles webhook failures
  - **Verify:** Break webhook, sign up new user, make authenticated API call
  - **Pass Criteria:** User automatically synced from Clerk API to D1, can use platform

- [ ] Webhook failure recovery alerts configured
  - **Verify:** Check KV manual_syncs counter
  - **Pass Criteria:** Alert triggered if >5 manual syncs per day

---

## Infrastructure & Monitoring (Task 11.4)

### Health Check Endpoint
- [ ] GET `/health` endpoint returns status
  - **Verify:** `curl https://umbrella.app/health`
  - **Pass Criteria:** Returns JSON with status, version, uptime, timestamp, dependencies

- [ ] Health check includes D1, KV, R2 status
  - **Verify:** Check health response dependencies object
  - **Pass Criteria:** All three dependencies listed with "healthy" or "unhealthy" status

- [ ] Returns 200 when healthy, 503 when any dependency down
  - **Verify:** Test with all services up, then simulate failure
  - **Pass Criteria:** Correct status codes returned

- [ ] Health check response time <100ms
  - **Verify:** Measure response time with curl -w "%{time_total}"
  - **Pass Criteria:** Response time under 100ms

- [ ] Health check cached for 10 seconds
  - **Verify:** Make multiple rapid requests, check if dependency checks are cached
  - **Pass Criteria:** Only one dependency check per 10 second window

### Database Backup Strategy
- [ ] Automatic backups verified (Cloudflare D1 point-in-time recovery)
  - **Verify:** Check Cloudflare D1 dashboard for backup settings
  - **Pass Criteria:** Automatic backups enabled, 30-day retention confirmed

- [ ] Manual backup procedure documented
  - **Verify:** Review docs/DATABASE_BACKUP.md
  - **Pass Criteria:** Step-by-step manual backup instructions present

- [ ] Restoration procedure documented
  - **Verify:** Review docs/DATABASE_BACKUP.md restoration section
  - **Pass Criteria:** Clear restoration instructions with wrangler commands

- [ ] Database backup tested
  - **Verify:** Perform manual backup and restoration in staging environment
  - **Pass Criteria:** Backup completes, restoration successful, no data loss

### Rollback Procedures
- [ ] Rollback when-to-use criteria defined
  - **Verify:** Review docs/ROLLBACK.md
  - **Pass Criteria:** P0/P1/P2 severity levels defined with clear criteria

- [ ] Worker rollback procedure documented
  - **Verify:** Review docs/ROLLBACK.md Worker rollback section
  - **Pass Criteria:** wrangler rollback commands documented with examples

- [ ] Database rollback procedure documented
  - **Verify:** Review docs/ROLLBACK.md database rollback section
  - **Pass Criteria:** Migration rollback commands documented, warnings about data loss included

- [ ] Post-mortem template created
  - **Verify:** Check docs/POST_MORTEM_TEMPLATE.md exists
  - **Pass Criteria:** Template includes sections for timeline, root cause, detection, resolution, prevention

### Uptime Monitoring
- [ ] Health endpoint added to uptime monitoring service
  - **Verify:** Check Pingdom/UptimeRobot/similar service configuration
  - **Pass Criteria:** /health endpoint monitored every 1-5 minutes

- [ ] Alerts configured for health check failures
  - **Verify:** Simulate downtime and verify alert received
  - **Pass Criteria:** Email/SMS alert sent when health check returns non-200 or times out

---

## User Experience (Tasks 11.3, 11.7)

### Error Pages
- [ ] Custom 404 page deployed
  - **Verify:** Navigate to https://umbrella.app/nonexistent-page
  - **Pass Criteria:** Custom 404 page shown with navigation options

- [ ] Custom 500 page deployed
  - **Verify:** Trigger unhandled exception (in staging)
  - **Pass Criteria:** Custom 500 page shown with refresh and support options

- [ ] Invalid routes redirect to 404 page
  - **Verify:** Try multiple invalid URLs
  - **Pass Criteria:** All show 404 page, not default server error

- [ ] Error boundary wraps entire app
  - **Verify:** Trigger React error (in staging)
  - **Pass Criteria:** Error boundary catches error, shows fallback UI

### Session Timeout Handling
- [ ] Session timeout modal shows when Clerk session expires
  - **Verify:** Expire Clerk session, make API call
  - **Pass Criteria:** Modal appears with "Session Expired" message

- [ ] Session timeout modal requires re-login
  - **Verify:** Try to dismiss modal without logging in
  - **Pass Criteria:** Cannot dismiss, must click "Log In" button

- [ ] Unsaved form data preserved in localStorage before redirect
  - **Verify:** Fill out form, trigger session timeout
  - **Pass Criteria:** Form data saved to localStorage with unsaved: prefix

- [ ] After re-login, user restored to previous location
  - **Verify:** Note current page, trigger timeout, re-login
  - **Pass Criteria:** Redirected back to same page

### Offline State Handling
- [ ] Offline banner appears when browser loses connection
  - **Verify:** Disable network in DevTools
  - **Pass Criteria:** Banner appears with "You're offline" message

- [ ] Offline banner disappears when connection restored
  - **Verify:** Re-enable network in DevTools
  - **Pass Criteria:** Banner automatically disappears

- [ ] API calls fail gracefully when offline
  - **Verify:** Disable network, try to submit form or load data
  - **Pass Criteria:** User-friendly offline message shown, no cryptic errors

### Loading States
- [ ] All async actions have loading indicators
  - **Verify:** Review docs/LOADING_STATE_AUDIT.md and test key actions
  - **Pass Criteria:** All 40+ actions show loading state during execution

- [ ] Loading indicators consistent across app
  - **Verify:** Test multiple actions (login, upload, search, etc.)
  - **Pass Criteria:** Consistent spinner/skeleton patterns used

- [ ] Buttons disabled during loading to prevent double-submission
  - **Verify:** Click submit button multiple times rapidly
  - **Pass Criteria:** Button disabled after first click, single submission only

### Error Messages
- [ ] Error messages user-friendly (no technical jargon)
  - **Verify:** Trigger various errors (validation, auth, server)
  - **Pass Criteria:** All messages use plain language, no stack traces or codes shown to users

- [ ] Error messages include actionable next steps
  - **Verify:** Review error messages for validation, auth, server errors
  - **Pass Criteria:** Each message tells user what to do next (e.g., "Please try again" or "Contact support")

- [ ] Error message style guide followed
  - **Verify:** Review docs/ERROR_MESSAGES.md and compare to actual errors
  - **Pass Criteria:** All errors follow documented patterns and structure

---

## Database & Performance (Task 11.6)

### Database Indexes
- [ ] All foreign key columns have indexes
  - **Verify:** Query D1: `SELECT name, tbl_name FROM sqlite_master WHERE type='index' ORDER BY tbl_name`
  - **Pass Criteria:** All 29 foreign key columns have corresponding indexes

- [ ] Query performance verified with EXPLAIN QUERY PLAN
  - **Verify:** Run EXPLAIN on common queries (get artist by user_id, get tracks by artist_id)
  - **Pass Criteria:** All show "SEARCH TABLE USING INDEX", no full table scans

### Migration Rollback
- [ ] Migration rollback scripts created
  - **Verify:** Check db/rollbacks/ directory
  - **Pass Criteria:** Rollback script exists for each migration (0001-0012)

- [ ] Migration rollback tested in development
  - **Verify:** Apply migration, rollback, verify tables dropped
  - **Pass Criteria:** Rollback scripts execute successfully

- [ ] Rollback limitations documented
  - **Verify:** Review docs/MIGRATION_ROLLBACK.md
  - **Pass Criteria:** Each migration's reversibility, data loss warnings documented

---

## SEO & Branding (Tasks 11.8, 11.9)

### SEO Meta Tags
- [ ] SEO meta tags on all public pages
  - **Verify:** View page source for Marketplace, Login, Artist profiles
  - **Pass Criteria:** title, description, keywords meta tags present

- [ ] Each page has unique title and description
  - **Verify:** Check meta tags on multiple pages
  - **Pass Criteria:** No duplicate titles/descriptions, each page customized

- [ ] Open Graph tags configured for social sharing
  - **Verify:** Share link in Facebook Debugger
  - **Pass Criteria:** og:title, og:description, og:image, og:url, og:type all present

- [ ] Twitter Card tags configured
  - **Verify:** Share link in Twitter Card Validator
  - **Pass Criteria:** twitter:card, twitter:title, twitter:description, twitter:image all present

- [ ] Canonical URLs set on all pages
  - **Verify:** Check for <link rel="canonical"> in page source
  - **Pass Criteria:** Canonical URL present and correct on all pages

- [ ] Robot meta tags configured appropriately
  - **Verify:** Check meta robots tag - public pages should allow indexing, auth/settings should noindex
  - **Pass Criteria:** Public pages have index,follow; private pages have noindex

- [ ] Default OG image created and accessible
  - **Verify:** Check og:image URL loads (1200x630px with Umbrella branding)
  - **Pass Criteria:** Image loads, correct dimensions, displays properly

- [ ] SEO validation with Google Rich Results Test
  - **Verify:** Test homepage and key pages at https://search.google.com/test/rich-results
  - **Pass Criteria:** No errors, all structured data valid

### Branding Assets
- [ ] Favicon.ico deployed
  - **Verify:** Check browser tab icon
  - **Pass Criteria:** Umbrella icon appears in tab

- [ ] PNG favicons deployed (32x32, 96x96, 192x192)
  - **Verify:** Check public/ directory and index.html links
  - **Pass Criteria:** All sizes present and linked

- [ ] Apple touch icon deployed (180x180)
  - **Verify:** Add to home screen on iOS device
  - **Pass Criteria:** Correct icon appears on home screen

- [ ] Android chrome icons deployed (192x192, 512x512)
  - **Verify:** Add to home screen on Android device
  - **Pass Criteria:** Correct icon appears on home screen

- [ ] Web manifest file configured
  - **Verify:** Check public/site.webmanifest exists and is linked
  - **Pass Criteria:** Manifest has correct name, icons, theme_color, background_color

- [ ] Icons recognizable at small sizes
  - **Verify:** View favicon at 16x16 in browser tab
  - **Pass Criteria:** Icon still recognizable and on-brand at smallest size

---

## Production Environment Configuration

### Environment Variables
- [ ] All required Cloudflare Workers secrets configured
  - **Verify:** Check wrangler.toml and Cloudflare dashboard secrets
  - **Pass Criteria:** CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY, CLERK_WEBHOOK_SECRET, RESEND_API_KEY, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, ANTHROPIC_API_KEY, JWT_SECRET all present

- [ ] All required bindings configured (DB, KV, R2_BUCKET)
  - **Verify:** Check wrangler.toml production environment
  - **Pass Criteria:** All three bindings present and pointing to production resources

### DNS & Domains
- [ ] Primary domain configured (umbrella.app)
  - **Verify:** DNS records point to Cloudflare Workers
  - **Pass Criteria:** Domain resolves to production Worker

- [ ] SSL/TLS certificate valid
  - **Verify:** Check https://umbrella.app in browser
  - **Pass Criteria:** Valid SSL certificate, no warnings

- [ ] WWW redirect configured
  - **Verify:** Navigate to https://www.umbrella.app
  - **Pass Criteria:** Redirects to https://umbrella.app

### Third-Party Services
- [ ] Clerk production application configured
  - **Verify:** Check Clerk dashboard for production app
  - **Pass Criteria:** Production app exists with correct domain whitelist

- [ ] Clerk webhook endpoint configured
  - **Verify:** Check Clerk webhooks settings
  - **Pass Criteria:** Webhook points to https://umbrella.app/v1/webhooks/clerk with correct secret

- [ ] Resend production API key configured
  - **Verify:** Check Resend dashboard
  - **Pass Criteria:** Production API key active, sending domain verified

- [ ] Twilio production credentials configured
  - **Verify:** Check Twilio console
  - **Pass Criteria:** Production credentials active, phone number purchased if needed

- [ ] Anthropic API key configured
  - **Verify:** Check Anthropic console
  - **Pass Criteria:** API key active, usage limits appropriate for production

### R2 Storage
- [ ] R2 CORS configuration applied
  - **Verify:** `wrangler r2 bucket cors get BUCKET`
  - **Pass Criteria:** CORS configuration matches r2-cors.json with production origins

- [ ] R2 bucket lifecycle policies configured
  - **Verify:** Check R2 bucket settings
  - **Pass Criteria:** Appropriate lifecycle policies for cleanup (if applicable)

---

## Performance & Optimization

### API Performance
- [ ] API response times acceptable (<500ms p95)
  - **Verify:** Monitor API response times under realistic load
  - **Pass Criteria:** 95th percentile response time under 500ms

- [ ] Database query performance optimized
  - **Verify:** Check slow query logs (if available)
  - **Pass Criteria:** No queries taking >1 second regularly

### Frontend Performance
- [ ] Bundle size optimized
  - **Verify:** Run `npm run build` and check output bundle sizes
  - **Pass Criteria:** Main bundle <500KB gzipped

- [ ] Images optimized
  - **Verify:** Check image file sizes in R2
  - **Pass Criteria:** Images compressed appropriately, no >5MB files unless necessary

- [ ] Lazy loading implemented for routes
  - **Verify:** Check React.lazy() usage in router
  - **Pass Criteria:** Routes lazy loaded to reduce initial bundle size

---

## Final Verification

### End-to-End User Flows
- [ ] Complete user registration flow
  - **Verify:** Sign up new account with Google OAuth
  - **Pass Criteria:** Account created, onboarding works, can access dashboard

- [ ] Complete artist onboarding flow
  - **Verify:** Complete all 5 onboarding steps
  - **Pass Criteria:** Artist profile created, can upload track, can view marketplace

- [ ] Upload and delete track
  - **Verify:** Upload audio file, then delete it
  - **Pass Criteria:** File uploads to R2, metadata saved to D1, deletion removes both

- [ ] Apply to gig
  - **Verify:** Browse marketplace, apply to gig
  - **Pass Criteria:** Application submitted, shows in applications list

- [ ] Send and receive message
  - **Verify:** Start conversation, send message
  - **Pass Criteria:** Message delivered, appears in both sender and recipient conversations

- [ ] Use Violet AI assistant
  - **Verify:** Submit prompt to Violet
  - **Pass Criteria:** Response generated, usage tracked, rate limit respected

- [ ] Delete account
  - **Verify:** Delete account from Settings
  - **Pass Criteria:** All data removed, confirmation email received, cannot log in

### Cross-Browser Testing
- [ ] Tested on Chrome (latest)
  - **Verify:** Test all critical flows
  - **Pass Criteria:** All features work, no console errors

- [ ] Tested on Safari (latest)
  - **Verify:** Test all critical flows
  - **Pass Criteria:** All features work, no console errors

- [ ] Tested on Firefox (latest)
  - **Verify:** Test all critical flows
  - **Pass Criteria:** All features work, no console errors

- [ ] Tested on mobile Safari (iOS)
  - **Verify:** Test responsive design and key features
  - **Pass Criteria:** Responsive, touch interactions work

- [ ] Tested on mobile Chrome (Android)
  - **Verify:** Test responsive design and key features
  - **Pass Criteria:** Responsive, touch interactions work

### Security Testing
- [ ] Security headers verified
  - **Verify:** Check response headers with https://securityheaders.com
  - **Pass Criteria:** A+ rating or all critical headers present

- [ ] OWASP Top 10 vulnerabilities reviewed
  - **Verify:** Manual review or automated scan
  - **Pass Criteria:** No critical vulnerabilities (SQL injection, XSS, CSRF, etc.)

- [ ] Authentication edge cases tested
  - **Verify:** Test expired sessions, invalid tokens, webhook failures
  - **Pass Criteria:** All handled gracefully with appropriate errors

---

## Sign-Off

**Instructions:** This section must be completed by the tech lead or authorized approver before production deployment.

### Pre-Launch Verification
- [ ] All checklist items above verified and marked complete
  - **Verified by:** _________________
  - **Date:** _________________
  - **Notes:** _________________________________________________

### Final Review
- [ ] Code review completed for all M11 changes
  - **Reviewed by:** _________________
  - **Date:** _________________

- [ ] Security review completed
  - **Reviewed by:** _________________
  - **Date:** _________________

- [ ] Legal content reviewed (Terms, Privacy, Cookies)
  - **Reviewed by:** _________________
  - **Date:** _________________

### Production Deployment Approval
- [ ] All items above signed off
  - **Approved by:** _________________ (Tech Lead)
  - **Date:** _________________
  - **Deployment authorized:** YES / NO

---

## Post-Launch Monitoring (First 24 Hours)

After deployment, monitor the following:

- [ ] Health check endpoint returning 200
- [ ] No increase in error rates (check logs)
- [ ] API response times normal (<500ms p95)
- [ ] User signups working (test account creation)
- [ ] Clerk webhook receiving events (check logs)
- [ ] No alerts from uptime monitoring
- [ ] Database performance normal (no slow queries)
- [ ] R2 storage accessible (test file upload)
- [ ] Email delivery working (test account verification)
- [ ] Rate limiting functioning (monitor KV)

**Monitoring Lead:** _________________

**24-Hour Sign-Off:**
- [ ] No critical issues detected in first 24 hours
  - **Verified by:** _________________
  - **Date:** _________________

---

## Emergency Rollback

If critical issues are detected, refer to docs/ROLLBACK.md for rollback procedures.

**Rollback Decision Matrix:**
- **P0 (Immediate):** App completely down, data corruption, security vulnerability → ROLLBACK IMMEDIATELY
- **P1 (Urgent):** Critical feature broken (>50% users affected) → Evaluate rollback vs. hotfix
- **P2 (Monitor):** Non-critical issues (<10% users affected) → Fix forward, no rollback

**Rollback Command:**
```bash
# Identify last known good deployment
wrangler deployments list --env production

# Rollback to previous version
wrangler rollback --env production

# Verify rollback successful
curl https://umbrella.app/health
```

---

## Notes

- This checklist should be reviewed and updated for each major release
- Keep a copy of the completed checklist for compliance records
- Reference this checklist in task-10.4 (Production Deployment)
- Incomplete items may delay launch - address them promptly
- When in doubt, consult docs/ROLLBACK.md, docs/DATABASE_BACKUP.md, or docs/POST_MORTEM_TEMPLATE.md

**Version:** 1.0
**Created:** 2025-11-17
**Last Review:** 2025-11-17
