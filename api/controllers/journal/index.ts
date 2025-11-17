/**
 * Journal controller
 * Handles Creative Studio journal entries
 * Implements task-8.3: CRUD endpoints for journal entries
 */

import type { RouteHandler } from '../../router'
import { successResponse, errorResponse } from '../../utils/response'
import { ErrorCodes } from '../../utils/error-codes'
import { generateUUIDv4 } from '../../utils/uuid'

/**
 * Valid entry types for journal entries
 */
const VALID_ENTRY_TYPES = ['song_idea', 'set_plan', 'general_note'] as const
type EntryType = typeof VALID_ENTRY_TYPES[number]

/**
 * Block structure for journal entries
 */
interface JournalBlock {
  type: 'text' | 'image' | 'audio' | 'video' | 'checklist'
  content: any
  order: number
}

/**
 * List journal entries
 * GET /v1/journal
 * Query params: entry_type (optional filter)
 */
export const listEntries: RouteHandler = async (ctx) => {
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
    const artist = await ctx.env.DB.prepare(
      'SELECT id FROM artists WHERE user_id = ?'
    ).bind(ctx.userId).first<{ id: string }>()

    if (!artist) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Artist profile not found',
        404,
        undefined,
        ctx.requestId
      )
    }

    // Get query param for filtering by entry_type
    const entryType = ctx.url.searchParams.get('entry_type')

    // Validate entry_type if provided
    if (entryType && !VALID_ENTRY_TYPES.includes(entryType as EntryType)) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        `Invalid entry_type. Must be one of: ${VALID_ENTRY_TYPES.join(', ')}`,
        400,
        undefined,
        ctx.requestId
      )
    }

    // Build query based on filter
    let query = 'SELECT id, artist_id, title, entry_type, created_at, updated_at FROM journal_entries WHERE artist_id = ?'
    const params: any[] = [artist.id]

    if (entryType) {
      query += ' AND entry_type = ?'
      params.push(entryType)
    }

    query += ' ORDER BY updated_at DESC'

    // Execute query
    const result = await ctx.env.DB.prepare(query).bind(...params).all()

    return successResponse(
      {
        entries: result.results || [],
        count: result.results?.length || 0,
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error listing journal entries:', error)
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      'Failed to list journal entries',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Get journal entry by ID
 * GET /v1/journal/:id
 * Returns entry with full blocks JSON
 */
export const getEntry: RouteHandler = async (ctx) => {
  if (!ctx.userId) {
    return errorResponse(
      ErrorCodes.AUTHENTICATION_FAILED,
      'Authentication required',
      401,
      undefined,
      ctx.requestId
    )
  }

  const { id } = ctx.params

  if (!id) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'Entry ID required',
      400,
      'id',
      ctx.requestId
    )
  }

  try {
    // Get artist profile
    const artist = await ctx.env.DB.prepare(
      'SELECT id FROM artists WHERE user_id = ?'
    ).bind(ctx.userId).first<{ id: string }>()

    if (!artist) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Artist profile not found',
        404,
        undefined,
        ctx.requestId
      )
    }

    // Fetch entry with full content (blocks)
    const entry = await ctx.env.DB.prepare(
      'SELECT * FROM journal_entries WHERE id = ? AND artist_id = ?'
    ).bind(id, artist.id).first<any>()

    if (!entry) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Journal entry not found or unauthorized',
        404,
        undefined,
        ctx.requestId
      )
    }

    // Parse content JSON if it's a string
    if (typeof entry.content === 'string') {
      try {
        entry.content = JSON.parse(entry.content)
      } catch (e) {
        console.error('Failed to parse content JSON:', e)
        entry.content = []
      }
    }

    return successResponse(entry, 200, ctx.requestId)
  } catch (error) {
    console.error('Error getting journal entry:', error)
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      'Failed to get journal entry',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Create journal entry
 * POST /v1/journal
 * Body: { entry_type, title (optional), blocks (JSON array) }
 */
export const createEntry: RouteHandler = async (ctx) => {
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
    const body = await ctx.request.json()
    const { entry_type, title, blocks } = body

    // Validate required fields
    if (!entry_type) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'entry_type is required',
        400,
        undefined,
        ctx.requestId
      )
    }

    // Validate entry_type
    if (!VALID_ENTRY_TYPES.includes(entry_type as EntryType)) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        `Invalid entry_type. Must be one of: ${VALID_ENTRY_TYPES.join(', ')}`,
        400,
        undefined,
        ctx.requestId
      )
    }

    // Validate blocks array
    if (!Array.isArray(blocks)) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'blocks must be an array',
        400,
        undefined,
        ctx.requestId
      )
    }

    // Validate each block has required fields
    for (const block of blocks) {
      if (!block.type || block.order === undefined) {
        return errorResponse(
          ErrorCodes.VALIDATION_ERROR,
          'Each block must have type, content, and order fields',
          400,
          undefined,
          ctx.requestId
        )
      }
    }

    // Get artist profile
    const artist = await ctx.env.DB.prepare(
      'SELECT id FROM artists WHERE user_id = ?'
    ).bind(ctx.userId).first<{ id: string }>()

    if (!artist) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Artist profile not found',
        404,
        undefined,
        ctx.requestId
      )
    }

    // Create entry
    const entryId = generateUUIDv4()
    const now = new Date().toISOString()
    const contentJson = JSON.stringify(blocks)

    await ctx.env.DB.prepare(
      `INSERT INTO journal_entries (
        id, artist_id, title, content, entry_type, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      entryId,
      artist.id,
      title || null,
      contentJson,
      entry_type,
      now,
      now
    ).run()

    // Fetch created entry
    const createdEntry = await ctx.env.DB.prepare(
      'SELECT * FROM journal_entries WHERE id = ?'
    ).bind(entryId).first<any>()

    // Parse content JSON
    if (createdEntry && typeof createdEntry.content === 'string') {
      try {
        createdEntry.content = JSON.parse(createdEntry.content)
      } catch (e) {
        console.error('Failed to parse content JSON:', e)
        createdEntry.content = []
      }
    }

    return successResponse(
      {
        message: 'Journal entry created successfully',
        entry: createdEntry,
      },
      201,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error creating journal entry:', error)
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to create journal entry',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Update journal entry
 * PUT /v1/journal/:id
 * Body: { title (optional), blocks (optional), entry_type (optional) }
 */
export const updateEntry: RouteHandler = async (ctx) => {
  if (!ctx.userId) {
    return errorResponse(
      ErrorCodes.AUTHENTICATION_FAILED,
      'Authentication required',
      401,
      undefined,
      ctx.requestId
    )
  }

  const { id } = ctx.params

  if (!id) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'Entry ID required',
      400,
      undefined,
      ctx.requestId
    )
  }

  try {
    const body = await ctx.request.json()

    // Get artist profile
    const artist = await ctx.env.DB.prepare(
      'SELECT id FROM artists WHERE user_id = ?'
    ).bind(ctx.userId).first<{ id: string }>()

    if (!artist) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Artist profile not found',
        404,
        undefined,
        ctx.requestId
      )
    }

    // Verify entry exists and belongs to artist
    const existingEntry = await ctx.env.DB.prepare(
      'SELECT * FROM journal_entries WHERE id = ? AND artist_id = ?'
    ).bind(id, artist.id).first()

    if (!existingEntry) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Journal entry not found or unauthorized',
        404,
        undefined,
        ctx.requestId
      )
    }

    // Validate entry_type if provided
    if (body.entry_type && !VALID_ENTRY_TYPES.includes(body.entry_type as EntryType)) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        `Invalid entry_type. Must be one of: ${VALID_ENTRY_TYPES.join(', ')}`,
        400,
        undefined,
        ctx.requestId
      )
    }

    // Validate blocks if provided
    if (body.blocks !== undefined) {
      if (!Array.isArray(body.blocks)) {
        return errorResponse(
          ErrorCodes.VALIDATION_ERROR,
          'blocks must be an array',
          400,
          undefined,
          ctx.requestId
        )
      }

      // Validate each block
      for (const block of body.blocks) {
        if (!block.type || block.order === undefined) {
          return errorResponse(
            ErrorCodes.VALIDATION_ERROR,
            'Each block must have type, content, and order fields',
            400,
            undefined,
            ctx.requestId
          )
        }
      }
    }

    // Build update query dynamically
    const updates: string[] = []
    const values: any[] = []

    if (body.title !== undefined) {
      updates.push('title = ?')
      values.push(body.title)
    }

    if (body.blocks !== undefined) {
      updates.push('content = ?')
      values.push(JSON.stringify(body.blocks))
    }

    if (body.entry_type !== undefined) {
      updates.push('entry_type = ?')
      values.push(body.entry_type)
    }

    // Always update the updated_at timestamp
    updates.push('updated_at = ?')
    values.push(new Date().toISOString())

    if (updates.length === 1) {
      // Only updated_at would be updated, which means no actual changes
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'No valid fields to update',
        400,
        undefined,
        ctx.requestId
      )
    }

    // Add entry ID to WHERE clause
    values.push(id)

    // Execute update
    const query = `UPDATE journal_entries SET ${updates.join(', ')} WHERE id = ?`
    await ctx.env.DB.prepare(query).bind(...values).run()

    // Fetch updated entry
    const updatedEntry = await ctx.env.DB.prepare(
      'SELECT * FROM journal_entries WHERE id = ?'
    ).bind(id).first<any>()

    // Parse content JSON
    if (updatedEntry && typeof updatedEntry.content === 'string') {
      try {
        updatedEntry.content = JSON.parse(updatedEntry.content)
      } catch (e) {
        console.error('Failed to parse content JSON:', e)
        updatedEntry.content = []
      }
    }

    return successResponse(
      {
        message: 'Journal entry updated successfully',
        entry: updatedEntry,
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error updating journal entry:', error)
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to update journal entry',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Delete journal entry
 * DELETE /v1/journal/:id
 */
export const deleteEntry: RouteHandler = async (ctx) => {
  if (!ctx.userId) {
    return errorResponse(
      ErrorCodes.AUTHENTICATION_FAILED,
      'Authentication required',
      401,
      undefined,
      ctx.requestId
    )
  }

  const { id } = ctx.params

  if (!id) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'Entry ID required',
      400,
      undefined,
      ctx.requestId
    )
  }

  try {
    // Get artist profile
    const artist = await ctx.env.DB.prepare(
      'SELECT id FROM artists WHERE user_id = ?'
    ).bind(ctx.userId).first<{ id: string }>()

    if (!artist) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Artist profile not found',
        404,
        undefined,
        ctx.requestId
      )
    }

    // Verify entry exists and belongs to artist
    const entry = await ctx.env.DB.prepare(
      'SELECT * FROM journal_entries WHERE id = ? AND artist_id = ?'
    ).bind(id, artist.id).first()

    if (!entry) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Journal entry not found or unauthorized',
        404,
        undefined,
        ctx.requestId
      )
    }

    // Delete entry
    await ctx.env.DB.prepare(
      'DELETE FROM journal_entries WHERE id = ?'
    ).bind(id).run()

    return successResponse(
      {
        message: 'Journal entry deleted successfully',
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error deleting journal entry:', error)
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to delete journal entry',
      500,
      undefined,
      ctx.requestId
    )
  }
}

