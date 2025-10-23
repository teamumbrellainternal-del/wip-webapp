/**
 * API Client for Umbrella
 * Handles authentication, error handling, and API communication
 */

interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    action?: string;
  };
}

function getSession() {
  try {
    const sessionData = localStorage.getItem('umbrella_session');
    if (!sessionData) return null;
    return JSON.parse(sessionData);
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
    } catch (error) {
      throw error;
    }
  }

  // Auth endpoints
  async checkSession(): Promise<any> {
    return this.request<any>('/auth/session');
  }

  async logout(): Promise<void> {
    await this.request<void>('/auth/logout', {
      method: 'POST',
    });
  }

  // Profile endpoints (stubs for future implementation)
  async getProfile(): Promise<any> {
    return this.request<any>('/profile');
  }

  async updateProfile(data: any): Promise<any> {
    return this.request<any>('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Marketplace endpoints (stubs for future implementation)
  async listGigs(): Promise<any[]> {
    return this.request<any[]>('/gigs');
  }

  async getGig(gigId: string): Promise<any> {
    return this.request<any>(`/gigs/${gigId}`);
  }

  async listArtists(): Promise<any[]> {
    return this.request<any[]>('/artists');
  }

  async getArtist(artistId: string): Promise<any> {
    return this.request<any>(`/artists/${artistId}`);
  }

  // Messaging endpoints (stubs for future implementation)
  async listConversations(): Promise<any[]> {
    return this.request<any[]>('/conversations');
  }

  async getMessages(conversationId: string): Promise<any[]> {
    return this.request<any[]>(`/conversations/${conversationId}/messages`);
  }

  async sendMessage(conversationId: string, content: string): Promise<any> {
    return this.request<any>(`/conversations/${conversationId}/messages`, {
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
