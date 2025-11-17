import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Sparkles,
  Calendar,
  Music,
  Megaphone,
  Users,
  Video,
  Brain,
  Heart,
  Disc3,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  Loader2,
  Send,
  Star,
  Lightbulb,
  Target,
  Zap,
  MessageCircle
} from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import LoadingState from '@/components/common/LoadingState'
import ErrorState from '@/components/common/ErrorState'
import { violetService } from '@/services/api'
import type { VioletUsage, VioletResponse } from '@/types'
import { toast } from 'sonner'

interface ToolkitCategory {
  id: string
  name: string
  icon: React.ReactNode
  popular?: boolean
  subTools?: {
    id: string
    name: string
    popular?: boolean
  }[]
}

const TOOLKIT_CATEGORIES: ToolkitCategory[] = [
  {
    id: 'gigs-bookings',
    name: 'Gigs & Bookings',
    icon: <Calendar className="h-5 w-5" />,
    popular: true,
    subTools: [
      { id: 'find-venues', name: 'Find Perfect Venues', popular: true },
      { id: 'negotiate', name: 'Negotiate Like a Pro' },
      { id: 'brand-partnerships', name: 'Brand Partnerships' }
    ]
  },
  {
    id: 'creative-growth',
    name: 'Creative Growth',
    icon: <Lightbulb className="h-5 w-5" />,
    popular: true,
    subTools: [
      { id: 'songwriting', name: 'Songwriting', popular: true },
      { id: 'ticket-sales', name: 'Ticket Sales & Promos' },
      { id: 'brand-partnerships-2', name: 'Brand Partnerships' }
    ]
  },
  {
    id: 'songwriting-journal',
    name: 'Songwriting Journal',
    icon: <Music className="h-5 w-5" />
  },
  {
    id: 'vinyl-content',
    name: 'Vinyl Content Strategy',
    icon: <Disc3 className="h-5 w-5" />,
    popular: true
  },
  {
    id: 'fan-engagement',
    name: 'Fan Engagement',
    icon: <Heart className="h-5 w-5" />
  },
  {
    id: 'visual-branding',
    name: 'Visual Branding',
    icon: <Sparkles className="h-5 w-5" />
  },
  {
    id: 'creative-challenges',
    name: 'Creative Challenges',
    icon: <Target className="h-5 w-5" />
  },
  {
    id: 'music-production',
    name: 'Music Production',
    icon: <Disc3 className="h-5 w-5" />,
    popular: true,
    subTools: [
      { id: 'daw-setup', name: 'DAW Setup & Tips' },
      { id: 'mixing-mastering', name: 'Mixing & Mastering' },
      { id: 'music-theory', name: 'Musical Theory' },
      { id: 'samples-loops', name: 'Samples & Loops Library' },
      { id: 'bpm-rhythm', name: 'BPM & Rhythm' },
      { id: 'finish-tracks', name: 'Finish Your Tracks' }
    ]
  },
  {
    id: 'networking',
    name: 'Networking & Collaboration',
    icon: <Users className="h-5 w-5" />,
    popular: true,
    subTools: [
      { id: 'connect-locally', name: 'Connect Locally', popular: true },
      { id: 'find-partners', name: 'Find Partners' },
      { id: 'find-mentors', name: 'Find Mentors' },
      { id: 'collab-groups', name: 'Collaboration Groups' },
      { id: 'industry-events', name: 'Industry Events' }
    ]
  },
  {
    id: 'career-management',
    name: 'Career Management',
    icon: <Brain className="h-5 w-5" />,
    subTools: [
      { id: 'calendar-mgmt', name: 'Calendar Management' },
      { id: 'goal-achievement', name: 'Goal Achievement' },
      { id: 'email-marketing', name: 'Email Marketing' },
      { id: 'travel-opportunities', name: 'Travel Opportunities' },
      { id: 'long-term-strategy', name: 'Long-term Strategy' }
    ]
  }
]

const INTENT_OPTIONS = [
  { id: 'find-gig', label: 'Find gig', icon: <Calendar className="h-5 w-5" /> },
  { id: 'finish-track', label: 'Finish track', icon: <Music className="h-5 w-5" /> },
  { id: 'grow-fanbase', label: 'Grow fanbase', icon: <Megaphone className="h-5 w-5" /> },
  { id: 'connect-artists', label: 'Connect with artists', icon: <Users className="h-5 w-5" /> },
  { id: 'plan-content', label: 'Plan content', icon: <Video className="h-5 w-5" /> },
  { id: 'get-advice', label: 'Get advice', icon: <MessageCircle className="h-5 w-5" /> }
]

const SAMPLE_CONVERSATIONS = [
  {
    prompt: "I'm feeling stuck on this bridge section...",
    preview: "Let's explore some creative approaches to your bridge..."
  },
  {
    prompt: "Find me a gig this weekend!",
    preview: "I'll help you search for local gigs happening this weekend..."
  },
  {
    prompt: "Help me roll out on TikTok",
    preview: "Great! Let's create a content strategy for your TikTok launch..."
  }
]

export default function VioletPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const toolkitRef = useRef<HTMLDivElement>(null)

  // State
  const [usage, setUsage] = useState<VioletUsage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
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

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
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

      // Refresh usage counter
      await fetchUsageData()

      toast.success('Violet has responded!')
      setFreeFormPrompt('')
      setSelectedIntent(null)
    } catch (err) {
      console.error('Failed to submit prompt:', err)
      toast.error('Failed to get response from Violet. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleIntentSelect = (intentId: string) => {
    setSelectedIntent(intentId)
    const intent = INTENT_OPTIONS.find(i => i.id === intentId)
    if (intent) {
      setFreeFormPrompt(intent.label)
    }
  }

  const handleSamplePrompt = async (prompt: string) => {
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
        <ErrorState
          title="Failed to load Violet"
          message={error.message}
          action={{
            label: 'Try Again',
            onClick: fetchUsageData
          }}
        />
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        {/* Header */}
        <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/dashboard')}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Dashboard
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">Violet's Toolkit</h1>
                  <p className="text-sm text-muted-foreground">Your AI copilot for everything music</p>
                </div>
              </div>

              {/* Usage Counter */}
              {usage && (
                <Badge variant="secondary" className="px-4 py-2">
                  <Sparkles className="h-4 w-4 mr-2" />
                  {usage.prompts_used_today}/{usage.prompts_limit} prompts used today
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Sidebar - Toolkit Categories */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    Toolkit Categories
                  </CardTitle>
                  <CardDescription>Explore Violet's AI-powered tools</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-1 p-4">
                      {TOOLKIT_CATEGORIES.map((category) => (
                        <div key={category.id} className="space-y-1">
                          <button
                            onClick={() => category.subTools && toggleCategory(category.id)}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-left"
                          >
                            {category.subTools && (
                              expandedCategories.has(category.id) ? (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              )
                            )}
                            {!category.subTools && <div className="w-4" />}
                            <div className="text-purple-600">{category.icon}</div>
                            <span className="flex-1 font-medium text-sm">{category.name}</span>
                            {category.popular && (
                              <Badge variant="secondary" className="text-xs">Popular</Badge>
                            )}
                          </button>

                          {/* Sub-tools */}
                          {category.subTools && expandedCategories.has(category.id) && (
                            <div className="ml-8 space-y-1">
                              {category.subTools.map((subTool) => (
                                <button
                                  key={subTool.id}
                                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-left text-sm text-muted-foreground"
                                >
                                  <span className="flex-1">{subTool.name}</span>
                                  {subTool.popular && (
                                    <Badge variant="outline" className="text-xs">Popular</Badge>
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Hero Section */}
              <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
                <CardContent className="p-8">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                        <Sparkles className="h-12 w-12" />
                      </div>
                    </div>
                    <div className="flex-1 space-y-4">
                      <div>
                        <h2 className="text-3xl font-bold mb-2">Meet Violet — Your AI Copilot</h2>
                        <p className="text-lg text-purple-100">
                          From your next gig to your next song, I've got you covered.
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <Button
                          size="lg"
                          variant="secondary"
                          onClick={() => setIntentModalOpen(true)}
                          className="gap-2"
                        >
                          <Sparkles className="h-5 w-5" />
                          Start Creating Together
                        </Button>
                        <Button
                          size="lg"
                          variant="outline"
                          onClick={handleScrollToToolkit}
                          className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
                        >
                          Explore My Toolkit
                        </Button>
                      </div>

                      {/* Feature Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4" />
                          <span>Book my next gig</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Music className="h-4 w-4" />
                          <span>Finish a track</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Megaphone className="h-4 w-4" />
                          <span>Grow my fanbase</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4" />
                          <span>Connect with artists</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Video className="h-4 w-4" />
                          <span>Structure TikTok posts</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4" />
                          <span>Manage my calendar</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* What Makes Violet Special */}
              <div ref={toolkitRef}>
                <h3 className="text-2xl font-bold mb-4">What Makes Violet Special</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                        <Brain className="h-6 w-6 text-purple-600" />
                      </div>
                      <CardTitle className="text-lg">Your Strategic Manager</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Books gigs, negotiates rates, handles your calendar
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-2">
                        <Heart className="h-6 w-6 text-teal-600" />
                      </div>
                      <CardTitle className="text-lg">Emotional Co-Pilot</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Brainstorms lyrics and idea board for songwriting
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-2">
                        <Heart className="h-6 w-6 text-pink-600" />
                      </div>
                      <CardTitle className="text-lg">Caring Mentor & Friend</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Offers guidance, keeps you motivated, celebrates wins
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                        <Music className="h-6 w-6 text-blue-600" />
                      </div>
                      <CardTitle className="text-lg">Production Partner</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        DAW tips, mixing guidance, sample recommendations
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* See Violet in Action */}
              <div>
                <h3 className="text-2xl font-bold mb-4">See Violet in Action</h3>
                <div className="space-y-3">
                  {SAMPLE_CONVERSATIONS.map((convo, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <Button
                          variant="ghost"
                          onClick={() => handleSamplePrompt(convo.prompt)}
                          className="w-full text-left justify-start h-auto p-0 hover:bg-transparent"
                        >
                          <div className="space-y-2">
                            <div className="flex items-start gap-3">
                              <MessageCircle className="h-5 w-5 text-purple-600 mt-0.5" />
                              <p className="font-medium">{convo.prompt}</p>
                            </div>
                            <div className="flex items-start gap-3 ml-8">
                              <Sparkles className="h-4 w-4 text-pink-600 mt-0.5" />
                              <p className="text-sm text-muted-foreground">{convo.preview}</p>
                            </div>
                          </div>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Violet Response Display */}
              {violetResponse && (
                <Card className="border-purple-200 bg-purple-50/50">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                      <CardTitle>Violet's Response</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{violetResponse.response}</p>
                    {violetResponse.suggestions && violetResponse.suggestions.length > 0 && (
                      <div className="mt-4">
                        <p className="font-medium mb-2">Suggestions:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {violetResponse.suggestions.map((suggestion, i) => (
                            <li key={i} className="text-sm text-muted-foreground">{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Intent Picker Modal */}
        <Dialog open={intentModalOpen} onOpenChange={setIntentModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                Start Creating Together
              </DialogTitle>
              <DialogDescription>
                Choose a category or describe what you need help with
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Intent Category Buttons */}
              <div>
                <p className="text-sm font-medium mb-3">What do you need help with?</p>
                <div className="grid grid-cols-2 gap-3">
                  {INTENT_OPTIONS.map((intent) => (
                    <Button
                      key={intent.id}
                      variant={selectedIntent === intent.id ? 'default' : 'outline'}
                      onClick={() => handleIntentSelect(intent.id)}
                      className="justify-start gap-2 h-auto py-3"
                    >
                      {intent.icon}
                      <span>{intent.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Free-form Input */}
              <div>
                <p className="text-sm font-medium mb-3">Or describe in your own words</p>
                <Textarea
                  placeholder="Describe what you need help with..."
                  value={freeFormPrompt}
                  onChange={(e) => setFreeFormPrompt(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmitPrompt}
                disabled={submitting || (!freeFormPrompt.trim() && !selectedIntent)}
                className="w-full gap-2"
                size="lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Asking Violet...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Ask Violet
                  </>
                )}
              </Button>

              {/* Usage Counter in Modal */}
              {usage && (
                <div className="text-center text-sm text-muted-foreground">
                  {usage.prompts_used_today}/{usage.prompts_limit} prompts used today
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}
