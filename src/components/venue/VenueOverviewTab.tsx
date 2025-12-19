/**
 * VenueOverviewTab Component
 * Overview tab content with stats cards and upcoming shows grid
 */

import { Calendar, Users, DollarSign } from 'lucide-react'
import { VenueStatsCard } from './VenueStatsCard'
import { UpcomingShowCard } from './UpcomingShowCard'
import { mockVenueStats, mockUpcomingShows } from '@/mocks/venue-data'

export function VenueOverviewTab() {
  const formatCurrency = (amount: number): string => {
    return `$${(amount / 1000).toFixed(1)}K`
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Stats Cards Row */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <VenueStatsCard
          icon={<Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
          iconBgColor="bg-purple-100 dark:bg-purple-900/30"
          label="Upcoming Shows"
          value={mockVenueStats.upcomingShows.count}
          subtext={`Next: ${mockVenueStats.upcomingShows.nextDate}`}
        />
        <VenueStatsCard
          icon={<Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
          iconBgColor="bg-purple-100 dark:bg-purple-900/30"
          label="Total Artists Booked"
          value={mockVenueStats.totalArtistsBooked.count}
          subtext={`↑${mockVenueStats.totalArtistsBooked.percentageChange}% MoM`}
          subtextColor="green"
        />
        <VenueStatsCard
          icon={<DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
          iconBgColor="bg-purple-100 dark:bg-purple-900/30"
          label="Monthly Revenue"
          value={formatCurrency(mockVenueStats.monthlyRevenue.amount)}
          subtext={mockVenueStats.monthlyRevenue.label}
        />
      </div>

      {/* Upcoming Shows Section */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-foreground">Upcoming Shows</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mockUpcomingShows.map((show) => (
            <UpcomingShowCard key={show.id} show={show} />
          ))}
        </div>
      </div>
    </div>
  )
}
