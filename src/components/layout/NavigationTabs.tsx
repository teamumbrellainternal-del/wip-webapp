/**
 * NavigationTabs Component
 * Horizontal tab list for main navigation
 *
 * Features:
 * - Active tab indicator (purple underline)
 * - Uses React Router's useLocation to determine active tab
 * - Responsive design
 */

import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

export interface NavigationTab {
  label: string
  path: string
  icon?: ReactNode
}

interface NavigationTabsProps {
  tabs: NavigationTab[]
  className?: string
}

export function NavigationTabs({ tabs, className }: NavigationTabsProps) {
  const location = useLocation()

  const isActiveTab = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }

  return (
    <nav className={cn('flex items-center gap-6', className)}>
      {tabs.map((tab) => {
        const active = isActiveTab(tab.path)
        return (
          <Link
            key={tab.path}
            to={tab.path}
            className={cn(
              'relative flex items-center gap-2 py-4 text-sm font-medium transition-colors hover:text-primary',
              active ? 'text-foreground' : 'text-muted-foreground'
            )}
          >
            {tab.icon && <span className="h-4 w-4">{tab.icon}</span>}
            {tab.label}
            {active && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </Link>
        )
      })}
    </nav>
  )
}
