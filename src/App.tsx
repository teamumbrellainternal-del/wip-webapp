import { RouterProvider } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import { ThemeProvider } from './components/theme-provider'
import { Toaster } from './components/ui/toaster'
import { ErrorBoundary } from './components/ErrorBoundary'
import { AuthProvider } from './contexts/AuthContext'
import { router } from './routes'

// Import Clerk publishable key from environment
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY environment variable')
}

export default function App() {
  return (
    <ErrorBoundary>
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
        <ThemeProvider defaultTheme="light" storageKey="umbrella-theme">
          <AuthProvider>
            <RouterProvider router={router} />
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </ClerkProvider>
    </ErrorBoundary>
  )
}
