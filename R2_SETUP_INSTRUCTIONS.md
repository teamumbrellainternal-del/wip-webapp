# R2 Storage Service Setup Instructions

This document provides instructions for setting up the Cloudflare R2 storage service for the Umbrella application.

## Overview

The R2 storage service has been implemented with support for:
- ✅ Real R2 bucket integration via bucket binding
- ✅ Presigned URL generation for direct uploads/downloads (using AWS SigV4)
- ✅ Quota tracking (50GB per artist)
- ✅ File operations (upload, delete, list, metadata)
- ✅ Fallback to mock service when not configured

## Prerequisites

1. **Cloudflare Account** with R2 enabled
2. **Wrangler CLI** installed and authenticated
3. **Production Environment** ready for deployment

## Step 1: Create R2 Bucket

Create the production R2 bucket:

```bash
# Create production bucket
wrangler r2 bucket create umbrella-prod-media --env production

# Verify bucket was created
wrangler r2 bucket list
```

Expected output:
```
✅ Successfully created bucket "umbrella-prod-media"
```

## Step 2: Create R2 API Token

R2 API credentials are required for generating presigned URLs.

1. Go to Cloudflare Dashboard: https://dash.cloudflare.com
2. Navigate to **R2** → **Manage R2 API Tokens**
3. Click **Create API Token**
4. Configure token:
   - **Token name**: `umbrella-r2-presigned-urls`
   - **Permissions**: Read & Write
   - **Bucket scope**: `umbrella-prod-media` (or all buckets)
   - **TTL**: No expiry (or set to your preference)
5. Click **Create API Token**
6. **Save the credentials** (you won't be able to see them again):
   - Access Key ID
   - Secret Access Key

## Step 3: Set Secrets in Cloudflare

Set the R2 API credentials as secrets:

```bash
# Set R2 Access Key ID
wrangler secret put R2_ACCESS_KEY_ID --env production
# Paste the Access Key ID when prompted

# Set R2 Secret Access Key
wrangler secret put R2_SECRET_ACCESS_KEY --env production
# Paste the Secret Access Key when prompted

# Set R2 Account ID (find in Cloudflare dashboard)
wrangler secret put R2_ACCOUNT_ID --env production
# Paste your Cloudflare Account ID when prompted
```

**To find your Account ID:**
1. Go to Cloudflare Dashboard
2. Look in the URL: `https://dash.cloudflare.com/<account_id>/...`
3. Or go to **R2** → **Overview** and find it in the R2 bucket URL format

## Step 4: Verify Configuration

The production R2 bucket binding is already configured in `wrangler.toml`:

```toml
[[env.production.r2_buckets]]
binding = "BUCKET"
bucket_name = "umbrella-prod-media"
```

## Step 5: Test the Integration

### Enable Real Service

Set `USE_MOCKS = "false"` in production environment (already configured in `wrangler.toml`).

### Test Presigned URLs

1. Deploy to production:
   ```bash
   npm run deploy:prod
   ```

2. Test file upload flow:
   - Request upload URL from `/api/files/upload`
   - Upload file using presigned URL
   - Confirm upload

3. Check service status:
   ```bash
   curl https://your-production-url.com/api/status
   ```

   Should show:
   ```json
   {
     "mockMode": false,
     "services": {
       "storage": "real"
     }
   }
   ```

## Development Environment

The development environment can use the dev R2 bucket:

```toml
[[env.dev.r2_buckets]]
binding = "BUCKET"
bucket_name = "umbrella-dev-media"
```

For local development:
- R2 uses mock service by default (`USE_MOCKS = "true"`)
- To test with real R2 locally, create dev bucket and set credentials

## Service Architecture

### With R2 API Credentials (Recommended)

```
Client → API → R2 Service → aws4fetch → Presigned URL → Direct R2 Upload
```

**Benefits:**
- Direct upload to R2 (no proxy)
- Lower bandwidth costs
- Better performance
- Reduced Worker CPU usage

### Without R2 API Credentials (Fallback)

```
Client → API → R2 Service → Placeholder URLs
```

**Limitations:**
- Uses placeholder URLs (uploads won't work in production)
- Requires manual upload implementation
- Not recommended for production

## Troubleshooting

### Issue: "R2 API credentials not found"

**Cause:** R2 API credentials not set as secrets

**Solution:**
1. Verify secrets are set:
   ```bash
   wrangler secret list --env production
   ```
2. If missing, follow Step 3 to set secrets

### Issue: "Failed to generate signed URL"

**Cause:** Invalid R2 API credentials or account ID

**Solution:**
1. Verify credentials in Cloudflare dashboard
2. Regenerate API token if needed
3. Update secrets with new credentials

### Issue: "Bucket not found"

**Cause:** R2 bucket not created or wrong bucket name

**Solution:**
1. Verify bucket exists: `wrangler r2 bucket list`
2. Check `wrangler.toml` has correct bucket name
3. Create bucket if missing (Step 1)

### Issue: "Storage quota exceeded"

**Cause:** Artist has used 50GB quota

**Solution:**
1. Check quota usage via `/api/files/quota/:artistId`
2. Delete old files to free up space
3. Consider increasing quota limit if needed

## Storage Quotas

- **Per Artist:** 50GB (53,687,091,200 bytes)
- **Max File Size:** 100MB (104,857,600 bytes)
- **Upload URL TTL:** 15 minutes (900 seconds)
- **Download URL TTL:** 24 hours (86,400 seconds)

## File Organization

R2 bucket structure:

```
umbrella-prod-media/
├── profiles/{artistId}/        # Profile images
├── tracks/{artistId}/          # Audio files
├── media/{artistId}/           # Media files (video, images)
├── files/{artistId}/           # General files
└── attachments/{conversationId}/ # Conversation attachments
```

## Cost Management

Cloudflare R2 pricing (as of 2024):
- **Storage:** $0.015 per GB/month
- **Class A Operations** (writes): $4.50 per million requests
- **Class B Operations** (reads): $0.36 per million requests
- **Egress:** Free (no egress charges)

**Estimated costs for 1000 artists:**
- Storage: 1000 artists × 50GB × $0.015 = $750/month
- Operations: Varies by usage

## Security Notes

1. **Never commit secrets** - Always use `wrangler secret put`
2. **Rotate API tokens** - Regularly rotate R2 API tokens
3. **Use presigned URLs** - Never expose bucket credentials to clients
4. **Enforce quotas** - Quota limits prevent abuse

## Summary Checklist

Before deploying to production:

- [ ] R2 bucket created: `umbrella-prod-media`
- [ ] R2 API token created with Read & Write permissions
- [ ] Secrets set: `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ACCOUNT_ID`
- [ ] `wrangler.toml` configured with production bucket binding
- [ ] `USE_MOCKS = "false"` in production environment
- [ ] Service status endpoint returns `storage: "real"`
- [ ] Upload/download flows tested
- [ ] Quota tracking verified

---

**Last Updated:** 2025-01-22
**Feature Branch:** `claude/setup-real-r2-storage-1763865889`
**Implementation:** Real R2 storage service with AWS SigV4 presigned URLs
