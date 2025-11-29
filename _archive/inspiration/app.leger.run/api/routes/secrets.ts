/**
 * Secrets routes
 * GET /api/secrets - List all secrets (with optional values for CLI)
 * GET /api/secrets/:name - Get single secret
 * POST /api/secrets/:name - Create or update secret
 * DELETE /api/secrets/:name - Delete secret
 */

import type { Env } from '../middleware/auth'
import {
  authenticateRequest,
  successResponse,
  errorResponse,
  handleError,
} from '../middleware/auth'
import {
  listSecrets,
  getSecret,
  upsertSecret,
  deleteSecret,
} from '../services/secrets'

/**
 * GET /api/secrets
 * List all secrets for user
 */
export async function handleListSecrets(request: Request, env: Env): Promise<Response> {
  try {
    const payload = await authenticateRequest(request, env)

    // Check if CLI wants values included
    const url = new URL(request.url)
    const includeValues = url.searchParams.get('include_values') === 'true'

    const secrets = await listSecrets(env, payload.sub, includeValues)

    return successResponse({ secrets })
  } catch (error) {
    return handleError(error)
  }
}

/**
 * GET /api/secrets/:name
 * Get single secret by name
 */
export async function handleGetSecret(
  request: Request,
  env: Env,
  secretName: string
): Promise<Response> {
  try {
    const payload = await authenticateRequest(request, env)

    const secret = await getSecret(env, payload.sub, secretName, true)

    if (!secret) {
      return errorResponse('not_found', `Secret '${secretName}' not found`, 404)
    }

    return successResponse(secret)
  } catch (error) {
    return handleError(error)
  }
}

/**
 * POST /api/secrets/:name
 * Create or update secret
 */
export async function handleUpsertSecret(
  request: Request,
  env: Env,
  secretName: string
): Promise<Response> {
  try {
    const payload = await authenticateRequest(request, env)

    // Parse request body
    const body = await request.json()

    if (!body.value) {
      return errorResponse('validation_error', 'Missing required field: value', 400)
    }

    const secret = await upsertSecret(
      env,
      payload.sub,
      { value: body.value },
      secretName
    )

    return successResponse(secret)
  } catch (error) {
    return handleError(error)
  }
}

/**
 * DELETE /api/secrets/:name
 * Delete secret
 */
export async function handleDeleteSecret(
  request: Request,
  env: Env,
  secretName: string
): Promise<Response> {
  try {
    const payload = await authenticateRequest(request, env)

    const deleted = await deleteSecret(env, payload.sub, secretName)

    if (!deleted) {
      return errorResponse('not_found', `Secret '${secretName}' not found`, 404)
    }

    return successResponse({ deleted: true })
  } catch (error) {
    return handleError(error)
  }
}
