import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { artistsService, tracksService, reviewsService } from '@/services/api'
import type { Artist, Track, Review, Endorsement, Gig } from '@/types'
import AppLayout from '@/components/layout/AppLayout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  MapPin,
  Star,
  Users,
  Music,
  ThumbsUp,
  Share2,
  Flag,
  Edit,
  MoreVertical,
  Globe,
  MessageCircle,
  Play,
  Pause,
  Heart,
  CheckCircle2,
} from 'lucide-react'
import LoadingState from '@/components/common/LoadingState'
import ErrorState from '@/components/common/ErrorState'

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [artist, setArtist] = useState<Artist | null>(null)
  const [tracks, setTracks] = useState<Track[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [bioExpanded, setBioExpanded] = useState(false)

  const isOwnProfile = user?.id === id

  useEffect(() => {
    if (!id) return

    const fetchProfileData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch artist profile
        const artistData = await artistsService.getById(id)
        setArtist(artistData)

        // Fetch tracks
        const tracksData = await artistsService.getTracks(id)
        setTracks(tracksData)

        // Fetch reviews
        const reviewsData = await artistsService.getReviews(id)
        setReviews(reviewsData)
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
        await artistsService.unfollow(id)
        setIsFollowing(false)
        if (artist) {
          setArtist({ ...artist, follower_count: artist.follower_count - 1 })
        }
      } else {
        await artistsService.follow(id)
        setIsFollowing(true)
        if (artist) {
          setArtist({ ...artist, follower_count: artist.follower_count + 1 })
        }
      }
    } catch (err) {
      console.error('Error toggling follow:', err)
    }
  }

  const handleBookArtist = () => {
    // D-076: Opens message composer with pre-filled booking inquiry
    navigate(`/messages/new?recipient=${id}&template=booking`)
  }

  const handleShare = () => {
    // Copy profile URL to clipboard
    const profileUrl = `${window.location.origin}/artist/${id}`
    navigator.clipboard.writeText(profileUrl)
    // TODO: Show toast notification
  }

  const handleReport = () => {
    // TODO: Implement report functionality
    console.log('Report profile')
  }

  const handleTrackPlay = async (trackId: string) => {
    if (playingTrackId === trackId) {
      setPlayingTrackId(null)
    } else {
      setPlayingTrackId(trackId)
      // Record play count (D-024: Inline playback tracking)
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
        <ErrorState message={error || 'Artist not found'} />
      </AppLayout>
    )
  }

  const truncatedBio = artist.bio && artist.bio.length > 200
    ? `${artist.bio.substring(0, 200)}...`
    : artist.bio

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Profile {artist.profile_completion_percentage || 85}% complete
            </span>
            {/* D-023: Profile actions menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isOwnProfile ? (
                  <>
                    <DropdownMenuItem onClick={() => navigate('/profile/edit')}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleShare}>
                      <Share2 className="mr-2 h-4 w-4" />
                      Share Profile
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem onClick={handleShare}>
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleReport}>
                      <Flag className="mr-2 h-4 w-4" />
                      Report
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Hero Section */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <Avatar className="h-32 w-32 shrink-0">
                <AvatarImage src={artist.avatar_url} alt={artist.artist_name} />
                <AvatarFallback className="text-2xl">
                  {artist.artist_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-3xl font-bold">{artist.artist_name}</h1>
                      {artist.verified && (
                        <Badge variant="default" className="gap-1 bg-green-600">
                          <CheckCircle2 className="h-3 w-3" />
                          Wholesome
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      {artist.location}
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{artist.follower_count.toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground">Followers</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Music className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{tracks.length}</span>
                    <span className="text-sm text-muted-foreground">Tracks</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="font-semibold">{artist.rating_avg.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">
                      ({artist.review_count} reviews)
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{artist.gigs_completed}</span>
                    <span className="text-sm text-muted-foreground">Gigs</span>
                  </div>
                </div>

                {/* Social Links */}
                {Object.keys(artist.social_links).length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {artist.social_links.website && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={artist.social_links.website} target="_blank" rel="noopener noreferrer">
                          <Globe className="h-4 w-4 mr-1" />
                          Website
                        </a>
                      </Button>
                    )}
                    {artist.social_links.instagram && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={artist.social_links.instagram} target="_blank" rel="noopener noreferrer">
                          Instagram
                        </a>
                      </Button>
                    )}
                    {artist.social_links.tiktok && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={artist.social_links.tiktok} target="_blank" rel="noopener noreferrer">
                          TikTok
                        </a>
                      </Button>
                    )}
                    {artist.social_links.spotify && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={artist.social_links.spotify} target="_blank" rel="noopener noreferrer">
                          Spotify
                        </a>
                      </Button>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                {!isOwnProfile && (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleFollowToggle}>
                      {isFollowing ? 'Unfollow' : 'Follow'}
                    </Button>
                    <Button onClick={handleBookArtist}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Book Artist
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 6-Tab Navigation System */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="explore">Explore</TabsTrigger>
            <TabsTrigger value="journey">Journey</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          </TabsList>

          {/* Tab 1: Overview */}
          <TabsContent value="overview" className="space-y-6">
            {/* Bio */}
            {artist.bio && (
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold mb-3">About</h2>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {bioExpanded ? artist.bio : truncatedBio}
                  </p>
                  {artist.bio.length > 200 && (
                    <Button
                      variant="link"
                      className="px-0 mt-2"
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
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Portfolio</h2>
                    <Button variant="link" onClick={() => setActiveTab('portfolio')}>
                      View Full Portfolio →
                    </Button>
                  </div>
                  <div className="space-y-3">
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

            {/* Endorsements Preview */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Endorsements</h2>
                  <Button variant="link">View All →</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">🔥 Dynamic Vocalist - 17</Badge>
                  <Badge variant="secondary">🎵 Reliable Musician - 8</Badge>
                  <Badge variant="secondary">🤝 Great Collaborator - 16</Badge>
                  <Badge variant="secondary">🎸 Stage Presence - 9</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Portfolio */}
          <TabsContent value="portfolio" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Music Portfolio</h2>
              {isOwnProfile && (
                <Button>
                  <Music className="h-4 w-4 mr-2" />
                  Add Track
                </Button>
              )}
            </div>
            {tracks.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No tracks uploaded yet
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
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
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-semibold mb-4">Media Gallery</h2>
                <p className="text-muted-foreground text-center py-8">
                  No media posts yet
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 4: Journey */}
          <TabsContent value="journey">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-semibold mb-4">Career Journey</h2>
                <p className="text-muted-foreground text-center py-8">
                  Timeline coming soon
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 5: Reviews */}
          <TabsContent value="reviews" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Reviews ({reviews.length})</h2>
              {isOwnProfile && (
                <Button variant="outline">Invite Review</Button>
              )}
            </div>
            {reviews.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No reviews yet
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
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-semibold mb-4">Latest Opportunities</h2>
                <p className="text-muted-foreground text-center py-8">
                  No opportunities available
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}

// Track Card Component with Inline Player (D-024)
interface TrackCardProps {
  track: Track
  isPlaying: boolean
  onPlay: () => void
  showActions?: boolean
}

function TrackCard({ track, isPlaying, onPlay, showActions }: TrackCardProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center gap-4">
          {/* Album Art */}
          <div className="relative h-16 w-16 rounded bg-muted flex-shrink-0">
            {track.cover_art_url ? (
              <img
                src={track.cover_art_url}
                alt={track.title}
                className="h-full w-full object-cover rounded"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <Music className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            {/* Play/Pause Overlay */}
            <button
              onClick={onPlay}
              className="absolute inset-0 bg-black/50 flex items-center justify-center rounded opacity-0 hover:opacity-100 transition-opacity"
            >
              {isPlaying ? (
                <Pause className="h-6 w-6 text-white" />
              ) : (
                <Play className="h-6 w-6 text-white" />
              )}
            </button>
          </div>

          {/* Track Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <h3 className="font-semibold truncate">{track.title}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{track.genre}</span>
                  <span>•</span>
                  <span>{formatDuration(track.duration_seconds)}</span>
                  <span>•</span>
                  <span>{track.play_count.toLocaleString()} plays</span>
                </div>
              </div>
              {showActions && (
                <div className="flex gap-2 ml-2">
                  <Button variant="ghost" size="icon">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
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
    <Card>
      <CardContent className="pt-6">
        <div className="flex gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={review.reviewer_avatar_url} alt={review.reviewer_name} />
            <AvatarFallback>
              {review.reviewer_name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-semibold">{review.reviewer_name}</h4>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating
                          ? 'fill-yellow-500 text-yellow-500'
                          : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <span className="text-sm text-muted-foreground">
                {new Date(review.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="text-muted-foreground">{review.comment}</p>
            {review.gig_title && (
              <p className="text-sm text-muted-foreground mt-2">
                Gig: {review.gig_title}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
