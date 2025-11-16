/**
 * Authentication hook for Umbrella
 * Wraps Clerk's React hooks to provide a consistent interface
 *
 * This is a lightweight wrapper around Clerk's useUser() and useAuth() hooks.
 * For components that need backend user data (like onboarding_complete status),
 * use the AuthContext instead which fetches from /v1/auth/session.
 *
 * @see src/contexts/AuthContext.tsx - For full user profile with backend data
 */

import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react'
import type { UserResource } from '@clerk/clerk-react'

/**
 * Return type for the useAuth hook
 */
export interface UseAuthReturn {
  /** Current user object from Clerk (null if not authenticated) */
  user: UserResource | null
  /** True while user data is being loaded */
  loading: boolean
  /** True if user is authenticated */
  isAuthenticated: boolean
  /** Sign out the current user */
  logout: () => Promise<void>
  /** Clerk session ID */
  sessionId: string | null | undefined
}

/**
 * Authentication hook wrapping Clerk's functionality
 *
 * @example
 * ```tsx
 * import { useAuth } from '@/hooks/use-auth'
 *
 * function MyComponent() {
 *   const { user, loading, isAuthenticated, logout } = useAuth()
 *
 *   if (loading) return <div>Loading...</div>
 *   if (!isAuthenticated) return <Navigate to="/login" />
 *
 *   return (
 *     <div>
 *       <h1>Welcome, {user.firstName}!</h1>
 *       <button onClick={logout}>Logout</button>
 *     </div>
 *   )
 * }
 * ```
 */
export function useAuth(): UseAuthReturn {
  const { user, isLoaded, isSignedIn } = useUser()
  const { signOut, sessionId } = useClerkAuth()

  return {
    user: isSignedIn ? user : null,
    loading: !isLoaded,
    isAuthenticated: isSignedIn ?? false,
    logout: signOut,
    sessionId,
  }
}

/**
 * Legacy User interface (kept for backward compatibility)
 * @deprecated Use Clerk's UserResource type instead
 */
export interface User {
  id: string
  oauth_provider: 'apple' | 'google'
  oauth_id: string
  email: string
  onboarding_complete: boolean
  created_at: string
  updated_at: string
  tailnet?: string
}

/**
 * Legacy Session interface (kept for backward compatibility)
 * @deprecated Clerk manages sessions automatically
 */
export interface Session {
  user: User
  token: string
  expires_at: string
}
