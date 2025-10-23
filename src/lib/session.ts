/**
 * Session management utilities
 * Handles local storage for user sessions
 */

export interface Session {
  token: string
  user: {
    id: string
    email: string
    onboarding_complete: boolean
  }
}

/**
 * Get current session from localStorage
 * @returns Session object or null if not found
 */
export function getSession(): Session | null {
  try {
    const sessionData = localStorage.getItem('umbrella_session')
    if (!sessionData) return null
    return JSON.parse(sessionData) as Session
  } catch {
    return null
  }
}

/**
 * Store session in localStorage
 * @param session - Session data to store
 */
export function setSession(session: Session): void {
  try {
    localStorage.setItem('umbrella_session', JSON.stringify(session))
  } catch (error) {
    console.error('Failed to save session:', error)
  }
}

/**
 * Clear session from localStorage
 */
export function clearSession(): void {
  localStorage.removeItem('umbrella_session')
}

/**
 * Check if user is authenticated
 * @returns true if valid session exists
 */
export function isAuthenticated(): boolean {
  const session = getSession()
  return session !== null && !!session.token
}

/**
 * Get auth token from session
 * @returns JWT token or null
 */
export function getAuthToken(): string | null {
  const session = getSession()
  return session?.token || null
}

/**
 * Checks if current session is using the test user
 * @returns true if test mode is active
 */
export function isTestMode(): boolean {
  const session = getSession()
  if (!session) return false

  // Check if user email matches test user
  return session.user.email === 'test@umbrella.test'
 * Check if app is in test mode
 * @returns true if in test mode
 */
export function isTestMode(): boolean {
  return false // TODO: Implement test mode detection
}
