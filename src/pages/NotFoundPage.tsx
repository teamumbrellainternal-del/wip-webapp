import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-slate-50 p-4 dark:from-slate-950 dark:to-purple-950">
      <div className="w-full max-w-2xl space-y-8 text-center">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-purple-600">
            <span className="text-2xl font-bold text-white">U</span>
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-purple-600 dark:text-purple-400">404</h1>
          <h2 className="text-3xl font-bold tracking-tight">Page Not Found</h2>
          <p className="text-lg text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Navigation Options */}
        <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
          <Button onClick={() => navigate('/dashboard')} size="lg" className="w-full sm:w-auto">
            Go to Dashboard
          </Button>
          <Button
            onClick={() => navigate('/marketplace/gigs')}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            Browse Gigs
          </Button>
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  )
}
