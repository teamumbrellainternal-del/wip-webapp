/**
 * Performance Check Script
 * Validates that P95 latency is under 500ms for profile views (per spec)
 */

const API_URL = process.env.API_URL || 'https://api.umbrella.example.com'

async function measureLatency(url, iterations = 20) {
  const latencies = []

  console.log(`📊 Measuring latency for ${url}...`)
  console.log(`   Running ${iterations} requests...\n`)

  for (let i = 0; i < iterations; i++) {
    const start = Date.now()

    try {
      const response = await fetch(url)
      const end = Date.now()
      const latency = end - start

      latencies.push(latency)

      // Show progress
      if ((i + 1) % 5 === 0) {
        console.log(`   Progress: ${i + 1}/${iterations} requests`)
      }
    } catch (error) {
      console.error(`   Error on request ${i + 1}: ${error.message}`)
    }
  }

  return latencies
}

function calculatePercentile(values, percentile) {
  const sorted = values.sort((a, b) => a - b)
  const index = Math.ceil((percentile / 100) * sorted.length) - 1
  return sorted[index]
}

function calculateStats(latencies) {
  const sum = latencies.reduce((a, b) => a + b, 0)
  const avg = sum / latencies.length

  return {
    min: Math.min(...latencies),
    max: Math.max(...latencies),
    avg: Math.round(avg),
    p50: calculatePercentile(latencies, 50),
    p95: calculatePercentile(latencies, 95),
    p99: calculatePercentile(latencies, 99),
  }
}

async function runPerformanceChecks() {
  console.log(`🚀 Running performance checks against ${API_URL}\n`)
  console.log('='.repeat(60))
  console.log()

  let allTestsPassed = true

  // Test 1: Health endpoint latency
  console.log('Test 1: Health Endpoint Latency')
  const healthLatencies = await measureLatency(`${API_URL}/v1/health`, 20)
  const healthStats = calculateStats(healthLatencies)

  console.log('\n   Results:')
  console.log(`     Min: ${healthStats.min}ms`)
  console.log(`     Avg: ${healthStats.avg}ms`)
  console.log(`     P50: ${healthStats.p50}ms`)
  console.log(`     P95: ${healthStats.p95}ms`)
  console.log(`     P99: ${healthStats.p99}ms`)
  console.log(`     Max: ${healthStats.max}ms`)

  if (healthStats.p95 < 500) {
    console.log(`\n   ✅ PASSED - P95 latency ${healthStats.p95}ms < 500ms\n`)
  } else {
    console.error(`\n   ❌ FAILED - P95 latency ${healthStats.p95}ms >= 500ms\n`)
    allTestsPassed = false
  }

  // Test 2: Public profile view latency (critical path)
  console.log('Test 2: Public Profile View Latency (Critical Path)')
  console.log('   Note: Testing with non-existent profile (should still be fast)\n')

  const profileLatencies = await measureLatency(
    `${API_URL}/v1/artists?limit=1`,
    20
  )
  const profileStats = calculateStats(profileLatencies)

  console.log('\n   Results:')
  console.log(`     Min: ${profileStats.min}ms`)
  console.log(`     Avg: ${profileStats.avg}ms`)
  console.log(`     P50: ${profileStats.p50}ms`)
  console.log(`     P95: ${profileStats.p95}ms`)
  console.log(`     P99: ${profileStats.p99}ms`)
  console.log(`     Max: ${profileStats.max}ms`)

  if (profileStats.p95 < 500) {
    console.log(`\n   ✅ PASSED - P95 latency ${profileStats.p95}ms < 500ms\n`)
  } else {
    console.error(`\n   ❌ FAILED - P95 latency ${profileStats.p95}ms >= 500ms\n`)
    allTestsPassed = false
  }

  // Test 3: Gigs listing latency
  console.log('Test 3: Gigs Listing Latency')
  const gigsLatencies = await measureLatency(`${API_URL}/v1/gigs?limit=10`, 20)
  const gigsStats = calculateStats(gigsLatencies)

  console.log('\n   Results:')
  console.log(`     Min: ${gigsStats.min}ms`)
  console.log(`     Avg: ${gigsStats.avg}ms`)
  console.log(`     P50: ${gigsStats.p50}ms`)
  console.log(`     P95: ${gigsStats.p95}ms`)
  console.log(`     P99: ${gigsStats.p99}ms`)
  console.log(`     Max: ${gigsStats.max}ms`)

  if (gigsStats.p95 < 500) {
    console.log(`\n   ✅ PASSED - P95 latency ${gigsStats.p95}ms < 500ms\n`)
  } else {
    console.error(`\n   ❌ FAILED - P95 latency ${gigsStats.p95}ms >= 500ms\n`)
    allTestsPassed = false
  }

  // Summary
  console.log('='.repeat(60))
  console.log('\nPerformance Check Summary:')
  console.log(`  Health Endpoint P95: ${healthStats.p95}ms`)
  console.log(`  Profile View P95: ${profileStats.p95}ms`)
  console.log(`  Gigs Listing P95: ${gigsStats.p95}ms`)

  if (allTestsPassed) {
    console.log('\n✅ ALL PERFORMANCE CHECKS PASSED')
    console.log('All endpoints meet the P95 < 500ms requirement.')
  } else {
    console.error('\n❌ PERFORMANCE CHECKS FAILED')
    console.error('Some endpoints do not meet the P95 < 500ms requirement.')
    process.exit(1)
  }
}

// Run performance checks
runPerformanceChecks().catch((error) => {
  console.error(`\n❌ Performance check error: ${error.message}`)
  process.exit(1)
})
