/**
 * Sentry Instrumentation
 * This file should be imported once in your app to set up Sentry monitoring
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

export const onRequestError = async (
  err: Error,
  request: {
    path: string;
    method: string;
  }
) => {
  const Sentry = await import('@sentry/nextjs');
  
  Sentry.captureException(err, {
    contexts: {
      request: {
        url: request.path,
        method: request.method,
      },
    },
  });
};
