import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import { apiClient } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
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
import { Loader2, AlertCircle, Lightbulb, CalendarIcon, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step4FormData {
  largest_show_capacity: number
  flat_rate: number
  hourly_rate: number
  time_split_creative: number
  available_dates: Date[]
}

export default function OnboardingStep4() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<Step4FormData>({
    defaultValues: {
      largest_show_capacity: 0,
      flat_rate: 0,
      hourly_rate: 0,
      time_split_creative: 50,
      available_dates: [],
    },
  })

  const creativeSplit = form.watch('time_split_creative')
  const logisticsSplit = 100 - creativeSplit
  const selectedDates = form.watch('available_dates') || []

  const onSubmit = async (data: Step4FormData) => {
    setError(null)
    setIsLoading(true)

    try {
      // Prepare API payload
      const payload = {
        largest_show_capacity: data.largest_show_capacity,
        flat_rate: data.flat_rate,
        hourly_rate: data.hourly_rate,
        time_split_creative: data.time_split_creative,
        time_split_logistics: 100 - data.time_split_creative,
        available_dates: data.available_dates.map((date) => format(date, 'yyyy-MM-dd')),
      }

      // Call API
      await apiClient.submitOnboardingStep4(payload)

      // Navigate to step 5 on success
      navigate('/onboarding/artists/step5')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit step 4'
      setError(errorMessage)
      console.error('Error submitting step 4:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return

    const currentDates = form.getValues('available_dates') || []

    // Check if date is already selected
    const dateExists = currentDates.some(
      (d: Date) => format(d, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    )

    if (dateExists) {
      // Remove the date
      form.setValue(
        'available_dates',
        currentDates.filter((d: Date) => format(d, 'yyyy-MM-dd') !== format(date, 'yyyy-MM-dd'))
      )
    } else if (currentDates.length < 3) {
      // Add the date (max 3)
      form.setValue('available_dates', [...currentDates, date])
    }
  }

  const removeDate = (dateToRemove: Date) => {
    const currentDates = form.getValues('available_dates') || []
    form.setValue(
      'available_dates',
      currentDates.filter((d: Date) => format(d, 'yyyy-MM-dd') !== format(dateToRemove, 'yyyy-MM-dd'))
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-slate-50 dark:from-slate-950 dark:to-purple-950 p-4">
      <div className="max-w-3xl mx-auto py-8">
        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Step 4 of 5</span>
            <span className="text-sm font-medium text-muted-foreground">80% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '80%' }}></div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Your Numbers</CardTitle>
            <CardDescription>Help us understand your scale and availability</CardDescription>
          </CardHeader>

          <CardContent>
            {/* Alert Banner */}
            <Alert className="mb-6 border-purple-600 bg-purple-50 dark:bg-purple-950">
              <Lightbulb className="h-4 w-4 text-purple-600" />
              <AlertDescription className="text-purple-900 dark:text-purple-100">
                These details help match you with the right opportunities and collaborators!
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
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Largest Show Capacity */}
                <FormField
                  control={form.control}
                  name="largest_show_capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Largest show you've played</FormLabel>
                      <FormDescription>
                        What facility ticket sold at your biggest performance?
                      </FormDescription>
                      <FormControl>
                        <div className="space-y-4">
                          <Slider
                            min={0}
                            max={1000}
                            step={10}
                            value={[field.value]}
                            onValueChange={(vals: number[]) => field.onChange(vals[0])}
                            className="w-full"
                          />
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>0</span>
                            <span className="font-semibold text-foreground">
                              {field.value === 1000 ? '1,000+' : field.value} people
                            </span>
                            <span>1,000+</span>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Flat Rate */}
                <FormField
                  control={form.control}
                  name="flat_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Flat rate (per show/event)</FormLabel>
                      <FormDescription>
                        What's your typical flat rate for a complete performance?
                      </FormDescription>
                      <FormControl>
                        <div className="space-y-4">
                          <Slider
                            min={0}
                            max={5000}
                            step={50}
                            value={[field.value]}
                            onValueChange={(vals: number[]) => field.onChange(vals[0])}
                            className="w-full"
                          />
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>$0</span>
                            <span className="font-semibold text-foreground">
                              {field.value === 5000 ? '$5,000+' : `$${field.value.toLocaleString()}`}
                            </span>
                            <span>$5,000+</span>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Hourly Rate */}
                <FormField
                  control={form.control}
                  name="hourly_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hourly rate</FormLabel>
                      <FormDescription>
                        What's your hourly rate for sessions, studio time, or consulting?
                      </FormDescription>
                      <FormControl>
                        <div className="space-y-4">
                          <Slider
                            min={0}
                            max={500}
                            step={5}
                            value={[field.value]}
                            onValueChange={(vals: number[]) => field.onChange(vals[0])}
                            className="w-full"
                          />
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>$0/hr</span>
                            <span className="font-semibold text-foreground">
                              {field.value === 500 ? '$500+/hr' : `$${field.value}/hr`}
                            </span>
                            <span>$500+/hr</span>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Time Split */}
                <FormField
                  control={form.control}
                  name="time_split_creative"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How do you spend your time?</FormLabel>
                      <FormDescription>
                        Adjust the balance between creative work and logistics/business tasks
                      </FormDescription>
                      <FormControl>
                        <div className="space-y-4">
                          <Slider
                            min={0}
                            max={100}
                            step={5}
                            value={[field.value]}
                            onValueChange={(vals: number[]) => field.onChange(vals[0])}
                            className="w-full"
                          />
                          <div className="flex justify-between text-sm">
                            <div className="text-left">
                              <div className="font-semibold text-purple-600">Creative: {creativeSplit}%</div>
                              <div className="text-muted-foreground text-xs">More Creative</div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-blue-600">Logistics: {logisticsSplit}%</div>
                              <div className="text-muted-foreground text-xs">More Logistics</div>
                            </div>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Available Dates */}
                <FormField
                  control={form.control}
                  name="available_dates"
                  render={() => (
                    <FormItem>
                      <FormLabel>Upcoming availability</FormLabel>
                      <FormDescription>
                        Pick up to 3 future dates you're available for gigs ({selectedDates.length}/3 selected)
                      </FormDescription>
                      <FormControl>
                        <div className="space-y-4">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  'w-full justify-start text-left font-normal',
                                  selectedDates.length === 0 && 'text-muted-foreground'
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {selectedDates.length === 0
                                  ? 'Select dates'
                                  : `${selectedDates.length} date${selectedDates.length > 1 ? 's' : ''} selected`}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="multiple"
                                selected={selectedDates}
                                onSelect={(dates: Date[] | undefined) => {
                                  if (dates && dates.length <= 3) {
                                    form.setValue('available_dates', dates as Date[])
                                  }
                                }}
                                disabled={(date: Date) => date < new Date() || selectedDates.length >= 3}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>

                          {/* Selected Dates Chips */}
                          {selectedDates.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {selectedDates.map((date: Date, index: number) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100 rounded-full text-sm"
                                >
                                  <span>{format(date, 'MMM d, yyyy')}</span>
                                  <button
                                    type="button"
                                    onClick={() => removeDate(date)}
                                    className="hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full p-0.5"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Form Actions */}
                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/onboarding/artists/step3')}
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
