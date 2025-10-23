import React from 'react'
import { CheckCircle, XCircle, AlertTriangle, FileDown } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ValidationMessage } from './enhanced-validation-message'

interface ExportReadinessIndicatorProps {
  _isReady: boolean
  errors?: ValidationMessage[]
  warnings?: ValidationMessage[]
  suggestions?: ValidationMessage[]
  onExport?: () => void
  className?: string
}

export function ExportReadinessIndicator({
  _isReady,
  errors = [],
  warnings = [],
  suggestions = [],
  onExport,
  className
}: ExportReadinessIndicatorProps) {
  const hasErrors = errors.length > 0
  const hasWarnings = warnings.length > 0

  const getReadinessStatus = () => {
    if (hasErrors) {
      return {
        icon: <XCircle className="h-5 w-5" />,
        title: 'Not Ready for Export',
        description: `Fix ${errors.length} error${errors.length !== 1 ? 's' : ''} before exporting`,
        variant: 'destructive' as const,
        canExport: false
      }
    }

    if (hasWarnings) {
      return {
        icon: <AlertTriangle className="h-5 w-5" />,
        title: 'Ready with Warnings',
        description: `${warnings.length} warning${warnings.length !== 1 ? 's' : ''} found - review before production use`,
        variant: 'default' as const,
        canExport: true
      }
    }

    return {
      icon: <CheckCircle className="h-5 w-5" />,
      title: 'Ready for Export',
      description: 'Configuration validated successfully',
      variant: 'default' as const,
      canExport: true
    }
  }

  const status = getReadinessStatus()

  return (
    <div className={cn('space-y-3', className)}>
      <Alert 
        variant={status.variant}
        className={cn(
          status.variant === 'default' && !hasWarnings && 'border-green-600 bg-green-50 dark:bg-green-950/20',
          status.variant === 'default' && hasWarnings && 'border-yellow-600 bg-yellow-50 dark:bg-yellow-950/20'
        )}
      >
        <div className="flex items-start gap-3">
          <div className={cn(
            'mt-0.5',
            hasErrors && 'text-red-600',
            hasWarnings && !hasErrors && 'text-yellow-600',
            !hasErrors && !hasWarnings && 'text-green-600'
          )}>
            {status.icon}
          </div>
          <div className="flex-1">
            <AlertTitle className="mb-1">{status.title}</AlertTitle>
            <AlertDescription>{status.description}</AlertDescription>
            
            {hasErrors && (
              <div className="mt-3 space-y-1">
                <p className="text-sm font-medium text-red-600">Critical Issues:</p>
                <ul className="list-disc list-inside space-y-1">
                  {errors.slice(0, 3).map((error, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      {error.field && <span className="font-medium">{error.field}: </span>}
                      {error.message}
                    </li>
                  ))}
                  {errors.length > 3 && (
                    <li className="text-sm text-muted-foreground">
                      ...and {errors.length - 3} more
                    </li>
                  )}
                </ul>
              </div>
            )}
            
            {!hasErrors && hasWarnings && (
              <div className="mt-3 space-y-1">
                <p className="text-sm font-medium text-yellow-600">Warnings:</p>
                <ul className="list-disc list-inside space-y-1">
                  {warnings.slice(0, 3).map((warning, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      {warning.field && <span className="font-medium">{warning.field}: </span>}
                      {warning.message}
                    </li>
                  ))}
                  {warnings.length > 3 && (
                    <li className="text-sm text-muted-foreground">
                      ...and {warnings.length - 3} more
                    </li>
                  )}
                </ul>
              </div>
            )}

            {suggestions.length > 0 && (
              <div className="mt-3 space-y-1">
                <p className="text-sm font-medium text-blue-600">Suggestions:</p>
                <ul className="list-disc list-inside space-y-1">
                  {suggestions.slice(0, 2).map((suggestion, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      {suggestion.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </Alert>

      {onExport && (
        <Button
          onClick={onExport}
          disabled={!status.canExport}
          className="w-full"
          variant={hasWarnings ? 'outline' : 'default'}
        >
          <FileDown className="h-4 w-4 mr-2" />
          {status.canExport ? 'Export Configuration' : 'Fix Errors to Export'}
        </Button>
      )}
    </div>
  )
}