/**
 * API Client for Umbrella
 * Handles authentication, error handling, and API communication
 */

// Import types from Session 3 models
import type { UserProfile } from '../../api/models/user'
import type { Artist, ArtistPublicProfile, UpdateArtistInput } from '../../api/models/artist'
import type { Gig } from '../../api/models/gig'
import type { Conversation } from '../../api/models/conversation'
import type { Message } from '../../api/models/message'

interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    field?: string;
  };
}

interface SessionData {
  token: string;
  user: UserProfile;
}

function getSession(): SessionData | null {
  try {
    const sessionData = localStorage.getItem('umbrella_session');
    if (!sessionData) return null;
    return JSON.parse(sessionData) as SessionData;
  } catch {
    return null;
  }
}

function clearSession() {
  localStorage.removeItem('umbrella_session');
}

class APIClient {
  private baseURL = '/v1';

  /**
   * Get request headers with JWT authentication
   */
  private getHeaders(): HeadersInit {
    const session = getSession();
    return {
      'Content-Type': 'application/json',
      ...(session && { Authorization: `Bearer ${session.token}` }),
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
      window.location.href = '/?error=session_expired';
      throw new Error('Unauthorized');
    }

    // Try to parse JSON
    let data: APIResponse<T>;
    try {
      data = await response.json();
    } catch {
      throw new Error('Invalid JSON response');
    }

    // Handle API errors
    if (!data.success) {
      throw new Error(data.error?.message || 'Request failed');
    }

    return data.data as T;
  }

  // Auth endpoints
  async checkSession(): Promise<{ user: UserProfile; valid: boolean }> {
    return this.request<{ user: UserProfile; valid: boolean }>('/auth/session');
  }

  async logout(): Promise<void> {
    await this.request<void>('/auth/logout', {
      method: 'POST',
    });
  }

  // Profile endpoints (stubs for future implementation)
  async getProfile(): Promise<Artist> {
    return this.request<Artist>('/profile');
  }

  async updateProfile(data: UpdateArtistInput): Promise<Artist> {
    return this.request<Artist>('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Marketplace endpoints (stubs for future implementation)
  async listGigs(): Promise<Gig[]> {
    return this.request<Gig[]>('/gigs');
  }

  async getGig(gigId: string): Promise<Gig> {
    return this.request<Gig>(`/gigs/${gigId}`);
  }

  async listArtists(): Promise<ArtistPublicProfile[]> {
    return this.request<ArtistPublicProfile[]>('/artists');
  }

  async getArtist(artistId: string): Promise<ArtistPublicProfile> {
    return this.request<ArtistPublicProfile>(`/artists/${artistId}`);
  }

  // Messaging endpoints (stubs for future implementation)
  async listConversations(): Promise<Conversation[]> {
    return this.request<Conversation[]>('/conversations');
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    return this.request<Message[]>(`/conversations/${conversationId}/messages`);
  }

  async sendMessage(conversationId: string, content: string): Promise<Message> {
    return this.request<Message>(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }
}

// Export singleton instance
export const apiClient = new APIClient();

// Export endpoints map for reference
export const endpoints = {
  auth: {
    callback: '/v1/auth/callback',
    session: '/v1/auth/session',
    logout: '/v1/auth/logout',
  },
  profile: {
    get: '/v1/profile',
    update: '/v1/profile',
  },
  gigs: {
    list: '/v1/gigs',
    get: (id: string) => `/v1/gigs/${id}`,
    create: '/v1/gigs',
  },
  artists: {
    list: '/v1/artists',
    get: (id: string) => `/v1/artists/${id}`,
  },
  conversations: {
    list: '/v1/conversations',
    messages: (id: string) => `/v1/conversations/${id}/messages`,
  },
};
