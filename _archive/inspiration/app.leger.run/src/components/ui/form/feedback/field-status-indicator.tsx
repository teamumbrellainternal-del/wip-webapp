import React from 'react'
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export type FieldStatus = 'valid' | 'error' | 'warning' | 'validating' | 'idle'

interface FieldStatusIndicatorProps {
  status: FieldStatus
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export function FieldStatusIndicator({
  status,
  className,
  size = 'sm',
  showLabel = false
}: FieldStatusIndicatorProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'valid':
        return <CheckCircle className={cn(sizeClasses[size], 'text-green-600')} />
      case 'error':
        return <XCircle className={cn(sizeClasses[size], 'text-red-600')} />
      case 'warning':
        return <AlertTriangle className={cn(sizeClasses[size], 'text-yellow-600')} />
      case 'validating':
        return <Loader2 className={cn(sizeClasses[size], 'text-blue-600 animate-spin')} />
      default:
        return null
    }
  }

  const getStatusLabel = () => {
    switch (status) {
      case 'valid':
        return 'Valid'
      case 'error':
        return 'Error'
      case 'warning':
        return 'Warning'
      case 'validating':
        return 'Validating...'
      default:
        return ''
    }
  }

  if (status === 'idle') {
    return null
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {getStatusIcon()}
      {showLabel && (
        <span className={cn(
          'text-xs font-medium',
          status === 'valid' && 'text-green-600',
          status === 'error' && 'text-red-600',
          status === 'warning' && 'text-yellow-600',
          status === 'validating' && 'text-blue-600'
        )}>
          {getStatusLabel()}
        </span>
      )}
    </div>
  )
}