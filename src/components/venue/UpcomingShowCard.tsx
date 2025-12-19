/**
 * UpcomingShowCard Component
 * Card displaying an upcoming show with artist info and hover state
 */

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { UpcomingShow } from '@/mocks/venue-data'

interface UpcomingShowCardProps {
  show: UpcomingShow
}

export function UpcomingShowCard({ show }: UpcomingShowCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Card
      className="group cursor-pointer overflow-hidden border-border/50 transition-all hover:border-purple-300 hover:shadow-lg dark:hover:border-purple-700"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={show.imageUrl}
          alt={show.artistName}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Hover Overlay with View Details Button */}
        {isHovered && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity">
            <Button className="bg-purple-600 text-white hover:bg-purple-700">View Details</Button>
          </div>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <h3 className="font-semibold text-foreground">{show.artistName}</h3>
        <p className="text-sm text-muted-foreground">{show.date}</p>
      </CardContent>
    </Card>
  )
}
