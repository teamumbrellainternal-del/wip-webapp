/**
 * Pusher WebSocket Service Wrapper
 * Handles real-time event broadcasting for messaging
 * 
 * Architecture: REST API handles persistence, Pusher broadcasts for instant delivery
 */

import type { ServiceResult } from './types'
import { logger } from '../utils/logger'

/**
 * Pusher API configuration
 */
const PUSHER_API_URL = 'https://api-{cluster}.pusher.com'

/**
 * Pusher event types for messaging
 */
export type PusherEventType = 
  | 'new-message'
  | 'message-read'
  | 'typing-start'
  | 'typing-stop'
  | 'conversation-updated'

/**
 * Pusher trigger parameters
 */
export interface PusherTriggerParams {
  channel: string
  event: PusherEventType
  data: Record<string, unknown>
}

/**
 * Pusher trigger result
 */
export interface PusherTriggerResult {
  triggered: boolean
  channel: string
  event: string
  timestamp: string
}

/**
 * Message event payload structure
 */
export interface MessageEventPayload {
  id: string
  conversation_id: string
  sender_id: string
  sender_name: string
  sender_avatar?: string | null
  content: string
  created_at: string
  attachment_url?: string | null
  attachment_filename?: string | null
}

/**
 * Pusher service class
 * Uses Pusher's HTTP API to trigger events (server-side)
 */
export class PusherService {
  private appId: string
  private key: string
  private secret: string
  private cluster: string
  private useMocks: boolean

  constructor(
    appId: string,
    key: string,
    secret: string,
    cluster: string,
    useMocks = false
  ) {
    this.appId = appId
    this.key = key
    this.secret = secret
    this.cluster = cluster
    this.useMocks = useMocks
  }

  /**
   * Generate HMAC-SHA256 signature for Pusher authentication
   */
  private async generateSignature(stringToSign: string): Promise<string> {
    const encoder = new TextEncoder()
    const keyData = encoder.encode(this.secret)
    const messageData = encoder.encode(stringToSign)

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )

    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData)
    
    // Convert to hex string
    return Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }

  /**
   * Generate MD5 hash (for Pusher body signature)
   */
  private async generateMD5(body: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(body)
    const hashBuffer = await crypto.subtle.digest('MD5', data)
    
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }

  /**
   * Trigger an event on a Pusher channel
   */
  async trigger(params: PusherTriggerParams): Promise<ServiceResult<PusherTriggerResult>> {
    const startTime = Date.now()
    
    // Mock mode for development without Pusher credentials
    if (this.useMocks) {
      logger.info('PusherService', 'trigger', 'Mock mode - skipping Pusher trigger', {
        channel: params.channel,
        event: params.event,
      })
      
      return {
        success: true,
        data: {
          triggered: true,
          channel: params.channel,
          event: params.event,
          timestamp: new Date().toISOString(),
        },
      }
    }

    // Validate credentials are present
    if (!this.appId || !this.key || !this.secret || !this.cluster) {
      logger.warn('PusherService', 'trigger', 'Missing Pusher credentials - event not sent', {
        channel: params.channel,
        event: params.event,
      })
      
      return {
        success: false,
        error: {
          code: 'PUSHER_CONFIG_MISSING',
          message: 'Pusher credentials not configured',
          retryable: false,
        },
      }
    }

    try {
      const body = JSON.stringify({
        name: params.event,
        channel: params.channel,
        data: JSON.stringify(params.data),
      })

      const bodyMD5 = await this.generateMD5(body)
      const timestamp = Math.floor(Date.now() / 1000)
      
      const path = `/apps/${this.appId}/events`
      const queryParams = new URLSearchParams({
        auth_key: this.key,
        auth_timestamp: timestamp.toString(),
        auth_version: '1.0',
        body_md5: bodyMD5,
      })

      const stringToSign = `POST\n${path}\n${queryParams.toString()}`
      const signature = await this.generateSignature(stringToSign)
      
      queryParams.append('auth_signature', signature)

      const url = `${PUSHER_API_URL.replace('{cluster}', this.cluster)}${path}?${queryParams.toString()}`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      })

      const duration = Date.now() - startTime

      if (!response.ok) {
        const errorText = await response.text()
        logger.error('PusherService', 'trigger', 'Pusher API error', {
          status: response.status,
          error: errorText,
          channel: params.channel,
          event: params.event,
          duration,
        })

        return {
          success: false,
          error: {
            code: 'PUSHER_API_ERROR',
            message: `Pusher API error: ${response.status} - ${errorText}`,
            retryable: response.status >= 500,
          },
        }
      }

      logger.info('PusherService', 'trigger', 'Event triggered successfully', {
        channel: params.channel,
        event: params.event,
        duration,
      })

      return {
        success: true,
        data: {
          triggered: true,
          channel: params.channel,
          event: params.event,
          timestamp: new Date().toISOString(),
        },
      }
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error('PusherService', 'trigger', 'Failed to trigger Pusher event', {
        error: error instanceof Error ? error.message : 'Unknown error',
        channel: params.channel,
        event: params.event,
        duration,
      })

      return {
        success: false,
        error: {
          code: 'PUSHER_TRIGGER_FAILED',
          message: error instanceof Error ? error.message : 'Failed to trigger Pusher event',
          retryable: true,
        },
      }
    }
  }

  /**
   * Convenience method: Trigger new message event
   * Channel format: private-conversation-{conversationId}
   */
  async triggerNewMessage(
    conversationId: string,
    message: MessageEventPayload
  ): Promise<ServiceResult<PusherTriggerResult>> {
    return this.trigger({
      channel: `private-conversation-${conversationId}`,
      event: 'new-message',
      data: message,
    })
  }

  /**
   * Convenience method: Trigger message read event
   */
  async triggerMessageRead(
    conversationId: string,
    readByUserId: string
  ): Promise<ServiceResult<PusherTriggerResult>> {
    return this.trigger({
      channel: `private-conversation-${conversationId}`,
      event: 'message-read',
      data: {
        conversation_id: conversationId,
        read_by: readByUserId,
        read_at: new Date().toISOString(),
      },
    })
  }

  /**
   * Convenience method: Trigger typing indicator
   */
  async triggerTyping(
    conversationId: string,
    userId: string,
    isTyping: boolean
  ): Promise<ServiceResult<PusherTriggerResult>> {
    return this.trigger({
      channel: `private-conversation-${conversationId}`,
      event: isTyping ? 'typing-start' : 'typing-stop',
      data: {
        conversation_id: conversationId,
        user_id: userId,
        timestamp: new Date().toISOString(),
      },
    })
  }

  /**
   * Convenience method: Notify user of conversation list update
   * Channel format: private-user-{userId}
   */
  async triggerConversationUpdate(
    userId: string,
    conversationId: string,
    lastMessagePreview: string
  ): Promise<ServiceResult<PusherTriggerResult>> {
    return this.trigger({
      channel: `private-user-${userId}`,
      event: 'conversation-updated',
      data: {
        conversation_id: conversationId,
        last_message_preview: lastMessagePreview,
        updated_at: new Date().toISOString(),
      },
    })
  }
}

/**
 * Factory function to create PusherService instance
 */
export function createPusherService(
  appId: string,
  key: string,
  secret: string,
  cluster: string,
  useMocks = false
): PusherService {
  return new PusherService(appId, key, secret, cluster, useMocks)
}

/**
 * Create PusherService from environment variables
 */
export function createPusherServiceFromEnv(env: {
  PUSHER_APP_ID?: string
  PUSHER_KEY?: string
  PUSHER_SECRET?: string
  PUSHER_CLUSTER?: string
  USE_MOCKS?: string
}): PusherService {
  const useMocks = env.USE_MOCKS === 'true'
  
  return createPusherService(
    env.PUSHER_APP_ID || '',
    env.PUSHER_KEY || '',
    env.PUSHER_SECRET || '',
    env.PUSHER_CLUSTER || 'us2',
    useMocks
  )
}

