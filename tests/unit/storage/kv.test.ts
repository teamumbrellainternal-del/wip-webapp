/**
 * Unit Tests for KV Storage Operations
 * Umbrella MVP - Storage Layer Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  setSession,
  getSession,
  deleteSession,
  cacheProfile,
  getCachedProfile,
  invalidateProfileCache,
  cacheSearchResults,
  getCachedSearchResults,
  checkVioletRateLimit,
  incrementVioletRateLimit,
  setUploadUrlMetadata,
  getUploadUrlMetadata,
  deleteUploadUrlMetadata,
} from '../../../api/storage/kv'
import type { SessionData, ProfileCache, UploadUrlMetadata } from '../../../api/storage/types'

// Mock KV Namespace
class MockKVNamespace implements KVNamespace {
  private store = new Map<string, { value: string; expiration?: number }>()

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key)
    if (!item) return null

    // Check expiration
    if (item.expiration && Date.now() > item.expiration) {
      this.store.delete(key)
      return null
    }

    return item.value
  }

  async put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void> {
    const expiration = options?.expirationTtl
      ? Date.now() + options.expirationTtl * 1000
      : undefined

    this.store.set(key, { value, expiration })
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key)
  }

  async list(): Promise<KVNamespaceListResult<unknown>> {
    throw new Error('Not implemented')
  }

  async getWithMetadata(): Promise<KVNamespaceGetWithMetadataResult<string>> {
    throw new Error('Not implemented')
  }

  clear() {
    this.store.clear()
  }
}

describe('KV Storage - Session Management', () => {
  let kv: MockKVNamespace

  beforeEach(() => {
    kv = new MockKVNamespace()
  })

  it('should store and retrieve session data', async () => {
    const sessionId = 'session-123'
    const sessionData: SessionData = {
      userId: 'user-123',
      email: 'test@example.com',
      provider: 'google',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      lastAccess: new Date().toISOString(),
    }

    // Store session
    const setResult = await setSession(kv, sessionId, sessionData)
    expect(setResult.success).toBe(true)

    // Retrieve session
    const getResult = await getSession(kv, sessionId)
    expect(getResult.success).toBe(true)
    expect(getResult.data?.userId).toBe(sessionData.userId)
    expect(getResult.data?.email).toBe(sessionData.email)
  })

  it('should delete session', async () => {
    const sessionId = 'session-456'
    const sessionData: SessionData = {
      userId: 'user-456',
      email: 'delete@example.com',
      provider: 'apple',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      lastAccess: new Date().toISOString(),
    }

    await setSession(kv, sessionId, sessionData)
    const deleteResult = await deleteSession(kv, sessionId)
    expect(deleteResult.success).toBe(true)

    const getResult = await getSession(kv, sessionId)
    expect(getResult.success).toBe(false)
    expect(getResult.error).toContain('not found')
  })

  it('should return error for non-existent session', async () => {
    const result = await getSession(kv, 'non-existent')
    expect(result.success).toBe(false)
    expect(result.error).toContain('not found')
  })
})

describe('KV Storage - Profile Cache', () => {
  let kv: MockKVNamespace

  beforeEach(() => {
    kv = new MockKVNamespace()
  })

  it('should cache and retrieve profile', async () => {
    const userId = 'user-789'
    const profileData = {
      userId,
      artistName: 'John Doe',
      bio: 'Professional musician',
      location: 'Los Angeles, CA',
    }

    // Cache profile
    const cacheResult = await cacheProfile(kv, userId, profileData)
    expect(cacheResult.success).toBe(true)

    // Retrieve cached profile
    const getResult = await getCachedProfile(kv, userId)
    expect(getResult.success).toBe(true)
    expect(getResult.data?.userId).toBe(userId)
    expect(getResult.data?.artistName).toBe(profileData.artistName)
    expect(getResult.data?.cachedAt).toBeDefined()
  })

  it('should invalidate profile cache', async () => {
    const userId = 'user-invalidate'
    const profileData = {
      userId,
      artistName: 'Jane Smith',
    }

    await cacheProfile(kv, userId, profileData)
    const invalidateResult = await invalidateProfileCache(kv, userId)
    expect(invalidateResult.success).toBe(true)

    const getResult = await getCachedProfile(kv, userId)
    expect(getResult.success).toBe(false)
  })
})

describe('KV Storage - Search Cache', () => {
  let kv: MockKVNamespace

  beforeEach(() => {
    kv = new MockKVNamespace()
  })

  it('should cache and retrieve search results', async () => {
    const query = 'jazz musicians'
    const filters = { location: 'LA', genre: 'jazz' }
    const results = [{ id: '1', name: 'Artist 1' }, { id: '2', name: 'Artist 2' }]
    const totalCount = 2

    // Cache search results
    const cacheResult = await cacheSearchResults(kv, query, filters, results, totalCount)
    expect(cacheResult.success).toBe(true)

    // Retrieve cached results
    const getResult = await getCachedSearchResults(kv, query, filters)
    expect(getResult.success).toBe(true)
    expect(getResult.data?.query).toBe(query)
    expect(getResult.data?.results).toHaveLength(2)
    expect(getResult.data?.totalCount).toBe(totalCount)
  })

  it('should return different results for different filters', async () => {
    const query = 'musicians'
    const filters1 = { location: 'LA' }
    const filters2 = { location: 'NYC' }
    const results1 = [{ id: '1' }]
    const results2 = [{ id: '2' }]

    await cacheSearchResults(kv, query, filters1, results1, 1)
    await cacheSearchResults(kv, query, filters2, results2, 1)

    const getResult1 = await getCachedSearchResults(kv, query, filters1)
    const getResult2 = await getCachedSearchResults(kv, query, filters2)

    expect(getResult1.data?.results).toHaveLength(1)
    expect(getResult2.data?.results).toHaveLength(1)
    expect(getResult1.data?.results[0]).not.toEqual(getResult2.data?.results[0])
  })
})

describe('KV Storage - Violet Rate Limiting', () => {
  let kv: MockKVNamespace

  beforeEach(() => {
    kv = new MockKVNamespace()
  })

  it('should initialize rate limit counter', async () => {
    const userId = 'user-violet'
    const checkResult = await checkVioletRateLimit(kv, userId, 50)

    expect(checkResult.success).toBe(true)
    expect(checkResult.data?.count).toBe(0)
    expect(checkResult.data?.exceeded).toBe(false)
  })

  it('should increment rate limit counter', async () => {
    const userId = 'user-increment'

    // First increment
    const result1 = await incrementVioletRateLimit(kv, userId)
    expect(result1.success).toBe(true)
    expect(result1.data?.count).toBe(1)

    // Second increment
    const result2 = await incrementVioletRateLimit(kv, userId)
    expect(result2.success).toBe(true)
    expect(result2.data?.count).toBe(2)
  })

  it('should detect when limit is exceeded', async () => {
    const userId = 'user-exceed'
    const maxPrompts = 5

    // Increment to max
    for (let i = 0; i < maxPrompts; i++) {
      await incrementVioletRateLimit(kv, userId)
    }

    // Check limit
    const checkResult = await checkVioletRateLimit(kv, userId, maxPrompts)
    expect(checkResult.success).toBe(true)
    expect(checkResult.data?.exceeded).toBe(true)
    expect(checkResult.data?.count).toBe(maxPrompts)
  })

  it('should provide reset time at midnight UTC', async () => {
    const userId = 'user-reset'
    const result = await incrementVioletRateLimit(kv, userId)

    expect(result.success).toBe(true)
    expect(result.data?.resetsAt).toBeDefined()

    // Verify it's a valid ISO date
    const resetDate = new Date(result.data!.resetsAt)
    expect(resetDate.getUTCHours()).toBe(0)
    expect(resetDate.getUTCMinutes()).toBe(0)
    expect(resetDate.getUTCSeconds()).toBe(0)
  })
})

describe('KV Storage - Upload URL Metadata', () => {
  let kv: MockKVNamespace

  beforeEach(() => {
    kv = new MockKVNamespace()
  })

  it('should store and retrieve upload metadata', async () => {
    const uploadId = 'upload-123'
    const metadata: Omit<UploadUrlMetadata, 'createdAt'> = {
      uploadId,
      userId: 'user-123',
      fileName: 'track.mp3',
      fileType: 'audio/mpeg',
      fileSize: 5242880,
      path: 'tracks/user-123/track.mp3',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    }

    // Store metadata
    const setResult = await setUploadUrlMetadata(kv, uploadId, metadata)
    expect(setResult.success).toBe(true)

    // Retrieve metadata
    const getResult = await getUploadUrlMetadata(kv, uploadId)
    expect(getResult.success).toBe(true)
    expect(getResult.data?.uploadId).toBe(uploadId)
    expect(getResult.data?.fileName).toBe(metadata.fileName)
    expect(getResult.data?.createdAt).toBeDefined()
  })

  it('should delete upload metadata', async () => {
    const uploadId = 'upload-delete'
    const metadata: Omit<UploadUrlMetadata, 'createdAt'> = {
      uploadId,
      userId: 'user-456',
      fileName: 'file.pdf',
      fileType: 'application/pdf',
      fileSize: 1048576,
      path: 'files/user-456/file.pdf',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    }

    await setUploadUrlMetadata(kv, uploadId, metadata)
    const deleteResult = await deleteUploadUrlMetadata(kv, uploadId)
    expect(deleteResult.success).toBe(true)

    const getResult = await getUploadUrlMetadata(kv, uploadId)
    expect(getResult.success).toBe(false)
  })
})
