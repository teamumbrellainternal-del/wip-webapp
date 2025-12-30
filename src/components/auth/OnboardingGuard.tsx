import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface OnboardingGuardProps {
  children: ReactNode
}

/**
 * OnboardingGuard ensures users have completed onboarding before accessing protected routes
 * Per D-006: Incomplete OAuth users redirected to Step 1 on return
 *
 * Role-based routing (RBAC Phase 5):
 * - No role selected → /onboarding/role-selection
 * - Venue role, incomplete → /venue/onboarding/step1
 * - Artist role, incomplete → /onboarding/artists/step1
 * - Onboarding complete → render children
 */
export default function OnboardingGuard({ children }: OnboardingGuardProps) {
  const { user } = useAuth()

  // This guard assumes user is already authenticated (use with ProtectedRoute)
  if (!user) {
    return null
  }

  // Check if onboarding is complete
  if (!user.onboarding_complete) {
    // Step 1: Check if user has selected a role
    if (!user.role) {
      return <Navigate to="/onboarding/role-selection" replace />
    }

    // Step 2: Route based on role
    if (user.role === 'venue') {
      // Venue users go to venue onboarding
      return <Navigate to="/venue/onboarding/step1" replace />
    }

    // Step 3: Artist role - continue to artist onboarding
    return <Navigate to="/onboarding/artists/step1" replace />
  }

  // User has completed onboarding, render children
  return <>{children}</>
}
