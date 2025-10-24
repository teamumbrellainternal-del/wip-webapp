/**
 * OAuth Callback Page
 * Handles OAuth redirect from Cloudflare Access
 *
 * Flow:
 * 1. Extract JWT from Cloudflare Access callback
 * 2. Decode and validate JWT
 * 3. Fetch user profile from API
 * 4. Save to AuthContext
 * 5. Redirect based on onboarding status (D-006)
 */

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { profileService } from '@/services/api'
import { extractJWT, decodeJWT } from '@/utils/auth'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function CallbackPage() {
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function handleCallback() {
      try {
        // 1. Extract JWT from Cloudflare Access callback
        const jwt = extractJWT()

        // 2. Decode and validate JWT
        const payload = decodeJWT(jwt)

        // Check if token is expired
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          throw new Error('Authentication token has expired')
        }

        // 3. Fetch user profile from API
        const profile = await profileService.getCurrent()

        // 4. Save to auth context
        setUser(profile, jwt)

        // 5. Redirect based on onboarding status (D-006)
        if (!profile.onboarding_completed) {
          // If no role selected, go to role selection
          if (!profile.role) {
            navigate('/onboarding/role-selection')
          } else {
            // D-006: Incomplete users redirect to Step 1
            navigate('/onboarding/artists/step1')
          }
        } else {
          // Onboarding complete, go to dashboard
          navigate('/dashboard')
        }
      } catch (err) {
        console.error('Auth callback error:', err)
        setError(err instanceof Error ? err.message : 'Authentication failed')

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/auth?error=auth_failed')
        }, 3000)
      }
    }

    handleCallback()
  }, [navigate, setUser])

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <AlertDescription>
              {error}. Redirecting to login page...
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Signing you in...</p>
      </div>
    </div>
  )
}
