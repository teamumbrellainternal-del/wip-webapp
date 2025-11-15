---
id: task-10.6
title: "Post-Deployment Verification"
status: "To Do"
assignee: []
created_date: "2025-11-15"
labels: ["testing", "P0", "deployment"]
milestone: "M10 - Testing, Bug Fixes & Deployment"
dependencies: ["task-10.5"]
estimated_hours: 3
---

## Description
Verify production deployment is healthy: smoke tests, monitoring setup, error tracking, and performance validation.

## Acceptance Criteria
- [ ] Production Worker deployed and responding
- [ ] Health check endpoint returns 200 OK
- [ ] Database migrations applied successfully
- [ ] Cron jobs running (analytics at midnight UTC)
- [ ] Sentry capturing errors
- [ ] Cloudflare Analytics enabled
- [ ] Custom domain (umbrella.app) resolving correctly
- [ ] SSL certificate valid
- [ ] Smoke tests passed (critical paths functional)
- [ ] Performance metrics within targets (P95 < 500ms)
- [ ] No critical errors in logs
- [ ] Post-launch monitoring dashboard configured

## Implementation Plan
1. Verify Worker deployment:
   - Check Cloudflare Workers dashboard
   - Confirm production Worker shows as active
   - Verify correct version deployed
2. Run health checks:
   - GET https://umbrella.app/health
   - Verify 200 OK response
   - Check response includes version number
3. Verify database:
   - Run migrations: `wrangler d1 migrations apply --env production`
   - Check tables exist: `wrangler d1 execute --env production "SELECT name FROM sqlite_master WHERE type='table'"`
   - Verify data integrity
4. Verify cron jobs:
   - Check cron logs in Cloudflare dashboard
   - Confirm analytics cron ran at midnight UTC
   - Verify analytics data populated
5. Verify external services:
   - Send test email via Resend
   - Send test SMS via Twilio
   - Test Claude API call
   - Verify all API keys working
6. Run smoke tests:
   - OAuth login flow
   - Create test account
   - Complete onboarding
   - View dashboard
   - Browse marketplace
   - Send message
   - Apply to gig
7. Check Sentry:
   - Verify errors being captured
   - Review any errors from initial traffic
8. Verify custom domain:
   - Visit https://umbrella.app
   - Check SSL certificate valid
   - Verify DNS records correct
9. Monitor performance:
   - Check Cloudflare Analytics
   - Review P50, P95, P99 latencies
   - Verify within targets (P95 < 500ms)
10. Set up monitoring dashboard:
    - Key metrics: request count, error rate, latency
    - Alerts: error rate > 5%, P95 > 1s
11. Create post-launch runbook:
    - Document common issues and fixes
    - Rollback procedure
    - Emergency contacts

## Notes & Comments
**References:**
- docs/initial-spec/architecture.md - Deployment strategy
- Cloudflare Workers documentation

**Priority:** P0 - Launch verification
**File:** N/A (verification tasks)
**Dependencies:** Requires task-10.5 (QA testing complete)
