/**
 * Secrets service
 * Handles encrypted secret storage and retrieval in KV
 */

import type { Env } from '../middleware/auth'
import type {
  SecretRecord,
  SecretMetadata,
  SecretWithValue,
  CreateSecretInput,
  UpdateSecretInput,
} from '../models/secret'
import { isValidSecretName, isValidSecretValue } from '../models/secret'
import { encryptSecret, decryptSecret } from '../utils/crypto'
import { generateUUIDv4 } from '../utils/uuid'

/**
 * List all secrets for a user (metadata only by default)
 */
export async function listSecrets(
  env: Env,
  userUuid: string,
  includeValues: boolean = false
): Promise<SecretMetadata[] | SecretWithValue[]> {
  const prefix = `secrets:${userUuid}:`

  // List all keys with this prefix
  const keys = await env.LEGER_SECRETS.list({ prefix })

  if (keys.keys.length === 0) {
    return []
  }

  // Fetch all secrets in parallel
  const secrets = await Promise.all(
    keys.keys.map(async (key) => {
      const record = await env.LEGER_SECRETS.get(key.name, 'json')
      return record as SecretRecord | null
    })
  )

  // Filter out nulls and format response
  const validSecrets = secrets.filter((s): s is SecretRecord => s !== null)

  if (includeValues) {
    // Decrypt values for CLI
    return await Promise.all(
      validSecrets.map(async (secret) => {
        const value = await decryptSecret(
          {
            encrypted_value: secret.encrypted_value,
            nonce: secret.nonce,
            encryption_version: secret.encryption_version,
          },
          env.ENCRYPTION_KEY
        )

        return {
          name: secret.name,
          value,
          version: secret.version,
          created_at: secret.created_at,
        }
      })
    )
  } else {
    // Return metadata only for web UI
    return validSecrets.map((secret) => ({
      name: secret.name,
      created_at: secret.created_at,
      updated_at: secret.updated_at,
      version: secret.version,
    }))
  }
}

/**
 * Get single secret by name
 */
export async function getSecret(
  env: Env,
  userUuid: string,
  secretName: string,
  includeValue: boolean = false
): Promise<SecretMetadata | SecretWithValue | null> {
  const kvKey = `secrets:${userUuid}:${secretName}`
  const record = await env.LEGER_SECRETS.get(kvKey, 'json')

  if (!record) {
    return null
  }

  const secret = record as SecretRecord

  // Update last accessed timestamp
  secret.last_accessed = new Date().toISOString()
  await env.LEGER_SECRETS.put(kvKey, JSON.stringify(secret))

  if (includeValue) {
    const value = await decryptSecret(
      {
        encrypted_value: secret.encrypted_value,
        nonce: secret.nonce,
        encryption_version: secret.encryption_version,
      },
      env.ENCRYPTION_KEY
    )

    return {
      name: secret.name,
      value,
      version: secret.version,
      created_at: secret.created_at,
    }
  } else {
    return {
      name: secret.name,
      created_at: secret.created_at,
      updated_at: secret.updated_at,
      version: secret.version,
    }
  }
}

/**
 * Create or update secret
 */
export async function upsertSecret(
  env: Env,
  userUuid: string,
  input: CreateSecretInput | UpdateSecretInput,
  secretName?: string
): Promise<SecretMetadata> {
  // Validate secret name
  const name = secretName || (input as CreateSecretInput).name
  if (!isValidSecretName(name)) {
    throw new Error(
      'Invalid secret name. Must be alphanumeric with underscores/hyphens, 1-64 characters'
    )
  }

  // Validate secret value
  if (!isValidSecretValue(input.value)) {
    throw new Error('Invalid secret value. Must be between 1 byte and 10KB')
  }

  // Check if secret exists
  const kvKey = `secrets:${userUuid}:${name}`
  const existing = await env.LEGER_SECRETS.get(kvKey, 'json')

  const now = new Date().toISOString()

  let secret: SecretRecord

  if (existing) {
    // Update existing secret
    const existingRecord = existing as SecretRecord

    const encrypted = await encryptSecret(input.value, env.ENCRYPTION_KEY)

    secret = {
      ...existingRecord,
      encrypted_value: encrypted.encrypted_value,
      nonce: encrypted.nonce,
      version: existingRecord.version + 1,
      updated_at: now,
      last_accessed: null,
    }
  } else {
    // Create new secret
    const encrypted = await encryptSecret(input.value, env.ENCRYPTION_KEY)

    secret = {
      secret_id: generateUUIDv4(),
      user_uuid: userUuid,
      name,
      encrypted_value: encrypted.encrypted_value,
      nonce: encrypted.nonce,
      encryption_version: 1,
      version: 1,
      created_at: now,
      updated_at: now,
      last_accessed: null,
    }
  }

  // Store in KV
  await env.LEGER_SECRETS.put(kvKey, JSON.stringify(secret))

  return {
    name: secret.name,
    created_at: secret.created_at,
    updated_at: secret.updated_at,
    version: secret.version,
  }
}

/**
 * Delete secret
 */
export async function deleteSecret(
  env: Env,
  userUuid: string,
  secretName: string
): Promise<boolean> {
  const kvKey = `secrets:${userUuid}:${secretName}`

  // Check if exists
  const existing = await env.LEGER_SECRETS.get(kvKey)
  if (!existing) {
    return false
  }

  // Delete from KV
  await env.LEGER_SECRETS.delete(kvKey)

  return true
}
