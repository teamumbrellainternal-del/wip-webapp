/**
 * Onboarding redirect utilities
 * Determines where to redirect users based on their onboarding state
 */

import type { Env } from '../middleware/auth'

/**
 * Check onboarding state and return appropriate redirect path
 * @param clerkUserId - Clerk user ID
 * @param env - Worker environment
 * @returns Redirect path for user
 */
export async function getOnboardingRedirectPath(
  clerkUserId: string,
  env: Env
): Promise<string> {
  try {
    // Fetch user from D1
    const user = await env.DB.prepare(
      'SELECT id, onboarding_complete FROM users WHERE clerk_id = ?'
    )
      .bind(clerkUserId)
      .first<{ id: string; onboarding_complete: number }>()

    if (!user) {
      // New user - redirect to role selection
      return '/onboarding/role-selection'
    }

    // Check if artist profile exists
    const artist = await env.DB.prepare(
      'SELECT onboarding_complete FROM artists WHERE user_id = ?'
    )
      .bind(user.id)
      .first<{ onboarding_complete: number }>()

    if (!artist) {
      // No artist profile yet - redirect to role selection
      return '/onboarding/role-selection'
    }

    if (!artist.onboarding_complete) {
      // Incomplete onboarding - redirect to step 1
      return '/onboarding/artists/step1'
    }

    // Ready to use platform - redirect to dashboard
    return '/dashboard'
  } catch (error) {
    console.error('Error checking onboarding state:', error)
    // On error, default to role selection (safest option)
    return '/onboarding/role-selection'
  }
}

/**
 * Check if user has completed onboarding
 * @param userId - Internal user ID
 * @param env - Worker environment
 * @returns true if onboarding complete, false otherwise
 */
export async function isOnboardingComplete(
  userId: string,
  env: Env
): Promise<boolean> {
  try {
    const user = await env.DB.prepare(
      'SELECT id FROM users WHERE id = ?'
    )
      .bind(userId)
      .first<{ id: string }>()

    if (!user) {
      return false
    }

    // Check if artist profile exists and is complete
    const artist = await env.DB.prepare(
      'SELECT onboarding_complete FROM artists WHERE user_id = ?'
    )
      .bind(userId)
      .first<{ onboarding_complete: number }>()

    if (!artist) {
      return false
    }

    return Boolean(artist.onboarding_complete)
  } catch (error) {
    console.error('Error checking onboarding completion:', error)
    return false
  }
}
