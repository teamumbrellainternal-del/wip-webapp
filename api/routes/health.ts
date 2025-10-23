/**
 * Health check endpoint
 * Returns service health status
 */

import { successResponse } from '../utils/response'
import type { Env } from '../middleware/auth'

/**
 * Handle health check request
 * @returns Health status response
 */
export async function handleHealthCheck(env: Env): Promise<Response> {
  return successResponse({
    status: 'healthy',
    service: 'umbrella-api',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    environment: 'development',
  })
}
