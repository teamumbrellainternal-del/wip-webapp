/**
 * Frontend Error Messages
 * User-friendly error messages for all client-side error scenarios
 *
 * @see docs/ERROR_MESSAGES.md for error message style guide
 */

export interface ErrorMessage {
  title: string
  message: string
  action: string
  code?: string
}

// ============================================================================
// VALIDATION ERRORS
// ============================================================================

export const VALIDATION_ERRORS = {
  // Email validation
  EMAIL_REQUIRED: {
    title: 'Email Required',
    message: 'Email is required',
    action: 'Please enter your email address',
    code: 'EMAIL_REQUIRED',
  },
  EMAIL_INVALID: {
    title: 'Invalid Email',
    message: 'Email format is invalid',
    action: 'Please enter a valid email address (example: you@example.com)',
    code: 'EMAIL_INVALID',
  },

  // Password validation
  PASSWORD_REQUIRED: {
    title: 'Password Required',
    message: 'Password is required',
    action: 'Please enter your password',
    code: 'PASSWORD_REQUIRED',
  },
  PASSWORD_TOO_SHORT: {
    title: 'Password Too Short',
    message: 'Password must be at least 8 characters',
    action: 'Please use a longer password with at least 8 characters',
    code: 'PASSWORD_TOO_SHORT',
  },
  PASSWORD_WEAK: {
    title: 'Weak Password',
    message: 'Password is too weak',
    action: 'Use a mix of letters, numbers, and symbols for better security',
    code: 'PASSWORD_WEAK',
  },

  // Generic field validation
  FIELD_REQUIRED: (field: string): ErrorMessage => ({
    title: 'Field Required',
    message: `${field} is required`,
    action: `Please enter ${field.toLowerCase()}`,
    code: 'FIELD_REQUIRED',
  }),
  FIELD_TOO_LONG: (field: string, max: number, current: number): ErrorMessage => ({
    title: 'Text Too Long',
    message: `${field} must be ${max} characters or less`,
    action: `Please shorten it. Currently: ${current}/${max} characters`,
    code: 'FIELD_TOO_LONG',
  }),
  FIELD_TOO_SHORT: (field: string, min: number): ErrorMessage => ({
    title: 'Text Too Short',
    message: `${field} must be at least ${min} characters`,
    action: `Please add more detail (minimum ${min} characters)`,
    code: 'FIELD_TOO_SHORT',
  }),

  // URL validation
  URL_INVALID: {
    title: 'Invalid URL',
    message: 'Website URL format is invalid',
    action: 'URL must start with http:// or https:// (example: https://example.com)',
    code: 'URL_INVALID',
  },

  // Selection validation
  SELECTION_REQUIRED: (item: string): ErrorMessage => ({
    title: 'Selection Required',
    message: `Please select at least one ${item}`,
    action: `Choose one or more ${item}s from the list`,
    code: 'SELECTION_REQUIRED',
  }),
} as const

// ============================================================================
// AUTHENTICATION ERRORS
// ============================================================================

export const AUTH_ERRORS = {
  SESSION_EXPIRED: {
    title: 'Session Expired',
    message: 'Your session has expired for security',
    action: 'Please log in again to continue',
    code: 'SESSION_EXPIRED',
  },
  INVALID_CREDENTIALS: {
    title: 'Login Failed',
    message: 'Email or password is incorrect',
    action: 'Please check your credentials and try again',
    code: 'INVALID_CREDENTIALS',
  },
  ACCOUNT_LOCKED: {
    title: 'Account Locked',
    message: 'Your account has been temporarily locked',
    action: 'Please try again in 15 minutes or reset your password',
    code: 'ACCOUNT_LOCKED',
  },
  EMAIL_NOT_VERIFIED: {
    title: 'Email Not Verified',
    message: 'Please verify your email address',
    action: 'Check your inbox for a verification link',
    code: 'EMAIL_NOT_VERIFIED',
  },
  NOT_AUTHENTICATED: {
    title: 'Login Required',
    message: 'You must be logged in to access this',
    action: 'Please log in to continue',
    code: 'NOT_AUTHENTICATED',
  },
  CLERK_ERROR: {
    title: 'Authentication Error',
    message: 'Unable to authenticate your session',
    action: 'Please try logging in again',
    code: 'CLERK_ERROR',
  },
} as const

// ============================================================================
// AUTHORIZATION ERRORS
// ============================================================================

export const PERMISSION_ERRORS = {
  NO_PERMISSION: {
    title: 'Access Denied',
    message: "You don't have permission to access this",
    action: 'Contact support if you believe this is a mistake',
    code: 'NO_PERMISSION',
  },
  FEATURE_LOCKED: (feature: string, plan: string): ErrorMessage => ({
    title: 'Feature Locked',
    message: `${feature} is only available on ${plan} plans`,
    action: 'Upgrade your account to access this feature',
    code: 'FEATURE_LOCKED',
  }),
  ADMIN_ONLY: {
    title: 'Admin Only',
    message: 'Only administrators can perform this action',
    action: 'Contact your admin for help',
    code: 'ADMIN_ONLY',
  },
  OWNER_ONLY: {
    title: 'Owner Only',
    message: 'You can only edit your own content',
    action: "You're currently viewing another user's content",
    code: 'OWNER_ONLY',
  },
} as const

// ============================================================================
// NETWORK ERRORS
// ============================================================================

export const NETWORK_ERRORS = {
  OFFLINE: {
    title: 'No Internet',
    message: "You're offline",
    action: 'Please check your internet connection and try again',
    code: 'OFFLINE',
  },
  TIMEOUT: {
    title: 'Connection Timeout',
    message: 'The connection timed out',
    action: 'Please check your internet and try again',
    code: 'TIMEOUT',
  },
  DNS_FAILURE: {
    title: 'Connection Failed',
    message: 'Unable to connect to the server',
    action: 'Please check your internet connection',
    code: 'DNS_FAILURE',
  },
  CONNECTION_REFUSED: {
    title: 'Connection Refused',
    message: 'Unable to reach the server',
    action: 'Please try again in a moment',
    code: 'CONNECTION_REFUSED',
  },
} as const

// ============================================================================
// SERVER ERRORS (5xx)
// ============================================================================

export const SERVER_ERRORS = {
  INTERNAL_ERROR: {
    title: 'Server Error',
    message: 'Something went wrong on our end',
    action: 'Please try again. If this continues, contact support',
    code: 'INTERNAL_ERROR',
  },
  BAD_GATEWAY: {
    title: 'Connection Issue',
    message: "We're experiencing connection issues",
    action: 'Please wait a moment and try again',
    code: 'BAD_GATEWAY',
  },
  SERVICE_UNAVAILABLE: {
    title: 'Service Unavailable',
    message: "We're temporarily down for maintenance",
    action: "We'll be back shortly. Thank you for your patience",
    code: 'SERVICE_UNAVAILABLE',
  },
  GATEWAY_TIMEOUT: {
    title: 'Request Timeout',
    message: 'The request took too long to complete',
    action: 'Please try again with a smaller file or simpler request',
    code: 'GATEWAY_TIMEOUT',
  },
} as const

// ============================================================================
// RESOURCE ERRORS (404, 410)
// ============================================================================

export const RESOURCE_ERRORS = {
  NOT_FOUND: {
    title: 'Not Found',
    message: "We couldn't find what you're looking for",
    action: 'Please check the link and try again',
    code: 'NOT_FOUND',
  },
  PAGE_NOT_FOUND: {
    title: 'Page Not Found',
    message: "This page doesn't exist",
    action: 'It may have been moved or deleted',
    code: 'PAGE_NOT_FOUND',
  },
  CONTENT_DELETED: {
    title: 'Content Removed',
    message: 'This content has been removed by the owner',
    action: 'Return to the previous page',
    code: 'CONTENT_DELETED',
  },
} as const

// ============================================================================
// RATE LIMITING (429)
// ============================================================================

export const RATE_LIMIT_ERRORS = {
  TOO_MANY_REQUESTS: {
    title: 'Too Many Requests',
    message: "You've made too many requests",
    action: 'Please wait a moment and try again',
    code: 'TOO_MANY_REQUESTS',
  },
  TOO_MANY_LOGINS: {
    title: 'Too Many Login Attempts',
    message: 'Too many login attempts detected',
    action: 'Please wait 15 minutes before trying again',
    code: 'TOO_MANY_LOGINS',
  },
  AI_LIMIT_REACHED: {
    title: 'AI Limit Reached',
    message: "You've reached your daily limit for AI requests",
    action: 'Your limit resets tomorrow or upgrade for more requests',
    code: 'AI_LIMIT_REACHED',
  },
  DAILY_LIMIT: (resource: string): ErrorMessage => ({
    title: 'Daily Limit Reached',
    message: `You've reached your daily limit for ${resource}`,
    action: 'Your limit resets tomorrow',
    code: 'DAILY_LIMIT',
  }),
} as const

// ============================================================================
// FILE UPLOAD ERRORS
// ============================================================================

export const FILE_ERRORS = {
  FILE_TOO_LARGE: (maxSize: string): ErrorMessage => ({
    title: 'File Too Large',
    message: 'Your file is too large to upload',
    action: `Please choose a file under ${maxSize}`,
    code: 'FILE_TOO_LARGE',
  }),
  INVALID_FILE_TYPE: (allowed: string): ErrorMessage => ({
    title: 'Invalid File Type',
    message: 'This file type is not supported',
    action: `Please upload ${allowed}`,
    code: 'INVALID_FILE_TYPE',
  }),
  FILE_CORRUPTED: {
    title: 'File Damaged',
    message: 'This file appears to be damaged or corrupted',
    action: 'Please try uploading a different file',
    code: 'FILE_CORRUPTED',
  },
  VIRUS_DETECTED: {
    title: 'Security Warning',
    message: 'This file may contain harmful content',
    action: 'Please scan your file and try a different one',
    code: 'VIRUS_DETECTED',
  },
  NO_STORAGE: {
    title: 'Storage Full',
    message: "You don't have enough storage space",
    action: 'Delete some files or upgrade your plan',
    code: 'NO_STORAGE',
  },
  UPLOAD_FAILED: {
    title: 'Upload Failed',
    message: 'Unable to upload your file',
    action: 'Please check your connection and try again',
    code: 'UPLOAD_FAILED',
  },
} as const

// ============================================================================
// DATA/DATABASE ERRORS
// ============================================================================

export const DATA_ERRORS = {
  DUPLICATE_ENTRY: (item: string): ErrorMessage => ({
    title: 'Already Exists',
    message: `A ${item} with this name already exists`,
    action: 'Please choose a different name',
    code: 'DUPLICATE_ENTRY',
  }),
  IN_USE: {
    title: 'Cannot Delete',
    message: 'This item is being used and cannot be deleted',
    action: 'Please remove its dependencies first',
    code: 'IN_USE',
  },
  REQUIRED_FIELDS: {
    title: 'Missing Information',
    message: 'All required fields must be filled in',
    action: 'Please complete the form',
    code: 'REQUIRED_FIELDS',
  },
  INVALID_DATA: {
    title: 'Invalid Data',
    message: 'The data you entered is invalid',
    action: 'Please check your input and try again',
    code: 'INVALID_DATA',
  },
} as const

// ============================================================================
// FEATURE-SPECIFIC ERRORS
// ============================================================================

export const ONBOARDING_ERRORS = {
  STEP_INCOMPLETE: (step: number): ErrorMessage => ({
    title: 'Step Incomplete',
    message: `Please complete step ${step} before continuing`,
    action: 'Fill in all required fields',
    code: 'STEP_INCOMPLETE',
  }),
  INVALID_ARTIST_TYPE: {
    title: 'Artist Type Required',
    message: 'Please select your artist type',
    action: 'Choose either Solo Artist or Band',
    code: 'INVALID_ARTIST_TYPE',
  },
}

export const PROFILE_ERRORS = {
  SAVE_FAILED: {
    title: 'Save Failed',
    message: 'Unable to save your profile changes',
    action: 'Please try again. If this continues, contact support',
    code: 'PROFILE_SAVE_FAILED',
  },
  LOAD_FAILED: {
    title: 'Load Failed',
    message: 'Unable to load your profile',
    action: 'Please refresh the page',
    code: 'PROFILE_LOAD_FAILED',
  },
  AVATAR_UPLOAD_FAILED: {
    title: 'Upload Failed',
    message: 'Unable to upload your avatar',
    action: 'Please try a different image or try again later',
    code: 'AVATAR_UPLOAD_FAILED',
  },
}

export const MARKETPLACE_ERRORS = {
  APPLY_FAILED: {
    title: 'Application Failed',
    message: 'Unable to submit your application',
    action: 'Please try again',
    code: 'GIG_APPLY_FAILED',
  },
  SEARCH_FAILED: {
    title: 'Search Failed',
    message: 'Unable to search at this time',
    action: 'Please try again in a moment',
    code: 'SEARCH_FAILED',
  },
  LOAD_MORE_FAILED: {
    title: 'Load Failed',
    message: 'Unable to load more results',
    action: 'Please try again',
    code: 'LOAD_MORE_FAILED',
  },
}

export const MESSAGING_ERRORS = {
  SEND_FAILED: {
    title: 'Send Failed',
    message: 'Unable to send your message',
    action: 'Please check your connection and try again',
    code: 'MESSAGE_SEND_FAILED',
  },
  LOAD_FAILED: {
    title: 'Load Failed',
    message: 'Unable to load messages',
    action: 'Please refresh the page',
    code: 'MESSAGES_LOAD_FAILED',
  },
  CONVERSATION_CREATE_FAILED: {
    title: 'Create Failed',
    message: 'Unable to create conversation',
    action: 'Please try again',
    code: 'CONVERSATION_CREATE_FAILED',
  },
}

export const VIOLET_ERRORS = {
  PROMPT_FAILED: {
    title: 'AI Request Failed',
    message: 'Unable to process your AI request',
    action: 'Please try again. If this continues, contact support',
    code: 'VIOLET_PROMPT_FAILED',
  },
  LIMIT_REACHED: {
    title: 'AI Limit Reached',
    message: "You've used all your AI requests for today",
    action: 'Your limit resets tomorrow or upgrade for more requests',
    code: 'VIOLET_LIMIT_REACHED',
  },
  PROMPT_TOO_LONG: (max: number): ErrorMessage => ({
    title: 'Prompt Too Long',
    message: `Your prompt is too long (max ${max} characters)`,
    action: 'Please shorten your prompt and try again',
    code: 'VIOLET_PROMPT_TOO_LONG',
  }),
}

export const BROADCAST_ERRORS = {
  SEND_FAILED: {
    title: 'Send Failed',
    message: 'Unable to send your broadcast',
    action: 'Please try again',
    code: 'BROADCAST_SEND_FAILED',
  },
  NO_RECIPIENTS: {
    title: 'No Recipients',
    message: 'Please select at least one recipient list',
    action: 'Choose who should receive this message',
    code: 'BROADCAST_NO_RECIPIENTS',
  },
  DRAFT_SAVE_FAILED: {
    title: 'Save Failed',
    message: 'Unable to save your draft',
    action: 'Please try again',
    code: 'BROADCAST_DRAFT_FAILED',
  },
}

export const JOURNAL_ERRORS = {
  SAVE_FAILED: {
    title: 'Save Failed',
    message: 'Unable to save your journal entry',
    action: 'Please try again. Your work is saved locally',
    code: 'JOURNAL_SAVE_FAILED',
  },
  LOAD_FAILED: {
    title: 'Load Failed',
    message: 'Unable to load your journal entries',
    action: 'Please refresh the page',
    code: 'JOURNAL_LOAD_FAILED',
  },
  AUTO_SAVE_FAILED: {
    title: 'Auto-Save Failed',
    message: 'Unable to auto-save your changes',
    action: 'Please save manually or check your connection',
    code: 'JOURNAL_AUTO_SAVE_FAILED',
  },
}

// ============================================================================
// GENERIC ERRORS (Fallbacks)
// ============================================================================

export const GENERIC_ERRORS = {
  UNKNOWN: {
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred',
    action: 'Please try again. If this continues, contact support',
    code: 'UNKNOWN_ERROR',
  },
  OPERATION_FAILED: (operation: string): ErrorMessage => ({
    title: 'Operation Failed',
    message: `Unable to ${operation}`,
    action: 'Please try again',
    code: 'OPERATION_FAILED',
  }),
} as const

// ============================================================================
// ERROR MESSAGE HELPERS
// ============================================================================

/**
 * Get error message from HTTP status code
 */
export function getErrorFromStatus(status: number): ErrorMessage {
  switch (status) {
    case 400:
      return {
        title: 'Invalid Request',
        message: 'The request was invalid',
        action: 'Please check your input and try again',
        code: 'BAD_REQUEST',
      }
    case 401:
      return AUTH_ERRORS.NOT_AUTHENTICATED
    case 403:
      return PERMISSION_ERRORS.NO_PERMISSION
    case 404:
      return RESOURCE_ERRORS.NOT_FOUND
    case 429:
      return RATE_LIMIT_ERRORS.TOO_MANY_REQUESTS
    case 500:
      return SERVER_ERRORS.INTERNAL_ERROR
    case 502:
      return SERVER_ERRORS.BAD_GATEWAY
    case 503:
      return SERVER_ERRORS.SERVICE_UNAVAILABLE
    case 504:
      return SERVER_ERRORS.GATEWAY_TIMEOUT
    default:
      return GENERIC_ERRORS.UNKNOWN
  }
}

/**
 * Convert Error object to ErrorMessage
 */
export function errorToMessage(error: unknown, fallback?: ErrorMessage): ErrorMessage {
  if (!error) return fallback || GENERIC_ERRORS.UNKNOWN

  // If it's already an ErrorMessage
  if (typeof error === 'object' && 'title' in error && 'message' in error) {
    return error as ErrorMessage
  }

  // If it's a standard Error
  if (error instanceof Error) {
    return {
      title: 'Error',
      message: error.message,
      action: 'Please try again',
      code: error.name,
    }
  }

  // If it's a string
  if (typeof error === 'string') {
    return {
      title: 'Error',
      message: error,
      action: 'Please try again',
    }
  }

  return fallback || GENERIC_ERRORS.UNKNOWN
}

/**
 * Format error for toast notification
 */
export function formatErrorForToast(error: ErrorMessage): string {
  return `${error.message}. ${error.action}`
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('network') ||
      error.message.includes('fetch') ||
      error.message.includes('timeout') ||
      error.name === 'NetworkError'
    )
  }
  return false
}

/**
 * Check if error is an auth error
 */
export function isAuthError(error: unknown): boolean {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as { code: string }).code
    return code.includes('AUTH') || code.includes('SESSION')
  }
  return false
}
