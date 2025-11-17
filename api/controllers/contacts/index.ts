/**
 * Contacts controller
 * Handles contact list management and individual contacts for broadcasts
 * Implements task-8.2 requirements
 */

import type { RouteHandler } from '../../router'
import { successResponse, errorResponse } from '../../utils/response'
import { ErrorCodes } from '../../utils/error-codes'
import { generateUUIDv4 } from '../../utils/uuid'

/**
 * Get all contact lists for artist
 * GET /v1/contacts/lists
 */
export const getContactLists: RouteHandler = async (ctx) => {
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
    )
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

    // Get all contact lists for this artist
    const lists = await ctx.env.DB.prepare(
      'SELECT * FROM contact_lists WHERE artist_id = ? ORDER BY created_at DESC'
    )
      .bind(artist.id)
      .all()

    // For each list, count the contacts
    const listsWithCounts = await Promise.all(
      (lists.results || []).map(async (list: any) => {
        const countResult = await ctx.env.DB.prepare(
          'SELECT COUNT(*) as count FROM contact_list_members WHERE list_id = ?'
        )
          .bind(list.id)
          .first<{ count: number }>()

        return {
          list_id: list.id,
          list_name: list.name,
          list_description: list.description,
          contact_count: countResult?.count || 0,
          created_at: list.created_at,
        }
      })
    )

    return successResponse(
      {
        lists: listsWithCounts,
        count: listsWithCounts.length,
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error fetching contact lists:', error)
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      'Failed to fetch contact lists',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Create a new contact list
 * POST /v1/contacts/lists
 */
export const createContactList: RouteHandler = async (ctx) => {
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
    const { name, description } = body

    if (!name) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'List name is required',
        400,
        'name',
        ctx.requestId
      )
    }

    // Get artist profile
    const artist = await ctx.env.DB.prepare(
      'SELECT id FROM artists WHERE user_id = ?'
    )
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

    // Create new contact list
    const listId = generateUUIDv4()
    const now = new Date().toISOString()

    await ctx.env.DB.prepare(
      'INSERT INTO contact_lists (id, artist_id, name, description, created_at) VALUES (?, ?, ?, ?, ?)'
    )
      .bind(listId, artist.id, name, description || null, now)
      .run()

    return successResponse(
      {
        message: 'Contact list created successfully',
        list: {
          list_id: listId,
          list_name: name,
          list_description: description || null,
          contact_count: 0,
          created_at: now,
        },
      },
      201,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error creating contact list:', error)
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to create contact list',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Get contacts (optionally filtered by list_id)
 * GET /v1/contacts
 */
export const getContacts: RouteHandler = async (ctx) => {
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
    )
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

    // Parse query params
    const listId = ctx.url.searchParams.get('list_id')

    let query: string
    let params: any[]

    if (listId) {
      // Filter by list_id - first verify the list belongs to this artist
      const list = await ctx.env.DB.prepare(
        'SELECT id FROM contact_lists WHERE id = ? AND artist_id = ?'
      )
        .bind(listId, artist.id)
        .first()

      if (!list) {
        return errorResponse(
          ErrorCodes.NOT_FOUND,
          'Contact list not found or unauthorized',
          404,
          undefined,
          ctx.requestId
        )
      }

      query = 'SELECT * FROM contact_list_members WHERE list_id = ? ORDER BY created_at DESC'
      params = [listId]
    } else {
      // Get all contacts for all lists belonging to this artist
      query = `
        SELECT clm.*
        FROM contact_list_members clm
        INNER JOIN contact_lists cl ON clm.list_id = cl.id
        WHERE cl.artist_id = ?
        ORDER BY clm.created_at DESC
      `
      params = [artist.id]
    }

    const contacts = await ctx.env.DB.prepare(query).bind(...params).all()

    return successResponse(
      {
        contacts: contacts.results || [],
        count: contacts.results?.length || 0,
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error fetching contacts:', error)
    return errorResponse(
      ErrorCodes.DATABASE_ERROR,
      'Failed to fetch contacts',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Add a single contact
 * POST /v1/contacts
 */
export const createContact: RouteHandler = async (ctx) => {
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
    const { list_id, email, phone, name, opted_in_email, opted_in_sms } = body

    if (!list_id) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'list_id is required',
        400,
        'list_id',
        ctx.requestId
      )
    }

    if (!email && !phone) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'At least one of email or phone is required',
        400,
        undefined,
        ctx.requestId
      )
    }

    // Get artist profile
    const artist = await ctx.env.DB.prepare(
      'SELECT id FROM artists WHERE user_id = ?'
    )
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

    // Verify list belongs to this artist
    const list = await ctx.env.DB.prepare(
      'SELECT id FROM contact_lists WHERE id = ? AND artist_id = ?'
    )
      .bind(list_id, artist.id)
      .first()

    if (!list) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Contact list not found or unauthorized',
        404,
        undefined,
        ctx.requestId
      )
    }

    // Validate email format if provided
    if (email && !isValidEmail(email)) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Invalid email format',
        400,
        'email',
        ctx.requestId
      )
    }

    // Validate phone format if provided
    if (phone && !isValidPhone(phone)) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Invalid phone format',
        400,
        'phone',
        ctx.requestId
      )
    }

    // Create contact
    const contactId = generateUUIDv4()
    const now = new Date().toISOString()

    await ctx.env.DB.prepare(
      `INSERT INTO contact_list_members
       (id, list_id, email, phone, name, opted_in_email, opted_in_sms, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        contactId,
        list_id,
        email || null,
        phone || null,
        name || null,
        opted_in_email !== undefined ? (opted_in_email ? 1 : 0) : 1,
        opted_in_sms !== undefined ? (opted_in_sms ? 1 : 0) : 1,
        now,
        now
      )
      .run()

    // Fetch created contact
    const contact = await ctx.env.DB.prepare(
      'SELECT * FROM contact_list_members WHERE id = ?'
    )
      .bind(contactId)
      .first()

    return successResponse(
      {
        message: 'Contact added successfully',
        contact,
      },
      201,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error creating contact:', error)
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to create contact',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Bulk import contacts
 * POST /v1/contacts/import
 */
export const importContacts: RouteHandler = async (ctx) => {
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
    const { list_id, contacts } = body

    if (!list_id) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'list_id is required',
        400,
        'list_id',
        ctx.requestId
      )
    }

    if (!Array.isArray(contacts) || contacts.length === 0) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'contacts array is required and must not be empty',
        400,
        'contacts',
        ctx.requestId
      )
    }

    // Get artist profile
    const artist = await ctx.env.DB.prepare(
      'SELECT id FROM artists WHERE user_id = ?'
    )
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

    // Verify list belongs to this artist
    const list = await ctx.env.DB.prepare(
      'SELECT id FROM contact_lists WHERE id = ? AND artist_id = ?'
    )
      .bind(list_id, artist.id)
      .first()

    if (!list) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Contact list not found or unauthorized',
        404,
        undefined,
        ctx.requestId
      )
    }

    // Validate and import contacts
    let importCount = 0
    const errors: Array<{ index: number; error: string }> = []

    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i]
      const { email, phone, name, opted_in_email, opted_in_sms } = contact

      // Validate contact has at least email or phone
      if (!email && !phone) {
        errors.push({ index: i, error: 'Contact must have email or phone' })
        continue
      }

      // Validate email format if provided
      if (email && !isValidEmail(email)) {
        errors.push({ index: i, error: 'Invalid email format' })
        continue
      }

      // Validate phone format if provided
      if (phone && !isValidPhone(phone)) {
        errors.push({ index: i, error: 'Invalid phone format' })
        continue
      }

      try {
        // Insert contact
        const contactId = generateUUIDv4()
        const now = new Date().toISOString()

        await ctx.env.DB.prepare(
          `INSERT INTO contact_list_members
           (id, list_id, email, phone, name, opted_in_email, opted_in_sms, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
          .bind(
            contactId,
            list_id,
            email || null,
            phone || null,
            name || null,
            opted_in_email !== undefined ? (opted_in_email ? 1 : 0) : 1,
            opted_in_sms !== undefined ? (opted_in_sms ? 1 : 0) : 1,
            now,
            now
          )
          .run()

        importCount++
      } catch (err) {
        errors.push({ index: i, error: 'Failed to insert contact' })
      }
    }

    return successResponse(
      {
        message: `Successfully imported ${importCount} contacts`,
        import_count: importCount,
        total_submitted: contacts.length,
        errors: errors.length > 0 ? errors : undefined,
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error importing contacts:', error)
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to import contacts',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Update contact (primarily for opt-in status)
 * PUT /v1/contacts/:contactId
 */
export const updateContact: RouteHandler = async (ctx) => {
  if (!ctx.userId) {
    return errorResponse(
      ErrorCodes.AUTHENTICATION_FAILED,
      'Authentication required',
      401,
      undefined,
      ctx.requestId
    )
  }

  const { contactId } = ctx.params

  if (!contactId) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'Contact ID required',
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
    )
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

    // Verify contact belongs to this artist's list
    const contact = await ctx.env.DB.prepare(
      `SELECT clm.*
       FROM contact_list_members clm
       INNER JOIN contact_lists cl ON clm.list_id = cl.id
       WHERE clm.id = ? AND cl.artist_id = ?`
    )
      .bind(contactId, artist.id)
      .first()

    if (!contact) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Contact not found or unauthorized',
        404,
        undefined,
        ctx.requestId
      )
    }

    // Build update query
    const allowedFields = ['name', 'email', 'phone', 'opted_in_email', 'opted_in_sms']
    const updates: string[] = []
    const values: any[] = []

    for (const [key, value] of Object.entries(body)) {
      if (allowedFields.includes(key)) {
        // Validate email/phone if being updated
        if (key === 'email' && value && !isValidEmail(value as string)) {
          return errorResponse(
            ErrorCodes.VALIDATION_ERROR,
            'Invalid email format',
            400,
            'email',
            ctx.requestId
          )
        }
        if (key === 'phone' && value && !isValidPhone(value as string)) {
          return errorResponse(
            ErrorCodes.VALIDATION_ERROR,
            'Invalid phone format',
            400,
            'phone',
            ctx.requestId
          )
        }

        // Convert boolean fields to integers for SQLite
        if (key === 'opted_in_email' || key === 'opted_in_sms') {
          updates.push(`${key} = ?`)
          values.push(value ? 1 : 0)
        } else {
          updates.push(`${key} = ?`)
          values.push(value)
        }
      }
    }

    if (updates.length === 0) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'No valid fields to update',
        400,
        undefined,
        ctx.requestId
      )
    }

    // Add updated_at timestamp
    updates.push('updated_at = ?')
    values.push(new Date().toISOString())

    // Add contact ID to WHERE clause
    values.push(contactId)

    // Execute update
    const query = `UPDATE contact_list_members SET ${updates.join(', ')} WHERE id = ?`
    await ctx.env.DB.prepare(query).bind(...values).run()

    // Fetch updated contact
    const updatedContact = await ctx.env.DB.prepare(
      'SELECT * FROM contact_list_members WHERE id = ?'
    )
      .bind(contactId)
      .first()

    return successResponse(
      {
        message: 'Contact updated successfully',
        contact: updatedContact,
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error updating contact:', error)
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to update contact',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Delete contact
 * DELETE /v1/contacts/:contactId
 */
export const deleteContact: RouteHandler = async (ctx) => {
  if (!ctx.userId) {
    return errorResponse(
      ErrorCodes.AUTHENTICATION_FAILED,
      'Authentication required',
      401,
      undefined,
      ctx.requestId
    )
  }

  const { contactId } = ctx.params

  if (!contactId) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'Contact ID required',
      400,
      undefined,
      ctx.requestId
    )
  }

  try {
    // Get artist profile
    const artist = await ctx.env.DB.prepare(
      'SELECT id FROM artists WHERE user_id = ?'
    )
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

    // Verify contact belongs to this artist's list
    const contact = await ctx.env.DB.prepare(
      `SELECT clm.*
       FROM contact_list_members clm
       INNER JOIN contact_lists cl ON clm.list_id = cl.id
       WHERE clm.id = ? AND cl.artist_id = ?`
    )
      .bind(contactId, artist.id)
      .first()

    if (!contact) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'Contact not found or unauthorized',
        404,
        undefined,
        ctx.requestId
      )
    }

    // Delete contact
    await ctx.env.DB.prepare('DELETE FROM contact_list_members WHERE id = ?')
      .bind(contactId)
      .run()

    return successResponse(
      {
        message: 'Contact deleted successfully',
      },
      200,
      ctx.requestId
    )
  } catch (error) {
    console.error('Error deleting contact:', error)
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to delete contact',
      500,
      undefined,
      ctx.requestId
    )
  }
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone format (basic validation - allows various formats)
 */
function isValidPhone(phone: string): boolean {
  // Remove common formatting characters
  const cleaned = phone.replace(/[\s\-\(\)\+]/g, '')
  // Check if it's all digits and has a reasonable length (7-15 digits)
  return /^\d{7,15}$/.test(cleaned)
}
