/**
 * Frontend Logger Utility
 *
 * Mirrors the backend logger structure for consistent tracing.
 * Outputs structured JSON to console for easy debugging.
 */

export type LogLevel = 'info' | 'warn' | 'error' | 'debug'

export interface LogContext {
  requestId?: string
  userId?: string
  [key: string]: any
}

class Logger {
  private log(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString()
    const entry = {
      timestamp,
      level,
      message,
      ...context,
    }

    // Style the output based on level
    const styles = {
      info: 'color: #3b82f6',
      warn: 'color: #eab308',
      error: 'color: #ef4444',
      debug: 'color: #a8a29e',
    }

    console.log(`%c[${level.toUpperCase()}] ${message}`, styles[level], entry)
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context)
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context)
  }

  error(message: string, context?: LogContext) {
    this.log('error', message, context)
  }

  debug(message: string, context?: LogContext) {
    this.log('debug', message, context)
  }
}

export const logger = new Logger()
