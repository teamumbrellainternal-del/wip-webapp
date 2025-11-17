# Monitoring Dashboard Configuration

This document provides configuration and setup instructions for monitoring the Umbrella production deployment.

## Table of Contents

- [Overview](#overview)
- [Cloudflare Analytics](#cloudflare-analytics)
- [Key Metrics](#key-metrics)
- [Alert Configuration](#alert-configuration)
- [Dashboard Layouts](#dashboard-layouts)
- [Third-Party Integrations](#third-party-integrations)

---

## Overview

The Umbrella monitoring strategy uses a multi-layered approach:

1. **Cloudflare Workers Analytics** - Built-in Worker metrics
2. **Cloudflare D1 Metrics** - Database performance
3. **Sentry** - Error tracking and performance monitoring
4. **External Health Checks** - Uptime monitoring
5. **Custom Metrics** - Application-specific metrics

### Monitoring Philosophy

- **Proactive, not reactive:** Alert before users notice
- **Focus on user impact:** Monitor what matters to users
- **Actionable alerts:** Every alert should have a clear action
- **Minimal noise:** Avoid alert fatigue

---

## Cloudflare Analytics

### Accessing Cloudflare Analytics

1. Navigate to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your account
3. Go to **Workers & Pages** > **umbrella-prod**
4. Click **Analytics**

### Built-in Metrics

Cloudflare provides these metrics out-of-the-box:

| Metric | Description | Location |
|--------|-------------|----------|
| **Requests** | Total requests over time | Analytics > Requests |
| **Errors** | 4xx and 5xx error rates | Analytics > Errors |
| **Success Rate** | Percentage of successful requests | Analytics > Overview |
| **CPU Time** | Worker execution time | Analytics > Performance |
| **Latency** | P50, P75, P95, P99 response times | Analytics > Performance |

### Custom Analytics (GraphQL API)

For more advanced querying, use the Cloudflare GraphQL Analytics API:

```bash
# Example: Query request count and error rate
curl -X POST https://api.cloudflare.com/client/v4/graphql \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { viewer { zones(filter: {zoneTag: \"$ZONE_ID\"}) { httpRequests1dGroups(limit: 7) { dimensions { date } sum { requests errors } } } } }"
  }'
```

---

## Key Metrics

### 1. Application Health

#### Health Check Status
- **What:** Worker responsiveness
- **Target:** 100% uptime
- **Alert:** < 99.9% in 5 minutes
- **Check:** `GET https://umbrella.app/v1/health`

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "service": "umbrella-api",
    "version": "0.1.0",
    "timestamp": "2025-11-17T12:00:00.000Z",
    "environment": "production"
  }
}
```

#### Worker Availability
- **What:** Worker deployment status
- **Target:** Always deployed
- **Check:** Cloudflare Dashboard > Workers

### 2. Performance Metrics

#### Response Time (P95 Latency)
- **What:** 95th percentile response time
- **Target:** < 500ms (per spec)
- **Alert:** > 1000ms for 5+ minutes
- **Location:** Cloudflare Analytics > Performance

**Critical Endpoints to Monitor:**
- `/v1/health` - Should be < 50ms
- `/v1/artists` - Should be < 300ms (profile views, critical path)
- `/v1/gigs` - Should be < 400ms
- `/v1/auth/callback` - Should be < 200ms

#### CPU Time
- **What:** Worker execution time
- **Target:** < 50ms average
- **Alert:** > 200ms average
- **Location:** Cloudflare Analytics > CPU Time

### 3. Error Metrics

#### Error Rate
- **What:** Percentage of requests returning errors
- **Target:** < 1%
- **Alert:** > 5% for 5+ minutes
- **Location:** Cloudflare Analytics > Errors

**Error Categories:**
- **5xx Errors:** Server errors (critical)
- **4xx Errors:** Client errors (track but don't alert)
- **429 Errors:** Rate limiting (expected, track trends)

#### Error Types to Monitor
1. **Database Errors** - D1 connection/query failures
2. **Authentication Errors** - Clerk integration issues
3. **External Service Errors** - Twilio, Resend, Claude API
4. **Unhandled Exceptions** - Application bugs

### 4. Database Metrics

#### D1 Performance
- **What:** Database query performance
- **Target:** < 100ms average
- **Alert:** > 500ms average
- **Location:** Cloudflare Dashboard > D1 > Metrics

**Queries to Monitor:**
- Total queries per day
- Query latency (P50, P95, P99)
- Failed queries
- Database size growth

### 5. Business Metrics

#### User Activity
- **What:** Active users and engagement
- **Metrics:**
  - User sign-ups per day
  - Active users (DAU, WAU, MAU)
  - Profile views
  - Gig applications
  - Messages sent

**How to Track:**
- Query D1 database for counts
- Use Cloudflare Analytics for request patterns

#### Content Metrics
- **What:** Content creation and storage
- **Metrics:**
  - Tracks uploaded (count, total size)
  - Gigs created
  - Messages sent
  - R2 storage usage

### 6. Resource Usage

#### D1 Database
- **Quota:** Check current limits
- **Monitor:** Database size, query volume
- **Alert:** Approaching 80% of quota

#### R2 Storage
- **Quota:** 50GB per artist (per spec D-026)
- **Monitor:** Total storage used, per-artist usage
- **Alert:** Any artist approaching 45GB

#### KV Operations
- **Monitor:** Read/write operations, cache hit rate
- **Target:** > 90% cache hit rate for sessions

---

## Alert Configuration

### Recommended Alerts

#### Critical Alerts (Page Immediately)

**1. Worker Down**
- **Condition:** Health check returns non-200 for 2+ consecutive checks (5 min)
- **Action:** Check Cloudflare status, review recent deployments, rollback if needed
- **Notification:** PagerDuty, Slack

**2. High Error Rate**
- **Condition:** Error rate > 10% for 5 minutes
- **Action:** Check Sentry for error details, consider rollback
- **Notification:** PagerDuty, Slack

**3. Database Unavailable**
- **Condition:** D1 errors > 50% of requests
- **Action:** Check Cloudflare D1 status, verify configuration
- **Notification:** PagerDuty, Slack

#### High Priority Alerts (Notify Team)

**4. Performance Degradation**
- **Condition:** P95 latency > 1000ms for 10 minutes
- **Action:** Investigate bottleneck, review recent changes
- **Notification:** Slack, Email

**5. Elevated Error Rate**
- **Condition:** Error rate > 5% for 10 minutes
- **Action:** Review Sentry errors, investigate root cause
- **Notification:** Slack, Email

**6. Cron Job Failure**
- **Condition:** Analytics cron didn't run or failed
- **Action:** Check cron logs, manually trigger if needed
- **Notification:** Slack

#### Medium Priority Alerts (Monitor)

**7. Resource Usage**
- **Condition:** D1 or R2 approaching quota (80%)
- **Action:** Plan for capacity increase
- **Notification:** Email

**8. Elevated 4xx Errors**
- **Condition:** 4xx errors > 10% for 30 minutes
- **Action:** Investigate client-side issues
- **Notification:** Email

### Cloudflare Notifications Setup

Navigate to Cloudflare Dashboard > Notifications

**Worker Error Rate Alert:**
```yaml
Type: Worker
Event Type: Error Rate Exceeded
Threshold: 5%
Duration: 5 minutes
Notification: Email, Webhook
```

**Worker Request Volume Alert:**
```yaml
Type: Worker
Event Type: Request Volume Anomaly
Change: Decreased by 50%
Duration: 10 minutes
Notification: Email, Webhook
```

### Webhook Configuration (for Slack)

**Slack Webhook Setup:**

1. Create Slack Incoming Webhook
2. Add to Cloudflare Notifications
3. Configure message format:

```json
{
  "text": "🚨 *Umbrella Production Alert*",
  "attachments": [
    {
      "color": "danger",
      "fields": [
        {
          "title": "Alert Type",
          "value": "{{alert_type}}",
          "short": true
        },
        {
          "title": "Severity",
          "value": "{{severity}}",
          "short": true
        },
        {
          "title": "Message",
          "value": "{{message}}"
        }
      ]
    }
  ]
}
```

---

## Dashboard Layouts

### Primary Operations Dashboard

**Cloudflare Workers Dashboard**

**Top Row: Health Overview**
- Current Status (Green/Red indicator)
- Uptime (Last 24h, 7d, 30d)
- Total Requests (Last 24h)
- Error Rate (Last 24h)

**Second Row: Performance**
- P50 Latency (graph, last 24h)
- P95 Latency (graph, last 24h)
- P99 Latency (graph, last 24h)
- CPU Time (graph, last 24h)

**Third Row: Errors**
- 5xx Errors (graph, last 24h)
- 4xx Errors (graph, last 24h)
- Error Rate % (graph, last 24h)
- Top Errors (table)

**Bottom Row: Resources**
- D1 Query Count (last 24h)
- D1 Query Latency
- R2 Bandwidth
- KV Operations

### Database Dashboard

**Cloudflare D1 Dashboard**

**Overview**
- Total Queries (last 24h)
- Average Query Latency
- Failed Queries
- Database Size

**Performance**
- Query Latency P50/P95/P99 (graph)
- Queries per Second (graph)
- Slow Queries (table, > 100ms)

**Storage**
- Database Size (trend)
- Growth Rate (per day)
- Quota Usage

### Error Tracking Dashboard

**Sentry Dashboard**

**Overview**
- New Issues (last 24h)
- Resolved Issues (last 24h)
- Total Events (last 24h)
- Error Rate Trend

**Top Issues**
- Most Frequent Errors (table)
- Newest Errors (table)
- Highest Impact Errors (table)

**Performance**
- Transaction Count
- Apdex Score
- Slowest Transactions
- Throughput

---

## Third-Party Integrations

### Sentry Configuration

**Setup:**

1. Create Sentry project at https://sentry.io
2. Get DSN from project settings
3. Add to Cloudflare Secrets:
   ```bash
   echo "YOUR_SENTRY_DSN" | wrangler secret put SENTRY_DSN --env production
   ```

**Recommended Settings:**
- **Sample Rate:** 100% (adjust if high volume)
- **Traces Sample Rate:** 10% (performance monitoring)
- **Release Tracking:** Enable to track errors by deployment
- **Source Maps:** Upload for better error context

**Key Features to Use:**
- **Issues:** Group and track errors
- **Performance:** Monitor transaction performance
- **Releases:** Track errors by version
- **Alerts:** Configure for critical errors

### UptimeRobot (Optional)

**Setup:**

1. Create account at https://uptimerobot.com
2. Add monitor:
   - **Type:** HTTP(s)
   - **URL:** https://umbrella.app/v1/health
   - **Interval:** 5 minutes
   - **Expected:** 200 status code

**Alert Contacts:**
- Email
- Slack webhook
- PagerDuty (for critical)

### Grafana Cloud (Optional)

For advanced visualization:

**Data Sources:**
- Cloudflare GraphQL API
- Sentry API
- Custom metrics endpoint

**Dashboard Panels:**
- Request volume over time
- Error rate by endpoint
- Latency heatmap
- User activity metrics

---

## Custom Metrics Collection

### Application-Level Metrics

For metrics not provided by Cloudflare:

**Option 1: Log-based Metrics**

Use Cloudflare Logpush to send logs to external service:

```bash
wrangler logpush create \
  --destination-conf "https://your-metrics-endpoint.com" \
  --dataset workers_trace_events
```

**Option 2: Direct API Calls**

Send custom metrics from Worker:

```typescript
// Example: Track custom business metric
await fetch('https://metrics.example.com/api/v1/metrics', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    metric: 'gig_applications',
    value: 1,
    timestamp: Date.now(),
    tags: { user_type: 'artist' }
  })
})
```

**Option 3: Analytics Engine (Workers Analytics)**

Use Cloudflare Analytics Engine for custom metrics:

```typescript
// Write custom metric
env.ANALYTICS.writeDataPoint({
  blobs: ['gig_application'],
  doubles: [1],
  indexes: [artistId]
})
```

### Metrics to Track

**User Engagement:**
- Sign-ups per day
- Active users (DAU/WAU/MAU)
- Gig applications per day
- Messages sent per day

**Content Creation:**
- Tracks uploaded per day
- Gigs created per day
- Average track size
- Total R2 storage used

**Feature Usage:**
- Violet AI queries (track against 50/day limit)
- Search queries
- Profile views
- Marketplace views

**Performance:**
- API endpoint latency (by endpoint)
- Database query latency (by query type)
- Cache hit rate
- External service latency

---

## Monitoring Checklist

### Daily
- [ ] Check health endpoint status
- [ ] Review error rate in Cloudflare Analytics
- [ ] Check P95 latency is under 500ms
- [ ] Review Sentry for new critical errors
- [ ] Verify cron job executed successfully

### Weekly
- [ ] Analyze error trends
- [ ] Review performance metrics
- [ ] Check resource usage trends
- [ ] Review Sentry resolved vs new issues
- [ ] Update team on metrics

### Monthly
- [ ] Review all alert configurations
- [ ] Analyze capacity planning needs
- [ ] Review and optimize slow queries
- [ ] Update documentation
- [ ] Conduct incident retrospective

---

## Useful Queries

### Cloudflare GraphQL Queries

**Request Volume by Status Code:**
```graphql
{
  viewer {
    accounts(filter: {accountTag: "$ACCOUNT_ID"}) {
      workersInvocationsAdaptive(
        filter: {
          datetime_geq: "2025-11-17T00:00:00Z"
          scriptName: "umbrella-prod"
        }
        limit: 1000
      ) {
        dimensions {
          status
        }
        sum {
          requests
        }
      }
    }
  }
}
```

**P95 Latency Over Time:**
```graphql
{
  viewer {
    accounts(filter: {accountTag: "$ACCOUNT_ID"}) {
      workersInvocationsAdaptive(
        filter: {
          datetime_geq: "2025-11-17T00:00:00Z"
          scriptName: "umbrella-prod"
        }
        limit: 1000
      ) {
        quantiles {
          cpuTimeP95
        }
      }
    }
  }
}
```

### D1 Queries

**User Growth:**
```sql
SELECT
  DATE(created_at) as date,
  COUNT(*) as new_users
FROM users
WHERE created_at >= DATE('now', '-7 days')
GROUP BY DATE(created_at)
ORDER BY date;
```

**Storage Usage by Artist:**
```sql
SELECT
  u.id,
  u.email,
  SUM(t.file_size) as total_storage
FROM users u
LEFT JOIN tracks t ON t.artist_id = u.id
WHERE u.user_type = 'artist'
GROUP BY u.id
ORDER BY total_storage DESC
LIMIT 10;
```

**Daily Active Users:**
```sql
SELECT
  DATE(last_seen_at) as date,
  COUNT(DISTINCT user_id) as active_users
FROM user_sessions
WHERE last_seen_at >= DATE('now', '-7 days')
GROUP BY DATE(last_seen_at)
ORDER BY date;
```

---

## Best Practices

1. **Monitor what matters:** Focus on user-facing metrics
2. **Set meaningful thresholds:** Avoid alert fatigue
3. **Document everything:** Every alert should have a runbook entry
4. **Review regularly:** Metrics and alerts should evolve with the app
5. **Correlate data:** Look at multiple metrics together
6. **Track trends:** Watch for gradual degradation
7. **Learn from incidents:** Update monitoring after each incident

---

## Resources

- [Cloudflare Workers Analytics](https://developers.cloudflare.com/workers/observability/analytics/)
- [Cloudflare GraphQL Analytics API](https://developers.cloudflare.com/analytics/graphql-api/)
- [D1 Metrics](https://developers.cloudflare.com/d1/observability/metrics-and-analytics/)
- [Sentry Documentation](https://docs.sentry.io/)
- [Cloudflare Logpush](https://developers.cloudflare.com/logs/get-started/)

---

**Last Updated:** 2025-11-17
**Owner:** Engineering Team
