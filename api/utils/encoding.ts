/**
 * Base64URL encoding utilities for JWT
 * Implements RFC 4648 base64url encoding (URL-safe base64)
 */

/**
 * Encode data to base64url format
 * @param data - ArrayBuffer or Uint8Array to encode
 * @returns Base64url-encoded string (URL-safe, no padding)
 */
export function base64UrlEncode(data: ArrayBuffer | Uint8Array): string {
  const bytes = data instanceof ArrayBuffer ? new Uint8Array(data) : data

  // Convert to regular base64
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  const base64 = btoa(binary)

  // Convert to base64url (URL-safe)
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

/**
 * Decode base64url format to Uint8Array
 * @param base64url - Base64url-encoded string
 * @returns Decoded data as Uint8Array
 */
export function base64UrlDecode(base64url: string): Uint8Array {
  // Convert base64url to regular base64
  let base64 = base64url
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  // Add padding if needed
  while (base64.length % 4 !== 0) {
    base64 += '='
  }

  // Decode from base64
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }

  return bytes
}
