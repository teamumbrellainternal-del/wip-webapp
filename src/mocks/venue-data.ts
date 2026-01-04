/**
 * Mock data for Venue Dashboard
 * Contains all mock data for the venue mode UI
 */

// Venue profile data
export interface VenueProfile {
  id: string
  name: string
  tagline: string
  location: string
  capacity: number
  status: 'open_for_bookings' | 'closed' | 'limited'
  eventsHosted: number
  networkSize: number
  avatarInitials: string
  bannerUrl: string
  verified: boolean
}

export const mockVenueProfile: VenueProfile = {
  id: 'venue-1',
  name: 'The Velvet Room',
  tagline: 'Intimate Jazz Club & Cocktail Lounge • SF Bay Area',
  location: 'San Francisco',
  capacity: 280,
  status: 'open_for_bookings',
  eventsHosted: 456,
  networkSize: 2800,
  avatarInitials: 'VR',
  bannerUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1600&h=400&fit=crop',
  verified: true,
}

// Venue stats data
export interface VenueStats {
  upcomingShows: {
    count: number
    nextDate: string
  }
  totalArtistsBooked: {
    count: number
    percentageChange: number
  }
  monthlyRevenue: {
    amount: number
    label: string
  }
}

export const mockVenueStats: VenueStats = {
  upcomingShows: {
    count: 12,
    nextDate: 'Dec 8',
  },
  totalArtistsBooked: {
    count: 37,
    percentageChange: 14,
  },
  monthlyRevenue: {
    amount: 4800,
    label: 'This Month',
  },
}

// Upcoming shows data
export interface UpcomingShow {
  id: string
  artistName: string
  date: string
  imageUrl: string
  status: 'booked' | 'tentative' | 'pending'
}

export const mockUpcomingShows: UpcomingShow[] = [
  {
    id: 'show-1',
    artistName: 'Sarah Chen Quartet',
    date: 'Dec 8, 2024',
    imageUrl: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400&h=300&fit=crop',
    status: 'booked',
  },
  {
    id: 'show-2',
    artistName: 'The Wavelengths',
    date: 'Dec 12, 2024',
    imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=300&fit=crop',
    status: 'booked',
  },
  {
    id: 'show-3',
    artistName: 'DJ Nova',
    date: 'Dec 19, 2024',
    imageUrl: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=400&h=300&fit=crop',
    status: 'tentative',
  },
]

// Calendar events data
export interface CalendarEvent {
  id: string
  date: string // YYYY-MM-DD format
  artistName: string
  status: 'booked' | 'tentative' | 'pending'
}

export const mockCalendarEvents: CalendarEvent[] = [
  { id: 'event-1', date: '2024-12-05', artistName: 'Sarah Chen', status: 'booked' },
  { id: 'event-2', date: '2024-12-12', artistName: 'The Wavelengths', status: 'booked' },
  { id: 'event-3', date: '2024-12-19', artistName: 'DJ Nova', status: 'tentative' },
  { id: 'event-4', date: '2024-12-26', artistName: 'Various Artists', status: 'booked' },
]

// Smart features settings
export interface SmartFeatures {
  instantConfirmations: boolean
  artistChat: boolean
  autoPromotions: boolean
}

export const mockSmartFeatures: SmartFeatures = {
  instantConfirmations: false,
  artistChat: true,
  autoPromotions: true,
}

// Artist match data
export interface ArtistMatch {
  id: string
  name: string
  genre: string
  matchPercentage: number
  distance: number
  projectedDraw: string
  imageUrl: string
}

export const mockArtistMatches: ArtistMatch[] = [
  {
    id: 'artist-1',
    name: 'The Midnight Collective',
    genre: 'Electronic',
    matchPercentage: 94,
    distance: 2.3,
    projectedDraw: '200-300',
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
  },
  {
    id: 'artist-2',
    name: 'Luna Martinez',
    genre: 'Jazz',
    matchPercentage: 89,
    distance: 1.8,
    projectedDraw: '150-200',
    imageUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=400&fit=crop',
  },
  {
    id: 'artist-3',
    name: 'The Wavelengths',
    genre: 'Indie Rock',
    matchPercentage: 85,
    distance: 3.1,
    projectedDraw: '180-250',
    imageUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&h=400&fit=crop',
  },
  {
    id: 'artist-4',
    name: 'Marcus Williams Band',
    genre: 'Soul / R&B',
    matchPercentage: 82,
    distance: 4.2,
    projectedDraw: '160-220',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
  },
  {
    id: 'artist-5',
    name: 'Echo Chamber',
    genre: 'Alternative',
    matchPercentage: 78,
    distance: 5.7,
    projectedDraw: '140-200',
    imageUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&h=400&fit=crop',
  },
  {
    id: 'artist-6',
    name: 'Saffron Beats',
    genre: 'Hip-Hop',
    matchPercentage: 75,
    distance: 3.5,
    projectedDraw: '180-250',
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
  },
]

// Co-Marketing Studio data
export interface PromoPackData {
  socialCaption: string
  ticketQrUrl: string
}

export const mockPromoPackData: PromoPackData = {
  socialCaption:
    '🎵 This Friday! Experience the incredible Sarah Chen Quartet live at The Purple Room. Limited tickets available. Grab yours now! 🎟️',
  ticketQrUrl: '/api/tickets/qr/show-1',
}

export interface EventPromotionImpact {
  postEngagement: number
  shares: number
  clickThroughRate: number
}

export const mockEventPromotionImpact: EventPromotionImpact = {
  postEngagement: 847,
  shares: 124,
  clickThroughRate: 12.4,
}

export interface CommunityMetrics {
  community: { value: number; trend: string }
  monthlyReach: { value: number; trend: string }
  fanLove: { value: number; trend: string }
  newFans: { value: number; trend: string }
}

export const mockCommunityMetrics: CommunityMetrics = {
  community: { value: 12400, trend: 'Growing strong' },
  monthlyReach: { value: 34200, trend: '+15% this month' },
  fanLove: { value: 8900, trend: 'Highly engaged' },
  newFans: { value: 2300, trend: 'This month' },
}

export interface NextShowBuzz {
  title: string
  artistName: string
  date: string
  imageUrl: string
  fansComing: number
  capacityPercent: number
  spotsLeft: number
  coMarketingReach: number
}

export const mockNextShowBuzz: NextShowBuzz = {
  title: 'Jazz Fusion Night',
  artistName: 'Sarah Chen Quartet',
  date: 'Dec 5',
  imageUrl: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=200&h=200&fit=crop',
  fansComing: 245,
  capacityPercent: 87,
  spotsLeft: 35,
  coMarketingReach: 5200,
}
