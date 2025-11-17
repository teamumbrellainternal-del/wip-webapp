import { useEffect, useState } from 'react'
import { WifiOff, X } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

/**
 * OfflineBanner
 * Displays a fixed banner when the user loses internet connection
 * - Listens to online/offline events
 * - Shows at top of page when offline
 * - Automatically hides when connection is restored
 * - Can be manually dismissed (but reappears if still offline)
 */
export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false)
      setIsDismissed(false)
    }

    const handleOffline = () => {
      setIsOffline(true)
      setIsDismissed(false)
    }

    // Check initial state
    setIsOffline(!navigator.onLine)

    // Listen for online/offline events
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!isOffline || isDismissed) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-in slide-in-from-top duration-300">
      <Alert className="rounded-none border-x-0 border-t-0 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
        <div className="container mx-auto flex items-center justify-between gap-4 py-2">
          <div className="flex items-center gap-3">
            <WifiOff className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
            <AlertDescription className="text-yellow-900 dark:text-yellow-100 font-medium m-0">
              You're offline. Some features may not work.
            </AlertDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-yellow-900 dark:text-yellow-100 hover:bg-yellow-100 dark:hover:bg-yellow-900/40"
            onClick={() => setIsDismissed(true)}
            aria-label="Dismiss offline banner"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Alert>
    </div>
  )
}
