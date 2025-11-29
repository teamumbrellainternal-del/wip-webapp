# Post-Launch Operations Runbook

This runbook provides step-by-step procedures for common operational tasks, incident response, and troubleshooting for the Umbrella production deployment.

## Table of Contents

- [Quick Reference](#quick-reference)
- [Daily Operations](#daily-operations)
- [Monitoring](#monitoring)
- [Common Issues](#common-issues)
- [Incident Response](#incident-response)
- [Rollback Procedures](#rollback-procedures)
- [Emergency Contacts](#emergency-contacts)
- [Maintenance Windows](#maintenance-windows)

---

## Quick Reference

### Key URLs

- **Production App:** https://umbrella.app
- **Health Check:** https://umbrella.app/v1/health
- **Cloudflare Dashboard:** https://dash.cloudflare.com
- **Sentry Dashboard:** https://sentry.io
- **GitHub Repository:** (Your GitHub repo URL)

### Key Metrics

- **P95 Latency Target:** < 500ms
- **Error Rate Target:** < 1%
- **Uptime Target:** 99.9%
- **Health Check Interval:** Every 5 minutes

### Emergency Commands

```bash
# Check deployment health
curl https://umbrella.app/v1/health

# Run post-deployment verification
API_URL=https://umbrella.app npm run verify:deployment

# Run smoke tests
API_URL=https://umbrella.app npm run test:smoke

# Rollback to previous version
ENVIRONMENT=production npm run rollback
```

---

## Daily Operations

### Morning Health Check (15 minutes)

**Time:** Start of business day
**Frequency:** Daily

1. **Verify Production Health**
   ```bash
   curl https://umbrella.app/v1/health
   ```
   - Should return 200 OK
   - Check `environment: "production"`
   - Verify `timestamp` is current

2. **Check Cloudflare Analytics**
   - Navigate to Cloudflare Dashboard > Workers > umbrella-prod
   - Review past 24 hours:
     - Request count
     - Error rate (should be < 1%)
     - P50, P95, P99 latencies (P95 should be < 500ms)
   - Look for any unusual spikes or drops

3. **Review Sentry Errors**
   - Open Sentry dashboard
   - Check for new errors in past 24 hours
   - Prioritize:
     - **Critical:** Database errors, authentication failures
     - **High:** 5xx errors, unhandled exceptions
     - **Medium:** 4xx errors (except 401, 404)
     - **Low:** Warnings, info logs

4. **Verify Cron Job Execution**
   - Check Cloudflare Dashboard > Workers > umbrella-prod > Cron Triggers
   - Verify analytics cron ran at midnight UTC
   - Check logs for successful execution
   - If failed, investigate and manually trigger if needed

5. **Check Database Status**
   ```bash
   wrangler d1 execute DB --env production --command "SELECT COUNT(*) FROM users"
   ```
   - Verify database is accessible
   - Note growth trends

### Weekly Review (30 minutes)

**Time:** End of week
**Frequency:** Weekly

1. **Performance Analysis**
   - Review weekly performance trends in Cloudflare Analytics
   - Compare against previous weeks
   - Identify any degradation patterns

2. **Error Analysis**
   - Review all Sentry errors from the week
   - Categorize by type and frequency
   - Create issues for recurring problems

3. **Capacity Planning**
   - Review resource usage:
     - D1 database size
     - R2 storage usage
     - Request volume trends
   - Forecast growth and identify potential bottlenecks

4. **Security Review**
   - Check for any suspicious activity patterns
   - Review authentication failures
   - Verify rate limiting is working (Violet: 50/day)

---

## Monitoring

### What to Monitor

#### 1. Application Health

**Metric:** Health endpoint status
**Check:** Every 5 minutes
**Alert if:** Returns non-200 status for 2+ consecutive checks

```bash
# Manual check
curl -i https://umbrella.app/v1/health
```

#### 2. Response Times

**Metric:** P95 latency
**Target:** < 500ms
**Alert if:** P95 > 1000ms for 5+ minutes

**Where to check:** Cloudflare Analytics > Performance

#### 3. Error Rate

**Metric:** 5xx errors / total requests
**Target:** < 1%
**Alert if:** > 5% for 5+ minutes

**Where to check:** Cloudflare Analytics > Errors

#### 4. Database Performance

**Metric:** D1 query latency
**Target:** < 100ms average
**Alert if:** > 500ms average for 5+ minutes

**Where to check:** Cloudflare Dashboard > D1 > Metrics

#### 5. Cron Job Execution

**Metric:** Analytics cron completion
**Schedule:** Daily at 00:00 UTC
**Alert if:** Failed or didn't run

**Where to check:** Cloudflare Dashboard > Workers > Cron Triggers

### Setting Up Alerts

#### Cloudflare Alerts

1. Navigate to Cloudflare Dashboard > Notifications
2. Create alerts for:
   - **Worker Error Rate:** Threshold > 5%
   - **Worker Requests:** Sudden drop (< 50% of normal)
   - **D1 Errors:** Any database errors

#### External Monitoring (Optional)

Consider setting up:
- **UptimeRobot:** Monitor health endpoint every 5 minutes
- **PagerDuty:** Alert on-call engineer for critical issues
- **Slack Webhooks:** Send alerts to team channel

---

## Common Issues

### Issue 1: Health Check Failing

**Symptoms:**
- Health endpoint returns 500 or timeout
- Application not responding

**Diagnosis:**
```bash
# Check health endpoint
curl -v https://umbrella.app/v1/health

# Check Cloudflare Worker status
wrangler tail --env production
```

**Resolution:**
1. Check Cloudflare Dashboard for Worker status
2. Review recent deployments
3. Check for any Cloudflare outages
4. If recent deployment, consider rollback:
   ```bash
   ENVIRONMENT=production npm run rollback
   ```

### Issue 2: High Latency (P95 > 1000ms)

**Symptoms:**
- Slow response times
- User complaints about performance

**Diagnosis:**
```bash
# Run performance check
API_URL=https://umbrella.app npm run perf:check

# Check specific endpoint
curl -w "@curl-format.txt" -o /dev/null -s https://umbrella.app/v1/artists
```

**Resolution:**
1. Check Cloudflare Analytics for bottlenecks
2. Review D1 query performance
3. Verify KV cache is being used
4. Check for N+1 query problems
5. Consider optimizing slow endpoints

### Issue 3: Database Errors

**Symptoms:**
- Sentry showing D1 errors
- 500 errors on database-dependent endpoints

**Diagnosis:**
```bash
# Check database status
wrangler d1 execute DB --env production --command "SELECT 1"

# List tables
wrangler d1 execute DB --env production --command "SELECT name FROM sqlite_master WHERE type='table'"
```

**Resolution:**
1. Verify database exists and is accessible
2. Check if migrations are up to date:
   ```bash
   wrangler d1 migrations list --env production
   ```
3. If migrations missing:
   ```bash
   wrangler d1 migrations apply --env production
   ```
4. Check D1 limits and quotas

### Issue 4: Authentication Failures

**Symptoms:**
- Users cannot log in
- 401 errors on protected endpoints

**Diagnosis:**
- Check Clerk status page
- Verify Clerk webhook is configured
- Check environment variables:
  - `CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`
  - `CLERK_WEBHOOK_SECRET`

**Resolution:**
1. Verify Clerk configuration in Cloudflare Secrets
2. Check Clerk dashboard for service status
3. Verify webhook endpoint is accessible
4. Review Clerk logs for failed authentication attempts

### Issue 5: Cron Job Not Running

**Symptoms:**
- Analytics not updating
- Cron logs show failures

**Diagnosis:**
- Check Cloudflare Dashboard > Cron Triggers
- Review cron execution logs
- Verify cron schedule in `wrangler.toml`

**Resolution:**
1. Check `wrangler.toml` has cron configured:
   ```toml
   [env.production.triggers]
   crons = ["0 0 * * *"]
   ```
2. Manually trigger analytics update if needed
3. Check for errors in cron handler code
4. Verify database is accessible from cron context

### Issue 6: High Error Rate

**Symptoms:**
- Error rate > 5%
- Many 5xx errors in logs

**Diagnosis:**
- Check Sentry for error patterns
- Review Cloudflare error logs
- Identify common error messages

**Resolution:**
1. Group errors by type
2. Fix critical errors first (database, authentication)
3. Deploy fixes
4. Monitor error rate decline
5. If unrecoverable, consider rollback

---

## Incident Response

### Severity Levels

#### SEV-1: Critical (Production Down)
- **Definition:** Application unavailable, health check failing
- **Response Time:** Immediate
- **Actions:**
  1. Notify team immediately
  2. Check Cloudflare Dashboard for outages
  3. Review recent deployments
  4. Initiate rollback if recent deployment
  5. Communicate status to stakeholders

#### SEV-2: Major (Degraded Performance)
- **Definition:** P95 > 2000ms, error rate > 10%
- **Response Time:** < 15 minutes
- **Actions:**
  1. Notify team
  2. Identify bottleneck (database, API, external service)
  3. Implement mitigation (caching, rate limiting)
  4. Consider rollback if caused by recent deployment

#### SEV-3: Minor (Non-Critical Issues)
- **Definition:** Isolated errors, minor performance degradation
- **Response Time:** < 1 hour
- **Actions:**
  1. Create issue for tracking
  2. Investigate root cause
  3. Schedule fix in next deployment

### Incident Response Checklist

When an incident occurs:

- [ ] **Acknowledge:** Confirm incident and severity
- [ ] **Notify:** Alert team via Slack/PagerDuty
- [ ] **Investigate:** Gather logs and metrics
- [ ] **Mitigate:** Implement immediate fix or rollback
- [ ] **Monitor:** Verify mitigation is working
- [ ] **Communicate:** Update stakeholders on status
- [ ] **Resolve:** Confirm issue is resolved
- [ ] **Postmortem:** Document incident and lessons learned

### Incident Log Template

```markdown
## Incident: [Title]

**Date:** YYYY-MM-DD
**Time:** HH:MM UTC
**Severity:** SEV-X
**Status:** [Open/Resolved]

### Timeline
- HH:MM - Issue detected
- HH:MM - Team notified
- HH:MM - Investigation started
- HH:MM - Mitigation applied
- HH:MM - Issue resolved

### Impact
- Users affected: [number/percentage]
- Duration: [minutes/hours]
- Services impacted: [list]

### Root Cause
[Description of what caused the incident]

### Resolution
[Description of how it was fixed]

### Action Items
- [ ] Fix underlying issue
- [ ] Add monitoring/alerting
- [ ] Update runbook
- [ ] Review with team

### Lessons Learned
[What we learned and how to prevent in future]
```

---

## Rollback Procedures

### When to Rollback

Rollback if:
- Health check failing after deployment
- Error rate > 20%
- Critical functionality broken
- Database corruption risk
- Security vulnerability introduced

### Automatic Rollback

The CI/CD pipeline automatically rolls back failed deployments.

To manually trigger:

```bash
# Set environment variables
export CLOUDFLARE_API_TOKEN="your-token"
export CLOUDFLARE_ACCOUNT_ID="your-account-id"
export ENVIRONMENT="production"

# Run rollback
npm run rollback
```

### Manual Rollback Steps

If automatic rollback fails:

1. **Identify Previous Version**
   ```bash
   git tag --sort=-version:refname | grep "^backup-"
   ```

2. **Checkout Previous Version**
   ```bash
   git checkout <backup-tag>
   ```

3. **Rebuild**
   ```bash
   npm ci
   npm run build
   npm run build:worker
   ```

4. **Deploy**
   ```bash
   wrangler deploy --env production
   ```

5. **Verify**
   ```bash
   API_URL=https://umbrella.app npm run verify:deployment
   ```

6. **Return to Main**
   ```bash
   git checkout main
   ```

### Database Rollback

**WARNING:** Database rollbacks are complex and risky.

If a migration causes issues:

1. **Do NOT rollback migrations automatically**
2. **Create a forward-fixing migration**
   ```bash
   # Create new migration to fix issue
   touch db/migrations/NNNN_fix_issue.sql
   ```
3. **Test in staging first**
   ```bash
   wrangler d1 migrations apply --env staging
   ```
4. **Apply to production**
   ```bash
   wrangler d1 migrations apply --env production
   ```

---

## Emergency Contacts

### On-Call Rotation

| Role | Name | Contact | Backup |
|------|------|---------|--------|
| Primary On-Call | [Name] | [Phone/Email] | [Name] |
| Secondary On-Call | [Name] | [Phone/Email] | [Name] |
| Engineering Lead | [Name] | [Phone/Email] | - |

### Escalation Path

1. **Level 1:** On-call engineer (response < 15 min)
2. **Level 2:** Engineering lead (response < 30 min)
3. **Level 3:** CTO/Engineering leadership (response < 1 hour)

### External Contacts

| Service | Support | Documentation |
|---------|---------|---------------|
| Cloudflare | support@cloudflare.com | https://developers.cloudflare.com/workers/ |
| Clerk | support@clerk.dev | https://clerk.dev/docs |
| Sentry | support@sentry.io | https://docs.sentry.io/ |
| Resend | support@resend.com | https://resend.com/docs |
| Twilio | https://www.twilio.com/help/contact | https://www.twilio.com/docs |

---

## Maintenance Windows

### Scheduled Maintenance

**When:** Every Sunday 02:00-04:00 UTC
**Impact:** Minimal (deployments should be zero-downtime)

**Pre-Maintenance Checklist:**
- [ ] Announce maintenance window 24h in advance
- [ ] Review and test changes in staging
- [ ] Verify rollback procedure ready
- [ ] Ensure on-call engineer available

**During Maintenance:**
- [ ] Run database migrations (if any)
- [ ] Deploy new version
- [ ] Run post-deployment verification
- [ ] Monitor for 15 minutes post-deployment

**Post-Maintenance:**
- [ ] Confirm all systems healthy
- [ ] Update team on completion
- [ ] Document any issues

### Emergency Maintenance

For critical security patches or urgent fixes:

1. **Assess urgency** - Can it wait for scheduled maintenance?
2. **Notify stakeholders** - Minimum 1 hour notice if possible
3. **Follow deployment process** - Don't skip steps
4. **Monitor closely** - Stay available for 1 hour post-deployment

---

## Best Practices

### Deployment Best Practices

1. **Always deploy to staging first**
2. **Run full test suite before deploying**
3. **Deploy during low-traffic hours when possible**
4. **Monitor for 15 minutes after deployment**
5. **Have rollback plan ready**

### Monitoring Best Practices

1. **Check production health daily**
2. **Review metrics weekly**
3. **Set up alerts for critical issues**
4. **Document all incidents**
5. **Conduct monthly incident reviews**

### Security Best Practices

1. **Rotate secrets quarterly**
2. **Review access logs monthly**
3. **Keep dependencies updated**
4. **Monitor for security vulnerabilities**
5. **Follow principle of least privilege**

---

## Appendix

### Useful Commands

```bash
# Check Worker logs in real-time
wrangler tail --env production

# List all deployments
wrangler deployments list --env production

# Execute database query
wrangler d1 execute DB --env production --command "SELECT COUNT(*) FROM users"

# List migrations
wrangler d1 migrations list --env production

# Check KV namespace
wrangler kv:key list --namespace-id <KV-ID>

# Check R2 bucket
wrangler r2 object list umbrella-prod
```

### Metrics to Track

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Uptime | 99.9% | < 99% |
| P95 Latency | < 500ms | > 1000ms |
| Error Rate | < 1% | > 5% |
| Request Success Rate | > 99% | < 95% |
| Database Query Time | < 100ms | > 500ms |

### Common HTTP Status Codes

| Code | Meaning | Common Cause |
|------|---------|--------------|
| 200 | OK | Successful request |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Missing/invalid auth token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Application error |
| 502 | Bad Gateway | Upstream service error |
| 503 | Service Unavailable | Service overloaded/down |

---

## Document Updates

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-11-17 | 1.0 | Initial runbook | AI Assistant |

---

**Last Updated:** 2025-11-17
**Next Review:** 2026-01-17
**Owner:** Engineering Team
