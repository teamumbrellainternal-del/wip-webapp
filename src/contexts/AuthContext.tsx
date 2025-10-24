/**
 * AuthContext - Authentication State Management
 * Handles JWT tokens from Cloudflare Access and user profile data
 *
 * Features:
 * - Store user profile and JWT token
 * - Persist auth state to localStorage
 * - Restore auth state on page reload
 * - Provide authentication helpers
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { UserProfile } from '@/types'
import { isTokenExpired } from '@/utils/auth'

interface AuthContextType {
  user: UserProfile | null
  token: string | null
  isAuthenticated: boolean
  isOnboardingComplete: boolean
  setUser: (user: UserProfile, token: string) => void
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserProfile | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Restore auth state on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('umbrella_user')
    const savedToken = localStorage.getItem('umbrella_token')

    if (savedUser && savedToken) {
      // Check if token is expired
      if (!isTokenExpired(savedToken)) {
        setUserState(JSON.parse(savedUser))
        setToken(savedToken)
      } else {
        // Token expired, clear storage
        localStorage.removeItem('umbrella_user')
        localStorage.removeItem('umbrella_token')
      }
    }

    setLoading(false)
  }, [])

  const setUser = (newUser: UserProfile, newToken: string) => {
    setUserState(newUser)
    setToken(newToken)
    localStorage.setItem('umbrella_user', JSON.stringify(newUser))
    localStorage.setItem('umbrella_token', newToken)
  }

  const logout = () => {
    setUserState(null)
    setToken(null)
    localStorage.removeItem('umbrella_user')
    localStorage.removeItem('umbrella_token')
    window.location.href = '/auth'
  }

  const value = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isOnboardingComplete: user?.onboarding_completed ?? false,
    setUser,
    logout,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
