import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useUser, useClerk, useSession } from '@clerk/clerk-react'
import { logger } from '@/utils/logger'
import { apiClient } from '@/lib/api-client'

interface User {
  id: string
  email: string
  name: string
  onboarding_complete: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signInWithApple: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  clerkUser: any // Clerk user object
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser()
  const { session } = useSession()
  const { signOut: clerkSignOut, openSignIn } = useClerk()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Provide Clerk token getter to API Client
    if (session) {
      apiClient.setTokenGetter(() => session.getToken())
    }
  }, [session])

  // Force session refresh on mount to ensure token is valid
  useEffect(() => {
    const refreshSession = async () => {
      if (session) {
        try {
          await session.getToken({ skipCache: true })
        } catch (error) {
          console.error('Failed to refresh session token', error)
        }
      }
    }
    refreshSession()
  }, [session])

  useEffect(() => {
    if (!clerkLoaded) {
      setIsLoading(true)
      return
    }

    // If user is not signed in to Clerk, reset state and stop loading
    if (!clerkUser) {
      setUser(null)
      setIsLoading(false)
      return
    }

    // Prevent double-fetch if we already have the correct user loaded
    if (
      user &&
      user.email === clerkUser.primaryEmailAddress?.emailAddress &&
      user.name === (clerkUser.fullName || clerkUser.primaryEmailAddress?.emailAddress)
    ) {
      setIsLoading(false)
      return
    }

    // Fetch user from backend
    fetchUserProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clerkUser, clerkLoaded]) // Removed 'user' from deps to prevent loop

  const fetchUserProfile = async () => {
    // Generate ID for this sync attempt
    const requestId = crypto.randomUUID()

    try {
      logger.info('Starting user profile fetch', { requestId, clerkId: clerkUser?.id })

      const token = await session?.getToken()
      if (!token) {
        logger.warn('No session token available', { requestId })
        setUser(null)
        setIsLoading(false)
        return
      }

      logger.debug('Sending session check request', { requestId })
      const response = await fetch('/v1/auth/session', {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Request-ID': requestId,
        },
      })

      if (response.ok) {
        const json = await response.json()
        const data = json.data
        logger.info('User profile fetched successfully', { requestId, userId: data?.user?.id })

        if (data?.user) {
          setUser({
            id: data.user.id,
            email: data.user.email,
            name: clerkUser?.fullName || clerkUser?.primaryEmailAddress?.emailAddress || '',
            onboarding_complete: data.user.onboarding_complete,
          })
        } else {
          logger.error('Invalid response format: missing user data', { requestId, data: json })
          setUser(null)
        }
      } else {
        // User exists in Clerk but not in our DB yet - webhook might be processing
        logger.warn('User not found in database', {
          requestId,
          status: response.status,
          statusText: response.statusText,
        })
        setUser(null)
      }
    } catch (error) {
      logger.error('Failed to fetch user profile', {
        requestId,
        error: error instanceof Error ? error.message : String(error),
      })
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const signInWithApple = async () => {
    openSignIn({
      redirectUrl: '/dashboard',
      appearance: {
        elements: {
          rootBox: 'w-full',
        },
      },
    })
  }

  const signInWithGoogle = async () => {
    openSignIn({
      redirectUrl: '/onboarding/role-selection',
      appearance: {
        elements: {
          rootBox: 'w-full',
        },
      },
    })
  }

  const signOut = async () => {
    await clerkSignOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, signInWithApple, signInWithGoogle, signOut, clerkUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider or MockAuthProvider')
  }
  return context
}
