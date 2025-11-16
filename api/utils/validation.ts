/**
 * Validation utilities for onboarding and profile data
 * Ensures all required fields meet business rules per architecture spec
 */

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean
  errors?: Record<string, string>
}

/**
 * Validate Step 1: Identity & Basics
 * Required fields: stage_name, primary_genre
 * Minimum 3 social links required per D-003
 */
export function validateStep1(data: any): ValidationResult {
  const errors: Record<string, string> = {}

  // Required: stage_name
  if (!data.stage_name || typeof data.stage_name !== 'string' || data.stage_name.trim().length === 0) {
    errors.stage_name = 'Artist/stage name is required'
  } else if (data.stage_name.length > 100) {
    errors.stage_name = 'Artist/stage name must be 100 characters or less'
  }

  // Required: primary_genre
  if (!data.primary_genre || typeof data.primary_genre !== 'string' || data.primary_genre.trim().length === 0) {
    errors.primary_genre = 'Primary genre is required'
  }

  // Optional: location fields
  if (data.location_city && data.location_city.length > 100) {
    errors.location_city = 'City must be 100 characters or less'
  }

  if (data.location_state && data.location_state.length > 50) {
    errors.location_state = 'State must be 50 characters or less'
  }

  // Optional: phone number validation
  if (data.phone_number && !isValidPhoneNumber(data.phone_number)) {
    errors.phone_number = 'Invalid phone number format'
  }

  // Optional: pronouns
  if (data.pronouns && data.pronouns.length > 50) {
    errors.pronouns = 'Pronouns must be 50 characters or less'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
  }
}

/**
 * Validate Artist Onboarding Step 1: Identity & Basics
 * For /v1/onboarding/artists/step1 endpoint
 * Required fields: stage_name, location_city, location_state
 * Optional fields: inspirations, genre_primary (up to 3 genres)
 */
export function validateArtistStep1(data: any): ValidationResult {
  const errors: Record<string, string> = {}

  // Required: stage_name
  if (!data.stage_name || typeof data.stage_name !== 'string' || data.stage_name.trim().length === 0) {
    errors.stage_name = 'Artist/stage name is required'
  } else if (data.stage_name.length > 100) {
    errors.stage_name = 'Artist/stage name must be 100 characters or less'
  }

  // Required: location_city
  if (!data.location_city || typeof data.location_city !== 'string' || data.location_city.trim().length === 0) {
    errors.location_city = 'City is required'
  } else if (data.location_city.length > 100) {
    errors.location_city = 'City must be 100 characters or less'
  }

  // Required: location_state
  if (!data.location_state || typeof data.location_state !== 'string' || data.location_state.trim().length === 0) {
    errors.location_state = 'State is required'
  } else if (data.location_state.length > 50) {
    errors.location_state = 'State must be 50 characters or less'
  }

  // Optional: location_zip
  if (data.location_zip && data.location_zip.length > 10) {
    errors.location_zip = 'ZIP code must be 10 characters or less'
  }

  // Optional: phone_number
  if (data.phone_number && !isValidPhoneNumber(data.phone_number)) {
    errors.phone_number = 'Invalid phone number format'
  }

  // Optional: pronouns
  if (data.pronouns && data.pronouns.length > 50) {
    errors.pronouns = 'Pronouns must be 50 characters or less'
  }

  // Optional: legal_name (full_name from spec)
  if (data.legal_name && data.legal_name.length > 100) {
    errors.legal_name = 'Full name must be 100 characters or less'
  }

  // Optional: inspirations (array of strings)
  if (data.inspirations) {
    if (!Array.isArray(data.inspirations)) {
      errors.inspirations = 'Inspirations must be an array'
    } else if (data.inspirations.length > 20) {
      errors.inspirations = 'Maximum 20 inspirations allowed'
    }
  }

  // Optional: genre_primary (array of up to 3 genres)
  if (data.genre_primary) {
    if (!Array.isArray(data.genre_primary)) {
      errors.genre_primary = 'Genres must be an array'
    } else if (data.genre_primary.length > 3) {
      errors.genre_primary = 'Maximum 3 genres allowed'
    } else if (data.genre_primary.length > 0 && data.genre_primary.some((g: any) => typeof g !== 'string')) {
      errors.genre_primary = 'All genres must be strings'
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
  }
}

/**
 * Validate Step 2: Links & Your Story
 * Minimum 3 social links required per spec
 */
export function validateStep2(data: any): ValidationResult {
  const errors: Record<string, string> = {}

  // Count social links
  const socialLinks = [
    data.website_url,
    data.instagram_handle,
    data.tiktok_handle,
    data.youtube_url,
    data.spotify_url,
    data.apple_music_url,
    data.soundcloud_url,
    data.facebook_url,
    data.twitter_url,
    data.bandcamp_url,
  ].filter(link => link && link.trim().length > 0)

  // Minimum 3 social links required
  if (socialLinks.length < 3) {
    errors.social_links = 'Minimum 3 social media links required'
  }

  // Validate URLs
  if (data.website_url && !isValidUrl(data.website_url)) {
    errors.website_url = 'Invalid website URL'
  }

  if (data.youtube_url && !isValidUrl(data.youtube_url)) {
    errors.youtube_url = 'Invalid YouTube URL'
  }

  if (data.spotify_url && !isValidUrl(data.spotify_url)) {
    errors.spotify_url = 'Invalid Spotify URL'
  }

  if (data.apple_music_url && !isValidUrl(data.apple_music_url)) {
    errors.apple_music_url = 'Invalid Apple Music URL'
  }

  if (data.soundcloud_url && !isValidUrl(data.soundcloud_url)) {
    errors.soundcloud_url = 'Invalid SoundCloud URL'
  }

  if (data.facebook_url && !isValidUrl(data.facebook_url)) {
    errors.facebook_url = 'Invalid Facebook URL'
  }

  if (data.twitter_url && !isValidUrl(data.twitter_url)) {
    errors.twitter_url = 'Invalid Twitter/X URL'
  }

  if (data.bandcamp_url && !isValidUrl(data.bandcamp_url)) {
    errors.bandcamp_url = 'Invalid Bandcamp URL'
  }

  // Validate Instagram handle (no @ symbol, alphanumeric + dots/underscores)
  if (data.instagram_handle && !isValidInstagramHandle(data.instagram_handle)) {
    errors.instagram_handle = 'Invalid Instagram handle format (alphanumeric, dots, underscores only, no @)'
  }

  // Validate TikTok handle
  if (data.tiktok_handle && !isValidTikTokHandle(data.tiktok_handle)) {
    errors.tiktok_handle = 'Invalid TikTok handle format (alphanumeric, dots, underscores only, no @)'
  }

  // Optional: bio (max 500 chars)
  if (data.bio && data.bio.length > 500) {
    errors.bio = 'Bio must be 500 characters or less'
  }

  // Optional: story (max 2000 chars)
  if (data.story && data.story.length > 2000) {
    errors.story = 'Story must be 2000 characters or less'
  }

  // Optional: tagline (max 100 chars)
  if (data.tagline && data.tagline.length > 100) {
    errors.tagline = 'Tagline must be 100 characters or less'
  }

  // Optional qualitative questions (Step 2 per eng-spec Screen 6)
  // Tasks you'd outsource
  if (data.tasks_outsource && data.tasks_outsource.length > 500) {
    errors.tasks_outsource = 'Tasks outsource answer must be 500 characters or less'
  }

  // What makes your sound unique
  if (data.sound_uniqueness && data.sound_uniqueness.length > 500) {
    errors.sound_uniqueness = 'Sound uniqueness answer must be 500 characters or less'
  }

  // Dream performance venue
  if (data.dream_venue && data.dream_venue.length > 200) {
    errors.dream_venue = 'Dream venue must be 200 characters or less'
  }

  // Biggest inspiration
  if (data.biggest_inspiration && data.biggest_inspiration.length > 200) {
    errors.biggest_inspiration = 'Biggest inspiration must be 200 characters or less'
  }

  // Favorite time to create
  if (data.favorite_create_time && data.favorite_create_time.length > 200) {
    errors.favorite_create_time = 'Favorite create time must be 200 characters or less'
  }

  // Platform pain point to solve
  if (data.platform_pain_point && data.platform_pain_point.length > 500) {
    errors.platform_pain_point = 'Platform pain point must be 500 characters or less'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
  }
}

/**
 * Validate Step 3: Creative Profile Tags
 */
export function validateStep3(data: any): ValidationResult {
  const errors: Record<string, string> = {}

  // Validate secondary_genres (JSON array)
  if (data.secondary_genres) {
    if (!Array.isArray(data.secondary_genres)) {
      errors.secondary_genres = 'Secondary genres must be an array'
    } else if (data.secondary_genres.length > 5) {
      errors.secondary_genres = 'Maximum 5 secondary genres allowed'
    }
  }

  // Validate influences (JSON array)
  if (data.influences) {
    if (!Array.isArray(data.influences)) {
      errors.influences = 'Influences must be an array'
    } else if (data.influences.length > 10) {
      errors.influences = 'Maximum 10 influences allowed'
    }
  }

  // Validate artist_type (JSON array)
  if (data.artist_type) {
    if (!Array.isArray(data.artist_type)) {
      errors.artist_type = 'Artist type must be an array'
    } else {
      const validTypes = ['solo', 'band', 'dj', 'producer', 'songwriter', 'vocalist']
      const invalidTypes = data.artist_type.filter((type: string) => !validTypes.includes(type))
      if (invalidTypes.length > 0) {
        errors.artist_type = `Invalid artist types: ${invalidTypes.join(', ')}`
      }
    }
  }

  // Validate equipment (JSON array)
  if (data.equipment) {
    if (!Array.isArray(data.equipment)) {
      errors.equipment = 'Equipment must be an array'
    } else if (data.equipment.length > 20) {
      errors.equipment = 'Maximum 20 equipment items allowed'
    }
  }

  // Validate DAW (JSON array)
  if (data.daw) {
    if (!Array.isArray(data.daw)) {
      errors.daw = 'DAW must be an array'
    }
  }

  // Validate platforms (JSON array)
  if (data.platforms) {
    if (!Array.isArray(data.platforms)) {
      errors.platforms = 'Platforms must be an array'
    }
  }

  // Validate subscriptions (JSON array)
  if (data.subscriptions) {
    if (!Array.isArray(data.subscriptions)) {
      errors.subscriptions = 'Subscriptions must be an array'
    }
  }

  // Validate struggles (JSON array)
  if (data.struggles) {
    if (!Array.isArray(data.struggles)) {
      errors.struggles = 'Struggles must be an array'
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
  }
}

/**
 * Validate Step 4: Your Numbers (rates & availability)
 */
export function validateStep4(data: any): ValidationResult {
  const errors: Record<string, string> = {}

  // At least one rate should be provided
  if (!data.base_rate_flat && !data.base_rate_hourly) {
    errors.rates = 'At least one rate (flat or hourly) must be provided'
  }

  // Validate base_rate_flat
  if (data.base_rate_flat !== undefined && data.base_rate_flat !== null) {
    if (typeof data.base_rate_flat !== 'number' || data.base_rate_flat < 0) {
      errors.base_rate_flat = 'Base flat rate must be a positive number'
    } else if (data.base_rate_flat > 1000000) {
      errors.base_rate_flat = 'Base flat rate seems unreasonably high'
    }
  }

  // Validate base_rate_hourly
  if (data.base_rate_hourly !== undefined && data.base_rate_hourly !== null) {
    if (typeof data.base_rate_hourly !== 'number' || data.base_rate_hourly < 0) {
      errors.base_rate_hourly = 'Base hourly rate must be a positive number'
    } else if (data.base_rate_hourly > 10000) {
      errors.base_rate_hourly = 'Base hourly rate seems unreasonably high'
    }
  }

  // Validate largest_show_capacity
  if (data.largest_show_capacity !== undefined && data.largest_show_capacity !== null) {
    if (typeof data.largest_show_capacity !== 'number' || data.largest_show_capacity < 0) {
      errors.largest_show_capacity = 'Largest show capacity must be a positive number'
    }
  }

  // Validate travel_radius_miles
  if (data.travel_radius_miles !== undefined && data.travel_radius_miles !== null) {
    if (typeof data.travel_radius_miles !== 'number' || data.travel_radius_miles < 0) {
      errors.travel_radius_miles = 'Travel radius must be a positive number'
    } else if (data.travel_radius_miles > 10000) {
      errors.travel_radius_miles = 'Travel radius seems unreasonably high'
    }
  }

  // Validate advance_booking_weeks
  if (data.advance_booking_weeks !== undefined && data.advance_booking_weeks !== null) {
    if (typeof data.advance_booking_weeks !== 'number' || data.advance_booking_weeks < 0) {
      errors.advance_booking_weeks = 'Advance booking weeks must be a positive number'
    } else if (data.advance_booking_weeks > 52) {
      errors.advance_booking_weeks = 'Advance booking weeks should not exceed 52 weeks'
    }
  }

  // Validate time splits (should add up to 100)
  if (data.time_split_creative !== undefined && data.time_split_logistics !== undefined) {
    const total = (data.time_split_creative || 0) + (data.time_split_logistics || 0)
    if (total !== 100) {
      errors.time_splits = 'Creative and logistics time splits must add up to 100%'
    }
  }

  // Validate available_dates (JSON array of ISO dates)
  if (data.available_dates) {
    if (!Array.isArray(data.available_dates)) {
      errors.available_dates = 'Available dates must be an array'
    } else {
      const invalidDates = data.available_dates.filter((date: string) => !isValidISODate(date))
      if (invalidDates.length > 0) {
        errors.available_dates = 'All dates must be in ISO format (YYYY-MM-DD)'
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
  }
}

/**
 * Validate Step 5: Quick Questions
 */
export function validateStep5(data: any): ValidationResult {
  const errors: Record<string, string> = {}

  // All quick questions are optional booleans
  const booleanFields = [
    'currently_making_music',
    'confident_online_presence',
    'struggles_creative_niche',
    'knows_where_find_gigs',
    'paid_fairly_performing',
    'understands_royalties',
  ]

  for (const field of booleanFields) {
    if (data[field] !== undefined && typeof data[field] !== 'boolean') {
      errors[field] = `${field} must be a boolean value`
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
  }
}

/**
 * Helper: Validate URL format
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Helper: Validate phone number (basic validation)
 */
function isValidPhoneNumber(phone: string): boolean {
  // Basic validation: allow +, digits, spaces, hyphens, parentheses
  const phoneRegex = /^[\d\s\-+()\\.]+$/
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10
}

/**
 * Helper: Validate Instagram handle
 */
function isValidInstagramHandle(handle: string): boolean {
  // Remove @ if present
  const cleanHandle = handle.startsWith('@') ? handle.slice(1) : handle
  // Instagram handles: alphanumeric, dots, underscores, 1-30 chars
  const instagramRegex = /^[a-zA-Z0-9._]{1,30}$/
  return instagramRegex.test(cleanHandle)
}

/**
 * Helper: Validate TikTok handle
 */
function isValidTikTokHandle(handle: string): boolean {
  // Remove @ if present
  const cleanHandle = handle.startsWith('@') ? handle.slice(1) : handle
  // TikTok handles: alphanumeric, dots, underscores, 2-24 chars
  const tiktokRegex = /^[a-zA-Z0-9._]{2,24}$/
  return tiktokRegex.test(cleanHandle)
}

/**
 * Helper: Validate ISO date format (YYYY-MM-DD)
 */
function isValidISODate(date: string): boolean {
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!isoDateRegex.test(date)) {
    return false
  }

  const parsedDate = new Date(date)
  return parsedDate instanceof Date && !isNaN(parsedDate.getTime())
}

/**
 * Sanitize social media handles (remove @ symbol)
 */
export function sanitizeHandle(handle: string | null | undefined): string | null {
  if (!handle) return null
  return handle.startsWith('@') ? handle.slice(1) : handle
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate artist profile for public visibility
 * Checks if minimum required fields are filled
 */
export function validateProfileForPublic(artist: any): ValidationResult {
  const errors: Record<string, string> = {}

  const requiredFields = ['stage_name', 'bio', 'primary_genre', 'location_city', 'location_state']

  for (const field of requiredFields) {
    if (!artist[field] || (typeof artist[field] === 'string' && artist[field].trim().length === 0)) {
      errors[field] = `${field} is required for public profile`
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
  }
}
