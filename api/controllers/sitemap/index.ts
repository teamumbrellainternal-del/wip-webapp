/**
 * Sitemap Controller
 * Generates dynamic XML sitemap for SEO indexing of public profiles
 * 
 * Features:
 * - Queries D1 for all artist and venue profiles
 * - Generates standard XML sitemap format
 * - Caches result in KV for 24 hours
 * - Includes lastmod dates from profile updates
 */

import type { RouteHandler } from '../../router'
import { logger } from '../../utils/logger'

const BASE_URL = 'https://app.umbrellalive.com'
const CACHE_KEY = 'sitemap:xml'
const CACHE_TTL_SECONDS = 86400 // 24 hours

/**
 * Profile data from database
 */
interface ProfileRecord {
  id: string
  updated_at: string
}

/**
 * Generate XML sitemap entry
 */
function generateUrlEntry(loc: string, lastmod: string, priority: string = '0.8'): string {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod.split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`
}

/**
 * Generate full XML sitemap
 */
function generateSitemapXml(artists: ProfileRecord[], venues: ProfileRecord[]): string {
  const urlEntries: string[] = []

  // Add artist profile URLs
  for (const artist of artists) {
    urlEntries.push(
      generateUrlEntry(
        `${BASE_URL}/artist/${artist.id}`,
        artist.updated_at,
        '0.8'
      )
    )
  }

  // Add venue profile URLs
  for (const venue of venues) {
    urlEntries.push(
      generateUrlEntry(
        `${BASE_URL}/venue/${venue.id}`,
        venue.updated_at,
        '0.7'
      )
    )
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
${urlEntries.join('\n')}
</urlset>`
}

/**
 * GET /sitemap.xml
 * Generate and return XML sitemap for all public profiles
 */
export const getSitemap: RouteHandler = async (ctx) => {
  const requestId = ctx.requestId

  try {
    // Check KV cache first
    const cached = await ctx.env.KV.get(CACHE_KEY)
    if (cached) {
      logger.debug('SitemapController', 'getSitemap', 'Returning cached sitemap', { requestId })
      return new Response(cached, {
        status: 200,
        headers: {
          'Content-Type': 'application/xml',
          'Cache-Control': 'public, max-age=3600', // Browser cache: 1 hour
          'X-Cache': 'HIT',
        },
      })
    }

    logger.info('SitemapController', 'getSitemap', 'Generating fresh sitemap', { requestId })

    // Query all artists
    const artistsResult = await ctx.env.DB.prepare(
      'SELECT id, updated_at FROM artists ORDER BY updated_at DESC'
    ).all<ProfileRecord>()

    // Query all venues  
    const venuesResult = await ctx.env.DB.prepare(
      'SELECT id, updated_at FROM venues ORDER BY updated_at DESC'
    ).all<ProfileRecord>()

    const artists = artistsResult.results || []
    const venues = venuesResult.results || []

    logger.info('SitemapController', 'getSitemap', 'Sitemap generated', {
      requestId,
      artistCount: artists.length,
      venueCount: venues.length,
    })

    // Generate XML
    const sitemapXml = generateSitemapXml(artists, venues)

    // Cache in KV
    await ctx.env.KV.put(CACHE_KEY, sitemapXml, {
      expirationTtl: CACHE_TTL_SECONDS,
    })

    return new Response(sitemapXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600', // Browser cache: 1 hour
        'X-Cache': 'MISS',
      },
    })
  } catch (error) {
    logger.error('SitemapController', 'getSitemap', 'Failed to generate sitemap', {
      requestId,
      error: error instanceof Error ? error.message : String(error),
    })

    // Return empty sitemap on error rather than failing
    const emptySitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`

    return new Response(emptySitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'no-cache',
      },
    })
  }
}

/**
 * Invalidate sitemap cache
 * Call this when profiles are created/updated/deleted
 */
export async function invalidateSitemapCache(env: { KV: KVNamespace }): Promise<void> {
  try {
    await env.KV.delete(CACHE_KEY)
    logger.info('SitemapController', 'invalidateSitemapCache', 'Sitemap cache invalidated')
  } catch (error) {
    logger.error('SitemapController', 'invalidateSitemapCache', 'Failed to invalidate cache', {
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

