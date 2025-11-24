import { Artist, Gig, Conversation, Message, DashboardMetrics, UserProfile, PerformanceData, Goal, Achievement } from '@/types'

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

export const MOCK_PERFORMANCE_DATA: PerformanceData = {
  period: 'monthly',
  earnings: [
    { date: '2023-01-01', value: 800 },
    { date: '2023-02-01', value: 950 },
    { date: '2023-03-01', value: 1100 },
    { date: '2023-04-01', value: 900 },
    { date: '2023-05-01', value: 1200 },
    { date: '2023-06-01', value: 1500 },
    { date: '2023-07-01', value: 1400 },
    { date: '2023-08-01', value: 1600 },
    { date: '2023-09-01', value: 1800 },
    { date: '2023-10-01', value: 1750 },
    { date: '2023-11-01', value: 1900 },
    { date: '2023-12-01', value: 2100 }
  ],
  gigs: [
    { date: '2023-01-01', value: 2 },
    { date: '2023-02-01', value: 3 },
    { date: '2023-03-01', value: 4 },
    { date: '2023-04-01', value: 3 },
    { date: '2023-05-01', value: 5 },
    { date: '2023-06-01', value: 6 },
    { date: '2023-07-01', value: 5 },
    { date: '2023-08-01', value: 7 },
    { date: '2023-09-01', value: 8 },
    { date: '2023-10-01', value: 7 },
    { date: '2023-11-01', value: 9 },
    { date: '2023-12-01', value: 10 }
  ],
  profile_views: [
    { date: '2023-01-01', value: 50 },
    { date: '2023-02-01', value: 65 },
    { date: '2023-03-01', value: 80 },
    { date: '2023-04-01', value: 75 },
    { date: '2023-05-01', value: 100 },
    { date: '2023-06-01', value: 150 },
    { date: '2023-07-01', value: 180 },
    { date: '2023-08-01', value: 220 },
    { date: '2023-09-01', value: 250 },
    { date: '2023-10-01', value: 280 },
    { date: '2023-11-01', value: 320 },
    { date: '2023-12-01', value: 400 }
  ]
}

export const MOCK_GOALS: Goal[] = [
  {
    id: 'goal-1',
    title: 'Reach $3000 monthly earnings',
    description: 'Increase gig bookings and rate to hit monthly target',
    target_value: 3000,
    current_value: 2100,
    unit: 'USD',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    created_at: new Date().toISOString()
  },
  {
    id: 'goal-2',
    title: 'Perform 50 gigs',
    description: 'Total gigs completed this year',
    target_value: 50,
    current_value: 45,
    unit: 'gigs',
    status: 'active',
    created_at: new Date().toISOString()
  },
  {
    id: 'goal-3',
    title: 'Reach 1000 followers',
    target_value: 1000,
    current_value: 1250,
    unit: 'followers',
    status: 'completed',
    created_at: new Date().toISOString()
  }
]

export const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-1',
    title: 'Rising Star',
    description: 'Complete your first 10 gigs',
    unlocked_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ach-2',
    title: 'Local Favorite',
    description: 'Get 5 five-star reviews',
    unlocked_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ach-3',
    title: 'Road Warrior',
    description: 'Perform in 3 different cities',
    progress_current: 2,
    progress_target: 3
  }
]

