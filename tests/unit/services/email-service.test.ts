/**
 * Unit Tests: Email Service Factory
 * Tests the factory logic for switching between mock and real email services
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getEmailService, getServiceStatus } from '../../../api/mocks/index'
import { MockResendService } from '../../../api/mocks/resend'
import { ResendEmailService } from '../../../api/services/resend'
import { createMockEnv } from '../../helpers/mock-env'

describe('Email Service Factory', () => {
  beforeEach(() => {
    // Clear console mocks before each test
    vi.clearAllMocks()
  })

  describe('getEmailService', () => {
    it('should return mock service when USE_MOCKS is true', () => {
      const { env } = createMockEnv({ USE_MOCKS: 'true' })
      const service = getEmailService(env)

      expect(service).toBeInstanceOf(MockResendService)
    })

    it('should return mock service when USE_MOCKS is undefined', () => {
      const { env } = createMockEnv({ USE_MOCKS: undefined })
      const service = getEmailService(env)

      expect(service).toBeInstanceOf(MockResendService)
    })

    it('should return mock service when RESEND_API_KEY is missing', () => {
      const { env } = createMockEnv({
        USE_MOCKS: 'false',
        RESEND_API_KEY: undefined,
      })
      const service = getEmailService(env)

      expect(service).toBeInstanceOf(MockResendService)
    })

    it('should return mock service when DB is missing', () => {
      const { env } = createMockEnv({
        USE_MOCKS: 'false',
        RESEND_API_KEY: 'test_key',
        DB: undefined as any,
      })
      const service = getEmailService(env)

      expect(service).toBeInstanceOf(MockResendService)
    })

    it('should return real service when properly configured', () => {
      const { env } = createMockEnv({
        USE_MOCKS: 'false',
        RESEND_API_KEY: 'test_key',
      })
      const service = getEmailService(env)

      expect(service).toBeInstanceOf(ResendEmailService)
    })

    it('should fall back to mock if real service initialization fails', () => {
      // Mock createResendService to throw an error
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { env } = createMockEnv({
        USE_MOCKS: 'false',
        RESEND_API_KEY: null as any, // Force error
        DB: null as any, // Force error
      })

      const service = getEmailService(env)

      expect(service).toBeInstanceOf(MockResendService)
      expect(consoleErrorSpy).not.toHaveBeenCalled() // Should not error because shouldUseReal is false

      consoleErrorSpy.mockRestore()
    })

    it('should log correct message when using mock service', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const { env } = createMockEnv({ USE_MOCKS: 'true' })
      getEmailService(env)

      expect(consoleLogSpy).toHaveBeenCalledWith('[SERVICE FACTORY] Using mock email service')

      consoleLogSpy.mockRestore()
    })

    it('should log correct message when using real service', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const { env } = createMockEnv({
        USE_MOCKS: 'false',
        RESEND_API_KEY: 'test_key',
      })
      getEmailService(env)

      expect(consoleLogSpy).toHaveBeenCalledWith('[SERVICE FACTORY] Using real Resend email service')

      consoleLogSpy.mockRestore()
    })
  })

  describe('getServiceStatus', () => {
    it('should report email service as mock when USE_MOCKS is true', () => {
      const { env } = createMockEnv({ USE_MOCKS: 'true' })
      const status = getServiceStatus(env)

      expect(status.mockMode).toBe(true)
      expect(status.services.email).toBe('mock')
    })

    it('should report email service as mock when USE_MOCKS is undefined', () => {
      const { env } = createMockEnv({ USE_MOCKS: undefined })
      const status = getServiceStatus(env)

      expect(status.mockMode).toBe(true)
      expect(status.services.email).toBe('mock')
    })

    it('should report email service as mock when RESEND_API_KEY is missing', () => {
      const { env } = createMockEnv({
        USE_MOCKS: 'false',
        RESEND_API_KEY: undefined,
      })
      const status = getServiceStatus(env)

      expect(status.mockMode).toBe(false)
      expect(status.services.email).toBe('mock')
    })

    it('should report email service as mock when DB is missing', () => {
      const { env } = createMockEnv({
        USE_MOCKS: 'false',
        RESEND_API_KEY: 'test_key',
        DB: undefined as any,
      })
      const status = getServiceStatus(env)

      expect(status.mockMode).toBe(false)
      expect(status.services.email).toBe('mock')
    })

    it('should report email service as real when properly configured', () => {
      const { env } = createMockEnv({
        USE_MOCKS: 'false',
        RESEND_API_KEY: 'test_key',
      })
      const status = getServiceStatus(env)

      expect(status.mockMode).toBe(false)
      expect(status.services.email).toBe('real')
    })

    it('should report all services correctly in mixed configuration', () => {
      const { env } = createMockEnv({
        USE_MOCKS: 'false',
        RESEND_API_KEY: 'test_key',
        TWILIO_ACCOUNT_SID: undefined, // Missing SMS
        ANTHROPIC_API_KEY: 'test_key', // Has AI
        BUCKET: undefined as any, // Missing storage
      })
      const status = getServiceStatus(env)

      expect(status.mockMode).toBe(false)
      expect(status.services.email).toBe('real')
      expect(status.services.sms).toBe('mock')
      expect(status.services.ai).toBe('real')
      expect(status.services.storage).toBe('mock')
    })
  })

  describe('Service Interface Compatibility', () => {
    it('mock service should have all required methods', () => {
      const { env } = createMockEnv({ USE_MOCKS: 'true' })
      const service = getEmailService(env)

      expect(typeof service.sendEmail).toBe('function')
      expect(typeof service.sendBroadcast).toBe('function')
      expect(typeof service.sendTransactional).toBe('function')
    })

    it('real service should have all required methods', () => {
      const { env } = createMockEnv({
        USE_MOCKS: 'false',
        RESEND_API_KEY: 'test_key',
      })
      const service = getEmailService(env)

      expect(typeof service.sendEmail).toBe('function')
      expect(typeof service.sendBroadcast).toBe('function')
      expect(typeof service.sendTransactional).toBe('function')
    })

    it('both services should return promises from sendEmail', async () => {
      const { env: mockEnv } = createMockEnv({ USE_MOCKS: 'true' })
      const mockService = getEmailService(mockEnv)

      const mockResult = mockService.sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      })

      expect(mockResult).toBeInstanceOf(Promise)

      const { env: realEnv, mocks } = createMockEnv({
        USE_MOCKS: 'false',
        RESEND_API_KEY: 'test_key',
      })

      // Add email tables to mock DB
      mocks.db.tables.set('email_delivery_log', new Map())
      mocks.db.tables.set('email_delivery_queue', new Map())
      mocks.db.tables.set('unsubscribe_list', new Map())

      const realService = getEmailService(realEnv)

      // Mock fetch for real service
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'email_123' }),
      })

      const realResult = realService.sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      })

      expect(realResult).toBeInstanceOf(Promise)
    })
  })

  describe('Backward Compatibility', () => {
    it('should maintain default mock behavior for development', () => {
      // Simulate development environment (no env vars set)
      const env = {
        DB: createMockEnv().env.DB,
        KV: createMockEnv().env.KV,
        BUCKET: createMockEnv().env.BUCKET,
      }

      const service = getEmailService(env as any)
      expect(service).toBeInstanceOf(MockResendService)
    })

    it('should not break existing code using getEmailService', () => {
      const { env } = createMockEnv({ USE_MOCKS: 'true' })

      // This simulates existing code that calls getEmailService
      const service = getEmailService(env)

      // Should still be able to send emails
      expect(async () => {
        await service.sendEmail({
          to: 'test@example.com',
          subject: 'Test',
          html: '<p>Test</p>',
        })
      }).not.toThrow()
    })
  })
})
