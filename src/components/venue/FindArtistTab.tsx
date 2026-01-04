/**
 * FindArtistTab Component
 * Artist discovery with search, filters, and match cards
 */

import { useState } from 'react'
import { Search, Sparkles } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArtistMatchCard } from './ArtistMatchCard'
import { mockArtistMatches } from '@/mocks/venue-data'

export function FindArtistTab() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('all')
  const [sortBy, setSortBy] = useState('best-match')

  const genres = [
    { value: 'all', label: 'All Genres' },
    { value: 'electronic', label: 'Electronic' },
    { value: 'jazz', label: 'Jazz' },
    { value: 'indie-rock', label: 'Indie Rock' },
    { value: 'soul-rnb', label: 'Soul / R&B' },
    { value: 'alternative', label: 'Alternative' },
    { value: 'hip-hop', label: 'Hip-Hop' },
  ]

  const sortOptions = [
    { value: 'best-match', label: 'Best Match' },
    { value: 'distance', label: 'Distance' },
    { value: 'projected-draw', label: 'Projected Draw' },
  ]

  // Filter artists based on search and genre
  const filteredArtists = mockArtistMatches.filter((artist) => {
    const matchesSearch =
      searchQuery === '' ||
      artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artist.genre.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesGenre =
      selectedGenre === 'all' ||
      artist.genre.toLowerCase().replace(/[^a-z]/g, '') ===
        selectedGenre.toLowerCase().replace(/-/g, '')

    return matchesSearch && matchesGenre
  })

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="mb-6 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6" />
          <div>
            <h2 className="text-2xl font-bold">Discover Artists</h2>
            <p className="text-purple-100">
              Find your next favorite act and build lasting collaborations
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 rounded-xl border bg-background p-6">
        <div className="mb-4 flex items-center gap-2">
          <Search className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Browse Artists</h3>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          {/* Search Input */}
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search by name, genre, or vibe..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Genre Filter */}
          <Select value={selectedGenre} onValueChange={setSelectedGenre}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="All Genres" />
            </SelectTrigger>
            <SelectContent>
              {genres.map((genre) => (
                <SelectItem key={genre.value} value={genre.value}>
                  {genre.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort By */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Best Match" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Matched Label */}
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-purple-500" />
          <span>Matched to your venue's vibe and audience preferences</span>
        </div>
      </div>

      {/* Artist Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredArtists.map((artist) => (
          <ArtistMatchCard key={artist.id} artist={artist} />
        ))}
      </div>

      {/* Empty State */}
      {filteredArtists.length === 0 && (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
          <p className="text-lg font-medium text-muted-foreground">No artists found</p>
          <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  )
}
