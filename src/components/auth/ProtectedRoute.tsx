/**
 * ProtectedRoute - Authentication Guard
 * Ensures users are authenticated before accessing protected routes
 *
 * Features:
 * - Shows loading state while checking authentication
 * - Redirects to /auth if not authenticated
 * - Allows authenticated users to access route
 */

import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth()

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  // Redirect to auth page if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />
  }

  // Render children if authenticated
  return <>{children}</>
}
