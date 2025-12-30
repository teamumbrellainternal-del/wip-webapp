import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { apiClient } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Loader2, AlertCircle, MapPin, ArrowRight, Link2, Check, X } from 'lucide-react'
import OnboardingLayout from '@/components/onboarding/OnboardingLayout'
import { validateMaxLength, VALIDATION_LIMITS } from '@/lib/validation'

interface Step1FormData {
  full_name: string
  stage_name: string
  slug: string
  location: string
  primary_genre: string
  bio: string
}

// Helper to generate slug from name
function generateSlugFromName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50)
}

export default function OnboardingStep1() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [slugAvailability, setSlugAvailability] = useState<{
    checking: boolean
    available: boolean | null
    suggestion?: string
  }>({ checking: false, available: null })

  const form = useForm<Step1FormData>({
    defaultValues: {
      full_name: '',
      stage_name: '',
      slug: '',
      location: '',
      primary_genre: '',
      bio: '',
    },
  })

  // Watch stage_name to auto-generate slug
  const stageName = useWatch({ control: form.control, name: 'stage_name' })
  const currentSlug = useWatch({ control: form.control, name: 'slug' })

  // Auto-generate slug when stage_name changes and slug is empty or matches previous auto-generated
  useEffect(() => {
    if (stageName && !currentSlug) {
      const generatedSlug = generateSlugFromName(stageName)
      form.setValue('slug', generatedSlug)
    }
  }, [stageName, currentSlug, form])

  // Check slug availability
  const checkSlugAvailability = useCallback(async (slug: string) => {
    if (!slug || slug.length < 3) {
      setSlugAvailability({ checking: false, available: null })
      return
    }

    setSlugAvailability({ checking: true, available: null })
    try {
      const response = await fetch(`/v1/profile/slug/${slug}/available`)
      const data = await response.json()
      if (data.success) {
        setSlugAvailability({
          checking: false,
          available: data.data.available,
          suggestion: data.data.suggestion,
        })
      } else {
        setSlugAvailability({ checking: false, available: false })
      }
    } catch {
      setSlugAvailability({ checking: false, available: null })
    }
  }, [])

  const onSubmit = async (data: Step1FormData) => {
    setError(null)
    setIsLoading(true)

    try {
      // Parse location into city and state
      const locationParts = data.location.split(',').map((part) => part.trim())
      const city = locationParts[0] || ''
      const state = locationParts[1] || ''

      // Prepare API payload (map to existing API structure)
      const payload = {
        stage_name: data.stage_name,
        slug: data.slug || undefined, // Include slug in payload
        location_city: city,
        location_state: state,
        legal_name: data.full_name || undefined,
        genre_primary: data.primary_genre ? [data.primary_genre.toLowerCase()] : undefined,
        // Store bio in localStorage for now (can be added to profile later)
      }

      // Store additional data locally for profile completion
      localStorage.setItem(
        'onboarding_step1',
        JSON.stringify({
          full_name: data.full_name,
          bio: data.bio,
          primary_genre: data.primary_genre,
        })
      )

      // Call API
      await apiClient.submitOnboardingStep1(payload)

      // Navigate to step 2 on success
      navigate('/onboarding/artists/step2')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save your profile'
      setError(errorMessage)
      console.error('Error submitting step 1:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <OnboardingLayout currentStep={1} showBack={false}>
      <Card className="border-0 bg-card/80 shadow-xl backdrop-blur-sm">
        <CardContent className="p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-heading-32 text-foreground">Let's create your profile</h1>
            <p className="text-copy-16 mt-2 text-muted-foreground">
              Tell us about yourself and your music
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Full Name & Artist Name Row */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="full_name"
                  rules={{
                    validate: (value) =>
                      validateMaxLength(value, VALIDATION_LIMITS.FULL_NAME, 'Full name'),
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your legal name"
                          className="h-12 rounded-lg border-border bg-muted/50 focus:border-purple-500 focus:ring-purple-500/20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stage_name"
                  rules={{
                    required: 'Artist name is required',
                    maxLength: {
                      value: 100,
                      message: 'Artist name must be 100 characters or less',
                    },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Artist Name <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your stage name"
                          className="h-12 rounded-lg border-border bg-muted/50 focus:border-purple-500 focus:ring-purple-500/20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Profile URL (Slug) */}
              <FormField
                control={form.control}
                name="slug"
                rules={{
                  required: 'Profile URL is required',
                  minLength: {
                    value: 3,
                    message: 'Profile URL must be at least 3 characters',
                  },
                  maxLength: {
                    value: 50,
                    message: 'Profile URL must be 50 characters or less',
                  },
                  pattern: {
                    value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                    message: 'Only lowercase letters, numbers, and hyphens allowed',
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Profile URL <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="your-artist-name"
                          className="h-12 rounded-lg border-border bg-muted/50 pl-10 pr-10 focus:border-purple-500 focus:ring-purple-500/20"
                          {...field}
                          onChange={(e) => {
                            // Normalize input as user types
                            const value = e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9-]/g, '')
                              .replace(/-+/g, '-')
                            field.onChange(value)
                          }}
                          onBlur={(e) => {
                            field.onBlur()
                            checkSlugAvailability(e.target.value)
                          }}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {slugAvailability.checking && (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          )}
                          {!slugAvailability.checking && slugAvailability.available === true && (
                            <Check className="h-4 w-4 text-green-500" />
                          )}
                          {!slugAvailability.checking && slugAvailability.available === false && (
                            <X className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs text-muted-foreground">
                      Your profile will be at: umbrellalive.com/artist/{field.value || 'your-name'}
                    </FormDescription>
                    {slugAvailability.available === false && slugAvailability.suggestion && (
                      <p className="text-xs text-amber-600">
                        This URL is taken. Try:{' '}
                        <button
                          type="button"
                          className="font-medium underline"
                          onClick={() => {
                            form.setValue('slug', slugAvailability.suggestion!)
                            setSlugAvailability({ checking: false, available: true })
                          }}
                        >
                          {slugAvailability.suggestion}
                        </button>
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location & Primary Genre Row */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="location"
                  rules={{
                    required: 'Location is required',
                    validate: (value) => {
                      const parts = value.split(',').map((p) => p.trim())
                      if (parts.length < 2 || !parts[1]) {
                        return 'Please enter location as "City, State" (e.g., San Francisco, CA)'
                      }
                      return true
                    },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Location <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            placeholder="City, State"
                            className="h-12 rounded-lg border-border bg-muted/50 pl-10 focus:border-purple-500 focus:ring-purple-500/20"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormDescription className="text-xs text-muted-foreground">
                        Format: City, State (e.g., Los Angeles, CA)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="primary_genre"
                  rules={{
                    validate: (value) => validateMaxLength(value, VALIDATION_LIMITS.GENRE, 'Genre'),
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Primary Genre</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Rock, Jazz, Electronic"
                          className="h-12 rounded-lg border-border bg-muted/50 focus:border-purple-500 focus:ring-purple-500/20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Bio */}
              <FormField
                control={form.control}
                name="bio"
                rules={{
                  validate: (value) => validateMaxLength(value, VALIDATION_LIMITS.BIO, 'Bio'),
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us your story, your musical journey, and what drives your passion..."
                        className="min-h-[120px] resize-none rounded-lg border-border bg-muted/50 focus:border-purple-500 focus:ring-purple-500/20"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-muted-foreground">
                      {field.value?.length || 0}/{VALIDATION_LIMITS.BIO} characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Continue Button */}
              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-12 min-w-[140px] bg-purple-500 px-6 font-semibold hover:bg-purple-600"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </OnboardingLayout>
  )
}
