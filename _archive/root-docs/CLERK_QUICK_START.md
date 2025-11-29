# Clerk Authentication - Quick Start Guide

**5-minute setup for local development**

## Step 1: Create Clerk Account

1. Go to [clerk.com](https://clerk.com) and sign up
2. Create a new application
3. Select **Google** as the only sign-in method
4. Use Clerk's shared OAuth credentials (for testing)

## Step 2: Get API Keys

From your Clerk Dashboard:
- Go to **"API Keys"**
- Copy:
  - `Publishable Key` (pk_test_...)
  - `Secret Key` (sk_test_...)

## Step 3: Configure Environment

**Backend** (`.dev.vars`):
```bash
cp .dev.vars.example .dev.vars
```

Add your Clerk keys to `.dev.vars`:
```bash
CLERK_SECRET_KEY=sk_test_XXXXXXXX
CLERK_PUBLISHABLE_KEY=pk_test_XXXXXXXX
CLERK_WEBHOOK_SECRET=whsec_XXXXXXXX  # Get this after Step 4
JWT_SECRET=any-random-string-here
```

**Frontend** (`.env.local`):
```bash
cp .env.example .env.local
```

Add to `.env.local`:
```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_XXXXXXXX
```

## Step 4: Set Up Webhook

1. In Clerk Dashboard → **"Webhooks"**
2. Click **"+ Add Endpoint"**
3. URL: `http://localhost:8787/v1/auth/webhook` (for local dev)
4. Subscribe to: `user.created`, `user.updated`, `user.deleted`
5. Copy the **"Signing Secret"** and add it to `.dev.vars` as `CLERK_WEBHOOK_SECRET`

## Step 5: Run Database Migration

```bash
npm run db:migrate
```

Or manually:
```bash
wrangler d1 execute umbrella-dev-db --local --file=./db/migrations/0007_clerk_integration.sql
```

## Step 6: Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5173/auth` and test Google sign-in!

---

## Testing the Flow

1. **Click "Sign in with Google"** on `/auth`
2. **Complete OAuth** → redirects to `/sso-callback`
3. **Webhook fires** → creates user in D1
4. **Redirects to** `/dashboard` or `/onboarding`

---

## Troubleshooting

**"User not found" error?**
- Webhook hasn't processed yet. Wait 2-3 seconds and refresh.
- Check Workers logs: `wrangler tail`

**"Invalid publishable key" error?**
- Make sure `.env.local` has `VITE_CLERK_PUBLISHABLE_KEY`
- Restart Vite dev server after adding env vars

**Webhook not receiving events?**
- Use [ngrok](https://ngrok.com) or [localtunnel](https://localtunnel.github.io) to expose localhost
- Update webhook URL in Clerk Dashboard to the public URL

---

## Next Steps

- Enable Apple OAuth in Clerk Dashboard (if needed)
- Configure custom Google OAuth credentials
- Set up production deployment

For detailed setup instructions, see [CLERK_SETUP.md](./CLERK_SETUP.md)
