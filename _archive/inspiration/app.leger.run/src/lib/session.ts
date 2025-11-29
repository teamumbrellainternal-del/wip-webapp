/**
 * Session management utilities
 * Provides atomic JWT and user data storage to prevent race conditions
 */

import type { Session, UserProfile } from '../types';

const SESSION_KEY = 'session';
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * Safely reads and validates session from localStorage
 * Returns null if session is expired or invalid
 */
export function getSession(): Session | null {
  try {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    if (!sessionStr) return null;

    const session: Session = JSON.parse(sessionStr);

    // Validate session structure
    if (!session.jwt || !session.user || !session.expiresAt) {
      console.warn('Invalid session structure, clearing session');
      clearSession();
      return null;
    }

    // Check if expired
    const expiresAt = new Date(session.expiresAt);
    if (expiresAt < new Date()) {
      console.warn('Session expired, clearing session');
      clearSession();
      return null;
    }

    return session;
  } catch (error) {
    console.error('Failed to parse session:', error);
    clearSession();
    return null;
  }
}

/**
 * Atomically stores session with JWT and user data
 */
export function setSession(jwt: string, user: UserProfile): void {
  const session: Session = {
    jwt,
    user,
    expiresAt: new Date(Date.now() + SESSION_DURATION_MS).toISOString(),
  };

  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('Failed to store session:', error);
    throw new Error('Failed to store session');
  }
}

/**
 * Removes session from localStorage
 */
export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

/**
 * Checks if a valid session exists (not expired)
 */
export function isSessionValid(): boolean {
  return getSession() !== null;
}

/**
 * Checks if current session is using the test user
 */
export function isTestMode(): boolean {
  const session = getSession();
  if (!session) return false;

  // Check if user email matches test user
  return session.user.email === 'test@leger.test';
}
