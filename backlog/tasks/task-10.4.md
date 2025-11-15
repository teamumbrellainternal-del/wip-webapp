---
id: task-10.4
title: "Create Production Deployment Configuration"
status: "To Do"
assignee: []
created_date: "2025-11-15"
labels: ["devops", "P0", "deployment"]
milestone: "M10 - Testing, Bug Fixes & Deployment"
dependencies: []
estimated_hours: 4
---

## Description
Configure production deployment settings in wrangler.toml, set up environment variables, and create deployment scripts.

## Acceptance Criteria
- [ ] wrangler.toml configured for production environment
- [ ] Environment variables defined (JWT_SECRET, API keys, etc.)
- [ ] D1 database binding configured for production
- [ ] KV namespace binding configured for production
- [ ] R2 bucket binding configured for production
- [ ] Cron triggers configured (analytics at midnight UTC)
- [ ] Custom domain configured (umbrella.app)
- [ ] Deployment script created (npm run deploy:prod)
- [ ] Rollback script created (npm run rollback)
- [ ] CI/CD pipeline configured in GitHub Actions

## Implementation Plan
1. Create production environment in wrangler.toml:
```toml
   [env.production]
   name = "umbrella-prod"
   workers_dev = false
   route = "umbrella.app/*"
```
2. Add bindings:
```toml
   [[env.production.d1_databases]]
   binding = "DB"
   database_name = "umbrella-prod-db"
   
   [[env.production.kv_namespaces]]
   binding = "KV"
   id = "production-kv-id"
   
   [[env.production.r2_buckets]]
   binding = "R2_BUCKET"
   bucket_name = "umbrella-prod"
```
3. Configure cron triggers:
```toml
   [env.production.triggers]
   crons = ["0 0 * * *"] # Midnight UTC
```
4. Set environment secrets via CLI:
   - `wrangler secret put JWT_SECRET --env production`
   - `wrangler secret put RESEND_API_KEY --env production`
   - `wrangler secret put TWILIO_ACCOUNT_SID --env production`
   - `wrangler secret put TWILIO_AUTH_TOKEN --env production`
   - `wrangler secret put CLAUDE_API_KEY --env production`
5. Create deployment script in package.json:
```json
   "deploy:prod": "wrangler deploy --env production"
```
6. Create rollback script:
```json
   "rollback": "wrangler rollback --env production"
```
7. Configure GitHub Actions workflow:
   - Trigger on push to main branch
   - Run tests
   - Deploy to production if tests pass
8. Test deployment to staging first
9. Deploy to production

## Notes & Comments
**References:**
- docs/initial-spec/architecture.md - Deployment architecture
- wrangler.toml - Configuration file

**Priority:** P0 - Required for launch
**File:** wrangler.toml, .github/workflows/deploy.yml
**Can Run Parallel With:** None (needed for deployment)
