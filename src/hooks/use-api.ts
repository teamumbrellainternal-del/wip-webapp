/**
 * Enhanced API hooks for Umbrella MVP
 * Supports both GET requests and mutations (POST, PATCH, DELETE)
 * with proper TypeScript generics, loading states, and error handling
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { handleApiError, isAuthError } from '@/utils/errors'
import { apiClient } from '@/lib/api-client'

// ============================================================================
// TYPES
// ============================================================================

interface UseApiOptions<TRequest = unknown> {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  skip?: boolean
  params?: Record<string, string | number | boolean | string[] | undefined>
  body?: TRequest
  headers?: Record<string, string>
  onSuccess?: (data: unknown) => void
  onError?: (error: Error) => void
}

interface UseApiResult<TResponse, TRequest = unknown> {
  data: TResponse | null
  error: Error | null
  loading: boolean
  refetch: () => void
  mutate: (data?: TRequest) => Promise<TResponse>
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Make authenticated API request using the centralized apiClient
 */
async function apiRequest<TResponse, TRequest = unknown>(
  endpoint: string,
  options: UseApiOptions<TRequest> = {}
): Promise<TResponse> {
  const { method = 'GET', body, headers } = options

  // Use the centralized apiClient which handles auth token injection automatically
  return apiClient['request']<TResponse>(endpoint, {
    method,
    headers,
    body: body && method !== 'GET' ? JSON.stringify(body) : undefined,
  })
}

// ============================================================================
// MAIN HOOK
// ============================================================================

/**
 * Main useApi hook for both GET requests and mutations
 *
 * @example GET request
 * const { data, loading, error, refetch } = useApi<User>('/v1/profile')
 *
 * @example Mutation
 * const { mutate, loading, error } = useApi<User, UpdateUserInput>('/v1/profile', {
 *   method: 'PATCH'
 * })
 * const handleUpdate = async () => {
 *   const result = await mutate({ name: 'John' })
 * }
 */
export function useApi<TResponse, TRequest = unknown>(
  endpoint: string,
  options: UseApiOptions<TRequest> = {}
): UseApiResult<TResponse, TRequest> {
  const { method = 'GET', skip = false, params, body, headers, onSuccess, onError } = options

  const [data, setData] = useState<TResponse | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [refetchTrigger, setRefetchTrigger] = useState(0)

  // Track if component is mounted to prevent state updates after unmount
  const isMounted = useRef(true)

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  // Fetch function for GET requests
  const fetchData = useCallback(async () => {
    if (skip || method !== 'GET') return

    try {
      setLoading(true)
      setError(null)

      const result = await apiRequest<TResponse>(endpoint, {
        method,
        params,
        headers,
      })

      if (isMounted.current) {
        setData(result)
        onSuccess?.(result)
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))

      if (isMounted.current) {
        setError(error)
        onError?.(error)

        // Handle auth errors
        if (isAuthError(err)) {
          // Redirect is handled in apiRequest
          return
        }
      }
    } finally {
      if (isMounted.current) {
        setLoading(false)
      }
    }
  }, [endpoint, method, skip, params, headers, onSuccess, onError, refetchTrigger])

  // Auto-fetch on mount for GET requests
  useEffect(() => {
    if (method === 'GET' && !skip) {
      fetchData()
    }
  }, [fetchData, method, skip])

  // Refetch function
  const refetch = useCallback(() => {
    setRefetchTrigger((prev) => prev + 1)
  }, [])

  // Mutate function for POST/PATCH/PUT/DELETE
  const mutate = useCallback(
    async (mutationData?: TRequest): Promise<TResponse> => {
      try {
        setLoading(true)
        setError(null)

        const result = await apiRequest<TResponse, TRequest>(endpoint, {
          method,
          params,
          body: mutationData || body,
          headers,
        })

        if (isMounted.current) {
          setData(result)
          onSuccess?.(result)
        }

        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))

        if (isMounted.current) {
          setError(error)
          onError?.(error)
        }

        throw error
      } finally {
        if (isMounted.current) {
          setLoading(false)
        }
      }
    },
    [endpoint, method, params, body, headers, onSuccess, onError]
  )

  return {
    data,
    error,
    loading,
    refetch,
    mutate,
  }
}

// ============================================================================
// CONVENIENCE HOOKS
// ============================================================================

/**
 * Hook for GET requests
 */
export function useGet<TResponse>(
  endpoint: string,
  params?: Record<string, string | number | boolean | string[] | undefined>
) {
  return useApi<TResponse>(endpoint, { method: 'GET', params })
}

/**
 * Hook for POST mutations
 */
export function usePost<TResponse, TRequest = unknown>(endpoint: string) {
  return useApi<TResponse, TRequest>(endpoint, { method: 'POST' })
}

/**
 * Hook for PATCH mutations
 */
export function usePatch<TResponse, TRequest = unknown>(endpoint: string) {
  return useApi<TResponse, TRequest>(endpoint, { method: 'PATCH' })
}

/**
 * Hook for PUT mutations
 */
export function usePut<TResponse, TRequest = unknown>(endpoint: string) {
  return useApi<TResponse, TRequest>(endpoint, { method: 'PUT' })
}

/**
 * Hook for DELETE mutations
 */
export function useDelete<TResponse = void>(endpoint: string) {
  return useApi<TResponse>(endpoint, { method: 'DELETE' })
}

// Export helper for direct API calls (not as a hook)
export { apiRequest, handleApiError }
