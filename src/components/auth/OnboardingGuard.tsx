/**
 * OnboardingGuard - Onboarding Completion Guard
 * Ensures users have completed onboarding before accessing main app routes
 * Per D-006: Incomplete OAuth users redirected to Step 1 on return
 *
 * Features:
 * - Shows loading state while checking onboarding status
 * - Redirects to /onboarding/role-selection if no role selected
 * - Redirects to /onboarding/artists/step1 if onboarding incomplete (D-006)
 * - Allows users with completed onboarding to access route
 */

import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface OnboardingGuardProps {
  children: ReactNode
}

export default function OnboardingGuard({ children }: OnboardingGuardProps) {
  const { user, isOnboardingComplete, loading } = useAuth()

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  // This guard assumes user is already authenticated (use with ProtectedRoute)
  if (!user) {
    return null
  }

  // Check if onboarding is complete
  if (!isOnboardingComplete) {
    // If no role selected, redirect to role selection
    if (!user.role) {
      return <Navigate to="/onboarding/role-selection" replace />
    }

    // D-006: Redirect incomplete users to step 1
    return <Navigate to="/onboarding/artists/step1" replace />
  }

  // User has completed onboarding, render children
  return <>{children}</>
}
