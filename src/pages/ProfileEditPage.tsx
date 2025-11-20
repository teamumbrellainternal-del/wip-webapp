import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { apiClient } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Loader2, AlertCircle, Upload, X, Plus, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ProfileFormData {
  stage_name: string
  location_city: string
  location_state: string
  location_zip?: string
  phone_number?: string
  bio?: string
  tagline?: string
  base_rate_flat?: number
  base_rate_hourly?: number
  website_url?: string
  instagram_handle?: string
  tiktok_handle?: string
  youtube_url?: string
  spotify_url?: string
  apple_music_url?: string
  soundcloud_url?: string
  facebook_url?: string
  twitter_url?: string
  bandcamp_url?: string
  available_dates?: string[]
}

const SOCIAL_PLATFORMS = [
  { value: 'website_url', label: 'Website' },
  { value: 'instagram_handle', label: 'Instagram' },
  { value: 'tiktok_handle', label: 'TikTok' },
  { value: 'spotify_url', label: 'Spotify' },
  { value: 'youtube_url', label: 'YouTube' },
  { value: 'apple_music_url', label: 'Apple Music' },
  { value: 'soundcloud_url', label: 'SoundCloud' },
  { value: 'facebook_url', label: 'Facebook' },
  { value: 'twitter_url', label: 'Twitter' },
  { value: 'bandcamp_url', label: 'Bandcamp' },
]

export default function ProfileEditPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [profileCompletion, setProfileCompletion] = useState(0)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<ProfileFormData>({
    defaultValues: {
      stage_name: '',
      location_city: '',
      location_state: '',
      location_zip: '',
      phone_number: '',
      bio: '',
      tagline: '',
      base_rate_flat: 0,
      base_rate_hourly: 0,
      website_url: '',
      instagram_handle: '',
      tiktok_handle: '',
      youtube_url: '',
      spotify_url: '',
      apple_music_url: '',
      soundcloud_url: '',
      facebook_url: '',
      twitter_url: '',
      bandcamp_url: '',
      available_dates: [],
    },
  })

  // Load profile data on mount
  useEffect(() => {
    loadProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadProfile = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data: any = await apiClient.getProfile()
      setProfile(data)
      setProfileCompletion((data as any).profile_completion || 0)

      // Pre-fill form with existing data
      form.reset({
        stage_name: data.stage_name || '',
        location_city: data.location_city || '',
        location_state: data.location_state || '',
        location_zip: data.location_zip || '',
        phone_number: data.phone_number || '',
        bio: data.bio || '',
        tagline: data.tagline || '',
        base_rate_flat: data.base_rate_flat || 0,
        base_rate_hourly: data.base_rate_hourly || 0,
        website_url: data.website_url || '',
        instagram_handle: data.instagram_handle || '',
        tiktok_handle: data.tiktok_handle || '',
        youtube_url: data.youtube_url || '',
        spotify_url: data.spotify_url || '',
        apple_music_url: data.apple_music_url || '',
        soundcloud_url: data.soundcloud_url || '',
        facebook_url: data.facebook_url || '',
        twitter_url: data.twitter_url || '',
        bandcamp_url: data.bandcamp_url || '',
        available_dates: Array.isArray(data.available_dates) ? data.available_dates : [],
      })

      if (data.avatar_url) {
        setAvatarPreview(data.avatar_url)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load profile'
      setError(errorMessage)
      console.error('Error loading profile:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please select a JPEG, PNG, WebP, or HEIC image',
        variant: 'destructive',
      })
      return
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      toast({
        title: 'File too large',
        description: `File size must be less than 10MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB`,
        variant: 'destructive',
      })
      return
    }

    setAvatarFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile) return null

    setIsUploadingAvatar(true)

    try {
      // Step 1: Get signed upload URL
      const uploadData = await apiClient.getAvatarUploadUrl({
        filename: avatarFile.name,
        fileSize: avatarFile.size,
        contentType: avatarFile.type,
      })

      // Step 2: Upload file to R2 (using signed URL - placeholder for MVP)
      // In production, this would upload to the actual R2 signed URL
      // For now, we'll simulate a successful upload
      console.log('Upload URL received:', uploadData.uploadUrl)

      // Step 3: Confirm upload
      const confirmResult = await apiClient.confirmAvatarUpload(uploadData.uploadId)

      toast({
        title: 'Avatar uploaded',
        description: 'Your profile photo has been updated successfully',
      })

      return confirmResult.avatarUrl
    } catch (err) {
      console.error('Error uploading avatar:', err)
      toast({
        title: 'Upload failed',
        description: err instanceof Error ? err.message : 'Failed to upload avatar',
        variant: 'destructive',
      })
      return null
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const onSubmit = async (data: ProfileFormData) => {
    setError(null)
    setIsSaving(true)

    try {
      // Upload avatar first if there's a new file
      if (avatarFile) {
        await uploadAvatar()
      }

      // Prepare update payload
      const updatePayload: any = {
        stage_name: data.stage_name,
        location_city: data.location_city,
        location_state: data.location_state,
        location_zip: data.location_zip || null,
        phone_number: data.phone_number || null,
        bio: data.bio || null,
        tagline: data.tagline || null,
        base_rate_flat: data.base_rate_flat || null,
        base_rate_hourly: data.base_rate_hourly || null,
        website_url: data.website_url || null,
        instagram_handle: data.instagram_handle || null,
        tiktok_handle: data.tiktok_handle || null,
        youtube_url: data.youtube_url || null,
        spotify_url: data.spotify_url || null,
        apple_music_url: data.apple_music_url || null,
        soundcloud_url: data.soundcloud_url || null,
        facebook_url: data.facebook_url || null,
        twitter_url: data.twitter_url || null,
        bandcamp_url: data.bandcamp_url || null,
        available_dates: data.available_dates || [],
      }

      // Call update endpoint
      const result: any = await apiClient.updateProfile(updatePayload)

      // Update local state with new profile completion
      if (result.profile) {
        setProfileCompletion((result.profile as any).profile_completion || 0)
      }

      toast({
        title: 'Profile updated',
        description: 'Your profile has been saved successfully',
      })

      // Navigate back to dashboard
      setTimeout(() => {
        navigate('/dashboard')
      }, 500)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile'
      setError(errorMessage)
      console.error('Error updating profile:', err)
      toast({
        title: 'Update failed',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    navigate('/dashboard')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-slate-50 dark:from-slate-950 dark:to-purple-950 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Edit Profile</h1>
          <p className="text-muted-foreground">Update your artist profile information</p>
        </div>

        {/* Profile Completion */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Profile Completion</span>
              <span className="text-sm font-medium text-purple-600">{profileCompletion}%</span>
            </div>
            <Progress value={profileCompletion} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Complete your profile to increase visibility and get more opportunities
            </p>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Profile Photo Section */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Photo</CardTitle>
                <CardDescription>Upload a professional photo to represent your brand</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={avatarPreview || undefined} />
                    <AvatarFallback className="text-2xl">
                      {profile?.stage_name?.[0]?.toUpperCase() || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/heic"
                      onChange={handleAvatarSelect}
                      className="hidden"
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingAvatar}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {avatarFile ? 'Change Photo' : 'Upload Photo'}
                      </Button>
                      {avatarFile && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            setAvatarFile(null)
                            setAvatarPreview(profile?.avatar_url || null)
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      JPEG, PNG, WebP, or HEIC. Max 10MB.
                    </p>
                    {avatarFile && (
                      <p className="text-xs text-purple-600 mt-1">
                        New photo selected: {avatarFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Basic Info Section */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Your core artist identity and contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Artist Name */}
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
                      <FormLabel>
                        Artist Name <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Your artist or stage name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Location */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="location_city"
                    rules={{
                      required: 'City is required',
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          City <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="City" {...field} />
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
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          State <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="State" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location_zip"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP Code</FormLabel>
                        <FormControl>
                          <Input placeholder="ZIP" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Phone */}
                <FormField
                  control={form.control}
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="+1 (555) 123-4567" {...field} />
                      </FormControl>
                      <FormDescription>
                        Your contact number for gig inquiries
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Bio */}
                <FormField
                  control={form.control}
                  name="bio"
                  rules={{
                    maxLength: {
                      value: 1000,
                      message: 'Bio must be 1000 characters or less',
                    },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell your story as an artist..."
                          className="resize-none"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {field.value?.length || 0}/1000 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tagline */}
                <FormField
                  control={form.control}
                  name="tagline"
                  rules={{
                    maxLength: {
                      value: 100,
                      message: 'Tagline must be 100 characters or less',
                    },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tagline</FormLabel>
                      <FormControl>
                        <Input placeholder="A catchy phrase that describes you" {...field} />
                      </FormControl>
                      <FormDescription>
                        A short, memorable phrase about your music
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Rates Section */}
            <Card>
              <CardHeader>
                <CardTitle>Rates & Pricing</CardTitle>
                <CardDescription>Set your performance and session rates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="base_rate_flat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Flat Rate (per performance)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>Your base flat rate in USD</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="base_rate_hourly"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hourly Rate</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>Your hourly rate in USD</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Social Links Section */}
            <Card>
              <CardHeader>
                <CardTitle>Social Links</CardTitle>
                <CardDescription>Connect your social media and streaming profiles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {SOCIAL_PLATFORMS.map((platform) => (
                  <FormField
                    key={platform.value}
                    control={form.control}
                    name={platform.value as keyof ProfileFormData}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{platform.label}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={
                              platform.value.includes('handle')
                                ? '@username'
                                : `https://${platform.label.toLowerCase()}.com/...`
                            }
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </CardContent>
            </Card>

            {/* Availability Section */}
            <Card>
              <CardHeader>
                <CardTitle>Availability</CardTitle>
                <CardDescription>Manage your available dates (up to 3)</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="available_dates"
                  render={({ field }) => {
                    const dates = field.value || []

                    const addDate = () => {
                      if (dates.length < 3) {
                        field.onChange([...dates, ''])
                      }
                    }

                    const updateDate = (index: number, value: string) => {
                      const newDates = [...dates]
                      newDates[index] = value
                      field.onChange(newDates)
                    }

                    const removeDate = (index: number) => {
                      const newDates = dates.filter((_, i) => i !== index)
                      field.onChange(newDates)
                    }

                    return (
                      <FormItem>
                        <div className="space-y-2">
                          {dates.map((date, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                type="date"
                                value={date}
                                onChange={(e) => updateDate(index, e.target.value)}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeDate(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          {dates.length < 3 && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={addDate}
                              className="w-full"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add Date ({dates.length}/3)
                            </Button>
                          )}
                        </div>
                        <FormDescription>
                          Add up to 3 upcoming available dates for performances
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )
                  }}
                />
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex justify-between gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving || isUploadingAvatar}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving || isUploadingAvatar}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isSaving || isUploadingAvatar ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
