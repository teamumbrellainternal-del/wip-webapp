/**
 * Secret data models
 * For encrypted secret storage in KV
 */

/**
 * Secret record stored in KV
 */
export interface SecretRecord {
  secret_id: string // UUID v4
  user_uuid: string // Owner
  name: string // Secret identifier (e.g., "openai_api_key")
  encrypted_value: string // Base64-encoded AES-256-GCM ciphertext
  nonce: string // Base64-encoded nonce (96 bits)
  encryption_version: number // Always 1 for v0.1.0
  version: number // Increments on update
  created_at: string // ISO 8601 timestamp
  updated_at: string // Last modification time
  last_accessed: string | null // Last retrieval time (for audit)
}

/**
 * Secret metadata (without plaintext value)
 */
export interface SecretMetadata {
  name: string
  created_at: string
  updated_at: string
  version: number
}

/**
 * Secret with plaintext value (for CLI sync)
 */
export interface SecretWithValue {
  name: string
  value: string // Decrypted plaintext
  version: number
  created_at: string
}

/**
 * Secret creation input
 */
export interface CreateSecretInput {
  name: string
  value: string // Plaintext value to encrypt
}

/**
 * Secret update input
 */
export interface UpdateSecretInput {
  value: string // New plaintext value
}

/**
 * Validate secret name format
 * Rules: alphanumeric, underscore, hyphen only; 1-64 characters
 */
export function isValidSecretName(name: string): boolean {
  return /^[a-zA-Z0-9_-]{1,64}$/.test(name)
}

/**
 * Validate secret value length
 * Rules: 1 byte - 10KB
 */
export function isValidSecretValue(value: string): boolean {
  const bytes = new TextEncoder().encode(value).length
  return bytes >= 1 && bytes <= 10240
}
