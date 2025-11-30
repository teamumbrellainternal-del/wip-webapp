/**
 * Shared types for external service wrappers
 */

/**
 * Service operation result
 */
export interface ServiceResult<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    retryable: boolean
  }
}

/**
 * Retry configuration for exponential backoff
 */
export interface RetryConfig {
  maxRetries: number
  initialDelayMs: number
  maxDelayMs: number
  backoffMultiplier: number
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000, // 1 second
  maxDelayMs: 30000, // 30 seconds
  backoffMultiplier: 2, // Double each time
}

/**
 * Email template types
 */
export type EmailTemplate =
  | 'welcome'
  | 'signup_welcome'
  | 'booking_confirmation'
  | 'message_notification'
  | 'review_invitation'
  | 'broadcast'
  | 'connection_request'
  | 'connection_accepted'
  | 'new_follower'
  | 'profile_view'

/**
 * Email send parameters
 */
export interface EmailParams {
  to: string | string[]
  from?: string
  subject: string
  html: string
  text?: string
  template?: EmailTemplate
  artistId?: string
  unsubscribeUrl?: string
}

/**
 * Email send result
 */
export interface EmailResult {
  messageId: string
  to: string[]
  timestamp: string
}

/**
 * SMS message types
 */
export type SMSMessageType = 'booking_confirmation' | 'broadcast' | 'notification'

/**
 * SMS send parameters
 */
export interface SMSParams {
  to: string
  message: string
  messageType?: SMSMessageType
  artistId?: string
}

/**
 * SMS send result
 */
export interface SMSResult {
  messageSid: string
  to: string
  status: string
  timestamp: string
}

/**
 * Broadcast email parameters (batched)
 */
export interface BroadcastEmailParams {
  recipients: string[]
  subject: string
  html: string
  text?: string
  artistId: string
  unsubscribeUrl: string
}

/**
 * Broadcast SMS parameters (rate-limited)
 */
export interface BroadcastSMSParams {
  recipients: string[]
  message: string
  artistId: string
}

/**
 * Broadcast result
 */
export interface BroadcastResult {
  totalRecipients: number
  successCount: number
  failureCount: number
  queuedCount: number
}

/**
 * Claude API prompt templates
 */
export type ClaudePromptType =
  | 'draft_message'
  | 'gig_inquiry'
  | 'songwriting'
  | 'career_advice'
  | 'bio_generator'
  | 'general'

/**
 * Claude API request parameters
 */
export interface ClaudeParams {
  prompt: string
  promptType: ClaudePromptType
  artistId: string
  maxTokens?: number
  temperature?: number
}

/**
 * Claude API request parameters with conversation context
 */
export interface ClaudeParamsWithContext extends ClaudeParams {
  previousMessages: Array<{ role: string; content: string }>
}

/**
 * Claude API response with mood for chat interface
 */
export interface ClaudeResultWithMood extends ClaudeResult {
  mood?: string // 'professional', 'caring', 'playful'
}

/**
 * Claude API response (placeholder for Release 1)
 */
export interface ClaudeResult {
  response: string
  tokensUsed: number
  promptType: ClaudePromptType
  isPlaceholder: boolean // Always true in Release 1
}

/**
 * Violet usage daily limit
 */
export const VIOLET_DAILY_LIMIT = 50

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

/**
 * Queue item status
 */
export type QueueStatus = 'pending' | 'processing' | 'failed' | 'completed'

/**
 * Email queue item
 */
export interface EmailQueueItem {
  id: string
  toEmail: string
  fromEmail: string
  subject: string
  htmlBody: string
  textBody?: string
  templateType?: EmailTemplate
  retryCount: number
  maxRetries: number
  nextRetryAt?: string
  lastError?: string
  artistId?: string
  status: QueueStatus
  createdAt: string
  updatedAt: string
}

/**
 * SMS queue item
 */
export interface SMSQueueItem {
  id: string
  toPhone: string
  fromPhone: string
  message: string
  messageType?: SMSMessageType
  retryCount: number
  maxRetries: number
  nextRetryAt?: string
  lastError?: string
  artistId?: string
  status: QueueStatus
  createdAt: string
  updatedAt: string
}
