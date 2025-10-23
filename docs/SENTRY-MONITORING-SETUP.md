# Sentry Monitoring Setup Guide

## Overview

This guide covers the complete setup of Sentry for error tracking, performance monitoring, and logging in the Real Estate Hub application.

**Sentry replaces Grafana** for Week 4 monitoring requirements, providing:
- ✅ Real-time error tracking
- ✅ Performance monitoring
- ✅ Session replay
- ✅ User context tracking
- ✅ Release health monitoring
- ✅ Custom metrics and alerts

---

## Quick Start (5 minutes)

### 1. Create Sentry Account

1. Go to [sentry.io](https://sentry.io/)
2. Sign up for a free account
3. Create a new project:
   - Platform: **Next.js**
   - Project name: **real-estate-hub**
   - Team: Use default or create new

### 2. Get Your DSN

After creating the project, you'll get a DSN (Data Source Name):
```
https://[key]@[organization].ingest.sentry.io/[project-id]
```

### 3. Configure Environment Variables

Add to your `.env.local` file:

```bash
# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=https://your-key@your-org.ingest.sentry.io/your-project-id
SENTRY_ORG=your-organization-name
SENTRY_PROJECT=real-estate-hub
SENTRY_AUTH_TOKEN=your-auth-token
```

**To get your auth token:**
1. Go to Settings → Auth Tokens
2. Create new token with scopes:
   - `project:read`
   - `project:releases`
   - `org:read`

### 4. Add to Vercel Environment Variables

```bash
# Using Vercel CLI
vercel env add NEXT_PUBLIC_SENTRY_DSN
vercel env add SENTRY_ORG
vercel env add SENTRY_PROJECT
vercel env add SENTRY_AUTH_TOKEN

# Or via Vercel Dashboard:
# Settings → Environment Variables → Add each variable
```

---

## Configuration Files

### Files Created

```
sentry.client.config.ts     # Client-side monitoring
sentry.server.config.ts     # Server-side monitoring
sentry.edge.config.ts       # Edge runtime monitoring
instrumentation.ts          # Sentry instrumentation hook
```

### Configuration Options

**Client Config (`sentry.client.config.ts`):**
- Error tracking with source maps
- Performance monitoring (100% sample rate)
- Session replay (10% of sessions, 100% on errors)
- Browser tracing integration
- Automatic breadcrumbs

**Server Config (`sentry.server.config.ts`):**
- API error tracking
- Server-side performance monitoring
- HTTP integration for API calls
- Database query tracking

**Edge Config (`sentry.edge.config.ts`):**
- Middleware error tracking
- Edge runtime monitoring
- Lightweight configuration

---

## Features

### 1. Error Tracking

**Automatic Error Capture:**
```typescript
// Errors are automatically captured from:
- Unhandled exceptions
- Promise rejections
- React error boundaries
- API route errors
```

**Manual Error Capture:**
```typescript
import { logger } from '@/lib/logger';

try {
  // Your code
} catch (error) {
  logger.error('Operation failed', error, { userId: '123' });
}
```

### 2. Performance Monitoring

**Automatic Transaction Tracking:**
- Page loads
- API route calls
- Database queries
- External API calls

**Custom Metrics:**
```typescript
import { logger } from '@/lib/logger';

// Track API response time
logger.apiResponse('GET', '/api/properties', 200, 150, { count: 25 });

// Track database query
logger.databaseQuery('SELECT * FROM properties', 45, { queryType: 'select' });
```

### 3. User Context Tracking

**Set User Context:**
```typescript
import { logger } from '@/lib/logger';

// On login
logger.setUser('user-123', 'user@example.com', 'johndoe');

// On logout
logger.clearUser();
```

**Track User Actions:**
```typescript
logger.userAction('create_property', 'user-123', { 
  propertyId: 'prop-456',
  type: 'apartment' 
});
```

### 4. Session Replay

Session Replay captures user interactions for debugging:
- 10% of normal sessions
- 100% of sessions with errors
- Privacy: All text and media masked by default

**View Replays:**
1. Go to Sentry Dashboard
2. Select your project
3. Navigate to Replays tab
4. Filter by errors or user ID

### 5. Custom Context

**Add Custom Context:**
```typescript
import { logger } from '@/lib/logger';

logger.setContext('property', {
  id: 'prop-123',
  type: 'apartment',
  price: 250000,
});
```

### 6. Breadcrumbs

Breadcrumbs are automatically captured for:
- Navigation events
- Console logs
- HTTP requests
- User interactions
- DOM events

---

## Monitoring Dashboard

### Access Your Dashboard

1. Go to [sentry.io](https://sentry.io/)
2. Select your project: **real-estate-hub**
3. View:
   - **Issues**: All errors and exceptions
   - **Performance**: Transaction performance
   - **Releases**: Release health and adoption
   - **Replays**: Session recordings
   - **Alerts**: Configure notifications

### Key Metrics

**Error Tracking:**
- Total errors
- Error rate
- Affected users
- Error frequency
- Stack traces with source maps

**Performance:**
- Average response time
- P50, P75, P95, P99 percentiles
- Slow transactions
- Failed transactions
- Apdex score

**User Impact:**
- Users affected by errors
- Sessions with errors
- User satisfaction (Apdex)

---

## Alerts Configuration

### 1. Create Alert Rules

**Go to:** Settings → Alerts → Create Alert Rule

### 2. Recommended Alerts

**High Error Rate:**
```
Trigger: When error rate exceeds 5% in 5 minutes
Action: Email to team@example.com
Conditions:
  - Environment: production
  - Error rate > 5%
```

**Slow API Response:**
```
Trigger: When API response time exceeds 1000ms
Action: Email to team@example.com
Conditions:
  - Transaction: /api/*
  - Duration > 1000ms
  - P95 percentile
```

**New Error Type:**
```
Trigger: When a new error type is seen
Action: Slack notification
Conditions:
  - Environment: production
  - First seen: true
```

**User Impact:**
```
Trigger: When 10+ users are affected by an error in 1 hour
Action: Email + Slack
Conditions:
  - Affected users > 10
  - Time window: 1 hour
```

---

## Integration with CI/CD

### GitHub Actions Integration

Sentry automatically tracks releases via CI/CD. Each deployment creates a release in Sentry.

**Automatic Features:**
1. Release tracking
2. Commit associations
3. Deploy notifications
4. Source map uploads
5. Release health monitoring

### View Release Health

1. Go to Releases tab
2. Select a release
3. View:
   - Crash-free sessions
   - Crash-free users
   - Session duration
   - Adoption rate

---

## Testing Sentry Setup

### 1. Test Error Capture

Create a test API route:

```typescript
// app/api/sentry-test/route.ts
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function GET() {
  // Test error logging
  try {
    throw new Error('Test error for Sentry');
  } catch (error) {
    logger.error('Test error captured', error as Error, {
      testId: 'sentry-test-1',
    });
  }
  
  return NextResponse.json({ message: 'Error logged to Sentry' });
}
```

Visit: `http://localhost:3000/api/sentry-test`

### 2. Verify in Sentry Dashboard

1. Go to Issues tab
2. Look for "Test error for Sentry"
3. Check:
   - Stack trace visible
   - Context data present
   - User info (if logged in)
   - Breadcrumbs available

### 3. Test Performance Monitoring

```typescript
// app/api/performance-test/route.ts
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function GET() {
  const startTime = Date.now();
  
  // Simulate work
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const duration = Date.now() - startTime;
  
  logger.apiResponse('GET', '/api/performance-test', 200, duration);
  
  return NextResponse.json({ duration });
}
```

Visit multiple times, then check Performance tab in Sentry.

### 4. Test User Tracking

```typescript
// In your auth callback
import { logger } from '@/lib/logger';

// After successful login
logger.setUser(user.id, user.email, user.username);
logger.userAction('login', user.id, { method: 'email' });
```

---

## Best Practices

### 1. Error Handling

```typescript
// ✅ Good: Include context
logger.error('Failed to create property', error, {
  userId: '123',
  propertyType: 'apartment',
  attemptNumber: 3,
});

// ❌ Bad: No context
console.error(error);
```

### 2. Performance Tracking

```typescript
// ✅ Good: Track meaningful operations
logger.apiResponse('POST', '/api/properties', 201, duration, {
  propertyId: newProperty.id,
});

// ❌ Bad: Don't track every operation
```

### 3. User Privacy

```typescript
// ✅ Good: Don't log sensitive data
logger.error('Payment failed', error, {
  userId: '123',
  amount: 250000,
  // Don't include: credit card, SSN, passwords
});
```

### 4. Release Tracking

```bash
# Tag every release
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# Sentry automatically tracks releases via CI/CD
```

---

## Monitoring Checklist

### Week 4 Monitoring Requirements

- [x] ✅ Error tracking configured
- [x] ✅ Performance monitoring enabled
- [x] ✅ User context tracking
- [x] ✅ Session replay configured
- [x] ✅ Alert rules set up
- [x] ✅ Release tracking enabled
- [x] ✅ CI/CD integration
- [x] ✅ Source maps uploaded

### Daily Monitoring Tasks

1. **Check Issues Tab** (5 min)
   - Review new errors
   - Assign critical issues
   - Check error trends

2. **Review Performance** (5 min)
   - Check API response times
   - Identify slow transactions
   - Monitor P95 percentiles

3. **Release Health** (2 min)
   - Check crash-free sessions
   - Monitor adoption rate
   - Review deploy status

---

## Troubleshooting

### Issue: Source maps not uploading

**Solution:**
```bash
# Check auth token permissions
# Ensure token has: project:read, project:releases, org:read

# Verify .env.local has correct values
echo $SENTRY_AUTH_TOKEN
```

### Issue: Errors not appearing in Sentry

**Solution:**
```typescript
// 1. Check DSN is set
console.log(process.env.NEXT_PUBLIC_SENTRY_DSN);

// 2. Check Sentry is initialized
import * as Sentry from '@sentry/nextjs';
Sentry.captureMessage('Test message');

// 3. Check network tab for outgoing requests to sentry.io
```

### Issue: Performance data not showing

**Solution:**
```typescript
// Ensure tracesSampleRate is set in config
// sentry.client.config.ts
tracesSampleRate: 1.0, // 100% of transactions
```

### Issue: Session replay not working

**Solution:**
```typescript
// Check replay integration is enabled
replaysSessionSampleRate: 0.1,
replaysOnErrorSampleRate: 1.0,
```

---

## Migration from Grafana

### What Changed

| Feature | Grafana | Sentry |
|---------|---------|--------|
| Error Tracking | Manual logging | Automatic + Source maps |
| Performance | Custom metrics | Built-in APM |
| User Tracking | Manual queries | Built-in context |
| Alerts | Dashboard-based | Rule-based + Integrations |
| Setup | Docker/Podman | Cloud-based (5 min) |
| Cost | Self-hosted | Free tier (5k errors/month) |

### Removed Files

The following Grafana-related files can be removed:
```
docker-compose.monitoring.yml
grafana/
prometheus.yml
app/api/grafana/
```

### Keeping Compatibility

The existing `logger` and `metrics` libraries have been updated to send data to Sentry while maintaining backward compatibility.

---

## Resources

- [Sentry Documentation](https://docs.sentry.io/)
- [Next.js Integration Guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Session Replay](https://docs.sentry.io/product/session-replay/)
- [Alert Rules](https://docs.sentry.io/product/alerts/)

---

## Support

**Sentry Support:**
- Email: support@sentry.io
- Discord: [sentry.io/discord](https://sentry.io/discord)
- Status: [status.sentry.io](https://status.sentry.io/)

**Internal Support:**
- Check Issues tab first
- Review performance dashboard
- Verify alert rules are firing

---

**Status**: ✅ Sentry Monitoring Active  
**Last Updated**: October 23, 2025  
**Version**: v1.0.0
