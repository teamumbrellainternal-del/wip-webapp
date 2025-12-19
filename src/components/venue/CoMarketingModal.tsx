/**
 * CoMarketingModal Component
 * Modal with promo pack generator, analytics, and next show buzz
 */

import { Copy, Download, Sparkles, X, Users, Eye, Heart, UserPlus, TrendingUp } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import {
  mockPromoPackData,
  mockEventPromotionImpact,
  mockCommunityMetrics,
  mockNextShowBuzz,
} from '@/mocks/venue-data'

interface CoMarketingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CoMarketingModal({ open, onOpenChange }: CoMarketingModalProps) {
  const { toast } = useToast()

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(mockPromoPackData.socialCaption)
    toast({
      title: 'Copied!',
      description: 'Social media caption copied to clipboard',
    })
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
    }
    return num.toString()
  }

  const communityStats = [
    {
      icon: <Users className="h-5 w-5 text-purple-600" />,
      value: mockCommunityMetrics.community.value,
      label: 'Community',
      trend: mockCommunityMetrics.community.trend,
    },
    {
      icon: <Eye className="h-5 w-5 text-blue-600" />,
      value: mockCommunityMetrics.monthlyReach.value,
      label: 'Monthly Reach',
      trend: mockCommunityMetrics.monthlyReach.trend,
    },
    {
      icon: <Heart className="h-5 w-5 text-pink-600" />,
      value: mockCommunityMetrics.fanLove.value,
      label: 'Fan Love',
      trend: mockCommunityMetrics.fanLove.trend,
    },
    {
      icon: <UserPlus className="h-5 w-5 text-green-600" />,
      value: mockCommunityMetrics.newFans.value,
      label: 'New Fans',
      trend: mockCommunityMetrics.newFans.trend,
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-purple-600" />
            <div>
              <DialogTitle className="text-2xl">Co-Marketing Studio</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Generate promo packs and amplify every show together
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Promo Pack Generator */}
          <Card className="border-purple-200 bg-purple-50/50 dark:border-purple-800 dark:bg-purple-950/20">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold">Promo Pack Generator</h3>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">
                Every show deserves an audience. Auto-create your poster, QR, and caption in one click.
              </p>

              {/* Social Media Caption */}
              <div className="mb-4 rounded-lg border bg-background p-4">
                <p className="mb-2 text-sm font-medium text-muted-foreground">
                  Social Media Caption
                </p>
                <p className="mb-3 text-sm">{mockPromoPackData.socialCaption}</p>
                <Button variant="outline" size="sm" onClick={handleCopyCaption}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Caption
                </Button>
              </div>

              {/* Ticket QR Code */}
              <div className="mb-4 rounded-lg border bg-background p-4">
                <p className="mb-2 text-sm font-medium text-muted-foreground">
                  Ticket QR Code
                </p>
                <p className="mb-3 text-sm text-muted-foreground">
                  Direct link to ticket purchase page
                </p>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download QR
                </Button>
              </div>

              {/* Social Boost Toggle */}
              <div className="flex items-center justify-between rounded-lg border bg-background p-4">
                <div>
                  <p className="font-medium">Social Boost</p>
                  <p className="text-sm text-muted-foreground">
                    Amplify reach with targeted promotion (+$15)
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Event Promotion Impact */}
          <Card>
            <CardContent className="p-6">
              <h3 className="mb-4 font-semibold">Event Promotion Impact</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Post Engagement</span>
                  <span className="font-medium">
                    {mockEventPromotionImpact.postEngagement} interactions
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Shares</span>
                  <span className="font-medium">{mockEventPromotionImpact.shares} shares</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Click-through Rate</span>
                  <span className="font-medium">{mockEventPromotionImpact.clickThroughRate}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Community Metrics */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {communityStats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      {stat.icon}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <TrendingUp className="h-3 w-3" />
                      <span>{stat.trend}</span>
                    </div>
                  </div>
                  <p className="text-2xl font-bold">{formatNumber(stat.value)}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Next Show Buzz */}
          <Card className="border-purple-200 dark:border-purple-800">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold">Next Show Buzz</h3>
              </div>

              <div className="flex gap-4">
                {/* Show Image */}
                <img
                  src={mockNextShowBuzz.imageUrl}
                  alt={mockNextShowBuzz.title}
                  className="h-24 w-24 rounded-lg object-cover"
                />

                {/* Show Details */}
                <div className="flex-1">
                  <h4 className="font-semibold">{mockNextShowBuzz.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {mockNextShowBuzz.artistName} • {mockNextShowBuzz.date}
                  </p>

                  {/* Stats Row */}
                  <div className="mt-3 flex items-center gap-6">
                    <div>
                      <p className="text-xl font-bold">{mockNextShowBuzz.fansComing}</p>
                      <p className="text-xs text-muted-foreground">fans coming</p>
                    </div>
                    <div className="h-8 w-px bg-border" />
                    <div>
                      <p className="text-xl font-bold">{mockNextShowBuzz.capacityPercent}%</p>
                      <p className="text-xs text-muted-foreground">capacity</p>
                    </div>
                    <div className="h-8 w-px bg-border" />
                    <div>
                      <p className="text-xl font-bold">{mockNextShowBuzz.spotsLeft}</p>
                      <p className="text-xs text-muted-foreground">spots left</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Co-Marketing Tip */}
              <div className="mt-4 rounded-lg bg-purple-50 p-3 dark:bg-purple-950/30">
                <p className="text-sm">
                  <span className="mr-1">✨</span>
                  Your co-marketing with {mockNextShowBuzz.artistName.split(' ')[0]} is reaching{' '}
                  {formatNumber(mockNextShowBuzz.coMarketingReach)} new people. Keep sharing the
                  promo content!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}

