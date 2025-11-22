import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { apiClient } from '@/lib/api-client'
import type { Artist } from '../../api/models/artist'
import type { Track, Review } from '@/types'
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
  Edit,
  MoreVertical,
  Globe,
  Play,
  Pause,
  Heart,
  CheckCircle2,
  Settings,
} from 'lucide-react'
import LoadingState from '@/components/common/LoadingState'
import ErrorState from '@/components/common/ErrorState'
import { MetaTags } from '@/components/MetaTags'
import { calculateProfileCompletion } from '../../api/models/artist'

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

        // Fetch current user's artist profile
        const profileData = await apiClient.getProfile()
        setArtist(profileData)

        // Fetch tracks - using mock data for now since API might not be fully implemented
        try {
          const tracksData: Track[] = [] // await apiClient.getMyTracks()
          setTracks(tracksData)
        } catch (err) {
          console.warn('Could not load tracks:', err)
          setTracks([])
        }

        // Fetch reviews
        try {
          const reviewsData: Review[] = [] // await apiClient.getMyReviews()
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
    // Copy profile URL to clipboard
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
      // TODO: Record play count when API is available
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

  const truncatedBio = artist.bio && artist.bio.length > 200
    ? `${artist.bio.substring(0, 200)}...`
    : artist.bio

  const profileCompletion = calculateProfileCompletion(artist)
  const location = `${artist.location_city || ''}, ${artist.location_state || ''}`.trim()

  return (
    <AppLayout>
      <MetaTags
        title="My Profile"
        description={`${artist.stage_name} - Independent artist on Umbrella`}
        url="/profile/view"
      />
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Profile {profileCompletion}% complete
            </span>
            {/* D-023: Profile actions menu - "Edit Profile" for own profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate('/profile/edit')}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShare}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Profile
                </DropdownMenuItem>
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
                <AvatarImage src={artist.avatar_url || undefined} alt={artist.stage_name} />
                <AvatarFallback className="text-2xl">
                  {artist.stage_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-3xl font-bold">{artist.stage_name}</h1>
                      {artist.verified && (
                        <Badge variant="default" className="gap-1 bg-green-600">
                          <CheckCircle2 className="h-3 w-3" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    {location && (
                      <div className="flex items-center text-muted-foreground mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        {location}
                      </div>
                    )}
                  </div>
                </div>

                {/* Metrics - D-070: Platform followers only */}
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
                    <span className="font-semibold">{artist.avg_rating.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">
                      ({artist.total_reviews} reviews)
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{artist.total_gigs}</span>
                    <span className="text-sm text-muted-foreground">Gigs</span>
                  </div>
                </div>

                {/* Social Links */}
                {(artist.website_url || artist.instagram_handle || artist.tiktok_handle ||
                  artist.spotify_url || artist.facebook_url) && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {artist.website_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={artist.website_url} target="_blank" rel="noopener noreferrer">
                          <Globe className="h-4 w-4 mr-1" />
                          Website
                        </a>
                      </Button>
                    )}
                    {artist.instagram_handle && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={`https://instagram.com/${artist.instagram_handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                          Instagram
                        </a>
                      </Button>
                    )}
                    {artist.tiktok_handle && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={`https://tiktok.com/@${artist.tiktok_handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                          TikTok
                        </a>
                      </Button>
                    )}
                    {artist.spotify_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={artist.spotify_url} target="_blank" rel="noopener noreferrer">
                          Spotify
                        </a>
                      </Button>
                    )}
                    {artist.facebook_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={artist.facebook_url} target="_blank" rel="noopener noreferrer">
                          Facebook
                        </a>
                      </Button>
                    )}
                  </div>
                )}

                {/* Edit Profile Button */}
                <div className="flex gap-2">
                  <Button onClick={() => navigate('/profile/edit')}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="outline" onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 6-Tab Navigation System (D-022) */}
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
            {/* Violet Suggestion Banner */}
            {profileCompletion < 100 && (
              <Card className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
                <CardContent className="pt-6">
                  <p className="text-sm text-purple-900 dark:text-purple-100">
                    💡 <strong>Violet suggests:</strong> Profile {profileCompletion}% complete
                    {profileCompletion < 50 && ' - Add a bio and social links to increase visibility'}
                    {profileCompletion >= 50 && profileCompletion < 80 && ' - Upload more tracks to showcase your work'}
                    {profileCompletion >= 80 && ' - Almost there! Add availability dates to get more bookings'}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Bio */}
            {artist.bio ? (
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
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold mb-3">About</h2>
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="mb-4">Add a bio to tell your story</p>
                    <Button variant="outline" onClick={() => navigate('/profile/edit')}>
                      Add Bio
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Portfolio Preview (D-024: Inline playback) */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Portfolio</h2>
                  {tracks.length > 0 ? (
                    <Button variant="link" onClick={() => setActiveTab('portfolio')}>
                      View Full Portfolio →
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm">
                      Add Track
                    </Button>
                  )}
                </div>
                {tracks.length > 0 ? (
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
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Music className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="mb-4">No tracks uploaded yet</p>
                    <Button variant="outline">Upload Your First Track</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Endorsements Preview */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Endorsements</h2>
                </div>
                <div className="text-center py-8 text-muted-foreground">
                  <p>No endorsements yet</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Portfolio (D-026: No upload limit) */}
          <TabsContent value="portfolio" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Music Portfolio</h2>
              <Button>
                <Music className="h-4 w-4 mr-2" />
                Add Track
              </Button>
            </div>
            {tracks.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12 text-muted-foreground">
                    <Music className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">Build your portfolio</h3>
                    <p className="mb-4">Upload tracks to showcase your work to venues and collaborators</p>
                    <Button>Upload Your First Track</Button>
                  </div>
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

          {/* Tab 3: Explore (D-028: Manual upload only) */}
          <TabsContent value="explore">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold">Media Gallery</h2>
                  <Button variant="outline">Upload Media</Button>
                </div>
                <div className="text-center py-12 text-muted-foreground">
                  <p>No media posts yet</p>
                  <p className="text-sm mt-2">Share photos and videos from your performances</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 4: Journey (D-080: Either party can mark gigs complete) */}
          <TabsContent value="journey">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-semibold mb-4">Career Journey</h2>
                <div className="text-center py-12 text-muted-foreground">
                  <p>Your career timeline will appear here</p>
                  <p className="text-sm mt-2">Complete gigs to build your journey</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 5: Reviews (D-032: Invite anyone via email) */}
          <TabsContent value="reviews" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Reviews ({reviews.length})</h2>
              <Button variant="outline">Invite Review</Button>
            </div>
            {reviews.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12 text-muted-foreground">
                    <Star className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">Build your reputation</h3>
                    <p className="mb-4">Invite clients and collaborators to leave reviews</p>
                    <Button variant="outline">Invite Your First Review</Button>
                  </div>
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

          {/* Tab 6: Opportunities (D-011: Latest 3 gigs from marketplace) */}
          <TabsContent value="opportunities">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold">Latest Opportunities</h2>
                  <Button variant="outline" onClick={() => navigate('/marketplace/gigs')}>
                    Browse All Gigs
                  </Button>
                </div>
                <div className="text-center py-12 text-muted-foreground">
                  <p>No opportunities available yet</p>
                  <p className="text-sm mt-2">Check back soon for new gig opportunities</p>
                </div>
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
