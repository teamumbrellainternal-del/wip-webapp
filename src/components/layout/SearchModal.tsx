/**
 * SearchModal Component
 * Modal/dialog for global search functionality
 *
 * Features:
 * - D-071: Search scope = Artists + Gigs only (no venues)
 * - Search input with icon
 * - Empty state and results display
 * - For now, just UI structure (actual search can be wired later)
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, User, Calendar, X } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import type { ArtistPublicProfile } from '../../../api/models/artist'
import type { Gig } from '../../../api/models/gig'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface SearchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [artists, setArtists] = useState<ArtistPublicProfile[]>([])
  const [gigs, setGigs] = useState<Gig[]>([])
  const [error, setError] = useState<string | null>(null)

  // Debounced search function
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setArtists([])
      setGigs([])
      return
    }

    setIsSearching(true)
    setError(null)

    try {
      const results = await apiClient.search(searchQuery, 'all', 10)
      setArtists(results.artists || [])
      setGigs(results.gigs || [])
    } catch (err) {
      console.error('Search error:', err)
      setError(err instanceof Error ? err.message : 'Search failed')
      setArtists([])
      setGigs([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  // Debounce search with useEffect
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query)
    }, 300) // 300ms debounce

    return () => clearTimeout(timer)
  }, [query, performSearch])

  const handleSearch = (value: string) => {
    setQuery(value)
  }

  const hasResults = query.length > 0
  const showEmptyState = query.length > 0 && !isSearching

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="sr-only">Search artists or gigs</DialogTitle>
        </DialogHeader>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search artists or gigs..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 pr-10"
            autoFocus
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
              onClick={() => handleSearch('')}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto space-y-6 mt-4">
          {!hasResults && (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">Start typing to search artists or gigs...</p>
              <p className="text-xs mt-2">Search scope: Artists and Gigs only</p>
            </div>
          )}

          {isSearching && (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
              <p className="text-sm text-muted-foreground mt-4">Searching...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm text-destructive">Error: {error}</p>
            </div>
          )}

          {showEmptyState && !error && (
            <>
              {/* Artists Section */}
              {artists.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Artists ({artists.length})
                  </h3>
                  <div className="space-y-2">
                    {artists.map((artist) => (
                      <button
                        key={artist.id}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-left"
                        onClick={() => {
                          navigate(`/artists/${artist.id}`)
                          onOpenChange(false)
                        }}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {artist.stage_name.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{artist.stage_name}</p>
                            {artist.verified && (
                              <Badge variant="secondary" className="text-xs">
                                Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {artist.location_city}, {artist.location_state}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Gigs Section */}
              {gigs.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Gigs ({gigs.length})
                  </h3>
                  <div className="space-y-2">
                    {gigs.map((gig) => (
                      <button
                        key={gig.id}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-left"
                        onClick={() => {
                          navigate(`/gigs/${gig.id}`)
                          onOpenChange(false)
                        }}
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium">{gig.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {gig.venue_name} • {new Date(gig.date).toLocaleDateString()}
                          </p>
                        </div>
                        {gig.payment_amount && (
                          <Badge variant="outline">
                            ${gig.payment_amount}
                            {gig.payment_type === 'hourly' ? '/hr' : ''}
                          </Badge>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {artists.length === 0 && gigs.length === 0 && query.length >= 2 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">No results found for "{query}"</p>
                  <p className="text-xs mt-2">Try different keywords or check your spelling</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Search Tips */}
        {hasResults && (
          <div className="border-t pt-3 text-xs text-muted-foreground">
            <p>Tip: Press Esc to close • D-071: Search scope includes Artists and Gigs only</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
