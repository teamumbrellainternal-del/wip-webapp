/**
 * MyGigsList Component
 * Displays venue's posted gigs with status and actions
 */

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { apiClient } from '@/lib/api-client'
import { logger } from '@/utils/logger'
import type { VenueGig } from '@/types'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  Music,
  Loader2,
} from 'lucide-react'

interface MyGigsListProps {
  gigs: VenueGig[]
  isLoading: boolean
  onViewApplications: (gig: VenueGig) => void
  onRefresh: () => void
}

const statusColors: Record<string, string> = {
  open: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  filled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  completed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
}

export function MyGigsList({ gigs, isLoading, onViewApplications, onRefresh }: MyGigsListProps) {
  const [deletingGigId, setDeletingGigId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteGig = async () => {
    if (!deletingGigId) return

    logger.info('MyGigsList:deleteGig', { gigId: deletingGigId })
    setIsDeleting(true)

    try {
      await apiClient.deleteGig(deletingGigId)
      logger.info('MyGigsList:deleteGig:success', { gigId: deletingGigId })
      onRefresh()
    } catch (error) {
      logger.error('MyGigsList:deleteGig:error', { error })
    } finally {
      setIsDeleting(false)
      setDeletingGigId(null)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatPayment = (amount?: number, type?: string) => {
    if (!amount) return 'Negotiable'
    const formatted = `$${amount.toLocaleString()}`
    if (type === 'hourly') return `${formatted}/hr`
    return formatted
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  if (gigs.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Music className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="mb-2 text-lg font-semibold">No Gigs Posted Yet</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Create your first gig to start receiving applications from artists.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {gigs.map((gig) => (
          <Card
            key={gig.id}
            className="overflow-hidden transition-shadow hover:shadow-md"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{gig.title}</CardTitle>
                    <Badge className={statusColors[gig.status] || statusColors.open}>
                      {gig.status.charAt(0).toUpperCase() + gig.status.slice(1)}
                    </Badge>
                  </div>
                  {gig.genre && (
                    <p className="mt-1 text-sm text-muted-foreground capitalize">{gig.genre}</p>
                  )}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewApplications(gig)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Applications
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit Gig
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600"
                      onClick={() => setDeletingGigId(gig.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Cancel Gig
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {gig.description && (
                <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                  {gig.description}
                </p>
              )}

              <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(gig.date)}</span>
                </div>

                {gig.start_time && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      {gig.start_time}
                      {gig.end_time && ` - ${gig.end_time}`}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{gig.location}</span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span>{formatPayment(gig.payment_amount, gig.payment_type)}</span>
                </div>
              </div>

              {gig.capacity && (
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {gig.filled_slots} / {gig.capacity} slots filled
                  </span>
                  <div className="ml-2 h-2 flex-1 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-purple-600"
                      style={{ width: `${Math.min(100, (gig.filled_slots / gig.capacity) * 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {gig.status === 'open' && (
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewApplications(gig)}
                    className="flex-1 sm:flex-none"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Applications
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingGigId} onOpenChange={() => setDeletingGigId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this gig?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel the gig and notify any artists who have applied. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Keep Gig</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGig}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Cancel Gig'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

