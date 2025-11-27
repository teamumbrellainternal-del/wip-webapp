/**
 * Shared validation utilities for onboarding forms
 * Provides reusable validation functions that align with backend rules
 */

/**
 * Validates that a value doesn't exceed max length (only if value is provided)
 * Returns error message or true for valid
 */
export function validateMaxLength(value: string, max: number, fieldName: string): string | true {
  if (!value || value.trim().length === 0) {
    return true // Empty is valid for optional fields
  }
  if (value.length > max) {
    return `${fieldName} must be ${max} characters or less`
  }
  return true
}

/**
 * Validates Spotify profile URL format (only if value is provided)
 */
export function validateSpotifyUrl(value: string): string | true {
  if (!value || value.trim().length === 0) {
    return true // Empty is valid for optional fields
  }
  if (!value.startsWith('https://open.spotify.com/')) {
    return 'Please enter a valid Spotify URL (e.g., https://open.spotify.com/artist/...)'
  }
  return true
}

/**
 * Validates Apple Music URL format (only if value is provided)
 */
export function validateAppleMusicUrl(value: string): string | true {
  if (!value || value.trim().length === 0) {
    return true // Empty is valid for optional fields
  }
  if (!value.startsWith('https://music.apple.com/')) {
    return 'Please enter a valid Apple Music URL (e.g., https://music.apple.com/artist/...)'
  }
  return true
}

/**
 * Validates price format (only if value is provided)
 * Accepts: "500", "$500", "500-1000", "$500-1000", "$500-$1000"
 */
export function validatePriceFormat(value: string): string | true {
  if (!value || value.trim().length === 0) {
    return true // Empty is valid for optional fields
  }
  
  // Remove $ symbols and whitespace for validation
  const cleaned = value.replace(/[$\s]/g, '')
  
  // Check for single number or range format
  const singleNumberPattern = /^\d+$/
  const rangePattern = /^\d+-\d+$/
  
  if (!singleNumberPattern.test(cleaned) && !rangePattern.test(cleaned)) {
    return 'Please enter a valid price (e.g., 500 or 500-1000)'
  }
  
  return true
}

/**
 * Validates generic URL format (only if value is provided)
 */
export function validateUrl(value: string): string | true {
  if (!value || value.trim().length === 0) {
    return true // Empty is valid for optional fields
  }
  
  try {
    new URL(value)
    return true
  } catch {
    return 'Please enter a valid URL'
  }
}

/**
 * Character limit constants aligned with backend validation
 */
export const VALIDATION_LIMITS = {
  FULL_NAME: 100,
  STAGE_NAME: 100,
  GENRE: 50,
  BIO: 500,
  PROMPT_TEXT: 200,
  SKILL_NAME: 50,
  CITY: 100,
  STATE: 50,
} as const

