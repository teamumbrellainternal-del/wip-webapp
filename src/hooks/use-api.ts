/**
 * Enhanced API hooks for Umbrella MVP
 * Supports both GET requests and mutations (POST, PATCH, DELETE)
 * with proper TypeScript generics, loading states, and error handling
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { ApiError, handleApiError, isAuthError } from '@/utils/errors'

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
 * Get authentication token from session
 */
function getAuthToken(): string | null {
  try {
    const sessionData = localStorage.getItem('umbrella_session')
    if (!sessionData) return null
    const session = JSON.parse(sessionData)
    return session.token || null
  } catch {
    return null
  }
}

/**
 * Build URL with query parameters
 */
function buildUrl(
  endpoint: string,
  params?: Record<string, string | number | boolean | string[] | undefined>
): string {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '/v1'
  const url = `${baseUrl}${endpoint}`

  if (!params) return url

  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        // For arrays, append each value separately (e.g., genres=rock&genres=jazz)
        value.forEach(item => searchParams.append(key, String(item)))
      } else {
        searchParams.append(key, String(value))
      }
    }
  })

  const queryString = searchParams.toString()
  return queryString ? `${url}?${queryString}` : url
}

/**
 * Make authenticated API request
 */
async function apiRequest<TResponse, TRequest = unknown>(
  endpoint: string,
  options: UseApiOptions<TRequest> = {}
): Promise<TResponse> {
  const { method = 'GET', params, body, headers: customHeaders } = options

  const token = getAuthToken()
  const url = buildUrl(endpoint, params)

  // Build headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // Build request options
  const requestOptions: RequestInit = {
    method,
    headers,
  }

  // Add body for mutations
  if (body && method !== 'GET') {
    if (body instanceof FormData) {
      // For file uploads, remove Content-Type header (browser will set it with boundary)
      delete headers['Content-Type']
      requestOptions.body = body
    } else {
      requestOptions.body = JSON.stringify(body)
    }
  }

  // Make request
  const response = await fetch(url, requestOptions)

  // Handle 401 Unauthorized - redirect to /auth
  if (response.status === 401) {
    // Clear session
    localStorage.removeItem('umbrella_session')
    // Redirect to auth page
    window.location.href = '/auth'
    throw new ApiError(401, 'Unauthorized')
  }

  // Handle non-OK responses
  if (!response.ok) {
    let errorMessage = 'Request failed'
    let errorDetails: Record<string, unknown> | undefined

    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorData.error || errorMessage
      errorDetails = errorData.details || errorData
    } catch {
      // If JSON parsing fails, use status text
      errorMessage = response.statusText || errorMessage
    }

    throw new ApiError(response.status, errorMessage, errorDetails)
  }

  // Handle empty responses (e.g., 204 No Content)
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null as TResponse
  }

  // Parse JSON response
  try {
    return await response.json()
  } catch {
    throw new ApiError(500, 'Invalid JSON response from server')
  }
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
  const {
    method = 'GET',
    skip = false,
    params,
    body,
    headers,
    onSuccess,
    onError,
  } = options

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
    setRefetchTrigger(prev => prev + 1)
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
export function usePost<TResponse, TRequest = unknown>(
  endpoint: string
) {
  return useApi<TResponse, TRequest>(endpoint, { method: 'POST' })
}

/**
 * Hook for PATCH mutations
 */
export function usePatch<TResponse, TRequest = unknown>(
  endpoint: string
) {
  return useApi<TResponse, TRequest>(endpoint, { method: 'PATCH' })
}

/**
 * Hook for PUT mutations
 */
export function usePut<TResponse, TRequest = unknown>(
  endpoint: string
) {
  return useApi<TResponse, TRequest>(endpoint, { method: 'PUT' })
}

/**
 * Hook for DELETE mutations
 */
export function useDelete<TResponse = void>(
  endpoint: string
) {
  return useApi<TResponse>(endpoint, { method: 'DELETE' })
}

// Export helper for direct API calls (not as a hook)
export { apiRequest, handleApiError }
