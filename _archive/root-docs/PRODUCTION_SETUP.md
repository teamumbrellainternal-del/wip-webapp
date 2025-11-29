# Production Setup Guide

**CRITICAL:** Complete these steps before deploying to production!

## Current Status

- ❌ Production D1 database: **Using dev database ID** (needs creation)
- ❌ Production KV namespace: **Using dev namespace ID** (needs creation)
- ❌ Production R2 bucket: **Not configured** (needs creation)
- ❌ Production secrets: **Not configured** (needs all 7 secrets)
- ✅ USE_MOCKS: Set to "false" (will use real services once secrets are configured)

---

## Step 1: Create Production D1 Database

```bash
# Create production database
wrangler d1 create umbrella-prod-db

# Output will show database_id - copy it!
# Example output:
# Created database umbrella-prod-db
# database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**Then update wrangler.toml line 178:**
```toml
database_id = "YOUR_PRODUCTION_DATABASE_ID_HERE"
```

**Run migrations:**
```bash
npm run migrate:prod
```

---

## Step 2: Create Production KV Namespace

```bash
# Create production KV namespace
wrangler kv:namespace create KV --env production

# Output will show id - copy it!
# Example output:
# Created namespace with id "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

**Then update wrangler.toml line 187:**
```toml
id = "YOUR_PRODUCTION_KV_NAMESPACE_ID_HERE"
```

---

## Step 3: Create Production R2 Bucket

```bash
# Create production R2 bucket
wrangler r2 bucket create umbrella-prod-media

# Configure CORS for presigned URLs
wrangler r2 bucket cors put umbrella-prod-media --file r2-cors.json
```

**Then uncomment wrangler.toml lines 189-192:**
```toml
[[env.production.r2_buckets]]
binding = "BUCKET"
bucket_name = "umbrella-prod-media"
```

---

## Step 4: Configure Production Secrets

**All secrets must be set via Wrangler CLI (never commit to git):**

### 4.1 Clerk Authentication
```bash
wrangler secret put CLERK_SECRET_KEY --env production
# Paste your secret key from https://dashboard.clerk.com

wrangler secret put CLERK_WEBHOOK_SECRET --env production
# Paste your webhook secret from Clerk dashboard
```

### 4.2 Resend Email Service
```bash
wrangler secret put RESEND_API_KEY --env production
# Get API key from https://resend.com/api-keys
```

### 4.3 Twilio SMS Service
```bash
wrangler secret put TWILIO_ACCOUNT_SID --env production
# Get from https://console.twilio.com

wrangler secret put TWILIO_AUTH_TOKEN --env production
# Get from Twilio console

wrangler secret put TWILIO_PHONE_NUMBER --env production
# Format: +1234567890 (E.164 format)
```

### 4.4 Claude AI (Anthropic)
```bash
wrangler secret put CLAUDE_API_KEY --env production
# Get from https://console.anthropic.com/settings/keys
```

### 4.5 (Optional) Sentry Error Tracking
```bash
wrangler secret put SENTRY_DSN --env production
# Get from https://sentry.io/settings/projects/
```

---

## Step 5: Verify Configuration

Run the environment validation script:

```bash
npm run validate:prod
```

This will check:
- ✅ All required secrets are set
- ✅ Database exists and is accessible
- ✅ KV namespace exists
- ✅ R2 bucket exists (if configured)
- ✅ USE_MOCKS is set to "false"

---

## Step 6: Deploy to Production

Once all steps above are complete:

```bash
# Build the application
npm run build

# Deploy to production
npm run deploy:prod

# Verify deployment
npm run verify:deployment
```

---

## Production Checklist

Before deploying to production, verify:

- [ ] Production D1 database created and ID updated in wrangler.toml
- [ ] Production KV namespace created and ID updated in wrangler.toml
- [ ] Production R2 bucket created and configured in wrangler.toml
- [ ] All 7 secrets configured via `wrangler secret put`
- [ ] USE_MOCKS set to "false" in wrangler.toml
- [ ] Database migrations applied (`npm run migrate:prod`)
- [ ] Environment validation passed (`npm run validate:prod`)
- [ ] All tests passing (`npm test`)
- [ ] TypeScript compilation successful (`npm run type-check`)
- [ ] Build succeeds (`npm run build`)

---

## Rollback Plan

If deployment fails:

```bash
# Rollback to previous version
npm run rollback

# Check deployment status
wrangler deployments list --env production
```

---

## Monitoring

After deployment:

1. **Check worker status:**
   - Visit Cloudflare dashboard → Workers & Pages
   - Monitor request metrics and error rates

2. **Verify health endpoint:**
   ```bash
   curl https://your-production-url.workers.dev/v1/health
   ```

3. **Run smoke tests:**
   ```bash
   API_URL=https://your-production-url.workers.dev npm run test:smoke
   ```

4. **Monitor Sentry** (if configured):
   - Visit https://sentry.io/organizations/your-org/issues/

---

## Troubleshooting

### "Database not found" error
- Verify database_id in wrangler.toml matches created database
- Run: `wrangler d1 list` to see all databases

### "KV namespace not found" error
- Verify namespace id in wrangler.toml matches created namespace
- Run: `wrangler kv:namespace list` to see all namespaces

### "Secret not found" error
- List secrets: `wrangler secret list --env production`
- Re-add missing secret: `wrangler secret put SECRET_NAME --env production`

### "R2 bucket not found" error
- List buckets: `wrangler r2 bucket list`
- Verify bucket name matches wrangler.toml configuration

---

## Important Notes

1. **Never commit secrets to git** - Always use `wrangler secret put`
2. **Test in staging first** - Deploy to staging environment before production
3. **Backup database** - No automated backups for D1, export data manually if critical
4. **Monitor costs** - R2 storage and egress have costs, set up billing alerts
5. **Custom domain** - Configure custom domain in wrangler.toml line 160 after DNS setup

---

## Support

For issues or questions:
- Check deployment logs: `wrangler tail --env production`
- View recent deployments: `wrangler deployments list --env production`
- Consult [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment procedures

---

**Last Updated:** 2025-11-22
**Status:** Production configuration ready, awaiting resource creation
