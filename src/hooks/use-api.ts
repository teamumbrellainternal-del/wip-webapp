/**
 * API hooks for Umbrella
 * Generic hooks for making API requests to the backend
 */

import { useState, useEffect } from 'react';

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  refetch: () => void;
}

function getAuthToken(): string | null {
  try {
    const sessionData = localStorage.getItem('umbrella_session');
    if (!sessionData) return null;
    const session = JSON.parse(sessionData);
    return session.token;
  } catch {
    return null;
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}

export function useApi<T>(endpoint: string, skip = false): ApiResponse<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!skip);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    if (skip) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiRequest<T>(endpoint);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint, skip, refetchTrigger]);

  const refetch = () => setRefetchTrigger((prev) => prev + 1);

  return { data, error, loading, refetch };
}

// Profile hooks
export function useProfile() {
  return useApi<any>('/v1/profile');
}

export function useUpdateProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      await apiRequest('/v1/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateProfile, loading, error };
}

// Marketplace hooks (stubs for future implementation)
export function useGigs() {
  return useApi<any[]>('/v1/gigs');
}

export function useArtists() {
  return useApi<any[]>('/v1/artists');
}

export function useGig(gigId: string) {
  return useApi<any>(`/v1/gigs/${gigId}`);
}

export function useArtist(artistId: string) {
  return useApi<any>(`/v1/artists/${artistId}`);
}

// Messaging hooks (stubs for future implementation)
export function useConversations() {
  return useApi<any[]>('/v1/conversations');
}

export function useMessages(conversationId: string) {
  return useApi<any[]>(`/v1/conversations/${conversationId}/messages`);
}
