# Application Secrets Configuration

This document lists all environment variables and secrets required for the application to function in deployed environments (Preview, Staging, Production).

## Required Secrets

These secrets must be configured in the GitHub repository secrets and will be automatically synced to Cloudflare Workers during deployment.

| Secret Name | Description | Required In |
|-------------|-------------|-------------|
| `CLERK_SECRET_KEY` | Backend API key for Clerk authentication | All Envs |
| `CLERK_PUBLISHABLE_KEY` | Frontend API key for Clerk (needed for validation) | All Envs |
| `CLERK_WEBHOOK_SECRET` | Secret to verify webhooks from Clerk | All Envs |
| `JWT_SECRET` | Secret key for manual JWT signing/verification | All Envs |
| `CLAUDE_API_KEY` | API key for Anthropic Claude AI service | All Envs* |
| `RESEND_API_KEY` | API key for Resend email service | All Envs* |
| `TWILIO_ACCOUNT_SID` | Account SID for Twilio SMS | All Envs* |
| `TWILIO_AUTH_TOKEN` | Auth Token for Twilio SMS | All Envs* |
| `TWILIO_PHONE_NUMBER` | Sending phone number for Twilio | All Envs* |

\* *These services can be mocked in development/preview if `USE_MOCKS=true`, but strict environment validation requires them to be present if `USE_MOCKS=false`.*

## Environment Variables (Non-Secret)

These are configured in `wrangler.toml`.

| Variable | Description | Values |
|----------|-------------|--------|
| `USE_MOCKS` | Enable mock services | `true` / `false` |
| `ENVIRONMENT` | Environment name | `development`, `preview`, `staging`, `production` |
| `AUTHORIZED_ORIGINS` | Allowed origins for auth | Comma-separated URLs |

## Adding a New Secret

1. Add the secret to GitHub Repository Secrets.
2. Add the secret to the `Sync Worker Secrets` step in:
   - `.github/workflows/deploy.yml`
   - `.github/workflows/deploy-preview.yml`
   - `.github/workflows/deploy-staging.yml`
3. Update this documentation.

