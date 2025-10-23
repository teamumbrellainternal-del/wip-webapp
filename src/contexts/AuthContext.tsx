import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { MockAuthService, User } from '@/lib/mock-auth'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signInWithApple: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    const session = MockAuthService.getSession()
    setUser(session)
    setIsLoading(false)
  }, [])

  const signInWithApple = async () => {
    setIsLoading(true)
    try {
      const user = await MockAuthService.signInWithApple()
      setUser(user)
    } finally {
      setIsLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    setIsLoading(true)
    try {
      const user = await MockAuthService.signInWithGoogle()
      setUser(user)
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = () => {
    MockAuthService.clearSession()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signInWithApple, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
