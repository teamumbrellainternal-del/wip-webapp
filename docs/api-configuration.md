# External Service API Configuration Guide

**Task 10.7: Configure External Service APIs**
**Last Updated:** 2025-11-17
**Status:** Complete

This guide provides comprehensive instructions for configuring all external service integrations for the Umbrella platform.

## Table of Contents

1. [Overview](#overview)
2. [Mock Mode vs. Production Mode](#mock-mode-vs-production-mode)
3. [Resend (Email Service)](#resend-email-service)
4. [Twilio (SMS Service)](#twilio-sms-service)
5. [Claude AI (Content Generation)](#claude-ai-content-generation)
6. [R2 Storage (File Storage)](#r2-storage-file-storage)
7. [Setting Secrets](#setting-secrets)
8. [Testing Configuration](#testing-configuration)
9. [Error Handling](#error-handling)
10. [Rate Limits and Quotas](#rate-limits-and-quotas)

---

## Overview

Umbrella integrates with four external services:

| Service | Purpose | Implementation Files | Spec References |
|---------|---------|---------------------|-----------------|
| **Resend** | Email notifications | `api/utils/email.ts` | General notifications |
| **Twilio** | SMS notifications | `api/utils/sms.ts` | D-045 (SMS for bookings) |
| **Claude AI** | Content generation | `api/utils/ai-prompts.ts` | D-058, D-059, D-066, D-074 |
| **R2 Storage** | File storage | `api/utils/storage.ts` | D-028 (24hr download links) |

All services support **mock mode** for development without requiring API keys or incurring costs.

---

## Mock Mode vs. Production Mode

### Mock Mode (Development)

Set `USE_MOCKS="true"` in `wrangler.toml` to enable mock mode:

```toml
[vars]
USE_MOCKS = "true"
```

**Behavior in mock mode:**
- All API calls are logged but not executed
- No actual emails, SMS, or AI requests are sent
- No API keys required
- Useful for development and testing without costs

### Production Mode

Set `USE_MOCKS="false"` and configure all required API secrets:

```toml
[env.production.vars]
USE_MOCKS = "false"
```

**Requirements:**
- All API keys must be configured via `wrangler secret put`
- External service accounts must be active
- Rate limits and quotas apply

---

## Resend (Email Service)

### Sign Up

1. Visit [https://resend.com](https://resend.com)
2. Create an account
3. Verify your domain (or use test domain for development)
4. Generate an API key from the dashboard

### Configuration

Set the API key as a secret:

```bash
# Production
wrangler secret put RESEND_API_KEY --env production

# Staging
wrangler secret put RESEND_API_KEY --env staging
```

### Email Templates

The following email templates are available in `api/utils/email.ts`:

1. **Gig Booking Confirmation** - Sent to artists when a gig is confirmed
2. **Gig Booking Notification** - Sent to venues when an artist books
3. **Message Notification** - Sent when users receive messages
4. **Welcome Email** - Sent to new users after signup

### Usage Example

```typescript
import { sendGigBookingConfirmation } from './utils/email'

const result = await sendGigBookingConfirmation(
  {
    recipientName: 'Artist Name',
    gigTitle: 'Friday Night Live',
    venueName: 'The Blue Note',
    gigDate: '2025-12-01',
    gigTime: '8:00 PM',
    paymentAmount: 500,
    bookingId: 'booking-123',
  },
  'artist@example.com',
  env
)

if (result.success) {
  console.log('Email sent:', result.messageId)
} else {
  console.error('Email failed:', result.error)
}
```

### Testing

Send a test email:

```typescript
import { sendTestEmail } from './utils/email'

await sendTestEmail('your-email@example.com', env)
```

### Rate Limits

- **Free tier:** 100 emails/day
- **Pro tier:** 50,000 emails/month
- Check current limits at [https://resend.com/pricing](https://resend.com/pricing)

---

## Twilio (SMS Service)

### Sign Up

1. Visit [https://www.twilio.com](https://www.twilio.com)
2. Create an account and verify your phone number
3. Get a Twilio phone number
4. Note your Account SID and Auth Token from the console

### Configuration

Set all three required secrets:

```bash
# Production
wrangler secret put TWILIO_ACCOUNT_SID --env production
wrangler secret put TWILIO_AUTH_TOKEN --env production
wrangler secret put TWILIO_PHONE_NUMBER --env production
```

**Phone Number Format:** Must be in E.164 format (e.g., `+12345678900`)

### SMS Templates

The following SMS templates are available in `api/utils/sms.ts`:

1. **Gig Booking Confirmation** (D-045) - Sent when gig is booked
2. **24-Hour Reminder** - Sent 24 hours before gig
3. **2-Hour Reminder** - Sent 2 hours before gig
4. **Booking Cancellation** - Sent when booking is cancelled
5. **Verification Code** - Sent for phone verification

### Usage Example

```typescript
import { sendGigBookingConfirmationSMS } from './utils/sms'

const result = await sendGigBookingConfirmationSMS(
  {
    recipientName: 'Artist Name',
    gigTitle: 'Friday Night Live',
    venueName: 'The Blue Note',
    gigDate: '2025-12-01',
    gigTime: '8:00 PM',
    bookingId: 'booking-123',
  },
  '+12345678900', // Recipient phone number
  env
)
```

### Testing

Send a test SMS:

```typescript
import { sendTestSMS } from './utils/sms'

await sendTestSMS('+12345678900', env)
```

### Rate Limits

- **Trial account:** Limited to verified numbers only
- **Paid account:** Based on your plan
- Check current limits at [https://www.twilio.com/pricing](https://www.twilio.com/pricing)

---

## Claude AI (Content Generation)

### Sign Up

1. Visit [https://console.anthropic.com](https://console.anthropic.com)
2. Create an account
3. Generate an API key from the console

### Configuration

Set the API key as a secret:

```bash
# Production
wrangler secret put CLAUDE_API_KEY --env production

# Staging
wrangler secret put CLAUDE_API_KEY --env staging
```

### Features

| Feature | Spec Reference | Function |
|---------|---------------|----------|
| Artist Bio Generation | D-058 | `generateArtistBio()` |
| Cover Letter Generation | D-074 | `generateCoverLetter()` |
| EPK Generation | D-066 | `generateEPK()` |
| Custom Content | - | `generateCustomContent()` |

### Token Tracking

**Token Limit:** 25,000 tokens/month per user (D-059)

Token usage is automatically tracked in KV storage:

```typescript
import { checkTokenLimit } from './utils/ai-prompts'

const tokenCheck = await checkTokenLimit(userId, env.KV)

if (!tokenCheck.allowed) {
  console.log(`Limit exceeded: ${tokenCheck.usage}/${tokenCheck.limit}`)
}
```

### Usage Example

```typescript
import { generateArtistBio } from './utils/ai-prompts'

const result = await generateArtistBio(
  {
    artistName: 'The Blue Notes',
    genres: ['Jazz', 'Blues'],
    location: 'New Orleans',
    yearsActive: 5,
    influences: ['Miles Davis', 'B.B. King'],
    style: 'Modern jazz with blues influences',
  },
  userId,
  env,
  env.KV,
  'medium' // short | medium | long
)

if (result.success) {
  console.log('Generated bio:', result.content)
  console.log('Tokens used:', result.tokensUsed)
}
```

### Testing

Test AI generation:

```typescript
const result = await generateCustomContent(
  'Write a short welcome message for a music platform',
  userId,
  env,
  env.KV
)
```

### Rate Limits

- **Token limit:** 25,000/month per user (enforced in app)
- **API rate limits:** Based on your Anthropic plan
- Check current limits at [https://docs.anthropic.com/en/api/rate-limits](https://docs.anthropic.com/en/api/rate-limits)

---

## R2 Storage (File Storage)

### Setup

R2 is Cloudflare's object storage (S3-compatible).

1. Enable R2 in your Cloudflare dashboard
2. Create buckets via Wrangler CLI

### Create Buckets

```bash
# Development bucket
wrangler r2 bucket create umbrella-dev-media

# Production bucket
wrangler r2 bucket create umbrella-prod
```

### Configure CORS

CORS configuration is required for presigned URLs:

```json
{
  "AllowedOrigins": ["https://umbrella.app", "https://*.umbrella.app"],
  "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
  "AllowedHeaders": ["*"],
  "ExposeHeaders": ["ETag", "Content-Length", "Content-Type"],
  "MaxAgeSeconds": 3600
}
```

Configure via Wrangler or Cloudflare Dashboard.

### Folder Structure

Recommended folder organization:

```
umbrella-prod/
├── avatars/           # User avatars
├── banners/           # Profile banners
├── tracks/            # Audio files
├── epk/              # EPK files
├── venues/           # Venue images
├── gigs/             # Gig posters
├── attachments/      # Message attachments
└── temp/             # Temporary files
```

### Usage Example

```typescript
import { uploadFile, generateDownloadURL } from './utils/storage'

// Upload a file
const uploadResult = await uploadFile(
  fileBuffer,
  {
    filename: 'avatar.jpg',
    contentType: 'image/jpeg',
    userId: 'user-123',
    folder: 'avatars',
  },
  env.BUCKET,
  env
)

// Generate download URL (24-hour expiry per D-028)
const downloadResult = await generateDownloadURL(
  uploadResult.key,
  env.BUCKET,
  env,
  86400 // 24 hours in seconds
)

console.log('Download URL:', downloadResult.url)
console.log('Expires at:', downloadResult.expiresAt)
```

### Signed URLs

**D-028 Requirement:** Download links must expire after 24 hours

```typescript
import { generateDownloadURL } from './utils/storage'

// Default: 24 hours (86400 seconds)
const result = await generateDownloadURL(fileKey, bucket, env)

// Custom expiry: 1 hour
const result = await generateDownloadURL(fileKey, bucket, env, 3600)
```

### Testing

```typescript
import { uploadFile } from './utils/storage'

// Mock mode - no actual upload
const result = await uploadFile(
  Buffer.from('test'),
  {
    filename: 'test.txt',
    contentType: 'text/plain',
    userId: 'test-user',
  },
  env.BUCKET,
  { USE_MOCKS: 'true' }
)
```

### Rate Limits

- **Storage:** Unlimited
- **Operations:** Class A (write): $4.50/million, Class B (read): $0.36/million
- Check current pricing at [https://developers.cloudflare.com/r2/pricing/](https://developers.cloudflare.com/r2/pricing/)

---

## Setting Secrets

### General Workflow

All secrets must be set via Wrangler CLI:

```bash
wrangler secret put <SECRET_NAME> --env <environment>
```

### Complete Secret Setup

```bash
# Production environment
wrangler secret put CLERK_SECRET_KEY --env production
wrangler secret put CLERK_WEBHOOK_SECRET --env production
wrangler secret put RESEND_API_KEY --env production
wrangler secret put TWILIO_ACCOUNT_SID --env production
wrangler secret put TWILIO_AUTH_TOKEN --env production
wrangler secret put TWILIO_PHONE_NUMBER --env production
wrangler secret put CLAUDE_API_KEY --env production

# Optional: Sentry for error tracking
wrangler secret put SENTRY_DSN --env production
```

### Verify Secrets

```bash
wrangler secret list --env production
```

### Delete Secrets

```bash
wrangler secret delete <SECRET_NAME> --env production
```

---

## Testing Configuration

### Test All Services

Create a test endpoint to verify all integrations:

```typescript
// api/routes/test-config.ts
import { sendTestEmail } from '../utils/email'
import { sendTestSMS } from '../utils/sms'
import { generateCustomContent } from '../utils/ai-prompts'
import { uploadFile } from '../utils/storage'

export async function testConfiguration(env: Env) {
  const results = {
    email: await sendTestEmail('test@example.com', env),
    sms: await sendTestSMS('+12345678900', env),
    ai: await generateCustomContent('Say hello', 'test-user', env, env.KV),
    storage: await uploadFile(
      Buffer.from('test'),
      { filename: 'test.txt', contentType: 'text/plain', userId: 'test' },
      env.BUCKET,
      env
    ),
  }

  return results
}
```

### Individual Service Tests

**Email:**
```bash
curl -X POST https://your-worker.workers.dev/v1/test/email
```

**SMS:**
```bash
curl -X POST https://your-worker.workers.dev/v1/test/sms
```

**AI:**
```bash
curl -X POST https://your-worker.workers.dev/v1/test/ai
```

---

## Error Handling

All utilities include comprehensive error handling:

### Email Errors

```typescript
const result = await sendEmail(emailData, env)

if (!result.success) {
  switch (result.error) {
    case 'RESEND_API_KEY is not configured':
      // API key missing
      break
    case 'Invalid email address':
      // Bad recipient
      break
    default:
      // Network or other error
      break
  }
}
```

### Token Limit Errors

```typescript
const result = await generateArtistBio(data, userId, env, env.KV)

if (!result.success && result.error?.includes('token limit exceeded')) {
  // User has exceeded monthly limit
  // Show upgrade prompt or wait until next month
}
```

### Storage Errors

```typescript
const result = await uploadFile(file, options, env.BUCKET, env)

if (!result.success) {
  if (result.error === 'File not found') {
    // File doesn't exist
  } else {
    // Upload failed
  }
}
```

---

## Rate Limits and Quotas

### Summary Table

| Service | Free Tier | Paid Tier | Hard Limits |
|---------|-----------|-----------|-------------|
| **Resend** | 100 emails/day | 50k emails/month | API rate limits apply |
| **Twilio** | Verified only | Based on plan | SMS rate limits apply |
| **Claude AI** | - | Based on plan | 25k tokens/month/user (app enforced) |
| **R2 Storage** | Unlimited | Unlimited | Operation costs apply |

### Monitoring Usage

Track usage in production:

```typescript
// Token usage for AI (stored in KV)
const tokenUsage = await env.KV.get(`token-usage:${userId}:${month}`)

// Email usage (check Resend dashboard)
// SMS usage (check Twilio dashboard)
// R2 usage (check Cloudflare dashboard)
```

---

## Production Checklist

Before deploying to production:

- [ ] All API keys configured via `wrangler secret put`
- [ ] `USE_MOCKS="false"` in production environment
- [ ] Email domain verified in Resend
- [ ] Twilio phone number purchased and verified
- [ ] Claude AI API key has sufficient credits
- [ ] R2 buckets created and CORS configured
- [ ] All test endpoints working
- [ ] Error tracking (Sentry) configured
- [ ] Rate limit monitoring in place

---

## Support and Resources

### Documentation Links

- **Resend:** [https://resend.com/docs](https://resend.com/docs)
- **Twilio:** [https://www.twilio.com/docs](https://www.twilio.com/docs)
- **Claude AI:** [https://docs.anthropic.com](https://docs.anthropic.com)
- **R2 Storage:** [https://developers.cloudflare.com/r2/](https://developers.cloudflare.com/r2/)

### Internal Documentation

- `api/utils/email.ts` - Email utility implementation
- `api/utils/sms.ts` - SMS utility implementation
- `api/utils/ai-prompts.ts` - AI utility implementation
- `api/utils/storage.ts` - R2 storage utility implementation
- `wrangler.toml` - Service configuration

### Troubleshooting

**Issue: "API key is not configured"**
- Solution: Run `wrangler secret put <KEY_NAME> --env production`

**Issue: Emails/SMS not sending**
- Solution: Check `USE_MOCKS` setting and verify API credentials

**Issue: Token limit exceeded**
- Solution: Wait until next month or implement token purchase system

**Issue: R2 upload fails**
- Solution: Verify CORS configuration and bucket permissions

---

**Last Updated:** 2025-11-17
**Completed By:** Task 10.7 implementation
**Next Steps:** Test all integrations in production environment
