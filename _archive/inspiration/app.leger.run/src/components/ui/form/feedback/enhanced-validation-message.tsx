import React from 'react'
import { AlertTriangle, Lightbulb, XCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

export interface ValidationMessage {
  message: string
  field?: string
  severity?: 'error' | 'warning' | 'info' | 'suggestion'
}

export interface EnhancedValidationProps {
  errors?: ValidationMessage[]
  warnings?: ValidationMessage[]
  suggestions?: ValidationMessage[]
  className?: string
  compact?: boolean
}

export function EnhancedValidationMessage({ 
  errors = [], 
  warnings = [], 
  suggestions = [],
  className,
  compact = false
}: EnhancedValidationProps) {
  if (!errors.length && !warnings.length && !suggestions.length) {
    return null
  }

  return (
    <div className={cn("space-y-2", className)}>
      {errors.map((error, index) => (
        <Alert 
          key={`error-${index}`} 
          variant="destructive"
          className={cn(compact && "py-1 px-2")}
        >
          <XCircle className="h-4 w-4" />
          <AlertDescription className={cn(compact && "text-xs")}>
            {error.message}
          </AlertDescription>
        </Alert>
      ))}
      
      {warnings.map((warning, index) => (
        <Alert 
          key={`warning-${index}`}
          className={cn(
            "border-catppuccin-peach bg-catppuccin-peach/10",
            compact && "py-1 px-2"
          )}
        >
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className={cn("text-yellow-800 dark:text-yellow-200", compact && "text-xs")}>
            {warning.message}
          </AlertDescription>
        </Alert>
      ))}
      
      {suggestions.map((suggestion, index) => (
        <Alert 
          key={`suggestion-${index}`}
          className={cn(
            "border-catppuccin-blue bg-catppuccin-blue/10",
            compact && "py-1 px-2"
          )}
        >
          <Lightbulb className="h-4 w-4 text-blue-600" />
          <AlertDescription className={cn("text-blue-800 dark:text-blue-200", compact && "text-xs")}>
            {suggestion.message}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  )
}
