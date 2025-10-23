/**
 * Sentry Client Configuration
 * Monitors client-side errors and performance
 */

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of transactions in production (adjust as needed)

  // Session Replay
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

  // Environment
  environment: process.env.NODE_ENV || 'development',

  // Release tracking
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || 'v1.0.0',

  // Enable debugging in development
  debug: process.env.NODE_ENV === 'development',

  // Integrations
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
    Sentry.browserTracingIntegration(),
  ],

  // Error filtering
  beforeSend(event, hint) {
    // Filter out certain errors
    if (event.exception) {
      const error = hint.originalException;
      // Don't send CORS errors
      if (error && typeof error === 'object' && 'message' in error) {
        const message = (error as any).message;
        if (
          message?.includes?.('CORS') ||
          message?.includes?.('Failed to fetch')
        ) {
          return null;
        }
      }
    }
    return event;
  },

  // Breadcrumbs
  maxBreadcrumbs: 50,
  
  // Sample rate for session replay
  beforeSendTransaction(event) {
    // Modify or drop transactions before sending
    return event;
  },
});
