import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { apiClient } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Loader2, AlertCircle, Lightbulb } from 'lucide-react'

interface Step1FormData {
  stage_name: string
  location_city: string
  location_state: string
  location_zip?: string
  phone_number?: string
  legal_name?: string
  pronouns?: string
  inspirations?: string
  genre_primary?: string[]
}

const GENRE_OPTIONS = [
  { id: 'rock', label: 'Rock' },
  { id: 'pop', label: 'Pop' },
  { id: 'hip-hop', label: 'Hip-Hop' },
  { id: 'jazz', label: 'Jazz' },
  { id: 'electronic', label: 'Electronic' },
  { id: 'country', label: 'Country' },
  { id: 'r&b', label: 'R&B' },
  { id: 'classical', label: 'Classical' },
  { id: 'indie', label: 'Indie' },
  { id: 'folk', label: 'Folk' },
]

export default function OnboardingStep1() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<Step1FormData>({
    defaultValues: {
      stage_name: '',
      location_city: '',
      location_state: '',
      location_zip: '',
      phone_number: '',
      legal_name: '',
      pronouns: '',
      inspirations: '',
      genre_primary: [],
    },
  })

  const selectedGenres = form.watch('genre_primary') || []

  const onSubmit = async (data: Step1FormData) => {
    setError(null)
    setIsLoading(true)

    try {
      // Convert inspirations textarea to array
      const inspirationsArray = data.inspirations
        ? data.inspirations
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line.length > 0)
        : undefined

      // Prepare API payload
      const payload = {
        stage_name: data.stage_name,
        location_city: data.location_city,
        location_state: data.location_state,
        location_zip: data.location_zip || undefined,
        phone_number: data.phone_number || undefined,
        legal_name: data.legal_name || undefined,
        pronouns: data.pronouns || undefined,
        inspirations: inspirationsArray,
        genre_primary: data.genre_primary && data.genre_primary.length > 0 ? data.genre_primary : undefined,
      }

      // Call API
      await apiClient.submitOnboardingStep1(payload)

      // Navigate to step 2 on success
      navigate('/onboarding/artists/step2')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit step 1'
      setError(errorMessage)
      console.error('Error submitting step 1:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenreToggle = (genreId: string) => {
    const currentGenres = form.getValues('genre_primary') || []

    if (currentGenres.includes(genreId)) {
      // Remove genre
      form.setValue(
        'genre_primary',
        currentGenres.filter((g) => g !== genreId)
      )
    } else {
      // Add genre (max 3)
      if (currentGenres.length < 3) {
        form.setValue('genre_primary', [...currentGenres, genreId])
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-slate-50 dark:from-slate-950 dark:to-purple-950 p-4">
      <div className="max-w-3xl mx-auto py-8">
        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Step 1 of 5</span>
            <span className="text-sm font-medium text-muted-foreground">20% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '20%' }}></div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Identity & Basics</CardTitle>
            <CardDescription>Tell us who you are as an artist</CardDescription>
          </CardHeader>

          <CardContent>
            {/* Alert Banner */}
            <Alert className="mb-6 border-purple-600 bg-purple-50 dark:bg-purple-950">
              <Lightbulb className="h-4 w-4 text-purple-600" />
              <AlertDescription className="text-purple-900 dark:text-purple-100">
                The better your responses to this form, the better the platform will be able to help you grow!
              </AlertDescription>
            </Alert>

            {/* Error Message */}
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Stage Name (Required) */}
                <FormField
                  control={form.control}
                  name="stage_name"
                  rules={{
                    required: 'Artist/stage name is required',
                    maxLength: {
                      value: 100,
                      message: 'Artist/stage name must be 100 characters or less',
                    },
                    validate: (value) => value.trim().length > 0 || 'Artist/stage name cannot be empty',
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Artist/Stage Name <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your artist or stage name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Location Fields (Required) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="location_city"
                    rules={{
                      required: 'City is required',
                      maxLength: {
                        value: 100,
                        message: 'City must be 100 characters or less',
                      },
                      validate: (value) => value.trim().length > 0 || 'City cannot be empty',
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          City <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your city" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location_state"
                    rules={{
                      required: 'State is required',
                      maxLength: {
                        value: 50,
                        message: 'State must be 50 characters or less',
                      },
                      validate: (value) => value.trim().length > 0 || 'State cannot be empty',
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          State <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your state" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Inspirations (Optional) */}
                <FormField
                  control={form.control}
                  name="inspirations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inspirations (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter artists or inspirations (one per line)"
                          className="resize-none"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        List artists or inspirations that influence your music (one per line)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Genre Selection (Optional, Max 3) */}
                <FormField
                  control={form.control}
                  name="genre_primary"
                  render={() => (
                    <FormItem>
                      <FormLabel>Primary Genres (Optional, Select up to 3)</FormLabel>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                        {GENRE_OPTIONS.map((genre) => {
                          const isSelected = selectedGenres.includes(genre.id)
                          const isDisabled = !isSelected && selectedGenres.length >= 3

                          return (
                            <div
                              key={genre.id}
                              className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                                isSelected
                                  ? 'border-purple-600 bg-purple-50 dark:bg-purple-950'
                                  : isDisabled
                                  ? 'border-gray-200 bg-gray-50 dark:bg-gray-900 opacity-50 cursor-not-allowed'
                                  : 'border-gray-200 hover:border-purple-400 dark:border-gray-700'
                              }`}
                              onClick={() => !isDisabled && handleGenreToggle(genre.id)}
                            >
                              <Checkbox
                                checked={isSelected}
                                disabled={isDisabled}
                                onCheckedChange={() => handleGenreToggle(genre.id)}
                              />
                              <Label className="cursor-pointer">{genre.label}</Label>
                            </div>
                          )
                        })}
                      </div>
                      <FormDescription>
                        Select up to 3 genres that best describe your music ({selectedGenres.length}/3 selected)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Form Actions */}
                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/onboarding/role-selection')}
                    disabled={isLoading}
                  >
                    Back
                  </Button>
                  <Button type="submit" disabled={isLoading} className="bg-purple-600 hover:bg-purple-700">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Next'
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
