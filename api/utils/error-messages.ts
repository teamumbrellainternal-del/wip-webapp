/**
 * Backend Error Messages
 * User-friendly error messages for API responses
 *
 * @see docs/ERROR_MESSAGES.md for error message style guide
 * @see api/utils/errors.ts for error classes
 *
 * Usage:
 *   throw new ValidationError(ERROR_MESSAGES.VALIDATION.EMAIL_REQUIRED)
 *   throw new AuthenticationError(ERROR_MESSAGES.AUTH.SESSION_EXPIRED)
 */

export const ERROR_MESSAGES = {
  // ============================================================================
  // VALIDATION ERRORS (400)
  // ============================================================================
  VALIDATION: {
    // Generic validation
    INVALID_REQUEST: 'The request was invalid. Please check your input and try again',
    MISSING_FIELDS: 'All required fields must be filled in',
    INVALID_FORMAT: 'The data format is invalid. Please check your input',

    // Email validation
    EMAIL_REQUIRED: 'Email is required',
    EMAIL_INVALID: 'Email format is invalid. Please enter a valid email address',
    EMAIL_EXISTS: 'An account with this email already exists',

    // Password validation
    PASSWORD_REQUIRED: 'Password is required',
    PASSWORD_TOO_SHORT: 'Password must be at least 8 characters',
    PASSWORD_TOO_WEAK: 'Password is too weak. Use a mix of letters, numbers, and symbols',

    // ID validation
    INVALID_ID: 'The provided ID is invalid',
    INVALID_UUID: 'The provided ID format is invalid',

    // URL validation
    INVALID_URL: 'URL format is invalid. Must start with http:// or https://',

    // File validation
    FILE_REQUIRED: 'File is required',
    INVALID_FILE_TYPE: 'This file type is not supported',
    FILE_TOO_LARGE: 'File is too large. Maximum size is',
    FILE_EMPTY: 'File is empty or corrupted',

    // Data limits
    TEXT_TOO_LONG: 'Text exceeds maximum length',
    TEXT_TOO_SHORT: 'Text is below minimum length',
    ARRAY_TOO_LARGE: 'Too many items provided. Maximum is',
    ARRAY_EMPTY: 'At least one item is required',

    // Business logic validation
    DUPLICATE_ENTRY: 'An entry with this name already exists',
    INVALID_OPERATION: 'This operation is not allowed in the current state',
    INVALID_RANGE: 'Value is outside the allowed range',
  },

  // ============================================================================
  // AUTHENTICATION ERRORS (401)
  // ============================================================================
  AUTH: {
    NOT_AUTHENTICATED: 'You must be logged in to access this',
    SESSION_EXPIRED: 'Your session has expired. Please log in again',
    INVALID_TOKEN: 'Your authentication token is invalid. Please log in again',
    TOKEN_EXPIRED: 'Your authentication token has expired. Please log in again',
    INVALID_CREDENTIALS: 'Email or password is incorrect',
    ACCOUNT_LOCKED: 'Your account has been temporarily locked. Please try again later',
    ACCOUNT_DISABLED: 'Your account has been disabled. Contact support for help',
    EMAIL_NOT_VERIFIED: 'Please verify your email address before continuing',
    CLERK_ERROR: 'Unable to authenticate your session. Please try logging in again',
  },

  // ============================================================================
  // AUTHORIZATION ERRORS (403)
  // ============================================================================
  PERMISSION: {
    NO_PERMISSION: "You don't have permission to access this",
    INSUFFICIENT_PERMISSIONS: "You don't have the required permissions for this action",
    ADMIN_ONLY: 'Only administrators can perform this action',
    OWNER_ONLY: 'You can only modify your own content',
    FEATURE_LOCKED: 'This feature is not available on your current plan',
    SUBSCRIPTION_REQUIRED: 'This feature requires an active subscription',
    VERIFICATION_REQUIRED: 'You must verify your account to use this feature',
  },

  // ============================================================================
  // NOT FOUND ERRORS (404)
  // ============================================================================
  NOT_FOUND: {
    RESOURCE: "We couldn't find what you're looking for",
    USER: 'User not found',
    PROFILE: 'Profile not found',
    GIG: 'Gig not found',
    ARTIST: 'Artist not found',
    MESSAGE: 'Message not found',
    CONVERSATION: 'Conversation not found',
    FILE: 'File not found',
    JOURNAL_ENTRY: 'Journal entry not found',
    CONTACT_LIST: 'Contact list not found',
    BROADCAST: 'Broadcast not found',
    ENDPOINT: 'This endpoint does not exist',
  },

  // ============================================================================
  // RATE LIMITING ERRORS (429)
  // ============================================================================
  RATE_LIMIT: {
    TOO_MANY_REQUESTS: "You've made too many requests. Please wait a moment and try again",
    TOO_MANY_LOGINS: 'Too many login attempts. Please wait 15 minutes before trying again',
    AI_LIMIT_REACHED: "You've reached your daily limit for AI requests",
    UPLOAD_LIMIT: "You've reached your upload limit for today",
    API_LIMIT: "You've exceeded the API rate limit. Please try again later",
  },

  // ============================================================================
  // SERVER ERRORS (500)
  // ============================================================================
  SERVER: {
    INTERNAL_ERROR: 'Something went wrong on our end. Please try again',
    DATABASE_ERROR: 'A database error occurred. Please try again',
    STORAGE_ERROR: 'A storage error occurred. Please try again',
    EXTERNAL_API_ERROR: 'An external service is unavailable. Please try again later',
    CONFIG_ERROR: 'A configuration error occurred. Please contact support',
  },

  // ============================================================================
  // SERVICE UNAVAILABLE ERRORS (503)
  // ============================================================================
  UNAVAILABLE: {
    SERVICE_DOWN: "We're temporarily down for maintenance. We'll be back shortly",
    FEATURE_DISABLED: 'This feature is temporarily disabled',
    MAINTENANCE_MODE: "We're performing maintenance. Please check back soon",
  },

  // ============================================================================
  // DATABASE-SPECIFIC ERRORS
  // ============================================================================
  DATABASE: {
    FOREIGN_KEY: 'This item is being used and cannot be deleted. Please remove its dependencies first',
    UNIQUE_CONSTRAINT: 'An item with this value already exists. Please use a different value',
    NOT_NULL: 'Required field is missing',
    TRANSACTION_FAILED: 'The operation could not be completed. Please try again',
    CONNECTION_ERROR: 'Unable to connect to the database. Please try again',
  },

  // ============================================================================
  // FEATURE-SPECIFIC ERRORS
  // ============================================================================
  ONBOARDING: {
    STEP_INCOMPLETE: 'Please complete this step before continuing',
    INVALID_ARTIST_TYPE: 'Please select a valid artist type',
    ALREADY_COMPLETED: 'You have already completed onboarding',
    INVALID_STEP: 'Invalid onboarding step',
  },

  PROFILE: {
    SAVE_FAILED: 'Unable to save your profile. Please try again',
    LOAD_FAILED: 'Unable to load profile data. Please refresh the page',
    UPDATE_FAILED: 'Unable to update your profile. Please try again',
    AVATAR_UPLOAD_FAILED: 'Unable to upload avatar. Please try a different image',
    BANNER_UPLOAD_FAILED: 'Unable to upload banner. Please try a different image',
  },

  MARKETPLACE: {
    SEARCH_FAILED: 'Unable to search at this time. Please try again',
    APPLY_FAILED: 'Unable to submit your application. Please try again',
    ALREADY_APPLIED: 'You have already applied to this gig',
    GIG_CLOSED: 'This gig is no longer accepting applications',
    INSUFFICIENT_PROFILE: 'Please complete your profile before applying to gigs',
  },

  MESSAGING: {
    SEND_FAILED: 'Unable to send your message. Please check your connection and try again',
    CONVERSATION_NOT_FOUND: 'Conversation not found',
    CONVERSATION_CREATE_FAILED: 'Unable to create conversation. Please try again',
    MESSAGE_TOO_LONG: 'Message is too long. Please keep it under 5000 characters',
    BLOCKED_USER: 'You cannot message this user',
  },

  FILES: {
    UPLOAD_FAILED: 'Unable to upload file. Please try again',
    DELETE_FAILED: 'Unable to delete file. Please try again',
    FILE_TOO_LARGE: 'File is too large. Maximum size is 50 MB',
    INVALID_FILE_TYPE: 'This file type is not supported. Please upload JPG, PNG, PDF, or MP3 files',
    STORAGE_FULL: "You don't have enough storage space. Delete some files or upgrade your plan",
    VIRUS_DETECTED: 'This file may contain harmful content and cannot be uploaded',
    SIGNED_URL_EXPIRED: 'Upload link has expired. Please request a new one',
  },

  TRACKS: {
    UPLOAD_FAILED: 'Unable to upload track. Please try again',
    DELETE_FAILED: 'Unable to delete track. Please try again',
    UPDATE_FAILED: 'Unable to update track. Please try again',
    INVALID_AUDIO_FORMAT: 'Invalid audio format. Please upload MP3, WAV, or FLAC files',
    TRACK_TOO_LARGE: 'Track file is too large. Maximum size is 200 MB',
  },

  VIOLET: {
    PROMPT_FAILED: 'Unable to process your AI request. Please try again',
    PROMPT_TOO_LONG: 'Your prompt is too long. Please shorten it and try again',
    LIMIT_REACHED: "You've used all your AI requests for today. Your limit resets tomorrow",
    INVALID_PROMPT: 'Your prompt contains invalid content. Please revise and try again',
    AI_UNAVAILABLE: 'The AI service is temporarily unavailable. Please try again later',
  },

  BROADCAST: {
    SEND_FAILED: 'Unable to send your broadcast. Please try again',
    NO_RECIPIENTS: 'Please select at least one recipient list',
    MESSAGE_TOO_LONG: 'Message is too long. Please keep it under 1000 characters',
    DRAFT_SAVE_FAILED: 'Unable to save your draft. Please try again',
    INVALID_TEMPLATE: 'Invalid message template',
  },

  JOURNAL: {
    SAVE_FAILED: 'Unable to save your journal entry. Please try again',
    LOAD_FAILED: 'Unable to load journal entries. Please refresh the page',
    DELETE_FAILED: 'Unable to delete journal entry. Please try again',
    ENTRY_TOO_LARGE: 'Journal entry is too large. Please reduce the content',
  },

  CONTACTS: {
    LIST_CREATE_FAILED: 'Unable to create contact list. Please try again',
    LIST_UPDATE_FAILED: 'Unable to update contact list. Please try again',
    LIST_DELETE_FAILED: 'Unable to delete contact list. Please try again',
    DUPLICATE_LIST_NAME: 'A contact list with this name already exists',
  },

  ANALYTICS: {
    LOAD_FAILED: 'Unable to load analytics data. Please refresh the page',
    INVALID_DATE_RANGE: 'Invalid date range. Please select a valid range',
    DATA_NOT_AVAILABLE: 'Analytics data is not available for this period',
  },

  // ============================================================================
  // PAYMENT ERRORS (if applicable)
  // ============================================================================
  PAYMENT: {
    PAYMENT_FAILED: 'Payment failed. Please check your payment method and try again',
    CARD_DECLINED: 'Your payment was declined. Please try a different card',
    INSUFFICIENT_FUNDS: 'Payment failed due to insufficient funds',
    CARD_EXPIRED: 'Your card has expired. Please update your payment method',
    INVALID_PAYMENT_METHOD: 'Invalid payment method. Please update your payment information',
    SUBSCRIPTION_INACTIVE: 'Your subscription is inactive. Please update your payment method',
  },
} as const

// ============================================================================
// ERROR MESSAGE BUILDER FUNCTIONS
// ============================================================================

/**
 * Build a field-specific validation error message
 */
export function fieldRequired(fieldName: string): string {
  return `${fieldName} is required`
}

/**
 * Build a field-too-long error message
 */
export function fieldTooLong(fieldName: string, maxLength: number, currentLength: number): string {
  return `${fieldName} must be ${maxLength} characters or less. Currently: ${currentLength}/${maxLength} characters`
}

/**
 * Build a field-too-short error message
 */
export function fieldTooShort(fieldName: string, minLength: number): string {
  return `${fieldName} must be at least ${minLength} characters`
}

/**
 * Build a file-too-large error message
 */
export function fileTooLarge(maxSize: string): string {
  return `File is too large. Maximum size is ${maxSize}`
}

/**
 * Build an invalid-file-type error message
 */
export function invalidFileType(allowedTypes: string[]): string {
  const types = allowedTypes.join(', ')
  return `This file type is not supported. Please upload ${types} files`
}

/**
 * Build a resource-not-found error message
 */
export function resourceNotFound(resource: string): string {
  return `${resource} not found`
}

/**
 * Build a feature-locked error message
 */
export function featureLocked(feature: string, requiredPlan: string): string {
  return `${feature} is only available on ${requiredPlan} plans. Please upgrade your account`
}

/**
 * Build a limit-reached error message
 */
export function limitReached(resource: string): string {
  return `You've reached your limit for ${resource}. Your limit resets tomorrow or upgrade for more`
}

/**
 * Build a duplicate-entry error message
 */
export function duplicateEntry(resource: string): string {
  return `A ${resource} with this name already exists. Please choose a different name`
}

/**
 * Build an array-too-large error message
 */
export function arrayTooLarge(maxItems: number): string {
  return `Too many items provided. Maximum is ${maxItems}`
}

/**
 * Build an invalid-range error message
 */
export function invalidRange(min: number, max: number): string {
  return `Value must be between ${min} and ${max}`
}

// ============================================================================
// ERROR SANITIZATION
// ============================================================================

/**
 * Sanitize database error for user display
 * Converts technical database errors to user-friendly messages
 */
export function sanitizeDatabaseError(error: Error): string {
  const message = error.message.toLowerCase()

  if (message.includes('foreign key') || message.includes('constraint')) {
    return ERROR_MESSAGES.DATABASE.FOREIGN_KEY
  }

  if (message.includes('unique')) {
    return ERROR_MESSAGES.DATABASE.UNIQUE_CONSTRAINT
  }

  if (message.includes('not null') || message.includes('null value')) {
    return ERROR_MESSAGES.DATABASE.NOT_NULL
  }

  if (message.includes('connection')) {
    return ERROR_MESSAGES.DATABASE.CONNECTION_ERROR
  }

  // Generic database error (don't expose details)
  return ERROR_MESSAGES.SERVER.DATABASE_ERROR
}

/**
 * Sanitize storage error for user display
 */
export function sanitizeStorageError(error: Error): string {
  const message = error.message.toLowerCase()

  if (message.includes('quota') || message.includes('storage full')) {
    return ERROR_MESSAGES.FILES.STORAGE_FULL
  }

  if (message.includes('not found') || message.includes('404')) {
    return ERROR_MESSAGES.NOT_FOUND.FILE
  }

  if (message.includes('virus') || message.includes('malware')) {
    return ERROR_MESSAGES.FILES.VIRUS_DETECTED
  }

  // Generic storage error
  return ERROR_MESSAGES.SERVER.STORAGE_ERROR
}

/**
 * Get user-friendly error message based on error type
 * Prevents leaking technical details to users
 */
export function getUserFriendlyError(error: unknown): string {
  if (error instanceof Error) {
    // Check for specific error types
    if (error.message.includes('database') || error.message.includes('sql')) {
      return sanitizeDatabaseError(error)
    }

    if (error.message.includes('storage') || error.message.includes('s3')) {
      return sanitizeStorageError(error)
    }

    if (error.message.includes('network') || error.message.includes('fetch')) {
      return 'Unable to connect. Please check your internet connection and try again'
    }

    if (error.message.includes('timeout')) {
      return 'The request took too long to complete. Please try again'
    }

    // For generic errors, don't expose the message in production
    if (process.env.NODE_ENV === 'production') {
      return ERROR_MESSAGES.SERVER.INTERNAL_ERROR
    }

    // In development, show the actual error
    return error.message
  }

  return ERROR_MESSAGES.SERVER.INTERNAL_ERROR
}
