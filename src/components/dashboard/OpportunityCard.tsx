/**
 * OpportunityCard Component
 * Display gig opportunity on dashboard with urgent badge (D-010)
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, DollarSign } from 'lucide-react'
import type { Gig } from '@/types'

interface OpportunityCardProps {
  gig: Gig
  onApply: (gigId: string) => void
  applying?: boolean
}

/**
 * Format date string to readable format
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function OpportunityCard({ gig, onApply, applying = false }: OpportunityCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{gig.title}</CardTitle>
            <CardDescription>{gig.venue_name}</CardDescription>
          </div>
          {/* D-010: Urgent badge for gigs within 7 days with <50% capacity */}
          {gig.urgency_flag && (
            <Badge variant="destructive">Urgent</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            {formatDate(gig.date)} at {gig.time}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2" />
            {gig.location}
          </div>
          <div className="flex items-center text-sm font-semibold text-primary">
            <DollarSign className="h-4 w-4 mr-1" />
            ${gig.payment_amount.toLocaleString()}
          </div>
        </div>

        {/* D-077: Single-click apply */}
        <Button
          onClick={() => onApply(gig.id)}
          className="w-full"
          size="sm"
          disabled={applying}
        >
          {applying ? 'Applying...' : 'Apply'}
        </Button>
      </CardContent>
    </Card>
  )
}
