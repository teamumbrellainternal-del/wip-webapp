/**
 * Venue model and TypeScript interfaces
 * Represents venue profiles for the two-sided marketplace
 */

/**
 * Venue status for booking availability
 */
export type VenueStatus = 'open_for_bookings' | 'closed' | 'limited'

/**
 * Venue type classification
 */
export type VenueType = 'club' | 'bar' | 'theater' | 'arena' | 'outdoor' | 'restaurant' | 'other'

/**
 * Stage size options
 */
export type StageSize = 'small' | 'medium' | 'large'

/**
 * Full venue record from database
 */
export interface Venue {
  id: string
  user_id: string
  slug: string | null // SEO-friendly URL slug

  // Identity
  name: string
  tagline: string | null
  venue_type: VenueType | null

  // Location
  address_line1: string | null
  address_line2: string | null
  city: string
  state: string | null
  zip_code: string | null
  country: string

  // Venue Details
  capacity: number | null
  standing_capacity: number | null
  seated_capacity: number | null
  stage_size: StageSize | null
  sound_system: string | null
  has_green_room: number // SQLite boolean (0 or 1)
  has_parking: number // SQLite boolean (0 or 1)

  // Booking
  status: VenueStatus
  booking_lead_days: number
  preferred_genres: string | null // JSON array

  // Media
  avatar_url: string | null
  cover_url: string | null

  // Verification
  verified: number // SQLite boolean (0 or 1)

  // Stats
  events_hosted: number
  total_artists_booked: number

  // Timestamps
  created_at: string
  updated_at: string
}

/**
 * Input for creating a new venue profile
 */
export interface CreateVenueInput {
  // Required fields (Step 1)
  name: string
  city: string

  // Optional fields (Step 1)
  slug?: string // SEO-friendly URL slug (auto-generated from name if not provided)
  tagline?: string
  venue_type?: VenueType
  state?: string

  // Optional fields (Step 2)
  capacity?: number
  standing_capacity?: number
  seated_capacity?: number
  stage_size?: StageSize
  sound_system?: string
  has_green_room?: boolean
  has_parking?: boolean
  booking_lead_days?: number
  preferred_genres?: string[]
}

/**
 * Input for updating a venue profile
 */
export interface UpdateVenueInput {
  name?: string
  tagline?: string
  venue_type?: VenueType
  address_line1?: string
  address_line2?: string
  city?: string
  state?: string
  zip_code?: string
  country?: string
  capacity?: number
  standing_capacity?: number
  seated_capacity?: number
  stage_size?: StageSize
  sound_system?: string
  has_green_room?: boolean
  has_parking?: boolean
  status?: VenueStatus
  booking_lead_days?: number
  preferred_genres?: string[]
  avatar_url?: string
  cover_url?: string
}

/**
 * Public venue profile (limited fields for non-owners)
 */
export interface PublicVenueProfile {
  id: string
  slug: string | null // SEO-friendly URL slug
  name: string
  tagline: string | null
  venue_type: VenueType | null
  city: string
  state: string | null
  capacity: number | null
  stage_size: StageSize | null
  status: VenueStatus
  avatar_url: string | null
  cover_url: string | null
  verified: boolean
  events_hosted: number
  total_artists_booked: number
}

/**
 * Venue profile response for API
 */
export interface VenueProfileResponse {
  id: string
  user_id: string
  slug: string | null // SEO-friendly URL slug
  name: string
  tagline: string | null
  venue_type: VenueType | null
  address_line1: string | null
  address_line2: string | null
  city: string
  state: string | null
  zip_code: string | null
  country: string
  capacity: number | null
  standing_capacity: number | null
  seated_capacity: number | null
  stage_size: StageSize | null
  sound_system: string | null
  has_green_room: boolean
  has_parking: boolean
  status: VenueStatus
  booking_lead_days: number
  preferred_genres: string[]
  avatar_url: string | null
  cover_url: string | null
  verified: boolean
  events_hosted: number
  total_artists_booked: number
  created_at: string
  updated_at: string
}

/**
 * Convert database venue to API response format
 */
export function toVenueProfileResponse(venue: Venue): VenueProfileResponse {
  return {
    id: venue.id,
    user_id: venue.user_id,
    slug: venue.slug,
    name: venue.name,
    tagline: venue.tagline,
    venue_type: venue.venue_type,
    address_line1: venue.address_line1,
    address_line2: venue.address_line2,
    city: venue.city,
    state: venue.state,
    zip_code: venue.zip_code,
    country: venue.country,
    capacity: venue.capacity,
    standing_capacity: venue.standing_capacity,
    seated_capacity: venue.seated_capacity,
    stage_size: venue.stage_size,
    sound_system: venue.sound_system,
    has_green_room: Boolean(venue.has_green_room),
    has_parking: Boolean(venue.has_parking),
    status: venue.status,
    booking_lead_days: venue.booking_lead_days,
    preferred_genres: venue.preferred_genres ? JSON.parse(venue.preferred_genres) : [],
    avatar_url: venue.avatar_url,
    cover_url: venue.cover_url,
    verified: Boolean(venue.verified),
    events_hosted: venue.events_hosted,
    total_artists_booked: venue.total_artists_booked,
    created_at: venue.created_at,
    updated_at: venue.updated_at,
  }
}

/**
 * Convert database venue to public profile format
 */
export function toPublicVenueProfile(venue: Venue): PublicVenueProfile {
  return {
    id: venue.id,
    slug: venue.slug,
    name: venue.name,
    tagline: venue.tagline,
    venue_type: venue.venue_type,
    city: venue.city,
    state: venue.state,
    capacity: venue.capacity,
    stage_size: venue.stage_size,
    status: venue.status,
    avatar_url: venue.avatar_url,
    cover_url: venue.cover_url,
    verified: Boolean(venue.verified),
    events_hosted: venue.events_hosted,
    total_artists_booked: venue.total_artists_booked,
  }
}

