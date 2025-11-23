/**
 * Mock Service Factory
 * Centralized factory to provide mock or real services based on environment configuration
 */

import { MockResendService, createMockResendService } from './resend'
import { MockTwilioService, createMockTwilioService } from './twilio'
import { MockClaudeService, createMockClaudeService } from './claude'
import { MockR2Service, createMockR2Service } from './r2'

// Real service imports (when available in M10)
import { ResendEmailService, createResendService } from '../services/resend'
import { TwilioSMSService, createTwilioService } from '../services/twilio'
// import { ClaudeAPIService, createClaudeService } from '../services/claude'

/**
 * Union type for email service (supports both mock and real)
 */
type EmailService = MockResendService | ResendEmailService

/**
 * Union type for SMS service (supports both mock and real)
 */
type SMSService = MockTwilioService | TwilioSMSService

/**
 * Environment interface for type safety
 */
export interface Env {
  USE_MOCKS?: string
  RESEND_API_KEY?: string
  TWILIO_ACCOUNT_SID?: string
  TWILIO_AUTH_TOKEN?: string
  TWILIO_FROM_PHONE?: string
  ANTHROPIC_API_KEY?: string
  DB?: D1Database
  BUCKET?: R2Bucket
  KV?: KVNamespace
}

/**
 * Get email service (mock or real based on environment)
 * @param env - Environment variables
 * @returns Email service instance (mock or real)
 */
export function getEmailService(env: Env): EmailService {
  const useMocks = env.USE_MOCKS === 'true' || env.USE_MOCKS === undefined

  // Check if we should use real service
  const shouldUseReal = !useMocks && env.RESEND_API_KEY && env.DB

  if (shouldUseReal) {
    try {
      console.log('[SERVICE FACTORY] Using real Resend email service')
      return createResendService(env.RESEND_API_KEY!, env.DB!)
    } catch (error) {
      console.error(
        '[SERVICE FACTORY] Failed to initialize real email service, falling back to mock:',
        error
      )
      return createMockResendService()
    }
  }

  // Default to mock for development/preview or if real service unavailable
  console.log('[SERVICE FACTORY] Using mock email service')
  return createMockResendService()
}

/**
 * Get SMS service (mock or real based on environment)
 * @param env - Environment variables
 * @returns SMS service instance (mock or real)
 */
export function getSMSService(env: Env): SMSService {
  const useMocks = env.USE_MOCKS === 'true' || env.USE_MOCKS === undefined

  // Check if we should use real service
  const hasRequiredSecrets = env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN
  const shouldUseReal = !useMocks && hasRequiredSecrets && env.DB

  if (shouldUseReal) {
    try {
      console.log('[SERVICE FACTORY] Using real Twilio SMS service')
      return createTwilioService(
        env.TWILIO_ACCOUNT_SID!,
        env.TWILIO_AUTH_TOKEN!,
        env.TWILIO_FROM_PHONE || '+15555551234', // Default fallback
        env.DB!
      )
    } catch (error) {
      console.error(
        '[SERVICE FACTORY] Failed to initialize real SMS service, falling back to mock:',
        error
      )
      return createMockTwilioService(env.TWILIO_FROM_PHONE)
    }
  }

  // Default to mock for development/preview or if real service unavailable
  console.log('[SERVICE FACTORY] Using mock SMS service')
  return createMockTwilioService(env.TWILIO_FROM_PHONE)
}

/**
 * Get AI service (mock or real based on environment)
 * @param env - Environment variables
 * @returns AI service instance
 */
export function getAIService(env: Env): MockClaudeService {
  const useMocks = env.USE_MOCKS === 'true' || env.USE_MOCKS === undefined

  if (useMocks || !env.ANTHROPIC_API_KEY || !env.DB) {
    console.log('[SERVICE FACTORY] Using mock Claude AI service')
    return createMockClaudeService()
  }

  // Real service implementation (M10)
  // console.log('[SERVICE FACTORY] Using real Claude AI service')
  // return createClaudeService(env.ANTHROPIC_API_KEY, env.DB, true)

  // Default to mock until M10
  console.log('[SERVICE FACTORY] Using mock Claude AI service (real service not yet implemented)')
  return createMockClaudeService()
}

/**
 * Get storage service (mock or real based on environment)
 * @param env - Environment variables
 * @returns Storage service instance
 */
export function getStorageService(env: Env): MockR2Service {
  const useMocks = env.USE_MOCKS === 'true' || env.USE_MOCKS === undefined

  if (useMocks || !env.BUCKET) {
    console.log('[SERVICE FACTORY] Using mock R2 storage service')
    return createMockR2Service()
  }

  // Real service implementation (M10)
  // In M10, we'll use the actual R2 bucket methods directly
  // For now, return mock
  console.log('[SERVICE FACTORY] Using mock R2 storage service (real R2 not yet configured)')
  return createMockR2Service()
}

/**
 * Check if mocks are enabled
 * @param env - Environment variables
 * @returns True if mocks are enabled
 */
export function isMockMode(env: Env): boolean {
  return env.USE_MOCKS === 'true' || env.USE_MOCKS === undefined
}

/**
 * Get service status for debugging
 * @param env - Environment variables
 * @returns Service status object
 */
export function getServiceStatus(env: Env): {
  mockMode: boolean
  services: {
    email: 'mock' | 'real'
    sms: 'mock' | 'real'
    ai: 'mock' | 'real'
    storage: 'mock' | 'real'
  }
} {
  const mockMode = isMockMode(env)

  // Check if real email service would be used
  const emailService = !mockMode && env.RESEND_API_KEY && env.DB ? 'real' : 'mock'

  // Check if real SMS service would be used
  const hasRequiredSecrets = env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN
  const smsService = !mockMode && hasRequiredSecrets && env.DB ? 'real' : 'mock'

  return {
    mockMode,
    services: {
      email: emailService,
      sms: smsService,
      ai: mockMode || !env.ANTHROPIC_API_KEY ? 'mock' : 'real',
      storage: mockMode || !env.BUCKET ? 'mock' : 'real',
    },
  }
}

// Re-export mock services for direct usage
export { MockResendService, MockTwilioService, MockClaudeService, MockR2Service }
export {
  createMockResendService,
  createMockTwilioService,
  createMockClaudeService,
  createMockR2Service,
}
