/**
 * Artist data models
 * Complete artist profile with 40+ attributes from onboarding
 */

/**
 * Artist record stored in D1
 */
export interface Artist {
  id: string
  user_id: string

  // Identity (Onboarding Step 1)
  stage_name: string
  legal_name: string | null
  pronouns: string | null
  location_city: string | null
  location_state: string | null
  location_country: string
  location_zip: string | null
  phone_number: string | null

  // Bio & Story (Step 2)
  bio: string | null
  story: string | null
  tagline: string | null

  // Creative Profile (Step 3)
  primary_genre: string | null
  secondary_genres: string | null // JSON array
  influences: string | null // JSON array
  artist_type: string | null // JSON array
  equipment: string | null // JSON array
  daw: string | null // JSON array
  platforms: string | null // JSON array
  subscriptions: string | null // JSON array
  struggles: string | null // JSON array

  // Rates & Availability (Step 4)
  base_rate_flat: number | null
  base_rate_hourly: number | null
  rates_negotiable: boolean
  largest_show_capacity: number | null
  travel_radius_miles: number | null
  available_weekdays: boolean
  available_weekends: boolean
  advance_booking_weeks: number
  available_dates: string | null // JSON array
  time_split_creative: number | null
  time_split_logistics: number | null

  // Quick Questions (Step 5)
  currently_making_music: boolean | null
  confident_online_presence: boolean | null
  struggles_creative_niche: boolean | null
  knows_where_find_gigs: boolean | null
  paid_fairly_performing: boolean | null
  understands_royalties: boolean | null

  // Onboarding Step 2 - Additional fields
  tasks_outsource: string | null
  sound_uniqueness: string | null
  dream_venue: string | null
  biggest_inspiration: string | null
  favorite_create_time: string | null
  platform_pain_point: string | null

  // Social & Portfolio
  website_url: string | null
  instagram_handle: string | null
  tiktok_handle: string | null
  youtube_url: string | null
  spotify_url: string | null
  apple_music_url: string | null
  soundcloud_url: string | null
  facebook_url: string | null
  twitter_url: string | null
  bandcamp_url: string | null

  // Verification & Metadata
  verified: boolean
  avatar_url: string | null
  banner_url: string | null
  avg_rating: number
  total_reviews: number
  total_gigs: number
  total_earnings: number
  profile_views: number
  follower_count: number

  created_at: string
  updated_at: string
}

/**
 * Artist creation input (from onboarding completion)
 */
export interface CreateArtistInput {
  user_id: string
  stage_name: string
  // Add other required fields from onboarding
  [key: string]: any
}

/**
 * Artist update input
 */
export interface UpdateArtistInput {
  stage_name?: string
  bio?: string
  tagline?: string
  base_rate_flat?: number
  base_rate_hourly?: number
  // Allow any artist field to be updated
  [key: string]: any
}

/**
 * Artist public profile (for marketplace display)
 */
export interface ArtistPublicProfile {
  id: string
  stage_name: string
  location_city: string | null
  location_state: string | null
  primary_genre: string | null
  bio: string | null
  tagline: string | null
  avatar_url: string | null
  verified: boolean
  avg_rating: number
  total_reviews: number
  total_gigs: number
  follower_count: number
  base_rate_flat: number | null
  base_rate_hourly: number | null
}

/**
 * Helper functions
 */

/**
 * Calculate profile completion percentage
 */
export function calculateProfileCompletion(artist: Artist): number {
  const requiredFields = [
    'stage_name',
    'location_city',
    'location_state',
    'bio',
    'primary_genre',
    'base_rate_flat',
    'avatar_url',
  ]

  const optionalFields = [
    'tagline',
    'website_url',
    'instagram_handle',
    'spotify_url',
    'secondary_genres',
    'influences',
  ]

  let completedRequired = 0
  let completedOptional = 0

  for (const field of requiredFields) {
    if (artist[field as keyof Artist]) {
      completedRequired++
    }
  }

  for (const field of optionalFields) {
    if (artist[field as keyof Artist]) {
      completedOptional++
    }
  }

  const requiredWeight = 0.7
  const optionalWeight = 0.3

  const requiredScore = (completedRequired / requiredFields.length) * requiredWeight
  const optionalScore = (completedOptional / optionalFields.length) * optionalWeight

  return Math.round((requiredScore + optionalScore) * 100)
}

/**
 * Check if artist profile is complete enough to be public
 */
export function isProfileComplete(artist: Artist): boolean {
  return calculateProfileCompletion(artist) >= 60
}

/**
 * Calculate average rating from reviews
 */
export function calculateAverageRating(artist: Artist): number {
  return artist.avg_rating
}

/**
 * Parse JSON array fields
 */
export function parseArrayField(field: string | null): string[] {
  if (!field) return []
  try {
    return JSON.parse(field)
  } catch {
    return []
  }
}

/**
 * Serialize array to JSON string
 */
export function serializeArrayField(arr: string[]): string {
  return JSON.stringify(arr)
}

/**
 * Get artist display name (stage name or legal name)
 */
export function getDisplayName(artist: Artist): string {
  return artist.stage_name || artist.legal_name || 'Unknown Artist'
}

/**
 * Get artist location string
 */
export function getLocationString(artist: Artist): string {
  if (artist.location_city && artist.location_state) {
    return `${artist.location_city}, ${artist.location_state}`
  }
  if (artist.location_city) {
    return artist.location_city
  }
  if (artist.location_state) {
    return artist.location_state
  }
  return 'Location not specified'
}

/**
 * Check if artist is verified
 */
export function isVerified(artist: Artist): boolean {
  return artist.verified === true
}

/**
 * Sanitize artist for public consumption
 */
export function sanitizeArtistPublic(artist: Artist): ArtistPublicProfile {
  return {
    id: artist.id,
    stage_name: artist.stage_name,
    location_city: artist.location_city,
    location_state: artist.location_state,
    primary_genre: artist.primary_genre,
    bio: artist.bio,
    tagline: artist.tagline,
    avatar_url: artist.avatar_url,
    verified: artist.verified,
    avg_rating: artist.avg_rating,
    total_reviews: artist.total_reviews,
    total_gigs: artist.total_gigs,
    follower_count: artist.follower_count,
    base_rate_flat: artist.base_rate_flat,
    base_rate_hourly: artist.base_rate_hourly,
  }
}
