# Leger v0.1.0 Implementation Action Plan

**Linear sequence of GitHub issues from infrastructure setup to production deployment**

---

## Phase 0: Infrastructure Setup (Manual)

### Issue #0: `chore: configure cloudflare resources and secrets`

**Type:** Manual setup (no code changes)

**Description:**
Create all required Cloudflare resources (KV namespaces, R2 bucket, D1 database) and configure GitHub secrets for deployment. Document all resource IDs and update wrangler.toml with bindings.

**Tasks:**
- Create KV namespaces: `LEGER_USERS`, `LEGER_SECRETS`
- Create R2 bucket: `leger-static-sites`
- Create D1 database: `leger-db`
- Generate and store secrets: `ENCRYPTION_KEY`, `JWT_SECRET`
- Add GitHub secrets: `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`
- Update `wrangler.toml` with all resource IDs

**Files Created:**
- `wrangler.toml` (with real IDs)
- `.dev.vars` (local development secrets)
- `docs/CLOUDFLARE_SETUP.md` (setup documentation)

---

## Phase 1: Backend Foundation

### Issue #1: `feat(backend): initialize worker with health check endpoint`

**Type:** Backend - Worker setup

**Description:**
Create the basic Cloudflare Worker structure with TypeScript types, environment interface, and health check endpoint. Establishes the foundation for all API routes.

**Touches:**
- `api/index.ts` - Main worker entry point with request router
- `api/types.ts` - Environment interface and shared types
- `package.json` - Add dependencies (jose for JWT, etc.)

---

### Issue #2: `feat(backend): add database migrations and schema`

**Type:** Backend - Database

**Description:**
Create D1 database migrations for users and releases tables, including indexes and foreign keys. Sets up the complete schema including future v0.2.0 tables (created but unused).

**Touches:**
- `db/migrations/0001_initial.sql` - Complete database schema
- `db/migrations/0002_future_tables.sql` - v0.2.0+ tables
- `api/db/client.ts` - D1 query helpers and connection utilities

---

### Issue #3: `feat(backend): implement base64 and crypto utilities`

**Type:** Backend - Utilities

**Description:**
Create utility functions for base64 encoding/decoding and AES-256-GCM encryption/decryption used throughout the application. Includes proper error handling and type safety.

**Touches:**
- `api/utils/encoding.ts` - Base64 encode/decode functions
- `api/utils/crypto.ts` - AES-256-GCM encrypt/decrypt with Web Crypto API

---

## Phase 2: Authentication System

### Issue #4: `feat(auth): implement jwt validation middleware`

**Type:** Backend - Authentication

**Description:**
Create JWT validation middleware using jose library to verify CLI-generated tokens on all protected routes. Extracts user_uuid from JWT payload and attaches to request context.

**Touches:**
- `api/middleware/auth.ts` - JWT verification middleware
- `api/utils/jwt.ts` - JWT verification helpers using jose library

---

### Issue #5: `feat(auth): add user creation and validation endpoint`

**Type:** Backend - Authentication

**Description:**
Implement POST /api/auth/validate endpoint that accepts CLI-generated JWT, creates user account if new (using UUID v5 derivation), or updates last_seen if existing. Stores user in both D1 and KV.

**Touches:**
- `api/routes/auth.ts` - Auth validation endpoint
- `api/services/user.ts` - User CRUD operations (D1 + KV)
- `api/utils/uuid.ts` - UUID v5 derivation from tailscale_user_id

---

## Phase 3: Secret Management Backend

### Issue #6: `feat(secrets): implement secret encryption service`

**Type:** Backend - Secrets

**Description:**
Create service layer for encrypting/decrypting secrets using AES-256-GCM with unique nonces per secret. Handles KV storage operations with proper error handling and logging (without exposing plaintext).

**Touches:**
- `api/services/secrets.ts` - Secret encryption/decryption service
- `api/models/secret.ts` - SecretRecord TypeScript interface

---

### Issue #7: `feat(secrets): add secret crud endpoints`

**Type:** Backend - API Routes

**Description:**
Implement all secret management endpoints: GET /api/secrets (list/sync), GET /api/secrets/:name (get one), POST /api/secrets/:name (create/update), DELETE /api/secrets/:name. Includes query parameter handling for include_values flag.

**Touches:**
- `api/routes/secrets.ts` - All secret endpoint handlers
- `api/validators/secret.ts` - Input validation for secret names/values

---

## Phase 4: Release Management Backend

### Issue #8: `feat(releases): implement release crud endpoints`

**Type:** Backend - API Routes

**Description:**
Create release management endpoints: GET /api/releases (list with optional name filter), POST /api/releases (create), GET /api/releases/:id (get one), PUT /api/releases/:id (update), DELETE /api/releases/:id. Stores GitHub URLs in D1 with auto-incrementing versions.

**Touches:**
- `api/routes/releases.ts` - All release endpoint handlers
- `api/services/releases.ts` - Release CRUD operations on D1
- `api/validators/release.ts` - URL validation and input sanitization

---

### Issue #9: `feat(backend): wire up all routes in main worker`

**Type:** Backend - Routing

**Description:**
Connect all route handlers to main worker router with proper HTTP method matching and middleware application. Includes SPA fallback for unmatched routes and error handling.

**Touches:**
- `api/index.ts` - Update with complete route mapping
- `api/middleware/error.ts` - Global error handler middleware
- `api/middleware/cors.ts` - CORS headers for development

---

## Phase 5: Frontend Foundation

### Issue #10: `feat(frontend): initialize react app with vite and routing`

**Type:** Frontend - Setup

**Description:**
Set up Vite-based React application with TypeScript, React Router, and basic page structure. Includes auth guard for protected routes and JWT storage in localStorage.

**Touches:**
- `src/main.tsx` - React app entry point
- `src/App.tsx` - Router configuration with protected routes
- `src/components/AuthGuard.tsx` - Route protection component
- `vite.config.ts` - Vite configuration with proper chunking

---

### Issue #11: `feat(frontend): add auth context and jwt handling`

**Type:** Frontend - Authentication

**Description:**
Create React context for authentication state management with JWT storage, validation, and automatic logout on token expiry. Provides hooks for accessing current user throughout the app.

**Touches:**
- `src/contexts/AuthContext.tsx` - Auth state management
- `src/hooks/useAuth.ts` - Custom hook for auth state
- `src/utils/jwt.ts` - JWT parsing and validation helpers

---

### Issue #12: `feat(frontend): implement api client with auth headers`

**Type:** Frontend - API Client

**Description:**
Create centralized API client using fetch with automatic JWT header injection, error handling, and response typing. Includes helper methods for all backend endpoints.

**Touches:**
- `src/lib/api.ts` - Typed API client with all endpoints
- `src/lib/fetch.ts` - Base fetch wrapper with auth headers
- `src/types/api.ts` - API request/response TypeScript types

---

## Phase 6: Component Library

### Issue #13: `feat(ui): add base ui components from shadcn`

**Type:** Frontend - Components

**Description:**
Install and configure shadcn/ui components needed for the application: Button, Input, Card, Badge, etc. Set up Tailwind CSS with custom theme configuration.

**Touches:**
- `src/components/ui/*` - All shadcn components
- `tailwind.config.js` - Theme configuration
- `src/index.css` - CSS variables and base styles

---

### Issue #14: `feat(ui): create page layout and header components`

**Type:** Frontend - Components

**Description:**
Build reusable layout components including PageLayout (max-width container), PageHeader (title/description), and navigation header with logo and user menu. Matches Leger design system.

**Touches:**
- `src/components/layout/PageLayout.tsx`
- `src/components/layout/PageHeader.tsx`
- `src/components/layout/Header.tsx` - Global navigation
- `src/components/layout/UserMenu.tsx` - Avatar dropdown

---

### Issue #15: `feat(ui): create form field components`

**Type:** Frontend - Components

**Description:**
Build specialized form field components: SecretField (with show/hide toggle), TextField, URLInput, TextArea. Includes validation display and dirty state tracking.

**Touches:**
- `src/components/forms/SecretField.tsx`
- `src/components/forms/TextField.tsx`
- `src/components/forms/URLInput.tsx`
- `src/components/forms/FieldGroup.tsx` - Field wrapper

---

### Issue #16: `feat(ui): create category section component`

**Type:** Frontend - Components

**Description:**
Build CategorySection component used throughout the app for grouping related settings with independent save buttons. Includes dirty state indication and save/loading states.

**Touches:**
- `src/components/sections/CategorySection.tsx`
- `src/components/sections/SaveButton.tsx`
- `src/hooks/useDirtyState.ts` - Track form changes

---

## Phase 7: Frontend Pages

### Issue #17: `feat(pages): implement auth landing page`

**Type:** Frontend - Pages

**Description:**
Create /auth page that receives JWT from URL query parameter, validates with backend via POST /api/auth/validate, stores token in localStorage, and redirects to /api-keys. Includes loading state and error handling.

**Touches:**
- `src/pages/Auth.tsx` - Auth validation landing page
- `src/pages/AuthError.tsx` - Error page for failed validation

---

### Issue #18: `feat(pages): implement api keys management page`

**Type:** Frontend - Pages

**Description:**
Build /api-keys page with CategorySection for each major AI provider (OpenAI, Anthropic, Google AI, etc). Each section has independent save button calling POST /api/secrets/:name with encrypted storage.

**Touches:**
- `src/pages/ApiKeys.tsx` - Main API keys page
- `src/components/providers/OpenAISection.tsx`
- `src/components/providers/AnthropicSection.tsx`
- `src/hooks/useSecrets.ts` - Secret management hooks

---

### Issue #19: `feat(pages): implement releases list page`

**Type:** Frontend - Pages

**Description:**
Create /releases page displaying all user releases in card grid layout, showing GitHub URL, branch, and metadata. Includes "Create Release" button, empty state, and copy deploy command functionality.

**Touches:**
- `src/pages/Releases.tsx` - Release list page
- `src/components/releases/ReleaseCard.tsx`
- `src/hooks/useReleases.ts` - Release data fetching

---

### Issue #20: `feat(pages): implement release create/edit page`

**Type:** Frontend - Pages

**Description:**
Build /releases/new and /releases/:id pages with form for release name, GitHub URL, branch, and description. Shows generated deploy command and validates inputs before saving to backend.

**Touches:**
- `src/pages/ReleaseForm.tsx` - Shared create/edit form
- `src/components/releases/DeployCommand.tsx` - Command display
- `src/utils/validation.ts` - URL and name validation

---

### Issue #21: `feat(pages): implement settings page`

**Type:** Frontend - Pages

**Description:**
Create /settings page displaying user profile information (email, tailnet), Leger ID (with copy button), and editable display name. All data fetched from GET /api/user endpoint.

**Touches:**
- `src/pages/Settings.tsx` - Settings page with profile sections
- `src/hooks/useUser.ts` - User data fetching and updates

---

## Phase 8: Build & Deployment

### Issue #22: `chore: configure build scripts and worker bundling`

**Type:** Build System

**Description:**
Set up npm scripts for building Vite frontend and bundling worker code separately. Includes TypeScript compilation, esbuild for worker, and proper output directory structure.

**Touches:**
- `package.json` - Build scripts (build, build:worker, deploy)
- `scripts/build-worker.js` - Worker bundling script with esbuild
- `tsconfig.json` - TypeScript configuration

---

### Issue #23: `ci: add github actions deployment workflow`

**Type:** CI/CD

**Description:**
Create GitHub Actions workflow for automated deployment to Cloudflare on main branch push. Includes type checking, linting, building, D1 migrations, and health check verification.

**Touches:**
- `.github/workflows/deploy.yml` - Complete deployment pipeline
- `.github/workflows/test.yml` - PR testing workflow

---

### Issue #24: `test: add end-to-end integration tests`

**Type:** Testing

**Description:**
Create manual testing checklist and automated health check tests verifying complete user flow from CLI authentication through secret management to release creation. Documents expected behavior for QA.

**Touches:**
- `tests/e2e/auth.test.ts` - Authentication flow tests
- `tests/e2e/secrets.test.ts` - Secret CRUD tests
- `tests/e2e/releases.test.ts` - Release management tests
- `docs/TESTING.md` - Manual QA checklist

---

### Issue #25: `docs: add deployment guide and api documentation`

**Type:** Documentation

**Description:**
Write comprehensive deployment guide covering Cloudflare setup, secrets configuration, and production deployment process. Include API endpoint documentation with request/response examples.

**Touches:**
- `docs/DEPLOYMENT.md` - Step-by-step deployment guide
- `docs/API.md` - Complete API reference with examples
- `README.md` - Update with v0.1.0 features and setup

---

### Issue #26: `chore: prepare v0.1.0 release`

**Type:** Release

**Description:**
Final release preparation including version bumping, changelog generation, Git tag creation, and production deployment verification. Confirms all success criteria from specification are met.

**Touches:**
- `package.json` - Bump to version 0.1.0
- `CHANGELOG.md` - Document all v0.1.0 features
- Git tag `v0.1.0`

---

## Issue Dependency Graph

```
#0 (manual)
 ↓
#1 → #2 → #3
       ↓
#4 → #5
 ↓
#6 → #7
 ↓
#8
 ↓
#9
 ↓
#10 → #11 → #12
        ↓
#13 → #14 → #15 → #16
                   ↓
#17 → #18 → #19 → #20 → #21
                          ↓
#22 → #23 → #24 → #25 → #26
```

**Critical Path:** #0 → #1 → #2 → #4 → #5 → #6 → #7 → #8 → #9 → #10 → #11 → #17 → #26

**Estimated Timeline:** 2-3 weeks for solo developer working full-time
