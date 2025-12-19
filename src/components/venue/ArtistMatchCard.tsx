/**
 * ArtistMatchCard Component
 * Card displaying an artist with match percentage, genre, distance, and projected draw
 */

import { MapPin, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { ArtistMatch } from '@/mocks/venue-data'

interface ArtistMatchCardProps {
  artist: ArtistMatch
}

export function ArtistMatchCard({ artist }: ArtistMatchCardProps) {
  return (
    <Card className="group overflow-hidden border-border/50 transition-all hover:border-purple-300 hover:shadow-lg dark:hover:border-purple-700">
      {/* Image with Match Badge */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={artist.imageUrl}
          alt={artist.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Match Percentage Badge */}
        <Badge className="absolute right-2 top-2 bg-emerald-500 text-white hover:bg-emerald-600">
          {artist.matchPercentage}% match
        </Badge>
      </div>

      {/* Content */}
      <CardContent className="p-4">
        {/* Artist Name */}
        <h3 className="mb-2 font-semibold text-foreground">{artist.name}</h3>

        {/* Genre Badge */}
        <Badge variant="outline" className="mb-3">
          {artist.genre}
        </Badge>

        {/* Stats */}
        <div className="mb-4 space-y-1.5">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span>{artist.distance} mi away</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>{artist.projectedDraw} projected draw</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
            Connect
          </Button>
          <Button variant="outline" className="flex-1">
            View Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

