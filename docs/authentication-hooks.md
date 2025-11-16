# Authentication Hooks - Developer Guide

This guide explains how to use authentication in the Umbrella application.

## Overview

Umbrella uses [Clerk](https://clerk.com/) for authentication. We provide two ways to access authentication state:

1. **`useAuth` hook** (`src/hooks/use-auth.ts`) - Lightweight wrapper around Clerk hooks
2. **`AuthContext`** (`src/contexts/AuthContext.tsx`) - Full context with backend integration

## When to Use Each

### Use `useAuth` Hook When:
- You only need basic Clerk user data (name, email, profile image)
- You want a simple, direct interface to Clerk
- Your component doesn't need backend-specific user data

### Use `AuthContext` When:
- You need user data from the backend API (e.g., `onboarding_complete` status)
- You need sign-in methods (`signInWithApple`, `signInWithGoogle`)
- You're working with existing components that use it

## Using the `useAuth` Hook

### Basic Usage

```tsx
import { useAuth } from '@/hooks/use-auth'

function MyComponent() {
  const { user, loading, isAuthenticated, logout } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return <div>Please sign in</div>
  }

  return (
    <div>
      <p>Hello, {user.firstName} {user.lastName}</p>
      <p>Email: {user.primaryEmailAddress?.emailAddress}</p>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

### Available Properties

```typescript
interface UseAuthReturn {
  user: UserResource | null           // Clerk user object
  loading: boolean                     // True while loading
  isAuthenticated: boolean             // True if signed in
  logout: () => Promise<void>          // Sign out function
  sessionId: string | null | undefined // Current session ID
}
```

### User Properties

The `user` object from Clerk provides:

```typescript
user.id                          // Clerk user ID
user.firstName                   // First name
user.lastName                    // Last name
user.fullName                    // Full name
user.emailAddresses              // Array of email addresses
user.primaryEmailAddress         // Primary email object
user.primaryEmailAddress.emailAddress  // Email string
user.imageUrl                    // Profile image URL
user.externalAccounts            // OAuth accounts (Apple, Google)
```

## Using AuthContext

### Basic Usage

```tsx
import { useAuth } from '@/contexts/AuthContext'

function DashboardComponent() {
  const { user, isLoading, signOut } = useAuth()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <div>Not authenticated</div>
  }

  return (
    <div>
      <p>Welcome, {user.name}</p>
      <p>Onboarding: {user.onboarding_complete ? 'Complete' : 'Incomplete'}</p>
      <button onClick={signOut}>Logout</button>
    </div>
  )
}
```

### Available Properties

```typescript
interface AuthContextType {
  user: User | null                          // Backend user object
  isLoading: boolean                         // True while loading
  signInWithApple: () => Promise<void>       // Apple sign-in
  signInWithGoogle: () => Promise<void>      // Google sign-in
  signOut: () => Promise<void>               // Sign out
  clerkUser: UserResource                    // Raw Clerk user
}

interface User {
  id: string                      // User ID
  email: string                   // Email address
  name: string                    // Full name
  onboarding_complete: boolean    // Onboarding status
}
```

## Direct Clerk Hooks

You can also use Clerk's hooks directly:

```tsx
import { useUser, useAuth as useClerkAuth, useClerk } from '@clerk/clerk-react'

function MyComponent() {
  const { user, isLoaded, isSignedIn } = useUser()
  const { signOut, sessionId } = useClerkAuth()
  const clerk = useClerk()

  // Direct access to Clerk functionality
  clerk.openSignIn()       // Open sign-in modal
  clerk.openUserProfile()  // Open profile modal
}
```

## Protected Routes

Use `ProtectedRoute` to require authentication:

```tsx
import ProtectedRoute from '@/components/auth/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/public" element={<PublicPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
```

## Onboarding Guard

Use `OnboardingGuard` to ensure users complete onboarding:

```tsx
import OnboardingGuard from '@/components/auth/OnboardingGuard'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <OnboardingGuard>
              <DashboardPage />
            </OnboardingGuard>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
```

## Getting Session Tokens

To make authenticated API calls:

```tsx
import { useSession } from '@clerk/clerk-react'

function MyComponent() {
  const { session } = useSession()

  const fetchData = async () => {
    const token = await session?.getToken()

    const response = await fetch('/v1/api/endpoint', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    const data = await response.json()
    return data
  }

  return <button onClick={fetchData}>Fetch Data</button>
}
```

## Migration Notes

### From Old OAuth Implementation

The old OAuth implementation used:
- ❌ Manual session management with localStorage
- ❌ Custom `/v1/auth/logout` endpoint calls
- ❌ Manual token expiry checks

The new Clerk implementation provides:
- ✅ Automatic session management
- ✅ Built-in token refresh
- ✅ Real-time authentication state
- ✅ Secure session handling

### Breaking Changes

The `useAuth` hook signature has changed:

**Old:**
```typescript
const { user, isAuthenticated, isLoading, logout, setSession, needsOnboarding } = useAuth()
```

**New:**
```typescript
// Option 1: Simple hook
const { user, loading, isAuthenticated, logout, sessionId } = useAuth()

// Option 2: AuthContext (for backend data)
const { user, isLoading, signOut, clerkUser } = useAuth() // from AuthContext
```

## Best Practices

1. **Use `useAuth` hook** for new components that only need Clerk data
2. **Use `AuthContext`** when you need backend user data
3. **Don't mix both** in the same component unless necessary
4. **Use `ProtectedRoute`** instead of manual auth checks
5. **Use `useSession`** to get tokens for API calls

## Troubleshooting

### "useAuth must be used within an AuthProvider"

Make sure your component is wrapped in `<AuthProvider>`:

```tsx
// In App.tsx
<ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
  <AuthProvider>
    <YourApp />
  </AuthProvider>
</ClerkProvider>
```

### User is null after sign-in

Wait for `loading` to be `false`:

```tsx
const { user, loading } = useAuth()

if (loading) return <Loading />
if (!user) return <SignIn />
```

### Types not working

Make sure TypeScript can find Clerk types:

```bash
npm install @clerk/clerk-react
```

The types are included with the package.

## Resources

- [Clerk React Documentation](https://clerk.com/docs/references/react/overview)
- [Clerk User Object Reference](https://clerk.com/docs/references/javascript/user/user)
- [Clerk Session Management](https://clerk.com/docs/references/javascript/session)
