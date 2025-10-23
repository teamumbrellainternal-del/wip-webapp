import type { ConfigData, EnvVariable, ValidationError } from '@/types'
import { parseEnvContent, extractEnvVariables, formatEnvContent } from './env-parser'
import { generateEnvContent } from './env-generator'

// Enhanced bidirectional converter for form ↔ ENV format
export interface ConversionResult {
  success: boolean
  data?: ConfigData | string
  errors?: ValidationError[]
  warnings?: string[]
}

export interface ConversionOptions {
  preserveComments?: boolean
  includeEmpty?: boolean
  sortKeys?: boolean
  validateOutput?: boolean
  formatOutput?: boolean
}

// Convert form data to ENV format with enhanced options
export function convertFormToEnv(
  data: ConfigData, 
  options: ConversionOptions = {}
): ConversionResult {
  const {
    preserveComments = true,
    includeEmpty = false,
    validateOutput = true,
    formatOutput = true
  } = options

  try {
    const errors: ValidationError[] = []
    const warnings: string[] = []

    // Filter out empty values if not including them
    const filteredData: ConfigData = {}
    Object.entries(data).forEach(([key, value]) => {
      if (includeEmpty || (value !== undefined && value !== null && value !== '')) {
        filteredData[key] = value
      }
    })

    // Check for potentially problematic values
    Object.entries(filteredData).forEach(([key, value]) => {
      if (typeof value === 'string') {
        // Check for multiline values
        if (value.includes('\n')) {
          warnings.push(`${key} contains newline characters that may need special handling`)
        }

        // Check for special characters that need escaping
        if (value.includes('"') || value.includes('\\') || value.includes('$')) {
          warnings.push(`${key} contains special characters that will be escaped`)
        }

        // Check for very long values
        if (value.length > 1000) {
          warnings.push(`${key} is very long (${value.length} characters)`)
        }
      }
    })

    // Generate ENV content
    let envContent = generateEnvContent(filteredData, preserveComments)

    // Format if requested
    if (formatOutput) {
      envContent = formatEnvContent(envContent)
    }

    // Validate output if requested
    if (validateOutput) {
      const { errors: parseErrors } = parseEnvContent(envContent)
      if (parseErrors.length > 0) {
        errors.push(...parseErrors)
        return { success: false, errors, warnings }
      }
    }

    return {
      success: true,
      data: envContent,
      warnings: warnings.length > 0 ? warnings : undefined
    }
  } catch (error) {
    return {
      success: false,
      errors: [{
        field: 'conversion',
        message: `Failed to convert form to ENV: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]
    }
  }
}

// Convert ENV format to form data with enhanced parsing
export function convertEnvToForm(
  envContent: string, 
  options: ConversionOptions = {}
): ConversionResult {
  const {
    validateOutput = true
  } = options

  try {
    const { data, errors } = parseEnvContent(envContent)
    
    if (errors.length > 0) {
      return { success: false, errors }
    }

    // Additional processing for form data
    const processedData: ConfigData = {}
    const warnings: string[] = []

    Object.entries(data).forEach(([key, value]) => {
      // Type conversion for known boolean fields
      if (isBooleanField(key)) {
        processedData[key] = normalizeBooleanValue(value || '')
      }
      // Type conversion for known numeric fields
      else if (isNumericField(key)) {
        const numValue = normalizeNumericValue(value || '')
        if (numValue !== null) {
          processedData[key] = numValue.toString()
        } else {
          warnings.push(`${key} has invalid numeric value: ${value}`)
          processedData[key] = value // Keep original value
        }
      }
      // Handle URL fields
      else if (isUrlField(key)) {
        const normalizedUrl = normalizeUrlValue(value || '')
        if (normalizedUrl !== value) {
          warnings.push(`${key} URL was normalized`)
        }
        processedData[key] = normalizedUrl
      }
      else {
        processedData[key] = value
      }
    })

    // Validate output if requested
    if (validateOutput) {
      const validationErrors = validateConfigData(processedData)
      if (validationErrors.length > 0) {
        return { 
          success: true, // Still successful conversion, but with validation warnings
          data: processedData,
          errors: validationErrors,
          warnings: warnings.length > 0 ? warnings : undefined
        }
      }
    }

    return {
      success: true,
      data: processedData,
      warnings: warnings.length > 0 ? warnings : undefined
    }
  } catch (error) {
    return {
      success: false,
      errors: [{
        field: 'conversion',
        message: `Failed to convert ENV to form: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]
    }
  }
}

// Advanced ENV variable processing with comment preservation
export function convertFormToEnvVariables(
  data: ConfigData, 
  existingContent?: string,
  options: ConversionOptions = {}
): EnvVariable[] {
  const { preserveComments = true, includeEmpty = false } = options

  const variables: EnvVariable[] = []
  
  // If we have existing content and want to preserve comments, parse it first
  let existingVariables: EnvVariable[] = []
  if (existingContent && preserveComments) {
    existingVariables = extractEnvVariables(existingContent)
  }

  // Create a map of existing variables for comment lookup
  const existingCommentsMap = new Map<string, string>()
  existingVariables.forEach(v => {
    if (v.comment) {
      existingCommentsMap.set(v.key, v.comment)
    }
  })

  // Convert form data to env variables
  Object.entries(data).forEach(([key, value]) => {
    if (!includeEmpty && (value === undefined || value === null || value === '')) {
      return
    }

    const stringValue = value?.toString() || ''
    const existingComment = existingCommentsMap.get(key)

    variables.push({
      key,
      value: stringValue,
      comment: existingComment
    })
  })

  return variables
}

// Convert ENV variables back to form data
export function convertEnvVariablesToForm(variables: EnvVariable[]): ConfigData {
  const data: ConfigData = {}
  
  variables.forEach(variable => {
    data[variable.key] = variable.value
  })

  return data
}

// Enhanced ENV content formatting with style options
export function formatEnvContentAdvanced(
  content: string,
  options: {
    groupByPrefix?: boolean
    sortWithinGroups?: boolean
    addSectionHeaders?: boolean
    preserveEmptyLines?: boolean
  } = {}
): string {
  const { 
    groupByPrefix = false, 
    sortWithinGroups = true, 
    addSectionHeaders = false
  } = options

  const variables = extractEnvVariables(content)
  
  if (!groupByPrefix) {
    // Simple formatting
    return formatEnvContent(content)
  }

  // Group by prefix (e.g., OAUTH_, LDAP_, etc.)
  const groups = new Map<string, EnvVariable[]>()
  const ungrouped: EnvVariable[] = []

  variables.forEach(variable => {
    const prefix = extractPrefix(variable.key)
    if (prefix) {
      if (!groups.has(prefix)) {
        groups.set(prefix, [])
      }
      groups.get(prefix)!.push(variable)
    } else {
      ungrouped.push(variable)
    }
  })

  const result: string[] = []

  // Add header comment
  result.push('# OpenWebUI Configuration')
  result.push('# Generated by openwebui-config.com')
  result.push('')

  // Sort group keys
  const sortedGroupKeys = Array.from(groups.keys()).sort()

  // Add ungrouped variables first
  if (ungrouped.length > 0) {
    if (addSectionHeaders) {
      result.push('# General Configuration')
    }
    
    const sortedUngrouped = sortWithinGroups 
      ? ungrouped.sort((a, b) => a.key.localeCompare(b.key))
      : ungrouped

    sortedUngrouped.forEach(variable => {
      if (variable.comment) {
        result.push(`# ${variable.comment}`)
      }
      const escapedValue = needsQuotes(variable.value) 
        ? `"${escapeValue(variable.value)}"` 
        : variable.value
      result.push(`${variable.key}=${escapedValue}`)
    })
    result.push('')
  }

  // Add grouped variables
  sortedGroupKeys.forEach(groupKey => {
    const groupVariables = groups.get(groupKey)!
    
    if (addSectionHeaders) {
      result.push(`# ${formatGroupHeader(groupKey)} Configuration`)
    }
    
    const sortedVariables = sortWithinGroups 
      ? groupVariables.sort((a, b) => a.key.localeCompare(b.key))
      : groupVariables

    sortedVariables.forEach(variable => {
      if (variable.comment) {
        result.push(`# ${variable.comment}`)
      }
      const escapedValue = needsQuotes(variable.value) 
        ? `"${escapeValue(variable.value)}"` 
        : variable.value
      result.push(`${variable.key}=${escapedValue}`)
    })
    result.push('')
  })

  return result.join('\n').trim()
}

// Utility functions
function isBooleanField(key: string): boolean {
  return key.startsWith('ENABLE_') || 
         key.includes('_FLAG') || 
         ['USE_CUDA_DOCKER', 'USE_OLLAMA_DOCKER', 'K8S_FLAG', 'WEBUI_AUTH'].includes(key)
}

function isNumericField(key: string): boolean {
  return key.includes('_PORT') || 
         key.includes('_SIZE') || 
         key.includes('_COUNT') || 
         key.includes('_TIMEOUT') ||
         key.includes('_LIMIT') ||
         ['PORT', 'CHUNK_SIZE', 'CHUNK_OVERLAP'].includes(key)
}

function isUrlField(key: string): boolean {
  return key.includes('_URL') || 
         key.includes('_ENDPOINT') || 
         key.includes('BASE_URL')
}

function normalizeBooleanValue(value: string): string {
  const lowerValue = value.toLowerCase().trim()
  if (['true', '1', 'yes', 'on'].includes(lowerValue)) {
    return 'true'
  } else if (['false', '0', 'no', 'off'].includes(lowerValue)) {
    return 'false'
  }
  return value // Return original if not recognized
}

function normalizeNumericValue(value: string): number | null {
  const numValue = Number(value.trim())
  return isNaN(numValue) ? null : numValue
}

function normalizeUrlValue(value: string): string {
  try {
    const url = new URL(value.trim())
    return url.toString()
  } catch {
    return value.trim() // Return trimmed value if not a valid URL
  }
}

function validateConfigData(data: ConfigData): ValidationError[] {
  // Basic validation - can be extended with more sophisticated checks
  const errors: ValidationError[] = []
  
  Object.entries(data).forEach(([key, value]) => {
    if (isUrlField(key) && value && typeof value === 'string') {
      try {
        new URL(value)
      } catch {
        errors.push({
          field: key,
          message: 'Invalid URL format'
        })
      }
    }
    
    if (isNumericField(key) && value && typeof value === 'string') {
      if (isNaN(Number(value))) {
        errors.push({
          field: key,
          message: 'Must be a valid number'
        })
      }
    }
  })
  
  return errors
}

function extractPrefix(key: string): string | null {
  const parts = key.split('_')
  if (parts.length > 1 && parts[0].length > 1) {
    // Common prefixes
    const commonPrefixes = [
      'OAUTH', 'LDAP', 'OPENAI', 'WEBUI', 'RAG', 'AUDIO', 'IMAGE', 
      'GOOGLE', 'MICROSOFT', 'GITHUB', 'CHROMA', 'MILVUS', 'ELASTICSEARCH',
      'OPENSEARCH', 'QDRANT', 'PINECONE', 'PGVECTOR', 'S3', 'AZURE', 'GCS',
      'DATABASE', 'REDIS', 'WEBSOCKET', 'CODE'
    ]
    
    // Check for multi-word prefixes first
    const twoWordPrefix = `${parts[0]}_${parts[1] || ''}`
    if (parts.length > 2 && commonPrefixes.some(p => twoWordPrefix.startsWith(p))) {
      return twoWordPrefix
    }
    
    if (commonPrefixes.includes(parts[0])) {
      return parts[0]
    }
  }
  
  return null
}

function formatGroupHeader(prefix: string): string {
  return prefix
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

function needsQuotes(value: string): boolean {
  return /[\s#"'\\$`]/.test(value) || value === ''
}

function escapeValue(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

// Conversion with error recovery
export function convertWithErrorRecovery(
  input: string | ConfigData,
  targetFormat: 'env' | 'form',
  options: ConversionOptions = {}
): ConversionResult {
  try {
    if (targetFormat === 'env') {
      return convertFormToEnv(input as ConfigData, options)
    } else {
      return convertEnvToForm(input as string, options)
    }
  } catch (error) {
    // Attempt error recovery
    if (targetFormat === 'form' && typeof input === 'string') {
      // Try to recover from malformed ENV by parsing line by line
      const recoveredData: ConfigData = {}
      const errors: ValidationError[] = []
      
      const lines = input.split('\n')
      lines.forEach((line, index) => {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) return
        
        try {
          const equalIndex = trimmed.indexOf('=')
          if (equalIndex > 0) {
            const key = trimmed.substring(0, equalIndex).trim()
            let value = trimmed.substring(equalIndex + 1).trim()
            
            // Remove quotes
            if ((value.startsWith('"') && value.endsWith('"')) ||
                (value.startsWith("'") && value.endsWith("'"))) {
              value = value.slice(1, -1)
            }
            
            recoveredData[key] = value
          }
        } catch {
          errors.push({
            field: `line-${index + 1}`,
            message: `Could not parse line: ${trimmed}`
          })
        }
      })
      
      return {
        success: Object.keys(recoveredData).length > 0,
        data: recoveredData,
        errors: errors.length > 0 ? errors : undefined
      }
    }
    
    return {
      success: false,
      errors: [{
        field: 'conversion',
        message: `Conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]
    }
  }
}