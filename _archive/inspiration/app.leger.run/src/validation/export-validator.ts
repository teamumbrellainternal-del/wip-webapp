import type { ConfigData } from '@/types'
import { CrossFieldValidator, type ValidationResult } from './cross-field-validator'

export type ExportFormat = 'env' | 'json' | 'docker' | 'yaml'

export interface ExportValidationResult {
  isReady: boolean
  errors: ValidationResult[]
  warnings: ValidationResult[]
  suggestions: ValidationResult[]
}

export class ExportValidator {
  private crossFieldValidator: CrossFieldValidator
  
  constructor() {
    this.crossFieldValidator = new CrossFieldValidator()
  }
  
  validateForProduction(formData: ConfigData): ExportValidationResult {
    const errors: ValidationResult[] = []
    const warnings: ValidationResult[] = []
    const suggestions: ValidationResult[] = []
    
    // Run cross-field validation
    const dependencyErrors = this.crossFieldValidator.validateDependencies(formData)
    errors.push(...dependencyErrors.filter(e => e.severity === 'error'))
    warnings.push(...dependencyErrors.filter(e => e.severity === 'warning'))
    
    // Run security validation
    const securityWarnings = this.crossFieldValidator.validateSecurityBestPractices(formData)
    warnings.push(...securityWarnings.filter(w => w.severity === 'warning'))
    suggestions.push(...securityWarnings.filter(w => w.severity === 'info'))
    
    // Run production readiness validation
    const productionIssues = this.crossFieldValidator.validateProductionReadiness(formData)
    errors.push(...productionIssues.filter(i => i.severity === 'error'))
    warnings.push(...productionIssues.filter(i => i.severity === 'warning'))
    suggestions.push(...productionIssues.filter(i => i.severity === 'info'))
    
    // Check for critical missing fields
    const criticalFields = this.validateCriticalFields(formData)
    errors.push(...criticalFields)
    
    // Generate export-specific suggestions
    const exportSuggestions = this.generateProductionSuggestions(formData)
    suggestions.push(...exportSuggestions)
    
    return {
      isReady: errors.length === 0,
      errors,
      warnings,
      suggestions
    }
  }
  
  validateForFormat(formData: ConfigData, format: ExportFormat): ValidationResult[] {
    switch (format) {
      case 'env':
        return this.validateEnvFormat(formData)
      case 'json':
        return this.validateJsonFormat(formData)
      case 'docker':
        return this.validateDockerFormat(formData)
      case 'yaml':
        return this.validateYamlFormat(formData)
      default:
        return []
    }
  }
  
  private validateCriticalFields(formData: ConfigData): ValidationResult[] {
    const errors: ValidationResult[] = []
    
    // Check for required production fields
    if (!formData.WEBUI_SECRET_KEY) {
      errors.push({
        field: 'WEBUI_SECRET_KEY',
        message: 'Secret key is required for production deployment',
        severity: 'error',
        suggestion: 'Generate a secure random secret key'
      })
    }
    
    // Check for database configuration
    if (!formData.DATABASE_URL && !formData.POSTGRES_DB && !formData.SQLITE_DB) {
      errors.push({
        field: 'DATABASE_URL',
        message: 'Database configuration is required',
        severity: 'error',
        suggestion: 'Configure PostgreSQL, MySQL, or SQLite database'
      })
    }
    
    // Check for base URL
    if (!formData.WEBUI_URL) {
      errors.push({
        field: 'WEBUI_URL',
        message: 'Application URL is required',
        severity: 'error',
        suggestion: 'Set the URL where your application will be accessible'
      })
    }
    
    return errors
  }
  
  private generateProductionSuggestions(formData: ConfigData): ValidationResult[] {
    const suggestions: ValidationResult[] = []
    
    // Suggest backup configuration
    if (!formData.ENABLE_BACKUP) {
      suggestions.push({
        field: 'ENABLE_BACKUP',
        message: 'Consider enabling backups for data protection',
        severity: 'info'
      })
    }
    
    // Suggest monitoring
    if (!formData.ENABLE_METRICS) {
      suggestions.push({
        field: 'ENABLE_METRICS',
        message: 'Consider enabling metrics for monitoring',
        severity: 'info'
      })
    }
    
    // Suggest logging configuration
    if (!formData.LOG_LEVEL || formData.LOG_LEVEL === 'debug') {
      suggestions.push({
        field: 'LOG_LEVEL',
        message: 'Consider setting log level to "info" or "warning" for production',
        severity: 'info'
      })
    }
    
    // Suggest CDN configuration
    if (formData.WEBUI_URL && !formData.CDN_URL) {
      suggestions.push({
        field: 'CDN_URL',
        message: 'Consider using a CDN for better performance',
        severity: 'info'
      })
    }
    
    // Suggest Redis for caching
    if (!formData.REDIS_URL && !formData.CACHE_TYPE) {
      suggestions.push({
        field: 'REDIS_URL',
        message: 'Consider configuring Redis for caching and sessions',
        severity: 'info'
      })
    }
    
    return suggestions
  }
  
  private validateEnvFormat(formData: ConfigData): ValidationResult[] {
    const issues: ValidationResult[] = []
    
    // Check for multiline values that might cause issues
    Object.entries(formData).forEach(([key, value]) => {
      if (typeof value === 'string' && value.includes('\n')) {
        issues.push({
          field: key,
          message: 'Contains newlines - may need escaping in .env format',
          severity: 'warning',
          suggestion: 'Wrap value in quotes or escape newlines'
        })
      }
      
      // Check for special characters that need escaping
      if (typeof value === 'string' && /["`$\\]/.test(value)) {
        issues.push({
          field: key,
          message: 'Contains special characters that may need escaping',
          severity: 'info',
          suggestion: 'Ensure special characters are properly escaped'
        })
      }
    })
    
    return issues
  }
  
  private validateJsonFormat(formData: ConfigData): ValidationResult[] {
    const issues: ValidationResult[] = []
    
    // Check for non-serializable values
    Object.entries(formData).forEach(([key, value]) => {
      if (value === undefined) {
        issues.push({
          field: key,
          message: 'Undefined values will be omitted in JSON',
          severity: 'info'
        })
      }
      
      if (typeof value === 'function') {
        issues.push({
          field: key,
          message: 'Functions cannot be serialized to JSON',
          severity: 'error'
        })
      }
    })
    
    return issues
  }
  
  private validateDockerFormat(formData: ConfigData): ValidationResult[] {
    const issues: ValidationResult[] = []
    
    // Check for Docker-specific configuration
    if (!formData.DOCKER_IMAGE && !formData.DOCKER_TAG) {
      issues.push({
        field: 'DOCKER_IMAGE',
        message: 'Docker image not specified',
        severity: 'info',
        suggestion: 'Specify Docker image name and tag'
      })
    }
    
    // Check for volume mounts
    if (!formData.DATA_VOLUME && !formData.VOLUME_MOUNT) {
      issues.push({
        field: 'DATA_VOLUME',
        message: 'No data volume configured',
        severity: 'warning',
        suggestion: 'Configure volume mounts for persistent data'
      })
    }
    
    // Check for port configuration
    if (!formData.PORT && !formData.WEBUI_PORT) {
      issues.push({
        field: 'PORT',
        message: 'No port configuration found',
        severity: 'warning',
        suggestion: 'Specify port mapping for Docker container'
      })
    }
    
    return issues
  }
  
  private validateYamlFormat(formData: ConfigData): ValidationResult[] {
    const issues: ValidationResult[] = []
    
    // YAML-specific validation
    Object.entries(formData).forEach(([key, value]) => {
      // Check for values that might cause YAML parsing issues
      if (typeof value === 'string' && value.startsWith('*')) {
        issues.push({
          field: key,
          message: 'Value starts with * which has special meaning in YAML',
          severity: 'warning',
          suggestion: 'Wrap value in quotes'
        })
      }
      
      if (typeof value === 'string' && /^(yes|no|true|false|on|off)$/i.test(value)) {
        issues.push({
          field: key,
          message: 'Value might be interpreted as boolean in YAML',
          severity: 'info',
          suggestion: 'Wrap in quotes to preserve string type'
        })
      }
    })
    
    return issues
  }
  
  validateCompleteness(formData: ConfigData): { 
    percentage: number
    missingRequired: string[]
    missingOptional: string[]
  } {
    const requiredFields = [
      'WEBUI_URL',
      'WEBUI_SECRET_KEY',
      'DATABASE_URL'
    ]
    
    const recommendedFields = [
      'ADMIN_EMAIL',
      'DEFAULT_USER_ROLE',
      'ENV',
      'LOG_LEVEL',
      'CORS_ALLOW_ORIGIN',
      'SESSION_SECRET'
    ]
    
    const missingRequired = requiredFields.filter(field => !formData[field])
    const missingOptional = recommendedFields.filter(field => !formData[field])
    
    const totalFields = Object.keys(formData).length
    const configuredFields = Object.values(formData).filter(v => v !== null && v !== undefined && v !== '').length
    const percentage = totalFields > 0 ? Math.round((configuredFields / totalFields) * 100) : 0
    
    return {
      percentage,
      missingRequired,
      missingOptional
    }
  }
}