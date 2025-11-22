import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Star,
  Users,
  AlertCircle,
  CheckCircle2,
  Music,
  Building2,
  ArrowLeft,
  Share2,
  Flag,
} from 'lucide-react'
import { gigsService } from '@/services/api'
import type { Gig } from '@/types'
import { toast } from 'sonner'
import ErrorState from '@/components/common/ErrorState'
import { MetaTags } from '@/components/MetaTags'

/**
 * Gig Details Page
 *
 * Displays comprehensive information about a gig opportunity
 * and allows artists to apply to the gig.
 */
export default function GigDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [gig, setGig] = useState<Gig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [applying, setApplying] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)

  useEffect(() => {
    if (!id) {
      setError(new Error('No gig ID provided'))
      setLoading(false)
      return
    }

    fetchGigDetails()
  }, [id])

  const fetchGigDetails = async () => {
    if (!id) return

    setLoading(true)
    setError(null)

    try {
      const data = await gigsService.getById(id)
      setGig(data)
    } catch (err) {
      setError(err as Error)
      console.error('Failed to fetch gig details:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async () => {
    if (!id || !gig) return

    // Check if gig is still open
    if (gig.status !== 'open') {
      toast.error('This gig is no longer accepting applications')
      return
    }

    setApplying(true)

    try {
      await gigsService.apply(id)
      setHasApplied(true)
      toast.success('Application submitted!', {
        description: 'The venue will review your profile and get back to you.',
      })
    } catch (err) {
      console.error('Failed to apply to gig:', err)
      toast.error('Failed to submit application', {
        description: err instanceof Error ? err.message : 'Please try again later',
      })
    } finally {
      setApplying(false)
    }
  }

  const handleShare = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    toast.success('Link copied to clipboard!')
  }

  const handleReport = () => {
    toast.info('Report feature coming soon', {
      description: 'We appreciate you helping keep our community safe.',
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Loading State
  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto max-w-6xl space-y-6 py-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
          <div className="grid gap-6 md:grid-cols-3">
            <Skeleton className="h-48 md:col-span-2" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </AppLayout>
    )
  }

  // Error State
  if (error || !gig) {
    return (
      <AppLayout>
        <ErrorState
          error={error || new Error('The gig you are looking for could not be found.')}
          title="Failed to load gig"
          retry={() => navigate('/marketplace/gigs')}
        />
      </AppLayout>
    )
  }

  const isGigClosed = gig.status !== 'open'
  const isUrgent = gig.urgency_flag

  return (
    <AppLayout>
      <MetaTags
        title={`${gig.title} - ${gig.venue_name}`}
        description={gig.description || `Gig opportunity at ${gig.venue_name}`}
        url={`/gig/${gig.id}`}
      />

      <div className="container mx-auto max-w-6xl space-y-6 py-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate('/marketplace/gigs')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Marketplace
        </Button>

        {/* Hero Section */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-3xl">{gig.title}</CardTitle>
                  {isUrgent && (
                    <Badge variant="destructive" className="animate-pulse">
                      Urgent
                    </Badge>
                  )}
                  {isGigClosed && (
                    <Badge variant="secondary">
                      {gig.status === 'filled' ? 'Filled' : 'Cancelled'}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <Link
                    to={`/venue/${gig.venue_id}`}
                    className="hover:text-primary hover:underline"
                  >
                    {gig.venue_name}
                  </Link>
                  {gig.venue_rating_avg > 0 && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{gig.venue_rating_avg.toFixed(1)}</span>
                        <span className="text-sm">({gig.venue_review_count} reviews)</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleReport}>
                  <Flag className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Key Details Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{formatDate(gig.date)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-medium">{gig.time}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{gig.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
                <DollarSign className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Payment</p>
                  <p className="font-medium text-green-600">{formatCurrency(gig.payment_amount)}</p>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Capacity: {gig.capacity.toLocaleString()}</span>
              </div>
              {gig.application_deadline && (
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>Apply by: {formatDate(gig.application_deadline)}</span>
                </div>
              )}
            </div>

            {/* Genres */}
            {gig.genre_tags && gig.genre_tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <Music className="h-4 w-4 text-muted-foreground" />
                {gig.genre_tags.map((genre) => (
                  <Badge key={genre} variant="secondary">
                    {genre}
                  </Badge>
                ))}
              </div>
            )}

            <Separator />

            {/* Description */}
            {gig.description && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">About This Gig</h3>
                <p className="whitespace-pre-wrap text-muted-foreground">{gig.description}</p>
              </div>
            )}

            {/* Apply Section */}
            <div className="space-y-4 rounded-lg bg-muted/30 p-6">
              {hasApplied ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">Application Submitted</span>
                </div>
              ) : isGigClosed ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <AlertCircle className="h-5 w-5" />
                  <span>This gig is no longer accepting applications</span>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Ready to Apply?</h3>
                    <p className="text-sm text-muted-foreground">
                      Your profile will be shared with the venue. They'll review your experience,
                      media, and availability before making a decision.
                    </p>
                  </div>
                  <Button
                    onClick={handleApply}
                    disabled={applying}
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    {applying ? (
                      <>
                        <span className="mr-2 animate-spin">⏳</span>
                        Submitting...
                      </>
                    ) : (
                      <>Apply to This Gig</>
                    )}
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>What to Expect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <h4 className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Application Review
                </h4>
                <p className="text-sm text-muted-foreground">
                  The venue will review your application within 48 hours and reach out via messages
                  if interested.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Confirmation Process
                </h4>
                <p className="text-sm text-muted-foreground">
                  Once selected, you'll receive a booking confirmation with full event details and
                  next steps.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Payment Terms
                </h4>
                <p className="text-sm text-muted-foreground">
                  Payment will be processed after the performance according to the venue's payment
                  schedule.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Communication
                </h4>
                <p className="text-sm text-muted-foreground">
                  All coordination will happen through Umbrella's messaging system for your safety
                  and convenience.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
