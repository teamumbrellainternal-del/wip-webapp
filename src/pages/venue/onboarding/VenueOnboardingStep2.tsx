import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { apiClient } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, AlertCircle, ArrowLeft, Check, Users, Music } from 'lucide-react'

interface VenueStep2FormData {
  capacity: string
  stage_size: string
  sound_system: string
  has_green_room: boolean
  has_parking: boolean
  preferred_genres: string[]
}

const STAGE_SIZES = [
  { value: 'small', label: 'Small (Solo / Duo)' },
  { value: 'medium', label: 'Medium (Small Band)' },
  { value: 'large', label: 'Large (Full Band / Orchestra)' },
]

const GENRE_OPTIONS = [
  'Jazz',
  'Rock',
  'Electronic',
  'Hip-Hop',
  'R&B',
  'Country',
  'Classical',
  'Pop',
  'Indie',
  'Folk',
  'Blues',
  'Metal',
]

export default function VenueOnboardingStep2() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step1Data, setStep1Data] = useState<{
    name: string
    tagline: string
    venue_type: string
    city: string
    state: string
  } | null>(null)

  const form = useForm<VenueStep2FormData>({
    defaultValues: {
      capacity: '',
      stage_size: '',
      sound_system: '',
      has_green_room: false,
      has_parking: false,
      preferred_genres: [],
    },
  })

  // Load step 1 data
  useEffect(() => {
    const stored = localStorage.getItem('venue_onboarding_step1')
    if (stored) {
      setStep1Data(JSON.parse(stored))
    } else {
      // If no step 1 data, redirect back
      navigate('/venue/onboarding/step1')
    }
  }, [navigate])

  const onSubmit = async (data: VenueStep2FormData) => {
    if (!step1Data) {
      setError('Missing venue information. Please go back to step 1.')
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      // Combine step 1 and step 2 data
      const payload = {
        // Step 1 data
        name: step1Data.name,
        tagline: step1Data.tagline || undefined,
        venue_type: step1Data.venue_type as
          | 'club'
          | 'bar'
          | 'theater'
          | 'arena'
          | 'outdoor'
          | 'restaurant'
          | 'other',
        city: step1Data.city,
        state: step1Data.state || undefined,
        // Step 2 data
        capacity: data.capacity ? parseInt(data.capacity, 10) : undefined,
        stage_size: data.stage_size as 'small' | 'medium' | 'large' | undefined,
        sound_system: data.sound_system || undefined,
        has_green_room: data.has_green_room,
        has_parking: data.has_parking,
        preferred_genres:
          data.preferred_genres.length > 0 ? data.preferred_genres : undefined,
      }

      // Create venue profile
      await apiClient.createVenueProfile(payload)

      // Clear localStorage
      localStorage.removeItem('venue_onboarding_step1')

      // Navigate to venue dashboard
      navigate('/venue/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create venue profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenreToggle = (genre: string, checked: boolean) => {
    const current = form.getValues('preferred_genres')
    if (checked) {
      form.setValue('preferred_genres', [...current, genre])
    } else {
      form.setValue(
        'preferred_genres',
        current.filter((g) => g !== genre)
      )
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-purple-50 to-slate-50 dark:from-slate-950 dark:to-purple-950">
      {/* Progress bar */}
      <div className="fixed left-0 right-0 top-0 z-50 h-1 bg-slate-200 dark:bg-slate-800">
        <div
          className="h-full bg-purple-500 transition-all duration-500"
          style={{ width: '100%' }}
        />
      </div>

      {/* Step indicator */}
      <div className="mt-12 text-right pr-8 text-sm text-muted-foreground">
        Step 2 of 2
      </div>

      {/* Main content */}
      <div className="flex flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-lg shadow-xl">
          <CardContent className="pt-8">
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                Venue details
              </h1>
              <p className="mt-2 text-muted-foreground">
                Help artists know what to expect
              </p>
            </div>

            {/* Error alert */}
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Capacity */}
                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="280"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Maximum number of guests your venue can accommodate
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Stage Size */}
                <FormField
                  control={form.control}
                  name="stage_size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stage Size</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select stage size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {STAGE_SIZES.map((size) => (
                            <SelectItem key={size.value} value={size.value}>
                              {size.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Sound System */}
                <FormField
                  control={form.control}
                  name="sound_system"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sound System</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., JBL VRX 932LA with Yamaha mixer"
                          className="resize-none"
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Describe your audio setup (optional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Amenities */}
                <div className="space-y-4">
                  <FormLabel>Amenities</FormLabel>
                  <div className="flex gap-6">
                    <FormField
                      control={form.control}
                      name="has_green_room"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            Green Room
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="has_parking"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            Parking Available
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Preferred Genres */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Music className="h-4 w-4 text-muted-foreground" />
                    <FormLabel>Preferred Genres</FormLabel>
                  </div>
                  <FormDescription className="mt-0">
                    Select the music genres that fit your venue's vibe
                  </FormDescription>
                  <div className="flex flex-wrap gap-2">
                    {GENRE_OPTIONS.map((genre) => {
                      const isSelected = form
                        .watch('preferred_genres')
                        .includes(genre)
                      return (
                        <button
                          key={genre}
                          type="button"
                          onClick={() => handleGenreToggle(genre, !isSelected)}
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm transition-colors ${
                            isSelected
                              ? 'bg-purple-500 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3" />}
                          {genre}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/venue/onboarding/step1')}
                    disabled={isLoading}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating venue...
                      </>
                    ) : (
                      <>
                        Complete Setup
                        <Check className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

