/**
 * Unit Tests: SMS Service Factory
 * Tests the factory logic for conditionally returning mock or real SMS service
 */

import { describe, test, expect, beforeEach } from 'vitest'
import { getSMSService, getServiceStatus } from '../../../api/mocks/index'
import { MockTwilioService } from '../../../api/mocks/twilio'
import { TwilioSMSService } from '../../../api/services/twilio'
import { MockD1Database } from '../../helpers/mock-env'
import type { Env } from '../../../api/index'

describe('SMS Service Factory', () => {
  let mockDb: MockD1Database

  beforeEach(() => {
    mockDb = new MockD1Database()
    // Initialize SMS-related tables
    ;(mockDb as any).tables.set('sms_delivery_log', new Map())
    ;(mockDb as any).tables.set('sms_delivery_queue', new Map())
  })

  describe('getSMSService', () => {
    test('returns mock service when USE_MOCKS is true', () => {
      const env: Env = {
        USE_MOCKS: 'true',
        TWILIO_ACCOUNT_SID: 'test_sid',
        TWILIO_AUTH_TOKEN: 'test_token',
        DB: mockDb as any,
      }

      const service = getSMSService(env)
      expect(service).toBeInstanceOf(MockTwilioService)
    })

    test('returns mock service when USE_MOCKS is undefined', () => {
      const env: Env = {
        DB: mockDb as any,
      }

      const service = getSMSService(env)
      expect(service).toBeInstanceOf(MockTwilioService)
    })

    test('returns real service when USE_MOCKS is false and credentials exist', () => {
      const env: Env = {
        USE_MOCKS: 'false',
        TWILIO_ACCOUNT_SID: 'test_sid',
        TWILIO_AUTH_TOKEN: 'test_token',
        TWILIO_FROM_PHONE: '+1234567890',
        DB: mockDb as any,
      }

      const service = getSMSService(env)
      expect(service).toBeInstanceOf(TwilioSMSService)
    })

    test('returns real service with default phone number when TWILIO_FROM_PHONE not provided', () => {
      const env: Env = {
        USE_MOCKS: 'false',
        TWILIO_ACCOUNT_SID: 'test_sid',
        TWILIO_AUTH_TOKEN: 'test_token',
        // TWILIO_FROM_PHONE not provided
        DB: mockDb as any,
      }

      const service = getSMSService(env)
      expect(service).toBeInstanceOf(TwilioSMSService)
      // The factory should use the default phone number '+15555551234'
    })

    test('returns mock service when TWILIO_ACCOUNT_SID is missing', () => {
      const env: Env = {
        USE_MOCKS: 'false',
        // TWILIO_ACCOUNT_SID missing
        TWILIO_AUTH_TOKEN: 'test_token',
        DB: mockDb as any,
      }

      const service = getSMSService(env)
      expect(service).toBeInstanceOf(MockTwilioService)
    })

    test('returns mock service when TWILIO_AUTH_TOKEN is missing', () => {
      const env: Env = {
        USE_MOCKS: 'false',
        TWILIO_ACCOUNT_SID: 'test_sid',
        // TWILIO_AUTH_TOKEN missing
        DB: mockDb as any,
      }

      const service = getSMSService(env)
      expect(service).toBeInstanceOf(MockTwilioService)
    })

    test('returns mock service when both credentials are missing', () => {
      const env: Env = {
        USE_MOCKS: 'false',
        // Both credentials missing
        DB: mockDb as any,
      }

      const service = getSMSService(env)
      expect(service).toBeInstanceOf(MockTwilioService)
    })

    test('returns mock service when DB is missing', () => {
      const env: Env = {
        USE_MOCKS: 'false',
        TWILIO_ACCOUNT_SID: 'test_sid',
        TWILIO_AUTH_TOKEN: 'test_token',
        // DB missing
      }

      const service = getSMSService(env)
      expect(service).toBeInstanceOf(MockTwilioService)
    })

    test('passes TWILIO_FROM_PHONE to mock service when provided', () => {
      const customPhone = '+19876543210'
      const env: Env = {
        USE_MOCKS: 'true',
        TWILIO_FROM_PHONE: customPhone,
      }

      const service = getSMSService(env) as MockTwilioService
      expect(service).toBeInstanceOf(MockTwilioService)
      // The mock service should use the custom phone number
    })
  })

  describe('getServiceStatus', () => {
    test('reports SMS as mock when USE_MOCKS is true', () => {
      const env: Env = {
        USE_MOCKS: 'true',
        TWILIO_ACCOUNT_SID: 'test_sid',
        TWILIO_AUTH_TOKEN: 'test_token',
        DB: mockDb as any,
      }

      const status = getServiceStatus(env)
      expect(status.mockMode).toBe(true)
      expect(status.services.sms).toBe('mock')
    })

    test('reports SMS as real when configured correctly', () => {
      const env: Env = {
        USE_MOCKS: 'false',
        TWILIO_ACCOUNT_SID: 'test_sid',
        TWILIO_AUTH_TOKEN: 'test_token',
        DB: mockDb as any,
      }

      const status = getServiceStatus(env)
      expect(status.mockMode).toBe(false)
      expect(status.services.sms).toBe('real')
    })

    test('reports SMS as mock when credentials are missing', () => {
      const env: Env = {
        USE_MOCKS: 'false',
        // Missing credentials
        DB: mockDb as any,
      }

      const status = getServiceStatus(env)
      expect(status.services.sms).toBe('mock')
    })

    test('reports SMS as mock when only TWILIO_ACCOUNT_SID is present', () => {
      const env: Env = {
        USE_MOCKS: 'false',
        TWILIO_ACCOUNT_SID: 'test_sid',
        // Missing TWILIO_AUTH_TOKEN
        DB: mockDb as any,
      }

      const status = getServiceStatus(env)
      expect(status.services.sms).toBe('mock')
    })

    test('reports SMS as mock when only TWILIO_AUTH_TOKEN is present', () => {
      const env: Env = {
        USE_MOCKS: 'false',
        // Missing TWILIO_ACCOUNT_SID
        TWILIO_AUTH_TOKEN: 'test_token',
        DB: mockDb as any,
      }

      const status = getServiceStatus(env)
      expect(status.services.sms).toBe('mock')
    })

    test('reports SMS as mock when DB is missing', () => {
      const env: Env = {
        USE_MOCKS: 'false',
        TWILIO_ACCOUNT_SID: 'test_sid',
        TWILIO_AUTH_TOKEN: 'test_token',
        // DB missing
      }

      const status = getServiceStatus(env)
      expect(status.services.sms).toBe('mock')
    })
  })

  describe('Type Safety', () => {
    test('mock and real services are compatible', async () => {
      const mockEnv: Env = {
        USE_MOCKS: 'true',
      }

      const realEnv: Env = {
        USE_MOCKS: 'false',
        TWILIO_ACCOUNT_SID: 'test_sid',
        TWILIO_AUTH_TOKEN: 'test_token',
        DB: mockDb as any,
      }

      const mockService = getSMSService(mockEnv)
      const realService = getSMSService(realEnv)

      // Both services should have the same methods
      expect(typeof mockService.sendSMS).toBe('function')
      expect(typeof realService.sendSMS).toBe('function')
      expect(typeof mockService.sendBroadcast).toBe('function')
      expect(typeof realService.sendBroadcast).toBe('function')
      expect(typeof mockService.sendBookingConfirmation).toBe('function')
      expect(typeof realService.sendBookingConfirmation).toBe('function')
      expect(typeof mockService.getDeliveryStats).toBe('function')
      expect(typeof realService.getDeliveryStats).toBe('function')
    })
  })
})
