/**
 * Test routes (NO AUTHENTICATION)
 * These routes are for testing purposes only and bypass all authentication
 * Use a hardcoded test user ID for all operations
 *
 * Routes:
 * POST /api/test/auth/login - Get test JWT token (for web UI testing)
 * GET /api/test/secrets - List all secrets
 * GET /api/test/secrets/:name - Get single secret
 * POST /api/test/secrets/:name - Create or update secret
 * DELETE /api/test/secrets/:name - Delete secret
 * GET /api/test/releases - List all releases
 * GET /api/test/releases/:id - Get single release
 * POST /api/test/releases - Create release
 * PUT /api/test/releases/:id - Update release
 * DELETE /api/test/releases/:id - Delete release
 */

import type { Env } from '../middleware/auth'
import { successResponse, errorResponse, handleError } from '../middleware/auth'
import { createJWT } from '../utils/jwt'
import type { JWTPayload } from '../utils/jwt'
import { getUserByTailscaleId, createUser, toUserProfile } from '../services/user'
import {
  listSecrets,
  getSecret,
  upsertSecret,
  deleteSecret,
} from '../services/secrets'
import {
  listReleases,
  getRelease,
  createRelease,
  updateRelease,
  deleteRelease,
} from '../services/releases'

// Hardcoded test user ID for all test operations
const TEST_USER_ID = 'test-user@leger.test'
const TEST_TAILSCALE_USER_ID = 'u999999999'
const TEST_EMAIL = 'test@leger.test'
const TEST_TAILNET = 'test.ts.net'

/**
 * POST /api/test/auth/login
 * Generate test JWT token for web UI development (no auth required)
 */
export async function handleTestAuthLogin(request: Request, env: Env): Promise<Response> {
  try {
    // Check if test user exists, create if not
    let user = await getUserByTailscaleId(env, TEST_TAILSCALE_USER_ID)

    if (!user) {
      user = await createUser(env, {
        tailscale_user_id: TEST_TAILSCALE_USER_ID,
        tailscale_email: TEST_EMAIL,
        tailnet: TEST_TAILNET,
        device_id: 'web-test',
        cli_version: undefined,
      })
    }

    // Create JWT payload
    const now = Math.floor(Date.now() / 1000)
    const payload: JWTPayload = {
      sub: user.user_uuid,
      tailscale_user_id: TEST_TAILSCALE_USER_ID,
      email: TEST_EMAIL,
      tailnet: TEST_TAILNET,
      iat: now,
      exp: now + 30 * 24 * 60 * 60, // 30 days
    }

    // Generate JWT
    const token = await createJWT(payload, env.JWT_SECRET)

    // Return same format as normal auth
    return successResponse({
      token,
      user: toUserProfile(user),
    })
  } catch (error) {
    return handleError(error)
  }
}

/**
 * GET /api/test/secrets
 * List all secrets (no auth)
 */
export async function handleTestListSecrets(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url)
    const includeValues = url.searchParams.get('include_values') === 'true'

    const secrets = await listSecrets(env, TEST_USER_ID, includeValues)

    return successResponse({ secrets })
  } catch (error) {
    return handleError(error)
  }
}

/**
 * GET /api/test/secrets/:name
 * Get single secret (no auth)
 */
export async function handleTestGetSecret(
  request: Request,
  env: Env,
  secretName: string
): Promise<Response> {
  try {
    const secret = await getSecret(env, TEST_USER_ID, secretName, true)

    if (!secret) {
      return errorResponse('not_found', `Secret '${secretName}' not found`, 404)
    }

    return successResponse(secret)
  } catch (error) {
    return handleError(error)
  }
}

/**
 * POST /api/test/secrets/:name
 * Create or update secret (no auth)
 */
export async function handleTestUpsertSecret(
  request: Request,
  env: Env,
  secretName: string
): Promise<Response> {
  try {
    const body = await request.json()

    if (!body.value) {
      return errorResponse('validation_error', 'Missing required field: value', 400)
    }

    const secret = await upsertSecret(env, TEST_USER_ID, { value: body.value }, secretName)

    return successResponse(secret)
  } catch (error) {
    return handleError(error)
  }
}

/**
 * DELETE /api/test/secrets/:name
 * Delete secret (no auth)
 */
export async function handleTestDeleteSecret(
  request: Request,
  env: Env,
  secretName: string
): Promise<Response> {
  try {
    const deleted = await deleteSecret(env, TEST_USER_ID, secretName)

    if (!deleted) {
      return errorResponse('not_found', `Secret '${secretName}' not found`, 404)
    }

    return successResponse({ deleted: true })
  } catch (error) {
    return handleError(error)
  }
}

/**
 * GET /api/test/releases
 * List all releases (no auth)
 */
export async function handleTestListReleases(request: Request, env: Env): Promise<Response> {
  try {
    const releases = await listReleases(env, TEST_USER_ID)

    return successResponse({ releases })
  } catch (error) {
    return handleError(error)
  }
}

/**
 * GET /api/test/releases/:id
 * Get single release (no auth)
 */
export async function handleTestGetRelease(
  request: Request,
  env: Env,
  releaseId: string
): Promise<Response> {
  try {
    const release = await getRelease(env, TEST_USER_ID, releaseId)

    if (!release) {
      return errorResponse('not_found', `Release '${releaseId}' not found`, 404)
    }

    return successResponse(release)
  } catch (error) {
    return handleError(error)
  }
}

/**
 * POST /api/test/releases
 * Create release (no auth)
 */
export async function handleTestCreateRelease(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.name) {
      return errorResponse('validation_error', 'Missing required field: name', 400)
    }

    if (!body.git_url) {
      return errorResponse('validation_error', 'Missing required field: git_url', 400)
    }

    const release = await createRelease(env, TEST_USER_ID, body)

    return successResponse(release)
  } catch (error) {
    return handleError(error)
  }
}

/**
 * PUT /api/test/releases/:id
 * Update release (no auth)
 */
export async function handleTestUpdateRelease(
  request: Request,
  env: Env,
  releaseId: string
): Promise<Response> {
  try {
    const body = await request.json()

    const release = await updateRelease(env, TEST_USER_ID, releaseId, body)

    if (!release) {
      return errorResponse('not_found', `Release '${releaseId}' not found`, 404)
    }

    return successResponse(release)
  } catch (error) {
    return handleError(error)
  }
}

/**
 * DELETE /api/test/releases/:id
 * Delete release (no auth)
 */
export async function handleTestDeleteRelease(
  request: Request,
  env: Env,
  releaseId: string
): Promise<Response> {
  try {
    const deleted = await deleteRelease(env, TEST_USER_ID, releaseId)

    if (!deleted) {
      return errorResponse('not_found', `Release '${releaseId}' not found`, 404)
    }

    return successResponse({ deleted: true })
  } catch (error) {
    return handleError(error)
  }
}
