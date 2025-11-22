import { RouterProvider } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import { HelmetProvider } from 'react-helmet-async'
import { ThemeProvider } from './components/theme-provider'
import { Toaster } from './components/ui/toaster'
import { ErrorBoundary } from './components/ErrorBoundary'
import { AuthProvider } from './contexts/AuthContext'
import { MockAuthProvider } from './contexts/MockAuthContext'
import { SessionTimeoutProvider } from './contexts/SessionTimeoutContext'
import { CookieBanner } from './components/CookieBanner'
import { OfflineBanner } from './components/OfflineBanner'
import { router } from './routes'

// Check if demo mode is enabled
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true'

// Import Clerk publishable key from environment
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

// In demo mode, Clerk key is optional
if (!DEMO_MODE && !CLERK_PUBLISHABLE_KEY) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY environment variable')
}

export default function App() {
  // Render demo mode (no Clerk authentication)
  if (DEMO_MODE) {
    return (
      <ErrorBoundary>
        <HelmetProvider>
          <ThemeProvider defaultTheme="light" storageKey="umbrella-theme">
            <MockAuthProvider>
              <div className="border-b border-yellow-200 bg-yellow-50 px-4 py-2 text-center text-sm text-yellow-800">
                🎭 Demo Mode - Logged in as demo user
              </div>
              <OfflineBanner />
              <RouterProvider router={router} />
              <Toaster />
              <CookieBanner />
            </MockAuthProvider>
          </ThemeProvider>
        </HelmetProvider>
      </ErrorBoundary>
    )
  }

  // Render production mode (with Clerk authentication)
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY!}>
          <ThemeProvider defaultTheme="light" storageKey="umbrella-theme">
            <SessionTimeoutProvider>
              <AuthProvider>
                <OfflineBanner />
                <RouterProvider router={router} />
                <Toaster />
                <CookieBanner />
              </AuthProvider>
            </SessionTimeoutProvider>
          </ThemeProvider>
        </ClerkProvider>
      </HelmetProvider>
    </ErrorBoundary>
  )
}
