import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  Star
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
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return formatDate(timestamp)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <AppLayout>
      <MetaTags
        title="Dashboard"
        description="Your artist dashboard on Umbrella. Manage your gigs, track your performance, and grow your music career."
        url="/dashboard"
        noIndex={true}
      />
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user.name}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening in your music world
          </p>
        </div>

        {/* Onboarding Alert */}
        {!user.onboarding_complete && (
          <Card className="border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold mb-1">Complete Your Profile</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Finish setting up your artist profile to start booking gigs
                  </p>
                  <Button onClick={() => navigate('/onboarding')}>
                    Continue Onboarding
                  </Button>
                </div>
                <Badge variant="secondary">Setup Required</Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Metrics Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* This Month Earnings */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <span className="text-lg">💰</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(data.earnings.current_month)}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className={data.earnings.percentage_change >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {formatPercentage(data.earnings.percentage_change)}
                </span>{' '}
                from last month
              </p>
            </CardContent>
          </Card>

          {/* Gigs Booked */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gigs Booked</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.gigs_booked.count}</div>
              <p className="text-xs text-muted-foreground">
                {data.gigs_booked.timeframe}
              </p>
            </CardContent>
          </Card>

          {/* Profile Views */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.profile_views.count}</div>
              <p className="text-xs text-muted-foreground">
                <span className={data.profile_views.percentage_change >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {formatPercentage(data.profile_views.percentage_change)}
                </span>{' '}
                this week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* New Opportunities Section */}
        {data.opportunities && data.opportunities.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">New Opportunities</h2>
              <Button variant="link" onClick={() => navigate('/marketplace/gigs')}>
                View All →
              </Button>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {data.opportunities.slice(0, 3).map((opportunity) => (
                <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{opportunity.title}</CardTitle>
                        <CardDescription>{opportunity.venue_name}</CardDescription>
                      </div>
                      {opportunity.urgency_flag && (
                        <Badge variant="destructive">Urgent</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Payment</span>
                        <span className="font-semibold">
                          {formatCurrency(opportunity.payment_amount)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Date</span>
                        <span>{formatDate(opportunity.date)}</span>
                      </div>
                      {opportunity.match_score && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Match</span>
                          <span className="text-purple-600 font-medium">
                            {opportunity.match_score}%
                          </span>
                        </div>
                      )}
                      <Button
                        className="w-full mt-4"
                        size="sm"
                        onClick={() => navigate(`/marketplace/gigs/${opportunity.id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Messages & Endorsements Row */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Messages Widget */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Recent Messages
                </CardTitle>
                <CardDescription>Latest conversations</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/messages')}
              >
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {data.messages && data.messages.length > 0 ? (
                <div className="space-y-4">
                  {data.messages.slice(0, 3).map((message) => (
                    <div
                      key={message.conversation_id}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/messages/${message.conversation_id}`)}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {getInitials(message.sender_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-sm truncate">
                            {message.sender_name}
                          </p>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatTimestamp(message.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {message.preview_text}
                        </p>
                        {message.unread && (
                          <Badge variant="default" className="mt-1">
                            New
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No messages yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Endorsements Widget */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Recent Endorsements
                </CardTitle>
                <CardDescription>What others are saying</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/profile/edit')}
              >
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {data.endorsements && data.endorsements.length > 0 ? (
                <div className="space-y-4">
                  {data.endorsements.slice(0, 3).map((endorsement) => (
                    <div
                      key={endorsement.id}
                      className="p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          {endorsement.endorser_avatar_url ? (
                            <AvatarImage src={endorsement.endorser_avatar_url} />
                          ) : null}
                          <AvatarFallback>
                            {getInitials(endorsement.endorser_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium text-sm">
                              {endorsement.endorser_name}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(endorsement.created_at)}
                            </span>
                          </div>
                          <Badge variant="secondary" className="mt-1 mb-2">
                            {endorsement.skill}
                          </Badge>
                          {endorsement.comment && (
                            <p className="text-sm text-muted-foreground">
                              "{endorsement.comment}"
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Star className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No endorsements yet</p>
                  <p className="text-xs mt-1">
                    Build your reputation by completing gigs
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Widget */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with these popular features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col items-center gap-2"
                onClick={() => navigate('/marketplace/gigs')}
              >
                <Search className="h-6 w-6" />
                <div className="text-center">
                  <p className="font-semibold">Find Gigs</p>
                  <p className="text-xs text-muted-foreground">
                    Discover new opportunities
                  </p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col items-center gap-2"
                onClick={() => navigate('/marketplace/artists')}
              >
                <Users className="h-6 w-6" />
                <div className="text-center">
                  <p className="font-semibold">Find Collaborators</p>
                  <p className="text-xs text-muted-foreground">
                    Connect with other artists
                  </p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col items-center gap-2"
                onClick={() => navigate('/growth')}
              >
                <BarChart3 className="h-6 w-6" />
                <div className="text-center">
                  <p className="font-semibold">View Analytics</p>
                  <p className="text-xs text-muted-foreground">
                    Track your performance
                  </p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Violet AI Prompt Section */}
        <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-purple-600 dark:bg-purple-500 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1 flex items-center gap-2">
                  Need help? Ask Violet
                  <Badge variant="secondary" className="bg-purple-200 dark:bg-purple-800">
                    AI Assistant
                  </Badge>
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get personalized recommendations, optimize your profile, or find the perfect gig
                </p>
                <Button
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => navigate('/violet')}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Open Violet
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
