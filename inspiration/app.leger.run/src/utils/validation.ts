import { z } from 'zod'
import type { ConfigData, ValidationError, EnvVariable } from '@/types'
// Note: OpenWebUIConfigSchema removed - using JSON Schema validation in RJSF instead

// Validation result type
export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
  data?: ConfigData
}

// Field-level validation
export function validateField(
  fieldName: string, 
  value: unknown, 
  schema?: z.ZodSchema
): ValidationError[] {
  const errors: ValidationError[] = []

  try {
    // Get the field schema from the main OpenWebUIConfig schema
    const fieldSchema = schema || getFieldSchema(fieldName)
    if (!fieldSchema) {
      // If no specific schema found, do basic validation
      return validateBasicField(fieldName, value)
    }

    // Validate using Zod schema
    fieldSchema.parse(value)
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.push({
        field: fieldName,
        message: formatZodError(error)
      })
    } else {
      errors.push({
        field: fieldName,
        message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    }
  }

  return errors
}

// Get field schema from OpenWebUIConfig - DISABLED (using JSON Schema now)
function getFieldSchema(_fieldName: string): z.ZodSchema | null {
  return null;
}

// Basic field validation when no schema available
function validateBasicField(fieldName: string, value: unknown): ValidationError[] {
  const errors: ValidationError[] = []

  if (value === null || value === undefined) {
    return errors // Optional fields are allowed to be null/undefined
  }

  const stringValue = String(value)

  // URL validation
  if (fieldName.toLowerCase().includes('url') || fieldName.toLowerCase().includes('endpoint')) {
    if (stringValue && !isValidUrl(stringValue)) {
      errors.push({
        field: fieldName,
        message: 'Must be a valid URL'
      })
    }
  }

  // Email validation
  if (fieldName.toLowerCase().includes('email')) {
    if (stringValue && !isValidEmail(stringValue)) {
      errors.push({
        field: fieldName,
        message: 'Must be a valid email address'
      })
    }
  }

  // Port validation
  if (fieldName.toLowerCase().includes('port')) {
    const port = Number(stringValue)
    if (stringValue && (isNaN(port) || port < 1 || port > 65535)) {
      errors.push({
        field: fieldName,
        message: 'Must be a valid port number (1-65535)'
      })
    }
  }

  // Boolean validation
  if (fieldName.toLowerCase().includes('enable') || fieldName.toLowerCase().includes('_flag')) {
    if (stringValue && !['true', 'false', '1', '0', 'yes', 'no'].includes(stringValue.toLowerCase())) {
      errors.push({
        field: fieldName,
        message: 'Must be a boolean value (true/false, 1/0, yes/no)'
      })
    }
  }

  return errors
}

// Comprehensive configuration validation
export function validateConfig(data: ConfigData): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []

  try {
    // Previous Zod schema validation removed - RJSF now handles validation
    // const result = OpenWebUIConfigSchema.safeParse(data)

    // Cross-field validation
    const crossFieldErrors = validateCrossFields(data)
    errors.push(...crossFieldErrors)

    // Configuration completeness warnings
    const completenessWarnings = validateCompleteness(data)
    warnings.push(...completenessWarnings)

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      data
    }
  } catch (error) {
    return {
      isValid: false,
      errors: [{
        field: 'config',
        message: `Configuration validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }],
      warnings,
      data
    }
  }
}

// Cross-field validation logic
function validateCrossFields(data: ConfigData): ValidationError[] {
  const errors: ValidationError[] = []

  // Validate OAuth dependencies
  if (data.ENABLE_OAUTH_SIGNUP === 'true') {
    if (!data.GOOGLE_CLIENT_ID && !data.MICROSOFT_CLIENT_ID && !data.GITHUB_CLIENT_ID && !data.OAUTH_CLIENT_ID) {
      errors.push({
        field: 'ENABLE_OAUTH_SIGNUP',
        message: 'OAuth signup enabled but no OAuth provider configured'
      })
    }
  }

  // Validate Google OAuth dependencies
  if (data.GOOGLE_CLIENT_ID && !data.GOOGLE_CLIENT_SECRET) {
    errors.push({
      field: 'GOOGLE_CLIENT_SECRET',
      message: 'Google Client Secret required when Google Client ID is provided'
    })
  }

  // Validate Microsoft OAuth dependencies
  if (data.MICROSOFT_CLIENT_ID && !data.MICROSOFT_CLIENT_SECRET) {
    errors.push({
      field: 'MICROSOFT_CLIENT_SECRET',
      message: 'Microsoft Client Secret required when Microsoft Client ID is provided'
    })
  }

  // Validate GitHub OAuth dependencies
  if (data.GITHUB_CLIENT_ID && !data.GITHUB_CLIENT_SECRET) {
    errors.push({
      field: 'GITHUB_CLIENT_SECRET',
      message: 'GitHub Client Secret required when GitHub Client ID is provided'
    })
  }

  // Validate LDAP dependencies
  if (data.ENABLE_LDAP === 'true') {
    const requiredLdapFields = ['LDAP_SERVER_HOST', 'LDAP_APP_DN', 'LDAP_APP_PASSWORD', 'LDAP_SEARCH_BASE']
    requiredLdapFields.forEach(field => {
      if (!data[field]) {
        errors.push({
          field,
          message: `${field} is required when LDAP is enabled`
        })
      }
    })
  }

  // Validate Vector DB dependencies
  if (data.VECTOR_DB) {
    const vectorDbValidations = {
      'chroma': ['CHROMA_HTTP_HOST'],
      'elasticsearch': ['ELASTICSEARCH_URL'],
      'milvus': ['MILVUS_URI'],
      'opensearch': ['OPENSEARCH_URI'],
      'pgvector': ['PGVECTOR_DB_URL'],
      'qdrant': ['QDRANT_URI'],
      'pinecone': ['PINECONE_API_KEY', 'PINECONE_ENVIRONMENT', 'PINECONE_INDEX_NAME']
    }

    const requiredFields = vectorDbValidations[data.VECTOR_DB as keyof typeof vectorDbValidations]
    if (requiredFields) {
      requiredFields.forEach(field => {
        if (!data[field]) {
          errors.push({
            field,
            message: `${field} is required when using ${data.VECTOR_DB} as vector database`
          })
        }
      })
    }
  }

  // Validate OpenAI API dependencies
  if (data.ENABLE_OPENAI_API === 'true' && !data.OPENAI_API_KEY && !data.OPENAI_API_KEYS) {
    errors.push({
      field: 'OPENAI_API_KEY',
      message: 'OpenAI API key required when OpenAI API is enabled'
    })
  }

  return errors
}

// Configuration completeness validation
function validateCompleteness(data: ConfigData): ValidationError[] {
  const warnings: ValidationError[] = []

  // Check for common missing configurations
  if (!data.WEBUI_SECRET_KEY) {
    warnings.push({
      field: 'WEBUI_SECRET_KEY',
      message: 'Consider setting a secret key for enhanced security'
    })
  }

  if (!data.ADMIN_EMAIL) {
    warnings.push({
      field: 'ADMIN_EMAIL',
      message: 'Admin email not configured'
    })
  }

  if (data.ENV !== 'prod' && data.ENV !== 'dev') {
    warnings.push({
      field: 'ENV',
      message: 'Environment not explicitly set (recommended: prod or dev)'
    })
  }

  return warnings
}

// Pre-export validation
export function validateForExport(data: ConfigData): ValidationResult {
  const result = validateConfig(data)

  // Additional export-specific validations
  const exportErrors: ValidationError[] = []

  // Check for potentially dangerous configurations
  if (data.SAFE_MODE === 'false') {
    exportErrors.push({
      field: 'SAFE_MODE',
      message: 'Safe mode is disabled - ensure this is intentional for production'
    })
  }

  if (data.CORS_ALLOW_ORIGIN === '*') {
    exportErrors.push({
      field: 'CORS_ALLOW_ORIGIN',
      message: 'CORS allows all origins - consider restricting for production'
    })
  }

  return {
    ...result,
    errors: [...result.errors, ...exportErrors]
  }
}

// Environment variable validation
export function validateEnvVariables(variables: EnvVariable[]): ValidationError[] {
  const errors: ValidationError[] = []
  const seenKeys = new Set<string>()

  variables.forEach((variable, index) => {
    // Check for duplicate keys
    if (seenKeys.has(variable.key)) {
      errors.push({
        field: `variable-${index}`,
        message: `Duplicate environment variable: ${variable.key}`
      })
    }
    seenKeys.add(variable.key)

    // Validate individual variable
    const fieldErrors = validateField(variable.key, variable.value)
    errors.push(...fieldErrors.map(error => ({
      ...error,
      field: `${variable.key} (line ${index + 1})`
    })))
  })

  return errors
}

// Utility functions
function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function formatZodError(error: z.ZodError): string {
  if (error.errors.length === 1) {
    return error.errors[0].message
  }
  return error.errors.map(e => e.message).join(', ')
}

// Debounced validation for performance
let validationTimeout: number | null = null

export function validateWithDebounce(
  data: ConfigData,
  onValidation: (result: ValidationResult) => void,
  debounceMs: number = 300
): void {
  if (validationTimeout) {
    clearTimeout(validationTimeout)
  }

  validationTimeout = setTimeout(() => {
    const result = validateConfig(data)
    onValidation(result)
    validationTimeout = null
  }, debounceMs)
}

// Validation context for specific use cases
export function createValidationContext(options: {
  enableCrossFieldValidation?: boolean
  enableCompletenessWarnings?: boolean
  exportMode?: boolean
} = {}) {
  return {
    validateField: (fieldName: string, value: unknown) => validateField(fieldName, value),
    validateConfig: (data: ConfigData) => {
      if (options.exportMode) {
        return validateForExport(data)
      }
      return validateConfig(data)
    },
    validateWithDebounce: (data: ConfigData, onValidation: (result: ValidationResult) => void, debounceMs?: number) =>
      validateWithDebounce(data, onValidation, debounceMs)
  }
}