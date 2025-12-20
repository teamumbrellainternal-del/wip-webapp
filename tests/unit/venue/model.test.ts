/**
 * Unit Tests for Venue Model
 * Tests the venue model transform functions
 */

import { describe, it, expect } from 'vitest'
import {
  toVenueProfileResponse,
  toPublicVenueProfile,
  type Venue,
} from '../../../api/models/venue'

describe('Venue Model', () => {
  // Sample database venue record
  const createDbVenue = (overrides?: Partial<Venue>): Venue => ({
    id: 'venue-123',
    user_id: 'user-456',
    name: 'The Blue Note',
    tagline: 'Jazz lives here',
    venue_type: 'club',
    address_line1: '123 Main St',
    address_line2: 'Suite 100',
    city: 'New York',
    state: 'NY',
    zip_code: '10001',
    country: 'US',
    capacity: 500,
    standing_capacity: 400,
    seated_capacity: 100,
    stage_size: 'medium',
    sound_system: 'Bose L1 Pro',
    has_green_room: 1, // SQLite boolean
    has_parking: 0, // SQLite boolean
    status: 'open_for_bookings',
    booking_lead_days: 14,
    preferred_genres: JSON.stringify(['Jazz', 'Blues', 'Soul']),
    avatar_url: 'https://example.com/avatar.jpg',
    cover_url: 'https://example.com/cover.jpg',
    verified: 1, // SQLite boolean
    events_hosted: 150,
    total_artists_booked: 75,
    created_at: '2024-01-15T10:00:00.000Z',
    updated_at: '2024-06-20T15:30:00.000Z',
    ...overrides,
  })

  describe('toVenueProfileResponse', () => {
    it('should transform DB row to API response correctly', () => {
      const dbVenue = createDbVenue()
      const response = toVenueProfileResponse(dbVenue)

      expect(response.id).toBe('venue-123')
      expect(response.user_id).toBe('user-456')
      expect(response.name).toBe('The Blue Note')
      expect(response.tagline).toBe('Jazz lives here')
      expect(response.venue_type).toBe('club')
      expect(response.city).toBe('New York')
      expect(response.state).toBe('NY')
      expect(response.capacity).toBe(500)
      expect(response.stage_size).toBe('medium')
      expect(response.status).toBe('open_for_bookings')
      expect(response.booking_lead_days).toBe(14)
      expect(response.events_hosted).toBe(150)
      expect(response.total_artists_booked).toBe(75)
      expect(response.created_at).toBe('2024-01-15T10:00:00.000Z')
      expect(response.updated_at).toBe('2024-06-20T15:30:00.000Z')
    })

    it('should convert SQLite boolean (1) to JavaScript true', () => {
      const dbVenue = createDbVenue({
        has_green_room: 1,
        has_parking: 1,
        verified: 1,
      })
      const response = toVenueProfileResponse(dbVenue)

      expect(response.has_green_room).toBe(true)
      expect(response.has_parking).toBe(true)
      expect(response.verified).toBe(true)
    })

    it('should convert SQLite boolean (0) to JavaScript false', () => {
      const dbVenue = createDbVenue({
        has_green_room: 0,
        has_parking: 0,
        verified: 0,
      })
      const response = toVenueProfileResponse(dbVenue)

      expect(response.has_green_room).toBe(false)
      expect(response.has_parking).toBe(false)
      expect(response.verified).toBe(false)
    })

    it('should parse JSON preferred_genres string to array', () => {
      const dbVenue = createDbVenue({
        preferred_genres: JSON.stringify(['Rock', 'Indie', 'Alternative']),
      })
      const response = toVenueProfileResponse(dbVenue)

      expect(response.preferred_genres).toEqual(['Rock', 'Indie', 'Alternative'])
    })

    it('should return empty array when preferred_genres is null', () => {
      const dbVenue = createDbVenue({
        preferred_genres: null,
      })
      const response = toVenueProfileResponse(dbVenue)

      expect(response.preferred_genres).toEqual([])
    })

    it('should preserve null values for optional fields', () => {
      const dbVenue = createDbVenue({
        tagline: null,
        venue_type: null,
        address_line2: null,
        avatar_url: null,
        cover_url: null,
      })
      const response = toVenueProfileResponse(dbVenue)

      expect(response.tagline).toBeNull()
      expect(response.venue_type).toBeNull()
      expect(response.address_line2).toBeNull()
      expect(response.avatar_url).toBeNull()
      expect(response.cover_url).toBeNull()
    })
  })

  describe('toPublicVenueProfile', () => {
    it('should include only public fields', () => {
      const dbVenue = createDbVenue()
      const publicProfile = toPublicVenueProfile(dbVenue)

      // Public fields should be present
      expect(publicProfile.id).toBe('venue-123')
      expect(publicProfile.name).toBe('The Blue Note')
      expect(publicProfile.tagline).toBe('Jazz lives here')
      expect(publicProfile.venue_type).toBe('club')
      expect(publicProfile.city).toBe('New York')
      expect(publicProfile.state).toBe('NY')
      expect(publicProfile.capacity).toBe(500)
      expect(publicProfile.stage_size).toBe('medium')
      expect(publicProfile.status).toBe('open_for_bookings')
      expect(publicProfile.avatar_url).toBe('https://example.com/avatar.jpg')
      expect(publicProfile.cover_url).toBe('https://example.com/cover.jpg')
      expect(publicProfile.verified).toBe(true)
      expect(publicProfile.events_hosted).toBe(150)
      expect(publicProfile.total_artists_booked).toBe(75)
    })

    it('should omit sensitive fields from public profile', () => {
      const dbVenue = createDbVenue()
      const publicProfile = toPublicVenueProfile(dbVenue)

      // These fields should NOT be in the public profile
      expect('user_id' in publicProfile).toBe(false)
      expect('address_line1' in publicProfile).toBe(false)
      expect('address_line2' in publicProfile).toBe(false)
      expect('zip_code' in publicProfile).toBe(false)
      expect('country' in publicProfile).toBe(false)
      expect('standing_capacity' in publicProfile).toBe(false)
      expect('seated_capacity' in publicProfile).toBe(false)
      expect('sound_system' in publicProfile).toBe(false)
      expect('has_green_room' in publicProfile).toBe(false)
      expect('has_parking' in publicProfile).toBe(false)
      expect('booking_lead_days' in publicProfile).toBe(false)
      expect('preferred_genres' in publicProfile).toBe(false)
      expect('created_at' in publicProfile).toBe(false)
      expect('updated_at' in publicProfile).toBe(false)
    })

    it('should convert verified SQLite boolean to JavaScript boolean', () => {
      const verifiedVenue = createDbVenue({ verified: 1 })
      const unverifiedVenue = createDbVenue({ verified: 0 })

      expect(toPublicVenueProfile(verifiedVenue).verified).toBe(true)
      expect(toPublicVenueProfile(unverifiedVenue).verified).toBe(false)
    })
  })
})

