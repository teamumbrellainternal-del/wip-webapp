/**
 * Violet AI controller
 * Handles AI assistant interactions and conversation management
 * Per D-062: 50 prompts/day limit per artist
 */

import type { RouteHandler } from '../../router'
import { successResponse, errorResponse } from '../../utils/response'
import { ErrorCodes } from '../../utils/error-codes'
import { createClaudeService } from '../../services/claude'
import type { ClaudePromptType } from '../../services/types'
import { checkRateLimit } from '../../middleware/rate-limit'
import { generateUUIDv4 } from '../../utils/uuid'
import type {
  VioletConversation,
  VioletMessage,
  ConversationListItem,
} from '../../models/violet'

/** Maximum messages to include in LLM context for multi-turn conversations */
const MAX_CONTEXT_MESSAGES = 30

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
    const { context } = body
    // Support both user_prompt and prompt keys for frontend compatibility
    const user_prompt = body.user_prompt || body.prompt

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

    // Create Claude API service
    // Use real API when not in mock mode (production/staging use real API)
    const useRealAPI = ctx.env.USE_MOCKS !== 'true' && !!ctx.env.CLAUDE_API_KEY
    const claudeService = createClaudeService(
      ctx.env.CLAUDE_API_KEY || '',
      ctx.env.DB,
      useRealAPI
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
 * Per task-9.2: Returns current usage, remaining prompts, and historical data
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

    const artistId = artist.id

    // 2. Get today's date in YYYY-MM-DD format (UTC)
    const today = new Date().toISOString().split('T')[0]

    // 3. Fetch current usage from KV: violet:{artist_id}:{date}
    const kvKey = `violet:${artistId}:${today}`
    const kvValue = await ctx.env.KV.get(kvKey)
    const promptsUsedToday = kvValue ? parseInt(kvValue, 10) : 0

    // 4. Calculate remaining prompts (D-062: 50 prompts/day limit)
    const dailyLimit = 50
    const promptsRemaining = Math.max(0, dailyLimit - promptsUsedToday)

    // 5. Get current usage from KV
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

    // 6. Query D1 for last 7 days usage (historical data)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0]

    const historicalUsage = await ctx.env.DB.prepare(
      `SELECT
        date as prompt_date,
        COUNT(*) as prompt_count
      FROM violet_usage
      WHERE artist_id = ? AND date >= ?
      GROUP BY date
      ORDER BY date DESC`
    )
      .bind(artistId, sevenDaysAgoStr)
      .all<{ prompt_date: string; prompt_count: number }>()

    // 7. Format historical data
    const historical = historicalUsage.results || []

    return successResponse(
      {
        prompts_used_today: promptsUsedToday,
        prompts_remaining: promptsRemaining,
        daily_limit: dailyLimit,
        reset_at: resetAt,
        historical_usage: historical,
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error in getUsage:', error)
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      'Failed to fetch Violet usage statistics',
      500,
      error instanceof Error ? { error: error.message } : undefined,
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

// ============================================================================
// CONVERSATION ENDPOINTS (Chat Interface)
// ============================================================================

/**
 * List user's conversations
 * GET /v1/violet/conversations
 */
export const listConversations: RouteHandler = async (ctx) => {
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

    // Parse pagination params
    const page = parseInt(ctx.url.searchParams.get('page') || '1')
    const limit = Math.min(parseInt(ctx.url.searchParams.get('limit') || '20'), 50)
    const offset = (page - 1) * limit

    // Get total count
    const countResult = await ctx.env.DB.prepare(
      'SELECT COUNT(*) as total FROM violet_conversations WHERE artist_id = ? AND is_archived = 0'
    )
      .bind(artist.id)
      .first<{ total: number }>()

    const total = countResult?.total || 0

    // Get conversations with preview (last message)
    const conversations = await ctx.env.DB.prepare(
      `SELECT 
        c.id,
        c.title,
        c.started_at,
        c.last_message_at,
        c.message_count,
        (SELECT content FROM violet_messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as preview
      FROM violet_conversations c
      WHERE c.artist_id = ? AND c.is_archived = 0
      ORDER BY c.last_message_at DESC
      LIMIT ? OFFSET ?`
    )
      .bind(artist.id, limit, offset)
      .all<ConversationListItem>()

    return successResponse(
      {
        conversations: conversations.results || [],
        pagination: {
          page,
          limit,
          total,
          hasMore: offset + limit < total,
        },
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error in listConversations:', error)
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      'Failed to fetch conversations',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Create a new conversation
 * POST /v1/violet/conversations
 */
export const createConversation: RouteHandler = async (ctx) => {
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

    // Parse optional title from body
    const body = await ctx.request.json().catch(() => ({}))
    const title = body.title || null

    // Create conversation
    const id = generateUUIDv4()
    const now = new Date().toISOString()

    await ctx.env.DB.prepare(
      `INSERT INTO violet_conversations (id, artist_id, title, started_at, last_message_at, message_count, is_archived)
       VALUES (?, ?, ?, ?, ?, 0, 0)`
    )
      .bind(id, artist.id, title, now, now)
      .run()

    const conversation: VioletConversation = {
      id,
      artist_id: artist.id,
      title,
      started_at: now,
      last_message_at: now,
      message_count: 0,
      is_archived: 0,
    }

    return successResponse({ conversation }, 201, ctx.requestId)
  } catch (error) {
    console.error('Error in createConversation:', error)
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      'Failed to create conversation',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Get a conversation with its messages
 * GET /v1/violet/conversations/:id
 */
export const getConversation: RouteHandler = async (ctx) => {
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
    const conversationId = ctx.params?.id
    if (!conversationId) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Conversation ID is required',
        400,
        undefined,
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

    // Get conversation (verify ownership)
    const conversation = await ctx.env.DB.prepare(
      'SELECT * FROM violet_conversations WHERE id = ? AND artist_id = ?'
    )
      .bind(conversationId, artist.id)
      .first<VioletConversation>()

    if (!conversation) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Conversation not found',
        404,
        undefined,
        ctx.requestId
      )
    }

    // Get messages
    const messages = await ctx.env.DB.prepare(
      'SELECT * FROM violet_messages WHERE conversation_id = ? ORDER BY created_at ASC'
    )
      .bind(conversationId)
      .all<VioletMessage>()

    return successResponse(
      {
        conversation,
        messages: messages.results || [],
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error in getConversation:', error)
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      'Failed to fetch conversation',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Send a message in a conversation
 * POST /v1/violet/conversations/:id/messages
 * Implements multi-turn context (last 30 messages)
 */
export const sendConversationMessage: RouteHandler = async (ctx) => {
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
    const conversationId = ctx.params?.id
    if (!conversationId) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Conversation ID is required',
        400,
        undefined,
        ctx.requestId
      )
    }

    // Parse request body
    const body = await ctx.request.json().catch(() => ({}))
    const { content, context } = body

    // Validate content
    if (!content || typeof content !== 'string') {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'content is required and must be a string',
        400,
        'content',
        ctx.requestId
      )
    }

    if (content.length > 2000) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'content must be 2000 characters or less',
        400,
        'content',
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

    // Get conversation (verify ownership)
    const conversation = await ctx.env.DB.prepare(
      'SELECT * FROM violet_conversations WHERE id = ? AND artist_id = ?'
    )
      .bind(conversationId, artist.id)
      .first<VioletConversation>()

    if (!conversation) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Conversation not found',
        404,
        undefined,
        ctx.requestId
      )
    }

    // Create Claude service
    const useRealAPI = ctx.env.USE_MOCKS !== 'true' && !!ctx.env.CLAUDE_API_KEY
    const claudeService = createClaudeService(
      ctx.env.CLAUDE_API_KEY || '',
      ctx.env.DB,
      useRealAPI
    )

    // Check rate limit
    const limitCheck = await claudeService.checkDailyLimit(artist.id)
    if (!limitCheck.allowed) {
      return errorResponse(
        ErrorCodes.RATE_LIMIT_EXCEEDED,
        `Daily limit of 50 prompts exceeded. Resets at ${limitCheck.resetsAt}`,
        429,
        undefined,
        ctx.requestId
      )
    }

    // Get conversation history for context (last N messages)
    const historyResult = await ctx.env.DB.prepare(
      `SELECT role, content FROM violet_messages 
       WHERE conversation_id = ? 
       ORDER BY created_at DESC 
       LIMIT ?`
    )
      .bind(conversationId, MAX_CONTEXT_MESSAGES)
      .all<{ role: string; content: string }>()

    // Reverse to chronological order
    const previousMessages = (historyResult.results || []).reverse()

    // Determine context type (default to 'general')
    const promptContext: ClaudePromptType = context && 
      ['draft_message', 'gig_inquiry', 'songwriting', 'career_advice', 'bio_generator', 'general'].includes(context)
      ? (context as ClaudePromptType)
      : 'general'

    // Generate AI response with conversation context
    const result = await claudeService.generateResponseWithContext({
      prompt: content,
      promptType: promptContext,
      artistId: artist.id,
      previousMessages,
    })

    if (!result.success || !result.data) {
      return errorResponse(
        ErrorCodes.INTERNAL_ERROR,
        result.error?.message || 'Failed to generate AI response',
        500,
        undefined,
        ctx.requestId
      )
    }

    const now = new Date().toISOString()

    // Store user message
    const userMessageId = generateUUIDv4()
    await ctx.env.DB.prepare(
      `INSERT INTO violet_messages (id, conversation_id, role, content, tokens_used, mood, context, created_at)
       VALUES (?, ?, 'user', ?, NULL, NULL, ?, ?)`
    )
      .bind(userMessageId, conversationId, content, promptContext, now)
      .run()

    // Store assistant message
    const assistantMessageId = generateUUIDv4()
    const assistantNow = new Date().toISOString()
    await ctx.env.DB.prepare(
      `INSERT INTO violet_messages (id, conversation_id, role, content, tokens_used, mood, context, created_at)
       VALUES (?, ?, 'assistant', ?, ?, ?, ?, ?)`
    )
      .bind(
        assistantMessageId,
        conversationId,
        result.data.response,
        result.data.tokensUsed,
        result.data.mood || 'professional',
        promptContext,
        assistantNow
      )
      .run()

    // Update conversation title (from first message) and timestamps
    const titleUpdate = conversation.message_count === 0
      ? `, title = ?`
      : ''
    const titleValue = conversation.message_count === 0
      ? content.substring(0, 50) + (content.length > 50 ? '...' : '')
      : null

    if (titleValue) {
      await ctx.env.DB.prepare(
        `UPDATE violet_conversations 
         SET last_message_at = ?, message_count = message_count + 2, title = ?
         WHERE id = ?`
      )
        .bind(assistantNow, titleValue, conversationId)
        .run()
    } else {
      await ctx.env.DB.prepare(
        `UPDATE violet_conversations 
         SET last_message_at = ?, message_count = message_count + 2
         WHERE id = ?`
      )
        .bind(assistantNow, conversationId)
        .run()
    }

    // Build response messages
    const userMessage: VioletMessage = {
      id: userMessageId,
      conversation_id: conversationId,
      role: 'user',
      content,
      tokens_used: null,
      mood: null,
      context: promptContext,
      created_at: now,
    }

    const assistantMessage: VioletMessage = {
      id: assistantMessageId,
      conversation_id: conversationId,
      role: 'assistant',
      content: result.data.response,
      tokens_used: result.data.tokensUsed,
      mood: result.data.mood || 'professional',
      context: promptContext,
      created_at: assistantNow,
    }

    // Get updated rate limit info
    const rateLimitInfo = await checkRateLimit(
      ctx.userId,
      'rate_limit:violet',
      50,
      ctx.env.KV
    )

    return successResponse(
      {
        user_message: userMessage,
        assistant_message: assistantMessage,
        remaining_prompts: rateLimitInfo.remaining,
        is_placeholder: result.data.isPlaceholder,
      },
      201,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error in sendConversationMessage:', error)
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Internal server error',
      500,
      undefined,
      ctx.requestId
    )
  }
}
