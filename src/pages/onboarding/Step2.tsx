import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '@clerk/clerk-react'
import { apiClient } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface SocialLinks {
  website_url: string
  instagram_handle: string
  facebook_url: string
  youtube_url: string
  soundcloud_url: string
  spotify_url: string
  apple_music_url: string
  tiktok_handle: string
  twitter_url: string
  bandcamp_url: string
}

interface QualitativeAnswers {
  tasks_outsource: string
  sound_uniqueness: string
  dream_venue: string
}

interface FormErrors {
  social_links?: string
  [key: string]: string | undefined
}

export default function Step2() {
  const navigate = useNavigate()
  const { session } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  // Social links state
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    website_url: '',
    instagram_handle: '',
    facebook_url: '',
    youtube_url: '',
    soundcloud_url: '',
    spotify_url: '',
    apple_music_url: '',
    tiktok_handle: '',
    twitter_url: '',
    bandcamp_url: '',
  })

  // Qualitative answers state
  const [answers, setAnswers] = useState<QualitativeAnswers>({
    tasks_outsource: '',
    sound_uniqueness: '',
    dream_venue: '',
  })

  /**
   * Validate URL format
   */
  const isValidUrl = (url: string): boolean => {
    if (!url || url.trim() === '') return true // Empty is ok
    try {
      const urlObj = new URL(url)
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
    } catch {
      return false
    }
  }

  /**
   * Validate social media handle (no @ symbol, alphanumeric + dots/underscores)
   */
  const isValidHandle = (handle: string): boolean => {
    if (!handle || handle.trim() === '') return true // Empty is ok
    const handleRegex = /^[a-zA-Z0-9._]+$/
    return handleRegex.test(handle)
  }

  /**
   * Count filled social links
   */
  const countFilledLinks = (): number => {
    return Object.values(socialLinks).filter(
      (link) => link && link.trim().length > 0
    ).length
  }

  /**
   * Validate form data
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Check minimum 3 social links
    const filledLinks = countFilledLinks()
    if (filledLinks < 3) {
      newErrors.social_links = 'Please provide at least 3 social media links'
    }

    // Validate URL formats
    if (socialLinks.website_url && !isValidUrl(socialLinks.website_url)) {
      newErrors.website_url = 'Invalid website URL'
    }
    if (socialLinks.facebook_url && !isValidUrl(socialLinks.facebook_url)) {
      newErrors.facebook_url = 'Invalid Facebook URL'
    }
    if (socialLinks.youtube_url && !isValidUrl(socialLinks.youtube_url)) {
      newErrors.youtube_url = 'Invalid YouTube URL'
    }
    if (socialLinks.soundcloud_url && !isValidUrl(socialLinks.soundcloud_url)) {
      newErrors.soundcloud_url = 'Invalid SoundCloud URL'
    }
    if (socialLinks.spotify_url && !isValidUrl(socialLinks.spotify_url)) {
      newErrors.spotify_url = 'Invalid Spotify URL'
    }
    if (socialLinks.apple_music_url && !isValidUrl(socialLinks.apple_music_url)) {
      newErrors.apple_music_url = 'Invalid Apple Music URL'
    }
    if (socialLinks.twitter_url && !isValidUrl(socialLinks.twitter_url)) {
      newErrors.twitter_url = 'Invalid Twitter/X URL'
    }
    if (socialLinks.bandcamp_url && !isValidUrl(socialLinks.bandcamp_url)) {
      newErrors.bandcamp_url = 'Invalid Bandcamp URL'
    }

    // Validate handles
    if (socialLinks.instagram_handle && !isValidHandle(socialLinks.instagram_handle)) {
      newErrors.instagram_handle = 'Invalid Instagram handle (no @ symbol, alphanumeric, dots, underscores only)'
    }
    if (socialLinks.tiktok_handle && !isValidHandle(socialLinks.tiktok_handle)) {
      newErrors.tiktok_handle = 'Invalid TikTok handle (no @ symbol, alphanumeric, dots, underscores only)'
    }

    // Validate character limits for qualitative answers
    if (answers.tasks_outsource && answers.tasks_outsource.length > 500) {
      newErrors.tasks_outsource = 'Maximum 500 characters'
    }
    if (answers.sound_uniqueness && answers.sound_uniqueness.length > 500) {
      newErrors.sound_uniqueness = 'Maximum 500 characters'
    }
    if (answers.dream_venue && answers.dream_venue.length > 200) {
      newErrors.dream_venue = 'Maximum 200 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      const token = await session?.getToken()
      if (!token) {
        throw new Error('No authentication token')
      }

      // Prepare request body
      const requestBody = {
        ...socialLinks,
        ...answers,
      }

      // Use apiClient for consistent request handling (auth, logging, errors)
      await apiClient.request('/onboarding/artists/step2', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      })

      // Success - navigate to step 3
      navigate('/onboarding/artists/step3')
    } catch (error) {
      console.error('Error submitting step 2:', error)
      const message = error instanceof Error ? error.message : 'An error occurred. Please try again.'
      
      // Handle "Step 1 must be completed first" error specifically
      if (message.includes('Step 1 must be completed first')) {
        setErrors({
          general: 'Please complete Step 1 first. Redirecting...',
        })
        setTimeout(() => navigate('/onboarding/artists/step1'), 2000)
      } else {
        setErrors({
          general: message,
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Handle back button
   */
  const handleBack = () => {
    navigate('/onboarding/artists/step1')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Progress Indicator */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Onboarding</h1>
          <p className="text-muted-foreground">Step 2 of 5</p>
          <div className="mt-4 w-full bg-secondary rounded-full h-2">
            <div className="bg-primary h-2 rounded-full" style={{ width: '40%' }} />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Connect Your Social Links</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Add at least 3 social media links to help people find and connect with you
              </p>
              {errors.social_links && (
                <p className="text-sm text-destructive mb-4">{errors.social_links}</p>
              )}
            </div>

            {/* Social Links Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Instagram */}
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram Handle</Label>
                <Input
                  id="instagram"
                  type="text"
                  placeholder="username (no @)"
                  value={socialLinks.instagram_handle}
                  onChange={(e) =>
                    setSocialLinks({ ...socialLinks, instagram_handle: e.target.value })
                  }
                />
                {errors.instagram_handle && (
                  <p className="text-xs text-destructive">{errors.instagram_handle}</p>
                )}
              </div>

              {/* TikTok */}
              <div className="space-y-2">
                <Label htmlFor="tiktok">TikTok Handle</Label>
                <Input
                  id="tiktok"
                  type="text"
                  placeholder="username (no @)"
                  value={socialLinks.tiktok_handle}
                  onChange={(e) =>
                    setSocialLinks({ ...socialLinks, tiktok_handle: e.target.value })
                  }
                />
                {errors.tiktok_handle && (
                  <p className="text-xs text-destructive">{errors.tiktok_handle}</p>
                )}
              </div>

              {/* Spotify */}
              <div className="space-y-2">
                <Label htmlFor="spotify">Spotify URL</Label>
                <Input
                  id="spotify"
                  type="url"
                  placeholder="https://open.spotify.com/artist/..."
                  value={socialLinks.spotify_url}
                  onChange={(e) =>
                    setSocialLinks({ ...socialLinks, spotify_url: e.target.value })
                  }
                />
                {errors.spotify_url && (
                  <p className="text-xs text-destructive">{errors.spotify_url}</p>
                )}
              </div>

              {/* Apple Music */}
              <div className="space-y-2">
                <Label htmlFor="apple-music">Apple Music URL</Label>
                <Input
                  id="apple-music"
                  type="url"
                  placeholder="https://music.apple.com/artist/..."
                  value={socialLinks.apple_music_url}
                  onChange={(e) =>
                    setSocialLinks({ ...socialLinks, apple_music_url: e.target.value })
                  }
                />
                {errors.apple_music_url && (
                  <p className="text-xs text-destructive">{errors.apple_music_url}</p>
                )}
              </div>

              {/* YouTube */}
              <div className="space-y-2">
                <Label htmlFor="youtube">YouTube URL</Label>
                <Input
                  id="youtube"
                  type="url"
                  placeholder="https://youtube.com/@username"
                  value={socialLinks.youtube_url}
                  onChange={(e) =>
                    setSocialLinks({ ...socialLinks, youtube_url: e.target.value })
                  }
                />
                {errors.youtube_url && (
                  <p className="text-xs text-destructive">{errors.youtube_url}</p>
                )}
              </div>

              {/* SoundCloud */}
              <div className="space-y-2">
                <Label htmlFor="soundcloud">SoundCloud URL</Label>
                <Input
                  id="soundcloud"
                  type="url"
                  placeholder="https://soundcloud.com/username"
                  value={socialLinks.soundcloud_url}
                  onChange={(e) =>
                    setSocialLinks({ ...socialLinks, soundcloud_url: e.target.value })
                  }
                />
                {errors.soundcloud_url && (
                  <p className="text-xs text-destructive">{errors.soundcloud_url}</p>
                )}
              </div>

              {/* Facebook */}
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook URL</Label>
                <Input
                  id="facebook"
                  type="url"
                  placeholder="https://facebook.com/username"
                  value={socialLinks.facebook_url}
                  onChange={(e) =>
                    setSocialLinks({ ...socialLinks, facebook_url: e.target.value })
                  }
                />
                {errors.facebook_url && (
                  <p className="text-xs text-destructive">{errors.facebook_url}</p>
                )}
              </div>

              {/* Twitter/X */}
              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter/X URL</Label>
                <Input
                  id="twitter"
                  type="url"
                  placeholder="https://twitter.com/username"
                  value={socialLinks.twitter_url}
                  onChange={(e) =>
                    setSocialLinks({ ...socialLinks, twitter_url: e.target.value })
                  }
                />
                {errors.twitter_url && (
                  <p className="text-xs text-destructive">{errors.twitter_url}</p>
                )}
              </div>

              {/* Bandcamp */}
              <div className="space-y-2">
                <Label htmlFor="bandcamp">Bandcamp URL</Label>
                <Input
                  id="bandcamp"
                  type="url"
                  placeholder="https://username.bandcamp.com"
                  value={socialLinks.bandcamp_url}
                  onChange={(e) =>
                    setSocialLinks({ ...socialLinks, bandcamp_url: e.target.value })
                  }
                />
                {errors.bandcamp_url && (
                  <p className="text-xs text-destructive">{errors.bandcamp_url}</p>
                )}
              </div>

              {/* Website */}
              <div className="space-y-2">
                <Label htmlFor="website">Website URL</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://yourwebsite.com"
                  value={socialLinks.website_url}
                  onChange={(e) =>
                    setSocialLinks({ ...socialLinks, website_url: e.target.value })
                  }
                />
                {errors.website_url && (
                  <p className="text-xs text-destructive">{errors.website_url}</p>
                )}
              </div>
            </div>

            {/* Links Counter */}
            <div className="text-sm text-muted-foreground">
              {countFilledLinks()} of 3 minimum links provided
            </div>
          </div>

          {/* Qualitative Questions */}
          <div className="space-y-4 pt-4 border-t">
            <h2 className="text-2xl font-semibold mb-2">Tell Us Your Story</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Help us understand your creative journey
            </p>

            {/* Tasks to Outsource */}
            <div className="space-y-2">
              <Label htmlFor="tasks-outsource">
                What tasks would you outsource if you could?
              </Label>
              <Textarea
                id="tasks-outsource"
                placeholder="e.g., Booking, social media management, mixing and mastering..."
                value={answers.tasks_outsource}
                onChange={(e) =>
                  setAnswers({ ...answers, tasks_outsource: e.target.value })
                }
                rows={3}
                maxLength={500}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{errors.tasks_outsource || ''}</span>
                <span>{answers.tasks_outsource.length}/500</span>
              </div>
            </div>

            {/* Sound Uniqueness */}
            <div className="space-y-2">
              <Label htmlFor="sound-uniqueness">
                What makes your sound unique?
              </Label>
              <Textarea
                id="sound-uniqueness"
                placeholder="Describe what sets your music apart..."
                value={answers.sound_uniqueness}
                onChange={(e) =>
                  setAnswers({ ...answers, sound_uniqueness: e.target.value })
                }
                rows={3}
                maxLength={500}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{errors.sound_uniqueness || ''}</span>
                <span>{answers.sound_uniqueness.length}/500</span>
              </div>
            </div>

            {/* Dream Venue */}
            <div className="space-y-2">
              <Label htmlFor="dream-venue">
                What's your dream performance venue?
              </Label>
              <Textarea
                id="dream-venue"
                placeholder="e.g., Red Rocks Amphitheatre, Madison Square Garden..."
                value={answers.dream_venue}
                onChange={(e) =>
                  setAnswers({ ...answers, dream_venue: e.target.value })
                }
                rows={2}
                maxLength={200}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{errors.dream_venue || ''}</span>
                <span>{answers.dream_venue.length}/200</span>
              </div>
            </div>
          </div>

          {/* General Error */}
          {errors.general && (
            <div className="p-4 bg-destructive/10 border border-destructive rounded-md">
              <p className="text-sm text-destructive">{errors.general}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={isSubmitting}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Saving...' : 'Next'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
