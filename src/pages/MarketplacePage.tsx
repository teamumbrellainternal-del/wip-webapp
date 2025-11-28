import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  Star,
  CheckCircle2,
  Loader2,
  Users,
  Clock,
  ArrowLeft,
  Share2,
  Bookmark,
} from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import ErrorState from '@/components/common/ErrorState'
import { gigsService, artistsService } from '@/services/api'
import type { Gig, Artist, GigSearchParams, ArtistSearchParams } from '@/types'
import { toast } from 'sonner'
import { MetaTags } from '@/components/MetaTags'

type TabType = 'gigs' | 'artists'

const GENRES = [
  'Rock',
  'Pop',
  'Hip Hop',
  'R&B',
  'Jazz',
  'Classical',
  'Electronic',
  'Country',
  'Folk',
  'Blues',
  'Metal',
  'Indie',
]

const QUICK_FILTERS = [
  { id: 'jazz', label: 'Jazz', type: 'genre' as const },
  { id: 'rock', label: 'Rock', type: 'genre' as const },
  { id: 'acoustic', label: 'Acoustic', type: 'genre' as const },
  { id: 'opening', label: 'Opening Act', type: 'quick' as const },
  { id: 'weekend', label: 'This Weekend', type: 'quick' as const },
  { id: 'price500', label: '$500+', type: 'price' as const },
]

const PRICE_RANGES = [
  { label: 'Under $500', min: 0, max: 500 },
  { label: '$500 - $1,000', min: 500, max: 1000 },
  { label: '$1,000 - $2,500', min: 1000, max: 2500 },
  { label: '$2,500+', min: 2500, max: 999999 },
]

// Placeholder venue images
const VENUE_IMAGES = [
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=300&h=200&fit=crop',
]

export default function MarketplacePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Tab state
  const initialTab = searchParams.get('tab') === 'artists' ? 'artists' : 'gigs'
  const [activeTab, setActiveTab] = useState<TabType>(initialTab)

  // Search and filters
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [locationFilter, setLocationFilter] = useState('')
  const [priceRange, setPriceRange] = useState<{ min?: number; max?: number }>({})
  const [urgentOnly, setUrgentOnly] = useState(false)
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [showFiltersModal, setShowFiltersModal] = useState(false)
  const [activeQuickFilters, setActiveQuickFilters] = useState<Set<string>>(new Set())

  // Data state
  const [gigs, setGigs] = useState<Gig[]>([])
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  // Detail panel state
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null)
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null)

  // Favorites state (in-memory for MVP)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch data when filters change
  useEffect(() => {
    setCurrentPage(1)
    setHasMore(true)
    fetchData(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeTab,
    debouncedQuery,
    selectedGenres,
    locationFilter,
    priceRange,
    urgentOnly,
    verifiedOnly,
  ])

  // Update URL when tab changes
  useEffect(() => {
    setSearchParams({ tab: activeTab })
  }, [activeTab])

  const fetchData = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true)
        setGigs([])
        setArtists([])
      } else {
        setLoadingMore(true)
      }
      setError(null)

      const page = reset ? 1 : currentPage

      if (activeTab === 'gigs') {
        const params: GigSearchParams = {
          query: debouncedQuery || undefined,
          genres: selectedGenres.length > 0 ? selectedGenres : undefined,
          location: locationFilter || undefined,
          min_payment: priceRange.min,
          max_payment: priceRange.max,
          urgent_only: urgentOnly || undefined,
          page,
          limit: 20,
        }

        const response = await gigsService.search(params)

        if (reset) {
          setGigs(response.data)
        } else {
          setGigs((prev: Gig[]) => [...prev, ...response.data])
        }

        setHasMore(response.has_more)
        if (!reset) {
          setCurrentPage((prev: number) => prev + 1)
        }
      } else {
        const params: ArtistSearchParams = {
          query: debouncedQuery || undefined,
          genres: selectedGenres.length > 0 ? selectedGenres : undefined,
          location: locationFilter || undefined,
          min_price: priceRange.min,
          max_price: priceRange.max,
          verified_only: verifiedOnly || undefined,
          page,
          limit: 20,
        }

        const response = await artistsService.search(params)

        if (reset) {
          setArtists(response.data)
        } else {
          setArtists((prev: Artist[]) => [...prev, ...response.data])
        }

        setHasMore(response.has_more)
        if (!reset) {
          setCurrentPage((prev: number) => prev + 1)
        }
      }
    } catch (err) {
      setError(err as Error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current || loadingMore || !hasMore) return

    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current

    if (scrollTop + clientHeight >= scrollHeight * 0.8) {
      fetchData(false)
    }
  }, [loadingMore, hasMore, currentPage])

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  // Handle gig detail view
  const handleGigClick = async (gig: Gig) => {
    setSelectedGig(gig)
    setSelectedArtist(null)
  }

  // Handle artist detail view
  const handleArtistClick = async (artist: Artist) => {
    setSelectedArtist(artist)
    setSelectedGig(null)
  }

  // Handle gig application - coming soon for MVP
  const handleApplyToGig = async (_gigId: string) => {
    toast('Gig applications coming soon!', {
      description: 'Browse gigs to see what opportunities are available.',
    })
  }

  // Handle favorite toggle
  const handleToggleFavorite = (id: string) => {
    setFavorites((prev: Set<string>) => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(id)) {
        newFavorites.delete(id)
        toast.success('Removed from favorites')
      } else {
        newFavorites.add(id)
        toast.success('Added to favorites')
      }
      return newFavorites
    })
  }

  // Handle quick filter toggle
  const handleQuickFilterToggle = (filterId: string) => {
    setActiveQuickFilters((prev) => {
      const newFilters = new Set(prev)
      if (newFilters.has(filterId)) {
        newFilters.delete(filterId)
      } else {
        newFilters.add(filterId)
      }
      return newFilters
    })

    // Apply filter logic based on type
    const filter = QUICK_FILTERS.find((f) => f.id === filterId)
    if (filter) {
      if (filter.type === 'genre') {
        const genre = filter.label
        setSelectedGenres((prev) =>
          prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
        )
      } else if (filter.id === 'price500') {
        setPriceRange((prev) => (prev.min === 500 ? {} : { min: 500 }))
      }
    }
  }

  // Clear all filters
  const handleClearAllFilters = () => {
    setSelectedGenres([])
    setLocationFilter('')
    setPriceRange({})
    setUrgentOnly(false)
    setVerifiedOnly(false)
    setSearchQuery('')
    setActiveQuickFilters(new Set())
  }

  // Format currency
  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return 'TBD'
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date)
  }

  // Format time
  const formatTime = (timeString?: string) => {
    if (!timeString) return '7:00 PM'
    return timeString
  }

  if (!user) return null

  // Render gigs list
  const renderGigsList = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="flex">
                <Skeleton className="h-40 w-40 flex-shrink-0" />
                <div className="flex-1 p-4">
                  <Skeleton className="mb-2 h-5 w-3/4" />
                  <Skeleton className="mb-4 h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )
    }

    if (error) {
      return <ErrorState error={error} retry={() => fetchData(true)} />
    }

    if (gigs.length === 0) {
      return (
        <div className="py-12 text-center">
          <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
          <h3 className="mb-2 text-lg font-semibold">No gigs found</h3>
          <p className="mb-4 text-muted-foreground">Try adjusting your filters or search query</p>
          <Button onClick={handleClearAllFilters}>Clear Filters</Button>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {gigs.map((gig, index) => (
          <Card
            key={gig.id}
            className={`cursor-pointer overflow-hidden border-border/50 transition-all hover:border-purple-300 hover:shadow-md dark:hover:border-purple-700 ${
              selectedGig?.id === gig.id ? 'border-purple-500 ring-1 ring-purple-500' : ''
            }`}
            onClick={() => handleGigClick(gig)}
          >
            <div className="flex">
              {/* Venue Image */}
              <div className="relative h-44 w-44 flex-shrink-0">
                <img
                  src={VENUE_IMAGES[index % VENUE_IMAGES.length]}
                  alt={gig.venue_name}
                  className="h-full w-full object-cover"
                />
                {gig.urgency_flag && (
                  <Badge className="absolute right-2 top-2 bg-red-500 text-white">Urgent</Badge>
                )}
              </div>

              {/* Content */}
              <CardContent className="flex flex-1 flex-col p-4">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{gig.venue_name}</h3>
                    <p className="text-sm text-muted-foreground">{gig.title}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {formatCurrency(gig.payment_amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">per gig</p>
                  </div>
                </div>

                {/* Details Row */}
                <div className="mb-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatDate(gig.date)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{formatTime(gig.time)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    <span>{gig.capacity || 100} cap</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{gig.location}</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Rating */}
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">4.8</span>
                      <span className="text-xs text-muted-foreground">(156)</span>
                    </div>
                    {/* Genre Tags */}
                    <div className="flex gap-1">
                      {gig.genre_tags?.slice(0, 2).map((genre) => (
                        <Badge
                          key={genre}
                          variant="secondary"
                          className="bg-purple-100 text-xs text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                        >
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {/* Action Buttons */}
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggleFavorite(gig.id)
                      }}
                    >
                      <Bookmark
                        className={`h-4 w-4 ${
                          favorites.has(gig.id)
                            ? 'fill-purple-500 text-purple-500'
                            : 'text-muted-foreground'
                        }`}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Share2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        ))}
        {loadingMore && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
    )
  }

  // Render artists list
  const renderArtistsList = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="flex">
                <Skeleton className="h-40 w-40 flex-shrink-0" />
                <div className="flex-1 p-4">
                  <Skeleton className="mb-2 h-5 w-3/4" />
                  <Skeleton className="mb-4 h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )
    }

    if (error) {
      return <ErrorState error={error} retry={() => fetchData(true)} />
    }

    if (artists.length === 0) {
      return (
        <div className="py-12 text-center">
          <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
          <h3 className="mb-2 text-lg font-semibold">No artists found</h3>
          <p className="mb-4 text-muted-foreground">Try adjusting your filters or search query</p>
          <Button onClick={handleClearAllFilters}>Clear Filters</Button>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {artists.map((artist) => (
          <Card
            key={artist.id}
            className={`cursor-pointer overflow-hidden border-border/50 transition-all hover:border-purple-300 hover:shadow-md dark:hover:border-purple-700 ${
              selectedArtist?.id === artist.id ? 'border-purple-500 ring-1 ring-purple-500' : ''
            }`}
            onClick={() => handleArtistClick(artist)}
          >
            <CardContent className="flex items-center gap-4 p-4">
              {/* Avatar */}
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-xl font-bold text-white">
                {artist.artist_name.charAt(0).toUpperCase()}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{artist.artist_name}</h3>
                  {artist.verified && <CheckCircle2 className="h-4 w-4 text-blue-500" />}
                </div>
                <p className="text-sm text-muted-foreground">{artist.location}</p>
                <div className="mt-2 flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{artist.rating_avg?.toFixed(1) || '5.0'}</span>
                    <span className="text-muted-foreground">({artist.review_count || 0})</span>
                  </div>
                  <span className="text-muted-foreground">{artist.gigs_completed || 0} gigs</span>
                </div>
              </div>

              {/* Price & Actions */}
              <div className="flex flex-col items-end gap-2">
                {artist.price_range_min && artist.price_range_max && (
                  <p className="font-semibold text-purple-600 dark:text-purple-400">
                    {formatCurrency(artist.price_range_min)} -{' '}
                    {formatCurrency(artist.price_range_max)}
                  </p>
                )}
                <div className="flex gap-1">
                  {artist.genres?.slice(0, 2).map((genre) => (
                    <Badge
                      key={genre}
                      variant="secondary"
                      className="bg-purple-100 text-xs text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                    >
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {loadingMore && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
    )
  }

  return (
    <AppLayout>
      <MetaTags
        title="Marketplace"
        description="Discover gigs and connect with artists on Umbrella"
        url="/marketplace"
      />

      <div className="flex h-[calc(100vh-4rem)] flex-col">
        {/* Header */}
        <div className="border-b border-border/50 bg-background px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Marketplace</h1>
          </div>
        </div>

        {/* Tabs & Search */}
        <div className="border-b border-border/50 bg-background px-6 py-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant={activeTab === 'gigs' ? 'default' : 'outline'}
                className={activeTab === 'gigs' ? 'bg-purple-500 hover:bg-purple-600' : ''}
                onClick={() => setActiveTab('gigs')}
              >
                Find Gigs
              </Button>
              <Button
                variant={activeTab === 'artists' ? 'default' : 'outline'}
                className={activeTab === 'artists' ? 'bg-purple-500 hover:bg-purple-600' : ''}
                onClick={() => setActiveTab('artists')}
              >
                Discover Artists
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-4 flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search venues, locations, or gig types..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 border-border/50 bg-muted/30 pl-10 focus:border-purple-500 focus:ring-purple-500/20"
              />
            </div>
            <Dialog open={showFiltersModal} onOpenChange={setShowFiltersModal}>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-11 gap-2 border-border/50">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Advanced Filters</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  {/* Genre Filter */}
                  <div>
                    <h3 className="mb-3 font-semibold">Genre</h3>
                    <div className="flex flex-wrap gap-2">
                      {GENRES.map((genre: string) => (
                        <Button
                          key={genre}
                          variant={selectedGenres.includes(genre) ? 'default' : 'outline'}
                          size="sm"
                          className={
                            selectedGenres.includes(genre)
                              ? 'bg-purple-500 hover:bg-purple-600'
                              : ''
                          }
                          onClick={() => {
                            setSelectedGenres((prev: string[]) =>
                              prev.includes(genre)
                                ? prev.filter((g: string) => g !== genre)
                                : [...prev, genre]
                            )
                          }}
                        >
                          {genre}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Location Filter */}
                  <div>
                    <h3 className="mb-3 font-semibold">Location</h3>
                    <Input
                      placeholder="City or State"
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                    />
                  </div>

                  <Separator />

                  {/* Price Range Filter */}
                  <div>
                    <h3 className="mb-3 font-semibold">
                      {activeTab === 'gigs' ? 'Payment Range' : 'Price Range'}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {PRICE_RANGES.map((range) => {
                        const isSelected =
                          priceRange.min === range.min && priceRange.max === range.max
                        return (
                          <Button
                            key={range.label}
                            variant={isSelected ? 'default' : 'outline'}
                            size="sm"
                            className={isSelected ? 'bg-purple-500 hover:bg-purple-600' : ''}
                            onClick={() => {
                              if (isSelected) {
                                setPriceRange({})
                              } else {
                                setPriceRange({ min: range.min, max: range.max })
                              }
                            }}
                          >
                            {range.label}
                          </Button>
                        )
                      })}
                    </div>
                  </div>

                  <Separator />

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={handleClearAllFilters}>
                      Clear All
                    </Button>
                    <Button
                      className="flex-1 bg-purple-500 hover:bg-purple-600"
                      onClick={() => setShowFiltersModal(false)}
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Quick Filter Chips */}
          <div className="flex flex-wrap gap-2">
            {QUICK_FILTERS.map((filter) => (
              <Badge
                key={filter.id}
                variant={activeQuickFilters.has(filter.id) ? 'default' : 'secondary'}
                className={`cursor-pointer px-3 py-1.5 text-sm transition-colors ${
                  activeQuickFilters.has(filter.id)
                    ? 'bg-purple-500 text-white hover:bg-purple-600'
                    : 'bg-muted/50 text-foreground hover:bg-muted'
                }`}
                onClick={() => handleQuickFilterToggle(filter.id)}
              >
                {filter.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Column - Listings */}
          <div className="flex-1 overflow-hidden border-r border-border/50">
            <ScrollArea ref={scrollContainerRef} className="h-full">
              <div className="p-4">
                {activeTab === 'gigs' ? renderGigsList() : renderArtistsList()}
              </div>
            </ScrollArea>
          </div>

          {/* Right Column - Detail Panel */}
          <div className="hidden w-96 flex-shrink-0 overflow-hidden lg:block">
            <ScrollArea className="h-full">
              {selectedGig ? (
                <div className="p-6">
                  {/* Gig Image */}
                  <div className="relative mb-6 h-48 overflow-hidden rounded-lg">
                    <img
                      src={VENUE_IMAGES[gigs.indexOf(selectedGig) % VENUE_IMAGES.length]}
                      alt={selectedGig.venue_name}
                      className="h-full w-full object-cover"
                    />
                    {selectedGig.urgency_flag && (
                      <Badge className="absolute right-3 top-3 bg-red-500 text-white">Urgent</Badge>
                    )}
                  </div>

                  {/* Gig Details */}
                  <h2 className="mb-1 text-xl font-bold text-foreground">
                    {selectedGig.venue_name}
                  </h2>
                  <p className="mb-4 text-muted-foreground">{selectedGig.title}</p>

                  <div className="mb-6 text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {formatCurrency(selectedGig.payment_amount)}
                    <span className="ml-2 text-sm font-normal text-muted-foreground">per gig</span>
                  </div>

                  <div className="mb-6 space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(selectedGig.date)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{formatTime(selectedGig.time)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedGig.capacity || 100} capacity</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedGig.location}</span>
                    </div>
                  </div>

                  {selectedGig.description && (
                    <div className="mb-6">
                      <h3 className="mb-2 font-semibold">Description</h3>
                      <p className="text-sm text-muted-foreground">{selectedGig.description}</p>
                    </div>
                  )}

                  {selectedGig.genre_tags && selectedGig.genre_tags.length > 0 && (
                    <div className="mb-6">
                      <h3 className="mb-2 font-semibold">Genres</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedGig.genre_tags.map((genre) => (
                          <Badge
                            key={genre}
                            variant="secondary"
                            className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                          >
                            {genre}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-purple-500 hover:bg-purple-600"
                      onClick={() => handleApplyToGig(selectedGig.id)}
                    >
                      Apply Now
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleToggleFavorite(selectedGig.id)}
                    >
                      <Bookmark
                        className={`h-4 w-4 ${
                          favorites.has(selectedGig.id)
                            ? 'fill-purple-500 text-purple-500'
                            : 'text-muted-foreground'
                        }`}
                      />
                    </Button>
                  </div>
                </div>
              ) : selectedArtist ? (
                <div className="p-6">
                  {/* Artist Avatar */}
                  <div className="mb-6 flex items-center gap-4">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-2xl font-bold text-white">
                      {selectedArtist.artist_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-foreground">
                          {selectedArtist.artist_name}
                        </h2>
                        {selectedArtist.verified && (
                          <CheckCircle2 className="h-5 w-5 text-blue-500" />
                        )}
                      </div>
                      <p className="text-muted-foreground">{selectedArtist.location}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="mb-6 grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold">
                        {selectedArtist.rating_avg?.toFixed(1) || '5.0'}
                      </p>
                      <p className="text-xs text-muted-foreground">Rating</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{selectedArtist.gigs_completed || 0}</p>
                      <p className="text-xs text-muted-foreground">Gigs</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{selectedArtist.follower_count || 0}</p>
                      <p className="text-xs text-muted-foreground">Followers</p>
                    </div>
                  </div>

                  {selectedArtist.bio && (
                    <div className="mb-6">
                      <h3 className="mb-2 font-semibold">About</h3>
                      <p className="text-sm text-muted-foreground">{selectedArtist.bio}</p>
                    </div>
                  )}

                  {selectedArtist.genres && selectedArtist.genres.length > 0 && (
                    <div className="mb-6">
                      <h3 className="mb-2 font-semibold">Genres</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedArtist.genres.map((genre) => (
                          <Badge
                            key={genre}
                            variant="secondary"
                            className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                          >
                            {genre}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedArtist.price_range_min && selectedArtist.price_range_max && (
                    <div className="mb-6">
                      <h3 className="mb-2 font-semibold">Price Range</h3>
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {formatCurrency(selectedArtist.price_range_min)} -{' '}
                        {formatCurrency(selectedArtist.price_range_max)}
                      </p>
                    </div>
                  )}

                  <Button
                    className="w-full bg-purple-500 hover:bg-purple-600"
                    onClick={() => navigate(`/artist/${selectedArtist.id}`)}
                  >
                    View Full Profile
                  </Button>
                </div>
              ) : (
                // Empty State
                <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">
                    {activeTab === 'gigs' ? 'Select a gig' : 'Select an artist'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {activeTab === 'gigs'
                      ? 'Click on a listing to view details and apply'
                      : 'Click on an artist to view their profile'}
                  </p>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
