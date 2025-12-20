import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Music, Building2, Heart, Loader2 } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { useAuth } from '@/contexts/AuthContext'

/**
 * Role Selection Page
 *
 * Allows new users to choose their role in the Umbrella platform.
 * Persists the selected role to the database before navigating.
 *
 * Supported roles:
 * - Artist: Musicians, DJs, Producers, Performers
 * - Venue Owner: Clubs, Bars, Event Spaces, Promoters
 * - Fan: Music Lovers (Coming Soon)
 */
export default function RoleSelectionPage() {
  const navigate = useNavigate()
  const { checkSession } = useAuth()
  const [isLoading, setIsLoading] = useState<'artist' | 'venue' | null>(null)

  const handleArtistSelect = async () => {
    setIsLoading('artist')
    try {
      await apiClient.updateUserRole('artist')
      // Refresh auth context to get updated role
      await checkSession()
      navigate('/onboarding/artists/step1')
    } catch (error) {
      console.error('Failed to set role:', error)
      // Still navigate - the role might be set by default or can be retried
      navigate('/onboarding/artists/step1')
    } finally {
      setIsLoading(null)
    }
  }

  const handleVenueSelect = async () => {
    setIsLoading('venue')
    try {
      await apiClient.updateUserRole('venue')
      // Refresh auth context to get updated role
      await checkSession()
      // Redirect to venue dashboard (no onboarding flow for venues yet)
      navigate('/venue/dashboard')
    } catch (error) {
      console.error('Failed to set role:', error)
      // Still try to navigate if API call failed
      navigate('/venue/dashboard')
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-12 space-y-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Welcome to Umbrella</h1>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            Choose your role to get started and unlock the full potential of the platform
          </p>
        </div>

        {/* Role Cards Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Artist Card - Active */}
          <Card
            className="group relative cursor-pointer border-2 transition-all hover:border-primary hover:shadow-lg"
            onClick={handleArtistSelect}
          >
            {isLoading === 'artist' && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/80">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            <CardHeader className="space-y-4 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                <Music className="h-10 w-10 text-primary" />
              </div>
              <div>
                <CardTitle className="mb-2 text-2xl">Artist</CardTitle>
                <CardDescription className="text-base">
                  Musicians, DJs, Producers, and Performers
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <ul className="space-y-2 text-left text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-primary">✓</span>
                  <span>Find gigs and performance opportunities</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-primary">✓</span>
                  <span>Build your professional profile</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-primary">✓</span>
                  <span>Connect with venues and fans</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-primary">✓</span>
                  <span>Manage files and creative projects</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-primary">✓</span>
                  <span>AI-powered career toolkit</span>
                </li>
              </ul>
              <div className="pt-4">
                <Badge variant="default" className="px-4 py-1 text-sm">
                  Get Started →
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Venue Owner Card - Now Active */}
          <Card
            className="group relative cursor-pointer border-2 transition-all hover:border-primary hover:shadow-lg"
            onClick={handleVenueSelect}
          >
            {isLoading === 'venue' && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/80">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            <CardHeader className="space-y-4 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                <Building2 className="h-10 w-10 text-primary" />
              </div>
              <div>
                <CardTitle className="mb-2 text-2xl">Venue Owner</CardTitle>
                <CardDescription className="text-base">
                  Clubs, Bars, Event Spaces, and Promoters
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <ul className="space-y-2 text-left text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-primary">✓</span>
                  <span>Post gig opportunities</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-primary">✓</span>
                  <span>Discover local talent</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-primary">✓</span>
                  <span>Manage bookings and calendar</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-primary">✓</span>
                  <span>Build your venue's reputation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-primary">✓</span>
                  <span>Analytics and insights</span>
                </li>
              </ul>
              <div className="pt-4">
                <Badge variant="default" className="px-4 py-1 text-sm">
                  Get Started →
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Fan Card - Coming Soon */}
          <Card className="relative border-2 opacity-60">
            <div className="absolute right-4 top-4">
              <Badge variant="secondary">Coming Soon</Badge>
            </div>
            <CardHeader className="space-y-4 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <Heart className="h-10 w-10 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="mb-2 text-2xl">Fan</CardTitle>
                <CardDescription className="text-base">
                  Music Lovers and Event Attendees
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <ul className="space-y-2 text-left text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-muted-foreground/50">✓</span>
                  <span>Discover new artists and events</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-muted-foreground/50">✓</span>
                  <span>Follow your favorite artists</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-muted-foreground/50">✓</span>
                  <span>Get personalized recommendations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-muted-foreground/50">✓</span>
                  <span>Support local music scene</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-muted-foreground/50">✓</span>
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
