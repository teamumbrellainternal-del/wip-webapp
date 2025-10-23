/**
 * Auth Page
 * JWT validation landing page
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { setSession } from '@/lib/session';

export function AuthPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validateToken = async () => {
      const token = searchParams.get('token');
      const errorParam = searchParams.get('error');

      // If error parameter exists, redirect to error page
      if (errorParam) {
        navigate(`/auth-error?error=${errorParam}`);
        return;
      }

      if (!token) {
        setError('No authentication token provided');
        return;
      }

      try {
        const response = await apiClient.validateAuth(token);

        // Store JWT and user data atomically
        setSession(response.token, response.user);

        // Navigate to default page
        navigate('/api-keys');
      } catch (error) {
        console.error('Authentication failed:', error);
        // Check if it's a network error
        if (error instanceof TypeError) {
          navigate('/auth-error?error=network_error');
        } else {
          navigate('/auth-error?error=invalid_token');
        }
      }
    };

    validateToken();
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <img
            src="/brand/assets/logotype/light/leger-logo-light.svg"
            alt="Leger"
            className="h-16 mx-auto mb-8 dark:hidden"
          />
          <img
            src="/brand/assets/logotype/dark/leger-logo-dark.svg"
            alt="Leger"
            className="h-16 mx-auto mb-8 hidden dark:block"
          />

          <h1 className="text-2xl font-bold text-foreground mb-4">
            Authentication Error
          </h1>
          <p className="text-muted-foreground">{error}</p>

          <div className="mt-8 p-4 bg-muted rounded-lg text-left">
            <p className="text-sm text-muted-foreground">
              To authenticate, run this command in your terminal:
            </p>
            <code className="block mt-2 p-2 bg-background rounded text-xs font-mono">
              leger auth web
            </code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <img
          src="/brand/assets/logotype/light/leger-logo-light.svg"
          alt="Leger"
          className="h-16 mx-auto mb-8 dark:hidden"
        />
        <img
          src="/brand/assets/logotype/dark/leger-logo-dark.svg"
          alt="Leger"
          className="h-16 mx-auto mb-8 hidden dark:block"
        />

        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="mt-4 text-muted-foreground">Validating authentication...</p>
      </div>
    </div>
  );
}
