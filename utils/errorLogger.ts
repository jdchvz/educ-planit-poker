/**
 * Centralized error logging utility
 */

export enum ErrorLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

export interface ErrorLogEntry {
  level: ErrorLevel
  message: string
  context?: Record<string, any>
  timestamp: Date
  error?: Error
}

/**
 * Log an error with context
 */
export function logError(
  level: ErrorLevel,
  message: string,
  error?: Error,
  context?: Record<string, any>
) {
  const entry: ErrorLogEntry = {
    level,
    message,
    context,
    timestamp: new Date(),
    error,
  }

  // In development, log to console with formatting
  if (process.env.NODE_ENV === 'development' || import.meta.dev) {
    const prefix = `[${level.toUpperCase()}] ${entry.timestamp.toISOString()}`
    const contextStr = context ? `\nContext: ${JSON.stringify(context, null, 2)}` : ''
    const errorStr = error ? `\nError: ${error.message}\n${error.stack}` : ''

    switch (level) {
      case ErrorLevel.INFO:
        console.info(`${prefix} ${message}${contextStr}${errorStr}`)
        break
      case ErrorLevel.WARN:
        console.warn(`${prefix} ${message}${contextStr}${errorStr}`)
        break
      case ErrorLevel.ERROR:
      case ErrorLevel.FATAL:
        console.error(`${prefix} ${message}${contextStr}${errorStr}`)
        break
    }
  } else {
    // In production, log in structured format (can be extended to send to external service)
    console.error(JSON.stringify(entry))
  }

  // TODO: In production, send to external logging service (e.g., Sentry, LogRocket)
  // if (process.env.NODE_ENV === 'production') {
  //   sendToLoggingService(entry)
  // }
}

/**
 * Convenience functions for different error levels
 */
export const logger = {
  info: (message: string, context?: Record<string, any>) =>
    logError(ErrorLevel.INFO, message, undefined, context),

  warn: (message: string, context?: Record<string, any>) =>
    logError(ErrorLevel.WARN, message, undefined, context),

  error: (message: string, error?: Error, context?: Record<string, any>) =>
    logError(ErrorLevel.ERROR, message, error, context),

  fatal: (message: string, error?: Error, context?: Record<string, any>) =>
    logError(ErrorLevel.FATAL, message, error, context),
}
