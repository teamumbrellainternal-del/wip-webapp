import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Send,
  Music,
  Briefcase,
  FileText,
  MessageCircle,
  ArrowLeft,
  Smile,
  Sparkles,
  Mic,
  Heart,
  Star,
  X,
  Bell,
} from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import LoadingState from '@/components/common/LoadingState'
import ErrorState from '@/components/common/ErrorState'
import { messagesService } from '@/services/api'
import type { Conversation, Message } from '@/types'
import { cn } from '@/lib/utils'
import { MetaTags } from '@/components/MetaTags'

const POLLING_INTERVAL = 5000 // 5 seconds

// Quick conversation starters with icons
const CONVERSATION_STARTERS = [
  { text: 'What inspires your music?', icon: Sparkles },
  { text: "What's your creative process?", icon: Mic },
  { text: 'Favorite venue to perform at?', icon: Star },
  { text: 'Dream collaboration?', icon: Heart },
]

// Mock notifications for the Figma design
const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    icon: '🎤',
    title: 'New Gig Opportunity',
    message: 'The Blue Note is looking for artists on Feb 15, 2025',
    action: 'View Details',
    type: 'gig',
  },
  {
    id: '2',
    icon: '💌',
    title: 'Message from Sarah Chen',
    message: 'Loved your latest track! Want to collab?',
    action: 'Reply',
    type: 'message',
  },
  {
    id: '3',
    icon: '📈',
    title: 'Milestone Reached!',
    message: "You've reached 850 followers!",
    action: null,
    type: 'milestone',
  },
]

export default function MessagesPage() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
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
  const [showNotifications, setShowNotifications] = useState(true)

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
      setConversations((prev) =>
        prev.map((conv) => (conv.id === convId ? { ...conv, unread_count: 0 } : conv))
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
    pollingIntervalRef.current = setInterval(async () => {
      await fetchConversations()

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

    try {
      setSending(true)
      const newMessage = await messagesService.sendMessage(conversationId, messageInput.trim())

      setMessages((prev) => [...prev, newMessage])
      setMessageInput('')

      setTimeout(scrollToBottom, 100)
      await fetchConversations()
    } catch (err) {
      console.error('Error sending message:', err)
      setError(err as Error)
    } finally {
      setSending(false)
    }
  }

  // Handle Enter key to send
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}d`

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date)
  }

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(date)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getTypeBadgeStyle = (contextType: string) => {
    switch (contextType) {
      case 'artist':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
      case 'venue':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
      case 'producer':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
      case 'band':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find((p) => p.id !== user?.id) || conversation.participants[0]
  }

  // Count total unread messages
  const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0)

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
      <MetaTags
        title="Messages"
        description="Chat with collaborators, venues, and artists on Umbrella"
        url="/messages"
        noIndex={true}
      />

      <div className="flex h-[calc(100vh-4rem)] flex-col">
          {/* Header */}
        <div className="border-b border-border/50 bg-background px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Messages & Collaboration</h1>
          </div>
        </div>

        {/* Three-column layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Column - Conversation List */}
          <div className="flex w-80 flex-col border-r border-border/50 bg-card/50">
            {/* Conversations Header */}
            <div className="border-b border-border/50 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Conversations</h2>
                {totalUnread > 0 && (
                  <Badge className="bg-purple-500 text-white">{totalUnread} new</Badge>
                )}
              </div>
          </div>

          {/* Conversation List */}
          <ScrollArea className="flex-1">
            {conversations.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                  <MessageCircle className="mb-4 h-12 w-12 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">No messages yet</p>
              </div>
            ) : (
                <div className="p-2">
                {conversations.map((conversation) => {
                  const otherParticipant = getOtherParticipant(conversation)
                  const isSelected = conversation.id === conversationId

                  return (
                      <div
                      key={conversation.id}
                      className={cn(
                          'mb-1 cursor-pointer rounded-lg p-3 transition-all hover:bg-muted/50',
                          isSelected && 'bg-purple-50 dark:bg-purple-900/20'
                      )}
                      onClick={() => handleSelectConversation(conversation)}
                    >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-11 w-11">
                            {otherParticipant.avatar_url && (
                              <AvatarImage src={otherParticipant.avatar_url} />
                            )}
                            <AvatarFallback className="bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                              {getInitials(otherParticipant.name)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="min-w-0 flex-1">
                            <div className="mb-1 flex items-center justify-between gap-2">
                              <span className="truncate text-sm font-semibold text-foreground">
                                {otherParticipant.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatTimestamp(conversation.updated_at)}
                              </span>
                            </div>

                            <div className="mb-1.5 flex items-center gap-2">
                              <p className="flex-1 truncate text-sm text-muted-foreground">
                                {conversation.last_message_preview}
                              </p>
                              {conversation.unread_count > 0 && (
                                <Badge className="h-5 min-w-5 bg-purple-500 px-1.5 text-xs text-white">
                                  {conversation.unread_count}
                                </Badge>
                              )}
                            </div>

                            <Badge
                              variant="secondary"
                              className={cn('text-xs capitalize', getTypeBadgeStyle(conversation.context_type))}
                            >
                              {conversation.context_type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </div>

          {/* Center Column - Chat View */}
        <div className="flex flex-1 flex-col bg-background">
          {!conversationId || !selectedConversation ? (
            <div className="flex flex-1 items-center justify-center p-8 text-center">
              <div>
                  <MessageCircle className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
                  <h3 className="mb-2 text-lg font-semibold">Select a conversation</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose a conversation to view messages
                </p>
              </div>
            </div>
          ) : (
            <>
                {/* Chat Header */}
                <div className="border-b border-border/50 bg-card/50 p-4">
                <div className="flex items-center gap-3">
                  {(() => {
                    const otherParticipant = getOtherParticipant(selectedConversation)
                    return (
                      <>
                        <Avatar className="h-10 w-10">
                          {otherParticipant.avatar_url && (
                            <AvatarImage src={otherParticipant.avatar_url} />
                          )}
                            <AvatarFallback className="bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                              {getInitials(otherParticipant.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h3 className="font-semibold text-foreground">{otherParticipant.name}</h3>
                            <p className="text-sm capitalize text-muted-foreground">
                              {selectedConversation.context_type}
                            </p>
                        </div>
                      </>
                    )
                  })()}
                </div>
              </div>

              {/* Messages */}
                <ScrollArea className="flex-1">
                  <div className="p-4">
                {messages.length === 0 ? (
                      <div className="flex h-full items-center justify-center py-12">
                        <p className="text-muted-foreground">Start the conversation!</p>
                  </div>
                ) : (
                      <div className="space-y-4">
                    {messages.map((message) => {
                      const isSender = message.sender_id === user.id

                      return (
                        <div
                          key={message.id}
                          className={cn('flex gap-3', isSender ? 'justify-end' : 'justify-start')}
                        >
                          <div
                            className={cn(
                                  'max-w-[70%] rounded-2xl px-4 py-3',
                                  isSender
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-muted/70'
                            )}
                          >
                                <p className="text-sm">{message.content}</p>
                            <p
                              className={cn(
                                'mt-1 text-xs',
                                    isSender ? 'text-white/70' : 'text-muted-foreground'
                              )}
                            >
                                  {formatMessageTime(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
                  </div>
              </ScrollArea>

                {/* Quick Starters */}
                <div className="border-t border-border/50 bg-card/30 px-4 py-3">
                  <p className="mb-2 text-xs text-muted-foreground">Quick conversation starters:</p>
                <div className="flex flex-wrap gap-2">
                    {CONVERSATION_STARTERS.map((starter, index) => {
                      const Icon = starter.icon
                      return (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                          className="h-8 gap-1.5 border-border/50 text-xs hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-950 dark:hover:text-purple-300"
                          onClick={() => handleInsertStarter(starter.text)}
                    >
                          <Icon className="h-3.5 w-3.5" />
                          {starter.text}
                    </Button>
                      )
                    })}
                  </div>
                </div>

                {/* Message Input */}
                <div className="border-t border-border/50 bg-card/50 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <Smile className="h-5 w-5 text-muted-foreground" />
                    </Button>
                    <Input
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type your message..."
                      className="flex-1 border-border/50 bg-muted/30"
                      disabled={sending}
                    />
                    <Button
                      size="icon"
                      className="h-9 w-9 bg-purple-500 hover:bg-purple-600"
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim() || sending}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Quick Share Buttons */}
                  <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                      className="h-8 gap-1.5 border-border/50 text-xs"
                        disabled
                      >
                      <Music className="h-3.5 w-3.5" />
                        Share Track
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                      className="h-8 gap-1.5 border-border/50 text-xs"
                        disabled
                      >
                      <Briefcase className="h-3.5 w-3.5" />
                        Share Portfolio
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                      className="h-8 gap-1.5 border-border/50 text-xs"
                        disabled
                      >
                      <FileText className="h-3.5 w-3.5" />
                        Share Gig Flyer
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Column - Notifications (Optional) */}
          {showNotifications && (
            <div className="hidden w-80 flex-col border-l border-border/50 bg-card/30 lg:flex">
              <div className="flex items-center justify-between border-b border-border/50 p-4">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Notifications</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setShowNotifications(false)}
                >
                  <X className="h-4 w-4" />
                      </Button>
                    </div>

              <ScrollArea className="flex-1">
                <div className="space-y-3 p-4">
                  {MOCK_NOTIFICATIONS.map((notification) => (
                    <Card key={notification.id} className="border-border/50">
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-sm dark:bg-purple-900/30">
                            {notification.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">{notification.title}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {notification.message}
                            </p>
                            {notification.action && (
                      <Button
                                variant="link"
                        size="sm"
                                className="mt-1 h-auto p-0 text-xs text-purple-600 dark:text-purple-400"
                              >
                                {notification.action}
                              </Button>
                            )}
                          </div>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <X className="h-3 w-3 text-muted-foreground" />
                      </Button>
                    </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
              </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
