import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Music, Building2, Heart } from 'lucide-react'

/**
 * Role Selection Page
 *
 * Allows new users to choose their role in the Umbrella platform.
 * Currently only Artist role is supported (MVP).
 * Venue Owner and Fan roles are coming soon.
 */
export default function RoleSelectionPage() {
  const navigate = useNavigate()

  const handleArtistSelect = () => {
    navigate('/onboarding/artists/step1')
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="container max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Welcome to Umbrella
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose your role to get started and unlock the full potential of the platform
          </p>
        </div>

        {/* Role Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Artist Card - Active */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary relative group"
            onClick={handleArtistSelect}
          >
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Music className="h-10 w-10 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl mb-2">Artist</CardTitle>
                <CardDescription className="text-base">
                  Musicians, DJs, Producers, and Performers
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <ul className="text-sm text-muted-foreground space-y-2 text-left">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Find gigs and performance opportunities</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Build your professional profile</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Connect with venues and fans</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Manage files and creative projects</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>AI-powered career toolkit</span>
                </li>
              </ul>
              <div className="pt-4">
                <Badge variant="default" className="text-sm px-4 py-1">
                  Get Started →
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Venue Owner Card - Coming Soon */}
          <Card className="relative opacity-60 border-2">
            <div className="absolute top-4 right-4">
              <Badge variant="secondary">Coming Soon</Badge>
            </div>
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                <Building2 className="h-10 w-10 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-2xl mb-2">Venue Owner</CardTitle>
                <CardDescription className="text-base">
                  Clubs, Bars, Event Spaces, and Promoters
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <ul className="text-sm text-muted-foreground space-y-2 text-left">
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-0.5">✓</span>
                  <span>Post gig opportunities</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-0.5">✓</span>
                  <span>Discover local talent</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-0.5">✓</span>
                  <span>Manage bookings and calendar</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-0.5">✓</span>
                  <span>Build your venue's reputation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-0.5">✓</span>
                  <span>Analytics and insights</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Fan Card - Coming Soon */}
          <Card className="relative opacity-60 border-2">
            <div className="absolute top-4 right-4">
              <Badge variant="secondary">Coming Soon</Badge>
            </div>
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                <Heart className="h-10 w-10 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-2xl mb-2">Fan</CardTitle>
                <CardDescription className="text-base">
                  Music Lovers and Event Attendees
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <ul className="text-sm text-muted-foreground space-y-2 text-left">
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-0.5">✓</span>
                  <span>Discover new artists and events</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-0.5">✓</span>
                  <span>Follow your favorite artists</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-0.5">✓</span>
                  <span>Get personalized recommendations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-0.5">✓</span>
                  <span>Support local music scene</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-0.5">✓</span>
                  <span>Early access to exclusive content</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Not sure which role fits you?{' '}
            <a href="/help" className="text-primary hover:underline">
              Learn more about each role
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
