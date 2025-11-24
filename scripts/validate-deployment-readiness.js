#!/usr/bin/env node

/**
 * Deployment Readiness Validation Script
 *
 * Checks if the application is ready for production deployment
 * Run: node scripts/validate-deployment-readiness.js
 */

import { execSync } from 'child_process'
import { readFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
}

let totalChecks = 0
let passedChecks = 0
let warnings = 0

function logSection(title) {
  console.log(`\n${colors.bold}${colors.cyan}${'='.repeat(80)}${colors.reset}`)
  console.log(`${colors.bold}${colors.cyan}${title}${colors.reset}`)
  console.log(`${colors.cyan}${'='.repeat(80)}${colors.reset}\n`)
}

function logCheck(description, passed, details = '') {
  totalChecks++
  if (passed) {
    passedChecks++
    console.log(`${colors.green}✓${colors.reset} ${description}`)
  } else {
    console.log(`${colors.red}✗${colors.reset} ${description}`)
  }
  if (details) {
    console.log(`  ${colors.yellow}${details}${colors.reset}`)
  }
}

function logWarning(message) {
  warnings++
  console.log(`${colors.yellow}⚠${colors.reset} ${message}`)
}

function logInfo(message) {
  console.log(`${colors.blue}ℹ${colors.reset} ${message}`)
}

function runCommand(command, options = {}) {
  try {
    const result = execSync(command, {
      encoding: 'utf8',
      cwd: rootDir,
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options
    })
    return { success: true, output: result }
  } catch (error) {
    return { success: false, error: error.message, output: error.stdout || '' }
  }
}

// ============================================================================
// CHECKS
// ============================================================================

async function checkNodeVersion() {
  logSection('Environment Checks')

  const nodeVersion = process.version
  const major = parseInt(nodeVersion.slice(1).split('.')[0])

  logCheck(
    `Node.js version (${nodeVersion})`,
    major >= 20,
    major < 20 ? 'Requires Node.js 20 or higher' : ''
  )
}

async function checkDependencies() {
  const packageJsonPath = join(rootDir, 'package.json')
  const nodeModulesPath = join(rootDir, 'node_modules')

  const packageJsonExists = existsSync(packageJsonPath)
  logCheck('package.json exists', packageJsonExists)

  const nodeModulesExists = existsSync(nodeModulesPath)
  logCheck(
    'Dependencies installed',
    nodeModulesExists,
    !nodeModulesExists ? 'Run: npm install' : ''
  )
}

async function checkTypeScript() {
  logSection('TypeScript Compilation')

  logInfo('Running type check...')
  const result = runCommand('npm run type-check', { silent: true })

  logCheck(
    'TypeScript compilation',
    result.success,
    !result.success ? 'Fix type errors before deploying' : ''
  )

  if (!result.success && result.output) {
    console.log(`\n${colors.red}Type Errors:${colors.reset}`)
    console.log(result.output.split('\n').slice(0, 20).join('\n'))
  }
}

async function checkBuild() {
  logSection('Build Process')

  logInfo('Building application...')
  const result = runCommand('npm run build', { silent: true })

  logCheck(
    'Production build',
    result.success,
    !result.success ? 'Build must succeed before deployment' : ''
  )

  // Check if dist directory was created
  const distExists = existsSync(join(rootDir, 'dist'))
  logCheck('dist/ directory created', distExists)

  // Check if dist/index.html exists
  const indexExists = existsSync(join(rootDir, 'dist', 'index.html'))
  logCheck('dist/index.html exists', indexExists)
}

async function checkTests() {
  logSection('Test Suite')

  logInfo('Running tests...')
  const result = runCommand('npm test', { silent: true })

  // Parse test results
  const output = result.output || ''
  const passedMatch = output.match(/(\d+) passed/)
  const failedMatch = output.match(/(\d+) failed/)

  const testsPassed = result.success || (passedMatch && !failedMatch)

  logCheck(
    'Test suite',
    testsPassed,
    !testsPassed ? 'Some tests are failing' : passedMatch ? `${passedMatch[1]} tests passed` : ''
  )
}

async function checkWranglerConfig() {
  logSection('Production Configuration')

  const wranglerPath = join(rootDir, 'wrangler.toml')
  const wranglerExists = existsSync(wranglerPath)

  logCheck('wrangler.toml exists', wranglerExists)

  if (wranglerExists) {
    const content = readFileSync(wranglerPath, 'utf8')

    // Check if USE_MOCKS is set to false in production
    const prodSection = content.match(/\[env\.production\.vars\]([\s\S]*?)(?=\n\[|$)/)?.[1] || ''
    const useMocks = prodSection.match(/USE_MOCKS\s*=\s*"([^"]+)"/)?.[1]

    logCheck(
      'USE_MOCKS = "false" in production',
      useMocks === 'false',
      useMocks !== 'false' ? `Currently set to "${useMocks}" - must be "false" for production` : ''
    )

    // Check for production database ID
    const dbId = content.match(/\[env\.production\.d1_databases\][\s\S]*?database_id\s*=\s*"([^"]+)"/)?.[1]
    const isDevDb = dbId && dbId === '4fbcb5f8-5fe5-4bb1-b56f-0de1e80d6e8a'

    if (isDevDb) {
      logWarning('Production using dev database ID - create production database')
      console.log(`  Run: wrangler d1 create umbrella-prod-db`)
    } else if (dbId) {
      logCheck('Production database configured', true, `ID: ${dbId.slice(0, 16)}...`)
    } else {
      logCheck('Production database configured', false, 'No database ID found')
    }

    // Check for production KV namespace
    const kvId = content.match(/\[env\.production\.kv_namespaces\][\s\S]*?id\s*=\s*"([^"]+)"/)?.[1]
    const isDevKv = kvId && kvId === '04fceb9a09054bbd991d5252a9a169cf'

    if (isDevKv) {
      logWarning('Production using dev KV namespace - create production namespace')
      console.log(`  Run: wrangler kv:namespace create KV --env production`)
    } else if (kvId) {
      logCheck('Production KV namespace configured', true, `ID: ${kvId.slice(0, 16)}...`)
    } else {
      logCheck('Production KV namespace configured', false, 'No namespace ID found')
    }

    // Check for R2 bucket
    const hasR2 = content.includes('[env.production.r2_buckets]') && !content.match(/# \[\[env\.production\.r2_buckets\]\]/)

    if (!hasR2) {
      logWarning('Production R2 bucket not configured')
      console.log(`  Run: wrangler r2 bucket create umbrella-prod-media`)
      console.log(`  Then uncomment R2 section in wrangler.toml`)
    } else {
      logCheck('Production R2 bucket configured', true)
    }
  }
}

async function checkSecrets() {
  logSection('Production Secrets Check')

  logInfo('Note: Secrets can only be verified after deployment')
  logInfo('Required secrets for production:')

  const requiredSecrets = [
    'CLERK_SECRET_KEY',
    'CLERK_WEBHOOK_SECRET',
    'RESEND_API_KEY',
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'TWILIO_PHONE_NUMBER',
    'CLAUDE_API_KEY',
  ]

  requiredSecrets.forEach((secret) => {
    console.log(`  ${colors.yellow}•${colors.reset} ${secret}`)
  })

  console.log(`\n  Configure via: ${colors.cyan}wrangler secret put <SECRET_NAME> --env production${colors.reset}`)

  logWarning('Cannot verify secrets until they are deployed')
}

async function checkMigrations() {
  logSection('Database Migrations')

  const migrationsDir = join(rootDir, 'db', 'migrations')
  const migrationsExist = existsSync(migrationsDir)

  logCheck('Migrations directory exists', migrationsExist)

  if (migrationsExist) {
    const result = runCommand('ls db/migrations/*.sql | wc -l', { silent: true })
    const count = parseInt(result.output?.trim() || '0')

    logCheck(
      `Migration files found (${count})`,
      count > 0,
      count === 0 ? 'No migration files found' : ''
    )
  }
}

async function checkDocumentation() {
  logSection('Documentation')

  const docs = [
    'README.md',
    'PRODUCTION_SETUP.md',
    'PRODUCTION_READINESS_REPORT.md',
    'DEPLOYMENT.md',
  ]

  docs.forEach((doc) => {
    const exists = existsSync(join(rootDir, doc))
    logCheck(doc, exists)
  })
}

async function checkGitStatus() {
  logSection('Git Status')

  const result = runCommand('git status --porcelain', { silent: true })

  if (result.success) {
    const hasChanges = result.output && result.output.trim().length > 0

    if (hasChanges) {
      logWarning('Uncommitted changes detected')
      console.log(`\n${colors.yellow}Modified files:${colors.reset}`)
      console.log(result.output.split('\n').slice(0, 10).join('\n'))
      console.log(`\n  Consider committing changes before deployment`)
    } else {
      logCheck('Working directory clean', true)
    }
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log(`\n${colors.bold}${colors.blue}╔═══════════════════════════════════════════════════════════════════════════╗${colors.reset}`)
  console.log(`${colors.bold}${colors.blue}║                 UMBRELLA MVP - DEPLOYMENT READINESS CHECK                  ║${colors.reset}`)
  console.log(`${colors.bold}${colors.blue}╚═══════════════════════════════════════════════════════════════════════════╝${colors.reset}`)

  try {
    await checkNodeVersion()
    await checkDependencies()
    await checkTypeScript()
    await checkBuild()
    await checkTests()
    await checkWranglerConfig()
    await checkSecrets()
    await checkMigrations()
    await checkDocumentation()
    await checkGitStatus()

    // Summary
    logSection('Summary')

    const percentage = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0

    console.log(`${colors.bold}Checks Passed:${colors.reset} ${passedChecks}/${totalChecks} (${percentage}%)`)
    console.log(`${colors.bold}Warnings:${colors.reset} ${warnings}`)

    console.log()

    if (passedChecks === totalChecks && warnings === 0) {
      console.log(`${colors.green}${colors.bold}✓ READY FOR DEPLOYMENT${colors.reset}`)
      console.log(`\nNext steps:`)
      console.log(`  1. Review PRODUCTION_SETUP.md`)
      console.log(`  2. Create production resources (D1, KV, R2)`)
      console.log(`  3. Configure secrets`)
      console.log(`  4. Deploy: npm run deploy:prod`)
    } else if (passedChecks >= totalChecks * 0.8) {
      console.log(`${colors.yellow}${colors.bold}⚠ MOSTLY READY${colors.reset}`)
      console.log(`\nAddress warnings above, then:`)
      console.log(`  - Follow PRODUCTION_SETUP.md for infrastructure setup`)
      console.log(`  - Configure production secrets`)
      console.log(`  - Review PRODUCTION_READINESS_REPORT.md`)
    } else {
      console.log(`${colors.red}${colors.bold}✗ NOT READY${colors.reset}`)
      console.log(`\nFix failing checks above before deployment`)
    }

    console.log()

    process.exit(passedChecks >= totalChecks * 0.8 ? 0 : 1)

  } catch (error) {
    console.error(`\n${colors.red}Error running validation:${colors.reset}`, error.message)
    process.exit(1)
  }
}

main()
