/**
 * TypeScript Type Definitions for Umbrella MVP
 * Comprehensive types for all API requests and responses
 */

// ============================================================================
// CORE USER & PROFILE TYPES
// ============================================================================

export interface UserProfile {
  id: string
  email: string
  full_name: string
  artist_name?: string
  role: 'artist' | 'fan' | 'venue' | 'collective'
  onboarding_completed: boolean
  onboarding_step?: number
  profile_completion_percentage: number
  avatar_url?: string
  verified: boolean
  created_at: string
  updated_at: string
}

export interface SocialLinks {
  instagram?: string
  tiktok?: string
  youtube?: string
  spotify?: string
  apple_music?: string
  soundcloud?: string
  website?: string
}

// ============================================================================
// ARTIST TYPES
// ============================================================================

export interface Artist {
  id: string
  user_id?: string // User ID for starting conversations
  slug?: string // SEO-friendly URL slug (e.g., "john-doe")
  artist_name: string
  full_name: string
  bio?: string
  location: string
  genres: string[]
  verified: boolean
  rating_avg: number
  review_count: number
  follower_count: number
  connection_count?: number // LinkedIn-style mutual connections
  gigs_completed: number
  price_range_min?: number
  price_range_max?: number
  avatar_url?: string
  banner_url?: string
  social_links: SocialLinks
  // Flat social link fields (returned by API alongside social_links object)
  website_url?: string | null
  instagram_handle?: string | null
  tiktok_handle?: string | null
  youtube_url?: string | null
  spotify_url?: string | null
  apple_music_url?: string | null
  soundcloud_url?: string | null
  facebook_url?: string | null
  twitter_url?: string | null
  bandcamp_url?: string | null
  created_at: string
  updated_at: string
}

export interface ArtistSearchParams {
  query?: string
  genres?: string[]
  location?: string
  min_price?: number
  max_price?: number
  verified_only?: boolean
  min_rating?: number
  sort_by?: 'relevance' | 'rating' | 'gigs_completed' | 'followers'
  page?: number
  limit?: number
}

// ============================================================================
// VENUE TYPES
// ============================================================================

export type VenueStatus = 'open_for_bookings' | 'closed' | 'limited'
export type VenueType = 'club' | 'bar' | 'theater' | 'arena' | 'outdoor' | 'restaurant' | 'other'
export type StageSize = 'small' | 'medium' | 'large'

export interface VenueProfileResponse {
  id: string
  user_id: string
  slug?: string // SEO-friendly URL slug (e.g., "the-blue-note")
  name: string
  tagline: string | null
  venue_type: VenueType | null
  address_line1: string | null
  address_line2: string | null
  city: string
  state: string | null
  zip_code: string | null
  country: string
  capacity: number | null
  standing_capacity: number | null
  seated_capacity: number | null
  stage_size: StageSize | null
  sound_system: string | null
  has_green_room: boolean
  has_parking: boolean
  status: VenueStatus
  booking_lead_days: number
  preferred_genres: string[]
  avatar_url: string | null
  cover_url: string | null
  verified: boolean
  events_hosted: number
  total_artists_booked: number
  created_at: string
  updated_at: string
}

export interface PublicVenueProfile {
  id: string
  slug?: string // SEO-friendly URL slug (e.g., "the-blue-note")
  name: string
  tagline: string | null
  venue_type: VenueType | null
  city: string
  state: string | null
  capacity: number | null
  stage_size: StageSize | null
  status: VenueStatus
  avatar_url: string | null
  cover_url: string | null
  verified: boolean
  events_hosted: number
  total_artists_booked: number
}

export interface CreateVenueInput {
  name: string
  city: string
  tagline?: string
  venue_type?: VenueType
  state?: string
  capacity?: number
  standing_capacity?: number
  seated_capacity?: number
  stage_size?: StageSize
  sound_system?: string
  has_green_room?: boolean
  has_parking?: boolean
  booking_lead_days?: number
  preferred_genres?: string[]
}

export interface UpdateVenueInput {
  name?: string
  tagline?: string
  venue_type?: VenueType
  address_line1?: string
  address_line2?: string
  city?: string
  state?: string
  zip_code?: string
  country?: string
  capacity?: number
  standing_capacity?: number
  seated_capacity?: number
  stage_size?: StageSize
  sound_system?: string
  has_green_room?: boolean
  has_parking?: boolean
  status?: VenueStatus
  booking_lead_days?: number
  preferred_genres?: string[]
  avatar_url?: string
  cover_url?: string
}

// ============================================================================
// GIG TYPES
// ============================================================================

export interface Gig {
  id: string
  venue_id: string
  venue_name: string
  title: string
  description?: string
  date: string
  time: string
  capacity: number
  location: string
  venue_rating_avg: number
  venue_review_count: number
  genre_tags: string[]
  payment_amount: number
  urgency_flag: boolean
  status: 'open' | 'filled' | 'cancelled'
  application_deadline?: string
  created_at: string
  updated_at: string
}

export interface GigSearchParams {
  query?: string
  genres?: string[]
  location?: string
  min_payment?: number
  max_payment?: number
  date_from?: string
  date_to?: string
  urgent_only?: boolean
  sort_by?: 'date' | 'payment' | 'relevance'
  page?: number
  limit?: number
}

export interface GigOpportunity {
  id: string
  title: string
  venue_name: string
  date: string
  payment_amount: number
  urgency_flag: boolean
  match_score?: number
}

// ============================================================================
// GIG MANAGEMENT TYPES (Phase B)
// ============================================================================

/**
 * Input for creating a new gig (venue-only)
 */
export interface CreateGigInput {
  title: string
  description?: string
  venue_name: string
  location_city: string
  location_state: string
  location_address?: string
  location_zip?: string
  date: string // ISO date YYYY-MM-DD
  start_time?: string // HH:MM format
  end_time?: string // HH:MM format
  genre?: string
  capacity?: number
  payment_amount?: number
  payment_type?: 'flat' | 'hourly' | 'negotiable'
}

/**
 * Input for updating an existing gig
 */
export type UpdateGigInput = Partial<CreateGigInput> & {
  status?: 'open' | 'filled' | 'cancelled' | 'completed'
}

/**
 * Gig as returned from venue's "My Gigs" endpoint
 */
export interface VenueGig {
  id: string
  title: string
  description?: string
  venue_name: string
  location: string
  location_city: string
  location_state: string
  date: string
  start_time?: string
  end_time?: string
  genre?: string
  capacity?: number
  filled_slots: number
  payment_amount?: number
  payment_type?: 'flat' | 'hourly' | 'negotiable'
  status: 'open' | 'filled' | 'cancelled' | 'completed'
  created_at: string
  updated_at: string
}

/**
 * Application from an artist to a gig
 */
export interface GigApplication {
  id: string
  status: 'pending' | 'accepted' | 'rejected'
  applied_at: string
  artist: {
    id: string
    stage_name: string
    bio?: string
    base_rate_flat?: number
    base_rate_hourly?: number
    website_url?: string
    avatar_url?: string
    avg_rating: number
    total_gigs: number
  }
}

/**
 * Artist's view of their own application
 */
export interface MyApplication {
  id: string
  status: 'pending' | 'accepted' | 'rejected'
  applied_at: string
  gig: {
    id: string
    title: string
    venue_name: string
    location: string
    date: string
    start_time?: string
    payment_amount?: number
    status: 'open' | 'filled' | 'cancelled' | 'completed'
  }
}

/**
 * Response from creating a gig
 */
export interface CreateGigResponse {
  message: string
  id: string
  title: string
  date: string
  location: string
  status: string
}

/**
 * Response from applying to a gig
 */
export interface ApplyToGigResponse {
  message: string
  applicationId: string
  gigId: string
  gigTitle: string
  appliedAt: string
}

// ============================================================================
// DASHBOARD & ANALYTICS TYPES
// ============================================================================

export interface DashboardMetrics {
  earnings: {
    current_month: number
    percentage_change: number
  }
  gigs_booked: {
    count: number
    timeframe: string
  }
  profile_views: {
    count: number
    percentage_change: number
  }
  opportunities: GigOpportunity[]
  messages: MessagePreview[]
  endorsements: Endorsement[]
}

export interface PerformanceData {
  period: 'monthly' | 'yearly'
  earnings: ChartDataPoint[]
  gigs: ChartDataPoint[]
  profile_views: ChartDataPoint[]
}

export interface ChartDataPoint {
  date: string
  value: number
}

export interface Goal {
  id: string
  title: string
  description?: string
  target_value: number
  current_value: number
  unit: string
  deadline?: string
  status: 'active' | 'completed' | 'expired'
  created_at: string
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon_url?: string
  unlocked_at?: string
  progress_current?: number
  progress_target?: number
}

// ============================================================================
// MESSAGING TYPES
// ============================================================================

export interface Conversation {
  id: string
  participants: ConversationParticipant[]
  context_type: 'artist' | 'venue' | 'producer' | 'band'
  last_message_preview: string
  unread_count: number
  updated_at: string
  messages?: Message[]
}

export interface ConversationParticipant {
  id: string
  name: string
  avatar_url?: string
  role: string
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  sender_name: string
  sender_avatar_url?: string
  content: string
  attachments?: MessageAttachment[]
  timestamp: string
  read_status: boolean
}

export interface MessageAttachment {
  id: string
  filename: string
  url: string
  file_type: string
  file_size: number
}

export interface MessagePreview {
  conversation_id: string
  sender_name: string
  preview_text: string
  timestamp: string
  unread: boolean
}

// ============================================================================
// TRACK & MEDIA TYPES
// ============================================================================

export interface Track {
  id: string
  artist_id: string
  title: string
  duration_seconds: number
  file_url: string
  cover_art_url?: string
  genre: string
  play_count: number
  created_at: string
}

export interface MediaPost {
  id: string
  artist_id: string
  type: 'image' | 'video' | 'audio'
  title?: string
  description?: string
  media_url: string
  thumbnail_url?: string
  created_at: string
}

// ============================================================================
// REVIEW & ENDORSEMENT TYPES
// ============================================================================

export interface Review {
  id: string
  reviewer_id: string
  reviewer_name: string
  reviewer_avatar_url?: string
  artist_id: string
  rating: number
  comment: string
  gig_id?: string
  gig_title?: string
  created_at: string
}

export interface Endorsement {
  id: string
  endorser_id: string
  endorser_name: string
  endorser_avatar_url?: string
  artist_id: string
  skill: string
  comment?: string
  created_at: string
}

// ============================================================================
// ONBOARDING TYPES
// ============================================================================

export interface OnboardingStep1Data {
  artist_name: string
  location: string
  bio?: string
}

export interface OnboardingStep2Data {
  social_links: SocialLinks
}

export interface OnboardingStep3Data {
  genres: string[]
  tags: string[]
}

export interface OnboardingStep4Data {
  gigs_completed: number
  price_range_min?: number
  price_range_max?: number
}

export interface OnboardingStep5Data {
  availability: string[]
  equipment: string[]
}

// ============================================================================
// VIOLET AI TYPES
// ============================================================================

export interface VioletPromptRequest {
  prompt: string
  context?: Record<string, unknown>
}

export interface VioletResponse {
  response: string
  suggestions?: string[]
  actions?: VioletAction[]
}

export interface VioletAction {
  type: string
  label: string
  data: Record<string, unknown>
}

export interface VioletUsage {
  prompts_used_today: number
  prompts_limit: number
  reset_at: string
}

// Violet Conversation Types (Chat Interface)
export interface VioletConversation {
  id: string
  artist_id: string
  title: string | null
  started_at: string
  last_message_at: string
  message_count: number
  is_archived: number
}

export interface VioletMessage {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  tokens_used: number | null
  mood: string | null
  context: string | null
  created_at: string
}

export interface VioletConversationListItem {
  id: string
  title: string | null
  started_at: string
  last_message_at: string
  message_count: number
  preview?: string
}

export interface VioletSendMessageResponse {
  user_message: VioletMessage
  assistant_message: VioletMessage
  remaining_prompts: number
  is_placeholder: boolean
}

// ============================================================================
// FILE UPLOAD TYPES
// ============================================================================

export interface FileMetadata {
  id: string
  filename: string
  file_type: string
  file_size: number
  url: string
  thumbnail_url?: string
  uploaded_at: string
}

export interface FileUploadResponse {
  file: FileMetadata
  success: boolean
}

// ============================================================================
// API RESPONSE & ERROR TYPES
// ============================================================================

export interface ApiError {
  status: number
  message: string
  details?: Record<string, unknown>
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  has_more: boolean
}

// ============================================================================
// FORM & VALIDATION TYPES
// ============================================================================

export type AppMode = 'development' | 'production' | 'form'

export interface ConfigData {
  [key: string]: unknown
}

export interface AutoSaveOptions {
  enabled: boolean
  interval?: number
  debounceMs?: number
  maxHistorySize?: number
}

export interface StorageConfig {
  maxHistoryItems?: number
  compressionEnabled?: boolean
}

// ============================================================================
// SEARCH TYPES
// ============================================================================

export interface GlobalSearchParams {
  query: string
  type?: 'artists' | 'gigs' | 'all'
  limit?: number
}

export interface GlobalSearchResults {
  artists: Artist[]
  gigs: Gig[]
}

// ============================================================================
// CONTACT & BROADCAST TYPES
// ============================================================================

export interface ContactList {
  id: string
  artist_id: string
  list_name: string
  list_type: 'fans' | 'venue_contacts' | 'industry' | 'custom'
  contact_count: number
  created_at: string
  updated_at: string
  is_system_list?: boolean // True for virtual lists like "Your Followers"
}

export interface Contact {
  id: string
  artist_id: string
  list_id: string
  email?: string
  phone?: string
  name?: string
  opted_in: boolean
  created_at: string
}

export interface BroadcastMessage {
  id: string
  artist_id: string
  subject: string
  body: string
  recipient_count: number
  sent_at?: string
  scheduled_at?: string
  list_ids: string[]
  status: 'draft' | 'scheduled' | 'sent' | 'failed'
  created_at: string
  updated_at: string
}

export interface BroadcastRequest {
  list_ids: string[]
  subject: string
  body: string
  scheduled_at?: string
}

export interface BroadcastResponse {
  message: string
  recipient_count: number
  broadcast_id: string
}

// ============================================================================
// JOURNAL (CREATIVE STUDIO) TYPES
// ============================================================================

export type JournalEntryType = 'song_idea' | 'set_plan' | 'general_note'

export type JournalBlockType = 'text' | 'image' | 'audio' | 'video' | 'checklist'

export interface JournalBlock {
  id: string
  type: JournalBlockType
  content: any
  order: number
}

export interface TextBlockContent {
  text: string
}

export interface ImageBlockContent {
  url: string
  caption?: string
  file_id?: string
}

export interface AudioVideoBlockContent {
  url: string
  type: 'audio' | 'video'
  title?: string
  file_id?: string
}

export interface ChecklistBlockContent {
  items: ChecklistItem[]
}

export interface ChecklistItem {
  id: string
  text: string
  completed: boolean
}

export interface JournalEntry {
  id: string
  artist_id: string
  title?: string
  content: JournalBlock[]
  entry_type: JournalEntryType
  created_at: string
  updated_at: string
}

export interface JournalEntriesResponse {
  entries: JournalEntry[]
  count: number
}

export interface CreateJournalEntryRequest {
  entry_type: JournalEntryType
  title?: string
  blocks: JournalBlock[]
}

export interface UpdateJournalEntryRequest {
  title?: string
  blocks?: JournalBlock[]
  entry_type?: JournalEntryType
}

// ============================================================================
// CONNECTION TYPES (LinkedIn-style mutual connections)
// ============================================================================

export type ConnectionStatus = 'none' | 'pending_sent' | 'pending_received' | 'connected' | 'self'

export interface Connection {
  connection_id: string
  connected_user_id: string
  artist_id: string
  artist_name: string
  avatar_url?: string
  location_city?: string
  location_state?: string
  primary_genre?: string
  connected_at: string
}

export interface ConnectionRequest {
  connection_id: string
  requester_user_id?: string
  recipient_user_id?: string
  artist_id: string
  artist_name: string
  avatar_url?: string
  location_city?: string
  location_state?: string
  primary_genre?: string
  created_at: string
}

export interface ConnectionStatusResponse {
  status: ConnectionStatus
  connection_id: string | null
}

export interface MutualConnection {
  user_id: string
  artist_id: string
  artist_name: string
  avatar_url?: string
}

export interface ConnectionsListResponse {
  connections: Connection[]
  total: number
  limit: number
  offset: number
}

export interface PendingRequestsResponse {
  requests: ConnectionRequest[]
  count: number
}

export interface SentRequestsResponse {
  requests: ConnectionRequest[]
  count: number
}

export interface MutualConnectionsResponse {
  mutual_connections: MutualConnection[]
  count: number
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export type NotificationType =
  | 'connection_request'
  | 'connection_accepted'
  | 'message'
  | 'gig_application'
  | 'review'
  | 'system'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  body: string
  data?: Record<string, unknown>
  read: boolean
  created_at: string
}

export interface NotificationsResponse {
  notifications: Notification[]
  unread_count: number
  total: number
  limit: number
  offset: number
}

export interface UnreadCountResponse {
  unread_count: number
}
