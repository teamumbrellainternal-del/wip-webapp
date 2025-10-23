/**
 * Releases service
 * Handles release CRUD operations with D1
 */

import type { Env } from '../middleware/auth'
import type {
  ReleaseRecord,
  CreateReleaseInput,
  UpdateReleaseInput,
} from '../models/release'
import {
  isValidReleaseName,
  isValidGitURL,
  isValidBranchName,
} from '../models/release'
import { generateUUIDv4 } from '../utils/uuid'

/**
 * List all releases for a user
 */
export async function listReleases(
  env: Env,
  userUuid: string,
  filterName?: string
): Promise<ReleaseRecord[]> {
  let query = 'SELECT * FROM releases WHERE user_uuid = ?'
  const bindings: unknown[] = [userUuid]

  if (filterName) {
    query += ' AND name = ?'
    bindings.push(filterName)
  }

  query += ' ORDER BY created_at DESC'

  const result = await env.LEGER_DB.prepare(query).bind(...bindings).all()

  return result.results as ReleaseRecord[]
}

/**
 * Get single release by ID
 */
export async function getRelease(
  env: Env,
  userUuid: string,
  releaseId: string
): Promise<ReleaseRecord | null> {
  const result = await env.LEGER_DB.prepare(
    'SELECT * FROM releases WHERE id = ? AND user_uuid = ?'
  )
    .bind(releaseId, userUuid)
    .first<ReleaseRecord>()

  return result
}

/**
 * Get release by name (for CLI lookup)
 */
export async function getReleaseByName(
  env: Env,
  userUuid: string,
  name: string
): Promise<ReleaseRecord | null> {
  const result = await env.LEGER_DB.prepare(
    'SELECT * FROM releases WHERE user_uuid = ? AND name = ?'
  )
    .bind(userUuid, name)
    .first<ReleaseRecord>()

  return result
}

/**
 * Create new release
 */
export async function createRelease(
  env: Env,
  userUuid: string,
  input: CreateReleaseInput
): Promise<ReleaseRecord> {
  // Validate inputs
  if (!isValidReleaseName(input.name)) {
    throw new Error(
      'Invalid release name. Must be alphanumeric with underscores/hyphens, 1-64 characters'
    )
  }

  if (!isValidGitURL(input.git_url)) {
    throw new Error('Invalid Git URL. Must be a valid HTTPS repository URL')
  }

  const gitBranch = input.git_branch || 'main'
  if (!isValidBranchName(gitBranch)) {
    throw new Error('Invalid branch name')
  }

  // Check for duplicate name
  const existing = await getReleaseByName(env, userUuid, input.name)
  if (existing) {
    throw new Error('Release with this name already exists')
  }

  // Get next version number for this user
  const versionResult = await env.LEGER_DB.prepare(
    'SELECT MAX(version) as max_version FROM releases WHERE user_uuid = ?'
  )
    .bind(userUuid)
    .first<{ max_version: number | null }>()

  const version = (versionResult?.max_version || 0) + 1

  const now = new Date().toISOString()

  const release: ReleaseRecord = {
    id: generateUUIDv4(),
    user_uuid: userUuid,
    name: input.name,
    git_url: input.git_url,
    git_branch: gitBranch,
    description: input.description || null,
    version,
    created_at: now,
    updated_at: now,
  }

  // Insert into D1
  await env.LEGER_DB.prepare(
    `INSERT INTO releases (
      id, user_uuid, name, git_url, git_branch,
      description, version, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      release.id,
      release.user_uuid,
      release.name,
      release.git_url,
      release.git_branch,
      release.description,
      release.version,
      release.created_at,
      release.updated_at
    )
    .run()

  return release
}

/**
 * Update existing release
 */
export async function updateRelease(
  env: Env,
  userUuid: string,
  releaseId: string,
  input: UpdateReleaseInput
): Promise<ReleaseRecord> {
  // Get existing release
  const existing = await getRelease(env, userUuid, releaseId)
  if (!existing) {
    throw new Error('Release not found')
  }

  // Build update query dynamically
  const updates: string[] = []
  const bindings: unknown[] = []

  if (input.name !== undefined) {
    if (!isValidReleaseName(input.name)) {
      throw new Error(
        'Invalid release name. Must be alphanumeric with underscores/hyphens, 1-64 characters'
      )
    }

    // Check for duplicate name (if changing name)
    if (input.name !== existing.name) {
      const duplicate = await getReleaseByName(env, userUuid, input.name)
      if (duplicate) {
        throw new Error('Release with this name already exists')
      }
    }

    updates.push('name = ?')
    bindings.push(input.name)
  }

  if (input.git_url !== undefined) {
    if (!isValidGitURL(input.git_url)) {
      throw new Error('Invalid Git URL. Must be a valid HTTPS repository URL')
    }

    updates.push('git_url = ?')
    bindings.push(input.git_url)
  }

  if (input.git_branch !== undefined) {
    if (!isValidBranchName(input.git_branch)) {
      throw new Error('Invalid branch name')
    }

    updates.push('git_branch = ?')
    bindings.push(input.git_branch)
  }

  if (input.description !== undefined) {
    updates.push('description = ?')
    bindings.push(input.description)
  }

  if (updates.length === 0) {
    return existing // No updates
  }

  // Always update updated_at
  updates.push('updated_at = ?')
  bindings.push(new Date().toISOString())

  bindings.push(releaseId)
  bindings.push(userUuid)

  // Update D1
  await env.LEGER_DB.prepare(
    `UPDATE releases SET ${updates.join(', ')} WHERE id = ? AND user_uuid = ?`
  )
    .bind(...bindings)
    .run()

  // Get updated release
  const updated = await getRelease(env, userUuid, releaseId)
  if (!updated) {
    throw new Error('Failed to retrieve updated release')
  }

  return updated
}

/**
 * Delete release
 */
export async function deleteRelease(
  env: Env,
  userUuid: string,
  releaseId: string
): Promise<boolean> {
  // Check if exists
  const existing = await getRelease(env, userUuid, releaseId)
  if (!existing) {
    return false
  }

  // Delete from D1
  await env.LEGER_DB.prepare('DELETE FROM releases WHERE id = ? AND user_uuid = ?')
    .bind(releaseId, userUuid)
    .run()

  return true
}
