/**
 * Centralized Environment Configuration
 *
 * This file is the single source of truth for all environment-related logic.
 * Instead of scattering `env.ENVIRONMENT === 'development'` checks throughout
 * the codebase, use the helper functions exported here.
 *
 * Benefits:
 * - Type safety: TypeScript catches typos in environment names
 * - Single place to update when adding new environments
 * - Consistent behavior across all files
 */

import type { Env } from '../index'

/**
 * Valid environment names
 * Add new environments here when needed
 */
export type EnvironmentName = 'development' | 'preview' | 'staging' | 'production'

/**
 * Environment hierarchy (least to most restricted)
 * Used for comparison operations
 */
const ENVIRONMENT_LEVELS: Record<EnvironmentName, number> = {
  development: 0,
  preview: 1,
  staging: 2,
  production: 3,
}

/**
 * Get the current environment name with fallback
 */
export function getEnvironment(env: Env): EnvironmentName {
  const envName = env.ENVIRONMENT as EnvironmentName
  // Default to 'development' if not set or invalid
  if (!envName || !ENVIRONMENT_LEVELS.hasOwnProperty(envName)) {
    return 'development'
  }
  return envName
}

/**
 * Check if running in production
 */
export function isProduction(env: Env): boolean {
  return getEnvironment(env) === 'production'
}

/**
 * Check if running in staging
 */
export function isStaging(env: Env): boolean {
  return getEnvironment(env) === 'staging'
}

/**
 * Check if running in preview
 */
export function isPreview(env: Env): boolean {
  return getEnvironment(env) === 'preview'
}

/**
 * Check if running in local development
 */
export function isDevelopment(env: Env): boolean {
  return getEnvironment(env) === 'development'
}

/**
 * Check if running in any non-production environment
 * Use this for features that should be enabled in dev/preview/staging but not prod
 */
export function isNonProduction(env: Env): boolean {
  return !isProduction(env)
}

/**
 * Check if running in a deployed environment (not local)
 * Use this for features that need real URLs, not localhost
 */
export function isDeployed(env: Env): boolean {
  const envName = getEnvironment(env)
  return envName === 'preview' || envName === 'staging' || envName === 'production'
}

/**
 * Check if debug features should be enabled
 * Currently: development and preview only
 */
export function isDebugEnabled(env: Env): boolean {
  const envName = getEnvironment(env)
  return envName === 'development' || envName === 'preview'
}

