/**
 * User service
 * Handles user CRUD operations with D1 and KV
 */

import type { Env } from '../middleware/auth'
import type {
  UserRecord,
  CreateUserInput,
  UpdateUserInput,
  UserProfile,
} from '../models/user'
import { generateUserUUID } from '../utils/uuid'

/**
 * Get user by UUID (checks D1 first, falls back to KV)
 */
export async function getUserByUUID(env: Env, userUuid: string): Promise<UserRecord | null> {
  // Try D1 first (authoritative)
  const result = await env.LEGER_DB.prepare(
    'SELECT * FROM users WHERE user_uuid = ?'
  )
    .bind(userUuid)
    .first<UserRecord>()

  if (result) {
    return result
  }

  // Fall back to KV cache
  const kvKey = `user:${userUuid}`
  const cached = await env.LEGER_USERS.get(kvKey, 'json')

  return cached as UserRecord | null
}

/**
 * Get user by Tailscale user ID
 */
export async function getUserByTailscaleId(
  env: Env,
  tailscaleUserId: string
): Promise<UserRecord | null> {
  // Try D1
  const result = await env.LEGER_DB.prepare(
    'SELECT * FROM users WHERE tailscale_user_id = ?'
  )
    .bind(tailscaleUserId)
    .first<UserRecord>()

  if (result) {
    return result
  }

  // Generate expected UUID and check KV
  const userUuid = await generateUserUUID(tailscaleUserId)
  return getUserByUUID(env, userUuid)
}

/**
 * Create new user (writes to both D1 and KV)
 */
export async function createUser(
  env: Env,
  input: CreateUserInput
): Promise<UserRecord> {
  // Generate deterministic UUID
  const userUuid = await generateUserUUID(input.tailscale_user_id)

  const now = new Date().toISOString()

  const user: UserRecord = {
    user_uuid: userUuid,
    tailscale_user_id: input.tailscale_user_id,
    tailscale_email: input.tailscale_email,
    tailnet: input.tailnet,
    display_name: null,
    created_at: now,
    last_seen: now,
    last_device_id: input.device_id,
    cli_version: input.cli_version || null,
    total_authentications: 1,
  }

  // Write to D1
  await env.LEGER_DB.prepare(
    `INSERT INTO users (
      user_uuid, tailscale_user_id, tailscale_email, tailnet,
      display_name, created_at, last_seen, last_device_id,
      cli_version, total_authentications
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      user.user_uuid,
      user.tailscale_user_id,
      user.tailscale_email,
      user.tailnet,
      user.display_name,
      user.created_at,
      user.last_seen,
      user.last_device_id,
      user.cli_version,
      user.total_authentications
    )
    .run()

  // Cache in KV
  const kvKey = `user:${userUuid}`
  await env.LEGER_USERS.put(kvKey, JSON.stringify(user))

  return user
}

/**
 * Update user (updates both D1 and KV)
 */
export async function updateUser(
  env: Env,
  userUuid: string,
  input: UpdateUserInput
): Promise<UserRecord> {
  // Get current user
  const user = await getUserByUUID(env, userUuid)
  if (!user) {
    throw new Error('User not found')
  }

  // Build update query dynamically
  const updates: string[] = []
  const bindings: unknown[] = []

  if (input.display_name !== undefined) {
    updates.push('display_name = ?')
    bindings.push(input.display_name)
  }

  if (input.last_device_id !== undefined) {
    updates.push('last_device_id = ?')
    bindings.push(input.last_device_id)
  }

  if (input.cli_version !== undefined) {
    updates.push('cli_version = ?')
    bindings.push(input.cli_version)
  }

  if (updates.length === 0) {
    return user // No updates
  }

  bindings.push(userUuid)

  // Update D1
  await env.LEGER_DB.prepare(
    `UPDATE users SET ${updates.join(', ')} WHERE user_uuid = ?`
  )
    .bind(...bindings)
    .run()

  // Get updated user
  const updated = await getUserByUUID(env, userUuid)
  if (!updated) {
    throw new Error('Failed to retrieve updated user')
  }

  // Update KV cache
  const kvKey = `user:${userUuid}`
  await env.LEGER_USERS.put(kvKey, JSON.stringify(updated))

  return updated
}

/**
 * Update user's last seen timestamp and increment auth count
 */
export async function updateLastSeen(
  env: Env,
  userUuid: string,
  deviceId: string
): Promise<void> {
  const now = new Date().toISOString()

  await env.LEGER_DB.prepare(
    `UPDATE users 
     SET last_seen = ?, last_device_id = ?, total_authentications = total_authentications + 1
     WHERE user_uuid = ?`
  )
    .bind(now, deviceId, userUuid)
    .run()

  // Invalidate KV cache (will be refreshed on next read)
  const kvKey = `user:${userUuid}`
  await env.LEGER_USERS.delete(kvKey)
}

/**
 * Convert UserRecord to safe UserProfile (for API responses)
 */
export function toUserProfile(user: UserRecord): UserProfile {
  return {
    user_uuid: user.user_uuid,
    email: user.tailscale_email,
    display_name: user.display_name,
    tailnet: user.tailnet,
    created_at: user.created_at,
  }
}
