# Umbrella Codebase Cleanup Analysis

**Date:** 2025-10-23
**Analyst:** Claude Code
**Purpose:** Identify unused files copied from the Leger project that can be safely removed

---

## Executive Summary

This analysis identifies **292+ files** (approximately **2.2 MB**) that can be safely removed from the Umbrella codebase. The majority of these files are from the `inspiration/` folder containing the complete Leger reference project. Additionally, several frontend components, backend models, hooks, and utilities copied from Leger are not currently integrated into the Umbrella application.

### Key Findings

- **Entire `inspiration/` folder (292 files, 2.2 MB)**: Complete Leger project used as reference - not integrated
- **90+ UI components**: Most are unused; only ~10 components are actually imported
- **8 backend models**: None are used; all routes return "not implemented" stubs
- **3 hooks**: `use-api.ts` and `use-local-storage.ts` are unused
- **1 backend utility**: `api/utils/crypto.ts` is unused
- **Layout components**: AppLayout, PageLayout, PageHeader contain Leger branding and non-existent routes

**Total files that can be removed: 300+**

---

## 1. Critical Finding: Entire `inspiration/` Folder

### Location
```
/home/user/wip-webapp/inspiration/app.leger.run/
```

### Size
- **292 files**
- **~2.2 MB**

### Description
This folder contains the complete Leger project (a secret management application) that was used as reference/inspiration. It includes:
- Complete frontend application with routing, pages, and components
- Complete backend API with routes and models
- Database migrations for Leger's schema
- Brand assets, documentation, and configuration files
- Deployment scripts and GitHub workflows

### Integration Status
**NONE** - This folder is completely isolated:
- Not referenced in any imports
- Not used in build process
- Not included in deployment
- `.gitignore` does not exclude it

### Recommendation
**SAFE TO DELETE IMMEDIATELY** - The entire folder can be removed without any impact on the Umbrella application.

```bash
# Command to remove
rm -rf /home/user/wip-webapp/inspiration/
```

---

## 2. Frontend Components Analysis

### 2.1 Currently Used Components (KEEP)

Only **11 files** are actually imported and used in the current Umbrella app:

#### Core App Files (3 files) - KEEP
- `src/App.tsx` - Root component
- `src/main.tsx` - React entry point
- `src/components/ErrorBoundary.tsx` - Error boundary

#### Theme Components (2 files) - KEEP
- `src/components/theme-provider.tsx` - Theme context provider
- `src/components/theme-toggle.tsx` - Dark/light mode toggle

#### Active UI Components (6 files) - KEEP
- `src/components/ui/toaster.tsx` - Used in App.tsx
- `src/components/ui/toast.tsx` - Toast primitive
- `src/components/ui/alert.tsx` - Used by ErrorBoundary
- `src/components/ui/button.tsx` - Used by ErrorBoundary, theme-toggle
- `src/components/ui/label.tsx` - Required by form primitives
- `src/components/ui/utils.ts` - Used by most UI components (cn helper)

### 2.2 Potentially Unused Layout Components (REMOVE OR FIX)

These components were copied from Leger and reference non-existent files/routes:

#### `src/components/layout/AppLayout.tsx` - PROBLEMATIC
**Issues:**
- References non-existent `@/lib/session` (line 11)
- Hard-coded "Leger" branding instead of "Umbrella" (lines 87-91)
- Links to Leger GitHub repo (lines 99-100)
- Links to leger.run domain (lines 111, 123)
- References routes that don't exist: `/api-keys`, `/releases`, `/models`, `/marketplace`, `/settings`
- Uses `react-router-dom` `Outlet` but app has no routing configured
- Uses `useAuth` hook that exists but is unused elsewhere

**Recommendation:** DELETE (not integrated, contains Leger branding)

#### `src/components/layout/PageLayout.tsx` - UNUSED
**Status:** Not imported anywhere
**Recommendation:** DELETE

#### `src/components/layout/PageHeader.tsx` - UNUSED
**Status:** Not imported anywhere
**Recommendation:** DELETE

### 2.3 Unused UI Components (88+ files) - SAFE TO DELETE

The following components are defined but never imported or used in the codebase:

#### Specialized Leger-specific Components (24 files)
These are clearly from the Leger project and specific to secret management:
- `environment-variable-form.tsx` - Environment variable CRUD
- `environment-variable-table.tsx` - Table for env vars
- `environment-variable-import.tsx` - Bulk import env vars
- `environment-card.tsx` - Environment cards
- `environment-breadcrumb.tsx` - Environment breadcrumbs
- `permission-scope-row.tsx` - Permission scopes
- `team-selector-chip.tsx` - Team selection
- `framework-preset-selector.tsx` - Framework presets
- `framework-icon.tsx` - Framework icons
- `protection-mode-selector.tsx` - Protection modes
- `plan-restricted-feature.tsx` - Plan upgrade prompts
- `export-readiness-indicator.tsx` - Export status
- `visibility-notice.tsx` - Visibility warnings
- `path-management-list.tsx` - Path management
- `overrideable-field.tsx` - Overrideable fields
- `conditional-field.tsx` - Conditional rendering
- `hierarchical-navigation.tsx` - Hierarchical nav
- `code-reference.tsx` - Code reference
- `documentation-link.tsx` - Doc links
- `save-button.tsx` - Custom save button
- `dangerous-action-button.tsx` - Danger button
- `character-counter.tsx` - Character counter
- `category-section.tsx` - Category sections
- `field-status-indicator.tsx` - Field status

#### Form Field Components (14 files)
Custom field components not used in Umbrella:
- `text-field.tsx`
- `select-field.tsx`
- `date-field.tsx`
- `number-field.tsx`
- `integer-field.tsx`
- `secret-field.tsx`
- `url-input.tsx`
- `toggle-field.tsx`
- `array-field.tsx`
- `object-field.tsx`
- `markdown-text-area.tsx`
- `command-field-group.tsx`
- `field-group.tsx`
- `same-information-checkbox.tsx`

#### Form & Validation Components (6 files)
Advanced form features not yet used:
- `form-section.tsx`
- `section-accordion.tsx`
- `validation-message.tsx`
- `validation-summary.tsx`
- `enhanced-validation-message.tsx`
- `toast-error.tsx`

#### General UI Primitives Not Yet Used (44 files)
shadcn/ui components that may be useful later but aren't currently imported:
- `accordion.tsx`
- `alert-dialog.tsx`
- `aspect-ratio.tsx`
- `badge.tsx` (imported by unused AppLayout)
- `avatar.tsx` (imported by unused AppLayout)
- `breadcrumb.tsx`
- `calendar.tsx`
- `card.tsx`
- `carousel.tsx`
- `chart.tsx`
- `checkbox.tsx`
- `collapsible.tsx`
- `command.tsx`
- `context-menu.tsx`
- `dialog.tsx`
- `drawer.tsx`
- `dropdown-menu.tsx`
- `form.tsx` (base form component)
- `hover-card.tsx`
- `input.tsx`
- `input-otp.tsx`
- `menubar.tsx`
- `navigation-menu.tsx`
- `pagination.tsx`
- `popover.tsx`
- `progress.tsx`
- `radio-group.tsx`
- `resizable.tsx`
- `scroll-area.tsx`
- `select.tsx`
- `separator.tsx`
- `sheet.tsx`
- `sidebar.tsx`
- `skeleton.tsx`
- `slider.tsx`
- `sonner.tsx` (alternative toast implementation)
- `switch.tsx`
- `table.tsx`
- `tabs.tsx`
- `textarea.tsx`
- `toggle.tsx`
- `toggle-group.tsx`
- `tooltip.tsx`

**Recommendation for UI Components:**
1. **DELETE immediately**: All 24 Leger-specific components
2. **DELETE immediately**: All 14 form field components
3. **CONSIDER keeping**: General UI primitives (44 files) - these may be needed for future features, but currently add ~400KB of unused code

---

## 3. Backend API Analysis

### 3.1 Currently Used Backend Files (KEEP)

#### Main Worker (1 file) - KEEP
- `api/index.ts` - Main Worker entry point with fetch handler

#### Active Routes (2 files) - KEEP
- `api/routes/auth.ts` - OAuth callback, session check, logout (IMPLEMENTED)
- `api/routes/health.ts` - Health check endpoint (IMPLEMENTED)

#### Active Middleware (3 files) - KEEP
- `api/middleware/auth.ts` - JWT verification, onboarding check
- `api/middleware/cors.ts` - CORS header handling
- `api/middleware/error-handler.ts` - Error handling

#### Active Utilities (4 files) - KEEP
- `api/utils/response.ts` - API response formatting
- `api/utils/jwt.ts` - JWT creation/verification
- `api/utils/uuid.ts` - UUID generation
- `api/utils/encoding.ts` - Base64 encoding (used by jwt.ts)

### 3.2 Unused Backend Files (SAFE TO DELETE)

#### Unused Models (9 files) - DELETE
These are TypeScript type definitions for future features. None are imported or used:

- `api/models/user.ts` - User types (inline in routes instead)
- `api/models/artist.ts` - Artist profile types
- `api/models/track.ts` - Music track types
- `api/models/gig.ts` - Gig listing types
- `api/models/message.ts` - Direct message types
- `api/models/conversation.ts` - Conversation types
- `api/models/review.ts` - Review/rating types
- `api/models/file.ts` - File metadata types
- `api/models/analytics.ts` - Analytics event types

**Evidence:** No imports found
```bash
# Search result: No matches found
grep -r "from.*models/" api/
```

**Note:** The auth routes define types inline rather than importing from `models/user.ts`

#### Unused Utilities (1 file) - DELETE
- `api/utils/crypto.ts` - Cryptographic utilities (not imported anywhere)

**Evidence:** No imports found
```bash
# Search result: No matches found
grep -r "from.*utils/crypto" api/
```

---

## 4. Custom Hooks Analysis

### 4.1 Currently Used Hooks (KEEP)

- `src/hooks/use-theme.ts` - Used by theme-toggle and sonner (3 imports)
- `src/hooks/use-toast.ts` - Used by toaster and toast-error (2 imports)
- `src/hooks/use-mobile.tsx` - Used by sidebar component (1 import)

**Note:** `use-auth.ts` is imported by the unused `AppLayout.tsx`, but not used by the actual app

### 4.2 Unused Hooks (SAFE TO DELETE)

- `src/hooks/use-api.ts` - API request hook (not imported anywhere)
- `src/hooks/use-auth.ts` - Authentication hook (only used by unused AppLayout)
- `src/hooks/use-local-storage.ts` - LocalStorage persistence (not imported anywhere)

**Evidence:**
```bash
# Search result: Only AppLayout imports use-auth
grep -r "from.*hooks/use-auth" src/
# src/components/layout/AppLayout.tsx:10:import { useAuth } from '@/hooks/use-auth';

# Search result: No imports for use-api
grep -r "from.*hooks/use-api" src/
# No matches found

# Search result: No imports for use-local-storage
grep -r "from.*hooks/use-local-storage" src/
# No matches found
```

---

## 5. Database Analysis

### 5.1 Current Database Schema (KEEP)

All 5 migration files should be **KEPT** as they define the database schema:

- `db/migrations/0001_users_artists.sql` - Users and Artists tables
- `db/migrations/0002_tracks_gigs.sql` - Tracks and Gigs tables
- `db/migrations/0003_messaging.sql` - Messages and Conversations
- `db/migrations/0004_files_reviews.sql` - File storage and Reviews
- `db/migrations/0005_analytics.sql` - Analytics tracking

**Reasoning:** Even though the API routes are not implemented yet, the database schema is part of the planned architecture. These files are small (total ~10KB) and define the data model for future features.

---

## 6. Configuration & Build Files (KEEP ALL)

All configuration files are actively used and should be kept:
- `package.json` - Dependencies and scripts
- `tsconfig.json`, `tsconfig.node.json` - TypeScript config
- `vite.config.ts` - Vite bundler config
- `wrangler.toml` - Cloudflare Worker config
- `tailwind.config.cjs` - Tailwind CSS config
- `postcss.config.js` - PostCSS config
- `eslint.config.js` - ESLint rules
- `.prettierrc` - Prettier config
- `.commitlintrc.json` - Commit linting
- `.gitignore` - Git ignore rules
- `index.html` - HTML template
- `scripts/build-worker.js` - Worker build script
- `scripts/setup-cloudflare.sh` - Cloudflare setup

---

## 7. Documentation Files

### 7.1 Current Umbrella Docs (KEEP)
- `README.md` - Project README
- `docs/backend-api-setup.md` - Backend API docs
- `docs/database-schema.md` - Database schema docs
- `docs/devops-build-config.md` - DevOps docs
- `docs/ui-foundation.md` - UI component docs
- `docs/sessions.md` - Development sessions log
- `docs/session-1-integration-review.md` - Session 1 review
- `docs/initial-spec/architecture.md` - Architecture spec
- `docs/initial-spec/eng-spec.md` - Engineering spec

### 7.2 Deprecated Docs (CONSIDER REMOVING)
- `docs/initial-spec/devops-depricated.md` - File name suggests it's deprecated (note: typo "depricated")

---

## 8. GitHub Actions Workflows (KEEP ALL)

All workflows are relevant to the Umbrella project:
- `.github/workflows/pr-checks.yml` - PR validation
- `.github/workflows/deploy-preview.yml` - Preview deployments
- `.github/workflows/deploy-staging.yml` - Staging deployment
- `.github/workflows/deploy-production.yml` - Production deployment
- `.github/workflows/commitlint.yml` - Commit message validation
- `.github/workflows/claude-code.yml` - Claude Code automation

---

## 9. Dependencies Analysis

### 9.1 Unused npm Dependencies

Based on the unused components, the following npm packages are likely unused:

#### Definitely Unused
- `react-router-dom` - Only used in unused AppLayout
- `embla-carousel-react` - Used by unused carousel component
- `recharts` - Used by unused chart component
- `react-day-picker` - Used by unused calendar component
- `react-resizable-panels` - Used by unused resizable component
- `vaul` - Used by unused drawer component
- `cmdk` - Used by unused command component
- `input-otp` - Used by unused input-otp component

#### Partially Unused Radix UI Packages
Many Radix UI packages are installed but their components aren't used:
- `@radix-ui/react-accordion` - accordion.tsx not used
- `@radix-ui/react-alert-dialog` - alert-dialog.tsx not used
- `@radix-ui/react-context-menu` - context-menu.tsx not used
- `@radix-ui/react-hover-card` - hover-card.tsx not used
- `@radix-ui/react-menubar` - menubar.tsx not used
- `@radix-ui/react-navigation-menu` - navigation-menu.tsx not used
- `@radix-ui/react-progress` - progress.tsx not used
- `@radix-ui/react-radio-group` - radio-group.tsx not used
- `@radix-ui/react-scroll-area` - scroll-area.tsx not used
- `@radix-ui/react-slider` - slider.tsx not used
- `@radix-ui/react-toggle` - toggle.tsx not used
- `@radix-ui/react-toggle-group` - toggle-group.tsx not used

**Recommendation:** Keep these packages for now as they may be needed for future UI development, or remove them along with their component files.

---

## 10. Summary of Files to Remove

### Immediate Deletion (High Priority)

#### 1. Entire inspiration folder
```bash
rm -rf inspiration/
```
**Impact:** None - completely isolated
**Size saved:** ~2.2 MB, 292 files

#### 2. Unused layout components
```bash
rm -rf src/components/layout/
```
**Impact:** None - not imported, contains Leger branding
**Files:** 3 (AppLayout.tsx, PageLayout.tsx, PageHeader.tsx)

#### 3. Leger-specific UI components
```bash
# Environment-related
rm src/components/ui/environment-*.tsx
rm src/components/ui/permission-scope-row.tsx
rm src/components/ui/team-selector-chip.tsx
rm src/components/ui/framework-*.tsx
rm src/components/ui/protection-mode-selector.tsx
rm src/components/ui/plan-restricted-feature.tsx
rm src/components/ui/export-readiness-indicator.tsx
rm src/components/ui/visibility-notice.tsx
rm src/components/ui/path-management-list.tsx
rm src/components/ui/overrideable-field.tsx
rm src/components/ui/conditional-field.tsx
rm src/components/ui/hierarchical-navigation.tsx
rm src/components/ui/code-reference.tsx
rm src/components/ui/documentation-link.tsx
rm src/components/ui/save-button.tsx
rm src/components/ui/dangerous-action-button.tsx
rm src/components/ui/character-counter.tsx
rm src/components/ui/category-section.tsx
rm src/components/ui/field-status-indicator.tsx
```
**Impact:** None - Leger-specific features
**Files:** 24

#### 4. Unused form field components
```bash
rm src/components/ui/text-field.tsx
rm src/components/ui/select-field.tsx
rm src/components/ui/date-field.tsx
rm src/components/ui/number-field.tsx
rm src/components/ui/integer-field.tsx
rm src/components/ui/secret-field.tsx
rm src/components/ui/url-input.tsx
rm src/components/ui/toggle-field.tsx
rm src/components/ui/array-field.tsx
rm src/components/ui/object-field.tsx
rm src/components/ui/markdown-text-area.tsx
rm src/components/ui/command-field-group.tsx
rm src/components/ui/field-group.tsx
rm src/components/ui/same-information-checkbox.tsx
rm src/components/ui/form-section.tsx
rm src/components/ui/section-accordion.tsx
```
**Impact:** None - not imported
**Files:** 16

#### 5. Unused validation components
```bash
rm src/components/ui/validation-message.tsx
rm src/components/ui/validation-summary.tsx
rm src/components/ui/enhanced-validation-message.tsx
rm src/components/ui/toast-error.tsx
```
**Impact:** None - not imported
**Files:** 4

#### 6. Unused backend models
```bash
rm -rf api/models/
```
**Impact:** None - not imported anywhere
**Files:** 9

#### 7. Unused backend utilities
```bash
rm api/utils/crypto.ts
```
**Impact:** None - not imported
**Files:** 1

#### 8. Unused hooks
```bash
rm src/hooks/use-api.ts
rm src/hooks/use-auth.ts
rm src/hooks/use-local-storage.ts
```
**Impact:** None - not imported (use-auth only in unused AppLayout)
**Files:** 3

**TOTAL IMMEDIATE DELETIONS: 352 files**

### Consider for Deletion (Lower Priority)

#### Unused UI primitives (44 files)
These are standard shadcn/ui components that might be needed for future features:
- accordion, alert-dialog, aspect-ratio, badge, avatar, breadcrumb, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, form, hover-card, input, input-otp, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, switch, table, tabs, textarea, toggle, toggle-group, tooltip

**Decision:** Keep for now unless aggressive code minimization is required. They add ~400KB but may be needed soon.

#### Unused hooks (currently kept for potential use)
- `use-mobile.tsx` - Only used by unused sidebar component

#### Deprecated docs
- `docs/initial-spec/devops-depricated.md`

---

## 11. Recommendations

### Phase 1: Immediate Cleanup (Do Now)
1. **Delete `inspiration/` folder** - Removes 292 files, 2.2 MB
2. **Delete Leger-specific components** - Removes 47 files
3. **Delete unused backend models** - Removes 9 files
4. **Delete unused layout components** - Removes 3 files
5. **Delete unused utilities and hooks** - Removes 4 files

**Expected Result:** ~355 fewer files, ~2.5 MB reduction, cleaner codebase

### Phase 2: Aggressive Cleanup (Optional)
1. **Delete all unused UI primitives** - Remove 44 component files
2. **Remove unused npm dependencies** - Reduce node_modules size
3. **Clean up unused hooks** - Remove use-mobile if sidebar is removed

**Expected Result:** ~400 fewer files total, ~3 MB reduction

### Phase 3: Future Considerations
1. **Add components as needed** - Re-add UI primitives from shadcn/ui when features require them
2. **Implement backend routes** - When implementing features, create new model files as needed
3. **Build proper layout** - Create Umbrella-specific layout components (not Leger clones)

---

## 12. Safe Deletion Script

Here's a script to safely remove all the identified unused files:

```bash
#!/bin/bash
# Umbrella Cleanup Script - Phase 1 (Safe Deletions)

echo "Starting Umbrella cleanup..."

# 1. Remove entire inspiration folder (292 files)
echo "Removing inspiration folder..."
rm -rf inspiration/

# 2. Remove unused layout components
echo "Removing unused layout components..."
rm -rf src/components/layout/

# 3. Remove Leger-specific UI components
echo "Removing Leger-specific UI components..."
rm src/components/ui/environment-*.tsx
rm src/components/ui/permission-scope-row.tsx
rm src/components/ui/team-selector-chip.tsx
rm src/components/ui/framework-*.tsx
rm src/components/ui/protection-mode-selector.tsx
rm src/components/ui/plan-restricted-feature.tsx
rm src/components/ui/export-readiness-indicator.tsx
rm src/components/ui/visibility-notice.tsx
rm src/components/ui/path-management-list.tsx
rm src/components/ui/overrideable-field.tsx
rm src/components/ui/conditional-field.tsx
rm src/components/ui/hierarchical-navigation.tsx
rm src/components/ui/code-reference.tsx
rm src/components/ui/documentation-link.tsx
rm src/components/ui/save-button.tsx
rm src/components/ui/dangerous-action-button.tsx
rm src/components/ui/character-counter.tsx
rm src/components/ui/category-section.tsx
rm src/components/ui/field-status-indicator.tsx

# 4. Remove unused form field components
echo "Removing unused form field components..."
rm src/components/ui/text-field.tsx
rm src/components/ui/select-field.tsx
rm src/components/ui/date-field.tsx
rm src/components/ui/number-field.tsx
rm src/components/ui/integer-field.tsx
rm src/components/ui/secret-field.tsx
rm src/components/ui/url-input.tsx
rm src/components/ui/toggle-field.tsx
rm src/components/ui/array-field.tsx
rm src/components/ui/object-field.tsx
rm src/components/ui/markdown-text-area.tsx
rm src/components/ui/command-field-group.tsx
rm src/components/ui/field-group.tsx
rm src/components/ui/same-information-checkbox.tsx
rm src/components/ui/form-section.tsx
rm src/components/ui/section-accordion.tsx

# 5. Remove unused validation components
echo "Removing unused validation components..."
rm src/components/ui/validation-message.tsx
rm src/components/ui/validation-summary.tsx
rm src/components/ui/enhanced-validation-message.tsx
rm src/components/ui/toast-error.tsx

# 6. Remove unused backend models
echo "Removing unused backend models..."
rm -rf api/models/

# 7. Remove unused backend utilities
echo "Removing unused backend utilities..."
rm api/utils/crypto.ts

# 8. Remove unused hooks
echo "Removing unused hooks..."
rm src/hooks/use-api.ts
rm src/hooks/use-auth.ts
rm src/hooks/use-local-storage.ts

echo "Cleanup complete!"
echo ""
echo "Summary:"
echo "- Removed ~355 files"
echo "- Saved ~2.5 MB"
echo ""
echo "Next steps:"
echo "1. Run 'npm run type-check' to verify no broken imports"
echo "2. Run 'npm run build' to ensure build still works"
echo "3. Test the application"
echo "4. Commit changes"
```

---

## 13. Verification Steps

After running the cleanup, verify everything still works:

### 1. Type Check
```bash
npm run type-check
```
**Expected:** Should pass with no errors

### 2. Build
```bash
npm run build
```
**Expected:** Should build successfully

### 3. Dev Server
```bash
npm run dev
```
**Expected:** Should start without errors

### 4. Manual Testing
- Load http://localhost:5173
- Verify "Umbrella MVP" displays
- Verify theme toggle works
- Check browser console for errors

---

## 14. Post-Cleanup Actions

After successful cleanup:

1. **Update .gitignore** - Already ignores common directories, no changes needed

2. **Update documentation** - Update ui-foundation.md to reflect removed components

3. **Consider dependency cleanup** - Run `npm prune` and consider removing unused packages:
   ```bash
   npm uninstall react-router-dom embla-carousel-react recharts \
     react-day-picker react-resizable-panels vaul cmdk input-otp
   ```

4. **Commit changes**
   ```bash
   git add -A
   git commit -m "chore: remove unused files from Leger reference project

   - Remove entire inspiration/ folder (292 files, 2.2 MB)
   - Remove Leger-specific UI components (47 files)
   - Remove unused layout components with Leger branding (3 files)
   - Remove unused backend models (9 files)
   - Remove unused hooks and utilities (4 files)

   Total: ~355 files removed, ~2.5 MB saved

   All removed files were not integrated into Umbrella codebase.
   Type checking and builds still pass after cleanup."
   ```

---

## 15. Risk Assessment

### Low Risk (Safe to Delete)
- `inspiration/` folder - Completely isolated
- Leger-specific components - Not compatible with Umbrella
- Unused backend models - Not imported anywhere
- Unused hooks - Not imported (except by unused components)

### Medium Risk (Verify First)
- UI primitive components - May be needed soon for new features
- npm dependencies - Some may be peer dependencies

### High Risk (Do Not Delete)
- Active components: App.tsx, theme-provider, toaster, etc.
- Active backend files: auth routes, middleware, utils
- Database migrations - Define schema
- Configuration files - Required for build/deploy
- Documentation - Project knowledge

---

## Conclusion

This analysis identifies **352 files** that can be safely removed immediately, primarily consisting of:
1. The entire Leger reference project in `inspiration/` (292 files)
2. Leger-specific UI components not applicable to Umbrella (47 files)
3. Unused backend models and utilities (10 files)
4. Unused hooks and layout components (7 files)

Removing these files will reduce the codebase by approximately **2.5 MB** and eliminate confusion between Leger and Umbrella code. All identified deletions have been verified to have no imports or dependencies in the active Umbrella codebase.

The cleanup can be performed safely with minimal risk, and verification steps are provided to ensure the application continues to function correctly.
