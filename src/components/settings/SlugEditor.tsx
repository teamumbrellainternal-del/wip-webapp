/**
 * SlugEditor Component
 * Allows users to customize their profile URL slug
 *
 * Features:
 * - Live slug validation
 * - Availability check on blur
 * - URL preview
 * - Suggestions for unavailable slugs
 */

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Check, X, Loader2, Link2, Copy } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface SlugEditorProps {
  currentSlug?: string
  type: 'artist' | 'venue'
  onSlugUpdate?: (newSlug: string) => void
}

interface AvailabilityResponse {
  available: boolean
  slug: string
  suggestion?: string
  error?: string
}

const BASE_URL = 'https://app.umbrellalive.com'

export function SlugEditor({ currentSlug, type, onSlugUpdate }: SlugEditorProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const [slug, setSlug] = useState(currentSlug || '')
  const [isChecking, setIsChecking] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  const profilePath = type === 'artist' ? 'artist' : 'venue'

  // Normalize slug input
  const normalizeSlug = (input: string): string => {
    return input
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50)
  }

  // Check slug availability
  const checkAvailability = useCallback(
    async (slugToCheck: string) => {
      if (!slugToCheck || slugToCheck.length < 3) {
        setAvailability(null)
        return
      }

      // Don't check if it's the same as current slug
      if (slugToCheck === currentSlug) {
        setAvailability({ available: true, slug: slugToCheck })
        return
      }

      setIsChecking(true)
      try {
        const endpoint =
          type === 'artist'
            ? `/v1/profile/slug/${slugToCheck}/available`
            : `/v1/venue/profile/slug/${slugToCheck}/available`

        const response = await fetch(endpoint)
        const data = await response.json()

        if (data.success) {
          setAvailability(data.data)
        } else {
          setAvailability({ available: false, slug: slugToCheck, error: data.error })
        }
      } catch (error) {
        console.error('Error checking slug availability:', error)
        setAvailability({
          available: false,
          slug: slugToCheck,
          error: 'Failed to check availability',
        })
      } finally {
        setIsChecking(false)
      }
    },
    [currentSlug, type]
  )

  // Handle slug input change
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const normalized = normalizeSlug(e.target.value)
    setSlug(normalized)
    setHasChanges(normalized !== currentSlug)
    setAvailability(null) // Reset availability when typing
  }

  // Check availability on blur
  const handleBlur = () => {
    if (slug && slug !== currentSlug) {
      checkAvailability(slug)
    }
  }

  // Save the new slug
  const handleSave = async () => {
    if (!slug || slug === currentSlug) return

    setIsSaving(true)
    try {
      const endpoint = type === 'artist' ? '/v1/profile/slug' : '/v1/venue/profile/slug'
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ slug }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: 'Profile URL updated',
          description: `Your profile is now available at ${BASE_URL}/${profilePath}/${slug}`,
        })
        setHasChanges(false)
        onSlugUpdate?.(slug)
      } else {
        toast({
          title: 'Failed to update URL',
          description: data.error || 'Please try again',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error updating slug:', error)
      toast({
        title: 'Error',
        description: 'Failed to update profile URL',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Copy URL to clipboard
  const copyUrl = () => {
    const url = `${BASE_URL}/${profilePath}/${slug || currentSlug}`
    navigator.clipboard.writeText(url)
    toast({
      title: 'URL copied',
      description: 'Profile URL copied to clipboard',
    })
  }

  // Use suggestion
  const useSuggestion = () => {
    if (availability?.suggestion) {
      setSlug(availability.suggestion)
      setHasChanges(true)
      setAvailability({ available: true, slug: availability.suggestion })
    }
  }

  // Initialize with current slug
  useEffect(() => {
    if (currentSlug && !slug) {
      setSlug(currentSlug)
    }
  }, [currentSlug, slug])

  if (!user) return null

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="slug" className="flex items-center gap-2">
          <Link2 className="h-4 w-4" />
          Custom Profile URL
        </Label>
        <p className="text-sm text-muted-foreground">
          Choose a custom URL for your public profile. This makes it easier to share and helps with
          search engine visibility.
        </p>
      </div>

      <div className="space-y-3">
        {/* URL Preview */}
        <div className="flex items-center gap-2 rounded-md bg-muted p-3 text-sm">
          <span className="text-muted-foreground">
            {BASE_URL}/{profilePath}/
          </span>
          <span className="font-medium">{slug || currentSlug || 'your-name'}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="ml-auto h-7 w-7 p-0"
            onClick={copyUrl}
            title="Copy URL"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>

        {/* Slug Input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              id="slug"
              value={slug}
              onChange={handleSlugChange}
              onBlur={handleBlur}
              placeholder="your-name"
              className="pr-10"
              maxLength={50}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isChecking && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              {!isChecking && availability?.available && (
                <Check className="h-4 w-4 text-green-500" />
              )}
              {!isChecking && availability && !availability.available && (
                <X className="h-4 w-4 text-red-500" />
              )}
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || !availability?.available || isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </Button>
        </div>

        {/* Availability feedback */}
        {availability && !availability.available && (
          <div className="space-y-2">
            <p className="text-sm text-red-500">
              {availability.error || 'This URL is already taken'}
            </p>
            {availability.suggestion && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Suggestion:</span>
                <button
                  type="button"
                  onClick={useSuggestion}
                  className="font-medium text-primary hover:underline"
                >
                  {availability.suggestion}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Help text */}
        <p className="text-xs text-muted-foreground">
          Only lowercase letters, numbers, and hyphens allowed. 3-50 characters.
        </p>
      </div>
    </div>
  )
}

export default SlugEditor
