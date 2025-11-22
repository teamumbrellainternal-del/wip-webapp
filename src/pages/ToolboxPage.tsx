import { useNavigate } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sparkles,
  FolderOpen,
  Palette,
  MessageSquare,
  ArrowRight,
  Zap,
  FileAudio,
  Users,
  Wand2
} from 'lucide-react'
import { MetaTags } from '@/components/MetaTags'

/**
 * Artist Toolbox Page
 *
 * Central hub for all artist tools and features.
 * Provides quick access to:
 * - Violet AI Assistant
 * - File Manager
 * - Creative Studio
 * - Fan Messaging
 */
export default function ToolboxPage() {
  const navigate = useNavigate()

  const tools = [
    {
      id: 'violet',
      name: 'Violet AI',
      description: 'Your AI-powered creative assistant for brainstorming, songwriting, and career advice',
      icon: Sparkles,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      path: '/violet',
      features: [
        'Creative brainstorming and ideation',
        'Songwriting assistance',
        'Career strategy guidance',
        'Music industry insights',
        'Marketing ideas'
      ],
      badge: 'AI-Powered',
      badgeVariant: 'default' as const
    },
    {
      id: 'files',
      name: 'File Manager',
      description: 'Organize, upload, and manage your music files, press kits, and promotional materials',
      icon: FolderOpen,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      path: '/tools/files',
      features: [
        'Upload audio files (MP3, WAV, FLAC)',
        'Store press kits and EPKs',
        'Organize promotional materials',
        'Share files with venues',
        'Cloud storage integration'
      ]
    },
    {
      id: 'studio',
      name: 'Creative Studio',
      description: 'Create and publish content to engage with your fans and build your brand',
      icon: Palette,
      iconBg: 'bg-pink-100',
      iconColor: 'text-pink-600',
      path: '/tools/studio',
      features: [
        'Post updates and announcements',
        'Share behind-the-scenes content',
        'Showcase your creative process',
        'Build your artist brand',
        'Engage with your community'
      ]
    },
    {
      id: 'message-fans',
      name: 'Message Fans',
      description: 'Broadcast updates and connect with your fanbase through targeted messaging',
      icon: MessageSquare,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      path: '/tools/message-fans',
      features: [
        'Send broadcast messages',
        'Segment your audience',
        'Schedule announcements',
        'Track engagement',
        'Build fan relationships'
      ],
      badge: 'Beta',
      badgeVariant: 'secondary' as const
    }
  ]

  const usageStats = [
    { label: 'AI Conversations', value: '24', icon: Sparkles },
    { label: 'Files Stored', value: '156', icon: FileAudio },
    { label: 'Studio Posts', value: '12', icon: Palette },
    { label: 'Fans Reached', value: '1.2K', icon: Users }
  ]

  return (
    <AppLayout>
      <MetaTags
        title="Artist Toolbox"
        description="Access all your creative tools in one place"
        url="/tools"
      />

      <div className="container max-w-7xl mx-auto py-8 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Wand2 className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Artist Toolbox</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Everything you need to create, manage, and grow your music career in one place.
          </p>
        </div>

        {/* Usage Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {usageStats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <stat.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon
            return (
              <Card
                key={tool.id}
                className="group hover:shadow-lg transition-all cursor-pointer relative"
                onClick={() => navigate(tool.path)}
              >
                {tool.badge && (
                  <div className="absolute top-4 right-4">
                    <Badge variant={tool.badgeVariant}>{tool.badge}</Badge>
                  </div>
                )}
                <CardHeader className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${tool.iconBg}`}>
                      <Icon className={`h-8 w-8 ${tool.iconColor}`} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">
                        {tool.name}
                      </CardTitle>
                      <CardDescription className="text-base">
                        {tool.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Features List */}
                  <ul className="space-y-2">
                    {tool.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Zap className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Action Button */}
                  <Button
                    variant="outline"
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(tool.path)
                    }}
                  >
                    Open {tool.name}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Tips */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Pro Tips for Using Your Toolbox
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">🎯 Start with Violet AI</h4>
              <p className="text-sm text-muted-foreground">
                Not sure where to begin? Chat with Violet for personalized recommendations
                on how to use these tools to achieve your goals.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">📁 Keep Your Files Organized</h4>
              <p className="text-sm text-muted-foreground">
                Upload high-quality audio files and press materials to make it easy for
                venues to book you. A well-organized portfolio increases booking rates by 40%.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">📢 Engage Regularly</h4>
              <p className="text-sm text-muted-foreground">
                Use Creative Studio and Fan Messaging to stay connected with your audience.
                Artists who post weekly see 3x more engagement than those who don't.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Coming Soon Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Coming Soon</CardTitle>
            <CardDescription>
              We're constantly building new tools to help you succeed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <div className="font-medium text-sm">📊 Analytics Dashboard</div>
                <p className="text-xs text-muted-foreground">
                  Deep insights into your performance and growth trends
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <div className="font-medium text-sm">🤝 Collaboration Hub</div>
                <p className="text-xs text-muted-foreground">
                  Connect and collaborate with other artists
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <div className="font-medium text-sm">💰 Revenue Tracking</div>
                <p className="text-xs text-muted-foreground">
                  Track earnings, splits, and financial analytics
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
