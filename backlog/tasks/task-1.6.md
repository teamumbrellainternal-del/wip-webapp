---
id: task-1.6
title: "Create Authentication React Hooks"
status: "Done"
assignee: []
created_date: "2025-11-15"
completed_date: "2025-11-16"
labels: ["frontend", "P0", "auth", "hooks"]
milestone: "M1 - Authentication & Session Management"
dependencies: []
estimated_hours: 2
actual_hours: 1.5
---

## Description
Use Clerk's built-in React hooks (`useUser`, `useAuth`) for managing authentication state across the application. Optionally create a custom wrapper hook to maintain consistency with existing code patterns.

## Acceptance Criteria

### Option 1: Use Clerk Hooks Directly (Recommended)
- [ ] Import and use Clerk's `useUser()` hook for user data
- [ ] Import and use Clerk's `useAuth()` hook for auth methods
- [ ] Use `useClerk()` hook for additional Clerk methods
- [ ] Update existing components to use Clerk hooks
- [ ] Remove custom auth context if no longer needed
- [ ] Exports TypeScript types from Clerk SDK

### Option 2: Custom Wrapper Hook (For Consistency)
- [ ] Create useAuth() wrapper hook in src/hooks/use-auth.ts
- [ ] Wraps Clerk's `useUser()` and `useAuth()` hooks
- [ ] Provides consistent interface: { user, loading, isAuthenticated, logout }
- [ ] Maintains compatibility with existing code
- [ ] Exports TypeScript types for auth state

## Implementation Plan

### Option 1: Direct Clerk Hooks Usage

**Example Component:**
```tsx
import { useUser, useAuth } from '@clerk/nextjs'
// OR
import { useUser, useAuth } from '@clerk/remix'

function MyComponent() {
  const { user, isLoaded, isSignedIn } = useUser()
  const { signOut } = useAuth()

  if (!isLoaded) {
    return <div>Loading...</div>
  }

  if (!isSignedIn) {
    return <div>Please sign in</div>
  }

  return (
    <div>
      <p>Hello, {user.firstName}</p>
      <button onClick={() => signOut()}>Logout</button>
    </div>
  )
}
```

### Option 2: Custom Wrapper Hook

**File:** `src/hooks/use-auth.ts`

```typescript
import { useUser, useAuth as useClerkAuth } from '@clerk/nextjs'
// OR
import { useUser, useAuth as useClerkAuth } from '@clerk/remix'

export function useAuth() {
  const { user, isLoaded, isSignedIn } = useUser()
  const { signOut } = useClerkAuth()

  return {
    user: isSignedIn ? user : null,
    loading: !isLoaded,
    isAuthenticated: isSignedIn,
    logout: signOut,
  }
}

// TypeScript types
export interface UseAuthReturn {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  logout: () => Promise<void>
}
```

**Usage:**
```tsx
import { useAuth } from '@/hooks/use-auth'

function Dashboard() {
  const { user, loading, isAuthenticated, logout } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!isAuthenticated) return <Navigate to="/login" />

  return (
    <div>
      <h1>Welcome, {user.firstName}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

### Clerk Hooks Reference

**`useUser()` - User Data**
```typescript
const { user, isLoaded, isSignedIn } = useUser()

// user properties:
user.id                    // Clerk user ID
user.firstName
user.lastName
user.emailAddresses        // Array of email addresses
user.primaryEmailAddress   // Primary email
user.imageUrl             // Profile image
```

**`useAuth()` - Auth Methods**
```typescript
const { signOut, sessionId, userId } = useAuth()

signOut()                  // Logout user
sessionId                  // Current session ID
userId                     // Current user ID
```

**`useClerk()` - Clerk Instance**
```typescript
const clerk = useClerk()

clerk.openSignIn()         // Open sign-in modal
clerk.openUserProfile()    // Open user profile modal
clerk.signOut()           // Logout
```

## Notes & Comments
**References:**
- Clerk React hooks documentation
- `@clerk/nextjs` or `@clerk/remix` SDK
- src/hooks/use-auth.ts (if creating wrapper)

**Priority:** P0 - Required by all protected pages
**File:** src/hooks/use-auth.ts (optional)
**Can Run Parallel With:** Backend auth tasks

**CLERK MIGRATION CHANGES:**
- ❌ **Removed:** Custom useAuth hook with checkSession()
- ❌ **Removed:** Custom logout() API call
- ❌ **Removed:** Manual session management in React context
- ❌ **Removed:** GET /v1/auth/session call on mount
- ✅ **Added:** Clerk's `useUser()` hook
- ✅ **Added:** Clerk's `useAuth()` hook
- ✅ **Simplified:** No custom session state management

**Recommendation:**
Start with **Option 1 (Direct Clerk Hooks)** for simplicity. Create the wrapper hook (Option 2) only if:
- You have many existing components using a custom useAuth interface
- You want to maintain a consistent API across your codebase
- You plan to add custom logic beyond Clerk's hooks

**Migration Path:**
1. Install Clerk SDK: `npm install @clerk/nextjs` or `@clerk/remix`
2. Add `<ClerkProvider>` to app root
3. Replace custom useAuth calls with Clerk hooks
4. Remove custom AuthContext if no longer needed
5. Update components to use Clerk hooks

**What Clerk Hooks Provide:**
- Real-time user data (no manual fetching needed)
- Automatic re-authentication on token expiry
- Built-in loading states
- Session management handled automatically
- TypeScript types included

---

## Implementation Summary (Completed 2025-11-16)

### What Was Implemented

✅ **Option 2: Custom Wrapper Hook** - Implemented in `src/hooks/use-auth.ts`

**Files Created/Modified:**
1. **`src/hooks/use-auth.ts`** - Updated to wrap Clerk's `useUser()` and `useAuth()` hooks
   - Provides clean interface: `{ user, loading, isAuthenticated, logout, sessionId }`
   - Full TypeScript types with JSDoc documentation
   - Exports `UseAuthReturn` interface for type safety

2. **`docs/authentication-hooks.md`** - Comprehensive developer guide
   - Usage examples for both `useAuth` hook and `AuthContext`
   - Migration guide from old OAuth implementation
   - Best practices and troubleshooting

**Existing Infrastructure:**
- ✅ `@clerk/clerk-react` already installed (v5.54.0)
- ✅ `ClerkProvider` already configured in `App.tsx`
- ✅ `AuthContext` already exists and uses Clerk hooks internally
- ✅ Components (`ProtectedRoute`, `OnboardingGuard`, `DashboardPage`) use AuthContext

### Architecture Decision

The implementation provides **two complementary approaches**:

1. **`useAuth` hook** (`src/hooks/use-auth.ts`)
   - For components needing only Clerk user data
   - Lightweight wrapper around Clerk hooks
   - Direct access to Clerk's UserResource

2. **`AuthContext`** (`src/contexts/AuthContext.tsx`)
   - For components needing backend user data
   - Fetches user profile from `/v1/auth/session`
   - Provides `onboarding_complete` status
   - Already used by existing components

### Interface

```typescript
// Simple hook
const { user, loading, isAuthenticated, logout, sessionId } = useAuth()

// Available user properties (from Clerk)
user.id                          // Clerk user ID
user.firstName                   // First name
user.lastName                    // Last name
user.fullName                    // Full name
user.primaryEmailAddress         // Email object
user.imageUrl                    // Profile image
```

### Benefits

- ✅ Maintains consistency with existing AuthContext pattern
- ✅ Provides flexibility for different use cases
- ✅ Fully typed with TypeScript
- ✅ Comprehensive documentation
- ✅ Backward compatible (legacy types marked as deprecated)
- ✅ No breaking changes to existing components

### Testing Notes

- Existing components (`ProtectedRoute`, `OnboardingGuard`, `DashboardPage`) continue to use AuthContext
- New components can choose between simple `useAuth` hook or full `AuthContext`
- TypeScript types properly resolved from `@clerk/clerk-react`

### Documentation

See `docs/authentication-hooks.md` for:
- Complete usage guide
- Code examples
- Migration path
- Best practices
- Troubleshooting
