/**
 * Structured Logger for Production
 * Week 4: Sentry Integration for Error Tracking & Monitoring
 * 
 * Provides consistent, structured logging with Sentry integration
 */

import * as Sentry from '@sentry/nextjs';

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
    
    // Send to Sentry as breadcrumb
    Sentry.addBreadcrumb({
      category: 'info',
      message,
      level: 'info',
      data: metadata,
    })
  }

  warn(message: string, metadata?: LogMetadata) {
    const entry = this.formatLog('warn', message, metadata)
    console.warn(JSON.stringify(entry))
    
    // Send to Sentry as warning
    Sentry.captureMessage(message, {
      level: 'warning',
      contexts: {
        metadata: metadata || {},
      },
    })
  }

  error(message: string, error?: Error, metadata?: LogMetadata) {
    const entry = this.formatLog('error', message, metadata, error)
    console.error(JSON.stringify(entry))
    
    // Send to Sentry as error
    if (error) {
      Sentry.captureException(error, {
        contexts: {
          metadata: metadata || {},
        },
        tags: {
          errorType: error.name,
        },
      })
    } else {
      Sentry.captureMessage(message, {
        level: 'error',
        contexts: {
          metadata: metadata || {},
        },
      })
    }
  }

  debug(message: string, metadata?: LogMetadata) {
    if (this.environment === 'development') {
      const entry = this.formatLog('debug', message, metadata)
      console.debug(JSON.stringify(entry))
      
      // Add as breadcrumb in Sentry
      Sentry.addBreadcrumb({
        category: 'debug',
        message,
        level: 'debug',
        data: metadata,
      })
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
    
    // Create Sentry span for API monitoring
    const span = Sentry.startSpan({
      op: 'http.server',
      name: `${method} ${path}`,
    }, () => {
      // Span will be automatically finished
    })
    
    return span
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
    
    // Track performance metrics in Sentry
    Sentry.metrics.distribution('api.response_time', duration, {
      unit: 'millisecond',
    })
    
    // Add tags to current span if available
    Sentry.setTags({
      'api.method': method,
      'api.path': path,
      'api.status': statusCode.toString(),
    })
  }

  databaseQuery(query: string, duration: number, metadata?: LogMetadata) {
    this.debug('Database Query', {
      ...metadata,
      query: query.substring(0, 100), // Truncate long queries
      duration,
      type: 'database_query',
    })
    
    // Track database performance
    Sentry.metrics.distribution('db.query_time', duration, {
      unit: 'millisecond',
    })
    
    // Add context to current transaction
    Sentry.setTag('db.query_type', metadata?.queryType || 'unknown')
  }

  userAction(action: string, userId?: string, metadata?: LogMetadata) {
    this.info('User Action', {
      ...metadata,
      action,
      userId,
      type: 'user_action',
    })
    
    // Set user context in Sentry
    if (userId) {
      Sentry.setUser({ id: userId })
    }
    
    // Track user action
    Sentry.addBreadcrumb({
      category: 'user_action',
      message: action,
      level: 'info',
      data: metadata,
    })
  }
  
  // New method: Set user context
  setUser(userId: string, email?: string, username?: string) {
    Sentry.setUser({
      id: userId,
      email,
      username,
    })
  }
  
  // New method: Clear user context (on logout)
  clearUser() {
    Sentry.setUser(null)
  }
  
  // New method: Add custom context
  setContext(key: string, data: Record<string, any>) {
    Sentry.setContext(key, data)
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
