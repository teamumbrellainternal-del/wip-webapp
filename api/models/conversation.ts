/**
 * Conversation data models
 * Message threads between platform users (polling-based)
 */

/**
 * Conversation record stored in D1
 */
export interface Conversation {
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

/**
 * Conversation creation input
 */
export interface CreateConversationInput {
  participant_1_id: string
  participant_2_id: string
}

/**
 * Conversation with participant details
 */
export interface ConversationWithParticipants extends Conversation {
  participant_1_name: string
  participant_1_avatar: string | null
  participant_2_name: string
  participant_2_avatar: string | null
}

/**
 * Helper functions
 */

/**
 * Get unread count for specific user
 */
export function getUnreadCount(conversation: Conversation, userId: string): number {
  if (conversation.participant_1_id === userId) {
    return conversation.unread_count_p1
  }
  if (conversation.participant_2_id === userId) {
    return conversation.unread_count_p2
  }
  return 0
}

/**
 * Get other participant ID
 */
export function getOtherParticipantId(conversation: Conversation, userId: string): string {
  if (conversation.participant_1_id === userId) {
    return conversation.participant_2_id
  }
  return conversation.participant_1_id
}

/**
 * Check if conversation has unread messages for user
 */
export function hasUnreadMessages(conversation: Conversation, userId: string): boolean {
  return getUnreadCount(conversation, userId) > 0
}

/**
 * Format last message time
 */
export function formatLastMessageTime(conversation: Conversation): string {
  if (!conversation.last_message_at) return 'No messages'

  const lastMessage = new Date(conversation.last_message_at)
  const now = new Date()
  const diffMs = now.getTime() - lastMessage.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return lastMessage.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/**
 * Truncate message preview
 */
export function truncatePreview(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
