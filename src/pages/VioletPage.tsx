import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Sparkles,
  Calendar,
  Music,
  TrendingUp,
  Users,
  Video,
  Brain,
  Heart,
  Disc3,
  ArrowLeft,
  Loader2,
  Send,
  Lightbulb,
  ChevronRight,
  Briefcase,
  Mic2,
  MessageCircle,
  Palette,
} from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import LoadingState from '@/components/common/LoadingState'
import ErrorState from '@/components/common/ErrorState'
import { violetService } from '@/services/api'
import type { VioletUsage, VioletResponse } from '@/types'
import { toast } from 'sonner'
import { MetaTags } from '@/components/MetaTags'

// Toolkit categories from Figma
const TOOLKIT_CATEGORIES = [
  {
    id: 'gigs-bookings',
    name: 'Gigs & Bookings',
    description: 'Your booking agent & venue manager',
    icon: Calendar,
    color: 'purple',
  },
  {
    id: 'creative-growth',
    name: 'Creative Growth',
    description: 'Your creative canvas & idea board',
    icon: Lightbulb,
    color: 'amber',
  },
  {
    id: 'music-production',
    name: 'Music Production',
    description: 'Your music creation partner',
    icon: Disc3,
    color: 'blue',
  },
  {
    id: 'networking',
    name: 'Networking & Collaboration',
    description: 'Your connection facilitator',
    icon: Users,
    color: 'green',
  },
  {
    id: 'career-management',
    name: 'Career Management',
    description: 'Your personal manager & strategist',
    icon: Briefcase,
    color: 'pink',
  },
]

// Quick action buttons from Figma
const QUICK_ACTIONS = [
  { id: 'book-gig', label: 'Book my next gig', icon: Calendar },
  { id: 'finish-track', label: 'Help me finish a track', icon: Music },
  { id: 'grow-fanbase', label: 'Grow my fanbase', icon: TrendingUp },
  { id: 'connect-artists', label: 'Connect with artists', icon: Users },
  { id: 'tiktok', label: 'Structure TikTok posts', icon: Video },
  { id: 'calendar', label: 'Manage my calendar', icon: Calendar },
]

// Feature cards from Figma
const FEATURE_CARDS = [
  {
    id: 'manager',
    title: 'Your Strategic Manager',
    description: 'Books gigs, negotiates rates, handles your calendar',
    icon: Brain,
    color: 'purple',
  },
  {
    id: 'mentor',
    title: 'Caring Mentor & Friend',
    description: 'Offers guidance, keeps you accountable, celebrates wins',
    icon: Heart,
    color: 'pink',
  },
  {
    id: 'creative',
    title: 'Creative Canvas',
    description: 'Brainstorming partner and idea board for songwriting',
    icon: Palette,
    color: 'amber',
  },
  {
    id: 'production',
    title: 'Production Partner',
    description: 'DAW tips, mixing guidance, sample recommendations',
    icon: Mic2,
    color: 'blue',
  },
]

// Sample conversations from Figma with mood indicators
const SAMPLE_CONVERSATIONS = [
  {
    prompt: "I'm feeling stuck on this bridge section...",
    response:
      "🎵 I hear you! Creative blocks happen to the best of us. Let's break this down into bite-sized pieces. What specific part is giving you trouble?",
    mood: 'caring',
    moodColor: 'pink',
  },
  {
    prompt: 'Find me a gig this weekend',
    response:
      '🎤 Found 3 venues for this weekend: The Blue Note (door split), DNA Lounge ($300 guarantee), and Café Central (intimate setting). Want me to send pitches?',
    mood: 'professional',
    moodColor: 'blue',
  },
  {
    prompt: 'Help me go viral on TikTok',
    response:
      "🚀 Here's your viral blueprint: Week 1 - Behind-the-scenes magic, Week 2 - Teaser drops, Week 3 - Full release. Ready to schedule these posts?",
    mood: 'playful',
    moodColor: 'purple',
  },
]

export default function VioletPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const toolkitRef = useRef<HTMLDivElement>(null)

  // State
  const [usage, setUsage] = useState<VioletUsage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [intentModalOpen, setIntentModalOpen] = useState(false)
  const [selectedIntent, setSelectedIntent] = useState<string | null>(null)
  const [freeFormPrompt, setFreeFormPrompt] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [violetResponse, setVioletResponse] = useState<VioletResponse | null>(null)

  useEffect(() => {
    fetchUsageData()
  }, [])

  const fetchUsageData = async () => {
    try {
      setLoading(true)
      const usageData = await violetService.getUsage()
      setUsage(usageData)
      setError(null)
    } catch (err) {
      setError(err as Error)
      console.error('Failed to fetch Violet usage:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleScrollToToolkit = () => {
    toolkitRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSubmitPrompt = async () => {
    if (!freeFormPrompt.trim() && !selectedIntent) {
      toast.error('Please enter a question or select an intent')
      return
    }

    try {
      setSubmitting(true)
      const prompt = freeFormPrompt.trim() || selectedIntent || ''
      const response = await violetService.sendPrompt(prompt)
      setVioletResponse(response)

      await fetchUsageData()

      toast.success('Violet has responded!')
      setFreeFormPrompt('')
      setSelectedIntent(null)
      setIntentModalOpen(false)
    } catch (err) {
      console.error('Failed to submit prompt:', err)
      toast.error('Failed to get response from Violet. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleQuickAction = (action: (typeof QUICK_ACTIONS)[0]) => {
    setFreeFormPrompt(action.label)
    setIntentModalOpen(true)
  }

  const handleSamplePrompt = (prompt: string) => {
    setFreeFormPrompt(prompt)
    setIntentModalOpen(true)
  }

  if (!user) return null

  if (loading) {
    return (
      <AppLayout>
        <LoadingState message="Loading Violet's Toolkit..." />
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <ErrorState error={error} title="Failed to load Violet" retry={fetchUsageData} />
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <MetaTags
        title="Violet AI"
        description="Your AI copilot for everything music - from gigs to production"
        url="/violet"
        noIndex={true}
      />

      <div className="flex h-[calc(100vh-4rem)] flex-col">
        {/* Header */}
        <div className="border-b border-border/50 bg-background px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Button>
            </div>

            {/* Usage Counter */}
            {usage && (
              <Badge variant="secondary" className="bg-purple-100 px-3 py-1.5 text-purple-700">
                <Sparkles className="mr-2 h-3.5 w-3.5" />
                {usage.prompts_used_today}/{usage.prompts_limit} prompts today
              </Badge>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - Toolkit Categories */}
          <div className="hidden w-80 flex-shrink-0 border-r border-border/50 bg-card/30 lg:block">
            <ScrollArea className="h-full">
              <div className="p-6">
                {/* Violet Avatar & Title */}
                <div className="mb-6 text-center">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                    <Sparkles className="h-10 w-10 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">Violet's Toolkit</h2>
                  <p className="text-sm text-muted-foreground">
                    Your AI copilot for everything music
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Manager • Mentor • Creative Partner
                  </p>
                </div>

                {/* Category Cards */}
                <div className="space-y-2">
                  {TOOLKIT_CATEGORIES.map((category) => {
                    const Icon = category.icon
                    return (
                      <Card
                        key={category.id}
                        className="cursor-pointer border-border/50 transition-all hover:border-purple-300 hover:shadow-sm dark:hover:border-purple-700"
                        onClick={() =>
                          handleSamplePrompt(`Help me with ${category.name.toLowerCase()}`)
                        }
                      >
                        <CardContent className="flex items-center gap-3 p-4">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                              category.color === 'purple'
                                ? 'bg-purple-100 dark:bg-purple-900/30'
                                : category.color === 'amber'
                                  ? 'bg-amber-100 dark:bg-amber-900/30'
                                  : category.color === 'blue'
                                    ? 'bg-blue-100 dark:bg-blue-900/30'
                                    : category.color === 'green'
                                      ? 'bg-green-100 dark:bg-green-900/30'
                                      : 'bg-pink-100 dark:bg-pink-900/30'
                            }`}
                          >
                            <Icon
                              className={`h-5 w-5 ${
                                category.color === 'purple'
                                  ? 'text-purple-600 dark:text-purple-400'
                                  : category.color === 'amber'
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : category.color === 'blue'
                                      ? 'text-blue-600 dark:text-blue-400'
                                      : category.color === 'green'
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-pink-600 dark:text-pink-400'
                              }`}
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-foreground">
                              {category.name}
                            </h3>
                            <p className="text-xs text-muted-foreground">{category.description}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* Center Content */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="mx-auto max-w-3xl p-6">
                {/* Hero Section */}
                <div className="mb-8 text-center">
                  <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 lg:hidden">
                    <Sparkles className="h-12 w-12 text-white" />
                  </div>
                  <h1 className="mb-2 text-3xl font-bold text-foreground">
                    Meet Violet — Your AI Copilot
                  </h1>
                  <p className="mb-6 text-lg text-muted-foreground">
                    From your next gig to your next song, I've got you covered.
                  </p>

                  {/* CTA Buttons */}
                  <div className="mb-8 flex flex-wrap justify-center gap-3">
                    <Button
                      size="lg"
                      className="gap-2 bg-purple-500 hover:bg-purple-600"
                      onClick={() => setIntentModalOpen(true)}
                    >
                      <Sparkles className="h-5 w-5" />
                      Start Creating Together
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="gap-2"
                      onClick={handleScrollToToolkit}
                    >
                      <MessageCircle className="h-5 w-5" />
                      Explore My Toolkit
                    </Button>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex flex-wrap justify-center gap-2">
                    {QUICK_ACTIONS.map((action) => {
                      const Icon = action.icon
                      return (
                        <Button
                          key={action.id}
                          variant="outline"
                          size="sm"
                          className="gap-2 border-border/50 hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-950 dark:hover:text-purple-300"
                          onClick={() => handleQuickAction(action)}
                        >
                          <Icon className="h-4 w-4" />
                          {action.label}
                        </Button>
                      )
                    })}
                  </div>
                </div>

                {/* What Makes Violet Special */}
                <div ref={toolkitRef} className="mb-8">
                  <h2 className="mb-4 text-xl font-bold text-foreground">
                    What Makes Violet Special
                  </h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {FEATURE_CARDS.map((feature) => {
                      const Icon = feature.icon
                      return (
                        <Card key={feature.id} className="border-border/50">
                          <CardContent className="flex items-start gap-3 p-4">
                            <div
                              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${
                                feature.color === 'purple'
                                  ? 'bg-purple-100 dark:bg-purple-900/30'
                                  : feature.color === 'pink'
                                    ? 'bg-pink-100 dark:bg-pink-900/30'
                                    : feature.color === 'amber'
                                      ? 'bg-amber-100 dark:bg-amber-900/30'
                                      : 'bg-blue-100 dark:bg-blue-900/30'
                              }`}
                            >
                              <Icon
                                className={`h-5 w-5 ${
                                  feature.color === 'purple'
                                    ? 'text-purple-600 dark:text-purple-400'
                                    : feature.color === 'pink'
                                      ? 'text-pink-600 dark:text-pink-400'
                                      : feature.color === 'amber'
                                        ? 'text-amber-600 dark:text-amber-400'
                                        : 'text-blue-600 dark:text-blue-400'
                                }`}
                              />
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground">{feature.title}</h3>
                              <p className="text-sm text-muted-foreground">{feature.description}</p>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>

                {/* Violet Response Display */}
                {violetResponse && (
                  <Card className="mb-8 border-purple-200 bg-purple-50/50 dark:border-purple-800 dark:bg-purple-950/30">
                    <CardContent className="p-6">
                      <div className="mb-4 flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500">
                          <Sparkles className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-semibold">Violet</span>
                      </div>
                      <p className="whitespace-pre-wrap text-foreground">
                        {violetResponse.response}
                      </p>
                      {violetResponse.suggestions && violetResponse.suggestions.length > 0 && (
                        <div className="mt-4 border-t border-purple-200 pt-4 dark:border-purple-800">
                          <p className="mb-2 text-sm font-medium">Follow-up suggestions:</p>
                          <div className="flex flex-wrap gap-2">
                            {violetResponse.suggestions.map((suggestion, i) => (
                              <Button
                                key={i}
                                variant="outline"
                                size="sm"
                                className="text-xs"
                                onClick={() => handleSamplePrompt(suggestion)}
                              >
                                {suggestion}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* See Violet in Action */}
                <div>
                  <h2 className="mb-4 text-xl font-bold text-foreground">See Violet in Action</h2>
                  <div className="space-y-4">
                    {SAMPLE_CONVERSATIONS.map((convo, index) => (
                      <Card
                        key={index}
                        className="cursor-pointer border-border/50 transition-all hover:border-purple-300 hover:shadow-md dark:hover:border-purple-700"
                        onClick={() => handleSamplePrompt(convo.prompt)}
                      >
                        <CardContent className="p-4">
                          {/* User Message */}
                          <div className="mb-3 flex justify-end">
                            <div className="max-w-[80%] rounded-2xl bg-muted/70 px-4 py-2">
                              <p className="text-sm">{convo.prompt}</p>
                            </div>
                          </div>

                          {/* Violet Response */}
                          <div className="flex gap-3">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                              <Sparkles className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <Badge
                                variant="secondary"
                                className={`mb-2 text-xs ${
                                  convo.moodColor === 'pink'
                                    ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300'
                                    : convo.moodColor === 'blue'
                                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                      : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                }`}
                              >
                                {convo.mood}
                              </Badge>
                              <p className="text-sm text-muted-foreground">{convo.response}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Intent Picker Modal */}
        <Dialog open={intentModalOpen} onOpenChange={setIntentModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                Ask Violet
              </DialogTitle>
              <DialogDescription>What can I help you with today?</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Quick Intent Buttons */}
              <div className="flex flex-wrap gap-2">
                {QUICK_ACTIONS.slice(0, 4).map((action) => {
                  const Icon = action.icon
                  return (
                    <Button
                      key={action.id}
                      variant={selectedIntent === action.id ? 'default' : 'outline'}
                      size="sm"
                      className={
                        selectedIntent === action.id ? 'bg-purple-500 hover:bg-purple-600' : ''
                      }
                      onClick={() => {
                        setSelectedIntent(action.id)
                        setFreeFormPrompt(action.label)
                      }}
                    >
                      <Icon className="mr-1.5 h-4 w-4" />
                      {action.label}
                    </Button>
                  )
                })}
              </div>

              <Separator />

              {/* Input Area */}
              <div className="flex gap-2">
                <Input
                  placeholder="Ask Violet anything..."
                  value={freeFormPrompt}
                  onChange={(e) => setFreeFormPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmitPrompt()
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  onClick={handleSubmitPrompt}
                  disabled={submitting || !freeFormPrompt.trim()}
                  className="bg-purple-500 hover:bg-purple-600"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Usage Counter */}
              {usage && (
                <p className="text-center text-xs text-muted-foreground">
                  {usage.prompts_used_today}/{usage.prompts_limit} prompts used today
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}
