/**
 * Review data models
 * Artist reviews (no moderation in MVP)
 */

/**
 * Review record stored in D1
 */
export interface Review {
  id: string
  artist_id: string
  reviewer_user_id: string | null // NULL if invited via email
  reviewer_email: string | null
  reviewer_name: string | null
  rating: number // 1-5
  comment: string | null
  gig_id: string | null // Optional link to specific gig
  invite_token: string | null
  created_at: string
}

/**
 * Review creation input
 */
export interface CreateReviewInput {
  artist_id: string
  reviewer_user_id?: string
  reviewer_email?: string
  reviewer_name?: string
  rating: number
  comment?: string
  gig_id?: string
  invite_token?: string
}

/**
 * Review invitation input
 */
export interface InviteReviewInput {
  artist_id: string
  reviewer_email: string
  reviewer_name?: string
  gig_id?: string
}

/**
 * Review statistics
 */
export interface ReviewStats {
  total_reviews: number
  avg_rating: number
  rating_distribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
}

/**
 * Helper functions
 */

/**
 * Validate rating value (1-5)
 */
export function isValidRating(rating: number): boolean {
  return rating >= 1 && rating <= 5 && Number.isInteger(rating)
}

/**
 * Calculate average rating from reviews
 */
export function calculateAverageRating(reviews: Review[]): number {
  if (reviews.length === 0) return 0

  const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
  return Math.round((sum / reviews.length) * 10) / 10 // Round to 1 decimal
}

/**
 * Generate rating distribution
 */
export function generateRatingDistribution(reviews: Review[]): ReviewStats['rating_distribution'] {
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }

  for (const review of reviews) {
    if (review.rating >= 1 && review.rating <= 5) {
      distribution[review.rating as keyof typeof distribution]++
    }
  }

  return distribution
}

/**
 * Generate review statistics
 */
export function generateReviewStats(reviews: Review[]): ReviewStats {
  return {
    total_reviews: reviews.length,
    avg_rating: calculateAverageRating(reviews),
    rating_distribution: generateRatingDistribution(reviews),
  }
}

/**
 * Format rating as stars
 */
export function formatRatingStars(rating: number): string {
  const fullStars = Math.floor(rating)
  const halfStar = rating % 1 >= 0.5 ? 1 : 0
  const emptyStars = 5 - fullStars - halfStar

  return '★'.repeat(fullStars) + (halfStar ? '½' : '') + '☆'.repeat(emptyStars)
}

/**
 * Check if review has comment
 */
export function hasComment(review: Review): boolean {
  return !!review.comment && review.comment.trim().length > 0
}

/**
 * Check if review is from platform user
 */
export function isFromPlatformUser(review: Review): boolean {
  return !!review.reviewer_user_id
}

/**
 * Check if review is linked to a gig
 */
export function isLinkedToGig(review: Review): boolean {
  return !!review.gig_id
}

/**
 * Generate unique invite token
 */
export function generateInviteToken(): string {
  return crypto.randomUUID()
}

/**
 * Truncate review comment
 */
export function truncateComment(comment: string | null, maxLength: number = 200): string {
  if (!comment) return ''
  if (comment.length <= maxLength) return comment
  return comment.substring(0, maxLength) + '...'
}
