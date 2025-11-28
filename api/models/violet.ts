/**
 * Violet AI Conversation Models
 * Data models for chat conversations and messages
 */

/**
 * Conversation record stored in D1
 */
export interface VioletConversation {
  id: string
  artist_id: string
  title: string | null
  started_at: string
  last_message_at: string
  message_count: number
  is_archived: number // 0 or 1 in SQLite
}

/**
 * Message record stored in D1
 */
export interface VioletMessage {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  tokens_used: number | null
  mood: string | null // 'professional', 'caring', 'playful'
  context: string | null // 'gig_inquiry', 'songwriting', 'general', etc.
  created_at: string
}

/**
 * Input for creating a new conversation
 */
export interface CreateConversationInput {
  artist_id: string
  title?: string
}

/**
 * Input for creating a new message
 */
export interface CreateMessageInput {
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  tokens_used?: number
  mood?: string
  context?: string
}

/**
 * Conversation with messages (for API responses)
 */
export interface ConversationWithMessages {
  conversation: VioletConversation
  messages: VioletMessage[]
}

/**
 * Conversation list item (for listing conversations)
 */
export interface ConversationListItem {
  id: string
  title: string | null
  started_at: string
  last_message_at: string
  message_count: number
  preview?: string // First few characters of last message
}

