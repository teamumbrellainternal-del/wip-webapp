import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, TrendingUp } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'

export default function DashboardPage() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user.full_name}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening in your music world
          </p>
        </div>

        {/* Onboarding Alert */}
        {!user.onboarding_completed && (
          <Card className="border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold mb-1">Complete Your Profile</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Finish setting up your artist profile to start booking gigs
                  </p>
                  <Button>Continue Onboarding</Button>
                </div>
                <Badge variant="secondary">3/5 Steps</Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Metrics */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <span className="text-lg">💰</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$2,400</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+24%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gigs Booked</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">127</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+18%</span> this week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* New Opportunities */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">New Opportunities</h2>
            <Button variant="link">View All →</Button>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">Friday Night Live</CardTitle>
                      <CardDescription>The Blue Note SF</CardDescription>
                    </div>
                    {i === 1 && <Badge variant="destructive">Urgent</Badge>}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Payment</span>
                      <span className="font-semibold">$800</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Date</span>
                      <span>Oct 25, 2025</span>
                    </div>
                    <Button className="w-full mt-4" size="sm">Apply</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Demo Notice */}
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 text-2xl">⚡</div>
              <div>
                <h3 className="font-semibold mb-1">Demo Mode Active</h3>
                <p className="text-sm text-muted-foreground">
                  This is a preview of the Umbrella dashboard. All data is simulated.
                  Full functionality coming soon!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
