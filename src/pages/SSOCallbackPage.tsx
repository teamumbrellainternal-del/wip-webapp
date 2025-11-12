import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClerk } from '@clerk/clerk-react'
import { Loader2 } from 'lucide-react'

/**
 * SSO Callback Page
 * Handles the OAuth redirect after successful authentication
 */
export default function SSOCallbackPage() {
  const navigate = useNavigate()
  const { handleRedirectCallback } = useClerk()

  useEffect(() => {
    async function handleCallback() {
      try {
        // Complete the OAuth flow
        await handleRedirectCallback()

        // The AuthContext will automatically fetch user data
        // and redirect based on onboarding status
        // For now, just redirect to dashboard and let the router handle it
        navigate('/dashboard')
      } catch (error) {
        console.error('SSO callback error:', error)
        navigate('/auth?error=callback_failed')
      }
    }

    handleCallback()
  }, [handleRedirectCallback, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-slate-50 dark:from-slate-950 dark:to-purple-950">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-purple-600" />
        <h2 className="text-xl font-semibold">Completing sign-in...</h2>
        <p className="text-muted-foreground">Please wait while we set up your account</p>
      </div>
    </div>
  )
}
