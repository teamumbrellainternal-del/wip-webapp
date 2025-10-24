/**
 * Unit Tests for R2 Storage Operations
 * Umbrella MVP - Storage Layer Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  buildR2Key,
  validateFileType,
  validateFileSize,
  calculateStorageUsage,
  checkStorageQuota,
  uploadFile,
  getFileMetadata,
  deleteFile,
  listArtistFiles,
  deleteAllArtistFiles,
  generateUploadSignedUrl,
  generateDownloadSignedUrl,
} from '../../../api/storage/r2'
import { STORAGE_QUOTAS } from '../../../api/storage/types'

// Mock R2 Bucket
class MockR2Bucket implements R2Bucket {
  private objects = new Map<string, {
    body: ArrayBuffer | ReadableStream
    size: number
    uploaded: Date
    httpMetadata?: R2HTTPMetadata
    customMetadata?: Record<string, string>
  }>()

  async head(key: string): Promise<R2Object | null> {
    const obj = this.objects.get(key)
    if (!obj) return null

    return {
      key,
      version: '1',
      size: obj.size,
      etag: 'mock-etag',
      httpEtag: 'mock-http-etag',
      uploaded: obj.uploaded,
      httpMetadata: obj.httpMetadata,
      customMetadata: obj.customMetadata,
      range: { offset: 0, length: obj.size },
      checksums: {},
    } as R2Object
  }

  async get(key: string): Promise<R2ObjectBody | null> {
    const obj = this.objects.get(key)
    if (!obj) return null

    return {
      key,
      version: '1',
      size: obj.size,
      etag: 'mock-etag',
      httpEtag: 'mock-http-etag',
      uploaded: obj.uploaded,
      httpMetadata: obj.httpMetadata,
      customMetadata: obj.customMetadata,
      range: { offset: 0, length: obj.size },
      checksums: {},
      body: obj.body as ReadableStream,
      bodyUsed: false,
      arrayBuffer: async () => obj.body as ArrayBuffer,
      text: async () => '',
      json: async () => ({}),
      blob: async () => new Blob(),
    } as R2ObjectBody
  }

  async put(
    key: string,
    value: ArrayBuffer | ReadableStream | ArrayBufferView | string | null | Blob,
    options?: R2PutOptions
  ): Promise<R2Object> {
    const body = value instanceof ArrayBuffer ? value : new ArrayBuffer(0)
    const size = body.byteLength

    this.objects.set(key, {
      body,
      size,
      uploaded: new Date(),
      httpMetadata: options?.httpMetadata,
      customMetadata: options?.customMetadata,
    })

    return {
      key,
      version: '1',
      size,
      etag: 'mock-etag',
      httpEtag: 'mock-http-etag',
      uploaded: new Date(),
      httpMetadata: options?.httpMetadata,
      customMetadata: options?.customMetadata,
      range: { offset: 0, length: size },
      checksums: {},
    } as R2Object
  }

  async delete(keys: string | string[]): Promise<void> {
    const keyArray = Array.isArray(keys) ? keys : [keys]
    keyArray.forEach(key => this.objects.delete(key))
  }

  async list(options?: R2ListOptions): Promise<R2Objects> {
    const prefix = options?.prefix || ''
    const limit = options?.limit || 1000

    const matchingObjects = Array.from(this.objects.entries())
      .filter(([key]) => key.startsWith(prefix))
      .slice(0, limit)
      .map(([key, obj]) => ({
        key,
        version: '1',
        size: obj.size,
        etag: 'mock-etag',
        httpEtag: 'mock-http-etag',
        uploaded: obj.uploaded,
        httpMetadata: obj.httpMetadata,
        customMetadata: obj.customMetadata,
        range: { offset: 0, length: obj.size },
        checksums: {},
      } as R2Object))

    return {
      objects: matchingObjects,
      truncated: false,
      cursor: undefined,
      delimitedPrefixes: [],
    }
  }

  async createMultipartUpload(): Promise<R2MultipartUpload> {
    throw new Error('Not implemented')
  }

  async resumeMultipartUpload(): Promise<R2MultipartUpload> {
    throw new Error('Not implemented')
  }

  clear() {
    this.objects.clear()
  }
}

describe('R2 Storage - Key Building', () => {
  it('should build correct R2 keys for different folders', () => {
    expect(buildR2Key('PROFILES', 'user-123', 'avatar.jpg'))
      .toBe('profiles/user-123/avatar.jpg')

    expect(buildR2Key('TRACKS', 'artist-456', 'song.mp3'))
      .toBe('tracks/artist-456/song.mp3')

    expect(buildR2Key('MEDIA', 'artist-789', 'video.mp4'))
      .toBe('media/artist-789/video.mp4')

    expect(buildR2Key('FILES', 'user-111', 'contract.pdf'))
      .toBe('files/user-111/contract.pdf')
  })
})

describe('R2 Storage - File Validation', () => {
  it('should validate allowed image types', () => {
    const result = validateFileType('image/jpeg', ['IMAGES'])
    expect(result.valid).toBe(true)
    expect(result.category).toBe('IMAGES')
  })

  it('should validate allowed audio types', () => {
    const result = validateFileType('audio/mpeg', ['AUDIO'])
    expect(result.valid).toBe(true)
    expect(result.category).toBe('AUDIO')
  })

  it('should reject invalid file types', () => {
    const result = validateFileType('application/x-executable', ['IMAGES', 'AUDIO'])
    expect(result.valid).toBe(false)
    expect(result.error).toContain('not allowed')
  })

  it('should validate file size within limits', () => {
    const result = validateFileSize(50 * 1024 * 1024) // 50MB
    expect(result.valid).toBe(true)
  })

  it('should reject files exceeding size limit', () => {
    const result = validateFileSize(150 * 1024 * 1024) // 150MB
    expect(result.valid).toBe(false)
    expect(result.error).toContain('exceeds maximum')
  })

  it('should use custom max size', () => {
    const maxSize = 10 * 1024 * 1024 // 10MB
    const result = validateFileSize(20 * 1024 * 1024, maxSize)
    expect(result.valid).toBe(false)
  })
})

describe('R2 Storage - Upload Operations', () => {
  let bucket: MockR2Bucket

  beforeEach(() => {
    bucket = new MockR2Bucket()
  })

  it('should upload file with metadata', async () => {
    const key = 'tracks/user-123/song.mp3'
    const fileData = new ArrayBuffer(1024)

    const result = await uploadFile(bucket, key, fileData, {
      contentType: 'audio/mpeg',
      size: 1024,
      customMetadata: {
        trackId: 'track-123',
        uploadedBy: 'user-123',
      },
    })

    expect(result.success).toBe(true)
    expect(result.data?.key).toBe(key)
    expect(result.data?.size).toBe(1024)
  })

  it('should generate upload signed URL', async () => {
    const key = 'tracks/user-456/upload.mp3'
    const result = await generateUploadSignedUrl(bucket, key, {
      contentType: 'audio/mpeg',
      contentLength: 5000000,
    })

    expect(result.success).toBe(true)
    expect(result.data?.url).toBeDefined()
    expect(result.data?.uploadId).toBeDefined()
    expect(result.data?.expiresAt).toBeDefined()
  })
})

describe('R2 Storage - Download Operations', () => {
  let bucket: MockR2Bucket

  beforeEach(() => {
    bucket = new MockR2Bucket()
  })

  it('should generate download signed URL for existing file', async () => {
    const key = 'tracks/user-789/download.mp3'

    // Upload file first
    await bucket.put(key, new ArrayBuffer(2048), {
      httpMetadata: { contentType: 'audio/mpeg' },
    })

    const result = await generateDownloadSignedUrl(bucket, key)
    expect(result.success).toBe(true)
    expect(result.data?.url).toBeDefined()
    expect(result.data?.expiresAt).toBeDefined()
  })

  it('should return error for non-existent file', async () => {
    const result = await generateDownloadSignedUrl(bucket, 'non-existent.mp3')
    expect(result.success).toBe(false)
    expect(result.error).toContain('not found')
  })
})

describe('R2 Storage - File Management', () => {
  let bucket: MockR2Bucket

  beforeEach(() => {
    bucket = new MockR2Bucket()
  })

  it('should get file metadata', async () => {
    const key = 'files/user-123/document.pdf'
    await bucket.put(key, new ArrayBuffer(4096), {
      httpMetadata: { contentType: 'application/pdf' },
      customMetadata: { fileId: 'file-123' },
    })

    const result = await getFileMetadata(bucket, key)
    expect(result.success).toBe(true)
    expect(result.data?.key).toBe(key)
    expect(result.data?.size).toBe(4096)
  })

  it('should delete file', async () => {
    const key = 'media/user-456/video.mp4'
    await bucket.put(key, new ArrayBuffer(8192))

    const deleteResult = await deleteFile(bucket, key)
    expect(deleteResult.success).toBe(true)

    const getResult = await getFileMetadata(bucket, key)
    expect(getResult.success).toBe(false)
  })

  it('should list artist files in folder', async () => {
    const artistId = 'artist-list-test'

    // Upload multiple files
    await bucket.put(`tracks/${artistId}/song1.mp3`, new ArrayBuffer(1024))
    await bucket.put(`tracks/${artistId}/song2.mp3`, new ArrayBuffer(2048))
    await bucket.put(`tracks/${artistId}/song3.mp3`, new ArrayBuffer(4096))

    const result = await listArtistFiles(bucket, artistId, 'TRACKS')
    expect(result.success).toBe(true)
    expect(result.data?.objects).toHaveLength(3)
  })

  it('should delete all artist files', async () => {
    const artistId = 'artist-delete-all'

    // Upload files in different folders
    await bucket.put(`profiles/${artistId}/avatar.jpg`, new ArrayBuffer(1024))
    await bucket.put(`tracks/${artistId}/track1.mp3`, new ArrayBuffer(2048))
    await bucket.put(`tracks/${artistId}/track2.mp3`, new ArrayBuffer(4096))
    await bucket.put(`media/${artistId}/video.mp4`, new ArrayBuffer(8192))

    const result = await deleteAllArtistFiles(bucket, artistId)
    expect(result.success).toBe(true)
    expect(result.data?.deletedCount).toBe(4)

    // Verify files are deleted
    const listResult = await listArtistFiles(bucket, artistId, 'TRACKS')
    expect(listResult.data?.objects).toHaveLength(0)
  })
})

describe('R2 Storage - Quota Management', () => {
  let bucket: MockR2Bucket

  beforeEach(() => {
    bucket = new MockR2Bucket()
  })

  it('should calculate storage usage for artist', async () => {
    const artistId = 'artist-quota'
    const size1 = 10 * 1024 * 1024 // 10MB
    const size2 = 20 * 1024 * 1024 // 20MB
    const size3 = 30 * 1024 * 1024 // 30MB

    await bucket.put(`profiles/${artistId}/avatar.jpg`, new ArrayBuffer(size1))
    await bucket.put(`tracks/${artistId}/track.mp3`, new ArrayBuffer(size2))
    await bucket.put(`media/${artistId}/video.mp4`, new ArrayBuffer(size3))

    const result = await calculateStorageUsage(bucket, artistId)
    expect(result.success).toBe(true)
    expect(result.data?.totalBytes).toBe(size1 + size2 + size3)
    expect(result.data?.fileCount).toBe(3)
    expect(result.data?.breakdown.profiles).toBe(size1)
    expect(result.data?.breakdown.tracks).toBe(size2)
    expect(result.data?.breakdown.media).toBe(size3)
  })

  it('should check storage quota allows upload', async () => {
    const artistId = 'artist-quota-check'
    const existingSize = 1 * 1024 * 1024 * 1024 // 1GB
    const newFileSize = 100 * 1024 * 1024 // 100MB

    await bucket.put(`tracks/${artistId}/existing.mp3`, new ArrayBuffer(existingSize))

    const result = await checkStorageQuota(bucket, artistId, newFileSize)
    expect(result.success).toBe(true)
    expect(result.data?.allowed).toBe(true)
    expect(result.data?.currentUsage).toBeDefined()
  })

  it('should detect quota exceeded', async () => {
    const artistId = 'artist-quota-exceeded'
    // Use 49.5GB (close to 50GB limit)
    const existingSize = 49.5 * 1024 * 1024 * 1024
    const newFileSize = 1 * 1024 * 1024 * 1024 // 1GB (would exceed)

    await bucket.put(`tracks/${artistId}/large.mp3`, new ArrayBuffer(existingSize))

    const result = await checkStorageQuota(bucket, artistId, newFileSize)
    expect(result.success).toBe(true)
    expect(result.data?.allowed).toBe(false)
  })

  it('should calculate quota percentage', async () => {
    const artistId = 'artist-quota-percent'
    const size = 25 * 1024 * 1024 * 1024 // 25GB (50% of quota)

    await bucket.put(`tracks/${artistId}/large.mp3`, new ArrayBuffer(size))

    const result = await calculateStorageUsage(bucket, artistId)
    expect(result.success).toBe(true)
    expect(result.data?.quotaPercentUsed).toBeCloseTo(50, 1)
  })
})
