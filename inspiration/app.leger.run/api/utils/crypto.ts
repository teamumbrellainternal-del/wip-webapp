/**
 * AES-256-GCM encryption utilities for secret management
 * Uses Web Crypto API for secure encryption
 */

import { base64UrlEncode, base64UrlDecode } from './encoding'

export interface EncryptedData {
  encrypted_value: string // Base64-encoded ciphertext
  nonce: string // Base64-encoded nonce (96 bits)
  encryption_version: number // Always 1 for v0.1.0
}

/**
 * Encrypt plaintext using AES-256-GCM
 * @param plaintext - The secret value to encrypt
 * @param masterKey - Base64-encoded 256-bit master key
 * @returns Encrypted data with nonce
 */
export async function encryptSecret(
  plaintext: string,
  masterKey: string
): Promise<EncryptedData> {
  // Import master key
  const keyData = base64UrlDecode(masterKey)
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    'AES-GCM',
    false,
    ['encrypt']
  )

  // Generate random nonce (96 bits)
  const nonce = crypto.getRandomValues(new Uint8Array(12))

  // Encrypt data
  const data = new TextEncoder().encode(plaintext)
  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: nonce,
    },
    key,
    data
  )

  return {
    encrypted_value: base64UrlEncode(encrypted),
    nonce: base64UrlEncode(nonce.buffer),
    encryption_version: 1,
  }
}

/**
 * Decrypt ciphertext using AES-256-GCM
 * @param encryptedData - The encrypted data with nonce
 * @param masterKey - Base64-encoded 256-bit master key
 * @returns Decrypted plaintext
 */
export async function decryptSecret(
  encryptedData: EncryptedData,
  masterKey: string
): Promise<string> {
  // Import master key
  const keyData = base64UrlDecode(masterKey)
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    'AES-GCM',
    false,
    ['decrypt']
  )

  // Decrypt data
  const nonce = base64UrlDecode(encryptedData.nonce)
  const ciphertext = base64UrlDecode(encryptedData.encrypted_value)

  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: nonce,
    },
    key,
    ciphertext
  )

  return new TextDecoder().decode(decrypted)
}

/**
 * Generate a random 256-bit encryption key (for setup/testing)
 * @returns Base64-encoded 256-bit key
 */
export async function generateMasterKey(): Promise<string> {
  const key = await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  )

  const exported = await crypto.subtle.exportKey('raw', key)
  return base64UrlEncode(exported)
}
