import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, AlertCircle, MapPin, ArrowRight, Building2 } from 'lucide-react'

interface VenueStep1FormData {
  name: string
  tagline: string
  venue_type: string
  city: string
  state: string
}

const VENUE_TYPES = [
  { value: 'club', label: 'Club / Nightclub' },
  { value: 'bar', label: 'Bar / Pub' },
  { value: 'theater', label: 'Theater / Concert Hall' },
  { value: 'arena', label: 'Arena / Stadium' },
  { value: 'outdoor', label: 'Outdoor Venue' },
  { value: 'restaurant', label: 'Restaurant / Café' },
  { value: 'other', label: 'Other' },
]

export default function VenueOnboardingStep1() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<VenueStep1FormData>({
    defaultValues: {
      name: '',
      tagline: '',
      venue_type: '',
      city: '',
      state: '',
    },
  })

  const onSubmit = async (data: VenueStep1FormData) => {
    setError(null)
    setIsLoading(true)

    try {
      // Store step 1 data in localStorage to be submitted with step 2
      localStorage.setItem('venue_onboarding_step1', JSON.stringify(data))

      // Navigate to step 2
      navigate('/venue/onboarding/step2')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-purple-50 to-slate-50 dark:from-slate-950 dark:to-purple-950">
      {/* Progress bar */}
      <div className="fixed left-0 right-0 top-0 z-50 h-1 bg-slate-200 dark:bg-slate-800">
        <div
          className="h-full bg-purple-500 transition-all duration-500"
          style={{ width: '50%' }}
        />
      </div>

      {/* Step indicator */}
      <div className="mt-12 text-right pr-8 text-sm text-muted-foreground">
        Step 1 of 2
      </div>

      {/* Main content */}
      <div className="flex flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-lg shadow-xl">
          <CardContent className="pt-8">
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                <Building2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                Tell us about your venue
              </h1>
              <p className="mt-2 text-muted-foreground">
                Help artists discover your space
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
                {/* Venue Name */}
                <FormField
                  control={form.control}
                  name="name"
                  rules={{ required: 'Venue name is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Venue Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="The Velvet Room"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tagline */}
                <FormField
                  control={form.control}
                  name="tagline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tagline</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Intimate Jazz Club & Cocktail Lounge"
                          className="resize-none"
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        A short description that captures your venue's vibe
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Venue Type */}
                <FormField
                  control={form.control}
                  name="venue_type"
                  rules={{ required: 'Please select a venue type' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Venue Type <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select venue type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {VENUE_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Location */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    rules={{ required: 'City is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          City <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              className="pl-10"
                              placeholder="San Francisco"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="CA" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isLoading}
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
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

