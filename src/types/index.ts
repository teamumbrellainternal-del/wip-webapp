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
  artist_name: string
  full_name: string
  bio?: string
  location: string
  genres: string[]
  verified: boolean
  rating_avg: number
  review_count: number
  follower_count: number
  gigs_completed: number
  price_range_min?: number
  price_range_max?: number
  avatar_url?: string
  banner_url?: string
  social_links: SocialLinks
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
  audio_url: string
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
