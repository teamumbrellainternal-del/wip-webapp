/**
 * Test Auth Page
 * Auto-login with test user for development/testing
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { setSession } from '@/lib/session';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function TestAuthPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loginTest = async () => {
      try {
        const response = await apiClient.loginTest();

        // Store JWT and user data atomically
        setSession(response.token, response.user);

        // Navigate to default page
        navigate('/api-keys');
      } catch (error) {
        console.error('Test authentication failed:', error);
        setError(
          error instanceof Error ? error.message : 'Test authentication failed'
        );
      }
    };

    loginTest();
  }, [navigate]);

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

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Test Authentication Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>

          <div className="mt-8 p-4 bg-muted rounded-lg text-left">
            <p className="text-sm text-muted-foreground">
              This endpoint is for development/testing only. Make sure the test
              API endpoints are enabled.
            </p>
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
        <p className="mt-4 text-muted-foreground">
          Logging in as test user...
        </p>
      </div>
    </div>
  );
}
