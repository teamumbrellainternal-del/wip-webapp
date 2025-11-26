import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { Loader2, ArrowRight, MapPin, Users, Sparkles, Music, Mic2 } from 'lucide-react'
import OnboardingLayout from '@/components/onboarding/OnboardingLayout'

interface Step2FormData {
  notable_venue: string
  dream_collab: string
  fun_fact: string
  musical_influences: string
  favorite_instrument: string
}

const prompts = [
  {
    id: 'notable_venue',
    icon: MapPin,
    title: 'Notable venue',
    placeholder: 'Where did you give your best performance?',
  },
  {
    id: 'dream_collab',
    icon: Users,
    title: 'Dream collab',
    placeholder: 'Who would you love to perform with?',
  },
  {
    id: 'fun_fact',
    icon: Sparkles,
    title: 'Fun fact',
    placeholder: 'What makes you unique as an artist?',
  },
  {
    id: 'musical_influences',
    icon: Music,
    title: 'Musical influences',
    placeholder: 'Who inspires your sound?',
  },
  {
    id: 'favorite_instrument',
    icon: Mic2,
    title: 'Favorite instrument',
    placeholder: 'What do you love to play most?',
  },
]

export default function OnboardingStep2() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<Step2FormData>({
    defaultValues: {
      notable_venue: '',
      dream_collab: '',
      fun_fact: '',
      musical_influences: '',
      favorite_instrument: '',
    },
  })

  const onSubmit = async (data: Step2FormData) => {
    setIsLoading(true)

    try {
      // Store personality prompts locally (can be synced to profile later)
      localStorage.setItem('onboarding_step2', JSON.stringify(data))

      // Navigate to step 3
      navigate('/onboarding/artists/step3')
    } catch (err) {
      console.error('Error saving step 2:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <OnboardingLayout currentStep={2} backPath="/onboarding/artists/step1">
      <Card className="border-0 bg-card/80 shadow-xl backdrop-blur-sm">
        <CardContent className="p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-heading-32 text-foreground">Show your personality</h1>
            <p className="text-copy-16 mt-2 text-muted-foreground">
              Complete these fun prompts to help others connect with you
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Prompt Cards - 2 column grid on desktop */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {prompts.slice(0, 4).map((prompt) => {
                  const Icon = prompt.icon
                  return (
                    <FormField
                      key={prompt.id}
                      control={form.control}
                      name={prompt.id as keyof Step2FormData}
                      render={({ field }) => (
                        <FormItem>
                          <Card className="overflow-hidden border-border/50 bg-muted/30 transition-all hover:border-purple-300 hover:bg-muted/50 dark:hover:border-purple-700">
                            <CardContent className="p-4">
                              <div className="mb-3 flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                                  <Icon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                </div>
                                <h3 className="text-sm font-semibold text-foreground">
                                  {prompt.title}
                                </h3>
                              </div>
                              <FormControl>
                                <Textarea
                                  placeholder={prompt.placeholder}
                                  className="min-h-[80px] resize-none border-0 bg-transparent p-0 text-sm focus-visible:ring-0"
                                  {...field}
                                />
                              </FormControl>
                            </CardContent>
                          </Card>
                        </FormItem>
                      )}
                    />
                  )
                })}
              </div>

              {/* Last prompt - full width */}
              <FormField
                control={form.control}
                name="favorite_instrument"
                render={({ field }) => {
                  const prompt = prompts[4]
                  const Icon = prompt.icon
                  return (
                    <FormItem>
                      <Card className="overflow-hidden border-border/50 bg-muted/30 transition-all hover:border-purple-300 hover:bg-muted/50 dark:hover:border-purple-700 md:max-w-[calc(50%-0.5rem)]">
                        <CardContent className="p-4">
                          <div className="mb-3 flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                              <Icon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="text-sm font-semibold text-foreground">
                              {prompt.title}
                            </h3>
                          </div>
                          <FormControl>
                            <Textarea
                              placeholder={prompt.placeholder}
                              className="min-h-[80px] resize-none border-0 bg-transparent p-0 text-sm focus-visible:ring-0"
                              {...field}
                            />
                          </FormControl>
                        </CardContent>
                      </Card>
                    </FormItem>
                  )
                }}
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
