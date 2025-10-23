# Leger Backend API

Complete v0.1.0 backend implementation for Leger secret management and release tracking.

## Architecture Overview

```
api/
├── index.ts           # Main worker entry point
├── utils/             # Core utilities
│   ├── encoding.ts    # Base64 encode/decode
│   ├── crypto.ts      # AES-256-GCM encryption
│   ├── jwt.ts         # JWT validation
│   └── uuid.ts        # UUID generation
├── middleware/        # Request middleware
│   └── auth.ts        # JWT authentication & error handling
├── models/            # TypeScript interfaces
│   ├── user.ts        # User data models
│   ├── secret.ts      # Secret data models
│   └── release.ts     # Release data models
├── services/          # Business logic
│   ├── user.ts        # User CRUD (D1 + KV)
│   ├── secrets.ts     # Secret management (KV)
│   └── releases.ts    # Release management (D1)
└── routes/            # API endpoints
    ├── auth.ts        # POST /api/auth/validate
    ├── secrets.ts     # Secret CRUD endpoints
    └── releases.ts    # Release CRUD endpoints
```

## API Endpoints

### Authentication

**POST /api/auth/validate**
- Validates CLI-generated JWT
- Creates or updates user in D1
- Returns user profile

**Request:**
```
Authorization: Bearer {jwt}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "user_uuid": "...",
      "email": "alice@github",
      "display_name": null,
      "tailnet": "example.ts.net",
      "created_at": "..."
    }
  }
}
```

### Secrets

**GET /api/secrets**
- Lists all secrets for user
- Query param `include_values=true` returns decrypted values (for CLI)
- Requires: JWT auth

**GET /api/secrets/:name**
- Gets single secret with decrypted value
- Requires: JWT auth

**POST /api/secrets/:name**
- Creates or updates secret
- Encrypts value with AES-256-GCM
- Requires: JWT auth

**Request:**
```json
{
  "value": "sk-proj-abc123..."
}
```

**DELETE /api/secrets/:name**
- Deletes secret
- Requires: JWT auth

### Releases

**GET /api/releases**
- Lists all releases for user
- Query param `name={name}` filters by name (for CLI)
- Requires: JWT auth

**GET /api/releases/:id**
- Gets single release by ID
- Requires: JWT auth

**POST /api/releases**
- Creates new release
- Auto-increments version number
- Requires: JWT auth

**Request:**
```json
{
  "name": "my-openwebui",
  "git_url": "https://github.com/user/repo",
  "git_branch": "main",
  "description": "Optional description"
}
```

**PUT /api/releases/:id**
- Updates existing release
- Requires: JWT auth

**DELETE /api/releases/:id**
- Deletes release
- Requires: JWT auth

## Security

### JWT Validation
- Algorithm: HS256
- Shared secret between CLI and backend
- Payload includes: user_uuid, tailscale_user_id, email, tailnet
- 30-day expiry

### Secret Encryption
- Algorithm: AES-256-GCM
- 256-bit master key (stored in Workers secrets)
- Random 96-bit nonce per secret
- Authentication tag prevents tampering
- Plaintext never logged or exposed

## Data Storage

### Cloudflare KV
- **LEGER_USERS**: User cache (`user:{uuid}` → UserRecord)
- **LEGER_SECRETS**: Encrypted secrets (`secrets:{uuid}:{name}` → SecretRecord)

### Cloudflare D1
- **users**: User accounts and metadata
- **releases**: Release configurations (GitHub URLs)

### Cloudflare R2
- **leger-static-sites**: Empty in v0.1.0 (infrastructure for v0.2.0)

## Development

### Type Checking
```bash
npm run typecheck
```

### Building
```bash
npm run build
```

This runs:
1. `vite build` - Frontend build
2. `build:worker` - Worker build (transpiles api/index.ts)

### Deployment
```bash
npm run deploy
```

Or via GitHub Actions on push to main.

## Error Handling

All API errors follow this format:
```json
{
  "success": false,
  "error": {
    "code": "error_code",
    "message": "Human-readable message",
    "action": "Optional suggested action",
    "docs": "Optional link to docs"
  }
}
```

Common error codes:
- `authentication_failed` - Invalid or expired JWT
- `unauthorized` - Missing authorization
- `validation_error` - Invalid input
- `not_found` - Resource doesn't exist
- `internal_error` - Unexpected error

## Testing

### Manual Testing with curl

**1. Generate JWT (via CLI):**
```bash
leger auth login
# Copy JWT from ~/.local/share/leger/auth.json
```

**2. Validate auth:**
```bash
curl -X POST https://app.leger.run/api/auth/validate \
  -H "Authorization: Bearer {jwt}"
```

**3. Create secret:**
```bash
curl -X POST https://app.leger.run/api/secrets/test_key \
  -H "Authorization: Bearer {jwt}" \
  -H "Content-Type: application/json" \
  -d '{"value":"test123"}'
```

**4. List secrets:**
```bash
curl https://app.leger.run/api/secrets \
  -H "Authorization: Bearer {jwt}"
```

**5. Sync secrets (CLI):**
```bash
curl https://app.leger.run/api/secrets?include_values=true \
  -H "Authorization: Bearer {jwt}"
```

**6. Create release:**
```bash
curl -X POST https://app.leger.run/api/releases \
  -H "Authorization: Bearer {jwt}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my-setup",
    "git_url": "https://github.com/user/repo",
    "git_branch": "main",
    "description": "Test release"
  }'
```

## Environment Variables

Required Cloudflare Workers secrets:
- `ENCRYPTION_KEY`: Base64-encoded 256-bit key for AES-256-GCM
- `JWT_SECRET`: Shared secret with CLI for JWT validation

Generate encryption key:
```bash
openssl rand -base64 32
```

Set secrets:
```bash
wrangler secret put ENCRYPTION_KEY
wrangler secret put JWT_SECRET
```

## Status

✅ **Implemented:**
- JWT authentication middleware
- User management (D1 + KV)
- Secret encryption/decryption (AES-256-GCM)
- Secret CRUD (KV storage)
- Release CRUD (D1 storage)
- Error handling
- CORS support
- Health check endpoint

🔄 **Next Steps:**
- Frontend implementation
- Integration testing
- CLI integration testing
- Documentation site

## License

Apache 2.0
