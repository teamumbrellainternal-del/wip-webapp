/**
 * VenueStatsCard Component
 * Reusable stat card for venue dashboard metrics
 */

import { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface VenueStatsCardProps {
  icon: ReactNode
  iconBgColor?: string
  label: string
  value: string | number
  subtext?: string
  subtextColor?: 'green' | 'red' | 'default'
}

export function VenueStatsCard({
  icon,
  iconBgColor = 'bg-purple-100 dark:bg-purple-900/30',
  label,
  value,
  subtext,
  subtextColor = 'default',
}: VenueStatsCardProps) {
  const subtextColorClass = {
    green: 'text-green-600 dark:text-green-400',
    red: 'text-red-600 dark:text-red-400',
    default: 'text-muted-foreground',
  }[subtextColor]

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="mt-1 text-3xl font-bold text-foreground">{value}</p>
            {subtext && (
              <p className={cn('mt-1 text-xs', subtextColorClass)}>{subtext}</p>
            )}
          </div>
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-full', iconBgColor)}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

