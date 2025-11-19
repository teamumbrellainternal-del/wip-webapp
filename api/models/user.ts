/**
 * User data models
 * OAuth-linked user accounts (Apple/Google only)
 */

/**
 * User record stored in D1
 */
export interface User {
  id: string
  clerk_id?: string // Clerk user ID (added in migration 0007)
  oauth_provider: 'apple' | 'google'
  oauth_id: string
  email: string
  onboarding_complete: number // 0 or 1 in SQLite
  created_at: string
  updated_at: string
}

/**
 * User creation input (from OAuth callback)
 */
export interface CreateUserInput {
  oauth_provider: 'apple' | 'google'
  oauth_id: string
  email: string
}

/**
 * User update input
 */
export interface UpdateUserInput {
  email?: string
  onboarding_complete?: boolean
}

/**
 * User public profile (safe to return to clients)
 */
export interface UserProfile {
  id: string
  email: string
  onboarding_complete: boolean
  created_at: string
}

/**
 * Helper functions
 */

/**
 * Check if user has completed onboarding
 */
export function hasCompletedOnboarding(user: User): boolean {
  return user.onboarding_complete === true
}

/**
 * Generate composite OAuth key for uniqueness
 */
export function generateOAuthKey(provider: 'apple' | 'google', oauthId: string): string {
  return `${provider}:${oauthId}`
}

/**
 * Sanitize user for public consumption (exclude sensitive fields)
 */
export function sanitizeUser(user: User): UserProfile {
  return {
    id: user.id,
    email: user.email,
    onboarding_complete: user.onboarding_complete,
    created_at: user.created_at,
  }
}
