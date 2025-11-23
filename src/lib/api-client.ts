/**
 * API Client for Umbrella
 * Handles authentication, error handling, and API communication
 */

import type { UserProfile, Artist, Gig, Conversation, Message } from '@/types'
import { getSession, clearSession } from '@/lib/session'
import { triggerSessionTimeout } from '@/contexts/SessionTimeoutContext'
import { 
  MOCK_ARTIST, 
  MOCK_GIGS, 
  MOCK_ARTISTS, 
  MOCK_CONVERSATIONS, 
  MOCK_MESSAGES, 
  MOCK_DASHBOARD_METRICS 
} from './mock-data'

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true'

// API Response wrapper type
interface APIResponse<T> {
  success: boolean
  data: T
  error?: {
    message: string
    code?: string
  }
}

// Type aliases for clarity
type ArtistPublicProfile = Artist
type UpdateArtistInput = Partial<Artist>

class APIClient {
  private baseURL = '/v1'
  private getToken: (() => Promise<string | null>) | null = null

  /**
   * Set the token getter function from Clerk
   */
  setTokenGetter(getToken: () => Promise<string | null>) {
    this.getToken = getToken
  }

  /**
   * Get request headers with JWT authentication
   */
  private async getHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (this.getToken) {
      const token = await this.getToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    } else {
      // Fallback to local storage for legacy/dev mode if needed
      const session = getSession()
      if (session?.token) {
        headers['Authorization'] = `Bearer ${session.token}`
      }
    }

    return headers
  }

  /**
   * Handle Mock Requests for Demo Mode
   */
  private async handleMockRequest<T>(endpoint: string): Promise<T> {
    console.log(`[Demo Mode] Mocking request to: ${endpoint}`)
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))

    if (endpoint.includes('/analytics/dashboard')) {
      return MOCK_DASHBOARD_METRICS as unknown as T
    }
    
    // Return empty arrays for unsupported list endpoints to prevent crashes
    if (endpoint.includes('/reviews') || endpoint.includes('/tracks') || endpoint.includes('/lists')) {
      return [] as unknown as T
    }

    if (endpoint.includes('/gigs')) {
      if (endpoint.includes('/gigs/')) {
        return MOCK_GIGS[0] as unknown as T
      }
      return {
        data: MOCK_GIGS,
        total: MOCK_GIGS.length,
        page: 1,
        limit: 20,
        has_more: false
      } as unknown as T
    }

    if (endpoint.includes('/artists')) {
      if (endpoint.includes('/artists/')) {
        return MOCK_ARTIST as unknown as T
      }
      return {
        data: MOCK_ARTISTS,
        total: MOCK_ARTISTS.length,
        page: 1,
        limit: 20,
        has_more: false
      } as unknown as T
    }

    if (endpoint.includes('/conversations')) {
      if (endpoint.includes('/messages')) {
        return MOCK_MESSAGES as unknown as T
      }
      return MOCK_CONVERSATIONS as unknown as T
    }

    if (endpoint.includes('/profile')) {
      return MOCK_ARTIST as unknown as T
    }

    // Default fallback
    return {} as T
  }

  /**
   * Make an authenticated API request
   */
  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    // Demo Mode Interception
    if (DEMO_MODE) {
      return this.handleMockRequest<T>(endpoint)
    }

    // Check if offline before making request
    if (!navigator.onLine) {
      throw new Error('You are offline. Please check your internet connection.')
    }

    const url = `${this.baseURL}${endpoint}`
    const authHeaders = await this.getHeaders()

    let response: Response
    try {
      response = await fetch(url, {
        ...options,
        headers: {
          ...authHeaders,
          ...options?.headers,
        },
      })
    } catch {
      // Network error - might be offline or server unreachable
      if (!navigator.onLine) {
        throw new Error('You are offline. Please check your internet connection.')
      }
      throw new Error('Failed to connect to server. Please try again later.')
    }

    // Handle 401 specially - trigger session timeout modal
    if (response.status === 401) {
      // Only clear legacy session, Clerk handles its own state
      clearSession()
      triggerSessionTimeout()
      throw new Error('Session expired. Please log in again.')
    }

    // Try to parse JSON
    let data: APIResponse<T>
    try {
      data = await response.json()
    } catch {
      throw new Error('Invalid JSON response')
    }

    // Handle API errors
    if (!data.success) {
      throw new Error(data.error?.message || 'Request failed')
    }

    return data.data as T
  }
  // ... rest of class ...

  // Auth endpoints
  async checkSession(): Promise<{ user: UserProfile; valid: boolean }> {
    return this.request<{ user: UserProfile; valid: boolean }>('/auth/session')
  }

  async logout(): Promise<void> {
    await this.request<void>('/auth/logout', {
      method: 'POST',
    })
  }

  // Profile endpoints (stubs for future implementation)
  async getProfile(): Promise<Artist> {
    return this.request<Artist>('/profile')
  }

  async updateProfile(data: UpdateArtistInput): Promise<Artist> {
    return this.request<Artist>('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // Marketplace endpoints (stubs for future implementation)
  async listGigs(): Promise<Gig[]> {
    return this.request<Gig[]>('/gigs')
  }

  async getGig(gigId: string): Promise<Gig> {
    return this.request<Gig>(`/gigs/${gigId}`)
  }

  async listArtists(): Promise<ArtistPublicProfile[]> {
    return this.request<ArtistPublicProfile[]>('/artists')
  }

  async getArtist(artistId: string): Promise<ArtistPublicProfile> {
    return this.request<ArtistPublicProfile>(`/artists/${artistId}`)
  }

  // Messaging endpoints (stubs for future implementation)
  async listConversations(): Promise<Conversation[]> {
    return this.request<Conversation[]>('/conversations')
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    return this.request<Message[]>(`/conversations/${conversationId}/messages`)
  }

  async sendMessage(conversationId: string, content: string): Promise<Message> {
    return this.request<Message>(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    })
  }

  // Search endpoints
  async search(
    query: string,
    type: 'artists' | 'gigs' | 'all' = 'all',
    limit: number = 20
  ): Promise<{
    artists: ArtistPublicProfile[]
    gigs: Gig[]
    artistCount: number
    gigCount: number
    totalCount: number
  }> {
    const params = new URLSearchParams({
      q: query,
      type,
      limit: limit.toString(),
    })
    return this.request<{
      artists: ArtistPublicProfile[]
      gigs: Gig[]
      artistCount: number
      gigCount: number
      totalCount: number
    }>(`/search?${params.toString()}`)
  }

  // Onboarding endpoints
  async submitOnboardingStep1(data: {
    stage_name: string
    location_city: string
    location_state: string
    location_zip?: string
    phone_number?: string
    legal_name?: string
    pronouns?: string
    inspirations?: string[]
    genre_primary?: string[]
  }): Promise<{ message: string; artist: any }> {
    return this.request<{ message: string; artist: any }>('/onboarding/artists/step1', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async submitOnboardingStep4(data: {
    largest_show_capacity: number
    base_rate_flat: number
    base_rate_hourly: number
    time_split_creative: number
    time_split_logistics: number
    available_dates: string[]
  }): Promise<{ message: string; artist: any }> {
    return this.request<{ message: string; artist: any }>('/onboarding/artists/step4', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async submitOnboardingStep5(data: {
    currently_making_music: boolean
    confident_online_presence: boolean
    struggles_creative_niche: boolean
    knows_where_find_gigs: boolean
    paid_fairly_performing: boolean
    understands_royalties: boolean
  }): Promise<{ message: string; artist: any }> {
    return this.request<{ message: string; artist: any }>('/onboarding/artists/step5', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Avatar upload endpoints
  async getAvatarUploadUrl(data: {
    filename: string
    fileSize: number
    contentType: string
  }): Promise<{
    uploadId: string
    uploadUrl: string
    fileKey: string
    expiresAt: string
    maxFileSize: number
  }> {
    return this.request<{
      uploadId: string
      uploadUrl: string
      fileKey: string
      expiresAt: string
      maxFileSize: number
    }>('/profile/avatar/upload', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async confirmAvatarUpload(uploadId: string): Promise<{
    message: string
    avatarUrl: string
    profile: Artist
  }> {
    return this.request<{
      message: string
      avatarUrl: string
      profile: Artist
    }>('/profile/avatar/confirm', {
      method: 'POST',
      body: JSON.stringify({ uploadId }),
    })
  }
}

// Export singleton instance
export const apiClient = new APIClient()

// Export endpoints map for reference
export const endpoints = {
  auth: {
    callback: '/v1/auth/callback',
    session: '/v1/auth/session',
    logout: '/v1/auth/logout',
  },
  profile: {
    get: '/v1/profile',
    update: '/v1/profile',
  },
  gigs: {
    list: '/v1/gigs',
    get: (id: string) => `/v1/gigs/${id}`,
    create: '/v1/gigs',
  },
  artists: {
    list: '/v1/artists',
    get: (id: string) => `/v1/artists/${id}`,
  },
  conversations: {
    list: '/v1/conversations',
    messages: (id: string) => `/v1/conversations/${id}/messages`,
  },
}
