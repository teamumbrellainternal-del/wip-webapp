import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { CharacterCounter } from '@/components/ui/character-counter'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Send,
  Paperclip,
  Music,
  Briefcase,
  FileText,
  MessageCircle,
} from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import LoadingState from '@/components/common/LoadingState'
import ErrorState from '@/components/common/ErrorState'
import { messagesService } from '@/services/api'
import type { Conversation, Message } from '@/types'
import { cn } from '@/lib/utils'

const MESSAGE_CHAR_LIMIT = 2000
const POLLING_INTERVAL = 5000 // 5 seconds

// Quick conversation starters
const CONVERSATION_STARTERS = [
  "Thanks for reaching out!",
  "I'd love to collaborate!",
  "Let me check my availability",
  "Can you tell me more about this?",
  "Looking forward to working together!",
]

export default function MessagesPage() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const navigate = useNavigate()
  const { user, clerkUser } = useAuth()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // State
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Fetch conversations list
  const fetchConversations = useCallback(async () => {
    try {
      const data = await messagesService.getConversations()
      setConversations(data)
      setError(null)
    } catch (err) {
      console.error('Error fetching conversations:', err)
      setError(err as Error)
    }
  }, [])

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (convId: string) => {
    try {
      const conversation = await messagesService.getThread(convId)
      setSelectedConversation(conversation)
      setMessages(conversation.messages || [])
      setError(null)

      // Mark as read
      await messagesService.markAsRead(convId)

      // Update conversations list to reflect read status
      setConversations(prev =>
        prev.map(conv =>
          conv.id === convId
            ? { ...conv, unread_count: 0 }
            : conv
        )
      )

      // Scroll to bottom after messages load
      setTimeout(scrollToBottom, 100)
    } catch (err) {
      console.error('Error fetching messages:', err)
      setError(err as Error)
    }
  }, [])

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await fetchConversations()

      if (conversationId) {
        await fetchMessages(conversationId)
      }

      setLoading(false)
    }

    loadData()
  }, [conversationId, fetchConversations, fetchMessages])

  // Polling for new messages
  useEffect(() => {
    // Poll conversations list
    pollingIntervalRef.current = setInterval(async () => {
      await fetchConversations()

      // If a conversation is selected, poll its messages too
      if (conversationId) {
        await fetchMessages(conversationId)
      }
    }, POLLING_INTERVAL)

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [conversationId, fetchConversations, fetchMessages])

  // Handle conversation selection
  const handleSelectConversation = (conversation: Conversation) => {
    navigate(`/messages/${conversation.id}`)
  }

  // Handle sending message
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !conversationId || sending) return
    if (messageInput.length > MESSAGE_CHAR_LIMIT) return

    try {
      setSending(true)
      const newMessage = await messagesService.sendMessage(conversationId, messageInput.trim())

      // Add message to local state immediately for better UX
      setMessages(prev => [...prev, newMessage])
      setMessageInput('')

      // Scroll to bottom
      setTimeout(scrollToBottom, 100)

      // Refresh conversations to update preview
      await fetchConversations()
    } catch (err) {
      console.error('Error sending message:', err)
      setError(err as Error)
    } finally {
      setSending(false)
    }
  }

  // Handle Enter key to send
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Insert conversation starter
  const handleInsertStarter = (starter: string) => {
    setMessageInput(starter)
  }

  // Utility functions
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getContextBadgeVariant = (contextType: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (contextType) {
      case 'artist':
        return 'default'
      case 'venue':
        return 'secondary'
      case 'producer':
        return 'outline'
      case 'band':
        return 'destructive'
      default:
        return 'default'
    }
  }

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p.id !== user?.id) || conversation.participants[0]
  }

  if (!user) return null

  if (loading) {
    return (
      <AppLayout>
        <LoadingState message="Loading messages..." />
      </AppLayout>
    )
  }

  if (error && conversations.length === 0) {
    return (
      <AppLayout>
        <ErrorState error={error} retry={fetchConversations} />
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="h-[calc(100vh-4rem)] flex">
        {/* Left Sidebar - Conversation List */}
        <div className="w-full md:w-80 lg:w-96 border-r bg-muted/30 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b bg-background">
            <h2 className="text-xl font-bold">Messages</h2>
            <p className="text-sm text-muted-foreground">
              {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Conversation List */}
          <ScrollArea className="flex-1">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <MessageCircle className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground font-medium">No messages yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Start a conversation to get connected
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {conversations.map((conversation) => {
                  const otherParticipant = getOtherParticipant(conversation)
                  const isSelected = conversation.id === conversationId

                  return (
                    <Card
                      key={conversation.id}
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md",
                        isSelected && "border-primary bg-primary/5"
                      )}
                      onClick={() => handleSelectConversation(conversation)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-12 w-12">
                            {otherParticipant.avatar_url && (
                              <AvatarImage src={otherParticipant.avatar_url} />
                            )}
                            <AvatarFallback>
                              {getInitials(otherParticipant.name)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <p className="font-semibold text-sm truncate">
                                {otherParticipant.name}
                              </p>
                              <Badge variant={getContextBadgeVariant(conversation.context_type)}>
                                {conversation.context_type}
                              </Badge>
                            </div>

                            <p className="text-sm text-muted-foreground truncate mb-1">
                              {conversation.last_message_preview}
                            </p>

                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {formatTimestamp(conversation.updated_at)}
                              </span>
                              {conversation.unread_count > 0 && (
                                <Badge variant="default" className="h-5 min-w-5 px-1.5">
                                  {conversation.unread_count}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Main Panel - Message Thread */}
        <div className="flex-1 flex flex-col bg-background">
          {!conversationId || !selectedConversation ? (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <MessageCircle className="h-20 w-20 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Select a conversation</h3>
                <p className="text-muted-foreground">
                  Choose a conversation from the sidebar to view messages
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b bg-muted/30">
                <div className="flex items-center gap-3">
                  {(() => {
                    const otherParticipant = getOtherParticipant(selectedConversation)
                    return (
                      <>
                        <Avatar className="h-10 w-10">
                          {otherParticipant.avatar_url && (
                            <AvatarImage src={otherParticipant.avatar_url} />
                          )}
                          <AvatarFallback>
                            {getInitials(otherParticipant.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold">{otherParticipant.name}</h3>
                          <p className="text-sm text-muted-foreground">{otherParticipant.role}</p>
                        </div>
                        <Badge variant={getContextBadgeVariant(selectedConversation.context_type)}>
                          {selectedConversation.context_type}
                        </Badge>
                      </>
                    )
                  })()}
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-4 pb-4">
                    {messages.map((message) => {
                      const isSender = message.sender_id === user.id

                      return (
                        <div
                          key={message.id}
                          className={cn(
                            "flex gap-3",
                            isSender ? "justify-end" : "justify-start"
                          )}
                        >
                          {!isSender && (
                            <Avatar className="h-8 w-8">
                              {message.sender_avatar_url && (
                                <AvatarImage src={message.sender_avatar_url} />
                              )}
                              <AvatarFallback>
                                {getInitials(message.sender_name)}
                              </AvatarFallback>
                            </Avatar>
                          )}

                          <div
                            className={cn(
                              "max-w-[70%] rounded-lg px-4 py-2",
                              isSender
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            )}
                          >
                            {!isSender && (
                              <p className="text-xs font-medium mb-1">
                                {message.sender_name}
                              </p>
                            )}
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {message.content}
                            </p>
                            <p
                              className={cn(
                                "text-xs mt-1",
                                isSender
                                  ? "text-primary-foreground/70"
                                  : "text-muted-foreground"
                              )}
                            >
                              {formatTimestamp(message.timestamp)}
                            </p>
                          </div>

                          {isSender && (
                            <Avatar className="h-8 w-8">
                              {clerkUser?.imageUrl && (
                                <AvatarImage src={clerkUser.imageUrl} />
                              )}
                              <AvatarFallback>
                                {getInitials(user?.name || 'You')}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Message Input Area */}
              <div className="border-t bg-muted/30 p-4 space-y-3">
                {/* Quick Conversation Starters */}
                <div className="flex flex-wrap gap-2">
                  {CONVERSATION_STARTERS.map((starter, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleInsertStarter(starter)}
                      className="text-xs"
                    >
                      {starter}
                    </Button>
                  ))}
                </div>

                <Separator />

                {/* Input Area */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Textarea
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type your message... (Shift+Enter for new line)"
                      className="min-h-[80px] resize-none"
                      maxLength={MESSAGE_CHAR_LIMIT}
                      disabled={sending}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled
                        title="Attachment feature coming soon"
                      >
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled
                        title="Share track feature coming soon"
                      >
                        <Music className="h-4 w-4 mr-1" />
                        Share Track
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled
                        title="Share portfolio feature coming soon"
                      >
                        <Briefcase className="h-4 w-4 mr-1" />
                        Share Portfolio
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled
                        title="Share gig flyer feature coming soon"
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Share Gig Flyer
                      </Button>
                    </div>

                    <div className="flex items-center gap-3">
                      <CharacterCounter
                        current={messageInput.length}
                        maximum={MESSAGE_CHAR_LIMIT}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim() || messageInput.length > MESSAGE_CHAR_LIMIT || sending}
                        size="sm"
                      >
                        <Send className="h-4 w-4 mr-1" />
                        {sending ? 'Sending...' : 'Send'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
