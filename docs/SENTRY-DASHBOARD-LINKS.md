# Sentry Dashboard - Real Estate Hub

## 🎯 Quick Access Links

### Main Dashboard
**🏠 Project Overview:**
https://sentry.io/organizations/makerere-university-h0/projects/javascript-nextjs/

### Monitoring Dashboards

**📊 Issues (Errors & Exceptions):**
https://sentry.io/organizations/makerere-university-h0/issues/?project=4510237463281664

**⚡ Performance (APM):**
https://sentry.io/organizations/makerere-university-h0/performance/?project=4510237463281664

**🎥 Session Replay:**
https://sentry.io/organizations/makerere-university-h0/replays/?project=4510237463281664

**📝 Logs:**
https://sentry.io/organizations/makerere-university-h0/logs/?project=4510237463281664

**🚀 Releases:**
https://sentry.io/organizations/makerere-university-h0/releases/?project=4510237463281664

**📈 Stats:**
https://sentry.io/organizations/makerere-university-h0/stats/?project=4510237463281664

### Configuration

**⚙️ Project Settings:**
https://sentry.io/organizations/makerere-university-h0/projects/javascript-nextjs/settings/

**🔔 Alerts:**
https://sentry.io/organizations/makerere-university-h0/alerts/rules/?project=4510237463281664

**🔌 Integrations:**
https://sentry.io/organizations/makerere-university-h0/settings/integrations/

---

## 📱 Quick Actions

### View Latest Issues
```bash
# Visit Issues dashboard
https://sentry.io/organizations/makerere-university-h0/issues/?project=4510237463281664&statsPeriod=24h
```

### Monitor Performance
```bash
# View transaction performance
https://sentry.io/organizations/makerere-university-h0/performance/summary/?project=4510237463281664
```

### Watch Session Replays
```bash
# See user session recordings
https://sentry.io/organizations/makerere-university-h0/replays/?project=4510237463281664&statsPeriod=24h
```

---

## 🔑 Project Details

**Organization:** makerere-university-h0  
**Project Name:** javascript-nextjs  
**Project ID:** 4510237463281664  
**Platform:** Next.js  
**DSN:** `https://304828cadc5ef38d4667de820dd5fe57@o4510237463085056.ingest.us.sentry.io/4510237463281664`

---

## 📊 What to Monitor

### 1. Issues Dashboard
Track all errors and exceptions:
- Unhandled errors
- API failures
- Client-side errors
- Server-side errors
- Edge runtime errors

**Check:** Filter by environment (production/development)

### 2. Performance Dashboard
Monitor application performance:
- API response times
- Page load times
- Database query duration
- Transaction traces
- P50, P75, P95, P99 percentiles

**Check:** Look for slow transactions (>1000ms)

### 3. Session Replay
Watch user sessions:
- See exactly what users did before an error
- Identify UX issues
- Debug complex problems
- Understand user behavior

**Check:** Filter by "Has Error" to see problem sessions

### 4. Logs
View application logs:
- Server logs
- Client logs
- API logs
- Custom logs from `logger.ts`

**Check:** Filter by severity (error, warning, info)

### 5. Releases
Track release health:
- Crash-free sessions %
- Crash-free users %
- New issues introduced
- Adoption rate

**Check:** Each deployment creates a new release

---

## 🔔 Recommended Alerts

### Set up these alerts in Sentry:

**1. High Error Rate**
- Condition: Error rate > 5% in 5 minutes
- Action: Email + Slack notification
- Link: https://sentry.io/organizations/makerere-university-h0/alerts/new/?project=4510237463281664

**2. Slow API Response**
- Condition: API response time > 1000ms (P95)
- Action: Email notification
- Transactions: `/api/*`

**3. New Error Type**
- Condition: First time seeing this error
- Action: Immediate Slack notification
- Environment: Production only

**4. User Impact Alert**
- Condition: 10+ users affected in 1 hour
- Action: Email team
- Severity: High

---

## 📈 Key Metrics to Watch

### Daily Checks (5 minutes)
1. **Issues**: Any new critical errors?
2. **Performance**: Are response times acceptable?
3. **Releases**: Latest deploy healthy?

### Weekly Review (15 minutes)
1. **Trends**: Are errors increasing or decreasing?
2. **Performance**: Any regression in response times?
3. **User Impact**: How many users affected by errors?
4. **Session Replays**: Watch a few error sessions

### Monthly Review (30 minutes)
1. **Overall Health**: Crash-free rate trend
2. **Top Issues**: Most frequent errors (fix them!)
3. **Performance**: Optimize slow endpoints
4. **Release Adoption**: Users on latest version

---

## 🧪 Test Your Setup

### Trigger Test Errors

**1. Frontend Error:**
```bash
# Visit example page in browser
http://localhost:3000/sentry-example-page
# Click "Throw error" button
```

**2. API Error:**
```bash
# Trigger API error
curl http://localhost:3000/api/sentry-example-api
```

**3. Custom Test:**
```bash
# Our custom test endpoint
curl http://localhost:3000/api/sentry-test
```

**4. Verify in Dashboard:**
```
→ Go to Issues tab
→ Should see test errors within 30 seconds
→ Check breadcrumbs and context
```

---

## 📱 Mobile App

**iOS/Android:** Download Sentry mobile app
- Get instant notifications
- View issues on the go
- Acknowledge and assign issues

**App Store:** https://apps.apple.com/app/sentry/id1211798572  
**Play Store:** https://play.google.com/store/apps/details?id=io.sentry.mobile

---

## 🔧 Troubleshooting

### Not seeing errors?

**Check:**
1. Environment variables set correctly
2. DSN is correct
3. App is running
4. Network requests to sentry.io are not blocked
5. Check browser console for Sentry initialization

### Source maps not working?

**Check:**
1. `SENTRY_AUTH_TOKEN` is set in Vercel
2. Build completed successfully
3. Source maps uploaded (check build logs)

### Performance data missing?

**Check:**
1. `tracesSampleRate` is set to 1.0
2. Transactions are being created
3. Check Performance tab filters

---

## 📚 Documentation

**Sentry Docs:** https://docs.sentry.io/platforms/javascript/guides/nextjs/  
**Our Setup Guide:** `docs/SENTRY-MONITORING-SETUP.md`  
**Migration Guide:** `docs/GRAFANA-TO-SENTRY-MIGRATION.md`

---

## 🎯 Quick Commands

```bash
# Start dev server
yarn dev

# Test Sentry locally
curl http://localhost:3000/api/sentry-test

# View Vercel env vars
vercel env ls

# Deploy to production
git push origin trunk  # Auto-deploys via Vercel
```

---

**Last Updated:** October 23, 2025  
**Version:** v1.0.0  
**Status:** ✅ Active Monitoring
