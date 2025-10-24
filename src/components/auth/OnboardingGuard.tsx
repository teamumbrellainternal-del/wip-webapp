import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface OnboardingGuardProps {
  children: ReactNode
}

/**
 * OnboardingGuard ensures users have completed onboarding before accessing protected routes
 * Per D-006: Incomplete OAuth users redirected to Step 1 on return
 */
export default function OnboardingGuard({ children }: OnboardingGuardProps) {
  const { user } = useAuth()

  // This guard assumes user is already authenticated (use with ProtectedRoute)
  if (!user) {
    return null
  }

  // Check if onboarding is complete
  if (!user.onboarding_complete) {
    // TODO: When user role field is added, check for role selection:
    // if (!user.role) return <Navigate to="/onboarding/role-selection" replace />

    // D-006: Redirect incomplete users to step 1
    // For now, redirect all incomplete users to step 1
    // In the future, this could check user.onboarding_step to redirect to the correct step
    return <Navigate to="/onboarding/artists/step1" replace />
  }

  // User has completed onboarding, render children
  return <>{children}</>
}
