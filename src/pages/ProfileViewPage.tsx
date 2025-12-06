import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { apiClient } from '@/lib/api-client'
import { tracksService, filesService, mediaService, type MediaItem } from '@/services/api'
import type { Artist, Track, Review } from '@/types'
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  MapPin,
  Star,
  Music,
  ThumbsUp,
  Share2,
  Edit,
  Play,
  Pause,
  CheckCircle2,
  ArrowLeft,
  Calendar,
  Sparkles,
  Camera,
  Eye,
  Loader2,
  Trash2,
  X,
} from 'lucide-react'
import LoadingState from '@/components/common/LoadingState'
import ErrorState from '@/components/common/ErrorState'
import { MetaTags } from '@/components/MetaTags'
import { TrackUploadModal } from '@/components/profile/TrackUploadModal'

import { SocialLinksBarWithToolbox, type SocialLinksData } from '@/components/common/SocialIcons'

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
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('preview')

  // Cover image upload state
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [isUploadingCover, setIsUploadingCover] = useState(false)
  const coverInputRef = useRef<HTMLInputElement>(null)

  // Track upload modal state
  const [trackUploadModalOpen, setTrackUploadModalOpen] = useState(false)

  // Track delete confirmation state
  const [deleteTrackId, setDeleteTrackId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Media (Explore) state
  const [media, setMedia] = useState<MediaItem[]>([])
  const [isUploadingMedia, setIsUploadingMedia] = useState(false)
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null)
  const mediaInputRef = useRef<HTMLInputElement>(null)

  // Fetch tracks for the current user
  const fetchTracks = useCallback(async () => {
    try {
      const response = await tracksService.list()
      setTracks(response.tracks || [])
    } catch (err) {
      console.warn('Could not load tracks:', err)
      setTracks([])
    }
  }, [])

  // Fetch media for the Explore gallery
  const fetchMedia = useCallback(async (artistId: string) => {
    try {
      const response = await mediaService.getArtistMedia(artistId)
      setMedia(response.media || [])
    } catch (err) {
      console.warn('Could not load media:', err)
      setMedia([])
    }
  }, [])

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true)
        setError(null)

        const profileData = await apiClient.getProfile()
        setArtist(profileData)

        // Fetch tracks
        await fetchTracks()

        // Fetch media for Explore gallery
        if (profileData.id) {
          await fetchMedia(profileData.id)
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
  }, [fetchTracks, fetchMedia])

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

  // Handle track deletion
  const handleDeleteTrack = async () => {
    if (!deleteTrackId) return

    setIsDeleting(true)
    try {
      await tracksService.delete(deleteTrackId)
      toast({
        title: 'Track deleted',
        description: 'The track has been removed from your portfolio.',
      })
      // Refresh tracks list
      fetchTracks()
    } catch (err) {
      console.error('Failed to delete track:', err)
      toast({
        title: 'Delete failed',
        description: err instanceof Error ? err.message : 'Failed to delete track',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
      setDeleteTrackId(null)
    }
  }

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please select a JPEG, PNG, WebP, or HEIC image',
        variant: 'destructive',
      })
      return
    }

    // Validate file size (15MB max for covers)
    const maxSize = 15 * 1024 * 1024
    if (file.size > maxSize) {
      toast({
        title: 'File too large',
        description: `File size must be less than 15MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB`,
        variant: 'destructive',
      })
      return
    }

    // Create preview and upload immediately
    const reader = new FileReader()
    reader.onloadend = () => {
      setCoverPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload the file
    handleCoverUpload(file)
  }

  const handleCoverUpload = async (file: File) => {
    setIsUploadingCover(true)

    try {
      const result = await apiClient.uploadProfileCover(file)

      toast({
        title: 'Cover updated',
        description: 'Your profile cover has been updated successfully',
      })

      // Update the artist state with new cover URL (URL already includes timestamp in filename)
      if (artist) {
        setArtist({ ...artist, banner_url: result.coverUrl })
      }
      setCoverPreview(null) // Clear preview, use actual URL now
    } catch (err) {
      toast({
        title: 'Upload failed',
        description: err instanceof Error ? err.message : 'Failed to upload cover image',
        variant: 'destructive',
      })
      setCoverPreview(null) // Clear preview on error
    } finally {
      setIsUploadingCover(false)
      // Reset the file input
      if (coverInputRef.current) {
        coverInputRef.current.value = ''
      }
    }
  }

  // Handle media upload for Explore gallery
  const handleMediaSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type (images and videos)
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/heic',
      'video/mp4',
      'video/quicktime',
      'video/webm',
      'video/x-msvideo',
    ]
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image (JPEG, PNG, WebP, GIF) or video (MP4, MOV, WebM)',
        variant: 'destructive',
      })
      return
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      toast({
        title: 'File too large',
        description: `File size must be less than 50MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB`,
        variant: 'destructive',
      })
      return
    }

    setIsUploadingMedia(true)

    try {
      await filesService.upload(file)

      toast({
        title: 'Media uploaded!',
        description: 'Your media has been added to your gallery.',
      })

      // Refresh media list
      if (artist?.id) {
        await fetchMedia(artist.id)
      }
    } catch (err) {
      toast({
        title: 'Upload failed',
        description: err instanceof Error ? err.message : 'Failed to upload media',
        variant: 'destructive',
      })
    } finally {
      setIsUploadingMedia(false)
      // Reset the file input
      if (mediaInputRef.current) {
        mediaInputRef.current.value = ''
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
          {/* Cover image - use uploaded cover, preview, or default gradient */}
          {coverPreview || artist?.banner_url ? (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${coverPreview || artist?.banner_url}')` }}
            />
          ) : (
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&h=400&fit=crop')] bg-cover bg-center opacity-50" />
          )}

          {/* Hidden file input for cover upload */}
          <input
            ref={coverInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic"
            onChange={handleCoverSelect}
            className="hidden"
          />

          {/* Edit cover button - only in edit mode, positioned bottom-right to avoid overlap with header */}
          {viewMode === 'edit' && (
            <Button
              variant="secondary"
              size="sm"
              className="absolute bottom-4 right-4 gap-1.5 bg-white/90 hover:bg-white"
              onClick={() => coverInputRef.current?.click()}
              disabled={isUploadingCover}
            >
              {isUploadingCover ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
              {isUploadingCover ? 'Uploading...' : 'Edit Cover'}
            </Button>
          )}

          {/* Header with back button and completion/view mode toggle */}
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
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 rounded-full bg-white/90 p-1">
                <Button
                  variant={viewMode === 'edit' ? 'default' : 'ghost'}
                  size="sm"
                  className={`gap-1.5 rounded-full ${viewMode === 'edit' ? 'bg-purple-500 text-white hover:bg-purple-600' : 'hover:bg-white/50'}`}
                  onClick={() => setViewMode('edit')}
                >
                  <Edit className="h-3.5 w-3.5" />
                  Edit Mode
                </Button>
                <Button
                  variant={viewMode === 'preview' ? 'default' : 'ghost'}
                  size="sm"
                  className={`gap-1.5 rounded-full ${viewMode === 'preview' ? 'bg-purple-500 text-white hover:bg-purple-600' : 'hover:bg-white/50'}`}
                  onClick={() => setViewMode('preview')}
                >
                  <Eye className="h-3.5 w-3.5" />
                  Public Preview
                </Button>
              </div>
              {/* Profile Completion - only in edit mode */}
              {viewMode === 'edit' && (
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
              )}
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
                      <span>{location}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={handleShare}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                    {viewMode === 'edit' && (
                      <Button
                        className="gap-2 bg-purple-500 hover:bg-purple-600"
                        onClick={() => navigate('/profile/edit')}
                      >
                        <Edit className="h-4 w-4" />
                        Edit Profile
                      </Button>
                    )}
                  </div>
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
                    <p className="text-2xl font-bold">{artist.review_count || 0}</p>
                    <p className="text-sm text-muted-foreground">Endorsements</p>
                  </div>
                </div>

                {/* Social Links */}
                <SocialLinksBarWithToolbox
                  data={artist as unknown as SocialLinksData}
                  showToolbox={viewMode === 'preview'}
                />
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
                <Button
                  className="gap-2 bg-purple-500 hover:bg-purple-600"
                  onClick={() => setTrackUploadModalOpen(true)}
                >
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
                    <Button
                      className="bg-purple-500 hover:bg-purple-600"
                      onClick={() => setTrackUploadModalOpen(true)}
                    >
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
                      onDelete={(id) => setDeleteTrackId(id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Tab 3: Explore */}
            <TabsContent value="explore" className="space-y-4">
              {/* Hidden file input for media upload */}
              <input
                ref={mediaInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/heic,video/mp4,video/quicktime,video/webm"
                onChange={handleMediaSelect}
                className="hidden"
              />

              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Media Gallery</h2>
                <Button
                  variant="outline"
                  onClick={() => mediaInputRef.current?.click()}
                  disabled={isUploadingMedia}
                >
                  {isUploadingMedia ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Camera className="mr-2 h-4 w-4" />
                      Upload Media
                    </>
                  )}
                </Button>
              </div>

              {media.length === 0 ? (
                <Card className="border-border/50">
                  <CardContent className="py-12 text-center">
                    <Camera className="mx-auto mb-4 h-16 w-16 text-muted-foreground opacity-50" />
                    <h3 className="mb-2 text-xl font-semibold">Share your moments</h3>
                    <p className="mb-4 text-muted-foreground">
                      Share photos and videos from your performances
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => mediaInputRef.current?.click()}
                      disabled={isUploadingMedia}
                    >
                      {isUploadingMedia ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        'Upload Your First Media'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {media.map((item) => (
                    <Card
                      key={item.id}
                      className="cursor-pointer overflow-hidden border-border/50 transition-shadow hover:shadow-md"
                      onDoubleClick={() => setPreviewMedia(item)}
                      title="Double-click to view"
                    >
                      <div className="relative aspect-square">
                        {item.file_type.startsWith('video/') ? (
                          <div className="relative h-full w-full">
                            <video src={item.url} className="h-full w-full object-cover" muted />
                            {/* Play icon overlay for videos */}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80">
                                <Play className="h-5 w-5 text-purple-600" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <img
                            src={item.url}
                            alt={item.filename}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <CardContent className="p-2">
                        <p className="truncate text-sm text-muted-foreground">{item.filename}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
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

      {/* Track Upload Modal */}
      <TrackUploadModal
        open={trackUploadModalOpen}
        onOpenChange={setTrackUploadModalOpen}
        onSuccess={fetchTracks}
      />

      {/* Delete Track Confirmation Dialog */}
      <AlertDialog open={!!deleteTrackId} onOpenChange={(open) => !open && setDeleteTrackId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Track?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The track will be permanently removed from your
              portfolio.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTrack}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Media Preview Modal */}
      <Dialog open={!!previewMedia} onOpenChange={(open) => !open && setPreviewMedia(null)}>
        <DialogContent className="flex max-h-[90vh] max-w-[90vw] flex-col p-0">
          <DialogHeader className="flex flex-row items-center justify-between border-b px-4 py-3">
            <DialogTitle className="truncate pr-4 text-sm font-medium">
              {previewMedia?.filename}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => setPreviewMedia(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <div className="flex min-h-0 flex-1 items-center justify-center bg-black/5 p-4">
            {previewMedia && (
              <>
                {/* Videos */}
                {previewMedia.file_type.startsWith('video/') && (
                  <video
                    src={previewMedia.url}
                    controls
                    autoPlay
                    className="max-h-[70vh] max-w-full"
                  >
                    Your browser does not support video playback.
                  </video>
                )}

                {/* Images */}
                {previewMedia.file_type.startsWith('image/') && (
                  <img
                    src={previewMedia.url}
                    alt={previewMedia.filename}
                    className="max-h-[70vh] max-w-full object-contain"
                  />
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}

// Track Card Component with Audio Player
interface TrackCardProps {
  track: Track
  isPlaying: boolean
  onPlay: () => void
  onDelete?: (trackId: string) => void
}

function TrackCard({ track, isPlaying, onPlay, onDelete }: TrackCardProps) {
  const { toast } = useToast()
  const audioRef = useRef<HTMLAudioElement>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)

  // Format time as M:SS
  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Build audio URL from track's file_url (with null guard)
  const audioUrl = track.file_url
    ? track.file_url.startsWith('/media/')
      ? track.file_url
      : `/media/${track.file_url}`
    : null

  // Handle play/pause
  const handlePlayPause = () => {
    if (!audioUrl) {
      toast({
        title: 'Playback Error',
        description: 'Audio file not available for this track',
        variant: 'destructive',
      })
      return
    }

    const audio = audioRef.current
    if (!audio) return

    if (isAudioPlaying) {
      audio.pause()
    } else {
      audio.play().catch((err) => {
        console.error('Audio playback error:', err)
        toast({
          title: 'Playback Error',
          description: 'Could not play this track. Please try again.',
          variant: 'destructive',
        })
      })
    }
    onPlay() // Notify parent
  }

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleLoadedMetadata = () => setDuration(audio.duration)
    const handlePlay = () => setIsAudioPlaying(true)
    const handlePause = () => setIsAudioPlaying(false)
    const handleEnded = () => {
      setIsAudioPlaying(false)
      setCurrentTime(0)
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  // Sync with parent isPlaying state (for when another track starts playing)
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (!isPlaying && isAudioPlaying) {
      audio.pause()
    }
  }, [isPlaying, isAudioPlaying])

  // Handle progress bar scrubbing
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return

    const newTime = parseFloat(e.target.value)
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  return (
    <Card className="group overflow-hidden border-border/50 transition-all hover:shadow-md">
      {/* Hidden audio element - only render if audioUrl exists */}
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="metadata" />}

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
          onClick={handlePlayPause}
          className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${
            isAudioPlaying ? 'opacity-100' : 'opacity-0 hover:opacity-100'
          }`}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90">
            {isAudioPlaying ? (
              <Pause className="h-6 w-6 text-purple-600" />
            ) : (
              <Play className="h-6 w-6 text-purple-600" />
            )}
          </div>
        </button>

        {/* Progress Bar Overlay at bottom of image */}
        {(isAudioPlaying || currentTime > 0) && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/30 accent-purple-500 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
            />
            <div className="mt-1 flex justify-between text-xs text-white/80">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h4 className="mb-1 truncate font-semibold">{track.title}</h4>
            <div className="flex items-center text-sm text-muted-foreground">
              <Badge variant="secondary" className="text-xs">
                {track.genre || 'Original'}
              </Badge>
            </div>
          </div>
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(track.id)
              }}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
              title="Delete track"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
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
