/**
 * Mock Service Factory
 * Centralized factory to provide mock or real services based on environment configuration
 */

import { MockResendService, createMockResendService } from './resend'
import { MockTwilioService, createMockTwilioService } from './twilio'
import { MockClaudeService, createMockClaudeService } from './claude'
import { MockR2Service, createMockR2Service } from './r2'

// Real service imports (when available in M10)
// import { ResendEmailService, createResendService } from '../services/resend'
// import { TwilioSMSService, createTwilioService } from '../services/twilio'
import { ClaudeAPIService, createClaudeService } from '../services/claude'
import { R2StorageService, createR2Service } from '../services/r2'

/**
 * Union type for AI service (supports both mock and real)
 */
type AIService = MockClaudeService | ClaudeAPIService

/**
 * Union type for storage service (supports both mock and real)
 */
type StorageService = MockR2Service | R2StorageService

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
  CLAUDE_API_KEY?: string // Alternative name for Claude API key
  R2_ACCESS_KEY_ID?: string
  R2_SECRET_ACCESS_KEY?: string
  R2_ACCOUNT_ID?: string
  DB?: D1Database
  BUCKET?: R2Bucket
  KV?: KVNamespace
}

/**
 * Get email service (mock or real based on environment)
 * @param env - Environment variables
 * @returns Email service instance
 */
export function getEmailService(env: Env): MockResendService {
  const useMocks = env.USE_MOCKS === 'true' || env.USE_MOCKS === undefined

  if (useMocks || !env.RESEND_API_KEY || !env.DB) {
    console.log('[SERVICE FACTORY] Using mock email service')
    return createMockResendService()
  }

  // Real service implementation (M10)
  // console.log('[SERVICE FACTORY] Using real Resend email service')
  // return createResendService(env.RESEND_API_KEY, env.DB)

  // Default to mock until M10
  console.log('[SERVICE FACTORY] Using mock email service (real service not yet implemented)')
  return createMockResendService()
}

/**
 * Get SMS service (mock or real based on environment)
 * @param env - Environment variables
 * @returns SMS service instance
 */
export function getSMSService(env: Env): MockTwilioService {
  const useMocks = env.USE_MOCKS === 'true' || env.USE_MOCKS === undefined

  if (useMocks || !env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.DB) {
    console.log('[SERVICE FACTORY] Using mock SMS service')
    return createMockTwilioService(env.TWILIO_FROM_PHONE)
  }

  // Real service implementation (M10)
  // console.log('[SERVICE FACTORY] Using real Twilio SMS service')
  // return createTwilioService(
  //   env.TWILIO_ACCOUNT_SID,
  //   env.TWILIO_AUTH_TOKEN,
  //   env.TWILIO_FROM_PHONE || '+15555551234',
  //   env.DB
  // )

  // Default to mock until M10
  console.log('[SERVICE FACTORY] Using mock SMS service (real service not yet implemented)')
  return createMockTwilioService(env.TWILIO_FROM_PHONE)
}

/**
 * Get AI service (mock or real based on environment)
 * @param env - Environment variables
 * @returns AI service instance (mock or real)
 */
export function getAIService(env: Env): AIService {
  const useMocks = env.USE_MOCKS === 'true' || env.USE_MOCKS === undefined

  // Check API key (support both ANTHROPIC_API_KEY and CLAUDE_API_KEY)
  const apiKey = env.ANTHROPIC_API_KEY || env.CLAUDE_API_KEY

  // Check if we should use real service
  const shouldUseReal = !useMocks && apiKey && env.DB

  if (shouldUseReal) {
    try {
      console.log('[SERVICE FACTORY] Using real Claude AI service')
      // CRITICAL: Set useRealAPI to true to enable real API calls
      return createClaudeService(apiKey!, env.DB!, true)
    } catch (error) {
      console.error(
        '[SERVICE FACTORY] Failed to initialize real AI service, falling back to mock:',
        error
      )
      return createMockClaudeService()
    }
  }

  // Default to mock for development/preview or if real service unavailable
  console.log('[SERVICE FACTORY] Using mock Claude AI service')
  return createMockClaudeService()
}

/**
 * Get storage service (mock or real based on environment)
 * @param env - Environment variables
 * @returns Storage service instance (mock or real)
 */
export function getStorageService(env: Env): StorageService {
  const useMocks = env.USE_MOCKS === 'true' || env.USE_MOCKS === undefined

  // Check if we should use real service
  const shouldUseReal = !useMocks && env.BUCKET

  if (shouldUseReal) {
    try {
      console.log('[SERVICE FACTORY] Using real R2 storage service')

      // Build R2 credentials if available (for presigned URLs)
      const credentials = env.R2_ACCESS_KEY_ID && env.R2_SECRET_ACCESS_KEY && env.R2_ACCOUNT_ID
        ? {
            accessKeyId: env.R2_ACCESS_KEY_ID,
            secretAccessKey: env.R2_SECRET_ACCESS_KEY,
            accountId: env.R2_ACCOUNT_ID,
            bucketName: 'umbrella-prod-media', // TODO: Make configurable per environment
          }
        : undefined

      if (!credentials) {
        console.warn('[SERVICE FACTORY] R2 API credentials not found - presigned URLs will use placeholders')
      }

      return createR2Service(env.BUCKET!, credentials)
    } catch (error) {
      console.error(
        '[SERVICE FACTORY] Failed to initialize real R2 service, falling back to mock:',
        error
      )
      return createMockR2Service()
    }
  }

  // Default to mock for development/preview or if real service unavailable
  console.log('[SERVICE FACTORY] Using mock R2 storage service')
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

  // Check if real AI service would be used (support both API key names)
  const apiKey = env.ANTHROPIC_API_KEY || env.CLAUDE_API_KEY
  const aiService = !mockMode && apiKey && env.DB ? 'real' : 'mock'

  return {
    mockMode,
    services: {
      email: mockMode || !env.RESEND_API_KEY ? 'mock' : 'real',
      sms: mockMode || !env.TWILIO_ACCOUNT_SID ? 'mock' : 'real',
      ai: aiService,
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
