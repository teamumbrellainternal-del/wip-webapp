/**
 * Authentication hook for Umbrella
 * Manages user session state using Cloudflare Access OAuth
 */

import { useState, useEffect } from 'react';

export interface User {
  id: string;
  oauth_provider: 'apple' | 'google';
  oauth_id: string;
  email: string;
  onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface Session {
  user: User;
  token: string;
  expires_at: string;
}

function getSession(): Session | null {
  try {
    const sessionData = localStorage.getItem('umbrella_session');
    if (!sessionData) return null;

    const session = JSON.parse(sessionData) as Session;

    // Check if session is expired
    if (new Date(session.expires_at) < new Date()) {
      localStorage.removeItem('umbrella_session');
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

function clearSession(): void {
  localStorage.removeItem('umbrella_session');
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from session on mount
  useEffect(() => {
    const session = getSession();
    if (session) {
      setUser(session.user);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const logout = async () => {
    try {
      // Call logout endpoint
      const session = getSession();
      if (session) {
        await fetch('/v1/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearSession();
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = '/';
    }
  };

  const setSession = (session: Session) => {
    localStorage.setItem('umbrella_session', JSON.stringify(session));
    setUser(session.user);
    setIsAuthenticated(true);
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    logout,
    setSession,
    needsOnboarding: user && !user.onboarding_complete,
  };
}
