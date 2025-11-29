# Leger Backend: Data Models

**Document Version:** 1.0  
**Scope:** v0.1.0 (KV + R2) → v0.2.0+ (D1 Relational)

## Data Model Philosophy

### v0.1.0: Key-Value + Object Storage

Simple data structures optimized for edge compute:
- **Cloudflare KV:** User metadata and encrypted secrets
- **Cloudflare R2:** User-uploaded quadlet files
- **No Relations:** Denormalized, self-contained documents
- **Eventual Consistency:** Acceptable for infrequent operations

### v0.2.0+: Add Relational Layer

Introduce structured relationships when configuration management requires it:
- **Cloudflare D1:** Configuration state, versioning, schema tracking
- **Maintain KV:** Secrets remain in KV (different access patterns)
- **R2 Evolution:** Store rendered quadlets by version
- **Proper Relations:** Foreign keys, indexes, transactions

---

## v0.1.0 Data Models

### Cloudflare KV Namespaces

#### Namespace: `leger_users`

**Purpose:** Store user identity and authentication state

**Key Format:** `user:{user_uuid}`

**Value Schema:**
```typescript
interface UserRecord {
  user_uuid: string;              // Primary identifier (UUID v5 from Tailscale user ID)
  tailscale_user_id: string;      // e.g., "u123456789"
  tailscale_email: string;        // e.g., "alice@github"
  tailnet: string;                // e.g., "example.ts.net"
  display_name: string | null;    // Human-readable name
  created_at: string;             // ISO 8601 timestamp
  last_seen: string;              // Last successful authentication
  last_device_id: string;         // Most recent device used
  last_device_hostname: string;   // Most recent device hostname
  metadata: {
    cli_version: string;          // Last CLI version used
    total_authentications: number; // Lifetime auth count
  };
}
```

**Example Document:**
```json
{
  "user_uuid": "550e8400-e29b-41d4-a716-446655440000",
  "tailscale_user_id": "u123456789",
  "tailscale_email": "alice@github",
  "tailnet": "example.ts.net",
  "display_name": "Alice Smith",
  "created_at": "2025-10-01T08:00:00Z",
  "last_seen": "2025-10-16T15:30:00Z",
  "last_device_id": "d987654321",
  "last_device_hostname": "alice-laptop",
  "metadata": {
    "cli_version": "0.1.0",
    "total_authentications": 47
  }
}
```

**Indexes (KV Metadata):**
```typescript
// Query patterns:
// 1. Get user by UUID: KV.get('user:{uuid}')
// 2. List all users: KV.list({ prefix: 'user:' })
```

**TTL:** None (persistent)

**Access Pattern:**
- **Writes:** Infrequent (on auth, ~1/day per user)
- **Reads:** Every authenticated request (cached aggressively)
- **Consistency:** Eventual consistency acceptable

---

#### Namespace: `leger_secrets`

**Purpose:** Store encrypted secret values with metadata

**Key Format:** `secrets:{user_uuid}:{secret_name}`

**Value Schema:**
```typescript
interface SecretRecord {
  secret_id: string;            // UUID v4 for this secret
  user_uuid: string;            // Owner
  name: string;                 // Secret identifier (e.g., "openai_api_key")
  encrypted_value: string;      // Base64-encoded AES-256-GCM ciphertext
  nonce: string;                // Base64-encoded nonce (96 bits)
  auth_tag: string;             // Base64-encoded authentication tag (128 bits)
  encryption_version: number;   // Key rotation support (always 1 for v0.1.0)
  version: number;              // Secret update version (increments on change)
  created_at: string;           // ISO 8601 timestamp
  updated_at: string;           // Last modification time
  last_accessed: string | null; // Last retrieval time (for audit)
  metadata: {
    size_bytes: number;         // Original plaintext size
    last_rotated_at: string | null;
    rotation_count: number;
  };
}
```

**Example Document:**
```json
{
  "secret_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "user_uuid": "550e8400-e29b-41d4-a716-446655440000",
  "name": "openai_api_key",
  "encrypted_value": "kR8vX2...[base64]",
  "nonce": "nT4pL9...[base64]",
  "auth_tag": "aG3kM1...[base64]",
  "encryption_version": 1,
  "version": 3,
  "created_at": "2025-10-15T10:00:00Z",
  "updated_at": "2025-10-16T12:00:00Z",
  "last_accessed": "2025-10-16T15:30:00Z",
  "metadata": {
    "size_bytes": 128,
    "last_rotated_at": "2025-10-16T12:00:00Z",
    "rotation_count": 2
  }
}
```

**Indexes (KV Metadata):**
```typescript
// Query patterns:
// 1. Get specific secret: KV.get('secrets:{uuid}:{name}')
// 2. List user's secrets: KV.list({ prefix: 'secrets:{uuid}:' })
```

**TTL:** None (persistent until deleted)

**Access Pattern:**
- **Writes:** Infrequent (on secret update, ~1/week per secret)
- **Reads:** Frequent (every deployment, multiple times/day)
- **Consistency:** Eventual consistency acceptable (legerd polls periodically)

**Security Notes:**
- Plaintext values **NEVER** stored or logged
- Encryption uses Web Crypto API (AES-GCM)
- Master key stored in Workers environment variables
- Per-secret unique nonce prevents replay attacks
- Authentication tag prevents tampering

---

#### Namespace: `leger_manifests`

**Purpose:** Store deployment manifest metadata for uploaded configurations

**Key Format:** `manifest:{user_uuid}:v{version}`

**Value Schema:**
```typescript
interface ManifestRecord {
  manifest_id: string;          // UUID v4
  user_uuid: string;            // Owner
  version: number;              // Auto-increment version (1, 2, 3...)
  deployment_name: string;      // User-chosen name (e.g., "openwebui")
  source: {
    type: 'user_upload';        // Always user_upload in v0.1.0
    uploaded_at: string;        // When files were uploaded
  };
  files: ManifestFile[];        // List of quadlet files
  services: ManifestService[];  // Parsed service metadata
  secrets_required: string[];   // Secret names referenced in quadlets
  volumes: ManifestVolume[];    // Volume definitions
  checksums: {
    manifest: string;           // SHA-256 of manifest.json
    quadlets: Record<string, string>; // filename → SHA-256
  };
  metadata: {
    total_size_bytes: number;
    file_count: number;
    created_by_cli_version: string;
  };
  created_at: string;
}

interface ManifestFile {
  filename: string;             // e.g., "openwebui.container"
  type: 'container' | 'volume' | 'network' | 'pod';
  r2_path: string;              // Full R2 path
  size_bytes: number;
  checksum: string;             // SHA-256
}

interface ManifestService {
  name: string;                 // Service name (e.g., "openwebui")
  quadlet_file: string;         // Which file defines it
  image: string | null;         // Container image
  ports: string[];              // Published ports
  secrets_required: string[];   // Secrets this service needs
}

interface ManifestVolume {
  name: string;
  mount_path: string | null;
  driver: string;
}
```

**Example Document:**
```json
{
  "manifest_id": "a1b2c3d4-e5f6-4a1b-8c9d-0e1f2a3b4c5d",
  "user_uuid": "550e8400-e29b-41d4-a716-446655440000",
  "version": 3,
  "deployment_name": "openwebui",
  "source": {
    "type": "user_upload",
    "uploaded_at": "2025-10-16T14:00:00Z"
  },
  "files": [
    {
      "filename": "openwebui.container",
      "type": "container",
      "r2_path": "550e8400-e29b-41d4-a716-446655440000/v3/openwebui.container",
      "size_bytes": 2048,
      "checksum": "sha256:abc123..."
    }
  ],
  "services": [
    {
      "name": "openwebui",
      "quadlet_file": "openwebui.container",
      "image": "ghcr.io/open-webui/open-webui:main",
      "ports": ["3000:8080"],
      "secrets_required": ["openai_api_key", "anthropic_api_key"]
    }
  ],
  "secrets_required": ["openai_api_key", "anthropic_api_key"],
  "volumes": [
    {
      "name": "openwebui-data",
      "mount_path": "/app/data",
      "driver": "local"
    }
  ],
  "checksums": {
    "manifest": "sha256:def456...",
    "quadlets": {
      "openwebui.container": "sha256:abc123...",
      "openwebui.volume": "sha256:ghi789..."
    }
  },
  "metadata": {
    "total_size_bytes": 4096,
    "file_count": 2,
    "created_by_cli_version": "0.1.0"
  },
  "created_at": "2025-10-16T14:00:00Z"
}
```

**Special Key: Latest Pointer**

**Key Format:** `manifest:{user_uuid}:latest`

**Value:** Simple pointer to latest version
```json
{
  "version": 3,
  "manifest_id": "a1b2c3d4-e5f6-4a1b-8c9d-0e1f2a3b4c5d",
  "updated_at": "2025-10-16T14:00:00Z"
}
```

**Access Pattern:**
- **Writes:** On every config upload (infrequent)
- **Reads:** On every deployment pull (frequent)
- **Consistency:** Eventual consistency acceptable

---

### Cloudflare R2 Storage

#### Bucket: `leger-quadlets-prod`

**Purpose:** Store actual quadlet files and manifest JSON

**Directory Structure:**
```
leger-quadlets-prod/
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
│   │   ├── litellm.container
│   │   └── postgres.container   (new)
│   └── v3/
│       └── ...
```

**File Metadata (R2 Custom Metadata):**
```typescript
interface R2FileMetadata {
  'user-uuid': string;
  'version': string;
  'uploaded-at': string;
  'checksum-sha256': string;
  'file-type': 'quadlet' | 'manifest';
}
```

**Access Pattern:**
- **Writes:** Streaming upload via multipart (for files > 5MB)
- **Reads:** Streaming download to CLI
- **Caching:** Aggressive edge caching (24 hours)
- **Consistency:** Strong consistency (S3-compatible)

**Security:**
- Not publicly accessible (authenticated requests only)
- Pre-signed URLs for CLI downloads (short expiry)
- Checksums validated on upload and download

---

## v0.2.0+ Data Models

### Cloudflare D1 Database Schema

When configuration management is added, we introduce a relational database for structured state.

#### Table: `users`

**Purpose:** User identity records (mirrors KV but normalized)

```sql
CREATE TABLE users (
    user_uuid TEXT PRIMARY KEY,
    tailscale_user_id TEXT NOT NULL UNIQUE,
    tailscale_email TEXT NOT NULL,
    tailnet TEXT NOT NULL,
    display_name TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_device_id TEXT,
    last_device_hostname TEXT,
    cli_version TEXT,
    total_authentications INTEGER DEFAULT 0
);

CREATE INDEX idx_users_tailscale_id ON users(tailscale_user_id);
CREATE INDEX idx_users_tailnet ON users(tailnet);
CREATE INDEX idx_users_last_seen ON users(last_seen);
```

**Why D1 for This:**
- Enables user analytics and reporting
- Supports complex queries (active users, retention)
- Still keep auth state in KV for fast edge access

---

#### Table: `configurations`

**Purpose:** Store high-level user configuration decisions (the 29 decision variables)

```sql
CREATE TABLE configurations (
    id TEXT PRIMARY KEY,                    -- UUID v4
    user_uuid TEXT NOT NULL,
    deployment_name TEXT NOT NULL,
    config_data JSON NOT NULL,              -- The 29 decisions as JSON
    version INTEGER NOT NULL,               -- Auto-increment per user
    schema_version TEXT NOT NULL,           -- e.g., "v1.0.0"
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_uuid) REFERENCES users(user_uuid) ON DELETE CASCADE
);

CREATE UNIQUE INDEX idx_config_user_version ON configurations(user_uuid, version);
CREATE INDEX idx_config_user_active ON configurations(user_uuid, is_active);
CREATE INDEX idx_config_schema_version ON configurations(schema_version);
```

**Example `config_data` JSON:**
```json
{
  "ai_stack": {
    "enable_rag": true,
    "vector_database": "pgvector",
    "enable_web_search": true,
    "llm_provider": "openwebui"
  },
  "services": {
    "enable_litellm": true,
    "enable_postgres": true,
    "enable_redis": false,
    "enable_caddy": true
  },
  "networking": {
    "base_domain": "ai.example.com",
    "enable_https": true,
    "external_ports": {
      "openwebui": 3000,
      "litellm": 4000
    }
  },
  "storage": {
    "postgres_volume_size": "10GB",
    "openwebui_data_path": "/data/openwebui"
  }
}
```

**Access Pattern:**
- **Writes:** When user saves configuration via web UI
- **Reads:** When rendering templates or displaying config
- **Versioning:** Each save creates new version, old version archived

---

#### Table: `configuration_versions`

**Purpose:** Immutable history of configuration changes

```sql
CREATE TABLE configuration_versions (
    id TEXT PRIMARY KEY,                    -- UUID v4
    config_id TEXT NOT NULL,
    version INTEGER NOT NULL,
    config_data JSON NOT NULL,              -- Snapshot of config at this version
    schema_version TEXT NOT NULL,
    changes_summary TEXT,                   -- Human-readable diff summary
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (config_id) REFERENCES configurations(id) ON DELETE CASCADE
);

CREATE INDEX idx_version_config ON configuration_versions(config_id, version);
CREATE INDEX idx_version_created ON configuration_versions(created_at);
```

**Why Separate Table:**
- Immutable audit trail
- Point-in-time recovery
- Diff generation between versions
- Rollback capability

---

#### Table: `schemas`

**Purpose:** Track template schema versions from GitHub releases

```sql
CREATE TABLE schemas (
    version TEXT PRIMARY KEY,               -- e.g., "v1.0.0", "v2.1.0"
    github_release_url TEXT NOT NULL,
    github_tag TEXT NOT NULL,
    template_manifest JSON NOT NULL,        -- List of templates and their metadata
    migration_required BOOLEAN DEFAULT FALSE,
    released_at TIMESTAMP NOT NULL,
    fetched_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_schema_released ON schemas(released_at);
```

**Example `template_manifest` JSON:**
```json
{
  "templates": [
    {
      "name": "openwebui.container.j2",
      "path": "templates/containers/openwebui.container.j2",
      "variables": ["enable_rag", "vector_database", "openai_api_key"],
      "checksum": "sha256:abc123..."
    },
    {
      "name": "litellm.container.j2",
      "path": "templates/containers/litellm.container.j2",
      "variables": ["llm_provider", "anthropic_api_key"],
      "checksum": "sha256:def456..."
    }
  ],
  "version_notes": "Added RAG support, pgvector integration",
  "breaking_changes": false
}
```

**Access Pattern:**
- **Writes:** When new schema version detected on GitHub
- **Reads:** When rendering templates or checking for updates
- **Frequency:** Periodic polling (hourly) or webhook-triggered

---

#### Table: `rendered_quadlets`

**Purpose:** Track which configurations have been rendered and where files are stored

```sql
CREATE TABLE rendered_quadlets (
    id TEXT PRIMARY KEY,                    -- UUID v4
    config_id TEXT NOT NULL,
    version INTEGER NOT NULL,
    schema_version TEXT NOT NULL,
    r2_base_path TEXT NOT NULL,             -- e.g., "{uuid}/v5/"
    manifest_checksum TEXT NOT NULL,        -- SHA-256 of manifest.json
    file_count INTEGER NOT NULL,
    total_size_bytes INTEGER NOT NULL,
    rendering_duration_ms INTEGER,
    rendered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (config_id) REFERENCES configurations(id) ON DELETE CASCADE
);

CREATE INDEX idx_rendered_config ON rendered_quadlets(config_id, version);
CREATE INDEX idx_rendered_path ON rendered_quadlets(r2_base_path);
```

**Workflow:**
1. User saves configuration → New `configurations` record
2. Backend renders templates → Creates files in R2
3. Backend records render result → New `rendered_quadlets` record
4. CLI fetches via `/config/latest` → Returns R2 path from this table

---

#### Table: `deployments`

**Purpose:** Track which devices have deployed which configurations

```sql
CREATE TABLE deployments (
    id TEXT PRIMARY KEY,                    -- UUID v4
    user_uuid TEXT NOT NULL,
    config_version INTEGER NOT NULL,
    device_id TEXT NOT NULL,                -- Tailscale device ID
    device_hostname TEXT NOT NULL,
    deployment_status TEXT NOT NULL,        -- 'pending', 'installing', 'active', 'failed'
    installed_at TIMESTAMP,
    last_checked TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    error_message TEXT,
    FOREIGN KEY (user_uuid) REFERENCES users(user_uuid) ON DELETE CASCADE
);

CREATE INDEX idx_deploy_user ON deployments(user_uuid, config_version);
CREATE INDEX idx_deploy_device ON deployments(device_id);
CREATE INDEX idx_deploy_status ON deployments(deployment_status);
```

**Access Pattern:**
- **Writes:** When CLI pulls config or reports status
- **Reads:** For deployment dashboard in web UI
- **Purpose:** Show which devices are on which version

---

### Evolution of Manifest Storage

**v0.1.0:** Manifests in KV + files in R2
```
KV: manifest:{uuid}:v3 → { ...metadata... }
R2: {uuid}/v3/manifest.json (actual file)
```

**v0.2.0+:** Manifests in D1, still cached in KV
```
D1: rendered_quadlets table → authoritative source
KV: manifest:{uuid}:v3 → cached copy for fast edge access
R2: {uuid}/v3/manifest.json → still stored for CLI compatibility
```

**Why Keep Both:**
- D1 enables complex queries (version history, stats)
- KV provides fast edge reads for CLI
- R2 provides actual file downloads
- Write to all three, read from KV first

---

## Data Model Relationships

### v0.2.0+ Entity Relationship Diagram

```
┌─────────────┐
│   users     │
│  (D1 + KV)  │
└──────┬──────┘
       │
       │ 1:N
       ▼
┌──────────────────┐         ┌─────────────────┐
│  configurations  │────────▶│ config_versions │
│      (D1)        │  1:N    │      (D1)       │
└──────┬───────────┘         └─────────────────┘
       │
       │ 1:N
       ▼
┌──────────────────┐         ┌─────────────┐
│rendered_quadlets │────────▶│   schemas   │
│      (D1)        │  N:1    │    (D1)     │
└──────┬───────────┘         └─────────────┘
       │
       │ References R2
       ▼
┌─────────────────────────────┐
│  Cloudflare R2 Files        │
│  {uuid}/v{N}/*.container    │
└─────────────────────────────┘

┌─────────────┐
│   secrets   │
│  (KV only)  │  ← Separate: different access pattern
└─────────────┘

┌──────────────┐
│ deployments  │
│    (D1)      │  ← Tracks which devices have which versions
└──────────────┘
```

---

## Data Validation Rules

### Secret Names

**Rules:**
- Alphanumeric characters, underscores, hyphens only
- Length: 1-64 characters
- No spaces or special characters
- Case-sensitive

**Regex:** `^[a-zA-Z0-9_-]{1,64}$`

**Examples:**
- ✅ `openai_api_key`
- ✅ `anthropic-key-prod`
- ✅ `DB_PASSWORD`
- ❌ `my secret` (space)
- ❌ `key@prod` (special char)
- ❌ `a` (too short? actually valid)

### Secret Values

**Rules:**
- Length: 1 byte - 10KB (10,240 bytes)
- Any characters allowed (binary-safe)
- No trailing newlines stripped (preserve exactly)

**Why 10KB Limit:**
- Most API keys: 32-256 bytes
- JWT tokens: < 2KB
- Private keys: < 4KB
- Reasonable limit prevents abuse

### Version Numbers

**Format:** Positive integers starting at 1

**Auto-increment Logic:**
```typescript
// Get current max version for user
const versions = await KV.list({ prefix: `manifest:{uuid}:v` });
const maxVersion = Math.max(...versions.keys.map(k => 
  parseInt(k.split(':v')[1])
));
const newVersion = maxVersion + 1;
```

### UUIDs

**User UUID:** UUID v5 (deterministic from Tailscale user ID)
```typescript
import { v5 as uuidv5 } from 'uuid';

const NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
const userUUID = uuidv5(tailscaleUserId, NAMESPACE);
```

**Other UUIDs:** UUID v4 (random)
```typescript
import { v4 as uuidv4 } from 'uuid';

const secretId = uuidv4();
```

---

## Data Migration Strategy

### v0.1.0 → v0.2.0 Migration

**Challenge:** Move from pure KV to KV + D1 hybrid

**Migration Steps:**

1. **Deploy D1 schema** (tables created, empty)

2. **Backfill users table:**
```sql
-- Read all KV keys: user:*
-- For each user record in KV:
INSERT INTO users (user_uuid, tailscale_user_id, ...)
VALUES (?, ?, ...);
```

3. **Backfill configurations table:**
```sql
-- Read all KV keys: manifest:*:latest
-- For each manifest:
INSERT INTO configurations (id, user_uuid, config_data, ...)
VALUES (?, ?, ?, ...);

-- Read versioned manifests:
INSERT INTO configuration_versions (...)
VALUES (...);
```

4. **Update application code:**
   - Write to both KV and D1 (dual-write)
   - Read from D1 first, fallback to KV
   - Gradually phase out KV writes for configs

5. **Keep secrets in KV forever:**
   - Different access pattern (frequent reads)
   - KV is faster for simple key-value
   - No need to move to D1

**Rollback Plan:**
- Keep KV writes during migration
- Can revert to KV-only if D1 issues
- No data loss (dual-write period)

---

## Performance Considerations

### KV Performance Characteristics

**Read Latency:**
- Edge read: < 5ms (cached)
- Global read: < 50ms (uncached)
- Eventual consistency: ~60s propagation

**Write Latency:**
- Write: < 100ms (acknowledged)
- Propagation: ~60s to all edges

**Throughput:**
- Reads: Unlimited (effectively)
- Writes: 1,000/s per account

**Optimization:**
- Cache frequently read data (user records, manifests)
- Batch writes when possible
- Use metadata for filtering (avoid full list)

### R2 Performance Characteristics

**Upload:**
- Single file: 5 seconds per 100MB
- Multipart: Parallel chunks, faster for large files
- Maximum object size: 5TB

**Download:**
- Streaming: Low latency, high throughput
- Caching: Aggressive edge caching (24-hour default)
- Bandwidth: No egress fees

**Optimization:**
- Use multipart uploads for files > 5MB
- Pre-signed URLs for CLI direct download
- Cloudflare CDN for global distribution

### D1 Performance Characteristics (v0.2.0+)

**Query Latency:**
- Simple SELECT: < 5ms
- Complex JOIN: < 50ms
- Write: < 20ms

**Throughput:**
- 100,000 reads/day (free tier)
- 50,000 writes/day (free tier)

**Optimization:**
- Proper indexes on foreign keys
- Avoid N+1 queries (use JOINs)
- Prepared statements for repeated queries
- Connection pooling (handled by D1)

---

## Backup and Recovery

### v0.1.0 Backup Strategy

**KV Data:**
- Export all keys periodically (daily)
- Store exports in R2 (separate bucket)
- Retention: 30 days of daily backups

**R2 Data:**
- Versioning enabled on bucket
- Lifecycle rules for old versions
- Cross-region replication (optional)

**Restoration:**
- Re-import KV keys from backup
- Restore R2 objects from versions

### v0.2.0+ Backup Strategy

**D1 Data:**
- Cloudflare provides automatic backups
- Point-in-time recovery (30 days)
- Manual snapshots before schema changes

**Export Strategy:**
```bash
# Export D1 to SQL
wrangler d1 export leger-db --output backup.sql

# Import to new database
wrangler d1 execute leger-db --file backup.sql
```

---

## Next Steps

This data model supports:
- ✅ v0.1.0: Simple secret management and file hosting
- ✅ v0.2.0+: Full configuration management with versioning
- ✅ Future: Analytics, multi-device tracking, advanced features

**Next Document:** [Business Logic](./3-business-logic.md) - How these data models are manipulated
