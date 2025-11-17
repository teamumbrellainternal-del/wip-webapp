/**
 * Input sanitization utilities
 * Prevents XSS, injection attacks, and path traversal
 */

/**
 * Sanitize and validate email address
 * @param email - Email address to sanitize
 * @returns Normalized email or null if invalid
 */
export function sanitizeEmail(email: string | null | undefined): string | null {
  if (!email || typeof email !== 'string') {
    return null
  }

  // Trim and lowercase
  const normalized = email.trim().toLowerCase()

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(normalized)) {
    return null
  }

  // Check for common XSS patterns
  if (normalized.includes('<') || normalized.includes('>') || normalized.includes('script')) {
    return null
  }

  // Length check (RFC 5321: max 320 characters)
  if (normalized.length > 320) {
    return null
  }

  return normalized
}

/**
 * Sanitize and validate phone number (E.164 format)
 * @param phone - Phone number to sanitize
 * @returns Normalized phone number or null if invalid
 */
export function sanitizePhone(phone: string | null | undefined): string | null {
  if (!phone || typeof phone !== 'string') {
    return null
  }

  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '')

  // E.164 format: +[country code][number], max 15 digits
  const e164Regex = /^\+\d{1,15}$/

  if (!e164Regex.test(cleaned)) {
    // Try to add + if missing
    const withPlus = '+' + cleaned.replace(/^\+/, '')
    if (e164Regex.test(withPlus)) {
      return withPlus
    }
    return null
  }

  return cleaned
}

/**
 * Sanitize and validate URL
 * Prevents javascript: protocol and other XSS vectors
 * @param url - URL to sanitize
 * @returns Sanitized URL or null if invalid
 */
export function sanitizeURL(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') {
    return null
  }

  const trimmed = url.trim()

  // Check length
  if (trimmed.length > 2048) {
    return null
  }

  try {
    const parsed = new URL(trimmed)

    // Only allow http, https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null
    }

    // Prevent javascript: protocol and data: URIs
    if (
      trimmed.toLowerCase().includes('javascript:') ||
      trimmed.toLowerCase().includes('data:') ||
      trimmed.toLowerCase().includes('vbscript:')
    ) {
      return null
    }

    return parsed.toString()
  } catch {
    return null
  }
}

/**
 * Sanitize filename to prevent path traversal attacks
 * Removes ../, ..\, and other dangerous characters
 * @param filename - Filename to sanitize
 * @returns Sanitized filename or null if invalid
 */
export function sanitizeFilename(filename: string | null | undefined): string | null {
  if (!filename || typeof filename !== 'string') {
    return null
  }

  // Remove leading/trailing whitespace
  let sanitized = filename.trim()

  // Remove path traversal patterns
  sanitized = sanitized.replace(/\.\.[/\\]/g, '')
  sanitized = sanitized.replace(/\.\./g, '')

  // Remove path separators at the start
  sanitized = sanitized.replace(/^[/\\]+/, '')

  // Remove null bytes
  sanitized = sanitized.replace(/\x00/g, '')

  // Remove dangerous characters
  sanitized = sanitized.replace(/[<>:"|?*]/g, '')

  // Check if filename is empty after sanitization
  if (sanitized.length === 0) {
    return null
  }

  // Check length (255 is typical filesystem limit)
  if (sanitized.length > 255) {
    return null
  }

  // Prevent reserved filenames on Windows
  const reserved = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9']
  const nameWithoutExt = sanitized.split('.')[0].toUpperCase()
  if (reserved.includes(nameWithoutExt)) {
    return null
  }

  return sanitized
}

/**
 * Validate and sanitize file MIME type
 * Checks against allowed types and prevents executable uploads
 * @param mimeType - MIME type to validate
 * @param allowedTypes - Array of allowed MIME types (optional)
 * @returns true if valid, false otherwise
 */
export function validateMimeType(
  mimeType: string | null | undefined,
  allowedTypes?: string[]
): boolean {
  if (!mimeType || typeof mimeType !== 'string') {
    return false
  }

  const normalized = mimeType.toLowerCase().trim()

  // Block executable types
  const dangerousTypes = [
    'application/x-msdownload', // .exe
    'application/x-msdos-program',
    'application/x-executable',
    'application/x-sh', // shell scripts
    'application/x-bat',
    'application/x-cmd',
    'text/x-shellscript',
    'application/vnd.microsoft.portable-executable',
  ]

  if (dangerousTypes.some(type => normalized.includes(type))) {
    return false
  }

  // If allowed types specified, check against them
  if (allowedTypes && allowedTypes.length > 0) {
    return allowedTypes.some(type => normalized === type.toLowerCase())
  }

  // Basic MIME type format validation
  const mimeRegex = /^[\w-]+\/[\w-+.]+$/
  return mimeRegex.test(normalized)
}

/**
 * Validate file extension
 * Prevents dangerous executable extensions
 * @param filename - Filename to check
 * @returns true if safe, false if dangerous
 */
export function validateFileExtension(filename: string | null | undefined): boolean {
  if (!filename || typeof filename !== 'string') {
    return false
  }

  const normalized = filename.toLowerCase()

  // Block dangerous extensions
  const dangerousExtensions = [
    '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jse',
    '.wsf', '.wsh', '.msi', '.msp', '.cpl', '.jar', '.app', '.deb', '.rpm',
    '.dmg', '.pkg', '.sh', '.bash', '.run', '.bin', '.ps1', '.psm1',
  ]

  return !dangerousExtensions.some(ext => normalized.endsWith(ext))
}

/**
 * Check file magic bytes to verify true file type
 * @param arrayBuffer - File contents as ArrayBuffer
 * @param expectedMimeType - Expected MIME type
 * @returns true if magic bytes match expected type
 */
export function validateFileMagicBytes(
  arrayBuffer: ArrayBuffer,
  expectedMimeType: string
): boolean {
  const bytes = new Uint8Array(arrayBuffer.slice(0, 16))

  // Common file signatures (magic bytes)
  const signatures: Record<string, number[][]> = {
    'image/jpeg': [[0xFF, 0xD8, 0xFF]],
    'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
    'image/gif': [[0x47, 0x49, 0x46, 0x38]], // GIF87a or GIF89a
    'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF
    'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
    'audio/mpeg': [[0xFF, 0xFB], [0xFF, 0xF3], [0xFF, 0xF2], [0x49, 0x44, 0x33]], // MP3 or ID3
    'audio/mp4': [[0x66, 0x74, 0x79, 0x70]], // ftyp
    'video/mp4': [[0x66, 0x74, 0x79, 0x70]], // ftyp
    'audio/wav': [[0x52, 0x49, 0x46, 0x46]], // RIFF
    'audio/x-wav': [[0x52, 0x49, 0x46, 0x46]], // RIFF
  }

  const expectedSignatures = signatures[expectedMimeType.toLowerCase()]
  if (!expectedSignatures) {
    // If we don't have signature for this type, we can't verify
    // Return true to not block unknown types
    return true
  }

  // Check if any of the expected signatures match
  return expectedSignatures.some(signature => {
    return signature.every((byte, index) => bytes[index] === byte)
  })
}

/**
 * Sanitize HTML content (for rich text)
 * Removes script tags and dangerous attributes
 * @param html - HTML content to sanitize
 * @returns Sanitized HTML
 */
export function sanitizeHTML(html: string | null | undefined): string {
  if (!html || typeof html !== 'string') {
    return ''
  }

  let sanitized = html

  // Remove script tags
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')

  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '')

  // Remove javascript: protocol in hrefs
  sanitized = sanitized.replace(/href\s*=\s*["']?\s*javascript:/gi, 'href="#"')

  // Remove data: URIs (can be used for XSS)
  sanitized = sanitized.replace(/src\s*=\s*["']?\s*data:/gi, 'src="#"')

  // Remove iframe tags
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')

  // Remove object and embed tags
  sanitized = sanitized.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
  sanitized = sanitized.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')

  return sanitized
}

/**
 * Sanitize user input for storage
 * General-purpose sanitization for text inputs
 * @param input - User input to sanitize
 * @param maxLength - Maximum allowed length
 * @returns Sanitized input
 */
export function sanitizeInput(
  input: string | null | undefined,
  maxLength: number = 10000
): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  // Trim whitespace
  let sanitized = input.trim()

  // Remove null bytes
  sanitized = sanitized.replace(/\x00/g, '')

  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength)
  }

  return sanitized
}
