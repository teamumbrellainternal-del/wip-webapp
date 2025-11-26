import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Calendar,
  TrendingUp,
  MessageCircle,
  Sparkles,
  Search,
  Users,
  BarChart3,
  Star,
  DollarSign,
  ArrowRight,
  User,
} from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import LoadingState from '@/components/common/LoadingState'
import ErrorState from '@/components/common/ErrorState'
import { analyticsService } from '@/services/api'
import type { DashboardMetrics } from '@/types'
import { MetaTags } from '@/components/MetaTags'

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const metrics = await analyticsService.getDashboard()
      setData(metrics)
      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  if (loading) {
    return (
      <AppLayout>
        <LoadingState message="Loading your dashboard..." />
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <ErrorState error={error} retry={fetchDashboardData} />
      </AppLayout>
    )
  }

  if (!data) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <p>No dashboard data available</p>
        </div>
      </AppLayout>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercentage = (percentage: number) => {
    const sign = percentage >= 0 ? '+' : ''
    return `${sign}${percentage}%`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date)
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}d`
    return formatDate(timestamp)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Placeholder images for venues (in production, these would come from API)
  const venueImages = [
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=200&fit=crop',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=200&fit=crop',
    'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&h=200&fit=crop',
  ]

  return (
    <AppLayout>
      <MetaTags
        title="Dashboard"
        description="Your artist dashboard on Umbrella. Manage your gigs, track your performance, and grow your music career."
        url="/dashboard"
        noIndex={true}
      />
      <div className="container mx-auto px-4 py-8">
        {/* Two-Column Layout */}
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Main Content - Left Column */}
          <div className="flex-1 space-y-6">
            {/* Welcome Section */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-heading-32 font-bold tracking-tight text-foreground">
                  Welcome back, {user.name?.split(' ')[0] || 'Artist'}!
                </h1>
                <p className="text-copy-16 text-muted-foreground">
                  Here's what's happening in your music world
                </p>
              </div>
              <Button
                variant="outline"
                className="w-fit border-purple-300 hover:bg-purple-50 dark:border-purple-700 dark:hover:bg-purple-950"
                onClick={() => navigate('/profile/edit')}
              >
                <User className="mr-2 h-4 w-4" />
                View My Profile
              </Button>
            </div>

            {/* Onboarding Alert */}
            {!user.onboarding_complete && (
              <Card className="border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="mb-1 font-semibold">Complete Your Profile</h3>
                      <p className="mb-4 text-sm text-muted-foreground">
                        Finish setting up your artist profile to start booking gigs
                      </p>
                      <Button
                        className="bg-purple-500 hover:bg-purple-600"
                        onClick={() => navigate('/onboarding')}
                      >
                        Continue Onboarding
                      </Button>
                    </div>
                    <Badge variant="secondary">Setup Required</Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              {/* This Month Earnings - Purple background to match Figma */}
              <Card className="border-purple-400 bg-purple-600 text-white dark:border-purple-700 dark:bg-purple-800">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-100">This Month</p>
                      <p className="mt-1 text-2xl font-bold text-white">
                        {formatCurrency(data.earnings.current_month)}
                      </p>
                      <p className="mt-1 text-xs text-purple-100">
                        <span
                          className={
                            data.earnings.percentage_change >= 0 ? 'text-green-300' : 'text-red-300'
                          }
                        >
                          {formatPercentage(data.earnings.percentage_change)}
                        </span>{' '}
                        from last month
                      </p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Gigs Booked */}
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Gigs Booked</p>
                      <p className="mt-1 text-2xl font-bold text-foreground">
                        {data.gigs_booked.count}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {data.gigs_booked.timeframe}
                      </p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                      <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Profile Views */}
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Profile Views</p>
                      <p className="mt-1 text-2xl font-bold text-foreground">
                        {data.profile_views.count}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        <span
                          className={
                            data.profile_views.percentage_change >= 0
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }
                        >
                          {formatPercentage(data.profile_views.percentage_change)}
                        </span>{' '}
                        this week
                      </p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                      <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* New Opportunities Section */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">New Opportunities</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-purple-600 hover:text-purple-700 dark:text-purple-400"
                  onClick={() => navigate('/marketplace/gigs')}
                >
                  View All
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.opportunities && data.opportunities.length > 0 ? (
                  data.opportunities.slice(0, 3).map((opportunity, index) => (
                    <Card
                      key={opportunity.id}
                      className="group cursor-pointer overflow-hidden border-border/50 transition-all hover:border-purple-300 hover:shadow-lg dark:hover:border-purple-700"
                      onClick={() => navigate(`/marketplace/gigs/${opportunity.id}`)}
                    >
                      {/* Venue Image */}
                      <div className="relative h-32 overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30">
                        <img
                          src={venueImages[index % venueImages.length]}
                          alt={opportunity.venue_name}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                        {opportunity.urgency_flag && (
                          <Badge className="absolute right-2 top-2 bg-red-500 text-white">
                            Urgent
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-foreground">{opportunity.venue_name}</h3>
                        <p className="text-sm text-muted-foreground">{opportunity.title}</p>
                        <div className="mt-3 flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{formatDate(opportunity.date)}</span>
                          </div>
                          <div className="flex items-center gap-1 font-semibold text-purple-600 dark:text-purple-400">
                            <DollarSign className="h-3.5 w-3.5" />
                            <span>{formatCurrency(opportunity.payment_amount).slice(1)}</span>
                          </div>
                        </div>
                        <Button
                          className="mt-4 w-full bg-purple-500 hover:bg-purple-600"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/marketplace/gigs/${opportunity.id}`)
                          }}
                        >
                          Apply
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="col-span-full border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Search className="mb-4 h-12 w-12 text-muted-foreground/50" />
                      <p className="text-muted-foreground">No opportunities available right now</p>
                      <Button
                        variant="link"
                        className="mt-2 text-purple-600"
                        onClick={() => navigate('/marketplace/gigs')}
                      >
                        Browse all gigs
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Violet AI Banner */}
            <Card className="overflow-hidden border-purple-200 bg-gradient-to-r from-purple-500 to-purple-600 dark:border-purple-800 dark:from-purple-600 dark:to-purple-700">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
                    <Sparkles className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">
                      What do you want help with today?
                    </h3>
                    <p className="text-sm text-white/80">
                      Ask me anything about gigs, collaborations, or growing your career
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    className="bg-white text-purple-600 hover:bg-white/90"
                    onClick={() => navigate('/violet')}
                  >
                    Ask Violet
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Right Column */}
          <div className="w-full space-y-6 lg:w-80">
            {/* Messages Widget */}
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base font-semibold">Messages</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => navigate('/messages')}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="pt-0">
                {data.messages && data.messages.length > 0 ? (
                  <div className="space-y-3">
                    {data.messages.slice(0, 3).map((message) => (
                      <div
                        key={message.conversation_id}
                        className="flex cursor-pointer items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
                        onClick={() => navigate(`/messages/${message.conversation_id}`)}
                      >
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-purple-100 text-xs text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                            {getInitials(message.sender_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-sm font-medium">{message.sender_name}</p>
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(message.timestamp)}
                            </span>
                          </div>
                          <p className="truncate text-xs text-muted-foreground">
                            {message.preview_text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-muted-foreground">
                    <MessageCircle className="mx-auto mb-2 h-8 w-8 opacity-50" />
                    <p className="text-sm">No messages yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Endorsements Widget */}
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  Recent Endorsements
                  <Star className="h-4 w-4 text-yellow-500" />
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {data.endorsements && data.endorsements.length > 0 ? (
                  <div className="space-y-3">
                    {data.endorsements.slice(0, 3).map((endorsement) => (
                      <div key={endorsement.id} className="flex items-start gap-3">
                        <Avatar className="h-9 w-9">
                          {endorsement.endorser_avatar_url ? (
                            <AvatarImage src={endorsement.endorser_avatar_url} />
                          ) : null}
                          <AvatarFallback className="bg-purple-100 text-xs text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                            {getInitials(endorsement.endorser_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{endorsement.endorser_name}</p>
                          <p className="text-xs text-muted-foreground">"{endorsement.skill}"</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-muted-foreground">
                    <Star className="mx-auto mb-2 h-8 w-8 opacity-50" />
                    <p className="text-sm">No endorsements yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions Widget */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-border/50 hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-950 dark:hover:text-purple-300"
                    onClick={() => navigate('/marketplace/gigs')}
                  >
                    <Search className="mr-3 h-4 w-4" />
                    Find Gigs
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-border/50 hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-950 dark:hover:text-purple-300"
                    onClick={() => navigate('/marketplace/artists')}
                  >
                    <Users className="mr-3 h-4 w-4" />
                    Find Collaborators
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-border/50 hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-950 dark:hover:text-purple-300"
                    onClick={() => navigate('/growth')}
                  >
                    <BarChart3 className="mr-3 h-4 w-4" />
                    View Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
