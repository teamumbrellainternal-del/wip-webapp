/**
 * Test Helper: Mock Environment Setup
 * Provides consistent mock implementations of Cloudflare bindings (D1, KV, R2)
 * for integration and E2E testing
 */

import type { Env } from '../../api/index'

/**
 * Mock KV Namespace with TTL support
 */
export class MockKVNamespace implements KVNamespace {
  private store = new Map<string, { value: string; expiration?: number; metadata?: any }>()

  async get(key: string, options?: { type?: 'text' | 'json' | 'arrayBuffer' | 'stream' }): Promise<any> {
    const item = this.store.get(key)
    if (!item) return null

    if (item.expiration && Date.now() > item.expiration) {
      this.store.delete(key)
      return null
    }

    if (options?.type === 'json') {
      return JSON.parse(item.value)
    }

    return item.value
  }

  async put(
    key: string,
    value: string | ReadableStream | ArrayBuffer,
    options?: { expirationTtl?: number; expiration?: number; metadata?: any }
  ): Promise<void> {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value)

    let expiration: number | undefined
    if (options?.expirationTtl) {
      expiration = Date.now() + options.expirationTtl * 1000
    } else if (options?.expiration) {
      expiration = options.expiration * 1000
    }

    this.store.set(key, {
      value: stringValue,
      expiration,
      metadata: options?.metadata,
    })
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key)
  }

  async list(options?: {
    prefix?: string
    limit?: number
    cursor?: string
  }): Promise<KVNamespaceListResult<unknown, string>> {
    const keys = Array.from(this.store.keys())
      .filter((k) => !options?.prefix || k.startsWith(options.prefix))
      .slice(0, options?.limit || 1000)
      .map((name) => ({ name }))

    return {
      keys,
      list_complete: true,
      cursor: '',
    }
  }

  async getWithMetadata<Metadata = unknown>(
    key: string
  ): Promise<KVNamespaceGetWithMetadataResult<string, Metadata>> {
    const item = this.store.get(key)
    if (!item) {
      return { value: null, metadata: null }
    }

    if (item.expiration && Date.now() > item.expiration) {
      this.store.delete(key)
      return { value: null, metadata: null }
    }

    return {
      value: item.value,
      metadata: item.metadata || null,
    }
  }

  clear() {
    this.store.clear()
  }

  getSize(): number {
    return this.store.size
  }

  getAllKeys(): string[] {
    return Array.from(this.store.keys())
  }
}

/**
 * Mock R2 Bucket
 */
export class MockR2Bucket implements R2Bucket {
  private objects = new Map<string, { data: ArrayBuffer | string; metadata?: Record<string, string> }>()

  async get(key: string): Promise<R2ObjectBody | null> {
    const obj = this.objects.get(key)
    if (!obj) return null

    const data = typeof obj.data === 'string' ? new TextEncoder().encode(obj.data) : obj.data

    return {
      key,
      version: 'v1',
      size: data.byteLength,
      etag: 'mock-etag',
      httpEtag: 'mock-http-etag',
      checksums: {},
      uploaded: new Date(),
      httpMetadata: {},
      customMetadata: obj.metadata || {},
      range: undefined,
      body: new ReadableStream({
        start(controller) {
          controller.enqueue(data)
          controller.close()
        },
      }),
      bodyUsed: false,
      arrayBuffer: async () => data,
      text: async () => new TextDecoder().decode(data),
      json: async () => JSON.parse(new TextDecoder().decode(data)),
      blob: async () => new Blob([data]),
      writeHttpMetadata: () => {},
    } as R2ObjectBody
  }

  async put(
    key: string,
    value: ReadableStream | ArrayBuffer | ArrayBufferView | string | Blob,
    options?: R2PutOptions
  ): Promise<R2Object> {
    let data: ArrayBuffer | string

    if (typeof value === 'string') {
      data = value
    } else if (value instanceof ArrayBuffer) {
      data = value
    } else if (value instanceof ReadableStream) {
      // Simplified: just store a placeholder
      data = 'stream-data'
    } else {
      data = 'blob-data'
    }

    this.objects.set(key, {
      data,
      metadata: options?.customMetadata,
    })

    return {
      key,
      version: 'v1',
      size: typeof data === 'string' ? data.length : data.byteLength,
      etag: 'mock-etag',
      httpEtag: 'mock-http-etag',
      checksums: {},
      uploaded: new Date(),
      httpMetadata: {},
      customMetadata: options?.customMetadata || {},
      range: undefined,
      writeHttpMetadata: () => {},
    }
  }

  async delete(keys: string | string[]): Promise<void> {
    const keysArray = Array.isArray(keys) ? keys : [keys]
    keysArray.forEach((key) => this.objects.delete(key))
  }

  async head(key: string): Promise<R2Object | null> {
    const obj = this.objects.get(key)
    if (!obj) return null

    const data = typeof obj.data === 'string' ? new TextEncoder().encode(obj.data) : obj.data

    return {
      key,
      version: 'v1',
      size: data.byteLength,
      etag: 'mock-etag',
      httpEtag: 'mock-http-etag',
      checksums: {},
      uploaded: new Date(),
      httpMetadata: {},
      customMetadata: obj.metadata || {},
      range: undefined,
      writeHttpMetadata: () => {},
    }
  }

  async list(options?: R2ListOptions): Promise<R2Objects> {
    const keys = Array.from(this.objects.keys())
      .filter((k) => !options?.prefix || k.startsWith(options.prefix))
      .slice(0, options?.limit || 1000)

    const objects = await Promise.all(
      keys.map(async (key) => {
        const head = await this.head(key)
        return head!
      })
    )

    return {
      objects,
      truncated: false,
      cursor: undefined,
      delimitedPrefixes: [],
    }
  }

  async createMultipartUpload(_key: string): Promise<R2MultipartUpload> {
    throw new Error('Multipart upload not implemented in mock')
  }

  async resumeMultipartUpload(_key: string, _uploadId: string): Promise<R2MultipartUpload> {
    throw new Error('Multipart upload not implemented in mock')
  }

  clear() {
    this.objects.clear()
  }

  getSize(): number {
    return this.objects.size
  }

  getAllKeys(): string[] {
    return Array.from(this.objects.keys())
  }
}

/**
 * Mock D1 Database with comprehensive state management
 */
export class MockD1Database implements D1Database {
  private tables = new Map<string, Map<string, any>>()

  constructor() {
    // Initialize empty tables
    this.tables.set('users', new Map())
    this.tables.set('artists', new Map())
    this.tables.set('tracks', new Map())
    this.tables.set('gigs', new Map())
    this.tables.set('gig_applications', new Map())
    this.tables.set('messages', new Map())
    this.tables.set('conversations', new Map())
    this.tables.set('reviews', new Map())
    this.tables.set('files', new Map())
    this.tables.set('analytics_daily', new Map())
    this.tables.set('violet_prompts', new Map())
    this.tables.set('email_delivery_log', new Map())
    this.tables.set('email_delivery_queue', new Map())
    this.tables.set('unsubscribe_list', new Map())
    this.tables.set('sms_delivery_log', new Map())
    this.tables.set('sms_delivery_queue', new Map())
  }

  prepare(query: string): D1PreparedStatement {
    const mockStatement: any = {
      bind: (...values: any[]) => {
        return {
          ...mockStatement,
          first: async () => this.executeQuery(query, values, 'first'),
          all: async () => {
            const results = this.executeQuery(query, values, 'all')
            return { results, success: true, meta: {} }
          },
          run: async () => {
            const result = this.executeQuery(query, values, 'run')
            return { success: true, meta: { changes: result?.changes || 0 } }
          },
          raw: async () => this.executeQuery(query, values, 'raw'),
        }
      },
    }

    return mockStatement
  }

  private executeQuery(query: string, values: any[], mode: string): any {
    const normalizedQuery = query.toLowerCase().trim()

    // SELECT queries
    if (normalizedQuery.startsWith('select')) {
      return this.handleSelect(normalizedQuery, values, mode)
    }

    // INSERT queries
    if (normalizedQuery.startsWith('insert')) {
      return this.handleInsert(normalizedQuery, values)
    }

    // UPDATE queries
    if (normalizedQuery.startsWith('update')) {
      return this.handleUpdate(normalizedQuery, values)
    }

    // DELETE queries
    if (normalizedQuery.startsWith('delete')) {
      return this.handleDelete(normalizedQuery, values)
    }

    return mode === 'all' ? [] : null
  }

  private handleSelect(query: string, values: any[], mode: string): any {
    // Users table
    if (query.includes('from users')) {
      const users = this.tables.get('users')!

      if (query.includes('where oauth_provider') && query.includes('oauth_id')) {
        const [provider, oauthId] = values
        const result = Array.from(users.values()).find(
          (u) => u.oauth_provider === provider && u.oauth_id === oauthId
        )
        return mode === 'all' ? (result ? [result] : []) : result || null
      }

      if (query.includes('where id')) {
        const result = users.get(values[0])
        return mode === 'all' ? (result ? [result] : []) : result || null
      }

      if (query.includes('where email')) {
        const result = Array.from(users.values()).find((u) => u.email === values[0])
        return mode === 'all' ? (result ? [result] : []) : result || null
      }
    }

    // Artists table
    if (query.includes('from artists')) {
      const artists = this.tables.get('artists')!

      if (query.includes('where user_id')) {
        const result = Array.from(artists.values()).find((a) => a.user_id === values[0])
        return mode === 'all' ? (result ? [result] : []) : result || null
      }

      if (query.includes('where id')) {
        const result = artists.get(values[0])
        return mode === 'all' ? (result ? [result] : []) : result || null
      }

      if (mode === 'all' && !query.includes('where')) {
        return Array.from(artists.values())
      }
    }

    // Gig applications
    if (query.includes('from gig_applications')) {
      const applications = this.tables.get('gig_applications')!

      if (query.includes('where artist_id') && query.includes('gig_id')) {
        const [artistId, gigId] = values
        const result = Array.from(applications.values()).find(
          (a) => a.artist_id === artistId && a.gig_id === gigId
        )
        return mode === 'all' ? (result ? [result] : []) : result || null
      }

      if (query.includes('where artist_id')) {
        const results = Array.from(applications.values()).filter((a) => a.artist_id === values[0])
        return mode === 'all' ? results : results[0] || null
      }
    }

    // Violet prompts (for rate limiting)
    if (query.includes('from violet_prompts')) {
      const prompts = this.tables.get('violet_prompts')!

      if (query.includes('count(*)') && query.includes('where artist_id')) {
        const count = Array.from(prompts.values()).filter(
          (p) => p.artist_id === values[0] && p.created_at >= values[1]
        ).length
        return mode === 'all' ? [{ count }] : { count }
      }
    }

    // Email delivery queue
    if (query.includes('from email_delivery_queue')) {
      const queue = this.tables.get('email_delivery_queue')!

      if (query.includes('where status') && query.includes('order by created_at')) {
        const results = Array.from(queue.values())
          .filter((item) => item.status === values[0])
          .filter((item) => !values[1] || !item.nextRetryAt || item.nextRetryAt <= values[1])
          .sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''))
          .slice(0, query.includes('limit') ? 100 : undefined)

        return mode === 'all' ? results : results[0] || null
      }
    }

    // Unsubscribe list
    if (query.includes('from unsubscribe_list')) {
      const unsubscribeList = this.tables.get('unsubscribe_list')!

      if (query.includes('where email')) {
        const result = Array.from(unsubscribeList.values()).find((entry) => entry.email === values[0])
        return mode === 'all' ? (result ? [result] : []) : result || null
      }
    }

    // SMS delivery log
    if (query.includes('from sms_delivery_log')) {
      const logs = this.tables.get('sms_delivery_log')!

      if (query.includes('where artist_id') && query.includes('created_at >=')) {
        const [artistId, cutoffDate] = values
        const results = Array.from(logs.values()).filter(
          (log) => log.artistId === artistId && log.createdAt >= cutoffDate
        )

        // Handle COUNT queries
        if (query.includes('count(*)')) {
          const totalSent = results.length
          const successCount = results.filter((log) => log.status === 'success').length
          const failureCount = results.filter((log) =>
            log.status === 'failed' || log.status === 'undelivered'
          ).length

          return mode === 'all'
            ? [{ total_sent: totalSent, success_count: successCount, failure_count: failureCount }]
            : { total_sent: totalSent, success_count: successCount, failure_count: failureCount }
        }

        return mode === 'all' ? results : results[0] || null
      }

      if (mode === 'all' && !query.includes('where')) {
        return Array.from(logs.values())
      }
    }

    // SMS delivery queue
    if (query.includes('from sms_delivery_queue')) {
      const queue = this.tables.get('sms_delivery_queue')!

      if (query.includes('where status') && query.includes('order by created_at')) {
        const results = Array.from(queue.values())
          .filter((item) => item.status === values[0])
          .filter((item) => !values[1] || !item.nextRetryAt || item.nextRetryAt <= values[1])
          .sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''))
          .slice(0, query.includes('limit') ? 100 : undefined)

        return mode === 'all' ? results : results[0] || null
      }

      if (mode === 'all' && !query.includes('where')) {
        return Array.from(queue.values())
      }
    }

    return mode === 'all' ? [] : null
  }

  private handleInsert(query: string, values: any[]): any {
    if (query.includes('into users')) {
      const users = this.tables.get('users')!
      const [id, oauth_provider, oauth_id, email, onboarding_complete, created_at, updated_at] =
        values
      users.set(id, {
        id,
        oauth_provider,
        oauth_id,
        email,
        onboarding_complete,
        created_at,
        updated_at,
      })
      return { changes: 1 }
    }

    if (query.includes('into artists')) {
      const artists = this.tables.get('artists')!
      const id = values[0]
      const artistData: any = { id }

      // Parse INSERT columns
      const columnsMatch = query.match(/\(([^)]+)\)/)
      if (columnsMatch) {
        const columns = columnsMatch[1].split(',').map((c) => c.trim())
        columns.forEach((col, idx) => {
          artistData[col] = values[idx]
        })
      }

      artists.set(id, artistData)
      return { changes: 1 }
    }

    if (query.includes('into gig_applications')) {
      const applications = this.tables.get('gig_applications')!
      const id = values[0]
      applications.set(id, {
        id,
        gig_id: values[1],
        artist_id: values[2],
        message: values[3],
        status: values[4],
        created_at: values[5],
      })
      return { changes: 1 }
    }

    if (query.includes('into violet_prompts')) {
      const prompts = this.tables.get('violet_prompts')!
      const id = values[0]
      prompts.set(id, {
        id,
        artist_id: values[1],
        prompt: values[2],
        response: values[3],
        created_at: values[4],
      })
      return { changes: 1 }
    }

    // Email delivery log
    if (query.includes('into email_delivery_log')) {
      const logs = this.tables.get('email_delivery_log')!
      const id = values[0]
      logs.set(id, {
        id,
        toEmail: values[1],
        subject: values[2],
        templateType: values[3],
        status: values[4],
        errorMessage: values[5],
        externalId: values[6],
        artistId: values[7],
        createdAt: values[8],
      })
      return { changes: 1 }
    }

    // Email delivery queue
    if (query.includes('into email_delivery_queue')) {
      const queue = this.tables.get('email_delivery_queue')!
      const id = values[0]
      queue.set(id, {
        id,
        toEmail: values[1],
        fromEmail: values[2],
        subject: values[3],
        htmlBody: values[4],
        textBody: values[5],
        templateType: values[6],
        retryCount: values[7],
        maxRetries: values[8],
        nextRetryAt: values[9],
        status: values[10],
        artistId: values[11],
        createdAt: values[12],
        updatedAt: values[13],
        lastError: null,
      })
      return { changes: 1 }
    }

    // Unsubscribe list
    if (query.includes('into unsubscribe_list') || query.includes('insert or ignore into unsubscribe_list')) {
      const unsubscribeList = this.tables.get('unsubscribe_list')!
      const id = values[0]
      const email = values[1]

      // Check if email already exists (for INSERT OR IGNORE)
      const exists = Array.from(unsubscribeList.values()).some((entry) => entry.email === email)
      if (query.includes('or ignore') && exists) {
        return { changes: 0 }
      }

      unsubscribeList.set(id, {
        id,
        email,
        artistId: values[2],
        reason: values[3],
        createdAt: values[4],
      })
      return { changes: 1 }
    }

    // SMS delivery log
    if (query.includes('into sms_delivery_log')) {
      const logs = this.tables.get('sms_delivery_log')!
      const id = values[0]
      logs.set(id, {
        id,
        toPhone: values[1],
        messageType: values[2],
        status: values[3],
        errorMessage: values[4],
        externalId: values[5],
        artistId: values[6],
        createdAt: values[7],
      })
      return { changes: 1 }
    }

    // SMS delivery queue
    if (query.includes('into sms_delivery_queue')) {
      const queue = this.tables.get('sms_delivery_queue')!
      const id = values[0]
      queue.set(id, {
        id,
        toPhone: values[1],
        fromPhone: values[2],
        message: values[3],
        messageType: values[4],
        retryCount: values[5],
        maxRetries: values[6],
        nextRetryAt: values[7],
        status: values[8],
        artistId: values[9],
        createdAt: values[10],
        updatedAt: values[11],
        lastError: null,
      })
      return { changes: 1 }
    }

    return { changes: 1 }
  }

  private handleUpdate(query: string, values: any[]): any {
    if (query.includes('update users')) {
      const users = this.tables.get('users')!
      const userId = values[values.length - 1]
      const user = users.get(userId)

      if (user && query.includes('onboarding_complete')) {
        user.onboarding_complete = values[0]
        users.set(userId, user)
        return { changes: 1 }
      }
    }

    if (query.includes('update artists')) {
      const artists = this.tables.get('artists')!
      const artistId = values[values.length - 1]
      const artist = artists.get(artistId)

      if (artist) {
        // Update fields based on query
        Object.assign(artist, { updated_at: new Date().toISOString() })
        artists.set(artistId, artist)
        return { changes: 1 }
      }
    }

    // Email delivery queue updates
    if (query.includes('update email_delivery_queue')) {
      const queue = this.tables.get('email_delivery_queue')!
      const itemId = values[values.length - 1]
      const item = queue.get(itemId)

      if (item) {
        const now = new Date().toISOString()

        // Update status
        if (query.includes('set status')) {
          item.status = values[0]
          item.updatedAt = values[1] || now
        }

        // Update retry count and next retry time
        if (query.includes('retry_count')) {
          item.retryCount = values[0]
          item.nextRetryAt = values[1]
          item.lastError = values[2]
          item.status = values[3]
          item.updatedAt = values[4] || now
        }

        // Update last error
        if (query.includes('last_error') && !query.includes('retry_count')) {
          item.status = values[0]
          item.lastError = values[1]
          item.updatedAt = values[2] || now
        }

        queue.set(itemId, item)
        return { changes: 1 }
      }
    }

    // SMS delivery queue updates
    if (query.includes('update sms_delivery_queue')) {
      const queue = this.tables.get('sms_delivery_queue')!
      const itemId = values[values.length - 1]
      const item = queue.get(itemId)

      if (item) {
        const now = new Date().toISOString()

        // Update status
        if (query.includes('set status') && !query.includes('retry_count')) {
          item.status = values[0]
          item.updatedAt = values[1] || now
        }

        // Update retry count and next retry time
        if (query.includes('retry_count')) {
          item.retryCount = values[0]
          item.nextRetryAt = values[1]
          item.lastError = values[2]
          item.status = values[3]
          item.updatedAt = values[4] || now
        }

        // Update last error
        if (query.includes('last_error') && !query.includes('retry_count') && !query.includes('set status')) {
          item.status = values[0]
          item.lastError = values[1]
          item.updatedAt = values[2] || now
        }

        queue.set(itemId, item)
        return { changes: 1 }
      }
    }

    return { changes: 0 }
  }

  private handleDelete(query: string, values: any[]): any {
    if (query.includes('from users')) {
      this.tables.get('users')!.delete(values[0])
      return { changes: 1 }
    }

    if (query.includes('from artists')) {
      this.tables.get('artists')!.delete(values[0])
      return { changes: 1 }
    }

    return { changes: 0 }
  }

  async dump(): Promise<ArrayBuffer> {
    throw new Error('Not implemented')
  }

  async batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]> {
    return Promise.all(statements.map((stmt: any) => stmt.run()))
  }

  async exec(_query: string): Promise<D1ExecResult> {
    return { count: 0, duration: 0 }
  }

  // Test helper methods
  getTableSize(tableName: string): number {
    return this.tables.get(tableName)?.size || 0
  }

  getTable(tableName: string): any[] {
    return Array.from(this.tables.get(tableName)?.values() || [])
  }

  clear() {
    this.tables.forEach((table) => table.clear())
  }

  clearTable(tableName: string) {
    this.tables.get(tableName)?.clear()
  }
}

/**
 * Create a complete mock environment for testing
 */
export function createMockEnv(overrides?: Partial<Env>): {
  env: Env
  mocks: {
    kv: MockKVNamespace
    db: MockD1Database
    bucket: MockR2Bucket
  }
} {
  const mockKV = new MockKVNamespace()
  const mockDB = new MockD1Database()
  const mockBucket = new MockR2Bucket()

  const env: Env = {
    DB: mockDB as any,
    KV: mockKV as any,
    BUCKET: mockBucket as any,
    JWT_SECRET: 'test-secret-key-32-chars-long!',
    CLAUDE_API_KEY: 'test-claude-api-key',
    RESEND_API_KEY: 'test-resend-api-key',
    TWILIO_ACCOUNT_SID: 'test-twilio-sid',
    TWILIO_AUTH_TOKEN: 'test-twilio-token',
    TWILIO_PHONE_NUMBER: '+15555551234',
    ...overrides,
  }

  return {
    env,
    mocks: {
      kv: mockKV,
      db: mockDB,
      bucket: mockBucket,
    },
  }
}

/**
 * Create authenticated request with valid JWT token
 */
export function createAuthRequest(
  url: string,
  token: string,
  options: RequestInit = {}
): Request {
  return new Request(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  })
}
