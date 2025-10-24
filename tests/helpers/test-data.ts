/**
 * Test Helper: Test Data Factories
 * Provides factory functions for creating realistic test data
 */

import { generateUUID } from '../../api/utils/uuid'

/**
 * Create test user data
 */
export function createTestUser(overrides?: {
  email?: string
  oauth_provider?: 'google' | 'apple'
  oauth_id?: string
  onboarding_complete?: boolean
}) {
  const id = generateUUID()
  return {
    id,
    email: overrides?.email || `test-${id}@example.com`,
    oauth_provider: overrides?.oauth_provider || 'google',
    oauth_id: overrides?.oauth_id || `oauth-${id}`,
    onboarding_complete: overrides?.onboarding_complete ?? false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

/**
 * Create test artist profile data
 */
export function createTestArtist(userId: string, overrides?: Partial<any>) {
  const id = generateUUID()
  return {
    id,
    user_id: userId,
    artist_name: overrides?.artist_name || `Test Artist ${id.substring(0, 8)}`,
    genre_primary: overrides?.genre_primary || 'Rock',
    genre_secondary: overrides?.genre_secondary || null,
    location_city: overrides?.location_city || 'Los Angeles',
    location_state: overrides?.location_state || 'CA',
    location_country: overrides?.location_country || 'United States',
    bio: overrides?.bio || 'Test artist bio',
    profile_image_url: overrides?.profile_image_url || null,
    website_url: overrides?.website_url || null,
    instagram_handle: overrides?.instagram_handle || null,
    spotify_url: overrides?.spotify_url || null,
    apple_music_url: overrides?.apple_music_url || null,
    youtube_url: overrides?.youtube_url || null,
    soundcloud_url: overrides?.soundcloud_url || null,
    looking_for_gigs: overrides?.looking_for_gigs ?? true,
    looking_for_collaborators: overrides?.looking_for_collaborators ?? true,
    gigs_available_dates: overrides?.gigs_available_dates || null,
    years_experience: overrides?.years_experience || 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

/**
 * Create test gig data
 */
export function createTestGig(artistId: string, overrides?: Partial<any>) {
  const id = generateUUID()
  return {
    id,
    artist_id: artistId,
    title: overrides?.title || `Test Gig ${id.substring(0, 8)}`,
    description: overrides?.description || 'Looking for talented musicians for an upcoming show',
    gig_type: overrides?.gig_type || 'performance',
    genre_required: overrides?.genre_required || 'Rock',
    location_city: overrides?.location_city || 'Los Angeles',
    location_state: overrides?.location_state || 'CA',
    location_country: overrides?.location_country || 'United States',
    date_start: overrides?.date_start || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    date_end: overrides?.date_end || null,
    compensation_type: overrides?.compensation_type || 'paid',
    compensation_amount: overrides?.compensation_amount || 500,
    compensation_currency: overrides?.compensation_currency || 'USD',
    status: overrides?.status || 'open',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

/**
 * Create test track data
 */
export function createTestTrack(artistId: string, overrides?: Partial<any>) {
  const id = generateUUID()
  return {
    id,
    artist_id: artistId,
    title: overrides?.title || `Test Track ${id.substring(0, 8)}`,
    file_url: overrides?.file_url || `https://r2.example.com/tracks/${id}.mp3`,
    file_size_bytes: overrides?.file_size_bytes || 5242880, // 5MB
    file_format: overrides?.file_format || 'mp3',
    duration_seconds: overrides?.duration_seconds || 240,
    genre: overrides?.genre || 'Rock',
    bpm: overrides?.bpm || 120,
    key_signature: overrides?.key_signature || 'C Major',
    description: overrides?.description || null,
    sort_order: overrides?.sort_order || 0,
    play_count: overrides?.play_count || 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

/**
 * Create test message data
 */
export function createTestMessage(conversationId: string, senderId: string, overrides?: Partial<any>) {
  const id = generateUUID()
  return {
    id,
    conversation_id: conversationId,
    sender_id: senderId,
    content: overrides?.content || 'Test message content',
    read_at: overrides?.read_at || null,
    created_at: new Date().toISOString(),
    ...overrides,
  }
}

/**
 * Create test review data
 */
export function createTestReview(artistId: string, overrides?: Partial<any>) {
  const id = generateUUID()
  return {
    id,
    artist_id: artistId,
    reviewer_name: overrides?.reviewer_name || 'Test Reviewer',
    reviewer_email: overrides?.reviewer_email || `reviewer-${id.substring(0, 8)}@example.com`,
    rating: overrides?.rating || 5,
    review_text: overrides?.review_text || 'Excellent artist to work with!',
    invite_token: overrides?.invite_token || generateUUID(),
    status: overrides?.status || 'approved',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

/**
 * Create test file metadata
 */
export function createTestFile(artistId: string, overrides?: Partial<any>) {
  const id = generateUUID()
  return {
    id,
    artist_id: artistId,
    file_type: overrides?.file_type || 'image',
    file_name: overrides?.file_name || `test-image-${id.substring(0, 8)}.jpg`,
    file_size_bytes: overrides?.file_size_bytes || 1048576, // 1MB
    file_format: overrides?.file_format || 'jpg',
    r2_key: overrides?.r2_key || `files/${artistId}/${id}.jpg`,
    upload_status: overrides?.upload_status || 'completed',
    created_at: new Date().toISOString(),
    ...overrides,
  }
}

/**
 * Create onboarding step 1 data (Role Selection)
 */
export function createOnboardingStep1Data(overrides?: Partial<any>) {
  return {
    role: overrides?.role || 'artist',
    ...overrides,
  }
}

/**
 * Create onboarding step 2 data (Basic Info)
 */
export function createOnboardingStep2Data(overrides?: Partial<any>) {
  return {
    artist_name: overrides?.artist_name || 'Test Artist',
    genre_primary: overrides?.genre_primary || 'Rock',
    genre_secondary: overrides?.genre_secondary || 'Alternative',
    location_city: overrides?.location_city || 'Los Angeles',
    location_state: overrides?.location_state || 'CA',
    location_country: overrides?.location_country || 'United States',
    ...overrides,
  }
}

/**
 * Create onboarding step 3 data (Bio & Links)
 */
export function createOnboardingStep3Data(overrides?: Partial<any>) {
  return {
    bio: overrides?.bio || 'Passionate musician with years of experience in Rock music.',
    website_url: overrides?.website_url || 'https://example.com',
    instagram_handle: overrides?.instagram_handle || '@testartist',
    spotify_url: overrides?.spotify_url || 'https://open.spotify.com/artist/test',
    ...overrides,
  }
}

/**
 * Create onboarding step 4 data (What You're Looking For)
 */
export function createOnboardingStep4Data(overrides?: Partial<any>) {
  return {
    looking_for_gigs: overrides?.looking_for_gigs ?? true,
    looking_for_collaborators: overrides?.looking_for_collaborators ?? true,
    gigs_available_dates: overrides?.gigs_available_dates || 'Weekends in June-August',
    years_experience: overrides?.years_experience || 5,
    ...overrides,
  }
}

/**
 * Create onboarding step 5 data (Profile Image)
 */
export function createOnboardingStep5Data(overrides?: Partial<any>) {
  return {
    profile_image_url: overrides?.profile_image_url || 'https://r2.example.com/profiles/test-artist.jpg',
    ...overrides,
  }
}

/**
 * Create complete onboarding data (all steps)
 */
export function createCompleteOnboardingData(overrides?: {
  step1?: Partial<any>
  step2?: Partial<any>
  step3?: Partial<any>
  step4?: Partial<any>
  step5?: Partial<any>
}) {
  return {
    step1: createOnboardingStep1Data(overrides?.step1),
    step2: createOnboardingStep2Data(overrides?.step2),
    step3: createOnboardingStep3Data(overrides?.step3),
    step4: createOnboardingStep4Data(overrides?.step4),
    step5: createOnboardingStep5Data(overrides?.step5),
  }
}

/**
 * Wait for a specified time (for testing async operations)
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Create a large text payload for testing character limits
 */
export function createLargeText(length: number): string {
  const base = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '
  return base.repeat(Math.ceil(length / base.length)).substring(0, length)
}

/**
 * Generate random date within a range
 */
export function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}
