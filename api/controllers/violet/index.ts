/**
 * Violet AI controller
 * Handles AI assistant interactions (placeholder responses for Release 1)
 * Per D-062: 50 prompts/day limit per artist
 * Note: Real AI functionality excluded from Release 1
 */

import type { RouteHandler } from '../../router'
import { successResponse, errorResponse } from '../../utils/response'
import { ErrorCodes } from '../../utils/error-codes'
import { createClaudeService } from '../../services/claude'
import type { ClaudePromptType } from '../../services/types'
import { checkRateLimit } from '../../middleware/rate-limit'

/**
 * Send prompt to Violet
 * POST /v1/violet/prompt
 * Rate limited to 50 prompts/day per D-062
 */
export const sendPrompt: RouteHandler = async (ctx) => {
  if (!ctx.userId) {
    return errorResponse(
      ErrorCodes.AUTHENTICATION_FAILED,
      'Authentication required',
      401,
      undefined,
      ctx.requestId
    )
  }

  try {
    // Parse request body
    const body = await ctx.request.json().catch(() => ({}))
    const { user_prompt, context } = body

    // Validate required fields
    if (!user_prompt || typeof user_prompt !== 'string') {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'user_prompt is required and must be a string',
        400,
        'user_prompt',
        ctx.requestId
      )
    }

    if (!context || typeof context !== 'string') {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'context is required and must be a string',
        400,
        'context',
        ctx.requestId
      )
    }

    // Validate context value
    const validContexts: ClaudePromptType[] = [
      'draft_message',
      'gig_inquiry',
      'songwriting',
      'career_advice',
    ]
    if (!validContexts.includes(context as ClaudePromptType)) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        `context must be one of: ${validContexts.join(', ')}`,
        400,
        'context',
        ctx.requestId
      )
    }

    // Validate prompt length
    if (user_prompt.length > 2000) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'user_prompt must be 2000 characters or less',
        400,
        'user_prompt',
        ctx.requestId
      )
    }

    // Get artist profile
    const artist = await ctx.env.DB.prepare('SELECT id FROM artists WHERE user_id = ?')
      .bind(ctx.userId)
      .first<{ id: string }>()

    if (!artist) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Artist profile not found',
        404,
        undefined,
        ctx.requestId
      )
    }

    // Create Claude API service (placeholder mode for Release 1)
    const claudeService = createClaudeService(
      ctx.env.ANTHROPIC_API_KEY || '',
      ctx.env.DB,
      false // useRealAPI = false for Release 1
    )

    // Generate AI response
    const result = await claudeService.generateResponse({
      prompt: user_prompt,
      promptType: context as ClaudePromptType,
      artistId: artist.id,
    })

    // Handle service errors
    if (!result.success || !result.data) {
      const errorCode = result.error?.code === 'DAILY_LIMIT_EXCEEDED'
        ? ErrorCodes.RATE_LIMIT_EXCEEDED
        : ErrorCodes.INTERNAL_ERROR

      return errorResponse(
        errorCode,
        result.error?.message || 'Failed to generate AI response',
        errorCode === ErrorCodes.RATE_LIMIT_EXCEEDED ? 429 : 500,
        undefined,
        ctx.requestId
      )
    }

    // Get remaining prompts from KV
    const rateLimitInfo = await checkRateLimit(
      ctx.userId,
      'rate_limit:violet',
      50,
      ctx.env.KV
    )

    // Return successful response
    return successResponse(
      {
        ai_response: result.data.response,
        remaining_prompts: rateLimitInfo.remaining,
        tokens_used: result.data.tokensUsed,
        context: context,
        is_placeholder: result.data.isPlaceholder,
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error in sendPrompt:', error)
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Internal server error',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Get Violet conversation history
 * GET /v1/violet/history
 */
export const getHistory: RouteHandler = async (ctx) => {
  if (!ctx.userId) {
    return errorResponse(
      ErrorCodes.AUTHENTICATION_FAILED,
      'Authentication required',
      401,
      undefined,
      ctx.requestId
    )
  }

  // Query params: page, limit
  const page = parseInt(ctx.url.searchParams.get('page') || '1')
  const limit = parseInt(ctx.url.searchParams.get('limit') || '20')

  // TODO: Implement conversation history retrieval
  return successResponse(
    {
      conversations: [],
      pagination: {
        page,
        limit,
        total: 0,
        hasMore: false,
      },
    },
    200,
    ctx.requestId
  )
}

/**
 * Get Violet usage stats
 * GET /v1/violet/usage
 */
export const getUsage: RouteHandler = async (ctx) => {
  if (!ctx.userId) {
    return errorResponse(
      ErrorCodes.AUTHENTICATION_FAILED,
      'Authentication required',
      401,
      undefined,
      ctx.requestId
    )
  }

  try {
    // Get artist profile
    const artist = await ctx.env.DB.prepare('SELECT id FROM artists WHERE user_id = ?')
      .bind(ctx.userId)
      .first<{ id: string }>()

    if (!artist) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Artist profile not found',
        404,
        undefined,
        ctx.requestId
      )
    }

    // Get current usage from KV
    const rateLimitInfo = await checkRateLimit(
      ctx.userId,
      'rate_limit:violet',
      50,
      ctx.env.KV
    )

    const promptsUsed = 50 - rateLimitInfo.remaining

    // Calculate reset time (midnight UTC tomorrow)
    const tomorrow = new Date()
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
    tomorrow.setUTCHours(0, 0, 0, 0)
    const resetAt = tomorrow.toISOString()

    return successResponse(
      {
        promptsUsed,
        dailyLimit: 50,
        remaining: rateLimitInfo.remaining,
        resetAt,
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error in getUsage:', error)
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Internal server error',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Clear Violet conversation history
 * DELETE /v1/violet/history
 */
export const clearHistory: RouteHandler = async (ctx) => {
  if (!ctx.userId) {
    return errorResponse(
      ErrorCodes.AUTHENTICATION_FAILED,
      'Authentication required',
      401,
      undefined,
      ctx.requestId
    )
  }

  // TODO: Implement history clearing
  return successResponse(
    {
      message: 'Conversation history cleared successfully',
    },
    200,
    ctx.requestId
  )
}

/**
 * Get Violet suggestions
 * GET /v1/violet/suggestions
 * Returns predefined prompt suggestions
 */
export const getSuggestions: RouteHandler = async (ctx) => {
  if (!ctx.userId) {
    return errorResponse(
      ErrorCodes.AUTHENTICATION_FAILED,
      'Authentication required',
      401,
      undefined,
      ctx.requestId
    )
  }

  // Return predefined suggestions
  return successResponse(
    {
      suggestions: [
        'Help me write a setlist for a 45-minute show',
        'Give me ideas for promoting my next gig',
        'What should I include in my artist bio?',
        'How do I prepare for a studio recording session?',
        'Suggest songs that would complement my style',
      ],
    },
    200,
    ctx.requestId
  )
}
