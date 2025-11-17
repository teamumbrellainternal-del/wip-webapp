---
id: task-11.4
title: "Monitoring & Infrastructure"
status: "To Do"
assignee: []
created_date: "2025-11-17"
labels: ["devops", "P0", "monitoring"]
milestone: "M11 - Pre-Launch Readiness & Compliance"
dependencies: []
estimated_hours: 5
---

## Description
Implement health check endpoint, document database backup strategy, and create detailed rollback procedures for production incidents.

## Acceptance Criteria
- [ ] GET /health endpoint returns Worker and dependency status
- [ ] Health check response includes: status, version, uptime, timestamp, dependencies (D1, KV, R2)
- [ ] Returns 200 when healthy, 503 when any dependency down
- [ ] Health check cached for 10 seconds (prevents abuse)
- [ ] Response time <100ms
- [ ] Database backup strategy documented in docs/DATABASE_BACKUP.md
- [ ] Automatic backups verified (Cloudflare D1 point-in-time recovery)
- [ ] Manual backup procedure documented
- [ ] Restoration procedure documented with step-by-step instructions
- [ ] Rollback procedure documented in docs/ROLLBACK.md
- [ ] Rollback when-to-use criteria defined (P0/P1/P2 severity)
- [ ] Worker rollback procedure documented (wrangler rollback command)
- [ ] Database rollback procedure documented (migration rollback)
- [ ] Post-mortem template created

## Implementation Plan

### Health Check Endpoint (2 hours)
1. Create api/routes/health.ts
2. Implement GET /health handler:
   - Check D1: Execute SELECT 1
   - Check KV: Get health:ping key
   - Check R2: List objects with limit=1
3. Determine overall status:
   - If all healthy: return 200, status="healthy"
   - If any unhealthy: return 503, status="unhealthy"
4. Response schema:
   ```typescript
   {
     status: "healthy" | "unhealthy",
     version: "1.0.0",  // From env or git commit
     uptime: 86400,  // Seconds since Worker start
     timestamp: "2025-11-17T12:00:00Z",
     dependencies: {
       database: "healthy" | "unhealthy",
       kv: "healthy" | "unhealthy",
       storage: "healthy" | "unhealthy"
     }
   }
   ```
5. Cache result in memory for 10 seconds
6. Register route in api/index.ts (no auth, no rate limit)
7. Test: Call /health, break D1, call again (expect 503)

### Database Backup Strategy (1.5 hours)
8. Create docs/DATABASE_BACKUP.md
9. Document Cloudflare D1 automatic backups:
   - Point-in-time recovery available
   - 30-day retention (verify in Cloudflare docs)
   - Automatic daily backups
10. Document manual backup procedure:
    ```bash
    wrangler d1 export umbrella-prod-db --output=backup-$(date +%Y%m%d).sql
    # Store in S3 or secure location
    ```
11. Document restoration procedure:
    ```bash
    wrangler d1 execute umbrella-prod-db --file=backup-20251117.sql
    ```
12. Define disaster recovery scenarios:
    - Accidental data deletion
    - Database corruption
    - Complete data loss
13. Document RTO (1 hour) and RPO (24 hours)

### Rollback Procedure (1.5 hours)
14. Create docs/ROLLBACK.md
15. Define when to rollback:
    - P0 (Immediate): App completely down, data corruption, security vulnerability
    - P1 (Urgent): Critical feature broken (>50% users affected)
    - P2 (Consider): Non-critical issues (<10% users affected)
16. Document Worker rollback:
    ```bash
    # Identify last known good deployment
    wrangler deployments list --env production
    
    # Rollback to previous version
    wrangler rollback --env production
    
    # Verify rollback successful
    curl https://umbrella.app/health
    ```
17. Document database rollback:
    ```bash
    # WARNING: Destructive, loses recent data
    
    # Create backup before rollback
    wrangler d1 export umbrella-prod-db --output=pre-rollback-backup.sql
    
    # Rollback migration (if supported)
    wrangler d1 migrations rollback umbrella-prod-db --to=0007
    ```
18. Create post-mortem template in docs/POST_MORTEM_TEMPLATE.md:
    - What happened? (timeline)
    - Why? (root cause)
    - How detected? (monitoring, user reports)
    - How resolved? (rollback, hotfix)
    - Prevention? (action items)

## Notes & Comments
**Priority:** P0 - LAUNCH BLOCKER (incident response requirement)

**Files to Create:**
- api/routes/health.ts
- docs/DATABASE_BACKUP.md
- docs/ROLLBACK.md
- docs/POST_MORTEM_TEMPLATE.md

**Files to Modify:**
- api/index.ts (register /health route)

**Health Check Usage:** Add to uptime monitoring (Pingdom, UptimeRobot). Alert if returns non-200 or response time >500ms.

**Backup Strategy:** Cloudflare D1 provides automatic point-in-time recovery. Always maintain manual backups too (off-platform redundancy).

**Rollback Philosophy:** Prefer "fix forward" over rollback when possible. Only rollback for P0 incidents or when fix-forward impossible.

