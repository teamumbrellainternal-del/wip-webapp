import { useEffect } from 'react'
import { useClerk } from '@clerk/clerk-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

interface SessionTimeoutModalProps {
  isOpen: boolean
}

/**
 * SessionTimeoutModal
 * Shows when Clerk session has expired (401 from API)
 * - Cannot be dismissed (no close button)
 * - Saves current URL and form data to localStorage before redirect
 * - Forces user to log in again
 */
export function SessionTimeoutModal({ isOpen }: SessionTimeoutModalProps) {
  const { redirectToSignIn } = useClerk()

  useEffect(() => {
    if (isOpen) {
      // Save current location for post-login redirect
      localStorage.setItem('umbrella_pre_timeout_url', window.location.pathname + window.location.search)

      // Save timestamp for cleanup of stale data
      localStorage.setItem('umbrella_timeout_timestamp', Date.now().toString())

      // Attempt to save any form data (best effort)
      saveFormData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const saveFormData = () => {
    try {
      // Find all form inputs and save their values
      const forms = document.querySelectorAll('form')
      const formData: Record<string, any> = {}

      forms.forEach((form, formIndex) => {
        const inputs = form.querySelectorAll('input, textarea, select')
        const formValues: Record<string, any> = {}

        inputs.forEach((input) => {
          if (input instanceof HTMLInputElement ||
              input instanceof HTMLTextAreaElement ||
              input instanceof HTMLSelectElement) {
            const name = input.name || input.id
            if (name && input.value) {
              // Skip password fields for security
              if (input.type === 'password') return
              // Skip file inputs (can't serialize)
              if (input.type === 'file') return

              formValues[name] = input.value
            }
          }
        })

        if (Object.keys(formValues).length > 0) {
          formData[`form_${formIndex}`] = formValues
        }
      })

      if (Object.keys(formData).length > 0) {
        const key = `unsaved:${window.location.pathname}:${Date.now()}`
        localStorage.setItem(key, JSON.stringify(formData))

        // Clean up old unsaved data (older than 1 hour)
        cleanupStaleFormData()
      }
    } catch (error) {
      console.warn('Failed to save form data:', error)
    }
  }

  const cleanupStaleFormData = () => {
    try {
      const oneHourAgo = Date.now() - (60 * 60 * 1000)

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('unsaved:')) {
          const timestamp = parseInt(key.split(':')[2], 10)
          if (timestamp < oneHourAgo) {
            localStorage.removeItem(key)
          }
        }
      }
    } catch (error) {
      console.warn('Failed to cleanup stale form data:', error)
    }
  }

  const handleLogin = () => {
    // Redirect to Clerk sign-in
    // After sign-in, user will be redirected back via returnUrl or we can check localStorage
    redirectToSignIn({
      redirectUrl: window.location.href
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        hideCloseButton
      >
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-500" />
            </div>
          </div>
          <DialogTitle className="text-center">Session Expired</DialogTitle>
          <DialogDescription className="text-center">
            Your session has expired for security. Please log in again to continue.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="sm:justify-center">
          <Button onClick={handleLogin} className="w-full sm:w-auto">
            Log In
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
