/**
 * VenueHeroBanner Component
 * Full-width hero section with venue profile, stats, and action buttons
 */

import { MapPin, Users, CheckCircle, Calendar, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { VenueProfile } from '@/mocks/venue-data'

interface VenueHeroBannerProps {
  venue: VenueProfile
}

export function VenueHeroBanner({ venue }: VenueHeroBannerProps) {
  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
    }
    return num.toString()
  }

  return (
    <div className="relative h-[400px] w-full overflow-hidden">
      {/* Background Image with Gradient Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${venue.bannerUrl})`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 via-purple-800/60 to-teal-900/50" />

      {/* Content */}
      <div className="container relative mx-auto flex h-full items-end px-4 pb-8">
        <div className="flex w-full items-end justify-between">
          {/* Left Side: Profile Info */}
          <div className="flex items-end gap-6">
            {/* Avatar */}
            <Avatar className="h-32 w-32 border-4 border-white/20 text-4xl font-bold shadow-xl">
              <AvatarFallback className="bg-purple-600 text-white">
                {venue.avatarInitials}
              </AvatarFallback>
            </Avatar>

            {/* Venue Info */}
            <div className="mb-2 space-y-3">
              {/* Name with Verified Badge */}
              <div className="flex items-center gap-2">
                <h1 className="text-4xl font-bold text-white md:text-5xl">{venue.name}</h1>
                {venue.verified && <CheckCircle className="h-6 w-6 fill-blue-400 text-white" />}
              </div>

              {/* Tagline */}
              <p className="text-lg text-white/90">{venue.tagline}</p>

              {/* Badges Row */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1.5 bg-white/20 text-white hover:bg-white/30"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  {venue.location}
                </Badge>
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1.5 bg-white/20 text-white hover:bg-white/30"
                >
                  <Users className="h-3.5 w-3.5" />
                  {venue.capacity} capacity
                </Badge>
                {venue.status === 'open_for_bookings' && (
                  <Badge className="bg-green-500 text-white hover:bg-green-600">
                    <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-white" />
                    Open for bookings
                  </Badge>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-8 pt-2">
                <div>
                  <p className="text-3xl font-bold text-white">{venue.eventsHosted}</p>
                  <p className="text-sm text-white/70">Events Hosted</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">{formatNumber(venue.networkSize)}</p>
                  <p className="text-sm text-white/70">Network</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Action Buttons */}
          <div className="mb-4 flex items-center gap-3">
            <Button className="bg-purple-600 text-white hover:bg-purple-700">
              <Calendar className="mr-2 h-4 w-4" />
              Book Show
            </Button>
            <Button
              variant="outline"
              className="border-white/30 bg-white/10 text-white hover:bg-white/20"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Message
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
