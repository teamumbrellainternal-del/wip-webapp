/**
 * API Client for Leger backend
 * Handles authentication, error handling, and API communication
 */

import { toast } from 'sonner';
import { getSession, clearSession } from './session';
import type {
  SecretMetadata,
  SecretWithValue,
  ReleaseRecord,
  APIResponse,
  AuthResponse,
  SecretsListResponse,
  ReleasesListResponse,
  CreateReleaseInput,
  UpdateReleaseInput,
} from '@/types';

class APIClient {
  private baseURL = '/api';

  /**
   * Get request headers with JWT authentication
   */
  private getHeaders(): HeadersInit {
    const session = getSession();
    return {
      'Content-Type': 'application/json',
      ...(session && { Authorization: `Bearer ${session.jwt}` }),
    };
  }

  /**
   * Make an authenticated API request
   */
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options?.headers,
        },
      });

      // Handle 401 specially (don't toast, just redirect)
      if (response.status === 401) {
        clearSession();
        window.location.href = '/auth?error=session_expired';
        throw new Error('Unauthorized');
      }

      // Try to parse JSON
      let data: APIResponse<T>;
      try {
        data = await response.json();
      } catch {
        toast.error('Invalid response from server');
        throw new Error('Invalid JSON response');
      }

      // Handle API errors
      if (!data.success) {
        toast.error(data.error?.message || 'Request failed', {
          description: data.error?.action,
        });
        throw new Error(data.error?.message || 'Request failed');
      }

      return data.data as T;
    } catch (error) {
      // Network errors
      if (error instanceof TypeError) {
        toast.error('Network error', {
          description: 'Please check your connection',
        });
      }
      throw error;
    }
  }

  /**
   * Validate JWT token
   */
  async validateAuth(token: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/validate', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  /**
   * Login with test user (no authentication required)
   * For development/testing purposes only
   */
  async loginTest(): Promise<AuthResponse> {
    const url = `${this.baseURL}/test/auth/login`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      let data: APIResponse<AuthResponse>;
      try {
        data = await response.json();
      } catch {
        toast.error('Invalid response from server');
        throw new Error('Invalid JSON response');
      }

      if (!data.success) {
        toast.error(data.error?.message || 'Test login failed');
        throw new Error(data.error?.message || 'Test login failed');
      }

      return data.data as AuthResponse;
    } catch (error) {
      if (error instanceof TypeError) {
        toast.error('Network error', {
          description: 'Please check your connection',
        });
      }
      throw error;
    }
  }

  /**
   * List all secrets for the current user
   */
  async listSecrets(includeValues = false): Promise<SecretsListResponse> {
    const query = includeValues ? '?include_values=true' : '';
    return this.request<SecretsListResponse>(`/secrets${query}`);
  }

  /**
   * Get a specific secret by name
   */
  async getSecret(name: string): Promise<SecretWithValue> {
    return this.request<SecretWithValue>(`/secrets/${name}`);
  }

  /**
   * Create or update a secret
   */
  async upsertSecret(name: string, value: string): Promise<SecretMetadata> {
    return this.request<SecretMetadata>(`/secrets/${name}`, {
      method: 'POST',
      body: JSON.stringify({ value }),
    });
  }

  /**
   * Delete a secret
   */
  async deleteSecret(name: string): Promise<void> {
    await this.request<void>(`/secrets/${name}`, {
      method: 'DELETE',
    });
  }

  /**
   * List all releases for the current user
   */
  async listReleases(): Promise<ReleasesListResponse> {
    return this.request<ReleasesListResponse>('/releases');
  }

  /**
   * Get a specific release by ID
   */
  async getRelease(id: string): Promise<ReleaseRecord> {
    return this.request<ReleaseRecord>(`/releases/${id}`);
  }

  /**
   * Create a new release
   */
  async createRelease(data: CreateReleaseInput): Promise<ReleaseRecord> {
    return this.request<ReleaseRecord>('/releases', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update an existing release
   */
  async updateRelease(
    id: string,
    data: UpdateReleaseInput
  ): Promise<ReleaseRecord> {
    return this.request<ReleaseRecord>(`/releases/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete a release
   */
  async deleteRelease(id: string): Promise<void> {
    await this.request<void>(`/releases/${id}`, {
      method: 'DELETE',
    });
  }
}

// Export singleton instance
export const apiClient = new APIClient();
