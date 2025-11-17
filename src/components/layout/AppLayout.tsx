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
  { label: 'Tools', path: '/tools' }, // D-044: New navigation item
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
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Navigation Bar */}
      <header className="border-b bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left Side: Logo + Navigation Tabs */}
            <div className="flex items-center gap-8">
              {/* Logo */}
              <Link to="/dashboard" className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary">
                  <span className="text-lg">☂</span>
                </div>
                <span className="font-bold text-lg hidden sm:inline">Umbrella</span>
              </Link>

              {/* Main Navigation Tabs - Hidden on mobile */}
              <nav className="hidden md:flex items-center gap-6">
                {navigationTabs.map((tab) => {
                  const active = isActiveTab(tab.path)
                  return (
                    <Link
                      key={tab.path}
                      to={tab.path}
                      className={cn(
                        'text-sm font-medium transition-colors hover:text-primary relative py-4',
                        active
                          ? 'text-foreground'
                          : 'text-muted-foreground'
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
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {unreadCount}
                  </Badge>
                )}
                <span className="sr-only">Notifications</span>
              </Button>

              {/* Profile Dropdown - D-098: Settings access */}
              <ProfileDropdown />

              {/* View My Profile Button - Hidden on mobile */}
              <Button
                asChild
                size="sm"
                className="hidden lg:inline-flex"
              >
                <Link to="/profile/view">View My Profile</Link>
              </Button>
            </div>
          </div>

          {/* Mobile Navigation - Shown on small screens */}
          <nav className="md:hidden border-t">
            <div className="flex items-center justify-around py-2">
              {navigationTabs.slice(0, 5).map((tab) => {
                const active = isActiveTab(tab.path)
                return (
                  <Link
                    key={tab.path}
                    to={tab.path}
                    className={cn(
                      'text-xs font-medium transition-colors px-3 py-2 rounded-md',
                      active
                        ? 'text-foreground bg-accent'
                        : 'text-muted-foreground'
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
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <Footer />

      {/* Search Modal - D-071 */}
      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />

      {/* Notification Panel */}
      <NotificationPanel open={notificationsOpen} onOpenChange={setNotificationsOpen} />
    </div>
  )
}
