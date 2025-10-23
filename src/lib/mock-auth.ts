// Mock authentication service for demo
// TODO: Replace with real Cloudflare Access OAuth

export interface User {
  id: string
  email: string
  name: string
  onboarding_complete: boolean
}

const MOCK_USERS: User[] = [
  {
    id: 'demo-1',
    email: 'demo@umbrella.app',
    name: 'Demo Artist',
    onboarding_complete: true,
  },
  {
    id: 'demo-2',
    email: 'test@umbrella.app',
    name: 'Test User',
    onboarding_complete: false,
  },
]

export class MockAuthService {
  private static readonly STORAGE_KEY = 'umbrella_mock_session'

  static async signInWithApple(): Promise<User> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const user = MOCK_USERS[0]
    this.setSession(user)
    return user
  }

  static async signInWithGoogle(): Promise<User> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const user = MOCK_USERS[1]
    this.setSession(user)
    return user
  }

  static getSession(): User | null {
    const stored = localStorage.getItem(this.STORAGE_KEY)
    if (!stored) return null

    try {
      return JSON.parse(stored)
    } catch {
      return null
    }
  }

  static setSession(user: User): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user))
  }

  static clearSession(): void {
    localStorage.removeItem(this.STORAGE_KEY)
  }

  static isAuthenticated(): boolean {
    return this.getSession() !== null
  }
}
