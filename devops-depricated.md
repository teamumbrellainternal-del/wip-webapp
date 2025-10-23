# devops

# Umbrella MVP - DevOps Guide

**Version:** 1.0

**Last Updated:** October 14, 2025

**Target Timeline:** 6-week MVP (v0.1 → v1.0)

**Team:** CTO + 3 Developers (Dev A: FE/UI, Dev B: FS/Marketplace, Dev C: Backend/API)

---

## Table of Contents

1. [Overview](about:blank#overview)
2. [Repository Structure](about:blank#repository-structure)
3. [GitHub Workflows](about:blank#github-workflows)
4. [Branch Strategy & Protection](about:blank#branch-strategy--protection)
5. [Secrets Management](about:blank#secrets-management)
6. [Service Configuration](about:blank#service-configuration)
7. [Developer Onboarding](about:blank#developer-onboarding)
8. [Deployment Process](about:blank#deployment-process)
9. [Demo Cadence Workflow](about:blank#demo-cadence-workflow)
10. [Monitoring & Debugging](about:blank#monitoring--debugging)
11. [Troubleshooting Guide](about:blank#troubleshooting-guide)
12. [Appendix: Complete Workflow Files](about:blank#appendix-complete-workflow-files)

---

## Overview

### DevOps Philosophy

Umbrella’s DevOps workflow is built on three core principles:

1. **Demo-First Development**: Weekly demos drive progress and accountability
2. **Automated Versioning**: Conventional Commits + release-please eliminate manual releases
3. **High-Touch Collaboration**: Small team, clear ownership, peer reviews

### Key Components

- **Version Control**: GitHub with 5 specialized repositories
- **CI/CD**: GitHub Actions for automated testing and deployment
- **Infrastructure**: Cloudflare (Workers, D1, KV, R2, Pages, Access)
- **External Services**: Resend (email), Twilio (SMS), Claude API (AI)
- **Development Flow**: Feature branches → `dev` (staging) → `main` (production)

### Versioning Strategy

Umbrella uses **semantic versioning** aligned with development milestones:

- **v0.1** - Foundations & CI (repo setup, auth stub, DB schema)
- **v0.2** - Auth & DB bring-up (working login, profile CRUD)
- **v0.3** - Visualize Profile & Marketplace (UI complete, no backend)
- **v0.4** - Comms & Violet stubs (email/SMS working, Violet navigation)
- **v0.5** - Marketplace API & E2E paths (full marketplace flow)
- **v1.0** - MVP hardening & release (polish, docs, demo)

Each milestone requires ≥90% of issues complete before progressing to the next.

---

## Repository Structure

### Organization: `umbrella-live`

All repositories live under a single GitHub organization for centralized management.

### Repository 1: `umbrella` (Main Application)

**Purpose**: Primary application codebase (Vite SPA + Cloudflare Workers)

**Directory Structure**:

```
umbrella/
├── .github/
│   └── workflows/          # GitHub Actions workflows
├── src/
│   ├── components/         # React components
│   ├── pages/             # Page-level components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities and helpers
│   └── styles/            # Global styles
├── workers/
│   ├── api/               # API endpoints (Cloudflare Workers)
│   ├── cron/              # Scheduled jobs
│   └── middleware/        # Auth, error handling
├── migrations/
│   └── *.sql              # D1 database migrations
├── docs/
│   ├── architecture.md
│   ├── data-model.md
│   └── api-contracts/
├── wrangler.toml          # Cloudflare configuration
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .env.example           # Template for local dev
├── .gitignore
├── README.md
└── CONTRIBUTING.md
```

**Key Files**:
- `wrangler.toml`: Defines dev/staging/prod environments
- `package.json`: Dependencies and scripts
- `.env.example`: Template for required environment variables

**Workflows Needed**:
- PR checks (lint, test, build)
- Deploy preview (Cloudflare Pages preview)
- Deploy staging (on push to `dev`)
- Deploy production (on push to `main`)
- release-please (version bumping)
- claude-code (enforce issue references)
- commitlint (enforce Conventional Commits)

---

### Repository 2: `components` (Design System)

**Purpose**: Shared UI component library

**Directory Structure**:

```
components/
├── src/
│   ├── components/
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Input/
│   │   ├── Modal/
│   │   └── Toast/
│   └── tokens/            # Design tokens
├── stories/               # Storybook stories (optional)
├── package.json
├── tsconfig.json
└── README.md
```

**Publishing Strategy**:
- Publish to npm as `@umbrella/components` (OR use git submodule/import)
- Version independently from main app

**Workflows Needed**:
- PR checks (lint, test, build)
- Publish to npm (on release)
- Deploy Storybook (optional, for visual documentation)

---

### Repository 3: `marketplace` (Marketplace Module)

**Purpose**: Marketplace-specific UI and logic (owned by Dev B)

**Directory Structure**:

```
marketplace/
├── src/
│   ├── components/
│   │   ├── GigCard/
│   │   ├── ArtistCard/
│   │   ├── FilterBar/
│   │   └── SearchBar/
│   ├── hooks/
│   └── utils/
├── package.json
└── README.md
```

**Integration Strategy**:
- May be merged into `umbrella` repo post-MVP
- For MVP, developed separately to allow Dev B to work independently

**Workflows Needed**:
- PR checks (lint, test)

---

### Repository 4: `violet-ai` (Violet AI Module)

**Purpose**: Violet AI toolkit navigation and prompt handling

**Directory Structure**:

```
violet-ai/
├── src/
│   ├── components/
│   │   ├── ToolkitNav/
│   │   ├── IntentPicker/
│   │   └── PromptTemplates/
│   ├── api/
│   │   └── claude-proxy.ts   # Claude API integration
│   └── config/
│       └── toolkit-taxonomy.ts  # 10 categories, 30+ tools
├── package.json
└── README.md
```

**Integration Strategy**:
- Lazy-loaded module in `umbrella` (to optimize initial bundle size)
- Claude API calls proxied through Cloudflare Worker

**Workflows Needed**:
- PR checks (lint, test)

---

### Repository 5: `docs` (Documentation Hub)

**Purpose**: All project documentation

**Directory Structure**:

```
docs/
├── docs/
│   ├── index.md
│   ├── architecture.md
│   ├── data-model.md
│   ├── devops.md            # This file
│   ├── spec/
│   │   └── umbrella-prd-v2.md
│   ├── contracts/
│   │   ├── auth-api.md
│   │   ├── marketplace-api.md
│   │   └── violet-api.md
│   └── ops/
│       ├── logging.md
│       ├── metrics.md
│       └── alerting.md
├── .vitepress/              # VitePress config (optional)
│   └── config.ts
├── package.json
└── README.md
```

**Deployment Strategy**:
- Option 1: Deploy VitePress site to Cloudflare Pages
- Option 2: Serve raw markdown from GitHub Pages

**Workflows Needed**:
- Deploy documentation site (on push to `main`)

---

### `.gitignore` Templates

**For `umbrella`, `marketplace`, `violet-ai`**:

```
# Dependencies
node_modules/
.pnpm-store/

# Build outputs
dist/
.output/
.wrangler/

# Environment variables
.env
.env.local
.dev.vars

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
pnpm-debug.log*

# Testing
coverage/
.nyc_output/

# Temporary files
*.tmp
.cache/
```

**For `components`**:

```
node_modules/
dist/
.pnpm-store/
.DS_Store
*.log
storybook-static/
```

**For `docs`**:

```
node_modules/
.vitepress/cache/
.vitepress/dist/
.DS_Store
*.log
```

---

### README.md Templates

**Template for `umbrella/README.md`**:

```markdown
# Umbrella - Music Industry Platform**Version**: [Current Version from package.json]
**Status**: MVP Development
## OverviewUmbrella is an all-in-one platform for artists, venues, and music lovers. This repository contains the main application codebase.
## Prerequisites- Node.js 18+ (LTS)
- pnpm 8+
- Cloudflare account with Workers, D1, KV, R2 enabled
- Wrangler CLI installed globally: `npm i -g wrangler`## Local Development Setup1. Clone the repository:
   ```bash   git clone https://github.com/umbrella-live/umbrella.git
   cd umbrella
```

1. Install dependencies:
    
    ```bash
    pnpm install
    ```
    
2. Copy environment template:
    
    ```bash
    cp .env.example .env.local
    ```
    
3. Fill in `.env.local` with your development credentials (see [Environment Variables](about:blank#environment-variables))
4. Run local development server:
    
    ```bash
    pnpm dev
    ```
    
5. Access the application at `http://localhost:5173`

## Scripts

- `pnpm dev` - Start Vite dev server + Wrangler dev proxy
- `pnpm build` - Build production bundle
- `pnpm preview` - Preview production build locally
- `pnpm lint` - Run ESLint
- `pnpm format` - Run Prettier
- `pnpm type-check` - Run TypeScript compiler check
- `pnpm test` - Run Vitest unit tests
- `pnpm wrangler` - Access Wrangler CLI

## Environment Variables

Required variables for local development:

```bash
# CloudflareVITE_CLOUDFLARE_ACCOUNT_ID=your_account_id
VITE_CF_ACCESS_AUD=your_access_aud_token
# External Services (for testing)VITE_TWILIO_ACCOUNT_SID=your_twilio_sid
VITE_RESEND_API_KEY=your_resend_key
VITE_CLAUDE_API_KEY=your_claude_key
```

See [docs/devops.md](./docs/devops.md) for detailed setup instructions.

## Architecture

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Cloudflare Workers (serverless)
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2 (S3-compatible)
- **Cache**: Cloudflare KV
- **Auth**: Cloudflare Access (Apple/Google OAuth)

## Project Structure

```
src/           - React application code
workers/       - Cloudflare Workers (API + cron)
migrations/    - D1 database migrations
docs/          - Project documentation
```

## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for our contribution guidelines.

## Deployment

- **Staging**: Automatically deployed on push to `dev` branch
- **Production**: Automatically deployed on merge to `main` branch (via release-please)

## Documentation

- [Architecture](./docs/architecture.md)
- [Data Model](./docs/data-model.md)
- [API Contracts](./docs/contracts/)
- [DevOps Guide](./docs/devops.md)

## License

Proprietary - All Rights Reserved

## Support

For questions or issues, contact the development team:
- CTO: [cto@umbrellalive.com]
- Dev Team: [dev@umbrellalive.com]

```

---

### CONTRIBUTING.md Template

**Template for `umbrella/CONTRIBUTING.md`**:
```markdown
# Contributing to Umbrella

Thank you for contributing to Umbrella! This guide will help you understand our development workflow.

## Development Workflow

### 1. Pick an Issue

- All work must be tracked in a GitHub issue
- Check the [Project Board](https://github.com/orgs/umbrella-live/projects/1) for available issues
- Issues are organized by milestone (v0.1, v0.2, etc.)
- Assign yourself to an issue before starting work

### 2. Create a Feature Branch

```bash
git checkout dev
git pull origin dev
git checkout -b feature/<issue-id>-short-description
```

Example: `feature/42-implement-apple-oauth`

### 3. Write Conventional Commits

**Every commit MUST follow this format:**

```
<type>(<scope>): <description> (#<issue-number>)

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `chore`: Maintenance tasks
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding/updating tests
- `ci`: CI/CD changes
- `build`: Build system changes
- `revert`: Reverting previous changes

**Examples:**

```
feat(auth): implement Apple OAuth (#42)
fix(marketplace): resolve distance calculation bug (#87)
docs(violet): update AI toolkit category descriptions (#103)
chore(deps): bump wrangler to 3.x (#56)
```

**CRITICAL**: Every commit MUST reference an issue number using `(#123)` format. This is enforced by CI and will cause your PR to fail if missing.

### 4. Make Your Changes

- Write clean, readable code
- Add unit tests for new functionality
- Update documentation if API contracts change
- Run `pnpm lint` and `pnpm format` before committing

### 5. Create a Pull Request

**PR Title Format:**

```
<type>(<area>): <short description> (#<issue>)
```

**PR Template Checklist:**
- [ ] Tests added/updated
- [ ] API contracts documented (if applicable)
- [ ] Environment variables listed in PR description (if new vars added)
- [ ] Demo link included (if `DemoRequired=Yes` label)
- [ ] Release note one-liner written

**Target Branch:** Always create PRs against `dev`, never `main`

### 6. Code Review

- Request review from:
    - **Dev A ↔︎ Dev B**: Peer review each other
    - **Dev C**: Reviewed by CTO or Dev B
    - **CTO**: Spot-checks all PRs
- Address review comments promptly
- Make requested changes in new commits (don’t force-push during review)
- Re-request review after addressing comments

### 7. Merge

- Squash-merge PRs to keep `dev` history clean
- Delete feature branch after merge
- Move issue to “Done” in Project Board

## Demo Requirements

If your issue has the `DemoRequired=Yes` label, you must:

1. Record a 3-5 minute Loom video showing:
    - Feature working end-to-end (happy path)
    - One error state handled gracefully
    - Explanation of user value (“This lets artists…”)
2. Upload to Notion “Demo Digest” page by Thursday
3. Link the Loom in your PR description

## Breaking Changes

If your change breaks existing functionality:

1. Add `BREAKING CHANGE:` footer to commit message:
    
    ```
    feat(auth): remove email/password authentication (#42)
    
    BREAKING CHANGE: Email/password auth removed. Users must use Apple or Google OAuth.
    ```
    
2. Document migration path in commit body
3. Update affected documentation
4. Notify team in Slack/Discord

## Testing

### Unit Tests (Required)

```bash
pnpm test
```

- Write tests for all new functions/components
- Aim for >80% code coverage
- Mock external services (Twilio, Resend, Claude API)

### E2E Tests (Optional for v0.x, Required for v1.0)

```bash
pnpm test:e2e
```

- Critical user flows must have E2E tests
- Run locally before merging to `main`

## Style Guide

### TypeScript

- Use TypeScript for all new code
- Prefer `interface` over `type` for object shapes
- Use strict mode (`"strict": true` in tsconfig.json)
- No `any` types without explicit comment explaining why

### React

- Use functional components with hooks
- Prefer named exports over default exports
- Keep components small and focused (<200 lines)
- Use custom hooks for shared logic

### CSS

- Use Tailwind utility classes
- Avoid custom CSS unless absolutely necessary
- Use design tokens from `@umbrella/components`

### File Naming

- Components: `PascalCase.tsx` (e.g., `ArtistCard.tsx`)
- Hooks: `camelCase.ts` with `use` prefix (e.g., `useAuth.ts`)
- Utils: `camelCase.ts` (e.g., `formatDate.ts`)
- Pages: `kebab-case.tsx` (e.g., `artist-profile.tsx`)

## Environment Variables

When adding new environment variables:

1. Add to `.env.example` with placeholder value
2. Document in PR description
3. Update [docs/devops.md](./docs/devops.md) with setup instructions
4. Notify CTO to add to GitHub Secrets

## Database Migrations

When modifying the database schema:

1. Create a new migration file:
    
    ```bash
    pnpm wrangler d1 migrations create umbrella-db "<description>"
    ```
    
2. Write SQL in the generated file:
    
    ```sql
    -- Migration: Add profile_completion_percentage columnALTER TABLE artists ADD COLUMN profile_completion_percentage INTEGER DEFAULT 0;
    ```
    
3. Test locally:
    
    ```bash
    pnpm wrangler d1 migrations apply umbrella-db --local
    ```
    
4. Document in PR description
5. Migrations will auto-run in staging/production on deployment

## Getting Help

- **General Questions**: Post in #dev-help Slack channel
- **Bug Reports**: Create an issue with `bug` label
- **Feature Requests**: Discuss with CTO before creating issue
- **Urgent Issues**: DM CTO directly

## Resources

- [Conventional Commits Spec](https://www.conventionalcommits.org/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [Vite Docs](https://vitejs.dev/)
- [React Docs](https://react.dev/)

## Code of Conduct

- Be respectful and professional
- Provide constructive feedback
- Help teammates when they’re stuck
- Celebrate wins, big and small
- Communicate early and often

---

**Questions?** Reach out in #engineering Slack channel or DM the CTO.

```

---

## GitHub Workflows

Umbrella uses **7 GitHub Actions workflows** to automate testing, deployment, and release management.

### Workflow Overview

| Workflow | Trigger | Purpose | Duration |
|----------|---------|---------|----------|
| `pr-checks.yml` | Pull Request | Lint, test, type-check, build | ~2-3 min |
| `deploy-preview.yml` | Pull Request | Deploy preview to Cloudflare Pages | ~3-4 min |
| `deploy-staging.yml` | Push to `dev` | Deploy to staging environment | ~4-5 min |
| `deploy-production.yml` | Push to `main` | Deploy to production environment | ~4-5 min |
| `release-please.yml` | Push to `main` | Create/update release PR | ~30 sec |
| `claude-code.yml` | Pull Request | Enforce issue references in commits | ~30 sec |
| `commitlint.yml` | Pull Request | Enforce Conventional Commits format | ~30 sec |

### Workflow 1: PR Checks

**File**: `.github/workflows/pr-checks.yml`

```yaml
name: PR Checks

on:
  pull_request:
    branches: [dev]

jobs:
  lint-and-test:
    name: Lint, Test, and Build
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Fetch all history for commitlint

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run ESLint
        run: pnpm lint

      - name: Run Prettier check
        run: pnpm format:check

      - name: Run TypeScript type check
        run: pnpm type-check

      - name: Run unit tests
        run: pnpm test --run

      - name: Build application
        run: pnpm build
        env:
          # Use dummy values for build-time env vars
          VITE_CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          VITE_CF_ACCESS_AUD: ${{ secrets.CF_ACCESS_AUD_DEV }}

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-output
          path: dist/
          retention-days: 7
```

**Notes:**
- Runs on every PR to `dev`
- Must pass before merge is allowed
- Uses pnpm for faster installs
- Uploads build artifacts for inspection

---

### Workflow 2: Deploy Preview

**File**: `.github/workflows/deploy-preview.yml`

```yaml
name: Deploy Previewon:  pull_request:    branches: [dev]jobs:  deploy-preview:    name: Deploy to Cloudflare Pages Preview    runs-on: ubuntu-latest    permissions:      contents: read      deployments: write      pull-requests: write    steps:      - name: Checkout code        uses: actions/checkout@v4      - name: Setup Node.js        uses: actions/setup-node@v4        with:          node-version: '18'          cache: 'pnpm'      - name: Install pnpm        uses: pnpm/action-setup@v2        with:          version: 8      - name: Install dependencies        run: pnpm install --frozen-lockfile      - name: Build for preview        run: pnpm build        env:          VITE_CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}          VITE_CF_ACCESS_AUD: ${{ secrets.CF_ACCESS_AUD_DEV }}          VITE_ENV: preview      - name: Publish to Cloudflare Pages        uses: cloudflare/pages-action@v1        id: cloudflare-pages        with:          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}          projectName: umbrella-preview          directory: dist          gitHubToken: ${{ secrets.GITHUB_TOKEN }}      - name: Comment preview URL on PR        uses: actions/github-script@v7        with:          script: |            const previewUrl = '${{ steps.cloudflare-pages.outputs.url }}';
            const comment = `## 🚀 Preview Deployment Ready!
            Your preview deployment is now available:
            **Preview URL**: ${previewUrl}
            This preview will be automatically deleted when the PR is closed.`;
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
```

**Notes:**
- Creates a unique preview URL for each PR
- Deploys to Cloudflare Pages (preview environment)
- Posts preview URL as PR comment
- Auto-deletes when PR is closed

---

### Workflow 3: Deploy Staging

**File**: `.github/workflows/deploy-staging.yml`

```yaml
name: Deploy Stagingon:  push:    branches: [dev]jobs:  deploy-staging:    name: Deploy to Staging Environment    runs-on: ubuntu-latest    environment:      name: staging      url: https://staging.umbrellalive.com    steps:      - name: Checkout code        uses: actions/checkout@v4      - name: Setup Node.js        uses: actions/setup-node@v4        with:          node-version: '18'          cache: 'pnpm'      - name: Install pnpm        uses: pnpm/action-setup@v2        with:          version: 8      - name: Install dependencies        run: pnpm install --frozen-lockfile      - name: Build for staging        run: pnpm build        env:          VITE_CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}          VITE_CF_ACCESS_AUD: ${{ secrets.CF_ACCESS_AUD_STAGING }}          VITE_ENV: staging      - name: Run D1 migrations (staging)        run: pnpm wrangler d1 migrations apply umbrella-db --env staging        env:          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}      - name: Deploy to Cloudflare Workers (staging)        run: pnpm wrangler deploy --env staging        env:          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}      - name: Deploy frontend to Cloudflare Pages (staging)        uses: cloudflare/pages-action@v1        with:          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}          projectName: umbrella-staging          directory: dist          branch: staging      - name: Notify deployment success        run: |          echo "✅ Staging deployment successful!"
          echo "URL: https://staging.umbrellalive.com"
      # Optional: Notify in Slack/Discord      # - name: Notify team      #   uses: slackapi/slack-github-action@v1      #   with:      #     payload: |      #       {      #         "text": "🚀 Staging deployment complete: https://staging.umbrellalive.com"      #       }      #   env:      #     SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

**Notes:**
- Deploys on every push to `dev` branch
- Runs D1 migrations before deploying
- Deploys both Workers (API) and Pages (frontend)
- Uses staging-specific secrets and configuration

---

### Workflow 4: Deploy Production

**File**: `.github/workflows/deploy-production.yml`

```yaml
name: Deploy Productionon:  push:    branches: [main]jobs:  deploy-production:    name: Deploy to Production Environment    runs-on: ubuntu-latest    environment:      name: production      url: https://umbrellalive.com    steps:      - name: Checkout code        uses: actions/checkout@v4      - name: Setup Node.js        uses: actions/setup-node@v4        with:          node-version: '18'          cache: 'pnpm'      - name: Install pnpm        uses: pnpm/action-setup@v2        with:          version: 8      - name: Install dependencies        run: pnpm install --frozen-lockfile      - name: Build for production        run: pnpm build        env:          VITE_CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}          VITE_CF_ACCESS_AUD: ${{ secrets.CF_ACCESS_AUD_PRODUCTION }}          VITE_ENV: production      - name: Run D1 migrations (production)        run: pnpm wrangler d1 migrations apply umbrella-db --env production        env:          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}      - name: Deploy to Cloudflare Workers (production)        run: pnpm wrangler deploy --env production        env:          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}      - name: Deploy frontend to Cloudflare Pages (production)        uses: cloudflare/pages-action@v1        with:          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}          projectName: umbrella-production          directory: dist          branch: main      - name: Notify deployment success        run: |          echo "✅ Production deployment successful!"
          echo "URL: https://umbrellalive.com"
      # Optional: Create deployment notification      # - name: Notify team      #   uses: slackapi/slack-github-action@v1      #   with:      #     payload: |      #       {      #         "text": "🎉 Production deployment complete: https://umbrellalive.com"      #       }      #   env:      #     SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

**Notes:**
- Deploys on every push to `main` branch
- Only triggered after release-please PR is merged
- Runs D1 migrations before deploying
- Uses production-specific secrets and configuration
- Critical: Test on staging before merging release-please PR

---

### Workflow 5: release-please

**File**: `.github/workflows/release-please.yml`

```yaml
name: Release Pleaseon:  push:    branches:      - mainpermissions:  contents: write  pull-requests: writejobs:  release-please:    runs-on: ubuntu-latest    steps:      - name: Run release-please        uses: google-github-actions/release-please-action@v4        id: release        with:          # Release type: node (for Node.js/npm projects)          release-type: node          # Package name (used in release title)          package-name: umbrella          # Changelog sections configuration          # Maps commit types to changelog sections          changelog-types: |            [
              {"type":"feat","section":"Added","hidden":false},
              {"type":"fix","section":"Fixed","hidden":false},
              {"type":"refactor","section":"Changed","hidden":false},
              {"type":"perf","section":"Changed","hidden":false},
              {"type":"docs","hidden":true},
              {"type":"chore","hidden":true},
              {"type":"test","hidden":true},
              {"type":"ci","hidden":true},
              {"type":"build","hidden":true},
              {"type":"style","section":"Changed","hidden":false}
            ]
      # Optional: Publish to npm if you want to distribute components package      # - name: Publish to npm      #   if: ${{ steps.release.outputs.release_created }}      #   run: npm publish      #   env:      #     NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}      - name: Output release information        if: ${{ steps.release.outputs.release_created }}        run: |          echo "Release created: ${{ steps.release.outputs.tag_name }}"
          echo "Major version: ${{ steps.release.outputs.major }}"
          echo "Minor version: ${{ steps.release.outputs.minor }}"
          echo "Patch version: ${{ steps.release.outputs.patch }}"
```

**Configuration Files Needed**:

**`.release-please-manifest.json`** (in repo root):

```json
{  ".": "0.1.0"}
```

**`release-please-config.json`** (in repo root):

```json
{  "packages": {    ".": {      "release-type": "node",      "changelog-sections": [        {"type": "feat", "section": "Added", "hidden": false},        {"type": "fix", "section": "Fixed", "hidden": false},        {"type": "refactor", "section": "Changed", "hidden": false},        {"type": "perf", "section": "Changed", "hidden": false},        {"type": "style", "section": "Changed", "hidden": false},        {"type": "docs", "hidden": true},        {"type": "chore", "hidden": true},        {"type": "test", "hidden": true},        {"type": "ci", "hidden": true},        {"type": "build", "hidden": true}      ]    }  }}
```

**How it Works**:

1. **On every push to `main`**:
    - release-please scans commits since last release
    - Determines version bump based on commit types:
        - `feat:` → minor version (0.1.0 → 0.2.0)
        - `fix:` → patch version (0.1.0 → 0.1.1)
        - `BREAKING CHANGE:` → major version (0.1.0 → 1.0.0)
2. **Creates/updates a Release PR** with:
    - Updated `package.json` version
    - Generated `CHANGELOG.md`
    - Git tag (e.g., `v0.3.0`)
3. **When Release PR is merged**:
    - Creates a GitHub Release with tag and notes
    - Triggers production deployment workflow

**Example Release PR Title**:

```
chore(main): release 0.3.0
```

**Example CHANGELOG.md** (auto-generated):

```markdown
# Changelog## [0.3.0](https://github.com/umbrella-live/umbrella/compare/v0.2.0...v0.3.0) (2025-01-15)### Added* **marketplace**: add infinite scroll to gig listings ([abc1234](https://github.com/umbrella-live/umbrella/commit/abc1234))
* **profile**: implement 6-tab profile system ([def5678](https://github.com/umbrella-live/umbrella/commit/def5678))
### Fixed* **messaging**: resolve 2000 char limit validation ([789abcd](https://github.com/umbrella-live/umbrella/commit/789abcd))
### Changed* **db**: optimize gig query with indexes ([ef01234](https://github.com/umbrella-live/umbrella/commit/ef01234))
```

---

### Workflow 6: claude-code Issue Enforcement

**File**: `.github/workflows/claude-code.yml`

```yaml
name: Claude Code - Issue Enforcementon:  pull_request:    types: [opened, synchronize, reopened]jobs:  check-issue-references:    name: Verify Issue References in Commits    runs-on: ubuntu-latest    steps:      - name: Checkout code        uses: actions/checkout@v4        with:          fetch-depth: 0  # Fetch all history to access all commits      - name: Get PR commits        id: get-commits        uses: actions/github-script@v7        with:          script: |            const commits = await github.rest.pulls.listCommits({
              owner: context.repo.owner,
              repo: context.repo.repo,
              pull_number: context.issue.number
            });
            return commits.data.map(c => ({
              sha: c.sha,
              message: c.commit.message
            }));
      - name: Check for issue references        uses: actions/github-script@v7        with:          script: |            const commits = ${{ steps.get-commits.outputs.result }};
            const issueRegex = /\(#\d+\)/;  // Matches (#123)
            const failedCommits = [];
            for (const commit of commits) {
              // Check if commit message contains issue reference
              if (!issueRegex.test(commit.message)) {
                failedCommits.push({
                  sha: commit.sha,
                  message: commit.message.split('\n')[0]  // First line only
                });
              }
            }
            if (failedCommits.length > 0) {
              const failedList = failedCommits.map(c =>
                `- \`${c.sha.substring(0, 7)}\`: ${c.message}`
              ).join('\n');
              const comment = `## ❌ Issue Reference Check Failed
              The following commits are missing issue references:
              ${failedList}
              ### How to Fix
              Every commit message must reference an issue using the format \`(#123)\`.
              **Example:**
              \`\`\`
              feat(auth): implement Apple OAuth (#42)
              \`\`\`
              **To fix:**
              1. Rewrite commit messages to include issue references
              2. Use \`git rebase -i\` to edit commit messages
              3. Force push to update the PR: \`git push --force-with-lease\`
              **Need help?** See [CONTRIBUTING.md](./CONTRIBUTING.md) for commit message guidelines.`;
              await github.rest.issues.createComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: context.issue.number,
                body: comment
              });
              core.setFailed(`${failedCommits.length} commit(s) missing issue references`);
            } else {
              console.log('✅ All commits have issue references');
            }
```

**Notes:**
- Scans all commits in PR
- Checks for `(#123)` pattern in commit messages
- Fails CI if any commit lacks issue reference
- Posts helpful comment with instructions to fix

**Why This Matters**:
- Ensures traceability between code changes and issues
- Required for demo-first workflow
- Enables automatic linking in release notes

---

### Workflow 7: Commitlint

**File**: `.github/workflows/commitlint.yml`

```yaml
name: Commitlinton:  pull_request:    types: [opened, synchronize, reopened]jobs:  commitlint:    name: Lint Commit Messages    runs-on: ubuntu-latest    steps:      - name: Checkout code        uses: actions/checkout@v4        with:          fetch-depth: 0  # Fetch all history      - name: Setup Node.js        uses: actions/setup-node@v4        with:          node-version: '18'      - name: Install commitlint        run: |          npm install -g @commitlint/cli @commitlint/config-conventional
      - name: Lint commits in PR        run: |          # Get commits in PR
          git fetch origin ${{ github.base_ref }}
          # Lint each commit
          npx commitlint --from origin/${{ github.base_ref }} --to HEAD --verbose
```

**Configuration File**:

**`commitlint.config.js`** (in repo root):

```jsx
module.exports = {
  extends: ['@commitlint/config-conventional'],  rules: {
    // Allowed commit types    'type-enum': [
      2,      'always',      [
        'feat',     // New feature        'fix',      // Bug fix        'docs',     // Documentation        'chore',    // Maintenance        'refactor', // Code refactoring        'perf',     // Performance improvement        'test',     // Adding tests        'ci',       // CI/CD changes        'build',    // Build system changes        'revert',   // Reverting changes        'style'     // Code style changes      ]
    ],    // Allow any case for subject (to support proper nouns)    'subject-case': [0],    // Subject must not be empty    'subject-empty': [2, 'never'],    // Subject must not end with period    'subject-full-stop': [2, 'never', '.'],    // Type must be in lowercase    'type-case': [2, 'always', 'lower-case'],    // Type must not be empty    'type-empty': [2, 'never'],    // Scope must be in lowercase    'scope-case': [2, 'always', 'lower-case']
  }
};
```

**Notes:**
- Enforces Conventional Commits format
- Runs on every PR
- Fails if any commit doesn’t match the format
- Works in tandem with `claude-code.yml` (issue references)

---

## Branch Strategy & Protection

### Branch Model

```
main (production)
  ↑
  merge via release-please PR
  ↑
dev (staging)
  ↑
  feature branches
```

### Branch Descriptions

- **`main`**: Production-ready code. Protected. Only release-please PRs allowed.
- **`dev`**: Integration branch. All feature PRs target this. Auto-deploys to staging.
- **`feature/<issue-id>-description`**: Individual feature branches. Merged to `dev` via PR.

### Branch Protection Rules

### Protection for `main`

**Settings** (GitHub repo → Settings → Branches → Add rule):

```
Branch name pattern: main

☑ Require a pull request before merging
  ☑ Require approvals: 1
  ☑ Dismiss stale pull request approvals when new commits are pushed
  ☑ Require review from Code Owners: No (optional, if CODEOWNERS file exists)

☑ Require status checks to pass before merging
  ☑ Require branches to be up to date before merging
  Required status checks:
    - Lint, Test, and Build (pr-checks.yml)
    - Deploy to Cloudflare Pages Preview (deploy-preview.yml)
    - Verify Issue References in Commits (claude-code.yml)
    - Lint Commit Messages (commitlint.yml)

☑ Require conversation resolution before merging

☑ Require signed commits: No (optional, adds complexity)

☑ Require linear history: Yes (enforce squash or rebase merges)

☑ Require deployments to succeed before merging: Yes
  Required deployment environments:
    - staging

☐ Lock branch: No

☑ Do not allow bypassing the above settings
  Exceptions: None (not even admins)
```

**Who Can Merge**:
- Only via release-please PRs
- CTO must approve release-please PRs
- No direct pushes allowed (not even CTO)

### Protection for `dev`

**Settings**:

```
Branch name pattern: dev

☑ Require a pull request before merging
  ☑ Require approvals: 1
  ☐ Dismiss stale pull request approvals (more lenient than main)
  ☐ Require review from Code Owners

☑ Require status checks to pass before merging
  ☑ Require branches to be up to date before merging
  Required status checks:
    - Lint, Test, and Build (pr-checks.yml)
    - Verify Issue References in Commits (claude-code.yml)
    - Lint Commit Messages (commitlint.yml)

☑ Require conversation resolution before merging

☐ Require signed commits

☑ Require linear history: Yes

☐ Require deployments to succeed before merging

☐ Lock branch

☑ Do not allow bypassing the above settings
  Exceptions: CTO (for hotfixes)
```

**Who Can Approve PRs**:
- **Dev A ↔︎ Dev B**: Peer review each other
- **Dev C**: CTO or Dev B
- Self-approval not allowed

### Merge Strategies

**For PRs to `dev`**:
- **Squash and merge** (default)
- Combines all commits into one
- Uses PR title as commit message
- Keeps `dev` history clean

**For release-please PRs to `main`**:
- **Merge commit** (not squash)
- Preserves release-please commit structure
- Maintains changelog integrity

### Hotfix Process

**When to Use**:
- Critical production bug that can’t wait for next release
- Security vulnerability
- Data loss prevention

**Steps**:
1. Create hotfix branch from `main`:
`bash    git checkout main    git pull origin main    git checkout -b hotfix/<issue-id>-description`

1. Make fix and commit:
    
    ```bash
    git commit -m "fix(critical): resolve data loss bug (#999)"
    ```
    
2. Create PR to `main` (not `dev`):
    - Tag PR with `hotfix` label
    - Request CTO review immediately
    - Bypass normal release-please process
3. After merge to `main`:
    - Cherry-pick hotfix to `dev`:
        
        ```bash
        git checkout dev
        git cherry-pick <hotfix-commit-sha>git push origin dev
        ```
        
4. Create release-please PR manually (if needed):
    
    ```bash
    # release-please will auto-detect the fix on next main push
    ```
    

---

## Secrets Management

### GitHub Organization Secrets

**Location**: GitHub Organization → Settings → Secrets and variables → Actions

**Required Secrets**:

| Secret Name | Description | Where to Find |
| --- | --- | --- |
| `CLOUDFLARE_API_TOKEN` | API token for Cloudflare deployments | Cloudflare Dashboard → My Profile → API Tokens → Create Token (Edit Cloudflare Workers) |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account identifier | Cloudflare Dashboard → Workers & Pages → Overview → Account ID |
| `WRANGLER_API_TOKEN` | Same as CLOUDFLARE_API_TOKEN (legacy) | Same as above |
| `TWILIO_ACCOUNT_SID` | Twilio account identifier | Twilio Console → Account Info → Account SID |
| `TWILIO_AUTH_TOKEN` | Twilio authentication token | Twilio Console → Account Info → Auth Token |
| `RESEND_API_KEY` | Resend email API key | Resend Dashboard → API Keys → Create API Key |
| `CLAUDE_API_KEY` | Anthropic Claude API key | Anthropic Console → API Keys → Create Key |

**Environment-Specific Secrets**:

| Secret Name | Description | Environment |
| --- | --- | --- |
| `CF_ACCESS_AUD_DEV` | Cloudflare Access audience token | Development |
| `CF_ACCESS_AUD_STAGING` | Cloudflare Access audience token | Staging |
| `CF_ACCESS_AUD_PRODUCTION` | Cloudflare Access audience token | Production |
| `CF_ACCESS_TEAM_DEV` | Cloudflare Access team identifier | Development |
| `CF_ACCESS_TEAM_STAGING` | Cloudflare Access team identifier | Staging |
| `CF_ACCESS_TEAM_PRODUCTION` | Cloudflare Access team identifier | Production |

**How to Add Secrets**:

1. Navigate to: `https://github.com/organizations/umbrella-live/settings/secrets/actions`
2. Click “New organization secret”
3. Enter name and value
4. Select repository access:
    - “All repositories” for shared secrets (CLOUDFLARE_API_TOKEN, etc.)
    - “Selected repositories” for repo-specific secrets
5. Click “Add secret”

### Wrangler Secrets (Per Environment)

**What are Wrangler Secrets?**
- Runtime secrets for Cloudflare Workers
- Not exposed in `wrangler.toml` (security)
- Set via Wrangler CLI
- Different values per environment (dev/staging/production)

**Required Wrangler Secrets**:

```bash
# Developmentwrangler secret put CF_ACCESS_AUD --env dev
# Paste value when prompted, then press Enterwrangler secret put CF_ACCESS_TEAM --env dev
# Paste value, Enterwrangler secret put TWILIO_AUTH_TOKEN --env dev
wrangler secret put RESEND_API_KEY --env dev
wrangler secret put CLAUDE_API_KEY --env dev
# Stagingwrangler secret put CF_ACCESS_AUD --env staging
wrangler secret put CF_ACCESS_TEAM --env staging
wrangler secret put TWILIO_AUTH_TOKEN --env staging
wrangler secret put RESEND_API_KEY --env staging
wrangler secret put CLAUDE_API_KEY --env staging
# Productionwrangler secret put CF_ACCESS_AUD --env production
wrangler secret put CF_ACCESS_TEAM --env production
wrangler secret put TWILIO_AUTH_TOKEN --env production
wrangler secret put RESEND_API_KEY --env production
wrangler secret put CLAUDE_API_KEY --env production
```

**Listing Secrets** (to verify):

```bash
wrangler secret list --env dev
wrangler secret list --env staging
wrangler secret list --env production
```

**Deleting a Secret** (if needed):

```bash
wrangler secret delete <SECRET_NAME> --env <environment>
```

### Local Development Secrets

**`.env.example`** (committed to repo):

```bash
# CloudflareVITE_CLOUDFLARE_ACCOUNT_ID=your_account_id_here
VITE_CF_ACCESS_AUD=your_access_aud_token_here
# External Services (for local testing)VITE_TWILIO_ACCOUNT_SID=your_twilio_sid_here
VITE_TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
VITE_RESEND_API_KEY=your_resend_api_key_here
VITE_CLAUDE_API_KEY=your_claude_api_key_here
# EnvironmentVITE_ENV=development
```

**`.env.local`** (NOT committed, gitignored):

```bash
# Copy from .env.example and fill in real values# This file is used for local development only
```

**Developer Setup**:

```bash
# Copy templatecp .env.example .env.local
# Fill in values (ask CTO for credentials)nano .env.local
```

### Security Best Practices

1. **Never commit secrets** to version control
    - Use `.gitignore` to exclude `.env`, `.env.local`, `.dev.vars`
    - Use GitHub Secrets for CI/CD
    - Use Wrangler Secrets for runtime
2. **Rotate secrets regularly**
    - Quarterly rotation recommended
    - Immediate rotation if compromised
    - Update in all environments (dev, staging, production)
3. **Principle of least privilege**
    - API tokens should have minimum required permissions
    - Use separate tokens for staging vs. production
    - Revoke tokens for departing team members
4. **Audit secret access**
    - GitHub audit log tracks secret access
    - Wrangler secrets are encrypted at rest
    - Monitor Cloudflare audit logs for suspicious activity

---

## Service Configuration

### Cloudflare Setup

**Prerequisites**:
- Cloudflare account (free tier sufficient for dev/staging)
- Credit card on file (required for Workers, D1, R2)
- Domain registered and pointed to Cloudflare (umbrellalive.com)

### Step 1: Create Cloudflare Account

1. Go to [https://dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up)
2. Sign up with email
3. Verify email
4. Add payment method: Dashboard → Billing → Payment Info

### Step 2: Create Workers Project

1. Dashboard → Workers & Pages → Create application → Create Worker
2. Name: `umbrella-prod`
3. Click “Deploy” (creates starter worker)
4. Note the **Account ID** (visible in URL or Overview tab)

### Step 3: Create D1 Database

1. Dashboard → Workers & Pages → D1
2. Click “Create database”
3. Database name: `umbrella-db`
4. Click “Create”
5. Note the **Database ID**

**Bind to Worker**:

Edit `wrangler.toml`:

```toml
[[d1_databases]]binding = "DB"database_name = "umbrella-db"database_id = "your-database-id-here"
```

**Create Migrations**:

```bash
cd umbrella/
pnpm wrangler d1 migrations create umbrella-db "initial_schema"
```

Edit the generated migration file in `migrations/`:

```sql
-- Migration: initial_schemaCREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  oauth_provider TEXT NOT NULL,
  oauth_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE artists (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  bio TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
-- Add more tables as needed (see PRD data model)
```

**Apply Migrations**:

```bash
# Localpnpm wrangler d1 migrations apply umbrella-db --local# Stagingpnpm wrangler d1 migrations apply umbrella-db --env staging
# Productionpnpm wrangler d1 migrations apply umbrella-db --env production
```

### Step 4: Create KV Namespace

1. Dashboard → Workers & Pages → KV
2. Click “Create namespace”
3. Namespace name: `umbrella-cache`
4. Click “Add”
5. Note the **Namespace ID**

**Bind to Worker**:

Edit `wrangler.toml`:

```toml
[[kv_namespaces]]binding = "CACHE"id = "your-kv-namespace-id-here"
```

### Step 5: Create R2 Bucket

1. Dashboard → R2
2. Click “Create bucket”
3. Bucket name: `umbrella-media`
4. Location: Automatic (or choose region close to users)
5. Click “Create bucket”

**Bind to Worker**:

Edit `wrangler.toml`:

```toml
[[r2_buckets]]binding = "MEDIA"bucket_name = "umbrella-media"
```

### Step 6: Configure Cloudflare Access (OAuth)

**Enable Access**:
1. Dashboard → Zero Trust → Settings → Authentication
2. Click “Add new” under Login methods

**Add Apple OAuth**:
1. Select “Apple”
2. Follow Apple’s developer guide to create OAuth app:
- Go to [https://developer.apple.com/account](https://developer.apple.com/account)
- Certificates, Identifiers & Profiles → Identifiers → Add new
- Select “Services IDs”
- Register “Umbrella” with domain `umbrellalive.com`
- Configure “Sign in with Apple”
- Note **Client ID** and generate **Client Secret**
3. In Cloudflare, enter:
- App ID: (your Apple Client ID)
- Secret: (your Apple Client Secret)
- Redirect URL: `https://umbrellalive.com/auth/callback`
4. Click “Save”

**Add Google OAuth**:
1. Select “Google”
2. Go to [https://console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)
3. Create OAuth 2.0 Client ID:
- Application type: Web application
- Name: Umbrella
- Authorized redirect URIs: `https://umbrellalive.com/auth/callback`
- Note **Client ID** and **Client Secret**
4. In Cloudflare, enter:
- App ID: (your Google Client ID)
- Secret: (your Google Client Secret)
5. Click “Save”

**Create Access Application**:
1. Zero Trust → Access → Applications → Add an application
2. Select “Self-hosted”
3. Application name: `Umbrella Production`
4. Subdomain: `app` (results in `app.umbrellalive.com`)
5. Session duration: 24 hours
6. Add policies:
- Policy name: “Allow authenticated users”
- Action: Allow
- Selector: “Login methods” - Include “Apple” and “Google”
7. Click “Save”
8. Note the **Audience (AUD) Tag** (needed for JWT validation)

**Generate Access Tokens**:

After creating the Access application:
1. Copy the **Application Audience (AUD) Tag**
- This is your `CF_ACCESS_AUD` secret
2. Copy the **Team Domain**
- Format: `<your-team>.cloudflareaccess.com`
- This is your `CF_ACCESS_TEAM` identifier

**Set as Wrangler Secrets**:

```bash
# Developmentecho "<your-aud-tag>" | wrangler secret put CF_ACCESS_AUD --env dev
echo "<your-team-domain>" | wrangler secret put CF_ACCESS_TEAM --env dev
# Stagingecho "<your-aud-tag>" | wrangler secret put CF_ACCESS_AUD --env staging
echo "<your-team-domain>" | wrangler secret put CF_ACCESS_TEAM --env staging
# Productionecho "<your-aud-tag>" | wrangler secret put CF_ACCESS_AUD --env production
echo "<your-team-domain>" | wrangler secret put CF_ACCESS_TEAM --env production
```

### Step 7: Generate API Tokens

1. Dashboard → My Profile → API Tokens → Create Token
2. Use template: “Edit Cloudflare Workers”
3. Permissions:
    - Account - Cloudflare Pages - Edit
    - Account - Cloudflare Workers Scripts - Edit
    - Account - D1 - Edit
    - Zone - Workers Routes - Edit
4. Account Resources: Include - Your Account
5. Zone Resources: Include - umbrellalive.com
6. TTL: No expiration (or set expiration if preferred)
7. Click “Continue to summary” → “Create Token”
8. **Copy token immediately** (shown only once)

**Add to GitHub Secrets**:
- Name: `CLOUDFLARE_API_TOKEN`
- Value: (paste token)

### Step 8: Configure wrangler.toml

**File**: `umbrella/wrangler.toml`

```toml
name = "umbrella"main = "workers/api/index.ts"compatibility_date = "2024-01-01"# Development environment[env.dev]name = "umbrella-dev"vars = { ENVIRONMENT = "development" }[[env.dev.d1_databases]]binding = "DB"database_name = "umbrella-db-dev"database_id = "your-dev-db-id"[[env.dev.kv_namespaces]]binding = "CACHE"id = "your-dev-kv-id"[[env.dev.r2_buckets]]binding = "MEDIA"bucket_name = "umbrella-media-dev"# Staging environment[env.staging]name = "umbrella-staging"vars = { ENVIRONMENT = "staging" }[[env.staging.d1_databases]]binding = "DB"database_name = "umbrella-db-staging"database_id = "your-staging-db-id"[[env.staging.kv_namespaces]]binding = "CACHE"id = "your-staging-kv-id"[[env.staging.r2_buckets]]binding = "MEDIA"bucket_name = "umbrella-media-staging"# Production environment[env.production]name = "umbrella-production"vars = { ENVIRONMENT = "production" }[[env.production.d1_databases]]binding = "DB"database_name = "umbrella-db"database_id = "your-prod-db-id"[[env.production.kv_namespaces]]binding = "CACHE"id = "your-prod-kv-id"[[env.production.r2_buckets]]binding = "MEDIA"bucket_name = "umbrella-media"
```

**Notes**:
- **NEVER commit secrets** to `wrangler.toml`
- Only commit binding names and structure
- Actual secrets set via `wrangler secret put`

---

### Resend Setup (Email Delivery)

**Purpose**: Transactional emails (booking confirmations, notifications, broadcasts)

### Step 1: Create Resend Account

1. Go to [https://resend.com/signup](https://resend.com/signup)
2. Sign up with email
3. Verify email
4. Add payment method: Dashboard → Billing (free tier: 100 emails/day, 3,000/month)

### Step 2: Add Domain

1. Dashboard → Domains → Add Domain
2. Enter: `umbrellalive.com`
3. Click “Add Domain”

### Step 3: Verify Domain

**DNS Records to Add** (in Cloudflare DNS):

1. Cloudflare Dashboard → umbrellalive.com → DNS → Records
2. Add **DKIM Record**:
    
    ```
    Type: TXT
    Name: resend._domainkey.umbrellalive.com
    Content: (provided by Resend, looks like "v=DKIM1; k=rsa; p=...")
    TTL: Auto
    Proxy status: DNS only
    ```
    
3. Add **SPF Record**:
    
    ```
    Type: TXT
    Name: umbrellalive.com
    Content: v=spf1 include:resend.com ~all
    TTL: Auto
    Proxy status: DNS only
    ```
    
4. Wait 5-10 minutes for DNS propagation
5. Back in Resend Dashboard → Domains → Click “Verify”
6. Status should change to “Verified” (green checkmark)

### Step 4: Generate API Key

1. Dashboard → API Keys → Create API Key
2. Name: `umbrella-production`
3. Permission: Full Access (or “Sending access” if you want to restrict)
4. Click “Create”
5. **Copy key immediately** (shown only once, starts with `re_`)

**Add to GitHub Secrets**:
- Name: `RESEND_API_KEY`
- Value: (paste key)

**Add to Wrangler Secrets**:

```bash
# Developmentecho "re_your_dev_key" | wrangler secret put RESEND_API_KEY --env dev
# Stagingecho "re_your_staging_key" | wrangler secret put RESEND_API_KEY --env staging
# Productionecho "re_your_production_key" | wrangler secret put RESEND_API_KEY --env production
```

### Step 5: Test Email Sending

**Test with Wrangler CLI**:

```bash
# Send test emailwrangler dev --env dev
# In your Worker code:const response = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${env.RESEND_API_KEY}`,
    'Content-Type': 'application/json',
  },  body: JSON.stringify({    from: 'Umbrella <noreply@umbrellalive.com>',
    to: 'your-email@example.com',
    subject: 'Test Email from Umbrella',
    html: '<h1>Hello from Umbrella!</h1><p>This is a test email.</p>',
  }),});const data = await response.json();console.log(data);
```

**Expected Response**:

```json
{  "id": "email-id-here",  "from": "noreply@umbrellalive.com",  "to": "your-email@example.com",  "created_at": "2025-01-15T12:00:00.000Z"}
```

### Step 6: Email Templates

**Create Email Templates** (in codebase):

**File**: `umbrella/workers/emails/templates/booking-confirmation.ts`

```tsx
export const bookingConfirmation = (data: {
  artistName: string;  venueName: string;  gigDate: string;  gigTime: string;  payment: string;}) => `<!DOCTYPE html><html><head>  <style>    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }    .container { max-width: 600px; margin: 0 auto; padding: 20px; }    .header { background: #9333EA; color: white; padding: 20px; text-align: center; }    .content { padding: 20px; background: #f9f9f9; }    .button { display: inline-block; padding: 12px 24px; background: #9333EA; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }  </style></head><body>  <div class="container">    <div class="header">      <h1>🎉 Booking Confirmed!</h1>    </div>    <div class="content">      <p>Hi ${data.artistName},</p>      <p>Great news! Your booking has been confirmed.</p>      <p><strong>Venue:</strong> ${data.venueName}</p>      <p><strong>Date:</strong> ${data.gigDate}</p>      <p><strong>Time:</strong> ${data.gigTime}</p>      <p><strong>Payment:</strong> ${data.payment}</p>      <p>We'll send you a reminder 24 hours before the gig.</p>      <a href="https://umbrellalive.com/dashboard" class="button">View Dashboard</a>    </div>    <div class="footer">      <p>Umbrella | umbrellalive.com | help@umbrellalive.com</p>      <p><a href="https://umbrellalive.com/unsubscribe">Unsubscribe</a></p>    </div>  </div></body></html>`;
```

---

### Twilio Setup (SMS Delivery)

**Purpose**: SMS broadcasts to fans, booking confirmations

### Step 1: Create Twilio Account

1. Go to [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Sign up with email and phone number
3. Verify phone number
4. Upgrade to paid account: Console → Billing → Add payment method

### Step 2: Purchase Phone Number

1. Console → Phone Numbers → Buy a Number
2. Filter:
    - Country: United States (or your target market)
    - Capabilities: SMS, MMS
3. Select a number (recommended: US toll-free number for broadcasts)
4. Click “Buy”
5. Note the **Phone Number** (format: +1XXXXXXXXXX)

### Step 3: Get API Credentials

1. Console → Account → API Keys & Tokens
2. Note your **Account SID** (starts with `AC...`)
3. Note your **Auth Token** (click “Show” to reveal)

**Add to GitHub Secrets**:
- Name: `TWILIO_ACCOUNT_SID`
- Value: (your Account SID)
- Name: `TWILIO_AUTH_TOKEN`
- Value: (your Auth Token)

**Add to Wrangler Secrets**:

```bash
# Developmentecho "AC..." | wrangler secret put TWILIO_ACCOUNT_SID --env dev
echo "your-auth-token" | wrangler secret put TWILIO_AUTH_TOKEN --env dev
# Stagingecho "AC..." | wrangler secret put TWILIO_ACCOUNT_SID --env staging
echo "your-auth-token" | wrangler secret put TWILIO_AUTH_TOKEN --env staging
# Productionecho "AC..." | wrangler secret put TWILIO_ACCOUNT_SID --env production
echo "your-auth-token" | wrangler secret put TWILIO_AUTH_TOKEN --env production
```

### Step 4: Configure Messaging Service (Optional)

**For high-volume SMS**:
1. Console → Messaging → Services → Create new Messaging Service
2. Service name: `Umbrella Broadcasts`
3. Use case: Marketing
4. Add your purchased phone number to the pool
5. Note the **Messaging Service SID** (starts with `MG...`)

### Step 5: Test SMS Sending

**Test with Wrangler CLI**:

```bash
wrangler dev --env dev
# In your Worker code:const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`, {
  method: 'POST',
  headers: {
    'Authorization': 'Basic ' + btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`),    'Content-Type': 'application/x-www-form-urlencoded',
  },  body: new URLSearchParams({    From: '+1XXXXXXXXXX',  // Your Twilio number
    To: '+1YYYYYYYYYY',    // Test recipient
    Body: 'Test SMS from Umbrella!',
  }),});const data = await response.json();console.log(data);
```

**Expected Response**:

```json
{  "sid": "SM...",  "status": "queued",  "to": "+1YYYYYYYYYY",  "from": "+1XXXXXXXXXX",  "body": "Test SMS from Umbrella!"}
```

### Step 6: Compliance & Best Practices

**TCPA Compliance**:
- Only send SMS to users who explicitly opted in
- Include opt-out mechanism: “Reply STOP to unsubscribe”
- Handle STOP/HELP keywords automatically
- Keep records of consent

**Implement Opt-Out Handling**:

**File**: `umbrella/workers/sms/handle-incoming.ts`

```tsx
// Webhook handler for incoming SMSexport async function handleIncomingSMS(request: Request, env: Env) {
  const formData = await request.formData();  const from = formData.get('From') as string;  const body = formData.get('Body')?.toString().toUpperCase();  if (body === 'STOP' || body === 'UNSUBSCRIBE') {
    // Mark user as opted out in DB    await env.DB.prepare(
      'UPDATE contacts SET sms_opted_in = 0 WHERE phone_number = ?'    ).bind(from).run();    // Send confirmation    return sendSMS({
      to: from,      body: 'You have been unsubscribed from Umbrella SMS. Reply START to re-subscribe.',    });  }
  if (body === 'START' || body === 'SUBSCRIBE') {
    // Re-opt in    await env.DB.prepare(
      'UPDATE contacts SET sms_opted_in = 1 WHERE phone_number = ?'    ).bind(from).run();    return sendSMS({
      to: from,      body: 'You are now subscribed to Umbrella SMS updates. Reply STOP to unsubscribe.',    });  }
  // Handle other keywords (HELP, etc.)  // ...}
```

**Configure Webhook**:
1. Twilio Console → Phone Numbers → Active Numbers → (your number)
2. Messaging Configuration → A message comes in:
- Webhook: `https://umbrellalive.com/api/sms/incoming`
- HTTP POST
3. Save

---

### Claude API Setup (AI)

**Purpose**: Violet AI toolkit (prompt-based assistance)

### Step 1: Create Anthropic Account

1. Go to [https://console.anthropic.com/](https://console.anthropic.com/)
2. Sign up with email
3. Verify email

### Step 2: Add Payment Method

1. Console → Billing → Add payment method
2. Add credit card
3. Set billing limit (recommended: $100/month for MVP)

### Step 3: Purchase Credits

1. Console → Billing → Add credits
2. Purchase credits (recommended: $50 to start)
3. Monitor usage daily

### Step 4: Generate API Key

1. Console → API Keys → Create Key
2. Name: `umbrella-production`
3. Click “Create”
4. **Copy key immediately** (shown only once, starts with `sk-ant-`)

**Add to GitHub Secrets**:
- Name: `CLAUDE_API_KEY`
- Value: (paste key)

**Add to Wrangler Secrets**:

```bash
# Developmentecho "sk-ant-..." | wrangler secret put CLAUDE_API_KEY --env dev
# Stagingecho "sk-ant-..." | wrangler secret put CLAUDE_API_KEY --env staging
# Productionecho "sk-ant-..." | wrangler secret put CLAUDE_API_KEY --env production
```

### Step 5: Test API Integration

**Test with Wrangler CLI**:

```bash
wrangler dev --env dev
# In your Worker code:const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'x-api-key': env.CLAUDE_API_KEY,
    'anthropic-version': '2023-06-01',
    'content-type': 'application/json',
  },  body: JSON.stringify({    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: 'Hello, Claude! This is a test from Umbrella.',
    }],  }),});const data = await response.json();console.log(data);
```

**Expected Response**:

```json
{  "id": "msg_...",  "type": "message",  "role": "assistant",  "content": [{    "type": "text",    "text": "Hello! I'm happy to help you with Umbrella..."  }],  "model": "claude-sonnet-4-20250514",  "usage": {    "input_tokens": 15,    "output_tokens": 25  }}
```

### Step 6: Implement Rate Limiting (50 prompts/day)

**Per PRD Decision D-062**: Each artist limited to 50 prompts per day.

**File**: `umbrella/workers/api/violet/rate-limit.ts`

```tsx
export async function checkVioletRateLimit(
  artistId: string,  env: Env
): Promise<{ allowed: boolean; remaining: number }> {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD  const key = `violet:${artistId}:${today}`;  // Get current count from KV  const countStr = await env.CACHE.get(key);  const count = countStr ? parseInt(countStr) : 0;  if (count >= 50) {
    return { allowed: false, remaining: 0 };  }
  // Increment count  await env.CACHE.put(key, (count + 1).toString(), {
    expirationTtl: 86400, // 24 hours  });  return { allowed: true, remaining: 49 - count };}
```

**Usage in API Endpoint**:

```tsx
export async function handleVioletPrompt(request: Request, env: Env) {
  const artistId = getAuthenticatedArtistId(request);  // Check rate limit  const rateLimit = await checkVioletRateLimit(artistId, env);  if (!rateLimit.allowed) {
    return new Response(JSON.stringify({
      error: 'Rate limit exceeded',      message: 'You have reached your daily limit of 50 prompts. Try again tomorrow.',    }), {
      status: 429,      headers: { 'Content-Type': 'application/json' },    });  }
  // Process prompt with Claude API  // ...}
```

---

## Developer Onboarding

### New Developer Checklist

**Before First Day**:
- [ ] GitHub account created
- [ ] Added to `umbrella-live` GitHub organization
- [ ] 2FA enabled on GitHub account
- [ ] Slack/Discord invited (if using team chat)
- [ ] Email account provisioned (e.g., `dev-a@umbrellalive.com`)

**Day 1**:
- [ ] Clone all 5 repositories
- [ ] Install development tools (Node.js, pnpm, Wrangler)
- [ ] Set up local environment variables
- [ ] Run `pnpm install` in each repo
- [ ] Run `pnpm dev` to verify setup
- [ ] Join first standup (async in Notion)

**Week 1**:
- [ ] Read PRD v2.0 (docs/spec/umbrella-prd-v2.md)
- [ ] Read DevOps guide (this document)
- [ ] Read CONTRIBUTING.md
- [ ] Pick first issue from “Good First Issue” label
- [ ] Create first PR (with demo if DemoRequired=Yes)
- [ ] Complete first code review

### Installation Steps

### 1. Install Node.js

**macOS** (via Homebrew):

```bash
brew install node@18
```

**Linux**:

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -sudo apt-get install -y nodejs
```

**Windows**:
- Download installer from [https://nodejs.org/en/download/](https://nodejs.org/en/download/)
- Run installer
- Verify: `node --version` (should show v18.x.x)

### 2. Install pnpm

```bash
npm install -g pnpm
```

Verify:

```bash
pnpm --version
```

### 3. Install Wrangler CLI

```bash
npm install -g wrangler
```

Verify:

```bash
wrangler --version
```

Login to Cloudflare:

```bash
wrangler login
```

(Opens browser for OAuth authentication)

### 4. Clone Repositories

```bash
# Create umbrella directorymkdir ~/umbrella
cd ~/umbrella
# Clone all reposgit clone git@github.com:umbrella-live/umbrella.git
git clone git@github.com:umbrella-live/components.git
git clone git@github.com:umbrella-live/marketplace.git
git clone git@github.com:umbrella-live/violet-ai.git
git clone git@github.com:umbrella-live/docs.git
```

### 5. Install Dependencies

```bash
# Main appcd ~/umbrella/umbrella
pnpm install
# Componentscd ~/umbrella/components
pnpm install
# Marketplacecd ~/umbrella/marketplace
pnpm install
# Violet AIcd ~/umbrella/violet-ai
pnpm install
# Docscd ~/umbrella/docs
pnpm install
```

### 6. Set Up Environment Variables

```bash
cd ~/umbrella/umbrella
# Copy templatecp .env.example .env.local
# Edit with your credentials (ask CTO)nano .env.local
```

Fill in:

```bash
VITE_CLOUDFLARE_ACCOUNT_ID=<your-account-id>VITE_CF_ACCESS_AUD=<dev-access-aud>VITE_TWILIO_ACCOUNT_SID=<test-twilio-sid>VITE_TWILIO_AUTH_TOKEN=<test-twilio-token>VITE_RESEND_API_KEY=<test-resend-key>VITE_CLAUDE_API_KEY=<test-claude-key>VITE_ENV=development
```

### 7. Run Development Server

```bash
cd ~/umbrella/umbrella
pnpm dev
```

**Expected output**:

```
VITE v5.x.x  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose

[wrangler:inf] Ready on http://localhost:8787
```

Open browser to `http://localhost:5173`

### 8. Verify Setup

Run through checklist:
- [ ] Vite dev server running on port 5173
- [ ] Wrangler proxy running on port 8787
- [ ] Landing page loads without errors
- [ ] Console shows no errors
- [ ] Can navigate to /auth (shows Apple/Google OAuth buttons)

---

### First PR Workflow

**Step 1**: Pick an issue

```bash
# Go to GitHub Project Board# Pick issue from "Backlog" column with "Good First Issue" label# Assign yourself to the issue
```

**Step 2**: Create feature branch

```bash
cd ~/umbrella/umbrella
git checkout dev
git pull origin dev
git checkout -b feature/42-your-feature-name
```

**Step 3**: Make changes

```bash
# Edit files# Test locally with `pnpm dev`# Write unit tests with `pnpm test`
```

**Step 4**: Commit with Conventional Commits

```bash
git add .
git commit -m "feat(auth): implement Apple OAuth (#42)"
```

**CRITICAL**: Every commit MUST include issue reference `(#42)`

**Step 5**: Push and create PR

```bash
git push origin feature/42-your-feature-name
# Go to GitHub# Create PR against `dev` branch# Fill in PR template# Request review from peer
```

**Step 6**: Address review comments

```bash
# Make requested changesgit add .
git commit -m "fix(auth): address review comments (#42)"git push origin feature/42-your-feature-name
# Re-request review
```

**Step 7**: Merge

```bash
# After approval, click "Squash and merge" on GitHub# Delete feature branch
```

---

### Common Development Tasks

### Running Tests

```bash
# Unit testspnpm test
# Watch modepnpm test:watch
# Coveragepnpm test:coverage
```

### Linting & Formatting

```bash
# Lintpnpm lint
# Fix lint errorspnpm lint:fix
# Check formattingpnpm format:check
# Auto-formatpnpm format
```

### Type Checking

```bash
pnpm type-check
```

### Building for Production

```bash
pnpm build
# Preview buildpnpm preview
```

### Database Migrations

```bash
# Create new migrationpnpm wrangler d1 migrations create umbrella-db "description"# Apply migrations locallypnpm wrangler d1 migrations apply umbrella-db --local# Query local DBpnpm wrangler d1 execute umbrella-db --local --command "SELECT * FROM users"
```

### Deploying to Staging (Manual)

```bash
# Push to dev branch (auto-deploys to staging)git checkout dev
git merge feature/42-your-feature-name
git push origin dev
# OR manually deploy:pnpm wrangler deploy --env staging
```

---

## Deployment Process

### Deployment Environments

| Environment | Branch | URL | Auto-Deploy | Purpose |
| --- | --- | --- | --- | --- |
| **Development** | N/A | `localhost:5173` | No | Local testing |
| **Preview** | PR branch | `*.pages.dev` | Yes (on PR) | PR reviews |
| **Staging** | `dev` | `staging.umbrellalive.com` | Yes | Integration testing |
| **Production** | `main` | `umbrellalive.com` | Yes (after release-please) | Live users |

### Staging Deployment (Automatic)

**Trigger**: Push to `dev` branch

**Process**:
1. Developer merges PR to `dev`
2. GitHub Actions workflow `deploy-staging.yml` triggers
3. Builds application
4. Runs D1 migrations (staging)
5. Deploys Workers (API) to staging
6. Deploys Pages (frontend) to staging
7. Staging URL updated: `https://staging.umbrellalive.com`

**Verification**:

```bash
# Check deployment statusopen https://dash.cloudflare.com/
# Test staging siteopen https://staging.umbrellalive.com
# Check Wrangler logswrangler tail umbrella-staging
```

### Production Deployment (via release-please)

**Trigger**: Merge release-please PR to `main`

**Process**:

1. **Accumulate Changes on `dev`**:
    
    ```bash
    # Multiple PRs merged to dev over timefeat(marketplace): add infinite scroll (#87)fix(messaging): resolve char limit validation (#91)feat(profile): implement 6-tab system (#52)
    ```
    
2. **Verify on Staging**:
    - Test all features on `staging.umbrellalive.com`
    - Run E2E tests (if available)
    - Get stakeholder approval
3. **Trigger release-please**:
    
    ```bash
    # Merge dev into main (creates release-please PR)git checkout main
    git pull origin main
    git merge dev
    git push origin main
    ```
    
4. **release-please Creates PR**:
    - Title: `chore(main): release 0.3.0`
    - Updates `package.json` version
    - Generates `CHANGELOG.md`
    - Creates git tag `v0.3.0`
5. **Review Release PR**:
    - CTO reviews changelog
    - Confirms version bump is correct
    - Approves PR
6. **Merge Release PR**:
    - Click “Merge commit” (not squash)
    - Triggers production deployment workflow
    - Creates GitHub Release with tag
7. **Production Deploys Automatically**:
    - `deploy-production.yml` runs
    - Builds application
    - Runs D1 migrations (production)
    - Deploys Workers to production
    - Deploys Pages to production
    - Production URL updated: `https://umbrellalive.com`
8. **Post-Deployment**:
    - CTO copies release notes to Notion “Release Digest”
    - Team announces in Slack/Discord
    - Monitor error logs for 24 hours

**Verification**:

```bash
# Check GitHub Releaseopen https://github.com/umbrella-live/umbrella/releases
# Test production siteopen https://umbrellalive.com
# Check Wrangler logswrangler tail umbrella-production
```

---

### Rollback Strategy

**When to Rollback**:
- Critical bug affecting all users
- Data loss or corruption
- Security vulnerability
- Service unavailable (50x errors)

### Option 1: Revert Commit (Preferred)

```bash
# Find the bad commitgit log --oneline# Revert the commitgit revert <bad-commit-sha># Push to main (triggers redeploy)git push origin main
```

### Option 2: Rollback to Previous Release

```bash
# Find previous release taggit tag -l# Reset main to previous taggit checkout main
git reset --hard v0.2.0
# Force push (WARNING: Destructive)git push origin main --force-with-lease
```

### Option 3: Manual Wrangler Rollback

```bash
# List deploymentswrangler deployments list --env production
# Rollback to specific deploymentwrangler rollback <deployment-id> --env production
```

**After Rollback**:
1. Verify production is working
2. Identify root cause
3. Create hotfix PR
4. Test hotfix on staging
5. Merge hotfix to main
6. Monitor production

---

### Hotfix Process (Emergency)

**Use Case**: Critical production bug that can’t wait for normal release cycle

**Steps**:

1. **Create hotfix branch from main**:
    
    ```bash
    git checkout main
    git pull origin main
    git checkout -b hotfix/999-critical-bug
    ```
    
2. **Make fix**:
    
    ```bash
    # Edit filesgit add .
    git commit -m "fix(critical): resolve data loss bug (#999)"
    ```
    
3. **Test locally**:
    
    ```bash
    pnpm build
    pnpm preview
    # Verify fix works
    ```
    
4. **Create PR to main** (not dev):
    - Title: `[HOTFIX] fix(critical): resolve data loss bug (#999)`
    - Label: `hotfix`
    - Request CTO review immediately
5. **Merge to main**:
    - CTO approves
    - Merge (bypass branch protection if needed)
    - Triggers production deployment
6. **Cherry-pick to dev**:
    
    ```bash
    git checkout dev
    git cherry-pick <hotfix-commit-sha>git push origin dev
    ```
    
7. **Create post-mortem**:
    - Document root cause
    - Document fix
    - Document prevention measures
    - Share with team

---

## Demo Cadence Workflow

### Weekly Rhythm

**Monday**:
- Async standup in Notion “Stand-Up Logs”
- Each developer posts:
- **Doing**: Current work (issue numbers)
- **Done**: Completed since last week
- **Blocked**: Any blockers or questions
- CTO reviews and responds

**Tuesday-Wednesday**:
- Active development
- PRs created and reviewed
- Deploy to staging as PRs merge

**Thursday**:
- **Demo deadline**: Loom recordings due by EOD
- Developers upload demos to Notion “Demo Digest”

**Friday**:
- **CTO review**: Reviews all demos
- **Milestone check**: If ≥90% issues complete, trigger release
- **Release notes**: CTO pastes to Notion “Release Digest”
- **Planning**: Identify next week’s issues

### Demo Requirements

**When Required**:
- Issue labeled `DemoRequired=Yes`
- Typically: New features, UI changes, user-facing changes

**Format**:
- **Tool**: Loom (free screen recording)
- **Length**: 3-5 minutes
- **Content**:
1. Show feature working end-to-end (happy path)
2. Show one error state handled gracefully
3. Explain user value (“This lets artists…”)
4. Mention PR number and issue number

**Example Script**:

```
"Hi, I'm Dev A and I'm demoing the new artist profile tabs (issue #52, PR #128).

[Shows profile page loading]
Here's the 6-tab profile system. Users can navigate between Overview, Portfolio, Explore, Journey, Reviews, and Opportunities.

[Clicks through tabs]
Each tab has distinct content. The Portfolio tab shows all uploaded tracks with inline playback.

[Clicks play button]
Notice how the audio player appears inline without navigating away. This keeps the user in context.

[Shows empty state]
If an artist has no tracks, we show a helpful empty state with an 'Add Track' button.

This feature lets artists showcase their work more effectively and gives venues a complete view of an artist's profile in one place.

That's issue #52, PR #128. Thanks!"
```

**Upload Process**:
1. Record Loom video
2. Copy link from Loom
3. Open Notion “Demo Digest” page
4. Add new row:
- **Issue**: #52
- **PR**: #128
- **Developer**: Dev A
- **Date**: 2025-01-18
- **Loom Link**: (paste link)
5. Loom embeds automatically in Notion

### Notion Integration

**Notion Workspace Structure**:

```
Umbrella MVP
├── Engineering Roadmap (embed GitHub Project board)
├── Stand-Up Logs
│   ├── 2025-01-15 - Week 1
│   ├── 2025-01-22 - Week 2
│   └── ...
├── Demo Digest
│   ├── All Demos (table view)
│   └── By Week (gallery view)
└── Release Digest
    ├── v0.1.0 - 2025-01-08
    ├── v0.2.0 - 2025-01-15
    └── ...
```

**Demo Digest Table Columns**:
- **Issue**: Number (e.g., #52)
- **PR**: Number (e.g., #128)
- **Developer**: Select (Dev A, Dev B, Dev C)
- **Date**: Date picker
- **Loom Link**: URL
- **Status**: Select (Pending Review, Approved, Needs Changes)
- **CTO Notes**: Text

**Release Digest Template**:

```markdown
# Umbrella v0.3.0 — 2025-01-15### Added* 🎨 **Artist Profile (6-tab system)** — Public profile with portfolio, journey, reviews, and opportunities. (#45, #47, #52)
* 🧭 **Marketplace UI** — Discover Artists and Find Gigs tabs with infinite scroll. (#87, #89)
### Fixed* 🧯 **Routing edge cases** — Prevented full reloads on deep links. (#91)
### Changed* 🧱 **D1 schema v1** — Introduced base tables and migrations. (Docs:#DATA-MODEL) (#38)
> References: PRs #123, #128; Commits abc1234, def5678> Docs: /docs/architecture.md, /docs/data-model.md**Milestone Progress**: v0.3 ✅ Complete (12/12 issues done)
**Next Milestone**: v0.4 - Comms & Violet stubs (0/15 issues)
```

---

## Monitoring & Debugging

### Cloudflare Analytics

**Access**:
1. Cloudflare Dashboard → Workers & Pages → umbrella-production
2. Click “Metrics” tab

**Available Metrics**:
- **Requests**: Total requests over time
- **Errors**: 4xx and 5xx error rates
- **Duration**: P50, P75, P99 response times
- **CPU Time**: Worker execution time

**Alerts** (optional):
1. Dashboard → Notifications → Destinations → Add webhook
2. Add Slack webhook URL (if using Slack)
3. Create alert: “Notify if error rate > 5% for 5 minutes”

### Wrangler Logs

**Tail Logs (Real-Time)**:

```bash
# Productionwrangler tail umbrella-production
# Stagingwrangler tail umbrella-staging
# Filter by status codewrangler tail umbrella-production --status error
# Filter by methodwrangler tail umbrella-production --method POST
```

**Example Output**:

```
[2025-01-15 12:34:56] GET https://umbrellalive.com/api/artists/123
  Status: 200
  Duration: 45ms

[2025-01-15 12:35:12] POST https://umbrellalive.com/api/messages
  Status: 500
  Duration: 123ms
  Error: Database connection failed
```

### Error Tracking (Optional: Sentry)

**Setup Sentry**:

```bash
pnpm add @sentry/browser @sentry/tracing
```

**Initialize** (`src/main.tsx`):

```tsx
import * as Sentry from '@sentry/browser';Sentry.init({
  dsn: 'https://your-sentry-dsn@sentry.io/project-id',  environment: import.meta.env.VITE_ENV,  tracesSampleRate: 0.1, // 10% of transactions});
```

**Capture Errors**:

```tsx
try {
  // Code that might fail} catch (error) {
  Sentry.captureException(error);}
```

### D1 Database Debugging

**Query Database**:

```bash
# Localpnpm wrangler d1 execute umbrella-db --local --command "SELECT * FROM users LIMIT 10"# Stagingpnpm wrangler d1 execute umbrella-db --env staging --command "SELECT * FROM users LIMIT 10"# Production (use with caution)pnpm wrangler d1 execute umbrella-db --env production --command "SELECT * FROM users LIMIT 10"
```

**Check Migrations**:

```bash
# List applied migrationspnpm wrangler d1 migrations list umbrella-db --env production
```

**Backup Database** (manual):

```bash
# Export production data (use sparingly)pnpm wrangler d1 export umbrella-db --env production --output backup-2025-01-15.sql
```

---

## Troubleshooting Guide

### Common Issues & Solutions

### Issue: GitHub Actions Failing on “Lint” Step

**Error**:

```
ESLint found 5 errors
```

**Solution**:

```bash
# Run lint locallypnpm lint
# Auto-fix if possiblepnpm lint:fix
# Commit fixesgit add .
git commit -m "fix(ci): resolve linting errors (#123)"git push
```

---

### Issue: Wrangler Deployment Fails with “Unauthorized”

**Error**:

```
Error: Authentication error: Could not verify API token
```

**Solution**:
1. Verify `CLOUDFLARE_API_TOKEN` in GitHub Secrets
2. Check token permissions (should include Workers, D1, Pages)
3. Regenerate token if expired:
- Cloudflare Dashboard → API Tokens → Edit/Regenerate
4. Update GitHub Secret with new token

---

### Issue: D1 Migration Fails with “Syntax Error”

**Error**:

```
Error: SQLite error near line 5: syntax error
```

**Solution**:
1. Review migration file syntax
2. Test locally first:
`bash    pnpm wrangler d1 migrations apply umbrella-db --local`
3. Common issues:
- Missing semicolons
- Invalid SQL syntax
- Foreign key constraints not supported (use triggers instead)
4. Fix migration file
5. Re-run locally, then push to staging

---

### Issue: Preview Deployment Shows Blank Page

**Error**:
- Preview URL loads but shows white screen
- Console shows: `Failed to load resource: net::ERR_BLOCKED_BY_CLIENT`

**Solution**:
1. Check build logs in GitHub Actions
2. Verify environment variables:
`yaml    VITE_CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}    VITE_CF_ACCESS_AUD: ${{ secrets.CF_ACCESS_AUD_DEV }}`
3. Check browser console for errors
4. Common issues:
- Missing environment variables
- CORS issues with Cloudflare Access
- Ad blockers blocking Cloudflare domains

---

### Issue: claude-code Workflow Failing on Commit Messages

**Error**:

```
❌ Issue Reference Check Failed
The following commits are missing issue references:
- abc1234: feat(auth): add login button
```

**Solution**:
1. Rewrite commit messages to include issue reference:
`bash    git rebase -i HEAD~3  # Interactive rebase for last 3 commits`
2. Change commit messages to:
`feat(auth): add login button (#42)`
3. Force push:
`bash    git push --force-with-lease`

---

### Issue: release-please Not Creating PR

**Error**:
- Merged multiple commits to `main`
- No release-please PR appears

**Solution**:
1. Verify commits follow Conventional Commits format:
`bash    git log --oneline`
2. Check `.release-please-manifest.json` exists
3. Check `release-please-config.json` exists
4. Manually trigger workflow:
- GitHub → Actions → release-please → Run workflow
5. If still fails, check workflow logs for errors

---

### Issue: Wrangler Secret Not Found in Worker

**Error**:

```
TypeError: env.RESEND_API_KEY is undefined
```

**Solution**:
1. Verify secret was set:
`bash    wrangler secret list --env production`
2. If missing, set secret:
`bash    echo "re_your_key" | wrangler secret put RESEND_API_KEY --env production`
3. Wait 1-2 minutes for secret to propagate
4. Re-deploy:
`bash    pnpm wrangler deploy --env production`

---

### Issue: Staging Deployment Succeeds but Site Shows Old Version

**Error**:
- Deployment logs show success
- Staging site still shows old version
- No errors in console

**Solution**:
1. Clear Cloudflare cache:
- Cloudflare Dashboard → Caching → Purge Cache → Purge Everything
2. Hard refresh browser:
- Chrome/Firefox: `Cmd+Shift+R` (Mac) or `Ctrl+F5` (Windows)
3. Check deployment timestamp:
`bash    wrangler deployments list --env staging`
4. Verify correct environment in `wrangler.toml`:
`toml    [env.staging]    name = "umbrella-staging"`

---

### Issue: Local Dev Server Won’t Start

**Error**:

```
Error: listen EADDRINUSE: address already in use :::5173
```

**Solution**:
1. Kill process using port 5173:
```bash
# macOS/Linux
lsof -ti:5173 | xargs kill -9

# Windows
netstat -ano | findstr :5173
taskkill /PID  /F
`2. Restart dev server:`bash
pnpm dev
`3. If issue persists, change port in `vite.config.ts`:`typescript
export default defineConfig({
server: {
port: 5174, // Use different port
},
});
```

---

### Issue: Cannot Push to Protected Branch

**Error**:

```
remote: error: GH006: Protected branch update failed
```

**Solution**:
1. Never push directly to `main` or `dev`
2. Create PR instead:
`bash    git checkout -b feature/123-your-feature    git push origin feature/123-your-feature    # Create PR on GitHub`
3. If legitimate hotfix:
- Contact CTO to temporarily disable branch protection
- Push hotfix
- Re-enable branch protection

---

## Appendix: Complete Workflow Files

### A.1 - Full pr-checks.yml

*See [Workflow 1: PR Checks](about:blank#workflow-1-pr-checks) above for complete file*

### A.2 - Full deploy-preview.yml

*See [Workflow 2: Deploy Preview](about:blank#workflow-2-deploy-preview) above for complete file*

### A.3 - Full deploy-staging.yml

*See [Workflow 3: Deploy Staging](about:blank#workflow-3-deploy-staging) above for complete file*

### A.4 - Full deploy-production.yml

*See [Workflow 4: Deploy Production](about:blank#workflow-4-deploy-production) above for complete file*

### A.5 - Full release-please.yml

*See [Workflow 5: release-please](about:blank#workflow-5-release-please) above for complete file*

### A.6 - Full claude-code.yml

*See [Workflow 6: claude-code Issue Enforcement](about:blank#workflow-6-claude-code-issue-enforcement) above for complete file*

### A.7 - Full commitlint.yml

*See [Workflow 7: Commitlint](about:blank#workflow-7-commitlint) above for complete file*

---

## Quick Reference

### Key Commands

```bash
# Developmentpnpm dev                    # Start local dev serverpnpm build                  # Build for productionpnpm preview                # Preview production buildpnpm lint                   # Run ESLintpnpm format                 # Format with Prettierpnpm test                   # Run unit tests# Databasewrangler d1 migrations create umbrella-db "description"wrangler d1 migrations apply umbrella-db --localwrangler d1 execute umbrella-db --local --command "SELECT * FROM users"# Deploymentgit push origin dev         # Deploy to stagingwrangler deploy --env staging   # Manual staging deploywrangler deploy --env production  # Manual production deploy# Secretswrangler secret put SECRET_NAME --env dev
wrangler secret list --env production
wrangler secret delete SECRET_NAME --env production
# Debuggingwrangler tail umbrella-production
wrangler deployments list --env production
wrangler rollback <deployment-id> --env production
```

### Key URLs

- **Production**: https://umbrellalive.com
- **Staging**: https://staging.umbrellalive.com
- **Cloudflare Dashboard**: https://dash.cloudflare.com
- **GitHub Org**: https://github.com/umbrella-live
- **GitHub Project**: https://github.com/orgs/umbrella-live/projects/1
- **Notion Workspace**: [Insert Notion URL]

### Key Contacts

- **CTO**: [cto@umbrellalive.com]
- **Dev A (FE/UI)**: [dev-a@umbrellalive.com]
- **Dev B (FS/Marketplace)**: [dev-b@umbrellalive.com]
- **Dev C (Backend/API)**: [dev-c@umbrellalive.com]

---

**END OF DEVOPS GUIDE**

*For questions or updates, contact the CTO or submit a PR to update this document.*# Umbrella MVP - DevOps Guide

**Version:** 1.0

**Last Updated:** October 14, 2025

**Target Timeline:** 6-week MVP (v0.1 → v1.0)

**Team:** CTO + 3 Developers (Dev A: FE/UI, Dev B: FS/Marketplace, Dev C: Backend/API)

---

## Table of Contents

1. [Overview](about:blank#overview)
2. [Repository Structure](about:blank#repository-structure)
3. [GitHub Workflows](about:blank#github-workflows)
4. [Branch Strategy & Protection](about:blank#branch-strategy--protection)
5. [Secrets Management](about:blank#secrets-management)
6. [Service Configuration](about:blank#service-configuration)
7. [Developer Onboarding](about:blank#developer-onboarding)
8. [Deployment Process](about:blank#deployment-process)
9. [Demo Cadence Workflow](about:blank#demo-cadence-workflow)
10. [Monitoring & Debugging](about:blank#monitoring--debugging)
11. [Troubleshooting Guide](about:blank#troubleshooting-guide)
12. [Appendix: Complete Workflow Files](about:blank#appendix-complete-workflow-files)

---

## Overview

### DevOps Philosophy

Umbrella’s DevOps workflow is built on three core principles:

1. **Demo-First Development**: Weekly demos drive progress and accountability
2. **Automated Versioning**: Conventional Commits + release-please eliminate manual releases
3. **High-Touch Collaboration**: Small team, clear ownership, peer reviews

### Key Components

- **Version Control**: GitHub with 5 specialized repositories
- **CI/CD**: GitHub Actions for automated testing and deployment
- **Infrastructure**: Cloudflare (Workers, D1, KV, R2, Pages, Access)
- **External Services**: Resend (email), Twilio (SMS), Claude API (AI)
- **Development Flow**: Feature branches → `dev` (staging) → `main` (production)

### Versioning Strategy

Umbrella uses **semantic versioning** aligned with development milestones:

- **v0.1** - Foundations & CI (repo setup, auth stub, DB schema)
- **v0.2** - Auth & DB bring-up (working login, profile CRUD)
- **v0.3** - Visualize Profile & Marketplace (UI complete, no backend)
- **v0.4** - Comms & Violet stubs (email/SMS working, Violet navigation)
- **v0.5** - Marketplace API & E2E paths (full marketplace flow)
- **v1.0** - MVP hardening & release (polish, docs, demo)

Each milestone requires ≥90% of issues complete before progressing to the next.

---

## Repository Structure

### Organization: `umbrella-live`

All repositories live under a single GitHub organization for centralized management.

### Repository 1: `umbrella` (Main Application)

**Purpose**: Primary application codebase (Vite SPA + Cloudflare Workers)

**Directory Structure**:

```
umbrella/
├── .github/
│   └── workflows/          # GitHub Actions workflows
├── src/
│   ├── components/         # React components
│   ├── pages/             # Page-level components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities and helpers
│   └── styles/            # Global styles
├── workers/
│   ├── api/               # API endpoints (Cloudflare Workers)
│   ├── cron/              # Scheduled jobs
│   └── middleware/        # Auth, error handling
├── migrations/
│   └── *.sql              # D1 database migrations
├── docs/
│   ├── architecture.md
│   ├── data-model.md
│   └── api-contracts/
├── wrangler.toml          # Cloudflare configuration
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .env.example           # Template for local dev
├── .gitignore
├── README.md
└── CONTRIBUTING.md
```

**Key Files**:
- `wrangler.toml`: Defines dev/staging/prod environments
- `package.json`: Dependencies and scripts
- `.env.example`: Template for required environment variables

**Workflows Needed**:
- PR checks (lint, test, build)
- Deploy preview (Cloudflare Pages preview)
- Deploy staging (on push to `dev`)
- Deploy production (on push to `main`)
- release-please (version bumping)
- claude-code (enforce issue references)
- commitlint (enforce Conventional Commits)

---

### Repository 2: `components` (Design System)

**Purpose**: Shared UI component library

**Directory Structure**:

```
components/
├── src/
│   ├── components/
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Input/
│   │   ├── Modal/
│   │   └── Toast/
│   └── tokens/            # Design tokens
├── stories/               # Storybook stories (optional)
├── package.json
├── tsconfig.json
└── README.md
```

**Publishing Strategy**:
- Publish to npm as `@umbrella/components` (OR use git submodule/import)
- Version independently from main app

**Workflows Needed**:
- PR checks (lint, test, build)
- Publish to npm (on release)
- Deploy Storybook (optional, for visual documentation)

---

### Repository 3: `marketplace` (Marketplace Module)

**Purpose**: Marketplace-specific UI and logic (owned by Dev B)

**Directory Structure**:

```
marketplace/
├── src/
│   ├── components/
│   │   ├── GigCard/
│   │   ├── ArtistCard/
│   │   ├── FilterBar/
│   │   └── SearchBar/
│   ├── hooks/
│   └── utils/
├── package.json
└── README.md
```

**Integration Strategy**:
- May be merged into `umbrella` repo post-MVP
- For MVP, developed separately to allow Dev B to work independently

**Workflows Needed**:
- PR checks (lint, test)

---

### Repository 4: `violet-ai` (Violet AI Module)

**Purpose**: Violet AI toolkit navigation and prompt handling

**Directory Structure**:

```
violet-ai/
├── src/
│   ├── components/
│   │   ├── ToolkitNav/
│   │   ├── IntentPicker/
│   │   └── PromptTemplates/
│   ├── api/
│   │   └── claude-proxy.ts   # Claude API integration
│   └── config/
│       └── toolkit-taxonomy.ts  # 10 categories, 30+ tools
├── package.json
└── README.md
```

**Integration Strategy**:
- Lazy-loaded module in `umbrella` (to optimize initial bundle size)
- Claude API calls proxied through Cloudflare Worker

**Workflows Needed**:
- PR checks (lint, test)

---

### Repository 5: `docs` (Documentation Hub)

**Purpose**: All project documentation

**Directory Structure**:

```
docs/
├── docs/
│   ├── index.md
│   ├── architecture.md
│   ├── data-model.md
│   ├── devops.md            # This file
│   ├── spec/
│   │   └── umbrella-prd-v2.md
│   ├── contracts/
│   │   ├── auth-api.md
│   │   ├── marketplace-api.md
│   │   └── violet-api.md
│   └── ops/
│       ├── logging.md
│       ├── metrics.md
│       └── alerting.md
├── .vitepress/              # VitePress config (optional)
│   └── config.ts
├── package.json
└── README.md
```

**Deployment Strategy**:
- Option 1: Deploy VitePress site to Cloudflare Pages
- Option 2: Serve raw markdown from GitHub Pages

**Workflows Needed**:
- Deploy documentation site (on push to `main`)

---

### `.gitignore` Templates

**For `umbrella`, `marketplace`, `violet-ai`**:

```
# Dependencies
node_modules/
.pnpm-store/

# Build outputs
dist/
.output/
.wrangler/

# Environment variables
.env
.env.local
.dev.vars

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
pnpm-debug.log*

# Testing
coverage/
.nyc_output/

# Temporary files
*.tmp
.cache/
```

**For `components`**:

```
node_modules/
dist/
.pnpm-store/
.DS_Store
*.log
storybook-static/
```

**For `docs`**:

```
node_modules/
.vitepress/cache/
.vitepress/dist/
.DS_Store
*.log
```

---

### README.md Templates

**Template for `umbrella/README.md`**:

```markdown
# Umbrella - Music Industry Platform**Version**: [Current Version from package.json]
**Status**: MVP Development
## OverviewUmbrella is an all-in-one platform for artists, venues, and music lovers. This repository contains the main application codebase.
## Prerequisites- Node.js 18+ (LTS)
- pnpm 8+
- Cloudflare account with Workers, D1, KV, R2 enabled
- Wrangler CLI installed globally: `npm i -g wrangler`## Local Development Setup1. Clone the repository:
   ```bash   git clone https://github.com/umbrella-live/umbrella.git
   cd umbrella
```

1. Install dependencies:
    
    ```bash
    pnpm install
    ```
    
2. Copy environment template:
    
    ```bash
    cp .env.example .env.local
    ```
    
3. Fill in `.env.local` with your development credentials (see [Environment Variables](about:blank#environment-variables))
4. Run local development server:
    
    ```bash
    pnpm dev
    ```
    
5. Access the application at `http://localhost:5173`

## Scripts

- `pnpm dev` - Start Vite dev server + Wrangler dev proxy
- `pnpm build` - Build production bundle
- `pnpm preview` - Preview production build locally
- `pnpm lint` - Run ESLint
- `pnpm format` - Run Prettier
- `pnpm type-check` - Run TypeScript compiler check
- `pnpm test` - Run Vitest unit tests
- `pnpm wrangler` - Access Wrangler CLI

## Environment Variables

Required variables for local development:

```bash
# CloudflareVITE_CLOUDFLARE_ACCOUNT_ID=your_account_id
VITE_CF_ACCESS_AUD=your_access_aud_token
# External Services (for testing)VITE_TWILIO_ACCOUNT_SID=your_twilio_sid
VITE_RESEND_API_KEY=your_resend_key
VITE_CLAUDE_API_KEY=your_claude_key
```

See [docs/devops.md](./docs/devops.md) for detailed setup instructions.

## Architecture

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Cloudflare Workers (serverless)
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2 (S3-compatible)
- **Cache**: Cloudflare KV
- **Auth**: Cloudflare Access (Apple/Google OAuth)

## Project Structure

```
src/           - React application code
workers/       - Cloudflare Workers (API + cron)
migrations/    - D1 database migrations
docs/          - Project documentation
```

## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for our contribution guidelines.

## Deployment

- **Staging**: Automatically deployed on push to `dev` branch
- **Production**: Automatically deployed on merge to `main` branch (via release-please)

## Documentation

- [Architecture](./docs/architecture.md)
- [Data Model](./docs/data-model.md)
- [API Contracts](./docs/contracts/)
- [DevOps Guide](./docs/devops.md)

## License

Proprietary - All Rights Reserved

## Support

For questions or issues, contact the development team:
- CTO: [cto@umbrellalive.com]
- Dev Team: [dev@umbrellalive.com]

```

---

### CONTRIBUTING.md Template

**Template for `umbrella/CONTRIBUTING.md`**:
```markdown
# Contributing to Umbrella

Thank you for contributing to Umbrella! This guide will help you understand our development workflow.

## Development Workflow

### 1. Pick an Issue

- All work must be tracked in a GitHub issue
- Check the [Project Board](https://github.com/orgs/umbrella-live/projects/1) for available issues
- Issues are organized by milestone (v0.1, v0.2, etc.)
- Assign yourself to an issue before starting work

### 2. Create a Feature Branch

```bash
git checkout dev
git pull origin dev
git checkout -b feature/<issue-id>-short-description
```

Example: `feature/42-implement-apple-oauth`

### 3. Write Conventional Commits

**Every commit MUST follow this format:**

```
<type>(<scope>): <description> (#<issue-number>)

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `chore`: Maintenance tasks
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding/updating tests
- `ci`: CI/CD changes
- `build`: Build system changes
- `revert`: Reverting previous changes

**Examples:**

```
feat(auth): implement Apple OAuth (#42)
fix(marketplace): resolve distance calculation bug (#87)
docs(violet): update AI toolkit category descriptions (#103)
chore(deps): bump wrangler to 3.x (#56)
```

**CRITICAL**: Every commit MUST reference an issue number using `(#123)` format. This is enforced by CI and will cause your PR to fail if missing.

### 4. Make Your Changes

- Write clean, readable code
- Add unit tests for new functionality
- Update documentation if API contracts change
- Run `pnpm lint` and `pnpm format` before committing

### 5. Create a Pull Request

**PR Title Format:**

```
<type>(<area>): <short description> (#<issue>)
```

**PR Template Checklist:**
- [ ] Tests added/updated
- [ ] API contracts documented (if applicable)
- [ ] Environment variables listed in PR description (if new vars added)
- [ ] Demo link included (if `DemoRequired=Yes` label)
- [ ] Release note one-liner written

**Target Branch:** Always create PRs against `dev`, never `main`

### 6. Code Review

- Request review from:
    - **Dev A ↔︎ Dev B**: Peer review each other
    - **Dev C**: Reviewed by CTO or Dev B
    - **CTO**: Spot-checks all PRs
- Address review comments promptly
- Make requested changes in new commits (don’t force-push during review)
- Re-request review after addressing comments

### 7. Merge

- Squash-merge PRs to keep `dev` history clean
- Delete feature branch after merge
- Move issue to “Done” in Project Board

## Demo Requirements

If your issue has the `DemoRequired=Yes` label, you must:

1. Record a 3-5 minute Loom video showing:
    - Feature working end-to-end (happy path)
    - One error state handled gracefully
    - Explanation of user value (“This lets artists…”)
2. Upload to Notion “Demo Digest” page by Thursday
3. Link the Loom in your PR description

## Breaking Changes

If your change breaks existing functionality:

1. Add `BREAKING CHANGE:` footer to commit message:
    
    ```
    feat(auth): remove email/password authentication (#42)
    
    BREAKING CHANGE: Email/password auth removed. Users must use Apple or Google OAuth.
    ```
    
2. Document migration path in commit body
3. Update affected documentation
4. Notify team in Slack/Discord

## Testing

### Unit Tests (Required)

```bash
pnpm test
```

- Write tests for all new functions/components
- Aim for >80% code coverage
- Mock external services (Twilio, Resend, Claude API)

### E2E Tests (Optional for v0.x, Required for v1.0)

```bash
pnpm test:e2e
```

- Critical user flows must have E2E tests
- Run locally before merging to `main`

## Style Guide

### TypeScript

- Use TypeScript for all new code
- Prefer `interface` over `type` for object shapes
- Use strict mode (`"strict": true` in tsconfig.json)
- No `any` types without explicit comment explaining why

### React

- Use functional components with hooks
- Prefer named exports over default exports
- Keep components small and focused (<200 lines)
- Use custom hooks for shared logic

### CSS

- Use Tailwind utility classes
- Avoid custom CSS unless absolutely necessary
- Use design tokens from `@umbrella/components`

### File Naming

- Components: `PascalCase.tsx` (e.g., `ArtistCard.tsx`)
- Hooks: `camelCase.ts` with `use` prefix (e.g., `useAuth.ts`)
- Utils: `camelCase.ts` (e.g., `formatDate.ts`)
- Pages: `kebab-case.tsx` (e.g., `artist-profile.tsx`)

## Environment Variables

When adding new environment variables:

1. Add to `.env.example` with placeholder value
2. Document in PR description
3. Update [docs/devops.md](./docs/devops.md) with setup instructions
4. Notify CTO to add to GitHub Secrets

## Database Migrations

When modifying the database schema:

1. Create a new migration file:
    
    ```bash
    pnpm wrangler d1 migrations create umbrella-db "<description>"
    ```
    
2. Write SQL in the generated file:
    
    ```sql
    -- Migration: Add profile_completion_percentage columnALTER TABLE artists ADD COLUMN profile_completion_percentage INTEGER DEFAULT 0;
    ```
    
3. Test locally:
    
    ```bash
    pnpm wrangler d1 migrations apply umbrella-db --local
    ```
    
4. Document in PR description
5. Migrations will auto-run in staging/production on deployment

## Getting Help

- **General Questions**: Post in #dev-help Slack channel
- **Bug Reports**: Create an issue with `bug` label
- **Feature Requests**: Discuss with CTO before creating issue
- **Urgent Issues**: DM CTO directly

## Resources

- [Conventional Commits Spec](https://www.conventionalcommits.org/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [Vite Docs](https://vitejs.dev/)
- [React Docs](https://react.dev/)

## Code of Conduct

- Be respectful and professional
- Provide constructive feedback
- Help teammates when they’re stuck
- Celebrate wins, big and small
- Communicate early and often

---

**Questions?** Reach out in #engineering Slack channel or DM the CTO.

```

---

## GitHub Workflows

Umbrella uses **7 GitHub Actions workflows** to automate testing, deployment, and release management.

### Workflow Overview

| Workflow | Trigger | Purpose | Duration |
|----------|---------|---------|----------|
| `pr-checks.yml` | Pull Request | Lint, test, type-check, build | ~2-3 min |
| `deploy-preview.yml` | Pull Request | Deploy preview to Cloudflare Pages | ~3-4 min |
| `deploy-staging.yml` | Push to `dev` | Deploy to staging environment | ~4-5 min |
| `deploy-production.yml` | Push to `main` | Deploy to production environment | ~4-5 min |
| `release-please.yml` | Push to `main` | Create/update release PR | ~30 sec |
| `claude-code.yml` | Pull Request | Enforce issue references in commits | ~30 sec |
| `commitlint.yml` | Pull Request | Enforce Conventional Commits format | ~30 sec |

### Workflow 1: PR Checks

**File**: `.github/workflows/pr-checks.yml`

```yaml
name: PR Checks

on:
  pull_request:
    branches: [dev]

jobs:
  lint-and-test:
    name: Lint, Test, and Build
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Fetch all history for commitlint

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run ESLint
        run: pnpm lint

      - name: Run Prettier check
        run: pnpm format:check

      - name: Run TypeScript type check
        run: pnpm type-check

      - name: Run unit tests
        run: pnpm test --run

      - name: Build application
        run: pnpm build
        env:
          # Use dummy values for build-time env vars
          VITE_CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          VITE_CF_ACCESS_AUD: ${{ secrets.CF_ACCESS_AUD_DEV }}

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-output
          path: dist/
          retention-days: 7
```

**Notes:**
- Runs on every PR to `dev`
- Must pass before merge is allowed
- Uses pnpm for faster installs
- Uploads build artifacts for inspection

---

### Workflow 2: Deploy Preview

**File**: `.github/workflows/deploy-preview.yml`

```yaml
name: Deploy Previewon:  pull_request:    branches: [dev]jobs:  deploy-preview:    name: Deploy to Cloudflare Pages Preview    runs-on: ubuntu-latest    permissions:      contents: read      deployments: write      pull-requests: write    steps:      - name: Checkout code        uses: actions/checkout@v4      - name: Setup Node.js        uses: actions/setup-node@v4        with:          node-version: '18'          cache: 'pnpm'      - name: Install pnpm        uses: pnpm/action-setup@v2        with:          version: 8      - name: Install dependencies        run: pnpm install --frozen-lockfile      - name: Build for preview        run: pnpm build        env:          VITE_CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}          VITE_CF_ACCESS_AUD: ${{ secrets.CF_ACCESS_AUD_DEV }}          VITE_ENV: preview      - name: Publish to Cloudflare Pages        uses: cloudflare/pages-action@v1        id: cloudflare-pages        with:          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}          projectName: umbrella-preview          directory: dist          gitHubToken: ${{ secrets.GITHUB_TOKEN }}      - name: Comment preview URL on PR        uses: actions/github-script@v7        with:          script: |            const previewUrl = '${{ steps.cloudflare-pages.outputs.url }}';
            const comment = `## 🚀 Preview Deployment Ready!
            Your preview deployment is now available:
            **Preview URL**: ${previewUrl}
            This preview will be automatically deleted when the PR is closed.`;
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
```

**Notes:**
- Creates a unique preview URL for each PR
- Deploys to Cloudflare Pages (preview environment)
- Posts preview URL as PR comment
- Auto-deletes when PR is closed

---

### Workflow 3: Deploy Staging

**File**: `.github/workflows/deploy-staging.yml`

```yaml
name: Deploy Stagingon:  push:    branches: [dev]jobs:  deploy-staging:    name: Deploy to Staging Environment    runs-on: ubuntu-latest    environment:      name: staging      url: https://staging.umbrellalive.com    steps:      - name: Checkout code        uses: actions/checkout@v4      - name: Setup Node.js        uses: actions/setup-node@v4        with:          node-version: '18'          cache: 'pnpm'      - name: Install pnpm        uses: pnpm/action-setup@v2        with:          version: 8      - name: Install dependencies        run: pnpm install --frozen-lockfile      - name: Build for staging        run: pnpm build        env:          VITE_CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}          VITE_CF_ACCESS_AUD: ${{ secrets.CF_ACCESS_AUD_STAGING }}          VITE_ENV: staging      - name: Run D1 migrations (staging)        run: pnpm wrangler d1 migrations apply umbrella-db --env staging        env:          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}      - name: Deploy to Cloudflare Workers (staging)        run: pnpm wrangler deploy --env staging        env:          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}      - name: Deploy frontend to Cloudflare Pages (staging)        uses: cloudflare/pages-action@v1        with:          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}          projectName: umbrella-staging          directory: dist          branch: staging      - name: Notify deployment success        run: |          echo "✅ Staging deployment successful!"
          echo "URL: https://staging.umbrellalive.com"
      # Optional: Notify in Slack/Discord      # - name: Notify team      #   uses: slackapi/slack-github-action@v1      #   with:      #     payload: |      #       {      #         "text": "🚀 Staging deployment complete: https://staging.umbrellalive.com"      #       }      #   env:      #     SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

**Notes:**
- Deploys on every push to `dev` branch
- Runs D1 migrations before deploying
- Deploys both Workers (API) and Pages (frontend)
- Uses staging-specific secrets and configuration

---

### Workflow 4: Deploy Production

**File**: `.github/workflows/deploy-production.yml`

```yaml
name: Deploy Productionon:  push:    branches: [main]jobs:  deploy-production:    name: Deploy to Production Environment    runs-on: ubuntu-latest    environment:      name: production      url: https://umbrellalive.com    steps:      - name: Checkout code        uses: actions/checkout@v4      - name: Setup Node.js        uses: actions/setup-node@v4        with:          node-version: '18'          cache: 'pnpm'      - name: Install pnpm        uses: pnpm/action-setup@v2        with:          version: 8      - name: Install dependencies        run: pnpm install --frozen-lockfile      - name: Build for production        run: pnpm build        env:          VITE_CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}          VITE_CF_ACCESS_AUD: ${{ secrets.CF_ACCESS_AUD_PRODUCTION }}          VITE_ENV: production      - name: Run D1 migrations (production)        run: pnpm wrangler d1 migrations apply umbrella-db --env production        env:          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}      - name: Deploy to Cloudflare Workers (production)        run: pnpm wrangler deploy --env production        env:          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}      - name: Deploy frontend to Cloudflare Pages (production)        uses: cloudflare/pages-action@v1        with:          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}          projectName: umbrella-production          directory: dist          branch: main      - name: Notify deployment success        run: |          echo "✅ Production deployment successful!"
          echo "URL: https://umbrellalive.com"
      # Optional: Create deployment notification      # - name: Notify team      #   uses: slackapi/slack-github-action@v1      #   with:      #     payload: |      #       {      #         "text": "🎉 Production deployment complete: https://umbrellalive.com"      #       }      #   env:      #     SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

**Notes:**
- Deploys on every push to `main` branch
- Only triggered after release-please PR is merged
- Runs D1 migrations before deploying
- Uses production-specific secrets and configuration
- Critical: Test on staging before merging release-please PR

---

### Workflow 5: release-please

**File**: `.github/workflows/release-please.yml`

```yaml
name: Release Pleaseon:  push:    branches:      - mainpermissions:  contents: write  pull-requests: writejobs:  release-please:    runs-on: ubuntu-latest    steps:      - name: Run release-please        uses: google-github-actions/release-please-action@v4        id: release        with:          # Release type: node (for Node.js/npm projects)          release-type: node          # Package name (used in release title)          package-name: umbrella          # Changelog sections configuration          # Maps commit types to changelog sections          changelog-types: |            [
              {"type":"feat","section":"Added","hidden":false},
              {"type":"fix","section":"Fixed","hidden":false},
              {"type":"refactor","section":"Changed","hidden":false},
              {"type":"perf","section":"Changed","hidden":false},
              {"type":"docs","hidden":true},
              {"type":"chore","hidden":true},
              {"type":"test","hidden":true},
              {"type":"ci","hidden":true},
              {"type":"build","hidden":true},
              {"type":"style","section":"Changed","hidden":false}
            ]
      # Optional: Publish to npm if you want to distribute components package      # - name: Publish to npm      #   if: ${{ steps.release.outputs.release_created }}      #   run: npm publish      #   env:      #     NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}      - name: Output release information        if: ${{ steps.release.outputs.release_created }}        run: |          echo "Release created: ${{ steps.release.outputs.tag_name }}"
          echo "Major version: ${{ steps.release.outputs.major }}"
          echo "Minor version: ${{ steps.release.outputs.minor }}"
          echo "Patch version: ${{ steps.release.outputs.patch }}"
```

**Configuration Files Needed**:

**`.release-please-manifest.json`** (in repo root):

```json
{  ".": "0.1.0"}
```

**`release-please-config.json`** (in repo root):

```json
{  "packages": {    ".": {      "release-type": "node",      "changelog-sections": [        {"type": "feat", "section": "Added", "hidden": false},        {"type": "fix", "section": "Fixed", "hidden": false},        {"type": "refactor", "section": "Changed", "hidden": false},        {"type": "perf", "section": "Changed", "hidden": false},        {"type": "style", "section": "Changed", "hidden": false},        {"type": "docs", "hidden": true},        {"type": "chore", "hidden": true},        {"type": "test", "hidden": true},        {"type": "ci", "hidden": true},        {"type": "build", "hidden": true}      ]    }  }}
```

**How it Works**:

1. **On every push to `main`**:
    - release-please scans commits since last release
    - Determines version bump based on commit types:
        - `feat:` → minor version (0.1.0 → 0.2.0)
        - `fix:` → patch version (0.1.0 → 0.1.1)
        - `BREAKING CHANGE:` → major version (0.1.0 → 1.0.0)
2. **Creates/updates a Release PR** with:
    - Updated `package.json` version
    - Generated `CHANGELOG.md`
    - Git tag (e.g., `v0.3.0`)
3. **When Release PR is merged**:
    - Creates a GitHub Release with tag and notes
    - Triggers production deployment workflow

**Example Release PR Title**:

```
chore(main): release 0.3.0
```

**Example CHANGELOG.md** (auto-generated):

```markdown
# Changelog## [0.3.0](https://github.com/umbrella-live/umbrella/compare/v0.2.0...v0.3.0) (2025-01-15)### Added* **marketplace**: add infinite scroll to gig listings ([abc1234](https://github.com/umbrella-live/umbrella/commit/abc1234))
* **profile**: implement 6-tab profile system ([def5678](https://github.com/umbrella-live/umbrella/commit/def5678))
### Fixed* **messaging**: resolve 2000 char limit validation ([789abcd](https://github.com/umbrella-live/umbrella/commit/789abcd))
### Changed* **db**: optimize gig query with indexes ([ef01234](https://github.com/umbrella-live/umbrella/commit/ef01234))
```

---

### Workflow 6: claude-code Issue Enforcement

**File**: `.github/workflows/claude-code.yml`

```yaml
name: Claude Code - Issue Enforcementon:  pull_request:    types: [opened, synchronize, reopened]jobs:  check-issue-references:    name: Verify Issue References in Commits    runs-on: ubuntu-latest    steps:      - name: Checkout code        uses: actions/checkout@v4        with:          fetch-depth: 0  # Fetch all history to access all commits      - name: Get PR commits        id: get-commits        uses: actions/github-script@v7        with:          script: |            const commits = await github.rest.pulls.listCommits({
              owner: context.repo.owner,
              repo: context.repo.repo,
              pull_number: context.issue.number
            });
            return commits.data.map(c => ({
              sha: c.sha,
              message: c.commit.message
            }));
      - name: Check for issue references        uses: actions/github-script@v7        with:          script: |            const commits = ${{ steps.get-commits.outputs.result }};
            const issueRegex = /\(#\d+\)/;  // Matches (#123)
            const failedCommits = [];
            for (const commit of commits) {
              // Check if commit message contains issue reference
              if (!issueRegex.test(commit.message)) {
                failedCommits.push({
                  sha: commit.sha,
                  message: commit.message.split('\n')[0]  // First line only
                });
              }
            }
            if (failedCommits.length > 0) {
              const failedList = failedCommits.map(c =>
                `- \`${c.sha.substring(0, 7)}\`: ${c.message}`
              ).join('\n');
              const comment = `## ❌ Issue Reference Check Failed
              The following commits are missing issue references:
              ${failedList}
              ### How to Fix
              Every commit message must reference an issue using the format \`(#123)\`.
              **Example:**
              \`\`\`
              feat(auth): implement Apple OAuth (#42)
              \`\`\`
              **To fix:**
              1. Rewrite commit messages to include issue references
              2. Use \`git rebase -i\` to edit commit messages
              3. Force push to update the PR: \`git push --force-with-lease\`
              **Need help?** See [CONTRIBUTING.md](./CONTRIBUTING.md) for commit message guidelines.`;
              await github.rest.issues.createComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: context.issue.number,
                body: comment
              });
              core.setFailed(`${failedCommits.length} commit(s) missing issue references`);
            } else {
              console.log('✅ All commits have issue references');
            }
```

**Notes:**
- Scans all commits in PR
- Checks for `(#123)` pattern in commit messages
- Fails CI if any commit lacks issue reference
- Posts helpful comment with instructions to fix

**Why This Matters**:
- Ensures traceability between code changes and issues
- Required for demo-first workflow
- Enables automatic linking in release notes

---

### Workflow 7: Commitlint

**File**: `.github/workflows/commitlint.yml`

```yaml
name: Commitlinton:  pull_request:    types: [opened, synchronize, reopened]jobs:  commitlint:    name: Lint Commit Messages    runs-on: ubuntu-latest    steps:      - name: Checkout code        uses: actions/checkout@v4        with:          fetch-depth: 0  # Fetch all history      - name: Setup Node.js        uses: actions/setup-node@v4        with:          node-version: '18'      - name: Install commitlint        run: |          npm install -g @commitlint/cli @commitlint/config-conventional
      - name: Lint commits in PR        run: |          # Get commits in PR
          git fetch origin ${{ github.base_ref }}
          # Lint each commit
          npx commitlint --from origin/${{ github.base_ref }} --to HEAD --verbose
```

**Configuration File**:

**`commitlint.config.js`** (in repo root):

```jsx
module.exports = {
  extends: ['@commitlint/config-conventional'],  rules: {
    // Allowed commit types    'type-enum': [
      2,      'always',      [
        'feat',     // New feature        'fix',      // Bug fix        'docs',     // Documentation        'chore',    // Maintenance        'refactor', // Code refactoring        'perf',     // Performance improvement        'test',     // Adding tests        'ci',       // CI/CD changes        'build',    // Build system changes        'revert',   // Reverting changes        'style'     // Code style changes      ]
    ],    // Allow any case for subject (to support proper nouns)    'subject-case': [0],    // Subject must not be empty    'subject-empty': [2, 'never'],    // Subject must not end with period    'subject-full-stop': [2, 'never', '.'],    // Type must be in lowercase    'type-case': [2, 'always', 'lower-case'],    // Type must not be empty    'type-empty': [2, 'never'],    // Scope must be in lowercase    'scope-case': [2, 'always', 'lower-case']
  }
};
```

**Notes:**
- Enforces Conventional Commits format
- Runs on every PR
- Fails if any commit doesn’t match the format
- Works in tandem with `claude-code.yml` (issue references)

---

## Branch Strategy & Protection

### Branch Model

```
main (production)
  ↑
  merge via release-please PR
  ↑
dev (staging)
  ↑
  feature branches
```

### Branch Descriptions

- **`main`**: Production-ready code. Protected. Only release-please PRs allowed.
- **`dev`**: Integration branch. All feature PRs target this. Auto-deploys to staging.
- **`feature/<issue-id>-description`**: Individual feature branches. Merged to `dev` via PR.

### Branch Protection Rules

### Protection for `main`

**Settings** (GitHub repo → Settings → Branches → Add rule):

```
Branch name pattern: main

☑ Require a pull request before merging
  ☑ Require approvals: 1
  ☑ Dismiss stale pull request approvals when new commits are pushed
  ☑ Require review from Code Owners: No (optional, if CODEOWNERS file exists)

☑ Require status checks to pass before merging
  ☑ Require branches to be up to date before merging
  Required status checks:
    - Lint, Test, and Build (pr-checks.yml)
    - Deploy to Cloudflare Pages Preview (deploy-preview.yml)
    - Verify Issue References in Commits (claude-code.yml)
    - Lint Commit Messages (commitlint.yml)

☑ Require conversation resolution before merging

☑ Require signed commits: No (optional, adds complexity)

☑ Require linear history: Yes (enforce squash or rebase merges)

☑ Require deployments to succeed before merging: Yes
  Required deployment environments:
    - staging

☐ Lock branch: No

☑ Do not allow bypassing the above settings
  Exceptions: None (not even admins)
```

**Who Can Merge**:
- Only via release-please PRs
- CTO must approve release-please PRs
- No direct pushes allowed (not even CTO)

### Protection for `dev`

**Settings**:

```
Branch name pattern: dev

☑ Require a pull request before merging
  ☑ Require approvals: 1
  ☐ Dismiss stale pull request approvals (more lenient than main)
  ☐ Require review from Code Owners

☑ Require status checks to pass before merging
  ☑ Require branches to be up to date before merging
  Required status checks:
    - Lint, Test, and Build (pr-checks.yml)
    - Verify Issue References in Commits (claude-code.yml)
    - Lint Commit Messages (commitlint.yml)

☑ Require conversation resolution before merging

☐ Require signed commits

☑ Require linear history: Yes

☐ Require deployments to succeed before merging

☐ Lock branch

☑ Do not allow bypassing the above settings
  Exceptions: CTO (for hotfixes)
```

**Who Can Approve PRs**:
- **Dev A ↔︎ Dev B**: Peer review each other
- **Dev C**: CTO or Dev B
- Self-approval not allowed

### Merge Strategies

**For PRs to `dev`**:
- **Squash and merge** (default)
- Combines all commits into one
- Uses PR title as commit message
- Keeps `dev` history clean

**For release-please PRs to `main`**:
- **Merge commit** (not squash)
- Preserves release-please commit structure
- Maintains changelog integrity

### Hotfix Process

**When to Use**:
- Critical production bug that can’t wait for next release
- Security vulnerability
- Data loss prevention

**Steps**:
1. Create hotfix branch from `main`:
`bash    git checkout main    git pull origin main    git checkout -b hotfix/<issue-id>-description`

1. Make fix and commit:
    
    ```bash
    git commit -m "fix(critical): resolve data loss bug (#999)"
    ```
    
2. Create PR to `main` (not `dev`):
    - Tag PR with `hotfix` label
    - Request CTO review immediately
    - Bypass normal release-please process
3. After merge to `main`:
    - Cherry-pick hotfix to `dev`:
        
        ```bash
        git checkout dev
        git cherry-pick <hotfix-commit-sha>git push origin dev
        ```
        
4. Create release-please PR manually (if needed):
    
    ```bash
    # release-please will auto-detect the fix on next main push
    ```
    

---

## Secrets Management

### GitHub Organization Secrets

**Location**: GitHub Organization → Settings → Secrets and variables → Actions

**Required Secrets**:

| Secret Name | Description | Where to Find |
| --- | --- | --- |
| `CLOUDFLARE_API_TOKEN` | API token for Cloudflare deployments | Cloudflare Dashboard → My Profile → API Tokens → Create Token (Edit Cloudflare Workers) |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account identifier | Cloudflare Dashboard → Workers & Pages → Overview → Account ID |
| `WRANGLER_API_TOKEN` | Same as CLOUDFLARE_API_TOKEN (legacy) | Same as above |
| `TWILIO_ACCOUNT_SID` | Twilio account identifier | Twilio Console → Account Info → Account SID |
| `TWILIO_AUTH_TOKEN` | Twilio authentication token | Twilio Console → Account Info → Auth Token |
| `RESEND_API_KEY` | Resend email API key | Resend Dashboard → API Keys → Create API Key |
| `CLAUDE_API_KEY` | Anthropic Claude API key | Anthropic Console → API Keys → Create Key |

**Environment-Specific Secrets**:

| Secret Name | Description | Environment |
| --- | --- | --- |
| `CF_ACCESS_AUD_DEV` | Cloudflare Access audience token | Development |
| `CF_ACCESS_AUD_STAGING` | Cloudflare Access audience token | Staging |
| `CF_ACCESS_AUD_PRODUCTION` | Cloudflare Access audience token | Production |
| `CF_ACCESS_TEAM_DEV` | Cloudflare Access team identifier | Development |
| `CF_ACCESS_TEAM_STAGING` | Cloudflare Access team identifier | Staging |
| `CF_ACCESS_TEAM_PRODUCTION` | Cloudflare Access team identifier | Production |

**How to Add Secrets**:

1. Navigate to: `https://github.com/organizations/umbrella-live/settings/secrets/actions`
2. Click “New organization secret”
3. Enter name and value
4. Select repository access:
    - “All repositories” for shared secrets (CLOUDFLARE_API_TOKEN, etc.)
    - “Selected repositories” for repo-specific secrets
5. Click “Add secret”

### Wrangler Secrets (Per Environment)

**What are Wrangler Secrets?**
- Runtime secrets for Cloudflare Workers
- Not exposed in `wrangler.toml` (security)
- Set via Wrangler CLI
- Different values per environment (dev/staging/production)

**Required Wrangler Secrets**:

```bash
# Developmentwrangler secret put CF_ACCESS_AUD --env dev
# Paste value when prompted, then press Enterwrangler secret put CF_ACCESS_TEAM --env dev
# Paste value, Enterwrangler secret put TWILIO_AUTH_TOKEN --env dev
wrangler secret put RESEND_API_KEY --env dev
wrangler secret put CLAUDE_API_KEY --env dev
# Stagingwrangler secret put CF_ACCESS_AUD --env staging
wrangler secret put CF_ACCESS_TEAM --env staging
wrangler secret put TWILIO_AUTH_TOKEN --env staging
wrangler secret put RESEND_API_KEY --env staging
wrangler secret put CLAUDE_API_KEY --env staging
# Productionwrangler secret put CF_ACCESS_AUD --env production
wrangler secret put CF_ACCESS_TEAM --env production
wrangler secret put TWILIO_AUTH_TOKEN --env production
wrangler secret put RESEND_API_KEY --env production
wrangler secret put CLAUDE_API_KEY --env production
```

**Listing Secrets** (to verify):

```bash
wrangler secret list --env dev
wrangler secret list --env staging
wrangler secret list --env production
```

**Deleting a Secret** (if needed):

```bash
wrangler secret delete <SECRET_NAME> --env <environment>
```

### Local Development Secrets

**`.env.example`** (committed to repo):

```bash
# CloudflareVITE_CLOUDFLARE_ACCOUNT_ID=your_account_id_here
VITE_CF_ACCESS_AUD=your_access_aud_token_here
# External Services (for local testing)VITE_TWILIO_ACCOUNT_SID=your_twilio_sid_here
VITE_TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
VITE_RESEND_API_KEY=your_resend_api_key_here
VITE_CLAUDE_API_KEY=your_claude_api_key_here
# EnvironmentVITE_ENV=development
```

**`.env.local`** (NOT committed, gitignored):

```bash
# Copy from .env.example and fill in real values# This file is used for local development only
```

**Developer Setup**:

```bash
# Copy templatecp .env.example .env.local
# Fill in values (ask CTO for credentials)nano .env.local
```

### Security Best Practices

1. **Never commit secrets** to version control
    - Use `.gitignore` to exclude `.env`, `.env.local`, `.dev.vars`
    - Use GitHub Secrets for CI/CD
    - Use Wrangler Secrets for runtime
2. **Rotate secrets regularly**
    - Quarterly rotation recommended
    - Immediate rotation if compromised
    - Update in all environments (dev, staging, production)
3. **Principle of least privilege**
    - API tokens should have minimum required permissions
    - Use separate tokens for staging vs. production
    - Revoke tokens for departing team members
4. **Audit secret access**
    - GitHub audit log tracks secret access
    - Wrangler secrets are encrypted at rest
    - Monitor Cloudflare audit logs for suspicious activity

---

## Service Configuration

### Cloudflare Setup

**Prerequisites**:
- Cloudflare account (free tier sufficient for dev/staging)
- Credit card on file (required for Workers, D1, R2)
- Domain registered and pointed to Cloudflare (umbrellalive.com)

### Step 1: Create Cloudflare Account

1. Go to [https://dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up)
2. Sign up with email
3. Verify email
4. Add payment method: Dashboard → Billing → Payment Info

### Step 2: Create Workers Project

1. Dashboard → Workers & Pages → Create application → Create Worker
2. Name: `umbrella-prod`
3. Click “Deploy” (creates starter worker)
4. Note the **Account ID** (visible in URL or Overview tab)

### Step 3: Create D1 Database

1. Dashboard → Workers & Pages → D1
2. Click “Create database”
3. Database name: `umbrella-db`
4. Click “Create”
5. Note the **Database ID**

**Bind to Worker**:

Edit `wrangler.toml`:

```toml
[[d1_databases]]binding = "DB"database_name = "umbrella-db"database_id = "your-database-id-here"
```

**Create Migrations**:

```bash
cd umbrella/
pnpm wrangler d1 migrations create umbrella-db "initial_schema"
```

Edit the generated migration file in `migrations/`:

```sql
-- Migration: initial_schemaCREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  oauth_provider TEXT NOT NULL,
  oauth_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE artists (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  bio TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
-- Add more tables as needed (see PRD data model)
```

**Apply Migrations**:

```bash
# Localpnpm wrangler d1 migrations apply umbrella-db --local# Stagingpnpm wrangler d1 migrations apply umbrella-db --env staging
# Productionpnpm wrangler d1 migrations apply umbrella-db --env production
```

### Step 4: Create KV Namespace

1. Dashboard → Workers & Pages → KV
2. Click “Create namespace”
3. Namespace name: `umbrella-cache`
4. Click “Add”
5. Note the **Namespace ID**

**Bind to Worker**:

Edit `wrangler.toml`:

```toml
[[kv_namespaces]]binding = "CACHE"id = "your-kv-namespace-id-here"
```

### Step 5: Create R2 Bucket

1. Dashboard → R2
2. Click “Create bucket”
3. Bucket name: `umbrella-media`
4. Location: Automatic (or choose region close to users)
5. Click “Create bucket”

**Bind to Worker**:

Edit `wrangler.toml`:

```toml
[[r2_buckets]]binding = "MEDIA"bucket_name = "umbrella-media"
```

### Step 6: Configure Cloudflare Access (OAuth)

**Enable Access**:
1. Dashboard → Zero Trust → Settings → Authentication
2. Click “Add new” under Login methods

**Add Apple OAuth**:
1. Select “Apple”
2. Follow Apple’s developer guide to create OAuth app:
- Go to [https://developer.apple.com/account](https://developer.apple.com/account)
- Certificates, Identifiers & Profiles → Identifiers → Add new
- Select “Services IDs”
- Register “Umbrella” with domain `umbrellalive.com`
- Configure “Sign in with Apple”
- Note **Client ID** and generate **Client Secret**
3. In Cloudflare, enter:
- App ID: (your Apple Client ID)
- Secret: (your Apple Client Secret)
- Redirect URL: `https://umbrellalive.com/auth/callback`
4. Click “Save”

**Add Google OAuth**:
1. Select “Google”
2. Go to [https://console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)
3. Create OAuth 2.0 Client ID:
- Application type: Web application
- Name: Umbrella
- Authorized redirect URIs: `https://umbrellalive.com/auth/callback`
- Note **Client ID** and **Client Secret**
4. In Cloudflare, enter:
- App ID: (your Google Client ID)
- Secret: (your Google Client Secret)
5. Click “Save”

**Create Access Application**:
1. Zero Trust → Access → Applications → Add an application
2. Select “Self-hosted”
3. Application name: `Umbrella Production`
4. Subdomain: `app` (results in `app.umbrellalive.com`)
5. Session duration: 24 hours
6. Add policies:
- Policy name: “Allow authenticated users”
- Action: Allow
- Selector: “Login methods” - Include “Apple” and “Google”
7. Click “Save”
8. Note the **Audience (AUD) Tag** (needed for JWT validation)

**Generate Access Tokens**:

After creating the Access application:
1. Copy the **Application Audience (AUD) Tag**
- This is your `CF_ACCESS_AUD` secret
2. Copy the **Team Domain**
- Format: `<your-team>.cloudflareaccess.com`
- This is your `CF_ACCESS_TEAM` identifier

**Set as Wrangler Secrets**:

```bash
# Developmentecho "<your-aud-tag>" | wrangler secret put CF_ACCESS_AUD --env dev
echo "<your-team-domain>" | wrangler secret put CF_ACCESS_TEAM --env dev
# Stagingecho "<your-aud-tag>" | wrangler secret put CF_ACCESS_AUD --env staging
echo "<your-team-domain>" | wrangler secret put CF_ACCESS_TEAM --env staging
# Productionecho "<your-aud-tag>" | wrangler secret put CF_ACCESS_AUD --env production
echo "<your-team-domain>" | wrangler secret put CF_ACCESS_TEAM --env production
```

### Step 7: Generate API Tokens

1. Dashboard → My Profile → API Tokens → Create Token
2. Use template: “Edit Cloudflare Workers”
3. Permissions:
    - Account - Cloudflare Pages - Edit
    - Account - Cloudflare Workers Scripts - Edit
    - Account - D1 - Edit
    - Zone - Workers Routes - Edit
4. Account Resources: Include - Your Account
5. Zone Resources: Include - umbrellalive.com
6. TTL: No expiration (or set expiration if preferred)
7. Click “Continue to summary” → “Create Token”
8. **Copy token immediately** (shown only once)

**Add to GitHub Secrets**:
- Name: `CLOUDFLARE_API_TOKEN`
- Value: (paste token)

### Step 8: Configure wrangler.toml

**File**: `umbrella/wrangler.toml`

```toml
name = "umbrella"main = "workers/api/index.ts"compatibility_date = "2024-01-01"# Development environment[env.dev]name = "umbrella-dev"vars = { ENVIRONMENT = "development" }[[env.dev.d1_databases]]binding = "DB"database_name = "umbrella-db-dev"database_id = "your-dev-db-id"[[env.dev.kv_namespaces]]binding = "CACHE"id = "your-dev-kv-id"[[env.dev.r2_buckets]]binding = "MEDIA"bucket_name = "umbrella-media-dev"# Staging environment[env.staging]name = "umbrella-staging"vars = { ENVIRONMENT = "staging" }[[env.staging.d1_databases]]binding = "DB"database_name = "umbrella-db-staging"database_id = "your-staging-db-id"[[env.staging.kv_namespaces]]binding = "CACHE"id = "your-staging-kv-id"[[env.staging.r2_buckets]]binding = "MEDIA"bucket_name = "umbrella-media-staging"# Production environment[env.production]name = "umbrella-production"vars = { ENVIRONMENT = "production" }[[env.production.d1_databases]]binding = "DB"database_name = "umbrella-db"database_id = "your-prod-db-id"[[env.production.kv_namespaces]]binding = "CACHE"id = "your-prod-kv-id"[[env.production.r2_buckets]]binding = "MEDIA"bucket_name = "umbrella-media"
```

**Notes**:
- **NEVER commit secrets** to `wrangler.toml`
- Only commit binding names and structure
- Actual secrets set via `wrangler secret put`

---

### Resend Setup (Email Delivery)

**Purpose**: Transactional emails (booking confirmations, notifications, broadcasts)

### Step 1: Create Resend Account

1. Go to [https://resend.com/signup](https://resend.com/signup)
2. Sign up with email
3. Verify email
4. Add payment method: Dashboard → Billing (free tier: 100 emails/day, 3,000/month)

### Step 2: Add Domain

1. Dashboard → Domains → Add Domain
2. Enter: `umbrellalive.com`
3. Click “Add Domain”

### Step 3: Verify Domain

**DNS Records to Add** (in Cloudflare DNS):

1. Cloudflare Dashboard → umbrellalive.com → DNS → Records
2. Add **DKIM Record**:
    
    ```
    Type: TXT
    Name: resend._domainkey.umbrellalive.com
    Content: (provided by Resend, looks like "v=DKIM1; k=rsa; p=...")
    TTL: Auto
    Proxy status: DNS only
    ```
    
3. Add **SPF Record**:
    
    ```
    Type: TXT
    Name: umbrellalive.com
    Content: v=spf1 include:resend.com ~all
    TTL: Auto
    Proxy status: DNS only
    ```
    
4. Wait 5-10 minutes for DNS propagation
5. Back in Resend Dashboard → Domains → Click “Verify”
6. Status should change to “Verified” (green checkmark)

### Step 4: Generate API Key

1. Dashboard → API Keys → Create API Key
2. Name: `umbrella-production`
3. Permission: Full Access (or “Sending access” if you want to restrict)
4. Click “Create”
5. **Copy key immediately** (shown only once, starts with `re_`)

**Add to GitHub Secrets**:
- Name: `RESEND_API_KEY`
- Value: (paste key)

**Add to Wrangler Secrets**:

```bash
# Developmentecho "re_your_dev_key" | wrangler secret put RESEND_API_KEY --env dev
# Stagingecho "re_your_staging_key" | wrangler secret put RESEND_API_KEY --env staging
# Productionecho "re_your_production_key" | wrangler secret put RESEND_API_KEY --env production
```

### Step 5: Test Email Sending

**Test with Wrangler CLI**:

```bash
# Send test emailwrangler dev --env dev
# In your Worker code:const response = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${env.RESEND_API_KEY}`,
    'Content-Type': 'application/json',
  },  body: JSON.stringify({    from: 'Umbrella <noreply@umbrellalive.com>',
    to: 'your-email@example.com',
    subject: 'Test Email from Umbrella',
    html: '<h1>Hello from Umbrella!</h1><p>This is a test email.</p>',
  }),});const data = await response.json();console.log(data);
```

**Expected Response**:

```json
{  "id": "email-id-here",  "from": "noreply@umbrellalive.com",  "to": "your-email@example.com",  "created_at": "2025-01-15T12:00:00.000Z"}
```

### Step 6: Email Templates

**Create Email Templates** (in codebase):

**File**: `umbrella/workers/emails/templates/booking-confirmation.ts`

```tsx
export const bookingConfirmation = (data: {
  artistName: string;  venueName: string;  gigDate: string;  gigTime: string;  payment: string;}) => `<!DOCTYPE html><html><head>  <style>    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }    .container { max-width: 600px; margin: 0 auto; padding: 20px; }    .header { background: #9333EA; color: white; padding: 20px; text-align: center; }    .content { padding: 20px; background: #f9f9f9; }    .button { display: inline-block; padding: 12px 24px; background: #9333EA; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }  </style></head><body>  <div class="container">    <div class="header">      <h1>🎉 Booking Confirmed!</h1>    </div>    <div class="content">      <p>Hi ${data.artistName},</p>      <p>Great news! Your booking has been confirmed.</p>      <p><strong>Venue:</strong> ${data.venueName}</p>      <p><strong>Date:</strong> ${data.gigDate}</p>      <p><strong>Time:</strong> ${data.gigTime}</p>      <p><strong>Payment:</strong> ${data.payment}</p>      <p>We'll send you a reminder 24 hours before the gig.</p>      <a href="https://umbrellalive.com/dashboard" class="button">View Dashboard</a>    </div>    <div class="footer">      <p>Umbrella | umbrellalive.com | help@umbrellalive.com</p>      <p><a href="https://umbrellalive.com/unsubscribe">Unsubscribe</a></p>    </div>  </div></body></html>`;
```

---

### Twilio Setup (SMS Delivery)

**Purpose**: SMS broadcasts to fans, booking confirmations

### Step 1: Create Twilio Account

1. Go to [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Sign up with email and phone number
3. Verify phone number
4. Upgrade to paid account: Console → Billing → Add payment method

### Step 2: Purchase Phone Number

1. Console → Phone Numbers → Buy a Number
2. Filter:
    - Country: United States (or your target market)
    - Capabilities: SMS, MMS
3. Select a number (recommended: US toll-free number for broadcasts)
4. Click “Buy”
5. Note the **Phone Number** (format: +1XXXXXXXXXX)

### Step 3: Get API Credentials

1. Console → Account → API Keys & Tokens
2. Note your **Account SID** (starts with `AC...`)
3. Note your **Auth Token** (click “Show” to reveal)

**Add to GitHub Secrets**:
- Name: `TWILIO_ACCOUNT_SID`
- Value: (your Account SID)
- Name: `TWILIO_AUTH_TOKEN`
- Value: (your Auth Token)

**Add to Wrangler Secrets**:

```bash
# Developmentecho "AC..." | wrangler secret put TWILIO_ACCOUNT_SID --env dev
echo "your-auth-token" | wrangler secret put TWILIO_AUTH_TOKEN --env dev
# Stagingecho "AC..." | wrangler secret put TWILIO_ACCOUNT_SID --env staging
echo "your-auth-token" | wrangler secret put TWILIO_AUTH_TOKEN --env staging
# Productionecho "AC..." | wrangler secret put TWILIO_ACCOUNT_SID --env production
echo "your-auth-token" | wrangler secret put TWILIO_AUTH_TOKEN --env production
```

### Step 4: Configure Messaging Service (Optional)

**For high-volume SMS**:
1. Console → Messaging → Services → Create new Messaging Service
2. Service name: `Umbrella Broadcasts`
3. Use case: Marketing
4. Add your purchased phone number to the pool
5. Note the **Messaging Service SID** (starts with `MG...`)

### Step 5: Test SMS Sending

**Test with Wrangler CLI**:

```bash
wrangler dev --env dev
# In your Worker code:const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`, {
  method: 'POST',
  headers: {
    'Authorization': 'Basic ' + btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`),    'Content-Type': 'application/x-www-form-urlencoded',
  },  body: new URLSearchParams({    From: '+1XXXXXXXXXX',  // Your Twilio number
    To: '+1YYYYYYYYYY',    // Test recipient
    Body: 'Test SMS from Umbrella!',
  }),});const data = await response.json();console.log(data);
```

**Expected Response**:

```json
{  "sid": "SM...",  "status": "queued",  "to": "+1YYYYYYYYYY",  "from": "+1XXXXXXXXXX",  "body": "Test SMS from Umbrella!"}
```

### Step 6: Compliance & Best Practices

**TCPA Compliance**:
- Only send SMS to users who explicitly opted in
- Include opt-out mechanism: “Reply STOP to unsubscribe”
- Handle STOP/HELP keywords automatically
- Keep records of consent

**Implement Opt-Out Handling**:

**File**: `umbrella/workers/sms/handle-incoming.ts`

```tsx
// Webhook handler for incoming SMSexport async function handleIncomingSMS(request: Request, env: Env) {
  const formData = await request.formData();  const from = formData.get('From') as string;  const body = formData.get('Body')?.toString().toUpperCase();  if (body === 'STOP' || body === 'UNSUBSCRIBE') {
    // Mark user as opted out in DB    await env.DB.prepare(
      'UPDATE contacts SET sms_opted_in = 0 WHERE phone_number = ?'    ).bind(from).run();    // Send confirmation    return sendSMS({
      to: from,      body: 'You have been unsubscribed from Umbrella SMS. Reply START to re-subscribe.',    });  }
  if (body === 'START' || body === 'SUBSCRIBE') {
    // Re-opt in    await env.DB.prepare(
      'UPDATE contacts SET sms_opted_in = 1 WHERE phone_number = ?'    ).bind(from).run();    return sendSMS({
      to: from,      body: 'You are now subscribed to Umbrella SMS updates. Reply STOP to unsubscribe.',    });  }
  // Handle other keywords (HELP, etc.)  // ...}
```

**Configure Webhook**:
1. Twilio Console → Phone Numbers → Active Numbers → (your number)
2. Messaging Configuration → A message comes in:
- Webhook: `https://umbrellalive.com/api/sms/incoming`
- HTTP POST
3. Save

---

### Claude API Setup (AI)

**Purpose**: Violet AI toolkit (prompt-based assistance)

### Step 1: Create Anthropic Account

1. Go to [https://console.anthropic.com/](https://console.anthropic.com/)
2. Sign up with email
3. Verify email

### Step 2: Add Payment Method

1. Console → Billing → Add payment method
2. Add credit card
3. Set billing limit (recommended: $100/month for MVP)

### Step 3: Purchase Credits

1. Console → Billing → Add credits
2. Purchase credits (recommended: $50 to start)
3. Monitor usage daily

### Step 4: Generate API Key

1. Console → API Keys → Create Key
2. Name: `umbrella-production`
3. Click “Create”
4. **Copy key immediately** (shown only once, starts with `sk-ant-`)

**Add to GitHub Secrets**:
- Name: `CLAUDE_API_KEY`
- Value: (paste key)

**Add to Wrangler Secrets**:

```bash
# Developmentecho "sk-ant-..." | wrangler secret put CLAUDE_API_KEY --env dev
# Stagingecho "sk-ant-..." | wrangler secret put CLAUDE_API_KEY --env staging
# Productionecho "sk-ant-..." | wrangler secret put CLAUDE_API_KEY --env production
```

### Step 5: Test API Integration

**Test with Wrangler CLI**:

```bash
wrangler dev --env dev
# In your Worker code:const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'x-api-key': env.CLAUDE_API_KEY,
    'anthropic-version': '2023-06-01',
    'content-type': 'application/json',
  },  body: JSON.stringify({    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: 'Hello, Claude! This is a test from Umbrella.',
    }],  }),});const data = await response.json();console.log(data);
```

**Expected Response**:

```json
{  "id": "msg_...",  "type": "message",  "role": "assistant",  "content": [{    "type": "text",    "text": "Hello! I'm happy to help you with Umbrella..."  }],  "model": "claude-sonnet-4-20250514",  "usage": {    "input_tokens": 15,    "output_tokens": 25  }}
```

### Step 6: Implement Rate Limiting (50 prompts/day)

**Per PRD Decision D-062**: Each artist limited to 50 prompts per day.

**File**: `umbrella/workers/api/violet/rate-limit.ts`

```tsx
export async function checkVioletRateLimit(
  artistId: string,  env: Env
): Promise<{ allowed: boolean; remaining: number }> {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD  const key = `violet:${artistId}:${today}`;  // Get current count from KV  const countStr = await env.CACHE.get(key);  const count = countStr ? parseInt(countStr) : 0;  if (count >= 50) {
    return { allowed: false, remaining: 0 };  }
  // Increment count  await env.CACHE.put(key, (count + 1).toString(), {
    expirationTtl: 86400, // 24 hours  });  return { allowed: true, remaining: 49 - count };}
```

**Usage in API Endpoint**:

```tsx
export async function handleVioletPrompt(request: Request, env: Env) {
  const artistId = getAuthenticatedArtistId(request);  // Check rate limit  const rateLimit = await checkVioletRateLimit(artistId, env);  if (!rateLimit.allowed) {
    return new Response(JSON.stringify({
      error: 'Rate limit exceeded',      message: 'You have reached your daily limit of 50 prompts. Try again tomorrow.',    }), {
      status: 429,      headers: { 'Content-Type': 'application/json' },    });  }
  // Process prompt with Claude API  // ...}
```

---

## Developer Onboarding

### New Developer Checklist

**Before First Day**:
- [ ] GitHub account created
- [ ] Added to `umbrella-live` GitHub organization
- [ ] 2FA enabled on GitHub account
- [ ] Slack/Discord invited (if using team chat)
- [ ] Email account provisioned (e.g., `dev-a@umbrellalive.com`)

**Day 1**:
- [ ] Clone all 5 repositories
- [ ] Install development tools (Node.js, pnpm, Wrangler)
- [ ] Set up local environment variables
- [ ] Run `pnpm install` in each repo
- [ ] Run `pnpm dev` to verify setup
- [ ] Join first standup (async in Notion)

**Week 1**:
- [ ] Read PRD v2.0 (docs/spec/umbrella-prd-v2.md)
- [ ] Read DevOps guide (this document)
- [ ] Read CONTRIBUTING.md
- [ ] Pick first issue from “Good First Issue” label
- [ ] Create first PR (with demo if DemoRequired=Yes)
- [ ] Complete first code review

### Installation Steps

### 1. Install Node.js

**macOS** (via Homebrew):

```bash
brew install node@18
```

**Linux**:

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -sudo apt-get install -y nodejs
```

**Windows**:
- Download installer from [https://nodejs.org/en/download/](https://nodejs.org/en/download/)
- Run installer
- Verify: `node --version` (should show v18.x.x)

### 2. Install pnpm

```bash
npm install -g pnpm
```

Verify:

```bash
pnpm --version
```

### 3. Install Wrangler CLI

```bash
npm install -g wrangler
```

Verify:

```bash
wrangler --version
```

Login to Cloudflare:

```bash
wrangler login
```

(Opens browser for OAuth authentication)

### 4. Clone Repositories

```bash
# Create umbrella directorymkdir ~/umbrella
cd ~/umbrella
# Clone all reposgit clone git@github.com:umbrella-live/umbrella.git
git clone git@github.com:umbrella-live/components.git
git clone git@github.com:umbrella-live/marketplace.git
git clone git@github.com:umbrella-live/violet-ai.git
git clone git@github.com:umbrella-live/docs.git
```

### 5. Install Dependencies

```bash
# Main appcd ~/umbrella/umbrella
pnpm install
# Componentscd ~/umbrella/components
pnpm install
# Marketplacecd ~/umbrella/marketplace
pnpm install
# Violet AIcd ~/umbrella/violet-ai
pnpm install
# Docscd ~/umbrella/docs
pnpm install
```

### 6. Set Up Environment Variables

```bash
cd ~/umbrella/umbrella
# Copy templatecp .env.example .env.local
# Edit with your credentials (ask CTO)nano .env.local
```

Fill in:

```bash
VITE_CLOUDFLARE_ACCOUNT_ID=<your-account-id>VITE_CF_ACCESS_AUD=<dev-access-aud>VITE_TWILIO_ACCOUNT_SID=<test-twilio-sid>VITE_TWILIO_AUTH_TOKEN=<test-twilio-token>VITE_RESEND_API_KEY=<test-resend-key>VITE_CLAUDE_API_KEY=<test-claude-key>VITE_ENV=development
```

### 7. Run Development Server

```bash
cd ~/umbrella/umbrella
pnpm dev
```

**Expected output**:

```
VITE v5.x.x  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose

[wrangler:inf] Ready on http://localhost:8787
```

Open browser to `http://localhost:5173`

### 8. Verify Setup

Run through checklist:
- [ ] Vite dev server running on port 5173
- [ ] Wrangler proxy running on port 8787
- [ ] Landing page loads without errors
- [ ] Console shows no errors
- [ ] Can navigate to /auth (shows Apple/Google OAuth buttons)

---

### First PR Workflow

**Step 1**: Pick an issue

```bash
# Go to GitHub Project Board# Pick issue from "Backlog" column with "Good First Issue" label# Assign yourself to the issue
```

**Step 2**: Create feature branch

```bash
cd ~/umbrella/umbrella
git checkout dev
git pull origin dev
git checkout -b feature/42-your-feature-name
```

**Step 3**: Make changes

```bash
# Edit files# Test locally with `pnpm dev`# Write unit tests with `pnpm test`
```

**Step 4**: Commit with Conventional Commits

```bash
git add .
git commit -m "feat(auth): implement Apple OAuth (#42)"
```

**CRITICAL**: Every commit MUST include issue reference `(#42)`

**Step 5**: Push and create PR

```bash
git push origin feature/42-your-feature-name
# Go to GitHub# Create PR against `dev` branch# Fill in PR template# Request review from peer
```

**Step 6**: Address review comments

```bash
# Make requested changesgit add .
git commit -m "fix(auth): address review comments (#42)"git push origin feature/42-your-feature-name
# Re-request review
```

**Step 7**: Merge

```bash
# After approval, click "Squash and merge" on GitHub# Delete feature branch
```

---

### Common Development Tasks

### Running Tests

```bash
# Unit testspnpm test
# Watch modepnpm test:watch
# Coveragepnpm test:coverage
```

### Linting & Formatting

```bash
# Lintpnpm lint
# Fix lint errorspnpm lint:fix
# Check formattingpnpm format:check
# Auto-formatpnpm format
```

### Type Checking

```bash
pnpm type-check
```

### Building for Production

```bash
pnpm build
# Preview buildpnpm preview
```

### Database Migrations

```bash
# Create new migrationpnpm wrangler d1 migrations create umbrella-db "description"# Apply migrations locallypnpm wrangler d1 migrations apply umbrella-db --local# Query local DBpnpm wrangler d1 execute umbrella-db --local --command "SELECT * FROM users"
```

### Deploying to Staging (Manual)

```bash
# Push to dev branch (auto-deploys to staging)git checkout dev
git merge feature/42-your-feature-name
git push origin dev
# OR manually deploy:pnpm wrangler deploy --env staging
```

---

## Deployment Process

### Deployment Environments

| Environment | Branch | URL | Auto-Deploy | Purpose |
| --- | --- | --- | --- | --- |
| **Development** | N/A | `localhost:5173` | No | Local testing |
| **Preview** | PR branch | `*.pages.dev` | Yes (on PR) | PR reviews |
| **Staging** | `dev` | `staging.umbrellalive.com` | Yes | Integration testing |
| **Production** | `main` | `umbrellalive.com` | Yes (after release-please) | Live users |

### Staging Deployment (Automatic)

**Trigger**: Push to `dev` branch

**Process**:
1. Developer merges PR to `dev`
2. GitHub Actions workflow `deploy-staging.yml` triggers
3. Builds application
4. Runs D1 migrations (staging)
5. Deploys Workers (API) to staging
6. Deploys Pages (frontend) to staging
7. Staging URL updated: `https://staging.umbrellalive.com`

**Verification**:

```bash
# Check deployment statusopen https://dash.cloudflare.com/
# Test staging siteopen https://staging.umbrellalive.com
# Check Wrangler logswrangler tail umbrella-staging
```

### Production Deployment (via release-please)

**Trigger**: Merge release-please PR to `main`

**Process**:

1. **Accumulate Changes on `dev`**:
    
    ```bash
    # Multiple PRs merged to dev over timefeat(marketplace): add infinite scroll (#87)fix(messaging): resolve char limit validation (#91)feat(profile): implement 6-tab system (#52)
    ```
    
2. **Verify on Staging**:
    - Test all features on `staging.umbrellalive.com`
    - Run E2E tests (if available)
    - Get stakeholder approval
3. **Trigger release-please**:
    
    ```bash
    # Merge dev into main (creates release-please PR)git checkout main
    git pull origin main
    git merge dev
    git push origin main
    ```
    
4. **release-please Creates PR**:
    - Title: `chore(main): release 0.3.0`
    - Updates `package.json` version
    - Generates `CHANGELOG.md`
    - Creates git tag `v0.3.0`
5. **Review Release PR**:
    - CTO reviews changelog
    - Confirms version bump is correct
    - Approves PR
6. **Merge Release PR**:
    - Click “Merge commit” (not squash)
    - Triggers production deployment workflow
    - Creates GitHub Release with tag
7. **Production Deploys Automatically**:
    - `deploy-production.yml` runs
    - Builds application
    - Runs D1 migrations (production)
    - Deploys Workers to production
    - Deploys Pages to production
    - Production URL updated: `https://umbrellalive.com`
8. **Post-Deployment**:
    - CTO copies release notes to Notion “Release Digest”
    - Team announces in Slack/Discord
    - Monitor error logs for 24 hours

**Verification**:

```bash
# Check GitHub Releaseopen https://github.com/umbrella-live/umbrella/releases
# Test production siteopen https://umbrellalive.com
# Check Wrangler logswrangler tail umbrella-production
```

---

### Rollback Strategy

**When to Rollback**:
- Critical bug affecting all users
- Data loss or corruption
- Security vulnerability
- Service unavailable (50x errors)

### Option 1: Revert Commit (Preferred)

```bash
# Find the bad commitgit log --oneline# Revert the commitgit revert <bad-commit-sha># Push to main (triggers redeploy)git push origin main
```

### Option 2: Rollback to Previous Release

```bash
# Find previous release taggit tag -l# Reset main to previous taggit checkout main
git reset --hard v0.2.0
# Force push (WARNING: Destructive)git push origin main --force-with-lease
```

### Option 3: Manual Wrangler Rollback

```bash
# List deploymentswrangler deployments list --env production
# Rollback to specific deploymentwrangler rollback <deployment-id> --env production
```

**After Rollback**:
1. Verify production is working
2. Identify root cause
3. Create hotfix PR
4. Test hotfix on staging
5. Merge hotfix to main
6. Monitor production

---

### Hotfix Process (Emergency)

**Use Case**: Critical production bug that can’t wait for normal release cycle

**Steps**:

1. **Create hotfix branch from main**:
    
    ```bash
    git checkout main
    git pull origin main
    git checkout -b hotfix/999-critical-bug
    ```
    
2. **Make fix**:
    
    ```bash
    # Edit filesgit add .
    git commit -m "fix(critical): resolve data loss bug (#999)"
    ```
    
3. **Test locally**:
    
    ```bash
    pnpm build
    pnpm preview
    # Verify fix works
    ```
    
4. **Create PR to main** (not dev):
    - Title: `[HOTFIX] fix(critical): resolve data loss bug (#999)`
    - Label: `hotfix`
    - Request CTO review immediately
5. **Merge to main**:
    - CTO approves
    - Merge (bypass branch protection if needed)
    - Triggers production deployment
6. **Cherry-pick to dev**:
    
    ```bash
    git checkout dev
    git cherry-pick <hotfix-commit-sha>git push origin dev
    ```
    
7. **Create post-mortem**:
    - Document root cause
    - Document fix
    - Document prevention measures
    - Share with team

---

## Demo Cadence Workflow

### Weekly Rhythm

**Monday**:
- Async standup in Notion “Stand-Up Logs”
- Each developer posts:
- **Doing**: Current work (issue numbers)
- **Done**: Completed since last week
- **Blocked**: Any blockers or questions
- CTO reviews and responds

**Tuesday-Wednesday**:
- Active development
- PRs created and reviewed
- Deploy to staging as PRs merge

**Thursday**:
- **Demo deadline**: Loom recordings due by EOD
- Developers upload demos to Notion “Demo Digest”

**Friday**:
- **CTO review**: Reviews all demos
- **Milestone check**: If ≥90% issues complete, trigger release
- **Release notes**: CTO pastes to Notion “Release Digest”
- **Planning**: Identify next week’s issues

### Demo Requirements

**When Required**:
- Issue labeled `DemoRequired=Yes`
- Typically: New features, UI changes, user-facing changes

**Format**:
- **Tool**: Loom (free screen recording)
- **Length**: 3-5 minutes
- **Content**:
1. Show feature working end-to-end (happy path)
2. Show one error state handled gracefully
3. Explain user value (“This lets artists…”)
4. Mention PR number and issue number

**Example Script**:

```
"Hi, I'm Dev A and I'm demoing the new artist profile tabs (issue #52, PR #128).

[Shows profile page loading]
Here's the 6-tab profile system. Users can navigate between Overview, Portfolio, Explore, Journey, Reviews, and Opportunities.

[Clicks through tabs]
Each tab has distinct content. The Portfolio tab shows all uploaded tracks with inline playback.

[Clicks play button]
Notice how the audio player appears inline without navigating away. This keeps the user in context.

[Shows empty state]
If an artist has no tracks, we show a helpful empty state with an 'Add Track' button.

This feature lets artists showcase their work more effectively and gives venues a complete view of an artist's profile in one place.

That's issue #52, PR #128. Thanks!"
```

**Upload Process**:
1. Record Loom video
2. Copy link from Loom
3. Open Notion “Demo Digest” page
4. Add new row:
- **Issue**: #52
- **PR**: #128
- **Developer**: Dev A
- **Date**: 2025-01-18
- **Loom Link**: (paste link)
5. Loom embeds automatically in Notion

### Notion Integration

**Notion Workspace Structure**:

```
Umbrella MVP
├── Engineering Roadmap (embed GitHub Project board)
├── Stand-Up Logs
│   ├── 2025-01-15 - Week 1
│   ├── 2025-01-22 - Week 2
│   └── ...
├── Demo Digest
│   ├── All Demos (table view)
│   └── By Week (gallery view)
└── Release Digest
    ├── v0.1.0 - 2025-01-08
    ├── v0.2.0 - 2025-01-15
    └── ...
```

**Demo Digest Table Columns**:
- **Issue**: Number (e.g., #52)
- **PR**: Number (e.g., #128)
- **Developer**: Select (Dev A, Dev B, Dev C)
- **Date**: Date picker
- **Loom Link**: URL
- **Status**: Select (Pending Review, Approved, Needs Changes)
- **CTO Notes**: Text

**Release Digest Template**:

```markdown
# Umbrella v0.3.0 — 2025-01-15### Added* 🎨 **Artist Profile (6-tab system)** — Public profile with portfolio, journey, reviews, and opportunities. (#45, #47, #52)
* 🧭 **Marketplace UI** — Discover Artists and Find Gigs tabs with infinite scroll. (#87, #89)
### Fixed* 🧯 **Routing edge cases** — Prevented full reloads on deep links. (#91)
### Changed* 🧱 **D1 schema v1** — Introduced base tables and migrations. (Docs:#DATA-MODEL) (#38)
> References: PRs #123, #128; Commits abc1234, def5678> Docs: /docs/architecture.md, /docs/data-model.md**Milestone Progress**: v0.3 ✅ Complete (12/12 issues done)
**Next Milestone**: v0.4 - Comms & Violet stubs (0/15 issues)
```

---

## Monitoring & Debugging

### Cloudflare Analytics

**Access**:
1. Cloudflare Dashboard → Workers & Pages → umbrella-production
2. Click “Metrics” tab

**Available Metrics**:
- **Requests**: Total requests over time
- **Errors**: 4xx and 5xx error rates
- **Duration**: P50, P75, P99 response times
- **CPU Time**: Worker execution time

**Alerts** (optional):
1. Dashboard → Notifications → Destinations → Add webhook
2. Add Slack webhook URL (if using Slack)
3. Create alert: “Notify if error rate > 5% for 5 minutes”

### Wrangler Logs

**Tail Logs (Real-Time)**:

```bash
# Productionwrangler tail umbrella-production
# Stagingwrangler tail umbrella-staging
# Filter by status codewrangler tail umbrella-production --status error
# Filter by methodwrangler tail umbrella-production --method POST
```

**Example Output**:

```
[2025-01-15 12:34:56] GET https://umbrellalive.com/api/artists/123
  Status: 200
  Duration: 45ms

[2025-01-15 12:35:12] POST https://umbrellalive.com/api/messages
  Status: 500
  Duration: 123ms
  Error: Database connection failed
```

### Error Tracking (Optional: Sentry)

**Setup Sentry**:

```bash
pnpm add @sentry/browser @sentry/tracing
```

**Initialize** (`src/main.tsx`):

```tsx
import * as Sentry from '@sentry/browser';Sentry.init({
  dsn: 'https://your-sentry-dsn@sentry.io/project-id',  environment: import.meta.env.VITE_ENV,  tracesSampleRate: 0.1, // 10% of transactions});
```

**Capture Errors**:

```tsx
try {
  // Code that might fail} catch (error) {
  Sentry.captureException(error);}
```

### D1 Database Debugging

**Query Database**:

```bash
# Localpnpm wrangler d1 execute umbrella-db --local --command "SELECT * FROM users LIMIT 10"# Stagingpnpm wrangler d1 execute umbrella-db --env staging --command "SELECT * FROM users LIMIT 10"# Production (use with caution)pnpm wrangler d1 execute umbrella-db --env production --command "SELECT * FROM users LIMIT 10"
```

**Check Migrations**:

```bash
# List applied migrationspnpm wrangler d1 migrations list umbrella-db --env production
```

**Backup Database** (manual):

```bash
# Export production data (use sparingly)pnpm wrangler d1 export umbrella-db --env production --output backup-2025-01-15.sql
```

---

## Troubleshooting Guide

### Common Issues & Solutions

### Issue: GitHub Actions Failing on “Lint” Step

**Error**:

```
ESLint found 5 errors
```

**Solution**:

```bash
# Run lint locallypnpm lint
# Auto-fix if possiblepnpm lint:fix
# Commit fixesgit add .
git commit -m "fix(ci): resolve linting errors (#123)"git push
```

---

### Issue: Wrangler Deployment Fails with “Unauthorized”

**Error**:

```
Error: Authentication error: Could not verify API token
```

**Solution**:
1. Verify `CLOUDFLARE_API_TOKEN` in GitHub Secrets
2. Check token permissions (should include Workers, D1, Pages)
3. Regenerate token if expired:
- Cloudflare Dashboard → API Tokens → Edit/Regenerate
4. Update GitHub Secret with new token

---

### Issue: D1 Migration Fails with “Syntax Error”

**Error**:

```
Error: SQLite error near line 5: syntax error
```

**Solution**:
1. Review migration file syntax
2. Test locally first:
`bash    pnpm wrangler d1 migrations apply umbrella-db --local`
3. Common issues:
- Missing semicolons
- Invalid SQL syntax
- Foreign key constraints not supported (use triggers instead)
4. Fix migration file
5. Re-run locally, then push to staging

---

### Issue: Preview Deployment Shows Blank Page

**Error**:
- Preview URL loads but shows white screen
- Console shows: `Failed to load resource: net::ERR_BLOCKED_BY_CLIENT`

**Solution**:
1. Check build logs in GitHub Actions
2. Verify environment variables:
`yaml    VITE_CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}    VITE_CF_ACCESS_AUD: ${{ secrets.CF_ACCESS_AUD_DEV }}`
3. Check browser console for errors
4. Common issues:
- Missing environment variables
- CORS issues with Cloudflare Access
- Ad blockers blocking Cloudflare domains

---

### Issue: claude-code Workflow Failing on Commit Messages

**Error**:

```
❌ Issue Reference Check Failed
The following commits are missing issue references:
- abc1234: feat(auth): add login button
```

**Solution**:
1. Rewrite commit messages to include issue reference:
`bash    git rebase -i HEAD~3  # Interactive rebase for last 3 commits`
2. Change commit messages to:
`feat(auth): add login button (#42)`
3. Force push:
`bash    git push --force-with-lease`

---

### Issue: release-please Not Creating PR

**Error**:
- Merged multiple commits to `main`
- No release-please PR appears

**Solution**:
1. Verify commits follow Conventional Commits format:
`bash    git log --oneline`
2. Check `.release-please-manifest.json` exists
3. Check `release-please-config.json` exists
4. Manually trigger workflow:
- GitHub → Actions → release-please → Run workflow
5. If still fails, check workflow logs for errors

---

### Issue: Wrangler Secret Not Found in Worker

**Error**:

```
TypeError: env.RESEND_API_KEY is undefined
```

**Solution**:
1. Verify secret was set:
`bash    wrangler secret list --env production`
2. If missing, set secret:
`bash    echo "re_your_key" | wrangler secret put RESEND_API_KEY --env production`
3. Wait 1-2 minutes for secret to propagate
4. Re-deploy:
`bash    pnpm wrangler deploy --env production`

---

### Issue: Staging Deployment Succeeds but Site Shows Old Version

**Error**:
- Deployment logs show success
- Staging site still shows old version
- No errors in console

**Solution**:
1. Clear Cloudflare cache:
- Cloudflare Dashboard → Caching → Purge Cache → Purge Everything
2. Hard refresh browser:
- Chrome/Firefox: `Cmd+Shift+R` (Mac) or `Ctrl+F5` (Windows)
3. Check deployment timestamp:
`bash    wrangler deployments list --env staging`
4. Verify correct environment in `wrangler.toml`:
`toml    [env.staging]    name = "umbrella-staging"`

---

### Issue: Local Dev Server Won’t Start

**Error**:

```
Error: listen EADDRINUSE: address already in use :::5173
```

**Solution**:
1. Kill process using port 5173:
```bash
# macOS/Linux
lsof -ti:5173 | xargs kill -9

# Windows
netstat -ano | findstr :5173
taskkill /PID  /F
`2. Restart dev server:`bash
pnpm dev
`3. If issue persists, change port in `vite.config.ts`:`typescript
export default defineConfig({
server: {
port: 5174, // Use different port
},
});
```

---

### Issue: Cannot Push to Protected Branch

**Error**:

```
remote: error: GH006: Protected branch update failed
```

**Solution**:
1. Never push directly to `main` or `dev`
2. Create PR instead:
`bash    git checkout -b feature/123-your-feature    git push origin feature/123-your-feature    # Create PR on GitHub`
3. If legitimate hotfix:
- Contact CTO to temporarily disable branch protection
- Push hotfix
- Re-enable branch protection

---

## Appendix: Complete Workflow Files

### A.1 - Full pr-checks.yml

*See [Workflow 1: PR Checks](about:blank#workflow-1-pr-checks) above for complete file*

### A.2 - Full deploy-preview.yml

*See [Workflow 2: Deploy Preview](about:blank#workflow-2-deploy-preview) above for complete file*

### A.3 - Full deploy-staging.yml

*See [Workflow 3: Deploy Staging](about:blank#workflow-3-deploy-staging) above for complete file*

### A.4 - Full deploy-production.yml

*See [Workflow 4: Deploy Production](about:blank#workflow-4-deploy-production) above for complete file*

### A.5 - Full release-please.yml

*See [Workflow 5: release-please](about:blank#workflow-5-release-please) above for complete file*

### A.6 - Full claude-code.yml

*See [Workflow 6: claude-code Issue Enforcement](about:blank#workflow-6-claude-code-issue-enforcement) above for complete file*

### A.7 - Full commitlint.yml

*See [Workflow 7: Commitlint](about:blank#workflow-7-commitlint) above for complete file*

---

## Quick Reference

### Key Commands

```bash
# Developmentpnpm dev                    # Start local dev serverpnpm build                  # Build for productionpnpm preview                # Preview production buildpnpm lint                   # Run ESLintpnpm format                 # Format with Prettierpnpm test                   # Run unit tests# Databasewrangler d1 migrations create umbrella-db "description"wrangler d1 migrations apply umbrella-db --localwrangler d1 execute umbrella-db --local --command "SELECT * FROM users"# Deploymentgit push origin dev         # Deploy to stagingwrangler deploy --env staging   # Manual staging deploywrangler deploy --env production  # Manual production deploy# Secretswrangler secret put SECRET_NAME --env dev
wrangler secret list --env production
wrangler secret delete SECRET_NAME --env production
# Debuggingwrangler tail umbrella-production
wrangler deployments list --env production
wrangler rollback <deployment-id> --env production
```

### Key URLs

- **Production**: https://umbrellalive.com
- **Staging**: https://staging.umbrellalive.com
- **Cloudflare Dashboard**: https://dash.cloudflare.com
- **GitHub Org**: https://github.com/umbrella-live
- **GitHub Project**: https://github.com/orgs/umbrella-live/projects/1
- **Notion Workspace**: [Insert Notion URL]

### Key Contacts

- **CTO**: [cto@umbrellalive.com]
- **Dev A (FE/UI)**: [dev-a@umbrellalive.com]
- **Dev B (FS/Marketplace)**: [dev-b@umbrellalive.com]
- **Dev C (Backend/API)**: [dev-c@umbrellalive.com]

---

**END OF DEVOPS GUIDE**

*For questions or updates, contact the CTO or submit a PR to update this document.*