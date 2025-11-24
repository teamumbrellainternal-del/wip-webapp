import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  TrendingUp,
  DollarSign,
  Eye,
  Calendar,
  Target,
  Award,
  BarChart3,
  Users,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Lightbulb,
} from 'lucide-react'
import LoadingState from '@/components/common/LoadingState'
import ErrorState from '@/components/common/ErrorState'
import { analyticsService } from '@/services/api'
import type { DashboardMetrics, PerformanceData, Goal, Achievement } from '@/types'
import { MetaTags } from '@/components/MetaTags'

/**
 * Growth & Analytics Page
 *
 * Comprehensive analytics dashboard for tracking artist growth,
 * performance metrics, goals, and achievements.
 */
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

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  const formatPercentage = (percentage: number) => {
    const sign = percentage >= 0 ? '+' : ''
    return `${sign}${percentage}%`
  }

  const isPositiveChange = (percentage: number) => percentage >= 0

  // Loading State
  if (loading) {
    return (
      <AppLayout>
        <LoadingState message="Loading analytics..." />
      </AppLayout>
    )
  }

  // Error State
  if (error) {
    return (
      <AppLayout>
        <ErrorState error={error} retry={fetchAnalyticsData} />
      </AppLayout>
    )
  }

  const activeGoals = goals.filter((g) => g.status === 'active')
  const completedGoals = goals.filter((g) => g.status === 'completed')
  const unlockedAchievements = achievements.filter((a) => a.unlocked_at)

  return (
    <AppLayout>
      <MetaTags
        title="Growth & Analytics"
        description="Track your performance, goals, and achievements"
        url="/growth"
      />

      <div className="container mx-auto max-w-7xl space-y-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Growth & Analytics</h1>
            <p className="mt-2 text-muted-foreground">
              Track your performance and reach your goals
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={timePeriod === 'monthly' ? 'default' : 'outline'}
              onClick={() => setTimePeriod('monthly')}
            >
              Monthly
            </Button>
            <Button
              variant={timePeriod === 'yearly' ? 'default' : 'outline'}
              onClick={() => setTimePeriod('yearly')}
            >
              Yearly
            </Button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        {metrics && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Earnings */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Earnings</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(metrics.earnings.current_month)}
                </div>
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  {isPositiveChange(metrics.earnings.percentage_change) ? (
                    <ArrowUpRight className="h-3 w-3 text-green-600" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-600" />
                  )}
                  <span
                    className={
                      isPositiveChange(metrics.earnings.percentage_change)
                        ? 'text-green-600'
                        : 'text-red-600'
                    }
                  >
                    {formatPercentage(metrics.earnings.percentage_change)}
                  </span>
                  <span>from last month</span>
                </div>
              </CardContent>
            </Card>

            {/* Gigs Booked */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gigs Booked</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.gigs_booked.count}</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {metrics.gigs_booked.timeframe}
                </p>
              </CardContent>
            </Card>

            {/* Profile Views */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(metrics.profile_views.count)}
                </div>
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  {isPositiveChange(metrics.profile_views.percentage_change) ? (
                    <ArrowUpRight className="h-3 w-3 text-green-600" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-600" />
                  )}
                  <span
                    className={
                      isPositiveChange(metrics.profile_views.percentage_change)
                        ? 'text-green-600'
                        : 'text-red-600'
                    }
                  >
                    {formatPercentage(metrics.profile_views.percentage_change)}
                  </span>
                  <span>from last month</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Performance Charts */}
        {performance && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance Trends
              </CardTitle>
              <CardDescription>
                Track your growth over time (
                {timePeriod === 'monthly' ? 'Last 12 months' : 'Last 5 years'})
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Simple chart representation - can be replaced with recharts */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Earnings Trend</h4>
                <div className="flex h-40 items-end gap-2">
                  {performance.earnings.slice(0, 12).map((point, i) => {
                    const maxValue = Math.max(...performance.earnings.map((p) => p.value))
                    const height = maxValue > 0 ? (point.value / maxValue) * 100 : 0
                    return (
                      <div key={i} className="flex flex-1 flex-col items-center gap-1">
                        <div
                          className="w-full rounded-t bg-primary transition-all hover:opacity-80"
                          style={{ height: `${height}%` }}
                          title={`${point.date}: ${formatCurrency(point.value)}`}
                        />
                        <span className="origin-left rotate-45 text-xs text-muted-foreground">
                          {new Date(point.date).toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Profile Views Trend</h4>
                <div className="flex h-40 items-end gap-2">
                  {performance.profile_views.slice(0, 12).map((point, i) => {
                    const maxValue = Math.max(...performance.profile_views.map((p) => p.value))
                    const height = maxValue > 0 ? (point.value / maxValue) * 100 : 0
                    return (
                      <div key={i} className="flex flex-1 flex-col items-center gap-1">
                        <div
                          className="w-full rounded-t bg-blue-500 transition-all hover:opacity-80"
                          style={{ height: `${height}%` }}
                          title={`${point.date}: ${formatNumber(point.value)} views`}
                        />
                        <span className="origin-left rotate-45 text-xs text-muted-foreground">
                          {new Date(point.date).toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Goals & Achievements Tabs */}
        <Tabs defaultValue="goals" className="space-y-4">
          <TabsList>
            <TabsTrigger value="goals" className="gap-2">
              <Target className="h-4 w-4" />
              Goals ({activeGoals.length})
            </TabsTrigger>
            <TabsTrigger value="achievements" className="gap-2">
              <Award className="h-4 w-4" />
              Achievements ({unlockedAchievements.length})
            </TabsTrigger>
            <TabsTrigger value="insights" className="gap-2">
              <Lightbulb className="h-4 w-4" />
              Insights
            </TabsTrigger>
          </TabsList>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-4">
            {activeGoals.length === 0 && completedGoals.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Target className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">No goals set yet</p>
                  <Button className="mt-4" variant="outline">
                    Create Your First Goal
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {activeGoals.map((goal) => {
                  const progressPercent = (goal.current_value / goal.target_value) * 100
                  return (
                    <Card key={goal.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle>{goal.title}</CardTitle>
                            {goal.description && (
                              <CardDescription className="mt-1">{goal.description}</CardDescription>
                            )}
                          </div>
                          <Badge variant="default">Active</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="mb-2 flex justify-between text-sm">
                            <span>Progress</span>
                            <span className="font-medium">
                              {goal.current_value} / {goal.target_value} {goal.unit}
                            </span>
                          </div>
                          <Progress value={progressPercent} className="h-2" />
                        </div>
                        {goal.deadline && (
                          <p className="text-sm text-muted-foreground">
                            Deadline: {new Date(goal.deadline).toLocaleDateString()}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}

                {completedGoals.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground">Completed Goals</h3>
                    {completedGoals.map((goal) => (
                      <Card key={goal.id} className="opacity-75">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">{goal.title}</CardTitle>
                            <Badge variant="secondary">Completed</Badge>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {achievements.map((achievement) => {
                const isUnlocked = !!achievement.unlocked_at
                const hasProgress =
                  achievement.progress_target && achievement.progress_current !== undefined

                return (
                  <Card key={achievement.id} className={!isUnlocked ? 'opacity-50' : ''}>
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-primary/10 p-2">
                          <Award
                            className={`h-6 w-6 ${isUnlocked ? 'text-yellow-500' : 'text-muted-foreground'}`}
                          />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-base">{achievement.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {achievement.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    {hasProgress && !isUnlocked && (
                      <CardContent>
                        <Progress
                          value={
                            (achievement.progress_current! / achievement.progress_target!) * 100
                          }
                          className="h-2"
                        />
                        <p className="mt-2 text-xs text-muted-foreground">
                          {achievement.progress_current} / {achievement.progress_target}
                        </p>
                      </CardContent>
                    )}
                    {isUnlocked && (
                      <CardContent>
                        <p className="text-xs text-muted-foreground">
                          Unlocked {new Date(achievement.unlocked_at!).toLocaleDateString()}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Growth Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-4">
                    <Lightbulb className="mt-0.5 h-5 w-5 text-primary" />
                    <div>
                      <h4 className="mb-1 font-medium">Complete Your Profile</h4>
                      <p className="text-sm text-muted-foreground">
                        Artists with complete profiles get 3x more gig opportunities. Add more
                        media, update your bio, and showcase your best work.
                      </p>
                      <Button
                        variant="link"
                        className="mt-2 px-0"
                        onClick={() => navigate('/profile/edit')}
                      >
                        Update Profile →
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-4">
                    <Users className="mt-0.5 h-5 w-5 text-primary" />
                    <div>
                      <h4 className="mb-1 font-medium">Engage With Your Audience</h4>
                      <p className="text-sm text-muted-foreground">
                        Share updates and connect with fans through broadcast messages. Regular
                        engagement leads to higher booking rates.
                      </p>
                      <Button
                        variant="link"
                        className="mt-2 px-0"
                        onClick={() => navigate('/tools/message-fans')}
                      >
                        Send Update →
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-4">
                    <TrendingUp className="mt-0.5 h-5 w-5 text-primary" />
                    <div>
                      <h4 className="mb-1 font-medium">Apply to More Gigs</h4>
                      <p className="text-sm text-muted-foreground">
                        Active artists who apply to 5+ gigs per week are 2x more likely to land
                        bookings. Check out the marketplace for new opportunities.
                      </p>
                      <Button
                        variant="link"
                        className="mt-2 px-0"
                        onClick={() => navigate('/marketplace/gigs')}
                      >
                        Browse Gigs →
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
