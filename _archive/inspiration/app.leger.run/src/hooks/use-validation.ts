import { useState, useCallback, useMemo } from 'react'
import type { ConfigData, ValidationError, EnvVariable } from '@/types'
import {
  validateField,
  validateForExport,
  validateEnvVariables,
  validateWithDebounce,
  createValidationContext,
  type ValidationResult
} from '@/utils/validation'

interface ValidationState {
  errors: Record<string, ValidationError[]>
  warnings: Record<string, ValidationError[]>
  isValid: boolean
  isValidating: boolean
  hasValidated: boolean
}

interface UseValidationOptions {
  debounceMs?: number
  validateOnMount?: boolean
  enableCrossFieldValidation?: boolean
  enableCompletenessWarnings?: boolean
  exportMode?: boolean
}

interface UseValidationReturn extends ValidationState {
  // Field-level validation
  validateSingleField: (fieldName: string, value: unknown) => ValidationError[]
  getFieldErrors: (fieldName: string) => ValidationError[]
  getFieldWarnings: (fieldName: string) => ValidationError[]
  hasFieldError: (fieldName: string) => boolean
  
  // Full configuration validation
  validateConfiguration: (data: ConfigData) => ValidationResult
  validateConfigurationAsync: (data: ConfigData) => Promise<ValidationResult>
  
  // Export validation
  validateForExportMode: (data: ConfigData) => ValidationResult
  
  // Environment variable validation
  validateEnvironmentVariables: (variables: EnvVariable[]) => ValidationError[]
  
  // State management
  clearValidation: () => void
  clearFieldValidation: (fieldName: string) => void
  
  // Utility
  getValidationSummary: () => { totalErrors: number; totalWarnings: number; fieldCount: number }
}

export function useValidation(options: UseValidationOptions = {}): UseValidationReturn {
  const {
    debounceMs = 300,
    enableCrossFieldValidation = true,
    enableCompletenessWarnings = true,
    exportMode = false
  } = options

  // Validation state
  const [errors, setErrors] = useState<Record<string, ValidationError[]>>({})
  const [warnings, setWarnings] = useState<Record<string, ValidationError[]>>({})
  const [isValidating, setIsValidating] = useState(false)
  const [hasValidated, setHasValidated] = useState(false)

  // Create validation context
  const validationContext = useMemo(() => 
    createValidationContext({
      enableCrossFieldValidation,
      enableCompletenessWarnings,
      exportMode
    }), [enableCrossFieldValidation, enableCompletenessWarnings, exportMode])

  // Computed validation state
  const isValid = useMemo(() => {
    return Object.values(errors).every(fieldErrors => fieldErrors.length === 0)
  }, [errors])

  // Field-level validation
  const validateSingleField = useCallback((fieldName: string, value: unknown): ValidationError[] => {
    const fieldErrors = validateField(fieldName, value)
    
    // Update errors state
    setErrors(prev => ({
      ...prev,
      [fieldName]: fieldErrors
    }))

    return fieldErrors
  }, [])

  // Get errors for a specific field
  const getFieldErrors = useCallback((fieldName: string): ValidationError[] => {
    return errors[fieldName] || []
  }, [errors])

  // Get warnings for a specific field
  const getFieldWarnings = useCallback((fieldName: string): ValidationError[] => {
    return warnings[fieldName] || []
  }, [warnings])

  // Check if field has errors
  const hasFieldError = useCallback((fieldName: string): boolean => {
    return (errors[fieldName] || []).length > 0
  }, [errors])

  // Full configuration validation
  const validateConfiguration = useCallback((data: ConfigData): ValidationResult => {
    setIsValidating(true)
    setHasValidated(true)

    try {
      const result = validationContext.validateConfig(data)

      // Group errors and warnings by field
      const errorsByField: Record<string, ValidationError[]> = {}
      const warningsByField: Record<string, ValidationError[]> = {}

      result.errors.forEach(error => {
        if (!errorsByField[error.field]) {
          errorsByField[error.field] = []
        }
        errorsByField[error.field].push(error)
      })

      result.warnings.forEach(warning => {
        if (!warningsByField[warning.field]) {
          warningsByField[warning.field] = []
        }
        warningsByField[warning.field].push(warning)
      })

      setErrors(errorsByField)
      setWarnings(warningsByField)

      return result
    } finally {
      setIsValidating(false)
    }
  }, [validationContext])

  // Async configuration validation with debouncing
  const validateConfigurationAsync = useCallback((data: ConfigData): Promise<ValidationResult> => {
    return new Promise((resolve) => {
      setIsValidating(true)
      
      validateWithDebounce(data, (result) => {
        setIsValidating(false)
        setHasValidated(true)

        // Group errors and warnings by field
        const errorsByField: Record<string, ValidationError[]> = {}
        const warningsByField: Record<string, ValidationError[]> = {}

        result.errors.forEach(error => {
          if (!errorsByField[error.field]) {
            errorsByField[error.field] = []
          }
          errorsByField[error.field].push(error)
        })

        result.warnings.forEach(warning => {
          if (!warningsByField[warning.field]) {
            warningsByField[warning.field] = []
          }
          warningsByField[warning.field].push(warning)
        })

        setErrors(errorsByField)
        setWarnings(warningsByField)
        resolve(result)
      }, debounceMs)
    })
  }, [debounceMs])

  // Export-specific validation
  const validateForExportMode = useCallback((data: ConfigData): ValidationResult => {
    setIsValidating(true)
    setHasValidated(true)

    try {
      const result = validateForExport(data)

      // Group errors and warnings by field
      const errorsByField: Record<string, ValidationError[]> = {}
      const warningsByField: Record<string, ValidationError[]> = {}

      result.errors.forEach(error => {
        if (!errorsByField[error.field]) {
          errorsByField[error.field] = []
        }
        errorsByField[error.field].push(error)
      })

      result.warnings.forEach(warning => {
        if (!warningsByField[warning.field]) {
          warningsByField[warning.field] = []
        }
        warningsByField[warning.field].push(warning)
      })

      setErrors(errorsByField)
      setWarnings(warningsByField)

      return result
    } finally {
      setIsValidating(false)
    }
  }, [])

  // Environment variable validation
  const validateEnvironmentVariables = useCallback((variables: EnvVariable[]): ValidationError[] => {
    const validationErrors = validateEnvVariables(variables)
    
    // Group errors by field for state management
    const errorsByField: Record<string, ValidationError[]> = {}
    validationErrors.forEach(error => {
      if (!errorsByField[error.field]) {
        errorsByField[error.field] = []
      }
      errorsByField[error.field].push(error)
    })

    setErrors(prev => ({
      ...prev,
      ...errorsByField
    }))

    return validationErrors
  }, [])

  // Clear all validation
  const clearValidation = useCallback(() => {
    setErrors({})
    setWarnings({})
    setHasValidated(false)
  }, [])

  // Clear validation for specific field
  const clearFieldValidation = useCallback((fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[fieldName]
      return newErrors
    })

    setWarnings(prev => {
      const newWarnings = { ...prev }
      delete newWarnings[fieldName]
      return newWarnings
    })
  }, [])

  // Get validation summary
  const getValidationSummary = useCallback(() => {
    const totalErrors = Object.values(errors).reduce((sum, fieldErrors) => sum + fieldErrors.length, 0)
    const totalWarnings = Object.values(warnings).reduce((sum, fieldWarnings) => sum + fieldWarnings.length, 0)
    const fieldCount = new Set([...Object.keys(errors), ...Object.keys(warnings)]).size

    return { totalErrors, totalWarnings, fieldCount }
  }, [errors, warnings])

  return {
    // State
    errors,
    warnings,
    isValid,
    isValidating,
    hasValidated,

    // Field-level validation
    validateSingleField,
    getFieldErrors,
    getFieldWarnings,
    hasFieldError,

    // Configuration validation
    validateConfiguration,
    validateConfigurationAsync,

    // Export validation
    validateForExportMode,

    // Environment variable validation
    validateEnvironmentVariables,

    // State management
    clearValidation,
    clearFieldValidation,

    // Utility
    getValidationSummary
  }
}

// Hook for real-time field validation
export function useFieldValidation(fieldName: string, debounceMs: number = 150) {
  const [value, setValue] = useState<unknown>('')
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [isValidating, setIsValidating] = useState(false)
  const [hasValidated, setHasValidated] = useState(false)

  // Debounced validation
  const validateValue = useCallback((newValue: unknown) => {
    setIsValidating(true)
    
    const timeoutId = setTimeout(() => {
      const fieldErrors = validateField(fieldName, newValue)
      setErrors(fieldErrors)
      setIsValidating(false)
      setHasValidated(true)
    }, debounceMs)

    return () => clearTimeout(timeoutId)
  }, [fieldName, debounceMs])

  // Update value and trigger validation
  const updateValue = useCallback((newValue: unknown) => {
    setValue(newValue)
    validateValue(newValue)
  }, [validateValue])

  // Immediate validation (without debounce)
  const validateImmediately = useCallback(() => {
    setIsValidating(true)
    const fieldErrors = validateField(fieldName, value)
    setErrors(fieldErrors)
    setIsValidating(false)
    setHasValidated(true)
    return fieldErrors
  }, [fieldName, value])

  // Clear validation state
  const clearValidation = useCallback(() => {
    setErrors([])
    setHasValidated(false)
  }, [])

  return {
    value,
    errors,
    isValid: errors.length === 0,
    isValidating,
    hasValidated,
    updateValue,
    validateImmediately,
    clearValidation
  }
}

// Hook for validation status across multiple fields
export function useValidationStatus(fieldNames: string[]) {
  const [statusMap, setStatusMap] = useState<Record<string, { isValid: boolean; hasError: boolean }>>({})

  const updateFieldStatus = useCallback((fieldName: string, isValid: boolean, hasError: boolean) => {
    setStatusMap(prev => ({
      ...prev,
      [fieldName]: { isValid, hasError }
    }))
  }, [])

  const clearFieldStatus = useCallback((fieldName: string) => {
    setStatusMap(prev => {
      const newMap = { ...prev }
      delete newMap[fieldName]
      return newMap
    })
  }, [])

  const clearAllStatus = useCallback(() => {
    setStatusMap({})
  }, [])

  const getOverallStatus = useCallback(() => {
    const validatedFields = Object.keys(statusMap)
    const allValid = validatedFields.every(field => statusMap[field].isValid)
    const hasAnyError = validatedFields.some(field => statusMap[field].hasError)

    return {
      allValid,
      hasAnyError,
      validatedCount: validatedFields.length,
      totalCount: fieldNames.length
    }
  }, [statusMap, fieldNames])

  return {
    statusMap,
    updateFieldStatus,
    clearFieldStatus,
    clearAllStatus,
    getOverallStatus
  }
}