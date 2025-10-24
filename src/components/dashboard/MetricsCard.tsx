/**
 * MetricsCard Component
 * Reusable metrics card for dashboard with trend indicators
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUp, ArrowDown } from 'lucide-react'

interface MetricsCardProps {
  title: string
  value: string | number
  subtitle?: string
  change?: string
  trend?: 'up' | 'down'
  icon?: React.ReactNode
}

export default function MetricsCard({
  title,
  value,
  subtitle,
  change,
  trend,
  icon,
}: MetricsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className="text-muted-foreground">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <p className="text-3xl font-bold">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
          {change && trend && (
            <div
              className={`flex items-center text-sm font-medium ${
                trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {trend === 'up' ? (
                <ArrowUp className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDown className="h-4 w-4 mr-1" />
              )}
              {change} from last month
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
