/**
 * Violet AI Chat Page
 * Full chat interface for conversations with Violet AI per Figma design
 * Supports multi-turn conversations with 30 message context window
 */

import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { violetService } from '@/services/api'
import { ChatHeader, ChatMessage, ChatInput } from '@/components/violet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { MetaTags } from '@/components/MetaTags'
import type { VioletConversation, VioletMessage, VioletUsage } from '@/types'

export default function VioletChatPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { conversationId } = useParams<{ conversationId?: string }>()
  const [searchParams] = useSearchParams()
  const initialPrompt = searchParams.get('prompt')

  // State
  const [conversation, setConversation] = useState<VioletConversation | null>(null)
  const [messages, setMessages] = useState<VioletMessage[]>([])
  const [usage, setUsage] = useState<VioletUsage | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Refs
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const initialPromptSentRef = useRef(false)

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport]'
      )
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  // Load conversation or create new one
  useEffect(() => {
    async function initialize() {
      if (!user) {
        navigate('/violet')
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Fetch usage stats
        const usageData = await violetService.getUsage()
        setUsage(usageData)

        if (conversationId) {
          // Load existing conversation
          const data = await violetService.getConversation(conversationId)
          setConversation(data.conversation)
          setMessages(data.messages)
        } else {
          // Create new conversation
          const data = await violetService.createConversation()
          setConversation(data.conversation)
          setMessages([])

          // Update URL with new conversation ID
          navigate(`/violet/chat/${data.conversation.id}`, { replace: true })
        }
      } catch (err) {
        console.error('Failed to initialize chat:', err)
        setError('Failed to load chat. Please try again.')
        toast.error('Failed to load chat')
      } finally {
        setLoading(false)
      }
    }

    initialize()
  }, [user, conversationId, navigate])

  // Send initial prompt if provided via URL
  useEffect(() => {
    if (
      initialPrompt &&
      conversation &&
      !loading &&
      messages.length === 0 &&
      !initialPromptSentRef.current
    ) {
      initialPromptSentRef.current = true
      handleSendMessage(initialPrompt)
    }
  }, [initialPrompt, conversation, loading, messages.length])

  const handleSendMessage = async (content: string) => {
    if (!conversation || sending) return

    // Check rate limit
    if (usage && usage.prompts_used_today >= usage.prompts_limit) {
      toast.error('Daily prompt limit reached. Try again tomorrow.')
      return
    }

    try {
      setSending(true)

      // Optimistic UI: Add user message immediately
      const tempUserMessage: VioletMessage = {
        id: `temp-user-${Date.now()}`,
        conversation_id: conversation.id,
        role: 'user',
        content,
        tokens_used: null,
        mood: null,
        context: null,
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, tempUserMessage])

      // Send to API
      const response = await violetService.sendMessage(conversation.id, content)

      // Replace temp message with real ones
      setMessages((prev) => {
        // Remove temp message and add real messages
        const filtered = prev.filter((m) => m.id !== tempUserMessage.id)
        return [...filtered, response.user_message, response.assistant_message]
      })

      // Update usage
      if (usage) {
        setUsage({
          ...usage,
          prompts_used_today: usage.prompts_limit - response.remaining_prompts,
        })
      }
    } catch (err) {
      console.error('Failed to send message:', err)
      toast.error('Failed to send message. Please try again.')

      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => !m.id.startsWith('temp-')))
    } finally {
      setSending(false)
    }
  }

  const handleBack = () => {
    navigate('/violet')
  }

  if (!user) return null

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen flex-col bg-background">
        <MetaTags
          title="Violet AI Chat"
          description="Chat with Violet AI"
          url="/violet/chat"
          noIndex={true}
        />
        <ChatHeader onBack={handleBack} />
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            <p className="text-sm text-muted-foreground">Loading chat...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen flex-col bg-background">
        <MetaTags
          title="Violet AI Chat"
          description="Chat with Violet AI"
          url="/violet/chat"
          noIndex={true}
        />
        <ChatHeader onBack={handleBack} />
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-destructive">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-purple-500 hover:underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    )
  }

  const remainingPrompts = usage ? usage.prompts_limit - usage.prompts_used_today : undefined

  return (
    <div className="flex h-screen flex-col bg-background">
      <MetaTags
        title="Violet AI Chat"
        description="Chat with Violet, your AI creative copilot"
        url="/violet/chat"
        noIndex={true}
      />

      {/* Header */}
      <ChatHeader onBack={handleBack} />

      {/* Messages Area */}
      <ScrollArea ref={scrollAreaRef} className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-6">
          {messages.length === 0 ? (
            // Empty state
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-emerald-500">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h2 className="mb-2 text-xl font-semibold text-foreground">
                Start a conversation with Violet
              </h2>
              <p className="max-w-md text-sm text-muted-foreground">
                Ask me anything about your music career - from booking gigs to songwriting tips, I'm
                here to help you succeed.
              </p>
            </div>
          ) : (
            // Messages list
            <div className="space-y-6">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}

              {/* Loading indicator when sending */}
              {sending && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-emerald-500">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl rounded-tl-md bg-muted/50 px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Violet is thinking...</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <ChatInput
        onSend={handleSendMessage}
        disabled={!conversation}
        isLoading={sending}
        remainingPrompts={remainingPrompts}
      />
    </div>
  )
}
