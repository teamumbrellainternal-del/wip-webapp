/**
 * Auth Error Page
 * Displays authentication error messages with appropriate actions
 */

import { useSearchParams, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function AuthErrorPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const error = searchParams.get('error') || 'unknown';

  const getErrorMessage = () => {
    switch (error) {
      case 'session_expired':
        return {
          title: 'Session Expired',
          description: 'Your session has expired. Please authenticate again.',
        };
      case 'invalid_token':
        return {
          title: 'Invalid Token',
          description: 'Authentication failed. The token is invalid or expired.',
        };
      case 'network_error':
        return {
          title: 'Connection Error',
          description: 'Could not connect to authentication server. Please check your network connection.',
        };
      default:
        return {
          title: 'Authentication Failed',
          description: 'Authentication failed. Please try again.',
        };
    }
  };

  const errorInfo = getErrorMessage();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
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
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{errorInfo.title}</AlertTitle>
          <AlertDescription>{errorInfo.description}</AlertDescription>
        </Alert>

        <div className="space-y-4">
          <Button
            onClick={() => navigate('/auth')}
            className="w-full"
          >
            Try Again
          </Button>

          <div className="p-4 bg-muted rounded-lg text-sm">
            <p className="text-muted-foreground mb-2">
              To authenticate, run this command in your terminal:
            </p>
            <code className="block p-2 bg-background rounded text-xs font-mono">
              leger auth web
            </code>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Need help?{' '}
              <a
                href="https://docs.leger.run/troubleshooting/authentication"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                View troubleshooting guide
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
