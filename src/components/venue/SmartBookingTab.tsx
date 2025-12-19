/**
 * SmartBookingTab Component
 * Calendar view with booking management and smart features toggles
 */

import { useState } from 'react'
import { Calendar, Search, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { BookingCalendar } from './BookingCalendar'
import { mockCalendarEvents, mockSmartFeatures, type SmartFeatures } from '@/mocks/venue-data'

export function SmartBookingTab() {
  const [smartFeatures, setSmartFeatures] = useState<SmartFeatures>(mockSmartFeatures)

  const toggleFeature = (feature: keyof SmartFeatures) => {
    setSmartFeatures((prev) => ({
      ...prev,
      [feature]: !prev[feature],
    }))
  }

  const smartFeaturesList = [
    {
      id: 'instantConfirmations' as const,
      title: 'Instant Confirmations',
      description: 'Let artists you trust book open slots immediately',
    },
    {
      id: 'artistChat' as const,
      title: 'Artist Chat',
      description: 'Message directly with booked artists about show details',
    },
    {
      id: 'autoPromotions' as const,
      title: 'Auto Promotions',
      description: 'Generate promo packs when shows are confirmed',
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="mb-6 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white">
        <div className="flex items-center gap-3">
          <Calendar className="h-6 w-6" />
          <div>
            <h2 className="text-2xl font-bold">Book Your Stage</h2>
            <p className="text-purple-100">
              Manage shows and collaborate with artists effortlessly
            </p>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="mb-6">
        <BookingCalendar events={mockCalendarEvents} />
      </div>

      {/* Book Artist CTA */}
      <Button className="mb-6 w-full bg-purple-600 py-6 text-base hover:bg-purple-700">
        <Search className="mr-2 h-5 w-5" />
        Book Artist for Open Dates
      </Button>

      {/* Smart Features Section */}
      <Card className="border-border/50">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold">Smart Features</h3>
          </div>

          <div className="space-y-4">
            {smartFeaturesList.map((feature) => (
              <div
                key={feature.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <p className="font-medium">{feature.title}</p>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
                <Switch
                  checked={smartFeatures[feature.id]}
                  onCheckedChange={() => toggleFeature(feature.id)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
