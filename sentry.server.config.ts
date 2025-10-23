/**
 * Sentry Server Configuration
 * Monitors server-side errors and API performance
 */

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of transactions

  // Environment
  environment: process.env.NODE_ENV || 'development',

  // Release tracking
  release: process.env.VERCEL_GIT_COMMIT_SHA || 'v1.0.0',

  // Enable debugging in development
  debug: process.env.NODE_ENV === 'development',

  // Server-specific integrations
  integrations: [
    // HTTP integration for tracing API calls
    Sentry.httpIntegration(),
  ],

  // Error filtering
  beforeSend(event, hint) {
    // Filter out certain server errors
    if (event.exception) {
      const error = hint.originalException;
      if (error && typeof error === 'object' && 'message' in error) {
        const message = (error as any).message;
        // Don't send database connection timeout errors in development
        if (
          process.env.NODE_ENV === 'development' &&
          message?.includes?.('connection timeout')
        ) {
          return null;
        }
      }
    }
    return event;
  },

  // Breadcrumbs
  maxBreadcrumbs: 50,

  // Ignore specific errors
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
  ],
});
