import { Artist, Gig, Conversation, Message, DashboardMetrics, UserProfile } from '@/types'

/**
 * Mock data for Demo Mode
 * Used by API Client to simulate backend responses
 */

export const MOCK_ARTIST: Artist = {
  id: 'demo-artist-1',
  user_id: 'demo-user-123',
  artist_name: 'DJ Demo',
  full_name: 'Demo User',
  email: 'demo@umbrella-app.com',
  location_city: 'Los Angeles',
  location_state: 'CA',
  bio: 'Electronic music producer and DJ specializing in house and techno. Available for clubs, festivals, and private events.',
  primary_genre: 'Electronic',
  secondary_genres: ['House', 'Techno'],
  avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo',
  banner_url: 'https://images.unsplash.com/photo-1571266028243-e4733b090bb1?w=1200&q=80',
  website: 'https://demo-artist.com',
  instagram_handle: 'djdemo',
  spotify_id: 'demo',
  soundcloud_id: 'demo',
  base_rate_hourly: 150,
  base_rate_flat: 500,
  verified: true,
  onboarding_step: 6,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  rating_avg: 4.8,
  review_count: 12,
  follower_count: 1250,
  gigs_completed: 45
}

export const MOCK_GIGS: Gig[] = [
  {
    id: 'gig-1',
    title: 'Summer Rooftop Party',
    description: 'Looking for an energetic DJ for our annual summer rooftop party. Must be able to play a mix of house and top 40.',
    venue_name: 'Sky High Lounge',
    venue_id: 'venue-1',
    location_city: 'Los Angeles',
    location_state: 'CA',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    payment_amount: 400,
    payment_type: 'flat',
    genres: ['House', 'Pop'],
    status: 'open',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    applicant_count: 5
  },
  {
    id: 'gig-2',
    title: 'Friday Night Residency',
    description: 'Seeking a resident DJ for Friday nights. Deep house and lounge vibes.',
    venue_name: 'The Basement',
    venue_id: 'venue-2',
    location_city: 'West Hollywood',
    location_state: 'CA',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    payment_amount: 200,
    payment_type: 'hourly',
    genres: ['Deep House'],
    status: 'open',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    applicant_count: 3
  }
]

export const MOCK_ARTISTS: Artist[] = [
  MOCK_ARTIST,
  {
    id: 'artist-2',
    user_id: 'user-2',
    artist_name: 'The Midnight Band',
    full_name: 'John Smith',
    email: 'band@example.com',
    location_city: 'San Francisco',
    location_state: 'CA',
    bio: 'Indie rock band playing original songs and covers.',
    primary_genre: 'Rock',
    secondary_genres: ['Indie'],
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Band',
    verified: true,
    onboarding_step: 6,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    rating_avg: 4.5,
    review_count: 8,
    follower_count: 800,
    gigs_completed: 20
  }
]

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    participants: [
      {
        id: 'venue-1',
        name: 'Sky High Lounge',
        avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=SH'
      },
      {
        id: 'demo-artist-1',
        name: 'DJ Demo',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo'
      }
    ],
    lastMessage: {
      id: 'msg-1',
      content: 'Hey, are you available for the rooftop party?',
      senderId: 'venue-1',
      createdAt: new Date().toISOString(),
      read: false
    },
    unreadCount: 1,
    updatedAt: new Date().toISOString()
  }
]

export const MOCK_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    conversationId: 'conv-1',
    content: 'Hey, are you available for the rooftop party?',
    senderId: 'venue-1',
    createdAt: new Date().toISOString(),
    read: false
  }
]

export const MOCK_DASHBOARD_METRICS: DashboardMetrics = {
  profileViews: 125,
  profileViewsGrowth: 12,
  gigInvites: 3,
  gigInvitesGrowth: 1,
  messageResponseRate: 95,
  messageResponseRateGrowth: 2,
  searchAppearances: 450,
  searchAppearancesGrowth: 8,
  nextGig: {
    id: 'gig-upcoming',
    title: 'Private Event',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    venue: 'Downtown Loft',
    amount: 600
  },
  recentActivity: [
    {
      id: 'act-1',
      type: 'view',
      title: 'New Profile View',
      description: 'Sky High Lounge viewed your profile',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'act-2',
      type: 'message',
      title: 'New Message',
      description: 'Message from Sky High Lounge',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    }
  ]
}

export const MOCK_USER_PROFILE: UserProfile = {
  id: 'demo-user-123',
  email: 'demo@umbrella-app.com',
  name: 'Demo User',
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo',
  role: 'artist',
  onboardingComplete: true
}

