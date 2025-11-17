/**
 * UMBRELLA MVP - COMPREHENSIVE SEED DATA SCRIPT
 *
 * Purpose: Generate comprehensive test fixtures for frontend development
 *
 * Features:
 * - 10 test users with varied onboarding states
 * - 20 artist profiles with complete data
 * - 30 gigs with different statuses and dates
 * - 50 messages across conversations
 * - Test file metadata for R2
 * - Idempotent execution (can run multiple times)
 *
 * Usage:
 *   npm run seed (for local development)
 *   OR wrangler d1 execute umbrella-dev-db --local --file=db/seed-output.sql
 */

import { randomUUID } from 'crypto'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { writeFileSync } from 'fs'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface User {
  id: string
  clerk_id?: string
  oauth_provider: 'apple' | 'google'
  oauth_id: string
  email: string
  onboarding_complete: boolean
  created_at: string
  updated_at: string
}

interface Artist {
  id: string
  user_id: string
  stage_name: string
  legal_name: string | null
  pronouns: string | null
  location_city: string | null
  location_state: string | null
  location_country: string
  bio: string | null
  tagline: string | null
  primary_genre: string | null
  secondary_genres: string | null
  influences: string | null
  artist_type: string | null
  equipment: string | null
  daw: string | null
  platforms: string | null
  base_rate_flat: number | null
  base_rate_hourly: number | null
  rates_negotiable: boolean
  currently_making_music: boolean | null
  verified: boolean
  avatar_url: string | null
  avg_rating: number
  total_reviews: number
  total_gigs: number
  profile_views: number
  follower_count: number
  created_at: string
  updated_at: string
}

interface Gig {
  id: string
  venue_id: string
  title: string
  description: string | null
  venue_name: string
  location_city: string
  location_state: string
  date: string
  start_time: string | null
  genre: string | null
  capacity: number | null
  filled_slots: number
  payment_amount: number | null
  payment_type: 'flat' | 'hourly' | 'negotiable' | null
  urgency_flag: boolean
  status: 'open' | 'filled' | 'cancelled' | 'completed'
  created_at: string
  updated_at: string
}

interface Conversation {
  id: string
  participant_1_id: string
  participant_2_id: string
  last_message_at: string | null
  last_message_preview: string | null
  unread_count_p1: number
  unread_count_p2: number
  created_at: string
  updated_at: string
}

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  attachment_url: string | null
  attachment_filename: string | null
  attachment_size: number | null
  read: boolean
  created_at: string
}

interface File {
  id: string
  artist_id: string
  filename: string
  file_size_bytes: number
  mime_type: string
  r2_key: string
  category: 'press_photo' | 'music' | 'video' | 'document' | 'other'
  created_at: string
}

interface Review {
  id: string
  artist_id: string
  reviewer_user_id: string | null
  reviewer_email: string | null
  reviewer_name: string | null
  rating: number
  comment: string | null
  created_at: string
}

interface StorageQuota {
  artist_id: string
  used_bytes: number
  limit_bytes: number
  updated_at: string
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateId(prefix: string): string {
  return `${prefix}_${randomUUID().substring(0, 8)}`
}

function getISOTimestamp(daysOffset: number = 0, hoursOffset: number = 0): string {
  const date = new Date()
  date.setDate(date.getDate() + daysOffset)
  date.setHours(date.getHours() + hoursOffset)
  return date.toISOString()
}

function getISODate(daysOffset: number = 0): string {
  const date = new Date()
  date.setDate(date.getDate() + daysOffset)
  return date.toISOString().split('T')[0]
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function escapeSQL(str: string | null): string {
  if (str === null) return 'NULL'
  return `'${str.replace(/'/g, "''")}'`
}

function formatSQLValue(value: unknown): string {
  if (value === null || value === undefined) return 'NULL'
  if (typeof value === 'boolean') return value ? '1' : '0'
  if (typeof value === 'number') return value.toString()
  if (typeof value === 'string') return escapeSQL(value)
  return escapeSQL(JSON.stringify(value))
}

// ============================================================================
// DATA GENERATORS
// ============================================================================

const FIRST_NAMES = [
  'Maya', 'Alex', 'Jordan', 'Taylor', 'Sam', 'Riley', 'Morgan', 'Casey', 'Avery', 'Quinn',
  'Rowan', 'Sage', 'Blake', 'Cameron', 'Dakota', 'Ellis', 'Finley', 'Harper', 'Indigo', 'Jules'
]

const LAST_NAMES = [
  'Rivers', 'Chen', 'Lee', 'Garcia', 'Johnson', 'Williams', 'Brown', 'Davis', 'Miller', 'Wilson',
  'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Martinez'
]

const CITIES = [
  { city: 'San Francisco', state: 'CA' },
  { city: 'Los Angeles', state: 'CA' },
  { city: 'New York', state: 'NY' },
  { city: 'Brooklyn', state: 'NY' },
  { city: 'Austin', state: 'TX' },
  { city: 'Nashville', state: 'TN' },
  { city: 'Seattle', state: 'WA' },
  { city: 'Portland', state: 'OR' },
  { city: 'Chicago', state: 'IL' },
  { city: 'Atlanta', state: 'GA' },
  { city: 'Denver', state: 'CO' },
  { city: 'Miami', state: 'FL' },
  { city: 'New Orleans', state: 'LA' },
  { city: 'Philadelphia', state: 'PA' },
  { city: 'Boston', state: 'MA' }
]

const GENRES = [
  'Rock', 'Pop', 'Hip-Hop', 'Electronic', 'Jazz', 'Classical', 'Blues', 'Country',
  'R&B', 'Indie', 'Folk', 'Metal', 'Punk', 'Reggae', 'Soul', 'Funk'
]

const PRONOUNS = ['he/him', 'she/her', 'they/them', 'she/they', 'he/they']

const ARTIST_TYPES = ['solo', 'band', 'dj', 'producer']

const DAWS = ['Ableton Live', 'Logic Pro', 'Pro Tools', 'FL Studio', 'Cubase', 'Reaper', 'Studio One']

const PLATFORMS = ['Spotify', 'SoundCloud', 'Instagram', 'TikTok', 'YouTube', 'Bandcamp']

const VENUE_NAMES = [
  'The Fillmore', 'Blue Note Jazz Club', 'The Troubadour', 'The Roxy', 'First Avenue',
  'The Metro', 'The Paradise', '9:30 Club', 'The Bowery Ballroom', 'The Sinclair',
  'The Independent', 'Tipitina\'s', 'The Rebel Lounge', 'The Echo', 'The Echoplex',
  'Slim\'s', 'The Warfield', 'Great American Music Hall', 'Cafe du Nord', 'Bottom of the Hill'
]

const BIO_TEMPLATES = [
  (genre: string) => `${genre} artist crafting unique sounds and unforgettable performances. Known for blending traditional elements with modern production.`,
  (genre: string) => `Award-winning ${genre.toLowerCase()} musician with a passion for pushing creative boundaries. Every show is a journey.`,
  (genre: string) => `Innovative ${genre.toLowerCase()} artist merging diverse influences into a signature sound. Building community through music.`,
  (genre: string) => `${genre} performer with deep roots in the scene. Dedicated to authentic expression and meaningful connections.`,
  (genre: string) => `Multi-instrumentalist exploring the depths of ${genre.toLowerCase()}. From intimate venues to festival stages.`
]

// ============================================================================
// GENERATE USERS
// ============================================================================

function generateUsers(): User[] {
  const users: User[] = []

  // 3 users with incomplete onboarding (stopped at different steps)
  for (let i = 0; i < 3; i++) {
    const firstName = randomChoice(FIRST_NAMES)
    const lastName = randomChoice(LAST_NAMES)
    const provider = randomChoice(['apple', 'google'] as const)

    users.push({
      id: generateId('user'),
      clerk_id: `clerk_${randomUUID().substring(0, 16)}`,
      oauth_provider: provider,
      oauth_id: `${provider}_${randomUUID().substring(0, 12)}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      onboarding_complete: false,
      created_at: getISOTimestamp(-randomInt(30, 90)),
      updated_at: getISOTimestamp(-randomInt(1, 29))
    })
  }

  // 7 users with complete onboarding
  for (let i = 0; i < 7; i++) {
    const firstName = randomChoice(FIRST_NAMES)
    const lastName = randomChoice(LAST_NAMES)
    const provider = randomChoice(['apple', 'google'] as const)

    users.push({
      id: generateId('user'),
      clerk_id: `clerk_${randomUUID().substring(0, 16)}`,
      oauth_provider: provider,
      oauth_id: `${provider}_${randomUUID().substring(0, 12)}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
      onboarding_complete: true,
      created_at: getISOTimestamp(-randomInt(60, 180)),
      updated_at: getISOTimestamp(-randomInt(1, 59))
    })
  }

  return users
}

// ============================================================================
// GENERATE ARTISTS
// ============================================================================

function generateArtists(users: User[]): Artist[] {
  const artists: Artist[] = []

  // Only create artists for users who completed onboarding
  const completedUsers = users.filter(u => u.onboarding_complete)

  // Generate 20 artists (may need additional users if only 7 completed onboarding)
  // For seed data, we'll create up to 20 from the 7 completed users, with some reuse

  for (let i = 0; i < 20; i++) {
    const user = completedUsers[i % completedUsers.length]
    const firstName = randomChoice(FIRST_NAMES)
    const lastName = randomChoice(LAST_NAMES)
    const location = randomChoice(CITIES)
    const primaryGenre = randomChoice(GENRES)
    const secondaryGenres = [randomChoice(GENRES), randomChoice(GENRES)]
    const artistType = randomChoice(ARTIST_TYPES)

    // Generate rating between 3.5 and 5.0
    const avgRating = parseFloat((3.5 + Math.random() * 1.5).toFixed(1))
    const totalReviews = randomInt(0, 25)
    const totalGigs = randomInt(5, 100)

    artists.push({
      id: generateId('artist'),
      user_id: user.id,
      stage_name: artistType === 'band' ? `${firstName} & The ${lastName}s` : `${firstName} ${lastName}`,
      legal_name: `${firstName} ${lastName}`,
      pronouns: randomChoice(PRONOUNS),
      location_city: location.city,
      location_state: location.state,
      location_country: 'US',
      bio: randomChoice(BIO_TEMPLATES)(primaryGenre),
      tagline: `${primaryGenre} music with soul`,
      primary_genre: primaryGenre,
      secondary_genres: JSON.stringify(secondaryGenres),
      influences: JSON.stringify([randomChoice(FIRST_NAMES) + ' ' + randomChoice(LAST_NAMES), randomChoice(FIRST_NAMES) + ' ' + randomChoice(LAST_NAMES)]),
      artist_type: JSON.stringify([artistType]),
      equipment: JSON.stringify(['Audio Interface', 'Studio Monitors', 'MIDI Controller']),
      daw: JSON.stringify([randomChoice(DAWS)]),
      platforms: JSON.stringify(PLATFORMS.slice(0, randomInt(3, 6))),
      base_rate_flat: randomInt(400, 2000),
      base_rate_hourly: randomInt(100, 300),
      rates_negotiable: Math.random() > 0.3,
      currently_making_music: Math.random() > 0.2,
      verified: i < 5, // First 5 artists are verified
      avatar_url: `https://storage.umbrella.app/profiles/${generateId('avatar')}/avatar.jpg`,
      avg_rating: avgRating,
      total_reviews: totalReviews,
      total_gigs: totalGigs,
      profile_views: randomInt(100, 5000),
      follower_count: randomInt(50, 3000),
      created_at: user.created_at,
      updated_at: getISOTimestamp(-randomInt(1, 30))
    })
  }

  return artists
}

// ============================================================================
// GENERATE GIGS
// ============================================================================

function generateGigs(users: User[]): Gig[] {
  const gigs: Gig[] = []

  // Need some venue users (non-artist users)
  const venueUsers = users.slice(0, 3)

  // 10 past gigs (completed status)
  for (let i = 0; i < 10; i++) {
    const venue = randomChoice(venueUsers)
    const location = randomChoice(CITIES)
    const genre = randomChoice(GENRES)
    const capacity = randomInt(50, 500)

    gigs.push({
      id: generateId('gig'),
      venue_id: venue.id,
      title: `${genre} Night at ${randomChoice(VENUE_NAMES)}`,
      description: `Looking for talented ${genre.toLowerCase()} artists to perform. Great atmosphere and sound system.`,
      venue_name: randomChoice(VENUE_NAMES),
      location_city: location.city,
      location_state: location.state,
      date: getISODate(-randomInt(7, 60)),
      start_time: `${randomInt(18, 21)}:00`,
      genre: genre,
      capacity: capacity,
      filled_slots: capacity, // Completed gigs are full
      payment_amount: randomInt(500, 2000),
      payment_type: randomChoice(['flat', 'hourly'] as const),
      urgency_flag: false,
      status: 'completed',
      created_at: getISOTimestamp(-randomInt(70, 120)),
      updated_at: getISOTimestamp(-randomInt(1, 6))
    })
  }

  // 15 upcoming gigs (open status, various dates)
  for (let i = 0; i < 15; i++) {
    const venue = randomChoice(venueUsers)
    const location = randomChoice(CITIES)
    const genre = randomChoice(GENRES)
    const capacity = randomInt(50, 500)
    const filledSlots = randomInt(0, Math.floor(capacity * 0.7))
    const daysUntil = randomInt(3, 60)
    const urgencyFlag = daysUntil <= 7 && (filledSlots / capacity) < 0.5

    gigs.push({
      id: generateId('gig'),
      venue_id: venue.id,
      title: `Live ${genre} Performance`,
      description: `Seeking ${genre.toLowerCase()} performers for an exciting night of live music. Professional sound and lighting provided.`,
      venue_name: randomChoice(VENUE_NAMES),
      location_city: location.city,
      location_state: location.state,
      date: getISODate(daysUntil),
      start_time: `${randomInt(19, 22)}:00`,
      genre: genre,
      capacity: capacity,
      filled_slots: filledSlots,
      payment_amount: randomInt(600, 2500),
      payment_type: randomChoice(['flat', 'hourly', 'negotiable'] as const),
      urgency_flag: urgencyFlag,
      status: 'open',
      created_at: getISOTimestamp(-randomInt(14, 45)),
      updated_at: getISOTimestamp(-randomInt(1, 13))
    })
  }

  // 3 pending gigs
  for (let i = 0; i < 3; i++) {
    const venue = randomChoice(venueUsers)
    const location = randomChoice(CITIES)
    const genre = randomChoice(GENRES)

    gigs.push({
      id: generateId('gig'),
      venue_id: venue.id,
      title: `${genre} Showcase`,
      description: `Multi-artist ${genre.toLowerCase()} showcase event. Looking for diverse acts.`,
      venue_name: randomChoice(VENUE_NAMES),
      location_city: location.city,
      location_state: location.state,
      date: getISODate(randomInt(30, 90)),
      start_time: `${randomInt(18, 20)}:00`,
      genre: genre,
      capacity: randomInt(100, 300),
      filled_slots: 0,
      payment_amount: randomInt(400, 1500),
      payment_type: 'flat',
      urgency_flag: false,
      status: 'open',
      created_at: getISOTimestamp(-randomInt(1, 7)),
      updated_at: getISOTimestamp(-randomInt(0, 3))
    })
  }

  // 2 cancelled gigs
  for (let i = 0; i < 2; i++) {
    const venue = randomChoice(venueUsers)
    const location = randomChoice(CITIES)

    gigs.push({
      id: generateId('gig'),
      venue_id: venue.id,
      title: `${randomChoice(GENRES)} Concert`,
      description: `Concert has been cancelled. Please check back for rescheduled date.`,
      venue_name: randomChoice(VENUE_NAMES),
      location_city: location.city,
      location_state: location.state,
      date: getISODate(randomInt(10, 30)),
      start_time: null,
      genre: randomChoice(GENRES),
      capacity: randomInt(100, 400),
      filled_slots: 0,
      payment_amount: null,
      payment_type: null,
      urgency_flag: false,
      status: 'cancelled',
      created_at: getISOTimestamp(-randomInt(15, 40)),
      updated_at: getISOTimestamp(-randomInt(1, 14))
    })
  }

  return gigs
}

// ============================================================================
// GENERATE CONVERSATIONS & MESSAGES
// ============================================================================

function generateConversationsAndMessages(users: User[]): { conversations: Conversation[], messages: Message[] } {
  const conversations: Conversation[] = []
  const messages: Message[] = []

  const MESSAGE_TEMPLATES = [
    "Hey! I saw your profile and would love to connect about potential collaborations.",
    "Thanks for reaching out! I'd be interested in hearing more about the gig.",
    "What's your availability for the upcoming show on",
    "I really enjoyed your recent performance! Would you be interested in opening for us?",
    "Just wanted to follow up on our conversation from last week.",
    "That sounds great! Let me check with my band and get back to you.",
    "Do you have any audio samples I could listen to?",
    "Here's the contract for the show. Let me know if you have any questions.",
    "Looking forward to working with you!",
    "What are your technical requirements for the performance?",
    "Can we discuss the payment terms?",
    "I'll send over the stage plot and rider shortly.",
    "What time do you need us for soundcheck?",
    "Perfect! I'll mark that on my calendar.",
    "Do you need help with promotion for the event?",
    "I can bring my own sound engineer if needed.",
    "How many tickets are you expecting to sell?",
    "This venue looks amazing! Can't wait to play there.",
    "I have a few questions about the parking situation.",
    "Would you be open to doing a longer set?"
  ]

  const LONG_MESSAGE = "I wanted to reach out because I've been following your work for a while now and I'm really impressed with your unique sound and stage presence. I'm organizing a festival this summer and I think you'd be a perfect fit for our lineup. We're expecting around 2,000 attendees and we have an amazing sound system and production team. The festival runs for three days and we'd love to have you perform on the main stage on Saturday evening, which is typically our biggest night. The compensation is competitive and we also cover travel and accommodation for all artists. I'd love to hop on a call sometime this week to discuss the details and answer any questions you might have. Let me know what works for your schedule!"

  // Create 10 conversations
  const conversationCount = Math.min(10, Math.floor(users.length / 2))

  for (let i = 0; i < conversationCount; i++) {
    const participant1 = users[i * 2]
    const participant2 = users[i * 2 + 1] || users[0]

    const conversationId = generateId('conv')
    const messageCount = randomInt(2, 8)
    const conversationMessages: Message[] = []

    // Generate messages for this conversation
    for (let j = 0; j < messageCount; j++) {
      const isLongMessage = j === 2 && Math.random() > 0.7
      const content = isLongMessage ? LONG_MESSAGE : randomChoice(MESSAGE_TEMPLATES)
      const sender = j % 2 === 0 ? participant1 : participant2
      const hasAttachment = Math.random() > 0.8

      const message: Message = {
        id: generateId('msg'),
        conversation_id: conversationId,
        sender_id: sender.id,
        content: content + (hasAttachment ? '' : ` - message ${j + 1}`),
        attachment_url: hasAttachment ? `https://storage.umbrella.app/messages/${generateId('file')}.pdf` : null,
        attachment_filename: hasAttachment ? 'contract.pdf' : null,
        attachment_size: hasAttachment ? randomInt(50000, 500000) : null,
        read: Math.random() > 0.3,
        created_at: getISOTimestamp(-randomInt(1, 30), -randomInt(0, 23))
      }

      conversationMessages.push(message)
      messages.push(message)
    }

    // Get last message for preview
    const lastMessage = conversationMessages[conversationMessages.length - 1]
    const lastMessagePreview = lastMessage.content.substring(0, 100)

    conversations.push({
      id: conversationId,
      participant_1_id: participant1.id,
      participant_2_id: participant2.id,
      last_message_at: lastMessage.created_at,
      last_message_preview: lastMessagePreview,
      unread_count_p1: randomInt(0, 3),
      unread_count_p2: randomInt(0, 3),
      created_at: conversationMessages[0].created_at,
      updated_at: lastMessage.created_at
    })
  }

  return { conversations, messages }
}

// ============================================================================
// GENERATE FILES & STORAGE QUOTAS
// ============================================================================

function generateFilesAndQuotas(artists: Artist[]): { files: File[], quotas: StorageQuota[] } {
  const files: File[] = []
  const quotas: StorageQuota[] = []

  // Generate files for first 10 artists
  for (let i = 0; i < Math.min(10, artists.length); i++) {
    const artist = artists[i]

    // 10 audio files (MP3s for tracks)
    for (let j = 0; j < 10; j++) {
      const fileSize = randomInt(3000000, 8000000) // 3-8 MB

      files.push({
        id: generateId('file'),
        artist_id: artist.id,
        filename: `track_${j + 1}.mp3`,
        file_size_bytes: fileSize,
        mime_type: 'audio/mpeg',
        r2_key: `artists/${artist.id}/music/track_${j + 1}.mp3`,
        category: 'music',
        created_at: getISOTimestamp(-randomInt(1, 90))
      })
    }

    // 5 images (profile pictures, promo photos)
    for (let j = 0; j < 5; j++) {
      const fileSize = randomInt(500000, 2000000) // 0.5-2 MB

      files.push({
        id: generateId('file'),
        artist_id: artist.id,
        filename: `photo_${j + 1}.jpg`,
        file_size_bytes: fileSize,
        mime_type: 'image/jpeg',
        r2_key: `artists/${artist.id}/photos/photo_${j + 1}.jpg`,
        category: 'press_photo',
        created_at: getISOTimestamp(-randomInt(1, 60))
      })
    }

    // 3 documents (EPKs, contracts)
    for (let j = 0; j < 3; j++) {
      const fileSize = randomInt(100000, 1000000) // 0.1-1 MB

      files.push({
        id: generateId('file'),
        artist_id: artist.id,
        filename: `document_${j + 1}.pdf`,
        file_size_bytes: fileSize,
        mime_type: 'application/pdf',
        r2_key: `artists/${artist.id}/documents/document_${j + 1}.pdf`,
        category: 'document',
        created_at: getISOTimestamp(-randomInt(1, 45))
      })
    }

    // Create storage quota - varied levels
    const quotaPercentage = [0.2, 0.4, 0.5, 0.7, 0.85, 0.9][i % 6] // 20%, 40%, 50%, 70%, 85%, 90%
    const limitBytes = 50 * 1024 * 1024 * 1024 // 50GB
    const usedBytes = Math.floor(limitBytes * quotaPercentage)

    quotas.push({
      artist_id: artist.id,
      used_bytes: usedBytes,
      limit_bytes: limitBytes,
      updated_at: getISOTimestamp(-randomInt(1, 7))
    })
  }

  // Add quotas for remaining artists (with minimal usage)
  for (let i = 10; i < artists.length; i++) {
    quotas.push({
      artist_id: artists[i].id,
      used_bytes: randomInt(1000000, 10000000), // 1-10 MB
      limit_bytes: 50 * 1024 * 1024 * 1024,
      updated_at: getISOTimestamp(-randomInt(1, 30))
    })
  }

  return { files, quotas }
}

// ============================================================================
// GENERATE REVIEWS
// ============================================================================

function generateReviews(artists: Artist[], users: User[]): Review[] {
  const reviews: Review[] = []

  const REVIEW_COMMENTS = [
    "Amazing performance! Really professional and engaging.",
    "Great artist to work with. Highly recommended!",
    "Phenomenal talent and very easy to communicate with.",
    "Incredible show! The crowd loved it.",
    "Very professional and punctual. Would book again.",
    "Outstanding performance. Perfect for our venue.",
    "Exceeded expectations. True professional.",
    "Great energy and sound quality. Highly recommend.",
    "Fantastic artist! Our audience was blown away.",
    "Professional, talented, and reliable. 5 stars!"
  ]

  // Generate reviews for artists with total_reviews > 0
  for (const artist of artists) {
    if (artist.total_reviews === 0) continue

    const reviewCount = Math.min(artist.total_reviews, 5) // Max 5 reviews per artist

    for (let i = 0; i < reviewCount; i++) {
      const reviewer = randomChoice(users)
      // Rating should average to artist's avg_rating
      const rating = Math.max(1, Math.min(5, Math.round(artist.avg_rating + (Math.random() - 0.5))))

      reviews.push({
        id: generateId('review'),
        artist_id: artist.id,
        reviewer_user_id: reviewer.id,
        reviewer_email: null,
        reviewer_name: null,
        rating: rating,
        comment: randomChoice(REVIEW_COMMENTS),
        created_at: getISOTimestamp(-randomInt(1, 120))
      })
    }
  }

  return reviews
}

// ============================================================================
// SQL GENERATION FUNCTIONS
// ============================================================================

function generateInsertSQL(table: string, records: Record<string, unknown>[]): string {
  if (records.length === 0) return ''

  const keys = Object.keys(records[0])
  const columns = keys.join(', ')

  const values = records.map(record => {
    const vals = keys.map(key => formatSQLValue(record[key]))
    return `(${vals.join(', ')})`
  }).join(',\n  ')

  return `INSERT INTO ${table} (${columns}) VALUES\n  ${values};\n`
}

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================

function generateSeedSQL(): string {
  console.log('🌱 Generating seed data...\n')

  // Generate all data
  console.log('📝 Generating users...')
  const users = generateUsers()

  console.log('🎨 Generating artists...')
  const artists = generateArtists(users)

  console.log('🎪 Generating gigs...')
  const gigs = generateGigs(users)

  console.log('💬 Generating conversations and messages...')
  const { conversations, messages } = generateConversationsAndMessages(users)

  console.log('📁 Generating files and storage quotas...')
  const { files, quotas } = generateFilesAndQuotas(artists)

  console.log('⭐ Generating reviews...')
  const reviews = generateReviews(artists, users)

  // Generate SQL
  console.log('\n📄 Generating SQL statements...\n')

  let sql = `-- ============================================================================
-- UMBRELLA MVP - COMPREHENSIVE SEED DATA
-- ============================================================================
-- Generated: ${new Date().toISOString()}
--
-- Summary:
-- - ${users.length} users (${users.filter(u => u.onboarding_complete).length} completed onboarding, ${users.filter(u => !u.onboarding_complete).length} incomplete)
-- - ${artists.length} artists
-- - ${gigs.length} gigs (${gigs.filter(g => g.status === 'completed').length} completed, ${gigs.filter(g => g.status === 'open').length} open)
-- - ${conversations.length} conversations
-- - ${messages.length} messages
-- - ${files.length} files
-- - ${quotas.length} storage quotas
-- - ${reviews.length} reviews
--
-- This script is IDEMPOTENT - it clears existing seed data before inserting new data.
-- ============================================================================

-- Clear existing seed data (in reverse dependency order)
DELETE FROM reviews;
DELETE FROM storage_quotas;
DELETE FROM files;
DELETE FROM messages;
DELETE FROM conversations;
DELETE FROM gig_applications;
DELETE FROM gig_favorites;
DELETE FROM gigs;
DELETE FROM tracks;
DELETE FROM artist_followers;
DELETE FROM artists;
DELETE FROM users;

-- ============================================================================
-- INSERT NEW DATA
-- ============================================================================

`

  sql += '\n-- Users\n'
  sql += generateInsertSQL('users', users)

  sql += '\n-- Artists\n'
  sql += generateInsertSQL('artists', artists)

  sql += '\n-- Gigs\n'
  sql += generateInsertSQL('gigs', gigs)

  sql += '\n-- Conversations\n'
  sql += generateInsertSQL('conversations', conversations)

  sql += '\n-- Messages\n'
  sql += generateInsertSQL('messages', messages)

  sql += '\n-- Files\n'
  sql += generateInsertSQL('files', files)

  sql += '\n-- Storage Quotas\n'
  sql += generateInsertSQL('storage_quotas', quotas)

  sql += '\n-- Reviews\n'
  sql += generateInsertSQL('reviews', reviews)

  sql += `
-- ============================================================================
-- SEED DATA COMPLETE
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
    const sql = generateSeedSQL()

    // Write to file
    const outputPath = join(__dirname, 'seed-output.sql')

    writeFileSync(outputPath, sql, 'utf8')

    console.log('✅ Seed data generated successfully!')
    console.log(`📁 Output: ${outputPath}`)
    console.log('\n💡 To apply this seed data, run:')
    console.log('   wrangler d1 execute umbrella-dev-db --local --file=db/seed-output.sql')
    console.log('   OR')
    console.log('   npm run seed\n')
  } catch (error) {
    console.error('❌ Error generating seed data:', error)
    process.exit(1)
  }
}

export { generateSeedSQL }
