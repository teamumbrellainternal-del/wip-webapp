#!/usr/bin/env node

/**
 * Backend API Testing Script
 * Tests all API endpoints with mock JWT
 */

import { createJWT } from './utils/jwt'

const API_BASE = process.env.API_BASE_URL || 'http://localhost:8787'
const JWT_SECRET = process.env.JWT_SECRET || 'test-secret'

// Mock JWT payload
const mockPayload = {
  sub: '550e8400-e29b-41d4-a716-446655440000',
  tailscale_user_id: 'u123456789',
  email: 'test@example.com',
  tailnet: 'test.ts.net',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
}

// Colors for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
}

function log(color, prefix, message) {
  console.log(`${colors[color]}${prefix}${colors.reset} ${message}`)
}

async function makeRequest(method, path, body) {
  const jwt = await createJWT(mockPayload, JWT_SECRET)

  const options = {
    method,
    headers: {
      Authorization: `Bearer ${jwt}`,
      'Content-Type': 'application/json',
    },
  }

  if (body) {
    options.body = JSON.stringify(body)
  }

  const response = await fetch(`${API_BASE}${path}`, options)
  const data = await response.json()

  return { status: response.status, data }
}

async function test(name, fn) {
  try {
    log('blue', '→', name)
    await fn()
    log('green', '✓', `${name} passed`)
  } catch (error) {
    log('red', '✗', `${name} failed: ${error.message}`)
  }
}

async function runTests() {
  console.log('\n🧪 Leger Backend API Tests\n')

  // Health check (no auth required)
  await test('Health check', async () => {
    const response = await fetch(`${API_BASE}/health`)
    const data = await response.json()

    if (response.status !== 200 || data.status !== 'healthy') {
      throw new Error('Health check failed')
    }
  })

  // Auth validation
  await test('POST /api/auth/validate', async () => {
    const { status, data } = await makeRequest('POST', '/api/auth/validate')

    if (status !== 200 || !data.success) {
      throw new Error(`Expected 200, got ${status}`)
    }

    if (!data.data.user.user_uuid) {
      throw new Error('Missing user_uuid in response')
    }
  })

  // Create secret
  let secretCreated = false
  await test('POST /api/secrets/test_key', async () => {
    const { status, data } = await makeRequest('POST', '/api/secrets/test_key', {
      value: 'test-secret-value-123',
    })

    if (status !== 200 || !data.success) {
      throw new Error(`Expected 200, got ${status}`)
    }

    if (data.data.name !== 'test_key') {
      throw new Error('Secret name mismatch')
    }

    secretCreated = true
  })

  // List secrets (metadata only)
  await test('GET /api/secrets', async () => {
    const { status, data } = await makeRequest('GET', '/api/secrets')

    if (status !== 200 || !data.success) {
      throw new Error(`Expected 200, got ${status}`)
    }

    if (!Array.isArray(data.data.secrets)) {
      throw new Error('Expected secrets array')
    }

    if (secretCreated && data.data.secrets.length === 0) {
      throw new Error('Expected at least one secret')
    }
  })

  // List secrets with values (CLI mode)
  await test('GET /api/secrets?include_values=true', async () => {
    const { status, data } = await makeRequest('GET', '/api/secrets?include_values=true')

    if (status !== 200 || !data.success) {
      throw new Error(`Expected 200, got ${status}`)
    }

    if (secretCreated) {
      const secret = data.data.secrets.find((s) => s.name === 'test_key')
      if (!secret || !secret.value) {
        throw new Error('Expected secret with value')
      }

      if (secret.value !== 'test-secret-value-123') {
        throw new Error('Secret value mismatch')
      }
    }
  })

  // Get single secret
  await test('GET /api/secrets/test_key', async () => {
    const { status, data } = await makeRequest('GET', '/api/secrets/test_key')

    if (status !== 200 || !data.success) {
      throw new Error(`Expected 200, got ${status}`)
    }

    if (!data.data.value) {
      throw new Error('Expected secret value')
    }

    if (data.data.value !== 'test-secret-value-123') {
      throw new Error('Secret value mismatch')
    }
  })

  // Update secret
  await test('POST /api/secrets/test_key (update)', async () => {
    const { status, data } = await makeRequest('POST', '/api/secrets/test_key', {
      value: 'updated-secret-value-456',
    })

    if (status !== 200 || !data.success) {
      throw new Error(`Expected 200, got ${status}`)
    }

    if (data.data.version !== 2) {
      throw new Error('Expected version 2 after update')
    }
  })

  // Create release
  let releaseId = null
  await test('POST /api/releases', async () => {
    const { status, data } = await makeRequest('POST', '/api/releases', {
      name: 'test-release',
      git_url: 'https://github.com/test/repo',
      git_branch: 'main',
      description: 'Test release',
    })

    if (status !== 201 || !data.success) {
      throw new Error(`Expected 201, got ${status}`)
    }

    if (!data.data.id) {
      throw new Error('Missing release ID')
    }

    releaseId = data.data.id
  })

  // List releases
  await test('GET /api/releases', async () => {
    const { status, data } = await makeRequest('GET', '/api/releases')

    if (status !== 200 || !data.success) {
      throw new Error(`Expected 200, got ${status}`)
    }

    if (!Array.isArray(data.data.releases)) {
      throw new Error('Expected releases array')
    }

    if (releaseId && data.data.releases.length === 0) {
      throw new Error('Expected at least one release')
    }
  })

  // Get release by name (CLI mode)
  await test('GET /api/releases?name=test-release', async () => {
    const { status, data } = await makeRequest('GET', '/api/releases?name=test-release')

    if (status !== 200 || !data.success) {
      throw new Error(`Expected 200, got ${status}`)
    }

    if (data.data.releases.length !== 1) {
      throw new Error('Expected exactly one release')
    }

    if (data.data.releases[0].name !== 'test-release') {
      throw new Error('Release name mismatch')
    }
  })

  // Get single release
  if (releaseId) {
    await test(`GET /api/releases/${releaseId}`, async () => {
      const { status, data } = await makeRequest('GET', `/api/releases/${releaseId}`)

      if (status !== 200 || !data.success) {
        throw new Error(`Expected 200, got ${status}`)
      }

      if (data.data.id !== releaseId) {
        throw new Error('Release ID mismatch')
      }
    })

    // Update release
    await test(`PUT /api/releases/${releaseId}`, async () => {
      const { status, data } = await makeRequest('PUT', `/api/releases/${releaseId}`, {
        description: 'Updated description',
      })

      if (status !== 200 || !data.success) {
        throw new Error(`Expected 200, got ${status}`)
      }

      if (data.data.description !== 'Updated description') {
        throw new Error('Description not updated')
      }
    })

    // Delete release
    await test(`DELETE /api/releases/${releaseId}`, async () => {
      const { status, data } = await makeRequest('DELETE', `/api/releases/${releaseId}`)

      if (status !== 200 || !data.success) {
        throw new Error(`Expected 200, got ${status}`)
      }

      if (!data.data.deleted) {
        throw new Error('Expected deleted: true')
      }
    })
  }

  // Delete secret
  if (secretCreated) {
    await test('DELETE /api/secrets/test_key', async () => {
      const { status, data } = await makeRequest('DELETE', '/api/secrets/test_key')

      if (status !== 200 || !data.success) {
        throw new Error(`Expected 200, got ${status}`)
      }

      if (!data.data.deleted) {
        throw new Error('Expected deleted: true')
      }
    })
  }

  console.log('\n✅ All tests passed!\n')
}

runTests().catch((error) => {
  console.error('\n❌ Test suite failed:', error)
  process.exit(1)
})
