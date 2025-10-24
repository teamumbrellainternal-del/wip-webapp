/**
 * ErrorState Component
 * Reusable error display for failed API requests
 */

import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { handleApiError } from '@/utils/errors'

interface ErrorStateProps {
  error: Error | string
  retry?: () => void
  fullScreen?: boolean
  title?: string
}

export default function ErrorState({
  error,
  retry,
  fullScreen = false,
  title = 'Something went wrong',
}: ErrorStateProps) {
  const message = typeof error === 'string' ? error : handleApiError(error)

  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50'
    : 'flex items-center justify-center py-12'

  return (
    <div className={containerClasses}>
      <div className="text-center max-w-md px-4">
        <div className="text-destructive text-5xl mb-4" aria-hidden="true">
          ⚠️
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6">{message}</p>
        {retry && (
          <Button onClick={retry} variant="default">
            Try Again
          </Button>
        )}
      </div>
    </div>
  )
}

/**
 * Inline error message for forms and small spaces
 */
export function InlineError({ error }: { error: Error | string }) {
  const message = typeof error === 'string' ? error : handleApiError(error)

  return (
    <Alert variant="destructive" className="my-4">
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}

/**
 * Compact error message for cards and list items
 */
export function ErrorMessage({
  error,
  retry,
}: {
  error: Error | string
  retry?: () => void
}) {
  const message = typeof error === 'string' ? error : handleApiError(error)

  return (
    <div className="flex items-center justify-between p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
      <div className="flex items-start gap-3 flex-1">
        <span className="text-destructive text-xl" aria-hidden="true">
          ⚠️
        </span>
        <p className="text-sm text-destructive">{message}</p>
      </div>
      {retry && (
        <Button onClick={retry} variant="outline" size="sm">
          Retry
        </Button>
      )}
    </div>
  )
}

/**
 * Empty state component for when data is successfully loaded but empty
 */
export function EmptyState({
  title = 'No data found',
  description,
  action,
  icon = '📭',
}: {
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  icon?: string
}) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center max-w-md px-4">
        <div className="text-5xl mb-4" aria-hidden="true">
          {icon}
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        {description && (
          <p className="text-muted-foreground mb-6">{description}</p>
        )}
        {action && (
          <Button onClick={action.onClick} variant="default">
            {action.label}
          </Button>
        )}
      </div>
    </div>
  )
}
