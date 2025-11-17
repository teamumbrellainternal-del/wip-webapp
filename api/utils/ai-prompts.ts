/**
 * AI Prompts Utility - Claude AI Integration
 * Handles AI-powered content generation with token tracking
 * Task 10.7: Configure External Service APIs
 * References: D-058 (AI bio), D-059 (25k token limit), D-066 (EPK), D-074 (Cover letter)
 */

import Anthropic from '@anthropic-ai/sdk'
import { logger } from './logger'

/**
 * AI generation types
 */
export type AIGenerationType = 'bio' | 'cover-letter' | 'epk' | 'custom'

/**
 * Artist profile data for AI generation
 */
export interface ArtistProfileData {
  artistName: string
  genres: string[]
  location?: string
  yearsActive?: number
  influences?: string[]
  achievements?: string[]
  style?: string
  instruments?: string[]
}

/**
 * Cover letter data
 */
export interface CoverLetterData {
  artistName: string
  venueName: string
  gigTitle: string
  gigDate: string
  artistGenres: string[]
  artistBio?: string
  whyInterested?: string
}

/**
 * EPK (Electronic Press Kit) data
 */
export interface EPKData {
  artistName: string
  bio: string
  genres: string[]
  location: string
  pressHighlights?: string[]
  upcomingShows?: Array<{ venue: string; date: string }>
  spotifyUrl?: string
  youtubeUrl?: string
  instagramUrl?: string
}

/**
 * AI generation result
 */
export interface AIGenerationResult {
  success: boolean
  content?: string
  tokensUsed?: number
  error?: string
}

/**
 * Token usage tracking interface
 */
export interface TokenUsage {
  userId: string
  month: string // Format: YYYY-MM
  totalTokens: number
  limit: number // 25,000 per D-059
}

/**
 * Initialize Anthropic client
 */
function getAnthropicClient(apiKey: string): Anthropic {
  return new Anthropic({
    apiKey,
  })
}

/**
 * Check if we're in mock mode
 */
function isMockMode(env: { USE_MOCKS?: string }): boolean {
  return env.USE_MOCKS === 'true'
}

/**
 * Track token usage in KV store (D-059: 25k tokens/month limit)
 */
async function trackTokenUsage(
  userId: string,
  tokensUsed: number,
  kv: any
): Promise<void> {
  const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
  const key = `token-usage:${userId}:${currentMonth}`

  try {
    const existingUsageStr = await kv.get(key)
    const existingUsage = existingUsageStr ? parseInt(existingUsageStr, 10) : 0
    const newTotal = existingUsage + tokensUsed

    // Store with 35-day expiry (ensures old months are cleaned up)
    await kv.put(key, newTotal.toString(), { expirationTtl: 35 * 24 * 60 * 60 })

    logger.info('📊 Token usage tracked:', {
      userId,
      month: currentMonth,
      previousUsage: existingUsage,
      newUsage: tokensUsed,
      totalUsage: newTotal,
    })
  } catch (error) {
    logger.error('❌ Failed to track token usage:', error)
  }
}

/**
 * Check if user has exceeded token limit
 */
export async function checkTokenLimit(
  userId: string,
  kv: any
): Promise<{ allowed: boolean; usage: number; limit: number }> {
  const currentMonth = new Date().toISOString().slice(0, 7)
  const key = `token-usage:${userId}:${currentMonth}`
  const limit = 25000 // D-059: 25k tokens/month

  try {
    const usageStr = await kv.get(key)
    const usage = usageStr ? parseInt(usageStr, 10) : 0

    return {
      allowed: usage < limit,
      usage,
      limit,
    }
  } catch (error) {
    logger.error('❌ Failed to check token limit:', error)
    // On error, allow the request but log it
    return { allowed: true, usage: 0, limit }
  }
}

/**
 * Generate artist bio using Claude AI (D-058)
 */
export async function generateArtistBio(
  profileData: ArtistProfileData,
  userId: string,
  env: { CLAUDE_API_KEY?: string; USE_MOCKS?: string },
  kv?: any,
  maxLength: 'short' | 'medium' | 'long' = 'medium'
): Promise<AIGenerationResult> {
  try {
    // Mock mode
    if (isMockMode(env)) {
      logger.info('🤖 [MOCK] AI bio would be generated for:', { artistName: profileData.artistName })
      return {
        success: true,
        content: `${profileData.artistName} is a ${profileData.genres.join(', ')} artist${profileData.location ? ` based in ${profileData.location}` : ''}. [Mock bio content would be generated here with rich details about the artist's style, influences, and achievements.]`,
        tokensUsed: 150,
      }
    }

    // Check token limit if KV is available
    if (kv) {
      const tokenCheck = await checkTokenLimit(userId, kv)
      if (!tokenCheck.allowed) {
        return {
          success: false,
          error: `Monthly token limit exceeded (${tokenCheck.usage}/${tokenCheck.limit} tokens used)`,
        }
      }
    }

    // Validate API key
    if (!env.CLAUDE_API_KEY) {
      throw new Error('CLAUDE_API_KEY is not configured')
    }

    // Build prompt
    const lengthGuide = {
      short: '2-3 sentences (100-150 words)',
      medium: '2 paragraphs (200-300 words)',
      long: '3-4 paragraphs (400-500 words)',
    }

    const prompt = `Write a compelling artist bio for ${profileData.artistName}.

Artist Details:
- Genres: ${profileData.genres.join(', ')}
${profileData.location ? `- Location: ${profileData.location}` : ''}
${profileData.yearsActive ? `- Years Active: ${profileData.yearsActive}` : ''}
${profileData.influences && profileData.influences.length > 0 ? `- Influences: ${profileData.influences.join(', ')}` : ''}
${profileData.achievements && profileData.achievements.length > 0 ? `- Achievements: ${profileData.achievements.join(', ')}` : ''}
${profileData.style ? `- Style/Description: ${profileData.style}` : ''}
${profileData.instruments && profileData.instruments.length > 0 ? `- Instruments: ${profileData.instruments.join(', ')}` : ''}

Requirements:
- Length: ${lengthGuide[maxLength]}
- Write in third person
- Be engaging and professional
- Highlight what makes this artist unique
- Include genre and location naturally
- Make it suitable for booking profiles and press kits
- Don't use clichés or generic phrases
- Focus on authenticity and artistic identity

Write the bio now:`

    // Generate with Claude
    const anthropic = getAnthropicClient(env.CLAUDE_API_KEY)
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const content = message.content[0].type === 'text' ? message.content[0].text : ''
    const tokensUsed = message.usage.input_tokens + message.usage.output_tokens

    // Track usage
    if (kv) {
      await trackTokenUsage(userId, tokensUsed, kv)
    }

    logger.info('🤖 AI bio generated successfully:', {
      artistName: profileData.artistName,
      tokensUsed,
    })

    return {
      success: true,
      content: content.trim(),
      tokensUsed,
    }
  } catch (error) {
    logger.error('❌ AI bio generation failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Generate cover letter for gig application (D-074)
 */
export async function generateCoverLetter(
  data: CoverLetterData,
  userId: string,
  env: { CLAUDE_API_KEY?: string; USE_MOCKS?: string },
  kv?: any
): Promise<AIGenerationResult> {
  try {
    // Mock mode
    if (isMockMode(env)) {
      logger.info('🤖 [MOCK] Cover letter would be generated for:', {
        artist: data.artistName,
        venue: data.venueName,
      })
      return {
        success: true,
        content: `Dear ${data.venueName},\n\nI am excited to apply for the ${data.gigTitle} opportunity on ${data.gigDate}. [Mock cover letter content would be generated here with personalized details about why the artist is a great fit for this gig.]\n\nBest regards,\n${data.artistName}`,
        tokensUsed: 200,
      }
    }

    // Check token limit
    if (kv) {
      const tokenCheck = await checkTokenLimit(userId, kv)
      if (!tokenCheck.allowed) {
        return {
          success: false,
          error: `Monthly token limit exceeded (${tokenCheck.usage}/${tokenCheck.limit} tokens used)`,
        }
      }
    }

    if (!env.CLAUDE_API_KEY) {
      throw new Error('CLAUDE_API_KEY is not configured')
    }

    const prompt = `Write a professional cover letter for a gig application.

Application Details:
- Artist Name: ${data.artistName}
- Venue Name: ${data.venueName}
- Gig Title: ${data.gigTitle}
- Gig Date: ${data.gigDate}
- Artist Genres: ${data.artistGenres.join(', ')}
${data.artistBio ? `- Artist Bio: ${data.artistBio}` : ''}
${data.whyInterested ? `- Why Interested: ${data.whyInterested}` : ''}

Requirements:
- Length: 3-4 paragraphs (150-250 words)
- Professional but warm tone
- Personalize it for this specific venue and gig
- Highlight relevant experience and fit
- Express genuine enthusiasm
- Include a clear call to action
- Don't be overly formal or stiff
- Make it compelling and memorable

Write the cover letter now:`

    const anthropic = getAnthropicClient(env.CLAUDE_API_KEY)
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0].type === 'text' ? message.content[0].text : ''
    const tokensUsed = message.usage.input_tokens + message.usage.output_tokens

    if (kv) {
      await trackTokenUsage(userId, tokensUsed, kv)
    }

    logger.info('🤖 Cover letter generated successfully:', {
      artistName: data.artistName,
      venueName: data.venueName,
      tokensUsed,
    })

    return {
      success: true,
      content: content.trim(),
      tokensUsed,
    }
  } catch (error) {
    logger.error('❌ Cover letter generation failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Generate EPK (Electronic Press Kit) content (D-066)
 */
export async function generateEPK(
  data: EPKData,
  userId: string,
  env: { CLAUDE_API_KEY?: string; USE_MOCKS?: string },
  kv?: any
): Promise<AIGenerationResult> {
  try {
    // Mock mode
    if (isMockMode(env)) {
      logger.info('🤖 [MOCK] EPK would be generated for:', { artistName: data.artistName })
      return {
        success: true,
        content: `# ${data.artistName} - Electronic Press Kit\n\n## About\n${data.bio}\n\n[Mock EPK content would include formatted sections for press highlights, upcoming shows, and media links.]`,
        tokensUsed: 300,
      }
    }

    // Check token limit
    if (kv) {
      const tokenCheck = await checkTokenLimit(userId, kv)
      if (!tokenCheck.allowed) {
        return {
          success: false,
          error: `Monthly token limit exceeded (${tokenCheck.usage}/${tokenCheck.limit} tokens used)`,
        }
      }
    }

    if (!env.CLAUDE_API_KEY) {
      throw new Error('CLAUDE_API_KEY is not configured')
    }

    const prompt = `Create a professional Electronic Press Kit (EPK) for ${data.artistName}.

Artist Information:
- Name: ${data.artistName}
- Bio: ${data.bio}
- Genres: ${data.genres.join(', ')}
- Location: ${data.location}
${data.pressHighlights && data.pressHighlights.length > 0 ? `- Press Highlights:\n  ${data.pressHighlights.map(h => `• ${h}`).join('\n  ')}` : ''}
${data.upcomingShows && data.upcomingShows.length > 0 ? `- Upcoming Shows:\n  ${data.upcomingShows.map(s => `• ${s.venue} - ${s.date}`).join('\n  ')}` : ''}
${data.spotifyUrl ? `- Spotify: ${data.spotifyUrl}` : ''}
${data.youtubeUrl ? `- YouTube: ${data.youtubeUrl}` : ''}
${data.instagramUrl ? `- Instagram: ${data.instagramUrl}` : ''}

Requirements:
- Format as a well-structured press kit in Markdown
- Include sections: About, Genres & Style, ${data.pressHighlights ? 'Press & Media, ' : ''}${data.upcomingShows ? 'Upcoming Shows, ' : ''}Contact
- Professional tone suitable for booking agents, venues, and press
- Highlight achievements and unique selling points
- Keep it concise but comprehensive (400-600 words)
- Include all provided information naturally
- Make it compelling and press-ready

Generate the EPK now:`

    const anthropic = getAnthropicClient(env.CLAUDE_API_KEY)
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0].type === 'text' ? message.content[0].text : ''
    const tokensUsed = message.usage.input_tokens + message.usage.output_tokens

    if (kv) {
      await trackTokenUsage(userId, tokensUsed, kv)
    }

    logger.info('🤖 EPK generated successfully:', {
      artistName: data.artistName,
      tokensUsed,
    })

    return {
      success: true,
      content: content.trim(),
      tokensUsed,
    }
  } catch (error) {
    logger.error('❌ EPK generation failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Generate custom AI content (flexible utility)
 */
export async function generateCustomContent(
  prompt: string,
  userId: string,
  env: { CLAUDE_API_KEY?: string; USE_MOCKS?: string },
  kv?: any,
  maxTokens: number = 1024
): Promise<AIGenerationResult> {
  try {
    // Mock mode
    if (isMockMode(env)) {
      logger.info('🤖 [MOCK] Custom content would be generated')
      return {
        success: true,
        content: '[Mock AI-generated content based on the prompt]',
        tokensUsed: 100,
      }
    }

    // Check token limit
    if (kv) {
      const tokenCheck = await checkTokenLimit(userId, kv)
      if (!tokenCheck.allowed) {
        return {
          success: false,
          error: `Monthly token limit exceeded (${tokenCheck.usage}/${tokenCheck.limit} tokens used)`,
        }
      }
    }

    if (!env.CLAUDE_API_KEY) {
      throw new Error('CLAUDE_API_KEY is not configured')
    }

    const anthropic = getAnthropicClient(env.CLAUDE_API_KEY)
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0].type === 'text' ? message.content[0].text : ''
    const tokensUsed = message.usage.input_tokens + message.usage.output_tokens

    if (kv) {
      await trackTokenUsage(userId, tokensUsed, kv)
    }

    logger.info('🤖 Custom content generated successfully:', { tokensUsed })

    return {
      success: true,
      content: content.trim(),
      tokensUsed,
    }
  } catch (error) {
    logger.error('❌ Custom content generation failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
