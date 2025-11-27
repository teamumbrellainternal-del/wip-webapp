import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { apiClient } from '@/lib/api-client'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Form,
  FormControl,
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, CheckCircle, Star, Music2, X } from 'lucide-react'
import OnboardingLayout from '@/components/onboarding/OnboardingLayout'

interface Step4FormData {
  response_time: string
  average_gig_price: string
}

const SKILL_OPTIONS = [
  'Vocals',
  'Guitar',
  'Piano',
  'Drums',
  'Bass',
  'Songwriting',
  'Mixing',
  'Live Performance',
  'DJ',
  'Production',
  'Violin',
  'Saxophone',
]

export default function OnboardingStep4() {
  const navigate = useNavigate()
  const { checkSession } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')

  const form = useForm<Step4FormData>({
    defaultValues: {
      response_time: 'within_1_hour',
      average_gig_price: '',
    },
  })

  const addSkill = (skill: string) => {
    if (skill && !selectedSkills.includes(skill) && selectedSkills.length < 10) {
      setSelectedSkills([...selectedSkills, skill])
      setSkillInput('')
    }
  }

  const removeSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter((s) => s !== skill))
  }

  const handleSkillInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addSkill(skillInput.trim())
    }
  }

  const onSubmit = async (data: Step4FormData) => {
    setError(null)
    setIsLoading(true)

    try {
      // Store step 4 data locally
      localStorage.setItem(
        'onboarding_step4',
        JSON.stringify({
          skills: selectedSkills,
          response_time: data.response_time,
          average_gig_price: data.average_gig_price,
        })
      )

      // Call API to mark onboarding as complete
      // Using existing step4 and step5 endpoints
      await apiClient.submitOnboardingStep4({
        largest_show_capacity: 100, // Default values
        base_rate_flat: parseInt(data.average_gig_price) || 500,
        base_rate_hourly: Math.round((parseInt(data.average_gig_price) || 500) / 4),
        time_split_creative: 60,
        time_split_logistics: 40,
        available_dates: [],
      })

      await apiClient.submitOnboardingStep5({
        currently_making_music: true,
        confident_online_presence: true,
        struggles_creative_niche: false,
        knows_where_find_gigs: true,
        paid_fairly_performing: true,
        understands_royalties: true,
      })

      // Refresh user data to update onboarding_complete status
      await checkSession()

      // Navigate to dashboard on success
      navigate('/dashboard')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete onboarding'
      setError(errorMessage)
      console.error('Error completing onboarding:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <OnboardingLayout currentStep={4} backPath="/onboarding/artists/step3">
      <Card className="border-0 bg-card/80 shadow-xl backdrop-blur-sm">
        <CardContent className="p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-heading-32 text-foreground">Build your credibility</h1>
            <p className="text-copy-16 mt-2 text-muted-foreground">
              Add endorsements and showcase your experience
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
              {/* Skills & Instruments */}
              <Card className="overflow-hidden border-border/50 bg-muted/30">
                <CardContent className="p-6">
                  <h3 className="mb-4 text-lg font-semibold text-foreground">
                    Skills & Instruments
                  </h3>

                  {/* Selected Skills */}
                  <div className="mb-4 flex flex-wrap gap-2">
                    {selectedSkills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="bg-purple-100 px-3 py-1 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-2 hover:text-purple-900 dark:hover:text-purple-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>

                  {/* Skill Input */}
                  <Input
                    placeholder="Add a skill or instrument..."
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleSkillInputKeyDown}
                    className="h-12 rounded-lg border-border bg-background focus:border-purple-500 focus:ring-purple-500/20"
                    list="skill-suggestions"
                  />
                  <datalist id="skill-suggestions">
                    {SKILL_OPTIONS.filter((s) => !selectedSkills.includes(s)).map((skill) => (
                      <option key={skill} value={skill} />
                    ))}
                  </datalist>

                  {/* Quick Add Buttons */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {SKILL_OPTIONS.filter((s) => !selectedSkills.includes(s))
                      .slice(0, 5)
                      .map((skill) => (
                        <Button
                          key={skill}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addSkill(skill)}
                          className="text-xs"
                        >
                          + {skill}
                        </Button>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Verification Cards */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card className="border-border/50 bg-muted/30">
                  <CardContent className="flex flex-col items-center p-6 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                      <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h4 className="font-semibold text-foreground">Verified Artist</h4>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Complete verification process
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-muted/30">
                  <CardContent className="flex flex-col items-center p-6 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                      <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <h4 className="font-semibold text-foreground">5.0 Rating</h4>
                    <p className="mt-1 text-xs text-muted-foreground">Average venue rating</p>
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-muted/30">
                  <CardContent className="flex flex-col items-center p-6 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                      <Music2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h4 className="font-semibold text-foreground">0 Gigs</h4>
                    <p className="mt-1 text-xs text-muted-foreground">Completed bookings</p>
                  </CardContent>
                </Card>
              </div>

              {/* Professional Details */}
              <Card className="overflow-hidden border-border/50 bg-muted/30">
                <CardContent className="p-6">
                  <h3 className="mb-4 text-lg font-semibold text-foreground">
                    Professional Details
                  </h3>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="response_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">
                            Typical Response Time
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 rounded-lg border-border bg-background">
                                <SelectValue placeholder="Select response time" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="within_1_hour">Within 1 hour</SelectItem>
                              <SelectItem value="within_4_hours">Within 4 hours</SelectItem>
                              <SelectItem value="within_24_hours">Within 24 hours</SelectItem>
                              <SelectItem value="within_48_hours">Within 48 hours</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="average_gig_price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Average Gig Price</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. $500-1000"
                              className="h-12 rounded-lg border-border bg-background focus:border-purple-500 focus:ring-purple-500/20"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Complete Button */}
              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-12 min-w-[180px] bg-purple-500 px-6 font-semibold hover:bg-purple-600"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Completing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Complete Profile
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
