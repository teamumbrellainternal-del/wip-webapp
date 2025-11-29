# CLAUDE.md - Leger v0.1.0 Architecture Refinements

**Document Type:** Implementation Refinement for Claude Code Agent  
**Target:** GitHub Actions Automated Implementation  
**Status:** Phase 2 - Critical Fixes  
**Version:** 2.0

---

## Executive Summary

The base v0.1.0 implementation has been committed to main, including:
- ✅ API client skeleton (`src/lib/api-client.ts`)
- ✅ Custom hooks (`src/hooks/`)
- ✅ Page components (`src/pages/`)
- ✅ Layout components (`src/components/layout/`)
- ✅ Router configuration (`src/App.tsx`)
- ✅ Basic TypeScript types (`src/types/`)

**This document addresses critical architectural issues that must be fixed before the implementation is production-ready.**

---

## Critical Fixes Required

### 1. Fix Tailwind Configuration Path ⚠️ BREAKING

**File:** `tailwind.config.cjs`

**Issue:** Import changed from `.cjs` to `.js` extension, breaking the build.

**Fix Required:**
```javascript
// Change line 1 from:
const brandPreset = require('./brand/dist/tailwind.preset.js')

// Back to:
const brandPreset = require('./brand/dist/tailwind.preset.cjs')
```

**Verification:** Run `npm run build` - should complete without errors.

---

### 2. Complete Type Definitions

**File:** `src/types/index.ts`

**Issue:** Type definitions are incomplete. Need to mirror the backend API models exactly.

**Fix Required:**

Reference the existing backend models in `api/models/*.ts` and create matching frontend types. The types should be:

**From `api/models/user.ts`:**
- Copy `UserProfile` interface exactly as it appears in the backend
- This is what the `/api/auth/validate` endpoint returns

**From `api/models/secret.ts`:**
- Copy `SecretMetadata` interface (for web UI listing)
- Copy `SecretWithValue` interface (for CLI sync, not used in web UI)

**From `api/models/release.ts`:**
- Copy `ReleaseRecord` interface (what API returns)
- Create `CreateReleaseInput` interface (what POST /api/releases expects)
- Create `UpdateReleaseInput` interface (what PUT /api/releases/:id expects)

**Additional Types Needed:**

Add API response wrapper types:
```typescript
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    action?: string;
    docs?: string;
  };
}
```

Add Session type:
```typescript
export interface Session {
  jwt: string;
  user: UserProfile;
  expiresAt: string;
}
```

**Verification:** Run `npm run typecheck` - no errors related to missing types.

---

### 3. Fix JWT Storage Race Condition 🔴 CRITICAL

**File:** `src/hooks/use-auth.ts` and anywhere JWT is stored

**Issue:** Current implementation uses separate localStorage keys for JWT and user, creating race conditions and inconsistent state.

**Fix Required:**

Replace all instances of:
```typescript
localStorage.setItem('jwt', token);
localStorage.setItem('user', JSON.stringify(userData));
```

With atomic session management:
```typescript
const session: Session = {
  jwt: token,
  user: userData,
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
};
localStorage.setItem('session', JSON.stringify(session));
```

Create a session utility module at `src/lib/session.ts`:

**Functions needed:**
1. `getSession(): Session | null` - Safely reads and validates session, returns null if expired or invalid
2. `setSession(jwt: string, user: UserProfile): void` - Atomically stores session
3. `clearSession(): void` - Removes session
4. `isSessionValid(): boolean` - Checks if session exists and not expired

**Where to update:**
- `src/hooks/use-auth.ts` - Use session utilities instead of direct localStorage
- `src/lib/api-client.ts` - Get JWT from session, not directly from localStorage
- `src/pages/AuthPage.tsx` - Call `setSession()` on successful auth
- `src/App.tsx` - ProtectedRoute should use `isSessionValid()`

**Verification:** 
- Auth flow works end-to-end
- Page refresh maintains authentication
- Expired sessions redirect correctly

---

### 4. Complete API Client Error Handling 🔴 CRITICAL

**File:** `src/lib/api-client.ts`

**Issue:** Error handling is incomplete - doesn't handle network errors, non-JSON responses, or have proper retry logic.

**Fix Required:**

The `request()` method needs:

1. **Network error handling:**
   - Catch `TypeError` (network failures)
   - Show appropriate toast: "Network error - Please check your connection"

2. **Response parsing safety:**
   - Try/catch around `response.json()`
   - Handle case where response is not JSON
   - Show toast: "Invalid response from server"

3. **401 handling (already specified but ensure complete):**
   - Call `clearSession()` from session utilities
   - Redirect to `/auth?error=session_expired`
   - Do NOT show toast for 401 (redirect is feedback enough)

4. **All other errors:**
   - Extract error message from response body
   - Show toast with `error.message` and optional `error.action`
   - Throw error to allow caller to handle if needed

**Pattern:**
```typescript
private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    // Make request
    const response = await fetch(...);
    
    // Handle 401 specially (don't toast, just redirect)
    if (response.status === 401) {
      clearSession();
      window.location.href = '/auth?error=session_expired';
      throw new Error('Unauthorized');
    }
    
    // Try to parse JSON
    let data;
    try {
      data = await response.json();
    } catch {
      toast.error('Invalid response from server');
      throw new Error('Invalid JSON response');
    }
    
    // Handle API errors
    if (!data.success) {
      toast.error(data.error.message, {
        description: data.error.action,
      });
      throw new Error(data.error.message);
    }
    
    return data.data;
    
  } catch (error) {
    // Network errors
    if (error instanceof TypeError) {
      toast.error('Network error', {
        description: 'Please check your connection',
      });
    }
    throw error;
  }
}
```

**Verification:**
- Test with network offline - shows appropriate error
- Test with 401 response - redirects without toast
- Test with invalid JSON - shows appropriate error
- Test with API error - shows error message from backend

---

### 5. Define Auth Error Route

**File:** `src/App.tsx` and create `src/pages/AuthErrorPage.tsx`

**Issue:** AuthPage redirects to `/auth-error` but this route doesn't exist.

**Fix Required:**

Create `src/pages/AuthErrorPage.tsx`:

**Component should:**
1. Extract `error` query param from URL
2. Display error-specific message based on query param:
   - `session_expired` → "Your session has expired. Please authenticate again."
   - `invalid_token` → "Authentication failed. The token is invalid or expired."
   - `network_error` → "Could not connect to authentication server."
   - Default → "Authentication failed. Please try again."
3. Show a "Try Again" button that navigates to `/auth`
4. Show contact support link for persistent issues

**Add route in `src/App.tsx`:**
```typescript
<Route path="/auth-error" element={<AuthErrorPage />} />
```

**Update AuthPage.tsx:**
- On validation failure, navigate to `/auth-error?error=invalid_token`
- On network failure, navigate to `/auth-error?error=network_error`

**Verification:**
- Visit `/auth-error?error=session_expired` - shows appropriate message
- "Try Again" button navigates back to `/auth`

---

### 6. Add Loading States to Hook Mutations 🔴 CRITICAL

**Files:** `src/hooks/use-secrets.ts` and `src/hooks/use-releases.ts`

**Issue:** Mutation operations (create, update, delete) don't expose loading states.

**Fix Required:**

Both hooks need additional state:
```typescript
const [isSaving, setIsSaving] = useState(false);
const [isDeleting, setIsDeleting] = useState(false);
```

**Pattern for all mutation operations:**
```typescript
const upsertSecret = async (name: string, value: string) => {
  setIsSaving(true);
  try {
    await apiClient.upsertSecret(name, value);
    toast.success('Secret saved');
    await refetch();
  } catch (error) {
    // Error already toasted by apiClient
  } finally {
    setIsSaving(false);
  }
};

const deleteSecret = async (name: string) => {
  setIsDeleting(true);
  try {
    await apiClient.deleteSecret(name);
    toast.success('Secret deleted');
    await refetch();
  } catch (error) {
    // Error already toasted by apiClient
  } finally {
    setIsDeleting(false);
  }
};
```

**Return values must include:**
```typescript
return { 
  secrets, 
  isLoading,
  isSaving,
  isDeleting,
  upsertSecret, 
  deleteSecret, 
  refetch 
};
```

**Same pattern for use-releases.ts** with appropriate state variables.

**Verification:**
- Buttons show loading spinners during mutations
- Multiple rapid clicks don't cause race conditions
- Loading states reset properly after success/failure

---

### 7. Add Complete Form Validation 🔴 CRITICAL

**File:** `src/pages/ReleaseFormPage.tsx`

**Issue:** Document mentions "real-time validation" but provides no validation rules.

**Fix Required:**

Create validation function within the component:

```typescript
const validateField = (field: string, value: string): string | null => {
  switch (field) {
    case 'name':
      if (!value) return 'Name is required';
      if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
        return 'Name must contain only letters, numbers, underscores, and hyphens';
      }
      if (value.length > 64) return 'Name must be 64 characters or less';
      return null;
    
    case 'git_url':
      if (!value) return 'Git URL is required';
      try {
        const url = new URL(value);
        if (!['http:', 'https:'].includes(url.protocol)) {
          return 'URL must use http or https';
        }
        // Validate it looks like a git repo URL
        if (!url.hostname.includes('github.com') && 
            !url.hostname.includes('gitlab.com') &&
            !url.pathname.endsWith('.git')) {
          return 'URL should be a valid git repository';
        }
      } catch {
        return 'Invalid URL format';
      }
      return null;
    
    case 'git_branch':
      if (!value) return null; // Optional, defaults to 'main'
      if (!/^[a-zA-Z0-9/_-]+$/.test(value)) {
        return 'Invalid branch name';
      }
      if (value.length > 255) return 'Branch name too long';
      return null;
    
    case 'description':
      // Optional field, no validation needed
      return null;
    
    default:
      return null;
  }
};
```

**Wire up to form fields:**
```typescript
const handleFieldChange = (field: keyof typeof form, value: string) => {
  setForm(prev => ({ ...prev, [field]: value }));
  const error = validateField(field, value);
  setErrors(prev => ({ ...prev, [field]: error }));
  setIsDirty(true);
};
```

**Validate all fields before save:**
```typescript
const validateAllFields = (): boolean => {
  const newErrors: Record<string, string | null> = {
    name: validateField('name', form.name),
    git_url: validateField('git_url', form.git_url),
    git_branch: validateField('git_branch', form.git_branch),
    description: validateField('description', form.description),
  };
  
  setErrors(newErrors);
  
  // Return true if no errors
  return !Object.values(newErrors).some(error => error !== null);
};

const handleSave = async () => {
  if (!validateAllFields()) {
    toast.error('Please fix validation errors');
    return;
  }
  
  // Proceed with save...
};
```

**Verification:**
- Empty name shows error
- Invalid URL shows error
- Special characters in name show error
- Valid form allows save
- Errors show in real-time as user types

---

### 8. Standardize API Keys Provider Display

**File:** `src/pages/ApiKeysPage.tsx`

**Issue:** Document shows hardcoded providers (OpenAI, Anthropic) as CategorySections, but "Custom API Endpoints" uses a table. Inconsistent pattern.

**Fix Required:**

**Decision:** Use CategorySection pattern for ALL providers, including custom ones.

Remove the separate "Custom API Endpoints" table. Instead:

1. Create a `providers.config.ts` file with provider definitions:

```typescript
export interface Provider {
  id: string;
  name: string;
  description: string;
  fields: {
    key: string;
    label: string;
    type: 'secret' | 'text';
    required: boolean;
    description?: string;
  }[];
  docLink?: string;
}

export const PROVIDERS: Provider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'Configure OpenAI API access for GPT models',
    fields: [
      {
        key: 'openai_api_key',
        label: 'API Key',
        type: 'secret',
        required: true,
        description: 'Your OpenAI API key (sk-...)'
      },
      {
        key: 'openai_org_id',
        label: 'Organization ID',
        type: 'text',
        required: false,
        description: 'Optional: Your OpenAI organization ID'
      }
    ],
    docLink: 'https://platform.openai.com/docs'
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Configure Anthropic API access for Claude models',
    fields: [
      {
        key: 'anthropic_api_key',
        label: 'API Key',
        type: 'secret',
        required: true,
        description: 'Your Anthropic API key (sk-ant-...)'
      }
    ],
    docLink: 'https://docs.anthropic.com'
  },
  // Add more providers as needed
];
```

2. Render each provider as a CategorySection:

```typescript
{PROVIDERS.map(provider => (
  <CategorySection
    key={provider.id}
    title={provider.name}
    description={provider.description}
    isDirty={dirtyStates[provider.id]}
    onSave={() => saveProvider(provider.id)}
    documentationLink={provider.docLink ? {
      text: `${provider.name} API Documentation`,
      href: provider.docLink
    } : undefined}
  >
    <FieldGroup>
      {provider.fields.map(field => (
        field.type === 'secret' ? (
          <SecretField
            key={field.key}
            label={field.label}
            description={field.description}
            value={secrets[field.key] || ''}
            onChange={v => handleFieldChange(provider.id, field.key, v)}
            error={errors[field.key]}
          />
        ) : (
          <TextField
            key={field.key}
            label={field.label}
            description={field.description}
            value={secrets[field.key] || ''}
            onChange={v => handleFieldChange(provider.id, field.key, v)}
            optional={!field.required}
          />
        )
      ))}
    </FieldGroup>
  </CategorySection>
))}
```

This makes adding new providers trivial - just add to the config array.

**Verification:**
- All providers display consistently
- Adding a new provider to config immediately shows in UI
- Each provider has independent save functionality

---

### 9. Add Error Boundary 🔴 CRITICAL

**File:** `src/App.tsx`

**Issue:** No error boundary exists. If any component throws during render, entire app crashes with white screen.

**Fix Required:**

Create error boundary class component at top of `src/App.tsx`:

```typescript
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App error boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Something went wrong</CardTitle>
              <CardDescription>
                The application encountered an unexpected error
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertTitle>Error Details</AlertTitle>
                <AlertDescription className="font-mono text-xs mt-2">
                  {this.state.error?.message || 'Unknown error'}
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Reload Page
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
```

Wrap the entire app in ErrorBoundary:

```typescript
export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Toaster />
        <Routes>
          {/* routes */}
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
```

**Verification:**
- Force an error in a component - shows error boundary UI
- Reload button works
- Console shows error details for debugging

---

### 10. Clarify Two-Row Header Structure

**File:** `src/components/layout/AppLayout.tsx`

**Issue:** Document says "two-row header" but doesn't specify HTML structure or scroll behavior.

**Fix Required:**

**Structure:**
- Single `<header>` element containing two `<div>` rows
- Row 1: Global context (logo, links, theme, avatar)
- Row 2: Primary navigation (API Keys, Releases, Models, Marketplace, Settings)

**Scroll behavior:**
- Row 1: Scrolls away normally
- Row 2: `sticky top-0` - stays at top when scrolling

**HTML pattern:**
```typescript
<header className="border-b">
  {/* Row 1: Global Context (scrolls away) */}
  <div className="border-b px-4 py-3 flex items-center justify-between">
    <div className="flex items-center gap-4">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2">
        <img src="/brand/assets/icon/dark/leger-icon-dark.svg" className="h-6 w-6" />
        <span className="font-semibold">Leger</span>
      </Link>
    </div>
    
    <div className="flex items-center gap-4">
      {/* GitHub Star */}
      <Button variant="outline" size="sm" asChild>
        <a href="https://github.com/leger-labs/leger" target="_blank">
          <Star className="h-4 w-4 mr-2" />
          Star
        </a>
      </Button>
      
      {/* Changelog */}
      <Button variant="ghost" size="sm" asChild>
        <a href="https://www.leger.run/changelog" target="_blank">
          Changelog
        </a>
      </Button>
      
      {/* Docs */}
      <Button variant="ghost" size="sm" asChild>
        <a href="https://docs.leger.run" target="_blank">
          Docs
        </a>
      </Button>
      
      {/* Theme Toggle */}
      <ThemeToggle />
      
      {/* Avatar with Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Avatar>
              <AvatarFallback>
                {user?.email?.[0].toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{user?.email}</p>
              <p className="text-xs text-muted-foreground">{user?.tailnet}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>
  
  {/* Row 2: Primary Navigation (sticky) */}
  <div className="sticky top-0 bg-background z-10 px-4 py-2 border-b">
    <nav className="flex items-center gap-6">
      <NavLink to="/api-keys">API Keys</NavLink>
      <NavLink to="/releases">Releases</NavLink>
      <NavLink to="/models" disabled>
        Models
        <Badge variant="secondary" className="ml-2 text-xs">Soon</Badge>
      </NavLink>
      <NavLink to="/marketplace" disabled>
        Marketplace
        <Badge variant="secondary" className="ml-2 text-xs">Soon</Badge>
      </NavLink>
      <NavLink to="/settings">Settings</NavLink>
    </nav>
  </div>
</header>
```

**NavLink component pattern:**
```typescript
function NavLink({ to, disabled, children }: { 
  to: string; 
  disabled?: boolean; 
  children: React.ReactNode 
}) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  if (disabled) {
    return (
      <span className="text-muted-foreground cursor-not-allowed flex items-center">
        {children}
      </span>
    );
  }
  
  return (
    <Link
      to={to}
      className={cn(
        "text-sm font-medium transition-colors hover:text-primary",
        isActive 
          ? "text-foreground border-b-2 border-primary pb-2" 
          : "text-muted-foreground"
      )}
    >
      {children}
    </Link>
  );
}
```

**Verification:**
- Scroll page - Row 1 scrolls away, Row 2 stays at top
- Active page shows underline in Row 2
- Disabled links (Models, Marketplace) show "Soon" badge
- Avatar dropdown works

---

### 11. Standardize Domain Usage

**Files:** All files containing URLs

**Issue:** Mix of `leger.run` and `app.leger.run` throughout codebase.

**Fix Required:**

**Decision:** Use `app.leger.run` for the application everywhere.

Search and replace:
- `https://leger.run` → `https://app.leger.run`
- Keep external links to marketing site as `https://www.leger.run`
- Keep docs as `https://docs.leger.run`

**Specific locations to check:**
- `api/index.ts` - health check messages
- `src/lib/api-client.ts` - any hardcoded URLs
- All toast messages mentioning URLs
- README files
- Comments

**Verification:**
- Search codebase for `leger.run` - only external references remain
- All internal references use `app.leger.run`

---

### 12. Implement Minimal Loading States

**Files:** All pages

**Issue:** No guidance on initial page load states.

**Fix Required:**

**Decision:** Use minimal, low-effort approach:

**Pattern for all list pages (ReleasesPage, ApiKeysPage):**
```typescript
if (isLoading) {
  return (
    <PageLayout>
      <PageHeader title="Page Title" description="Loading..." />
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    </PageLayout>
  );
}
```

**Pattern for form pages (ReleaseFormPage, SettingsPage):**
- If loading existing data: Show skeleton CategorySections
- Use same spinner approach as list pages

**AppLayout does NOT need global loading** - let individual pages handle their own loading.

**Verification:**
- Fast network: loading state barely visible (good!)
- Slow network (throttled): shows spinner

---

### 13. Add Breadcrumbs to Detail Pages

**Files:** `src/pages/ReleaseFormPage.tsx`, `src/pages/SettingsPage.tsx`

**Issue:** Navigation context missing on detail pages.

**Fix Required:**

Create breadcrumb component at `src/components/ui/breadcrumb.tsx`:

```typescript
export function Breadcrumb({ children }: { children: React.ReactNode }) {
  return (
    <nav className="flex items-center space-x-2 text-sm mb-6">
      {children}
    </nav>
  );
}

export function BreadcrumbItem({ children, current }: { 
  children: React.ReactNode; 
  current?: boolean 
}) {
  return (
    <span className={cn(
      current ? "text-foreground font-medium" : "text-muted-foreground"
    )}>
      {children}
    </span>
  );
}

export function BreadcrumbSeparator() {
  return <ChevronRight className="h-4 w-4 text-muted-foreground" />;
}
```

**Add to ReleaseFormPage:**
```typescript
<PageLayout>
  <Breadcrumb>
    <BreadcrumbItem>
      <Link to="/releases">Releases</Link>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem current>
      {isNew ? 'Create Release' : release?.name || 'Edit Release'}
    </BreadcrumbItem>
  </Breadcrumb>
  
  <PageHeader title={...} />
  {/* rest of page */}
</PageLayout>
```

**Add to SettingsPage:**
```typescript
<PageLayout>
  <Breadcrumb>
    <BreadcrumbItem>
      <Link to="/">Home</Link>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem current>Settings</BreadcrumbItem>
  </Breadcrumb>
  
  <PageHeader title="Settings" />
  {/* rest of page */}
</PageLayout>
```

**Verification:**
- Breadcrumbs show on detail pages
- Links work correctly
- Current page not clickable

---

## Deferred Items (Not in Scope)

The following items are explicitly **out of scope** for this phase:

1. ❌ Copy button component - Use inline copy functionality where needed
2. ❌ Confirmation dialogs for destructive actions - Add in future phase
3. ❌ Shared utility components beyond breadcrumbs - Add as needed later
4. ❌ Mobile responsive behavior refinements - Basic responsiveness OK for v0.1.0
5. ❌ Unit tests - Add in testing phase

---

## Verification Checklist

Before considering these fixes complete, verify:

### Build & Type Safety
- [ ] `npm run typecheck` - no errors
- [ ] `npm run build` - completes successfully
- [ ] `npm run lint` - no new errors (existing warnings OK)

### Critical Functionality
- [ ] JWT storage uses atomic session object
- [ ] Session expiry properly detected
- [ ] 401 responses redirect without toast
- [ ] Network errors show appropriate toast
- [ ] All form fields validate in real-time
- [ ] Mutation loading states work correctly
- [ ] Error boundary catches render errors

### User Experience
- [ ] Two-row header with sticky navigation works
- [ ] Breadcrumbs appear on detail pages
- [ ] All providers use CategorySection pattern
- [ ] Loading states show on slow connections
- [ ] Auth error page handles all error types

### Security
- [ ] JWT never logged to console
- [ ] Session validation prevents race conditions
- [ ] Expired sessions handled gracefully

---

## Success Criteria

**Phase 2 is complete when:**

1. ✅ Tailwind config imports correct file
2. ✅ All types mirror backend models exactly
3. ✅ JWT storage is atomic and race-condition-free
4. ✅ API client handles all error scenarios
5. ✅ Auth error route exists and works
6. ✅ All mutations expose loading states
7. ✅ Form validation works in real-time
8. ✅ All providers use consistent pattern
9. ✅ Error boundary catches all render errors
10. ✅ Header structure is clear and functional
11. ✅ All URLs use correct domain
12. ✅ Loading states work on all pages
13. ✅ Breadcrumbs show on detail pages

**And most importantly:**
- ✅ Application is production-ready for v0.1.0 release
- ✅ No critical architectural issues remain
- ✅ Code quality meets professional standards

---

## Notes for Implementation

**This is a refinement pass, not a rewrite.** 

The existing implementation is good. These fixes address:
- Type safety gaps
- Race conditions
- Error handling completeness  
- User experience consistency
- Code organization improvements

**Implementation approach:**
1. Start with critical fixes (marked 🔴)
2. Then fix breaking issues (marked ⚠️)
3. Then complete remaining fixes
4. Run verification checklist
5. Deploy to production

**Estimated effort:** 4-6 hours of focused work.

---

## Reference Documentation

**Backend API Specification:** `docs/v0.1.0-scope.md`  
**Backend Models:** `api/models/*.ts` (authoritative type definitions)  
**Component Catalogue:** `src/components/ui/` directory  
**Previous Implementation:** Git history (already committed)

---

**Version:** 2.0 - Architecture Refinements  
**Date:** October 2025  
**Status:** Ready for Implementation
