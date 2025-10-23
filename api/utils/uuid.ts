/**
 * UUID utilities for generating deterministic user IDs
 * Uses UUID v5 (SHA-1 based) for deterministic IDs and v4 for random IDs
 */

/**
 * UUID v5 namespace for Umbrella users (randomly generated, fixed)
 */
const UMBRELLA_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'

/**
 * Generate UUID v5 from OAuth user ID
 * This creates a deterministic UUID that's always the same for a given OAuth user
 *
 * @param oauthUserId - OAuth user ID (e.g., from Apple or Google)
 * @returns UUID v5 string
 */
export async function generateUserUUID(oauthUserId: string): Promise<string> {
  const namespace = parseUUID(UMBRELLA_NAMESPACE)
  const name = new TextEncoder().encode(oauthUserId)

  // Concatenate namespace and name
  const data = new Uint8Array(namespace.length + name.length)
  data.set(namespace, 0)
  data.set(name, namespace.length)

  // Hash with SHA-1
  const hashBuffer = await crypto.subtle.digest('SHA-1', data)
  const hash = new Uint8Array(hashBuffer)

  // Set version (5) and variant bits
  hash[6] = (hash[6] & 0x0f) | 0x50 // Version 5
  hash[8] = (hash[8] & 0x3f) | 0x80 // Variant 10

  // Format as UUID string
  return formatUUID(hash.slice(0, 16))
}

/**
 * Generate random UUID v4
 * @returns UUID v4 string
 */
export function generateUUIDv4(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16))

  // Set version (4) and variant bits
  bytes[6] = (bytes[6] & 0x0f) | 0x40 // Version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80 // Variant 10

  return formatUUID(bytes)
}

/**
 * Parse UUID string to byte array
 */
function parseUUID(uuid: string): Uint8Array {
  const hex = uuid.replace(/-/g, '')
  const bytes = new Uint8Array(16)

  for (let i = 0; i < 16; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16)
  }

  return bytes
}

/**
 * Format byte array as UUID string
 */
function formatUUID(bytes: Uint8Array): string {
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join('-')
}

/**
 * Validate UUID format
 * @param uuid - UUID string to validate
 * @returns true if valid UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}
