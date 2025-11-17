/**
 * ErrorState Component
 * Reusable error display for failed API requests
 *
 * @see docs/ERROR_MESSAGES.md for error message style guide
 */

import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { handleApiError, getErrorMessage } from '@/utils/errors'
import type { ErrorMessage } from '@/lib/error-messages'

interface ErrorStateProps {
  error: Error | string | ErrorMessage
  retry?: () => void
  fullScreen?: boolean
  title?: string
}

export default function ErrorState({
  error,
  retry,
  fullScreen = false,
  title,
}: ErrorStateProps) {
  // Handle different error types
  let errorTitle: string
  let errorMessage: string
  let errorAction: string | undefined

  if (typeof error === 'string') {
    errorTitle = title || 'Something went wrong'
    errorMessage = error
  } else if ('title' in error && 'message' in error) {
    // ErrorMessage object
    errorTitle = title || error.title
    errorMessage = error.message
    errorAction = error.action
  } else {
    // Error object
    const errMsg = getErrorMessage(error)
    errorTitle = title || errMsg.title
    errorMessage = errMsg.message
    errorAction = errMsg.action
  }

  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50'
    : 'flex items-center justify-center py-12'

  return (
    <div className={containerClasses}>
      <div className="text-center max-w-md px-4">
        <div className="text-destructive text-5xl mb-4" aria-hidden="true">
          ⚠️
        </div>
        <h3 className="text-lg font-semibold mb-2">{errorTitle}</h3>
        <p className="text-muted-foreground mb-2">{errorMessage}</p>
        {errorAction && (
          <p className="text-sm text-muted-foreground mb-6">{errorAction}</p>
        )}
        {retry && (
          <Button onClick={retry} variant="default" className="mt-4">
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
export function InlineError({ error, title }: { error: Error | string | ErrorMessage; title?: string }) {
  let errorTitle: string
  let errorMessage: string

  if (typeof error === 'string') {
    errorTitle = title || 'Error'
    errorMessage = error
  } else if ('title' in error && 'message' in error) {
    errorTitle = title || error.title
    errorMessage = `${error.message}. ${error.action}`
  } else {
    errorTitle = title || 'Error'
    errorMessage = handleApiError(error)
  }

  return (
    <Alert variant="destructive" className="my-4">
      <AlertTitle>{errorTitle}</AlertTitle>
      <AlertDescription>{errorMessage}</AlertDescription>
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
  error: Error | string | ErrorMessage
  retry?: () => void
}) {
  let message: string

  if (typeof error === 'string') {
    message = error
  } else if ('title' in error && 'message' in error) {
    message = `${error.message}. ${error.action}`
  } else {
    message = handleApiError(error)
  }

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
