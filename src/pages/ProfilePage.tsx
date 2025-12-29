import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { artistsService, tracksService, messagesService } from '@/services/api'
import { apiClient } from '@/lib/api-client'
import type { Artist, Track, Review, ConnectionStatus } from '@/types'
import AppLayout from '@/components/layout/AppLayout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  MapPin,
  Star,
  Music,
  ThumbsUp,
  Share2,
  Flag,
  MoreVertical,
  MessageCircle,
  Play,
  Pause,
  Heart,
  CheckCircle2,
  ArrowLeft,
  Calendar,
  Camera,
  UserPlus,
  UserMinus,
  Loader2,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import LoadingState from '@/components/common/LoadingState'
import ErrorState from '@/components/common/ErrorState'
import { PublicProfileCTAButton, PublicProfileCTABanner } from '@/components/common/PublicProfileCTA'
import { MetaTags } from '@/components/MetaTags'
import { ArtistJsonLd } from '@/components/seo'
import { ConnectionButton, MutualConnections } from '@/components/connections'

import { SocialLinksBar, type SocialLinksData } from '@/components/common/SocialIcons'

// Endorsements will be fetched from API when implemented
// For MVP, showing empty state

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const [artist, setArtist] = useState<Artist | null>(null)
  const [tracks, setTracks] = useState<Track[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('none')
  const [connectionId, setConnectionId] = useState<string | null>(null)
  const [bioExpanded, setBioExpanded] = useState(false)
  const [reportDialogOpen, setReportDialogOpen] = useState(false)
  const [reportReason, setReportReason] = useState('spam')
  const [reportDetails, setReportDetails] = useState('')
  const [startingConversation, setStartingConversation] = useState(false)

  const isAuthenticated = !!user
  const isOwnProfile = user?.id === id

  useEffect(() => {
    if (!id) return

    const fetchProfileData = async () => {
      try {
        setLoading(true)
        setError(null)

        const artistData = await artistsService.getById(id)
        setArtist(artistData)

        const tracksData = await artistsService.getTracks(id)
        setTracks(tracksData)

        const reviewsData = await artistsService.getReviews(id)
        setReviews(reviewsData)

        // Fetch follow status (works for both authenticated and unauthenticated users)
        try {
          const followStatus = await artistsService.getFollowStatus(id)
          setIsFollowing(followStatus.is_following)
        } catch {
          // If follow status fetch fails, default to not following
          setIsFollowing(false)
        }

        // Fetch connection status (requires authentication)
        try {
          // Need to get the user_id for the artist to check connection status
          if (artistData.user_id) {
            const connStatus = await apiClient.getConnectionStatus(artistData.user_id)
            setConnectionStatus(connStatus.status)
            setConnectionId(connStatus.connection_id)
          }
        } catch {
          // If connection status fetch fails, default to none
          setConnectionStatus('none')
          setConnectionId(null)
        }
      } catch (err) {
        console.error('Error fetching profile:', err)
        setError('Failed to load profile. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [id])

  const handleFollowToggle = async () => {
    if (!id) return
    try {
      if (isFollowing) {
        const response = await artistsService.unfollow(id)
        setIsFollowing(response.is_following)
        if (artist) {
          setArtist({ ...artist, follower_count: response.follower_count })
        }
      } else {
        const response = await artistsService.follow(id)
        setIsFollowing(response.is_following)
        if (artist) {
          setArtist({ ...artist, follower_count: response.follower_count })
        }
      }
    } catch (err) {
      console.error('Error toggling follow:', err)
      toast({
        title: 'Error',
        description: isFollowing ? 'Failed to unfollow artist' : 'Failed to follow artist',
        variant: 'destructive',
      })
    }
  }

  const handleBookArtist = async () => {
    if (!artist?.user_id) {
      toast({
        title: 'Unable to message this artist',
        description: 'Artist profile information is incomplete.',
        variant: 'destructive',
      })
      return
    }

    setStartingConversation(true)

    try {
      const response = await messagesService.startConversation({
        participant_id: artist.user_id,
        context_type: 'artist',
      })

      // Navigate to the conversation
      if (response.conversation?.id) {
        navigate(`/messages/${response.conversation.id}`)
        toast({
          title: response.isNew ? 'Conversation started!' : 'Opening conversation',
          description: response.isNew
            ? `You can now message ${artist.artist_name}`
            : `Continuing conversation with ${artist.artist_name}`,
        })
      }
    } catch (err) {
      console.error('Error starting conversation:', err)
      toast({
        title: 'Failed to start conversation',
        description: 'Please try again later.',
        variant: 'destructive',
      })
    } finally {
      setStartingConversation(false)
    }
  }

  const handleShare = () => {
    const profileUrl = `${window.location.origin}/artist/${id}`
    navigator.clipboard.writeText(profileUrl)
    toast({
      title: 'Profile link copied',
      description: 'Share this artist with others!',
    })
  }

  const handleReport = () => {
    setReportDialogOpen(true)
  }

  const handleReportSubmit = async () => {
    try {
      console.log('Report submitted:', { id, reason: reportReason, details: reportDetails })

      toast({
        title: 'Report submitted',
        description: 'Thank you for helping keep Umbrella safe.',
      })

      setReportDialogOpen(false)
      setReportReason('spam')
      setReportDetails('')
    } catch {
      toast({
        title: 'Failed to submit report',
        description: 'Please try again later.',
        variant: 'destructive',
      })
    }
  }

  const handleTrackPlay = async (trackId: string) => {
    if (playingTrackId === trackId) {
      setPlayingTrackId(null)
    } else {
      setPlayingTrackId(trackId)
      try {
        await tracksService.recordPlay(trackId)
      } catch (err) {
        console.error('Error recording play:', err)
      }
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <LoadingState />
      </AppLayout>
    )
  }

  if (error || !artist) {
    return (
      <AppLayout>
        <ErrorState error={error || 'Artist not found'} />
      </AppLayout>
    )
  }

  const truncatedBio =
    artist.bio && artist.bio.length > 200 ? `${artist.bio.substring(0, 200)}...` : artist.bio

  return (
    <AppLayout>
      <MetaTags
        title={artist.artist_name || 'Artist Profile'}
        description={
          artist.bio ||
          `${artist.artist_name || 'Artist'} - Independent artist on Umbrella. ${artist.genres?.join(', ') || 'Various genres'}. ${artist.gigs_completed || 0} gigs completed.`
        }
        keywords={artist.genres || []}
        url={`/artist/${id}`}
        type="profile"
      />
      <ArtistJsonLd
        id={artist.id}
        name={artist.artist_name || 'Artist'}
        description={artist.bio}
        image={artist.avatar_url}
        genre={artist.genres?.[0]}
        location={artist.location}
        instagramHandle={artist.instagram_handle}
        spotifyUrl={artist.spotify_url}
        youtubeUrl={artist.youtube_url}
        soundcloudUrl={artist.soundcloud_url}
        websiteUrl={artist.website_url}
        facebookUrl={artist.facebook_url}
        twitterUrl={artist.twitter_url}
        tiktokHandle={artist.tiktok_handle}
      />

      <div className="flex min-h-[calc(100vh-4rem)] flex-col">
        {/* Cover Image Section */}
        <div className="relative h-48 bg-gradient-to-r from-purple-600 to-pink-600 md:h-64">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&h=400&fit=crop')] bg-cover bg-center opacity-50" />

          {/* Header with back button */}
          <div className="absolute left-0 right-0 top-0 flex items-center justify-between p-4">
            <Button
              variant="secondary"
              size="sm"
              className="gap-2 bg-white/90 hover:bg-white"
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}
            >
              <ArrowLeft className="h-4 w-4" />
              {isAuthenticated ? 'Back to Dashboard' : 'Back'}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="bg-white/90 hover:bg-white">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleShare}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </DropdownMenuItem>
                {!isOwnProfile && (
                  <DropdownMenuItem onClick={handleReport}>
                    <Flag className="mr-2 h-4 w-4" />
                    Report
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Profile Header - overlapping cover */}
        <div className="relative mx-auto w-full max-w-6xl px-4">
          <div className="-mt-16 rounded-xl border border-border/50 bg-card p-6 shadow-lg md:-mt-20">
            <div className="flex flex-col gap-6 md:flex-row">
              {/* Avatar */}
              <div className="relative -mt-20 md:-mt-24">
                <Avatar className="h-32 w-32 border-4 border-background shadow-lg md:h-40 md:w-40">
                  <AvatarImage src={artist.avatar_url} alt={artist.artist_name || 'Artist'} />
                  <AvatarFallback className="bg-purple-100 text-3xl text-purple-700">
                    {(artist.artist_name || 'A').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {!!artist.verified && (
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
                      <h1 className="text-2xl font-bold md:text-3xl">
                        {artist.artist_name || 'Artist'}
                      </h1>
                      {!!artist.verified && (
                        <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                          Professional
                        </Badge>
                      )}
                    </div>
                    <p className="mb-1 text-muted-foreground">
                      @{(artist.artist_name || 'artist').toLowerCase().replace(/\s+/g, '')}
                    </p>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{artist.location}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {!isOwnProfile && (
                    <div className="flex flex-col gap-2">
                      {isAuthenticated ? (
                        <>
                          <div className="flex gap-2">
                            {/* Primary: Connection Button */}
                            {artist.user_id && (
                              <ConnectionButton
                                userId={artist.user_id}
                                artistId={artist.id}
                                status={connectionStatus}
                                connectionId={connectionId}
                                onStatusChange={(newStatus) => setConnectionStatus(newStatus)}
                              />
                            )}
                            {/* Secondary: Follow Button */}
                            <Button variant="outline" className="gap-2" onClick={handleFollowToggle}>
                              {isFollowing ? (
                                <>
                                  <UserMinus className="h-4 w-4" />
                                  Unfollow
                                </>
                              ) : (
                                <>
                                  <UserPlus className="h-4 w-4" />
                                  Follow
                                </>
                              )}
                            </Button>
                            <Button
                              className="gap-2 bg-purple-500 hover:bg-purple-600"
                              onClick={handleBookArtist}
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
                                  Book Artist
                                </>
                              )}
                            </Button>
                          </div>
                          {/* Mutual Connections indicator */}
                          {artist.user_id && connectionStatus !== 'self' && (
                            <MutualConnections userId={artist.user_id} className="mt-1" />
                          )}
                        </>
                      ) : (
                        /* Unauthenticated users see Join CTA */
                        <PublicProfileCTAButton
                          returnUrl={`/artist/${id}`}
                          profileType="artist"
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Stats Row */}
                <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {(artist.connection_count || 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">Connections</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{artist.follower_count.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Followers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{artist.gigs_completed}</p>
                    <p className="text-sm text-muted-foreground">Gigs Booked</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{artist.review_count}</p>
                    <p className="text-sm text-muted-foreground">Endorsements</p>
                  </div>
                </div>

                {/* Social Links */}
                <SocialLinksBar data={artist as unknown as SocialLinksData} />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 w-full justify-start bg-muted/50">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="portfolio"
                className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
              >
                Portfolio
              </TabsTrigger>
              <TabsTrigger
                value="explore"
                className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
              >
                Explore
              </TabsTrigger>
              <TabsTrigger
                value="journey"
                className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
              >
                Journey
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
              >
                Reviews
              </TabsTrigger>
              <TabsTrigger
                value="opportunities"
                className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
              >
                Opportunities
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Overview */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Left Column - Bio & Portfolio */}
                <div className="space-y-6 lg:col-span-2">
                  {/* Bio Card */}
                  {artist.bio && (
                    <Card className="border-border/50">
                      <CardContent className="p-6">
                        <h3 className="mb-4 text-lg font-semibold">About</h3>
                        <p className="whitespace-pre-wrap text-muted-foreground">
                          {bioExpanded ? artist.bio : truncatedBio}
                        </p>
                        {artist.bio.length > 200 && (
                          <Button
                            variant="link"
                            className="mt-2 px-0 text-purple-600"
                            onClick={() => setBioExpanded(!bioExpanded)}
                          >
                            {bioExpanded ? 'Show less' : 'Expand bio →'}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Portfolio Preview */}
                  {tracks.length > 0 && (
                    <Card className="border-border/50">
                      <CardContent className="p-6">
                        <div className="mb-4 flex items-center justify-between">
                          <h3 className="text-lg font-semibold">Portfolio</h3>
                          <Button
                            variant="link"
                            className="gap-1 text-purple-600"
                            onClick={() => setActiveTab('portfolio')}
                          >
                            View Full Portfolio
                            <ArrowLeft className="h-4 w-4 rotate-180" />
                          </Button>
                        </div>
                        <div className="grid gap-4 md:grid-cols-3">
                          {tracks.slice(0, 3).map((track) => (
                            <TrackCard
                              key={track.id}
                              track={track}
                              isPlaying={playingTrackId === track.id}
                              onPlay={() => handleTrackPlay(track.id)}
                            />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Right Column - Endorsements */}
                <div className="space-y-6">
                  <Card className="border-border/50">
                    <CardContent className="p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Endorsements</h3>
                      </div>
                      <div className="py-6 text-center">
                        <Star className="mx-auto mb-3 h-10 w-10 text-muted-foreground opacity-50" />
                        <p className="text-sm text-muted-foreground">No endorsements yet</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Endorsements from collaborators will appear here
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Tab 2: Portfolio */}
            <TabsContent value="portfolio" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Music Portfolio</h2>
              </div>
              {tracks.length === 0 ? (
                <Card className="border-border/50">
                  <CardContent className="py-12 text-center">
                    <Music className="mx-auto mb-4 h-16 w-16 text-muted-foreground opacity-50" />
                    <h3 className="mb-2 text-xl font-semibold">No tracks uploaded yet</h3>
                    <p className="text-muted-foreground">
                      This artist hasn't uploaded any tracks yet.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-3">
                  {tracks.map((track) => (
                    <TrackCard
                      key={track.id}
                      track={track}
                      isPlaying={playingTrackId === track.id}
                      onPlay={() => handleTrackPlay(track.id)}
                      showActions
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Tab 3: Explore */}
            <TabsContent value="explore">
              <Card className="border-border/50">
                <CardContent className="py-12 text-center">
                  <Camera className="mx-auto mb-4 h-16 w-16 text-muted-foreground opacity-50" />
                  <h3 className="mb-2 text-xl font-semibold">Media Gallery</h3>
                  <p className="text-muted-foreground">No media posts yet</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 4: Journey */}
            <TabsContent value="journey">
              <Card className="border-border/50">
                <CardContent className="py-12 text-center">
                  <Calendar className="mx-auto mb-4 h-16 w-16 text-muted-foreground opacity-50" />
                  <h3 className="mb-2 text-xl font-semibold">Career Journey</h3>
                  <p className="text-muted-foreground">Timeline coming soon</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 5: Reviews */}
            <TabsContent value="reviews" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Client Reviews ({reviews.length})</h2>
              </div>
              {reviews.length === 0 ? (
                <Card className="border-border/50">
                  <CardContent className="py-12 text-center">
                    <Star className="mx-auto mb-4 h-16 w-16 text-muted-foreground opacity-50" />
                    <h3 className="mb-2 text-xl font-semibold">No reviews yet</h3>
                    <p className="text-muted-foreground">
                      This artist hasn't received any reviews yet.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Tab 6: Opportunities */}
            <TabsContent value="opportunities">
              <Card className="border-border/50">
                <CardContent className="py-12 text-center">
                  <ThumbsUp className="mx-auto mb-4 h-16 w-16 text-muted-foreground opacity-50" />
                  <h3 className="mb-2 text-xl font-semibold">Available for Booking</h3>
                  <p className="mb-4 text-muted-foreground">
                    Reach out to book this artist for your next event
                  </p>
                  {isAuthenticated ? (
                    <Button
                      className="bg-purple-500 hover:bg-purple-600"
                      onClick={handleBookArtist}
                      disabled={startingConversation}
                    >
                      {startingConversation ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Starting...
                        </>
                      ) : (
                        <>
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Send Booking Inquiry
                        </>
                      )}
                    </Button>
                  ) : (
                    <PublicProfileCTAButton
                      returnUrl={`/artist/${id}`}
                      profileType="artist"
                      ctaText="Join to Book"
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Join Umbrella CTA Banner for unauthenticated users */}
        {!isAuthenticated && (
          <div className="mx-auto w-full max-w-6xl px-4 pb-6">
            <PublicProfileCTABanner
              returnUrl={`/artist/${id}`}
              profileType="artist"
              profileName={artist.artist_name}
            />
          </div>
        )}
      </div>

      {/* Report Dialog */}
      <AlertDialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Report Profile</AlertDialogTitle>
            <AlertDialogDescription>
              Help us keep Umbrella safe by reporting inappropriate content or behavior.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Reason for reporting</Label>
              <RadioGroup value={reportReason} onValueChange={setReportReason}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="spam" id="spam" />
                  <Label htmlFor="spam" className="cursor-pointer font-normal">
                    Spam or fake profile
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="inappropriate" id="inappropriate" />
                  <Label htmlFor="inappropriate" className="cursor-pointer font-normal">
                    Inappropriate content
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="harassment" id="harassment" />
                  <Label htmlFor="harassment" className="cursor-pointer font-normal">
                    Harassment or abuse
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="impersonation" id="impersonation" />
                  <Label htmlFor="impersonation" className="cursor-pointer font-normal">
                    Impersonation
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other" className="cursor-pointer font-normal">
                    Other
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="details">Additional details (optional)</Label>
              <Textarea
                id="details"
                placeholder="Provide any additional context..."
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReportSubmit}
              className="bg-purple-500 hover:bg-purple-600"
            >
              Submit Report
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  )
}

// Track Card Component
interface TrackCardProps {
  track: Track
  isPlaying: boolean
  onPlay: () => void
  showActions?: boolean
}

function TrackCard({ track, isPlaying, onPlay, showActions }: TrackCardProps) {
  return (
    <Card className="overflow-hidden border-border/50 transition-all hover:shadow-md">
      <div className="relative aspect-square">
        {track.cover_art_url ? (
          <img src={track.cover_art_url} alt={track.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
            <Music className="h-12 w-12 text-white" />
          </div>
        )}
        {/* Play/Pause Overlay */}
        <button
          onClick={onPlay}
          className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90">
            {isPlaying ? (
              <Pause className="h-6 w-6 text-purple-600" />
            ) : (
              <Play className="h-6 w-6 text-purple-600" />
            )}
          </div>
        </button>
      </div>
      <CardContent className="p-4">
        <h4 className="mb-1 truncate font-semibold">{track.title}</h4>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <Badge variant="secondary" className="text-xs">
            {track.genre || 'Original'}
          </Badge>
          <span>{track.play_count?.toLocaleString() || 0} plays</span>
        </div>
        {showActions && (
          <div className="mt-3 flex gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Heart className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Review Card Component
interface ReviewCardProps {
  review: Review
}

function ReviewCard({ review }: ReviewCardProps) {
  return (
    <Card className="border-border/50">
      <CardContent className="p-6">
        <div className="flex gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={review.reviewer_avatar_url} alt={review.reviewer_name} />
            <AvatarFallback className="bg-purple-100 text-purple-700">
              {(review.reviewer_name || 'R').charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="mb-2 flex items-start justify-between">
              <div>
                <h4 className="font-semibold">{review.reviewer_name}</h4>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <span className="text-sm text-muted-foreground">
                {new Date(review.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
            <p className="text-muted-foreground">{review.comment}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
