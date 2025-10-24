/**
 * Rollback Script
 * Rolls back to the previous deployment in case of failure
 */

import { execSync } from 'child_process'

function executeCommand(command, description) {
  console.log(`\n${description}...`)
  try {
    const output = execSync(command, { encoding: 'utf-8', stdio: 'pipe' })
    console.log(`✅ ${description} completed`)
    return output
  } catch (error) {
    console.error(`❌ ${description} failed:`)
    console.error(error.message)
    throw error
  }
}

async function rollback() {
  console.log('🔄 Initiating rollback procedure...\n')
  console.log('='.repeat(60))

  const environment = process.env.ENVIRONMENT || 'production'

  try {
    // Step 1: Get the last successful deployment tag
    console.log('\n📋 Finding previous deployment...')
    const tags = execSync('git tag --sort=-version:refname | grep "^backup-"', {
      encoding: 'utf-8',
    })
      .trim()
      .split('\n')

    if (tags.length < 2) {
      console.error('❌ No previous backup tag found for rollback')
      process.exit(1)
    }

    const previousTag = tags[1] // Second most recent (most recent is current failing deployment)
    console.log(`✅ Found previous deployment: ${previousTag}`)

    // Step 2: Checkout previous version
    executeCommand(
      `git checkout ${previousTag}`,
      'Checking out previous deployment'
    )

    // Step 3: Reinstall dependencies
    executeCommand('npm ci', 'Installing dependencies')

    // Step 4: Rebuild
    executeCommand('npm run build', 'Building application')
    executeCommand('npm run build:worker', 'Building worker')

    // Step 5: Deploy previous version
    const cloudflareToken = process.env.CLOUDFLARE_API_TOKEN
    const cloudflareAccountId = process.env.CLOUDFLARE_ACCOUNT_ID

    if (!cloudflareToken || !cloudflareAccountId) {
      console.error('❌ Missing Cloudflare credentials')
      process.exit(1)
    }

    const envFlag = environment === 'production' ? '--env production' : '--env staging'
    executeCommand(
      `wrangler deploy ${envFlag}`,
      `Deploying previous version to ${environment}`
    )

    // Step 6: Verify health
    console.log('\n🏥 Verifying rollback health...')
    await new Promise((resolve) => setTimeout(resolve, 5000)) // Wait 5 seconds

    const apiUrl =
      environment === 'production'
        ? 'https://api.umbrella.example.com'
        : 'https://api-staging.umbrella.example.com'

    try {
      const response = await fetch(`${apiUrl}/v1/health`)
      if (response.status === 200) {
        console.log('✅ Health check passed after rollback')
      } else {
        console.error('❌ Health check failed after rollback')
        process.exit(1)
      }
    } catch (error) {
      console.error(`❌ Health check error: ${error.message}`)
      process.exit(1)
    }

    // Step 7: Return to main branch
    executeCommand('git checkout main', 'Returning to main branch')

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('\n✅ ROLLBACK COMPLETED SUCCESSFULLY')
    console.log(`\nRolled back to: ${previousTag}`)
    console.log(`Environment: ${environment}`)
    console.log(`\n⚠️  Please investigate the deployment failure and fix issues before re-deploying.`)

  } catch (error) {
    console.error('\n' + '='.repeat(60))
    console.error('\n❌ ROLLBACK FAILED')
    console.error(`\nError: ${error.message}`)
    console.error('\n⚠️  MANUAL INTERVENTION REQUIRED')
    console.error('Please contact the infrastructure team immediately.')
    process.exit(1)
  }
}

// Run rollback
rollback().catch((error) => {
  console.error(`\n❌ Rollback script error: ${error.message}`)
  process.exit(1)
})
