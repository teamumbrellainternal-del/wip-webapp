import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

interface ServerErrorPageProps {
  error?: Error
  showDetails?: boolean
}

export default function ServerErrorPage({ error, showDetails = false }: ServerErrorPageProps) {
  const handleRefresh = () => {
    window.location.reload()
  }

  const handleContactSupport = () => {
    // Navigate to support - can be updated with actual support URL
    window.location.href = 'mailto:support@umbrella.com?subject=Error%20Report'
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-slate-50 p-4 dark:from-slate-950 dark:to-purple-950">
      <div className="w-full max-w-2xl space-y-8 text-center">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-purple-600">
            <span className="text-2xl font-bold text-white">U</span>
          </div>
        </div>

        {/* Error Icon */}
        <div className="flex justify-center">
          <AlertCircle className="h-24 w-24 text-red-500" />
        </div>

        {/* Error Message */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Something Went Wrong</h1>
          <p className="text-lg text-muted-foreground">
            We're aware of the issue and working on a fix. Please try again in a few minutes.
          </p>
        </div>

        {/* Error Details (Dev Mode) */}
        {showDetails && error && (
          <details className="rounded-lg border border-red-200 bg-red-50 p-4 text-left dark:border-red-800 dark:bg-red-950/20">
            <summary className="cursor-pointer font-medium text-red-900 dark:text-red-100">
              Error Details (Dev Mode)
            </summary>
            <pre className="mt-2 overflow-auto text-xs text-red-800 dark:text-red-200">
              {error.toString()}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
          <Button onClick={handleRefresh} size="lg" className="w-full sm:w-auto">
            Refresh Page
          </Button>
          <Button
            onClick={handleContactSupport}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  )
}
