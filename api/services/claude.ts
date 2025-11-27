/**
 * Claude API Service Wrapper (Violet AI)
 * IMPORTANT: Returns placeholder responses for Release 1
 * Real implementation will be added in future release per D-046
 */

import { generateUUIDv4 } from '../utils/uuid'
import {
  ClaudeParams,
  ClaudeParamsWithContext,
  ClaudeResult,
  ClaudeResultWithMood,
  ClaudePromptType,
  ServiceResult,
  VIOLET_DAILY_LIMIT,
} from './types'

/**
 * Claude API configuration
 * NOTE: API key is stored but not used in Release 1
 */
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'
const CLAUDE_MODEL = 'claude-sonnet-4-5-20250929'
const DEFAULT_MAX_TOKENS = 1024
const DEFAULT_TEMPERATURE = 0.7

/**
 * Placeholder responses for Release 1
 * These will be replaced with real Claude API calls in future release
 */
const PLACEHOLDER_RESPONSES: Record<ClaudePromptType, string[]> = {
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
  career_advice: [
    "Focus on building genuine relationships in your local music scene. Networking isn't just about what others can do for you - it's about mutual support and collaboration. Attend shows, support other artists, and be authentically engaged in your community.",
    "Consider diversifying your income streams. Don't rely solely on gig income - explore teaching, session work, licensing opportunities, and digital revenue. This financial stability will give you more creative freedom in the long run.",
    "Consistency is key to building a sustainable music career. Set realistic goals, create a regular content schedule, and show up for your audience even when it feels like no one's watching. The artists who make it are the ones who keep showing up.",
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
 * Prompt templates for future real implementation
 * These define how user prompts will be formatted for Claude API
 */
const PROMPT_TEMPLATES: Record<ClaudePromptType, string> = {
  draft_message: `You are Violet, an AI assistant helping musicians with professional communication.
Draft a friendly, professional message for this context:

{prompt}

Guidelines:
- Keep it concise (2-3 sentences)
- Sound authentic and personal
- Include a call to action
- Maintain professional tone`,

  gig_inquiry: `You are Violet, an AI assistant helping musicians apply for gigs.
Write a compelling gig inquiry message based on this information:

{prompt}

Guidelines:
- Express genuine interest
- Highlight relevant experience
- Be specific about availability
- Keep it under 150 words`,

  songwriting: `You are Violet, an AI assistant helping musicians with songwriting.
Generate creative lyrics or song ideas based on this prompt:

{prompt}

Guidelines:
- Be creative and original
- Match the mood/genre if specified
- Provide 4-8 lines
- Use vivid imagery`,

  career_advice: `You are Violet, an AI assistant providing career guidance to musicians.
Offer thoughtful career advice based on this question:

{prompt}

Guidelines:
- Provide practical, actionable advice
- Draw from music industry best practices
- Be encouraging but realistic
- Keep it concise and focused`,

  bio_generator: `You are Violet, an AI assistant helping musicians write compelling bios.
Create a professional artist bio based on this information:

{prompt}

Guidelines:
- Third-person perspective
- Highlight unique qualities
- Keep it concise (3-4 sentences)
- Professional but engaging tone`,

  general: `You are Violet, an AI assistant helping musicians with their careers.
Provide helpful advice for this question:

{prompt}

Guidelines:
- Be supportive and constructive
- Provide actionable advice
- Keep it concise
- Stay on topic`,
}

/**
 * Claude API service class (Violet AI)
 */
export class ClaudeAPIService {
  private apiKey: string
  private db: D1Database
  private useRealAPI: boolean // Toggle for future real implementation

  constructor(apiKey: string, db: D1Database, useRealAPI: boolean = false) {
    this.apiKey = apiKey
    this.db = db
    this.useRealAPI = useRealAPI // IMPORTANT: Always false in Release 1
  }

  /**
   * Generate AI response (placeholder in Release 1)
   * @param params - Claude API parameters
   * @returns Service result with AI response
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

    // RELEASE 1: Return placeholder response
    // In future releases, this will call the real Claude API
    let response: ClaudeResult

    if (this.useRealAPI) {
      // Future implementation: Real Claude API call
      response = await this.callClaudeAPI(params)
    } else {
      // Release 1: Return placeholder
      response = this.getPlaceholderResponse(params)
    }

    // Track usage
    await this.trackUsage(params.artistId, params.promptType, params.prompt, response.tokensUsed)

    return {
      success: true,
      data: response,
    }
  }

  /**
   * Generate AI response with conversation context (multi-turn)
   * @param params - Claude API parameters with previous messages
   * @returns Service result with AI response
   */
  async generateResponseWithContext(
    params: ClaudeParamsWithContext
  ): Promise<ServiceResult<ClaudeResultWithMood>> {
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

    // Generate response (with or without context)
    let response: ClaudeResultWithMood

    if (this.useRealAPI) {
      response = await this.callClaudeAPIWithContext(params)
    } else {
      response = this.getPlaceholderResponseWithMood(params)
    }

    // Track usage
    await this.trackUsage(params.artistId, params.promptType, params.prompt, response.tokensUsed)

    return {
      success: true,
      data: response,
    }
  }

  /**
   * Get placeholder response with mood for chat interface
   * @param params - Claude API parameters
   * @returns Placeholder response with mood
   */
  private getPlaceholderResponseWithMood(params: ClaudeParamsWithContext): ClaudeResultWithMood {
    const responses = PLACEHOLDER_RESPONSES[params.promptType] || PLACEHOLDER_RESPONSES.general
    const randomResponse = responses[Math.floor(Math.random() * responses.length)]

    // Estimate tokens
    const estimatedTokens = Math.ceil(randomResponse.length / 4)

    // Determine mood based on prompt type and content
    let mood = 'professional'
    if (params.promptType === 'songwriting' || params.promptType === 'career_advice') {
      mood = 'caring'
    } else if (params.prompt.toLowerCase().includes('fun') || params.prompt.toLowerCase().includes('creative')) {
      mood = 'playful'
    }

    return {
      response: randomResponse,
      tokensUsed: estimatedTokens,
      promptType: params.promptType,
      isPlaceholder: true,
      mood,
    }
  }

  /**
   * Call real Claude API with conversation context
   * @param params - Claude API parameters with previous messages
   * @returns Real API response with mood
   */
  private async callClaudeAPIWithContext(params: ClaudeParamsWithContext): Promise<ClaudeResultWithMood> {
    // Build system prompt
    const systemPrompt = PROMPT_TEMPLATES[params.promptType] || PROMPT_TEMPLATES.general

    // Build messages array with conversation history
    const messages: Array<{ role: string; content: string }> = []

    // Add previous messages
    for (const msg of params.previousMessages) {
      messages.push({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content,
      })
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: params.prompt,
    })

    const payload = {
      model: CLAUDE_MODEL,
      max_tokens: params.maxTokens || DEFAULT_MAX_TOKENS,
      temperature: params.temperature || DEFAULT_TEMPERATURE,
      system: systemPrompt.replace('{prompt}', ''),
      messages,
    }

    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.error?.message || `Claude API error: ${response.status} ${response.statusText}`
      )
    }

    const data = await response.json()

    // Analyze response for mood
    const responseText = data.content[0].text
    let mood = 'professional'
    if (responseText.includes('💜') || responseText.includes('here for you') || responseText.includes('support')) {
      mood = 'caring'
    } else if (responseText.includes('🎉') || responseText.includes('awesome') || responseText.includes('let\'s')) {
      mood = 'playful'
    }

    return {
      response: responseText,
      tokensUsed: data.usage.output_tokens,
      promptType: params.promptType,
      isPlaceholder: false,
      mood,
    }
  }

  /**
   * Get placeholder response for Release 1
   * @param params - Claude API parameters
   * @returns Placeholder response
   */
  private getPlaceholderResponse(params: ClaudeParams): ClaudeResult {
    const responses = PLACEHOLDER_RESPONSES[params.promptType] || PLACEHOLDER_RESPONSES.general
    const randomResponse = responses[Math.floor(Math.random() * responses.length)]

    // Estimate tokens (rough approximation: ~4 chars per token)
    const estimatedTokens = Math.ceil(randomResponse.length / 4)

    return {
      response: randomResponse,
      tokensUsed: estimatedTokens,
      promptType: params.promptType,
      isPlaceholder: true, // Always true in Release 1
    }
  }

  /**
   * Call real Claude API (future implementation)
   * @param params - Claude API parameters
   * @returns Real API response
   */
  private async callClaudeAPI(params: ClaudeParams): Promise<ClaudeResult> {
    // Format prompt with template
    const template = PROMPT_TEMPLATES[params.promptType]
    const formattedPrompt = template.replace('{prompt}', params.prompt)

    const payload = {
      model: CLAUDE_MODEL,
      max_tokens: params.maxTokens || DEFAULT_MAX_TOKENS,
      temperature: params.temperature || DEFAULT_TEMPERATURE,
      messages: [
        {
          role: 'user',
          content: formattedPrompt,
        },
      ],
    }

    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.error?.message || `Claude API error: ${response.status} ${response.statusText}`
      )
    }

    const data = await response.json()

    return {
      response: data.content[0].text,
      tokensUsed: data.usage.output_tokens,
      promptType: params.promptType,
      isPlaceholder: false,
    }
  }

  /**
   * Check if artist has exceeded daily prompt limit
   * @param artistId - Artist ID
   * @returns Usage check result
   */
  async checkDailyLimit(artistId: string): Promise<{
    allowed: boolean
    currentCount: number
    limit: number
    resetsAt: string
  }> {
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

    // Count today's usage
    const result = await this.db
      .prepare(
        `SELECT COUNT(*) as count
         FROM violet_usage
         WHERE artist_id = ? AND date = ?`
      )
      .bind(artistId, today)
      .first<{ count: number }>()

    const currentCount = result?.count || 0

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
   * Track Violet usage in database
   * @param artistId - Artist ID
   * @param promptType - Type of prompt
   * @param promptText - Original prompt text
   * @param tokensUsed - Number of tokens used
   */
  private async trackUsage(
    artistId: string,
    promptType: ClaudePromptType,
    promptText: string,
    tokensUsed: number
  ): Promise<void> {
    const id = generateUUIDv4()
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    const now = new Date().toISOString()

    await this.db
      .prepare(
        `INSERT INTO violet_usage
        (id, artist_id, date, prompt_count, feature_used, prompt_text, response_tokens, created_at)
        VALUES (?, ?, ?, 1, ?, ?, ?, ?)`
      )
      .bind(id, artistId, today, promptType, promptText, tokensUsed, now)
      .run()
  }

  /**
   * Get usage statistics for an artist
   * @param artistId - Artist ID
   * @param days - Number of days to look back (default: 30)
   * @returns Usage statistics
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

    // Get total counts
    const totalResult = await this.db
      .prepare(
        `SELECT
          COUNT(*) as total_prompts,
          SUM(response_tokens) as total_tokens
         FROM violet_usage
         WHERE artist_id = ? AND date >= ?`
      )
      .bind(artistId, cutoffDateStr)
      .first<{ total_prompts: number; total_tokens: number }>()

    // Get breakdown by feature
    const featureResult = await this.db
      .prepare(
        `SELECT
          feature_used,
          COUNT(*) as count
         FROM violet_usage
         WHERE artist_id = ? AND date >= ?
         GROUP BY feature_used`
      )
      .bind(artistId, cutoffDateStr)
      .all<{ feature_used: ClaudePromptType; count: number }>()

    const byFeature: Record<string, number> = {}
    for (const row of featureResult.results || []) {
      byFeature[row.feature_used] = row.count
    }

    return {
      totalPrompts: totalResult?.total_prompts || 0,
      totalTokens: totalResult?.total_tokens || 0,
      byFeature: byFeature as Record<ClaudePromptType, number>,
    }
  }

  /**
   * Estimate cost for Claude API usage (for future real implementation)
   * Based on Claude 3 Sonnet pricing: $3/million input tokens, $15/million output tokens
   * @param inputTokens - Number of input tokens
   * @param outputTokens - Number of output tokens
   * @returns Estimated cost in USD
   */
  estimateCost(inputTokens: number, outputTokens: number): number {
    const INPUT_COST_PER_MILLION = 3.0
    const OUTPUT_COST_PER_MILLION = 15.0

    const inputCost = (inputTokens / 1_000_000) * INPUT_COST_PER_MILLION
    const outputCost = (outputTokens / 1_000_000) * OUTPUT_COST_PER_MILLION

    return inputCost + outputCost
  }

  /**
   * Get daily usage for an artist (for checking limit)
   * @param artistId - Artist ID
   * @returns Number of prompts used today
   */
  async getDailyUsage(artistId: string): Promise<number> {
    const today = new Date().toISOString().split('T')[0]

    const result = await this.db
      .prepare(
        `SELECT COUNT(*) as count
         FROM violet_usage
         WHERE artist_id = ? AND date = ?`
      )
      .bind(artistId, today)
      .first<{ count: number }>()

    return result?.count || 0
  }
}

/**
 * Factory function to create ClaudeAPIService instance
 * IMPORTANT: useRealAPI should always be false in Release 1
 */
export function createClaudeService(
  apiKey: string,
  db: D1Database,
  useRealAPI: boolean = false
): ClaudeAPIService {
  return new ClaudeAPIService(apiKey, db, useRealAPI)
}
