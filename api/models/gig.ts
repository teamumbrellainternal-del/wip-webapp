/**
 * Gig data models
 * Venue opportunities for artists to apply to
 */

/**
 * Gig record stored in D1
 */
export interface Gig {
  id: string
  venue_id: string
  title: string
  description: string | null
  venue_name: string
  location_city: string
  location_state: string
  location_address: string | null
  location_zip: string | null
  date: string // YYYY-MM-DD
  start_time: string | null // HH:MM
  end_time: string | null // HH:MM
  genre: string | null
  capacity: number | null
  filled_slots: number
  payment_amount: number | null
  payment_type: 'flat' | 'hourly' | 'negotiable' | null
  urgency_flag: boolean // <7 days AND <50% capacity filled
  status: 'open' | 'filled' | 'cancelled' | 'completed'
  created_at: string
  updated_at: string
}

/**
 * Gig creation input
 */
export interface CreateGigInput {
  venue_id: string
  title: string
  venue_name: string
  location_city: string
  location_state: string
  date: string
  description?: string
  location_address?: string
  location_zip?: string
  start_time?: string
  end_time?: string
  genre?: string
  capacity?: number
  payment_amount?: number
  payment_type?: 'flat' | 'hourly' | 'negotiable'
}

/**
 * Gig update input
 */
export interface UpdateGigInput {
  title?: string
  description?: string
  date?: string
  start_time?: string
  end_time?: string
  genre?: string
  capacity?: number
  filled_slots?: number
  payment_amount?: number
  payment_type?: 'flat' | 'hourly' | 'negotiable'
  status?: 'open' | 'filled' | 'cancelled' | 'completed'
}

/**
 * Gig application record
 */
export interface GigApplication {
  id: string
  gig_id: string
  artist_id: string
  status: 'pending' | 'accepted' | 'rejected'
  applied_at: string
  responded_at: string | null
}

/**
 * Helper functions
 */

/**
 * Check if gig is urgent (<7 days AND <50% capacity filled)
 */
export function isUrgent(gig: Gig): boolean {
  const gigDate = new Date(gig.date)
  const now = new Date()
  const daysUntilGig = Math.ceil((gigDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  const capacityFilled = gig.capacity ? (gig.filled_slots / gig.capacity) * 100 : 0

  return daysUntilGig <= 7 && capacityFilled < 50
}

/**
 * Calculate days until gig
 */
export function daysUntilGig(gig: Gig): number {
  const gigDate = new Date(gig.date)
  const now = new Date()
  return Math.ceil((gigDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

/**
 * Format gig date and time
 */
export function formatGigDateTime(gig: Gig): string {
  const date = new Date(gig.date)
  const dateStr = date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  if (gig.start_time) {
    return `${dateStr} at ${gig.start_time}`
  }

  return dateStr
}

/**
 * Get gig location string
 */
export function getLocationString(gig: Gig): string {
  return `${gig.location_city}, ${gig.location_state}`
}

/**
 * Check if gig is open for applications
 */
export function isOpen(gig: Gig): boolean {
  return gig.status === 'open'
}

/**
 * Format payment string
 */
export function formatPayment(gig: Gig): string {
  if (!gig.payment_amount) return 'Payment TBD'

  const amount = `$${gig.payment_amount.toLocaleString()}`

  if (gig.payment_type === 'hourly') return `${amount}/hour`
  if (gig.payment_type === 'flat') return amount
  if (gig.payment_type === 'negotiable') return `${amount} (negotiable)`

  return amount
}
