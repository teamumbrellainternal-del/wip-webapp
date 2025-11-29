/**
 * Pusher WebSocket Hook for Real-time Messaging
 * 
 * Manages Pusher connection, channel subscriptions, and connection status.
 * Falls back gracefully if Pusher is unavailable.
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { useAuth } from '@clerk/clerk-react'
import Pusher, { Channel } from 'pusher-js'
import type { Message } from '@/types'

/**
 * Pusher configuration from environment
 */
const PUSHER_KEY = import.meta.env.VITE_PUSHER_KEY || ''
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER || 'us2'
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'

/**
 * Connection state for UI display
 */
export type PusherConnectionState = 
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'unavailable'
  | 'failed'

/**
 * Message event payload from Pusher
 */
export interface PusherMessageEvent {
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
 * Read receipt event payload
 */
export interface PusherReadEvent {
  conversation_id: string
  read_by: string
  read_at: string
}

/**
 * Conversation update event payload
 */
export interface PusherConversationUpdateEvent {
  conversation_id: string
  last_message_preview: string
  updated_at: string
}

/**
 * Hook return type
 */
export interface UsePusherReturn {
  /** Current connection state */
  connectionState: PusherConnectionState
  /** Whether Pusher is connected and ready */
  isConnected: boolean
  /** Subscribe to a conversation channel for new messages */
  subscribeToConversation: (
    conversationId: string,
    onMessage: (message: PusherMessageEvent) => void,
    onRead?: (event: PusherReadEvent) => void
  ) => void
  /** Unsubscribe from a conversation channel */
  unsubscribeFromConversation: (conversationId: string) => void
  /** Subscribe to user's personal channel for conversation updates */
  subscribeToUserChannel: (
    userId: string,
    onConversationUpdate: (event: PusherConversationUpdateEvent) => void
  ) => void
  /** Unsubscribe from user's personal channel */
  unsubscribeFromUserChannel: (userId: string) => void
}

/**
 * Pusher WebSocket hook for real-time messaging
 * 
 * @example
 * ```tsx
 * const { connectionState, isConnected, subscribeToConversation } = usePusher()
 * 
 * useEffect(() => {
 *   if (conversationId && isConnected) {
 *     subscribeToConversation(
 *       conversationId,
 *       (message) => setMessages(prev => [...prev, message]),
 *       (event) => console.log('Messages read by', event.read_by)
 *     )
 *   }
 *   return () => unsubscribeFromConversation(conversationId)
 * }, [conversationId, isConnected])
 * ```
 */
export function usePusher(): UsePusherReturn {
  const pusherRef = useRef<Pusher | null>(null)
  const channelsRef = useRef<Map<string, Channel>>(new Map())
  const [connectionState, setConnectionState] = useState<PusherConnectionState>('connecting')
  const { getToken } = useAuth()

  // Initialize Pusher connection
  useEffect(() => {
    // Skip if no Pusher key configured
    if (!PUSHER_KEY) {
      console.warn('[usePusher] Pusher key not configured - real-time messaging disabled')
      setConnectionState('unavailable')
      return
    }

    // Create Pusher instance with custom authorizer for private channels
    const pusher = new Pusher(PUSHER_KEY, {
      cluster: PUSHER_CLUSTER,
      // Enable encrypted connection
      forceTLS: true,
      // Custom authorizer for private channels - fetches auth token from our backend
      authorizer: (channel) => ({
        authorize: async (socketId, callback) => {
          try {
            // Get fresh JWT token from Clerk
            const token = await getToken()
            if (!token) {
              callback(new Error('No auth token available'), null)
              return
            }

            // Call our backend auth endpoint
            const response = await fetch(`${API_URL}/v1/pusher/auth`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Bearer ${token}`,
              },
              body: new URLSearchParams({
                socket_id: socketId,
                channel_name: channel.name,
              }),
            })

            if (!response.ok) {
              const errorText = await response.text()
              console.error('[usePusher] Auth failed:', response.status, errorText)
              callback(new Error(`Auth failed: ${response.status}`), null)
              return
            }

            const authData = await response.json()
            callback(null, authData)
          } catch (error) {
            console.error('[usePusher] Auth error:', error)
            callback(error instanceof Error ? error : new Error('Auth failed'), null)
          }
        },
      }),
    })

    pusherRef.current = pusher

    // Connection state handlers
    pusher.connection.bind('connecting', () => {
      console.log('[usePusher] Connecting...')
      setConnectionState('connecting')
    })

    pusher.connection.bind('connected', () => {
      console.log('[usePusher] Connected')
      setConnectionState('connected')
    })

    pusher.connection.bind('disconnected', () => {
      console.log('[usePusher] Disconnected')
      setConnectionState('disconnected')
    })

    pusher.connection.bind('unavailable', () => {
      console.warn('[usePusher] Connection unavailable')
      setConnectionState('unavailable')
    })

    pusher.connection.bind('failed', () => {
      console.error('[usePusher] Connection failed')
      setConnectionState('failed')
    })

    // Cleanup on unmount
    return () => {
      console.log('[usePusher] Cleaning up Pusher connection')
      // Unsubscribe from all channels
      channelsRef.current.forEach((channel, name) => {
        pusher.unsubscribe(name)
      })
      channelsRef.current.clear()
      pusher.disconnect()
      pusherRef.current = null
    }
  }, [])

  /**
   * Subscribe to a conversation channel
   */
  const subscribeToConversation = useCallback((
    conversationId: string,
    onMessage: (message: PusherMessageEvent) => void,
    onRead?: (event: PusherReadEvent) => void
  ) => {
    const pusher = pusherRef.current
    if (!pusher || connectionState === 'unavailable' || connectionState === 'failed') {
      console.warn('[usePusher] Cannot subscribe - Pusher not available')
      return
    }

    const channelName = `private-conversation-${conversationId}`
    
    // Don't re-subscribe if already subscribed
    if (channelsRef.current.has(channelName)) {
      console.log(`[usePusher] Already subscribed to ${channelName}`)
      return
    }

    console.log(`[usePusher] Subscribing to ${channelName}`)
    const channel = pusher.subscribe(channelName)
    
    // Bind to new message event
    channel.bind('new-message', (data: PusherMessageEvent) => {
      console.log('[usePusher] New message received:', data.id)
      onMessage(data)
    })

    // Bind to read receipt event
    if (onRead) {
      channel.bind('message-read', (data: PusherReadEvent) => {
        console.log('[usePusher] Read receipt received:', data.read_by)
        onRead(data)
      })
    }

    // Bind to typing events (optional, for future use)
    channel.bind('typing-start', (data: { user_id: string }) => {
      console.log('[usePusher] User started typing:', data.user_id)
    })

    channel.bind('typing-stop', (data: { user_id: string }) => {
      console.log('[usePusher] User stopped typing:', data.user_id)
    })

    channelsRef.current.set(channelName, channel)
  }, [connectionState])

  /**
   * Unsubscribe from a conversation channel
   */
  const unsubscribeFromConversation = useCallback((conversationId: string) => {
    const pusher = pusherRef.current
    if (!pusher) return

    const channelName = `private-conversation-${conversationId}`
    
    if (channelsRef.current.has(channelName)) {
      console.log(`[usePusher] Unsubscribing from ${channelName}`)
      pusher.unsubscribe(channelName)
      channelsRef.current.delete(channelName)
    }
  }, [])

  /**
   * Subscribe to user's personal channel for conversation list updates
   */
  const subscribeToUserChannel = useCallback((
    userId: string,
    onConversationUpdate: (event: PusherConversationUpdateEvent) => void
  ) => {
    const pusher = pusherRef.current
    if (!pusher || connectionState === 'unavailable' || connectionState === 'failed') {
      console.warn('[usePusher] Cannot subscribe - Pusher not available')
      return
    }

    const channelName = `private-user-${userId}`
    
    // Don't re-subscribe if already subscribed
    if (channelsRef.current.has(channelName)) {
      console.log(`[usePusher] Already subscribed to ${channelName}`)
      return
    }

    console.log(`[usePusher] Subscribing to user channel ${channelName}`)
    const channel = pusher.subscribe(channelName)
    
    channel.bind('conversation-updated', (data: PusherConversationUpdateEvent) => {
      console.log('[usePusher] Conversation updated:', data.conversation_id)
      onConversationUpdate(data)
    })

    channelsRef.current.set(channelName, channel)
  }, [connectionState])

  /**
   * Unsubscribe from user's personal channel
   */
  const unsubscribeFromUserChannel = useCallback((userId: string) => {
    const pusher = pusherRef.current
    if (!pusher) return

    const channelName = `private-user-${userId}`
    
    if (channelsRef.current.has(channelName)) {
      console.log(`[usePusher] Unsubscribing from ${channelName}`)
      pusher.unsubscribe(channelName)
      channelsRef.current.delete(channelName)
    }
  }, [])

  return {
    connectionState,
    isConnected: connectionState === 'connected',
    subscribeToConversation,
    unsubscribeFromConversation,
    subscribeToUserChannel,
    unsubscribeFromUserChannel,
  }
}

/**
 * Convert Pusher message event to internal Message type
 */
export function pusherEventToMessage(event: PusherMessageEvent): Message {
  return {
    id: event.id,
    conversation_id: event.conversation_id,
    sender_id: event.sender_id,
    sender_name: event.sender_name,
    sender_avatar_url: event.sender_avatar || undefined,
    content: event.content,
    timestamp: event.created_at,
    read_status: false,
    attachments: event.attachment_url ? [{
      id: `${event.id}-attachment`,
      filename: event.attachment_filename || 'attachment',
      url: event.attachment_url,
      file_type: 'unknown',
      file_size: 0,
    }] : undefined,
  }
}

