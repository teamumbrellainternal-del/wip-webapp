import Ajv from 'ajv'
import addFormats from 'ajv-formats'

export const customFormats = {
  'openai-key': {
    validate: (key: string) => /^sk-[A-Za-z0-9]{48}$/.test(key),
    error: 'Must be a valid OpenAI API key starting with "sk-"'
  },
  
  'anthropic-key': {
    validate: (key: string) => /^sk-ant-[A-Za-z0-9-]{95}$/.test(key),
    error: 'Must be a valid Anthropic API key starting with "sk-ant-"'
  },
  
  'docker-image': {
    validate: (image: string) => /^[a-z0-9]+(?:[._-][a-z0-9]+)*(?:\/[a-z0-9]+(?:[._-][a-z0-9]+)*)*(?::[a-z0-9]+(?:[._-][a-z0-9]+)*)?$/.test(image),
    error: 'Must be a valid Docker image name'
  },
  
  'env-var-name': {
    validate: (name: string) => /^[A-Z][A-Z0-9_]*$/.test(name),
    error: 'Environment variable names must be UPPERCASE with underscores'
  },
  
  'port-number': {
    validate: (port: string | number) => {
      const portNum = typeof port === 'string' ? parseInt(port, 10) : port
      return !isNaN(portNum) && portNum >= 1 && portNum <= 65535
    },
    error: 'Must be a valid port number (1-65535)'
  },
  
  'cron-expression': {
    validate: (cron: string) => {
      // Basic cron expression validation
      const cronRegex = /^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/
      return cronRegex.test(cron)
    },
    error: 'Must be a valid cron expression'
  },
  
  'memory-size': {
    validate: (size: string) => /^\d+(\.\d+)?(K|M|G|T)?i?$/.test(size),
    error: 'Must be a valid memory size (e.g., 512M, 2G)'
  },
  
  'cpu-limit': {
    validate: (cpu: string | number) => {
      if (typeof cpu === 'number') return cpu > 0
      return /^\d+(\.\d+)?$/.test(cpu) && parseFloat(cpu) > 0
    },
    error: 'Must be a valid CPU limit (e.g., 0.5, 2)'
  },
  
  'hex-color': {
    validate: (color: string) => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color),
    error: 'Must be a valid hex color (e.g., #FF5733)'
  },
  
  'jwt-secret': {
    validate: (secret: string) => secret.length >= 32,
    error: 'JWT secret must be at least 32 characters long'
  },
  
  'base64': {
    validate: (str: string) => {
      try {
        return btoa(atob(str)) === str
      } catch {
        return false
      }
    },
    error: 'Must be a valid base64 encoded string'
  },
  
  'semantic-version': {
    validate: (version: string) => /^v?\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/.test(version),
    error: 'Must be a valid semantic version (e.g., 1.2.3, v2.0.0-beta)'
  }
}

export function setupCustomValidator(): Ajv {
  const ajv = new Ajv({ 
    allErrors: true, 
    verbose: true,
    validateFormats: true,
    addUsedSchema: false
  })
  
  // Add standard formats
  addFormats(ajv)
  
  // Add custom formats
  Object.entries(customFormats).forEach(([name, format]) => {
    ajv.addFormat(name, format.validate)
  })
  
  // Add custom keywords for enhanced validation
  ajv.addKeyword({
    keyword: 'dependsOn',
    schemaType: 'object',
    compile: function(schemaVal: any) {
      return function validate(data: any, dataPath: any) {
        const parent = dataPath?.parentData
        if (!parent) return true
        
        for (const [field, value] of Object.entries(schemaVal)) {
          if (parent[field] !== value) {
            return false
          }
        }
        return true
      }
    }
  })
  
  ajv.addKeyword({
    keyword: 'requiresAny',
    schemaType: 'array',
    compile: function(schemaVal: any) {
      return function validate(data: any, dataPath: any) {
        const parent = dataPath?.parentData
        if (!parent) return true
        
        return schemaVal.some((field: string) => !!parent[field])
      }
    }
  })
  
  ajv.addKeyword({
    keyword: 'conflictsWith',
    schemaType: ['string', 'array'],
    compile: function(schemaVal: any) {
      const conflicts = Array.isArray(schemaVal) ? schemaVal : [schemaVal]
      return function validate(data: any, dataPath: any) {
        const parent = dataPath?.parentData
        if (!parent || !data) return true
        
        for (const conflict of conflicts) {
          if (parent[conflict]) {
            // @ts-expect-error - AJV's validate function expects errors to be mutated directly
            validate.errors = [{
              message: `Cannot be used together with ${conflict}`
            }]
            return false
          }
        }
        return true
      }
    }
  })
  
  return ajv
}