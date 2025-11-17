/**
 * Structured logging utility
 * Implements task-10.2 requirements for structured JSON logging
 */

/**
 * Log levels in order of severity
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * Log entry context
 */
export interface LogContext {
  requestId?: string
  userId?: string
  endpoint?: string
  method?: string
  parameters?: Record<string, any>
  error?: Error | unknown
  stack?: string
  duration?: number
  statusCode?: number
  [key: string]: any
}

/**
 * Structured log entry
 */
interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: LogContext
  environment?: string
}

/**
 * Sensitive field patterns to exclude from logs
 */
const SENSITIVE_PATTERNS = [
  /password/i,
  /token/i,
  /secret/i,
  /api[_-]?key/i,
  /auth/i,
  /bearer/i,
  /jwt/i,
  /cookie/i,
  /session/i,
]

/**
 * Headers to exclude from logs
 */
const SENSITIVE_HEADERS = [
  'authorization',
  'cookie',
  'set-cookie',
  'x-api-key',
  'api-key',
  'x-auth-token',
]

/**
 * Environment detection - will be set by the Worker on initialization
 */
let currentEnvironment: string = 'development'

/**
 * Set the current environment for logging
 * Should be called during Worker initialization
 */
export function setEnvironment(env: string): void {
  currentEnvironment = env
}

/**
 * Check if running in production environment
 */
function isProduction(): boolean {
  return currentEnvironment === 'production'
}

/**
 * Check if running in development environment
 */
function isDevelopment(): boolean {
  return currentEnvironment === 'development' || currentEnvironment === 'dev'
}

/**
 * Sanitize sensitive data from objects
 * Removes passwords, tokens, API keys, etc.
 */
export function sanitizeData(data: any): any {
  if (data === null || data === undefined) {
    return data
  }

  if (typeof data !== 'object') {
    return data
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeData(item))
  }

  const sanitized: any = {}

  for (const [key, value] of Object.entries(data)) {
    // Check if key matches sensitive patterns
    const isSensitive = SENSITIVE_PATTERNS.some((pattern) => pattern.test(key))

    if (isSensitive) {
      sanitized[key] = '[REDACTED]'
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeData(value)
    } else {
      sanitized[key] = value
    }
  }

  return sanitized
}

/**
 * Sanitize HTTP headers
 * Removes Authorization, Cookie, and other sensitive headers
 */
export function sanitizeHeaders(headers: Headers | Record<string, string>): Record<string, string> {
  const sanitized: Record<string, string> = {}

  if (headers instanceof Headers) {
    headers.forEach((value, key) => {
      const keyLower = key.toLowerCase()
      if (SENSITIVE_HEADERS.includes(keyLower)) {
        sanitized[key] = '[REDACTED]'
      } else {
        sanitized[key] = value
      }
    })
  } else {
    for (const [key, value] of Object.entries(headers)) {
      const keyLower = key.toLowerCase()
      if (SENSITIVE_HEADERS.includes(keyLower)) {
        sanitized[key] = '[REDACTED]'
      } else {
        sanitized[key] = value
      }
    }
  }

  return sanitized
}

/**
 * Get minimum log level based on environment
 */
function getMinLogLevel(): LogLevel {
  if (isDevelopment()) {
    return LogLevel.DEBUG // Verbose logging in development
  }
  return LogLevel.ERROR // Error-level only in production
}

/**
 * Check if log level should be logged based on environment
 */
function shouldLog(level: LogLevel): boolean {
  const minLevel = getMinLogLevel()

  const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR]
  const minIndex = levels.indexOf(minLevel)
  const currentIndex = levels.indexOf(level)

  return currentIndex >= minIndex
}

/**
 * Format log entry as JSON
 */
function formatLogEntry(level: LogLevel, message: string, context?: LogContext): string {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    environment: currentEnvironment,
  }

  if (context) {
    // Sanitize context before logging
    entry.context = sanitizeData(context)
  }

  return JSON.stringify(entry)
}

/**
 * Logger class for structured logging
 */
export class Logger {
  /**
   * Log debug message
   */
  debug(message: string, context?: LogContext): void {
    if (shouldLog(LogLevel.DEBUG)) {
      console.log(formatLogEntry(LogLevel.DEBUG, message, context))
    }
  }

  /**
   * Log info message
   */
  info(message: string, context?: LogContext): void {
    if (shouldLog(LogLevel.INFO)) {
      console.log(formatLogEntry(LogLevel.INFO, message, context))
    }
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext): void {
    if (shouldLog(LogLevel.WARN)) {
      console.warn(formatLogEntry(LogLevel.WARN, message, context))
    }
  }

  /**
   * Log error message
   */
  error(message: string, context?: LogContext): void {
    if (shouldLog(LogLevel.ERROR)) {
      console.error(formatLogEntry(LogLevel.ERROR, message, context))
    }
  }
}

/**
 * Default logger instance
 */
export const logger = new Logger()

/**
 * Helper to create logger with default context
 */
export function createLogger(defaultContext: LogContext): Logger {
  const contextLogger = new Logger()

  // Override methods to include default context
  const originalDebug = contextLogger.debug.bind(contextLogger)
  const originalInfo = contextLogger.info.bind(contextLogger)
  const originalWarn = contextLogger.warn.bind(contextLogger)
  const originalError = contextLogger.error.bind(contextLogger)

  contextLogger.debug = (message: string, context?: LogContext) => {
    originalDebug(message, { ...defaultContext, ...context })
  }

  contextLogger.info = (message: string, context?: LogContext) => {
    originalInfo(message, { ...defaultContext, ...context })
  }

  contextLogger.warn = (message: string, context?: LogContext) => {
    originalWarn(message, { ...defaultContext, ...context })
  }

  contextLogger.error = (message: string, context?: LogContext) => {
    originalError(message, { ...defaultContext, ...context })
  }

  return contextLogger
}
