import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '@clerk/clerk-react'
import { apiClient } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Lightbulb, AlertCircle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Tag options for each category based on api/utils/validation.ts
const ARTIST_TYPE_OPTIONS = [
  { id: 'solo', label: 'Solo Artist' },
  { id: 'band', label: 'Band' },
  { id: 'duo', label: 'Duo' },
  { id: 'trio', label: 'Trio' },
  { id: 'dj', label: 'DJ' },
  { id: 'producer', label: 'Producer' },
  { id: 'songwriter', label: 'Songwriter' },
  { id: 'vocalist', label: 'Vocalist' },
  { id: 'session-musician', label: 'Session Musician' },
  { id: 'multi-instrumentalist', label: 'Multi-Instrumentalist' },
]

const GENRE_OPTIONS = [
  'Rock', 'Pop', 'Hip-Hop', 'Jazz', 'Electronic', 'Country', 'R&B', 'Classical',
  'Indie', 'Folk', 'Blues', 'Metal', 'Punk', 'Reggae', 'Soul', 'Funk',
  'House', 'Techno', 'Drum & Bass', 'Latin', 'Afro-House', 'Minimal Techno',
  'Tech House', 'Indie Rock', 'Other',
]

const EQUIPMENT_OPTIONS = [
  'Audio Interface', 'Focusrite Scarlett', 'Universal Audio Apollo', 'PreSonus AudioBox', 'MOTU',
  'Condenser Microphone', 'Dynamic Microphone', 'USB Microphone', 'Shure SM7B', 'Rode NT1', 'Blue Yeti',
  'Studio Monitors', 'KRK Rokit', 'Yamaha HS Series', 'JBL Studio Monitors',
  'Studio Headphones', 'Audio-Technica', 'Beyerdynamic', 'Sennheiser',
  'MIDI Controller', 'MIDI Keyboard', 'Drum Pad Controller', 'Akai MPC', 'Native Instruments Maschine', 'Ableton Push',
  'Electric Guitar', 'Acoustic Guitar', 'Bass Guitar', 'Synthesizer', 'Piano/Keyboard', 'Drum Kit',
  'DJ Controller', 'Turntables', 'Mixing Console', 'Preamp', 'Compressor', 'EQ', 'Other',
]

const DAW_OPTIONS = [
  'Ableton Live', 'Logic Pro', 'Pro Tools', 'FL Studio', 'Cubase', 'Studio One',
  'Reaper', 'GarageBand', 'Reason', 'Bitwig', 'Cakewalk', 'Audacity', 'Other',
]

const PLATFORM_OPTIONS = [
  'Spotify', 'Apple Music', 'SoundCloud', 'Bandcamp', 'YouTube', 'YouTube Music',
  'TikTok', 'Instagram', 'Facebook', 'Twitter/X', 'Twitch', 'Mixcloud',
  'Beatport', 'Tidal', 'Amazon Music', 'Other',
]

const SUBSCRIPTION_OPTIONS = [
  'Spotify Premium', 'Apple Music', 'Splice', 'Sounds.com', 'LANDR',
  'DistroKid', 'CD Baby', 'TuneCore', 'Amuse', 'Ditto Music',
  'iZotope', 'Native Instruments', 'Waves', 'Plugin Boutique', 'Slate Digital',
  'Universal Audio', 'Soundtrap', 'BandLab', 'None', 'Other',
]

const STRUGGLE_OPTIONS = [
  'Finding gigs', 'Marketing myself', 'Social media presence', 'Building a fanbase',
  'Getting discovered', 'Networking', 'Pricing my services', 'Contract negotiations',
  'Time management', 'Creative block', 'Finding collaborators', 'Music production quality',
  'Mixing and mastering', 'Studio access', 'Equipment costs', 'Understanding royalties',
  'Distribution', 'Getting radio play', 'Getting press coverage', 'Managing finances',
  'Work-life balance', 'Imposter syndrome', 'Staying motivated', 'None', 'Other',
]

interface FormData {
  artist_type: string[]
  secondary_genres: string[]
  equipment: string[]
  daw: string[]
  platforms: string[]
  subscriptions: string[]
  struggles: string[]
  influences: string[]
}

interface FormErrors {
  [key: string]: string | undefined
}

export default function Step3() {
  const navigate = useNavigate()
  const { session } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [influencesText, setInfluencesText] = useState('')

  const [formData, setFormData] = useState<FormData>({
    artist_type: [],
    secondary_genres: [],
    equipment: [],
    daw: [],
    platforms: [],
    subscriptions: [],
    struggles: [],
    influences: [],
  })

  const toggleTag = (category: keyof FormData, value: string) => {
    setFormData((prev) => {
      const current = prev[category]
      const isSelected = current.includes(value)

      if (isSelected) {
        return {
          ...prev,
          [category]: current.filter((item) => item !== value),
        }
      } else {
        return {
          ...prev,
          [category]: [...current, value],
        }
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    try {
      const token = await session?.getToken()
      if (!token) {
        throw new Error('No authentication token')
      }

      // Convert influences text to array
      const influencesArray = influencesText
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)

      // Prepare request body (only include non-empty arrays)
      const requestBody: any = {}
      if (formData.artist_type.length > 0) requestBody.artist_type = formData.artist_type
      if (formData.secondary_genres.length > 0) requestBody.secondary_genres = formData.secondary_genres
      if (formData.equipment.length > 0) requestBody.equipment = formData.equipment
      if (formData.daw.length > 0) requestBody.daw = formData.daw
      if (formData.platforms.length > 0) requestBody.platforms = formData.platforms
      if (formData.subscriptions.length > 0) requestBody.subscriptions = formData.subscriptions
      if (formData.struggles.length > 0) requestBody.struggles = formData.struggles
      if (influencesArray.length > 0) requestBody.influences = influencesArray

      // Use apiClient with correct D1 endpoint
      await apiClient.request('/onboarding/artists/step3', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      })

      // Success - navigate to step 4
      navigate('/onboarding/artists/step4')
    } catch (error) {
      console.error('Error submitting step 3:', error)
      const message = error instanceof Error ? error.message : 'An error occurred. Please try again.'
      
      // Handle "Step 2 must be completed first" error
      if (message.includes('Step 2 must be completed first')) {
        setErrors({
          general: 'Please complete Step 2 first. Redirecting...',
        })
        setTimeout(() => navigate('/onboarding/artists/step2'), 2000)
      } else {
        setErrors({
          general: message,
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    navigate('/onboarding/artists/step2')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-slate-50 dark:from-slate-950 dark:to-purple-950 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Step 3 of 5</span>
            <span className="text-sm font-medium text-muted-foreground">60% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '60%' }}></div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Your Creative Profile Tags</CardTitle>
            <CardDescription>Select all tags that fit your profile for each category</CardDescription>
          </CardHeader>

          <CardContent>
            {/* Alert Banner */}
            <Alert className="mb-6 border-purple-600 bg-purple-50 dark:bg-purple-950">
              <Lightbulb className="h-4 w-4 text-purple-600" />
              <AlertDescription className="text-purple-900 dark:text-purple-100">
                These tags help us connect you with the right opportunities and collaborators!
              </AlertDescription>
            </Alert>

            {/* General Error Message */}
            {errors.general && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* 1. Type of Artist */}
              <div className="space-y-3">
                <Label className="text-lg font-semibold">Type of Artist</Label>
                <p className="text-sm text-muted-foreground">Select all that apply</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {ARTIST_TYPE_OPTIONS.map((option) => {
                    const isSelected = formData.artist_type.includes(option.id)
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => toggleTag('artist_type', option.id)}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                          isSelected
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700 hover:border-purple-400'
                        }`}
                      >
                        {option.label}
                      </button>
                    )
                  })}
                </div>
                {errors.artist_type && <p className="text-sm text-destructive">{errors.artist_type}</p>}
              </div>

              {/* 2. Genres */}
              <div className="space-y-3">
                <Label className="text-lg font-semibold">Genre(s) You Perform</Label>
                <p className="text-sm text-muted-foreground">Select all genres that describe your music (max 5)</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {GENRE_OPTIONS.map((genre) => {
                    const isSelected = formData.secondary_genres.includes(genre)
                    return (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => toggleTag('secondary_genres', genre)}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                          isSelected
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700 hover:border-purple-400'
                        }`}
                      >
                        {genre}
                      </button>
                    )
                  })}
                </div>
                <p className="text-xs text-muted-foreground">{formData.secondary_genres.length}/5 selected</p>
                {errors.secondary_genres && <p className="text-sm text-destructive">{errors.secondary_genres}</p>}
              </div>

              {/* 3. Influences */}
              <div className="space-y-3">
                <Label className="text-lg font-semibold">Musical Influences</Label>
                <p className="text-sm text-muted-foreground">
                  List artists or inspirations that influence your music (one per line, max 10)
                </p>
                <textarea
                  value={influencesText}
                  onChange={(e) => setInfluencesText(e.target.value)}
                  placeholder="e.g.,&#10;The Beatles&#10;Miles Davis&#10;Daft Punk"
                  className="w-full min-h-[120px] p-3 border rounded-lg bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  rows={5}
                />
                {errors.influences && <p className="text-sm text-destructive">{errors.influences}</p>}
              </div>

              {/* 4. Equipment */}
              <div className="space-y-3">
                <Label className="text-lg font-semibold">Equipment You Use</Label>
                <p className="text-sm text-muted-foreground">Select all equipment you own or use regularly (max 20)</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {EQUIPMENT_OPTIONS.map((equipment) => {
                    const isSelected = formData.equipment.includes(equipment)
                    return (
                      <button
                        key={equipment}
                        type="button"
                        onClick={() => toggleTag('equipment', equipment)}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                          isSelected
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700 hover:border-purple-400'
                        }`}
                      >
                        {equipment}
                      </button>
                    )
                  })}
                </div>
                <p className="text-xs text-muted-foreground">{formData.equipment.length}/20 selected</p>
                {errors.equipment && <p className="text-sm text-destructive">{errors.equipment}</p>}
              </div>

              {/* 5. Preferred DAW */}
              <div className="space-y-3">
                <Label className="text-lg font-semibold">Preferred DAW (Digital Audio Workstation)</Label>
                <p className="text-sm text-muted-foreground">Select the DAWs you use (max 5)</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {DAW_OPTIONS.map((daw) => {
                    const isSelected = formData.daw.includes(daw)
                    return (
                      <button
                        key={daw}
                        type="button"
                        onClick={() => toggleTag('daw', daw)}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                          isSelected
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700 hover:border-purple-400'
                        }`}
                      >
                        {daw}
                      </button>
                    )
                  })}
                </div>
                <p className="text-xs text-muted-foreground">{formData.daw.length}/5 selected</p>
                {errors.daw && <p className="text-sm text-destructive">{errors.daw}</p>}
              </div>

              {/* 6. Platforms */}
              <div className="space-y-3">
                <Label className="text-lg font-semibold">Platforms You Use to Reach Your Audience</Label>
                <p className="text-sm text-muted-foreground">Select all platforms where you share your music (max 15)</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {PLATFORM_OPTIONS.map((platform) => {
                    const isSelected = formData.platforms.includes(platform)
                    return (
                      <button
                        key={platform}
                        type="button"
                        onClick={() => toggleTag('platforms', platform)}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                          isSelected
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700 hover:border-purple-400'
                        }`}
                      >
                        {platform}
                      </button>
                    )
                  })}
                </div>
                <p className="text-xs text-muted-foreground">{formData.platforms.length}/15 selected</p>
                {errors.platforms && <p className="text-sm text-destructive">{errors.platforms}</p>}
              </div>

              {/* 7. Creative Subscriptions */}
              <div className="space-y-3">
                <Label className="text-lg font-semibold">Creative Subscriptions & Services</Label>
                <p className="text-sm text-muted-foreground">Select all subscriptions and services you use (max 15)</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {SUBSCRIPTION_OPTIONS.map((subscription) => {
                    const isSelected = formData.subscriptions.includes(subscription)
                    return (
                      <button
                        key={subscription}
                        type="button"
                        onClick={() => toggleTag('subscriptions', subscription)}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                          isSelected
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700 hover:border-purple-400'
                        }`}
                      >
                        {subscription}
                      </button>
                    )
                  })}
                </div>
                <p className="text-xs text-muted-foreground">{formData.subscriptions.length}/15 selected</p>
                {errors.subscriptions && <p className="text-sm text-destructive">{errors.subscriptions}</p>}
              </div>

              {/* 8. Struggles */}
              <div className="space-y-3">
                <Label className="text-lg font-semibold">What Do You Struggle With Most?</Label>
                <p className="text-sm text-muted-foreground">
                  Select the challenges you face when reaching new listeners (max 10)
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {STRUGGLE_OPTIONS.map((struggle) => {
                    const isSelected = formData.struggles.includes(struggle)
                    return (
                      <button
                        key={struggle}
                        type="button"
                        onClick={() => toggleTag('struggles', struggle)}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                          isSelected
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700 hover:border-purple-400'
                        }`}
                      >
                        {struggle}
                      </button>
                    )
                  })}
                </div>
                <p className="text-xs text-muted-foreground">{formData.struggles.length}/10 selected</p>
                {errors.struggles && <p className="text-sm text-destructive">{errors.struggles}</p>}
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1 bg-purple-600 hover:bg-purple-700">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Next'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
