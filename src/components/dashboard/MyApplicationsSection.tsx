/**
 * MyApplicationsSection Component
 * Shows artist's gig applications with status tracking
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { apiClient } from '@/lib/api-client'
import { logger } from '@/utils/logger'
import type { MyApplication } from '@/types'
import {
  Calendar,
  MapPin,
  DollarSign,
  CheckCircle2,
  Clock,
  X,
  Loader2,
  FileText,
  ArrowRight,
} from 'lucide-react'

const statusConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  pending: {
    icon: <Clock className="h-4 w-4" />,
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    label: 'Pending',
  },
  accepted: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    label: 'Accepted',
  },
  rejected: {
    icon: <X className="h-4 w-4" />,
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    label: 'Not Selected',
  },
}

export function MyApplicationsSection() {
  const navigate = useNavigate()
  const [applications, setApplications] = useState<MyApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    logger.info('MyApplicationsSection:fetch')
    setIsLoading(true)
    setError(null)

    try {
      const response = await apiClient.getMyApplications()
      setApplications(response.applications)
      logger.info('MyApplicationsSection:fetch:success', { count: response.applications.length })
    } catch (err) {
      logger.error('MyApplicationsSection:fetch:error', { error: err })
      setError('Failed to load applications')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'TBD'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Group applications by status
  const pendingApps = applications.filter((a) => a.status === 'pending')
  const acceptedApps = applications.filter((a) => a.status === 'accepted')
  const totalApps = applications.length

  return (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-xl">
          <FileText className="h-5 w-5 text-purple-600" />
          My Applications
        </CardTitle>
        {totalApps > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline" className="border-yellow-300 text-yellow-700">
              {pendingApps.length} pending
            </Badge>
            {acceptedApps.length > 0 && (
              <Badge variant="outline" className="border-green-300 text-green-700">
                {acceptedApps.length} accepted
              </Badge>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : error ? (
          <div className="rounded-md bg-red-50 p-4 text-center text-red-600 dark:bg-red-900/20">
            {error}
          </div>
        ) : applications.length === 0 ? (
          <div className="py-8 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-2 font-semibold">No Applications Yet</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Start applying to gigs to see your applications here.
            </p>
            <Button
              variant="outline"
              onClick={() => navigate('/marketplace/gigs')}
              className="border-purple-300 text-purple-600 hover:bg-purple-50"
            >
              Browse Gigs
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Show first 5 applications */}
            {applications.slice(0, 5).map((application) => {
              const status = statusConfig[application.status]
              return (
                <div
                  key={application.id}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4
                        className="cursor-pointer truncate font-medium hover:text-purple-600"
                        onClick={() => navigate(`/marketplace/gigs/${application.gig.id}`)}
                      >
                        {application.gig.title}
                      </h4>
                      <Badge className={status.color}>
                        {status.icon}
                        <span className="ml-1">{status.label}</span>
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {application.gig.venue_name}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(application.gig.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {application.gig.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3.5 w-3.5" />
                        {formatCurrency(application.gig.payment_amount)}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/marketplace/gigs/${application.gig.id}`)}
                    className="ml-4"
                  >
                    View
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              )
            })}

            {/* Show "View All" if more than 5 applications */}
            {applications.length > 5 && (
              <div className="pt-2 text-center">
                <Button
                  variant="link"
                  className="text-purple-600"
                  onClick={() => navigate('/applications')}
                >
                  View all {applications.length} applications
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

