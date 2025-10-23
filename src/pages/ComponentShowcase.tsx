import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ThemeToggle } from '@/components/theme-toggle'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Music, Mic, Calendar, Users, TrendingUp, Star } from 'lucide-react'

export default function ComponentShowcase() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Umbrella Design System</h1>
            <p className="text-muted-foreground">
              Artist marketplace UI components built with shadcn/ui
            </p>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Brand Colors */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Brand Colors</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <div className="h-20 bg-purple-600 rounded-lg shadow-sm" />
                  <p className="text-sm font-medium">Primary</p>
                  <p className="text-xs text-muted-foreground font-mono">#9333EA</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 bg-purple-100 dark:bg-purple-900 rounded-lg shadow-sm" />
                  <p className="text-sm font-medium">Primary Light</p>
                  <p className="text-xs text-muted-foreground font-mono">#F3E8FF</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 bg-slate-900 dark:bg-slate-100 rounded-lg shadow-sm" />
                  <p className="text-sm font-medium">Foreground</p>
                  <p className="text-xs text-muted-foreground font-mono">#0F172A</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 bg-slate-100 dark:bg-slate-900 rounded-lg shadow-sm" />
                  <p className="text-sm font-medium">Background</p>
                  <p className="text-xs text-muted-foreground font-mono">#F8FAFC</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 bg-amber-500 rounded-lg shadow-sm" />
                  <p className="text-sm font-medium">Accent</p>
                  <p className="text-xs text-muted-foreground font-mono">#F59E0B</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Typography */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Typography</h2>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <h1 className="text-4xl font-bold tracking-tight">Heading 1</h1>
                <p className="text-sm text-muted-foreground font-mono">text-4xl font-bold</p>
              </div>
              <Separator />
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Heading 2</h2>
                <p className="text-sm text-muted-foreground font-mono">text-3xl font-bold</p>
              </div>
              <Separator />
              <div>
                <h3 className="text-2xl font-semibold tracking-tight">Heading 3</h3>
                <p className="text-sm text-muted-foreground font-mono">text-2xl font-semibold</p>
              </div>
              <Separator />
              <div>
                <p className="text-base">
                  Body text: The quick brown fox jumps over the lazy dog. This is how regular
                  paragraph text will appear throughout the application.
                </p>
                <p className="text-sm text-muted-foreground font-mono">text-base</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">
                  Secondary text: Used for supporting information and metadata.
                </p>
                <p className="text-sm text-muted-foreground font-mono">text-sm text-muted-foreground</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Buttons */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Buttons</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Variants</p>
                  <div className="flex flex-wrap gap-2">
                    <Button>Default</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="link">Link</Button>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium mb-2">Sizes</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button size="sm">Small</Button>
                    <Button size="default">Default</Button>
                    <Button size="lg">Large</Button>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium mb-2">With Icons</p>
                  <div className="flex flex-wrap gap-2">
                    <Button>
                      <Music className="mr-2 h-4 w-4" />
                      Play Track
                    </Button>
                    <Button variant="outline">
                      <Calendar className="mr-2 h-4 w-4" />
                      Book Gig
                    </Button>
                    <Button variant="secondary">
                      <Users className="mr-2 h-4 w-4" />
                      Find Artists
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Cards & Badges */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Cards & Badges</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Artist Profile</CardTitle>
                <CardDescription>Example profile card</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarFallback>DJ</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <p className="font-medium">DJ Eclipse</p>
                    <div className="flex gap-1">
                      <Badge>Verified</Badge>
                      <Badge variant="secondary">House</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gig Opportunity</CardTitle>
                <CardDescription>Marketplace listing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Friday Night</span>
                    <Badge variant="destructive">Urgent</Badge>
                  </div>
                  <p className="text-2xl font-bold">$800</p>
                  <p className="text-sm text-muted-foreground">The Blue Note SF</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>Performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Profile Views</span>
                    <span className="text-2xl font-bold">127</span>
                  </div>
                  <div className="flex items-center text-sm text-green-600">
                    <TrendingUp className="mr-1 h-4 w-4" />
                    +18% this week
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Form Inputs */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Form Inputs</h2>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="artist@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Input id="bio" placeholder="Tell us about your music..." />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="notifications" />
                <Label htmlFor="notifications">Enable notifications</Label>
              </div>
              <div className="space-y-2">
                <Label>Price Range</Label>
                <Slider defaultValue={[50]} max={100} step={1} />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Alerts */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Alerts</h2>
          <div className="space-y-4">
            <Alert>
              <Star className="h-4 w-4" />
              <AlertTitle>Profile Complete!</AlertTitle>
              <AlertDescription>
                Your profile is 100% complete. You're ready to start booking gigs.
              </AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <AlertTitle>Payment Required</AlertTitle>
              <AlertDescription>
                Your subscription has expired. Please update your payment method.
              </AlertDescription>
            </Alert>
          </div>
        </section>

        {/* Tabs Example */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Tabs</h2>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Overview Tab</CardTitle>
                  <CardDescription>This is what the overview tab looks like</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Tab content goes here. This demonstrates the 6-tab profile system we'll
                    build for artist profiles.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="portfolio" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Tab</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Music tracks will be listed here.</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="reviews" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Reviews Tab</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Client reviews will appear here.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>
      </div>

      {/* Footer */}
      <div className="border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>Umbrella Design System • Built with shadcn/ui + Tailwind CSS</p>
        </div>
      </div>
    </div>
  )
}
