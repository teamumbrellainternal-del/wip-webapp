import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useUser, useClerk, useSession } from '@clerk/clerk-react'

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
    if (!clerkLoaded) {
      setIsLoading(true)
      return
    }

    if (clerkUser) {
      // Fetch user from backend to get onboarding status
      fetchUserProfile()
    } else {
      setUser(null)
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clerkUser, clerkLoaded])

  const fetchUserProfile = async () => {
    try {
      const token = await session?.getToken()
      if (!token) {
        setUser(null)
        setIsLoading(false)
        return
      }

      const response = await fetch('/v1/auth/session', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUser({
          id: data.user.id,
          email: data.user.email,
          name: clerkUser?.fullName || clerkUser?.primaryEmailAddress?.emailAddress || '',
          onboarding_complete: data.user.onboarding_complete,
        })
      } else {
        // User exists in Clerk but not in our DB yet - webhook might be processing
        console.warn('User not found in database, waiting for webhook...')
        setUser(null)
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
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
    <AuthContext.Provider value={{ user, isLoading, signInWithApple, signInWithGoogle, signOut, clerkUser }}>
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
