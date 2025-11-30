/**
 * AppLayout Component
 * Main authenticated app shell with navigation bar for Umbrella
 *
 * Features:
 * - Top navigation bar with logo, tabs, notifications, profile
 * - D-044: Tools navigation item
 * - D-098: Settings access via profile dropdown
 */

import { Link, useLocation } from 'react-router-dom'
import { Bell } from 'lucide-react'
import UmbrellaIcon from '@brand/assets/logos/umbrella-icon.svg'
import { Button } from '@/components/ui/button'
import { ProfileDropdown } from './ProfileDropdown'
import { NotificationPanel } from './NotificationPanel'
import { Footer } from './Footer'
import { cn } from '@/lib/utils'

interface AppLayoutProps {
  children: React.ReactNode
}

const navigationTabs = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Discover', path: '/marketplace/gigs' },
  { label: 'Network', path: '/network' },
  { label: 'Messages', path: '/messages' },
  { label: 'Violet', path: '/violet' },
  // { label: 'Growth', path: '/growth' }, // Hidden for launch - page still exists at /growth
]

export default function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation()

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
                <img src={UmbrellaIcon} alt="Umbrella" className="h-8 w-8 rounded-lg" />
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

            {/* Right Side: Notifications, Profile */}
            <div className="flex items-center gap-3">
              {/* Notification Bell with Dropdown */}
              <NotificationPanel>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="sr-only">Notifications</span>
                </Button>
              </NotificationPanel>

              {/* Profile Dropdown - D-098: Settings access */}
              <ProfileDropdown />

              {/* View My Profile Button - Hidden on mobile */}
              <Button asChild size="sm" className="hidden lg:inline-flex">
                <Link to="/profile/view">View My Profile</Link>
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
    </div>
  )
}
