/**
 * API Client for Umbrella
 * Handles authentication, error handling, and API communication
 */

import type {
  UserProfile,
  Artist,
  Gig,
  Conversation,
  Message,
  Track,
  ConnectionsListResponse,
  PendingRequestsResponse,
  SentRequestsResponse,
  ConnectionStatusResponse,
  MutualConnectionsResponse,
  NotificationsResponse,
  UnreadCountResponse,
} from '@/types'
import { getSession, clearSession } from '@/lib/session'
import { triggerSessionTimeout } from '@/contexts/SessionTimeoutContext'
import {
  MOCK_ARTIST,
  MOCK_GIGS,
  MOCK_ARTISTS,
  MOCK_CONVERSATIONS,
  MOCK_MESSAGES,
  MOCK_DASHBOARD_METRICS,
  MOCK_PERFORMANCE_DATA,
  MOCK_GOALS,
  MOCK_ACHIEVEMENTS,
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
  private async handleMockRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    console.log(`[Demo Mode] Mocking request to: ${endpoint}`)

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (endpoint.includes('/analytics/dashboard')) {
      return MOCK_DASHBOARD_METRICS as unknown as T
    }

    if (endpoint.includes('/analytics/performance')) {
      return MOCK_PERFORMANCE_DATA as unknown as T
    }

    if (endpoint.includes('/analytics/goals')) {
      return MOCK_GOALS as unknown as T
    }

    if (endpoint.includes('/analytics/achievements')) {
      return MOCK_ACHIEVEMENTS as unknown as T
    }

    if (endpoint.includes('/analytics')) {
      // Other analytics endpoints -> return arrays
      return [] as unknown as T
    }

    if (endpoint.includes('/files')) {
      // File usage, list -> return empty array or usage object
      if (endpoint.includes('/usage')) {
        return { used: 1024 * 1024 * 150, limit: 1024 * 1024 * 1024 * 5 } as unknown as T // 150MB used, 5GB limit
      }
      return [] as unknown as T
    }

    if (endpoint.includes('/journal')) {
      return { entries: [], count: 0 } as unknown as T
    }

    if (endpoint.includes('/violet')) {
      if (endpoint.includes('/usage')) {
        return {
          prompts_used_today: 5,
          prompts_limit: 50,
          reset_at: new Date().toISOString(),
        } as unknown as T
      }
      return { response: "I'm Violet, your AI assistant (Demo Mode)." } as unknown as T
    }

    // Return empty arrays/objects for unsupported list/action endpoints to prevent crashes
    if (
      endpoint.includes('/reviews') ||
      endpoint.includes('/tracks') ||
      endpoint.includes('/lists')
    ) {
      return [] as unknown as T
    }

    if (
      endpoint.includes('/apply') ||
      endpoint.includes('/follow') ||
      endpoint.includes('/unfollow') ||
      endpoint.includes('/read')
    ) {
      return { success: true } as unknown as T
    }

    if (endpoint.includes('/gigs')) {
      if (endpoint.includes('/gigs/')) {
        // Check if it's a specific gig ID
        return MOCK_GIGS[0] as unknown as T
      }
      return {
        data: MOCK_GIGS,
        total: MOCK_GIGS.length,
        page: 1,
        limit: 20,
        has_more: false,
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
        has_more: false,
      } as unknown as T
    }

    if (endpoint.includes('/conversations')) {
      if (endpoint.includes('/messages')) {
        return MOCK_MESSAGES as unknown as T
      }
      // Handle creating a new conversation
      if (options?.method === 'POST') {
        return MOCK_CONVERSATIONS[0] as unknown as T
      }

      // Handle getting a single conversation by ID
      // Check if endpoint ends with an ID (not just /conversations)
      const parts = endpoint.split('/')
      const lastPart = parts[parts.length - 1]
      if (lastPart !== 'conversations' && !lastPart.includes('?')) {
        return MOCK_CONVERSATIONS[0] as unknown as T
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
      return this.handleMockRequest<T>(endpoint, options)
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

  // Avatar upload endpoints
  /**
   * Upload profile avatar directly to R2 storage
   * @param file - The image file to upload
   * @returns The uploaded avatar URL and updated profile
   */
  async uploadProfileAvatar(file: File): Promise<{
    message: string
    avatarUrl: string
    profile: Artist
  }> {
    // Demo mode - simulate upload with null avatar (shows initials fallback)
    if (DEMO_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return {
        message: 'Avatar uploaded successfully',
        avatarUrl: '', // Demo mode shows initials fallback
        profile: MOCK_ARTIST,
      }
    }

    // Create FormData with the file
    const formData = new FormData()
    formData.append('file', file)

    // Get auth headers (without Content-Type - browser sets it for FormData)
    const headers: HeadersInit = {}
    if (this.getToken) {
      const token = await this.getToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    } else {
      const session = getSession()
      if (session?.token) {
        headers['Authorization'] = `Bearer ${session.token}`
      }
    }

    const response = await fetch(`${this.baseURL}/profile/avatar`, {
      method: 'POST',
      headers,
      body: formData,
    })

    if (response.status === 401) {
      clearSession()
      triggerSessionTimeout()
      throw new Error('Session expired. Please log in again.')
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error?.message || 'Failed to upload avatar')
    }

    return data.data
  }

  /**
   * Upload profile cover image directly to R2 storage
   * @param file - The image file to upload
   * @returns The uploaded cover URL and updated profile
   */
  async uploadProfileCover(file: File): Promise<{
    message: string
    coverUrl: string
    profile: Artist
  }> {
    // Demo mode - simulate upload with placeholder cover
    if (DEMO_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return {
        message: 'Cover image uploaded successfully',
        coverUrl: '', // Demo mode shows default gradient
        profile: MOCK_ARTIST,
      }
    }

    // Create FormData with the file
    const formData = new FormData()
    formData.append('file', file)

    // Get auth headers (without Content-Type - browser sets it for FormData)
    const headers: HeadersInit = {}
    if (this.getToken) {
      const token = await this.getToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    } else {
      const session = getSession()
      if (session?.token) {
        headers['Authorization'] = `Bearer ${session.token}`
      }
    }

    const response = await fetch(`${this.baseURL}/profile/cover`, {
      method: 'POST',
      headers,
      body: formData,
    })

    if (response.status === 401) {
      clearSession()
      triggerSessionTimeout()
      throw new Error('Session expired. Please log in again.')
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error?.message || 'Failed to upload cover image')
    }

    return data.data
  }

  /**
   * Upload file directly to R2 storage (for file manager)
   * @param file - The file to upload
   * @returns The uploaded file metadata
   */
  async uploadFile(file: File): Promise<{
    file: {
      id: string
      filename: string
      file_type: string
      file_size: number
      url: string
      category: string
      uploaded_at: string
    }
    success: boolean
  }> {
    // Demo mode - simulate upload
    if (DEMO_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return {
        file: {
          id: `mock-${Date.now()}`,
          filename: file.name,
          file_type: file.type,
          file_size: file.size,
          url: '/media/mock/file.png',
          category: 'other',
          uploaded_at: new Date().toISOString(),
        },
        success: true,
      }
    }

    // Create FormData with the file
    const formData = new FormData()
    formData.append('file', file)

    // Get auth headers (without Content-Type - browser sets it for FormData)
    const headers: HeadersInit = {}
    if (this.getToken) {
      const token = await this.getToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    } else {
      const session = getSession()
      if (session?.token) {
        headers['Authorization'] = `Bearer ${session.token}`
      }
    }

    const response = await fetch(`${this.baseURL}/files/direct`, {
      method: 'POST',
      headers,
      body: formData,
    })

    if (response.status === 401) {
      clearSession()
      triggerSessionTimeout()
      throw new Error('Session expired. Please log in again.')
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error?.message || 'Failed to upload file')
    }

    return data.data
  }

  /**
   * Upload a track directly to R2
   * Uses FormData to send file and metadata
   */
  async uploadTrack(
    file: File,
    metadata: { title: string; genre: string; cover_art_url?: string }
  ): Promise<{ track: Track; message: string }> {
    // Demo mode - simulate upload
    if (DEMO_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      return {
        message: 'Track uploaded successfully',
        track: {
          id: `mock-track-${Date.now()}`,
          artist_id: 'mock-artist',
          title: metadata.title,
          genre: metadata.genre,
          duration_seconds: 180,
          file_url: '/media/mock/track.mp3',
          cover_art_url: metadata.cover_art_url,
          play_count: 0,
          created_at: new Date().toISOString(),
        } as Track,
      }
    }

    // Create FormData with the file and metadata
    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', metadata.title)
    formData.append('genre', metadata.genre)
    if (metadata.cover_art_url) {
      formData.append('cover_art_url', metadata.cover_art_url)
    }

    // Get auth headers (without Content-Type - browser sets it for FormData)
    const headers: HeadersInit = {}
    if (this.getToken) {
      const token = await this.getToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    } else {
      const session = getSession()
      if (session?.token) {
        headers['Authorization'] = `Bearer ${session.token}`
      }
    }

    const response = await fetch(`${this.baseURL}/profile/tracks/direct`, {
      method: 'POST',
      headers,
      body: formData,
    })

    if (response.status === 401) {
      clearSession()
      triggerSessionTimeout()
      throw new Error('Session expired. Please log in again.')
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error?.message || 'Failed to upload track')
    }

    return data.data
  }

  // ============================================================================
  // CONNECTION ENDPOINTS (LinkedIn-style mutual connections)
  // ============================================================================

  /**
   * Send a connection request to another user
   */
  async sendConnectionRequest(userId: string): Promise<{
    message: string
    connectionId: string
    status: string
  }> {
    return this.request(`/connections/${userId}`, { method: 'POST' })
  }

  /**
   * Get list of accepted connections
   */
  async getConnections(params?: {
    limit?: number
    offset?: number
  }): Promise<ConnectionsListResponse> {
    const searchParams = new URLSearchParams()
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.offset) searchParams.set('offset', params.offset.toString())
    const query = searchParams.toString()
    return this.request(`/connections${query ? `?${query}` : ''}`)
  }

  /**
   * Get pending connection requests (received)
   */
  async getPendingRequests(): Promise<PendingRequestsResponse> {
    return this.request('/connections/pending')
  }

  /**
   * Get sent connection requests (outgoing pending)
   */
  async getSentRequests(): Promise<SentRequestsResponse> {
    return this.request('/connections/sent')
  }

  /**
   * Accept a connection request
   */
  async acceptConnectionRequest(requestId: string): Promise<{
    message: string
    connectionId: string
    status: string
  }> {
    return this.request(`/connections/${requestId}/accept`, { method: 'PUT' })
  }

  /**
   * Decline a connection request
   */
  async declineConnectionRequest(requestId: string): Promise<{
    message: string
    connectionId: string
    status: string
  }> {
    return this.request(`/connections/${requestId}/decline`, { method: 'PUT' })
  }

  /**
   * Cancel a sent connection request
   */
  async cancelConnectionRequest(requestId: string): Promise<{ message: string }> {
    return this.request(`/connections/${requestId}/cancel`, { method: 'DELETE' })
  }

  /**
   * Remove an existing connection
   */
  async removeConnection(userId: string): Promise<{ message: string }> {
    return this.request(`/connections/${userId}`, { method: 'DELETE' })
  }

  /**
   * Get connection status with a user
   */
  async getConnectionStatus(userId: string): Promise<ConnectionStatusResponse> {
    return this.request(`/connections/${userId}/status`)
  }

  /**
   * Get mutual connections with a user
   */
  async getMutualConnections(userId: string): Promise<MutualConnectionsResponse> {
    return this.request(`/connections/${userId}/mutual`)
  }

  // ============================================================================
  // NOTIFICATION ENDPOINTS
  // ============================================================================

  /**
   * Get notifications list
   */
  async getNotifications(params?: {
    limit?: number
    offset?: number
    unread_only?: boolean
  }): Promise<NotificationsResponse> {
    const searchParams = new URLSearchParams()
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.offset) searchParams.set('offset', params.offset.toString())
    if (params?.unread_only) searchParams.set('unread_only', 'true')
    const query = searchParams.toString()
    return this.request(`/notifications${query ? `?${query}` : ''}`)
  }

  /**
   * Get unread notification count
   */
  async getUnreadNotificationCount(): Promise<UnreadCountResponse> {
    return this.request('/notifications/count')
  }

  /**
   * Mark a notification as read
   */
  async markNotificationRead(notificationId: string): Promise<{ message: string; id: string }> {
    return this.request(`/notifications/${notificationId}/read`, { method: 'PUT' })
  }

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsRead(): Promise<{ message: string; count: number }> {
    return this.request('/notifications/read-all', { method: 'PUT' })
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<{ message: string; id: string }> {
    return this.request(`/notifications/${notificationId}`, { method: 'DELETE' })
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
  connections: {
    list: '/v1/connections',
    pending: '/v1/connections/pending',
    sent: '/v1/connections/sent',
    send: (userId: string) => `/v1/connections/${userId}`,
    accept: (requestId: string) => `/v1/connections/${requestId}/accept`,
    decline: (requestId: string) => `/v1/connections/${requestId}/decline`,
    cancel: (requestId: string) => `/v1/connections/${requestId}/cancel`,
    remove: (userId: string) => `/v1/connections/${userId}`,
    status: (userId: string) => `/v1/connections/${userId}/status`,
    mutual: (userId: string) => `/v1/connections/${userId}/mutual`,
  },
  notifications: {
    list: '/v1/notifications',
    count: '/v1/notifications/count',
    markRead: (id: string) => `/v1/notifications/${id}/read`,
    markAllRead: '/v1/notifications/read-all',
    delete: (id: string) => `/v1/notifications/${id}`,
  },
}
