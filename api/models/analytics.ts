/**
 * Analytics data models
 * Daily metrics aggregation and Violet AI usage tracking
 */

/**
 * Daily metrics record (aggregated at midnight UTC)
 */
export interface DailyMetrics {
  id: string
  artist_id: string
  date: string // YYYY-MM-DD
  profile_views: number
  gigs_completed: number
  earnings: number // User-reported
  avg_rating: number
  follower_count: number
  track_plays: number
  created_at: string
}

/**
 * Violet AI usage record
 */
export interface VioletUsage {
  id: string
  artist_id: string
  date: string // YYYY-MM-DD
  prompt_count: number
  feature_used: string
  prompt_text: string
  response_tokens: number | null
  created_at: string
}

/**
 * Goal record
 */
export interface Goal {
  id: string
  artist_id: string
  title: string
  description: string | null
  target_value: number | null
  current_value: number
  goal_type: 'earnings' | 'gigs' | 'followers' | 'tracks' | 'custom'
  target_date: string | null
  completed: boolean
  created_at: string
  updated_at: string
}

/**
 * Analytics summary (multi-day aggregation)
 */
export interface AnalyticsSummary {
  total_earnings: number
  total_gigs: number
  total_profile_views: number
  total_track_plays: number
  avg_rating: number
  follower_count: number
  earnings_growth: number // Percentage change
  gig_growth: number // Percentage change
  view_growth: number // Percentage change
}

/**
 * Helper functions
 */

/**
 * Calculate total earnings over date range
 */
export function calculateTotalEarnings(metrics: DailyMetrics[]): number {
  return metrics.reduce((sum, m) => sum + m.earnings, 0)
}

/**
 * Calculate total gigs completed over date range
 */
export function calculateTotalGigs(metrics: DailyMetrics[]): number {
  return metrics.reduce((sum, m) => sum + m.gigs_completed, 0)
}

/**
 * Calculate growth percentage
 */
export function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

/**
 * Generate analytics summary from daily metrics
 */
export function generateAnalyticsSummary(
  currentPeriod: DailyMetrics[],
  previousPeriod: DailyMetrics[]
): AnalyticsSummary {
  const currentEarnings = calculateTotalEarnings(currentPeriod)
  const previousEarnings = calculateTotalEarnings(previousPeriod)

  const currentGigs = calculateTotalGigs(currentPeriod)
  const previousGigs = calculateTotalGigs(previousPeriod)

  const currentViews = currentPeriod.reduce((sum, m) => sum + m.profile_views, 0)
  const previousViews = previousPeriod.reduce((sum, m) => sum + m.profile_views, 0)

  const latestMetric = currentPeriod[currentPeriod.length - 1]

  return {
    total_earnings: currentEarnings,
    total_gigs: currentGigs,
    total_profile_views: currentViews,
    total_track_plays: currentPeriod.reduce((sum, m) => sum + m.track_plays, 0),
    avg_rating: latestMetric?.avg_rating || 0,
    follower_count: latestMetric?.follower_count || 0,
    earnings_growth: calculateGrowth(currentEarnings, previousEarnings),
    gig_growth: calculateGrowth(currentGigs, previousGigs),
    view_growth: calculateGrowth(currentViews, previousViews),
  }
}

/**
 * Check Violet daily usage limit (50 prompts/day)
 */
export function checkVioletLimit(usageToday: VioletUsage[]): {
  used: number
  remaining: number
  exceeded: boolean
} {
  const used = usageToday.length
  const limit = 50
  const remaining = Math.max(0, limit - used)

  return {
    used,
    remaining,
    exceeded: used >= limit,
  }
}

/**
 * Calculate goal progress percentage
 */
export function calculateGoalProgress(goal: Goal): number {
  if (!goal.target_value || goal.target_value === 0) return 0
  return Math.min(100, Math.round((goal.current_value / goal.target_value) * 100))
}

/**
 * Check if goal is overdue
 */
export function isGoalOverdue(goal: Goal): boolean {
  if (!goal.target_date || goal.completed) return false
  const targetDate = new Date(goal.target_date)
  const now = new Date()
  return targetDate < now
}

/**
 * Format earnings with currency
 */
export function formatEarnings(amount: number): string {
  return `$${amount.toLocaleString()}`
}

/**
 * Format growth percentage
 */
export function formatGrowth(growth: number): string {
  const sign = growth > 0 ? '+' : ''
  return `${sign}${growth}%`
}

/**
 * Get date range for last N days
 */
export function getDateRange(days: number): { start: string; end: string } {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - days)

  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  }
}
