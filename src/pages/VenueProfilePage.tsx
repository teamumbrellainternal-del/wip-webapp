/**
 * VenueProfilePage
 * Public profile page for venues, viewable by artists and other users
 */

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { apiClient } from '@/lib/api-client'
import { messagesService } from '@/services/api'
import { logger } from '@/utils/logger'
import type { PublicVenueProfile } from '@/types'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  MapPin,
  Users,
  CheckCircle2,
  ArrowLeft,
  MessageCircle,
  Building2,
  Music,
  Loader2,
  Calendar,
  Star,
} from 'lucide-react'
import LoadingState from '@/components/common/LoadingState'
import ErrorState from '@/components/common/ErrorState'
import { MetaTags } from '@/components/MetaTags'

const venueTypeLabels: Record<string, string> = {
  bar: 'Bar',
  club: 'Club',
  concert_hall: 'Concert Hall',
  theater: 'Theater',
  festival: 'Festival',
  restaurant: 'Restaurant',
  hotel: 'Hotel',
  private_venue: 'Private Venue',
  outdoor: 'Outdoor Venue',
  other: 'Other',
}

const stageSizeLabels: Record<string, string> = {
  small: 'Small Stage',
  medium: 'Medium Stage',
  large: 'Large Stage',
  festival: 'Festival Stage',
}

export default function VenueProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const [venue, setVenue] = useState<PublicVenueProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [startingConversation, setStartingConversation] = useState(false)

  const isOwnProfile = user?.id === id

  useEffect(() => {
    if (!id) return

    const fetchVenueProfile = async () => {
      logger.info('VenueProfilePage:fetchVenueProfile', { venueId: id })

      try {
        setLoading(true)
        setError(null)

        const venueData = await apiClient.getPublicVenueProfile(id)
        logger.info('VenueProfilePage:fetchVenueProfile:success', { venueName: venueData.name })
        setVenue(venueData)
      } catch (err) {
        logger.error('VenueProfilePage:fetchVenueProfile:error', { error: err })
        setError('Failed to load venue profile. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchVenueProfile()
  }, [id])

  const handleContactVenue = async () => {
    if (!venue?.id) {
      toast({
        title: 'Unable to message this venue',
        description: 'Venue profile information is incomplete.',
        variant: 'destructive',
      })
      return
    }

    logger.info('VenueProfilePage:contactVenue', { venueId: venue.id })
    setStartingConversation(true)

    try {
      const response = await messagesService.startConversation({
        participant_id: venue.id, // venue.id is the user_id
        context_type: 'venue',
      })

      if (response.conversation?.id) {
        navigate(`/messages/${response.conversation.id}`)
        toast({
          title: response.isNew ? 'Conversation started!' : 'Opening conversation',
          description: response.isNew
            ? `You can now message ${venue.name}`
            : `Continuing conversation with ${venue.name}`,
        })
      }
    } catch (err) {
      logger.error('VenueProfilePage:contactVenue:error', { error: err })
      toast({
        title: 'Failed to start conversation',
        description: 'Please try again later.',
        variant: 'destructive',
      })
    } finally {
      setStartingConversation(false)
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <LoadingState />
      </AppLayout>
    )
  }

  if (error || !venue) {
    return (
      <AppLayout>
        <ErrorState error={error || 'Venue not found'} />
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <MetaTags
        title={venue.name || 'Venue Profile'}
        description={
          venue.tagline ||
          `${venue.name} - ${venue.venue_type ? venueTypeLabels[venue.venue_type] : 'Venue'} in ${venue.city}${venue.state ? `, ${venue.state}` : ''}. ${venue.events_hosted} events hosted.`
        }
        url={`/venue/${id}`}
        type="profile"
      />

      <div className="flex min-h-[calc(100vh-4rem)] flex-col">
        {/* Cover Image Section */}
        <div className="relative h-48 bg-gradient-to-r from-indigo-600 to-purple-600 md:h-64">
          {venue.cover_url && (
            <img
              src={venue.cover_url}
              alt={`${venue.name} cover`}
              className="absolute inset-0 h-full w-full object-cover opacity-60"
            />
          )}

          {/* Header with back button */}
          <div className="absolute left-0 right-0 top-0 flex items-center justify-between p-4">
            <Button
              variant="secondary"
              size="sm"
              className="gap-2 bg-white/90 hover:bg-white"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
        </div>

        {/* Profile Header - overlapping cover */}
        <div className="relative mx-auto w-full max-w-6xl px-4">
          <div className="-mt-16 rounded-xl border border-border/50 bg-card p-6 shadow-lg md:-mt-20">
            <div className="flex flex-col gap-6 md:flex-row">
              {/* Avatar */}
              <div className="relative -mt-20 md:-mt-24">
                <Avatar className="h-32 w-32 border-4 border-background shadow-lg md:h-40 md:w-40">
                  <AvatarImage src={venue.avatar_url || undefined} alt={venue.name} />
                  <AvatarFallback className="bg-indigo-100 text-3xl text-indigo-700">
                    <Building2 className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>
                {venue.verified && (
                  <div className="absolute -bottom-1 -right-1 rounded-full bg-blue-500 p-1.5">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <h1 className="text-2xl font-bold md:text-3xl">{venue.name}</h1>
                      {venue.verified && (
                        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                          Verified Venue
                        </Badge>
                      )}
                    </div>
                    {venue.tagline && (
                      <p className="mb-2 text-lg text-muted-foreground">{venue.tagline}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {venue.city}
                          {venue.state && `, ${venue.state}`}
                        </span>
                      </div>
                      {venue.venue_type && (
                        <Badge variant="secondary">
                          {venueTypeLabels[venue.venue_type] || venue.venue_type}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {!isOwnProfile && (
                    <div className="flex gap-2">
                      <Button
                        className="gap-2 bg-indigo-600 hover:bg-indigo-700"
                        onClick={handleContactVenue}
                        disabled={startingConversation}
                      >
                        {startingConversation ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Starting...
                          </>
                        ) : (
                          <>
                            <MessageCircle className="h-4 w-4" />
                            Contact Venue
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{venue.events_hosted}</p>
                    <p className="text-sm text-muted-foreground">Events Hosted</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{venue.total_artists_booked}</p>
                    <p className="text-sm text-muted-foreground">Artists Booked</p>
                  </div>
                  {venue.capacity && (
                    <div className="text-center">
                      <p className="text-2xl font-bold">{venue.capacity.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Capacity</p>
                    </div>
                  )}
                  {venue.stage_size && (
                    <div className="text-center">
                      <p className="text-2xl font-bold capitalize">
                        {stageSizeLabels[venue.stage_size] || venue.stage_size}
                      </p>
                      <p className="text-sm text-muted-foreground">Stage</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Venue Details */}
            <div className="space-y-6 lg:col-span-2">
              {/* About Card */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    About This Venue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {venue.venue_type && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Venue Type</p>
                        <p className="text-lg">
                          {venueTypeLabels[venue.venue_type] || venue.venue_type}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Location</p>
                      <p className="text-lg">
                        {venue.city}
                        {venue.state && `, ${venue.state}`}
                      </p>
                    </div>
                    {venue.capacity && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Capacity</p>
                        <p className="text-lg">{venue.capacity.toLocaleString()} guests</p>
                      </div>
                    )}
                    {venue.stage_size && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Stage Size</p>
                        <p className="text-lg">
                          {stageSizeLabels[venue.stage_size] || venue.stage_size}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Events Placeholder */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Upcoming Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="py-8 text-center">
                    <Music className="mx-auto mb-3 h-10 w-10 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No upcoming events posted</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Check back later for new opportunities
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Stats & Contact */}
            <div className="space-y-6">
              {/* Quick Stats Card */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Venue Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Events Hosted</span>
                      <span className="font-semibold">{venue.events_hosted}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Artists Booked</span>
                      <span className="font-semibold">{venue.total_artists_booked}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <Badge
                        variant={venue.status === 'open_for_bookings' ? 'default' : 'secondary'}
                        className={
                          venue.status === 'open_for_bookings'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : ''
                        }
                      >
                        {venue.status === 'open_for_bookings' ? 'Accepting Bookings' : venue.status === 'limited' ? 'Limited Availability' : 'Not Available'}
                      </Badge>
                    </div>
                    {venue.verified && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Verification</span>
                        <div className="flex items-center gap-1 text-blue-600">
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="font-medium">Verified</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Contact Card */}
              {!isOwnProfile && (
                <Card className="border-border/50 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
                  <CardContent className="p-6 text-center">
                    <Users className="mx-auto mb-3 h-10 w-10 text-indigo-600" />
                    <h3 className="mb-2 text-lg font-semibold">Interested in Performing?</h3>
                    <p className="mb-4 text-sm text-muted-foreground">
                      Reach out to {venue.name} about booking opportunities
                    </p>
                    <Button
                      className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700"
                      onClick={handleContactVenue}
                      disabled={startingConversation}
                    >
                      {startingConversation ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Starting...
                        </>
                      ) : (
                        <>
                          <MessageCircle className="h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

