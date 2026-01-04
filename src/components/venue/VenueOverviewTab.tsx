/**
 * VenueOverviewTab Component
 * Overview tab content with stats cards and upcoming shows/gigs grid
 */

import { Calendar, Users, DollarSign, Plus } from 'lucide-react'
import { VenueStatsCard } from './VenueStatsCard'
import { MyGigsList } from './MyGigsList'
import { Button } from '@/components/ui/button'
import type { VenueGig } from '@/types'

interface VenueOverviewTabProps {
  gigs: VenueGig[]
  isLoadingGigs: boolean
  onViewApplications: (gig: VenueGig) => void
  onRefreshGigs: () => void
  onCreateGig: () => void
}

export function VenueOverviewTab({
  gigs,
  isLoadingGigs,
  onViewApplications,
  onRefreshGigs,
  onCreateGig,
}: VenueOverviewTabProps) {
  const formatCurrency = (amount: number): string => {
    return `$${(amount / 1000).toFixed(1)}K`
  }

  // Calculate stats from real gig data
  const openGigs = gigs.filter((g) => g.status === 'open')
  const completedGigs = gigs.filter((g) => g.status === 'completed')
  const nextGig = openGigs.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )[0]
  const nextGigDate = nextGig
    ? new Date(nextGig.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'None scheduled'

  // Estimate revenue from payment amounts
  const estimatedRevenue = completedGigs.reduce((sum, g) => sum + (g.payment_amount || 0), 0)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Stats Cards Row */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <VenueStatsCard
          icon={<Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
          iconBgColor="bg-purple-100 dark:bg-purple-900/30"
          label="Open Gigs"
          value={openGigs.length}
          subtext={`Next: ${nextGigDate}`}
        />
        <VenueStatsCard
          icon={<Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
          iconBgColor="bg-purple-100 dark:bg-purple-900/30"
          label="Total Gigs Posted"
          value={gigs.length}
          subtext={`${completedGigs.length} completed`}
          subtextColor="green"
        />
        <VenueStatsCard
          icon={<DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
          iconBgColor="bg-purple-100 dark:bg-purple-900/30"
          label="Est. Revenue"
          value={formatCurrency(estimatedRevenue)}
          subtext="From completed gigs"
        />
      </div>

      {/* My Gigs Section */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">My Posted Gigs</h2>
          <Button onClick={onCreateGig} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="mr-2 h-4 w-4" />
            Create New Gig
          </Button>
        </div>
        <MyGigsList
          gigs={gigs}
          isLoading={isLoadingGigs}
          onViewApplications={onViewApplications}
          onRefresh={onRefreshGigs}
        />
      </div>
    </div>
  )
}
