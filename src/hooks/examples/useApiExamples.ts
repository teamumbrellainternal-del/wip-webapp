/**
 * Example API Hooks for Umbrella MVP
 * Demonstrates usage patterns for the useApi hook
 *
 * These examples show how to integrate the useApi hook with
 * the API service layer for common use cases.
 */

import { useApi, useGet, usePost, usePatch, useDelete } from '@/hooks/use-api'
import type {
  DashboardMetrics,
  UserProfile,
  Artist,
  Gig,
  GigSearchParams,
  ArtistSearchParams,
  Conversation,
  Message,
  VioletResponse,
  FileUploadResponse,
  OnboardingStep1Data,
} from '@/types'

// ============================================================================
// DASHBOARD EXAMPLES
// ============================================================================

/**
 * Example: Fetch dashboard metrics
 * Usage in component:
 * ```tsx
 * const { data, loading, error, refetch } = useDashboardMetrics()
 * if (loading) return <LoadingState />
 * if (error) return <ErrorState error={error} retry={refetch} />
 * return <DashboardView metrics={data} />
 * ```
 */
export function useDashboardMetrics() {
  return useGet<DashboardMetrics>('/analytics/dashboard')
}

// ============================================================================
// PROFILE EXAMPLES
// ============================================================================

/**
 * Example: Fetch current user profile
 */
export function useProfile() {
  return useGet<UserProfile>('/profile')
}

/**
 * Example: Update user profile (mutation)
 * Usage in component:
 * ```tsx
 * const { mutate, loading, error } = useUpdateProfile()
 * const handleSubmit = async (data) => {
 *   try {
 *     await mutate(data)
 *     toast.success('Profile updated!')
 *   } catch (err) {
 *     toast.error('Failed to update profile')
 *   }
 * }
 * ```
 */
export function useUpdateProfile() {
  return usePatch<UserProfile, Partial<UserProfile>>('/profile')
}

// ============================================================================
// GIGS EXAMPLES
// ============================================================================

/**
 * Example: Fetch gigs with search params
 * Usage in component:
 * ```tsx
 * const [filters, setFilters] = useState<GigSearchParams>({
 *   genres: ['rock', 'jazz'],
 *   min_payment: 500
 * })
 * const { data, loading, error } = useGigs(filters)
 * ```
 */
export function useGigs(params?: GigSearchParams) {
  return useGet<{ data: Gig[] }>(
    '/gigs',
    params as Record<string, string | number | boolean | string[] | undefined>
  )
}

/**
 * Example: Fetch single gig by ID
 */
export function useGig(gigId: string) {
  return useGet<Gig>(`/gigs/${gigId}`)
}

/**
 * Example: Apply to a gig (mutation)
 * Usage in component:
 * ```tsx
 * const { mutate: applyToGig, loading } = useApplyToGig()
 * const handleApply = async (gigId: string) => {
 *   try {
 *     await applyToGig({ gigId })
 *     toast.success('Application submitted!')
 *   } catch (err) {
 *     toast.error('Failed to apply')
 *   }
 * }
 * ```
 */
export function useApplyToGig() {
  const { mutate, loading, error } = useApi<void, { gigId: string }>(
    '/gigs/:gigId/apply',
    { method: 'POST' }
  )

  return {
    applyToGig: async (gigId: string) => {
      // Replace :gigId with actual ID
      const endpoint = `/gigs/${gigId}/apply`
      return usePost<void>(endpoint).mutate()
    },
    loading,
    error,
  }
}

// ============================================================================
// ARTISTS EXAMPLES
// ============================================================================

/**
 * Example: Search artists with filters
 */
export function useArtists(params?: ArtistSearchParams) {
  return useGet<{ data: Artist[] }>(
    '/artists',
    params as Record<string, string | number | boolean | string[] | undefined>
  )
}

/**
 * Example: Fetch single artist by ID
 */
export function useArtist(artistId: string) {
  return useGet<Artist>(`/artists/${artistId}`)
}

/**
 * Example: Follow/unfollow artist
 */
export function useFollowArtist(artistId: string) {
  const { mutate: follow, loading: followLoading } = usePost<void>(
    `/artists/${artistId}/follow`
  )

  const { mutate: unfollow, loading: unfollowLoading } = usePost<void>(
    `/artists/${artistId}/unfollow`
  )

  return {
    follow,
    unfollow,
    loading: followLoading || unfollowLoading,
  }
}

// ============================================================================
// MESSAGES EXAMPLES
// ============================================================================

/**
 * Example: Fetch conversations list
 */
export function useConversations() {
  return useGet<Conversation[]>('/messages/conversations')
}

/**
 * Example: Fetch conversation thread
 */
export function useConversationThread(conversationId: string) {
  return useGet<Conversation>(`/messages/conversations/${conversationId}`)
}

/**
 * Example: Send message (mutation)
 * Usage in component:
 * ```tsx
 * const { sendMessage, loading } = useSendMessage(conversationId)
 * const handleSend = async (content: string) => {
 *   try {
 *     await sendMessage(content)
 *     // Message sent successfully
 *   } catch (err) {
 *     toast.error('Failed to send message')
 *   }
 * }
 * ```
 */
export function useSendMessage(conversationId: string) {
  const { mutate, loading, error } = usePost<Message, { content: string }>(
    `/messages/conversations/${conversationId}/messages`
  )

  return {
    sendMessage: (content: string) => mutate({ content }),
    loading,
    error,
  }
}

// ============================================================================
// ONBOARDING EXAMPLES
// ============================================================================

/**
 * Example: Update onboarding step (mutation)
 * Usage in component:
 * ```tsx
 * const { updateStep, loading } = useOnboardingStep(1)
 * const handleSubmit = async (data: OnboardingStep1Data) => {
 *   try {
 *     await updateStep(data)
 *     navigate('/onboarding/artists/step2')
 *   } catch (err) {
 *     toast.error('Failed to save step')
 *   }
 * }
 * ```
 */
export function useOnboardingStep(stepNumber: number) {
  const { mutate, loading, error } = usePatch<void, OnboardingStep1Data>(
    `/onboarding/step/${stepNumber}`
  )

  return {
    updateStep: mutate,
    loading,
    error,
  }
}

/**
 * Example: Complete onboarding
 */
export function useCompleteOnboarding() {
  return usePost<void>('/onboarding/complete')
}

// ============================================================================
// VIOLET AI EXAMPLES
// ============================================================================

/**
 * Example: Send prompt to Violet
 * Usage in component:
 * ```tsx
 * const { sendPrompt, loading, data: response } = useVioletPrompt()
 * const handlePrompt = async (prompt: string) => {
 *   try {
 *     const result = await sendPrompt(prompt)
 *     // Display result.response
 *   } catch (err) {
 *     toast.error('Failed to get response from Violet')
 *   }
 * }
 * ```
 */
export function useVioletPrompt() {
  const { mutate, loading, error, data } = usePost<
    VioletResponse,
    { prompt: string }
  >('/violet/prompt')

  return {
    sendPrompt: (prompt: string) => mutate({ prompt }),
    loading,
    error,
    response: data,
  }
}

/**
 * Example: Get Violet usage stats
 */
export function useVioletUsage() {
  return useGet<{
    prompts_used_today: number
    prompts_limit: number
    reset_at: string
  }>('/violet/usage')
}

// ============================================================================
// FILE UPLOAD EXAMPLES
// ============================================================================

/**
 * Example: Upload file
 * Usage in component:
 * ```tsx
 * const { uploadFile, loading, error } = useFileUpload()
 * const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
 *   const file = e.target.files?.[0]
 *   if (!file) return
 *   try {
 *     const result = await uploadFile(file)
 *     toast.success('File uploaded!')
 *   } catch (err) {
 *     toast.error('Upload failed')
 *   }
 * }
 * ```
 */
export function useFileUpload() {
  const { mutate, loading, error } = usePost<FileUploadResponse, FormData>(
    '/files/upload'
  )

  return {
    uploadFile: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      return mutate(formData as any)
    },
    loading,
    error,
  }
}

// ============================================================================
// ADVANCED PATTERNS
// ============================================================================

/**
 * Example: Paginated data with refetch
 * Usage in component:
 * ```tsx
 * const { data, loading, error, loadMore, hasMore } = usePaginatedGigs()
 * // Infinite scroll implementation
 * useEffect(() => {
 *   const handleScroll = () => {
 *     if (hasMore && !loading) {
 *       loadMore()
 *     }
 *   }
 *   window.addEventListener('scroll', handleScroll)
 *   return () => window.removeEventListener('scroll', handleScroll)
 * }, [hasMore, loading, loadMore])
 * ```
 */
export function usePaginatedGigs(initialParams?: GigSearchParams) {
  const [page, setPage] = React.useState(1)
  const [allData, setAllData] = React.useState<Gig[]>([])

  const { data, loading, error } = useGet<{
    data: Gig[]
    has_more: boolean
  }>('/gigs', { ...initialParams, page })

  React.useEffect(() => {
    if (data?.data) {
      setAllData((prev) => [...prev, ...data.data])
    }
  }, [data])

  return {
    data: allData,
    loading,
    error,
    loadMore: () => setPage((p) => p + 1),
    hasMore: data?.has_more ?? false,
  }
}

/**
 * Example: Optimistic updates with refetch
 * Usage in component:
 * ```tsx
 * const { data: profile, refetch } = useProfile()
 * const { mutate } = useUpdateProfile()
 * const handleUpdate = async (newData) => {
 *   // Optimistically update UI
 *   setLocalProfile(newData)
 *   try {
 *     await mutate(newData)
 *     // Refetch to get server state
 *     await refetch()
 *   } catch (err) {
 *     // Revert optimistic update
 *     setLocalProfile(profile)
 *   }
 * }
 * ```
 */

// Export React for the pagination example
import React from 'react'
