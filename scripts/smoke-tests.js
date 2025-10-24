/**
 * Smoke Tests for Production Deployment
 * Quick validation that critical endpoints are working after deployment
 */

const API_URL = process.env.API_URL || 'https://api.umbrella.example.com'
const SMOKE_TEST_TOKEN = process.env.SMOKE_TEST_TOKEN

async function runSmokeTests() {
  console.log(`🧪 Running smoke tests against ${API_URL}\n`)

  let passed = 0
  let failed = 0

  // Test 1: Health Check
  console.log('Test 1: Health check endpoint')
  try {
    const response = await fetch(`${API_URL}/v1/health`)
    const data = await response.json()

    if (response.status === 200 && data.success === true) {
      console.log('  ✅ PASSED - Health check returned 200\n')
      passed++
    } else {
      console.error(`  ❌ FAILED - Health check returned ${response.status}\n`)
      failed++
    }
  } catch (error) {
    console.error(`  ❌ FAILED - ${error.message}\n`)
    failed++
  }

  // Test 2: CORS Headers
  console.log('Test 2: CORS headers')
  try {
    const response = await fetch(`${API_URL}/v1/health`, {
      method: 'OPTIONS',
    })

    const corsHeader = response.headers.get('access-control-allow-origin')
    if (corsHeader) {
      console.log('  ✅ PASSED - CORS headers present\n')
      passed++
    } else {
      console.error('  ❌ FAILED - CORS headers missing\n')
      failed++
    }
  } catch (error) {
    console.error(`  ❌ FAILED - ${error.message}\n`)
    failed++
  }

  // Test 3: 404 Handling
  console.log('Test 3: 404 handling for non-existent endpoint')
  try {
    const response = await fetch(`${API_URL}/v1/nonexistent-endpoint`)
    const data = await response.json()

    if (response.status === 404 && data.success === false) {
      console.log('  ✅ PASSED - 404 properly returned\n')
      passed++
    } else {
      console.error(`  ❌ FAILED - Expected 404, got ${response.status}\n`)
      failed++
    }
  } catch (error) {
    console.error(`  ❌ FAILED - ${error.message}\n`)
    failed++
  }

  // Test 4: Auth endpoint exists
  console.log('Test 4: Auth callback endpoint')
  try {
    const response = await fetch(`${API_URL}/v1/auth/callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}), // Invalid payload intentionally
    })

    if (response.status === 400 || response.status === 401) {
      console.log('  ✅ PASSED - Auth endpoint responding\n')
      passed++
    } else {
      console.error(`  ❌ FAILED - Auth endpoint returned ${response.status}\n`)
      failed++
    }
  } catch (error) {
    console.error(`  ❌ FAILED - ${error.message}\n`)
    failed++
  }

  // Test 5: Public artist discovery endpoint
  console.log('Test 5: Public artist discovery')
  try {
    const response = await fetch(`${API_URL}/v1/artists?limit=1`)
    const data = await response.json()

    if (response.status === 200) {
      console.log('  ✅ PASSED - Artist discovery endpoint responding\n')
      passed++
    } else {
      console.error(`  ❌ FAILED - Artist discovery returned ${response.status}\n`)
      failed++
    }
  } catch (error) {
    console.error(`  ❌ FAILED - ${error.message}\n`)
    failed++
  }

  // Test 6: Public gigs endpoint
  console.log('Test 6: Public gigs listing')
  try {
    const response = await fetch(`${API_URL}/v1/gigs?limit=1`)
    const data = await response.json()

    if (response.status === 200) {
      console.log('  ✅ PASSED - Gigs endpoint responding\n')
      passed++
    } else {
      console.error(`  ❌ FAILED - Gigs endpoint returned ${response.status}\n`)
      failed++
    }
  } catch (error) {
    console.error(`  ❌ FAILED - ${error.message}\n`)
    failed++
  }

  // Test 7: Protected endpoint without auth
  console.log('Test 7: Protected endpoint authentication')
  try {
    const response = await fetch(`${API_URL}/v1/profile`)

    if (response.status === 401) {
      console.log('  ✅ PASSED - Protected endpoint requires authentication\n')
      passed++
    } else {
      console.error(`  ❌ FAILED - Expected 401, got ${response.status}\n`)
      failed++
    }
  } catch (error) {
    console.error(`  ❌ FAILED - ${error.message}\n`)
    failed++
  }

  // Test 8: Response format validation
  console.log('Test 8: Response format validation')
  try {
    const response = await fetch(`${API_URL}/v1/health`)
    const data = await response.json()

    const hasSuccess = 'success' in data
    const hasMeta = 'meta' in data
    const hasTimestamp = data.meta && 'timestamp' in data.meta

    if (hasSuccess && hasMeta && hasTimestamp) {
      console.log('  ✅ PASSED - Response format is correct\n')
      passed++
    } else {
      console.error('  ❌ FAILED - Response format is incorrect\n')
      failed++
    }
  } catch (error) {
    console.error(`  ❌ FAILED - ${error.message}\n`)
    failed++
  }

  // Summary
  console.log('='.repeat(60))
  console.log(`\nSmoke Test Results:`)
  console.log(`  ✅ Passed: ${passed}`)
  console.log(`  ❌ Failed: ${failed}`)
  console.log(`  📊 Total:  ${passed + failed}`)

  if (failed > 0) {
    console.error('\n❌ SMOKE TESTS FAILED')
    console.error('Deployment verification unsuccessful.')
    process.exit(1)
  } else {
    console.log('\n✅ ALL SMOKE TESTS PASSED')
    console.log('Deployment verified successfully.')
  }
}

// Run smoke tests
runSmokeTests().catch((error) => {
  console.error(`\n❌ Smoke test error: ${error.message}`)
  process.exit(1)
})
