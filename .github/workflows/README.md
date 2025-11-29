# CI/CD Workflows

GitHub Actions for testing and deploying to Cloudflare.

## Workflows

| File | Trigger | Purpose |
|------|---------|---------|
| `ci-cd.yml` | Push to any branch | Lint, type-check, test |
| `deploy-preview.yml` | PR opened/updated | Deploy preview environment |
| `deploy-staging.yml` | Push to `main` | Deploy to staging |
| `deploy.yml` | GitHub Release published | Deploy to production |
| `commitlint.yml` | All PRs | Validate commit messages |

## Environments

| Environment | Trigger | URL |
|-------------|---------|-----|
| Preview | PR opened | `https://umbrella-api-preview.teamumbrellainternal.workers.dev` |
| Staging | Merge to `main` | `https://umbrella-api-staging.teamumbrellainternal.workers.dev` |
| Production | GitHub Release | `https://umbrella-prod.teamumbrellainternal.workers.dev` |

**Public URL:** `https://app.umbrellalive.com`

## Deployment Flow

```
feature branch → PR opened → Preview deploy
                     ↓
              Merge to main → Staging deploy
                     ↓
            GitHub Release → Production deploy
```

## Secrets Configuration

### Repository Secrets (shared across all environments)

```
CLOUDFLARE_API_TOKEN      # Cloudflare API token
CLOUDFLARE_ACCOUNT_ID     # Cloudflare account ID
```

### Environment Secrets

Each GitHub environment (preview, staging, production) has its own secrets:

#### Clerk (Authentication)

| Secret | Preview | Staging | Production |
|--------|---------|---------|------------|
| `CLERK_SECRET_KEY` | Dev instance | Dev instance | Prod instance |
| `CLERK_PUBLISHABLE_KEY` | Dev instance | Dev instance | Prod instance |
| `CLERK_WEBHOOK_SECRET` | Dev instance | Dev instance | Prod instance |
| `VITE_CLERK_PUBLISHABLE_KEY` | Dev instance | Dev instance | Prod instance |

*Preview and Staging share the same Clerk Development instance. Production uses a separate Clerk Production instance (both under the same Clerk app).*

#### Claude (AI)

| Secret | All Environments |
|--------|------------------|
| `CLAUDE_API_KEY` | Same key |

#### Resend (Email)

| Secret | Preview | Staging | Production |
|--------|---------|---------|------------|
| `RESEND_API_KEY` | Dev key | Dev key | Prod key |

#### Pusher (Real-time)

| Secret | Local | Preview | Staging | Production |
|--------|-------|---------|---------|------------|
| `PUSHER_APP_ID` | Local | Preview | Staging | Prod |
| `PUSHER_KEY` | Local | Preview | Staging | Prod |
| `PUSHER_SECRET` | Local | Preview | Staging | Prod |
| `PUSHER_CLUSTER` | Local | Preview | Staging | Prod |
| `VITE_PUSHER_KEY` | Local | Preview | Staging | Prod |
| `VITE_PUSHER_CLUSTER` | Local | Preview | Staging | Prod |

*Each environment has its own Pusher app with separate credentials.*

#### PostHog (Analytics)

| Secret | Preview | Staging | Production |
|--------|---------|---------|------------|
| `VITE_PUBLIC_POSTHOG_KEY` | - | - | Prod only |
| `VITE_PUBLIC_POSTHOG_HOST` | - | - | Prod only |

*PostHog analytics only enabled in production.*

#### Retool (Admin Dashboards)

```
# Production only - Not implemented yet
```

#### Twilio (SMS)

```
TWILIO_ACCOUNT_SID      # Not implemented yet
TWILIO_AUTH_TOKEN       # Not implemented yet
TWILIO_PHONE_NUMBER     # Not implemented yet
```

#### Other

```
JWT_SECRET              # Per environment
```

## Manual Deployment

```bash
# Build
npm run build

# Deploy to specific environment
npx wrangler deploy --env preview
npx wrangler deploy --env staging
npx wrangler deploy --env production
```

## Commit Convention

Using [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: Add new feature
fix: Bug fix
docs: Documentation
chore: Maintenance
refactor: Code refactor
test: Add tests
```
