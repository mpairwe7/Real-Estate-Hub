/**
 * Structured Logger for Production
 * Week 3: Cloud Deployment & Monitoring
 * 
 * Provides consistent, structured logging for better monitoring and debugging
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogMetadata {
  [key: string]: any
}

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  environment: string
  metadata?: LogMetadata
  error?: {
    message: string
    stack?: string
    name: string
  }
}

class Logger {
  private environment: string

  constructor() {
    this.environment = process.env.NODE_ENV || 'development'
  }

  private formatLog(level: LogLevel, message: string, metadata?: LogMetadata, error?: Error): LogEntry {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      environment: this.environment,
    }

    if (metadata) {
      entry.metadata = metadata
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }
    }

    return entry
  }

  info(message: string, metadata?: LogMetadata) {
    const entry = this.formatLog('info', message, metadata)
    console.log(JSON.stringify(entry))
  }

  warn(message: string, metadata?: LogMetadata) {
    const entry = this.formatLog('warn', message, metadata)
    console.warn(JSON.stringify(entry))
  }

  error(message: string, error?: Error, metadata?: LogMetadata) {
    const entry = this.formatLog('error', message, metadata, error)
    console.error(JSON.stringify(entry))
  }

  debug(message: string, metadata?: LogMetadata) {
    if (this.environment === 'development') {
      const entry = this.formatLog('debug', message, metadata)
      console.debug(JSON.stringify(entry))
    }
  }

  // Specialized logging methods
  apiRequest(method: string, path: string, metadata?: LogMetadata) {
    this.info('API Request', {
      ...metadata,
      method,
      path,
      type: 'api_request',
    })
  }

  apiResponse(method: string, path: string, statusCode: number, duration: number, metadata?: LogMetadata) {
    this.info('API Response', {
      ...metadata,
      method,
      path,
      statusCode,
      duration,
      type: 'api_response',
    })
  }

  databaseQuery(query: string, duration: number, metadata?: LogMetadata) {
    this.debug('Database Query', {
      ...metadata,
      query: query.substring(0, 100), // Truncate long queries
      duration,
      type: 'database_query',
    })
  }

  userAction(action: string, userId?: string, metadata?: LogMetadata) {
    this.info('User Action', {
      ...metadata,
      action,
      userId,
      type: 'user_action',
    })
  }
}

// Export singleton instance
export const logger = new Logger()

// Usage examples:
// logger.info('User logged in', { userId: '123', method: 'email' })
// logger.error('Failed to fetch properties', error, { userId: '123' })
// logger.apiRequest('GET', '/api/properties', { userId: '123' })
// logger.apiResponse('GET', '/api/properties', 200, 150, { count: 25 })
// logger.databaseQuery('SELECT * FROM properties', 45, { rows: 25 })
// logger.userAction('create_property', '123', { propertyId: '456' })
