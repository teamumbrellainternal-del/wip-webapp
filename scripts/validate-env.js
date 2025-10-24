/**
 * Environment Validation Script
 * Validates that all required environment variables and Cloudflare bindings are configured
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const REQUIRED_ENV_VARS = {
  staging: {
    secrets: [
      'JWT_SECRET',
      'CLAUDE_API_KEY',
      'RESEND_API_KEY',
      'TWILIO_ACCOUNT_SID',
      'TWILIO_AUTH_TOKEN',
      'TWILIO_PHONE_NUMBER',
    ],
    bindings: {
      d1: ['umbrella-staging-db'],
      kv: ['KV'],
      r2: ['umbrella-staging-media'],
    },
  },
  production: {
    secrets: [
      'JWT_SECRET',
      'CLAUDE_API_KEY',
      'RESEND_API_KEY',
      'TWILIO_ACCOUNT_SID',
      'TWILIO_AUTH_TOKEN',
      'TWILIO_PHONE_NUMBER',
    ],
    bindings: {
      d1: ['umbrella-prod-db'],
      kv: ['KV'],
      r2: ['umbrella-prod-media'],
    },
  },
}

async function validateEnvironment(environment) {
  console.log(`🔍 Validating ${environment} environment...`)

  const config = REQUIRED_ENV_VARS[environment]
  if (!config) {
    console.error(`❌ Unknown environment: ${environment}`)
    process.exit(1)
  }

  let hasErrors = false

  // Validate secrets
  console.log('\n📋 Checking required secrets...')
  for (const secret of config.secrets) {
    const value = process.env[secret]
    if (!value) {
      console.error(`❌ Missing required secret: ${secret}`)
      hasErrors = true
    } else {
      console.log(`✅ ${secret}: configured`)
    }
  }

  // Validate JWT secret strength (minimum 32 characters)
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.error(`❌ JWT_SECRET must be at least 32 characters long`)
    hasErrors = true
  }

  // Validate Cloudflare configuration
  console.log('\n📋 Checking Cloudflare configuration...')
  const cloudflareToken = process.env.CLOUDFLARE_API_TOKEN
  const cloudflareAccountId = process.env.CLOUDFLARE_ACCOUNT_ID

  if (!cloudflareToken) {
    console.error(`❌ Missing CLOUDFLARE_API_TOKEN`)
    hasErrors = true
  } else {
    console.log(`✅ CLOUDFLARE_API_TOKEN: configured`)
  }

  if (!cloudflareAccountId) {
    console.error(`❌ Missing CLOUDFLARE_ACCOUNT_ID`)
    hasErrors = true
  } else {
    console.log(`✅ CLOUDFLARE_ACCOUNT_ID: configured`)
  }

  // Validate wrangler.toml bindings
  console.log('\n📋 Checking wrangler.toml configuration...')

  const wranglerPath = path.join(process.cwd(), 'wrangler.toml')
  if (!fs.existsSync(wranglerPath)) {
    console.error(`❌ wrangler.toml not found`)
    hasErrors = true
  } else {
    const wranglerContent = fs.readFileSync(wranglerPath, 'utf-8')

    // Check D1 bindings
    for (const db of config.bindings.d1) {
      if (wranglerContent.includes(db)) {
        console.log(`✅ D1 database configured: ${db}`)
      } else {
        console.error(`❌ D1 database not configured: ${db}`)
        hasErrors = true
      }
    }

    // Check KV bindings
    for (const kv of config.bindings.kv) {
      if (wranglerContent.includes(`binding = "${kv}"`)) {
        console.log(`✅ KV namespace configured: ${kv}`)
      } else {
        console.error(`❌ KV namespace not configured: ${kv}`)
        hasErrors = true
      }
    }

    // Check R2 bindings
    for (const bucket of config.bindings.r2) {
      if (wranglerContent.includes(bucket)) {
        console.log(`✅ R2 bucket configured: ${bucket}`)
      } else {
        console.error(`❌ R2 bucket not configured: ${bucket}`)
        hasErrors = true
      }
    }
  }

  // Validate database migrations exist
  console.log('\n📋 Checking database migrations...')
  const migrationsPath = path.join(process.cwd(), 'db', 'migrations')
  if (!fs.existsSync(migrationsPath)) {
    console.error(`❌ Migrations directory not found: ${migrationsPath}`)
    hasErrors = true
  } else {
    const migrations = fs.readdirSync(migrationsPath).filter((f) => f.endsWith('.sql'))
    if (migrations.length === 0) {
      console.error(`❌ No migration files found`)
      hasErrors = true
    } else {
      console.log(`✅ Found ${migrations.length} migration file(s)`)
      migrations.forEach((m) => console.log(`   - ${m}`))
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60))
  if (hasErrors) {
    console.error(`\n❌ Environment validation FAILED for ${environment}`)
    console.error('Please fix the issues above before deploying.')
    process.exit(1)
  } else {
    console.log(`\n✅ Environment validation PASSED for ${environment}`)
    console.log('All required configuration is present.')
  }
}

// Run validation
const environment = process.argv[2]
if (!environment) {
  console.error('Usage: node scripts/validate-env.js <staging|production>')
  process.exit(1)
}

validateEnvironment(environment).catch((error) => {
  console.error(`\n❌ Validation error: ${error.message}`)
  process.exit(1)
})
