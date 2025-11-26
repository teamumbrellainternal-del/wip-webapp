import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Loader2, ArrowRight, Upload, Music2, Image } from 'lucide-react'
import OnboardingLayout from '@/components/onboarding/OnboardingLayout'

interface Step3FormData {
  spotify_profile: string
  apple_music: string
}

export default function OnboardingStep3() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [audioFiles, setAudioFiles] = useState<File[]>([])
  const [mediaFiles, setMediaFiles] = useState<File[]>([])

  const form = useForm<Step3FormData>({
    defaultValues: {
      spotify_profile: '',
      apple_music: '',
    },
  })

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles = files.filter(
      (file) =>
        ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/mp3'].includes(file.type) &&
        file.size <= 50 * 1024 * 1024 // 50MB limit
    )
    setAudioFiles((prev) => [...prev, ...validFiles])
  }

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles = files.filter(
      (file) =>
        (file.type.startsWith('image/') || file.type.startsWith('video/')) &&
        file.size <= 100 * 1024 * 1024 // 100MB limit
    )
    setMediaFiles((prev) => [...prev, ...validFiles])
  }

  const onSubmit = async (data: Step3FormData) => {
    setIsLoading(true)

    try {
      // Store media links locally (can be synced to profile later)
      localStorage.setItem(
        'onboarding_step3',
        JSON.stringify({
          ...data,
          audioFilesCount: audioFiles.length,
          mediaFilesCount: mediaFiles.length,
        })
      )

      // TODO: Upload files to storage when API is ready
      // For now, we'll skip the actual upload and just proceed

      // Navigate to step 4
      navigate('/onboarding/artists/step4')
    } catch (err) {
      console.error('Error saving step 3:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <OnboardingLayout currentStep={3} backPath="/onboarding/artists/step2">
      <Card className="border-0 bg-card/80 shadow-xl backdrop-blur-sm">
        <CardContent className="p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-heading-32 text-foreground">Showcase your work</h1>
            <p className="mt-2 text-copy-16 text-muted-foreground">
              Upload your best tracks, photos, and videos
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Audio Upload Section */}
              <Card className="overflow-hidden border-border/50 bg-muted/30">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                      <Upload className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
                    <h3 className="text-lg font-semibold text-foreground">Upload Audio Tracks</h3>
                    <p className="mb-4 text-sm text-muted-foreground">
                      MP3, WAV, or FLAC files up to 50MB each
                    </p>

                    <input
                      type="file"
                      accept="audio/*"
                      multiple
                      onChange={handleAudioUpload}
                      className="hidden"
                      id="audio-upload"
                    />
                    <label htmlFor="audio-upload">
                      <Button
                        type="button"
                        variant="outline"
                        className="cursor-pointer border-2 border-border hover:border-purple-400"
                        asChild
                      >
                        <span>
                          <Music2 className="mr-2 h-4 w-4" />
                          Choose Files
                        </span>
                      </Button>
                    </label>

                    {audioFiles.length > 0 && (
                      <div className="mt-4 w-full text-left">
                        <p className="mb-2 text-xs font-medium text-muted-foreground">
                          {audioFiles.length} file(s) selected
                </p>
                        <div className="space-y-1">
                          {audioFiles.map((file, index) => (
                            <div
                              key={index}
                              className="rounded-md bg-purple-50 px-3 py-2 text-xs dark:bg-purple-900/20"
                      >
                              {file.name}
                            </div>
                          ))}
                        </div>
                </div>
                )}
              </div>
                </CardContent>
              </Card>

              {/* Streaming Links */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="spotify_profile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Spotify Profile</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://open.spotify.com/artist/..."
                          className="h-12 rounded-lg border-border bg-muted/50 focus:border-purple-500 focus:ring-purple-500/20"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="apple_music"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Apple Music</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://music.apple.com/artist/..."
                          className="h-12 rounded-lg border-border bg-muted/50 focus:border-purple-500 focus:ring-purple-500/20"
                          {...field}
                />
                      </FormControl>
                    </FormItem>
                )}
                />
              </div>

              {/* Photos & Videos Upload Section */}
              <Card className="overflow-hidden border-border/50 bg-muted/30">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                      <Upload className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                    <h3 className="text-lg font-semibold text-foreground">Photos & Videos</h3>
                    <p className="mb-4 text-sm text-muted-foreground">
                      Show your performances, studio sessions, and behind-the-scenes
                    </p>

                    <input
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={handleMediaUpload}
                      className="hidden"
                      id="media-upload"
                    />
                    <label htmlFor="media-upload">
                      <Button
                        type="button"
                        variant="outline"
                        className="cursor-pointer border-2 border-border hover:border-purple-400"
                        asChild
                      >
                        <span>
                          <Image className="mr-2 h-4 w-4" />
                          Upload Media
                        </span>
                      </Button>
                    </label>

                    {mediaFiles.length > 0 && (
                      <div className="mt-4 w-full text-left">
                        <p className="mb-2 text-xs font-medium text-muted-foreground">
                          {mediaFiles.length} file(s) selected
                </p>
                        <div className="space-y-1">
                          {mediaFiles.map((file, index) => (
                            <div
                              key={index}
                              className="rounded-md bg-purple-50 px-3 py-2 text-xs dark:bg-purple-900/20"
                      >
                              {file.name}
                </div>
                          ))}
              </div>
                </div>
                )}
              </div>
                </CardContent>
              </Card>

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
