# Umbrella MVP

Artist marketplace connecting musicians with venues.

## Overview

Umbrella is a full-stack marketplace platform that helps independent artists find gig opportunities and enables venues to discover local talent. Built on Cloudflare's edge infrastructure with a modern React frontend.

## Quick Start

### Prerequisites

- Node.js 20+ and npm 10+
- [Cloudflare account](https://dash.cloudflare.com/sign-up)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

### Setup

```bash
# Install dependencies
npm install

# Bootstrap Cloudflare resources (D1, KV, R2)
./scripts/setup-cloudflare.sh

# Update wrangler.toml with the resource IDs from above

# Run database migrations
npm run migrate

# Copy environment variables template
cp .dev.vars.example .dev.vars
# Edit .dev.vars with your API keys

# Start development servers (in separate terminals)
npm run dev           # Frontend (port 5173)
npm run dev:worker    # Backend Worker (port 8787)
```

Visit [http://localhost:5173](http://localhost:5173) to see the app.

## Demo Authentication

Currently using mock authentication for demo purposes:

**Mock Users:**
- **Apple Sign In**: Returns user with completed onboarding (Demo Artist, demo@umbrella.app)
- **Google Sign In**: Returns user needing onboarding (Test User, test@umbrella.app)

**Features:**
- Login screen with Apple/Google OAuth buttons
- Dashboard with user info, metrics, and gig opportunities
- Sign out functionality
- Theme toggle (light/dark mode)
- Session persistence via localStorage

**Implementation Files:**
- `src/lib/mock-auth.ts` - Mock authentication service
- `src/contexts/AuthContext.tsx` - Auth context provider
- `src/pages/LoginPage.tsx` - Login UI
- `src/pages/DashboardPage.tsx` - Dashboard UI

**Replacing with Real OAuth:**

To replace with real Cloudflare Access OAuth:
1. Configure Cloudflare Access with Apple/Google providers
2. Replace `MockAuthService` with real API calls to `/v1/auth/callback`
3. Update `AuthContext` to use real JWT tokens from backend
4. Remove localStorage session, use secure HTTP-only cookies
5. See `docs/backend-api-setup.md` for backend integration

## Development

### Available Scripts

```bash
npm run dev              # Start frontend dev server
npm run dev:worker       # Start Worker dev server
npm run build            # Build frontend and worker
npm run lint             # Lint code
npm run lint:fix         # Fix linting issues
npm run format           # Format code with Prettier
npm run type-check       # TypeScript type checking
npm run test             # Run tests (when implemented)
npm run migrate          # Run database migrations locally
npm run deploy           # Deploy to Cloudflare
```

### Project Structure

```
umbrella/
├── .github/workflows/   # CI/CD pipelines
├── api/                 # Cloudflare Worker API (Session 1)
├── db/migrations/       # D1 database migrations (Session 3)
├── docs/                # Documentation
├── scripts/             # Build and setup scripts
├── src/                 # React frontend (Session 2)
│   ├── components/      # UI components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities
│   └── pages/           # Page components
├── package.json         # Dependencies
├── vite.config.ts       # Vite configuration
├── tailwind.config.cjs  # Tailwind CSS configuration
└── wrangler.toml        # Cloudflare Worker configuration
```

## Architecture

### Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Cloudflare Workers (serverless API)
- **Database**: D1 (SQLite at the edge)
- **Storage**: R2 (S3-compatible object storage)
- **Cache**: KV (key-value store)
- **Auth**: Cloudflare Access (Apple/Google OAuth)

### Key Features (MVP)

1. **Artist Onboarding** - 6-step guided profile creation
2. **Marketplace** - Gig browsing with filters (location, genre, date)
3. **Profiles** - Rich artist profiles with portfolio, bio, reviews
4. **Messaging** - Direct messaging between artists and venues
5. **AI Toolkit (Violet)** - Claude-powered assistance for artists
6. **File Management** - 50GB storage for press photos, music, videos

## Documentation

Detailed documentation for each infrastructure component:

- [Backend API Setup](./docs/backend-api-setup.md) - Worker API, auth, routes
- [UI Foundation](./docs/ui-foundation.md) - Components, hooks, theming
- [Database Schema](./docs/database-schema.md) - Tables, migrations, models
- [DevOps & Build Config](./docs/devops-build-config.md) - CI/CD, workflows, configs

Architecture and engineering specifications:

- [Architecture Overview](./architecture.md) - System design and data model
- [Engineering Spec](./eng-spec.md) - Feature requirements and flows

## Deployment

### Environments

- **Preview** - Deployed on every PR
- **Staging** - Deployed on push to `staging` branch
- **Production** - Deployed on push to `main` branch

### GitHub Actions Workflows

All deployments are automated via GitHub Actions:

1. **PR Checks** - Linting, type checking, tests
2. **Deploy Preview** - Preview environment for PRs
3. **Deploy Staging** - Staging environment
4. **Deploy Production** - Production environment

### Manual Deployment

```bash
# Build everything
npm run build

# Deploy to preview
npx wrangler deploy --env preview

# Deploy to staging
npx wrangler deploy --env staging

# Deploy to production (requires approval)
npx wrangler deploy --env production
```

## Contributing

### Git Workflow

```
main (production)
  ↑
staging (pre-production)
  ↑
dev (development)
  ↑
feature/* (feature branches)
```

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: Add artist profile editing
fix: Resolve session timeout issue
docs: Update API documentation
chore: Upgrade dependencies
refactor: Simplify gig filtering logic
test: Add marketplace component tests
```

### Pull Request Process

1. Create a feature branch from `dev`
2. Make your changes with conventional commits
3. Open a PR against `dev`
4. CI runs checks and deploys preview environment
5. Get approval and merge
6. Changes deploy to staging, then production

## Manual Setup Steps

After running the setup script, you'll need to:

1. **Configure Cloudflare Access**
   - Set up Apple and Google OAuth providers
   - Configure JWT validation

2. **Set Secrets**
   ```bash
   wrangler secret put CLAUDE_API_KEY
   wrangler secret put RESEND_API_KEY
   wrangler secret put TWILIO_ACCOUNT_SID
   wrangler secret put TWILIO_AUTH_TOKEN
   wrangler secret put TWILIO_PHONE_NUMBER
   wrangler secret put JWT_SECRET
   ```

3. **Update GitHub Secrets**
   - `CLOUDFLARE_API_TOKEN` - For deployments
   - `ANTHROPIC_API_KEY` - For Claude Code workflow

## Troubleshooting

### Build Errors

```bash
# Check TypeScript errors
npm run type-check

# Check for missing dependencies
npm ci

# Clean and rebuild
npm run clean && npm install && npm run build
```

### Deployment Errors

- Verify `CLOUDFLARE_API_TOKEN` is set in GitHub secrets
- Check `wrangler.toml` has correct resource IDs
- Ensure migrations are applied: `npm run migrate:staging`

### Dev Server Issues

- Port 5173 (Vite) or 8787 (Worker) may be in use
- Check `.dev.vars` has required API keys
- Verify D1 database exists: `wrangler d1 list`

## License

Proprietary - All rights reserved

## Support

For issues or questions:
- Create an issue in this repository
- Contact the development team
- See the [documentation](./docs/) for detailed guides

