/**
 * API Service Layer for Umbrella MVP
 * Organized service functions for all backend endpoints
 *
 * NOTE: Use these services directly in your hooks/components, not browser fetch
 */

import { apiClient } from '@/lib/api-client'
import type {
  UserProfile,
  Artist,
  ArtistSearchParams,
  Gig,
  GigSearchParams,
  Conversation,
  Message,
  Track,
  Review,
  DashboardMetrics,
  PerformanceData,
  Goal,
  Achievement,
  VioletResponse,
  VioletUsage,
  VioletConversation,
  VioletMessage,
  VioletConversationListItem,
  VioletSendMessageResponse,
  FileMetadata,
  FileUploadResponse,
  OnboardingStep1Data,
  OnboardingStep2Data,
  OnboardingStep3Data,
  OnboardingStep4Data,
  OnboardingStep5Data,
  PaginatedResponse,
  ContactList,
  Contact,
  BroadcastMessage,
  BroadcastRequest,
  BroadcastResponse,
  JournalEntry,
  JournalEntriesResponse,
  JournalEntryType,
  CreateJournalEntryRequest,
  UpdateJournalEntryRequest,
} from '@/types'

// ============================================================================
// API REQUEST HELPER
// ============================================================================

/**
 * Wrapper around apiClient for cleaner service definitions
 * Handles GET, POST, PUT, PATCH, DELETE requests with type safety
 */
async function apiRequest<T>(
  endpoint: string,
  options?: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    body?: unknown
    params?: Record<string, string | number | boolean | string[] | undefined>
  }
): Promise<T> {
  const { method = 'GET', body, params } = options || {}

  // Build query string from params
  let url = endpoint
  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach((v) => searchParams.append(key, String(v)))
        } else {
          searchParams.append(key, String(value))
        }
      }
    })
    const queryString = searchParams.toString()
    if (queryString) {
      url = `${endpoint}?${queryString}`
    }
  }

  // Make the request using apiClient's private request method
  // We need to access it via bracket notation since it's private
  return (apiClient as any).request(url, {
    method,
    body: body ? JSON.stringify(body) : undefined,
  }) as Promise<T>
}

// ============================================================================
// ANALYTICS SERVICES
// ============================================================================

export const analyticsService = {
  /**
   * Get dashboard metrics (updated daily at midnight UTC - D-008)
   */
  getDashboard: () => apiClient['request']<DashboardMetrics>('/analytics/dashboard'),

  /**
   * Get performance data for charts
   */
  getPerformance: (period: 'monthly' | 'yearly') =>
    apiRequest<PerformanceData>('/analytics/performance', {
      method: 'GET',
      params: { period },
    }),

  /**
   * Get user goals
   */
  getGoals: () => apiClient['request']<Goal[]>('/analytics/goals'),

  /**
   * Create a new goal
   */
  createGoal: (data: {
    title: string
    description?: string
    target_value: number
    goal_type: 'earnings' | 'gigs' | 'followers' | 'tracks' | 'custom'
    target_date?: string
  }) =>
    apiRequest<Goal>('/analytics/goals', {
      method: 'POST',
      body: data,
    }),

  /**
   * Update a goal
   */
  updateGoal: (
    id: string,
    data: {
      title?: string
      description?: string
      target_value?: number
      current_value?: number
      target_date?: string
      completed?: boolean
    }
  ) =>
    apiRequest<Goal>(`/analytics/goals/${id}`, {
      method: 'PUT',
      body: data,
    }),

  /**
   * Delete a goal
   */
  deleteGoal: (id: string) =>
    apiRequest<{ message: string; id: string }>(`/analytics/goals/${id}`, {
      method: 'DELETE',
    }),

  /**
   * Get user achievements
   */
  getAchievements: () => apiClient['request']<Achievement[]>('/analytics/achievements'),
}

// ============================================================================
// ARTISTS SERVICES
// ============================================================================

export const artistsService = {
  /**
   * Search/list artists with filters
   */
  search: (params: ArtistSearchParams) =>
    apiRequest<PaginatedResponse<Artist>>('/artists', {
      params: params as Record<string, string | number | boolean | string[] | undefined>,
    }),

  /**
   * Get artist profile by ID
   */
  getById: (id: string) => apiRequest<Artist>(`/artists/${id}`),

  /**
   * Update artist profile (own profile only)
   */
  update: (id: string, data: Partial<Artist>) =>
    apiRequest<Artist>(`/artists/${id}`, {
      method: 'PATCH',
      body: data,
    }),

  /**
   * Get artist's tracks
   */
  getTracks: (id: string) => apiRequest<Track[]>(`/artists/${id}/tracks`),

  /**
   * Get artist's reviews
   */
  getReviews: (id: string) => apiRequest<Review[]>(`/artists/${id}/reviews`),

  /**
   * Get follow status for an artist
   */
  getFollowStatus: (id: string) =>
    apiRequest<{ artistId: string; is_following: boolean; follower_count: number }>(
      `/artists/${id}/follow`
    ),

  /**
   * Follow an artist
   */
  follow: (id: string) =>
    apiRequest<{ artistId: string; is_following: boolean; follower_count: number }>(
      `/artists/${id}/follow`,
      {
        method: 'POST',
      }
    ),

  /**
   * Unfollow an artist
   */
  unfollow: (id: string) =>
    apiRequest<{ artistId: string; is_following: boolean; follower_count: number }>(
      `/artists/${id}/follow`,
      {
        method: 'DELETE',
      }
    ),
}

// ============================================================================
// GIGS SERVICES
// ============================================================================

export const gigsService = {
  /**
   * Search/list gigs with filters
   */
  search: (params: GigSearchParams) =>
    apiRequest<PaginatedResponse<Gig>>('/gigs', {
      params: params as Record<string, string | number | boolean | string[] | undefined>,
    }),

  /**
   * Get gig details by ID
   */
  getById: (id: string) => apiRequest<Gig>(`/gigs/${id}`),

  /**
   * Create a new gig (Venue Owners)
   */
  create: (data: {
    title: string
    description?: string
    venue_name: string
    location_city: string
    location_state: string
    location_address?: string
    location_zip?: string
    date: string
    start_time?: string
    end_time?: string
    genre?: string
    capacity?: number
    payment_amount?: number
    payment_type?: 'flat' | 'hourly' | 'negotiable'
  }) =>
    apiRequest<{ message: string; id: string }>('/gigs', {
      method: 'POST',
      body: data,
    }),

  /**
   * Update a gig (Venue Owners - own gigs only)
   */
  update: (
    id: string,
    data: {
      title?: string
      description?: string
      venue_name?: string
      location_city?: string
      location_state?: string
      location_address?: string
      location_zip?: string
      date?: string
      start_time?: string
      end_time?: string
      genre?: string
      capacity?: number
      payment_amount?: number
      payment_type?: 'flat' | 'hourly' | 'negotiable'
    }
  ) =>
    apiRequest<{ message: string; id: string }>(`/gigs/${id}`, {
      method: 'PUT',
      body: data,
    }),

  /**
   * Delete/Cancel a gig (Venue Owners - own gigs only)
   */
  delete: (id: string) =>
    apiRequest<{ message: string; id: string }>(`/gigs/${id}`, {
      method: 'DELETE',
    }),

  /**
   * Get my posted gigs (Venue Owners)
   */
  getMyGigs: () => apiRequest<{ gigs: any[] }>('/gigs/mine'),

  /**
   * Get applications for a specific gig (Venue Owners - own gigs only)
   */
  getApplications: (id: string) => apiRequest<{ applications: any[] }>(`/gigs/${id}/applications`),

  /**
   * Update application status - accept or reject (Venue Owners)
   */
  updateApplicationStatus: (gigId: string, appId: string, status: 'accepted' | 'rejected') =>
    apiRequest<{ message: string; applicationId: string; status: string }>(
      `/gigs/${gigId}/applications/${appId}`,
      {
        method: 'PUT',
        body: { status },
      }
    ),

  /**
   * Get my gig applications (Artists)
   */
  getMyApplications: () => apiRequest<{ applications: any[] }>('/gigs/applications'),

  /**
   * Apply to a gig (D-077: Single-click apply)
   */
  apply: (id: string) =>
    apiRequest<void>(`/gigs/${id}/apply`, {
      method: 'POST',
    }),

  /**
   * Withdraw application from a gig (Artists)
   */
  withdrawApplication: (id: string) =>
    apiRequest<{ message: string; gigId: string }>(`/gigs/${id}/apply`, {
      method: 'DELETE',
    }),
}

// ============================================================================
// MESSAGES SERVICES
// ============================================================================

export const messagesService = {
  /**
   * Get all conversations
   */
  getConversations: () => apiRequest<Conversation[]>('/conversations'),

  /**
   * Get conversation thread with messages
   */
  getThread: (id: string) => apiRequest<Conversation>(`/conversations/${id}`),

  /**
   * Send a message (D-043: 2000 char limit, D-087: No rate limits)
   */
  sendMessage: (conversationId: string, content: string, attachments?: string[]) =>
    apiRequest<Message>(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: { content, attachments },
    }),

  /**
   * Mark conversation as read
   */
  markAsRead: (conversationId: string) =>
    apiRequest<void>(`/conversations/${conversationId}/read`, {
      method: 'POST',
    }),

  /**
   * Start a new conversation (e.g., from "Book Artist" - D-076)
   */
  startConversation: (params: {
    participant_id: string
    context_type: 'artist' | 'venue' | 'producer' | 'band'
    initial_message?: string
  }) =>
    apiRequest<{
      conversation: Conversation & {
        otherParticipant?: {
          userId: string
          email: string
          artistId: string | null
          name: string
          avatarUrl: string | null
          type: string
        }
      }
      isNew: boolean
      initialMessageId?: string | null
    }>('/conversations', {
      method: 'POST',
      body: params,
    }),
}

// ============================================================================
// ONBOARDING SERVICES
// ============================================================================

export const onboardingService = {
  /**
   * Start onboarding process
   */
  start: () =>
    apiRequest<void>('/onboarding/start', {
      method: 'POST',
    }),

  /**
   * Update onboarding Step 1: Identity & Basics
   */
  updateStep1: (data: OnboardingStep1Data) =>
    apiRequest<void>('/onboarding/step/1', {
      method: 'PATCH',
      body: data,
    }),

  /**
   * Update onboarding Step 2: Links & Your Story
   */
  updateStep2: (data: OnboardingStep2Data) =>
    apiRequest<void>('/onboarding/step/2', {
      method: 'PATCH',
      body: data,
    }),

  /**
   * Update onboarding Step 3: Creative Profile Tags
   */
  updateStep3: (data: OnboardingStep3Data) =>
    apiRequest<void>('/onboarding/step/3', {
      method: 'PATCH',
      body: data,
    }),

  /**
   * Update onboarding Step 4: Your Numbers
   */
  updateStep4: (data: OnboardingStep4Data) =>
    apiRequest<void>('/onboarding/step/4', {
      method: 'PATCH',
      body: data,
    }),

  /**
   * Update onboarding Step 5: Quick Questions
   */
  updateStep5: (data: OnboardingStep5Data) =>
    apiRequest<void>('/onboarding/step/5', {
      method: 'PATCH',
      body: data,
    }),

  /**
   * Complete onboarding (D-003: All 5 steps required)
   */
  complete: () =>
    apiRequest<void>('/onboarding/complete', {
      method: 'POST',
    }),

  /**
   * Get current onboarding status
   */
  getStatus: () =>
    apiRequest<{
      completed: boolean
      current_step: number
      total_steps: number
    }>('/onboarding/status'),
}

// ============================================================================
// PROFILE SERVICES
// ============================================================================

export const profileService = {
  /**
   * Get current user profile
   */
  getCurrent: () => apiRequest<UserProfile>('/profile'),

  /**
   * Update current user profile
   */
  update: (data: Partial<UserProfile>) =>
    apiRequest<UserProfile>('/profile', {
      method: 'PATCH',
      body: data,
    }),

  /**
   * Upload profile avatar
   */
  uploadAvatar: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiRequest<{ avatar_url: string }>('/profile/avatar', {
      method: 'POST',
      body: formData as unknown as Record<string, unknown>,
    })
  },

  /**
   * Upload profile banner
   */
  uploadBanner: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiRequest<{ banner_url: string }>('/profile/banner', {
      method: 'POST',
      body: formData as unknown as Record<string, unknown>,
    })
  },

  /**
   * Delete account (D-102: Self-service deletion)
   */
  deleteAccount: () =>
    apiRequest<void>('/profile', {
      method: 'DELETE',
    }),
}

// ============================================================================
// VIOLET AI SERVICES
// ============================================================================

export const violetService = {
  /**
   * Send prompt to Violet AI (D-062: 50 prompts/day limit)
   * Legacy endpoint - kept for backward compatibility (MessageFansPage)
   */
  sendPrompt: (prompt: string, context?: Record<string, unknown>) =>
    apiRequest<VioletResponse>('/violet/prompt', {
      method: 'POST',
      body: { prompt, context },
    }),

  /**
   * Get daily usage stats
   */
  getUsage: () => apiRequest<VioletUsage>('/violet/usage'),

  /**
   * Get Violet toolkit categories
   */
  getCategories: () =>
    apiRequest<
      Array<{
        id: string
        name: string
        description: string
        tools: Array<{
          id: string
          name: string
          description: string
        }>
      }>
    >('/violet/categories'),

  // ============================================================================
  // CONVERSATION ENDPOINTS (Chat Interface)
  // ============================================================================

  /**
   * List user's conversations
   */
  getConversations: (page = 1, limit = 20) =>
    apiRequest<{
      conversations: VioletConversationListItem[]
      pagination: { page: number; limit: number; total: number; hasMore: boolean }
    }>(`/violet/conversations?page=${page}&limit=${limit}`),

  /**
   * Create a new conversation
   */
  createConversation: (title?: string) =>
    apiRequest<{ conversation: VioletConversation }>('/violet/conversations', {
      method: 'POST',
      body: { title },
    }),

  /**
   * Get a conversation with its messages
   */
  getConversation: (conversationId: string) =>
    apiRequest<{ conversation: VioletConversation; messages: VioletMessage[] }>(
      `/violet/conversations/${conversationId}`
    ),

  /**
   * Send a message in a conversation
   */
  sendMessage: (conversationId: string, content: string, context?: string) =>
    apiRequest<VioletSendMessageResponse>(`/violet/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: { content, context },
    }),
}

// ============================================================================
// FILES SERVICES
// ============================================================================

export const filesService = {
  /**
   * Upload file to R2 (D-026: No upload limit, 50GB quota)
   * Uses direct upload endpoint (like avatar upload)
   * Sends FormData to backend which handles R2 upload internally
   */
  upload: async (file: File): Promise<FileUploadResponse> => {
    // Use apiClient's uploadFile method which handles FormData correctly
    return apiClient.uploadFile(file)
  },

  /**
   * List all user files
   */
  list: (params?: { type?: string; page?: number; limit?: number }) =>
    apiRequest<PaginatedResponse<FileMetadata>>('/files', { params }),

  /**
   * Get file metadata by ID
   */
  getById: (id: string) => apiRequest<FileMetadata>(`/files/${id}`),

  /**
   * Delete file
   */
  delete: (id: string) =>
    apiRequest<void>(`/files/${id}`, {
      method: 'DELETE',
    }),

  /**
   * Get storage usage stats
   */
  getStorageUsage: () =>
    apiRequest<{
      used_bytes: number
      total_bytes: number
      percentage: number
    }>('/files/storage'),
}

// ============================================================================
// MEDIA SERVICES (Explore Gallery)
// ============================================================================

export interface MediaItem {
  id: string
  filename: string
  file_type: string
  file_size: number
  url: string
  category: string
  uploaded_at: string
}

export const mediaService = {
  /**
   * Get public media (images/videos) for an artist's Explore gallery
   */
  getArtistMedia: (artistId: string) =>
    apiRequest<{ media: MediaItem[] }>(`/profile/${artistId}/media`),
}

// ============================================================================
// TRACKS SERVICES
// ============================================================================

export const tracksService = {
  /**
   * Get all tracks for the current user
   */
  list: () => apiRequest<Track[]>('/tracks'),

  /**
   * Get tracks for a specific artist (public)
   */
  getByArtist: (artistId: string) => apiRequest<Track[]>(`/profile/${artistId}/tracks`),

  /**
   * Upload a track (D-028: Manual upload only for MVP)
   * Uses apiClient.uploadTrack which handles FormData properly
   */
  upload: async (
    file: File,
    metadata: {
      title: string
      genre: string
      cover_art_url?: string
    }
  ): Promise<Track> => {
    const result = await apiClient.uploadTrack(file, {
      title: metadata.title,
      genre: metadata.genre,
    })
    return result.track
  },

  /**
   * Get track by ID
   */
  getById: (id: string) => apiRequest<Track>(`/tracks/${id}`),

  /**
   * Update track metadata
   */
  update: (id: string, data: Partial<Track>) =>
    apiRequest<Track>(`/tracks/${id}`, {
      method: 'PATCH',
      body: data,
    }),

  /**
   * Delete track
   */
  delete: (id: string) =>
    apiRequest<void>(`/tracks/${id}`, {
      method: 'DELETE',
    }),

  /**
   * Increment play count (D-024: Inline playback tracking)
   */
  recordPlay: (id: string) =>
    apiRequest<void>(`/tracks/${id}/play`, {
      method: 'POST',
    }),
}

// ============================================================================
// REVIEWS SERVICES
// ============================================================================

export const reviewsService = {
  /**
   * Submit a review (D-032: Email invitations)
   */
  create: (
    artistId: string,
    data: {
      rating: number
      comment: string
      gig_id?: string
    }
  ) =>
    apiRequest<Review>(`/artists/${artistId}/reviews`, {
      method: 'POST',
      body: data,
    }),

  /**
   * Update review
   */
  update: (
    reviewId: string,
    data: {
      rating?: number
      comment?: string
    }
  ) =>
    apiRequest<Review>(`/reviews/${reviewId}`, {
      method: 'PATCH',
      body: data,
    }),

  /**
   * Delete review
   */
  delete: (reviewId: string) =>
    apiRequest<void>(`/reviews/${reviewId}`, {
      method: 'DELETE',
    }),
}

// ============================================================================
// SEARCH SERVICES
// ============================================================================

export const searchService = {
  /**
   * Global search (D-071: Artists + Gigs only)
   */
  global: (query: string, type?: 'artists' | 'gigs' | 'all') =>
    apiRequest<{
      artists: Artist[]
      gigs: Gig[]
    }>('/search', {
      params: { query, type },
    }),
}

// ============================================================================
// SETTINGS SERVICES
// ============================================================================

export const settingsService = {
  /**
   * Get user settings
   */
  get: () =>
    apiRequest<{
      notifications: {
        email: boolean
        push: boolean
        sms: boolean
      }
      privacy: {
        profile_visibility: 'public' | 'private'
        show_gig_history: boolean
        show_earnings: boolean
      }
    }>('/settings'),

  /**
   * Update user settings
   */
  update: (data: {
    notifications?: {
      email?: boolean
      push?: boolean
      sms?: boolean
    }
    privacy?: {
      profile_visibility?: 'public' | 'private'
      show_gig_history?: boolean
      show_earnings?: boolean
    }
  }) =>
    apiRequest<void>('/settings', {
      method: 'PATCH',
      body: data,
    }),
}

// ============================================================================
// CONTACTS SERVICES
// ============================================================================

export const contactsService = {
  /**
   * Get all contact lists for the artist
   */
  getLists: () => apiRequest<ContactList[]>('/contacts/lists'),

  /**
   * Create a new contact list
   */
  createList: (data: {
    list_name: string
    list_type: 'fans' | 'venue_contacts' | 'industry' | 'custom'
  }) =>
    apiRequest<ContactList>('/contacts/lists', {
      method: 'POST',
      body: data,
    }),

  /**
   * Get contacts (optionally filtered by list_id)
   */
  getContacts: (listId?: string) =>
    apiRequest<Contact[]>('/contacts', {
      params: listId ? { list_id: listId } : undefined,
    }),

  /**
   * Add a single contact
   */
  addContact: (data: {
    list_id: string
    email?: string
    phone?: string
    name?: string
    opted_in: boolean
  }) =>
    apiRequest<Contact>('/contacts', {
      method: 'POST',
      body: data,
    }),

  /**
   * Bulk import contacts
   */
  importContacts: (data: {
    list_id: string
    contacts: Array<{
      email?: string
      phone?: string
      name?: string
      opted_in: boolean
    }>
  }) =>
    apiRequest<{ import_count: number }>('/contacts/import', {
      method: 'POST',
      body: data,
    }),

  /**
   * Update a contact (e.g., opt-in status)
   */
  updateContact: (contactId: string, data: Partial<Contact>) =>
    apiRequest<Contact>(`/contacts/${contactId}`, {
      method: 'PUT',
      body: data,
    }),

  /**
   * Delete a contact
   */
  deleteContact: (contactId: string) =>
    apiRequest<void>(`/contacts/${contactId}`, {
      method: 'DELETE',
    }),
}

// ============================================================================
// BROADCAST SERVICES
// ============================================================================

export const broadcastService = {
  /**
   * Send a broadcast message to selected contact lists
   * (D-049: Text-only broadcasts in MVP)
   */
  send: (data: BroadcastRequest) =>
    apiRequest<BroadcastResponse>('/broadcasts', {
      method: 'POST',
      body: data,
    }),

  /**
   * Get all broadcast messages
   */
  getAll: () => apiRequest<BroadcastMessage[]>('/broadcasts'),

  /**
   * Get a single broadcast message by ID
   */
  getById: (id: string) => apiRequest<BroadcastMessage>(`/broadcasts/${id}`),

  /**
   * Save a draft broadcast
   */
  saveDraft: (data: { subject: string; body: string; list_ids: string[] }) =>
    apiRequest<BroadcastMessage>('/broadcasts/drafts', {
      method: 'POST',
      body: data,
    }),

  /**
   * Update a draft broadcast
   */
  updateDraft: (id: string, data: Partial<BroadcastMessage>) =>
    apiRequest<BroadcastMessage>(`/broadcasts/drafts/${id}`, {
      method: 'PUT',
      body: data,
    }),

  /**
   * Delete a draft broadcast
   */
  deleteDraft: (id: string) =>
    apiRequest<void>(`/broadcasts/drafts/${id}`, {
      method: 'DELETE',
    }),
}

// ============================================================================
// JOURNAL (CREATIVE STUDIO) SERVICES
// ============================================================================

export const journalService = {
  /**
   * List all journal entries (optionally filtered by entry_type)
   */
  list: (entryType?: JournalEntryType) =>
    apiRequest<JournalEntriesResponse>('/journal', {
      params: entryType ? { entry_type: entryType } : undefined,
    }),

  /**
   * Get a single journal entry by ID
   */
  getById: (id: string) => apiRequest<JournalEntry>(`/journal/${id}`),

  /**
   * Create a new journal entry
   */
  create: (data: CreateJournalEntryRequest) =>
    apiRequest<{ message: string; entry: JournalEntry }>('/journal', {
      method: 'POST',
      body: data,
    }),

  /**
   * Update a journal entry
   */
  update: (id: string, data: UpdateJournalEntryRequest) =>
    apiRequest<{ message: string; entry: JournalEntry }>(`/journal/${id}`, {
      method: 'PUT',
      body: data,
    }),

  /**
   * Delete a journal entry
   */
  delete: (id: string) =>
    apiRequest<{ message: string }>(`/journal/${id}`, {
      method: 'DELETE',
    }),
}

// ============================================================================
// EXPORT ALL SERVICES
// ============================================================================

export const api = {
  analytics: analyticsService,
  artists: artistsService,
  gigs: gigsService,
  messages: messagesService,
  onboarding: onboardingService,
  profile: profileService,
  violet: violetService,
  files: filesService,
  tracks: tracksService,
  reviews: reviewsService,
  search: searchService,
  settings: settingsService,
  contacts: contactsService,
  broadcast: broadcastService,
  journal: journalService,
}

export default api
