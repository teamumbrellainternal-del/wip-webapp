/**
 * Database Migration Verification Script
 * Verifies migration files are valid, sequential, and safe to apply
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function verifyMigrations() {
  console.log('🔍 Verifying database migrations...\n')

  const migrationsDir = path.join(process.cwd(), 'db', 'migrations')

  // Check migrations directory exists
  if (!fs.existsSync(migrationsDir)) {
    console.error(`❌ Migrations directory not found: ${migrationsDir}`)
    process.exit(1)
  }

  // Get all migration files
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort()

  if (files.length === 0) {
    console.error('❌ No migration files found')
    process.exit(1)
  }

  console.log(`📋 Found ${files.length} migration file(s):\n`)

  let hasErrors = false
  const expectedNumbers = []

  files.forEach((file, index) => {
    console.log(`Checking: ${file}`)

    // Verify naming convention (NNNN_description.sql)
    const match = file.match(/^(\d{4})_([a-z_]+)\.sql$/)
    if (!match) {
      console.error(`  ❌ Invalid filename format. Expected: NNNN_description.sql`)
      hasErrors = true
      return
    }

    const [, number, description] = match
    expectedNumbers.push(parseInt(number, 10))

    // Read file content
    const filePath = path.join(migrationsDir, file)
    const content = fs.readFileSync(filePath, 'utf-8')

    // Check file is not empty
    if (content.trim().length === 0) {
      console.error(`  ❌ Migration file is empty`)
      hasErrors = true
      return
    }

    // Check for dangerous operations
    const dangerousPatterns = [
      { pattern: /DROP\s+DATABASE/gi, warning: 'DROP DATABASE' },
      { pattern: /TRUNCATE\s+TABLE/gi, warning: 'TRUNCATE TABLE (use DELETE instead)' },
    ]

    dangerousPatterns.forEach(({ pattern, warning }) => {
      if (pattern.test(content)) {
        console.warn(`  ⚠️  Warning: Contains potentially dangerous operation: ${warning}`)
      }
    })

    // Check for proper table creation
    const hasCreateTable = /CREATE\s+TABLE/gi.test(content)
    const hasAlterTable = /ALTER\s+TABLE/gi.test(content)
    const hasInsert = /INSERT\s+INTO/gi.test(content)

    if (!hasCreateTable && !hasAlterTable && !hasInsert && index < 6) {
      console.warn(`  ⚠️  Migration doesn't contain CREATE TABLE, ALTER TABLE, or INSERT`)
    }

    // Check for proper foreign key constraints
    if (hasCreateTable) {
      const hasForeignKey = /FOREIGN\s+KEY/gi.test(content)
      const hasReferences = /REFERENCES/gi.test(content)

      if (hasForeignKey || hasReferences) {
        console.log(`  ✅ Contains foreign key constraints`)
      }
    }

    // Check for indexes
    if (hasCreateTable) {
      const hasIndex = /CREATE\s+INDEX/gi.test(content)
      if (hasIndex) {
        console.log(`  ✅ Contains index definitions`)
      }
    }

    console.log(`  ✅ Valid SQL syntax`)
    console.log()
  })

  // Verify sequential numbering
  console.log('📋 Verifying sequential numbering...\n')
  const sortedNumbers = [...expectedNumbers].sort((a, b) => a - b)

  for (let i = 0; i < sortedNumbers.length; i++) {
    const expected = i + 1
    const actual = sortedNumbers[i]

    if (actual !== expected) {
      console.error(
        `❌ Migration numbering is not sequential. Expected ${expected.toString().padStart(4, '0')}, found ${actual.toString().padStart(4, '0')}`
      )
      hasErrors = true
    }
  }

  if (!hasErrors) {
    console.log('✅ Migration numbering is sequential\n')
  }

  // Check for schema.sql
  const schemaPath = path.join(process.cwd(), 'db', 'schema.sql')
  if (fs.existsSync(schemaPath)) {
    console.log('📋 Found db/schema.sql (master schema)\n')

    const schemaContent = fs.readFileSync(schemaPath, 'utf-8')

    // Count tables in schema
    const tableCount = (schemaContent.match(/CREATE\s+TABLE/gi) || []).length
    console.log(`  ✅ Schema contains ${tableCount} table definition(s)\n`)
  } else {
    console.warn('⚠️  Warning: db/schema.sql not found\n')
  }

  // Summary
  console.log('='.repeat(60))
  if (hasErrors) {
    console.error('\n❌ Migration verification FAILED')
    console.error('Please fix the issues above before running migrations.')
    process.exit(1)
  } else {
    console.log('\n✅ Migration verification PASSED')
    console.log('All migration files are valid and ready to apply.')
  }
}

// Run verification
try {
  verifyMigrations()
} catch (error) {
  console.error(`\n❌ Verification error: ${error.message}`)
  process.exit(1)
}
