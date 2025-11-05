# Production Monitoring & Analytics Setup

## Overview

This guide covers setting up comprehensive monitoring, analytics, and error tracking for the Real Estate Management System in production.

**Target**: Week 3 - Cloud Deployment & Monitoring  
**Platform**: Vercel + Supabase  
**Last Updated**: October 22, 2025

---

## 1. Vercel Analytics (Built-in) ✅

### Current Status
Vercel Analytics is already integrated via the `@vercel/analytics` package in `app/layout.tsx`.

### Verify Installation

```bash
# Check if package is installed
yarn list @vercel/analytics

# Should see:
# @vercel/analytics@1.x.x
```

### Enable in Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: **Real-Estate-Hub**
3. Navigate to **Analytics** tab
4. Click **Enable Analytics** (if not already enabled)
5. Select plan (Free tier includes 100k events/month)

### What You Get

- **Core Web Vitals**
  - LCP (Largest Contentful Paint)
  - FID (First Input Delay)
  - CLS (Cumulative Layout Shift)
  - FCP (First Contentful Paint)
  - TTFB (Time to First Byte)

- **Page Performance**
  - Page views
  - Unique visitors
  - Top pages
  - Geographic distribution

- **Real User Monitoring**
  - Actual user experience metrics
  - Browser and device breakdown
  - Connection speed impact

### Target Metrics (Week 3)

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| LCP | < 2.5s | TBD | ⏳ |
| FID | < 100ms | TBD | ⏳ |
| CLS | < 0.1 | TBD | ⏳ |
| FCP | < 1.8s | TBD | ⏳ |
| TTFB | < 600ms | TBD | ⏳ |

---

## 2. Vercel Speed Insights (Recommended)

### Installation

Already installed! The `Analytics` component includes Speed Insights.

### Enable in Dashboard

1. Go to project settings
2. Navigate to **Speed Insights**
3. Enable Speed Insights
4. Configure budget alerts

### Benefits

- Real-time performance tracking
- Performance regression detection
- Automatic performance recommendations
- Build-time performance analysis

---

## 3. Error Tracking with Sentry (Recommended)

### Why Sentry?

- Real-time error tracking
- Performance monitoring
- Release tracking
- User feedback
- Issue prioritization
- Integration with GitHub

### Installation

```bash
# Install Sentry Next.js SDK
yarn add @sentry/nextjs

# Initialize Sentry
npx @sentry/wizard -i nextjs
```

### Configuration

The wizard will create:
- `sentry.client.config.js`
- `sentry.server.config.js`
- `sentry.edge.config.js`
- Update `next.config.mjs`

### Manual Setup (if wizard doesn't work)

1. **Create Sentry Account**
   - Go to [sentry.io](https://sentry.io)
   - Create new project
   - Select **Next.js**
   - Note your DSN

2. **Add Environment Variable**
   ```bash
   # Add to .env.local
   NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn

   # Add to Vercel environment variables
   vercel env add NEXT_PUBLIC_SENTRY_DSN
   ```

3. **Add to GitHub Secrets**
   ```
   SENTRY_DSN
   SENTRY_AUTH_TOKEN (for source maps)
   SENTRY_ORG
   SENTRY_PROJECT
   ```

### Basic Configuration

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Capture Replay for 10% of all sessions,
  // plus for 100% of sessions with an error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Release tracking
  release: process.env.VERCEL_GIT_COMMIT_SHA,
  
  // Additional settings
  beforeSend(event, hint) {
    // Filter out development errors
    if (process.env.NODE_ENV === 'development') {
      return null
    }
    return event
  },
})
```

### Usage in Code

```typescript
import * as Sentry from '@sentry/nextjs'

// Capture exceptions
try {
  // Your code
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      section: 'properties',
      action: 'create',
    },
    extra: {
      userId: user.id,
      propertyData: data,
    },
  })
}

// Log messages
Sentry.captureMessage('Something important happened', {
  level: 'info',
  tags: { feature: 'maintenance' },
})

// Set user context
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.name,
})
```

---

## 4. Database Monitoring (Supabase)

### Built-in Monitoring

Supabase provides comprehensive database monitoring:

1. **Go to Supabase Dashboard**
   - Navigate to your project
   - Click on **Database** → **Roles**
   - Click on **Statistics**

2. **Key Metrics**
   - Connection count
   - Active queries
   - Query performance
   - Table sizes
   - Index usage

### Enable Query Performance Insights

```sql
-- Run in Supabase SQL Editor
-- Enable pg_stat_statements extension
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- View slow queries
SELECT
    calls,
    total_exec_time::numeric(10,2) as total_time_ms,
    mean_exec_time::numeric(10,2) as avg_time_ms,
    query
FROM
    pg_stat_statements
WHERE
    query NOT LIKE '%pg_stat_statements%'
ORDER BY
    total_exec_time DESC
LIMIT 20;
```

### Set Up Alerts

1. Go to Supabase project settings
2. Navigate to **Alerts**
3. Configure alerts for:
   - High connection count
   - Long-running queries
   - Database size threshold
   - High CPU usage

---

## 5. Uptime Monitoring

### Option 1: UptimeRobot (Free)

1. **Sign up** at [uptimerobot.com](https://uptimerobot.com)
2. **Add Monitor**:
   - Type: HTTP(s)
   - URL: Your Vercel deployment URL
   - Interval: 5 minutes (free tier)
   - Contact: Add email

3. **Alerts**:
   - Email notifications on downtime
   - Status page (public/private)

### Option 2: Vercel Monitoring (Built-in)

Vercel automatically monitors:
- Deployment status
- Build failures
- Runtime errors
- Function timeouts

Access in: **Project Settings → Monitoring**

---

## 6. Custom Metrics Dashboard

### Using Vercel Dashboard API

Create a custom monitoring page:

```typescript
// app/admin/monitoring/page.tsx
export default async function MonitoringPage() {
  // Fetch from Vercel API or your metrics endpoint
  const metrics = await fetchMetrics()
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">System Health Dashboard</h1>
      
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          title="Response Time"
          value={metrics.avgResponseTime}
          unit="ms"
          trend="+5%"
        />
        <MetricCard
          title="Error Rate"
          value={metrics.errorRate}
          unit="%"
          trend="-2%"
        />
        <MetricCard
          title="Active Users"
          value={metrics.activeUsers}
          trend="+12%"
        />
        <MetricCard
          title="Database Queries"
          value={metrics.dbQueries}
          unit="/min"
        />
      </div>
    </div>
  )
}
```

---

## 7. Log Aggregation

### Using Vercel Logs

```bash
# View real-time logs
vercel logs --follow

# Filter by function
vercel logs --function=api/properties

# Export logs
vercel logs > logs.txt
```

### Structured Logging (Implemented)

We've created a structured logger in `lib/logger.ts`:

```typescript
import { logger } from '@/lib/logger'

// Use throughout your application
logger.info('Property created', { propertyId: property.id, userId: user.id })
logger.error('Failed to upload image', error, { propertyId: property.id })
logger.apiRequest('GET', '/api/properties')
logger.apiResponse('GET', '/api/properties', 200, 150)
```

### Benefits

- Consistent log format
- Easy filtering and searching
- Better debugging
- Metrics generation

---

## 8. Performance Budget

Create a performance budget to prevent regressions:

```typescript
// lighthouse-budget.json
{
  "budgets": [
    {
      "path": "/*",
      "timings": [
        {
          "metric": "interactive",
          "budget": 3500
        },
        {
          "metric": "first-contentful-paint",
          "budget": 1800
        },
        {
          "metric": "largest-contentful-paint",
          "budget": 2500
        }
      ],
      "resourceSizes": [
        {
          "resourceType": "script",
          "budget": 400
        },
        {
          "resourceType": "stylesheet",
          "budget": 100
        },
        {
          "resourceType": "image",
          "budget": 500
        },
        {
          "resourceType": "total",
          "budget": 1500
        }
      ]
    }
  ]
}
```

### Integrate with CI/CD

```yaml
# .github/workflows/ci-cd.yml (add to test job)
- name: Run Lighthouse CI
  run: |
    npm install -g @lhci/cli@latest
    lhci autorun --budget-path=lighthouse-budget.json
```

---

## 9. Alerting Strategy

### Critical Alerts (Immediate Response)

- Application down (uptime < 99%)
- Error rate > 5%
- Database connection failures
- Payment processing failures

**Channels**: Email, Slack (if configured)

### Warning Alerts (Monitor Closely)

- Response time > 2s
- Error rate > 1%
- Database queries > 1s
- Memory usage > 80%

**Channels**: Email

### Info Alerts (Track Trends)

- Deployment success/failure
- New user signups
- Daily active users
- Performance improvements

**Channels**: Dashboard, Weekly email

---

## 10. Monitoring Checklist

### ✅ Setup Tasks

- [x] Verify Vercel Analytics is enabled
- [x] Add security headers
- [ ] Install and configure Sentry
- [ ] Set up uptime monitoring (UptimeRobot)
- [ ] Enable Supabase database monitoring
- [ ] Create performance budget
- [ ] Set up alert notifications
- [ ] Document incident response procedures

### ✅ Daily Monitoring

- [ ] Check Vercel Analytics dashboard
- [ ] Review error count in Sentry
- [ ] Verify uptime status
- [ ] Check database performance

### ✅ Weekly Review

- [ ] Analyze performance trends
- [ ] Review top errors
- [ ] Check user engagement metrics
- [ ] Optimize slow queries
- [ ] Update performance budgets

### ✅ Monthly Review

- [ ] Comprehensive performance audit
- [ ] Review and update alerts
- [ ] Analyze cost vs usage
- [ ] Plan optimizations
- [ ] Update documentation

---

## 11. Key Performance Indicators (KPIs)

### Application Performance

- Average response time: < 500ms
- 95th percentile response time: < 1s
- Error rate: < 0.5%
- Uptime: > 99.9%

### User Experience

- Core Web Vitals: All green
- Page load time: < 3s
- Time to interactive: < 3.5s
- Bounce rate: < 40%

### Database Performance

- Query response time: < 100ms
- Connection pool usage: < 80%
- Active connections: < 100
- Cache hit ratio: > 90%

### Business Metrics

- Active users (DAU/MAU)
- Properties listed
- Maintenance requests
- Transaction completion rate

---

## 12. Resources

### Documentation

- [Vercel Analytics](https://vercel.com/docs/analytics)
- [Vercel Speed Insights](https://vercel.com/docs/speed-insights)
- [Sentry Next.js](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Supabase Monitoring](https://supabase.com/docs/guides/platform/metrics)
- [Core Web Vitals](https://web.dev/vitals/)

### Tools

- [PageSpeed Insights](https://pagespeed.web.dev/)
- [WebPageTest](https://www.webpagetest.org/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [SecurityHeaders.com](https://securityheaders.com/)

---

## 13. Next Steps

1. **Enable Monitoring**
   ```bash
   # Verify Vercel Analytics
   # Check your dashboard
   ```

2. **Install Sentry**
   ```bash
   yarn add @sentry/nextjs
   npx @sentry/wizard -i nextjs
   ```

3. **Set Up Uptime Monitoring**
   - Create UptimeRobot account
   - Add your Vercel URL
   - Configure email alerts

4. **Run Performance Audit**
   ```bash
   # Install Lighthouse
   npm install -g lighthouse
   
   # Run audit
   lighthouse https://your-app.vercel.app --view
   ```

5. **Add Database Indexes**
   - Run `scripts/007_optimize_indexes.sql` in Supabase
   - Monitor query performance

---

**Status**: 🔄 In Progress  
**Owner**: Development Team  
**Last Updated**: October 22, 2025
