// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: "https://304828cadc5ef38d4667de820dd5fe57@o4510237463085056.ingest.us.sentry.io/4510237463281664",

  // Note: Session Replay integration is configured in sentry.client.config.ts
  // to avoid "Multiple Sentry Session Replay instances" error
  integrations: [],

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,
  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Note: Replay settings are configured in sentry.client.config.ts
  // replaysSessionSampleRate: 0.1,
  // replaysOnErrorSampleRate: 1.0,

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
