import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Loader2, AlertCircle, PartyPopper } from 'lucide-react'

interface Step5FormData {
  currently_making_music: boolean
  confident_online_presence: boolean
  struggles_creative_niche: boolean
  knows_where_find_gigs: boolean
  paid_fairly_performing: boolean
  understands_royalties: boolean
}

export default function OnboardingStep5() {
  const navigate = useNavigate()
  const { checkSession } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<Step5FormData>({
    defaultValues: {
      currently_making_music: false,
      confident_online_presence: false,
      struggles_creative_niche: false,
      knows_where_find_gigs: false,
      paid_fairly_performing: false,
      understands_royalties: false,
    },
  })

  const onSubmit = async (data: Step5FormData) => {
    setError(null)
    setIsLoading(true)

    try {
      // Call API using the new D1 endpoint
      await apiClient.request('/onboarding/artists/step5', {
        method: 'POST',
        body: JSON.stringify(data),
      })

      // Refresh session to update onboarding status in context
      await checkSession()

      // Navigate to dashboard on success - onboarding complete!
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete onboarding'

      // Handle "Step 4 must be completed first" error
      if (errorMessage.includes('Step 4 must be completed first')) {
        setError('Please complete Step 4 first. Redirecting...')
        setTimeout(() => navigate('/onboarding/artists/step4'), 2000)
      } else {
        setError(errorMessage)
      }
      console.error('Error submitting step 5:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const questions = [
    {
      id: 'currently_making_music' as const,
      label: 'Are you currently making music?',
      description: 'Do you actively create, record, or produce music?',
    },
    {
      id: 'confident_online_presence' as const,
      label: 'Do you feel confident about your online presence?',
      description: 'Are you happy with your social media and streaming profiles?',
    },
    {
      id: 'struggles_creative_niche' as const,
      label: 'Do you struggle to define your creative niche?',
      description: 'Are you unsure about your unique sound or artistic identity?',
    },
    {
      id: 'knows_where_find_gigs' as const,
      label: 'Do you know where to find gigs?',
      description: 'Do you have a reliable way to discover performance opportunities?',
    },
    {
      id: 'paid_fairly_performing' as const,
      label: 'Do you feel paid fairly for your performances?',
      description: 'Are you satisfied with your current performance compensation?',
    },
    {
      id: 'understands_royalties' as const,
      label: 'Do you understand how music royalties work?',
      description: 'Do you know about streaming, mechanical, and performance royalties?',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-slate-50 p-4 dark:from-slate-950 dark:to-purple-950">
      <div className="mx-auto max-w-3xl py-8">
        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Step 5 of 5</span>
            <span className="text-sm font-medium text-muted-foreground">100% Complete</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
            <div className="h-2.5 rounded-full bg-purple-600" style={{ width: '100%' }}></div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <PartyPopper className="h-8 w-8 text-purple-600" />
              <div>
                <CardTitle className="text-3xl">Almost There!</CardTitle>
                <CardDescription className="mt-1 text-lg">
                  Just a few quick questions to help us understand your journey
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Info Alert */}
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    All questions are optional. These help us personalize your Umbrella experience,
                    but you can skip any or all of them.
                  </AlertDescription>
                </Alert>

                {/* Questions */}
                <div className="space-y-6 pt-4">
                  {questions.map((question) => (
                    <FormField
                      key={question.id}
                      control={form.control}
                      name={question.id}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4 shadow-sm transition-colors hover:bg-accent/50">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="cursor-pointer text-base font-medium">
                              {question.label}
                            </FormLabel>
                            <FormDescription>{question.description}</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>

                {/* Error Alert */}
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/onboarding/artists/step4')}
                    disabled={isLoading}
                  >
                    Back
                  </Button>

                  <Button type="submit" disabled={isLoading} size="lg" className="min-w-[200px]">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Completing...
                      </>
                    ) : (
                      <>
                        <PartyPopper className="mr-2 h-4 w-4" />
                        Complete Onboarding
                      </>
                    )}
                  </Button>
                </div>

                {/* Help Text */}
                <p className="pt-4 text-center text-sm text-muted-foreground">
                  By completing onboarding, you'll have full access to all Umbrella features
                  including the marketplace, messaging, and Violet AI toolkit.
                </p>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
