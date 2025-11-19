import { ReactNode } from 'react'
import { AuthContext } from './AuthContext'

interface User {
  id: string
  email: string
  name: string
  onboarding_complete: boolean
}

/**
 * Mock Authentication Provider for Demo Mode
 * Provides a simulated logged-in user without requiring Clerk authentication
 * Use this when VITE_DEMO_MODE=true to showcase the application
 *
 * This provider uses the same AuthContext as the real AuthProvider,
 * so all existing components using useAuth() will work seamlessly
 */
export function MockAuthProvider({ children }: { children: ReactNode }) {
  // Demo user data
  const mockUser: User = {
    id: 'demo-user-123',
    email: 'demo@umbrella-app.com',
    name: 'Demo User',
    onboarding_complete: true, // Set to true to bypass onboarding
  }

  // Mock Clerk user object
  const mockClerkUser = {
    id: 'demo-user-123',
    fullName: 'Demo User',
    primaryEmailAddress: {
      emailAddress: 'demo@umbrella-app.com',
    },
    imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo',
  }

  const signInWithApple = async () => {
    console.log('Demo Mode: Sign in with Apple (no-op)')
  }

  const signInWithGoogle = async () => {
    console.log('Demo Mode: Sign in with Google (no-op)')
  }

  const signOut = async () => {
    console.log('Demo Mode: Sign out (no-op)')
  }

  return (
    <AuthContext.Provider
      value={{
        user: mockUser,
        isLoading: false,
        signInWithApple,
        signInWithGoogle,
        signOut,
        clerkUser: mockClerkUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
