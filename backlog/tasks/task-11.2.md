---
id: task-11.2
title: "Security Hardening"
status: "To Do"
assignee: []
created_date: "2025-11-17"
labels: ["security", "P0", "backend"]
milestone: "M11 - Pre-Launch Readiness & Compliance"
dependencies: ["task-1.4"]
estimated_hours: 8
---

## Description
Implement comprehensive security measures: rate limiting, input sanitization, environment validation, and CORS policy to prevent abuse and attacks.

## Acceptance Criteria
- [ ] Rate limiting middleware implemented (20 req/min for public, 100 req/min for authenticated)
- [ ] Rate limit headers returned (X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset)
- [ ] 429 status with Retry-After header when limit exceeded
- [ ] All D1 queries use parameterized statements (no string concatenation)
- [ ] All user inputs validated (email, phone, URLs, filenames)
- [ ] File uploads validate MIME type server-side
- [ ] HTML content sanitized (if any rich text)
- [ ] Content Security Policy headers configured
- [ ] Environment variable validation on Worker startup
- [ ] Worker fails fast if required secrets missing
- [ ] CORS middleware configured with allowed origins
- [ ] CORS credentials enabled for auth cookies
- [ ] Preflight OPTIONS requests handled

## Implementation Plan

### Rate Limiting (3 hours)
1. Create api/middleware/rate-limit.ts
2. Implement KV-based rate limiter:
   - Key format: `ratelimit:{identifier}:{window}`
   - Identifier: IP for public, user_id for authenticated
   - Window: Unix timestamp floored to minute
3. Create rateLimitPublic (20 req/min per IP) and rateLimitUser (100 req/min per user_id)
4. Apply rateLimitPublic to: POST /v1/auth/callback, GET /v1/search
5. Apply rateLimitUser to all authenticated endpoints
6. Add rate limit headers to all responses
7. Return 429 with Retry-After when exceeded
8. Test: Send 21 rapid requests, verify 429 on 21st

### Input Sanitization (3 hours)
9. Audit all D1 queries in api/ directory
10. Verify all use `.prepare()` with `.bind()` (no string concatenation)
11. Create api/utils/sanitize.ts with helpers:
    - sanitizeEmail(email): validates format, normalizes
    - sanitizePhone(phone): validates E.164 format
    - sanitizeURL(url): validates format, prevents javascript: protocol
    - sanitizeFilename(filename): removes path traversal (../, ..\)
12. Apply sanitization to all user inputs in api/routes/
13. Validate file uploads:
    - Check MIME type server-side (not just client)
    - Reject executable types (.exe, .sh, .bat)
    - Check magic bytes for true file type
14. Configure CSP headers:
    - default-src 'self'
    - script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com
    - style-src 'self' 'unsafe-inline'

### Environment Validation (1 hour)
15. Create api/utils/validate-env.ts
16. Define required secrets: CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY, CLERK_WEBHOOK_SECRET, RESEND_API_KEY, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, ANTHROPIC_API_KEY
17. Define required bindings: DB, KV, R2_BUCKET
18. Create validateEnvironment(env) function
19. Call in Worker fetch handler before routing
20. Throw error with missing variable list if validation fails
21. Allow dev mode to skip external service keys (use mocks)

### CORS Policy (1 hour)
22. Create api/middleware/cors.ts
23. Define allowed origins by environment:
    - production: ['https://umbrella.app']
    - preview: ['https://preview.umbrella.app']
    - development: ['http://localhost:5173', 'http://localhost:3000']
24. Add CORS headers to all responses:
    - Access-Control-Allow-Origin (from request Origin if allowed)
    - Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
    - Access-Control-Allow-Headers: Authorization, Content-Type
    - Access-Control-Allow-Credentials: true
25. Handle preflight OPTIONS requests (return 204 with headers)
26. Apply CORS to all responses in api/index.ts
27. Configure R2 CORS separately (create r2-cors.json, apply via wrangler)

## Notes & Comments
**Priority:** P0 - LAUNCH BLOCKER (prevents security vulnerabilities)

**Files to Create:**
- api/middleware/rate-limit.ts
- api/utils/sanitize.ts
- api/utils/validate-env.ts
- api/middleware/cors.ts
- r2-cors.json

**Files to Modify:**
- api/index.ts (apply all middleware)
- All files in api/routes/ (apply sanitization)

**Rate Limit Strategy:** Sliding window in KV prevents burst attacks. Per-IP for public (anonymous abuse), per-user for authenticated (account abuse).

**SQL Injection:** D1 parameterized queries prevent injection. Must verify no string concatenation in queries.

**XSS Prevention:** React auto-escapes JSX content. Watch for dangerouslySetInnerHTML, innerHTML assignments, href="javascript:" URLs.

