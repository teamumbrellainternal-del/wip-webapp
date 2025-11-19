/**
 * Health check endpoint
 * Returns service health status with dependency checks
 * Task 11.4: Monitoring & Infrastructure
 */

import { successResponse } from '../utils/response'
import type { Env } from '../middleware/auth'

/**
 * Health check response schema
 */
interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy'
  version: string
  uptime: number
  timestamp: string
  dependencies: {
    database: 'healthy' | 'unhealthy'
    kv: 'healthy' | 'unhealthy'
    storage: 'healthy' | 'unhealthy'
  }
}

/**
 * Cached health check result
 */
interface CachedHealth {
  result: HealthCheckResponse
  cachedAt: number
}

// In-memory cache for health check results (10 second TTL)
let healthCache: CachedHealth | null = null
const CACHE_TTL_MS = 10000 // 10 seconds

// Worker start time for uptime calculation
const WORKER_START_TIME = Date.now()

/**
 * Check database health
 */
async function checkDatabase(env: Env): Promise<'healthy' | 'unhealthy'> {
  try {
    // Execute simple query to verify DB connectivity
    const result = await env.DB.prepare('SELECT 1 as test').first()
    return result && result.test === 1 ? 'healthy' : 'unhealthy'
  } catch (error) {
    console.error('Database health check failed:', error)
    return 'unhealthy'
  }
}

/**
 * Check KV health
 */
async function checkKV(env: Env): Promise<'healthy' | 'unhealthy'> {
  try {
    // Try to get a health check key (can be any key, just testing connectivity)
    // We'll set a ping key that we can check
    await env.KV.put('health:ping', Date.now().toString(), { expirationTtl: 60 })
    const value = await env.KV.get('health:ping')
    return value !== null ? 'healthy' : 'unhealthy'
  } catch (error) {
    console.error('KV health check failed:', error)
    return 'unhealthy'
  }
}

/**
 * Check R2 storage health
 */
async function checkStorage(env: Env): Promise<'healthy' | 'unhealthy'> {
  try {
    // If BUCKET is not configured, skip the check
    if (!env.BUCKET) {
      return 'unhealthy'
    }
    // List objects with limit 1 to verify R2 connectivity
    const objects = await env.BUCKET.list({ limit: 1 })
    return objects !== null ? 'healthy' : 'unhealthy'
  } catch (error) {
    console.error('Storage health check failed:', error)
    return 'unhealthy'
  }
}

/**
 * Perform health checks on all dependencies
 */
async function performHealthCheck(env: Env): Promise<HealthCheckResponse> {
  // Run all checks in parallel for speed
  const [dbStatus, kvStatus, storageStatus] = await Promise.all([
    checkDatabase(env),
    checkKV(env),
    checkStorage(env),
  ])

  // Calculate uptime in seconds
  const uptime = Math.floor((Date.now() - WORKER_START_TIME) / 1000)

  // Determine overall status
  const allHealthy = dbStatus === 'healthy' && kvStatus === 'healthy' && storageStatus === 'healthy'

  return {
    status: allHealthy ? 'healthy' : 'unhealthy',
    version: '1.0.0', // Can be updated from env or git commit
    uptime,
    timestamp: new Date().toISOString(),
    dependencies: {
      database: dbStatus,
      kv: kvStatus,
      storage: storageStatus,
    },
  }
}

/**
 * Handle health check request
 * Returns cached result if available and not stale (< 10 seconds old)
 * @returns Health status response with 200 (healthy) or 503 (unhealthy)
 */
export async function handleHealthCheck(env: Env): Promise<Response> {
  const now = Date.now()

  // Check if we have a valid cached result
  if (healthCache && (now - healthCache.cachedAt) < CACHE_TTL_MS) {
    const statusCode = healthCache.result.status === 'healthy' ? 200 : 503
    return new Response(JSON.stringify(healthCache.result), {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    })
  }

  // Perform health check
  const result = await performHealthCheck(env)

  // Cache the result
  healthCache = {
    result,
    cachedAt: now,
  }

  // Return appropriate status code
  const statusCode = result.status === 'healthy' ? 200 : 503

  return new Response(JSON.stringify(result), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
  })
}
