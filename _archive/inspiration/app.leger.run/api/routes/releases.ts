/**
 * Releases routes
 * GET /api/releases - List all releases
 * GET /api/releases/:id - Get single release
 * POST /api/releases - Create new release
 * PUT /api/releases/:id - Update release
 * DELETE /api/releases/:id - Delete release
 */

import type { Env } from '../middleware/auth'
import {
  authenticateRequest,
  successResponse,
  errorResponse,
  handleError,
} from '../middleware/auth'
import {
  listReleases,
  getRelease,
  getReleaseByName,
  createRelease,
  updateRelease,
  deleteRelease,
} from '../services/releases'

/**
 * GET /api/releases
 * List all releases for user (with optional name filter for CLI)
 */
export async function handleListReleases(request: Request, env: Env): Promise<Response> {
  try {
    const payload = await authenticateRequest(request, env)

    // Check for name filter (for CLI lookup)
    const url = new URL(request.url)
    const name = url.searchParams.get('name')

    let releases
    if (name) {
      // Return single release by name (for CLI)
      const release = await getReleaseByName(env, payload.sub, name)
      releases = release ? [release] : []
    } else {
      // Return all releases
      releases = await listReleases(env, payload.sub)
    }

    return successResponse({ releases })
  } catch (error) {
    return handleError(error)
  }
}

/**
 * GET /api/releases/:id
 * Get single release by ID
 */
export async function handleGetRelease(
  request: Request,
  env: Env,
  releaseId: string
): Promise<Response> {
  try {
    const payload = await authenticateRequest(request, env)

    const release = await getRelease(env, payload.sub, releaseId)

    if (!release) {
      return errorResponse('not_found', `Release '${releaseId}' not found`, 404)
    }

    return successResponse(release)
  } catch (error) {
    return handleError(error)
  }
}

/**
 * POST /api/releases
 * Create new release
 */
export async function handleCreateRelease(request: Request, env: Env): Promise<Response> {
  try {
    const payload = await authenticateRequest(request, env)

    // Parse request body
    const body = await request.json()

    if (!body.name || !body.git_url) {
      return errorResponse(
        'validation_error',
        'Missing required fields: name, git_url',
        400
      )
    }

    const release = await createRelease(env, payload.sub, {
      name: body.name,
      git_url: body.git_url,
      git_branch: body.git_branch,
      description: body.description,
    })

    return successResponse(release, 201)
  } catch (error) {
    return handleError(error)
  }
}

/**
 * PUT /api/releases/:id
 * Update existing release
 */
export async function handleUpdateRelease(
  request: Request,
  env: Env,
  releaseId: string
): Promise<Response> {
  try {
    const payload = await authenticateRequest(request, env)

    // Parse request body
    const body = await request.json()

    const release = await updateRelease(env, payload.sub, releaseId, {
      name: body.name,
      git_url: body.git_url,
      git_branch: body.git_branch,
      description: body.description,
    })

    return successResponse(release)
  } catch (error) {
    return handleError(error)
  }
}

/**
 * DELETE /api/releases/:id
 * Delete release
 */
export async function handleDeleteRelease(
  request: Request,
  env: Env,
  releaseId: string
): Promise<Response> {
  try {
    const payload = await authenticateRequest(request, env)

    const deleted = await deleteRelease(env, payload.sub, releaseId)

    if (!deleted) {
      return errorResponse('not_found', `Release '${releaseId}' not found`, 404)
    }

    return successResponse({ deleted: true })
  } catch (error) {
    return handleError(error)
  }
}
