/**
 * Authentication hook
 * Manages user session state using atomic session storage
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession, clearSession } from '@/lib/session';
import type { UserProfile } from '@/types';

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Load user from session on mount
  useEffect(() => {
    const session = getSession();
    if (session) {
      setUser(session.user);
      setIsAuthenticated(true);
    }
  }, []);

  const logout = () => {
    clearSession();
    setUser(null);
    setIsAuthenticated(false);
    navigate('/auth?error=session_expired');
  };

  return {
    user,
    isAuthenticated,
    logout,
  };
}
