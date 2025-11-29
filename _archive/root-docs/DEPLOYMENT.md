# Umbrella MVP - Deployment Guide

This document describes the deployment pipeline, testing strategy, and rollback procedures for the Umbrella MVP.

## Table of Contents

- [Overview](#overview)
- [Testing Strategy](#testing-strategy)
- [CI/CD Pipeline](#cicd-pipeline)
- [Environment Setup](#environment-setup)
- [Database Migrations](#database-migrations)
- [Deployment Process](#deployment-process)
- [Rollback Procedures](#rollback-procedures)
- [Monitoring and Health Checks](#monitoring-and-health-checks)

## Overview

The Umbrella MVP uses a comprehensive CI/CD pipeline built on GitHub Actions, with automated testing, deployment, and rollback capabilities. The application is deployed to Cloudflare Workers with D1, KV, and R2 for data storage.

### Architecture

- **Frontend:** Vite SPA (React + TypeScript) served via Cloudflare Pages
- **Backend:** Cloudflare Workers (single Worker, route-based handlers)
- **Database:** D1 (SQLite at edge)
- **Cache:** KV (sessions, search results, rate limits)
- **Storage:** R2 (S3-compatible, 50GB/artist quota)
- **Auth:** Cloudflare Access (Apple/Google OAuth only)

### Environments

- **Development:** Local development with Wrangler dev
- **Staging:** `https://api-staging.umbrella.example.com`
- **Production:** `https://api.umbrella.example.com`

## Testing Strategy

### Test Types

1. **Unit Tests** (`tests/unit/`)
   - Test individual functions and utilities
   - Mock external dependencies
   - Fast execution (<1s per test suite)

2. **Integration Tests** (`tests/integration/`)
   - Test complete API flows
   - Mock Cloudflare bindings (D1, KV, R2)
   - Test critical paths:
     - OAuth flow
     - 5-step onboarding
     - File uploads with R2
     - Messaging (2000 char limit)
     - Gig applications
     - Violet rate limiting (50/day)
     - Analytics batch processing

3. **E2E Tests** (`tests/e2e/`)
   - Test complete user journeys
   - Validate critical paths from spec:
     - Sign-in → user created in D1
     - Onboarding → artist profile created
     - Upload track → R2 file + D1 metadata
     - Apply to gig → message + booking record
     - Send broadcast → delivery confirmed
     - Daily batch → analytics updated

4. **Smoke Tests** (`scripts/smoke-tests.js`)
   - Quick validation after deployment
   - Test critical endpoints
   - Verify response formats
   - Ensure authentication works

5. **Performance Tests** (`scripts/performance-check.js`)
   - Validate P95 latency < 500ms (per spec)
   - Test profile views (critical path)
   - Measure endpoint response times

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run smoke tests (requires deployed environment)
API_URL=https://api-staging.umbrella.example.com npm run test:smoke

# Run performance checks
API_URL=https://api.umbrella.example.com npm run perf:check
```

## CI/CD Pipeline

The CI/CD pipeline is defined in `.github/workflows/ci-cd.yml` and runs automatically on:
- Push to `main` branch (production deployment)
- Push to `staging` branch (staging deployment)
- Pull requests to `main` or `staging`

### Pipeline Stages

1. **Lint and Type Check**
   - ESLint validation
   - TypeScript type checking
   - Code formatting verification

2. **Test**
   - Unit tests
   - Integration tests
   - E2E tests
   - Coverage reporting

3. **Build**
   - Frontend build (Vite)
   - Worker build
   - Artifact upload

4. **Verify Migrations**
   - Validate migration files
   - Check sequential numbering
   - Verify SQL syntax

5. **Deploy to Staging**
   - Environment validation
   - Database migrations
   - Worker deployment
   - Smoke tests
   - Health checks

6. **Deploy to Production** (main branch only)
   - Create backup tag
   - Environment validation
   - Database migrations
   - Worker deployment
   - Smoke tests
   - Performance benchmarks
   - Automatic rollback on failure

## Environment Setup

### Required Secrets (GitHub Actions)

Configure these secrets in your GitHub repository settings:

```
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
CODECOV_TOKEN (optional)
STAGING_SMOKE_TEST_TOKEN
PRODUCTION_SMOKE_TEST_TOKEN
```

### Required Environment Variables

Each environment (staging, production) requires:

```bash
JWT_SECRET                # Minimum 32 characters
CLAUDE_API_KEY            # For Violet AI
RESEND_API_KEY            # For email delivery
TWILIO_ACCOUNT_SID        # For SMS delivery
TWILIO_AUTH_TOKEN         # For SMS delivery
TWILIO_PHONE_NUMBER       # Format: +1234567890
```

### Cloudflare Bindings

Each environment requires configured bindings in `wrangler.toml`:

**Staging:**
- D1: `umbrella-staging-db`
- KV: `KV` namespace
- R2: `umbrella-staging-media`

**Production:**
- D1: `umbrella-prod-db`
- KV: `KV` namespace
- R2: `umbrella-prod-media`

### Validation

Validate environment configuration before deployment:

```bash
# Validate staging environment
npm run validate:staging

# Validate production environment
npm run validate:prod
```

## Database Migrations

### Migration Files

Migrations are located in `db/migrations/` and follow the naming convention:

```
NNNN_description.sql
```

Examples:
- `0001_users_artists.sql`
- `0002_tracks_gigs.sql`
- `0003_messaging.sql`

### Verification

Verify migrations before applying:

```bash
npm run migrate:verify
```

This checks:
- Sequential numbering
- Valid SQL syntax
- Dangerous operations (DROP DATABASE, TRUNCATE)
- Foreign key constraints
- Index definitions

### Applying Migrations

```bash
# Local development
npm run migrate

# Staging environment
npm run migrate:staging

# Production environment
npm run migrate:prod
```

**Important:** Always test migrations in staging before applying to production.

## Deployment Process

### Automatic Deployment (via GitHub Actions)

1. Create a pull request with your changes
2. Wait for CI checks to pass
3. Merge to `staging` branch
4. Automatic deployment to staging
5. Verify staging deployment
6. Merge `staging` to `main` branch
7. Automatic deployment to production

### Manual Deployment

```bash
# Build the application
npm run build

# Deploy to staging
wrangler deploy --env staging

# Deploy to production
wrangler deploy --env production
```

### Deployment Checklist

Before deploying to production:

- [ ] All tests passing in CI
- [ ] Staging deployment successful
- [ ] Smoke tests passed on staging
- [ ] Performance benchmarks acceptable
- [ ] Database migrations tested on staging
- [ ] No breaking changes identified
- [ ] Rollback plan ready

## Rollback Procedures

### Automatic Rollback

The CI/CD pipeline automatically rolls back failed production deployments by:
1. Detecting deployment failure (health check or smoke test failure)
2. Checking out the previous backup tag
3. Rebuilding the application
4. Deploying the previous version
5. Verifying health after rollback

### Manual Rollback

If you need to manually roll back a deployment:

```bash
# Set environment variables
export CLOUDFLARE_API_TOKEN="your-token"
export CLOUDFLARE_ACCOUNT_ID="your-account-id"
export ENVIRONMENT="production"

# Run rollback script
npm run rollback
```

The script will:
1. Find the previous deployment tag
2. Checkout that version
3. Rebuild and redeploy
4. Verify health
5. Return to main branch

### Database Rollback

Database rollbacks are more complex. If a migration causes issues:

1. **Identify the problematic migration**
2. **Create a rollback migration** (e.g., `0007_rollback_feature.sql`)
3. **Test rollback migration in staging**
4. **Apply to production**

**Note:** D1 does not support automatic migration rollbacks. Always test migrations thoroughly in staging.

## Monitoring and Health Checks

### Health Check Endpoint

```
GET /v1/health
```

Returns:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-10-24T12:00:00.000Z",
    "version": "v1"
  },
  "meta": {
    "timestamp": "2025-10-24T12:00:00.000Z",
    "version": "v1"
  }
}
```

### Smoke Tests

After each deployment, smoke tests verify:
- Health endpoint responding
- CORS headers present
- 404 handling correct
- Auth endpoints responding
- Public endpoints accessible
- Protected endpoints secured
- Response format correct

### Performance Benchmarks

Performance tests validate:
- **P95 latency < 500ms** for profile views (per spec requirement)
- Health endpoint response time
- Gigs listing response time
- All critical paths meet performance targets

Run performance tests:

```bash
API_URL=https://api.umbrella.example.com npm run perf:check
```

### Monitoring Dashboard

Monitor your deployment health:

1. **Cloudflare Dashboard:**
   - Worker metrics
   - D1 query performance
   - KV operations
   - R2 bandwidth

2. **GitHub Actions:**
   - CI/CD pipeline status
   - Test results
   - Deployment history

3. **Custom Monitoring:**
   - Set up alerts for health check failures
   - Monitor P95 latency
   - Track error rates

## Troubleshooting

### Common Issues

**Issue: Deployment fails with "Invalid environment configuration"**
- Solution: Run `npm run validate:prod` to identify missing configuration

**Issue: Database migration fails**
- Solution: Check migration syntax with `npm run migrate:verify`
- Verify D1 database exists and is accessible

**Issue: Smoke tests fail after deployment**
- Solution: Check Cloudflare dashboard for errors
- Verify environment variables are set correctly
- Check worker logs for detailed error messages

**Issue: Performance tests fail (P95 > 500ms)**
- Solution: Review worker code for performance bottlenecks
- Check D1 query performance
- Verify KV cache is being used effectively

### Getting Help

1. Check the Cloudflare dashboard for error logs
2. Review GitHub Actions logs for deployment details
3. Run smoke tests manually to isolate issues
4. Contact the infrastructure team for assistance

## Security Considerations

- Never commit secrets to version control
- Use GitHub Secrets for sensitive configuration
- JWT_SECRET must be at least 32 characters
- Rotate secrets regularly
- Use Cloudflare Access for OAuth (no email/password auth)
- Validate all user input
- Enforce rate limiting (50 Violet prompts/day per D-062)
- Enforce storage quotas (50GB per artist per D-026)

## Performance Requirements

Per architecture specification:

- **P95 latency < 500ms** for profile views
- Message limit: 2000 characters (D-043)
- Violet rate limit: 50 prompts/day (D-062)
- Storage quota: 50GB per artist (D-026)
- Analytics: Updated at midnight UTC (D-008)

## Release Notes

### Release 1 (Current)

**Features:**
- OAuth authentication (Apple/Google only)
- 5-step onboarding flow
- Artist profile creation
- Track upload to R2
- Gig marketplace
- Single-click gig applications
- Direct messaging (2000 char limit)
- Text-only broadcasts
- Violet AI placeholder responses
- Analytics dashboard
- Search functionality

**Excluded from Release 1:**
- Violet AI real functionality (placeholder only)
- Email/password authentication
- Venue/Fan/Collective user types
- Social media import
- Review moderation
- Payment processing
- Real-time WebSocket messaging

---

For questions or issues, please contact the development team or open an issue on GitHub.
