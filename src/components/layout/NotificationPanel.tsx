/**
 * NotificationPanel Component
 * Dropdown panel showing notifications
 *
 * Features:
 * - Fetches notifications from API on mount
 * - Shows list of notifications with timestamps
 * - Mark as read on click
 * - Mark all as read action
 * - Empty state: "No new notifications"
 * - Accepts children as trigger element for proper positioning
 */

import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Bell,
  CheckCheck,
  Users,
  UserCheck,
  MessageCircle,
  Briefcase,
  Star,
  AlertCircle,
  Loader2,
} from 'lucide-react'
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
import { apiClient } from '@/lib/api-client'
import type { Notification, NotificationType } from '@/types'

interface NotificationPanelProps {
  children: React.ReactNode
}

const notificationIcons: Record<NotificationType, typeof Bell> = {
  connection_request: Users,
  connection_accepted: UserCheck,
  message: MessageCircle,
  gig_application: Briefcase,
  review: Star,
  system: AlertCircle,
}

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export function NotificationPanel({ children }: NotificationPanelProps) {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      const response = await apiClient.getNotifications({ limit: 10 })
      setNotifications(response.notifications)
      setUnreadCount(response.unread_count)
    } catch (error) {
      console.error('NotificationPanel:fetch:error', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch on mount and when dropdown opens
  useEffect(() => {
    if (open) {
      fetchNotifications()
    }
  }, [open, fetchNotifications])

  // Also fetch unread count periodically (every 60 seconds)
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await apiClient.getUnreadNotificationCount()
        setUnreadCount(response.unread_count)
      } catch {
        // Silently fail - don't spam console
      }
    }

    fetchCount()
    const interval = setInterval(fetchCount, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if unread
    if (!notification.read) {
      try {
        await apiClient.markNotificationRead(notification.id)
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      } catch (error) {
        console.error('NotificationPanel:markRead:error', error)
      }
    }

    // Navigate based on notification type
    const data = notification.data as Record<string, string> | undefined
    switch (notification.type) {
      case 'connection_request':
        navigate('/network')
        break
      case 'connection_accepted':
        if (data?.from_artist_id) {
          navigate(`/artist/${data.from_artist_id}`)
        } else {
          navigate('/network')
        }
        break
      case 'message':
        if (data?.conversation_id) {
          navigate(`/messages/${data.conversation_id}`)
        } else {
          navigate('/messages')
        }
        break
      case 'gig_application':
        if (data?.gig_id) {
          navigate(`/gig/${data.gig_id}`)
        }
        break
      default:
        break
    }

    setOpen(false)
  }

  const handleMarkAllRead = async () => {
    try {
      await apiClient.markAllNotificationsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('NotificationPanel:markAllRead:error', error)
    }
  }

  const hasNotifications = notifications.length > 0

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <div className="relative">
          {children}
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-5 min-w-[20px] rounded-full px-1 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="font-semibold">Notifications</span>
          {hasNotifications && unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
              onClick={handleMarkAllRead}
            >
              <CheckCheck className="mr-1 h-3 w-3" />
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {loading && notifications.length === 0 ? (
          <div className="py-8 text-center">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !hasNotifications ? (
          <div className="py-12 text-center">
            <Bell className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
            <p className="text-sm font-medium text-foreground">No notifications yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              We'll notify you when something happens
            </p>
          </div>
        ) : (
          <>
            <ScrollArea className="h-[300px]">
              {notifications.map((notification) => {
                const Icon = notificationIcons[notification.type] || Bell
                return (
                  <DropdownMenuItem
                    key={notification.id}
                    className={`flex cursor-pointer items-start gap-3 p-3 ${
                      !notification.read ? 'bg-muted/50' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div
                      className={`mt-0.5 rounded-full p-2 ${
                        !notification.read
                          ? 'bg-purple-100 text-purple-600'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm leading-tight ${
                          !notification.read ? 'font-medium' : 'text-muted-foreground'
                        }`}
                      >
                        {notification.title}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                        {notification.body}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatTimeAgo(notification.created_at)}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="mt-2 h-2 w-2 rounded-full bg-purple-500" />
                    )}
                  </DropdownMenuItem>
                )
              })}
            </ScrollArea>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Link to="/network" onClick={() => setOpen(false)}>
                <Button variant="ghost" className="w-full text-sm">
                  View all activity
                </Button>
              </Link>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
