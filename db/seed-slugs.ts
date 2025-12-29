/**
 * One-time Migration Script: Generate Slugs for Existing Profiles
 *
 * This script generates URL slugs for all existing artists and venues
 * that don't have a slug set. It handles duplicates by appending random suffixes.
 *
 * Usage:
 *   npx wrangler d1 execute umbrella-db --local --file=db/seed-slugs.sql
 *   OR run this script with wrangler
 *
 * Note: This is designed to be run once during the migration.
 * After running, all new profiles should have slugs generated automatically
 * during onboarding.
 */

// Slug generation logic (mirrors api/utils/slug.ts)
const SLUG_RULES = {
  MIN_LENGTH: 3,
  MAX_LENGTH: 50,
  SUFFIX_LENGTH: 4,
}

const RESERVED_SLUGS = new Set([
  'admin', 'api', 'auth', 'dashboard', 'edit', 'login', 'logout', 'new',
  'profile', 'settings', 'signup', 'help', 'support', 'about', 'contact',
  'terms', 'privacy', 'umbrella', 'artist', 'venue', 'null', 'undefined',
])

function generateSlug(name: string): string {
  if (!name || typeof name !== 'string') {
    return ''
  }

  let slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, SLUG_RULES.MAX_LENGTH)

  if (slug.length < SLUG_RULES.MIN_LENGTH) {
    slug = slug + '-' + generateRandomSuffix()
  }

  return slug
}

function generateRandomSuffix(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let suffix = ''
  for (let i = 0; i < SLUG_RULES.SUFFIX_LENGTH; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return suffix
}

function generateUniqueSlug(name: string, existingSlugs: Set<string>): string {
  let baseSlug = generateSlug(name)

  if (RESERVED_SLUGS.has(baseSlug)) {
    baseSlug = baseSlug + '-' + generateRandomSuffix()
  }

  if (!existingSlugs.has(baseSlug)) {
    return baseSlug
  }

  let uniqueSlug: string
  let attempts = 0
  const maxAttempts = 100

  do {
    uniqueSlug = `${baseSlug}-${generateRandomSuffix()}`
    attempts++
  } while (existingSlugs.has(uniqueSlug) && attempts < maxAttempts)

  if (attempts >= maxAttempts) {
    uniqueSlug = `${baseSlug}-${Date.now().toString(36).slice(-6)}`
  }

  return uniqueSlug
}

// Export for use with Cloudflare Workers D1
interface Env {
  DB: D1Database
}

interface ArtistRecord {
  id: string
  stage_name: string
  slug: string | null
}

interface VenueRecord {
  id: string
  name: string
  slug: string | null
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    // Only allow this endpoint with a secret key for safety
    const secretKey = url.searchParams.get('key')
    if (secretKey !== 'migrate-slugs-2024') {
      return new Response('Unauthorized', { status: 401 })
    }

    try {
      const results = {
        artists: { processed: 0, updated: 0, skipped: 0 },
        venues: { processed: 0, updated: 0, skipped: 0 },
      }

      // Process artists
      console.log('Processing artists...')
      const artists = await env.DB.prepare(
        'SELECT id, stage_name, slug FROM artists'
      ).all<ArtistRecord>()

      const existingArtistSlugs = new Set<string>()
      
      // First, collect all existing slugs
      for (const artist of artists.results || []) {
        if (artist.slug) {
          existingArtistSlugs.add(artist.slug)
        }
      }

      // Then, generate slugs for artists without one
      for (const artist of artists.results || []) {
        results.artists.processed++

        if (artist.slug) {
          results.artists.skipped++
          continue
        }

        const newSlug = generateUniqueSlug(artist.stage_name, existingArtistSlugs)
        existingArtistSlugs.add(newSlug)

        await env.DB.prepare(
          'UPDATE artists SET slug = ?, updated_at = ? WHERE id = ?'
        ).bind(newSlug, new Date().toISOString(), artist.id).run()

        results.artists.updated++
        console.log(`Artist ${artist.id}: ${artist.stage_name} -> ${newSlug}`)
      }

      // Process venues
      console.log('Processing venues...')
      const venues = await env.DB.prepare(
        'SELECT id, name, slug FROM venues'
      ).all<VenueRecord>()

      const existingVenueSlugs = new Set<string>()

      // First, collect all existing slugs
      for (const venue of venues.results || []) {
        if (venue.slug) {
          existingVenueSlugs.add(venue.slug)
        }
      }

      // Then, generate slugs for venues without one
      for (const venue of venues.results || []) {
        results.venues.processed++

        if (venue.slug) {
          results.venues.skipped++
          continue
        }

        const newSlug = generateUniqueSlug(venue.name, existingVenueSlugs)
        existingVenueSlugs.add(newSlug)

        await env.DB.prepare(
          'UPDATE venues SET slug = ?, updated_at = ? WHERE id = ?'
        ).bind(newSlug, new Date().toISOString(), venue.id).run()

        results.venues.updated++
        console.log(`Venue ${venue.id}: ${venue.name} -> ${newSlug}`)
      }

      console.log('Slug migration complete!')
      console.log('Results:', JSON.stringify(results, null, 2))

      return new Response(JSON.stringify({
        success: true,
        message: 'Slug migration completed successfully',
        results,
      }), {
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (error) {
      console.error('Slug migration error:', error)
      return new Response(JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  },
}

