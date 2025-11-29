# DevOps & Build Configuration

Complete infrastructure setup for Umbrella's development, CI/CD, and deployment workflows.

## Completed

- [x] 6 GitHub workflows (PR checks, deploy preview/staging/production, Claude Code, commitlint)
- [x] Build scripts (worker bundling, Cloudflare bootstrap)
- [x] Vite configuration with React and path aliases
- [x] TypeScript configuration (strict mode, path mapping)
- [x] Tailwind CSS + PostCSS configuration
- [x] ESLint + Prettier configuration
- [x] Package.json with all dependencies
- [x] Git configuration (.gitignore)
- [x] Comprehensive README documentation
- [x] Commitlint configuration

## GitHub Workflows

### PR Checks (`pr-checks.yml`)

Runs on all pull requests to `dev`, `staging`, and `main` branches.

**Steps:**
1. Checkout code
2. Install dependencies with npm ci
3. Run linter (`npm run lint`)
4. Type check TypeScript (`npm run type-check`)
5. Run tests (`npm run test`)

**Purpose:** Ensures code quality before merging. Blocks PRs with linting or type errors.

### Deploy Preview (`deploy-preview.yml`)

Triggers on PR open, synchronize, or reopen events.

**Steps:**
1. Checkout code
2. Install dependencies
3. Build frontend and worker
4. Deploy to Cloudflare preview environment
5. Comment preview URL on PR

**Purpose:** Provides a live preview environment for every PR, enabling stakeholders to test changes before merging.

### Deploy Staging (`deploy-staging.yml`)

Triggers on push to `staging` branch.

**Steps:**
1. Checkout code
2. Install dependencies
3. Build frontend and worker
4. Run database migrations on staging D1
5. Deploy to staging environment

**Purpose:** Deploys to staging environment (umbrella-staging.workers.dev) for pre-production testing.

**Environment:** `staging` (configured in GitHub repository settings)

### Deploy Production (`deploy-production.yml`)

Triggers on push to `main` branch.

**Steps:**
1. Checkout code
2. Install dependencies
3. Build frontend and worker
4. Run database migrations on production D1
5. Deploy to production environment

**Purpose:** Deploys to production environment (umbrella.app).

**Environment:** `production` (requires manual approval in GitHub)

**⚠️ Important:** Should have branch protection rules and require manual approval.

### Claude Code (`claude-code.yml`)

Triggers on issue comments containing `@claude` or issues assigned to Claude.

**Purpose:** Enables Claude Code AI assistant to help with development tasks via GitHub issues.

**Permissions:**
- contents: write
- issues: write
- pull-requests: write
- id-token: write

**Configuration:**
- Model: `claude-sonnet-4-5-20250929`
- Timeout: 60 minutes
- Allowed tools: File operations, Bash, Grep, Glob

### Commitlint (`commitlint.yml`)

Triggers on all pull requests.

**Purpose:** Enforces conventional commit message format. Blocks PRs with invalid commit messages.

**Convention:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Formatting
- `refactor:` - Code restructuring
- `test:` - Tests
- `chore:` - Maintenance

## Build Scripts

### `scripts/build-worker.js`

Generates `_worker.js` file for Cloudflare Workers deployment.

**Features:**
- Creates worker entry point with health check
- Routes API requests (placeholder for future implementation)
- Serves SPA for all other routes
- Must run after `vite build`

**Usage:**
```bash
npm run build:worker
```

**Output:** `dist/_worker.js`

### `scripts/setup-cloudflare.sh`

Bootstraps all required Cloudflare resources for development.

**Creates:**
1. D1 database: `umbrella-dev-db`
2. KV namespace: `KV` (with preview)
3. R2 bucket: `umbrella-dev-media`

**Prerequisites:**
- Wrangler CLI installed globally
- Logged in to Cloudflare (`wrangler login`)

**Usage:**
```bash
./scripts/setup-cloudflare.sh
```

**Post-Setup:** Copy resource IDs into `wrangler.toml`

## Configuration Files

### Vite (`vite.config.ts`)

**Features:**
- React plugin enabled
- Path alias: `@/*` → `./src/*`
- Proxy `/v1/*` to Worker dev server (localhost:8787)
- Code splitting with manual chunks (vendor, router, ui, utils)
- Asset optimization (inline limit 4KB)
- Dev server on port 5173
- Preview server on port 4173

**Manual Chunks:**
- `vendor`: React core (react, react-dom)
- `router`: React Router
- `ui`: All Radix UI components (shadcn/ui)
- `utils`: Utilities (clsx, tailwind-merge, lucide-react)

**Build Optimizations:**
- ESBuild minification
- CSS code splitting
- Tree shaking
- Asset hashing for cache busting

### TypeScript (`tsconfig.json`)

**Compiler Options:**
- Target: ES2020
- Module: ESNext (bundler mode)
- JSX: react-jsx (new JSX transform)
- Strict mode enabled
- Path aliases: `@/*` → `./src/*`

**Linting Rules:**
- No unused locals/parameters warnings (too noisy)
- Fallthrough cases in switch statements not allowed

**Includes:** `src/**/*`
**Excludes:** `node_modules`, `dist`

### TypeScript Node (`tsconfig.node.json`)

Configuration for Node.js scripts (Vite config, build scripts).

**Includes:** `vite.config.ts`, `scripts/**/*.js`

### Tailwind CSS (`tailwind.config.cjs`)

**Features:**
- Dark mode with class strategy
- Container utilities with 2rem padding
- Custom color palette (CSS variables)
- Border radius variables
- Accordion animations

**Content Paths:**
- `./src/**/*.{ts,tsx}`
- `./pages/**/*.{ts,tsx}`
- `./components/**/*.{ts,tsx}`
- `./index.html`

**Theme Extensions:**
- Semantic color tokens (primary, secondary, accent, etc.)
- Responsive border radius (lg, md, sm)
- Custom animations (accordion-down, accordion-up)

**Plugins:**
- `tailwindcss-animate` - Animation utilities

### PostCSS (`postcss.config.js`)

**Plugins:**
- `tailwindcss` - Process Tailwind directives
- `autoprefixer` - Add vendor prefixes

### ESLint (`eslint.config.js`)

**Configuration:**
- Flat config format (ESLint 9+)
- TypeScript ESLint plugin
- React Hooks plugin
- React Refresh plugin

**Rules:**
- React Hooks rules enforced
- Unused vars warning (except prefixed with `_`)
- Explicit `any` types warning
- React component export checks

**Ignored Paths:**
- `dist/**`
- `node_modules/**`
- `.wrangler/**`
- `api/**` (Worker code)
- `docs/**`
- `scripts/**`
- `*.cjs`

### Prettier (`.prettierrc`)

**Configuration:**
- No semicolons
- Single quotes
- 2-space indentation
- Trailing commas (ES5)
- 100 character line width
- Tailwind class sorting plugin

## Package Scripts

### Development

```bash
npm run dev              # Start Vite dev server (port 5173)
npm run dev:worker       # Start Worker dev server (port 8787)
```

### Building

```bash
npm run build            # Full build (TypeScript + Vite + Worker)
npm run build:worker     # Build worker only
```

### Code Quality

```bash
npm run lint             # Lint code (max 0 warnings)
npm run lint:fix         # Auto-fix linting issues
npm run type-check       # TypeScript type checking
npm run format           # Format with Prettier
npm run format:check     # Check formatting
```

### Testing

```bash
npm run test             # Run tests (placeholder)
npm run ci               # Full CI check (type + lint + build)
```

### Database

```bash
npm run migrate          # Apply migrations locally
npm run migrate:staging  # Apply migrations to staging
npm run migrate:prod     # Apply migrations to production
npm run db:create        # Create D1 database
```

### Cloudflare Resources

```bash
npm run kv:create        # Create KV namespace
npm run r2:create        # Create R2 bucket
```

### Deployment

```bash
npm run deploy           # Build and deploy
npm run preview          # Preview production build locally
```

### Maintenance

```bash
npm run clean            # Remove dist, node_modules, .wrangler
```

## Dependencies

### Production Dependencies

**Core Framework:**
- `react@^18.2.0` - React library
- `react-dom@^18.2.0` - React DOM renderer
- `react-router-dom@^6.20.0` - Client-side routing

**UI Components (Radix UI / shadcn/ui):**
- `@radix-ui/react-accordion` - Collapsible sections
- `@radix-ui/react-alert-dialog` - Modal dialogs
- `@radix-ui/react-avatar` - User avatars
- `@radix-ui/react-checkbox` - Checkboxes
- `@radix-ui/react-dialog` - Dialogs
- `@radix-ui/react-dropdown-menu` - Dropdown menus
- `@radix-ui/react-label` - Form labels
- `@radix-ui/react-popover` - Popovers
- `@radix-ui/react-select` - Select dropdowns
- `@radix-ui/react-separator` - Dividers
- `@radix-ui/react-slot` - Polymorphic components
- `@radix-ui/react-switch` - Toggle switches
- `@radix-ui/react-tabs` - Tab panels
- `@radix-ui/react-toast` - Toast notifications
- `@radix-ui/react-tooltip` - Tooltips

**Additional UI Components (Dev Dependencies):**
- `@radix-ui/react-aspect-ratio` - Aspect ratio containers
- `@radix-ui/react-context-menu` - Right-click menus
- `@radix-ui/react-hover-card` - Hover cards
- `@radix-ui/react-menubar` - Menu bars
- `@radix-ui/react-navigation-menu` - Navigation menus
- `@radix-ui/react-progress` - Progress bars
- `@radix-ui/react-radio-group` - Radio buttons
- `@radix-ui/react-scroll-area` - Scroll containers
- `@radix-ui/react-slider` - Sliders
- `@radix-ui/react-toggle` - Toggle buttons
- `@radix-ui/react-toggle-group` - Toggle button groups

**UI Utilities:**
- `class-variance-authority@^0.7.0` - CVA for component variants
- `clsx@^2.0.0` - Conditional classnames
- `tailwind-merge@^1.14.0` - Merge Tailwind classes
- `tailwindcss-animate@^1.0.7` - Animation utilities
- `lucide-react@^0.263.1` - Icon library
- `sonner@^1.3.1` - Toast notifications

**Forms:**
- `react-hook-form@^7.49.2` - Form management
- `@hookform/resolvers@^3.9.1` - Form validation resolvers
- `zod@^3.23.8` - Schema validation

**Additional Components:**
- `cmdk@^1.1.1` - Command palette
- `embla-carousel-react@^8.6.0` - Carousel
- `input-otp@^1.4.2` - OTP input
- `react-day-picker@^9.11.1` - Date picker
- `react-resizable-panels@^3.0.6` - Resizable panels
- `recharts@^3.3.0` - Charts
- `vaul@^1.1.2` - Drawer component

### Development Dependencies

**Build Tools:**
- `vite@^6.1.0` - Build tool and dev server
- `@vitejs/plugin-react@^4.3.4` - React plugin for Vite
- `wrangler@^4.33.1` - Cloudflare CLI

**TypeScript:**
- `typescript@^5.0.2` - TypeScript compiler
- `@types/react@^18.2.15` - React types
- `@types/react-dom@^18.2.7` - React DOM types
- `@cloudflare/workers-types@^4.20231025.0` - Cloudflare types

**Linting:**
- `eslint@^9.17.0` - Linter
- `@eslint/js@^9.17.0` - ESLint JavaScript config
- `typescript-eslint@^8.18.2` - TypeScript ESLint
- `@typescript-eslint/eslint-plugin@^8.18.2` - TypeScript rules
- `@typescript-eslint/parser@^8.18.2` - TypeScript parser
- `eslint-plugin-react-hooks@^5.1.0` - React Hooks rules
- `eslint-plugin-react-refresh@^0.4.16` - React Refresh rules
- `globals@^16.4.0` - Global variables

**Formatting:**
- `prettier@^3.1.0` - Code formatter
- `prettier-plugin-tailwindcss@^0.5.7` - Tailwind class sorting

**Styling:**
- `tailwindcss@^3.3.3` - Utility-first CSS framework
- `autoprefixer@^10.4.14` - CSS vendor prefixes
- `postcss@^8.4.27` - CSS transformations

**Commit Linting:**
- `@commitlint/cli@^18.4.3` - Commitlint CLI
- `@commitlint/config-conventional@^18.4.3` - Conventional commits config

## Environment Variables

### Required Secrets (Cloudflare Workers)

Set using `wrangler secret put <NAME>`:

```bash
CLAUDE_API_KEY           # Anthropic API key for Violet AI
RESEND_API_KEY           # Resend email API key
TWILIO_ACCOUNT_SID       # Twilio account SID
TWILIO_AUTH_TOKEN        # Twilio authentication token
TWILIO_PHONE_NUMBER      # Twilio phone number
JWT_SECRET               # Session signing secret
```

### GitHub Secrets

Required for CI/CD workflows:

```bash
CLOUDFLARE_API_TOKEN     # Cloudflare API token with Workers and D1 permissions
ANTHROPIC_API_KEY        # For Claude Code workflow
```

### Local Development (`.dev.vars`)

Copy `.dev.vars.example` and fill in values:

```bash
CLAUDE_API_KEY=sk-...
RESEND_API_KEY=re_...
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
JWT_SECRET=...
```

## Git Workflow

### Branch Structure

```
main (production)
  ↑
staging (pre-production)
  ↑
dev (development)
  ↑
feature/* (feature branches)
```

### Branching Strategy

1. **Create Feature Branch:** Branch from `dev`
   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feature/my-feature
   ```

2. **Make Changes:** Develop with conventional commits
   ```bash
   git add .
   git commit -m "feat: add artist profile editing"
   ```

3. **Push and Create PR:** Open PR against `dev`
   ```bash
   git push origin feature/my-feature
   ```

4. **Review and Merge:** CI runs checks, deploys preview, get approval

5. **Deploy to Staging:** Merge `dev` → `staging`
   ```bash
   git checkout staging
   git merge dev
   git push origin staging
   ```

6. **Deploy to Production:** Merge `staging` → `main`
   ```bash
   git checkout main
   git merge staging
   git push origin main
   ```

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <description>

[optional body]

[optional footer]
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `style` - Formatting, missing semicolons, etc.
- `refactor` - Code restructuring without behavior change
- `perf` - Performance improvements
- `test` - Adding tests
- `build` - Build system changes
- `ci` - CI configuration changes
- `chore` - Maintenance tasks

**Examples:**
```
feat: add artist onboarding wizard
fix: resolve session timeout on idle
docs: update API endpoint documentation
chore: upgrade React to 18.3
refactor: simplify gig filtering logic
test: add marketplace component tests
```

## Next Steps

### Immediate (Post-Infrastructure)

1. ✅ Session 1: Backend API infrastructure completed
2. ✅ Session 2: UI foundation completed
3. ✅ Session 3: Database schema completed
4. ✅ Session 4: DevOps & build config completed

### Feature Development

Now that infrastructure is complete, build domain-specific features:

1. **Onboarding Flow**
   - 6-step wizard component
   - Profile creation API endpoints
   - Form validation with Zod

2. **Marketplace**
   - Gig listing page
   - Filter components (location, genre, date)
   - Artist directory
   - Search functionality

3. **Profiles**
   - 6-tab artist profile UI
   - Portfolio management (tracks, videos, photos)
   - Reviews and ratings display
   - Edit mode

4. **Messaging**
   - Conversation list
   - Message thread UI
   - Real-time updates (polling or WebSocket)
   - Unread indicators

5. **Violet AI Toolkit**
   - Chat interface
   - Prompt library
   - Usage tracking (50/day limit)
   - Response streaming

### Testing & Quality

1. **Add Vitest**
   - Unit tests for components
   - Integration tests for API
   - Test coverage reporting

2. **Add Storybook**
   - Component documentation
   - Visual regression testing
   - Design system showcase

3. **Add E2E Tests**
   - Playwright or Cypress
   - Critical user flows
   - Cross-browser testing

### Monitoring & Observability

1. **Error Tracking**
   - Sentry integration
   - Error boundaries
   - Source maps

2. **Performance Monitoring**
   - Web Vitals tracking
   - Cloudflare Analytics
   - Custom metrics

3. **Logging**
   - Structured logging
   - Log aggregation
   - Alerting

## Troubleshooting

### Build Fails

**Symptom:** `npm run build` fails with errors

**Solutions:**
```bash
# Check TypeScript errors
npm run type-check

# Check for missing dependencies
npm ci

# Clean and rebuild
npm run clean
npm install
npm run build
```

### Deploy Fails

**Symptom:** Deployment fails in GitHub Actions

**Check:**
- Verify `CLOUDFLARE_API_TOKEN` is set in GitHub repository secrets
- Check `wrangler.toml` has correct resource IDs (database_id, namespace_id, bucket_name)
- Ensure migrations are applied: `npm run migrate:staging` or `npm run migrate:prod`
- Verify Cloudflare account has sufficient resources

**Debug:**
```bash
# Test deploy locally
npm run build
npx wrangler deploy --dry-run --env staging
```

### Dev Server Issues

**Symptom:** Dev server won't start or proxy doesn't work

**Check:**
- Port 5173 (Vite) or 8787 (Worker) may be in use
  ```bash
  lsof -ti:5173 | xargs kill -9
  lsof -ti:8787 | xargs kill -9
  ```
- Verify `.dev.vars` file exists and has required keys
- Check D1 database exists:
  ```bash
  wrangler d1 list
  ```
- Verify Worker can start:
  ```bash
  wrangler dev api/index.ts
  ```

### Migration Errors

**Symptom:** Database migrations fail

**Solutions:**
```bash
# Check migration files
ls -la db/migrations/

# Apply migrations with verbose output
wrangler d1 migrations apply umbrella-dev-db --local

# Check current migration status
wrangler d1 execute umbrella-dev-db --local \
  --command "SELECT name FROM sqlite_master WHERE type='table'"

# Reset database (DANGER - deletes all data)
wrangler d1 execute umbrella-dev-db --local \
  --command "DROP TABLE IF EXISTS users; DROP TABLE IF EXISTS artists;"
npm run migrate
```

### Linting Errors

**Symptom:** CI fails on linting

**Solutions:**
```bash
# Auto-fix issues
npm run lint:fix

# Check what's failing
npm run lint

# Ignore specific lines (use sparingly)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = response;
```

### Type Errors

**Symptom:** TypeScript compilation fails

**Solutions:**
```bash
# Check errors
npm run type-check

# Verify tsconfig.json is correct
cat tsconfig.json

# Restart TypeScript server in VS Code
Cmd+Shift+P → "TypeScript: Restart TS Server"
```

## Success Criteria

- [x] All workflows pass validation on GitHub
- [x] `npm install` succeeds without errors
- [x] `npm run build` succeeds and produces dist folder
- [x] `npm run lint` passes with 0 warnings
- [x] `npm run type-check` passes with no errors
- [x] All config files are valid (no syntax errors)
- [x] README is complete and accurate
- [x] Documentation is comprehensive
- [x] `.gitignore` excludes all sensitive files
- [x] Scripts are executable and working

## Files Created

### GitHub Workflows (`.github/workflows/`)
- ✅ `pr-checks.yml` - PR validation
- ✅ `deploy-preview.yml` - Preview deployments
- ✅ `deploy-staging.yml` - Staging deployments
- ✅ `deploy-production.yml` - Production deployments
- ✅ `claude-code.yml` - Claude Code assistant
- ✅ `commitlint.yml` - Commit message linting

### Scripts (`scripts/`)
- ✅ `build-worker.js` - Worker bundling
- ✅ `setup-cloudflare.sh` - Resource bootstrapping

### Configuration (Root)
- ✅ `vite.config.ts` - Vite configuration
- ✅ `tsconfig.json` - TypeScript configuration
- ✅ `tsconfig.node.json` - Node TypeScript configuration
- ✅ `tailwind.config.cjs` - Tailwind CSS configuration
- ✅ `postcss.config.js` - PostCSS configuration
- ✅ `eslint.config.js` - ESLint configuration
- ✅ `.prettierrc` - Prettier configuration
- ✅ `.commitlintrc.json` - Commitlint configuration
- ✅ `.gitignore` - Git ignore rules
- ✅ `package.json` - Dependencies and scripts
- ✅ `README.md` - Project documentation

### Documentation (`docs/`)
- ✅ `devops-build-config.md` - This file

## File Boundaries (Session 4 Scope)

### Created by Session 4 ✅
- `.github/workflows/` - All workflow files
- `scripts/` - Build and setup scripts
- Root configuration files (vite, typescript, tailwind, etc.)
- `.gitignore`
- `package.json`
- `README.md`
- `docs/devops-build-config.md`

### Other Sessions (DO NOT MODIFY)
- `api/` - Session 1 (Backend API)
- `src/` - Session 2 (UI Foundation)
- `db/migrations/` - Session 3 (Database)
- `api/models/` - Session 3 (Data Models)

## Summary

Session 4 has successfully established a complete DevOps and build infrastructure for Umbrella:

✅ **CI/CD Pipeline** - 6 automated workflows covering all deployment scenarios
✅ **Build System** - Vite + TypeScript + Tailwind optimized for production
✅ **Code Quality** - ESLint + Prettier + Commitlint enforcing standards
✅ **Developer Experience** - Hot reload, type checking, path aliases
✅ **Documentation** - Comprehensive README and this guide
✅ **Scripts** - Automated setup and build processes

**The project is now ready for:**
- Parallel development by multiple teams
- Automated testing and deployment
- Feature development (onboarding, marketplace, profiles, etc.)
- Production deployment to Cloudflare

**Next step:** Begin building domain-specific features on top of this foundation.
