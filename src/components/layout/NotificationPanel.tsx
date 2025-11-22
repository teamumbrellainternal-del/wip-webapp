/**
 * NotificationPanel Component
 * Dropdown panel showing notifications
 *
 * Features:
 * - Shows list of notifications with timestamps
 * - Empty state: "No new notifications"
 * - For now, just UI structure (actual notifications can be wired later)
 */

import { useNavigate } from 'react-router-dom'
import { Bell, Calendar, MessageSquare, CheckCircle } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

interface NotificationPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Mock notifications (replace with real data later)
const mockNotifications = [
  {
    id: '1',
    type: 'booking',
    message: 'New booking request from The Blue Note',
    timestamp: '2 hours ago',
    unread: true,
    icon: Calendar,
  },
  {
    id: '2',
    type: 'profile',
    message: 'Your profile was viewed 12 times today',
    timestamp: '5 hours ago',
    unread: true,
    icon: CheckCircle,
  },
  {
    id: '3',
    type: 'message',
    message: 'New message from Sarah Blues',
    timestamp: '1 day ago',
    unread: false,
    icon: MessageSquare,
  },
]

export function NotificationPanel({ open, onOpenChange }: NotificationPanelProps) {
  const navigate = useNavigate()
  const hasNotifications = mockNotifications.length > 0
  const unreadCount = mockNotifications.filter((n) => n.unread).length

  const handleNotificationClick = (notification: typeof mockNotifications[0]) => {
    // Navigate based on notification type
    switch (notification.type) {
      case 'booking':
        // Extract gig ID from message (in real implementation, this would come from notification data)
        navigate('/gigs')
        break
      case 'message':
        navigate('/messages')
        break
      case 'profile':
        navigate('/profile/edit')
        break
      default:
        console.log('Unknown notification type:', notification.type)
    }
    onOpenChange(false)
  }

  const handleMarkAllAsRead = () => {
    // TODO: Call API endpoint when available
    // await apiClient.markAllNotificationsAsRead()
    console.log('Mark all notifications as read')
    // In real implementation, this would update the notifications state
  }

  // This component is rendered as a child of AppLayout, so we need to
  // create a portal-like behavior using the dropdown menu pattern
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <button className="hidden" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {unreadCount} new
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {!hasNotifications && (
          <div className="py-12 text-center">
            <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">No new notifications</p>
            <p className="text-xs text-muted-foreground mt-1">
              We'll notify you when something happens
            </p>
          </div>
        )}

        {hasNotifications && (
          <ScrollArea className="h-[400px]">
            <div className="space-y-1">
              {mockNotifications.map((notification) => {
                const Icon = notification.icon
                return (
                  <DropdownMenuItem
                    key={notification.id}
                    className={`cursor-pointer p-3 ${
                      notification.unread ? 'bg-accent' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <div
                        className={`flex-shrink-0 mt-1 ${
                          notification.unread
                            ? 'text-primary'
                            : 'text-muted-foreground'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm ${
                            notification.unread ? 'font-medium' : ''
                          }`}
                        >
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.timestamp}
                        </p>
                      </div>
                      {notification.unread && (
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        </div>
                      )}
                    </div>
                  </DropdownMenuItem>
                )
              })}
            </div>
          </ScrollArea>
        )}

        {hasNotifications && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
