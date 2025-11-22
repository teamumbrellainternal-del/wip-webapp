import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
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
  Heart,
  MapPin,
  Calendar,
  DollarSign,
  Star,
  CheckCircle2,
  X,
  Loader2,
  Users,
} from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import ErrorState from '@/components/common/ErrorState'
import { gigsService, artistsService } from '@/services/api'
import type { Gig, Artist, GigSearchParams, ArtistSearchParams } from '@/types'
import { toast } from 'sonner'
import { MetaTags } from '@/components/MetaTags'

type TabType = 'gigs' | 'artists'

interface FilterChip {
  id: string
  label: string
  value: string
}

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

const PRICE_RANGES = [
  { label: 'Under $500', min: 0, max: 500 },
  { label: '$500 - $1,000', min: 500, max: 1000 },
  { label: '$1,000 - $2,500', min: 1000, max: 2500 },
  { label: '$2,500+', min: 2500, max: 999999 },
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

  // Data state
  const [gigs, setGigs] = useState<Gig[]>([])
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  // Detail sidebar state
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null)
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null)

  // Favorites state (in-memory for MVP)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  // Apply to gig loading state
  const [applyingGigId, setApplyingGigId] = useState<string | null>(null)

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

    // Load more when scrolled to 80% of the content
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

  // Handle gig application
  const handleApplyToGig = async (gigId: string) => {
    try {
      setApplyingGigId(gigId)
      await gigsService.apply(gigId)
      toast.success('Application submitted successfully!')
    } catch {
      toast.error('Failed to apply to gig')
    } finally {
      setApplyingGigId(null)
    }
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

  // Handle filter chip removal
  const handleRemoveFilter = (type: string, value?: string) => {
    switch (type) {
      case 'genre':
        if (value) {
          setSelectedGenres((prev: string[]) => prev.filter((g: string) => g !== value))
        }
        break
      case 'location':
        setLocationFilter('')
        break
      case 'price':
        setPriceRange({})
        break
      case 'urgent':
        setUrgentOnly(false)
        break
      case 'verified':
        setVerifiedOnly(false)
        break
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
  }

  // Format currency
  const formatCurrency = (amount: number) => {
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

  if (!user) return null

  // Active filter chips
  const activeFilters: FilterChip[] = []
  selectedGenres.forEach((genre) => {
    activeFilters.push({ id: `genre-${genre}`, label: genre, value: genre })
  })
  if (locationFilter) {
    activeFilters.push({ id: 'location', label: `📍 ${locationFilter}`, value: locationFilter })
  }
  if (priceRange.min || priceRange.max) {
    const label =
      priceRange.min && priceRange.max
        ? `${formatCurrency(priceRange.min)} - ${formatCurrency(priceRange.max)}`
        : priceRange.min
          ? `${formatCurrency(priceRange.min)}+`
          : `Up to ${formatCurrency(priceRange.max!)}`
    activeFilters.push({ id: 'price', label: `💰 ${label}`, value: 'price' })
  }
  if (urgentOnly) {
    activeFilters.push({ id: 'urgent', label: '🔥 Urgent Only', value: 'urgent' })
  }
  if (verifiedOnly) {
    activeFilters.push({ id: 'verified', label: '✓ Verified Only', value: 'verified' })
  }

  return (
    <AppLayout>
      <MetaTags
        title="Find Gigs & Discover Artists"
        description="Connect independent artists with gigs, tools, and opportunities. Browse available gigs or discover talented artists for your venue."
        keywords={[
          'music gigs',
          'artist marketplace',
          'live music',
          'independent artists',
          'venue booking',
        ]}
        url="/marketplace"
      />
      <div className="container mx-auto flex h-screen flex-col px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-bold tracking-tight">Marketplace</h1>
          <p className="text-muted-foreground">Discover opportunities and connect with artists</p>
        </div>

        {/* Search Bar */}
        <div className="mb-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
            <Input
              placeholder={activeTab === 'gigs' ? 'Search gigs...' : 'Search artists...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Dialog open={showFiltersModal} onOpenChange={setShowFiltersModal}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filters
                {activeFilters.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFilters.length}
                  </Badge>
                )}
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

                {activeTab === 'gigs' && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="mb-3 font-semibold">Urgency</h3>
                      <Button
                        variant={urgentOnly ? 'default' : 'outline'}
                        onClick={() => setUrgentOnly(!urgentOnly)}
                      >
                        Urgent Gigs Only
                      </Button>
                    </div>
                  </>
                )}

                {activeTab === 'artists' && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="mb-3 font-semibold">Verification</h3>
                      <Button
                        variant={verifiedOnly ? 'default' : 'outline'}
                        onClick={() => setVerifiedOnly(!verifiedOnly)}
                      >
                        Verified Artists Only
                      </Button>
                    </div>
                  </>
                )}

                <Separator />

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={handleClearAllFilters}>
                    Clear All
                  </Button>
                  <Button className="flex-1" onClick={() => setShowFiltersModal(false)}>
                    Apply Filters
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Active Filter Chips */}
        {activeFilters.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {activeFilters.map((filter) => (
              <Badge key={filter.id} variant="secondary" className="gap-1">
                {filter.label}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => {
                    if (filter.id.startsWith('genre-')) {
                      handleRemoveFilter('genre', filter.value)
                    } else if (filter.id === 'location') {
                      handleRemoveFilter('location')
                    } else if (filter.id === 'price') {
                      handleRemoveFilter('price')
                    } else if (filter.id === 'urgent') {
                      handleRemoveFilter('urgent')
                    } else if (filter.id === 'verified') {
                      handleRemoveFilter('verified')
                    }
                  }}
                />
              </Badge>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAllFilters}
              className="h-6 text-xs"
            >
              Clear all
            </Button>
          </div>
        )}

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as TabType)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <TabsList className="mb-4">
            <TabsTrigger value="gigs" className="flex-1">
              <Calendar className="mr-2 h-4 w-4" />
              Find Gigs
            </TabsTrigger>
            <TabsTrigger value="artists" className="flex-1">
              <Users className="mr-2 h-4 w-4" />
              Discover Artists
            </TabsTrigger>
          </TabsList>

          <div className="min-h-0 flex-1 overflow-hidden">
            {/* Gigs Tab */}
            <TabsContent value="gigs" className="m-0 h-full">
              {loading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="mb-2 h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-20 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : error ? (
                <ErrorState error={error} retry={() => fetchData(true)} />
              ) : (
                <ScrollArea ref={scrollContainerRef} className="h-full">
                  {gigs.length === 0 ? (
                    <div className="py-12 text-center">
                      <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
                      <h3 className="mb-2 text-lg font-semibold">No gigs found</h3>
                      <p className="mb-4 text-muted-foreground">
                        Try adjusting your filters or search query
                      </p>
                      <Button onClick={handleClearAllFilters}>Clear Filters</Button>
                    </div>
                  ) : (
                    <>
                      <div className="grid gap-4 pb-4 md:grid-cols-2 lg:grid-cols-3">
                        {gigs.map((gig) => (
                          <Card
                            key={gig.id}
                            className="relative cursor-pointer transition-shadow hover:shadow-lg"
                            onClick={() => handleGigClick(gig)}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute right-2 top-2 z-10"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleToggleFavorite(gig.id)
                              }}
                            >
                              <Heart
                                className={`h-4 w-4 ${
                                  favorites.has(gig.id)
                                    ? 'fill-red-500 text-red-500'
                                    : 'text-muted-foreground'
                                }`}
                              />
                            </Button>
                            <CardHeader>
                              <div className="flex items-start justify-between gap-2 pr-8">
                                <div className="flex-1">
                                  <CardTitle className="line-clamp-1 text-base">
                                    {gig.title}
                                  </CardTitle>
                                  <CardDescription className="line-clamp-1">
                                    {gig.venue_name}
                                  </CardDescription>
                                </div>
                              </div>
                              {gig.urgency_flag && (
                                <Badge variant="destructive" className="w-fit">
                                  Urgent
                                </Badge>
                              )}
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  <span className="line-clamp-1">{gig.location}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span>{formatDate(gig.date)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-semibold">
                                    {formatCurrency(gig.payment_amount)}
                                  </span>
                                </div>
                              </div>
                              {gig.genre_tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {gig.genre_tags.slice(0, 3).map((genre) => (
                                    <Badge key={genre} variant="secondary" className="text-xs">
                                      {genre}
                                    </Badge>
                                  ))}
                                  {gig.genre_tags.length > 3 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{gig.genre_tags.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              )}
                              <Button
                                className="w-full"
                                size="sm"
                                disabled={applyingGigId === gig.id}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleApplyToGig(gig.id)
                                }}
                              >
                                {applyingGigId === gig.id && (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {applyingGigId === gig.id ? 'Applying...' : 'Apply Now'}
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      {loadingMore && (
                        <div className="flex justify-center py-4">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      )}
                      {!hasMore && gigs.length > 0 && (
                        <div className="py-4 text-center text-sm text-muted-foreground">
                          No more results
                        </div>
                      )}
                    </>
                  )}
                </ScrollArea>
              )}
            </TabsContent>

            {/* Artists Tab */}
            <TabsContent value="artists" className="m-0 h-full">
              {loading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="mb-2 h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-20 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : error ? (
                <ErrorState error={error} retry={() => fetchData(true)} />
              ) : (
                <ScrollArea ref={scrollContainerRef} className="h-full">
                  {artists.length === 0 ? (
                    <div className="py-12 text-center">
                      <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
                      <h3 className="mb-2 text-lg font-semibold">No artists found</h3>
                      <p className="mb-4 text-muted-foreground">
                        Try adjusting your filters or search query
                      </p>
                      <Button onClick={handleClearAllFilters}>Clear Filters</Button>
                    </div>
                  ) : (
                    <>
                      <div className="grid gap-4 pb-4 md:grid-cols-2 lg:grid-cols-3">
                        {artists.map((artist) => (
                          <Card
                            key={artist.id}
                            className="relative cursor-pointer transition-shadow hover:shadow-lg"
                            onClick={() => handleArtistClick(artist)}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute right-2 top-2 z-10"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleToggleFavorite(artist.id)
                              }}
                            >
                              <Heart
                                className={`h-4 w-4 ${
                                  favorites.has(artist.id)
                                    ? 'fill-red-500 text-red-500'
                                    : 'text-muted-foreground'
                                }`}
                              />
                            </Button>
                            <CardHeader>
                              <div className="flex items-start gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 font-semibold text-white">
                                  {artist.artist_name.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1 pr-8">
                                  <CardTitle className="line-clamp-1 flex items-center gap-1 text-base">
                                    {artist.artist_name}
                                    {artist.verified && (
                                      <CheckCircle2 className="h-4 w-4 text-blue-500" />
                                    )}
                                  </CardTitle>
                                  <CardDescription className="line-clamp-1">
                                    {artist.location}
                                  </CardDescription>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              {artist.bio && (
                                <p className="line-clamp-2 text-sm text-muted-foreground">
                                  {artist.bio}
                                </p>
                              )}
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  <span className="font-semibold">
                                    {artist.rating_avg.toFixed(1)}
                                  </span>
                                  <span className="text-muted-foreground">
                                    ({artist.review_count})
                                  </span>
                                </div>
                                <div className="text-muted-foreground">
                                  {artist.gigs_completed} gigs
                                </div>
                              </div>
                              {artist.genres.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {artist.genres.slice(0, 3).map((genre) => (
                                    <Badge key={genre} variant="secondary" className="text-xs">
                                      {genre}
                                    </Badge>
                                  ))}
                                  {artist.genres.length > 3 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{artist.genres.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              )}
                              {artist.price_range_min && artist.price_range_max && (
                                <div className="flex items-center gap-2 text-sm">
                                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                                  <span>
                                    {formatCurrency(artist.price_range_min)} -{' '}
                                    {formatCurrency(artist.price_range_max)}
                                  </span>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      {loadingMore && (
                        <div className="flex justify-center py-4">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      )}
                      {!hasMore && artists.length > 0 && (
                        <div className="py-4 text-center text-sm text-muted-foreground">
                          No more results
                        </div>
                      )}
                    </>
                  )}
                </ScrollArea>
              )}
            </TabsContent>
          </div>
        </Tabs>

        {/* Detail Sidebar - Gig */}
        <Sheet open={!!selectedGig} onOpenChange={(open) => !open && setSelectedGig(null)}>
          <SheetContent className="overflow-y-auto sm:max-w-xl">
            {selectedGig && (
              <>
                <SheetHeader>
                  <SheetTitle className="text-2xl">{selectedGig.title}</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  <div>
                    <h3 className="mb-2 text-lg font-semibold">{selectedGig.venue_name}</h3>
                    {selectedGig.urgency_flag && <Badge variant="destructive">Urgent</Badge>}
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Location</div>
                        <div className="text-muted-foreground">{selectedGig.location}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Date & Time</div>
                        <div className="text-muted-foreground">
                          {formatDate(selectedGig.date)} at {selectedGig.time}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <DollarSign className="mt-0.5 h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Payment</div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(selectedGig.payment_amount)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="mt-0.5 h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Capacity</div>
                        <div className="text-muted-foreground">{selectedGig.capacity} people</div>
                      </div>
                    </div>
                  </div>

                  {selectedGig.description && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="mb-2 font-semibold">Description</h3>
                        <p className="text-muted-foreground">{selectedGig.description}</p>
                      </div>
                    </>
                  )}

                  {selectedGig.genre_tags.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="mb-2 font-semibold">Genres</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedGig.genre_tags.map((genre) => (
                            <Badge key={genre} variant="secondary">
                              {genre}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  <Separator />

                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      disabled={applyingGigId === selectedGig.id}
                      onClick={() => handleApplyToGig(selectedGig.id)}
                    >
                      {applyingGigId === selectedGig.id && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {applyingGigId === selectedGig.id ? 'Applying...' : 'Apply to Gig'}
                    </Button>
                    <Button variant="outline" onClick={() => handleToggleFavorite(selectedGig.id)}>
                      <Heart
                        className={`h-4 w-4 ${
                          favorites.has(selectedGig.id) ? 'fill-red-500 text-red-500' : ''
                        }`}
                      />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>

        {/* Detail Sidebar - Artist */}
        <Sheet open={!!selectedArtist} onOpenChange={(open) => !open && setSelectedArtist(null)}>
          <SheetContent className="overflow-y-auto sm:max-w-xl">
            {selectedArtist && (
              <>
                <SheetHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-2xl font-bold text-white">
                      {selectedArtist.artist_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <SheetTitle className="flex items-center gap-2 text-2xl">
                        {selectedArtist.artist_name}
                        {selectedArtist.verified && (
                          <CheckCircle2 className="h-5 w-5 text-blue-500" />
                        )}
                      </SheetTitle>
                      <div className="text-muted-foreground">{selectedArtist.location}</div>
                    </div>
                  </div>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                  <div className="flex items-center gap-6 text-center">
                    <div>
                      <div className="text-2xl font-bold">
                        {selectedArtist.rating_avg.toFixed(1)}
                      </div>
                      <div className="text-sm text-muted-foreground">Rating</div>
                    </div>
                    <Separator orientation="vertical" className="h-12" />
                    <div>
                      <div className="text-2xl font-bold">{selectedArtist.gigs_completed}</div>
                      <div className="text-sm text-muted-foreground">Gigs</div>
                    </div>
                    <Separator orientation="vertical" className="h-12" />
                    <div>
                      <div className="text-2xl font-bold">{selectedArtist.follower_count}</div>
                      <div className="text-sm text-muted-foreground">Followers</div>
                    </div>
                  </div>

                  {selectedArtist.bio && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="mb-2 font-semibold">About</h3>
                        <p className="text-muted-foreground">{selectedArtist.bio}</p>
                      </div>
                    </>
                  )}

                  {selectedArtist.genres.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="mb-2 font-semibold">Genres</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedArtist.genres.map((genre) => (
                            <Badge key={genre} variant="secondary">
                              {genre}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {selectedArtist.price_range_min && selectedArtist.price_range_max && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="mb-2 font-semibold">Price Range</h3>
                        <div className="text-2xl font-bold">
                          {formatCurrency(selectedArtist.price_range_min)} -{' '}
                          {formatCurrency(selectedArtist.price_range_max)}
                        </div>
                      </div>
                    </>
                  )}

                  <Separator />

                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => navigate(`/artist/${selectedArtist.id}`)}
                    >
                      View Full Profile
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleToggleFavorite(selectedArtist.id)}
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          favorites.has(selectedArtist.id) ? 'fill-red-500 text-red-500' : ''
                        }`}
                      />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </AppLayout>
  )
}
