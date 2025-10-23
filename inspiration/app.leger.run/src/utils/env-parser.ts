import type { ConfigData, EnvVariable, ValidationError } from '@/types'

export function parseEnvContent(content: string): { data: ConfigData; errors: ValidationError[] } {
  const data: ConfigData = {}
  const errors: ValidationError[] = []
  
  const lines = content.split('\n')
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // Skip empty lines and comments
    if (!line || line.startsWith('#')) {
      continue
    }
    
    // Find the first = character
    const equalIndex = line.indexOf('=')
    
    if (equalIndex === -1) {
      errors.push({
        field: `line-${i + 1}`,
        message: `Invalid ENV format: missing '=' character`
      })
      continue
    }
    
    const key = line.substring(0, equalIndex).trim()
    const value = line.substring(equalIndex + 1).trim()
    
    if (!key) {
      errors.push({
        field: `line-${i + 1}`,
        message: `Invalid ENV format: empty key`
      })
      continue
    }
    
    // Remove quotes from value if present
    let cleanValue = value
    if ((cleanValue.startsWith('"') && cleanValue.endsWith('"')) ||
        (cleanValue.startsWith("'") && cleanValue.endsWith("'"))) {
      cleanValue = cleanValue.slice(1, -1)
    }
    
    data[key] = cleanValue
  }
  
  return { data, errors }
}

export function extractEnvVariables(content: string): EnvVariable[] {
  const variables: EnvVariable[] = []
  const lines = content.split('\n')
  
  let currentComment = ''
  
  for (const line of lines) {
    const trimmed = line.trim()
    
    if (trimmed.startsWith('#')) {
      // Accumulate comments
      if (currentComment) {
        currentComment += '\n' + trimmed.substring(1).trim()
      } else {
        currentComment = trimmed.substring(1).trim()
      }
      continue
    }
    
    if (!trimmed || !trimmed.includes('=')) {
      // Reset comment on empty lines or invalid lines
      currentComment = ''
      continue
    }
    
    const equalIndex = trimmed.indexOf('=')
    const key = trimmed.substring(0, equalIndex).trim()
    const value = trimmed.substring(equalIndex + 1).trim()
    
    if (key) {
      // Remove quotes from value
      let cleanValue = value
      if ((cleanValue.startsWith('"') && cleanValue.endsWith('"')) ||
          (cleanValue.startsWith("'") && cleanValue.endsWith("'"))) {
        cleanValue = cleanValue.slice(1, -1)
      }
      
      variables.push({
        key,
        value: cleanValue,
        comment: currentComment || undefined
      })
      
      // Reset comment after using it
      currentComment = ''
    }
  }
  
  return variables
}

export function validateEnvSyntax(content: string): ValidationError[] {
  const { errors } = parseEnvContent(content)
  return errors
}

export function formatEnvContent(content: string): string {
  const lines = content.split('\n')
  const formatted: string[] = []
  
  for (const line of lines) {
    const trimmed = line.trim()
    
    if (!trimmed) {
      // Preserve empty lines but normalize them
      formatted.push('')
      continue
    }
    
    if (trimmed.startsWith('#')) {
      // Format comment lines
      formatted.push(trimmed)
      continue
    }
    
    if (trimmed.includes('=')) {
      const equalIndex = trimmed.indexOf('=')
      const key = trimmed.substring(0, equalIndex).trim()
      const value = trimmed.substring(equalIndex + 1).trim()
      
      if (key) {
        formatted.push(`${key}=${value}`)
      }
    }
  }
  
  return formatted.join('\n')
}