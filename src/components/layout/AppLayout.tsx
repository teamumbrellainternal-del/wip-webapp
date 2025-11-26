/**
 * AppLayout Component
 * Main authenticated app shell with navigation bar for Umbrella
 *
 * Features:
 * - Top navigation bar with logo, tabs, search, notifications, profile
 * - D-044: Tools navigation item
 * - D-071: Global search (Artists + Gigs)
 * - D-098: Settings access via profile dropdown
 */

import { Link, useLocation } from 'react-router-dom'
import { Search, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProfileDropdown } from './ProfileDropdown'
import { SearchModal } from './SearchModal'
import { NotificationPanel } from './NotificationPanel'
import { Footer } from './Footer'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface AppLayoutProps {
  children: React.ReactNode
}

const navigationTabs = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Discover', path: '/marketplace/gigs' },
  { label: 'Messages', path: '/messages' },
  { label: 'Violet', path: '/violet' },
  { label: 'Growth', path: '/growth' },
]

export default function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation()
  const [searchOpen, setSearchOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  // Mock notification count (replace with real data later)
  const unreadCount = 2

  const isActiveTab = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 border-b bg-background">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Left Side: Logo + Navigation Tabs */}
            <div className="flex items-center gap-8">
              {/* Logo */}
              <Link to="/dashboard" className="flex flex-shrink-0 items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                  <span className="text-lg">☂</span>
                </div>
                <span className="hidden text-lg font-bold sm:inline">Umbrella</span>
              </Link>

              {/* Main Navigation Tabs - Hidden on mobile */}
              <nav className="hidden items-center gap-6 md:flex">
                {navigationTabs.map((tab) => {
                  const active = isActiveTab(tab.path)
                  return (
                    <Link
                      key={tab.path}
                      to={tab.path}
                      className={cn(
                        'relative py-4 text-sm font-medium transition-colors hover:text-primary',
                        active ? 'text-foreground' : 'text-muted-foreground'
                      )}
                    >
                      {tab.label}
                      {active && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                      )}
                    </Link>
                  )
                })}
              </nav>
            </div>

            {/* Right Side: Search, Notifications, Profile */}
            <div className="flex items-center gap-3">
              {/* Search Icon - D-071: Global search for Artists + Gigs */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(true)}
                className="relative"
              >
                <Search className="h-5 w-5" />
                <span className="sr-only">Search artists or gigs</span>
              </Button>

              {/* Notification Bell */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center p-0 text-xs"
                  >
                    {unreadCount}
                  </Badge>
                )}
                <span className="sr-only">Notifications</span>
              </Button>

              {/* Profile Dropdown - D-098: Settings access */}
              <ProfileDropdown />

              {/* View My Profile Button - Hidden on mobile */}
              <Button asChild size="sm" className="hidden lg:inline-flex">
                <Link to="/profile/edit">View My Profile</Link>
              </Button>
            </div>
          </div>

          {/* Mobile Navigation - Shown on small screens */}
          <nav className="border-t md:hidden">
            <div className="flex items-center justify-around py-2">
              {navigationTabs.slice(0, 5).map((tab) => {
                const active = isActiveTab(tab.path)
                return (
                  <Link
                    key={tab.path}
                    to={tab.path}
                    className={cn(
                      'rounded-md px-3 py-2 text-xs font-medium transition-colors',
                      active ? 'bg-accent text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {tab.label}
                  </Link>
                )
              })}
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <Footer />

      {/* Search Modal - D-071 */}
      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />

      {/* Notification Panel */}
      <NotificationPanel open={notificationsOpen} onOpenChange={setNotificationsOpen} />
    </div>
  )
}
