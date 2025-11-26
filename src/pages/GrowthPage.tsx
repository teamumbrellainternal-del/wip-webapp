import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Target,
  Award,
  Users,
  ArrowLeft,
  Star,
  Plus,
  Search,
  Sparkles,
  CheckCircle2,
  Trophy,
  Mic2,
  Heart,
  Building2,
  Repeat,
} from 'lucide-react'
import LoadingState from '@/components/common/LoadingState'
import ErrorState from '@/components/common/ErrorState'
import { analyticsService } from '@/services/api'
import type { DashboardMetrics, PerformanceData, Goal, Achievement } from '@/types'
import { MetaTags } from '@/components/MetaTags'

// Mock data for Figma design elements not in API
const MOCK_MONTHLY_DATA = [
  { month: 'Jan', revenue: 1800, gigs: 5, fans: 120 },
  { month: 'Feb', revenue: 2400, gigs: 8, fans: 180 },
  { month: 'Mar', revenue: 2100, gigs: 6, fans: 220 },
  { month: 'Apr', revenue: 3200, gigs: 12, fans: 320 },
  { month: 'May', revenue: 2800, gigs: 9, fans: 380 },
  { month: 'Jun', revenue: 3600, gigs: 14, fans: 450 },
]

const MOCK_ACHIEVEMENTS = [
  { id: '1', title: 'First Gig', description: 'Complete your first booking', icon: Mic2, unlocked: true },
  { id: '2', title: 'Five Star Rating', description: 'Maintain 5.0 rating for 5 gigs', icon: Star, unlocked: true },
  { id: '3', title: 'Rising Star', description: 'Get 10 venue endorsements', icon: TrendingUp, unlocked: true },
  { id: '4', title: 'Concert Hall', description: 'Perform at a 500+ capacity venue', icon: Building2, unlocked: false },
  { id: '5', title: 'Monthly Regular', description: 'Book 10 gigs in one month', icon: Calendar, unlocked: false },
  { id: '6', title: 'Collaboration Master', description: 'Complete 5 artist collaborations', icon: Repeat, unlocked: false },
]

const MOCK_SPOTLIGHT = [
  { id: '1', name: 'Maya Chen', genre: 'Jazz Fusion', rating: 4.9, gigs: 24, rank: 1, image: null },
  { id: '2', name: 'The Velvet Sounds', genre: 'Soul/R&B', rating: 4.8, gigs: 18, rank: 2, image: null },
  { id: '3', name: 'Alex Rivers', genre: 'Acoustic Folk', rating: 4.7, gigs: 15, rank: 3, image: null },
]

const MOCK_GOALS = [
  { id: '1', title: 'Increase monthly revenue to $5,000', current: 3200, target: 5000, unit: '$' },
  { id: '2', title: 'Gain 100 new fans this quarter', current: 78, target: 100, unit: '' },
  { id: '3', title: 'Achieve 50 total gig bookings', current: 20, target: 50, unit: '' },
  { id: '4', title: 'Get verified artist status', current: 90, target: 100, unit: '%' },
]

export default function GrowthPage() {
  const navigate = useNavigate()

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [performance, setPerformance] = useState<PerformanceData | null>(null)
  const [goals, setGoals] = useState<Goal[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [timePeriod, setTimePeriod] = useState<'monthly' | 'yearly'>('monthly')

  useEffect(() => {
    fetchAnalyticsData()
  }, [timePeriod])

  const fetchAnalyticsData = async () => {
    setLoading(true)
    setError(null)

    try {
      const [metricsData, performanceData, goalsData, achievementsData] = await Promise.all([
        analyticsService.getDashboard(),
        analyticsService.getPerformance(timePeriod),
        analyticsService.getGoals(),
        analyticsService.getAchievements(),
      ])

      setMetrics(metricsData)
      setPerformance(performanceData)
      setGoals(goalsData)
      setAchievements(achievementsData)
    } catch (err) {
      setError(err as Error)
      console.error('Failed to fetch analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <AppLayout>
        <LoadingState message="Loading analytics..." />
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <ErrorState error={error} retry={fetchAnalyticsData} />
      </AppLayout>
    )
  }

  // Get peak values
  const peakRevenue = Math.max(...MOCK_MONTHLY_DATA.map((d) => d.revenue))
  const peakGigs = Math.max(...MOCK_MONTHLY_DATA.map((d) => d.gigs))
  const peakFans = Math.max(...MOCK_MONTHLY_DATA.map((d) => d.fans))

  return (
    <AppLayout>
      <MetaTags
        title="Growth & Analytics"
        description="Track your performance, goals, and achievements"
        url="/growth"
        noIndex={true}
      />

      <div className="flex h-[calc(100vh-4rem)] flex-col">
        {/* Header */}
        <div className="border-b border-border/50 bg-background px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Growth & Analytics</h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Column - Main Analytics */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6">
                {/* Stats Cards */}
                <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                  {/* Total Revenue */}
                  <Card className="border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Revenue</p>
                          <p className="text-2xl font-bold text-foreground">$9,520</p>
                          <p className="text-xs text-green-600">+22% from last quarter</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                          <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Gigs Completed */}
                  <Card className="border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Gigs Completed</p>
                          <p className="text-2xl font-bold text-foreground">31</p>
                          <p className="text-xs text-green-600">+8 this month</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                          <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Average Rating */}
                  <Card className="border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Average Rating</p>
                          <p className="text-2xl font-bold text-foreground">4.8</p>
                          <p className="text-xs text-green-600">+0.2 this month</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                          <Star className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Fan Reach */}
                  <Card className="border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Fan Reach</p>
                          <p className="text-2xl font-bold text-foreground">840</p>
                          <p className="text-xs text-green-600">+156 this month</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                          <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Performance Analytics */}
                <Card className="mb-6 border-border/50">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Performance Analytics</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={timePeriod === 'monthly' ? 'default' : 'outline'}
                          size="sm"
                          className={timePeriod === 'monthly' ? 'bg-purple-500 hover:bg-purple-600' : ''}
              onClick={() => setTimePeriod('monthly')}
            >
              Monthly
            </Button>
            <Button
              variant={timePeriod === 'yearly' ? 'default' : 'outline'}
                          size="sm"
                          className={timePeriod === 'yearly' ? 'bg-purple-500 hover:bg-purple-600' : ''}
              onClick={() => setTimePeriod('yearly')}
            >
              Yearly
            </Button>
          </div>
        </div>
              </CardHeader>
              <CardContent>
                    {/* Chart Grid */}
                    <div className="mb-4 grid grid-cols-6 gap-4">
                      {MOCK_MONTHLY_DATA.map((data) => (
                        <div key={data.month} className="text-center">
                          <div className="mb-2 text-sm font-medium text-foreground">{data.month}</div>
                          <div className="mb-1 rounded-lg bg-purple-100 px-2 py-1 dark:bg-purple-900/30">
                            <span className="text-xs text-muted-foreground">Revenue</span>
                            <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                              ${data.revenue.toLocaleString()}
                            </p>
                          </div>
                          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                            <div className="flex justify-between">
                              <span>Gigs</span>
                              <span className="font-medium text-foreground">{data.gigs}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Fans</span>
                              <span className="font-medium text-foreground">{data.fans}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Peak Stats */}
                    <div className="grid grid-cols-3 gap-4 border-t pt-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Peak Revenue</p>
                        <p className="text-lg font-bold text-foreground">${peakRevenue.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Peak Gigs</p>
                        <p className="text-lg font-bold text-foreground">{peakGigs}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Peak Fans</p>
                        <p className="text-lg font-bold text-foreground">{peakFans}</p>
                </div>
                </div>
              </CardContent>
            </Card>

                {/* Goals Section */}
                <Card className="mb-6 border-border/50">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Your Goals</CardTitle>
                      <Button size="sm" variant="outline" className="gap-1.5">
                        <Plus className="h-4 w-4" />
                        Set New Goal
                      </Button>
                    </div>
              </CardHeader>
                  <CardContent className="space-y-4">
                    {MOCK_GOALS.map((goal) => {
                      const percentage = Math.round((goal.current / goal.target) * 100)
                      return (
                        <div key={goal.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium">{goal.title}</h4>
                            <span className="text-sm text-muted-foreground">
                              {goal.unit === '$' ? `$${goal.current.toLocaleString()}` : goal.current}
                              {' of '}
                              {goal.unit === '$' ? `$${goal.target.toLocaleString()}` : goal.target}
                              {goal.unit === '%' ? '%' : ''}
                            </span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                          <p className="text-xs text-muted-foreground">{percentage}% complete</p>
                        </div>
                      )
                    })}
              </CardContent>
            </Card>

                {/* Verified Status */}
                <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 dark:border-purple-800 dark:from-purple-950 dark:to-pink-950">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500">
                      <CheckCircle2 className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">Your Verified Status</h3>
                      <p className="text-sm text-muted-foreground">You're a verified artist on Umbrella!</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                          Identity Verified
                        </Badge>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                          Performance History
                        </Badge>
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                          Quality Reviews
                        </Badge>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                        <span className="text-2xl font-bold">4.8</span>
                </div>
                      <p className="text-xs text-muted-foreground">avg rating</p>
                </div>
              </CardContent>
            </Card>
          </div>
            </ScrollArea>
          </div>

          {/* Right Sidebar */}
          <div className="hidden w-80 flex-shrink-0 border-l border-border/50 bg-card/30 lg:block">
            <ScrollArea className="h-full">
              <div className="p-6 space-y-6">
                {/* Achievements */}
                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    <h3 className="font-semibold">Achievements</h3>
                  </div>
                  <div className="space-y-3">
                    {MOCK_ACHIEVEMENTS.map((achievement) => {
                      const Icon = achievement.icon
                    return (
                        <div
                          key={achievement.id}
                          className={`flex items-center gap-3 rounded-lg p-3 ${
                            achievement.unlocked
                              ? 'bg-amber-50 dark:bg-amber-900/20'
                              : 'bg-muted/50 opacity-60'
                          }`}
                        >
                        <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full ${
                              achievement.unlocked
                                ? 'bg-amber-100 dark:bg-amber-900/30'
                                : 'bg-muted'
                            }`}
                          >
                            <Icon
                              className={`h-5 w-5 ${
                                achievement.unlocked
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : 'text-muted-foreground'
                              }`}
                        />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">{achievement.title}</h4>
                            <p className="text-xs text-muted-foreground">{achievement.description}</p>
                          </div>
                      </div>
                    )
                  })}
                </div>
              </div>

                {/* Spotlight Artists */}
                          <div>
                  <div className="mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    <h3 className="font-semibold">Spotlight Artists</h3>
                          </div>
                  <p className="mb-3 text-xs text-muted-foreground">Top performers this week</p>
                  <div className="space-y-3">
                    {MOCK_SPOTLIGHT.map((artist) => (
                      <div key={artist.id} className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={artist.image || undefined} />
                          <AvatarFallback className="bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                            {artist.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium">{artist.name}</h4>
                          <p className="text-xs text-muted-foreground">{artist.genre}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-0.5">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              {artist.rating}
                            </span>
                            <span>•</span>
                            <span>{artist.gigs} gigs</span>
                          </div>
                        </div>
                        <Badge
                          variant="secondary"
                          className={`h-6 w-6 rounded-full p-0 text-center ${
                            artist.rank === 1
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                              : artist.rank === 2
                                ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                          }`}
                        >
                          {artist.rank}
                        </Badge>
                          </div>
                    ))}
                  </div>
            </div>

                {/* Boost Your Growth */}
                    <div>
                  <h3 className="mb-4 font-semibold">Boost Your Growth</h3>
                  <div className="space-y-2">
                      <Button
                      variant="outline"
                      className="w-full justify-start gap-2 border-border/50"
                      onClick={() => navigate('/marketplace/gigs')}
                      >
                      <Search className="h-4 w-4" />
                      Find More Gigs
                      </Button>
                      <Button
                      variant="outline"
                      className="w-full justify-start gap-2 border-border/50"
                      onClick={() => navigate('/violet')}
                      >
                      <Sparkles className="h-4 w-4" />
                      Get AI Insights
                      </Button>
                      <Button
                      variant="outline"
                      className="w-full justify-start gap-2 border-border/50"
                      onClick={() => navigate('/marketplace?tab=artists')}
                      >
                      <Users className="h-4 w-4" />
                      Network & Collaborate
                      </Button>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
