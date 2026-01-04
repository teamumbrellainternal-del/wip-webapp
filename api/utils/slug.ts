/**
 * Slug Generation Utility
 * Handles URL-safe slug generation for artist and venue profiles
 *
 * Features:
 * - Converts names to lowercase URL-safe slugs
 * - Handles special characters and Unicode
 * - Generates unique slugs with random suffixes for duplicates
 * - Validates user-provided custom slugs
 */

import { logger } from './logger'

/**
 * Slug validation rules
 */
const SLUG_RULES = {
  MIN_LENGTH: 3,
  MAX_LENGTH: 50,
  PATTERN: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, // lowercase alphanumeric with hyphens
  SUFFIX_LENGTH: 4,
} as const

/**
 * Reserved slugs that cannot be used
 */
const RESERVED_SLUGS = new Set([
  'admin',
  'api',
  'auth',
  'dashboard',
  'edit',
  'login',
  'logout',
  'new',
  'profile',
  'settings',
  'signup',
  'help',
  'support',
  'about',
  'contact',
  'terms',
  'privacy',
  'umbrella',
  'artist',
  'venue',
  'null',
  'undefined',
])

/**
 * Generate a URL-safe slug from a name
 * Converts to lowercase, replaces spaces with hyphens, removes special characters
 *
 * @param name - The name to convert to a slug
 * @returns URL-safe slug string
 */
export function generateSlug(name: string): string {
  if (!name || typeof name !== 'string') {
    return ''
  }

  let slug = name
    // Convert to lowercase
    .toLowerCase()
    // Normalize Unicode characters (é → e, ñ → n, etc.)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, '-')
    // Remove all characters except alphanumeric and hyphens
    .replace(/[^a-z0-9-]/g, '')
    // Replace multiple consecutive hyphens with a single hyphen
    .replace(/-+/g, '-')
    // Remove leading and trailing hyphens
    .replace(/^-|-$/g, '')
    // Truncate to max length
    .slice(0, SLUG_RULES.MAX_LENGTH)

  // Handle edge case where slug is too short or empty
  if (slug.length < SLUG_RULES.MIN_LENGTH) {
    // Pad with random characters if too short
    slug = slug + '-' + generateRandomSuffix()
  }

  return slug
}

/**
 * Generate a random alphanumeric suffix
 * Used for making slugs unique when duplicates exist
 *
 * @returns 4-character random string (lowercase alphanumeric)
 */
export function generateRandomSuffix(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let suffix = ''
  for (let i = 0; i < SLUG_RULES.SUFFIX_LENGTH; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return suffix
}

/**
 * Generate a unique slug by checking against existing slugs
 * Appends a random suffix if the base slug already exists
 *
 * @param name - The name to convert to a slug
 * @param existingSlugs - Set or array of existing slugs to check against
 * @returns Unique slug string
 */
export function generateUniqueSlug(
  name: string,
  existingSlugs: Set<string> | string[]
): string {
  const slugSet = existingSlugs instanceof Set ? existingSlugs : new Set(existingSlugs)
  let baseSlug = generateSlug(name)

  // Check if base slug is reserved
  if (RESERVED_SLUGS.has(baseSlug)) {
    baseSlug = baseSlug + '-' + generateRandomSuffix()
  }

  // If slug doesn't exist, return it
  if (!slugSet.has(baseSlug)) {
    return baseSlug
  }

  // Generate unique slug with suffix
  let uniqueSlug: string
  let attempts = 0
  const maxAttempts = 100 // Safety limit

  do {
    uniqueSlug = `${baseSlug}-${generateRandomSuffix()}`
    attempts++
  } while (slugSet.has(uniqueSlug) && attempts < maxAttempts)

  if (attempts >= maxAttempts) {
    logger.warn('SlugUtil', 'generateUniqueSlug', 'Max attempts reached for unique slug', {
      name,
      baseSlug,
    })
    // Fallback: use timestamp-based suffix
    uniqueSlug = `${baseSlug}-${Date.now().toString(36).slice(-6)}`
  }

  return uniqueSlug
}

/**
 * Validate a user-provided custom slug
 * Returns validation result with error message if invalid
 *
 * @param slug - The slug to validate
 * @returns Validation result object
 */
export function validateSlug(slug: string): { valid: boolean; error?: string } {
  if (!slug || typeof slug !== 'string') {
    return { valid: false, error: 'Slug is required' }
  }

  // Check minimum length
  if (slug.length < SLUG_RULES.MIN_LENGTH) {
    return {
      valid: false,
      error: `Slug must be at least ${SLUG_RULES.MIN_LENGTH} characters`,
    }
  }

  // Check maximum length
  if (slug.length > SLUG_RULES.MAX_LENGTH) {
    return {
      valid: false,
      error: `Slug must be no more than ${SLUG_RULES.MAX_LENGTH} characters`,
    }
  }

  // Check pattern (lowercase alphanumeric with hyphens)
  if (!SLUG_RULES.PATTERN.test(slug)) {
    return {
      valid: false,
      error: 'Slug can only contain lowercase letters, numbers, and hyphens',
    }
  }

  // Check for reserved slugs
  if (RESERVED_SLUGS.has(slug)) {
    return {
      valid: false,
      error: 'This URL is reserved. Please choose a different slug.',
    }
  }

  return { valid: true }
}

/**
 * Check if a slug is available (not in use)
 * This is a helper type for the database check function
 */
export interface SlugCheckResult {
  available: boolean
  suggestion?: string
}

/**
 * Normalize a slug (ensure it follows all rules)
 * Useful for cleaning up user input before validation
 *
 * @param slug - The slug to normalize
 * @returns Normalized slug string
 */
export function normalizeSlug(slug: string): string {
  if (!slug || typeof slug !== 'string') {
    return ''
  }

  return slug
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, SLUG_RULES.MAX_LENGTH)
}

