# Database Backup Strategy

## Overview

This document outlines the comprehensive database backup and disaster recovery strategy for the Umbrella platform. The platform uses Cloudflare D1 (SQLite-based) as its primary database, which provides built-in point-in-time recovery capabilities along with manual backup options.

## Automatic Backups

### Cloudflare D1 Point-in-Time Recovery

Cloudflare D1 provides automatic point-in-time recovery (PITR) capabilities:

- **Retention Period**: 30 days
- **Backup Frequency**: Continuous (transaction log-based)
- **Recovery Granularity**: Can restore to any point within the 30-day window
- **Automatic Management**: Handled entirely by Cloudflare infrastructure

**Verification**: Check Cloudflare dashboard → D1 database → Backups section to verify PITR is enabled.

### Daily Snapshots

In addition to PITR, Cloudflare D1 creates daily full database snapshots:

- **Frequency**: Once per day (scheduled by Cloudflare)
- **Retention**: 30 days
- **Storage**: Managed by Cloudflare (no additional cost)
- **Purpose**: Faster recovery for full database restoration

## Manual Backup Procedures

### Creating a Manual Backup

For off-platform redundancy and compliance requirements, create manual backups regularly:

```bash
# Export production database to SQL file
wrangler d1 export umbrella-prod-db --output=backup-$(date +%Y%m%d-%H%M%S).sql

# Example output: backup-20251117-120000.sql
```

**Recommended Schedule**:
- **Production**: Daily at 2:00 AM UTC (automated via cron/GitHub Actions)
- **Pre-deployment**: Before every production deployment
- **Pre-migration**: Before running any database migrations
- **Ad-hoc**: Before any risky operations (data cleanup, bulk updates)

### Storing Backups Securely

Store manual backups in multiple secure locations:

1. **Primary Storage**: AWS S3 or Cloudflare R2
   ```bash
   # Upload to S3 (example)
   aws s3 cp backup-20251117-120000.sql s3://umbrella-backups/production/

   # Upload to R2 (example)
   wrangler r2 object put umbrella-backups/backup-20251117-120000.sql --file=backup-20251117-120000.sql
   ```

2. **Secondary Storage**: Different cloud provider for geographic redundancy
3. **Retention Policy**:
   - Keep daily backups for 90 days
   - Keep weekly backups for 1 year
   - Keep monthly backups for 7 years (compliance requirement)

### Backup Encryption

All manual backups should be encrypted at rest:

```bash
# Encrypt backup before upload
gpg --symmetric --cipher-algo AES256 backup-20251117-120000.sql

# Creates: backup-20251117-120000.sql.gpg
# Store the GPG passphrase in secure vault (1Password, AWS Secrets Manager)
```

## Restoration Procedures

### Restoring from Cloudflare PITR

To restore the database to a specific point in time:

1. **Access Cloudflare Dashboard**:
   - Navigate to Workers & Pages → D1 Databases
   - Select `umbrella-prod-db`
   - Click "Backups" tab

2. **Select Recovery Point**:
   - Choose the desired timestamp within the 30-day window
   - Click "Restore to this point"

3. **Verify Restoration**:
   ```bash
   # Check database integrity
   wrangler d1 execute umbrella-prod-db --command="SELECT COUNT(*) FROM users;"

   # Verify health endpoint
   curl https://umbrella.app/v1/health
   ```

**Recovery Time Objective (RTO)**: ~30 minutes
**Recovery Point Objective (RPO)**: Up to 24 hours (depending on PITR availability)

### Restoring from Manual Backup

To restore from a manual SQL backup file:

```bash
# 1. Download backup from storage
aws s3 cp s3://umbrella-backups/production/backup-20251117-120000.sql .

# 2. Decrypt if encrypted
gpg --decrypt backup-20251117-120000.sql.gpg > backup-20251117-120000.sql

# 3. Create a backup of current state before restoration (safety measure)
wrangler d1 export umbrella-prod-db --output=pre-restore-backup-$(date +%Y%m%d-%H%M%S).sql

# 4. Execute restoration
wrangler d1 execute umbrella-prod-db --file=backup-20251117-120000.sql

# 5. Verify restoration
wrangler d1 execute umbrella-prod-db --command="SELECT COUNT(*) FROM users;"
curl https://umbrella.app/v1/health
```

**Warning**: This will overwrite the entire database. All data created after the backup timestamp will be lost.

**RTO**: ~1 hour
**RPO**: Time of last manual backup (typically 24 hours)

### Partial Data Recovery

For recovering specific tables or data without full restoration:

```bash
# 1. Export specific table from backup
sqlite3 backup-20251117-120000.sql ".dump users" > users-table.sql

# 2. Restore only that table (requires manual coordination to avoid conflicts)
# WARNING: This is advanced and may cause integrity issues
wrangler d1 execute umbrella-prod-db --file=users-table.sql
```

**Use Cases**:
- Recovering accidentally deleted records
- Restoring specific user data
- Auditing historical data

## Disaster Recovery Scenarios

### Scenario 1: Accidental Data Deletion

**Example**: Admin accidentally deletes multiple user records

**Response**:
1. Immediately stop all write operations (put app in read-only mode if possible)
2. Identify the timestamp before deletion occurred
3. Use PITR to restore to that timestamp, OR
4. Use manual backup if within backup window
5. Verify data integrity
6. Resume normal operations
7. Conduct post-mortem (see `POST_MORTEM_TEMPLATE.md`)

**RTO**: 30-60 minutes
**RPO**: Up to 24 hours

### Scenario 2: Database Corruption

**Example**: Database becomes corrupted due to bug or infrastructure issue

**Response**:
1. Activate incident response team
2. Identify last known good state
3. Restore from PITR or manual backup
4. Run integrity checks:
   ```bash
   wrangler d1 execute umbrella-prod-db --command="PRAGMA integrity_check;"
   ```
5. If integrity check fails, try older backup
6. Once restored, verify all critical functionality
7. Identify and fix root cause

**RTO**: 1-2 hours
**RPO**: Up to 24 hours

### Scenario 3: Complete Data Loss

**Example**: Catastrophic failure resulting in total database loss

**Response**:
1. Declare P0 incident
2. Provision new D1 database
3. Restore from most recent manual backup
4. Update environment configuration to point to new database
5. Run full test suite
6. Gradually restore traffic
7. Notify affected users if data loss occurred

**RTO**: 2-4 hours
**RPO**: Up to 24 hours

## Backup Validation & Testing

### Regular Testing Schedule

Test backup restoration quarterly to ensure procedures work:

1. **Q1, Q2, Q3, Q4**: Full restoration test in staging environment
   ```bash
   # Restore latest production backup to staging
   wrangler d1 execute umbrella-staging-db --file=backup-latest.sql

   # Run automated tests against staging
   npm run test:integration
   ```

2. **Monthly**: Verify backup file integrity
   ```bash
   # Check file size, ensure not corrupted
   file backup-20251117-120000.sql
   head -n 10 backup-20251117-120000.sql
   ```

### Backup Monitoring

Set up automated monitoring for backup health:

- **Alert** if daily backup fails to complete
- **Alert** if backup file size decreases by >20% (may indicate corruption)
- **Alert** if PITR window drops below 7 days
- **Dashboard** showing backup age, size, and success rate

## Compliance & Retention

### Data Retention Requirements

Per GDPR, CCPA, and industry standards:

- **Active Data**: Retained while user account is active
- **Deleted Accounts**: Data removed within 30 days of deletion request
- **Backup Retention**: Backups containing deleted user data must be purged after 30 days
- **Audit Logs**: Retain for 7 years for compliance

### Right to Erasure (GDPR)

When a user requests data deletion:

1. Delete from live database immediately
2. Mark deletion in audit log
3. Note: Historical backups may contain data for up to 90 days (documented in privacy policy)
4. After 90 days, data is permanently removed from all backups

## Emergency Contacts

### Backup & Recovery Team

- **Primary DBA**: [CTO Email]
- **Cloudflare Support**: https://dash.cloudflare.com/support
- **On-Call Engineer**: [PagerDuty/On-Call Schedule]

### Escalation Path

1. **L1**: DevOps engineer attempts automated restoration
2. **L2**: Senior engineer reviews and attempts manual restoration
3. **L3**: CTO + Cloudflare Enterprise Support engaged
4. **L4**: Data recovery specialists (last resort)

## Automation

### GitHub Actions Workflow (Recommended)

Create `.github/workflows/backup.yml`:

```yaml
name: Database Backup
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
  workflow_dispatch:  # Manual trigger

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Wrangler
        run: npm install -g wrangler

      - name: Export Database
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
        run: |
          wrangler d1 export umbrella-prod-db --output=backup-$(date +%Y%m%d-%H%M%S).sql

      - name: Upload to S3
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        run: |
          aws s3 cp backup-*.sql s3://umbrella-backups/production/

      - name: Notify on Failure
        if: failure()
        run: |
          # Send alert via email/Slack/PagerDuty
          echo "Backup failed! Alert sent."
```

## Additional Resources

- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Cloudflare D1 Backups](https://developers.cloudflare.com/d1/platform/backups/)
- [Database Migration Guide](./devops-build-config.md)
- [Rollback Procedures](./ROLLBACK.md)
- [Post-Mortem Template](./POST_MORTEM_TEMPLATE.md)

## Version History

| Version | Date       | Changes                        | Author |
|---------|------------|--------------------------------|--------|
| 1.0.0   | 2025-11-17 | Initial backup strategy        | Claude |
