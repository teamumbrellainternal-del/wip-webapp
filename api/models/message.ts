/**
 * Message data models
 * Individual messages in conversations (2000 char limit)
 */

/**
 * Message record stored in D1
 */
export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string // Max 2000 chars
  attachment_url: string | null
  attachment_filename: string | null
  attachment_size: number | null
  read: boolean
  created_at: string
}

/**
 * Message creation input
 */
export interface CreateMessageInput {
  conversation_id: string
  sender_id: string
  content: string
  attachment_url?: string
  attachment_filename?: string
  attachment_size?: number
}

/**
 * Message with sender details
 */
export interface MessageWithSender extends Message {
  sender_name: string
  sender_avatar: string | null
}

/**
 * Helper functions
 */

/**
 * Validate message content length (2000 char limit)
 */
export function validateMessageLength(content: string): boolean {
  return content.length > 0 && content.length <= 2000
}

/**
 * Check if message has attachment
 */
export function hasAttachment(message: Message): boolean {
  return !!message.attachment_url
}

/**
 * Format attachment size
 */
export function formatAttachmentSize(bytes: number | null): string {
  if (!bytes) return ''

  const kb = bytes / 1024
  const mb = kb / 1024

  if (mb >= 1) return `${mb.toFixed(1)} MB`
  if (kb >= 1) return `${kb.toFixed(1)} KB`
  return `${bytes} bytes`
}

/**
 * Get attachment icon based on filename
 */
export function getAttachmentIcon(filename: string | null): string {
  if (!filename) return 'file'

  const ext = filename.split('.').pop()?.toLowerCase()

  if (['jpg', 'jpeg', 'png', 'gif', 'heic'].includes(ext || '')) return 'image'
  if (['mp3', 'wav', 'flac', 'm4a'].includes(ext || '')) return 'audio'
  if (['mp4', 'mov', 'avi'].includes(ext || '')) return 'video'
  if (['pdf'].includes(ext || '')) return 'pdf'
  if (['doc', 'docx'].includes(ext || '')) return 'document'

  return 'file'
}

/**
 * Format message timestamp
 */
export function formatMessageTime(message: Message): string {
  const messageDate = new Date(message.created_at)
  const now = new Date()
  const isToday =
    messageDate.getDate() === now.getDate() &&
    messageDate.getMonth() === now.getMonth() &&
    messageDate.getFullYear() === now.getFullYear()

  if (isToday) {
    return messageDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  return messageDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/**
 * Check if message is from current user
 */
export function isOwnMessage(message: Message, userId: string): boolean {
  return message.sender_id === userId
}
