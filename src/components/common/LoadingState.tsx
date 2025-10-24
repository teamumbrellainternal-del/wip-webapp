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
          className={`animate-spin rounded-full ${sizeClasses[size]} border-primary mx-auto mb-4`}
          role="status"
          aria-label="Loading"
        />
        <p className="text-muted-foreground text-sm">{message}</p>
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
          className="h-4 bg-muted rounded animate-pulse"
          style={{ width: `${100 - i * 10}%` }}
        />
      ))}
    </div>
  )
}
