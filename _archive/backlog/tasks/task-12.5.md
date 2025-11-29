---
id: task-11.5
title: "Set Up Preview Environment"
status: "To Do"
assignee: []
created_date: "2025-11-16"
labels: ["devops", "P1", "deployment"]
milestone: "M11 - Documentation & Developer Tooling"
dependencies: []
estimated_hours: null
---

## Description
Configure and deploy a preview environment (preview.umbrella.app) that allows the client to test new features before they go to production. Set up separate Cloudflare resources (Workers, D1, KV, R2) for the preview branch with feature flagging support.

## Acceptance Criteria
- [ ] Preview environment configured in wrangler.toml
- [ ] Separate D1 database for preview (umbrella-preview-db)
- [ ] Separate KV namespace for preview
- [ ] Separate R2 bucket for preview (or shared with path prefix)
- [ ] Preview Worker deployed to preview.umbrella.workers.dev
- [ ] Custom domain preview.umbrella.app configured (optional)
- [ ] Environment variable to toggle preview mode in code
- [ ] Client access documentation (how to access preview features)
- [ ] Deployment script: npm run deploy:preview
- [ ] Database migrations automatically applied to preview on deploy

## Implementation Plan

### 1. Configure wrangler.toml for Preview Environment
```toml
# Add preview environment
[env.preview]
name = "umbrella-preview"
workers_dev = true  # Use workers.dev subdomain
# OR set custom route:
# route = "preview.umbrella.app/*"

[[env.preview.d1_databases]]
binding = "DB"
database_name = "umbrella-preview-db"
database_id = "xxx"  # Create via: wrangler d1 create umbrella-preview-db

[[env.preview.kv_namespaces]]
binding = "KV"
id = "xxx"  # Create via: wrangler kv:namespace create "preview-kv"

[[env.preview.r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "umbrella-preview"  # Create via: wrangler r2 bucket create umbrella-preview

# Preview uses same secrets as production initially
# Can override with: wrangler secret put --env preview SECRET_NAME
```

### 2. Create Preview Database
```bash
# Create D1 database for preview
wrangler d1 create umbrella-preview-db

# Apply migrations to preview database
wrangler d1 migrations apply umbrella-preview-db --env preview

# Seed with production data (if needed)
wrangler d1 execute umbrella-preview-db --env preview --file=db/seed-production.sql
```

### 3. Create Preview KV and R2
```bash
# Create KV namespace
wrangler kv:namespace create "preview-kv" --env preview

# Create R2 bucket
wrangler r2 bucket create umbrella-preview --env preview

# Configure CORS for R2 (same as production)
wrangler r2 bucket cors put umbrella-preview --env preview --cors-config=r2-cors.json
```

### 4. Add Preview Detection in Code
```typescript
// api/utils/env.ts
export function isPreview(env: Env): boolean {
  return env.ENVIRONMENT === 'preview'
}

// Example usage in routes
if (isPreview(env)) {
  console.log('[PREVIEW MODE] New feature enabled')
  // Enable preview-only features
}
```

### 5. Create Deployment Scripts
```json
// package.json
{
  "scripts": {
    "deploy:preview": "wrangler deploy --env preview",
    "migrate:preview": "wrangler d1 migrations apply umbrella-preview-db --env preview",
    "seed:preview": "wrangler d1 execute umbrella-preview-db --env preview --file=db/seed.sql"
  }
}
```

### 6. Set Up Custom Domain (Optional)
```bash
# Add DNS record in Cloudflare dashboard:
# Type: CNAME
# Name: preview
# Target: umbrella-preview.workers.dev

# Or configure route in wrangler.toml:
# [env.preview]
# route = "preview.umbrella.app/*"
```

### 7. Create Client Access Documentation
```markdown
# docs/PREVIEW_ENVIRONMENT.md

## Accessing Preview Features

The preview environment is available at:
- **URL:** https://umbrella-preview.workers.dev
- **OR:** https://preview.umbrella.app (if custom domain configured)

## What's Different in Preview?
- Separate database (your data won't affect production)
- Latest features from `main` branch before production release
- May have bugs or incomplete features
- Reset periodically (data not permanent)

## How to Test
1. Visit preview.umbrella.app
2. Sign in with test account: test@umbrella.app (password: TestPreview123)
3. Test new features marked with "PREVIEW" badge
4. Report bugs via Slack or email

## For Developers
Deploy to preview:
```bash
npm run deploy:preview
```

Reset preview database:
```bash
npm run migrate:preview
npm run seed:preview
```
```

### 8. Test Preview Deployment
```bash
# Deploy to preview
npm run deploy:preview

# Verify deployment
curl https://umbrella-preview.workers.dev/health

# Test with actual request
curl https://umbrella-preview.workers.dev/v1/auth/session
```

### 9. Set Up Auto-Deploy (Optional)
```yaml
# .github/workflows/deploy-preview.yml
name: Deploy Preview

on:
  push:
    branches: [main]

jobs:
  deploy-preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Deploy to preview
        run: npm run deploy:preview
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
      
      - name: Run migrations
        run: npm run migrate:preview
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

## Notes & Comments
**References:**
- wrangler.toml - Environment configuration
- docs/initial-spec/architecture.md - Deployment architecture
- Cloudflare docs - Multi-environment setup

**Priority:** P1 - Enables safe client testing
**File:** wrangler.toml, docs/PREVIEW_ENVIRONMENT.md
**Can Run Parallel With:** task-11.1, task-11.2, task-11.3, task-11.4

**Why This Matters:**
Post-MVP, client will want to test changes before they go live. Preview environment provides:
1. Safe testing (separate database, won't break production)
2. Early feedback (catch issues before production deploy)
3. Confidence (client approves changes before release)

**Example Workflow:**
```
Developer: [Makes change on feature branch]
Developer: [Merges to main]
GitHub Actions: [Auto-deploys to preview.umbrella.app]
Client: [Tests on preview]
Client: "Looks good!" OR "Bug: fix X"
Developer: [Fixes if needed, redeploys to preview]
Client: "Approved!"
Developer: [Deploys to production]
```

**Cost Considerations:**
- Preview resources are FREE on Cloudflare's free tier (within limits)
- D1: 5GB storage, 5M rows reads/day
- KV: 100K reads/day, 1K writes/day
- R2: 10GB storage, 1M read operations/month
- Workers: 100K requests/day

Preview environment stays well within these limits unless client is heavily testing.
