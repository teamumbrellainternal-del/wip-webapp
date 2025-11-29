# Leger Backend: System Overview

**Document Version:** 1.0  
**Scope:** Complete system architecture for v0.1.0 and v0.2.0+

## System Context

### The Leger Ecosystem
```
┌─────────────────────────────────────────────────────────────────┐
│                        Leger Ecosystem                           │
│                                                                  │
│  ┌──────────────┐         ┌──────────────┐      ┌────────────┐ │
│  │   leger CLI  │────────▶│leger Backend │◀─────│  Web UI    │ │
│  │   (Go/Cobra) │         │  (Workers)   │      │ (v0.2.0+)  │ │
│  └──────────────┘         └──────────────┘      └────────────┘ │
│         │                         │                             │
│         │                         │                             │
│         ▼                         ▼                             │
│  ┌──────────────┐         ┌──────────────┐                     │
│  │    legerd    │         │  Cloudflare  │                     │
│  │   (daemon)   │         │  KV/R2/D1    │                     │
│  └──────────────┘         └──────────────┘                     │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────┐                                               │
│  │   Podman     │                                               │
│  │  Secrets     │                                               │
│  └──────────────┘                                               │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
               ┌──────────────────┐
               │ Tailscale Network│
               │  (Zero Trust)    │
               └──────────────────┘
```

### Backend Responsibilities

**v0.1.0: Static Infrastructure**
- Authenticate CLI via Tailscale identity verification
- Store encrypted secrets in Cloudflare KV
- Host user-uploaded quadlet files in Cloudflare R2
- Serve quadlet files and manifests to CLI
- Track basic versioning (v1, v2, v3, etc.)

**v0.2.0+: Dynamic Configuration**
- Accept high-level configuration from Web UI
- Render quadlets from templates
- Store configuration state in Cloudflare D1
- Track configuration history and versions
- Support schema evolution and migrations
- Coordinate multi-device deployments

### Non-Responsibilities (Out of Scope)

❌ **Container orchestration:** Podman handles this locally  
❌ **Secret injection:** legerd daemon handles this locally  
❌ **Service health monitoring:** CLI/Podman handle this  
❌ **Template authoring:** GitHub repos host templates  
❌ **User management:** Tailscale handles identity  
❌ **Billing/Usage tracking:** Not in MVP scope

## Architecture Principles

### 1. Progressive Enhancement

Start with simple static hosting, add complexity only when proven necessary:
```
v0.1.0: Simple                v0.2.0+: Complex
─────────────────             ─────────────────
KV (secrets)       →          KV (secrets)
R2 (static files)  →          R2 (rendered files)
                   →          D1 (configurations)
                   →          Template Engine
                   →          Schema Registry
```

### 2. Zero External Infrastructure

Everything runs on Cloudflare's edge:
```
Traditional Stack         Leger Stack
────────────────          ───────────
VM (auth server)     →    Workers (auth via Tailscale API)
PostgreSQL (DB)      →    D1 (v0.2.0+) or KV (v0.1.0)
S3 (file storage)    →    R2 (Cloudflare's S3)
Redis (cache)        →    Workers KV (built-in)
Load balancer        →    Cloudflare (automatic)
```

**Cost Implication:** ~$5/month for 1000 users vs. ~$100/month traditional stack

### 3. CLI-First Design

API optimized for CLI workflow, not browser:
```python
# CLI-friendly response (minimal)
{
  "success": true,
  "data": {"token": "leg_abc123..."}
}

# NOT browser-optimized (verbose)
{
  "status": "success",
  "statusCode": 200,
  "timestamp": "2025-10-16T...",
  "requestId": "req_xyz...",
  "data": {...},
  "meta": {...}
}
```

### 4. Eventual Consistency Acceptable

Cloudflare KV is eventually consistent globally (~60s propagation). This is acceptable because:

- Secret updates are infrequent (minutes/hours between changes)
- Configuration updates are infrequent (days/weeks between changes)
- Real-time coordination not required (no multi-user editing)
- CLI can retry if needed

### 5. Fail-Fast with Clear Errors

API returns actionable errors:
```json
{
  "success": false,
  "error": {
    "code": "tailscale_verification_failed",
    "message": "Unable to verify Tailscale identity. Device not found in tailnet.",
    "action": "Check Tailscale status: tailscale status",
    "docs": "https://docs.leger.run/auth/troubleshooting"
  }
}
```

## High-Level Component Architecture

### v0.1.0 Components
```
┌─────────────────────────────────────────────────────────────────┐
│                    Cloudflare Workers                            │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    API Router                            │  │
│  │  /auth/cli  /secrets/*  /config/upload  /config/latest  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │    Auth      │  │   Secrets    │  │   Config     │         │
│  │   Handler    │  │   Handler    │  │   Handler    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│         │                  │                  │                 │
│         ▼                  ▼                  ▼                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Tailscale   │  │     KV       │  │      R2      │         │
│  │     API      │  │  (Encrypted) │  │  (Quadlets)  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

### v0.2.0+ Components (Additional)
```
┌─────────────────────────────────────────────────────────────────┐
│                  New v0.2.0+ Components                          │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Config     │  │   Template   │  │   Schema     │         │
│  │   Manager    │  │   Renderer   │  │   Registry   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│         │                  │                  │                 │
│         ▼                  ▼                  ▼                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │      D1      │  │   Nunjucks   │  │   GitHub     │         │
│  │  (Postgres)  │  │   (Engine)   │  │   Releases   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

## Data Storage Architecture

### v0.1.0 Storage Layout

**Cloudflare KV (3 Namespaces)**
```
leger_users
├── user:{user_uuid}
│   └── { tailscale_user_id, email, created_at, last_seen }
│
leger_secrets
├── secrets:{user_uuid}:openai_api_key
│   └── { encrypted_value, nonce, version, created_at }
├── secrets:{user_uuid}:anthropic_api_key
│   └── { encrypted_value, nonce, version, created_at }
│
leger_manifests
└── manifest:{user_uuid}:v1
    └── { deployment_name, files, services, secrets_required }
```

**Cloudflare R2 (1 Bucket)**
```
leger-quadlets/
├── {user_uuid}/
│   ├── v1/
│   │   ├── manifest.json
│   │   ├── openwebui.container
│   │   ├── openwebui.volume
│   │   └── litellm.container
│   ├── v2/
│   │   ├── manifest.json
│   │   ├── openwebui.container  (modified)
│   │   ├── openwebui.volume
│   │   └── litellm.container
│   └── latest -> v2  (symlink metadata in KV)
```

### v0.2.0+ Storage Layout (Additional)

**Cloudflare D1 (Relational Database)**
```sql
-- User configurations (high-level decisions)
configurations
├── id (uuid)
├── user_uuid (string)
├── config_data (json)  -- The 29 decisions
├── version (integer)   -- Auto-increment
├── schema_version (string)  -- "v1.0.0"
└── created_at (timestamp)

-- Configuration history
configuration_versions
├── id (uuid)
├── config_id (uuid)
├── version (integer)
├── config_data (json)  -- Snapshot
└── created_at (timestamp)

-- Schema registry
schemas
├── version (string)  -- "v1.0.0"
├── github_release_url (string)
├── template_manifest (json)  -- List of templates
└── released_at (timestamp)

-- Rendered output tracking
rendered_quadlets
├── id (uuid)
├── config_id (uuid)
├── version (integer)
├── r2_path (string)  -- "{user_uuid}/v3/"
└── rendered_at (timestamp)
```

## Network Architecture

### Request Flow (v0.1.0)
```
CLI                    Cloudflare Edge            Backend Services
───                    ───────────────            ────────────────

1. Authentication
   POST /auth/cli  →   Workers (US-WEST)  →  Tailscale API
                   ←   JWT token          ←  Verified
                   
2. Secret Storage
   POST /secrets/set → Workers (EU-WEST)  →  KV Write (primary)
                                          →  KV Replicate (60s)
                   ←   Success            ←  KV Write confirmed
                   
3. Config Upload
   POST /config/upload → Workers (US-EAST) → R2 Multipart Upload
   [streaming]       →                    →  Chunk 1/3
                     →                    →  Chunk 2/3
                     →                    →  Chunk 3/3
                   ←   Version: v3        ←  Upload complete
                   
4. Config Download
   GET /config/latest → Workers (ASIA)    → R2 Read (cached)
   [streaming]      ←                     ← Stream quadlet files
```

### Latency Targets

| Operation | Target | 95th Percentile |
|-----------|--------|-----------------|
| POST /auth/cli | 300ms | 500ms |
| POST /secrets/set | 150ms | 250ms |
| GET /secrets/get/:name | 100ms | 200ms |
| POST /config/upload (10MB) | 3s | 5s |
| GET /config/latest | 200ms | 400ms |

## Security Architecture

### Authentication Flow
```
┌─────────────┐
│ CLI runs on │
│  Tailscale  │
│   device    │
└──────┬──────┘
       │
       │ 1. Extract identity
       │    (tailscale status --json)
       ▼
┌─────────────────────┐
│  leger.run API      │
│                     │
│  2. Verify with     │
│     Tailscale API   │───────▶ GET /api/v2/tailnet/{net}/devices
│                     │◀────── Device list
│  3. Find device     │
│     Match user_id   │
│                     │
│  4. Issue JWT       │
│     30-day expiry   │
└──────┬──────────────┘
       │
       │ 5. Return token
       ▼
┌─────────────┐
│  CLI stores │
│    token    │
└─────────────┘
```

### Secret Encryption
```
┌─────────────────────────────────────────────────────────────────┐
│                        Encryption Flow                           │
│                                                                  │
│  Plaintext Secret                                               │
│  "sk-proj-abc123..."                                            │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────────┐                                           │
│  │   AES-256-GCM    │  ← Master Key (Workers Secret)           │
│  │   Encryption     │  ← Random Nonce (96 bits)                │
│  └──────────────────┘                                           │
│         │                                                        │
│         ▼                                                        │
│  { ciphertext, nonce, auth_tag }                                │
│         │                                                        │
│         ▼                                                        │
│  Store in KV:                                                   │
│  secrets:{uuid}:openai_api_key                                  │
│  {                                                              │
│    encrypted_value: "base64...",                                │
│    nonce: "base64...",                                          │
│    version: 1                                                   │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
```

### Access Control Matrix

| Role | v0.1.0 Permissions | v0.2.0+ Permissions |
|------|-------------------|---------------------|
| **Authenticated User** | • Read own secrets<br>• Write own secrets<br>• Upload quadlets<br>• Download quadlets | • All v0.1.0 permissions<br>• Create configurations<br>• View config history<br>• Trigger rendering |
| **CLI** | • All user permissions | • All user permissions<br>• Report deployment status |
| **legerd** | • Read secrets only | • Read secrets only |
| **Web UI** | (not in v0.1.0) | • All user permissions<br>• Visual config builder |

## Deployment Architecture

### Cloudflare Workers Deployment
```
GitHub Repository              Cloudflare
─────────────────              ──────────

main branch
├── src/
│   ├── index.ts      →  Deploy to: leger-api (production)
│   └── ...               Region: Global (300+ edge locations)
│
staging branch        →  Deploy to: leger-api-staging
                          Region: Global
                          
Pull Request          →  Deploy to: leger-api-pr-{number}
                          Region: Global
                          TTL: 7 days
```

### Environment Configuration

| Environment | Domain | KV Namespace | R2 Bucket | D1 Database |
|-------------|--------|--------------|-----------|-------------|
| **Production** | api.leger.run | leger_* (prod) | leger-quadlets-prod | leger-db (v0.2.0+) |
| **Staging** | api-staging.leger.run | leger_* (staging) | leger-quadlets-staging | leger-db-staging |
| **PR Preview** | api-pr-{num}.leger.run | leger_* (pr) | leger-quadlets-pr | (not available) |

## Monitoring and Observability

### Key Metrics (v0.1.0)

**Performance Metrics:**
- Request latency (p50, p95, p99)
- KV operation latency
- R2 upload/download speed
- Worker CPU time

**Business Metrics:**
- Daily active users (by Tailscale ID)
- Secrets created per user
- Config uploads per day
- Total storage used (R2)

**Error Metrics:**
- Authentication failures
- Tailscale API errors
- Encryption/decryption failures
- R2 upload failures

### Alerting Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| Error rate | 1% | 5% |
| p95 latency | 1s | 2s |
| Worker CPU time | 30ms | 50ms |
| KV read latency | 50ms | 100ms |
| Tailscale API failures | 5% | 10% |

## Scalability Considerations

### Current Limits (Cloudflare)

| Resource | Free Tier | Paid Tier | Leger Need (Est.) |
|----------|-----------|-----------|-------------------|
| **Workers Requests** | 100k/day | Unlimited | 10k/day (100 users) |
| **KV Reads** | 100k/day | 10M/day | 5k/day |
| **KV Writes** | 1k/day | 1M/day | 500/day |
| **KV Storage** | 1GB | 100GB | 10MB (secrets only) |
| **R2 Storage** | 10GB | Unlimited | 100GB (quadlets) |
| **R2 Requests** | Unlimited | Unlimited | 2k/day |

**Verdict:** Free tier sufficient for 100-200 users, paid tier for 10k+ users

### Scaling Strategy

**Horizontal Scaling:** Cloudflare Workers auto-scale globally  
**Data Partitioning:** User UUID provides natural sharding  
**Caching Strategy:** Aggressive caching for read-heavy operations  
**Rate Limiting:** Per-user limits prevent abuse

---

**Next:** [Data Models](./2-data-models.md)
