/**
 * GigApplicationsModal Component
 * Modal for venues to view and manage applications for a specific gig
 */

import { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { apiClient } from '@/lib/api-client'
import { logger } from '@/utils/logger'
import type { VenueGig, GigApplication } from '@/types'
import {
  Loader2,
  Users,
  Star,
  DollarSign,
  ExternalLink,
  Check,
  X,
  Calendar,
  Music,
} from 'lucide-react'

interface GigApplicationsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  gig: VenueGig | null
  onStatusChange?: () => void
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  accepted: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

export function GigApplicationsModal({
  open,
  onOpenChange,
  gig,
  onStatusChange,
}: GigApplicationsModalProps) {
  const [applications, setApplications] = useState<GigApplication[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchApplications = useCallback(async () => {
    if (!gig) return

    logger.info('GigApplicationsModal:fetch', { gigId: gig.id })
    setIsLoading(true)
    setError(null)

    try {
      const response = await apiClient.getGigApplications(gig.id)
      setApplications(response.applications)
      logger.info('GigApplicationsModal:fetch:success', { count: response.applications.length })
    } catch (err) {
      logger.error('GigApplicationsModal:fetch:error', { error: err })
      setError('Failed to load applications')
    } finally {
      setIsLoading(false)
    }
  }, [gig])

  useEffect(() => {
    if (open && gig) {
      fetchApplications()
    }
  }, [open, gig, fetchApplications])

  const handleStatusUpdate = async (applicationId: string, status: 'accepted' | 'rejected') => {
    if (!gig) return

    logger.info('GigApplicationsModal:updateStatus', { applicationId, status })
    setUpdatingId(applicationId)

    try {
      await apiClient.updateApplicationStatus(gig.id, applicationId, status)

      // Update local state
      setApplications((prev) =>
        prev.map((app) => (app.id === applicationId ? { ...app, status } : app))
      )

      logger.info('GigApplicationsModal:updateStatus:success', { applicationId, status })
      onStatusChange?.()
    } catch (err) {
      logger.error('GigApplicationsModal:updateStatus:error', { error: err })
    } finally {
      setUpdatingId(null)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatRate = (flat?: number, hourly?: number) => {
    if (flat && hourly) return `$${flat} flat / $${hourly}/hr`
    if (flat) return `$${flat} flat rate`
    if (hourly) return `$${hourly}/hr`
    return 'Rates negotiable'
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const pendingCount = applications.filter((a) => a.status === 'pending').length
  const acceptedCount = applications.filter((a) => a.status === 'accepted').length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            Applications for {gig?.title}
          </DialogTitle>
          <DialogDescription>
            {gig && (
              <span className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(gig.date).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Music className="h-3.5 w-3.5" />
                  {gig.genre || 'Any genre'}
                </span>
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Stats Summary */}
        <div className="flex gap-4 rounded-lg bg-muted/50 p-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{applications.length}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{acceptedCount}</p>
            <p className="text-xs text-muted-foreground">Accepted</p>
          </div>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
          ) : error ? (
            <div className="rounded-md bg-red-50 p-4 text-center text-red-600 dark:bg-red-900/20">
              {error}
            </div>
          ) : applications.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="mb-2 font-semibold">No Applications Yet</h3>
              <p className="text-sm text-muted-foreground">
                Artists haven&apos;t applied to this gig yet. Check back later!
              </p>
            </div>
          ) : (
            applications.map((application) => (
              <Card key={application.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={application.artist.avatar_url} />
                      <AvatarFallback className="bg-purple-100 text-purple-600">
                        {getInitials(application.artist.stage_name)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Artist Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground">
                          {application.artist.stage_name}
                        </h4>
                        <Badge className={statusColors[application.status]}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </Badge>
                      </div>

                      {application.artist.bio && (
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {application.artist.bio}
                        </p>
                      )}

                      <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
                        {/* Rating */}
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          {application.artist.avg_rating > 0
                            ? application.artist.avg_rating.toFixed(1)
                            : 'New'}
                        </span>

                        {/* Gigs completed */}
                        <span className="text-muted-foreground">
                          {application.artist.total_gigs} gigs
                        </span>

                        {/* Rate */}
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <DollarSign className="h-4 w-4" />
                          {formatRate(
                            application.artist.base_rate_flat,
                            application.artist.base_rate_hourly
                          )}
                        </span>

                        {/* Portfolio link */}
                        {application.artist.website_url && (
                          <a
                            href={application.artist.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-purple-600 hover:underline"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Portfolio
                          </a>
                        )}
                      </div>

                      <p className="mt-2 text-xs text-muted-foreground">
                        Applied {formatDate(application.applied_at)}
                      </p>
                    </div>

                    {/* Actions */}
                    {application.status === 'pending' && (
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleStatusUpdate(application.id, 'accepted')}
                          disabled={updatingId === application.id}
                        >
                          {updatingId === application.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Check className="mr-1 h-4 w-4" />
                              Accept
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => handleStatusUpdate(application.id, 'rejected')}
                          disabled={updatingId === application.id}
                        >
                          {updatingId === application.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <X className="mr-1 h-4 w-4" />
                              Decline
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
