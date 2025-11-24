/**
 * LoadingState Component
 * Reusable loading indicator for API requests
 */

interface LoadingStateProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  fullScreen?: boolean
}

export default function LoadingState({
  message = 'Loading...',
  size = 'md',
  fullScreen = false,
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'h-8 w-8 border-2',
    md: 'h-12 w-12 border-b-2',
    lg: 'h-16 w-16 border-b-3',
  }

  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50'
    : 'flex items-center justify-center py-12'

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div
          className={`animate-spin rounded-full ${sizeClasses[size]} mx-auto mb-4 border-primary`}
          role="status"
          aria-label="Loading"
        />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

/**
 * Inline loading spinner for buttons and small spaces
 */
export function LoadingSpinner({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
  }

  return (
    <div
      className={`animate-spin rounded-full ${sizeClasses[size]} border-primary border-t-transparent`}
      role="status"
      aria-label="Loading"
    />
  )
}

/**
 * Loading skeleton for content placeholders
 */
export function LoadingSkeleton({
  lines = 3,
  className = '',
}: {
  lines?: number
  className?: string
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 animate-pulse rounded bg-muted"
          style={{ width: `${100 - i * 10}%` }}
        />
      ))}
    </div>
  )
}

/**
 * Loading overlay for covering content while loading
 */
export function LoadingOverlay({
  message = 'Loading...',
  visible = true,
}: {
  message?: string
  visible?: boolean
}) {
  if (!visible) return null

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm">
      <div className="text-center">
        <div
          className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary"
          role="status"
          aria-label="Loading"
        />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

/**
 * Button loading spinner with text
 * Use this inside buttons to show loading state
 */
export function ButtonSpinner({
  loading,
  loadingText = 'Loading...',
  children,
}: {
  loading: boolean
  loadingText?: string
  children: React.ReactNode
}) {
  return (
    <>
      {loading && (
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {loading ? loadingText : children}
    </>
  )
}

/**
 * Progress bar for uploads and long-running operations
 */
export function ProgressBar({
  progress,
  message,
  showPercentage = true,
}: {
  progress: number
  message?: string
  showPercentage?: boolean
}) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100)

  return (
    <div className="w-full">
      {message && (
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{message}</p>
          {showPercentage && (
            <span className="text-sm font-medium">{Math.round(clampedProgress)}%</span>
          )}
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${clampedProgress}%` }}
          role="progressbar"
          aria-valuenow={clampedProgress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  )
}
