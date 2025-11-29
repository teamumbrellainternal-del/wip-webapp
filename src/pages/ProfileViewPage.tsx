import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { apiClient } from '@/lib/api-client'
import type { Artist, Track, Review } from '@/types'
import AppLayout from '@/components/layout/AppLayout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import {
  MapPin,
  Star,
  Music,
  ThumbsUp,
  Share2,
  Edit,
  Play,
  Pause,
  Heart,
  CheckCircle2,
  ArrowLeft,
  Calendar,
  Sparkles,
  Camera,
} from 'lucide-react'
import LoadingState from '@/components/common/LoadingState'
import ErrorState from '@/components/common/ErrorState'
import { MetaTags } from '@/components/MetaTags'

import { SocialLinksBar, type SocialLinksData } from '@/components/common/SocialIcons'

// Profile completion calculator
function calculateProfileCompletion(artist: Artist): number {
  const fields = [
    artist.artist_name,
    artist.bio,
    artist.location,
    artist.avatar_url,
    artist.genres?.length > 0,
    artist.social_links?.instagram || artist.social_links?.spotify || artist.social_links?.website,
  ]
  const filledFields = fields.filter(Boolean).length
  return Math.round((filledFields / fields.length) * 100)
}

// Endorsements will be fetched from API when implemented
// For MVP, showing empty state

export default function ProfileViewPage() {
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
  const [bioExpanded, setBioExpanded] = useState(false)

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true)
        setError(null)

        const profileData = await apiClient.getProfile()
        setArtist(profileData)

        try {
          const tracksData: Track[] = []
          setTracks(tracksData)
        } catch (err) {
          console.warn('Could not load tracks:', err)
          setTracks([])
        }

        try {
          const reviewsData: Review[] = []
          setReviews(reviewsData)
        } catch (err) {
          console.warn('Could not load reviews:', err)
          setReviews([])
        }
      } catch (err) {
        console.error('Error fetching profile:', err)
        setError('Failed to load profile. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [])

  const handleShare = () => {
    if (user?.id) {
      const profileUrl = `${window.location.origin}/artist/${user.id}`
      navigator.clipboard.writeText(profileUrl)
      toast({
        title: 'Profile link copied',
        description: 'Share your profile with others!',
      })
    }
  }

  const handleTrackPlay = (trackId: string) => {
    if (playingTrackId === trackId) {
      setPlayingTrackId(null)
    } else {
      setPlayingTrackId(trackId)
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
        <ErrorState error={error || 'Profile not found'} />
      </AppLayout>
    )
  }

  const truncatedBio =
    artist.bio && artist.bio.length > 200 ? `${artist.bio.substring(0, 200)}...` : artist.bio

  const profileCompletion = calculateProfileCompletion(artist)
  const location = artist.location || 'Location not set'

  return (
    <AppLayout>
      <MetaTags
        title="My Profile"
        description={`${artist.artist_name} - Independent artist on Umbrella`}
        url="/profile/view"
      />

      <div className="flex min-h-[calc(100vh-4rem)] flex-col">
        {/* Cover Image Section */}
        <div className="relative h-48 bg-gradient-to-r from-purple-600 to-pink-600 md:h-64">
          {/* Cover image placeholder - could be replaced with actual cover image */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&h=400&fit=crop')] bg-cover bg-center opacity-50" />

          {/* Edit cover button */}
          <Button
            variant="secondary"
            size="sm"
            className="absolute right-4 top-4 gap-1.5 bg-white/90 hover:bg-white"
          >
            <Camera className="h-4 w-4" />
            Edit Cover
          </Button>

          {/* Header with back button and completion */}
          <div className="absolute left-0 right-0 top-0 flex items-center justify-between p-4">
            <Button
              variant="secondary"
              size="sm"
              className="gap-2 bg-white/90 hover:bg-white"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5">
              <span className="text-sm font-medium">Profile {profileCompletion}% complete</span>
              <div className="h-5 w-5">
                <svg viewBox="0 0 36 36" className="h-5 w-5 -rotate-90">
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    stroke="#9370DB"
                    strokeWidth="3"
                    strokeDasharray={`${profileCompletion} 100`}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Header - overlapping cover */}
        <div className="relative mx-auto w-full max-w-6xl px-4">
          <div className="-mt-16 rounded-xl border border-border/50 bg-card p-6 shadow-lg md:-mt-20">
            <div className="flex flex-col gap-6 md:flex-row">
              {/* Avatar */}
              <div className="relative -mt-20 md:-mt-24">
                <Avatar className="h-32 w-32 border-4 border-background shadow-lg md:h-40 md:w-40">
                  <AvatarImage
                    src={artist.avatar_url || undefined}
                    alt={artist.artist_name || 'Artist'}
                  />
                  <AvatarFallback className="bg-purple-100 text-3xl text-purple-700">
                    {(artist.artist_name || 'A').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {artist.verified && (
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
                      {artist.verified && (
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
                      <span>{location}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={handleShare}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                      className="gap-2 bg-purple-500 hover:bg-purple-600"
                      onClick={() => navigate('/profile/edit')}
                    >
                      <Edit className="h-4 w-4" />
                      Edit Profile
                    </Button>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {artist.follower_count?.toLocaleString() || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Followers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{artist.gigs_completed || 0}</p>
                    <p className="text-sm text-muted-foreground">Gigs Booked</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <p className="text-2xl font-bold">{artist.rating_avg?.toFixed(1) || '5.0'}</p>
                      <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                    </div>
                    <p className="text-sm text-muted-foreground">Avg Rating</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{artist.review_count || 0}</p>
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
                {/* Left Column - Bio */}
                <div className="space-y-6 lg:col-span-2">
                  {/* Bio Card */}
                  <Card className="border-border/50">
                    <CardContent className="p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Bio</h3>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8">
                            <svg viewBox="0 0 36 36" className="h-8 w-8 -rotate-90">
                              <circle
                                cx="18"
                                cy="18"
                                r="16"
                                fill="none"
                                stroke="#e5e7eb"
                                strokeWidth="2"
                              />
                              <circle
                                cx="18"
                                cy="18"
                                r="16"
                                fill="none"
                                stroke="#9370DB"
                                strokeWidth="2"
                                strokeDasharray={`${profileCompletion} 100`}
                                strokeLinecap="round"
                              />
                            </svg>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {profileCompletion}%
                          </span>
                        </div>
                      </div>
                      {artist.bio ? (
                        <>
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
                        </>
                      ) : (
                        <div className="py-4 text-center text-muted-foreground">
                          <p className="mb-4">Add a bio to tell your story</p>
                          <Button variant="outline" onClick={() => navigate('/profile/edit')}>
                            Add Bio
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Violet Suggestion */}
                  {profileCompletion < 100 && (
                    <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 dark:border-purple-800 dark:from-purple-950/50 dark:to-pink-950/50">
                      <CardContent className="flex items-center gap-3 p-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500">
                          <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                            Violet suggests:
                          </p>
                          <p className="text-sm text-purple-700 dark:text-purple-300">
                            Your profile is {profileCompletion}% complete - add{' '}
                            {profileCompletion < 50
                              ? 'a bio and social links'
                              : profileCompletion < 80
                                ? 'more tracks'
                                : 'availability dates'}{' '}
                            to boost visibility
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Portfolio Preview */}
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
                      {tracks.length > 0 ? (
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
                      ) : (
                        <div className="py-8 text-center text-muted-foreground">
                          <Music className="mx-auto mb-3 h-12 w-12 opacity-50" />
                          <p className="mb-4">No tracks uploaded yet</p>
                          <Button variant="outline">Upload Your First Track</Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
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
                <Button className="gap-2 bg-purple-500 hover:bg-purple-600">
                  <Music className="h-4 w-4" />
                  Add Track
                </Button>
              </div>
              {tracks.length === 0 ? (
                <Card className="border-border/50">
                  <CardContent className="py-12 text-center">
                    <Music className="mx-auto mb-4 h-16 w-16 text-muted-foreground opacity-50" />
                    <h3 className="mb-2 text-xl font-semibold">Build your portfolio</h3>
                    <p className="mb-4 text-muted-foreground">
                      Upload tracks to showcase your work to venues and collaborators
                    </p>
                    <Button className="bg-purple-500 hover:bg-purple-600">
                      Upload Your First Track
                    </Button>
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
                  <p className="mb-4 text-muted-foreground">
                    Share photos and videos from your performances
                  </p>
                  <Button variant="outline">Upload Media</Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 4: Journey */}
            <TabsContent value="journey">
              <Card className="border-border/50">
                <CardContent className="py-12 text-center">
                  <Calendar className="mx-auto mb-4 h-16 w-16 text-muted-foreground opacity-50" />
                  <h3 className="mb-2 text-xl font-semibold">Career Journey</h3>
                  <p className="text-muted-foreground">
                    Complete gigs to build your journey timeline
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 5: Reviews */}
            <TabsContent value="reviews" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Client Reviews ({reviews.length})</h2>
                <Button variant="outline">Invite Review</Button>
              </div>
              {reviews.length === 0 ? (
                <Card className="border-border/50">
                  <CardContent className="py-12 text-center">
                    <Star className="mx-auto mb-4 h-16 w-16 text-muted-foreground opacity-50" />
                    <h3 className="mb-2 text-xl font-semibold">Build your reputation</h3>
                    <p className="mb-4 text-muted-foreground">
                      Invite clients and collaborators to leave reviews
                    </p>
                    <Button variant="outline">Invite Your First Review</Button>
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
                  <h3 className="mb-2 text-xl font-semibold">Latest Opportunities</h3>
                  <p className="mb-4 text-muted-foreground">
                    Check back soon for new gig opportunities
                  </p>
                  <Button variant="outline" onClick={() => navigate('/marketplace/gigs')}>
                    Browse All Gigs
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
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
  const _formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

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
