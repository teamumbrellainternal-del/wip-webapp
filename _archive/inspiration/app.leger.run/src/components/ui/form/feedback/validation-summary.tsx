import React from 'react'
import { XCircle, AlertTriangle, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface ValidationSummaryProps {
  errorCount: number
  warningCount: number
  successCount: number
  totalFields: number
  className?: string
}

export function ValidationSummary({
  errorCount,
  warningCount,
  successCount,
  totalFields,
  className
}: ValidationSummaryProps) {
  const completionPercentage = totalFields > 0 
    ? Math.round((successCount / totalFields) * 100)
    : 0

  const getStatusColor = () => {
    if (errorCount > 0) return 'text-red-600'
    if (warningCount > 0) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getProgressClassName = () => {
    if (errorCount > 0) return '[&>*]:bg-red-600'
    if (warningCount > 0) return '[&>*]:bg-yellow-600'
    return '[&>*]:bg-green-600'
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Validation Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Form Completion
          </span>
          <span className={cn("text-sm font-medium", getStatusColor())}>
            {completionPercentage}%
          </span>
        </div>
        
        <Progress 
          value={completionPercentage} 
          className={cn("h-2", getProgressClassName())}
        />
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="flex items-center justify-center">
              <XCircle className="h-4 w-4 text-red-600 mr-1" />
              <span className="text-2xl font-bold text-red-600">
                {errorCount}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Errors</p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mr-1" />
              <span className="text-2xl font-bold text-yellow-600">
                {warningCount}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Warnings</p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-2xl font-bold text-green-600">
                {successCount}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Valid</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}