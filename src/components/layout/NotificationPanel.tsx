/**
 * NotificationPanel Component
 * Dropdown panel showing notifications
 *
 * Features:
 * - Shows list of notifications with timestamps
 * - Empty state: "No new notifications"
 * - Accepts children as trigger element for proper positioning
 */

import { Bell } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface NotificationPanelProps {
  children: React.ReactNode
}

// Empty for MVP launch - will be populated when notifications are implemented
const notifications: never[] = []

export function NotificationPanel({ children }: NotificationPanelProps) {
  const hasNotifications = notifications.length > 0

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="font-semibold">Notifications</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {!hasNotifications && (
          <div className="py-12 text-center">
            <Bell className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
            <p className="text-sm font-medium text-foreground">No notifications yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              We'll notify you when something happens
            </p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
