import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SignIn, useAuth } from '@clerk/clerk-react'
import { MetaTags } from '../components/MetaTags'

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true'

export default function LoginPage() {
  const navigate = useNavigate()
  const { isSignedIn, isLoaded } = useAuth()

  useEffect(() => {
    if (DEMO_MODE) {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate])

  // Auto-redirect to dashboard if already authenticated
  useEffect(() => {
    if (DEMO_MODE) return

    if (isLoaded && isSignedIn) {
      navigate('/dashboard', { replace: true })
    }
  }, [isLoaded, isSignedIn, navigate])

  if (DEMO_MODE) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-slate-50 dark:from-slate-950 dark:to-purple-950 p-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-600 mb-2">
            <span className="text-2xl font-bold text-white">U</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Demo Mode</h1>
          <p className="text-muted-foreground">
            You are already logged in as the demo user. Redirecting you to the dashboard...
          </p>
        </div>
      </div>
    )
  }

  // Show nothing while checking auth state
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-slate-50 dark:from-slate-950 dark:to-purple-950">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-600 mb-4 animate-pulse">
            <span className="text-2xl font-bold text-white">U</span>
          </div>
        </div>
      </div>
    )
  }

  // Don't render sign in if already signed in
  if (isSignedIn) {
    return null
  }

  return (
    <>
      <MetaTags
        title="Log In"
        description="Sign in to your Umbrella account to access your artist dashboard, manage gigs, and connect with opportunities."
        url="/auth"
        noIndex={true}
      />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-slate-50 dark:from-slate-950 dark:to-purple-950 p-4">
        <div className="w-full max-w-md space-y-8">
        {/* Logo & Title */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-600 mb-4">
            <span className="text-2xl font-bold text-white">U</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Umbrella</h1>
          <p className="text-muted-foreground mt-2">Your all-in-one platform for artists</p>
        </div>

        {/* Clerk Sign In Component */}
        <SignIn
          appearance={{
            elements: {
              rootBox: 'mx-auto w-full',
              card: 'shadow-2xl rounded-xl border-0',
              headerTitle: 'text-2xl font-bold',
              headerSubtitle: 'text-muted-foreground',
              socialButtonsBlockButton: 'bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 border-2 transition-all duration-200',
              socialButtonsBlockButtonText: 'font-medium',
              formButtonPrimary: 'bg-purple-600 hover:bg-purple-700 text-white',
              footerActionLink: 'text-purple-600 hover:text-purple-700',
              identityPreviewText: 'text-sm',
              formFieldLabel: 'font-medium',
              formFieldInput: 'rounded-lg',
              dividerLine: 'bg-gray-200 dark:bg-gray-700',
              dividerText: 'text-gray-500 dark:text-gray-400',
            },
            layout: {
              socialButtonsPlacement: 'top',
              socialButtonsVariant: 'blockButton',
            },
          }}
          signUpUrl="/auth"
          redirectUrl="/onboarding/role-selection"
          routing="path"
          path="/auth"
        />

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
        </div>
      </div>
    </>
  )
}
