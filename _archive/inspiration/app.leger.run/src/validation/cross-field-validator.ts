import type { ConfigData } from '@/types'

export interface ValidationResult {
  field: string
  message: string
  severity: 'error' | 'warning' | 'info'
  suggestion?: string
}

export class CrossFieldValidator {
  validateDependencies(formData: ConfigData): ValidationResult[] {
    const errors: ValidationResult[] = []
    
    // OpenAI API dependencies
    if (formData.ENABLE_OPENAI_API === 'true' || formData.ENABLE_OPENAI_API === '1') {
      if (!formData.OPENAI_API_KEY && !formData.OPENAI_API_KEYS) {
        errors.push({
          field: 'OPENAI_API_KEY',
          message: 'API key is required when OpenAI integration is enabled',
          severity: 'error',
          suggestion: 'Add your OpenAI API key or disable OpenAI integration'
        })
      }
      
      if (formData.OPENAI_API_KEY && !this.isValidOpenAIKey(String(formData.OPENAI_API_KEY))) {
        errors.push({
          field: 'OPENAI_API_KEY',
          message: 'Invalid OpenAI API key format',
          severity: 'error',
          suggestion: 'OpenAI API keys should start with "sk-" and be 51 characters long'
        })
      }
    }
    
    // Anthropic API dependencies
    if (formData.ENABLE_ANTHROPIC_API === 'true' || formData.ENABLE_ANTHROPIC_API === '1') {
      if (!formData.ANTHROPIC_API_KEY) {
        errors.push({
          field: 'ANTHROPIC_API_KEY',
          message: 'API key is required when Anthropic integration is enabled',
          severity: 'error'
        })
      }
    }
    
    // Vector Database dependencies
    if (formData.VECTOR_DB) {
      const vectorDbErrors = this.validateVectorDbConfig(formData)
      errors.push(...vectorDbErrors)
    }
    
    // OAuth dependencies
    if (formData.ENABLE_OAUTH_SIGNUP === 'true' || formData.ENABLE_OAUTH_SIGNUP === '1') {
      const oauthErrors = this.validateOAuthConfig(formData)
      errors.push(...oauthErrors)
    }
    
    // LDAP dependencies
    if (formData.ENABLE_LDAP === 'true' || formData.ENABLE_LDAP === '1') {
      const ldapErrors = this.validateLDAPConfig(formData)
      errors.push(...ldapErrors)
    }
    
    // S3 Storage dependencies
    if (formData.S3_ENDPOINT_URL || formData.S3_BUCKET_NAME) {
      const s3Errors = this.validateS3Config(formData)
      errors.push(...s3Errors)
    }
    
    // WebSocket dependencies
    if (formData.ENABLE_WEBSOCKET_SUPPORT === 'true' || formData.ENABLE_WEBSOCKET_SUPPORT === '1') {
      if (!formData.WEBSOCKET_URL && !formData.WEBSOCKET_MANAGER) {
        errors.push({
          field: 'WEBSOCKET_URL',
          message: 'WebSocket URL required when WebSocket support is enabled',
          severity: 'warning',
          suggestion: 'Configure WebSocket URL or disable WebSocket support'
        })
      }
    }
    
    return errors
  }
  
  validateSecurityBestPractices(formData: ConfigData): ValidationResult[] {
    const warnings: ValidationResult[] = []
    
    // Check for default or weak secret keys
    if (!formData.WEBUI_SECRET_KEY || formData.WEBUI_SECRET_KEY === 'default') {
      warnings.push({
        field: 'WEBUI_SECRET_KEY',
        message: 'Using default or empty secret key is insecure',
        severity: 'warning',
        suggestion: 'Generate a strong random secret key for production'
      })
    } else if (String(formData.WEBUI_SECRET_KEY).length < 32) {
      warnings.push({
        field: 'WEBUI_SECRET_KEY',
        message: 'Secret key should be at least 32 characters',
        severity: 'warning',
        suggestion: 'Use a longer secret key for better security'
      })
    }
    
    // Check CORS configuration
    if (formData.CORS_ALLOW_ORIGIN === '*') {
      warnings.push({
        field: 'CORS_ALLOW_ORIGIN',
        message: 'CORS allows all origins - potential security risk',
        severity: 'warning',
        suggestion: 'Restrict CORS to specific domains in production'
      })
    }
    
    // Check safe mode
    if (formData.SAFE_MODE === 'false' || formData.SAFE_MODE === '0') {
      warnings.push({
        field: 'SAFE_MODE',
        message: 'Safe mode is disabled',
        severity: 'warning',
        suggestion: 'Enable safe mode for production deployments'
      })
    }
    
    // Check SSL/TLS configuration
    if (formData.WEBUI_URL && String(formData.WEBUI_URL).startsWith('http://') && 
        !String(formData.WEBUI_URL).includes('localhost')) {
      warnings.push({
        field: 'WEBUI_URL',
        message: 'Using HTTP instead of HTTPS',
        severity: 'warning',
        suggestion: 'Use HTTPS for production deployments'
      })
    }
    
    // Check authentication
    if (formData.WEBUI_AUTH === 'false' || formData.WEBUI_AUTH === '0') {
      warnings.push({
        field: 'WEBUI_AUTH',
        message: 'Authentication is disabled',
        severity: 'warning',
        suggestion: 'Enable authentication for production deployments'
      })
    }
    
    // Check rate limiting
    if (!formData.ENABLE_API_RATE_LIMIT || formData.ENABLE_API_RATE_LIMIT === 'false') {
      warnings.push({
        field: 'ENABLE_API_RATE_LIMIT',
        message: 'API rate limiting is disabled',
        severity: 'info',
        suggestion: 'Consider enabling rate limiting to prevent abuse'
      })
    }
    
    return warnings
  }
  
  validateProductionReadiness(formData: ConfigData): ValidationResult[] {
    const issues: ValidationResult[] = []
    
    // Check for localhost URLs
    const urlFields = ['WEBUI_URL', 'OPENAI_API_BASE_URL', 'OLLAMA_BASE_URL', 'AUTOMATIC1111_BASE_URL']
    urlFields.forEach(field => {
      if (formData[field] && String(formData[field]).includes('localhost')) {
        issues.push({
          field,
          message: 'Localhost URL detected - update for production',
          severity: 'warning',
          suggestion: 'Replace localhost with actual domain or IP'
        })
      }
    })
    
    // Check debug mode
    if (formData.DEBUG === 'true' || formData.DEBUG === '1') {
      issues.push({
        field: 'DEBUG',
        message: 'Debug mode is enabled',
        severity: 'warning',
        suggestion: 'Disable debug mode in production'
      })
    }
    
    // Check environment
    if (!formData.ENV || (formData.ENV !== 'prod' && formData.ENV !== 'production')) {
      issues.push({
        field: 'ENV',
        message: 'Environment not set to production',
        severity: 'info',
        suggestion: 'Set ENV to "prod" or "production"'
      })
    }
    
    // Check admin email
    if (!formData.ADMIN_EMAIL) {
      issues.push({
        field: 'ADMIN_EMAIL',
        message: 'Admin email not configured',
        severity: 'warning',
        suggestion: 'Set admin email for notifications and recovery'
      })
    }
    
    // Check database configuration
    if (!formData.DATABASE_URL && !formData.POSTGRES_DB) {
      issues.push({
        field: 'DATABASE_URL',
        message: 'Database not configured',
        severity: 'error',
        suggestion: 'Configure database connection for production'
      })
    }
    
    return issues
  }
  
  private validateVectorDbConfig(formData: ConfigData): ValidationResult[] {
    const errors: ValidationResult[] = []
    const vectorDb = formData.VECTOR_DB
    
    const vectorDbRequirements: Record<string, string[]> = {
      'chroma': ['CHROMA_HTTP_HOST'],
      'elasticsearch': ['ELASTICSEARCH_URL'],
      'milvus': ['MILVUS_URI'],
      'opensearch': ['OPENSEARCH_URI'],
      'pgvector': ['PGVECTOR_DB_URL'],
      'qdrant': ['QDRANT_URI'],
      'pinecone': ['PINECONE_API_KEY', 'PINECONE_ENVIRONMENT', 'PINECONE_INDEX_NAME']
    }
    
    const requiredFields = vectorDbRequirements[vectorDb as string]
    if (requiredFields) {
      requiredFields.forEach(field => {
        if (!formData[field]) {
          errors.push({
            field,
            message: `${field} is required when using ${vectorDb} as vector database`,
            severity: 'error',
            suggestion: `Configure ${field} or choose a different vector database`
          })
        }
      })
    }
    
    return errors
  }
  
  private validateOAuthConfig(formData: ConfigData): ValidationResult[] {
    const errors: ValidationResult[] = []
    
    const hasAnyOAuthProvider = 
      formData.GOOGLE_CLIENT_ID || 
      formData.MICROSOFT_CLIENT_ID || 
      formData.GITHUB_CLIENT_ID || 
      formData.OAUTH_CLIENT_ID
    
    if (!hasAnyOAuthProvider) {
      errors.push({
        field: 'ENABLE_OAUTH_SIGNUP',
        message: 'OAuth signup enabled but no OAuth provider configured',
        severity: 'error',
        suggestion: 'Configure at least one OAuth provider or disable OAuth signup'
      })
    }
    
    // Check OAuth provider pairs
    const oauthPairs = [
      ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
      ['MICROSOFT_CLIENT_ID', 'MICROSOFT_CLIENT_SECRET'],
      ['GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET'],
      ['OAUTH_CLIENT_ID', 'OAUTH_CLIENT_SECRET']
    ]
    
    oauthPairs.forEach(([clientId, clientSecret]) => {
      if (formData[clientId] && !formData[clientSecret]) {
        errors.push({
          field: clientSecret,
          message: `${clientSecret} required when ${clientId} is provided`,
          severity: 'error'
        })
      }
    })
    
    return errors
  }
  
  private validateLDAPConfig(formData: ConfigData): ValidationResult[] {
    const errors: ValidationResult[] = []
    const requiredFields = ['LDAP_SERVER_HOST', 'LDAP_APP_DN', 'LDAP_APP_PASSWORD', 'LDAP_SEARCH_BASE']
    
    requiredFields.forEach(field => {
      if (!formData[field]) {
        errors.push({
          field,
          message: `${field} is required when LDAP is enabled`,
          severity: 'error'
        })
      }
    })
    
    return errors
  }
  
  private validateS3Config(formData: ConfigData): ValidationResult[] {
    const errors: ValidationResult[] = []
    
    if (formData.S3_BUCKET_NAME && !formData.S3_ACCESS_KEY_ID) {
      errors.push({
        field: 'S3_ACCESS_KEY_ID',
        message: 'S3 Access Key ID required when using S3 storage',
        severity: 'error'
      })
    }
    
    if (formData.S3_ACCESS_KEY_ID && !formData.S3_SECRET_ACCESS_KEY) {
      errors.push({
        field: 'S3_SECRET_ACCESS_KEY',
        message: 'S3 Secret Access Key required when Access Key ID is provided',
        severity: 'error'
      })
    }
    
    return errors
  }
  
  private isValidOpenAIKey(key: string): boolean {
    return /^sk-[A-Za-z0-9]{48}$/.test(key)
  }
}