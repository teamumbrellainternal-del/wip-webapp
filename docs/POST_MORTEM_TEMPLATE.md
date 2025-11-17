# Post-Mortem: [Incident Title]

**Date**: [YYYY-MM-DD]
**Severity**: [P0 / P1 / P2]
**Duration**: [XX hours YY minutes]
**Status**: [Draft / In Review / Published]
**Author**: [Name]
**Reviewers**: [Names]

---

## Executive Summary

*2-3 sentence summary of what happened, the impact, and the resolution.*

**Example**:
> On November 17, 2025, the Umbrella API experienced a complete outage for 47 minutes (10:15 AM - 11:02 AM UTC) affecting all users. The incident was caused by a database migration that introduced a schema incompatibility. The issue was resolved by rolling back the Worker deployment to the previous version.

---

## Impact

### User Impact

- **Users Affected**: [Number or percentage of users]
- **Services Impacted**: [List affected features]
- **Duration of Impact**: [Start time - End time] ([Duration])
- **User Experience**: [Description of what users experienced]

**Example**:
- **Users Affected**: 100% of users (~15,000 active users)
- **Services Impacted**:
  - User authentication (unable to log in)
  - API endpoints (all returning 500 errors)
  - Health check endpoint (returning 503)
- **Duration**: 47 minutes (10:15 AM - 11:02 AM UTC)
- **User Experience**: Complete inability to access the application. Users saw "Service Unavailable" error page.

### Business Impact

- **Revenue Impact**: [Estimated revenue loss, if applicable]
- **Reputation Impact**: [Social media mentions, user complaints, support tickets]
- **SLA Breach**: [Yes/No, details if applicable]

**Example**:
- **Revenue Impact**: Estimated $2,400 in lost subscription upgrades during outage
- **Reputation Impact**: 47 support tickets, 12 negative tweets
- **SLA Breach**: Yes - breached 99.9% uptime SLA for November

### Data Impact

- **Data Loss**: [Yes/No - describe if any data was lost]
- **Data Corruption**: [Yes/No - describe if any data was corrupted]
- **Data Recovery**: [What data was recovered, what was lost permanently]

**Example**:
- **Data Loss**: No data loss occurred
- **Data Corruption**: No data corruption
- **Data Recovery**: N/A

---

## Timeline

*All times in UTC. Use reverse chronological order (most recent first) or chronological (oldest first) - be consistent.*

### Chronological Timeline

| Time (UTC) | Event | Action Taken | By Whom |
|------------|-------|--------------|---------|
| 10:00 AM | Deployment v1.2.3 initiated | Deployed new migration (0008_add_user_preferences) | Deploy Bot |
| 10:15 AM | First error reports in Sentry | Alert triggered: Error rate >5% | Automated Alert |
| 10:17 AM | On-call engineer paged | Acknowledged incident, began investigation | Engineer A |
| 10:22 AM | P0 incident declared | Health check returning 503, all API endpoints down | Engineer A |
| 10:25 AM | Root cause identified | Migration incompatible with Worker code | Engineer A |
| 10:30 AM | Rollback decision made | CTO approved Worker rollback | CTO |
| 10:32 AM | Worker rollback initiated | `wrangler rollback --env production` | Engineer A |
| 10:38 AM | Health check restored | Health endpoint returning 200 | Automated Check |
| 10:45 AM | User traffic recovering | Error rate dropped to <1% | Monitoring |
| 11:02 AM | Incident resolved | All services operational, monitoring continues | Engineer A |
| 11:30 AM | Post-incident review scheduled | Post-mortem meeting scheduled for Nov 18, 10 AM | Engineer A |

---

## Root Cause Analysis

### What Happened?

*Detailed technical explanation of what went wrong.*

**Example**:
> A database migration (0008_add_user_preferences.sql) was deployed to production that added a new column `preferences` to the `users` table with a `NOT NULL` constraint but no default value. The Worker code was updated to set this field, but the migration ran before the Worker deployment completed. During the 2-minute gap, existing queries that inserted users failed because they didn't include the new required field, causing all user registration and authentication flows to fail.

### Why Did It Happen?

*Identify the underlying cause, not just the symptom.*

**5 Whys Analysis**:
1. **Why did the API go down?** → User registration queries failed due to missing required field
2. **Why was the field missing?** → Migration added NOT NULL column before Worker code was deployed
3. **Why did migration run before Worker deployment?** → Migration and Worker deployments are separate processes with no synchronization
4. **Why aren't they synchronized?** → No deployment orchestration ensures migrations and code deploy atomically
5. **Why no orchestration?** → Deployment process was not designed with migration timing in mind

**Root Cause**:
> Lack of deployment orchestration between database migrations and Worker code deployments. Migrations ran independently and immediately, while Worker deployment took 2 minutes, creating a window of incompatibility.

### Contributing Factors

*What made the incident worse or prevented faster resolution?*

**Example**:
- Migration did not follow backward-compatibility guidelines (should have made column nullable first)
- No pre-deployment validation in staging environment caught the incompatibility
- Rollback procedure took 6 minutes instead of expected 2 minutes due to unclear documentation
- On-call engineer was not familiar with rollback commands

---

## Resolution

### How Was It Resolved?

*Describe the steps taken to resolve the incident.*

**Example**:
1. Rolled back Worker deployment to v1.2.2 (previous stable version)
2. Verified health check endpoint returned 200 OK
3. Confirmed error rates dropped below 1%
4. Monitored for 30 minutes to ensure stability
5. Decided to keep rollback in place and fix migration in next deployment

### Immediate Remediation

*Quick fixes applied during the incident.*

**Example**:
- Worker rolled back to v1.2.2
- Migration left in place (backward-compatible with v1.2.2)
- Monitoring increased to 5-minute check intervals

### Long-Term Fix

*Permanent solution to prevent recurrence.*

**Example**:
- Update migration 0008 to make `preferences` column nullable with default value `'{}'`
- Deploy updated migration with backward-compatible Worker code
- After deployment verified, add NOT NULL constraint in separate migration if needed

---

## What Went Well

*Positive aspects of the incident response.*

**Example**:
- ✅ Alerting triggered within 2 minutes of error spike
- ✅ On-call engineer responded within 5 minutes
- ✅ Root cause identified quickly (10 minutes)
- ✅ Rollback executed successfully on first attempt
- ✅ No data loss or corruption
- ✅ Clear communication with team throughout incident

---

## What Went Wrong

*Areas that need improvement.*

**Example**:
- ❌ Migration deployed without backward compatibility check
- ❌ No staging environment validation caught the issue
- ❌ Rollback documentation was unclear, delayed execution by 4 minutes
- ❌ No automated rollback triggered by health check failures
- ❌ User-facing status page not updated until 20 minutes into incident
- ❌ Multiple engineers unfamiliar with rollback procedures

---

## Action Items

*Concrete steps to prevent recurrence. Assign owners and deadlines.*

| # | Action Item | Owner | Deadline | Priority | Status |
|---|-------------|-------|----------|----------|--------|
| 1 | Update database migration guidelines to require backward compatibility | Engineer A | 2025-11-20 | P0 | 🟢 Done |
| 2 | Add pre-deployment migration validation script | Engineer B | 2025-11-24 | P0 | 🟡 In Progress |
| 3 | Improve rollback documentation with clear examples | Engineer C | 2025-11-22 | P1 | 🟡 In Progress |
| 4 | Create deployment orchestration to sync migrations + Worker deploys | DevOps Team | 2025-12-01 | P0 | 🔴 Not Started |
| 5 | Implement automated rollback on health check failures (>5min down) | Engineer A | 2025-11-30 | P1 | 🔴 Not Started |
| 6 | Add staging environment deployment testing to CI/CD | DevOps Team | 2025-11-25 | P0 | 🟡 In Progress |
| 7 | Conduct rollback training for all engineers | CTO | 2025-11-23 | P1 | 🔴 Not Started |
| 8 | Set up automated status page updates tied to health checks | Engineer D | 2025-12-05 | P2 | 🔴 Not Started |
| 9 | Add migration compatibility tests to CI pipeline | Engineer B | 2025-11-27 | P0 | 🔴 Not Started |
| 10 | Review and update on-call runbooks | All Engineers | 2025-11-30 | P1 | 🔴 Not Started |

---

## Lessons Learned

### Technical Lessons

*Technical insights from the incident.*

**Example**:
- Always make database migrations backward-compatible by default
- Use nullable columns with defaults, then add constraints later
- Deployments with migrations should be atomic or carefully orchestrated
- Health checks should validate database schema compatibility
- Rollback procedures must be tested regularly (quarterly drills)

### Process Lessons

*Process and team insights.*

**Example**:
- Deployment checklists need to include migration compatibility verification
- Staging environment must mirror production deployment process exactly
- On-call engineers need regular training on rollback procedures
- Status page updates should be automated, not manual
- Post-mortems should be blameless and focus on systemic improvements

### People Lessons

*Team communication and collaboration insights.*

**Example**:
- Clear incident communication channel (Slack #incidents) worked well
- Multiple team members should be familiar with rollback procedures
- CTO authorization for rollback should be streamlined for P0 incidents
- User communication template should be pre-written for faster response

---

## Appendix

### Supporting Data

- **Error Rate Graph**: [Link to Sentry/monitoring dashboard]
- **Health Check Logs**: [Link to logs]
- **Deployment Logs**: [Link to deployment history]
- **User Impact Metrics**: [Link to analytics]

### Related Incidents

- **Incident #42**: Similar migration issue on 2025-08-15 (resolved in 20 minutes)
- **Incident #28**: Rollback delay due to unclear documentation (2025-06-03)

### References

- [Database Backup Strategy](./DATABASE_BACKUP.md)
- [Rollback Procedures](./ROLLBACK.md)
- [Deployment Guidelines](./devops-build-config.md)
- [Migration Best Practices](./database-schema.md)

---

## Sign-Off

*Post-mortem reviewed and approved by:*

- [ ] **Incident Commander**: [Name] - [Date]
- [ ] **CTO**: [Name] - [Date]
- [ ] **Lead Engineer**: [Name] - [Date]
- [ ] **DevOps Lead**: [Name] - [Date]

**Publication Date**: [YYYY-MM-DD]
**Distribution**: All Engineering, Product, Customer Support

---

## Follow-Up Review

**30-Day Follow-Up** (scheduled for [Date]):
- Review action item completion
- Verify preventive measures are effective
- Assess if similar incidents have occurred
- Update procedures based on learnings

---

**Template Version**: 1.0.0
**Last Updated**: 2025-11-17
**Owner**: Engineering Team
