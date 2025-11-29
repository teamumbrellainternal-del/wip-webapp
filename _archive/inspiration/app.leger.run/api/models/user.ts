/**
 * User data models
 * Mirrors the D1 schema and KV structure
 */

/**
 * User record stored in D1 and KV
 */
export interface UserRecord {
  user_uuid: string // UUID v5 from tailscale_user_id
  tailscale_user_id: string // e.g., "u123456789"
  tailscale_email: string // e.g., "alice@github"
  tailnet: string // e.g., "example.ts.net"
  display_name: string | null // Human-readable name
  created_at: string // ISO 8601 timestamp
  last_seen: string // Last successful authentication
  last_device_id: string // Most recent device used
  cli_version: string | null // Last CLI version used
  total_authentications: number // Lifetime auth count
}

/**
 * User creation input (from JWT payload)
 */
export interface CreateUserInput {
  tailscale_user_id: string
  tailscale_email: string
  tailnet: string
  device_id: string
  cli_version?: string
}

/**
 * User update input
 */
export interface UpdateUserInput {
  display_name?: string
  last_device_id?: string
  cli_version?: string
}

/**
 * User public profile (safe to return to clients)
 */
export interface UserProfile {
  user_uuid: string
  email: string
  display_name: string | null
  tailnet: string
  created_at: string
}
