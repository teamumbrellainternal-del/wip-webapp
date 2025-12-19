/**
 * VenueDashboardPage Component
 * Main dashboard for venue users with 4 sub-tabs:
 * - Overview: Stats and upcoming shows
 * - Smart Booking: Calendar and booking features
 * - Co-Marketing Studio: Promo generation (modal)
 * - Find Artist: Artist discovery with matching
 */

import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Bell, Search, Home, Calendar, Sparkles } from 'lucide-react'
import UmbrellaIcon from '@brand/assets/logos/umbrella-icon.svg'
import { Button } from '@/components/ui/button'
import { ProfileDropdown } from '@/components/layout/ProfileDropdown'
import { NotificationPanel } from '@/components/layout/NotificationPanel'
import { Footer } from '@/components/layout/Footer'
import { cn } from '@/lib/utils'
import { VenueHeroBanner } from '@/components/venue/VenueHeroBanner'
import { VenueOverviewTab } from '@/components/venue/VenueOverviewTab'
import { SmartBookingTab } from '@/components/venue/SmartBookingTab'
import { FindArtistTab } from '@/components/venue/FindArtistTab'
import { CoMarketingModal } from '@/components/venue/CoMarketingModal'
import { mockVenueProfile } from '@/mocks/venue-data'

// Venue-specific top navigation
const venueNavigationTabs = [
  { label: 'Dashboard', path: '/venue/dashboard' },
  { label: 'Calendar', path: '/venue/dashboard' }, // Same page, scrolls to Smart Booking
  { label: 'Artists', path: '/venue/dashboard' }, // Same page, scrolls to Find Artist
  { label: 'Messages', path: '/messages' },
  { label: 'Violet', path: '/violet' },
]

// Sub-tabs within the dashboard
type DashboardTab = 'overview' | 'smart-booking' | 'co-marketing' | 'find-artist'

export default function VenueDashboardPage() {
  const location = useLocation()
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview')
  const [isCoMarketingOpen, setIsCoMarketingOpen] = useState(false)

  const isActiveNavTab = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }

  const handleTabClick = (tab: DashboardTab) => {
    if (tab === 'co-marketing') {
      setIsCoMarketingOpen(true)
    } else {
      setActiveTab(tab)
    }
  }

  const subTabs = [
    { id: 'overview' as const, label: 'Overview', icon: <Home className="h-4 w-4" /> },
    {
      id: 'smart-booking' as const,
      label: 'Smart Booking',
      icon: <Calendar className="h-4 w-4" />,
    },
    {
      id: 'co-marketing' as const,
      label: 'Co-Marketing Studio',
      icon: <Sparkles className="h-4 w-4" />,
    },
    { id: 'find-artist' as const, label: 'Find Artist', icon: <Search className="h-4 w-4" /> },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 border-b bg-background">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Left Side: Logo + Navigation Tabs */}
            <div className="flex items-center gap-8">
              {/* Logo */}
              <Link to="/venue/dashboard" className="flex flex-shrink-0 items-center gap-2">
                <img src={UmbrellaIcon} alt="Umbrella" className="h-8 w-8 rounded-lg" />
              </Link>

              {/* Main Navigation Tabs */}
              <nav className="hidden items-center gap-6 md:flex">
                {venueNavigationTabs.map((tab) => {
                  const active = isActiveNavTab(tab.path)
                  return (
                    <Link
                      key={tab.label}
                      to={tab.path}
                      className={cn(
                        'relative py-4 text-sm font-medium transition-colors hover:text-primary',
                        active ? 'text-foreground' : 'text-muted-foreground'
                      )}
                    >
                      {tab.label}
                      {active && tab.label === 'Dashboard' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                      )}
                    </Link>
                  )
                })}
              </nav>
            </div>

            {/* Right Side: Notifications, Search, Profile */}
            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <NotificationPanel>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                    3
                  </span>
                  <span className="sr-only">Notifications</span>
                </Button>
              </NotificationPanel>

              {/* Search */}
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>

              {/* Profile Avatar */}
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Banner */}
        <VenueHeroBanner venue={mockVenueProfile} />

        {/* Sub-tabs Navigation */}
        <div className="border-b bg-background">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-2 py-4">
              {subTabs.map((tab) => {
                const isActive =
                  activeTab === tab.id || (tab.id === 'co-marketing' && isCoMarketingOpen)
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={cn(
                      'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all',
                      isActive
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-slate-50 dark:bg-slate-900/50">
          {activeTab === 'overview' && <VenueOverviewTab />}
          {activeTab === 'smart-booking' && <SmartBookingTab />}
          {activeTab === 'find-artist' && <FindArtistTab />}
        </div>
      </main>

      {/* Co-Marketing Studio Modal */}
      <CoMarketingModal open={isCoMarketingOpen} onOpenChange={setIsCoMarketingOpen} />

      {/* Ask Violet Floating Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        <Button className="rounded-full bg-slate-800 px-4 py-2 text-sm font-medium text-white shadow-lg hover:bg-slate-700">
          Ask Violet
        </Button>
        <Button
          size="icon"
          className="h-14 w-14 rounded-full bg-purple-600 shadow-lg hover:bg-purple-700"
        >
          <Sparkles className="h-6 w-6 text-white" />
        </Button>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
