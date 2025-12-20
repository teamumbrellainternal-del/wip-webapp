/**
 * VenueDashboardPage Component
 * Main dashboard for venue users with 4 sub-tabs:
 * - Overview: Stats and upcoming shows
 * - Smart Booking: Calendar and booking features
 * - Co-Marketing Studio: Promo generation (modal)
 * - Find Artist: Artist discovery with matching
 */

import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Bell, Search, Home, Calendar, Sparkles, Loader2 } from 'lucide-react'
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
import { mockVenueProfile, type VenueProfile } from '@/mocks/venue-data'
import { apiClient } from '@/lib/api-client'
import type { VenueProfileResponse } from '@/types'

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

// Convert API response to mock data format for compatibility with existing components
function toVenueProfile(venue: VenueProfileResponse): VenueProfile {
  return {
    id: venue.id,
    name: venue.name,
    tagline: venue.tagline || '',
    location: venue.city + (venue.state ? `, ${venue.state}` : ''),
    capacity: venue.capacity || 0,
    status: venue.status,
    eventsHosted: venue.events_hosted,
    networkSize: venue.total_artists_booked * 50, // Estimate network from artists
    avatarInitials: venue.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase(),
    bannerUrl: venue.cover_url || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1600&h=400&fit=crop',
    verified: venue.verified,
  }
}

export default function VenueDashboardPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview')
  const [isCoMarketingOpen, setIsCoMarketingOpen] = useState(false)
  const [venueProfile, setVenueProfile] = useState<VenueProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch venue profile on mount
  useEffect(() => {
    const fetchVenueProfile = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const venue = await apiClient.getVenueProfile()
        setVenueProfile(toVenueProfile(venue))
      } catch (err) {
        // If venue profile not found, redirect to onboarding
        if (err instanceof Error && err.message.includes('not found')) {
          navigate('/venue/onboarding/step1')
          return
        }
        // For other errors, show error state but use mock data as fallback
        console.error('Failed to fetch venue profile:', err)
        setError('Failed to load venue profile')
        // Use mock data as fallback for demo purposes
        setVenueProfile(mockVenueProfile)
      } finally {
        setIsLoading(false)
      }
    }

    fetchVenueProfile()
  }, [navigate])

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
        {/* Loading State */}
        {isLoading && (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        )}

        {/* Hero Banner - show when loaded */}
        {!isLoading && venueProfile && <VenueHeroBanner venue={venueProfile} />}

        {/* Sub-tabs Navigation - show when not loading */}
        {!isLoading && (
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
        )}

        {/* Tab Content - show when not loading */}
        {!isLoading && (
          <div className="bg-slate-50 dark:bg-slate-900/50">
            {activeTab === 'overview' && <VenueOverviewTab />}
            {activeTab === 'smart-booking' && <SmartBookingTab />}
            {activeTab === 'find-artist' && <FindArtistTab />}
          </div>
        )}
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
