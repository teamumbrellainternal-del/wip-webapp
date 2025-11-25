/**
 * Environment validation utilities
 * Validates required environment variables and bindings on Worker startup
 * Ensures Worker fails fast if critical configuration is missing
 */

import type { Env } from '../index'
import { isDevelopment } from '../config/environments'

/**
 * Validation result interface
 */
interface ValidationResult {
  valid: boolean
  missing: string[]
  warnings: string[]
}

/**
 * Check if the worker is running in mock/demo mode
 */
function isMockMode(env: Env): boolean {
  return env.USE_MOCKS === true || env.USE_MOCKS === 'true'
}

/**
 * Validate environment variables and bindings
 * @param env - Worker environment
 * @returns Validation result
 * @throws Error if critical variables are missing
 */
export function validateEnvironment(env: Env): ValidationResult {
  const missing: string[] = []
  const warnings: string[] = []

  // In demo/mock mode we don't require any bindings or secrets.
  // This allows preview deployments without GitHub secrets configured.
  if (isMockMode(env)) {
    warnings.push('USE_MOCKS enabled - skipping strict environment validation for demo mode')
    return {
      valid: true,
      missing,
      warnings,
    }
  }

  // Required bindings (always required)
  if (!env.DB) {
    missing.push('DB (D1 database binding)')
  }

  if (!env.KV) {
    missing.push('KV (KV namespace binding)')
  }

  // R2 bucket is optional (can be added later when created)
  if (!env.BUCKET) {
    warnings.push('BUCKET (R2 bucket binding) not set - file storage features will be limited')
  }

  // Required secrets for authentication (always required)
  if (!env.CLERK_SECRET_KEY) {
    missing.push('CLERK_SECRET_KEY')
  }

  if (!env.CLERK_PUBLISHABLE_KEY) {
    missing.push('CLERK_PUBLISHABLE_KEY')
  }

  if (!env.CLERK_WEBHOOK_SECRET) {
    missing.push('CLERK_WEBHOOK_SECRET')
  }

  if (!env.JWT_SECRET) {
    missing.push('JWT_SECRET')
  }

  // External service keys (can be mocked in development)
  if (!isDevelopment(env)) {
    // Production requires all service keys
    if (!env.RESEND_API_KEY) {
      missing.push('RESEND_API_KEY')
    }

    if (!env.TWILIO_ACCOUNT_SID) {
      missing.push('TWILIO_ACCOUNT_SID')
    }

    if (!env.TWILIO_AUTH_TOKEN) {
      missing.push('TWILIO_AUTH_TOKEN')
    }

    if (!env.TWILIO_PHONE_NUMBER) {
      missing.push('TWILIO_PHONE_NUMBER')
    }

    if (!env.CLAUDE_API_KEY) {
      missing.push('CLAUDE_API_KEY')
    }
  } else {
    // Development: warn if service keys are missing (will use mocks)
    if (!env.RESEND_API_KEY) {
      warnings.push('RESEND_API_KEY not set - using mock email service')
    }

    if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN) {
      warnings.push('Twilio credentials not set - using mock SMS service')
    }

    if (!env.CLAUDE_API_KEY) {
      warnings.push('CLAUDE_API_KEY not set - using mock AI service')
    }
  }

  // Optional but recommended
  if (!env.SENTRY_DSN) {
    warnings.push('SENTRY_DSN not set - error tracking disabled')
  }

  if (!env.ENVIRONMENT) {
    warnings.push('ENVIRONMENT not set - defaulting to "development"')
  }

  // Fail if any required variables are missing
  if (missing.length > 0) {
    const error = new Error(
      `Missing required environment variables/bindings:\n${missing.map(m => `  - ${m}`).join('\n')}`
    )
    throw error
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  }
}

/**
 * Log validation warnings
 * @param warnings - Array of warning messages
 */
export function logValidationWarnings(warnings: string[]): void {
  if (warnings.length > 0) {
    console.warn('Environment validation warnings:')
    warnings.forEach(warning => console.warn(`  ⚠️  ${warning}`))
  }
}

/**
 * Validate environment and log results
 * Throws error if validation fails
 * @param env - Worker environment
 */
export function validateAndLogEnvironment(env: Env): void {
  try {
    const result = validateEnvironment(env)

    if (result.warnings.length > 0) {
      logValidationWarnings(result.warnings)
    }

    console.log('✓ Environment validation passed')
  } catch (error) {
    console.error('✗ Environment validation failed')
    throw error
  }
}
