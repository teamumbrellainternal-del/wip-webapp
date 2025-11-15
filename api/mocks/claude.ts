/**
 * Mock Claude AI Service
 * Provides placeholder AI responses for development without real API calls
 */

import { generateUUIDv4 } from '../utils/uuid'
import {
  ClaudeParams,
  ClaudeResult,
  ClaudePromptType,
  ServiceResult,
  VIOLET_DAILY_LIMIT,
} from '../services/types'

/**
 * Pre-defined mock responses for different prompt types
 */
const MOCK_RESPONSES: Record<ClaudePromptType, string[]> = {
  draft_message: [
    "Hey! I'd love to chat about the opportunity you posted. I think my style would be a great fit for what you're looking for. Let me know if you'd like to discuss details!",
    "Hi there! I saw your post and I'm really interested in collaborating. I have experience with similar projects and would love to hear more about what you have in mind.",
    "Thanks for reaching out! I'm definitely interested in learning more about this. When would be a good time to connect and discuss the details?",
  ],
  gig_inquiry: [
    "I'm really excited about this opportunity! I have experience performing at similar venues and my sound aligns well with what you described. I'm available on the dates you mentioned and would love to discuss this further.",
    "This gig sounds like a perfect fit for my style. I've played shows like this before and always bring high energy. Let's connect to talk about logistics and see if we can make it happen!",
    "I'd love to be considered for this! My music matches the vibe you're going for, and I have all the equipment needed. Happy to send over samples or set up a call to discuss.",
  ],
  songwriting: [
    "Here's a starting point for your verse:\n\nVerse 1:\nIn the silence of the night, I hear your echo\nMemories dancing like shadows on the wall\nEvery moment that we shared, still feels so close though\nTime keeps moving, but I'm frozen in the fall",
    "How about this for a chorus:\n\nChorus:\nWe're chasing dreams under city lights\nHeartbeats racing through electric nights\nNothing's gonna stop us now, we're alive\nThis is our moment, this is our time",
    "Here's a bridge idea:\n\nBridge:\nMaybe we're just stardust, burning bright\nTwo souls colliding in the dead of night\nBut if this is all we get, I'll take the ride\nWith you right here, right by my side",
  ],
  bio_generator: [
    "A versatile artist blending genres with a unique sound that captivates audiences. With years of experience performing at venues across the region, they bring energy, passion, and professionalism to every show. Their music tells stories that resonate, creating connections that last long after the final note.",
    "Known for their electrifying performances and genre-defying sound, this artist has built a reputation for delivering unforgettable experiences. From intimate acoustic sets to high-energy full-band shows, they adapt their craft to create the perfect atmosphere for any venue or event.",
    "An emerging talent with a fresh perspective on modern music. Combining technical skill with raw emotion, they create soundscapes that push boundaries while staying true to authentic storytelling. Their growing fanbase and critical acclaim speak to their dedication to the craft.",
  ],
  general: [
    "Thanks for your question! Based on what you've shared, I'd recommend focusing on building authentic connections with your audience. Quality always trumps quantity when it comes to engagement.",
    "That's a great question. My suggestion would be to start small and build momentum. Focus on one thing at a time and do it really well before expanding to other areas.",
    "I'd approach this by breaking it down into smaller, manageable steps. First, identify your core strengths, then look for opportunities that align with those. The rest will follow naturally.",
  ],
}

/**
 * In-memory usage tracking
 */
interface UsageRecord {
  artistId: string
  date: string // YYYY-MM-DD
  promptCount: number
  totalTokens: number
  byFeature: Record<ClaudePromptType, number>
}

const usageRecords: Map<string, UsageRecord> = new Map()

/**
 * Mock Claude AI Service
 * Returns pre-defined responses and tracks usage
 */
export class MockClaudeService {
  /**
   * Generate AI response (mocked)
   */
  async generateResponse(params: ClaudeParams): Promise<ServiceResult<ClaudeResult>> {
    // Check daily usage limit (50 prompts/day per D-062)
    const usageCheck = await this.checkDailyLimit(params.artistId)
    if (!usageCheck.allowed) {
      return {
        success: false,
        error: {
          code: 'DAILY_LIMIT_EXCEEDED',
          message: `Daily limit of ${VIOLET_DAILY_LIMIT} prompts exceeded. Resets at midnight UTC.`,
          retryable: false,
        },
      }
    }

    // Get random response for prompt type
    const responses = MOCK_RESPONSES[params.promptType] || MOCK_RESPONSES.general
    const randomResponse = responses[Math.floor(Math.random() * responses.length)]

    // Estimate tokens (rough approximation: ~4 chars per token)
    const estimatedTokens = Math.ceil((params.prompt.length + randomResponse.length) / 4)

    // Track usage
    await this.trackUsage(params.artistId, params.promptType, estimatedTokens)

    // Log to console
    console.log('[MOCK CLAUDE] AI generation:')
    console.log(`  Prompt: ${params.prompt.substring(0, 50)}${params.prompt.length > 50 ? '...' : ''}`)
    console.log(`  Type: ${params.promptType}`)
    console.log(`  Tokens: ${estimatedTokens}`)
    console.log(`  Response: ${randomResponse.substring(0, 100)}${randomResponse.length > 100 ? '...' : ''}`)

    return {
      success: true,
      data: {
        response: randomResponse,
        tokensUsed: estimatedTokens,
        promptType: params.promptType,
        isPlaceholder: true,
      },
    }
  }

  /**
   * Check if artist has exceeded daily prompt limit
   */
  async checkDailyLimit(artistId: string): Promise<{
    allowed: boolean
    currentCount: number
    limit: number
    resetsAt: string
  }> {
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    const key = `${artistId}:${today}`
    const record = usageRecords.get(key)

    const currentCount = record?.promptCount || 0

    // Calculate reset time (midnight UTC)
    const tomorrow = new Date()
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
    tomorrow.setUTCHours(0, 0, 0, 0)
    const resetsAt = tomorrow.toISOString()

    return {
      allowed: currentCount < VIOLET_DAILY_LIMIT,
      currentCount,
      limit: VIOLET_DAILY_LIMIT,
      resetsAt,
    }
  }

  /**
   * Track usage in memory
   */
  private async trackUsage(
    artistId: string,
    promptType: ClaudePromptType,
    tokensUsed: number
  ): Promise<void> {
    const today = new Date().toISOString().split('T')[0]
    const key = `${artistId}:${today}`

    let record = usageRecords.get(key)

    if (!record) {
      record = {
        artistId,
        date: today,
        promptCount: 0,
        totalTokens: 0,
        byFeature: {} as Record<ClaudePromptType, number>,
      }
      usageRecords.set(key, record)
    }

    record.promptCount++
    record.totalTokens += tokensUsed
    record.byFeature[promptType] = (record.byFeature[promptType] || 0) + 1
  }

  /**
   * Get usage statistics
   */
  async getUsageStats(
    artistId: string,
    days: number = 30
  ): Promise<{
    totalPrompts: number
    totalTokens: number
    byFeature: Record<ClaudePromptType, number>
  }> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0]

    let totalPrompts = 0
    let totalTokens = 0
    const byFeature: Record<string, number> = {}

    // Aggregate usage records
    for (const [key, record] of usageRecords.entries()) {
      if (record.artistId === artistId && record.date >= cutoffDateStr) {
        totalPrompts += record.promptCount
        totalTokens += record.totalTokens

        for (const [feature, count] of Object.entries(record.byFeature)) {
          byFeature[feature] = (byFeature[feature] || 0) + count
        }
      }
    }

    return {
      totalPrompts,
      totalTokens,
      byFeature: byFeature as Record<ClaudePromptType, number>,
    }
  }

  /**
   * Get daily usage count
   */
  async getDailyUsage(artistId: string): Promise<number> {
    const today = new Date().toISOString().split('T')[0]
    const key = `${artistId}:${today}`
    const record = usageRecords.get(key)

    return record?.promptCount || 0
  }

  /**
   * Get current usage for artist (for quota display)
   */
  async getUsage(): Promise<{
    tokensUsed: number
    tokensLimit: number
    promptsToday: number
    promptsLimit: number
  }> {
    // Mock: return sample usage data
    return {
      tokensUsed: 5000,
      tokensLimit: 25000, // 25k tokens/month per D-059
      promptsToday: 10,
      promptsLimit: VIOLET_DAILY_LIMIT,
    }
  }

  /**
   * Clear usage records (for testing)
   */
  clearUsage(): void {
    usageRecords.clear()
  }
}

/**
 * Factory function to create MockClaudeService instance
 */
export function createMockClaudeService(): MockClaudeService {
  return new MockClaudeService()
}
