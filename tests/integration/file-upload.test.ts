/**
 * Integration Tests for File Upload & R2 Storage
 * Tests file upload flow with R2 signed URLs and storage quotas (D-026)
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { handleAuthCallback } from '../../api/routes/auth'
import * as filesController from '../../api/controllers/files'
import * as tracksController from '../../api/controllers/tracks'
import { createMockEnv } from '../helpers/mock-env'
import { createTestUser, createTestArtist } from '../helpers/test-data'
import type { Env } from '../../api/index'
import type { RequestContext } from '../../api/router'

describe('File Upload Integration Tests', () => {
  let env: Env
  let mocks: any
  let userId: string
  let artistId: string
  let token: string

  beforeEach(async () => {
    const mockSetup = createMockEnv()
    env = mockSetup.env
    mocks = mockSetup.mocks

    // Create user and artist
    const authRequest = new Request('https://api.example.com/v1/auth/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'file-upload-test@example.com',
        oauth_provider: 'google',
        oauth_id: 'google-file-upload-123',
      }),
    })

    const authResponse = await handleAuthCallback(authRequest, env)
    const authData = (await authResponse.json()) as any
    userId = authData.data.user.id
    token = authData.data.token

    // Create artist profile
    const artist = createTestArtist(userId)
    artistId = artist.id
    mocks.db.getTable('artists').push(artist)
  })

  describe('File Upload Flow with R2 Signed URLs', () => {
    it('should generate upload URL and confirm upload successfully', async () => {
      // Step 1: Request upload URL
      const uploadUrlRequest = new Request('https://api.example.com/v1/files/upload-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          file_name: 'test-image.jpg',
          file_size_bytes: 1048576, // 1MB
          file_type: 'image',
          file_format: 'jpg',
        }),
      })

      const uploadUrlCtx: RequestContext = {
        request: uploadUrlRequest,
        env,
        url: new URL(uploadUrlRequest.url),
        params: {},
        requestId: 'test-req-1',
        userId,
        startTime: Date.now(),
      }

      const uploadUrlResponse = await filesController.getUploadUrl(uploadUrlCtx)
      const uploadUrlResult = (await uploadUrlResponse.json()) as any

      expect(uploadUrlResponse.status).toBe(200)
      expect(uploadUrlResult.success).toBe(true)
      expect(uploadUrlResult.data.upload_url).toBeDefined()
      expect(uploadUrlResult.data.file_id).toBeDefined()
      expect(uploadUrlResult.data.expires_at).toBeDefined()

      const fileId = uploadUrlResult.data.file_id

      // Step 2: Simulate file upload to R2
      const r2Key = `files/${artistId}/${fileId}.jpg`
      await mocks.bucket.put(r2Key, 'mock-file-data', {
        customMetadata: {
          'file-id': fileId,
          'artist-id': artistId,
        },
      })

      // Step 3: Confirm upload
      const confirmRequest = new Request(
        `https://api.example.com/v1/files/${fileId}/confirm`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const confirmCtx: RequestContext = {
        request: confirmRequest,
        env,
        url: new URL(confirmRequest.url),
        params: { id: fileId },
        requestId: 'test-req-2',
        userId,
        startTime: Date.now(),
      }

      const confirmResponse = await filesController.confirmUpload(confirmCtx)
      const confirmResult = (await confirmResponse.json()) as any

      expect(confirmResponse.status).toBe(200)
      expect(confirmResult.success).toBe(true)
      expect(confirmResult.data.file.upload_status).toBe('completed')

      // Verify file exists in R2
      const r2File = await mocks.bucket.get(r2Key)
      expect(r2File).not.toBeNull()
    })

    it('should handle track upload with metadata', async () => {
      // Step 1: Request track upload URL
      const uploadUrlRequest = new Request('https://api.example.com/v1/tracks/upload-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          file_name: 'my-track.mp3',
          file_size_bytes: 5242880, // 5MB
          file_format: 'mp3',
        }),
      })

      const uploadUrlCtx: RequestContext = {
        request: uploadUrlRequest,
        env,
        url: new URL(uploadUrlRequest.url),
        params: {},
        requestId: 'test-req-1',
        userId,
        startTime: Date.now(),
      }

      const uploadUrlResponse = await tracksController.getTrackUploadUrl(uploadUrlCtx)
      const uploadUrlResult = (await uploadUrlResponse.json()) as any

      expect(uploadUrlResponse.status).toBe(200)
      expect(uploadUrlResult.success).toBe(true)
      expect(uploadUrlResult.data.upload_url).toBeDefined()
      expect(uploadUrlResult.data.track_id).toBeDefined()

      const trackId = uploadUrlResult.data.track_id

      // Step 2: Simulate track upload to R2
      const r2Key = `tracks/${artistId}/${trackId}.mp3`
      await mocks.bucket.put(r2Key, 'mock-audio-data', {
        customMetadata: {
          'track-id': trackId,
          'artist-id': artistId,
        },
      })

      // Step 3: Confirm track upload with metadata
      const confirmRequest = new Request('https://api.example.com/v1/tracks/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          track_id: trackId,
          title: 'My Awesome Track',
          genre: 'Rock',
          bpm: 120,
          key_signature: 'C Major',
          duration_seconds: 240,
        }),
      })

      const confirmCtx: RequestContext = {
        request: confirmRequest,
        env,
        url: new URL(confirmRequest.url),
        params: {},
        requestId: 'test-req-2',
        userId,
        startTime: Date.now(),
      }

      const confirmResponse = await tracksController.confirmTrackUpload(confirmCtx)
      const confirmResult = (await confirmResponse.json()) as any

      expect(confirmResponse.status).toBe(200)
      expect(confirmResult.success).toBe(true)
      expect(confirmResult.data.track.title).toBe('My Awesome Track')
      expect(confirmResult.data.track.genre).toBe('Rock')
    })
  })

  describe('Storage Quota Enforcement (D-026: 50GB per artist)', () => {
    it('should track storage usage accurately', async () => {
      // Upload multiple files
      const fileSizes = [10485760, 20971520, 5242880] // 10MB, 20MB, 5MB

      for (let i = 0; i < fileSizes.length; i++) {
        const uploadUrlRequest = new Request('https://api.example.com/v1/files/upload-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            file_name: `test-file-${i}.jpg`,
            file_size_bytes: fileSizes[i],
            file_type: 'image',
            file_format: 'jpg',
          }),
        })

        const uploadUrlCtx: RequestContext = {
          request: uploadUrlRequest,
          env,
          url: new URL(uploadUrlRequest.url),
          params: {},
          requestId: `test-req-upload-${i}`,
          userId,
          startTime: Date.now(),
        }

        const uploadUrlResponse = await filesController.getUploadUrl(uploadUrlCtx)
        const uploadUrlResult = (await uploadUrlResponse.json()) as any
        const fileId = uploadUrlResult.data.file_id

        // Simulate upload
        const r2Key = `files/${artistId}/${fileId}.jpg`
        await mocks.bucket.put(r2Key, `mock-file-data-${i}`)

        // Confirm upload
        const confirmRequest = new Request(
          `https://api.example.com/v1/files/${fileId}/confirm`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          }
        )

        const confirmCtx: RequestContext = {
          request: confirmRequest,
          env,
          url: new URL(confirmRequest.url),
          params: { id: fileId },
          requestId: `test-req-confirm-${i}`,
          userId,
          startTime: Date.now(),
        }

        await filesController.confirmUpload(confirmCtx)
      }

      // Check storage stats
      const statsRequest = new Request('https://api.example.com/v1/files/storage')

      const statsCtx: RequestContext = {
        request: statsRequest,
        env,
        url: new URL(statsRequest.url),
        params: {},
        requestId: 'test-req-stats',
        userId,
        startTime: Date.now(),
      }

      const statsResponse = await filesController.getStorageStats(statsCtx)
      const statsResult = (await statsResponse.json()) as any

      expect(statsResponse.status).toBe(200)
      expect(statsResult.success).toBe(true)

      const totalSize = fileSizes.reduce((sum, size) => sum + size, 0)
      expect(statsResult.data.total_bytes_used).toBeGreaterThanOrEqual(totalSize)
      expect(statsResult.data.quota_bytes).toBe(53687091200) // 50GB
      expect(statsResult.data.percentage_used).toBeLessThan(1)
    })

    it('should reject upload when quota exceeded', async () => {
      // Simulate near-quota usage by setting large storage usage
      // Upload a file that would exceed 50GB quota
      const largeFileSize = 54000000000 // 54GB (exceeds 50GB quota)

      const uploadUrlRequest = new Request('https://api.example.com/v1/files/upload-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          file_name: 'huge-file.mp4',
          file_size_bytes: largeFileSize,
          file_type: 'video',
          file_format: 'mp4',
        }),
      })

      const uploadUrlCtx: RequestContext = {
        request: uploadUrlRequest,
        env,
        url: new URL(uploadUrlRequest.url),
        params: {},
        requestId: 'test-req',
        userId,
        startTime: Date.now(),
      }

      const uploadUrlResponse = await filesController.getUploadUrl(uploadUrlCtx)
      const uploadUrlResult = (await uploadUrlResponse.json()) as any

      // Should reject due to quota
      expect(uploadUrlResponse.status).toBe(400)
      expect(uploadUrlResult.success).toBe(false)
      expect(uploadUrlResult.error.code).toContain('STORAGE_QUOTA')
    })
  })

  describe('File Deletion and Cleanup', () => {
    it('should delete file from R2 and update storage stats', async () => {
      // Upload a file
      const uploadUrlRequest = new Request('https://api.example.com/v1/files/upload-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          file_name: 'delete-test.jpg',
          file_size_bytes: 2097152, // 2MB
          file_type: 'image',
          file_format: 'jpg',
        }),
      })

      const uploadUrlCtx: RequestContext = {
        request: uploadUrlRequest,
        env,
        url: new URL(uploadUrlRequest.url),
        params: {},
        requestId: 'test-req-1',
        userId,
        startTime: Date.now(),
      }

      const uploadUrlResponse = await filesController.getUploadUrl(uploadUrlCtx)
      const uploadUrlResult = (await uploadUrlResponse.json()) as any
      const fileId = uploadUrlResult.data.file_id

      // Upload to R2
      const r2Key = `files/${artistId}/${fileId}.jpg`
      await mocks.bucket.put(r2Key, 'mock-file-data')

      // Confirm upload
      const confirmRequest = new Request(
        `https://api.example.com/v1/files/${fileId}/confirm`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      const confirmCtx: RequestContext = {
        request: confirmRequest,
        env,
        url: new URL(confirmRequest.url),
        params: { id: fileId },
        requestId: 'test-req-2',
        userId,
        startTime: Date.now(),
      }

      await filesController.confirmUpload(confirmCtx)

      // Verify file exists
      const fileExistsBefore = await mocks.bucket.get(r2Key)
      expect(fileExistsBefore).not.toBeNull()

      // Delete file
      const deleteRequest = new Request(`https://api.example.com/v1/files/${fileId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      const deleteCtx: RequestContext = {
        request: deleteRequest,
        env,
        url: new URL(deleteRequest.url),
        params: { id: fileId },
        requestId: 'test-req-3',
        userId,
        startTime: Date.now(),
      }

      const deleteResponse = await filesController.deleteFile(deleteCtx)
      const deleteResult = (await deleteResponse.json()) as any

      expect(deleteResponse.status).toBe(200)
      expect(deleteResult.success).toBe(true)

      // Verify file removed from R2
      const fileExistsAfter = await mocks.bucket.get(r2Key)
      expect(fileExistsAfter).toBeNull()
    })
  })

  describe('File Listing and Retrieval', () => {
    it('should list all files for an artist', async () => {
      // Upload 3 files
      for (let i = 0; i < 3; i++) {
        const uploadUrlRequest = new Request('https://api.example.com/v1/files/upload-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            file_name: `test-file-${i}.jpg`,
            file_size_bytes: 1048576,
            file_type: 'image',
            file_format: 'jpg',
          }),
        })

        const uploadUrlCtx: RequestContext = {
          request: uploadUrlRequest,
          env,
          url: new URL(uploadUrlRequest.url),
          params: {},
          requestId: `test-req-upload-${i}`,
          userId,
          startTime: Date.now(),
        }

        const uploadUrlResponse = await filesController.getUploadUrl(uploadUrlCtx)
        const uploadUrlResult = (await uploadUrlResponse.json()) as any
        const fileId = uploadUrlResult.data.file_id

        const r2Key = `files/${artistId}/${fileId}.jpg`
        await mocks.bucket.put(r2Key, `mock-file-${i}`)

        const confirmRequest = new Request(
          `https://api.example.com/v1/files/${fileId}/confirm`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          }
        )

        const confirmCtx: RequestContext = {
          request: confirmRequest,
          env,
          url: new URL(confirmRequest.url),
          params: { id: fileId },
          requestId: `test-req-confirm-${i}`,
          userId,
          startTime: Date.now(),
        }

        await filesController.confirmUpload(confirmCtx)
      }

      // List files
      const listRequest = new Request('https://api.example.com/v1/files')

      const listCtx: RequestContext = {
        request: listRequest,
        env,
        url: new URL(listRequest.url),
        params: {},
        requestId: 'test-req-list',
        userId,
        startTime: Date.now(),
      }

      const listResponse = await filesController.listFiles(listCtx)
      const listResult = (await listResponse.json()) as any

      expect(listResponse.status).toBe(200)
      expect(listResult.success).toBe(true)
      expect(listResult.data.files.length).toBe(3)
      expect(listResult.data.total_count).toBe(3)
    })

    it('should retrieve individual file metadata', async () => {
      // Upload a file
      const uploadUrlRequest = new Request('https://api.example.com/v1/files/upload-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          file_name: 'retrieve-test.jpg',
          file_size_bytes: 1048576,
          file_type: 'image',
          file_format: 'jpg',
        }),
      })

      const uploadUrlCtx: RequestContext = {
        request: uploadUrlRequest,
        env,
        url: new URL(uploadUrlRequest.url),
        params: {},
        requestId: 'test-req-1',
        userId,
        startTime: Date.now(),
      }

      const uploadUrlResponse = await filesController.getUploadUrl(uploadUrlCtx)
      const uploadUrlResult = (await uploadUrlResponse.json()) as any
      const fileId = uploadUrlResult.data.file_id

      const r2Key = `files/${artistId}/${fileId}.jpg`
      await mocks.bucket.put(r2Key, 'mock-file-data')

      const confirmRequest = new Request(
        `https://api.example.com/v1/files/${fileId}/confirm`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      const confirmCtx: RequestContext = {
        request: confirmRequest,
        env,
        url: new URL(confirmRequest.url),
        params: { id: fileId },
        requestId: 'test-req-2',
        userId,
        startTime: Date.now(),
      }

      await filesController.confirmUpload(confirmCtx)

      // Retrieve file
      const getRequest = new Request(`https://api.example.com/v1/files/${fileId}`)

      const getCtx: RequestContext = {
        request: getRequest,
        env,
        url: new URL(getRequest.url),
        params: { id: fileId },
        requestId: 'test-req-3',
        userId,
        startTime: Date.now(),
      }

      const getResponse = await filesController.getFile(getCtx)
      const getResult = (await getResponse.json()) as any

      expect(getResponse.status).toBe(200)
      expect(getResult.success).toBe(true)
      expect(getResult.data.file.id).toBe(fileId)
      expect(getResult.data.file.file_name).toBe('retrieve-test.jpg')
      expect(getResult.data.file.upload_status).toBe('completed')
    })
  })
})
