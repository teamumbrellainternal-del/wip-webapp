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
import type { Artist, Gig } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
  const [artists, setArtists] = useState<Artist[]>([])
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
      <DialogContent className="flex max-h-[80vh] max-w-2xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="sr-only">Search artists or gigs</DialogTitle>
        </DialogHeader>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
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
              className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 transform"
              onClick={() => handleSearch('')}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>

        {/* Search Results */}
        <div className="mt-4 flex-1 space-y-6 overflow-y-auto">
          {!hasResults && (
            <div className="py-12 text-center text-muted-foreground">
              <Search className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p className="text-sm">Start typing to search artists or gigs...</p>
              <p className="mt-2 text-xs">Search scope: Artists and Gigs only</p>
            </div>
          )}

          {isSearching && (
            <div className="py-12 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="mt-4 text-sm text-muted-foreground">Searching...</p>
            </div>
          )}

          {error && (
            <div className="py-12 text-center text-muted-foreground">
              <p className="text-sm text-destructive">Error: {error}</p>
            </div>
          )}

          {showEmptyState && !error && (
            <>
              {/* Artists Section */}
              {artists.length > 0 && (
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <User className="h-4 w-4" />
                    Artists ({artists.length})
                  </h3>
                  <div className="space-y-2">
                    {artists.map((artist) => (
                      <button
                        key={artist.id}
                        className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-accent"
                        onClick={() => {
                          navigate(`/artists/${artist.id}`)
                          onOpenChange(false)
                        }}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {artist.artist_name
                              .split(' ')
                              .map((n: string) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{artist.artist_name}</p>
                            {artist.verified && (
                              <Badge variant="secondary" className="text-xs">
                                Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{artist.location}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Gigs Section */}
              {gigs.length > 0 && (
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <Calendar className="h-4 w-4" />
                    Gigs ({gigs.length})
                  </h3>
                  <div className="space-y-2">
                    {gigs.map((gig) => (
                      <button
                        key={gig.id}
                        className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-accent"
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
                          <Badge variant="outline">${gig.payment_amount}</Badge>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {artists.length === 0 && gigs.length === 0 && query.length >= 2 && (
                <div className="py-12 text-center text-muted-foreground">
                  <Search className="mx-auto mb-4 h-12 w-12 opacity-50" />
                  <p className="text-sm">No results found for "{query}"</p>
                  <p className="mt-2 text-xs">Try different keywords or check your spelling</p>
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
