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

// Social platform icons (simplified SVG components)
const TikTokIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
)

const SpotifyIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
  </svg>
)

const AppleMusicIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 00-1.877-.726 10.496 10.496 0 00-1.564-.15c-.04-.003-.083-.01-.124-.013H5.986c-.152.01-.303.017-.455.026-.747.043-1.49.123-2.193.401-1.336.53-2.3 1.452-2.865 2.78-.192.448-.292.925-.363 1.408-.056.392-.088.785-.1 1.18 0 .032-.007.062-.01.093v12.223c.01.14.017.283.027.424.05.815.154 1.624.497 2.373.65 1.42 1.738 2.353 3.234 2.801.42.127.856.187 1.293.228.555.053 1.11.06 1.667.06h11.03a12.5 12.5 0 001.57-.1c.822-.106 1.596-.35 2.295-.81a5.046 5.046 0 001.88-2.207c.186-.42.293-.87.37-1.324.113-.675.138-1.358.137-2.04-.002-3.8 0-7.595-.003-11.393zm-6.423 3.99v5.712c0 .417-.058.827-.244 1.206-.29.59-.76.962-1.388 1.14-.35.1-.706.157-1.07.173-.95.042-1.8-.228-2.403-.96-.63-.767-.7-1.636-.37-2.526.348-.922 1.077-1.45 2.024-1.645.287-.06.58-.09.87-.124.453-.05.904-.1 1.35-.18.162-.028.322-.072.478-.138.07-.03.097-.082.097-.16-.003-1.58-.002-3.16-.002-4.74 0-.1-.031-.14-.136-.154-.542-.077-1.084-.16-1.627-.235-.918-.128-1.836-.253-2.755-.378-.024-.003-.05-.003-.083-.005-.01.097-.022.184-.022.272-.005 2.442-.004 4.885-.007 7.328 0 .413-.05.82-.23 1.194-.29.595-.77.974-1.407 1.148-.35.096-.706.15-1.065.166-.96.037-1.817-.24-2.418-.985-.618-.764-.682-1.625-.354-2.51.342-.923 1.074-1.457 2.028-1.656.29-.06.585-.093.878-.126.443-.05.887-.09 1.325-.173.182-.035.358-.088.528-.16.067-.03.096-.082.095-.156-.002-2.09-.002-4.18-.002-6.27 0-.048.003-.096.01-.143.01-.064.044-.09.11-.078.164.03.328.054.492.084l2.296.402c1.282.223 2.564.447 3.846.67.166.03.333.054.498.087.058.013.09.048.09.108.003.166.01.332.01.498v6.074z" />
  </svg>
)

const InstagramIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
)

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

// Mock endorsements data
const MOCK_ENDORSEMENTS = [
  { id: '1', label: '🔥 Dynamic Vocalist', count: 12 },
  { id: '2', label: '🎸 Reliable Musician', count: 8 },
  { id: '3', label: '⭐ Great Collaborator', count: 15 },
  { id: '4', label: '🎤 Stage Presence', count: 9 },
]

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
                <div className="flex gap-3">
                  {artist.social_links?.tiktok && (
                    <a
                      href={artist.social_links.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-muted transition-colors hover:bg-muted/80"
                    >
                      <TikTokIcon />
                    </a>
                  )}
                  {artist.social_links?.spotify && (
                    <a
                      href={artist.social_links.spotify}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-muted transition-colors hover:bg-muted/80"
                    >
                      <SpotifyIcon />
                    </a>
                  )}
                  {artist.social_links?.apple_music && (
                    <a
                      href={artist.social_links.apple_music}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-muted transition-colors hover:bg-muted/80"
                    >
                      <AppleMusicIcon />
                    </a>
                  )}
                  {artist.social_links?.instagram && (
                    <a
                      href={artist.social_links.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-muted transition-colors hover:bg-muted/80"
                    >
                      <InstagramIcon />
                    </a>
                  )}
                </div>
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
                        <Button variant="link" className="gap-1 text-purple-600">
                          View All
                          <ArrowLeft className="h-4 w-4 rotate-180" />
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {MOCK_ENDORSEMENTS.map((endorsement) => (
                          <div
                            key={endorsement.id}
                            className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3"
                          >
                            <span className="text-sm">{endorsement.label}</span>
                            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                              {endorsement.count}
                            </Badge>
                          </div>
                        ))}
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
