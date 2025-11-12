# Clerk Authentication Setup Guide

This guide walks you through setting up Clerk authentication with Google OAuth for the Umbrella application.

## Overview

The Umbrella app uses Clerk for authentication with the following setup:
- **Frontend**: Clerk React SDK with Google OAuth
- **Backend**: Clerk Backend SDK for token verification
- **Database**: D1 SQLite with user provisioning via webhooks
- **Session Management**: KV namespace for caching

---

## Prerequisites

1. A Clerk account (sign up at [clerk.com](https://clerk.com))
2. Google Cloud Console project with OAuth 2.0 credentials
3. Cloudflare Workers account with D1 and KV
4. Node.js 18+ and npm

---

## Part 1: Clerk Dashboard Configuration

### 1.1 Create Clerk Application

1. Log in to [Clerk Dashboard](https://dashboard.clerk.com)
2. Click **"+ Create Application"**
3. Name: `Umbrella` (or your preferred name)
4. Select **"Google"** as the only sign-in method
5. Uncheck all other authentication methods (Email, Phone, Apple, etc.)
6. Click **"Create Application"**

### 1.2 Configure Google OAuth

1. In your Clerk application, go to **"Authentication" → "Social Connections"**
2. Click on **"Google"**
3. Choose between:
   - **Shared OAuth credentials** (Clerk-provided, for testing)
   - **Custom OAuth credentials** (recommended for production)

#### Using Custom Google OAuth Credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Navigate to **"APIs & Services" → "Credentials"**
4. Click **"+ CREATE CREDENTIALS" → "OAuth 2.0 Client ID"**
5. Application type: **"Web application"**
6. Add authorized redirect URIs:
   ```
   https://your-app.clerk.accounts.dev/v1/oauth_callback
   https://accounts.google.com/o/oauth2/auth
   ```
7. Copy the **Client ID** and **Client Secret**
8. Paste them into Clerk's Google OAuth settings
9. Click **"Save"**

### 1.3 Configure Session Settings

1. Go to **"Sessions"** in Clerk Dashboard
2. Set session duration: **7 days** (default)
3. Enable **"Refresh tokens"** for seamless re-authentication
4. Save settings

### 1.4 Get API Keys

1. Go to **"API Keys"** in Clerk Dashboard
2. Copy the following values:
   - **Publishable Key** (starts with `pk_test_...` or `pk_live_...`)
   - **Secret Key** (starts with `sk_test_...` or `sk_live_...`)
3. Keep these safe - you'll need them for environment configuration

---

## Part 2: Webhook Configuration

Webhooks automatically provision users in your D1 database when they sign up via Clerk.

### 2.1 Create Webhook Endpoint

1. In Clerk Dashboard, go to **"Webhooks"**
2. Click **"+ Add Endpoint"**
3. Enter your webhook URL:
   ```
   https://your-workers-domain.workers.dev/v1/auth/webhook
   ```
4. Subscribe to these events:
   - `user.created` ✅
   - `user.updated` ✅
   - `user.deleted` ✅
5. Click **"Create"**

### 2.2 Get Webhook Secret

1. After creating the webhook, click on it
2. Copy the **"Signing Secret"** (starts with `whsec_...`)
3. Save this for environment configuration

### 2.3 Test Webhook (Optional)

1. In the webhook details page, click **"Testing"**
2. Send a test `user.created` event
3. Check your Workers logs to verify it was received

---

## Part 3: Environment Configuration

### 3.1 Backend Configuration (Cloudflare Workers)

1. Copy `.dev.vars.example` to `.dev.vars`:
   ```bash
   cp .dev.vars.example .dev.vars
   ```

2. Fill in Clerk credentials in `.dev.vars`:
   ```bash
   # Clerk Authentication
   CLERK_SECRET_KEY=sk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   CLERK_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   CLERK_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

   # JWT Secret (legacy, can leave as-is)
   JWT_SECRET=your-jwt-secret-here-use-a-long-random-string

   # Other services (fill in as needed)
   CLAUDE_API_KEY=sk-ant-api03-...
   RESEND_API_KEY=re_...
   TWILIO_ACCOUNT_SID=AC...
   TWILIO_AUTH_TOKEN=...
   TWILIO_PHONE_NUMBER=+1...
   ```

3. For production, add secrets to Cloudflare:
   ```bash
   # Add each secret individually
   wrangler secret put CLERK_SECRET_KEY
   wrangler secret put CLERK_PUBLISHABLE_KEY
   wrangler secret put CLERK_WEBHOOK_SECRET
   ```

### 3.2 Frontend Configuration (Vite)

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in the Clerk publishable key:
   ```bash
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

3. For production, set this in your deployment platform (Cloudflare Pages, Vercel, etc.)

---

## Part 4: Database Migration

### 4.1 Run Migration

Apply the Clerk integration migration to add the `clerk_id` column:

```bash
# Local development
wrangler d1 execute umbrella-dev-db --local --file=./db/migrations/0007_clerk_integration.sql

# Production
wrangler d1 execute umbrella-dev-db --file=./db/migrations/0007_clerk_integration.sql
```

### 4.2 Verify Migration

Check that the `clerk_id` column was added:

```bash
wrangler d1 execute umbrella-dev-db --command="PRAGMA table_info(users);"
```

You should see a `clerk_id` column with type `TEXT`.

---

## Part 5: Testing the Integration

### 5.1 Start Development Server

```bash
# Terminal 1: Start Cloudflare Workers
npm run dev

# Terminal 2: Start Vite frontend (if separate)
npm run dev:client
```

### 5.2 Test Sign-In Flow

1. Navigate to `http://localhost:5173/auth` (or your dev URL)
2. Click **"Sign in with Google"**
3. Complete Google OAuth consent
4. You should be redirected to `/sso-callback`
5. After callback processing, you'll land on `/dashboard` or `/onboarding`

### 5.3 Verify Webhook

1. Check your Workers logs:
   ```bash
   wrangler tail
   ```

2. Look for webhook events:
   ```
   [INFO] Webhook received: user.created
   [INFO] Created user <user_id> for Clerk ID <clerk_id>
   ```

3. Query the database to verify user creation:
   ```bash
   wrangler d1 execute umbrella-dev-db --command="SELECT * FROM users WHERE clerk_id IS NOT NULL;"
   ```

### 5.4 Test Protected Routes

1. Navigate to `/v1/profile` (or any protected route)
2. Without a session: You should get a 401 error
3. With a valid session: Request should succeed

---

## Part 6: Production Deployment

### 6.1 Update Redirect URLs

1. In Clerk Dashboard, go to **"Domains"**
2. Add your production domain:
   ```
   https://umbrella.app
   ```

3. Update Google OAuth redirect URIs:
   ```
   https://your-production-domain.clerk.accounts.dev/v1/oauth_callback
   ```

### 6.2 Update Webhook URL

1. In Clerk Dashboard, go to **"Webhooks"**
2. Edit your webhook endpoint
3. Update URL to production:
   ```
   https://umbrella.app/v1/auth/webhook
   ```

### 6.3 Switch to Production Keys

1. In Clerk Dashboard, go to **"API Keys"**
2. Toggle from **"Development"** to **"Production"**
3. Copy the production keys (start with `pk_live_...` and `sk_live_...`)
4. Update your Cloudflare secrets:
   ```bash
   wrangler secret put CLERK_SECRET_KEY --env production
   wrangler secret put CLERK_PUBLISHABLE_KEY --env production
   wrangler secret put CLERK_WEBHOOK_SECRET --env production
   ```

### 6.4 Deploy

```bash
# Deploy Workers API
npm run deploy

# Deploy frontend (if using Cloudflare Pages)
npm run build
wrangler pages deploy ./dist
```

---

## Part 7: Monitoring & Maintenance

### 7.1 Monitor User Sign-Ups

- **Clerk Dashboard**: Go to "Users" to see all registered users
- **D1 Database**: Query users table to verify webhook provisioning
- **Workers Logs**: Use `wrangler tail` to monitor authentication events

### 7.2 Handle Webhook Failures

If a webhook fails (e.g., user exists in Clerk but not in your DB):

1. Check webhook delivery logs in Clerk Dashboard
2. Retry failed webhooks manually if needed
3. For data consistency, you can manually sync:
   ```sql
   -- Check Clerk users vs DB users
   SELECT * FROM users WHERE clerk_id IS NULL;
   ```

### 7.3 Monthly Active Users (MAU)

- Only users who sign in count toward Clerk's MAU billing
- Inactive users don't consume MAU slots
- Monitor usage in Clerk Dashboard → "Billing"

---

## Troubleshooting

### Issue: "User not found" after sign-in

**Cause**: Webhook hasn't processed yet or failed

**Solution**:
1. Check Clerk webhook logs for errors
2. Verify webhook secret is correct
3. Manually trigger webhook retry in Clerk Dashboard
4. Check Workers logs for errors

### Issue: "Invalid token" errors

**Cause**: Mismatched secret keys or token expiration

**Solution**:
1. Verify `CLERK_SECRET_KEY` matches Clerk Dashboard
2. Check token expiration settings in Clerk
3. Clear browser cookies and try again
4. Use Clerk's token verification tool in Dashboard

### Issue: OAuth redirect fails

**Cause**: Incorrect redirect URLs in Google/Clerk

**Solution**:
1. Verify Google OAuth redirect URIs include Clerk's callback URL
2. Check Clerk's allowed redirect URLs in Dashboard
3. Ensure your app domain is configured in Clerk

### Issue: Webhook signature verification fails

**Cause**: Incorrect webhook secret

**Solution**:
1. Copy the webhook secret from Clerk Dashboard
2. Update `CLERK_WEBHOOK_SECRET` in your environment
3. Redeploy your Workers

---

## Security Best Practices

1. **Never commit secrets**: Keep `.dev.vars` and `.env.local` in `.gitignore`
2. **Use HTTPS in production**: Clerk requires HTTPS for OAuth callbacks
3. **Rotate secrets regularly**: Update API keys every 90 days
4. **Monitor failed login attempts**: Enable Clerk's security features
5. **Use production keys in production**: Never use test keys in live environments

---

## Additional Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk React SDK](https://clerk.com/docs/references/react/overview)
- [Clerk Webhooks](https://clerk.com/docs/integrations/webhooks)
- [Google OAuth Setup](https://support.google.com/cloud/answer/6158849)
- [Cloudflare Workers Secrets](https://developers.cloudflare.com/workers/configuration/secrets/)

---

## Support

For issues with:
- **Clerk**: Contact [support@clerk.com](mailto:support@clerk.com) or visit [clerk.com/support](https://clerk.com/support)
- **Umbrella App**: Open an issue in the GitHub repository
- **Cloudflare**: Visit [community.cloudflare.com](https://community.cloudflare.com)

---

**Last Updated**: 2025-11-12
**Clerk Version**: Latest
**Supported OAuth Providers**: Google (Apple can be enabled if needed)
