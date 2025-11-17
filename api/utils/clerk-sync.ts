/**
 * Clerk User Synchronization Utility
 *
 * Provides manual sync functionality for webhook failure recovery.
 * When Clerk webhooks fail (network issues, deployment, etc.), this utility
 * fetches user data from Clerk API and creates the user in D1.
 *
 * Task 11.5: Clerk Integration Validation
 */

import { generateUUIDv4 } from './uuid'
import type { User } from '../models/user'

/**
 * Environment interface
 */
interface Env {
  DB: D1Database
  KV: KVNamespace
  CLERK_SECRET_KEY: string
}

/**
 * Clerk API user response structure
 */
interface ClerkUserResponse {
  id: string
  email_addresses: Array<{
    id: string
    email_address: string
  }>
  primary_email_address_id: string
  external_accounts: Array<{
    id: string
    provider: string
    email_address?: string
  }>
}

/**
 * Synchronize a Clerk user to D1 database
 *
 * This function is called when:
 * 1. User authenticates with Clerk successfully
 * 2. User token is valid, but user not found in D1
 * 3. Indicates webhook failure during user creation
 *
 * Recovery process:
 * 1. Check if user already exists (prevent duplicates)
 * 2. Fetch user data from Clerk API
 * 3. Extract email and OAuth provider
 * 4. Create user in D1 (same logic as webhook)
 * 5. Log warning (indicates webhook failure)
 * 6. Increment manual sync counter for monitoring
 *
 * @param clerkUserId - Clerk user ID from verified token
 * @param env - Worker environment with DB, KV, and secrets
 * @returns User record from D1
 * @throws Error if Clerk API call fails or user creation fails
 */
export async function syncClerkUser(
  clerkUserId: string,
  env: Env
): Promise<User> {
  // 1. Check if user already exists in D1 (prevent race condition)
  const existingUser = await env.DB.prepare(
    'SELECT * FROM users WHERE clerk_id = ?'
  )
    .bind(clerkUserId)
    .first<User>()

  if (existingUser) {
    console.log(`[MANUAL SYNC] User ${clerkUserId} already exists in D1`)
    return existingUser
  }

  // 2. Fetch user from Clerk API
  console.warn(
    `[WEBHOOK FAILURE RECOVERY] User ${clerkUserId} not in D1, fetching from Clerk API`
  )

  const clerkApiUrl = `https://api.clerk.com/v1/users/${clerkUserId}`
  const clerkResponse = await fetch(clerkApiUrl, {
    headers: {
      Authorization: `Bearer ${env.CLERK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
  })

  if (!clerkResponse.ok) {
    const errorText = await clerkResponse.text()
    throw new Error(
      `Failed to fetch user from Clerk API: ${clerkResponse.status} ${errorText}`
    )
  }

  const clerkUser: ClerkUserResponse = await clerkResponse.json()

  // 3. Extract email address (primary email)
  const primaryEmail = clerkUser.email_addresses.find(
    (e) => e.id === clerkUser.primary_email_address_id
  )

  if (!primaryEmail) {
    throw new Error(
      `No primary email found for Clerk user ${clerkUserId}`
    )
  }

  const email = primaryEmail.email_address

  // 4. Determine OAuth provider from external accounts
  let oauthProvider = 'google' // Default to Google
  let oauthId = clerkUserId // Default to Clerk ID

  if (clerkUser.external_accounts && clerkUser.external_accounts.length > 0) {
    const externalAccount = clerkUser.external_accounts[0]
    const provider = externalAccount.provider

    // Map Clerk provider names to our schema
    if (provider === 'oauth_google') {
      oauthProvider = 'google'
    } else if (provider === 'oauth_apple') {
      oauthProvider = 'apple'
    } else {
      // For other providers, extract the provider name
      oauthProvider = provider.replace('oauth_', '')
    }

    oauthId = externalAccount.id || clerkUserId
  }

  // 5. Create user in D1 (same logic as webhook)
  const userId = generateUUIDv4()
  const now = new Date().toISOString()

  try {
    await env.DB.prepare(
      `INSERT INTO users (id, clerk_id, oauth_provider, oauth_id, email, onboarding_complete, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(userId, clerkUserId, oauthProvider, oauthId, email, 0, now, now)
      .run()

    console.warn(
      `[WEBHOOK FAILURE RECOVERY] Successfully created user ${userId} for Clerk ID ${clerkUserId}`
    )
  } catch (dbError) {
    // Handle potential duplicate insert (race condition)
    if (
      dbError instanceof Error &&
      dbError.message.includes('UNIQUE constraint failed')
    ) {
      console.log(
        `[MANUAL SYNC] User ${clerkUserId} was created concurrently, fetching existing user`
      )
      const user = await env.DB.prepare(
        'SELECT * FROM users WHERE clerk_id = ?'
      )
        .bind(clerkUserId)
        .first<User>()

      if (user) {
        return user
      }
    }

    throw dbError
  }

  // 6. Increment manual sync counter for monitoring
  const today = new Date().toISOString().split('T')[0]
  const counterKey = `manual_syncs:${today}`

  try {
    const currentCount = await env.KV.get(counterKey)
    const newCount = currentCount ? parseInt(currentCount) + 1 : 1
    await env.KV.put(counterKey, String(newCount), {
      expirationTtl: 86400 * 7, // Keep for 7 days
    })

    // Alert if manual syncs exceed threshold (>5 per day indicates webhook issues)
    if (newCount > 5) {
      console.error(
        `[ALERT] High manual sync count detected: ${newCount} syncs today. Webhook endpoint may be unreliable.`
      )
      // TODO: Send alert email/notification to ops team
    }
  } catch (kvError) {
    console.error('[KV ERROR] Failed to increment manual sync counter:', kvError)
  }

  // 7. Return the newly created user
  return {
    id: userId,
    clerk_id: clerkUserId,
    oauth_provider: oauthProvider,
    oauth_id: oauthId,
    email,
    onboarding_complete: 0,
    created_at: now,
    updated_at: now,
  }
}

/**
 * Get webhook failure statistics
 *
 * @param env - Worker environment
 * @param days - Number of days to check (default: 7)
 * @returns Object with failure counts per day
 */
export async function getWebhookFailureStats(
  env: Env,
  days: number = 7
): Promise<Record<string, number>> {
  const stats: Record<string, number> = {}
  const today = new Date()

  for (let i = 0; i < days; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]

    const counterKey = `webhook_failures:${dateStr}`
    const count = await env.KV.get(counterKey)

    stats[dateStr] = count ? parseInt(count) : 0
  }

  return stats
}

/**
 * Get manual sync statistics
 *
 * @param env - Worker environment
 * @param days - Number of days to check (default: 7)
 * @returns Object with sync counts per day
 */
export async function getManualSyncStats(
  env: Env,
  days: number = 7
): Promise<Record<string, number>> {
  const stats: Record<string, number> = {}
  const today = new Date()

  for (let i = 0; i < days; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]

    const counterKey = `manual_syncs:${dateStr}`
    const count = await env.KV.get(counterKey)

    stats[dateStr] = count ? parseInt(count) : 0
  }

  return stats
}
