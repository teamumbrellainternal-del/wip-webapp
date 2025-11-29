# Database

Cloudflare D1 (SQLite at edge) database for Umbrella.

## Quick Start

```bash
# Apply migrations (local)
wrangler d1 migrations apply umbrella-dev-db --local

# Apply migrations (remote)
wrangler d1 migrations apply umbrella-dev-db --remote

# Seed production data (genres, tags, config - required)
npm run seed:production

# Seed test data (sample users, artists, gigs - dev only)
npm run seed
```

## Structure

```
db/
├── migrations/      # SQL migrations (applied in order)
├── rollbacks/       # Rollback scripts per migration
├── schema.sql       # Consolidated schema (reference)
├── seed.ts          # Test fixtures generator
└── seed-production.ts  # Production reference data
```

## Tables

| Table | Purpose |
|-------|---------|
| `users` | OAuth accounts (Clerk) |
| `artists` | Artist profiles (40+ fields) |
| `tracks` | Music portfolio |
| `gigs` | Venue opportunities |
| `gig_applications` | Applications to gigs |
| `conversations` | Message threads |
| `messages` | Individual messages |
| `files` | File metadata (blobs in R2) |
| `reviews` | Artist reviews |
| `daily_metrics` | Analytics data |
| `violet_usage` | AI prompt tracking |
| `violet_conversations` | Violet chat threads |
| `genres` | Reference: music genres |
| `tags` | Reference: skills/vibes |
| `contact_lists` | Fan contact lists |
| `broadcast_messages` | Fan broadcasts |
| `achievements` | Artist achievements |
| `goals` | Artist goals |

## Common Commands

```bash
# Query data
wrangler d1 execute umbrella-dev-db --local --command "SELECT * FROM artists;"

# Check table structure
wrangler d1 execute umbrella-dev-db --local --command "PRAGMA table_info(artists);"

# List migrations
wrangler d1 migrations list umbrella-dev-db
```

## Adding Migrations

1. Create `migrations/NNNN_description.sql`
2. Create matching `rollbacks/NNNN_rollback.sql`
3. Use `IF NOT EXISTS` for idempotency
4. Test locally before applying remote

## Cloudflare Resources

### D1 Databases

| Environment | Database Name |
|-------------|---------------|
| Local (dev) | `umbrella-dev-db` |
| Preview | `umbrella-preview-db` |
| Staging | `umbrella-staging-db` |
| Production | `umbrella-prod-db` |

### wrangler.toml binding

```toml
[[d1_databases]]
binding = "DB"
database_name = "umbrella-dev-db"
database_id = "4fbcb5f8-5fe5-4bb1-b..."
```

Each environment has its own `[[env.{name}.d1_databases]]` block.
