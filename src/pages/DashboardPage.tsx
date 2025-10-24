/**
 * DashboardPage Component
 * Main dashboard with live data from API endpoints
 *
 * Features:
 * - D-008: Dashboard metrics updated daily at midnight UTC
 * - D-010: Urgent badge on gigs within 7 days with <50% capacity
 * - D-011: Latest 3 gigs from marketplace (non-personalized)
 * - D-058: Ask Violet navigates to /violet page
 * - D-077: Single-click apply to gigs
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useApi } from '@/hooks/use-api'
import { toast } from '@/hooks/use-toast'
import { gigsService } from '@/services/api'
import type { DashboardMetrics, Gig, Conversation } from '@/types'

// UI Components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'

// Icons
import {
  Calendar,
  TrendingUp,
  DollarSign,
  Users,
  BarChart,
  Wand2,
  RefreshCw,
  MapPin,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'

// Layout & Dashboard Components
import AppLayout from '@/components/layout/AppLayout'
import MetricsCard from '@/components/dashboard/MetricsCard'
import OpportunityCard from '@/components/dashboard/OpportunityCard'
import LoadingState from '@/components/common/LoadingState'
import { ErrorMessage, EmptyState } from '@/components/common/ErrorState'

/**
 * Format relative time for messages (e.g., "2h ago", "1d ago")
 */
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [applying, setApplying] = useState<string | null>(null)

  // ========================================================================
  // API DATA FETCHING
  // ========================================================================

  // Fetch dashboard metrics (D-008: Updated daily at midnight UTC)
  const {
    data: metrics,
    loading: metricsLoading,
    error: metricsError,
    refetch: refetchMetrics,
  } = useApi<DashboardMetrics>('/analytics/dashboard')

  // Fetch latest 3 gigs (D-011: Non-personalized, latest from marketplace)
  const {
    data: gigsResponse,
    loading: gigsLoading,
    error: gigsError,
    refetch: refetchGigs,
  } = useApi<{ data: Gig[] }>('/gigs', {
    params: { limit: 3, sort_by: 'date' },
  })

  // Fetch recent conversations
  const {
    data: conversations,
    loading: conversationsLoading,
    error: conversationsError,
    refetch: refetchConversations,
  } = useApi<Conversation[]>('/messages/conversations', {
    params: { limit: 3 },
  })

  // ========================================================================
  // HANDLERS
  // ========================================================================

  /**
   * Handle Apply to Gig (D-077: Single-click apply)
   * Automatically sends profile + rates to venue
   */
  const handleApplyToGig = async (gigId: string) => {
    setApplying(gigId)
    try {
      await gigsService.apply(gigId)
      toast({
        title: 'Application sent!',
        description: 'The venue will review your profile.',
        variant: 'default',
      })
      // Refresh gigs to update UI
      refetchGigs()
    } catch (error) {
      toast({
        title: 'Application failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      })
    } finally {
      setApplying(null)
    }
  }

  /**
   * Refresh all dashboard data
   */
  const handleRefreshAll = () => {
    refetchMetrics()
    refetchGigs()
    refetchConversations()
  }

  // ========================================================================
  // LOADING STATE
  // ========================================================================

  if (metricsLoading && !metrics) {
    return (
      <AppLayout>
        <LoadingState message="Loading your dashboard..." />
      </AppLayout>
    )
  }

  if (!user) return null

  // ========================================================================
  // RENDER
  // ========================================================================

  const opportunities = gigsResponse?.data || []
  const isRefreshing = metricsLoading || gigsLoading || conversationsLoading

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* ================================================================ */}
        {/* WELCOME SECTION */}
        {/* ================================================================ */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, {metrics?.earnings ? user.name : user.name}!
            </h1>
            <p className="text-muted-foreground">
              Here's what's happening in your music world
            </p>
          </div>
          {/* Refresh Button */}
          <Button
            onClick={handleRefreshAll}
            variant="outline"
            size="sm"
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* ================================================================ */}
        {/* ONBOARDING ALERT */}
        {/* ================================================================ */}
        {!user.onboarding_complete && (
          <Card className="border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold mb-1">Complete Your Profile</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Finish setting up your artist profile to start booking gigs
                  </p>
                  <Button onClick={() => navigate('/onboarding/artists/step1')}>
                    Continue Onboarding
                  </Button>
                </div>
                <Badge variant="secondary">3/5 Steps</Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ================================================================ */}
        {/* METRICS CARDS */}
        {/* ================================================================ */}
        {metricsError ? (
          <ErrorMessage error={metricsError} retry={refetchMetrics} />
        ) : metricsLoading ? (
          <div className="grid md:grid-cols-3 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        ) : metrics ? (
          <div className="grid md:grid-cols-3 gap-4">
            {/* Earnings Card */}
            <MetricsCard
              title="This Month"
              value={`$${metrics.earnings.current_month.toLocaleString()}`}
              change={`${Math.abs(metrics.earnings.percentage_change)}%`}
              trend={metrics.earnings.percentage_change >= 0 ? 'up' : 'down'}
              icon={<DollarSign className="h-4 w-4" />}
            />

            {/* Gigs Booked Card */}
            <MetricsCard
              title="Gigs Booked"
              value={metrics.gigs_booked.count}
              subtitle={metrics.gigs_booked.timeframe}
              icon={<Calendar className="h-4 w-4" />}
            />

            {/* Profile Views Card */}
            <MetricsCard
              title="Profile Views"
              value={metrics.profile_views.count}
              change={`${Math.abs(metrics.profile_views.percentage_change)}%`}
              trend={metrics.profile_views.percentage_change >= 0 ? 'up' : 'down'}
              icon={<TrendingUp className="h-4 w-4" />}
            />
          </div>
        ) : null}

        {/* ================================================================ */}
        {/* NEW OPPORTUNITIES (D-011: Latest 3 gigs) */}
        {/* ================================================================ */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">New Opportunities</h2>
            <Button variant="link" asChild>
              <Link to="/marketplace/gigs">View All →</Link>
            </Button>
          </div>

          {gigsError ? (
            <ErrorMessage error={gigsError} retry={refetchGigs} />
          ) : gigsLoading ? (
            <div className="grid md:grid-cols-3 gap-4">
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
            </div>
          ) : opportunities.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-4">
              {opportunities.map((gig) => (
                <OpportunityCard
                  key={gig.id}
                  gig={gig}
                  onApply={handleApplyToGig}
                  applying={applying === gig.id}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No opportunities yet"
              description="Check back soon for new gigs!"
              icon="🎵"
            />
          )}
        </div>

        {/* ================================================================ */}
        {/* TWO-COLUMN LAYOUT: Messages + Endorsements + Quick Actions */}
        {/* ================================================================ */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* LEFT COLUMN: Messages Widget */}
          <div>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Messages</CardTitle>
                  {conversations &&
                    conversations.filter((c) => c.unread_count > 0).length > 0 && (
                      <Badge variant="secondary">
                        {conversations.filter((c) => c.unread_count > 0).length} new
                      </Badge>
                    )}
                </div>
              </CardHeader>
              <CardContent>
                {conversationsError ? (
                  <ErrorMessage error={conversationsError} retry={refetchConversations} />
                ) : conversationsLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-16" />
                    <Skeleton className="h-16" />
                    <Skeleton className="h-16" />
                  </div>
                ) : conversations && conversations.length > 0 ? (
                  <div className="space-y-3">
                    {conversations.slice(0, 3).map((conv) => (
                      <Link
                        key={conv.id}
                        to={`/messages/${conv.id}`}
                        className="block hover:bg-muted p-2 rounded transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {conv.participants[0]?.name?.[0] || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium truncate">
                                {conv.participants[0]?.name || 'Unknown'}
                              </p>
                              <span className="text-xs text-muted-foreground">
                                {formatRelativeTime(conv.updated_at)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {conv.last_message_preview}
                            </p>
                          </div>
                          {conv.unread_count > 0 && (
                            <Badge variant="default" className="shrink-0">
                              {conv.unread_count}
                            </Badge>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No messages yet"
                    description="Start a conversation with an artist or venue"
                    icon="💬"
                  />
                )}

                <Button variant="outline" className="w-full mt-4" asChild>
                  <Link to="/messages">View All Messages</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: Endorsements + Quick Actions */}
          <div className="space-y-6">
            {/* Endorsements Widget */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Endorsements</CardTitle>
                  <Button variant="link" size="sm" asChild>
                    <Link to="/profile/view?tab=overview#endorsements">View all</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {metrics?.endorsements && metrics.endorsements.length > 0 ? (
                  <div className="space-y-2">
                    {metrics.endorsements.slice(0, 3).map((endorsement) => (
                      <div key={endorsement.id} className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {endorsement.skill || 'Endorsed'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          by {endorsement.endorser_name}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No endorsements yet
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions Widget */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/marketplace/gigs">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Find Gigs
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/marketplace/artists">
                    <Users className="mr-2 h-4 w-4" />
                    Find Collaborators
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/growth">
                    <BarChart className="mr-2 h-4 w-4" />
                    View Analytics
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ================================================================ */}
        {/* VIOLET PROMPT (D-058: Navigates to /violet) */}
        {/* ================================================================ */}
        <div className="flex justify-center">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Wand2 className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h3 className="font-semibold mb-2">What do you want help with today?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Ask me anything about gigs, collaborations, or growing your career
              </p>
              <Button onClick={() => navigate('/violet')} className="w-full">
                Ask Violet
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
