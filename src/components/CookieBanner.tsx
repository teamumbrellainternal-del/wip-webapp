import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { X } from 'lucide-react'

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user has already accepted cookies
    const cookieConsent = localStorage.getItem('cookie_consent')
    if (!cookieConsent) {
      setIsVisible(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted')
    setIsVisible(false)
  }

  const handleDismiss = () => {
    // Also set consent when dismissing (by continuing to use the site, they consent)
    localStorage.setItem('cookie_consent', 'accepted')
    setIsVisible(false)
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-5">
      <Card className="max-w-4xl mx-auto shadow-lg">
        <div className="p-4 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 text-2xl">🍪</div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-base md:text-lg">
                    We use cookies to enhance your experience
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    By continuing to visit this site you agree to our use of cookies. We use
                    essential cookies for authentication and site functionality, plus analytics
                    cookies to improve our service.
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <Button onClick={handleAccept} size="sm">
                      Accept All Cookies
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link to="/legal/cookies">Learn More</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="flex-shrink-0"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Dismiss</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
