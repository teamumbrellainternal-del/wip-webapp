# Cloudflare Resources Setup Guide

This document provides step-by-step instructions for setting up all required Cloudflare resources for Leger v0.1.0.

## Prerequisites

1. Cloudflare account (free or paid)
2. Wrangler CLI installed: `npm install -g wrangler`
3. Authenticated with Cloudflare: `wrangler login`

## Setup Checklist

- [ ] KV Namespaces created (LEGER_USERS, LEGER_SECRETS)
- [ ] R2 Bucket created (leger-static-sites)
- [ ] D1 Database created (leger-db)
- [ ] Database migrations applied
- [ ] Secrets configured (ENCRYPTION_KEY, JWT_SECRET)
- [ ] wrangler.toml updated with resource IDs
- [ ] GitHub secrets configured

---

## Step 1: Create KV Namespaces

KV namespaces store user data and encrypted secrets.

### Create Production Namespaces

```bash
# Create LEGER_USERS namespace
wrangler kv:namespace create "LEGER_USERS"

# Expected output:
# ⛅️ wrangler 4.33.1
# -------------------
# 🌀  Creating namespace with title "leger-app-LEGER_USERS"
# ✨  Success!
# Add the following to your wrangler.toml:
# [[kv_namespaces]]
# binding = "LEGER_USERS"
# id = "abc123def456..."

# Create LEGER_SECRETS namespace
wrangler kv:namespace create "LEGER_SECRETS"
```

**Copy the IDs** from the output and save them for later.

### Create Preview Namespaces

```bash
# Create preview namespace for LEGER_USERS
wrangler kv:namespace create "LEGER_USERS" --preview

# Create preview namespace for LEGER_SECRETS
wrangler kv:namespace create "LEGER_SECRETS" --preview
```

### Update wrangler.toml

Open `wrangler.toml` and replace the PLACEHOLDER values with your actual IDs:

```toml
[[kv_namespaces]]
binding = "LEGER_USERS"
id = "your-production-users-kv-id"

[[kv_namespaces]]
binding = "LEGER_USERS"
id = "your-preview-users-kv-id"
preview = true

[[kv_namespaces]]
binding = "LEGER_SECRETS"
id = "your-production-secrets-kv-id"

[[kv_namespaces]]
binding = "LEGER_SECRETS"
id = "your-preview-secrets-kv-id"
preview = true
```

---

## Step 2: Create R2 Bucket

R2 bucket will store rendered quadlet files in v0.2.0+. In v0.1.0, it's created but unused.

```bash
wrangler r2 bucket create leger-static-sites

# Expected output:
# ⛅️ wrangler 4.33.1
# -------------------
# Creating bucket 'leger-static-sites'
# Created bucket 'leger-static-sites'
```

**Note:** The bucket name `leger-static-sites` is already configured in `wrangler.toml`. No changes needed unless you want a different name.

---

## Step 3: Create D1 Database

D1 database stores users, releases, and future configuration data.

```bash
wrangler d1 create leger-db

# Expected output:
# ⛅️ wrangler 4.33.1
# -------------------
# ✅ Successfully created DB 'leger-db' in region WEUR
# Created your new D1 database.
#
# [[d1_databases]]
# binding = "LEGER_DB"
# database_name = "leger-db"
# database_id = "abc123-def456-ghi789..."
```

### Update wrangler.toml

Replace the PLACEHOLDER in `wrangler.toml`:

```toml
[[d1_databases]]
binding = "LEGER_DB"
database_name = "leger-db"
database_id = "your-database-id-here"
```

---

## Step 4: Apply Database Migrations

Run the initial migration to create all tables:

```bash
wrangler d1 execute leger-db --file=./db/migrations/0001_initial.sql

# Expected output:
# ⛅️ wrangler 4.33.1
# -------------------
# 🌀  Executing on remote database leger-db (abc123-def456-ghi789...):
# 🌀  To execute on your local development database, remove the --remote flag from your wrangler command.
# 
# ✅ Executed 0001_initial.sql successfully.
```

### Verify Tables Created

```bash
wrangler d1 execute leger-db --command="SELECT name FROM sqlite_master WHERE type='table';"

# Expected output should include:
# - users
# - releases
# - configurations
# - deployments
# - audit_log
```

---

## Step 5: Set Secrets

Secrets are encrypted at rest and never logged. They're only accessible to the Worker runtime.

### Generate Encryption Key

Generate a secure 256-bit key for AES-256-GCM encryption:

**Using OpenSSL (Linux/Mac):**
```bash
openssl rand -base64 32
```

**Using Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output (should look like: `dGhpcyBpcyBhIHRlc3Qga2V5IGZvciBkZW1vIHB1cnBvc2Vz`)

### Set ENCRYPTION_KEY

```bash
wrangler secret put ENCRYPTION_KEY

# You'll be prompted to enter the value:
# Enter a secret value:
# [paste your base64-encoded key]
# 
# ✨ Success! Uploaded secret ENCRYPTION_KEY
```

### Set JWT_SECRET

This secret must match the one configured in the Leger CLI.

```bash
wrangler secret put JWT_SECRET

# Enter a secret value:
# [enter your JWT secret - coordinate with CLI configuration]
# 
# ✨ Success! Uploaded secret JWT_SECRET
```

**Important:** The JWT_SECRET must be identical in both the CLI and the web app for authentication to work.

---

## Step 6: Configure GitHub Secrets

For automated deployment via GitHub Actions, add these secrets to your repository:

1. Go to your GitHub repository
2. Navigate to: **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

### Required Secrets

#### CLOUDFLARE_ACCOUNT_ID

Your Cloudflare account ID.

**Find it:**
- Log in to Cloudflare Dashboard
- Go to **Workers & Pages**
- Your Account ID is shown on the right sidebar

**Or via CLI:**
```bash
wrangler whoami
```

#### CLOUDFLARE_API_TOKEN

Create an API token with the following permissions:
- Account > Workers Scripts > Edit
- Account > Workers KV Storage > Edit
- Account > D1 > Edit
- Account > R2 Storage > Edit

**Create token:**
1. Cloudflare Dashboard → **My Profile** → **API Tokens**
2. Click **Create Token**
3. Use the "Edit Cloudflare Workers" template
4. Add D1 and R2 permissions
5. Create token and copy the value

#### ANTHROPIC_API_KEY (Optional)

Only needed if using Claude Code assistant for GitHub issues.

---

## Step 7: Local Development Setup

For local development with Wrangler, create a `.dev.vars` file:

```bash
# Copy the example file
cp .dev.vars.example .dev.vars
```

Edit `.dev.vars` and add your secrets:

```
ENCRYPTION_KEY=your-base64-encoded-key
JWT_SECRET=your-jwt-secret
```

**Important:** Never commit `.dev.vars` to version control. It's already in `.gitignore`.

---

## Verification

### Test Health Endpoint Locally

```bash
npm run dev

# In another terminal:
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "leger-app",
  "version": "0.1.0",
  "timestamp": "2025-10-17T12:34:56.789Z",
  "environment": "production"
}
```

### Deploy and Test

```bash
npm run deploy

# Test production health endpoint:
curl https://app.leger.run/health
```

---

## Troubleshooting

### KV Namespace Not Found

**Error:** `Error: No namespace found with id "..."`

**Solution:** Double-check the namespace ID in `wrangler.toml` matches the ID from `wrangler kv:namespace create`.

### D1 Database Not Found

**Error:** `Error: Database not found: leger-db`

**Solution:** Verify the database ID in `wrangler.toml` matches the ID from `wrangler d1 create`.

### Secret Not Set

**Error:** `Error: Secret ENCRYPTION_KEY not found`

**Solution:** Run `wrangler secret put ENCRYPTION_KEY` and enter the value.

### Deployment Fails

**Error:** Various deployment errors

**Solution:**
1. Check `wrangler deploy` output for specific errors
2. Verify all resources are created and configured
3. Check GitHub secrets are set correctly
4. Review GitHub Actions logs for detailed error messages

---

## Resource Limits

### Free Tier Limits

- **Workers:** 100,000 requests/day
- **KV:** 100,000 read operations/day, 1,000 write operations/day
- **D1:** 5 million rows read/day, 100,000 rows written/day
- **R2:** 10 GB storage, Class A operations: 1 million/month, Class B operations: 10 million/month

### Paid Plans

For production use with higher traffic, consider upgrading to:
- **Workers Paid** ($5/month): 10 million requests/month included
- **KV paid**: $0.50/month + usage
- **D1 paid**: $5/million rows read, $1/million rows written
- **R2 paid**: $0.015/GB storage

---

## Next Steps

After completing this setup:

1. ✅ All Cloudflare resources created
2. ✅ wrangler.toml configured
3. ✅ GitHub secrets set
4. ⬜ Continue with Issue #1: Initialize worker with health check endpoint

---

## Support

For issues with Cloudflare resources:
- Cloudflare Docs: https://developers.cloudflare.com
- Cloudflare Community: https://community.cloudflare.com
- Wrangler Docs: https://developers.cloudflare.com/workers/wrangler/

For Leger-specific issues:
- Open a GitHub issue in the Leger repository
