import { ReactNode } from 'react'

/**
 * Mock Protected Route for Demo Mode
 * Always renders children without authentication checks
 */
export default function MockProtectedRoute({ children }: { children: ReactNode }) {
  // In demo mode, always allow access
  return <>{children}</>
}
