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

import { useState } from 'react'
import { Search, User, Calendar, X } from 'lucide-react'
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

// Mock search results (replace with real API calls later)
const mockResults = {
  artists: [
    { id: '1', name: 'DJ AlexJ', genre: 'Electronic', verified: true },
    { id: '2', name: 'Sarah Blues', genre: 'Blues', verified: false },
  ],
  gigs: [
    { id: '1', title: 'Friday Night Live', venue: 'The Blue Note SF', date: 'Oct 25, 2025', pay: '$800' },
    { id: '2', title: 'Jazz Evening', venue: 'Velvet Room', date: 'Oct 28, 2025', pay: '$600' },
  ],
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = (value: string) => {
    setQuery(value)
    // TODO: Implement actual search logic
    if (value.length > 0) {
      setIsSearching(true)
      // Simulate search delay
      setTimeout(() => setIsSearching(false), 500)
    }
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

          {showEmptyState && (
            <>
              {/* Artists Section */}
              {mockResults.artists.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Artists
                  </h3>
                  <div className="space-y-2">
                    {mockResults.artists.map((artist) => (
                      <button
                        key={artist.id}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-left"
                        onClick={() => {
                          // TODO: Navigate to artist profile
                          console.log('Navigate to artist:', artist.id)
                          onOpenChange(false)
                        }}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {artist.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{artist.name}</p>
                            {artist.verified && (
                              <Badge variant="secondary" className="text-xs">
                                Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{artist.genre}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Gigs Section */}
              {mockResults.gigs.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Gigs
                  </h3>
                  <div className="space-y-2">
                    {mockResults.gigs.map((gig) => (
                      <button
                        key={gig.id}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-left"
                        onClick={() => {
                          // TODO: Navigate to gig details
                          console.log('Navigate to gig:', gig.id)
                          onOpenChange(false)
                        }}
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium">{gig.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {gig.venue} • {gig.date}
                          </p>
                        </div>
                        <Badge variant="outline">{gig.pay}</Badge>
                      </button>
                    ))}
                  </div>
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
