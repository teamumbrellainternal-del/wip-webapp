/**
 * Track data models
 * Artist music portfolio (unlimited uploads, constrained by 50GB storage)
 */

/**
 * Track record stored in D1
 */
export interface Track {
  id: string
  artist_id: string
  title: string
  duration_seconds: number | null
  file_url: string // R2 URL
  cover_art_url: string | null
  genre: string | null
  release_year: number | null
  spotify_url: string | null
  apple_music_url: string | null
  soundcloud_url: string | null
  display_order: number
  plays: number
  created_at: string
  updated_at: string
}

/**
 * Track creation input
 */
export interface CreateTrackInput {
  artist_id: string
  title: string
  file_url: string
  duration_seconds?: number
  cover_art_url?: string
  genre?: string
  release_year?: number
  spotify_url?: string
  apple_music_url?: string
  soundcloud_url?: string
  display_order?: number
}

/**
 * Track update input
 */
export interface UpdateTrackInput {
  title?: string
  cover_art_url?: string
  genre?: string
  release_year?: number
  spotify_url?: string
  apple_music_url?: string
  soundcloud_url?: string
  display_order?: number
}

/**
 * Helper functions
 */

/**
 * Format duration in MM:SS format
 */
export function formatDuration(seconds: number | null): string {
  if (!seconds) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Increment play count
 */
export function incrementPlays(track: Track): Track {
  return {
    ...track,
    plays: track.plays + 1,
  }
}

/**
 * Check if track has external streaming links
 */
export function hasStreamingLinks(track: Track): boolean {
  return !!(track.spotify_url || track.apple_music_url || track.soundcloud_url)
}

/**
 * Get streaming platform name from URL
 */
export function getStreamingPlatform(url: string): string | null {
  if (url.includes('spotify.com')) return 'Spotify'
  if (url.includes('apple.com')) return 'Apple Music'
  if (url.includes('soundcloud.com')) return 'SoundCloud'
  return null
}
