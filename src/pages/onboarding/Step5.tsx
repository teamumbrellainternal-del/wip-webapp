import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Loader2, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step5FormData {
  makes_music: boolean | null
  confident_online: boolean | null
  struggles_niche: boolean | null
  knows_gig_sources: boolean | null
  paid_fairly: boolean | null
  understands_royalties: boolean | null
}

export default function OnboardingStep5() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const [formData, setFormData] = useState<Step5FormData>({
    makes_music: null,
    confident_online: null,
    struggles_niche: null,
    knows_gig_sources: null,
    paid_fairly: null,
    understands_royalties: null,
  })

  const handleToggle = (field: keyof Step5FormData, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Call API
      await apiClient.submitOnboardingStep5(formData)

      // Show success animation
      setShowSuccess(true)

      // Redirect to dashboard after brief delay
      setTimeout(() => {
        navigate('/dashboard')
      }, 1500)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete onboarding'
      setError(errorMessage)
      console.error('Error submitting step 5:', err)
      setIsLoading(false)
    }
  }

  // Success overlay
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-slate-50 dark:from-slate-950 dark:to-purple-950 flex items-center justify-center p-4">
        <div className="text-center space-y-4 animate-in fade-in zoom-in duration-500">
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 dark:bg-green-900 p-6">
              <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-foreground">Welcome to Umbrella!</h2>
          <p className="text-muted-foreground text-lg">Redirecting to your dashboard...</p>
        </div>
      </div>
    )
  }

  const questions = [
    {
      field: 'makes_music' as const,
      question: 'Do you currently make music?',
    },
    {
      field: 'confident_online' as const,
      question: 'Do you feel confident presenting yourself online?',
    },
    {
      field: 'struggles_niche' as const,
      question: 'Do you struggle with finding your creative niche?',
    },
    {
      field: 'knows_gig_sources' as const,
      question: 'Do you know where to find gigs that match your level?',
    },
    {
      field: 'paid_fairly' as const,
      question: 'Have you been paid fairly for performing?',
    },
    {
      field: 'understands_royalties' as const,
      question: 'Do you understand royalties and streaming payouts?',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-slate-50 dark:from-slate-950 dark:to-purple-950 p-4">
      <div className="max-w-3xl mx-auto py-8">
        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Step 5 of 5</span>
            <span className="text-sm font-medium text-muted-foreground">100% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-purple-600" />
              <CardTitle className="text-3xl">Quick Questions</CardTitle>
            </div>
            <CardDescription>Just a few yes or no questions to finish up</CardDescription>
          </CardHeader>

          <CardContent>
            {/* Error Message */}
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={onSubmit} className="space-y-6">
              {/* Questions */}
              <div className="space-y-6">
                {questions.map((q, index) => {
                  const value = formData[q.field]
                  return (
                    <div
                      key={q.field}
                      className={cn(
                        'p-4 rounded-lg border-2 transition-all',
                        value === true && 'border-purple-300 bg-purple-50 dark:bg-purple-950/30',
                        value === false && 'border-slate-300 bg-slate-50 dark:bg-slate-900/30',
                        value === null && 'border-gray-200 dark:border-gray-700'
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <Label className="text-base font-medium cursor-pointer">
                            {index + 1}. {q.question}
                          </Label>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleToggle(q.field, false)}
                            className={cn(
                              'px-4 py-2 rounded-md text-sm font-medium transition-all',
                              value === false
                                ? 'bg-slate-600 text-white'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                            )}
                          >
                            No
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggle(q.field, true)}
                            className={cn(
                              'px-4 py-2 rounded-md text-sm font-medium transition-all',
                              value === true
                                ? 'bg-purple-600 text-white'
                                : 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:hover:bg-purple-800'
                            )}
                          >
                            Yes
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Form Actions */}
              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/onboarding/artists/step4')}
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-purple-600 hover:bg-purple-700 min-w-[120px]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit'
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
