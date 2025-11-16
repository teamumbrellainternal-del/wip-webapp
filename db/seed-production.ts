/**
 * UMBRELLA MVP - PRODUCTION SEED DATA SCRIPT
 *
 * Purpose: Seed production reference data required for the application to function
 *
 * Features:
 * - 20 music genres for onboarding and marketplace
 * - 22 tags (12 skills + 10 vibe tags) for artist profiles
 * - Default user settings for new accounts
 * - System configuration values (upload limits, AI usage, etc.)
 * - Idempotent execution (safe to run multiple times)
 *
 * Usage:
 *   npm run seed:production
 *
 * Difference from test fixtures (db/seed.ts):
 * - This seeds REFERENCE DATA required for production
 * - db/seed.ts creates TEST DATA for development (users, artists, gigs)
 */

import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { writeFileSync } from 'fs'

// ============================================================================
// REFERENCE DATA
// ============================================================================

/**
 * GENRES - Music genres for onboarding step 1 and marketplace filtering
 * Source: docs/initial-spec/eng-spec.md
 */
const GENRES = [
  { id: 1, name: 'Afro-House', slug: 'afro-house' },
  { id: 2, name: 'Blues', slug: 'blues' },
  { id: 3, name: 'Classical', slug: 'classical' },
  { id: 4, name: 'Country', slug: 'country' },
  { id: 5, name: 'EDM', slug: 'edm' },
  { id: 6, name: 'Electronica', slug: 'electronica' },
  { id: 7, name: 'Folk', slug: 'folk' },
  { id: 8, name: 'Funk', slug: 'funk' },
  { id: 9, name: 'Hip-Hop', slug: 'hip-hop' },
  { id: 10, name: 'House', slug: 'house' },
  { id: 11, name: 'Jazz', slug: 'jazz' },
  { id: 12, name: 'Latin', slug: 'latin' },
  { id: 13, name: 'Metal', slug: 'metal' },
  { id: 14, name: 'Pop', slug: 'pop' },
  { id: 15, name: 'R&B', slug: 'r-b' },
  { id: 16, name: 'Reggae', slug: 'reggae' },
  { id: 17, name: 'Rock', slug: 'rock' },
  { id: 18, name: 'Soul', slug: 'soul' },
  { id: 19, name: 'Techno', slug: 'techno' },
  { id: 20, name: 'Other', slug: 'other' }
]

/**
 * SKILLS TAGS - Artist skill categories for onboarding step 3
 * Source: docs/initial-spec/eng-spec.md
 */
const SKILLS_TAGS = [
  { id: 1, category: 'skill', name: 'Mixing', slug: 'mixing' },
  { id: 2, category: 'skill', name: 'Mastering', slug: 'mastering' },
  { id: 3, category: 'skill', name: 'Production', slug: 'production' },
  { id: 4, category: 'skill', name: 'Songwriting', slug: 'songwriting' },
  { id: 5, category: 'skill', name: 'Beat Making', slug: 'beat-making' },
  { id: 6, category: 'skill', name: 'Session Musician', slug: 'session-musician' },
  { id: 7, category: 'skill', name: 'Vocals', slug: 'vocals' },
  { id: 8, category: 'skill', name: 'Guitar', slug: 'guitar' },
  { id: 9, category: 'skill', name: 'Piano/Keys', slug: 'piano-keys' },
  { id: 10, category: 'skill', name: 'Drums', slug: 'drums' },
  { id: 11, category: 'skill', name: 'Bass', slug: 'bass' },
  { id: 12, category: 'skill', name: 'DJ', slug: 'dj' }
]

/**
 * VIBE TAGS - Artist vibe/style tags for onboarding step 3
 * Source: docs/initial-spec/eng-spec.md
 */
const VIBE_TAGS = [
  { id: 13, category: 'vibe', name: 'Chill', slug: 'chill' },
  { id: 14, category: 'vibe', name: 'Energetic', slug: 'energetic' },
  { id: 15, category: 'vibe', name: 'Experimental', slug: 'experimental' },
  { id: 16, category: 'vibe', name: 'Melodic', slug: 'melodic' },
  { id: 17, category: 'vibe', name: 'Dark', slug: 'dark' },
  { id: 18, category: 'vibe', name: 'Uplifting', slug: 'uplifting' },
  { id: 19, category: 'vibe', name: 'Groovy', slug: 'groovy' },
  { id: 20, category: 'vibe', name: 'Atmospheric', slug: 'atmospheric' },
  { id: 21, category: 'vibe', name: 'Raw', slug: 'raw' },
  { id: 22, category: 'vibe', name: 'Polished', slug: 'polished' }
]

/**
 * DEFAULT SETTINGS - Applied to all new users on account creation
 * Stored as JSON in system_config table
 */
const DEFAULT_SETTINGS = {
  email_notifications: {
    gig_bookings: true,
    new_messages: true,
    marketplace_updates: false,
    weekly_digest: true
  },
  sms_notifications: {
    gig_bookings: true,  // per D-045
    new_messages: false
  },
  privacy: {
    profile_visibility: 'public',
    email_visibility: 'private',
    phone_visibility: 'private'
  },
  preferences: {
    timezone: 'America/New_York',  // Default, user can change
    language: 'en'
  }
}

/**
 * SYSTEM CONFIGURATION - Application-wide limits and settings
 * Source: docs/initial-spec/eng-spec.md (various D-xxx decision records)
 */
const SYSTEM_CONFIG = [
  // File upload limits (per D-028)
  {
    key: 'file_upload_quota_per_artist',
    value: '53687091200',  // 50 GB in bytes
    description: 'Storage quota per artist (50GB)'
  },
  {
    key: 'file_upload_max_size_per_file',
    value: '104857600',  // 100 MB in bytes
    description: 'Maximum file size per upload (100MB)'
  },
  {
    key: 'file_download_link_ttl',
    value: '86400',  // 24 hours in seconds
    description: 'Download link expiration time (24 hours)'
  },

  // AI usage limits (per D-059, D-062)
  {
    key: 'ai_tokens_per_month',
    value: '25000',
    description: 'Violet AI tokens per artist per month'
  },
  {
    key: 'ai_prompts_per_day',
    value: '50',
    description: 'Violet AI prompts per artist per day'
  },

  // Messaging limits (per D-087)
  {
    key: 'message_max_length',
    value: '2000',
    description: 'Maximum message length in characters'
  },
  {
    key: 'message_rate_limit',
    value: 'none',
    description: 'Message rate limit (none for MVP)'
  },

  // Marketplace settings
  {
    key: 'gigs_per_page',
    value: '20',
    description: 'Number of gigs displayed per page'
  },
  {
    key: 'artists_per_page',
    value: '20',
    description: 'Number of artists displayed per page'
  },

  // Analytics cron settings (per D-008)
  {
    key: 'analytics_cron_schedule',
    value: '0 0 * * *',
    description: 'Daily analytics update schedule (midnight UTC)'
  },
  {
    key: 'analytics_cron_retry_attempts',
    value: '3',
    description: 'Number of retry attempts for failed analytics jobs'
  },
  {
    key: 'analytics_cron_retry_backoff',
    value: '2000,4000,8000',
    description: 'Retry backoff intervals in milliseconds'
  },

  // Session settings
  {
    key: 'session_ttl',
    value: '86400',  // 24 hours
    description: 'Session time-to-live (24 hours)'
  },
  {
    key: 'session_refresh_enabled',
    value: 'false',
    description: 'Enable automatic session refresh'
  },

  // Default user settings (stored as JSON)
  {
    key: 'default_user_settings',
    value: JSON.stringify(DEFAULT_SETTINGS),
    description: 'Default settings applied to new user accounts'
  }
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function escapeSQL(str: string): string {
  return `'${str.replace(/'/g, "''")}'`
}

function formatSQLValue(value: string | number): string {
  if (typeof value === 'number') return value.toString()
  return escapeSQL(value)
}

// ============================================================================
// SQL GENERATION
// ============================================================================

function generateProductionSeedSQL(): string {
  const timestamp = new Date().toISOString()

  let sql = `-- ============================================================================
-- UMBRELLA MVP - PRODUCTION SEED DATA
-- ============================================================================
-- Generated: ${timestamp}
--
-- Summary:
-- - ${GENRES.length} genres
-- - ${SKILLS_TAGS.length + VIBE_TAGS.length} tags (${SKILLS_TAGS.length} skills + ${VIBE_TAGS.length} vibes)
-- - ${SYSTEM_CONFIG.length} system configuration values
--
-- This script is IDEMPOTENT - uses INSERT OR IGNORE to safely run multiple times
-- ============================================================================

`

  // Genres
  sql += `-- ============================================================================
-- GENRES (Music Genres for Onboarding & Marketplace)
-- ============================================================================
-- Purpose: Required for onboarding step 1 and marketplace filtering
-- Source: docs/initial-spec/eng-spec.md

`

  for (const genre of GENRES) {
    sql += `INSERT OR IGNORE INTO genres (id, name, slug, created_at) VALUES (${genre.id}, ${formatSQLValue(genre.name)}, ${formatSQLValue(genre.slug)}, datetime('now'));\n`
  }

  // Tags
  sql += `
-- ============================================================================
-- TAGS (Skills & Vibe Tags for Artist Profiles)
-- ============================================================================
-- Purpose: Required for onboarding step 3 (multi-select tags)
-- Source: docs/initial-spec/eng-spec.md

-- Skills Tags
`

  for (const tag of SKILLS_TAGS) {
    sql += `INSERT OR IGNORE INTO tags (id, category, name, slug, created_at) VALUES (${tag.id}, ${formatSQLValue(tag.category)}, ${formatSQLValue(tag.name)}, ${formatSQLValue(tag.slug)}, datetime('now'));\n`
  }

  sql += `\n-- Vibe Tags\n`

  for (const tag of VIBE_TAGS) {
    sql += `INSERT OR IGNORE INTO tags (id, category, name, slug, created_at) VALUES (${tag.id}, ${formatSQLValue(tag.category)}, ${formatSQLValue(tag.name)}, ${formatSQLValue(tag.slug)}, datetime('now'));\n`
  }

  // System Configuration
  sql += `
-- ============================================================================
-- SYSTEM CONFIGURATION (Application-Wide Settings)
-- ============================================================================
-- Purpose: Default settings and limits for the application
-- Source: docs/initial-spec/eng-spec.md (various D-xxx decisions)

`

  for (const config of SYSTEM_CONFIG) {
    sql += `INSERT OR IGNORE INTO system_config (key, value, description, updated_at) VALUES (${formatSQLValue(config.key)}, ${formatSQLValue(config.value)}, ${formatSQLValue(config.description)}, datetime('now'));\n`
  }

  sql += `
-- ============================================================================
-- PRODUCTION SEED DATA COMPLETE
-- ============================================================================
-- The application is now ready with all required reference data:
-- ✓ Genres available for onboarding step 1
-- ✓ Tags available for onboarding step 3
-- ✓ Default settings configured for new users
-- ✓ System limits and configuration values set
-- ============================================================================
`

  return sql
}

// ============================================================================
// EXECUTION
// ============================================================================

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    console.log('🌱 Generating production seed data...\n')

    const sql = generateProductionSeedSQL()

    // Write to file
    const outputPath = join(__dirname, 'seed-production-output.sql')
    writeFileSync(outputPath, sql, 'utf8')

    console.log('✅ Production seed data generated successfully!')
    console.log(`📁 Output: ${outputPath}`)
    console.log('\n📊 Summary:')
    console.log(`   - ${GENRES.length} genres`)
    console.log(`   - ${SKILLS_TAGS.length + VIBE_TAGS.length} tags (${SKILLS_TAGS.length} skills + ${VIBE_TAGS.length} vibes)`)
    console.log(`   - ${SYSTEM_CONFIG.length} system configuration values`)
    console.log('\n💡 To apply this seed data, run:')
    console.log('   npm run seed:production')
    console.log('\n🔄 This script is idempotent - safe to run multiple times\n')
  } catch (error) {
    console.error('❌ Error generating production seed data:', error)
    process.exit(1)
  }
}

export { generateProductionSeedSQL, GENRES, SKILLS_TAGS, VIBE_TAGS, DEFAULT_SETTINGS, SYSTEM_CONFIG }
