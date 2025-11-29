# Rollback Procedures

## Overview

This document defines when and how to rollback deployments for the Umbrella platform. Rollbacks are critical incident response procedures that restore the application to a previous known-good state.

**Philosophy**: Prefer "fix forward" over rollback when possible. Only rollback for P0 incidents or when fix-forward is impossible or would take too long.

## When to Rollback

### Severity Levels & Response Times

| Priority | Description | Examples | Response Time | Rollback Decision |
|----------|-------------|----------|---------------|-------------------|
| **P0** | Critical - Immediate rollback required | - App completely down<br>- Data corruption occurring<br>- Security vulnerability exposed<br>- Payment processing broken | < 15 minutes | **ROLLBACK IMMEDIATELY** |
| **P1** | Urgent - Consider rollback | - Critical feature broken (>50% users affected)<br>- Major performance degradation<br>- Authentication issues<br>- Data loss risk | < 1 hour | **Rollback if fix-forward takes >30 min** |
| **P2** | Important - Fix forward preferred | - Non-critical feature broken (<10% users)<br>- Minor UI bugs<br>- Performance issues for specific features | < 4 hours | **Fix forward unless incident escalates** |
| **P3** | Low - Never rollback | - Cosmetic issues<br>- Documentation errors<br>- Analytics tracking issues | < 24 hours | **Always fix forward** |

### Decision Tree

```
Is the app completely down? → YES → P0: ROLLBACK IMMEDIATELY
                           ↓ NO
Is there active data corruption? → YES → P0: ROLLBACK IMMEDIATELY
                                  ↓ NO
Is >50% of users affected? → YES → P1: Assess fix-forward time
                            ↓ NO              ↓
                            ↓         > 30 min? → ROLLBACK
                            ↓         < 30 min? → FIX FORWARD
Can we fix forward in <30 min? → YES → FIX FORWARD
                                ↓ NO
                                ROLLBACK
```

## Rollback Types

### 1. Worker/Application Rollback

Rollback the Cloudflare Worker code to a previous deployment.

**Use Cases**:
- Broken API endpoints
- Worker crashes
- Logic errors in application code
- Performance regressions

**Procedure**: See [Worker Rollback](#worker-rollback-procedure)

### 2. Database Rollback

Rollback database schema or data to a previous state.

**Use Cases**:
- Failed migration causing data corruption
- Schema changes breaking application
- Accidental data deletion

**Procedure**: See [Database Rollback](#database-rollback-procedure)

**⚠️ WARNING**: Database rollbacks are destructive and cause data loss. Always create a backup before rolling back.

### 3. Combined Rollback

Rollback both Worker and Database together.

**Use Cases**:
- New feature deployment failed with both code and DB changes
- Migration incompatible with rolled-back Worker code

**Procedure**: See [Combined Rollback](#combined-rollback-procedure)

## Worker Rollback Procedure

### Prerequisites

- Access to Cloudflare dashboard or Wrangler CLI
- Knowledge of last known good deployment
- Access to health check endpoint

### Step-by-Step Rollback

#### 1. Identify Last Known Good Deployment

```bash
# List recent deployments
wrangler deployments list --env production

# Example output:
# Deployment ID: abc123def456
# Created: 2025-11-17 10:30:00
# Author: deploy-bot
# Message: Deploy feature-x
#
# Deployment ID: xyz789ghi012  ← Last known good
# Created: 2025-11-17 09:00:00
# Author: deploy-bot
# Message: Deploy bugfix-y
```

Identify the deployment ID of the last stable version (before issues started).

#### 2. Create Pre-Rollback Snapshot

```bash
# Document current state for post-mortem
wrangler deployments list --env production > rollback-snapshot-$(date +%Y%m%d-%H%M%S).txt

# Capture current health status
curl https://umbrella.app/v1/health > health-before-rollback.json
```

#### 3. Execute Rollback

```bash
# Rollback to previous deployment
wrangler rollback --env production

# OR rollback to specific deployment ID
wrangler rollback --deployment-id xyz789ghi012 --env production
```

**Expected Output**:
```
✅ Successfully rolled back to deployment xyz789ghi012
🌍 Worker is now running the previous version
```

#### 4. Verify Rollback Success

```bash
# Check health endpoint (should return 200 OK)
curl -i https://umbrella.app/v1/health

# Expected:
# HTTP/2 200
# {
#   "status": "healthy",
#   "version": "1.0.0",
#   "dependencies": { ... }
# }

# Test critical endpoints
curl -i https://umbrella.app/v1/auth/session
curl -i https://umbrella.app/v1/profile

# Check error rates in Sentry dashboard
# Check logs in Cloudflare dashboard
```

#### 5. Monitor Post-Rollback

- **First 5 minutes**: Watch error rates, response times
- **First 30 minutes**: Monitor user reports, health checks
- **First 2 hours**: Review all critical features
- **Next 24 hours**: Monitor analytics, user behavior

#### 6. Communicate Rollback

```bash
# Notify team in Slack/incident channel
# Template:
🔄 ROLLBACK EXECUTED
Incident: [P0] API completely down
Rolled back to: deployment xyz789ghi012 (2025-11-17 09:00:00)
Status: ✅ Service restored
Impact: ~30 minutes downtime
Next steps: Root cause analysis, fix-forward plan
```

### Rollback via Cloudflare Dashboard

If Wrangler CLI is unavailable:

1. Go to Cloudflare Dashboard
2. Navigate to Workers & Pages → umbrella-api-worker
3. Click "Deployments" tab
4. Find the last known good deployment
5. Click "..." → "Rollback to this deployment"
6. Confirm rollback
7. Verify via health check

## Database Rollback Procedure

### ⚠️ DANGER ZONE ⚠️

**Database rollbacks are DESTRUCTIVE**:
- All data created after the rollback point will be LOST
- User-generated content will be DELETED
- Transactions completed after the backup will be UNDONE

**Only proceed if**:
- Data corruption is actively occurring
- Alternative recovery methods have failed
- CTO/Lead Engineer has approved the rollback

### Step-by-Step Database Rollback

#### 1. Declare Database Emergency

```bash
# Notify entire team immediately
# Put application in maintenance mode to prevent new writes

# Option 1: If Worker supports maintenance mode
# Set MAINTENANCE_MODE=true environment variable

# Option 2: Rollback Worker to maintenance page
wrangler rollback --env production --to-maintenance
```

#### 2. Create Emergency Backup

```bash
# Export current database state (even if corrupted)
# This allows recovery of recent data if possible
wrangler d1 export umbrella-prod-db --output=emergency-backup-$(date +%Y%m%d-%H%M%S).sql

# Upload to secure storage immediately
aws s3 cp emergency-backup-*.sql s3://umbrella-backups/emergency/
```

#### 3. Identify Rollback Target

Determine which backup to restore to:

```bash
# List available backups
aws s3 ls s3://umbrella-backups/production/

# Choose backup created BEFORE incident started
# Example: backup-20251117-020000.sql (2:00 AM daily backup)
```

#### 4. Download and Verify Backup

```bash
# Download backup file
aws s3 cp s3://umbrella-backups/production/backup-20251117-020000.sql .

# Verify file integrity
file backup-20251117-020000.sql
head -n 20 backup-20251117-020000.sql

# Check file size (should be reasonable, not 0 bytes)
ls -lh backup-20251117-020000.sql
```

#### 5. Execute Database Restoration

**⚠️ POINT OF NO RETURN - Data created after this backup will be lost**

```bash
# Restore database from backup
wrangler d1 execute umbrella-prod-db --file=backup-20251117-020000.sql

# This will overwrite ALL tables and data
```

**Expected Output**:
```
⚠️  Warning: This will overwrite all data in umbrella-prod-db
Are you sure? (y/N): y
✅ Successfully executed SQL from backup-20251117-020000.sql
```

#### 6. Verify Database Integrity

```bash
# Run integrity check
wrangler d1 execute umbrella-prod-db --command="PRAGMA integrity_check;"

# Expected output: "ok"

# Verify key tables exist
wrangler d1 execute umbrella-prod-db --command="SELECT COUNT(*) FROM users;"
wrangler d1 execute umbrella-prod-db --command="SELECT COUNT(*) FROM gigs;"

# Check database schema version
wrangler d1 execute umbrella-prod-db --command="SELECT version FROM migrations ORDER BY applied_at DESC LIMIT 1;"
```

#### 7. Rollback Database Migrations (If Needed)

If the backup is from before recent migrations:

```bash
# Check current migration version in restored database
wrangler d1 migrations list umbrella-prod-db

# If migrations need to be rolled back to match Worker version
wrangler d1 migrations apply umbrella-prod-db --to=0007

# Replace "0007" with the migration version matching the backup
```

#### 8. Restore Application

```bash
# If Worker was in maintenance mode, restore it
wrangler rollback --env production --to=[last-compatible-deployment]

# Verify health check
curl https://umbrella.app/v1/health
```

#### 9. Assess Data Loss

```bash
# Document what data was lost
# Compare emergency backup with restored backup
sqlite3 emergency-backup-20251117-140000.sql "SELECT COUNT(*) FROM users;"
sqlite3 backup-20251117-020000.sql "SELECT COUNT(*) FROM users;"

# Calculate data loss
# Example: Lost 47 new user signups, 120 messages, 15 gig applications
```

#### 10. User Communication

If data loss affects users, communicate immediately:

**Email Template**:
```
Subject: Umbrella Service Interruption - Data Recovery Notice

Dear Umbrella User,

We experienced a critical database issue today that required us to restore
from a backup. As a result, some data created between 2:00 AM and 2:30 PM
UTC on November 17, 2025 may have been lost.

Affected data:
- User signups
- Messages sent
- Gig applications
- Profile updates

We sincerely apologize for this disruption. If you were affected, please
contact support@umbrella.app and we'll assist you.

What we're doing to prevent this:
- Enhanced monitoring and alerting
- More frequent automated backups
- Improved database validation checks

Thank you for your patience.
- The Umbrella Team
```

## Combined Rollback Procedure

When both Worker and Database need to be rolled back together:

### Prerequisites

- Identify compatible Worker deployment and database backup
- Ensure migration versions align
- Prepare for longer downtime (30-60 minutes)

### Procedure

1. **Put app in maintenance mode** (prevent new traffic)
2. **Backup current state** (Worker deployment ID + database export)
3. **Rollback database first** (following [Database Rollback](#database-rollback-procedure))
4. **Verify database integrity**
5. **Identify compatible Worker deployment** (matches database migration version)
6. **Rollback Worker** (following [Worker Rollback](#worker-rollback-procedure))
7. **Verify end-to-end functionality**
8. **Remove maintenance mode**
9. **Monitor closely** for 24 hours

## Post-Rollback Checklist

After any rollback, complete the following:

- [ ] Health check returns 200 OK
- [ ] Critical user flows tested (signup, login, profile update, messaging)
- [ ] Error rates returned to normal (<1%)
- [ ] Response times acceptable (<500ms p95)
- [ ] Team notified of rollback completion
- [ ] Users notified if affected
- [ ] Post-mortem scheduled within 24 hours
- [ ] Root cause identified
- [ ] Fix-forward plan created
- [ ] Deployment safeguards updated

## Post-Mortem Process

**Required for all P0 and P1 rollbacks**

1. Schedule post-mortem within 24 hours of incident
2. Use [Post-Mortem Template](./POST_MORTEM_TEMPLATE.md)
3. Invite all stakeholders
4. Conduct blameless analysis
5. Document:
   - Timeline of events
   - Root cause
   - What went well
   - What went wrong
   - Action items to prevent recurrence
6. Share post-mortem with entire team
7. Track action items to completion

## Preventing Rollbacks

### Deployment Best Practices

1. **Gradual Rollouts**: Deploy to staging first, then canary (10% traffic), then full production
2. **Feature Flags**: Use feature flags to enable/disable new features without redeployment
3. **Database Migrations**: Always make migrations backward-compatible
4. **Automated Testing**: Require 100% passing tests before deployment
5. **Health Checks**: Automated health checks must pass before marking deployment successful
6. **Monitoring**: Set up alerts for error rate spikes, response time increases

### Pre-Deployment Checklist

- [ ] All tests passing (unit, integration, e2e)
- [ ] Database migrations tested in staging
- [ ] Backward compatibility verified
- [ ] Health checks pass in staging
- [ ] Performance benchmarks within acceptable range
- [ ] Security scan completed (no critical vulnerabilities)
- [ ] Rollback plan documented
- [ ] On-call engineer aware of deployment

## Rollback Metrics

Track rollback frequency to identify patterns:

| Metric | Target | Action if Exceeded |
|--------|--------|-------------------|
| Rollbacks per month | < 2 | Review deployment process |
| P0 incidents per quarter | < 1 | Enhance testing, monitoring |
| Time to rollback (P0) | < 15 min | Optimize rollback automation |
| Data loss incidents per year | 0 | Improve backup/restore procedures |

## Emergency Contacts

### Incident Response Team

| Role | Contact | Responsibility |
|------|---------|----------------|
| **CTO** | [Email/Phone] | Final rollback authorization |
| **Lead DevOps Engineer** | [Email/Phone] | Execute rollback procedures |
| **Database Administrator** | [Email/Phone] | Database rollback expertise |
| **On-Call Engineer** | [PagerDuty] | First responder |

### Escalation Path

1. **L1**: On-call engineer assesses severity
2. **L2**: If P0/P1, escalate to Lead DevOps + CTO
3. **L3**: CTO authorizes rollback
4. **L4**: Lead DevOps executes rollback
5. **L5**: Team monitors recovery

### External Support

- **Cloudflare Enterprise Support**: https://dash.cloudflare.com/support
  - Available 24/7 for P0 incidents
  - Response time: <1 hour for critical issues

## Tools & Scripts

### Quick Rollback Script

Create `scripts/rollback.sh` for emergency use:

```bash
#!/bin/bash
# Emergency rollback script
# Usage: ./scripts/rollback.sh [worker|database|combined]

set -e

TYPE=${1:-worker}
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

echo "🚨 ROLLBACK INITIATED: $TYPE"
echo "Timestamp: $TIMESTAMP"

case $TYPE in
  worker)
    echo "📋 Listing recent deployments..."
    wrangler deployments list --env production

    echo "🔄 Rolling back Worker..."
    wrangler rollback --env production

    echo "✅ Verifying health..."
    curl -f https://umbrella.app/v1/health || echo "❌ Health check failed!"
    ;;

  database)
    echo "⚠️  WARNING: Database rollback is DESTRUCTIVE"
    read -p "Are you sure? Type 'ROLLBACK DATABASE' to confirm: " confirm
    if [ "$confirm" != "ROLLBACK DATABASE" ]; then
      echo "❌ Rollback cancelled"
      exit 1
    fi

    echo "💾 Creating emergency backup..."
    wrangler d1 export umbrella-prod-db --output=emergency-$TIMESTAMP.sql
    aws s3 cp emergency-$TIMESTAMP.sql s3://umbrella-backups/emergency/

    echo "📥 Download latest backup manually and execute:"
    echo "  wrangler d1 execute umbrella-prod-db --file=backup-YYYYMMDD.sql"
    ;;

  combined)
    echo "🔄 Combined rollback (Worker + Database)"
    echo "⚠️  This is a complex operation. Follow manual procedures."
    echo "See: docs/ROLLBACK.md#combined-rollback-procedure"
    ;;

  *)
    echo "❌ Invalid type. Use: worker, database, or combined"
    exit 1
    ;;
esac

echo "✅ Rollback complete. Monitor closely."
echo "📝 Create post-mortem: docs/POST_MORTEM_TEMPLATE.md"
```

## Additional Resources

- [Database Backup Strategy](./DATABASE_BACKUP.md)
- [Post-Mortem Template](./POST_MORTEM_TEMPLATE.md)
- [Monitoring Dashboard](./MONITORING_DASHBOARD.md)
- [Post-Launch Runbook](./POST_LAUNCH_RUNBOOK.md)
- [Cloudflare Workers Deployments](https://developers.cloudflare.com/workers/configuration/versions-and-deployments/)
- [Cloudflare D1 Backups](https://developers.cloudflare.com/d1/platform/backups/)

## Version History

| Version | Date       | Changes                        | Author |
|---------|------------|--------------------------------|--------|
| 1.0.0   | 2025-11-17 | Initial rollback procedures    | Claude |
