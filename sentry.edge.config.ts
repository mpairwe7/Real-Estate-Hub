/**
 * Sentry Edge Configuration
 * Monitors edge runtime errors and middleware
 */

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: 1.0,

  // Environment
  environment: process.env.NODE_ENV || 'development',

  // Release tracking
  release: process.env.VERCEL_GIT_COMMIT_SHA || 'v1.0.0',

  // Enable debugging in development
  debug: process.env.NODE_ENV === 'development',

  // Edge runtime has limited integrations
  integrations: [],

  // Breadcrumbs
  maxBreadcrumbs: 30,
});
