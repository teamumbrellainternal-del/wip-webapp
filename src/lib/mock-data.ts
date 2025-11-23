import { Artist, Gig, Conversation, Message, DashboardMetrics, UserProfile } from '@/types'

/**
 * Mock data for Demo Mode
 * Used by API Client to simulate backend responses
 */

export const MOCK_ARTIST: Artist = {
  id: 'demo-artist-1',
  artist_name: 'DJ Demo',
  full_name: 'Demo User',
  location: 'Los Angeles, CA',
  genres: ['Electronic', 'House', 'Techno'],
  bio: 'Electronic music producer and DJ specializing in house and techno. Available for clubs, festivals, and private events.',
  avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo',
  banner_url: 'https://images.unsplash.com/photo-1571266028243-e4733b090bb1?w=1200&q=80',
  social_links: {
    website: 'https://demo-artist.com',
    instagram: 'djdemo',
    spotify: 'demo',
    soundcloud: 'demo',
  },
  price_range_min: 150,
  price_range_max: 500,
  verified: true,
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
    location: 'Los Angeles, CA',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    time: '20:00',
    capacity: 200,
    venue_rating_avg: 4.5,
    venue_review_count: 10,
    genre_tags: ['House', 'Pop'],
    payment_amount: 400,
    urgency_flag: false,
    status: 'open',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'gig-2',
    title: 'Friday Night Residency',
    description: 'Seeking a resident DJ for Friday nights. Deep house and lounge vibes.',
    venue_name: 'The Basement',
    venue_id: 'venue-2',
    location: 'West Hollywood, CA',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    time: '22:00',
    capacity: 150,
    venue_rating_avg: 4.2,
    venue_review_count: 8,
    genre_tags: ['Deep House'],
    payment_amount: 200,
    urgency_flag: true,
    status: 'open',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

export const MOCK_ARTISTS: Artist[] = [
  MOCK_ARTIST,
  {
    id: 'artist-2',
    artist_name: 'The Midnight Band',
    full_name: 'John Smith',
    location: 'San Francisco, CA',
    genres: ['Rock', 'Indie'],
    bio: 'Indie rock band playing original songs and covers.',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Band',
    social_links: {
      website: 'https://band.example.com'
    },
    verified: true,
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
        avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=SH',
        role: 'venue'
      },
      {
        id: 'demo-artist-1',
        name: 'DJ Demo',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo',
        role: 'artist'
      }
    ],
    context_type: 'venue',
    last_message_preview: 'Hey, are you available for the rooftop party?',
    unread_count: 1,
    updated_at: new Date().toISOString()
  }
]

export const MOCK_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    conversation_id: 'conv-1',
    content: 'Hey, are you available for the rooftop party?',
    sender_id: 'venue-1',
    sender_name: 'Sky High Lounge',
    timestamp: new Date().toISOString(),
    read_status: false
  }
]

export const MOCK_DASHBOARD_METRICS: DashboardMetrics = {
  earnings: {
    current_month: 1200,
    percentage_change: 15
  },
  gigs_booked: {
    count: 3,
    timeframe: 'this month'
  },
  profile_views: {
    count: 125,
    percentage_change: 12
  },
  opportunities: [],
  messages: [],
  endorsements: []
}

export const MOCK_USER_PROFILE: UserProfile = {
  id: 'demo-user-123',
  email: 'demo@umbrella-app.com',
  full_name: 'Demo User',
  avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo',
  role: 'artist',
  onboarding_completed: true,
  profile_completion_percentage: 85,
  verified: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

