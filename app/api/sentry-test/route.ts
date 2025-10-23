/**
 * Sentry Test Endpoint
 * Use this to verify Sentry error tracking is working
 * 
 * Visit: http://localhost:3000/api/sentry-test
 * Then check your Sentry dashboard for the captured error
 */

import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import * as Sentry from '@sentry/nextjs';

export async function GET() {
  try {
    // Test 1: Capture a test error
    throw new Error('Sentry test error - monitoring is working!');
  } catch (error) {
    // Log error with context
    logger.error('Sentry test error captured', error as Error, {
      testId: 'sentry-test-1',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });
  }

  // Test 2: Capture a test message
  Sentry.captureMessage('Sentry test message - logging is working!', {
    level: 'info',
    tags: {
      test: 'sentry-test',
    },
  });

  // Test 3: Add breadcrumbs
  Sentry.addBreadcrumb({
    category: 'test',
    message: 'Sentry breadcrumb test',
    level: 'info',
  });

  // Test 4: Track a metric
  logger.apiResponse('GET', '/api/sentry-test', 200, 50, {
    test: true,
  });

  return NextResponse.json({
    success: true,
    message: 'Sentry test completed!',
    instructions: [
      '1. Check your Sentry dashboard at https://sentry.io',
      '2. Go to Issues tab',
      '3. You should see: "Sentry test error - monitoring is working!"',
      '4. Check Performance tab for API metrics',
      '5. Review breadcrumbs in the error details',
    ],
    tests: {
      errorCapture: '✅ Error logged',
      messageCapture: '✅ Message logged',
      breadcrumbs: '✅ Breadcrumb added',
      metrics: '✅ Metric tracked',
    },
  });
}
